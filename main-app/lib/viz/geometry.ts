// The drawing vocabulary shared by every visualizer: a layout function turns one frame into a
// VizScene (positioned primitives in user units); components/viz/SceneSvg draws it. Pure TS so
// the static text-size check (check:viz) can measure every scene without a browser.
import type { VizState } from "./schema";

// ---------------------------------------------------------------------------------------------
// Sizes (user units; 1 unit = 1 CSS px at scale 1)
// ---------------------------------------------------------------------------------------------

/** Text sizes by role (DESIGN.md → Typography in visuals). */
export const FONT = {
  /** Values inside cells and nodes (Mono 500). */
  value: 16,
  /** Indices, axis labels, pointer names, legends inside the SVG (Next 500). */
  label: 14,
  /** Panel titles (Next 600). */
  title: 14,
} as const;
export type TextRole = keyof typeof FONT;

/** Minimum rendered sizes at a 390 px viewport (DESIGN.md): values 14 px, labels 12 px. */
export const MIN_RENDERED = { value: 14, label: 12, title: 12 } as const;

/**
 * The SVG never renders larger than MAX_SCALE × its natural size and never smaller than the
 * phone stage allows. PHONE_STAGE is the stage's inner width at a 390 px viewport (sheet
 * gutters 20 px, figure border 1 px, stage padding 16 px: 390 − 40 − 2 − 32 = 316).
 */
export const MAX_SCALE = 1.25;
export const PHONE_STAGE = 316;
/** Widest natural scene that still meets MIN_RENDERED on a phone. */
export const MAX_NATURAL_WIDTH = Math.floor(
  PHONE_STAGE / Math.max(MIN_RENDERED.value / FONT.value, MIN_RENDERED.label / FONT.label),
);

/** Advance of a Mono glyph (0.618 em measured) and a safe average for the text face (0.44–0.59 em measured). */
export const MONO_ADVANCE = 0.62;
export const SANS_ADVANCE = 0.53;

export function textWidth(text: string, role: TextRole, mono = role === "value"): number {
  const size = FONT[role];
  return Math.ceil([...text].length * size * (mono ? MONO_ADVANCE : SANS_ADVANCE));
}

export const PAD = 8;

// ---------------------------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------------------------

interface Base {
  /** Stable identity across steps (animation and React keys). */
  key: string;
}

/** A cell / value box: rect with an optional value inside. */
export interface CellItem extends Base {
  t: "cell";
  x: number;
  y: number;
  w: number;
  h: number;
  state: VizState;
  text?: string | undefined;
  /** "pill" rounds fully (tree nodes with labels), default 2 px radius. */
  shape?: "box" | "pill" | undefined;
  /** Text role inside the cell (default "value": Mono). */
  textRole?: TextRole | undefined;
  /** Text alignment (default centred). */
  align?: "start" | "middle" | undefined;
  /** No caret above a current cell (row highlights, where the row itself is the marker). */
  noCaret?: boolean | undefined;
}

export interface NodeItem extends Base {
  t: "node";
  cx: number;
  cy: number;
  r: number;
  state: VizState;
  text?: string | undefined;
}

export interface EdgeItem extends Base {
  t: "edge";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: VizState;
  directed?: boolean | undefined;
  /** Weight / label at the midpoint. */
  label?: string | undefined;
}

/** A curved or straight arrow (references, dependencies, return arcs). */
export interface ArrowItem extends Base {
  t: "arrow";
  d: string;
  state: VizState;
  /** "ref" arrows start with a dot (names → objects). */
  dot?: { x: number; y: number } | undefined;
}

/** A pointer: a short arrow with a name, pointing at (x, y). */
export interface PointerItem extends Base {
  t: "pointer";
  x: number;
  y: number;
  /** "up": the label sits below and the arrow points up at the target. */
  dir: "up" | "down" | "left";
  label: string;
  strong?: boolean | undefined;
}

/** A dimension line from x1 to x2 at height y, with extension lines to yRef. */
export interface DimItem extends Base {
  t: "dim";
  x1: number;
  x2: number;
  y: number;
  yRef: number;
  label: string;
  /** "compare" draws the plum bracket for the Compared state. */
  kind: "range" | "compare";
}

export interface TextItem extends Base {
  t: "text";
  x: number;
  y: number;
  text: string;
  role: TextRole;
  anchor?: "start" | "middle" | "end" | undefined;
  weight?: 400 | 500 | 600 | 700 | undefined;
  mono?: boolean | undefined;
  /** Secondary colour (ink-2) instead of ink. */
  muted?: boolean | undefined;
  /** A paper outline keeps the text legible over lines and the stage grid (default on). */
  halo?: boolean | undefined;
}

/** A container slot: the open box a stack or queue lives in. */
export interface SlotItem extends Base {
  t: "slot";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Which sides are open. */
  open: "top" | "ends" | "none";
  /** The active container (the running call frame): the 3 px current edge. */
  strong?: boolean | undefined;
}

export interface LineItem extends Base {
  t: "line";
  points: [number, number][];
  /** 0 solid, 1 dashed, 2 dotted, 3 dash-dot; "axis" and "grid" are structure. */
  style: 0 | 1 | 2 | 3 | "axis" | "grid" | "sweep";
  state: VizState;
}

/** A badge: a small boxed value next to something (a distance under a graph node). */
export interface BadgeItem extends Base {
  t: "badge";
  /** Centre. */
  x: number;
  y: number;
  text: string;
}

export interface BandItem extends Base {
  t: "band";
  x: number;
  y: number;
  w: number;
  h: number;
}

export type VizItem =
  | CellItem
  | NodeItem
  | EdgeItem
  | ArrowItem
  | PointerItem
  | DimItem
  | TextItem
  | SlotItem
  | LineItem
  | BadgeItem
  | BandItem;

export interface VizScene {
  width: number;
  height: number;
  items: VizItem[];
}

/** Union of scene sizes (the fixed aspect box of a panel across all steps and presets). */
export function unionSize(scenes: VizScene[]): { width: number; height: number } {
  let width = 0;
  let height = 0;
  for (const s of scenes) {
    width = Math.max(width, s.width);
    height = Math.max(height, s.height);
  }
  return { width, height };
}

/** States a scene uses (for the legend). */
export function statesIn(scene: VizScene): Set<VizState> {
  const out = new Set<VizState>();
  for (const it of scene.items) {
    if ("state" in it && it.state !== "none") out.add(it.state);
    if (it.t === "dim" && it.kind === "compare") out.add("compare");
  }
  return out;
}

export function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number")
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  return v;
}
