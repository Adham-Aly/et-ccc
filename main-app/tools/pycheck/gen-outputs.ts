#!/usr/bin/env node
// tools/pycheck/gen-outputs.ts — `npm run gen:outputs -- --scope <id>` (plan §4.5 G-PY-RUN).
// Runs every file-based example under PyPy 3.8 and overwrites its `.out` (stdout, exit 0
// expected) or `.err` (stderr, non-zero exit expected) next to it. Generated files only — never
// hand-write a `.out`/`.err` (plan §4.6.2: "generated files: never hand-edited").
//
// An example only gets a `.out` or `.err` written if one already exists (i.e. an author has
// already decided, via `<Code showOutput />` / `<Code expectError="...">`, that this example
// shows output or is meant to fail) — this script updates committed files, it does not decide
// which examples show output.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(APP_ROOT, "..");
const PYPY38 = path.join(REPO_ROOT, ".tooling", "bin", "pypy38");

const scopeIndex = process.argv.indexOf("--scope");
const SCOPE = scopeIndex !== -1 ? process.argv[scopeIndex + 1] : undefined;

const CONTENT_ROOTS = [
  path.join(APP_ROOT, "content"),
  path.join(APP_ROOT, "tests", "fixtures", "content"),
].filter((r) => fs.existsSync(r));

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // See check-python.ts: `visuals/` holds vizrec recorder scripts, not shown teaching examples.
    if (entry.isDirectory() && entry.name === "visuals") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (full.endsWith(".py")) out.push(full);
  }
}

function run(pyFile: string): { stdout: string; stderr: string; status: number | null } {
  const dir = path.dirname(pyFile);
  const base = path.basename(pyFile);
  const stem = pyFile.replace(/\.py$/, "");
  const inFile = `${stem}.in`;
  try {
    const stdout = execFileSync(PYPY38, [base], {
      cwd: dir,
      input: fs.existsSync(inFile) ? fs.readFileSync(inFile) : undefined,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", status: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status: number | null };
    return { stdout: err.stdout ?? "", stderr: err.stderr ?? "", status: err.status };
  }
}

function main() {
  const pyFiles: string[] = [];
  for (const root of CONTENT_ROOTS) walk(root, pyFiles);
  const scoped = pyFiles.filter((f) => !SCOPE || f.includes(SCOPE));

  let wroteOut = 0;
  let wroteErr = 0;
  for (const pyFile of scoped) {
    const stem = pyFile.replace(/\.py$/, "");
    const outFile = `${stem}.out`;
    const errFile = `${stem}.err`;
    const hasOut = fs.existsSync(outFile);
    const hasErr = fs.existsSync(errFile);
    if (!hasOut && !hasErr) continue;

    const result = run(pyFile);
    if (hasOut) {
      if (result.status !== 0) {
        console.error(
          `${path.relative(APP_ROOT, pyFile)}: has a committed .out but exited ${result.status} — not overwriting; fix the example first.\n${result.stderr}`,
        );
        process.exitCode = 1;
        continue;
      }
      fs.writeFileSync(outFile, result.stdout, "utf8");
      wroteOut += 1;
    }
    if (hasErr) {
      if (result.status === 0) {
        console.error(
          `${path.relative(APP_ROOT, pyFile)}: has a committed .err but ran cleanly — not overwriting; fix the example first.`,
        );
        process.exitCode = 1;
        continue;
      }
      fs.writeFileSync(errFile, result.stderr, "utf8");
      wroteErr += 1;
    }
  }
  console.log(
    `gen:outputs: wrote ${wroteOut} .out file(s) and ${wroteErr} .err file(s) from ${scoped.length} example(s) considered.`,
  );
}

main();
