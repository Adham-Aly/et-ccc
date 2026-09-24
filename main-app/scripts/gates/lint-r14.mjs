#!/usr/bin/env node
// scripts/gates/lint-r14.mjs — G-R14 (plan §6.5, §7). `npm run lint:r14`. Scans lesson MDX prose,
// content/ui/strings.yaml, and string literals in app/ and components/ source for the narrowed
// banned patterns in tools/lint/r14-banned.json (quoted from the plan almost verbatim), with a
// reviewed allow-list for legitimate technical terms ("ceiling division", "average of the
// array") that would otherwise trip a pattern.
//
// `--root=<dir>` scans a single isolated content root instead of content/ + tests/fixtures/content/
// (used by the gate fixture, mirroring the other gate scripts).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { extractProseFromMdx, extractProseFromStrings } from "../../tools/style/extract-prose.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");
const CONFIG = JSON.parse(
  fs.readFileSync(path.join(APP_ROOT, "tools", "lint", "r14-banned.json"), "utf8"),
);

const rootArg = process.argv.find((a) => a.startsWith("--root="));
const CONTENT_ROOTS = rootArg
  ? [path.resolve(APP_ROOT, rootArg.slice("--root=".length))]
  : [path.join(APP_ROOT, "content"), path.join(APP_ROOT, "tests", "fixtures", "content")].filter(
      (r) => fs.existsSync(r),
    );

function rel(p) {
  return path.relative(APP_ROOT, p);
}

function walk(dir, out, predicate) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, predicate);
    else if (predicate(full)) out.push(full);
  }
}

const allowlistLower = CONFIG.allowlist.map((a) => a.toLowerCase());
function isAllowed(line) {
  const l = line.toLowerCase();
  return allowlistLower.some((a) => l.includes(a));
}

const findings = [];

function scanText(text, fileLabel, lineOffset = 0) {
  const lines = text.split("\n");
  for (const p of CONFIG.patterns) {
    const re = new RegExp(p.pattern, p.flags.includes("g") ? p.flags : `${p.flags}g`);
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line) && !isAllowed(line)) {
        findings.push({
          file: fileLabel,
          line: i + 1 + lineOffset,
          rule: p.id,
          message: p.message,
          snippet: line.trim().slice(0, 140),
        });
      }
    });
  }
}

// -- lesson MDX prose -----------------------------------------------------------------------------

const mdxFiles = [];
for (const root of CONTENT_ROOTS) walk(root, mdxFiles, (f) => f.endsWith(".mdx"));
for (const file of mdxFiles) {
  const prose = extractProseFromMdx(fs.readFileSync(file, "utf8"));
  scanText(prose, rel(file));
}

// -- content/ui/strings.yaml -----------------------------------------------------------------------

for (const root of CONTENT_ROOTS) {
  const stringsFile = path.join(root, "ui", "strings.yaml");
  if (!fs.existsSync(stringsFile)) continue;
  const data = parse(fs.readFileSync(stringsFile, "utf8"));
  scanText(extractProseFromStrings(data), rel(stringsFile));
}

// -- hard-coded strings in app code (only against the real tree; a --root fixture has no app/) ----

if (!rootArg) {
  const sourceFiles = [];
  walk(path.join(APP_ROOT, "app"), sourceFiles, (f) => /\.(tsx?|jsx?)$/.test(f));
  walk(path.join(APP_ROOT, "components"), sourceFiles, (f) => /\.(tsx?|jsx?)$/.test(f));
  for (const file of sourceFiles) {
    scanText(fs.readFileSync(file, "utf8"), rel(file));
  }
}

if (findings.length === 0) {
  console.log(
    `lint:r14 — clean (${mdxFiles.length} lesson(s) + ui/strings.yaml + app source scanned).`,
  );
  process.exit(0);
}
for (const f of findings) {
  console.log(`  ${f.file}:${f.line} [${f.rule}] ${f.message} — "${f.snippet}"`);
}
console.log(`\n${findings.length} R14 violation(s).`);
process.exit(1);
