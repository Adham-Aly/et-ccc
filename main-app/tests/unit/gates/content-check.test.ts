// tests/unit/gates/content-check.test.ts — proves each content:check gate (G-SCHEMA, G-LINK-FMT,
// G-LINK-REF, G-LINK-PREF, G-LINK-LIVE, G-PREREQ) both fails on its fixture and passes on the
// real content tree (plan §7: "each gate has a fixture proving it catches what it claims").
//
// Runs the actual script as a subprocess (it needs the Node 24 type-stripping `--import` hook to
// load TypeScript, same as `npm run content:check`) against an isolated `--root=` fixture
// directory under tests/fixtures/gates/<gate-id>/, rather than importing it as a library — the
// script is a CLI, not a set of exported pure functions (unlike G-UI-LIGHT's lint-light.mjs).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");
const SCRIPT = path.join(mainAppRoot, "scripts", "gates", "content-check.ts");
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

function runFixture(gate: string, extra: string[] = []): RunResult {
  return run([`--root=tests/fixtures/gates/${gate}`, `--only=${gate}`, ...extra]);
}

describe("content:check gate fixtures", () => {
  it("G-SCHEMA fails on a forward-reference prereq", () => {
    const { status, output } = runFixture("G-SCHEMA");
    expect(status).toBe(1);
    expect(output).toContain("G-SCHEMA");
    expect(output).toContain("does not come earlier in the course");
  });

  it("G-SCHEMA fails on a lesson MDX file that uses an unknown component (design-review.md A1-4: not just at render time)", () => {
    const { status, output } = runFixture("G-SCHEMA");
    expect(status).toBe(1);
    expect(output).toContain("G-SCHEMA");
    expect(output).toContain("<WalkthroughBox>");
    expect(output).toContain("not in the fixed MDX component map");
  });

  it("G-LINK-FMT fails on a raw judge URL outside the registry code", () => {
    const { status, output } = runFixture("G-LINK-FMT");
    expect(status).toBe(1);
    expect(output).toContain("G-LINK-FMT");
    expect(output).toContain("raw judge domain");
  });

  it("G-LINK-REF fails on a plain-text CCC reference outside a registry component", () => {
    const { status, output } = runFixture("G-LINK-REF");
    expect(status).toBe(1);
    expect(output).toContain("G-LINK-REF");
    expect(output).toContain("2023 S1");
  });

  it("G-LINK-PREF warns (not fails) by default, and fails with --release", () => {
    const warnRun = runFixture("G-LINK-PREF");
    expect(warnRun.status).toBe(0);
    expect(warnRun.output).toContain("G-LINK-PREF");
    expect(warnRun.output).toContain('needs a "why"');

    const releaseRun = runFixture("G-LINK-PREF", ["--release"]);
    expect(releaseRun.status).toBe(1);
    expect(releaseRun.output).toContain("G-LINK-PREF");
  });

  it('G-LINK-LIVE fails hard on a verified.json status of "missing" (no silent fallback)', () => {
    const { status, output } = runFixture("G-LINK-LIVE");
    expect(status).toBe(1);
    expect(output).toContain("G-LINK-LIVE");
    expect(output).toContain('says "missing"');
  });

  it("G-PREREQ fails on a glossary term used before its introducedIn module", () => {
    const { status, output } = runFixture("G-PREREQ");
    expect(status).toBe(1);
    expect(output).toContain("G-PREREQ");
    expect(output).toContain("introducedIn module");
  });

  it("passes (exit 0) on the real content tree, with no hard errors", () => {
    const { status, output } = run([]);
    expect(status).toBe(0);
    expect(output).not.toContain("[error]");
  });
});
