// lib/content/code-block-data.ts — resolves a `<Code>` MDX tag's file/lines/highlight/.in/.out/
// expectError props into the raw strings W2's `CodeBlock` component (components/content) takes
// (plan §4.4, brief §4, requests.md "Batch 2" #2: "you pass raw strings, I highlight").
import fs from "node:fs";
import path from "node:path";

export interface CodeBlockData {
  code: string;
  lang: string;
  filename?: string;
  highlight?: number[];
  startLine?: number;
  caption?: string;
  variant: "normal" | "bad38";
  input?: string;
  output?: string;
  error?: { type: string; traceback: string };
}

/**
 * Resolves `file` (an MDX author's `<Code file="…">`/`<Output file="…">` prop) against
 * `moduleDir` and rejects anything that escapes it — `../../../etc/passwd` or an absolute path
 * would otherwise let a lesson read any file the server process can (design-review.md A1-4:
 * "OutputTag must reject any file that resolves outside the module dir"; the same risk exists
 * for `<Code file>`, fixed here once for both call sites).
 */
export function resolveModulePath(moduleDir: string, file: string): string {
  const root = path.resolve(moduleDir);
  const resolved = path.resolve(root, file);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(
      `"${file}" resolves outside its module directory (${moduleDir}) — path traversal is not allowed`,
    );
  }
  return resolved;
}

function parseLineRange(lines: string | undefined, sourceLineCount: number): [number, number] {
  if (!lines) return [1, sourceLineCount];
  const m = lines.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`<Code lines="${lines}"> must look like "3" or "1-5"`);
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : start;
  return [start, end];
}

function parseHighlight(highlight: string | undefined): number[] | undefined {
  if (!highlight) return undefined;
  return highlight.split(",").map((s) => {
    const n = Number(s.trim());
    if (!Number.isInteger(n) || n < 1)
      throw new Error(`<Code highlight="${highlight}"> is not a comma list of line numbers`);
    return n;
  });
}

/**
 * Resolves `<Code file="examples/x.py" lines="1-5" highlight="3,4" caption="…" showOutput
 * expectError="IndexError" />` against the lesson's module directory. `.out` is required when
 * `showOutput` is set; `.err` (committed traceback text, our convention — plan §4.4 doesn't name
 * one) is required when `expectError` is set.
 */
export function resolveFileCodeBlock(
  moduleDir: string,
  props: {
    file: string;
    lines?: string;
    highlight?: string;
    caption?: string;
    showOutput?: boolean;
    expectError?: string;
  },
): CodeBlockData {
  const filePath = resolveModulePath(moduleDir, props.file);
  const fullSource = fs.readFileSync(filePath, "utf8").replace(/\n$/, "");
  const sourceLines = fullSource.split("\n");
  const [start, end] = parseLineRange(props.lines, sourceLines.length);
  const code = sourceLines.slice(start - 1, end).join("\n");
  const highlight = parseHighlight(props.highlight);

  const stem = filePath.replace(/\.py$/, "");
  let input: string | undefined;
  let output: string | undefined;
  let error: { type: string; traceback: string } | undefined;

  if (fs.existsSync(`${stem}.in`)) {
    input = fs.readFileSync(`${stem}.in`, "utf8");
  }
  if (props.showOutput) {
    if (!fs.existsSync(`${stem}.out`)) {
      throw new Error(`<Code file="${props.file}" showOutput /> needs a committed ${stem}.out`);
    }
    output = fs.readFileSync(`${stem}.out`, "utf8");
  }
  if (props.expectError) {
    if (!fs.existsSync(`${stem}.err`)) {
      throw new Error(
        `<Code file="${props.file}" expectError="${props.expectError}" /> needs a committed ${stem}.err`,
      );
    }
    error = { type: props.expectError, traceback: fs.readFileSync(`${stem}.err`, "utf8") };
  }

  return {
    code,
    lang: "python",
    filename: props.file,
    highlight,
    startLine: start,
    caption: props.caption,
    variant: "normal",
    input,
    output,
    error,
  };
}

/** For a fenced code block converted by remark-fenced-code.ts: raw text + lang + variant only. */
export function fencedCodeBlock(
  text: string,
  lang: string,
  variant: "normal" | "bad38",
): CodeBlockData {
  return { code: text.replace(/\n$/, ""), lang, variant };
}
