#!/usr/bin/env node
// scripts/gates/content-check.ts — G-SCHEMA, G-LINK-FMT, G-LINK-REF, G-LINK-PREF, G-LINK-LIVE,
// G-PREREQ (plan §7). Run via `npm run content:check` (registers Node 24 type stripping through
// `tools/viz/register.mjs`, plan §7's tool column for these gates). No network, no Python — the
// live judge check is `links:verify` (manual); the Python-feature half of G-PREREQ shells out to
// `.tooling/bin/pypy38` with the standard-library `ast` module, not to any network resource.
//
// Two phases, so one bad file doesn't hide every other error in the same run:
//   Phase 1 — every content YAML/MDX-frontmatter file, validated against its own Zod schema in
//   isolation. Any failure here is reported for every file at once (not just the first) and the
//   script stops before phase 2, since phase 2's cross-file checks assume valid shapes.
//   Phase 2 — cross-file checks that need the whole content set to already be structurally valid:
//   uniqueness, reference resolution, the prerequisite DAG (acyclic, never-forward), judge URL
//   format, plain-text CCC references outside registry components, the WMOJ-first practice
//   lint, verified.json coverage, and the AST-derived Python-feature-vs-concepts check.
//
// `--release` escalates G-LINK-LIVE and G-LINK-PREF from a warning to a hard failure (plan §7:
// those two are "release hard / phase exit warn"). Without it (the default, used at every phase
// exit and by `verify:fast`/`verify:full`), both are printed but do not fail the run.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { MDX_COMPONENT_NAMES } from "@/lib/content/mdx-component-names";
import {
  conceptsSchema,
  courseSchema,
  externalLinksSchema,
  glossarySchema,
  lessonFrontmatterSchema,
  moduleFileSchema,
  registrySchema,
  uiStringsSchema,
  verifiedFileSchema,
} from "@/lib/content/schemas";
import { judgeForYear, judgeUrl } from "@/lib/registry/judge-url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");
const RELEASE = process.argv.includes("--release");

// `--root=<dir>` points every check at a single isolated content root instead of content/ +
// tests/fixtures/content/ — used by the gate fixtures under tests/fixtures/gates/<gate-id>/
// (tests/unit/gates/content-check.test.ts spawns this script once per fixture root).
const rootArg = process.argv.find((a) => a.startsWith("--root="));
const REAL_ROOT = rootArg
  ? path.resolve(APP_ROOT, rootArg.slice("--root=".length))
  : path.join(APP_ROOT, "content");
const FIXTURE_ROOT = rootArg
  ? path.join(REAL_ROOT, "__no_fixture_overlay__") // never exists: --root replaces the merge, not adds to it
  : path.join(APP_ROOT, "tests", "fixtures", "content");
const CONTENT_ROOTS = [REAL_ROOT, FIXTURE_ROOT].filter((r) => fs.existsSync(r));

// `--only=G-SCHEMA,G-LINK-FMT` restricts which gates run at all (used by `prebuild`, plan line
// 184: "prebuild runs the cheap data checks G-SCHEMA, G-LINK-FMT" — no network, no Python, so the
// G-PREREQ AST section below is skipped outright rather than merely filtered from the report).
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY_GATES = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;
function gateEnabled(gate: string): boolean {
  return ONLY_GATES === null || ONLY_GATES.has(gate);
}

interface Finding {
  gate: string;
  severity: "error" | "warn";
  message: string;
}
const findings: Finding[] = [];
function err(gate: string, message: string) {
  if (!gateEnabled(gate)) return;
  findings.push({ gate, severity: "error", message });
}
function warn(gate: string, message: string) {
  if (!gateEnabled(gate)) return;
  findings.push({ gate, severity: "warn", message });
}

function rel(p: string): string {
  return path.relative(APP_ROOT, p);
}

// ---------------------------------------------------------------------------------------------
// Phase 1: per-file schema validation
// ---------------------------------------------------------------------------------------------

function readYaml(file: string): unknown {
  return parse(fs.readFileSync(file, "utf8"));
}

