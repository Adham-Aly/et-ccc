// G-VIZ (plan §7, §4.11.6): every visual is Zod-valid; regeneration gives no diff; every step
// has a caption; the text alternative is present; the declared consistency check with the shown
// code passes; size and step budgets hold; only library components are used; and every panel
// is narrow enough to meet the minimum text sizes on a 390 px phone.
import fs from "node:fs";
import path from "node:path";
import { SCENE_NAMES } from "../../components/viz/scenes";
import { MAX_NATURAL_WIDTH, unionSize } from "../../lib/viz/geometry";
import { layoutPanel } from "../../lib/viz/layout";
import { layoutTrace } from "../../lib/viz/layout-trace";
import {
  type FrameByViz,
  type FramesFile,
  PANEL_VIZ,
  type TraceFile,
  type TraceYaml,
  type VizYaml,
} from "../../lib/viz/schema";
import { expandTrace } from "../../lib/viz/trace";
import { validateVisualFile } from "../../lib/viz/validate";
import {
  DEFAULT_BYTES,
  DEFAULT_STEPS,
  findVisuals,
  generate,
  inScope,
  listFiles,
  presetStdin,
  rel,
  runPypy,
  type VisualSource,
  VizError,
} from "./lib";

export const RULES = [
  "schema",
  "missing",
  "stale",
  "caption",
  "alt",
  "consistency",
  "size",
  "steps",
  "library",
  "text-size",
  "orphan",
  "python",
  "tree-ids",
] as const;
export type Rule = (typeof RULES)[number];

export interface Finding {
  rule: Rule;
  file: string;
  message: string;
}

export interface CheckOptions {
  roots: string[];
  scope?: string | undefined;
  /** Only what needs no Python (prebuild on Vercel): schema, captions, alt, budgets, library, width. */
  schemaOnly?: boolean | undefined;
}

const LAZY_CAPTION = /^(step|frame)\s*\d+\.?$/i;

function checkCaptions(captions: string[], file: string, out: Finding[]): void {
  captions.forEach((c, i) => {
    const t = c.trim();
    if (t.length < 12 || LAZY_CAPTION.test(t)) {
      out.push({
        rule: "caption",
        file,
        message: `step ${i + 1} has no teaching caption ("${t}")`,
      });
    }
  });
}

/** Validate the authored config; returns its budget when valid, null when not. */
function configBudget(
  file: string,
  out: Finding[],
): { bytes?: number | undefined; steps?: number | undefined } | null {
  const res = validateVisualFile(file);
  if (res.ok) return (res.data as VizYaml | TraceYaml).budget ?? {};
  const alt = res.errors.filter((e) => e.startsWith("alt:"));
  const other = res.errors.filter((e) => !e.startsWith("alt:"));
  if (alt.length > 0) {
    out.push({
      rule: "alt",
      file: rel(file),
      message: `text alternative missing or too short (${alt.join("; ")})`,
    });
  }
  if (other.length > 0) out.push({ rule: "schema", file: rel(file), message: other.join("; ") });
  return null;
}

function checkWidths(file: FramesFile, where: string, out: Finding[]): void {
  for (const panel of file.panels) {
    const frames = file.presets.flatMap((p) => p.steps.map((s) => s.panels[panel.id]));
    const scenes = layoutPanel(panel.viz, frames as FrameByViz[typeof panel.viz][]);
    const { width } = unionSize(scenes);
    if (width > MAX_NATURAL_WIDTH) {
      out.push({
        rule: "text-size",
        file: where,
        message: `panel "${panel.id}" is ${Math.ceil(width)} units wide; at most ${MAX_NATURAL_WIDTH} keeps values at 14 px and labels at 12 px on a 390 px phone (shrink the preset)`,
      });
    }
  }
}

interface TreeNodeLike {
  id: string;
  children?: TreeNodeLike[] | undefined;
}

/**
 * TreeViz lays out the union of every step of every preset by node id, so an id must mean the
 * same place everywhere: the same parent in every step and preset (e.g. ids by call path).
 */
