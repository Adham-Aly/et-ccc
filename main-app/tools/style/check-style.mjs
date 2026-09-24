#!/usr/bin/env node
// tools/style/check-style.mjs — G-STYLE (plan §6.3, §7). `npm run style:check`. Runs
// avoid-ai-writing's detector over every lesson's prose and over content/ui/strings.yaml,
// applies tools/style/thresholds.json (hard categories: 0 hits; soft categories: hits per 1,000
// words), and checks Flesch-Kincaid grade + long-sentence warnings for Stages 0-2.
//
// `--root=<dir>` scans a single isolated content root instead of content/ + tests/fixtures/content/
// (used by the gate fixture, mirroring the other gate scripts' `--root`).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import AIDetector from "../../../.claude/skills/avoid-ai-writing/detector/patterns.js";
import { extractProseFromMdx, extractProseFromStrings } from "./extract-prose.mjs";
import { analyzeReadability } from "./readability.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");
const THRESHOLDS = JSON.parse(fs.readFileSync(path.join(HERE, "thresholds.json"), "utf8"));

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
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, predicate);
    else if (predicate(full)) out.push(full);
  }
}

function stageIdForPath(file) {
  const m = file.match(/[/\\]stages[/\\]([a-z0-9]+)-/);
  return m ? m[1] : null;
}

const findings = [];
function fail(gate, file, message) {
  findings.push({ gate, severity: "error", file, message });
}
function warn(gate, file, message) {
  findings.push({ gate, severity: "warn", file, message });
}

function runDetector(text, file) {
  if (!text || text.trim().split(/\s+/).length < 10) return; // too short to score, nothing to flag
  const result = AIDetector.analyzeText(text, { contextMode: "technical" });
  const wordCount = result.stats?.wordCount ?? text.trim().split(/\s+/).length;
  const byType = new Map();
  for (const issue of result.issues ?? []) {
    byType.set(issue.type, (byType.get(issue.type) ?? 0) + 1);
  }
  for (const [type, count] of byType) {
    if (THRESHOLDS.hardCategories.includes(type)) {
      fail("G-STYLE", rel(file), `hard category "${type}": ${count} hit(s) (must be 0)`);
      continue;
    }
    const perThousand = (count / wordCount) * 1000;
    const limit =
      THRESHOLDS.softCategoryOverridesPerThousandWords[type] ??
      THRESHOLDS.softDefaultPerThousandWords;
    if (perThousand > limit) {
      fail(
        "G-STYLE",
        rel(file),
        `soft category "${type}": ${perThousand.toFixed(1)}/1000 words, over the ${limit}/1000 threshold`,
      );
    }
  }
}

function checkReadability(text, file, stageId) {
  const { fleschKincaidGradeMaxStages, fleschKincaidGradeMax, warnSentenceWordCount } =
    THRESHOLDS.readability;
  const { grade, longSentences } = analyzeReadability(text, warnSentenceWordCount);
  if (stageId && fleschKincaidGradeMaxStages.includes(stageId) && grade > fleschKincaidGradeMax) {
    fail(
      "G-STYLE",
      rel(file),
      `Flesch-Kincaid grade ${grade} exceeds ${fleschKincaidGradeMax} for a Stage ${stageId.replace("s", "")} lesson`,
    );
  }
  for (const s of longSentences) {
    warn(
      "G-STYLE",
      rel(file),
      `sentence over ${warnSentenceWordCount} words (${s.words}): "${s.text.slice(0, 80)}..."`,
    );
  }
}

function main() {
  const lessonFiles = [];
  for (const root of CONTENT_ROOTS) walk(root, lessonFiles, (f) => f.endsWith(".mdx"));

  for (const file of lessonFiles) {
    const raw = fs.readFileSync(file, "utf8");
    const prose = extractProseFromMdx(raw);
    runDetector(prose, file);
    checkReadability(prose, file, stageIdForPath(file));
  }

  for (const root of CONTENT_ROOTS) {
    const stringsFile = path.join(root, "ui", "strings.yaml");
    if (!fs.existsSync(stringsFile)) continue;
    const data = parse(fs.readFileSync(stringsFile, "utf8"));
    const prose = extractProseFromStrings(data);
    runDetector(prose, stringsFile);
  }

  if (findings.length === 0) {
    console.log(`style:check — clean (${lessonFiles.length} lesson(s) scanned).`);
    process.exit(0);
  }
  for (const f of findings) console.log(`  [${f.severity}] ${f.file}: ${f.message}`);
  const errors = findings.filter((f) => f.severity === "error").length;
  console.log(`\n${errors} error(s), ${findings.length - errors} warning(s).`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
