import type { ReactNode } from "react";
// SVG primitives (plan §4.11.2): cell / value box, node, edge, arrow, pointer, dimension line
// (range) and compare bracket, label, badge, container slot, plot line, band. Pure and
// server-safe: no hooks, no client code. Colours and strokes come from viz.css through the
// `data-s` state attribute (DESIGN.md → State vocabulary), never from literals here.
import type {
  ArrowItem,
  BadgeItem,
  BandItem,
  CellItem,
  DimItem,
  EdgeItem,
  LineItem,
  NodeItem,
  PointerItem,
  SlotItem,
  TextItem,
  VizItem,
} from "@/lib/viz/geometry";
import { FONT, textAdvance, textWidth } from "@/lib/viz/geometry";

export interface ItemFlags {
  /** Newly present in this step (fades in, second phase). */
  enter?: boolean;
  /** Leaving (kept for one transition, fading out). */
  exit?: boolean;
}

const at = (x: number, y: number) => ({ transform: `translate(${round(x)}px, ${round(y)}px)` });
const round = (v: number) => Math.round(v * 100) / 100;

function cls(base: string, flags: ItemFlags): string {
  return `vz-item ${base}${flags.enter ? " vz-enter" : ""}${flags.exit ? " vz-exit" : ""}`;
}

/** Filled arrowhead with its tip at (x, y), pointing away from (fx, fy). */
export function headPoints(x: number, y: number, fx: number, fy: number, size = 7): string {
  const dx = x - fx;
  const dy = y - fy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const bx = x - ux * size;
  const by = y - uy * size;
  const px = -uy * size * 0.5;
  const py = ux * size * 0.5;
  return `${round(x)},${round(y)} ${round(bx + px)},${round(by + py)} ${round(bx - px)},${round(by - py)}`;
}

/** Last point of an absolute path and the point before it (for the arrowhead direction). */
export function pathEnd(d: string): { x: number; y: number; fx: number; fy: number } {
  const nums = (d.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? []).map(Number);
  const n = nums.length;
  return { x: nums[n - 2] ?? 0, y: nums[n - 1] ?? 0, fx: nums[n - 4] ?? 0, fy: nums[n - 3] ?? 0 };
}

/** Diagonal hatching inside a w × h box (walls; the drafting convention for solid material). */
function hatch(w: number, h: number, step = 7): string {
  const parts: string[] = [];
  for (let k = step; k < w + h; k += step) {
    const x1 = Math.max(0, k - h);
    const y1 = Math.min(h, k);
    const x2 = Math.min(w, k);
    const y2 = Math.max(0, k - w);
    parts.push(`M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`);
  }
  return parts.join("");
}

function Caret({ x, y }: { x: number; y: number }) {
  return <path className="vz-caret" d={`M${x - 5} ${y - 6}L${x + 5} ${y - 6}L${x} ${y - 1}Z`} />;
}

export function Cell({ item, flags = {} }: { item: CellItem; flags?: ItemFlags }) {
  const { w, h, state, text } = item;
  const rx = item.shape === "pill" ? Math.min(h / 2, 12) : 2;
  const role = item.textRole ?? "value";
  const start = item.align === "start";
  return (
    <g
      className={cls("vz-cell", flags)}
      data-s={state}
      data-k={item.key}
      style={at(item.x, item.y)}
    >
      <rect className="vz-shape" width={w} height={h} rx={rx} />
      {state === "path" ? (
        <rect
          className="vz-ring"
          x={3}
          y={3}
          width={w - 6}
          height={h - 6}
          rx={Math.max(rx - 2, 1)}
        />
      ) : null}
      {state === "wall" ? <path className="vz-hatch" d={hatch(w, h)} /> : null}
      {state === "invalid" ? (
        <line className="vz-strike" x1={4} y1={h - 4} x2={w - 4} y2={4} />
      ) : null}
      {text ? (
        <text
          className={`vz-t vz-t-${role}`}
          x={start ? 10 : w / 2}
          y={h / 2}
          dy="0.35em"
          textAnchor={start ? "start" : "middle"}
        >
          {text}
        </text>
      ) : null}
      {state === "current" && item.shape !== "pill" && !item.noCaret ? (
        <Caret x={w / 2} y={0} />
      ) : null}
    </g>
  );
}

/** A value box is a cell that always carries a value (used by StructViz and CodeTraceViz). */
export const ValueBox = Cell;

export function Node({ item, flags = {} }: { item: NodeItem; flags?: ItemFlags }) {
  const { r, state, text } = item;
  return (
    <g
      className={cls("vz-node", flags)}
      data-s={state}
      data-k={item.key}
      style={at(item.cx, item.cy)}
    >
      <circle className="vz-shape" r={r} />
      {state === "path" ? <circle className="vz-ring" r={r - 3.5} /> : null}
      {state === "invalid" ? (
        <line className="vz-strike" x1={-r * 0.7} y1={r * 0.7} x2={r * 0.7} y2={-r * 0.7} />
      ) : null}
      {text ? (
        <text className="vz-t vz-t-value" dy="0.35em" textAnchor="middle">
          {text}
        </text>
      ) : null}
      {state === "current" && r >= 12 ? <Caret x={0} y={-r - 1} /> : null}
    </g>
  );
}

