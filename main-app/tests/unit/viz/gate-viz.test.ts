// tests/unit/viz/gate-viz.test.ts: proves every G-VIZ rule (tools/viz/check.ts) fails on its own
// fixture under tests/fixtures/gates/G-VIZ/<rule>/, and that a correct visual and the real tree
// pass (plan §7: every gate ships a failing fixture).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = path.join(appRoot, "tools", "viz", "check-viz.ts");
const HOOK = path.join(appRoot, "tools", "viz", "register.mjs");

function run(args: string[]): { status: number; output: string } {
  try {
    const output = execFileSync(process.execPath, ["--import", HOOK, SCRIPT, ...args], {
      cwd: appRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { status: err.status, output: `${err.stdout}\n${err.stderr}` };
  }
}

const fixture = (rule: string) => `--root=tests/fixtures/gates/G-VIZ/${rule}`;

const CASES: [rule: string, expected: RegExp][] = [
  ["schema", /\[schema\].*layout/],
  ["missing", /\[missing\].*scan\.frames\.json/],
  ["stale", /\[stale\].*regeneration differs/],
  ["caption", /\[caption\].*step 1 has no teaching caption/],
  ["alt", /\[alt\].*text alternative/],
  ["consistency", /\[consistency\].*the example printed "6\\n", the visual shows "5\\n"/],
  ["size", /\[size\].*budget 300/],
  ["steps", /\[steps\].*5 steps, budget 3/],
  ["text-size", /\[text-size\].*panel "a" is \d+ units wide/],
  ["library", /\[library\].*raw <svg>/],
  ["orphan", /\[orphan\].*lost\.frames\.json/],
  ["tree-ids", /\[tree-ids\].*node "c\d+" is under/],
];

describe("G-VIZ gate fixtures", () => {
  it.each(CASES)(
    "fails on the %s fixture",
    (rule, expected) => {
      const { status, output } = run([fixture(rule)]);
      expect(status).toBe(1);
      expect(output).toMatch(expected);
      expect(output).toMatch(new RegExp(`\\[${rule}\\]`));
    },
    60_000,
  );

  it("reports every library misuse in one MDX file", () => {
    const { output } = run([fixture("library")]);
    expect(output).toContain("<StepThrough> must sit inside a <Figure>");
    expect(output).toContain("refers to ./nowhere.frames.json, which does not exist");
    expect(output).toContain('<Scene name="bubble-sort"> is not a library scene');
  }, 60_000);

  it("--schema-only skips the PyPy checks (stale and consistency)", () => {
    expect(run([fixture("stale"), "--schema-only"]).status).toBe(0);
    expect(run([fixture("consistency"), "--schema-only"]).status).toBe(0);
    expect(run([fixture("caption"), "--schema-only"]).status).toBe(1);
  }, 60_000);

  it("passes a correct visual", () => {
    const { status, output } = run([fixture("pass")]);
    expect(status).toBe(0);
    expect(output).toContain("1 visual(s), 0 problem(s)");
  }, 60_000);

  it("passes the real tree", () => {
    const { status, output } = run([]);
    expect(output).toMatch(/0 problem\(s\)/);
    expect(status).toBe(0);
  }, 180_000);
});
