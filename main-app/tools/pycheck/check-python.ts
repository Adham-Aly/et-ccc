#!/usr/bin/env node
// tools/pycheck/check-python.ts — G-PY-38 and G-PY-RUN (plan §4.5, §7). Run via
// `npm run check:python` (never on Vercel — the plan is explicit that authoring-time Python
// checks stay local and every `.out`/`.err` they prove is committed so the Vercel build needs no
// Python at all).
//
// G-PY-38 (static 3.8 check): every `.py` file next to a lesson, and every fenced ```python
// block inside every lesson .mdx, is checked with three complementary tools under PyPy 3.8 — a
// file only needs one of them to object to be 3.8-incompatible:
//   - `ruff check --target-version py38`  (syntax + a wide rule set)
//   - `vermin -t=3.8- --eval-annotations --violations`  (API/feature-version detection)
//   - `pypy38 -m py_compile`  (the actual interpreter's own parser)
// A `bad38` fenced block (``` ```python bad38 ``` ```, brief §4.4 — "this fails on the grader")
// must FAIL at least one of the three; a `bad38` block that passes all three is itself an error
// (plan §4.5: "a bad38 block that passes is itself an error"). Every other source must pass all
// three.
//
// G-PY-RUN (output reproduction): every file-based example with a committed `.out` is run under
// PyPy 3.8 (with its `.in` on stdin, if present) and stdout must match `.out` byte for byte, exit
// code 0. Every example with a committed `.err` (our convention for `expectError`,
// lib/content/code-block-data.ts) is run the same way and must exit non-zero with stderr matching
// `.err` byte for byte. `npm run gen:outputs` (this directory's gen-outputs.ts) regenerates both.
//
// `--scope <substring>` restricts both gates to files whose path contains it (a module id such as
// `M4.13`, or a module folder name).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(APP_ROOT, "..");
const TOOLING_BIN = path.join(REPO_ROOT, ".tooling", "bin");
const RUFF = path.join(TOOLING_BIN, "ruff");
const VERMIN = path.join(TOOLING_BIN, "vermin");
const PYPY38 = path.join(TOOLING_BIN, "pypy38");
const SCRATCH_DIR = path.join(APP_ROOT, ".pycheck-scratch");

const scopeIndex = process.argv.indexOf("--scope");
const SCOPE = scopeIndex !== -1 ? process.argv[scopeIndex + 1] : undefined;

interface Finding {
  gate: "G-PY-38" | "G-PY-RUN";
  file: string;
  message: string;
}
const findings: Finding[] = [];
function fail(gate: Finding["gate"], file: string, message: string) {
  findings.push({ gate, file, message });
}
function rel(p: string): string {
  return path.relative(APP_ROOT, p);
}

// `--root=<dir>` points at a single isolated content root instead of content/ +
// tests/fixtures/content/ (used by the G-PY-38/G-PY-RUN gate fixtures, mirroring
// scripts/gates/content-check.ts's own `--root`).
const rootArg = process.argv.find((a) => a.startsWith("--root="));
const CONTENT_ROOTS = rootArg
  ? [path.resolve(APP_ROOT, rootArg.slice("--root=".length))]
  : [path.join(APP_ROOT, "content"), path.join(APP_ROOT, "tests", "fixtures", "content")].filter(
      (r) => fs.existsSync(r),
    );

function walk(dir: string, out: string[], predicate: (f: string) => boolean) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // `visuals/` holds `.viz.py` recorder scripts (vizrec authoring tooling, checked by G-VIZ's
    // own check:viz, not shown to a learner) — out of scope for G-PY-38/G-PY-RUN, which are about
    // code the lesson actually displays or runs as a teaching example (plan §4.5, §4.6.2).
    if (entry.isDirectory() && entry.name === "visuals") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, predicate);
    else if (predicate(full)) out.push(full);
  }
}

function inScope(file: string): boolean {
  return !SCOPE || file.includes(SCOPE);
}

// --- G-PY-38: run the three tools against one source file, return which (if any) rejected it ---

interface ToolResult {
  tool: string;
  ok: boolean;
  output: string;
}

