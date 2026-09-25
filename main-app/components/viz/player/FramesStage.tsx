import { MIN_RATIO, type VizScene } from "@/lib/viz/geometry";
import type { PanelSpec } from "@/lib/viz/schema";
import { MotionSceneSvg } from "./MotionSceneSvg";

export interface FramesStageProps {
  layout: "single" | "row";
  panels: PanelSpec[];
  /** Per panel: this step's scene and the panel's fixed box. */
  scenes: VizScene[];
  boxes: { width: number; height: number }[];
  stepLabel: string;
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

/**
 * A combined figure is one drawing: every panel uses the same scale (the smallest that fits all
 * of them), so nodes and values have one size across panels. viz.css does the arithmetic from
 * these natural widths.
 */
function sharedScaleVars(
  layout: "single" | "row",
  boxes: { width: number }[],
): Record<string, number> | undefined {
  if (layout !== "row" || boxes.length < 2) return undefined;
  const n0 = boxes[0]?.width ?? 1;
  const n1 = boxes[1]?.width ?? 1;
  return { "--vz-n0": n0, "--vz-n1": n1, "--vz-nmax": Math.max(n0, n1) };
}

/** Stage padding (2 × 16) plus the 16 px column gap, and the 3 : 2 column split (viz.css). */
const ROW_CHROME = 48;
const ROW_SPLIT = [0.6, 0.4];
const ROW_BUCKETS = [36, 40, 44, 48, 52, 56];

/**
 * The smallest player width (a 4rem bucket) at which both panels, side by side at one shared
 * scale, still meet the minimum text sizes (scale ≥ MIN_RATIO); "never" keeps them stacked.
 */
export function rowAt(boxes: { width: number }[]): string {
  const need =
    ROW_CHROME +
    Math.max(...boxes.slice(0, 2).map((b, i) => (b.width * MIN_RATIO) / (ROW_SPLIT[i] ?? 0.4)));
  const bucket = ROW_BUCKETS.find((rem) => rem * 16 >= need);
  return bucket === undefined ? "never" : String(bucket);
}

export function FramesStage({ layout, panels, scenes, boxes, stepLabel }: FramesStageProps) {
  return (
    <div className="vz-stage">
      <div
        className="vz-panels"
        data-layout={layout}
        data-row-at={layout === "row" ? rowAt(boxes) : undefined}
        style={sharedScaleVars(layout, boxes)}
      >
        {panels.map((p, i) => {
          const scene = scenes[i];
          const box = boxes[i];
          if (!scene || !box) return null;
          const name = p.title ?? NAMES[p.viz] ?? p.viz;
          return (
            <div className="vz-panel" key={p.id}>
              {p.title ? <div className="vz-panel-title">{p.title}</div> : null}
              <MotionSceneSvg
                scene={scene}
                box={box}
                title={stepLabel ? `${name}, ${stepLabel}` : name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
