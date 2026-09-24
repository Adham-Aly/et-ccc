#!/usr/bin/env node
// scripts/gates/lint-light.mjs — G-UI-LIGHT (plan §7, brief §1.6, plan §4.9). Fails on any
// dark-mode trace anywhere in app/, components/, lib/, content/, tests/fixtures/content/:
// Tailwind `dark:` classes, `prefers-color-scheme: dark`, dark theme imports. Light mode only.
//
// Proven by tests/unit/gates/lint-light.test.ts against the failing fixture
// (tests/fixtures/gates/G-UI-LIGHT/, deliberately outside the scanned set above) and against
// the real tree.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(scriptDir, "..", "..");

const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"]);
const DEFAULT_DIRS = ["app", "components", "lib", "content", "tests/fixtures/content"];

const PATTERNS = [
  {
    id: "dark-class",
    re: /(^|[\s"'`{(])dark:[\w-]/g,
    message: "Tailwind `dark:` variant class",
  },
  {
    id: "prefers-dark",
    re: /prefers-color-scheme:\s*dark/gi,
    message: "`prefers-color-scheme: dark` media query",
  },
  {
    id: "dark-theme-import",
    re: /(?:from|require\()\s*["'][^"']*dark[-_.]?theme[^"']*["']/gi,
    message: "dark theme import",
  },
];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // directory doesn't exist yet — nothing to scan
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      out.push(...walk(full));
    } else if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** @param {string[]} dirs @returns {Array<{file:string,line:number,rule:string,message:string,snippet:string}>} */
export function checkUiLight(dirs) {
  const violations = [];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const text = fs.readFileSync(file, "utf8");
      const lines = text.split("\n");
      for (const pattern of PATTERNS) {
        pattern.re.lastIndex = 0;
        let match = pattern.re.exec(text);
        while (match !== null) {
          const upTo = text.slice(0, match.index);
          const lineNo = upTo.split("\n").length;
          violations.push({
            file,
            line: lineNo,
            rule: pattern.id,
            message: pattern.message,
            snippet: (lines[lineNo - 1] ?? "").trim().slice(0, 120),
          });
          match = pattern.re.exec(text);
        }
      }
    }
  }
  return violations;
}

function main() {
  const dirs = DEFAULT_DIRS.map((d) => path.join(mainAppRoot, d));
  const violations = checkUiLight(dirs);
  if (violations.length > 0) {
    console.error(
      `G-UI-LIGHT: ${violations.length} dark-mode trace(s) found (light mode only, plan §4.9 / brief §1.6):`,
    );
    for (const v of violations) {
      console.error(
        `  ${path.relative(mainAppRoot, v.file)}:${v.line} [${v.rule}] ${v.message} — ${v.snippet}`,
      );
    }
    process.exit(1);
  }
  console.log("G-UI-LIGHT: no dark-mode traces found.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
