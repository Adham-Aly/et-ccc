import { describe, expect, it } from "vitest";
import { buildScene, SCENE_NAMES } from "../../../components/viz/scenes";
import { validateVisualText } from "../../../lib/viz/validate";

const PROPS: Record<string, unknown> = {
  "stdin-flow": {
    lines: ["5", "red green", "hi"],
    reads: [
      { name: "n", as: "int" },
      { name: "w", as: "split" },
    ],
  },
  "how-judging-works": { verdicts: ["AC", "WA", "TLE"] },
  "growth-rates": { curves: ["n", "n2"], points: [2, 4, 8], yMax: 64 },
};

describe("scenes", () => {
  it.each(SCENE_NAMES)("%s builds a valid frames file", (name) => {
    const built = buildScene(name, PROPS[name]);
    const text = JSON.stringify({ schema: 1, kind: "frames", id: "scene", ...built });
    const res = validateVisualText(text, "frames");
    expect(res.ok, res.ok ? "" : res.errors.join("; ")).toBe(true);
    for (const p of built.presets) {
      expect(p.steps.length).toBeGreaterThan(1);
      for (const s of p.steps) expect(s.caption.length).toBeGreaterThan(11);
    }
  });

  it("rejects unknown scenes and bad props with a clear message", () => {
    expect(() => buildScene("bubble-sort", {})).toThrow(/unknown scene/);
    expect(() => buildScene("how-judging-works", { verdicts: ["OK"] })).toThrow(/verdicts/);
    expect(() =>
      buildScene("stdin-flow", { lines: ["abc"], reads: [{ name: "n", as: "int" }] }),
    ).toThrow(/not an int/);
    expect(() =>
      buildScene("growth-rates", { curves: ["n", "n2"], points: [4, 2], yMax: 9 }),
    ).toThrow(/increase/);
  });

  it("stdin-flow shows Python's values: int, list of str, str", () => {
    const built = buildScene("stdin-flow", PROPS["stdin-flow"]);
    const last = built.presets[0]?.steps.at(-1)?.panels.io as { vars: [string, string][] };
    expect(last.vars).toEqual([
      ["n", "5"],
      ["w", "['red', 'green']"],
    ]);
  });
});
