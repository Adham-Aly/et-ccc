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

/** Advance of a Mono glyph (0.618 em measured in Chromium). */
export const MONO_ADVANCE = 0.62;
/** Fallback advance for a text-face character missing from SANS_ADVANCES. */
export const SANS_ADVANCE = 0.62;
/**
 * Advances of the text face (Atkinson Hyperlegible Next) per character, in em, measured in
 * Chromium with getComputedTextLength; the larger of weight 500 (labels) and 600 (titles).
 * Remeasure with work/04-app/_scratch/w3/advances.mjs if the face changes.
 */
// biome-ignore format: a measured lookup table reads best packed
const SANS_ADVANCES: Record<string, number> = {" ":0.293,"!":0.298,"\"":0.362,"#":0.73,"$":0.604,"%":0.953,"&":0.729,"'":0.195,"(":0.324,")":0.324,"*":0.485,"+":0.601,",":0.252,"-":0.369,".":0.253,"/":0.307,"0":0.632,"1":0.632,"2":0.632,"3":0.632,"4":0.632,"5":0.632,"6":0.632,"7":0.632,"8":0.632,"9":0.632,":":0.253,";":0.253,"<":0.564,"=":0.621,">":0.564,"?":0.526,"@":0.78,"A":0.684,"B":0.634,"C":0.637,"D":0.683,"E":0.589,"F":0.562,"G":0.711,"H":0.699,"I":0.415,"J":0.546,"K":0.654,"L":0.548,"M":0.848,"N":0.71,"O":0.737,"P":0.617,"Q":0.747,"R":0.639,"S":0.604,"T":0.608,"U":0.688,"V":0.647,"W":0.885,"X":0.666,"Y":0.664,"Z":0.615,"[":0.333,"\\":0.424,"]":0.344,"^":0.573,"_":0.391,"`":0.274,"a":0.544,"b":0.587,"c":0.489,"d":0.586,"e":0.555,"f":0.36,"g":0.582,"h":0.565,"i":0.285,"j":0.284,"k":0.536,"l":0.293,"m":0.87,"n":0.565,"o":0.569,"p":0.587,"q":0.591,"r":0.377,"s":0.497,"t":0.36,"u":0.559,"v":0.533,"w":0.747,"x":0.545,"y":0.523,"z":0.492,"{":0.37,"|":0.249,"}":0.37,"~":0.548,"·":0.277,"×":0.535,"–":0.503,"—":0.83,"’":0.259,"→":0.993,"∞":0.766,"≤":0.587,"≥":0.587,};
/** Safety margin on the text face so a label never measures narrower than it renders. */
const SANS_MARGIN = 1.03;

/** The measured advance of a text run in user units (drawing: knockouts that hug the glyphs). */
export function textAdvance(text: string, role: TextRole, mono = role === "value"): number {
  const size = FONT[role];
  const chars = [...text];
  if (mono) return chars.length * size * MONO_ADVANCE;
  let em = 0;
  for (const ch of chars) em += SANS_ADVANCES[ch] ?? SANS_ADVANCE;
  return em * size;
}

/** A text run's width for layout: the measured advance plus a safety margin, rounded up. */
export function textWidth(text: string, role: TextRole, mono = role === "value"): number {
  return Math.ceil(textAdvance(text, role, mono) * (mono ? 1 : SANS_MARGIN));
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
