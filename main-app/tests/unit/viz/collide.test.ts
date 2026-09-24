// tests/unit/viz/collide.test.ts: the collision check (lib/viz/collide.ts, G-VIZ rule "collision")
// catches overlapping labels, labels across shape edges and values crowding their own shape, and
// every gallery sample and built-in scene lays out with none of them.
import { describe, expect, it } from "vitest";
import * as S from "../../../components/viz/gallery/samples";
import { buildScene, SCENE_NAMES } from "../../../components/viz/scenes";
import { CLEAR, collisions } from "../../../lib/viz/collide";
import {
  MAX_NATURAL_WIDTH,
  unionSize,
  type VizItem,
  type VizScene,
} from "../../../lib/viz/geometry";
import { LAYOUTS } from "../../../lib/viz/layout";

const scene = (items: VizItem[]): VizScene => ({ width: 300, height: 200, items }) as VizScene;

describe("collisions()", () => {
  it("reports two labels that overlap", () => {
    const out = collisions(
      scene([
        { key: "a", t: "text", x: 50, y: 50, text: "left_end", role: "label", anchor: "middle" },
        { key: "b", t: "text", x: 70, y: 52, text: "right_end", role: "label", anchor: "middle" },
      ] as VizItem[]),
    );
    expect(out).toEqual([`label "left_end" (a) overlaps label "right_end" (b)`]);
  });

  it("reports a label that crosses a cell edge", () => {
    const out = collisions(
      scene([
        { key: "c0", t: "cell", x: 40, y: 40, w: 40, h: 40, text: "7" },
        { key: "t", t: "text", x: 40, y: 40, text: "note", role: "label", anchor: "middle" },
      ] as VizItem[]),
    );
    expect(out).toEqual([`label "note" (t) crosses the edge of c0`]);
  });

  it("reports a label that crosses a node circle", () => {
    const out = collisions(
      scene([
        { key: "n0", t: "node", cx: 100, cy: 100, r: 18, text: "A" },
        { key: "t", t: "text", x: 100, y: 118, text: "dist", role: "label", anchor: "middle" },
      ] as VizItem[]),
    );
    expect(out).toContain(`label "dist" (t) crosses the edge of n0`);
  });

  it(`reports a value with less than ${CLEAR} units to its own edge`, () => {
    const out = collisions(
      scene([
        { key: "c0", t: "cell", x: 0, y: 0, w: 30, h: 34, text: "12345" },
        { key: "n0", t: "node", cx: 100, cy: 100, r: 16, text: "999" },
      ] as VizItem[]),
    );
    expect(out.some((m) => m.startsWith(`"12345" in c0`))).toBe(true);
    expect(out.some((m) => m.startsWith(`"999" in n0`))).toBe(true);
  });

  it("accepts text inside its own cell and labels clear of shapes", () => {
    const out = collisions(
      scene([
        { key: "c0", t: "cell", x: 0, y: 0, w: 40, h: 40, text: "7" },
        { key: "x0", t: "text", x: 20, y: 56, text: "0", role: "label", anchor: "middle" },
      ] as VizItem[]),
    );
    expect(out).toEqual([]);
  });
});

const SAMPLES: [keyof typeof LAYOUTS, keyof typeof S][] = [
  ["ArrayViz", "arrayStates"],
  ["ArrayViz", "arrayCompare"],
  ["ArrayViz", "arrayCircular"],
  ["GridViz", "gridStates"],
  ["GridViz", "gridPlain"],
  ["GraphViz", "graphStates"],
  ["GraphViz", "graphDirected"],
  ["TreeViz", "treeStates"],
  ["TableViz", "tableStates"],
  ["StructViz", "structStack"],
  ["StructViz", "structQueue"],
  ["StructViz", "structDeque"],
  ["StructViz", "structHeap"],
  ["StructViz", "structMap"],
  ["StructViz", "structSet"],
  ["LineViz", "lineStates"],
  ["LineViz", "lineWheel"],
  ["PlotViz", "plotStates"],
];

type AnyLayout = (frames: unknown[]) => VizScene[];

describe("gallery samples and scenes have no collisions", () => {
  it("covers every gallery sample", () => {
    expect(SAMPLES.map(([, n]) => n).sort()).toEqual(Object.keys(S).sort());
  });

  it.each(SAMPLES)("%s %s", (viz, name) => {
    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: test code walks every sample by name
    const scenes = (LAYOUTS[viz] as unknown as AnyLayout)([S[name]]);
    expect(scenes.flatMap(collisions)).toEqual([]);
  });

  // The gallery's props (app/dev/viz) and a second, smaller set per scene.
  const PROPS: Record<string, unknown[]> = {
    "stdin-flow": [
      {
        lines: ["5", "red green blue", "hello"],
        reads: [{ name: "n", as: "int" }, { name: "words", as: "split" }, { name: "word" }],
      },
      {
        lines: ["5", "red green", "hi"],
        reads: [
          { name: "n", as: "int" },
          { name: "w", as: "split" },
        ],
      },
    ],
    "how-judging-works": [{ verdicts: ["AC", "WA", "TLE"] }, { verdicts: ["AC"] }],
    "growth-rates": [
      { curves: ["n", "nlogn", "n2"], points: [2, 4, 8, 16, 32], yMax: 300 },
      { curves: ["n", "nlogn", "n2"], points: [2, 4, 8, 16, 32], yMax: 64 },
      { curves: ["n", "n2"], points: [2, 4, 8], yMax: 64 },
    ],
  };

  it.each(SCENE_NAMES)("scene %s", (name) => {
    for (const props of PROPS[name] ?? []) {
      const built = buildScene(name, props);
      for (const panel of built.panels) {
        const frames = built.presets.flatMap((p) => p.steps.map((s) => s.panels[panel.id]));
        const scenes = (LAYOUTS[panel.viz] as unknown as AnyLayout)(frames);
        expect(scenes.flatMap(collisions)).toEqual([]);
        // Scenes have no check:viz pass, so the 390 px text-size width limit is held here too.
        expect(unionSize(scenes).width).toBeLessThanOrEqual(MAX_NATURAL_WIDTH);
      }
    }
  });

  it("has props for every scene", () => {
    expect(Object.keys(PROPS).sort()).toEqual([...SCENE_NAMES].sort());
  });
});