function checkTreeIds(file: FramesFile, where: string, out: Finding[]): void {
  for (const panel of file.panels) {
    if (panel.viz !== "TreeViz") continue;
    const parentOf = new Map<string, string | null>();
    const reported = new Set<string>();
    for (const p of file.presets) {
      p.steps.forEach((s, i) => {
        const root = (s.panels[panel.id] as { root: TreeNodeLike | null } | undefined)?.root;
        const walk = (n: TreeNodeLike, parent: string | null) => {
          const seen = parentOf.get(n.id);
          if (seen === undefined) parentOf.set(n.id, parent);
          else if (seen !== parent && !reported.has(n.id)) {
            reported.add(n.id);
            out.push({
              rule: "tree-ids",
              file: where,
              message: `panel "${panel.id}", preset ${p.id} step ${i + 1}: node "${n.id}" is under "${parent ?? "(root)"}" here but under "${seen ?? "(root)"}" elsewhere; give each position its own id (for example by call path)`,
            });
          }
          for (const c of n.children ?? []) walk(c, n.id);
        };
        if (root) walk(root, null);
      });
    }
  }
}

function checkTraceWidth(file: TraceFile, where: string, out: Finding[]): void {
  const scenes = file.presets.flatMap((p) => layoutTrace(expandTrace(p.steps)));
  const { width } = unionSize(scenes);
  if (width > MAX_NATURAL_WIDTH) {
    out.push({
      rule: "text-size",
      file: where,
      message: `the frames-and-objects panel is ${Math.ceil(width)} units wide (max ${MAX_NATURAL_WIDTH}); use shorter names or smaller lists`,
    });
  }
}

function checkVisual(v: VisualSource, opts: CheckOptions, out: Finding[]): void {
  const budgetCfg = configBudget(v.config, out);
  const configOk = budgetCfg !== null;
  if (!fs.existsSync(v.output)) {
    out.push({
      rule: "missing",
      file: rel(v.output),
      message: "generated file is missing (run npm run gen:viz)",
    });
    return;
  }
  const res = validateVisualFile(v.output);
  if (!res.ok) {
    out.push({ rule: "schema", file: rel(v.output), message: res.errors.slice(0, 8).join("; ") });
    return;
  }
  const where = rel(v.output);
  const bytes = fs.statSync(v.output).size;
  const committed = fs.readFileSync(v.output, "utf8");
  const budget = budgetCfg ?? {};
  const maxBytes = budget.bytes ?? DEFAULT_BYTES;
  if (bytes > maxBytes) {
    out.push({ rule: "size", file: where, message: `${bytes} bytes, budget ${maxBytes}` });
  }
  const maxSteps = budget.steps ?? DEFAULT_STEPS;
  if (v.kind === "frames") {
    const file = res.data as FramesFile;
    for (const p of file.presets) {
      if (p.steps.length > maxSteps) {
        out.push({
          rule: "steps",
          file: where,
          message: `preset ${p.id} has ${p.steps.length} steps, budget ${maxSteps}`,
        });
      }
      checkCaptions(
        p.steps.map((s) => s.caption),
        `${where} (${p.id})`,
        out,
      );
    }
    for (const panel of file.panels) {
      if (!(PANEL_VIZ as readonly string[]).includes(panel.viz)) {
        out.push({
          rule: "library",
          file: where,
          message: `panel visualizer ${panel.viz} is not a library panel visualizer`,
        });
      }
    }
    if (file.alt.trim().length < 20)
      out.push({ rule: "alt", file: where, message: "text alternative too short" });
    checkTreeIds(file, where, out);
    checkWidths(file, where, out);
  } else {
    const file = res.data as TraceFile;
    for (const p of file.presets) {
      if (p.steps.length > maxSteps) {
        out.push({
          rule: "steps",
          file: where,
          message: `preset ${p.id} has ${p.steps.length} steps, budget ${maxSteps}`,
        });
      }
      checkCaptions(
        p.steps.map((s) => s.c),
        `${where} (${p.id})`,
        out,
      );
    }
    if (file.alt.trim().length < 20)
      out.push({ rule: "alt", file: where, message: "text alternative too short" });
    checkTraceWidth(file, where, out);
  }
  if (opts.schemaOnly || !configOk) return;

  // Regeneration under PyPy 3.8 must reproduce the committed file byte for byte.
  let generated: ReturnType<typeof generate>;
  try {
    generated = generate(v);
  } catch (err) {
    const rule =
      err instanceof VizError && (RULES as readonly string[]).includes(err.rule)
        ? (err.rule as Rule)
        : "python";
    out.push({ rule, file: rel(v.config), message: (err as Error).message });
    return;
  }
  if (generated.text !== committed) {
    out.push({
      rule: "stale",
      file: where,
      message:
        "regeneration differs from the committed file (run npm run gen:viz; never hand-edit)",
    });
  }
  if (v.kind === "frames") {
    const cfg = generated.config as VizYaml;
    if (!cfg.consistency) {
      out.push({
        rule: "consistency",
        file: rel(v.config),
        message: "no consistency check declared (consistency: description, example, compare)",
      });
      return;
    }
    const example = path.resolve(path.dirname(v.config), cfg.consistency.example);
    if (!fs.existsSync(example)) {
      out.push({
        rule: "consistency",
        file: rel(v.config),
        message: `example ${cfg.consistency.example} not found`,
      });
      return;
    }
    for (const p of cfg.presets) {
      const recorded = generated.outputs[p.id];
      if (recorded === undefined) {
        out.push({
          rule: "consistency",
          file: rel(v.config),
          message: `preset ${p.id}: the .viz.py never called rec.output(...)`,
        });
        continue;
      }
      const run = runPypy(
        [path.basename(example)],
        presetStdin(v.config, p),
        path.dirname(example),
      );
      if (run.status !== 0) {
        out.push({
          rule: "consistency",
          file: rel(v.config),
          message: `preset ${p.id}: ${rel(example)} failed: ${run.stderr.trim().split("\n").pop()}`,
        });
      } else if (run.stdout !== recorded) {
        out.push({
          rule: "consistency",
          file: rel(v.config),
          message: `preset ${p.id}: "${cfg.consistency.description}" fails: the example printed ${JSON.stringify(run.stdout)}, the visual shows ${JSON.stringify(recorded)}`,
        });
      }
    }
  }
}

