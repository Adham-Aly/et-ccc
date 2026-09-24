#!/usr/bin/env node
// scripts/verify.mjs — the verify:fast / verify:full / verify:preview gate runner (plan §7,
// brief §1.3).
//
//   verify:fast    — every gate that needs no build, no server, no browser (plan §7). Runs at
//                     every change.
//   verify:full    — every fast gate, plus G-BUILD (its own isolated dist dir — never the plain
//                     `.next` a developer's `next dev` might be using), the production-mode
//                     build-and-check proof, G-E2E/G-VISUAL/G-PAGE against a local production
//                     server, G-LINKS-INT, and viz:shots — with `--fail-on-flaky-tests` on every
//                     Playwright suite (plan §7 G-FLAKE: "phase exits use --fail-on-flaky-tests").
//                     Runs at phase exit and release.
//   verify:preview — G-E2E/G-VISUAL/G-PAGE against a real deployed Vercel preview instead of a
//                     local server: resolves the URL via `deployed-url.mjs` (matches the current
//                     HEAD commit) and sets PLAYWRIGHT_BASE_URL, which
//                     tests/support/playwright-shared.ts's resolveBaseUrl() picks up (no local
//                     server, no port lease — scripts/run-playwright.mjs skips both when that
//                     env var is set). Runs at phase exit and release, alongside verify:full.
//
// G-PERF (Lighthouse, `npm run perf`) and G-LINK-EXT (`npm run links:external`) are NOT run by
// any verify mode — the gate table (plan §7) times them "P4 exit, release" and "release"
// respectively as their own manual/standalone commands, the same way G-LINK-LIVE's live check
// (`links:verify`) stays out of verify:fast/verify:full.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(scriptDir, "..");

const args = process.argv.slice(2);
const mode = args[0];
if (mode !== "fast" && mode !== "full" && mode !== "preview") {
  console.error("Usage: verify.mjs <fast|full|preview> [--scope <id>]");
  process.exit(1);
}
const scopeIndex = args.indexOf("--scope");
const scope = scopeIndex !== -1 ? args[scopeIndex + 1] : undefined;
if (scope) {
  console.log(
    `verify:${mode}: --scope ${scope} requested; no scoped gates exist yet — running the full gate set for this mode.`,
  );
}

const npmBin = path.join(path.dirname(process.execPath), "npm");

/** A gate that runs a plain `npm run <script>` with no extra args, in the given env. */
function npmScriptGate(id, script, extraEnv = {}) {
  return {
    id,
    describe: `npm run ${script}`,
    run: () =>
      spawnSync(npmBin, ["run", script], {
        cwd: mainAppRoot,
        stdio: "inherit",
        shell: false,
        env: { ...process.env, ...extraEnv },
      }),
  };
}

/**
 * A gate that runs one Playwright suite directly through run-playwright.mjs (bypassing `npm run`,
 * whose `-- <extra args>` forwarding does not insert the `--` run-playwright.mjs itself looks for
 * — see its own usage comment), so `extraPlaywrightArgs` reaches Playwright exactly as given.
 */
function playwrightGate(id, leaseName, configFile, defaultPort, extraPlaywrightArgs = []) {
  return {
    id,
    describe: `run-playwright ${leaseName} ${configFile}`,
    run: () =>
      spawnSync(
        process.execPath,
        [
          path.join(mainAppRoot, "scripts", "run-playwright.mjs"),
          leaseName,
          configFile,
          String(defaultPort),
          ...(extraPlaywrightArgs.length > 0 ? ["--", ...extraPlaywrightArgs] : []),
        ],
        { cwd: mainAppRoot, stdio: "inherit", shell: false, env: process.env },
      ),
  };
}

function nodeScriptGate(id, scriptPath, args = []) {
  return {
    id,
    describe: `node ${scriptPath}`,
    run: () =>
      spawnSync(process.execPath, [path.join(mainAppRoot, scriptPath), ...args], {
        cwd: mainAppRoot,
        stdio: "inherit",
        shell: false,
        env: process.env,
      }),
  };
}