function validateFile<T>(file: string, schema: { parse: (v: unknown) => T }): T | null {
  if (!fs.existsSync(file)) return null;
  try {
    const raw = file.endsWith(".json") ? JSON.parse(fs.readFileSync(file, "utf8")) : readYaml(file);
    return schema.parse(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    err("G-SCHEMA", `${rel(file)}: ${message}`);
    return null;
  }
}

interface ModuleFileRecord {
  root: string;
  stageDir: string;
  moduleDir: string;
  file: string;
  data: ReturnType<typeof moduleFileSchema.parse>;
}

function findLessonFrontmatterErrors(moduleDir: string, lessonSlugs: string[]) {
  for (const slug of lessonSlugs) {
    const file = path.join(moduleDir, "lessons", `${slug}.mdx`);
    if (!fs.existsSync(file)) continue; // unauthored lesson: fine, module just isn't linkable yet
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m?.[1]) {
      err("G-SCHEMA", `${rel(file)}: missing YAML frontmatter block ("---\\n...\\n---")`);
      continue;
    }
    try {
      lessonFrontmatterSchema.parse(parse(m[1]));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      err("G-SCHEMA", `${rel(file)}: ${message}`);
    }
  }
}

function walkModuleFiles(root: string): ModuleFileRecord[] {
  const stagesDir = path.join(root, "stages");
  if (!fs.existsSync(stagesDir)) return [];
  const out: ModuleFileRecord[] = [];
  for (const stageDir of fs.readdirSync(stagesDir, { withFileTypes: true })) {
    if (!stageDir.isDirectory()) continue;
    const stagePath = path.join(stagesDir, stageDir.name);
    for (const moduleDir of fs.readdirSync(stagePath, { withFileTypes: true })) {
      if (!moduleDir.isDirectory()) continue;
      const modulePath = path.join(stagePath, moduleDir.name);
      const moduleYaml = path.join(modulePath, "module.yaml");
      if (!fs.existsSync(moduleYaml)) continue;
      const data = validateFile(moduleYaml, moduleFileSchema);
      if (!data) continue;
      out.push({
        root,
        stageDir: stageDir.name,
        moduleDir: moduleDir.name,
        file: moduleYaml,
        data,
      });
      findLessonFrontmatterErrors(modulePath, data.lessons);
    }
  }
  return out;
}

const courseFiles = CONTENT_ROOTS.map((root) => ({
  root,
  data: validateFile(path.join(root, "course.yaml"), courseSchema),
}));
const glossaryFiles = CONTENT_ROOTS.map((root) =>
  validateFile(path.join(root, "glossary.yaml"), glossarySchema),
);
const conceptsFile = validateFile(path.join(REAL_ROOT, "concepts.yaml"), conceptsSchema);
const uiStringsFile = validateFile(path.join(REAL_ROOT, "ui", "strings.yaml"), uiStringsSchema);
const externalLinksFile = validateFile(
  path.join(REAL_ROOT, "registry", "external-links.yaml"),
  externalLinksSchema,
);
const registryFile = validateFile(
  path.join(REAL_ROOT, "registry", "ccc-problems.yaml"),
  registrySchema,
);
const verifiedFile = validateFile(
  path.join(REAL_ROOT, "registry", "verified.json"),
  verifiedFileSchema,
);
const moduleFiles = CONTENT_ROOTS.flatMap(walkModuleFiles);