/** MDX: only library visual components, each inside a <Figure>, with references that resolve. */
function checkMdx(file: string, out: Finding[]): void {
  const text = fs
    .readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const where = rel(file);
  for (const m of text.matchAll(/<(svg|img|canvas|iframe|video|picture|object|embed)\b/gi)) {
    out.push({
      rule: "library",
      file: where,
      message: `raw <${m[1]}> is not a library visual; use Figure + Diagram/StepThrough/CodeTrace/Scene`,
    });
  }
  const moduleDir =
    path.basename(path.dirname(file)) === "lessons"
      ? path.dirname(path.dirname(file))
      : path.dirname(file);
  let depth = 0;
  const tagRe = /<(\/?)(Figure|StepThrough|CodeTrace|Diagram|Scene)\b([^>]*?)(\/?)>/g;
  for (const m of text.matchAll(tagRe)) {
    const [, closing, name, attrs = "", selfClosing] = m;
    if (name === "Figure") {
      if (closing) depth -= 1;
      else if (!selfClosing) depth += 1;
      continue;
    }
    if (closing) continue;
    if (depth <= 0)
      out.push({
        rule: "library",
        file: where,
        message: `<${name}> must sit inside a <Figure> (caption and text alternative)`,
      });
    const attr = (k: string) => new RegExp(`${k}="([^"]*)"`).exec(attrs)?.[1];
    const ref = attr("frames") ?? attr("trace");
    if (ref !== undefined && !fs.existsSync(path.resolve(moduleDir, ref))) {
      out.push({
        rule: "missing",
        file: where,
        message: `<${name}> refers to ${ref}, which does not exist`,
      });
    }
    const viz = attr("viz");
    if (
      name === "Diagram" &&
      viz !== undefined &&
      !(PANEL_VIZ as readonly string[]).includes(viz)
    ) {
      out.push({
        rule: "library",
        file: where,
        message: `<Diagram viz="${viz}"> is not a library visualizer`,
      });
    }
    const sceneName = attr("name");
    if (
      name === "Scene" &&
      sceneName !== undefined &&
      !(SCENE_NAMES as string[]).includes(sceneName)
    ) {
      out.push({
        rule: "library",
        file: where,
        message: `<Scene name="${sceneName}"> is not a library scene`,
      });
    }
  }
}

function checkOrphans(files: string[], out: Finding[]): void {
  const set = new Set(files);
  for (const f of files) {
    const pairs: [RegExp, string][] = [
      [/\.frames\.json$/, ".viz.yaml"],
      [/\.viz\.py$/, ".viz.yaml"],
      [/\.trace\.json$/, ".trace.yaml"],
    ];
    for (const [re, want] of pairs) {
      if (re.test(f) && !set.has(f.replace(re, want))) {
        out.push({
          rule: "orphan",
          file: rel(f),
          message: `no ${path.basename(f.replace(re, want))} next to it`,
        });
      }
    }
  }
}

export function checkViz(opts: CheckOptions): Finding[] {
  const out: Finding[] = [];
  const files = listFiles(opts.roots).filter((f) => inScope(f, opts.scope));
  for (const v of findVisuals(opts.roots, opts.scope)) checkVisual(v, opts, out);
  for (const f of files) if (f.endsWith(".mdx")) checkMdx(f, out);
  checkOrphans(files, out);
  return out;
}
