// CodeTraceViz state panel: call frames (newest on top) with their variables, and the heap
// objects they refer to, drawn as boxes with arrows from names so aliasing is visible
// (plan §4.11.1, DESIGN.md → Code trace layout).
import { MAX_NATURAL_WIDTH, PAD, textWidth, type VizItem, type VizScene } from "./geometry";
import type { HeapObject, TraceValue } from "./schema";
import type { TraceState } from "./trace";

const HEAD = 26;
const ROW = 28;
const CELL_H = 26;
const OBJ_GAP = 14;
const TYPE_ROW = 18;
const INDEX_ROW = 16;

export function frameTitle(f: string): string {
  return f === "<module>" ? "Global frame" : f;
}

const isRef = (v: TraceValue): v is [number] => Array.isArray(v);

function objectCellW(obj: HeapObject): number {
  let w = 30;
  const vals: TraceValue[] =
    obj.t === "dict"
      ? obj.v.flat()
      : obj.t === "object"
        ? obj.v.map((p) => p[1])
        : obj.t === "function"
          ? []
          : obj.v;
  for (const v of vals) if (!isRef(v)) w = Math.max(w, textWidth(v, "value") + 12);
  return w;
}

interface Placed {
  id: number;
  y: number;
  h: number;
  /** Where arrows land (left edge, first row middle). */
  ax: number;
  ay: number;
}

