import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { stateOf } from "../../../lib/viz/schema";
import { validateVisualFile, validateVisualText } from "../../../lib/viz/validate";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const demo = (f: string) => path.join(appRoot, "app", "dev", "viz", f);

const frames = (over: Record<string, unknown> = {}, step: Record<string, unknown> = {}) =>
  JSON.stringify({
    schema: 1,
    kind: "frames",
    id: "t",
    layout: "single",
    panels: [{ id: "a", viz: "ArrayViz" }],
    alt: "An array of three numbers, scanned from left to right.",
    presets: [
      {
        id: "p",
        label: "Preset",
        steps: [
          {
            caption: "The scan starts at the first number.",
            panels: { a: { values: [1, 2, 3], states: "c.." } },
            ...step,
          },
        ],
      },
    ],
    ...over,
  });

describe("visual file schemas", () => {
  it("accepts a well-formed frames file", () => {
    expect(validateVisualText(frames(), "frames").ok).toBe(true);
  });

  it("rejects unknown fields, unknown panels and bad state codes", () => {
    expect(validateVisualText(frames({ colour: "red" }), "frames").ok).toBe(false);
    const wrongPanel = frames({}, { panels: { b: { values: [1] } } });
    expect(validateVisualText(wrongPanel, "frames").ok).toBe(false);
    const badState = frames({}, { panels: { a: { values: [1, 2, 3], states: "cz." } } });
    expect(validateVisualText(badState, "frames").ok).toBe(false);
  });

  it("rejects more than three presets", () => {
    const one = JSON.parse(frames()).presets[0];
    const four = frames({ presets: [1, 2, 3, 4].map((i) => ({ ...one, id: `p${i}` })) });
    expect(validateVisualText(four, "frames").ok).toBe(false);
  });

  it("requires the id to equal the file name", () => {
    const res = validateVisualText(frames(), "frames", "/x/other.frames.json");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join()).toMatch(/must equal the file name/);
  });

  it("returns a parse error instead of throwing", () => {
    const res = validateVisualText("{", "frames");
    expect(res.ok).toBe(false);
    expect(validateVisualFile("/no/such/file.txt").ok).toBe(false);
  });

  it("validates the committed demo visuals and their configs", () => {
    for (const f of [
      "visuals/bfs-demo.frames.json",
      "visuals/bfs-demo.viz.yaml",
      "examples/trace_demo.trace.json",
      "examples/trace_demo.trace.yaml",
    ]) {
      const res = validateVisualFile(demo(f));
      expect(res.ok, `${f}: ${res.ok ? "" : res.errors.join("; ")}`).toBe(true);
    }
  });

  it("maps state codes to state names", () => {
    expect(stateOf("q")).toBe("frontier");
    expect(stateOf("#")).toBe("wall");
    expect(stateOf("?")).toBe("none");
  });

  it("keeps a small committed file", () => {
    expect(fs.statSync(demo("visuals/bfs-demo.frames.json")).size).toBeLessThan(150_000);
  });
});
