#!/usr/bin/env node
// scripts/gates/prebuild.mjs — runs automatically before `npm run build` (npm's own "pre<script>"
// convention), including on Vercel. Only the cheap, network-free, Python-free data checks (plan
// line 184: "the Vercel build needs no Python and no network beyond npm... prebuild runs the
// cheap data checks G-SCHEMA, G-LINK-FMT so broken content can never deploy") plus G-VIZ's
// schema-only half (W3, requests.md — `check:viz -- --schema-only` needs no Python either).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");

function run(label, cmd, args) {
  console.log(`\n> prebuild: ${label}`);
  try {
    execFileSync(cmd, args, { cwd: APP_ROOT, stdio: "inherit" });
  } catch {
    console.error(
      `prebuild: "${label}" failed — the build stops here (broken content never deploys).`,
    );
    process.exit(1);
  }
}

run("content:check --only=G-SCHEMA,G-LINK-FMT", process.execPath, [
  "--import",
  "./tools/viz/register.mjs",
  "scripts/gates/content-check.ts",
  "--only=G-SCHEMA,G-LINK-FMT",
]);

const checkViz = path.join(APP_ROOT, "tools", "viz", "check-viz.ts");
if (fs.existsSync(checkViz)) {
  run("check:viz --schema-only", process.execPath, [
    "--import",
    "./tools/viz/register.mjs",
    "tools/viz/check-viz.ts",
    "--schema-only",
  ]);
} else {
  console.log(
    "\n> prebuild: skipping check:viz --schema-only (tools/viz/check-viz.ts not written yet)",
  );
}

console.log("\nprebuild: clean.");
