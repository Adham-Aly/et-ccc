#!/usr/bin/env node
// scripts/verify.mjs — the verify:fast / verify:full gate runner (plan §7, brief §1.3).
// Extended by later P4 batches with content:check, check:python, check:viz, lint:r14,
// style:check, spell, lint:mdx, links:verify, links:internal, test:e2e, test:visual, test:a11y,
// perf. For now (P4 batch 1: scaffold only) it runs the gates that exist: lint, typecheck, unit,
// lint:light, and — for verify:full — build.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(scriptDir, "..");

const args = process.argv.slice(2);
const mode = args[0];
if (mode !== "fast" && mode !== "full") {
  console.error("Usage: verify.mjs <fast|full> [--scope <id>]");
  process.exit(1);
}
const scopeIndex = args.indexOf("--scope");
const scope = scopeIndex !== -1 ? args[scopeIndex + 1] : undefined;

// [gate id, npm script]. verify:fast never builds, starts a server, or opens a browser
// (plan §7): it stays this list. verify:full adds G-BUILD (and, once written, the E2E/visual/
// a11y/perf suites run separately at phase exit against the build this produces).
const FAST_GATES = [
  ["G-LINT", "lint"],
  ["G-TYPES", "typecheck"],
  ["G-UNIT", "test:unit"],
  ["G-UI-LIGHT", "lint:light"],
  ["G-SCHEMA/LINK/PREREQ", "content:check"],
  ["G-PY-38/G-PY-RUN", "check:python"],
  ["G-STYLE", "style:check"],
  ["G-R14", "lint:r14"],
  ["G-SPELL", "spell"],
  ["G-MDX", "lint:mdx"],
  ["G-VIZ", "check:viz"],
];
const FULL_GATES = [...FAST_GATES, ["G-BUILD", "build"]];

const gates = mode === "fast" ? FAST_GATES : FULL_GATES;

if (scope) {
  console.log(
    `verify:${mode}: --scope ${scope} requested; no scoped gates exist yet (batch 1) — running the full gate set for this mode.`,
  );
}

console.log(`verify:${mode}: running ${gates.length} gate(s)\n`);

const npmBin = path.join(path.dirname(process.execPath), "npm");
const results = [];
for (const [id, script] of gates) {
  console.log(`--- ${id} (npm run ${script}) ---`);
  const result = spawnSync(npmBin, ["run", script], {
    cwd: mainAppRoot,
    stdio: "inherit",
    shell: false,
  });
  const ok = result.status === 0 && !result.error;
  results.push({ id, script, ok });
  console.log(`--- ${id}: ${ok ? "PASS" : "FAIL"} ---\n`);
}

console.log(`verify:${mode} summary:`);
let allOk = true;
for (const { id, script, ok } of results) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} (${script})`);
  if (!ok) allOk = false;
}

process.exit(allOk ? 0 : 1);
