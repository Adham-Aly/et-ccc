// tests/unit/content/resolve-module-path.test.ts — design-review.md A1-4: `<Code file>` and
// `<Output file>` resolved an author-supplied path with a plain `path.join(moduleDir, file)`,
// so `file="../../../../etc/passwd"` (or an absolute path) would read outside the lesson's own
// module directory. resolveModulePath() is the shared guard both call sites now use.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveModulePath } from "../../../lib/content/code-block-data";

const moduleDir = path.join(process.cwd(), "tests", "fixtures", "content", "stages");

describe("resolveModulePath", () => {
  it("resolves an ordinary relative path inside the module dir", () => {
    expect(resolveModulePath(moduleDir, "examples/basics.py")).toBe(
      path.join(moduleDir, "examples", "basics.py"),
    );
  });

  it("rejects a ../ path that escapes the module dir", () => {
    expect(() => resolveModulePath(moduleDir, "../../../../etc/passwd")).toThrow(/path traversal/);
  });

  it("rejects an absolute path outside the module dir", () => {
    expect(() => resolveModulePath(moduleDir, "/etc/passwd")).toThrow(/path traversal/);
  });

  it("allows the module dir itself (no file segment)", () => {
    expect(() => resolveModulePath(moduleDir, ".")).not.toThrow();
  });
});
