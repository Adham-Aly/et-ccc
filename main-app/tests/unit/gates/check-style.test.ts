// tests/unit/gates/check-style.test.ts — proves G-STYLE (tools/style/check-style.mjs) fails on
// its fixture (a hard-category "tier1" AI-tell word, plus a too-high Flesch-Kincaid grade for a
// Stage 0 lesson) and passes clean on the real content tree (plan §7).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");
const SCRIPT = path.join(mainAppRoot, "tools", "style", "check-style.mjs");

interface RunResult {
  status: number;
  output: string;
}

function run(args: string[]): RunResult {
  try {
    const output = execFileSync(process.execPath, [SCRIPT, ...args], {
      cwd: mainAppRoot,
      encoding: "utf8",
    });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { status: err.status, output: `${err.stdout}\n${err.stderr}` };
  }
}

describe("style:check gate fixture", () => {
  it("fails on a hard-category AI-tell word and an over-grade Stage 0 lesson", () => {
    const { status, output } = run(["--root=tests/fixtures/gates/G-STYLE"]);
    expect(status).toBe(1);
    expect(output).toContain('hard category "tier1"');
    expect(output).toContain("Flesch-Kincaid grade");
  });

  it("passes (exit 0) on the real content tree, with no hard-category errors", () => {
    const { status, output } = run([]);
    expect(status).toBe(0);
    expect(output).not.toContain("[error]");
  });
});