function runTool(bin: string, args: string[]): ToolResult {
  const tool = path.basename(bin);
  try {
    const output = execFileSync(bin, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { tool, ok: true, output };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return { tool, ok: false, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

function check38(file: string): ToolResult[] {
  return [
    runTool(RUFF, ["check", "--target-version", "py38", file]),
    runTool(VERMIN, ["-t=3.8-", "--eval-annotations", "--violations", file]),
    runTool(PYPY38, ["-m", "py_compile", file]),
  ];
}

function checkSource(file: string, variant: "normal" | "bad38", displayName: string) {
  const results = check38(file);
  const allPass = results.every((r) => r.ok);
  if (variant === "bad38") {
    if (allPass) {
      fail(
        "G-PY-38",
        displayName,
        "bad38 block passes ruff, vermin and py_compile — it must fail at least one",
      );
    }
    return;
  }
  for (const r of results) {
    if (!r.ok) {
      fail(
        "G-PY-38",
        displayName,
        `${r.tool} rejected this Python 3.8 source:\n${r.output.trim()}`,
      );
    }
  }
}

// --- collect file-based examples -----------------------------------------------------------------

interface FileExample {
  py: string;
  in?: string;
  out?: string;
  err?: string;
}

function findFileExamples(): FileExample[] {
  const pyFiles: string[] = [];
  for (const root of CONTENT_ROOTS) {
    walk(root, pyFiles, (f) => f.endsWith(".py"));
  }
  return pyFiles.filter(inScope).map((py) => {
    const stem = py.replace(/\.py$/, "");
    return {
      py,
      in: fs.existsSync(`${stem}.in`) ? `${stem}.in` : undefined,
      out: fs.existsSync(`${stem}.out`) ? `${stem}.out` : undefined,
      err: fs.existsSync(`${stem}.err`) ? `${stem}.err` : undefined,
    };
  });
}

// --- collect fenced ```python blocks from every lesson ------------------------------------------

interface FencedBlock {
  file: string;
  index: number;
  lang: string;
  variant: "normal" | "bad38";
  code: string;
}

function findFencedBlocks(): FencedBlock[] {
  const mdxFiles: string[] = [];
  for (const root of CONTENT_ROOTS) {
    walk(root, mdxFiles, (f) => f.endsWith(".mdx"));
  }
  const blocks: FencedBlock[] = [];
  for (const file of mdxFiles.filter(inScope)) {
    const text = fs.readFileSync(file, "utf8");
    const re = /```(\w+)?( bad38)?\n([\s\S]*?)```/g;
    let index = 0;
    let m = re.exec(text);
    while (m !== null) {
      const lang = m[1] ?? "text";
      if (lang === "python") {
        blocks.push({
          file,
          index,
          lang,
          variant: m[2] ? "bad38" : "normal",
          code: m[3] ?? "",
        });
        index += 1;
      }
      m = re.exec(text);
    }
  }
  return blocks;
}

// --- G-PY-RUN: run a file-based example and diff its committed .out/.err ------------------------

function runExample(example: FileExample): {
  stdout: string;
  stderr: string;
  status: number | null;
} {
  const dir = path.dirname(example.py);
  const base = path.basename(example.py);
  try {
    const stdout = execFileSync(PYPY38, [base], {
      cwd: dir,
      input: example.in ? fs.readFileSync(example.in) : undefined,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", status: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status: number | null };
    return { stdout: err.stdout ?? "", stderr: err.stderr ?? "", status: err.status };
  }
}

function checkRun(example: FileExample) {
  if (!example.out && !example.err) return;
  const result = runExample(example);
  if (example.out) {
    const expected = fs.readFileSync(example.out, "utf8");
    if (result.status !== 0) {
      fail(
        "G-PY-RUN",
        rel(example.py),
        `expected exit 0 (has a committed .out) but exited ${result.status}; stderr:\n${result.stderr.trim()}`,
      );
    } else if (result.stdout !== expected) {
      fail(
        "G-PY-RUN",
        rel(example.py),
        `stdout does not match the committed .out byte for byte (run \`npm run gen:outputs\` if this is intentional)`,
      );
    }
  }
  if (example.err) {
    const expected = fs.readFileSync(example.err, "utf8");
    if (result.status === 0) {
      fail(
        "G-PY-RUN",
        rel(example.py),
        "expected a non-zero exit (has a committed .err) but it ran cleanly",
      );
    } else if (result.stderr !== expected) {
      fail(
        "G-PY-RUN",
        rel(example.py),
        `stderr does not match the committed .err byte for byte (run \`npm run gen:outputs\` if this is intentional)`,
      );
    }
  }
}

// --- main -----------------------------------------------------------------------------------------

function main() {
  fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  try {
    const fileExamples = findFileExamples();
    for (const example of fileExamples) {
      checkSource(example.py, "normal", rel(example.py));
      checkRun(example);
    }

    const fencedBlocks = findFencedBlocks();
    fencedBlocks.forEach((block, i) => {
      const scratchFile = path.join(SCRATCH_DIR, `block-${i}.py`);
      fs.writeFileSync(scratchFile, block.code, "utf8");
      const displayName = `${rel(block.file)}#python-block-${block.index}`;
      checkSource(scratchFile, block.variant, displayName);
    });

    if (findings.length === 0) {
      console.log(
        `check:python — clean (${fileExamples.length} file example(s), ${fencedBlocks.length} fenced python block(s)).`,
      );
      process.exit(0);
    }
    const byGate = new Map<string, Finding[]>();
    for (const f of findings) byGate.set(f.gate, [...(byGate.get(f.gate) ?? []), f]);
    for (const [gate, list] of byGate) {
      console.log(`\n${gate} (${list.length}):`);
      for (const f of list) console.log(`  ${f.file}: ${f.message}`);
    }
    console.log(`\n${findings.length} finding(s).`);
    process.exit(1);
  } finally {
    fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
  }
}

main();