export function layoutTrace(states: TraceState[]): VizScene[] {
  let nameW = 24;
  let valW = 36;
  let titleW = textWidth("Global frame", "title");
  for (const s of states) {
    for (const fr of s.stack) {
      titleW = Math.max(titleW, textWidth(frameTitle(fr.f), "title"));
      for (const [n, v] of fr.v) {
        nameW = Math.max(nameW, textWidth(n, "value"));
        if (!isRef(v)) valW = Math.max(valW, textWidth(v, "value") + 14);
      }
    }
    if (s.returned !== null) {
      nameW = Math.max(nameW, textWidth("return", "label"));
      if (!isRef(s.returned)) valW = Math.max(valW, textWidth(s.returned, "value") + 14);
    }
  }
  const fw = Math.max(titleW + 20, 10 + nameW + 10 + valW + 10);
  const x0 = PAD;
  const xObj = x0 + fw + 44;
  const availW = Math.max(60, MAX_NATURAL_WIDTH - xObj - PAD);

  return states.map((s) => {
    const items: VizItem[] = [];
    const refs: { from: { x: number; y: number }; to: number; key: string }[] = [];
    let y = PAD;
    items.push({
      key: "hframes",
      t: "text",
      x: x0,
      y: y + 8,
      text: "Frames",
      role: "title",
      weight: 600,
      anchor: "start",
      muted: true,
    });
    items.push({
      key: "hobjects",
      t: "text",
      x: xObj,
      y: y + 8,
      text: "Objects",
      role: "title",
      weight: 600,
      anchor: "start",
      muted: true,
    });
    y += 24;
    const top = s.stack.length - 1;
    for (let fi = top; fi >= 0; fi -= 1) {
      const fr = s.stack[fi];
      if (!fr) continue;
      const showReturn = fi === top && s.event === "return" && s.returned !== null;
      const rows = fr.v.length + (showReturn ? 1 : 0);
      const h = HEAD + Math.max(rows, 0) * ROW + 6;
      const fkey = `f${fi}:${fr.f}`;
      items.push({ key: fkey, t: "slot", x: x0, y, w: fw, h, open: "none", strong: fi === top });
      items.push({
        key: `${fkey}:t`,
        t: "text",
        x: x0 + 10,
        y: y + 14,
        text: frameTitle(fr.f),
        role: "title",
        weight: 600,
        anchor: "start",
      });
      const rowsList: [string, TraceValue, boolean][] = fr.v.map(([n, v]) => [n, v, false]);
      if (showReturn && s.returned !== null) rowsList.push(["return", s.returned, true]);
      rowsList.forEach(([name, value, isReturn], r) => {
        const ry = y + HEAD + r * ROW;
        const changed = s.changedVars.has(`${fi}:${name}`);
        items.push({
          key: `${fkey}:n:${name}`,
          t: "text",
          x: x0 + 10 + nameW,
          y: ry + CELL_H / 2,
          text: name,
          role: isReturn ? "label" : "value",
          mono: !isReturn,
          anchor: "end",
          muted: isReturn,
        });
        const vx = x0 + 10 + nameW + 10;
        if (isRef(value)) {
          items.push({
            key: `${fkey}:v:${name}`,
            t: "cell",
            x: vx,
            y: ry,
            w: CELL_H,
            h: CELL_H,
            state: changed ? "changed" : "none",
          });
          refs.push({
            from: { x: vx + CELL_H / 2, y: ry + CELL_H / 2 },
            to: value[0],
            key: `${fkey}:r:${name}`,
          });
        } else {
          items.push({
            key: `${fkey}:v:${name}`,
            t: "cell",
            x: vx,
            y: ry,
            w: valW,
            h: CELL_H,
            state: changed || isReturn ? "changed" : "none",
            text: value,
            align: "start",
          });
        }
      });
      y += h + 10;
    }
    const framesBottom = y;

    // Objects, in order of first reference (frames top to bottom, then nested references).
    const order: number[] = [];
    const seen = new Set<number>();
    const queue = refs.map((r) => r.to);
    while (queue.length > 0) {
      const id = queue.shift() as number;
      if (seen.has(id) || !s.heap.has(id)) continue;
      seen.add(id);
      order.push(id);
      const obj = s.heap.get(id) as HeapObject;
      const vals: TraceValue[] =
        obj.t === "dict"
          ? obj.v.flat()
          : obj.t === "object"
            ? obj.v.map((p) => p[1])
            : obj.t === "function"
              ? []
              : obj.v;
      for (const v of vals) if (isRef(v)) queue.push(v[0]);
    }
    const placed = new Map<number, Placed>();
    let oy = PAD + 24;
    for (const id of order) {
      const obj = s.heap.get(id) as HeapObject;
      const changed = s.changedObjects.has(id);
      const okey = `o${id}`;
      // Sit the object level with the first name that refers to it (arrows run nearly flat
      // and never cross a frame), unless that would overlap the object above.
      const anchorOff =
        TYPE_ROW +
        (obj.t === "list" || obj.t === "tuple" ? (obj.v.length > 0 ? INDEX_ROW : 0) : 0) +
        CELL_H / 2;
      const firstRef = refs.find((r) => r.to === id);
      if (firstRef) oy = Math.max(oy, firstRef.from.y - anchorOff);
      const typeName = obj.t === "object" ? obj.c : obj.t;
      items.push({
        key: `${okey}:t`,
        t: "text",
        x: xObj,
        y: oy + 8,
        text: typeName,
        role: "label",
        anchor: "start",
        muted: true,
      });
      if (obj.t === "function") {
        // The type row already says "function"; the pill carries only the name.
        const w = textWidth(obj.n, "value", true) + 24;
        items.push({
          key: okey,
          t: "cell",
          x: xObj,
          y: oy + TYPE_ROW,
          w,
          h: CELL_H,
          state: "none",
          text: obj.n,
          shape: "pill",
        });
        placed.set(id, {
          id,
          y: oy,
          h: TYPE_ROW + CELL_H,
          ax: xObj,
          ay: oy + TYPE_ROW + CELL_H / 2,
        });
        oy += TYPE_ROW + CELL_H + OBJ_GAP;
        continue;
      }
      let cy = oy + TYPE_ROW;
      const cw = objectCellW(obj);
      if (obj.t === "list" || obj.t === "tuple" || obj.t === "set") {
        const indexed = obj.t !== "set";
        const perRow = Math.max(1, Math.floor(availW / cw));
        if (obj.v.length === 0) {
          items.push({
            key: `${okey}:empty`,
            t: "slot",
            x: xObj,
            y: cy,
            w: 30,
            h: CELL_H,
            open: "none",
          });
          placed.set(id, { id, y: oy, h: TYPE_ROW + CELL_H, ax: xObj, ay: cy + CELL_H / 2 });
          oy = cy + CELL_H + OBJ_GAP;
          continue;
        }
        const firstRowY = cy + (indexed ? INDEX_ROW : 0);
        obj.v.forEach((v, i) => {
          const r = Math.floor(i / perRow);
          const c = i % perRow;
          const rowY = cy + r * ((indexed ? INDEX_ROW : 0) + CELL_H + 4);
          const cx = xObj + c * cw;
          if (indexed) {
            items.push({
              key: `${okey}:i${i}`,
              t: "text",
              x: cx + cw / 2,
              y: rowY + 7,
              text: String(i),
              role: "label",
              anchor: "middle",
              muted: true,
            });
          }
          const cellY = rowY + (indexed ? INDEX_ROW : 0);
          if (isRef(v)) {
            items.push({
              key: `${okey}:c${i}`,
              t: "cell",
              x: cx,
              y: cellY,
              w: cw,
              h: CELL_H,
              state: changed ? "changed" : "none",
            });
            refs.push({
              from: { x: cx + cw / 2, y: cellY + CELL_H / 2 },
              to: v[0],
              key: `${okey}:r${i}`,
            });
          } else {
            items.push({
              key: `${okey}:c${i}`,
              t: "cell",
              x: cx,
              y: cellY,
              w: cw,
              h: CELL_H,
              state: changed ? "changed" : "none",
              text: v,
            });
          }
        });
        const rowsN = Math.ceil(obj.v.length / perRow);
        const h = rowsN * ((indexed ? INDEX_ROW : 0) + CELL_H + 4) - 4;
        placed.set(id, { id, y: oy, h: TYPE_ROW + h, ax: xObj, ay: firstRowY + CELL_H / 2 });
        oy = cy + h + OBJ_GAP;
        continue;
      }
      // dict and object: key | value rows
      const rowsKV: [TraceValue, TraceValue][] =
        obj.t === "dict" ? obj.v : obj.v.map(([k, v]) => [k, v]);
      const kw = Math.max(30, ...rowsKV.map(([k]) => (isRef(k) ? 30 : textWidth(k, "value") + 12)));
      const vw = Math.max(
        30,
        ...rowsKV.map(([, v]) => (isRef(v) ? 30 : textWidth(v, "value") + 12)),
      );
      if (rowsKV.length === 0) {
        items.push({
          key: `${okey}:empty`,
          t: "slot",
          x: xObj,
          y: cy,
          w: 30,
          h: CELL_H,
          open: "none",
        });
        placed.set(id, { id, y: oy, h: TYPE_ROW + CELL_H, ax: xObj, ay: cy + CELL_H / 2 });
        oy = cy + CELL_H + OBJ_GAP;
        continue;
      }
      rowsKV.forEach(([k, v], i) => {
        const ry = cy + i * CELL_H;
        items.push({
          key: `${okey}:k${i}`,
          t: "cell",
          x: xObj,
          y: ry,
          w: kw,
          h: CELL_H,
          state: changed ? "changed" : "none",
          text: isRef(k) ? "" : k,
        });
        if (isRef(v)) {
          items.push({
            key: `${okey}:v${i}`,
            t: "cell",
            x: xObj + kw,
            y: ry,
            w: vw,
            h: CELL_H,
            state: changed ? "changed" : "none",
          });
          refs.push({
            from: { x: xObj + kw + vw / 2, y: ry + CELL_H / 2 },
            to: v[0],
            key: `${okey}:r${i}`,
          });
        } else {
          items.push({
            key: `${okey}:v${i}`,
            t: "cell",
            x: xObj + kw,
            y: ry,
            w: vw,
            h: CELL_H,
            state: changed ? "changed" : "none",
            text: v,
          });
        }
      });
      cy += rowsKV.length * CELL_H;
      placed.set(id, { id, y: oy, h: cy - oy, ax: xObj, ay: oy + TYPE_ROW + CELL_H / 2 });
      oy = cy + OBJ_GAP;
    }
    for (const r of refs) {
      const target = placed.get(r.to);
      if (!target) continue;
      const { x, y: fy } = r.from;
      const tx = target.ax - 3;
      const ty = target.ay;
      const d =
        tx > x + 20
          ? `M ${x} ${fy} C ${x + (tx - x) * 0.5} ${fy}, ${tx - (tx - x) * 0.4} ${ty}, ${tx} ${ty}`
          : `M ${x} ${fy} C ${x - 24} ${fy + 30}, ${tx - 28} ${ty}, ${tx} ${ty}`;
      items.push({ key: r.key, t: "arrow", d, state: "none", dot: { x, y: fy } });
    }
    let maxX = x0 + fw + PAD;
    for (const it of items) {
      if (it.t === "cell" || it.t === "slot") maxX = Math.max(maxX, it.x + it.w + PAD);
    }
    return {
      width: Math.ceil(maxX),
      height: Math.ceil(Math.max(framesBottom, oy) + PAD - 10),
      items,
    };
  });
}
