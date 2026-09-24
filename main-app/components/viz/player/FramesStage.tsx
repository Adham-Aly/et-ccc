import type { VizItem, VizScene } from "@/lib/viz/geometry";
import type { PanelSpec } from "@/lib/viz/schema";
import { SceneSvg } from "../SceneSvg";

export interface FramesStageProps {
  layout: "single" | "row";
  panels: PanelSpec[];
  /** Per panel: this step's scene and the panel's fixed box. */
  scenes: VizScene[];
  boxes: { width: number; height: number }[];
  stepLabel: string;
  entering?: Set<string>[] | undefined;
  exiting?: VizItem[][] | undefined;
}

const NAMES: Record<string, string> = {
  ArrayViz: "Array",
  GridViz: "Grid",
  GraphViz: "Graph",
  TreeViz: "Tree",
  TableViz: "Table",
  StructViz: "Structure",
  LineViz: "Number line",
  PlotViz: "Chart",
  StdinScene: "Input and program",
  JudgeScene: "Judge",
};

export function FramesStage({
  layout,
  panels,
  scenes,
  boxes,
  stepLabel,
  entering,
  exiting,
}: FramesStageProps) {
  return (
    <div className="vz-stage">
      <div className="vz-panels" data-layout={layout}>
        {panels.map((p, i) => {
          const scene = scenes[i];
          const box = boxes[i];
          if (!scene || !box) return null;
          const name = p.title ?? NAMES[p.viz] ?? p.viz;
          return (
            <div className="vz-panel" key={p.id}>
              {p.title ? <div className="vz-panel-title">{p.title}</div> : null}
              <SceneSvg
                scene={scene}
                box={box}
                title={stepLabel ? `${name}, ${stepLabel}` : name}
                entering={entering?.[i]}
                exiting={exiting?.[i]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
