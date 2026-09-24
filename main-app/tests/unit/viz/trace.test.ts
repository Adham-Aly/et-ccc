import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MAX_NATURAL_WIDTH } from "../../../lib/viz/geometry";
import { layoutTrace } from "../../../lib/viz/layout-trace";
import type { TraceFile } from "../../../lib/viz/schema";
import { expandTraceFile, maxOutputLines } from "../../../lib/viz/trace";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const file = JSON.parse(
  fs.readFileSync(path.join(appRoot, "app/dev/viz/examples/trace_demo.trace.json"), "utf8"),
) as TraceFile;
const [two, three] = expandTraceFile(file);

describe("expandTrace (trace_demo.py)", () => {
  it("expands every preset step", () => {
    expect(two?.length).toBe(file.presets[0]?.steps.length);
    expect(three?.length).toBe(file.presets[1]?.steps.length);
  });

  it("shows aliasing: nums and same refer to one list", () => {
    const s = two?.find((st) => st.stack[0]?.v.some(([n]) => n === "same"));
    const globals = new Map(s?.stack[0]?.v);
    expect(globals.get("same")).toEqual(globals.get("nums"));
  });

  it("stacks one frame per recursive call", () => {
    const deepest = (states: typeof two) => Math.max(...(states ?? []).map((s) => s.stack.length));
    expect(deepest(two)).toBe(1 + 3); // countdown(2), (1), (0)
    expect(deepest(three)).toBe(1 + 4);
  });

  it("accumulates output and ends with the program's printout", () => {
    expect(two?.at(-1)?.output).toBe("10\n[2, 1, 0]\n");
    expect(three?.at(-1)?.output).toBe("10\n[3, 2, 1, 0]\n");
    expect(maxOutputLines(two ?? [])).toBe(2);
  });

  it("marks what changed and where the previous line was", () => {
    expect(two?.[0]?.prevLine).toBeNull();
    const withChange = two?.filter((s) => s.changedVars.size > 0) ?? [];
    expect(withChange.length).toBeGreaterThan(5);
    for (const s of two ?? []) expect(s.caption.length).toBeGreaterThan(11);
  });

  it("lays out within the phone width with finite coordinates", () => {
    for (const scene of layoutTrace(three ?? [])) {
      expect(scene.width).toBeLessThanOrEqual(MAX_NATURAL_WIDTH);
      for (const it of scene.items) {
        if ("x" in it) expect(Number.isFinite(it.x)).toBe(true);
        if ("y" in it) expect(Number.isFinite(it.y)).toBe(true);
      }
    }
  });
});