if (findings.some((f) => f.severity === "error")) {
  report();
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// Phase 2: cross-file checks (only reached once every file above parsed and validated cleanly)
// ---------------------------------------------------------------------------------------------

interface FlatModule {
  stageId: string;
  moduleId: string;
  title: string;
  prereqs: string[];
  position: number; // course order: stage order, then module order within the stage
}

const flatModules: FlatModule[] = [];
{
  let position = 0;
  for (const { data } of courseFiles) {
    if (!data) continue;
    for (const stage of data.stages) {
      for (const m of stage.modules) {
        flatModules.push({
          stageId: stage.id,
          moduleId: m.id,
          title: m.title,
          prereqs: m.prereqs,
          position,
        });
        position += 1;
      }
    }
  }
}
const moduleById = new Map(flatModules.map((m) => [m.moduleId, m]));

// -- G-SCHEMA: unique ids -------------------------------------------------------------------

function checkUnique(gate: string, kind: string, ids: string[]) {
  const seen = new Map<string, number>();
  for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
  for (const [id, count] of seen) {
    if (count > 1) err(gate, `duplicate ${kind} id "${id}" (${count} times)`);
  }
}
{
  const stageIds = courseFiles.flatMap(({ data }) => data?.stages.map((s) => s.id) ?? []);
  checkUnique("G-SCHEMA", "stage", stageIds);
  checkUnique(
    "G-SCHEMA",
    "module",
    flatModules.map((m) => m.moduleId),
  );
  for (const glossary of glossaryFiles) {
    if (glossary)
      checkUnique(
        "G-SCHEMA",
        "glossary term",
        glossary.terms.map((t) => t.id),
      );
  }
  if (conceptsFile)
    checkUnique(
      "G-SCHEMA",
      "concept feature",
      conceptsFile.features.map((f) => f.id),
    );
  if (externalLinksFile)
    checkUnique(
      "G-SCHEMA",
      "external link",
      externalLinksFile.links.map((l) => l.id),
    );
}

// registry ids: canonical + alias-derived pseudo ids must all be unique together, and every
// module.yaml practice pick and every registry `modules` entry must resolve to a real module id.
const registryCanonicalIds = new Set<string>();
const registryAllIds = new Set<string>(); // canonical + alias pseudo ids
if (registryFile) {
  const allIds: string[] = [];
  for (const p of registryFile.problems) {
    allIds.push(p.id);
    registryCanonicalIds.add(p.id);
    for (const a of p.aliases) {
      allIds.push(`ccc${String(p.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}`);
    }
  }
  checkUnique("G-SCHEMA", "registry problem/alias", allIds);
  for (const id of allIds) registryAllIds.add(id);

  for (const p of registryFile.problems) {
    for (const modId of p.modules) {
      if (!moduleById.has(modId)) {
        err(
          "G-SCHEMA",
          `content/registry/ccc-problems.yaml: problem "${p.id}" names unknown module "${modId}"`,
        );
      }
    }
  }
}

// -- G-SCHEMA: reference resolution ------------------------------------------------------------

for (const m of flatModules) {
  for (const prereq of m.prereqs) {
    if (!moduleById.has(prereq)) {
      err("G-SCHEMA", `course.yaml: module "${m.moduleId}" names unknown prereq "${prereq}"`);
    }
  }
}
for (const rec of moduleFiles) {
  const declared = moduleById.get(rec.data.id);
  if (!declared) {
    err(
      "G-SCHEMA",
      `${rel(rec.file)}: module id "${rec.data.id}" is not declared in course.yaml (author it there first)`,
    );
  }
  for (const item of rec.data.practice) {
    if (!registryAllIds.has(item.id)) {
      err("G-SCHEMA", `${rel(rec.file)}: practice item "${item.id}" is not in the registry`);
    }
  }
  for (const prereq of rec.data.prereqs) {
    if (!moduleById.has(prereq)) {
      err("G-SCHEMA", `${rel(rec.file)}: unknown prereq "${prereq}"`);
    }
  }
}
for (const glossary of glossaryFiles) {
  if (!glossary) continue;
  for (const t of glossary.terms) {
    if (!t.introducedIn) continue;
    const modId = t.introducedIn.split("/")[0];
    if (!modId || !moduleById.has(modId)) {
      err(
        "G-SCHEMA",
        `glossary term "${t.id}": introducedIn "${t.introducedIn}" names an unknown module`,
      );
    }
  }
}
if (conceptsFile) {
  for (const f of conceptsFile.features) {
    if (!moduleById.has(f.introducedIn)) {
      err(
        "G-SCHEMA",
        `concepts.yaml: feature "${f.id}" introducedIn unknown module "${f.introducedIn}"`,
      );
    }
  }
}

// -- G-SCHEMA: prerequisite DAG — acyclic, never forward ---------------------------------------

for (const m of flatModules) {
  for (const prereq of m.prereqs) {
    const p = moduleById.get(prereq);
    if (p && p.position >= m.position) {
      err(
        "G-SCHEMA",
        `course.yaml: module "${m.moduleId}" (position ${m.position}) lists "${prereq}" (position ${p.position}) as a prereq, but it does not come earlier in the course`,
      );
    }
  }
}
{
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];
  function visit(id: string) {
    color.set(id, GRAY);
    stack.push(id);
    for (const prereq of moduleById.get(id)?.prereqs ?? []) {
      const c = color.get(prereq) ?? WHITE;
      if (c === GRAY) {
        const cycleStart = stack.indexOf(prereq);
        err("G-SCHEMA", `prerequisite cycle: ${stack.slice(cycleStart).join(" -> ")} -> ${prereq}`);
      } else if (c === WHITE) {
        visit(prereq);
      }
    }
    stack.pop();
    color.set(id, BLACK);
  }
  for (const m of flatModules) {
    if ((color.get(m.moduleId) ?? WHITE) === WHITE) visit(m.moduleId);
  }
}

