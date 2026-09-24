// tools/viz/trace.py under PyPy 3.8: a bug in the tracer must fail the run, never pass as an error
// raised by the traced program (it once did, and a trace silently ended after two steps).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PYPY = path.resolve(appRoot, "..", ".tooling", "bin", "pypy38");

function py(code: string): string {
  return execFileSync(PYPY, ["-c", code], {
    cwd: path.join(appRoot, "tools", "viz"),
    encoding: "utf8",
  });
}

describe("trace.py", () => {
  it("fails loudly on an internal error, even inside the program's own try/except", () => {
    const out = py(
      [
        "import trace as T",
        "def boom(self, *a):",
        "    raise KeyError('x')",
        "T.Tracer.caption = boom",
        "try:",
        "    T.trace_preset('x = 1\\ntry:\\n    y = 2\\nexcept Exception:\\n    pass\\n', '', {})",
        "    print('NOT RAISED')",
        "except T.TraceError as e:",
        "    print('raised', str(e).splitlines()[0])",
      ].join("\n"),
    );
    expect(out.trim()).toBe("raised internal tracer error: KeyError('x')");
  }, 30_000);

  it("marks names and values as caption code", () => {
    const out = py(
      [
        "import trace as T",
        "steps = T.trace_preset('total = 0\\ntotal = total + 5\\nprint(total)\\n', '', {})",
        "print('\\n'.join(s['c'] for s in steps))",
      ].join("\n"),
    );
    expect(out).toContain("`total` changes from `0` to `5`.");
    expect(out).toContain("it prints `5`.");
  }, 30_000);
});
