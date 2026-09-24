// tests/unit/gates/print-build-env.test.ts — design-review.md A1-5: `lib/content/env.ts`'s
// `getBuildEnv()` reads `VERCEL_ENV`/`ETCCC_ENV` only at build time, so a wrong assumption there
// would only be discoverable by clicking through a live deploy. This proves
// scripts/gates/print-build-env.ts (run first by prebuild.mjs) actually reports each branch
// getBuildEnv() can take, so the resolved env is visible in the build log itself.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");
const SCRIPT = path.join(mainAppRoot, "scripts", "gates", "print-build-env.ts");
const REGISTER_HOOK = path.join(mainAppRoot, "tools", "viz", "register.mjs");

function run(env: Record<string, string | undefined>): string {
  return execFileSync(process.execPath, ["--import", REGISTER_HOOK, SCRIPT], {
    cwd: mainAppRoot,
    encoding: "utf8",
    env: { ...process.env, VERCEL_ENV: undefined, ETCCC_ENV: undefined, ...env },
  });
}

describe("print-build-env", () => {
  it('reports "production" when VERCEL_ENV=production', () => {
    expect(run({ VERCEL_ENV: "production" })).toContain('resolved build env = "production"');
  });

  it('reports "preview" for a Vercel preview deploy', () => {
    expect(run({ VERCEL_ENV: "preview" })).toContain('resolved build env = "preview"');
  });

  it('reports "production" for a local ETCCC_ENV=production check', () => {
    expect(run({ ETCCC_ENV: "production" })).toContain('resolved build env = "production"');
  });

  it('reports "preview" with neither var set (plain local dev/build)', () => {
    expect(run({})).toContain('resolved build env = "preview"');
  });
});
