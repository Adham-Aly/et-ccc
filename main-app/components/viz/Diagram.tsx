import { unionSize, type VizScene } from "@/lib/viz/geometry";
import { layoutPanel } from "@/lib/viz/layout";
import {
  FRAME_SCHEMAS,
  type FrameByViz,
  PANEL_VIZ,
  type PanelSpec,
  type PanelVizName,
} from "@/lib/viz/schema";
import { FigureShell } from "./FigureShell";
import type { FigureInfo } from "./figure-context";
import { loadFrames, presetIndex } from "./load";
import { FramesStage } from "./player/FramesStage";
import { Legend } from "./player/Legend";
import { legendStates, prepareFrames } from "./player/prepare";

export interface DiagramProps {
  /** Inline form: a panel visualizer name and one frame of its data. */
  viz?: string;
  data?: unknown;
  /** File form: one step of a frames file (`visuals/<name>.frames.json`). */
  frames?: string;
  preset?: string;
  /** 0-based step index in the file form (default 0). */
  step?: number;
  /** Panel title for the inline form. */
  title?: string;
  baseDir?: string;
  figure?: FigureInfo;
}

/** A static picture from any visualizer: pure server-rendered SVG, no JavaScript. */
export function Diagram({
  viz,
  data,
  frames,
  preset,
  step = 0,
  title,
  baseDir,
  figure,
}: DiagramProps) {
  let panels: PanelSpec[];
  let layout: "single" | "row";
  let scenes: VizScene[];
  let boxes: { width: number; height: number }[];
  let alt = figure?.alt;
  if (frames !== undefined) {
    const file = loadFrames(baseDir, frames);
    const ip = presetIndex(file.presets, preset, frames);
    const prepared = prepareFrames(file);
    if (step < 0 || step >= (file.presets[ip]?.steps.length ?? 0))
      throw new Error(`${frames}: no step ${step}`);
    panels = file.panels;
    layout = file.layout;
    scenes = prepared.map((p) => p.scenes[ip]?.[step]).filter((s) => s !== undefined);
    boxes = scenes.map((s) => ({ width: s.width, height: s.height }));
    alt ??= file.alt;
  } else {
    if (!viz || !(PANEL_VIZ as readonly string[]).includes(viz)) {
      throw new Error(`<Diagram viz="${viz}">: viz must be one of ${PANEL_VIZ.join(", ")}`);
    }
    const name = viz as PanelVizName;
    const parsed = FRAME_SCHEMAS[name].safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `<Diagram viz="${viz}">: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    panels = [{ id: "d", viz: name, ...(title ? { title } : {}) }];
    layout = "single";
    scenes = layoutPanel(name, [parsed.data as FrameByViz[typeof name]]);
    boxes = [unionSize(scenes)];
  }
  if (!alt)
    throw new Error(
      'A Diagram needs a text alternative: <Figure alt="…"> (or the frames file\'s alt)',
    );
  return (
    <FigureShell kind="diagram" figure={figure} alt={alt}>
      <div className="vz-frame vz-static">
        <FramesStage layout={layout} panels={panels} scenes={scenes} boxes={boxes} stepLabel="" />
        <Legend states={legendStates(scenes)} />
      </div>
    </FigureShell>
  );
}