// -- G-SCHEMA: `internal` never rendered ---------------------------------------------------------

function grepForInternal(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      grepForInternal(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (/\.internal\b/.test(line)) {
          err(
            "G-SCHEMA",
            `${rel(full)}:${i + 1}: renders/reads ".internal" — registry internal fields must never reach a page`,
          );
        }
      });
    }
  }
}
grepForInternal(path.join(APP_ROOT, "app"));
grepForInternal(path.join(APP_ROOT, "components"));

// -- G-SCHEMA: every JSX tag a lesson MDX file uses is in the fixed MDX component map -----------
// design-review.md A1-4: an unresolved MDX component (a typo, or a name an author invented) only
// throws when the page is actually rendered — during `next build`'s SSG, or a one-off render in a
// test — never at `content:check` time, because @mdx-js/mdx's `evaluate()` just builds the
// element tree lazily (see tests/unit/content/mdx-fenced-code.test.ts's own comment: "creating an
// element does not invoke the component"). Catching it here, statically, means a broken lesson
// never reaches the slow `next build` step at all. MDX_COMPONENT_NAMES is the single source of
// truth for the fixed map's keys (lib/content/mdx-component-names.ts, kept in sync with the real
// component map — lib/content/mdx-components.tsx — by tests/unit/content/mdx-component-names.test.ts).
const KNOWN_MDX_COMPONENTS = new Set<string>(MDX_COMPONENT_NAMES);
const JSX_OPEN_TAG_RE = /<([A-Z][A-Za-z0-9]*)\b/g;

function checkMdxComponentsKnown(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkMdxComponentsKnown(full);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;
    // Fenced code (the only place a lesson shows Python, which never contains JSX-shaped tags
    // anyway) is stripped first, matching every other regex-based MDX scan in this file.
    const withoutCode = fs.readFileSync(full, "utf8").replace(/```[\s\S]*?```/g, "");
    const seen = new Set<string>();
    for (const m of withoutCode.matchAll(JSX_OPEN_TAG_RE)) {
      const name = m[1];
      if (!name || seen.has(name) || KNOWN_MDX_COMPONENTS.has(name)) continue;
      seen.add(name);
      err(
        "G-SCHEMA",
        `${rel(full)}: uses <${name}>, which is not in the fixed MDX component map (lib/content/mdx-components.tsx) — authors cannot invent components`,
      );
    }
  }
}
checkMdxComponentsKnown(REAL_ROOT);
checkMdxComponentsKnown(FIXTURE_ROOT);

// -- G-LINK-FMT: year-band URL format, no raw judge domains outside allowed files --------------

