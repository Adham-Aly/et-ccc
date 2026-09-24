import type { VizItem, VizScene } from "@/lib/viz/geometry";
import { MAX_SCALE } from "@/lib/viz/geometry";
import { Item } from "./primitives";
import "./viz.css";

export interface SceneSvgProps {
  scene: VizScene;
  /** The panel's fixed box (union over every step): the aspect ratio never changes. */
  box: { width: number; height: number };
  /** Accessible name (<title>) and description (<desc>). */
  title: string;
  desc?: string | undefined;
  /** Keys that are new at this step (fade in) and items leaving (fade out); client only. */
  entering?: Set<string> | undefined;
  exiting?: VizItem[] | undefined;
}

/**
 * Free-standing text (labels, notes, titles) paints above every shape, so no line, sweep or
 * edge ever crosses a label's halo. Everything else keeps the layout's order.
 */
function paintOrder(items: VizItem[]): VizItem[] {
  return [...items.filter((i) => i.t !== "text"), ...items.filter((i) => i.t === "text")];
}

/** One panel drawing: a pure SVG, identical on the server and in the client player. */
export function SceneSvg({ scene, box, title, desc, entering, exiting }: SceneSvgProps) {
  return (
    <svg
      className="vz-svg"
      viewBox={`0 0 ${box.width} ${box.height}`}
      role="img"
      style={{
        maxWidth: `${Math.round(box.width * MAX_SCALE)}px`,
        // Natural width, for the shared scale of combined figures (viz.css → .vz-panels).
        ["--vz-nat" as string]: box.width,
      }}
    >
      <title>{title}</title>
      {desc ? <desc>{desc}</desc> : null}
      {paintOrder(scene.items).map((it) => (
        <Item key={it.key} item={it} flags={entering?.has(it.key) ? { enter: true } : undefined} />
      ))}
      {exiting?.map((it) => (
        <Item key={`exit:${it.key}`} item={it} flags={{ exit: true }} />
      ))}
    </svg>
  );
}
