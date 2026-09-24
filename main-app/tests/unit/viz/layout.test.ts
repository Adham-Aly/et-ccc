// Layout functions over the gallery samples: finite geometry, unique stable keys, phone-width
// panels and a fixed box across steps (plan §4.11: no layout shift between steps).
import { describe, expect, it } from "vitest";
import * as S from "../../../components/viz/gallery/samples";
import { MAX_NATURAL_WIDTH, textWidth, unionSize, type VizScene } from "../../../lib/viz/geometry";
import { LAYOUTS, layoutTree } from "../../../lib/viz/layout";
import type { FrameByViz } from "../../../lib/viz/schema";

const SAMPLES: { [K in keyof FrameByViz]?: FrameByViz[K][] } = {
  ArrayViz: [S.arrayStates, S.arrayCompare, S.arrayCircular],
  GridViz: [S.gridStates, S.gridPlain],
  GraphViz: [S.graphStates, S.graphDirected],
  TreeViz: [S.treeStates],
  TableViz: [S.tableStates],
  StructViz: [S.structStack, S.structQueue, S.structDeque, S.structHeap, S.structMap, S.structSet],
  LineViz: [S.lineStates, S.lineWheel],
  PlotViz: [S.plotStates],
};

function checkScene(scene: VizScene, label: string) {
  expect(scene.width, label).toBeGreaterThan(0);
  expect(scene.width, label).toBeLessThanOrEqual(MAX_NATURAL_WIDTH);
  const keys = scene.items.map((i) => i.key);
  expect(new Set(keys).size, `${label}: duplicate keys`).toBe(keys.length);
  for (const it of scene.items) {
    for (const [k, v] of Object.entries(it)) {
      if (typeof v === "number") expect(Number.isFinite(v), `${label} ${it.key}.${k}`).toBe(true);
    }
    if ("x" in it && typeof it.x === "number") {
      expect(it.x, `${label} ${it.key}`).toBeGreaterThanOrEqual(0);
      expect(it.x, `${label} ${it.key}`).toBeLessThanOrEqual(scene.width);
    }
  }
}

describe("panel layouts", () => {
  for (const [viz, frames] of Object.entries(SAMPLES)) {
    it(`${viz}: every sample lays out cleanly`, () => {
      const layout = LAYOUTS[viz as keyof FrameByViz] as (f: unknown[]) => VizScene[];
      frames?.forEach((f, i) => {
        const [scene] = layout([f]);
        expect(scene).toBeDefined();
        checkScene(scene as VizScene, `${viz}[${i}]`);
      });
    });
  }

  it("lays out many frames with one shared box", () => {
    const scenes = LAYOUTS.ArrayViz([S.arrayStates, { values: [1, 2] }]);
    const box = unionSize(scenes);
    expect(box.width).toBeGreaterThanOrEqual(scenes[0]?.width ?? 0);
    expect(box.height).toBeGreaterThanOrEqual(scenes[1]?.height ?? 0);
  });

  it("keeps tree node positions stable when later steps add children", () => {
    const small = { root: { id: "r", label: "f(2)", children: [{ id: "a", label: "f(1)" }] } };
    const [s1, s2] = layoutTree([small, S.treeStates]);
    const pos = (s: VizScene | undefined, key: string) => {
      const it = s?.items.find((i) => i.key === key);
      return it && "x" in it ? [it.x, it.y] : null;
    };
    expect(pos(s1, "nr")).not.toBeNull();
    expect(pos(s1, "nr")).toEqual(pos(s2, "nr"));
    expect(pos(s1, "na")).toEqual(pos(s2, "na"));
  });
});

describe("text measurement", () => {
  it("measures mono values wider per character than sans labels", () => {
    expect(textWidth("mmmm", "value")).toBeGreaterThan(textWidth("mmmm", "label"));
    expect(textWidth("", "value")).toBe(0);
  });
});
