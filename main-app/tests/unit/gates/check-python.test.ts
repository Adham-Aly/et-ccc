// tests/unit/gates/check-python.test.ts — proves G-PY-38 and G-PY-RUN (tools/pycheck/check-python.ts)
// both fail on their fixtures and pass on the real (currently empty) content tree (plan §7).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");
const SCRIPT = path.join(mainAppRoot, "tools", "pycheck", "check-python.ts");
const REGISTER_HOOK = path.join(mainAppRoot, "tools", "viz", "register.mjs");

interface RunResult {
  status: number;
  output: string;
}

function run(args: string[]): RunResult {
  try {
    const output = execFileSync(process.execPath, ["--import", REGISTER_HOOK, SCRIPT, ...args], {
      cwd: mainAppRoot,
      encoding: "utf8",
    });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { status: err.status, output: `${err.stdout}\n${err.stderr}` };
  }
}

describe("check:python gate fixtures", () => {
  it("G-PY-38 fails on a non-bad38 3.9+ block and on a bad38 block that is actually valid 3.8", () => {
    const { status, output } = run(["--root=tests/fixtures/gates/G-PY-38"]);
    expect(status).toBe(1);
    expect(output).toContain("G-PY-38");
    expect(output).toMatch(/rejected this Python 3\.8 source/);
    expect(output).toContain("bad38 block passes ruff, vermin and py_compile");
  }, 30_000);

  it("G-PY-RUN fails when stdout does not match the committed .out byte for byte", () => {
    const { status, output } = run(["--root=tests/fixtures/gates/G-PY-RUN"]);
    expect(status).toBe(1);
    expect(output).toContain("G-PY-RUN");
    expect(output).toContain("does not match the committed .out");
  }, 30_000);

  it("passes clean on the real content tree", () => {
    const { status, output } = run([]);
    expect(status).toBe(0);
    expect(output).toContain("clean");
  }, 30_000);
});
