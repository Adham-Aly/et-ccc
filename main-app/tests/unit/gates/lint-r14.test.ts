// tests/unit/gates/lint-r14.test.ts — proves G-R14 (scripts/gates/lint-r14.mjs) fails on its
// fixture (a score-ceiling/target phrase, a "x/75" fraction, and a "walkthrough is available"
// phrase) while a legitimate allow-listed phrase in the same fixture ("average of the array")
// passes, and the real tree stays clean (plan §7, §6.5).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");
const SCRIPT = path.join(mainAppRoot, "scripts", "gates", "lint-r14.mjs");

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

describe("lint:r14 gate fixture", () => {
  it("fails on score-ceiling, x/75 and solution-exists-elsewhere phrases", () => {
    const { status, output } = run(["--root=tests/fixtures/gates/G-R14"]);
    expect(status).toBe(1);
    expect(output).toContain("score-ceiling-target");
    expect(output).toContain("fraction-75");
    expect(output).toContain("solution-exists-elsewhere");
  });

  it("fails on a Python download-page link (design-review.md A1-3, C21: no setup content)", () => {
    const { output } = run(["--root=tests/fixtures/gates/G-R14"]);
    expect(output).toContain("python-download-link");
  });

  it('does not flag the allow-listed "average of the array" in the same fixture', () => {
    const { output } = run(["--root=tests/fixtures/gates/G-R14"]);
    expect(output).not.toContain("average of the array");
  });

  it("passes clean on the real content and app source tree", () => {
    const { status, output } = run([]);
    expect(status).toBe(0);
    expect(output).toContain("clean");
  });
});