export function Edge({ item, flags = {} }: { item: EdgeItem; flags?: ItemFlags }) {
  const { x1, y1, x2, y2, state } = item;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  return (
    <g className={cls("vz-edge", flags)} data-s={state} data-k={item.key}>
      <line className="vz-line" x1={round(x1)} y1={round(y1)} x2={round(x2)} y2={round(y2)} />
      {item.directed ? (
        <polygon className="vz-head" points={headPoints(x2, y2, x1, y1, 8)} />
      ) : null}
      {state === "invalid" ? (
        <line
          className="vz-strike"
          x1={round(mx - nx * 6 - ((x2 - x1) / len) * 3)}
          y1={round(my - ny * 6 - ((y2 - y1) / len) * 3)}
          x2={round(mx + nx * 6 + ((x2 - x1) / len) * 3)}
          y2={round(my + ny * 6 + ((y2 - y1) / len) * 3)}
        />
      ) : null}
      {item.label ? (
        <text
          className="vz-t vz-t-label vz-halo"
          x={round(mx + nx * 11)}
          y={round(my + ny * 11)}
          dy="0.35em"
          textAnchor="middle"
        >
          {item.label}
        </text>
      ) : null}
    </g>
  );
}

export function Arrow({ item, flags = {} }: { item: ArrowItem; flags?: ItemFlags }) {
  const end = pathEnd(item.d);
  return (
    <g className={cls("vz-arrow", flags)} data-s={item.state} data-k={item.key}>
      <path className="vz-line" d={item.d} />
      <polygon className="vz-head" points={headPoints(end.x, end.y, end.fx, end.fy, 7)} />
      {item.dot ? (
        <circle className="vz-dot" cx={round(item.dot.x)} cy={round(item.dot.y)} r={3.5} />
      ) : null}
    </g>
  );
}

export function Pointer({ item, flags = {} }: { item: PointerItem; flags?: ItemFlags }) {
  const strong = item.strong === true;
  const label = (x: number, y: number, anchor: "middle" | "start") => (
    <text
      className={`vz-t vz-t-label vz-halo vz-ptr-label${strong ? " vz-strong" : ""}`}
      x={x}
      y={y}
      dy="0.35em"
      textAnchor={anchor}
    >
      {item.label}
    </text>
  );
  let body: ReactNode;
  if (item.dir === "up") {
    body = (
      <>
        <line className="vz-line" x1={0} y1={17} x2={0} y2={6} />
        <polygon className="vz-head" points={headPoints(0, 0, 0, 10, 7)} />
        {label(0, 28, "middle")}
      </>
    );
  } else if (item.dir === "down") {
    body = (
      <>
        <line className="vz-line" x1={0} y1={-17} x2={0} y2={-6} />
        <polygon className="vz-head" points={headPoints(0, 0, 0, -10, 7)} />
        {label(0, -28, "middle")}
      </>
    );
  } else {
    body = (
      <>
        <line className="vz-line" x1={16} y1={0} x2={6} y2={0} />
        <polygon className="vz-head" points={headPoints(0, 0, 10, 0, 7)} />
        {label(20, 0, "start")}
      </>
    );
  }
  return (
    <g
      className={cls(`vz-pointer${strong ? " vz-strong" : ""}`, flags)}
      data-k={item.key}
      style={at(item.x, item.y)}
    >
      {body}
    </g>
  );
}