if (registryFile) {
  for (const p of registryFile.problems) {
    try {
      const judge = judgeForYear(p.year);
      const url = judgeUrl(p.id, p.year);
      const expectedDomain = judge === "wmoj" ? "wmoj.ca" : "dmoj.ca";
      if (!url.includes(expectedDomain)) {
        err("G-LINK-FMT", `problem "${p.id}" (${p.year}) resolved to an unexpected domain: ${url}`);
      }
    } catch (e) {
      err("G-LINK-FMT", `problem "${p.id}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

const RAW_JUDGE_URL_ALLOWLIST = new Set([
  "lib/registry/judge-url.ts",
  "tools/links/verify-judges.mjs",
  "content/registry/external-links.yaml",
  "tests/fixtures/gates/G-LINK-FMT/violation.mdx", // the gate's own failing fixture
]);

function grepForRawJudgeUrls(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      grepForRawJudgeUrls(full);
    } else if (/\.(tsx?|jsx?|mdx|ya?ml|json)$/.test(entry.name)) {
      if (RAW_JUDGE_URL_ALLOWLIST.has(rel(full))) continue;
      const text = fs.readFileSync(full, "utf8");
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (/\b(wmoj|dmoj)\.ca\b/i.test(line)) {
          err("G-LINK-FMT", `${rel(full)}:${i + 1}: raw judge domain outside the registry code`);
        }
      });
    }
  }
}
if (!rootArg) {
  // App source is only scanned for the real tree — a `--root` fixture is just a content root, it
  // has no app/components/lib of its own.
  grepForRawJudgeUrls(path.join(APP_ROOT, "app"));
  grepForRawJudgeUrls(path.join(APP_ROOT, "components"));
  grepForRawJudgeUrls(path.join(APP_ROOT, "lib"));
}
grepForRawJudgeUrls(REAL_ROOT);
grepForRawJudgeUrls(FIXTURE_ROOT);

// external links on the allow-list: any raw https:// URL in MDX prose (outside fenced code) must
// be a judge URL or resolve to an id in external-links.yaml.
const allowedExternalUrls = new Set((externalLinksFile?.links ?? []).map((l) => l.url));
function checkExternalLinksInMdx(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkExternalLinksInMdx(full);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;
    const text = fs.readFileSync(full, "utf8").replace(/```[\s\S]*?```/g, "");
    for (const m of text.matchAll(/https?:\/\/[^\s"')<>]+/g)) {
      const url = m[0];
      if (/\b(wmoj|dmoj)\.ca\b/i.test(url)) continue; // covered by the raw-judge-url check above
      if (!allowedExternalUrls.has(url)) {
        err(
          "G-LINK-FMT",
          `${rel(full)}: external URL not in content/registry/external-links.yaml: ${url}`,
        );
      }
    }
  }
}
checkExternalLinksInMdx(REAL_ROOT);
checkExternalLinksInMdx(FIXTURE_ROOT);

// -- G-LINK-REF: plain-text CCC references outside a registry component -------------------------

const CCC_REF_RE = /\b(20(?:1[4-9]|2[0-6]))\s+[JS]\d\b|\bccc\d{2}[jJsS]\d+\b/;
const REGISTRY_JSX_RE =
  /<ProblemLink\b[\s\S]*?\/>|<Practice\b[^>]*>[\s\S]*?<\/Practice>|<JudgeLink\b[^>]*>[\s\S]*?<\/JudgeLink>/g;

function checkLinkRefInMdx(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkLinkRefInMdx(full);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;
    const withoutCode = fs.readFileSync(full, "utf8").replace(/```[\s\S]*?```/g, "");
    const withoutRegistryComponents = withoutCode.replace(REGISTRY_JSX_RE, "");
    const lines = withoutRegistryComponents.split("\n");
    lines.forEach((line, i) => {
      const m = line.match(CCC_REF_RE);
      if (m) {
        err(
          "G-LINK-REF",
          `${rel(full)}:${i + 1}: plain-text CCC reference "${m[0]}" outside ProblemLink/Practice/JudgeLink`,
        );
      }
    });
  }
}
checkLinkRefInMdx(REAL_ROOT);
checkLinkRefInMdx(FIXTURE_ROOT);
if (uiStringsFile) {
  const flatStrings = JSON.stringify(uiStringsFile);
  const m = flatStrings.match(CCC_REF_RE);
  if (m) err("G-LINK-REF", `content/ui/strings.yaml: plain-text CCC reference "${m[0]}"`);
}

// -- G-LINK-PREF: WMOJ-first — a DMOJ practice pick needs `why` when the same module also has a
//    WMOJ pick (warning; the reviewer resolves it, never a hard failure below --release) --------

for (const rec of moduleFiles) {
  if (rec.data.practice.length === 0) continue;
  const withJudge = rec.data.practice.map((item) => {
    const canonical = registryFile?.problems.find(
      (p) =>
        p.id === item.id ||
        p.aliases.some(
          (a) =>
            `ccc${String(p.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}` ===
            item.id,
        ),
    );
    const year = canonical?.year;
    const judge = year === undefined ? null : year >= 2021 ? "wmoj" : "dmoj";
    return { ...item, judge };
  });
  const hasWmoj = withJudge.some((p) => p.judge === "wmoj");
  if (!hasWmoj) continue;
  for (const p of withJudge) {
    if (p.judge === "dmoj" && !p.why) {
      const gate = "G-LINK-PREF";
      const message = `${rel(rec.file)}: DMOJ practice pick "${p.id}" needs a "why" — this module also has a WMOJ pick`;
      if (RELEASE) err(gate, message);
      else warn(gate, message);
    }
  }
}

// -- G-LINK-LIVE: verified.json must cover every referenced problem ------------------------------

const referencedIds = new Set<string>();
for (const rec of moduleFiles) {
  for (const item of rec.data.practice) referencedIds.add(item.id);
}
const canonicalReferencedIds = new Set<string>();
for (const id of referencedIds) {
  const direct = registryFile?.problems.find((p) => p.id === id);
  if (direct) {
    canonicalReferencedIds.add(direct.id);
    continue;
  }
  const viaAlias = registryFile?.problems.find((p) =>
    p.aliases.some(
      (a) =>
        `ccc${String(p.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}` === id,
    ),
  );
  if (viaAlias) canonicalReferencedIds.add(viaAlias.id);
}
const verifiedById = new Map((verifiedFile?.entries ?? []).map((e) => [e.id, e]));
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
for (const id of canonicalReferencedIds) {
  const entry = verifiedById.get(id);
  const gate = "G-LINK-LIVE";
  if (!entry) {
    const message = `"${id}" is referenced by a practice list but has no content/registry/verified.json entry — run \`npm run links:verify\``;
    RELEASE ? err(gate, message) : warn(gate, message);
    continue;
  }
  if (entry.status === "missing" || entry.status === "mismatch") {
    err(gate, `"${id}" is referenced by a practice list but verified.json says "${entry.status}"`);
    continue;
  }
  if (entry.status === "unverified") {
    warn(
      gate,
      `"${id}" is referenced by a practice list but is still "unverified" in verified.json`,
    );
    continue;
  }
  const age = Date.now() - new Date(entry.checkedAt).getTime();
  if (age > NINETY_DAYS_MS) {
    warn(
      gate,
      `"${id}" was last verified over 90 days ago (${entry.checkedAt}) — re-run \`npm run links:verify\``,
    );
  }
}

// -- G-PREREQ: glossary <Term> usage must not precede its introducedIn module -------------------

function checkTermUsageInMdx(dir: string, moduleIdForFile: (file: string) => string | null) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkTermUsageInMdx(full, moduleIdForFile);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;
    const usingModuleId = moduleIdForFile(full);
    if (!usingModuleId) continue;
    const usingModule = moduleById.get(usingModuleId);
    if (!usingModule) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const m of text.matchAll(/<Term\s+id="([^"]+)"/g)) {
      const termId = m[1];
      for (const glossary of glossaryFiles) {
        const term = glossary?.terms.find((t) => t.id === termId);
        if (!term?.introducedIn) continue;
        const introModuleId = term.introducedIn.split("/")[0];
        const introModule = introModuleId ? moduleById.get(introModuleId) : undefined;
        if (introModule && introModule.position > usingModule.position) {
          err(
            "G-PREREQ",
            `${rel(full)}: uses <Term id="${termId}"> before its introducedIn module "${introModuleId}" (position ${introModule.position} > ${usingModule.position})`,
          );
        }
      }
    }
  }
}
for (const rec of moduleFiles) {
  checkTermUsageInMdx(
    path.join(rec.root, "stages", rec.stageDir, rec.moduleDir, "lessons"),
    () => rec.data.id,
  );
}