// verify:fast never builds, starts a server, or opens a browser (plan §7).
const FAST_GATES = [
  npmScriptGate("G-LINT", "lint"),
  npmScriptGate("G-TYPES", "typecheck"),
  npmScriptGate("G-UNIT", "test:unit"),
  npmScriptGate("G-UI-LIGHT", "lint:light"),
  npmScriptGate("G-SCHEMA/LINK/PREREQ", "content:check"),
  npmScriptGate("G-PY-38/G-PY-RUN", "check:python"),
  npmScriptGate("G-STYLE", "style:check"),
  npmScriptGate("G-R14", "lint:r14"),
  npmScriptGate("G-SPELL", "spell"),
  npmScriptGate("G-MDX", "lint:mdx"),
  npmScriptGate("G-VIZ", "check:viz"),
];

const FLAKE_FLAG = ["--fail-on-flaky-tests"];

const FULL_GATES = [
  ...FAST_GATES,
  npmScriptGate("G-BUILD", "verify:build"),
  nodeScriptGate("G-BUILD-PROD-CHECK", "scripts/check-production-mode.mjs"),
  playwrightGate("G-E2E", "e2e", "playwright.config.ts", 4100, FLAKE_FLAG),
  playwrightGate("G-VISUAL", "visual", "playwright.visual.config.ts", 4101, FLAKE_FLAG),
  playwrightGate("G-PAGE", "a11y", "playwright.a11y.config.ts", 4102, FLAKE_FLAG),
  npmScriptGate("G-LINKS-INT", "links:internal"),
  npmScriptGate("G-VIZ-SHOTS", "viz:shots"),
];

function resolveDeployedUrlOrExit() {
  console.log("verify:preview: resolving the deployed preview URL for the current HEAD ...");
  // `verify.mjs preview --timeout=<ms>` forwards to deployed-url.mjs (default: its own 5-minute
  // default, a real wait for a fresh push's Vercel build) — mainly so a quick manual check
  // ("is anything deployed at all yet?") does not have to sit through the full default.
  const timeoutArg = args.find((a) => a.startsWith("--timeout="));
  const deployedUrlArgs = ["run", "-s", "deployed-url", ...(timeoutArg ? ["--", timeoutArg] : [])];
  const result = spawnSync(npmBin, deployedUrlArgs, {
    cwd: mainAppRoot,
    encoding: "utf8",
    shell: false,
  });
  const url = (result.stdout ?? "").trim();
  if (result.status !== 0 || !url) {
    console.error(result.stderr ?? "");
    console.error(
      "verify:preview: could not resolve a deployed preview URL for the current HEAD commit — is it pushed, and has Vercel built it yet?",
    );
    process.exit(1);
  }
  console.log(`verify:preview: testing against ${url}`);
  return url;
}

let gates;
if (mode === "fast") {
  gates = FAST_GATES;
} else if (mode === "full") {
  gates = FULL_GATES;
} else {
  process.env.PLAYWRIGHT_BASE_URL = resolveDeployedUrlOrExit();
  gates = [
    playwrightGate("G-E2E", "e2e", "playwright.config.ts", 4100, FLAKE_FLAG),
    playwrightGate("G-VISUAL", "visual", "playwright.visual.config.ts", 4101, FLAKE_FLAG),
    playwrightGate("G-PAGE", "a11y", "playwright.a11y.config.ts", 4102, FLAKE_FLAG),
  ];
}

console.log(`verify:${mode}: running ${gates.length} gate(s)\n`);

const results = [];
for (const gate of gates) {
  console.log(`--- ${gate.id} (${gate.describe}) ---`);
  const result = gate.run();
  const ok = result.status === 0 && !result.error;
  results.push({ id: gate.id, describe: gate.describe, ok });
  console.log(`--- ${gate.id}: ${ok ? "PASS" : "FAIL"} ---\n`);
}

console.log(`verify:${mode} summary:`);
let allOk = true;
for (const { id, describe, ok } of results) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} (${describe})`);
  if (!ok) allOk = false;
}

process.exit(allOk ? 0 : 1);