export function Dimension({ item, flags = {} }: { item: DimItem; flags?: ItemFlags }) {
  const { x1, x2, y, yRef, label, kind } = item;
  const mid = (x1 + x2) / 2;
  const tw = textWidth(label, "label", kind === "compare") + 10;
  const inside = x2 - x1 > tw + 18;
  const above = yRef > y;
  if (kind === "compare") {
    const tip = above ? yRef - 4 : yRef + 4;
    return (
      <g className={cls("vz-dim vz-compare", flags)} data-s="compare" data-k={item.key}>
        <path className="vz-line" d={`M${x1} ${tip}L${x1} ${y}L${x2} ${y}L${x2} ${tip}`} />
        <rect className="vz-gap" x={mid - tw / 2} y={y - 9} width={tw} height={18} />
        <text className="vz-t vz-t-label vz-mono" x={mid} y={y} dy="0.35em" textAnchor="middle">
          {label}
        </text>
      </g>
    );
  }
  const e1 = above ? y - 4 : y + 4;
  const e2 = above ? yRef - 3 : yRef + 3;
  return (
    <g className={cls("vz-dim", flags)} data-k={item.key}>
      <line className="vz-ext" x1={x1} y1={e1} x2={x1} y2={e2} />
      <line className="vz-ext" x1={x2} y1={e1} x2={x2} y2={e2} />
      <line className="vz-line" x1={x1 + 2} y1={y} x2={x2 - 2} y2={y} />
      <polygon className="vz-head" points={headPoints(x1 + 1, y, x1 + 9, y, 6)} />
      <polygon className="vz-head" points={headPoints(x2 - 1, y, x2 - 9, y, 6)} />
      {inside ? (
        <rect className="vz-gap" x={mid - tw / 2} y={y - 9} width={tw} height={18} />
      ) : null}
      <text
        className="vz-t vz-t-label"
        x={mid}
        y={inside ? y : y - 11}
        dy="0.35em"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

export function Label({ item, flags = {} }: { item: TextItem; flags?: ItemFlags }) {
  const weight = item.weight ?? 500;
  const halo = item.halo !== false;
  const mono = item.mono ?? item.role === "value";
  // The halo only outlines each glyph; a knockout behind the whole label also clears the gaps
  // between letters, so a sweep, edge or grid line never shows through a label.
  const kw = halo ? textAdvance(item.text, item.role, mono) + 3 : 0;
  const kh = FONT[item.role] + 2;
  const kx = item.anchor === "middle" ? -kw / 2 : item.anchor === "end" ? -kw + 1.5 : -1.5;
  return (
    <g className={cls("vz-label", flags)} data-k={item.key} style={at(item.x, item.y)}>
      {halo ? <rect className="vz-gap" x={kx} y={-kh / 2} width={kw} height={kh} rx={2} /> : null}
      <text
        className={`vz-t vz-t-${item.role}${mono ? " vz-mono" : ""}${item.muted ? " vz-muted" : ""}${halo ? " vz-halo" : ""}`}
        dy="0.35em"
        textAnchor={item.anchor ?? "start"}
        style={{ fontWeight: weight }}
      >
        {item.text}
      </text>
    </g>
  );
}

export function Badge({ item, flags = {} }: { item: BadgeItem; flags?: ItemFlags }) {
  const w = Math.max(22, textWidth(item.text, "label", true) + 12);
  const h = FONT.label + 8;
  return (
    <g className={cls("vz-badge", flags)} data-k={item.key} style={at(item.x, item.y)}>
      <rect className="vz-shape" x={-w / 2} y={-h / 2} width={w} height={h} rx={2} />
      <text className="vz-t vz-t-label vz-mono" dy="0.35em" textAnchor="middle">
        {item.text}
      </text>
    </g>
  );
}

export function Slot({ item, flags = {} }: { item: SlotItem; flags?: ItemFlags }) {
  const { x, y, w, h, open } = item;
  const d =
    open === "top"
      ? `M${x} ${y}L${x} ${y + h}L${x + w} ${y + h}L${x + w} ${y}`
      : open === "ends"
        ? `M${x} ${y}L${x + w} ${y}M${x} ${y + h}L${x + w} ${y + h}`
        : "";
  return (
    <g className={cls(`vz-slot${item.strong ? " vz-strong" : ""}`, flags)} data-k={item.key}>
      {open === "none" ? (
        <rect className="vz-shape" x={x} y={y} width={w} height={h} rx={2} />
      ) : (
        <path className="vz-line" d={d} />
      )}
    </g>
  );
}

const DASH: Record<string, string | undefined> = { "1": "6 4", "2": "1.5 4", "3": "9 3 1.5 3" };

export function PlotLine({ item, flags = {} }: { item: LineItem; flags?: ItemFlags }) {
  const pts = item.points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
  const style = String(item.style);
  return (
    <g className={cls(`vz-pline vz-pl-${style}`, flags)} data-s={item.state} data-k={item.key}>
      <polyline className="vz-line" points={pts} strokeDasharray={DASH[style]} />
    </g>
  );
}

export function Band({ item, flags = {} }: { item: BandItem; flags?: ItemFlags }) {
  return (
    <g className={cls("vz-band", flags)} data-k={item.key}>
      <rect className="vz-shape" x={item.x} y={item.y} width={item.w} height={item.h} />
      <line className="vz-line" x1={item.x} y1={item.y} x2={item.x} y2={item.y + item.h} />
      <line
        className="vz-line"
        x1={item.x + item.w}
        y1={item.y}
        x2={item.x + item.w}
        y2={item.y + item.h}
      />
    </g>
  );
}

export function Item({ item, flags }: { item: VizItem; flags?: ItemFlags }) {
  switch (item.t) {
    case "cell":
      return <Cell item={item} flags={flags} />;
    case "node":
      return <Node item={item} flags={flags} />;
    case "edge":
      return <Edge item={item} flags={flags} />;
    case "arrow":
      return <Arrow item={item} flags={flags} />;
    case "pointer":
      return <Pointer item={item} flags={flags} />;
    case "dim":
      return <Dimension item={item} flags={flags} />;
    case "text":
      return <Label item={item} flags={flags} />;
    case "badge":
      return <Badge item={item} flags={flags} />;
    case "slot":
      return <Slot item={item} flags={flags} />;
    case "line":
      return <PlotLine item={item} flags={flags} />;
    case "band":
      return <Band item={item} flags={flags} />;
  }
}