// -- G-PREREQ: Python features used vs. concepts.yaml's introducedIn (AST, via pypy38) -----------

const AST_FEATURES_SCRIPT = path.join(APP_ROOT, "tools", "pycheck", "ast-features.py");
const PYPY38 = path.join(APP_ROOT, "..", ".tooling", "bin", "pypy38");

function findPythonFiles(
  dir: string,
  out: { file: string; moduleId: string }[],
  moduleIdForFile: (f: string) => string | null,
) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // `visuals/` holds vizrec recorder scripts (checked by G-VIZ), not code shown to a learner —
    // out of scope for the Python-feature-vs-concepts.yaml check (see tools/pycheck/check-python.ts).
    if (entry.isDirectory() && entry.name === "visuals") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPythonFiles(full, out, moduleIdForFile);
    } else if (entry.name.endsWith(".py") && !entry.name.includes(".bad38")) {
      const moduleId = moduleIdForFile(full);
      if (moduleId) out.push({ file: full, moduleId });
    }
  }
}

if (
  gateEnabled("G-PREREQ") &&
  fs.existsSync(AST_FEATURES_SCRIPT) &&
  fs.existsSync(PYPY38) &&
  conceptsFile
) {
  const pyFiles: { file: string; moduleId: string }[] = [];
  for (const rec of moduleFiles) {
    findPythonFiles(
      path.join(rec.root, "stages", rec.stageDir, rec.moduleDir),
      pyFiles,
      () => rec.data.id,
    );
  }
  for (const { file, moduleId } of pyFiles) {
    const usingModule = moduleById.get(moduleId);
    if (!usingModule) continue;
    let features: string[] = [];
    try {
      const out = execFileSync(PYPY38, [AST_FEATURES_SCRIPT, file], { encoding: "utf8" });
      features = (JSON.parse(out) as { features: string[] }).features;
    } catch (e) {
      warn(
        "G-PREREQ",
        `${rel(file)}: could not parse for AST feature check (${e instanceof Error ? e.message : String(e)})`,
      );
      continue;
    }
    for (const featureId of features) {
      const concept = conceptsFile.features.find((f) => f.id === featureId);
      if (!concept) continue; // no matcher/entry for this feature yet — P5 extends concepts.yaml
      const introModule = moduleById.get(concept.introducedIn);
      if (introModule && introModule.position > usingModule.position) {
        err(
          "G-PREREQ",
          `${rel(file)}: uses "${concept.feature}" before it is introduced in "${concept.introducedIn}" (position ${introModule.position} > ${usingModule.position})`,
        );
      }
    }
  }
}

report();
const hasError = findings.some((f) => f.severity === "error");
process.exit(hasError ? 1 : 0);

// ---------------------------------------------------------------------------------------------

function report() {
  if (findings.length === 0) {
    console.log("content:check — clean (no schema, link, or prerequisite issues found).");
    return;
  }
  const byGate = new Map<string, Finding[]>();
  for (const f of findings) {
    const list = byGate.get(f.gate) ?? [];
    list.push(f);
    byGate.set(f.gate, list);
  }
  for (const [gate, list] of [...byGate.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\n${gate} (${list.length}):`);
    for (const f of list) console.log(`  [${f.severity}] ${f.message}`);
  }
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warn").length;
  console.log(`\n${errors} error(s), ${warnings} warning(s)${RELEASE ? " (--release)" : ""}.`);
}
