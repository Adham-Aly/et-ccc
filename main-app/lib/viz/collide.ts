// Collision check for laid-out scenes (G-VIZ rule "collision"; plan §8 "pixel picky"). Pure
// geometry in natural units, mirroring what the primitives draw:
//   1. text inside a cell, pill, node or badge keeps CLEAR units from its edge;
//   2. no two text boxes overlap (free-standing labels, pointer names, dimension labels);
//   3. no text box crosses a shape's edge: it sits fully inside the shape or clear of it.
// Lines (edges, arrows, sweeps, axes) are not shapes here: labels paint above them on a knockout.
import { FONT, type TextRole, textAdvance, type VizItem, type VizScene } from "./geometry";

/** Minimum clearance between a value and the edge of the shape it sits in. */
export const CLEAR = 6;
/** Half the visual height of a text line, as a fraction of its font size (cap height ≈ 0.7). */
const HALF_TEXT = 0.36;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TextBox extends Box {
  key: string;
  text: string;
}

type Shape =
  | { key: string; kind: "rect"; box: Box }
  | { key: string; kind: "circle"; cx: number; cy: number; r: number };

function textBox(
  key: string,
  text: string,
  role: TextRole,
  mono: boolean,
  x: number,
  y: number,
  anchor: "start" | "middle" | "end",
): TextBox {
  const w = textAdvance(text, role, mono);
  const h = FONT[role] * HALF_TEXT * 2;
  const x1 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return { key, text, x1, y1: y - h / 2, x2: x1 + w, y2: y + h / 2 };
}

const overlap = (a: Box, b: Box, tol = 0.5) =>
  a.x1 < b.x2 - tol && b.x1 < a.x2 - tol && a.y1 < b.y2 - tol && b.y1 < a.y2 - tol;

const inside = (a: Box, b: Box) => a.x1 >= b.x1 && a.x2 <= b.x2 && a.y1 >= b.y1 && a.y2 <= b.y2;

function circleHits(t: Box, cx: number, cy: number, r: number): "clear" | "inside" | "cross" {
  const nx = Math.max(t.x1, Math.min(cx, t.x2));
  const ny = Math.max(t.y1, Math.min(cy, t.y2));
  if (Math.hypot(nx - cx, ny - cy) >= r - 0.5) return "clear";
  const corners: [number, number][] = [
    [t.x1, t.y1],
    [t.x2, t.y1],
    [t.x1, t.y2],
    [t.x2, t.y2],
  ];
  return corners.every(([x, y]) => Math.hypot(x - cx, y - cy) <= r) ? "inside" : "cross";
}

/** Usable half-width of a rounded box at a vertical offset dy from its centre. */
function halfWidthAt(w: number, rx: number, dy: number): number {
  if (dy <= 0 || rx <= 0) return w / 2;
  const k = Math.max(0, rx * rx - dy * dy);
  return w / 2 - rx + Math.sqrt(k);
}

/** Every collision in one scene, as readable messages naming the items' keys. */
export function collisions(scene: VizScene): string[] {
  const out: string[] = [];
  const texts: TextBox[] = [];
  const shapes: Shape[] = [];
  for (const it of scene.items as VizItem[]) {
    switch (it.t) {
      case "cell": {
        shapes.push({
          key: it.key,
          kind: "rect",
          box: { x1: it.x, y1: it.y, x2: it.x + it.w, y2: it.y + it.h },
        });
        if (it.text) {
          const role = it.textRole ?? "value";
          const tw = textAdvance(it.text, role, role === "value");
          const th = FONT[role] * HALF_TEXT;
          const rx = it.shape === "pill" ? Math.min(it.h / 2, 12) : 0;
          const room =
            it.align === "start" ? it.w - 10 - tw : 2 * (halfWidthAt(it.w, rx, th) - tw / 2);
          const need = it.align === "start" ? CLEAR : 2 * CLEAR;
          if (room + 0.01 < need) {
            out.push(
              `"${it.text}" in ${it.key} has ${(it.align === "start" ? room : room / 2).toFixed(1)} units clear of the edge (min ${CLEAR})`,
            );
          }
        }
        break;
      }
      case "node": {
        shapes.push({ key: it.key, kind: "circle", cx: it.cx, cy: it.cy, r: it.r });
        if (it.text) {
          const tw = textAdvance(it.text, "value");
          const th = FONT.value * HALF_TEXT;
          const half = Math.sqrt(Math.max(0, it.r * it.r - th * th));
          if (tw / 2 + CLEAR > half + 0.01) {
            out.push(
              `"${it.text}" in ${it.key} has ${(half - tw / 2).toFixed(1)} units clear of the circle (min ${CLEAR})`,
            );
          }
        }
        break;
      }
      case "badge": {
        const tw = textAdvance(it.text, "label", true);
        const w = Math.max(28, Math.ceil(tw * 1.0) + 14);
        const h = FONT.label + 8;
        shapes.push({
          key: it.key,
          kind: "rect",
          box: { x1: it.x - w / 2, y1: it.y - h / 2, x2: it.x + w / 2, y2: it.y + h / 2 },
        });
        break;
      }
      case "slot":
        shapes.push({
          key: it.key,
          kind: "rect",
          box: { x1: it.x, y1: it.y, x2: it.x + it.w, y2: it.y + it.h },
        });
        break;
      case "text":
        if (it.text.trim()) {
          texts.push(
            textBox(
              it.key,
              it.text,
              it.role,
              it.mono ?? it.role === "value",
              it.x,
              it.y,
              it.anchor ?? "start",
            ),
          );
        }
        break;
      case "pointer": {
        const [lx, ly, anchor] =
          it.dir === "up"
            ? [it.x, it.y + 28, "middle"]
            : it.dir === "down"
              ? [it.x, it.y - 28, "middle"]
              : [it.x + 20, it.y, "start"];
        texts.push(textBox(it.key, it.label, "label", false, lx, ly, anchor as "middle" | "start"));
        break;
      }
      case "dim": {
        const compare = it.kind === "compare";
        const tw = textAdvance(it.label, "label", compare) + 10;
        const insideGap = it.x2 - it.x1 > tw + 18;
        const y = compare || insideGap ? it.y : it.y - 11;
        texts.push(textBox(it.key, it.label, "label", compare, (it.x1 + it.x2) / 2, y, "middle"));
        break;
      }
      default:
        break;
    }
  }
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) {
      const a = texts[i] as TextBox;
      const b = texts[j] as TextBox;
      if (overlap(a, b))
        out.push(`label "${a.text}" (${a.key}) overlaps label "${b.text}" (${b.key})`);
    }
  }
  for (const t of texts) {
    for (const s of shapes) {
      if (s.kind === "rect") {
        if (overlap(t, s.box) && !inside(t, s.box))
          out.push(`label "${t.text}" (${t.key}) crosses the edge of ${s.key}`);
      } else if (circleHits(t, s.cx, s.cy, s.r) === "cross") {
        out.push(`label "${t.text}" (${t.key}) crosses the edge of ${s.key}`);
      }
    }
  }
  return out;
}
