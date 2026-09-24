// Pure preparation shared by the server (first frame) and the client player: lay out every
// frame of every preset once, so each panel has one fixed box (no layout shift).
import { statesIn, unionSize, type VizScene } from "@/lib/viz/geometry";
import { layoutPanel } from "@/lib/viz/layout";
import { layoutTrace } from "@/lib/viz/layout-trace";
import type { FrameByViz, VizState } from "@/lib/viz/schema";
import { expandTrace, maxOutputLines, type TraceState } from "@/lib/viz/trace";
import { LEGEND_ORDER } from "../tokens";
import type { FramesPlayerData, TracePlayerData } from "./types";

export interface PreparedPanel {
  box: { width: number; height: number };
  /** scenes[preset][step] */
  scenes: VizScene[][];
}

export function prepareFrames(data: Pick<FramesPlayerData, "panels" | "presets">): PreparedPanel[] {
  return data.panels.map((panel) => {
    const all = data.presets.flatMap((pr) => pr.steps.map((s) => s.panels[panel.id]));
    const scenes = layoutPanel(panel.viz, all as FrameByViz[typeof panel.viz][]);
    let k = 0;
    const byPreset = data.presets.map((pr) => {
      const part = scenes.slice(k, k + pr.steps.length);
      k += pr.steps.length;
      return part;
    });
    return { box: unionSize(scenes), scenes: byPreset };
  });
}

export interface PreparedTrace {
  states: TraceState[][];
  scenes: VizScene[][];
  box: { width: number; height: number };
  outputLines: number;
}

export function prepareTrace(data: Pick<TracePlayerData, "presets">): PreparedTrace {
  const states = data.presets.map((p) => expandTrace(p.steps));
  const scenes = states.map((s) => layoutTrace(s));
  return {
    states,
    scenes,
    box: unionSize(scenes.flat()),
    outputLines: Math.max(...states.map((s) => maxOutputLines(s))),
  };
}

/** The states a visual uses, in legend order. */
export function legendStates(scenes: VizScene[]): VizState[] {
  const used = new Set<VizState>();
  for (const s of scenes) for (const st of statesIn(s)) used.add(st);
  return LEGEND_ORDER.filter((s) => used.has(s));
}

export function stepLabel(step: number, total: number): string {
  return `step ${step + 1} of ${total}`;
}
