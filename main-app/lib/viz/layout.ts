// Layout: frame data → VizScene, one function per panel visualizer (plan §4.11.2). Each takes
// every frame of a panel at once, so sizes and positions are fixed across steps and presets
// (the fixed aspect box: no layout shift, nothing jumps between steps).
import { tree as d3tree, hierarchy } from "d3-hierarchy";
import {
  FONT,
  fmt,
  MAX_NATURAL_WIDTH,
  PAD,
  textWidth,
  type VizItem,
  type VizScene,
} from "./geometry";
import { layoutJudgeScene, layoutStdinScene } from "./layout-scenes";
import type {
  ArrayFrame,
  FrameByViz,
  GraphFrame,
  GridFrame,
  LineFrame,
  PlotFrame,
  StructFrame,
  TableFrame,
  TreeFrame,
  TreeNodeData,
} from "./schema";
import { stateOf } from "./states";

const ROW_POINTER = 38;
const ROW_RANGE = 28;

// ---------------------------------------------------------------------------------------------
// ArrayViz
// ---------------------------------------------------------------------------------------------

export function layoutArray(frames: ArrayFrame[]): VizScene[] {
  let minIdx = 0;
  let maxIdx = 0;
  let cellW = 40;
  let hasName = false;
  let above = 0;
  let below = 0;
  let rangesAbove = 0;
  let rangesBelow = 0;
  let hasCompare = false;
  let indices = false;
  let circular = false;
  for (const f of frames) {
    maxIdx = Math.max(maxIdx, f.values.length - 1);
    for (const v of f.values) cellW = Math.max(cellW, textWidth(fmt(v), "value") + 14);
    if (f.name) hasName = true;
    for (const p of f.pointers ?? []) {
      minIdx = Math.min(minIdx, p.at);
      maxIdx = Math.max(maxIdx, p.at);
      if (p.side === "above") above = 1;
      else below = 1;
    }
    let ra = 0;
    let rb = 0;
    for (const r of f.ranges ?? []) {
      if (r.side === "below") rb += 1;
      else ra += 1;
    }
    rangesAbove = Math.max(rangesAbove, ra);
    rangesBelow = Math.max(rangesBelow, rb);
    if (f.compare) hasCompare = true;
    if (f.indices !== false) indices = true;
    if (f.circular) circular = true;
  }
  const cellH = 40;
  const slots = maxIdx - minIdx + 1;
  const x0 = PAD;
  let y = PAD;
  const yName = y;
  if (hasName) y += 22;
  const yCompare = y;
  if (hasCompare) y += ROW_RANGE;
  const yRangesAbove = y;
  y += rangesAbove * ROW_RANGE;
  y += above * ROW_POINTER;
  const yCells = y;
  y += cellH;
  const yIdx = y;
  if (indices) y += 20;
  const yPtrBelow = y;
  y += below * ROW_POINTER;
  const yRangesBelow = y;
  y += rangesBelow * ROW_RANGE;
  const yCirc = y;
  if (circular) y += 22;
  const height = y + PAD - 4;
  const width = Math.max(x0 * 2 + slots * cellW, hasName ? 0 : 0);
  const cx = (i: number) => x0 + (i - minIdx) * cellW + cellW / 2;

  return frames.map((f) => {
    const items: VizItem[] = [];
    const n = f.values.length;
    if (f.name) {
      items.push({
        key: "name",
        t: "text",
        x: x0,
        y: yName + 9,
        text: f.name,
        role: "title",
        weight: 600,
        anchor: "start",
      });
    }
    f.values.forEach((v, i) => {
      items.push({
        key: `c${i}`,
        t: "cell",
        x: cx(i) - cellW / 2,
        y: yCells,
        w: cellW,
        h: cellH,
        state: stateOf(f.states?.[i]),
        text: fmt(v),
      });
      if (f.indices !== false) {
        items.push({
          key: `i${i}`,
          t: "text",
          x: cx(i),
          y: yIdx + 10,
          text: String(i + (f.indexBase ?? 0)),
          role: "label",
          anchor: "middle",
          muted: true,
        });
      }
    });
    // pointers, grouped by index and side
    const groups = new Map<
      string,
      { at: number; side: "above" | "below"; names: string[]; strong: boolean }
    >();
    for (const p of f.pointers ?? []) {
      const side = p.side === "above" ? "above" : "below";
      const k = `${side}:${p.at}`;
      const g = groups.get(k) ?? { at: p.at, side, names: [], strong: false };
      g.names.push(p.name);
      g.strong = g.strong || p.strong === true;
      groups.set(k, g);
    }
    for (const g of groups.values()) {
      const label = g.names.join(", ");
      if (g.side === "above") {
        items.push({
          key: `p:${label}`,
          t: "pointer",
          x: cx(g.at),
          y: yCells - 3,
          dir: "down",
          label,
          strong: g.strong,
        });
      } else {
        items.push({
          key: `p:${label}`,
          t: "pointer",
          x: cx(g.at),
          y: yPtrBelow + 2,
          dir: "up",
          label,
          strong: g.strong,
        });
      }
    }
    let ra = 0;
    let rb = 0;
    for (const r of f.ranges ?? []) {
      const left = cx(r.from) - cellW / 2;
      const right = cx(r.to) + cellW / 2;
      if (r.side === "below") {
        const yy = yRangesBelow + rb * ROW_RANGE + ROW_RANGE / 2;
        rb += 1;
        items.push({
          key: `r:${r.label}`,
          t: "dim",
          x1: left,
          x2: right,
          y: yy,
          yRef: yCells + cellH,
          label: r.label,
          kind: "range",
        });
      } else {
        const yy = yRangesAbove + (rangesAbove - 1 - ra) * ROW_RANGE + ROW_RANGE / 2;
        ra += 1;
        items.push({
          key: `r:${r.label}`,
          t: "dim",
          x1: left,
          x2: right,
          y: yy,
          yRef: yCells,
          label: r.label,
          kind: "range",
        });
      }
    }
    if (f.compare) {
      const a = Math.min(f.compare.a, f.compare.b);
      const b = Math.max(f.compare.a, f.compare.b);
      // With a pointer above either end, the legs stop on top of its label instead of crossing it.
      const onPointer = (f.pointers ?? []).some(
        (p) => p.side === "above" && (p.at === a || p.at === b),
      );
      items.push({
        key: "cmp",
        t: "dim",
        x1: cx(a),
        x2: cx(b),
        y: yCompare + ROW_RANGE / 2,
        yRef: onPointer ? yCells - ROW_POINTER : yCells,
        label: f.compare.text,
        kind: "compare",
      });
    }
    if (f.circular && n > 1) {
      const xl = cx(n - 1);
      const xf = cx(0);
      const yb = yCirc + 2;
      items.push({
        key: "circ",
        t: "arrow",
        d: `M ${xl} ${yb} C ${xl} ${yb + 18}, ${xf} ${yb + 18}, ${xf} ${yb + 1}`,
        state: "none",
      });
    }
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// GridViz
// ---------------------------------------------------------------------------------------------

export function layoutGrid(frames: GridFrame[]): VizScene[] {
  let rows = 0;
  let cols = 0;
  let indices = false;
  for (const f of frames) {
    rows = Math.max(rows, f.cells.length);
    cols = Math.max(cols, f.cells[0]?.length ?? 0);
    if (f.indices !== false) indices = true;
  }
  const labelW = indices ? 24 : 0;
  const labelH = indices ? 22 : 0;
  const s = Math.max(28, Math.min(40, Math.floor((MAX_NATURAL_WIDTH - 2 * PAD - labelW) / cols)));
  const width = PAD + labelW + cols * s + PAD;
  const height = PAD + labelH + rows * s + PAD;
  return frames.map((f) => {
    const items: VizItem[] = [];
    const fr = f.cells.length;
    const fc = f.cells[0]?.length ?? 0;
    // A smaller preset sits centred in the panel's fixed box.
    const x0 = PAD + labelW + ((cols - fc) * s) / 2;
    const y0 = PAD + labelH + ((rows - fr) * s) / 2;
    if (f.indices !== false) {
      for (let c = 0; c < fc; c += 1) {
        items.push({
          key: `ci${c}`,
          t: "text",
          x: x0 + c * s + s / 2,
          y: y0 - labelH + 9,
          text: String(c),
          role: "label",
          anchor: "middle",
          muted: true,
        });
      }
      for (let r = 0; r < fr; r += 1) {
        items.push({
          key: `ri${r}`,
          t: "text",
          x: x0 - 8,
          y: y0 + r * s + s / 2,
          text: String(r),
          role: "label",
          anchor: "end",
          muted: true,
        });
      }
    }
    // Current cells last so their heavy edge draws over neighbours.
    const cells: VizItem[] = [];
    const current: VizItem[] = [];
    f.cells.forEach((row, r) => {
      [...row].forEach((code, c) => {
        const state = stateOf(code);
        const item: VizItem = {
          key: `g${r}_${c}`,
          t: "cell",
          x: x0 + c * s,
          y: y0 + r * s,
          w: s,
          h: s,
          state,
          text: fmt(f.values?.[r]?.[c]),
        };
        (state === "current" ? current : cells).push(item);
      });
    });
    items.push(...cells, ...current);
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// GraphViz
// ---------------------------------------------------------------------------------------------

const UNIT = 60;
const NODE_R = 18;

export function layoutGraph(frames: GraphFrame[]): VizScene[] {
  let maxX = 0;
  let maxY = 0;
  let hasValue = false;
  let hasValueLabel = false;
  for (const f of frames) {
    for (const n of f.nodes) {
      maxX = Math.max(maxX, n.x);
      maxY = Math.max(maxY, n.y);
      if (n.value !== undefined) hasValue = true;
    }
    if (f.valueLabel) hasValueLabel = true;
  }
  const pad = NODE_R + 10;
  const top = PAD + 6;
  const graphBottom = top + maxY * UNIT + 2 * pad - PAD + (hasValue ? 22 : 0);
  const width = Math.ceil(maxX * UNIT + 2 * pad);
  const height = Math.ceil(graphBottom + (hasValueLabel ? 22 : 0));
  return frames.map((f) => {
    const items: VizItem[] = [];
    const pos = new Map(
      f.nodes.map((n) => [n.id, { x: pad + n.x * UNIT, y: top + pad - PAD + n.y * UNIT }]),
    );
    if (f.valueLabel) {
      items.push({
        key: "vlabel",
        t: "text",
        x: PAD,
        y: graphBottom + 6,
        text: `Boxed under each node: ${f.valueLabel}`,
        role: "label",
        anchor: "start",
        muted: true,
      });
    }
    for (const e of f.edges) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const endGap = f.directed ? NODE_R + 4 : NODE_R;
      items.push({
        key: `e${e.a}-${e.b}`,
        t: "edge",
        x1: a.x + ux * NODE_R,
        y1: a.y + uy * NODE_R,
        x2: b.x - ux * endGap,
        y2: b.y - uy * endGap,
        state: stateOf(e.s),
        directed: f.directed === true,
        label: e.w === undefined ? undefined : fmt(e.w),
      });
    }
    for (const n of f.nodes) {
      const p = pos.get(n.id);
      if (!p) continue;
      items.push({
        key: `n${n.id}`,
        t: "node",
        cx: p.x,
        cy: p.y,
        r: NODE_R,
        state: stateOf(n.s),
        text: n.label ?? n.id,
      });
      if (n.value !== undefined) {
        items.push({
          key: `v${n.id}`,
          t: "badge",
          x: p.x,
          y: p.y + NODE_R + 13,
          text: fmt(n.value),
        });
      }
    }
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// TreeViz (tidy layout over the union of every step's tree, so nodes never move)
// ---------------------------------------------------------------------------------------------

interface UnionNode {
  id: string;
  w: number;
  children: UnionNode[];
}

export function layoutTree(frames: TreeFrame[]): VizScene[] {
  const byId = new Map<string, UnionNode>();
  let rootId: string | null = null;
  let hasNotes = false;
  const visit = (n: TreeNodeData, parent: UnionNode | null) => {
    let u = byId.get(n.id);
    // Pill ends are round: text + 16 keeps at least 6 units clear (G-VIZ collision).
    const w = Math.max(36, textWidth(n.label, "value") + 16);
    if (!u) {
      u = { id: n.id, w, children: [] };
      byId.set(n.id, u);
      if (parent) parent.children.push(u);
    } else {
      u.w = Math.max(u.w, w);
    }
    if (n.note) hasNotes = true;
    for (const c of n.children ?? []) visit(c, u);
  };
  for (const f of frames) {
    if (f.root) {
      rootId ??= f.root.id;
      visit(f.root, null);
    }
  }
  const boxH = 30;
  const levelH = hasNotes ? 70 : 58;
  if (rootId === null) {
    return frames.map(() => ({ width: 2 * PAD + 40, height: 2 * PAD + boxH, items: [] }));
  }
  const root = byId.get(rootId) as UnionNode;
  let maxW = 36;
  for (const u of byId.values()) maxW = Math.max(maxW, u.w);
  const h = hierarchy(root, (d) => d.children);
  d3tree<UnionNode>()
    .nodeSize([maxW + 12, levelH])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.15))(h);
  let minX = Infinity;
  let maxX = -Infinity;
  let maxDepth = 0;
  const place = new Map<string, { x: number; y: number }>();
  h.each((node) => {
    const x = node.x ?? 0;
    minX = Math.min(minX, x - node.data.w / 2);
    maxX = Math.max(maxX, x + node.data.w / 2);
    maxDepth = Math.max(maxDepth, node.depth);
  });
  h.each((node) => {
    place.set(node.data.id, { x: PAD - minX + (node.x ?? 0), y: PAD + (node.y ?? 0) });
  });
  const width = Math.ceil(maxX - minX + 2 * PAD);
  const height = Math.ceil(PAD * 2 + maxDepth * levelH + boxH + (hasNotes ? 20 : 0));
  return frames.map((f) => {
    const edges: VizItem[] = [];
    const nodes: VizItem[] = [];
    const walk = (n: TreeNodeData, parent: TreeNodeData | null) => {
      const p = place.get(n.id) as { x: number; y: number };
      const w = byId.get(n.id)?.w ?? 36;
      if (parent) {
        const pp = place.get(parent.id) as { x: number; y: number };
        edges.push({
          key: `e${n.id}`,
          t: "edge",
          x1: pp.x,
          // below the parent's note when it has one, so the edge never crosses the note
          y1: pp.y + boxH + (parent.note ? 22 : 0),
          x2: p.x,
          y2: p.y,
          state: stateOf(n.e),
        });
      }
      nodes.push({
        key: `n${n.id}`,
        t: "cell",
        x: p.x - w / 2,
        y: p.y,
        w,
        h: boxH,
        state: stateOf(n.s),
        text: n.label,
        shape: "pill",
      });
      if (n.note) {
        nodes.push({
          key: `note${n.id}`,
          t: "text",
          x: p.x,
          y: p.y + boxH + 11,
          text: n.note,
          role: "label",
          anchor: "middle",
          mono: true,
          weight: 600,
        });
      }
      for (const c of n.children ?? []) walk(c, n);
    };
    if (f.root) walk(f.root, null);
    return { width, height, items: [...edges, ...nodes] };
  });
}

// ---------------------------------------------------------------------------------------------
// TableViz
// ---------------------------------------------------------------------------------------------

export function layoutTable(frames: TableFrame[]): VizScene[] {
  let rows = 0;
  let cols = 0;
  let cw = 36;
  let headW = 0;
  let hasColHeads = false;
  let hasCorner = false;
  for (const f of frames) {
    rows = Math.max(rows, f.cells.length);
    cols = Math.max(cols, f.cells[0]?.length ?? 0);
    for (const row of f.cells)
      for (const v of row) cw = Math.max(cw, textWidth(fmt(v), "value") + 12);
    for (const v of f.colHeads ?? []) cw = Math.max(cw, textWidth(fmt(v), "label") + 12);
    for (const v of f.rowHeads ?? []) headW = Math.max(headW, textWidth(fmt(v), "label") + 16);
    if (f.colHeads) hasColHeads = true;
    if (f.rowTitle || f.colTitle) hasCorner = true;
  }
  if (hasCorner) headW = Math.max(headW, 30);
  const ch = 32;
  const headH = hasColHeads || hasCorner ? 24 : 0;
  const x0 = PAD + headW;
  const y0 = PAD + headH;
  const width = x0 + cols * cw + PAD;
  const height = y0 + rows * ch + PAD;
  return frames.map((f) => {
    const items: VizItem[] = [];
    if (f.rowTitle)
      items.push({
        key: "rt",
        t: "text",
        x: PAD + 2,
        y: y0 - 6,
        text: f.rowTitle,
        role: "label",
        anchor: "start",
        muted: true,
        mono: true,
      });
    if (f.colTitle)
      items.push({
        key: "ct",
        t: "text",
        x: x0 - 4,
        y: PAD + 8,
        text: f.colTitle,
        role: "label",
        anchor: "end",
        muted: true,
        mono: true,
      });
    (f.colHeads ?? []).forEach((v, c) => {
      items.push({
        key: `ch${c}`,
        t: "text",
        x: x0 + c * cw + cw / 2,
        y: PAD + 11,
        text: fmt(v),
        role: "label",
        anchor: "middle",
        muted: true,
      });
    });
    (f.rowHeads ?? []).forEach((v, r) => {
      items.push({
        key: `rh${r}`,
        t: "text",
        x: x0 - 8,
        y: y0 + r * ch + ch / 2,
        text: fmt(v),
        role: "label",
        anchor: "end",
        muted: true,
      });
    });
    const cells: VizItem[] = [];
    const current: VizItem[] = [];
    f.cells.forEach((row, r) => {
      row.forEach((v, c) => {
        const state = stateOf(f.states?.[r]?.[c]);
        const item: VizItem = {
          key: `t${r}_${c}`,
          t: "cell",
          x: x0 + c * cw,
          y: y0 + r * ch,
          w: cw,
          h: ch,
          state,
          text: fmt(v),
        };
        (state === "current" ? current : cells).push(item);
      });
    });
    items.push(...cells, ...current);
    for (const a of f.arrows ?? []) {
      const [r1, c1] = a.from;
      const [r2, c2] = a.to;
      const sx = x0 + c1 * cw + cw / 2;
      const sy = y0 + r1 * ch + ch / 2;
      const tx = x0 + c2 * cw + cw / 2;
      const ty = y0 + r2 * ch + ch / 2;
      const key = `a${r1}_${c1}-${r2}_${c2}`;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
        // Neighbours: a short arrow across the shared border, beside the values.
        const d =
          r1 !== r2
            ? `M ${sx + cw * 0.34} ${sy + Math.sign(ty - sy) * (ch / 2 - 7)} L ${tx + cw * 0.34} ${ty - Math.sign(ty - sy) * (ch / 2 - 7)}`
            : `M ${sx + Math.sign(tx - sx) * (cw / 2 - 8)} ${sy - ch * 0.28} L ${tx - Math.sign(tx - sx) * (cw / 2 - 8)} ${ty - ch * 0.28}`;
        items.push({ key, t: "arrow", d, state: "none" });
        continue;
      }
      // Farther cells: from the source cell's edge to the target cell's edge, slightly bowed.
      const dx = tx - sx;
      const dy = ty - sy;
      const edge = (hw: number, hh: number) =>
        Math.min(hw / (Math.abs(dx) || 1e-9), hh / (Math.abs(dy) || 1e-9));
      const t1 = edge(cw / 2 - 3, ch / 2 - 3);
      const t2 = edge(cw / 2 - 2, ch / 2 - 2);
      const x1 = sx + dx * t1;
      const y1 = sy + dy * t1;
      const x2 = tx - dx * t2;
      const y2 = ty - dy * t2;
      const len = Math.hypot(dx, dy) || 1;
      const mx = (x1 + x2) / 2 - (dy / len) * 10;
      const my = (y1 + y2) / 2 + (dx / len) * 10;
      items.push({ key, t: "arrow", d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, state: "none" });
    }
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// StructViz
// ---------------------------------------------------------------------------------------------

function itemKeys(items: StructFrame["items"]): string[] {
  const seen = new Map<string, number>();
  return items.map((it, i) => {
    if (it.id !== undefined) return `id:${it.id}`;
    const base = `v:${fmt(it.k ?? null)}:${fmt(it.v)}`;
    const k = seen.get(base) ?? 0;
    seen.set(base, k + 1);
    return k === 0 ? base : `${base}#${k}#${i}`;
  });
}

export function layoutStruct(frames: StructFrame[]): VizScene[] {
  const kind = frames[0]?.kind ?? "queue";
  let cap = 1;
  let textW = 0;
  let keyW = 0;
  let hasName = false;
  for (const f of frames) {
    cap = Math.max(cap, f.items.length);
    for (const it of f.items) {
      textW = Math.max(textW, textWidth(fmt(it.v), "value"));
      if (it.k !== undefined) keyW = Math.max(keyW, textWidth(fmt(it.k), "value"));
    }
    if (f.name) hasName = true;
  }
  const top = PAD + (hasName ? 22 : 0);
  const title = (f: StructFrame): VizItem[] =>
    f.name
      ? [
          {
            key: "name",
            t: "text",
            x: PAD,
            y: PAD + 9,
            text: f.name,
            role: "title",
            weight: 600,
            anchor: "start",
          },
        ]
      : [];

  /** A heap or map with no items still says so (its box keeps the size of its fullest step). */
  const emptyNote = (
    f: StructFrame,
    x: number,
    y: number,
    anchor: "start" | "middle" = "start",
  ): VizItem[] =>
    f.items.length === 0
      ? [{ key: "empty", t: "text", x, y, text: "empty", role: "label", anchor, muted: true }]
      : [];

  if (kind === "stack") {
    const w = Math.max(56, textW + 20);
    const h = 30;
    const gap = 4;
    const slotH = cap * (h + gap) + gap + 4;
    const labelW = textWidth("top", "label") + 26;
    const width = PAD * 2 + w + 12 + labelW;
    const height = top + slotH + PAD;
    const bottom = top + slotH - 4;
    return frames.map((f) => {
      const items: VizItem[] = [
        ...title(f),
        { key: "slot", t: "slot", x: PAD, y: top, w: w + 12, h: slotH, open: "top" },
      ];
      const keys = itemKeys(f.items);
      f.items.forEach((it, i) => {
        items.push({
          key: keys[i] as string,
          t: "cell",
          x: PAD + 6,
          y: bottom - (i + 1) * (h + gap) + gap - 2,
          w,
          h,
          state: stateOf(it.s),
          text: fmt(it.v),
        });
      });
      if (f.items.length > 0) {
        const yTop = bottom - f.items.length * (h + gap) + gap - 2 + h / 2;
        items.push({
          key: "p:top",
          t: "pointer",
          x: PAD + w + 14,
          y: yTop,
          dir: "left",
          label: "top",
        });
      }
      return { width, height, items };
    });
  }

  if (kind === "queue" || kind === "deque") {
    const w = Math.max(44, textW + 16);
    const h = 36;
    const gap = 4;
    const slotW = cap * (w + gap) + gap;
    const width = PAD * 2 + slotW;
    const height = top + h + 8 + ROW_POINTER + PAD;
    return frames.map((f) => {
      const items: VizItem[] = [
        ...title(f),
        { key: "slot", t: "slot", x: PAD, y: top, w: slotW, h: h + 8, open: "ends" },
      ];
      const keys = itemKeys(f.items);
      f.items.forEach((it, i) => {
        items.push({
          key: keys[i] as string,
          t: "cell",
          x: PAD + gap + i * (w + gap),
          y: top + 4,
          w,
          h,
          state: stateOf(it.s),
          text: fmt(it.v),
        });
      });
      const n = f.items.length;
      const cx = (i: number) => PAD + gap + i * (w + gap) + w / 2;
      const py = top + h + 8 + 2;
      if (n === 1) {
        items.push({
          key: "p:front",
          t: "pointer",
          x: cx(0),
          y: py,
          dir: "up",
          label: "front, back",
        });
      } else if (n > 1) {
        items.push({ key: "p:front", t: "pointer", x: cx(0), y: py, dir: "up", label: "front" });
        items.push({ key: "p:back", t: "pointer", x: cx(n - 1), y: py, dir: "up", label: "back" });
      }
      return { width, height, items };
    });
  }

  if (kind === "heap") {
    // One composed unit per step: the tree directly above the array, the tree centred over the
    // array, the pair anchored under the panel title. Tree nodes are pills sized for the widest
    // entry (text at least 8 units from each end, so tuples such as "4, B" never touch the edge);
    // the indices live under the array cells only (DESIGN.md → StructViz).
    const cw = Math.max(34, textW + 16);
    const ch = 32;
    const nw = Math.max(40, textW + 16);
    const nh = 30;
    const gapX = 12;
    const levelH = nh + 26;
    const slot = nw + gapX;
    const levelsOf = (n: number) => (n > 0 ? Math.floor(Math.log2(n)) + 1 : 0);
    const treeWOf = (n: number) => (n > 0 ? 2 ** (levelsOf(n) - 1) * slot - gapX : 0);
    const treeTop = top + nh / 2 + 4;
    // At least 20 units between the lowest tree node and the array.
    const yArrayOf = (n: number) =>
      n > 0 ? treeTop + (levelsOf(n) - 1) * levelH + nh / 2 + 20 : top + 4;
    let maxW = 0;
    for (const f of frames) maxW = Math.max(maxW, treeWOf(f.items.length), f.items.length * cw);
    const width = PAD * 2 + Math.max(maxW, 60);
    const height = yArrayOf(cap) + ch + 20 + PAD;
    return frames.map((f) => {
      const n = f.items.length;
      const treeW = treeWOf(n);
      const arrayW = n * cw;
      const groupW = Math.max(treeW, arrayW);
      const tx = PAD + (groupW - treeW) / 2;
      const ax = PAD + (groupW - arrayW) / 2;
      const yArray = yArrayOf(n);
      const nodePos = (i: number) => {
        const d = Math.floor(Math.log2(i + 1));
        const p = i + 1 - 2 ** d;
        return { x: tx + ((p + 0.5) * (treeW + gapX)) / 2 ** d, y: treeTop + d * levelH };
      };
      const items: VizItem[] = [...title(f), ...emptyNote(f, PAD, yArray + ch / 2)];
      f.items.forEach((_, i) => {
        if (i === 0) return;
        const a = nodePos(Math.floor((i - 1) / 2));
        const b = nodePos(i);
        items.push({
          key: `he${i}`,
          t: "edge",
          x1: a.x,
          y1: a.y + nh / 2,
          x2: b.x,
          y2: b.y - nh / 2,
          state: "none",
        });
      });
      f.items.forEach((it, i) => {
        const p = nodePos(i);
        const state = stateOf(it.s);
        items.push({
          key: `hn${i}`,
          t: "cell",
          x: p.x - nw / 2,
          y: p.y - nh / 2,
          w: nw,
          h: nh,
          state,
          text: fmt(it.v),
          shape: "pill",
        });
        items.push({
          key: `hc${i}`,
          t: "cell",
          x: ax + i * cw,
          y: yArray,
          w: cw,
          h: ch,
          state,
          text: fmt(it.v),
        });
        items.push({
          key: `hx${i}`,
          t: "text",
          x: ax + i * cw + cw / 2,
          y: yArray + ch + 10,
          text: String(i),
          role: "label",
          anchor: "middle",
          muted: true,
        });
      });
      return { width, height, items };
    });
  }

  if (kind === "map") {
    const kw = Math.max(40, keyW + 18);
    const vw = Math.max(40, textW + 18);
    const h = 30;
    const gap = 6;
    const width = PAD * 2 + kw + 34 + vw;
    const height = top + cap * (h + gap) - gap + PAD;
    return frames.map((f) => {
      const items: VizItem[] = [...title(f), ...emptyNote(f, PAD, top + h / 2)];
      f.items.forEach((it, i) => {
        const y = top + i * (h + gap);
        const key = `k:${fmt(it.k ?? null)}`;
        const state = stateOf(it.s);
        items.push({ key, t: "cell", x: PAD, y, w: kw, h, state, text: fmt(it.k ?? null) });
        items.push({
          key: `${key}:a`,
          t: "arrow",
          d: `M ${PAD + kw + 5} ${y + h / 2} L ${PAD + kw + 28} ${y + h / 2}`,
          state: "none",
        });
        items.push({
          key: `${key}:v`,
          t: "cell",
          x: PAD + kw + 34,
          y,
          w: vw,
          h,
          state,
          text: fmt(it.v),
        });
      });
      return { width, height, items };
    });
  }

  // set: chips inside a rounded container, wrapping
  const w = Math.max(40, textW + 16);
  const h = 32;
  const gap = 6;
  const perRow = Math.max(
    1,
    Math.min(cap, Math.floor((MAX_NATURAL_WIDTH - 2 * PAD - 12 + gap) / (w + gap))),
  );
  const rowsN = Math.ceil(cap / perRow);
  const boxW = perRow * (w + gap) - gap + 16;
  const boxH = rowsN * (h + gap) - gap + 16;
  const width = PAD * 2 + boxW;
  const height = top + boxH + PAD;
  return frames.map((f) => {
    const items: VizItem[] = [
      ...title(f),
      { key: "slot", t: "slot", x: PAD, y: top, w: boxW, h: boxH, open: "none" },
    ];
    const keys = itemKeys(f.items);
    f.items.forEach((it, i) => {
      const r = Math.floor(i / perRow);
      const c = i % perRow;
      items.push({
        key: keys[i] as string,
        t: "cell",
        x: PAD + 8 + c * (w + gap),
        y: top + 8 + r * (h + gap),
        w,
        h,
        state: stateOf(it.s),
        text: fmt(it.v),
      });
    });
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// LineViz (number line, or a clock / modulo wheel)
// ---------------------------------------------------------------------------------------------

export function layoutLine(frames: LineFrame[]): VizScene[] {
  const first = frames[0] as LineFrame;
  if ((first.kind ?? "line") === "wheel") return layoutWheel(frames);
  const lo = Math.min(...frames.map((f) => f.min));
  const hi = Math.max(...frames.map((f) => f.max));
  const tick = first.tick ?? 1;
  let rows = 0;
  let hasSweep = false;
  let hasPointLabels = false;
  for (const f of frames) {
    for (const iv of f.intervals ?? []) rows = Math.max(rows, (iv.row ?? 0) + 1);
    if (f.sweep) hasSweep = true;
    if ((f.points ?? []).some((p) => p.label)) hasPointLabels = true;
  }
  const nT = Math.round((hi - lo) / tick);
  const spacing = Math.max(16, Math.min(44, Math.floor((MAX_NATURAL_WIDTH - 2 * PAD - 24) / nT)));
  const x0 = PAD + 12;
  const width = x0 * 2 + nT * spacing;
  const ySweepLabel = PAD + 8;
  const yRows = PAD + (hasSweep ? 22 : 0);
  const rowH = 30;
  const yPointLabel = yRows + rows * rowH;
  const yAxis = yPointLabel + (hasPointLabels ? 26 : 10);
  const height = yAxis + 34;
  const X = (v: number) => x0 + ((v - lo) / tick) * spacing;
  return frames.map((f) => {
    const items: VizItem[] = [];
    items.push({
      key: "axis",
      t: "line",
      points: [
        [x0 - 8, yAxis],
        [X(hi) + 8, yAxis],
      ],
      style: "axis",
      state: "none",
    });
    for (let k = 0; k <= nT; k += 1) {
      const v = lo + k * tick;
      items.push({
        key: `t${k}`,
        t: "line",
        points: [
          [X(v), yAxis - 5],
          [X(v), yAxis + 5],
        ],
        style: "axis",
        state: "none",
      });
      items.push({
        key: `tl${k}`,
        t: "text",
        x: X(v),
        y: yAxis + 18,
        text: String(v),
        role: "label",
        anchor: "middle",
        muted: true,
      });
    }
    (f.intervals ?? []).forEach((iv, i) => {
      const y = yRows + (iv.row ?? 0) * rowH + 20;
      const state = stateOf(iv.s);
      items.push({
        key: `iv${i}`,
        t: "line",
        points: [
          [X(iv.a), y],
          [X(iv.b), y],
        ],
        style: 0,
        state: state === "none" ? "done" : state,
      });
      items.push({
        key: `ivl${i}a`,
        t: "line",
        points: [
          [X(iv.a), y - 6],
          [X(iv.a), y + 6],
        ],
        style: 0,
        state: state === "none" ? "done" : state,
      });
      items.push({
        key: `ivl${i}b`,
        t: "line",
        points: [
          [X(iv.b), y - 6],
          [X(iv.b), y + 6],
        ],
        style: 0,
        state: state === "none" ? "done" : state,
      });
      if (iv.label)
        items.push({
          key: `ivt${i}`,
          t: "text",
          x: (X(iv.a) + X(iv.b)) / 2,
          y: y - 12,
          text: iv.label,
          role: "label",
          anchor: "middle",
        });
    });
    (f.points ?? []).forEach((p, i) => {
      items.push({
        key: `pt${i}`,
        t: "node",
        cx: X(p.x),
        cy: yAxis,
        r: 7,
        state: stateOf(p.s) === "none" ? "done" : stateOf(p.s),
      });
      if (p.label)
        items.push({
          key: `ptl${i}`,
          t: "text",
          x: X(p.x),
          y: yAxis - 20,
          text: p.label,
          role: "label",
          anchor: "middle",
          weight: 600,
        });
    });
    if (f.sweep) {
      items.push({
        key: "sweep",
        t: "line",
        points: [
          [X(f.sweep.x), yRows],
          [X(f.sweep.x), yAxis + 6],
        ],
        style: "sweep",
        state: "current",
      });
      if (f.sweep.label)
        items.push({
          key: "sweepl",
          t: "text",
          x: X(f.sweep.x),
          y: ySweepLabel,
          text: f.sweep.label,
          role: "label",
          anchor: "middle",
          weight: 700,
        });
    }
    return { width, height, items };
  });
}

function layoutWheel(frames: LineFrame[]): VizScene[] {
  const n = Math.max(...frames.map((f) => f.max - f.min));
  const R = 96;
  const c = R + 34;
  const width = 2 * c;
  const height = 2 * c;
  const at = (k: number, rr: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * k) / n;
    return { x: c + rr * Math.cos(a), y: c + rr * Math.sin(a) };
  };
  return frames.map((f) => {
    const items: VizItem[] = [];
    const ring: [number, number][] = [];
    for (let k = 0; k <= 48; k += 1) {
      const a = -Math.PI / 2 + (2 * Math.PI * k) / 48;
      ring.push([c + R * Math.cos(a), c + R * Math.sin(a)]);
    }
    items.push({ key: "ring", t: "line", points: ring, style: "axis", state: "none" });
    for (let k = 0; k < n; k += 1) {
      const p = at(k, R + 20);
      items.push({
        key: `wl${k}`,
        t: "text",
        x: p.x,
        y: p.y,
        text: String(k),
        role: "label",
        anchor: "middle",
        muted: true,
      });
      const t1 = at(k, R - 5);
      const t2 = at(k, R + 5);
      items.push({
        key: `wt${k}`,
        t: "line",
        points: [
          [t1.x, t1.y],
          [t2.x, t2.y],
        ],
        style: "axis",
        state: "none",
      });
    }
    if (f.at !== undefined) {
      const p = at(((f.at % n) + n) % n, R - 16);
      items.push({
        key: "hand",
        t: "arrow",
        d: `M ${c} ${c} L ${p.x} ${p.y}`,
        state: "current",
        dot: { x: c, y: c },
      });
    }
    (f.points ?? []).forEach((pt, i) => {
      const p = at(((Math.round(pt.x) % n) + n) % n, R);
      items.push({
        key: `wp${i}`,
        t: "node",
        cx: p.x,
        cy: p.y,
        r: 9,
        state: stateOf(pt.s) === "none" ? "done" : stateOf(pt.s),
      });
      if (pt.label) {
        const q = at(((Math.round(pt.x) % n) + n) % n, R - 26);
        items.push({
          key: `wpl${i}`,
          t: "text",
          x: q.x,
          y: q.y,
          text: pt.label,
          role: "label",
          anchor: "middle",
          weight: 600,
        });
      }
    });
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// PlotViz
// ---------------------------------------------------------------------------------------------

function niceTicks(min: number, max: number): number[] {
  const span = max - min;
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= 5) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step)
    out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

export function layoutPlot(frames: PlotFrame[]): VizScene[] {
  const f0 = frames[0] as PlotFrame;
  const xt = f0.x.ticks ?? niceTicks(f0.x.min, f0.x.max);
  const yt = f0.y.ticks ?? niceTicks(f0.y.min, f0.y.max);
  let labelW = 0;
  for (const f of frames)
    for (const s of f.series) labelW = Math.max(labelW, textWidth(s.label, "label"));
  const left = PAD + Math.max(...yt.map((v) => textWidth(fmt(v), "label"))) + 8;
  const right = labelW + 14 + PAD;
  const topY = PAD + 22;
  const plotW = MAX_NATURAL_WIDTH - left - right;
  const plotH = 190;
  const bottom = topY + plotH;
  const width = left + plotW + right;
  const height = bottom + 44;
  const X = (v: number) => left + ((v - f0.x.min) / (f0.x.max - f0.x.min)) * plotW;
  const Y = (v: number) => bottom - ((v - f0.y.min) / (f0.y.max - f0.y.min)) * plotH;
  return frames.map((f) => {
    const items: VizItem[] = [];
    for (const v of yt) {
      items.push({
        key: `gy${v}`,
        t: "line",
        points: [
          [left, Y(v)],
          [left + plotW, Y(v)],
        ],
        style: "grid",
        state: "none",
      });
      items.push({
        key: `ty${v}`,
        t: "text",
        x: left - 8,
        y: Y(v),
        text: fmt(v),
        role: "label",
        anchor: "end",
        muted: true,
      });
    }
    for (const v of xt) {
      items.push({
        key: `tx${v}`,
        t: "text",
        x: X(v),
        y: bottom + 16,
        text: fmt(v),
        role: "label",
        anchor: "middle",
        muted: true,
      });
      items.push({
        key: `tk${v}`,
        t: "line",
        points: [
          [X(v), bottom],
          [X(v), bottom + 5],
        ],
        style: "axis",
        state: "none",
      });
    }
    items.push({
      key: "ylabel",
      t: "text",
      x: left - 8,
      y: PAD + 8,
      text: f.y.label,
      role: "label",
      anchor: "start",
      weight: 600,
    });
    items.push({
      key: "xlabel",
      t: "text",
      x: left + plotW / 2,
      y: bottom + 36,
      text: f.x.label,
      role: "label",
      anchor: "middle",
      weight: 600,
    });
    if (f.band) {
      items.push({
        key: "band",
        t: "band",
        x: X(f.band.a),
        y: topY,
        w: X(f.band.b) - X(f.band.a),
        h: plotH,
      });
      if (f.band.label)
        items.push({
          key: "bandl",
          t: "text",
          x: X(f.band.a) + 6,
          y: topY + 12,
          text: f.band.label,
          role: "label",
          anchor: "start",
        });
    }
    items.push({
      key: "xaxis",
      t: "line",
      points: [
        [left, bottom],
        [left + plotW, bottom],
      ],
      style: "axis",
      state: "none",
    });
    items.push({
      key: "yaxis",
      t: "line",
      points: [
        [left, topY - 6],
        [left, bottom],
      ],
      style: "axis",
      state: "none",
    });
    const labels: { key: string; y: number; x: number; text: string }[] = [];
    f.series.forEach((s, si) => {
      // Clip to the plot: keep points up to where the series first leaves through the top.
      const raw = s.pts.map(([x, y]) => [X(x), Y(y)] as [number, number]);
      const pts: [number, number][] = [];
      for (let i = 0; i < raw.length; i += 1) {
        const [bx, by] = raw[i] as [number, number];
        if (by >= topY) {
          pts.push([bx, by]);
          continue;
        }
        const prev = raw[i - 1];
        if (prev && prev[1] >= topY) {
          const t = (prev[1] - topY) / (prev[1] - by);
          pts.push([prev[0] + t * (bx - prev[0]), topY]);
        }
        break;
      }
      items.push({
        key: `s${s.id}`,
        t: "line",
        points: pts,
        style: (s.style ?? si % 4) as 0 | 1 | 2 | 3,
        state: stateOf(s.s),
      });
      const end = pts[pts.length - 1];
      if (end)
        labels.push({
          key: `sl${s.id}`,
          x: Math.min(end[0], left + plotW),
          y: end[1],
          text: s.label,
        });
    });
    labels.sort((a, b) => a.y - b.y);
    for (let i = 1; i < labels.length; i += 1) {
      const prev = labels[i - 1] as { y: number };
      const cur = labels[i] as { y: number };
      if (cur.y - prev.y < 17) cur.y = prev.y + 17;
    }
    for (const l of labels)
      items.push({
        key: l.key,
        t: "text",
        x: l.x + 6,
        y: l.y,
        text: l.text,
        role: "label",
        anchor: "start",
        weight: 600,
      });
    if (f.vline) {
      items.push({
        key: "vline",
        t: "line",
        points: [
          [X(f.vline.x), topY - 6],
          [X(f.vline.x), bottom],
        ],
        style: "sweep",
        state: "current",
      });
      if (f.vline.label) {
        // Centred on its line, but never over the y-axis title in the same top row.
        const half = textWidth(f.vline.label, "label") / 2;
        const clearOfTitle =
          f.y.label && topY - 14 - (PAD + 8) < FONT.label
            ? left - 8 + textWidth(f.y.label, "label") + 8 + half
            : 0;
        const vx = Math.min(Math.max(X(f.vline.x), clearOfTitle, half + 2), width - half - 2);
        items.push({
          key: "vlinel",
          t: "text",
          x: vx,
          y: topY - 14,
          text: f.vline.label,
          role: "label",
          anchor: "middle",
          weight: 700,
        });
      }
    }
    // Marker labels: the first free spot of left, right, above, below (then further up), inside
    // the plot area and clear of the other marker labels, the markers and the series labels.
    type Spot = { x: number; y: number; anchor: "start" | "middle" | "end" };
    const lh = FONT.label + 3;
    const taken: { x1: number; x2: number; y1: number; y2: number }[] = [];
    for (const l of labels) {
      const w = textWidth(l.text, "label");
      taken.push({ x1: l.x + 6, x2: l.x + 6 + w, y1: l.y - lh / 2, y2: l.y + lh / 2 });
    }
    for (const m of f.markers ?? [])
      taken.push({ x1: X(m.x) - 7, x2: X(m.x) + 7, y1: Y(m.y) - 7, y2: Y(m.y) + 7 });
    const spotOf = new Map<number, Spot>();
    (f.markers ?? [])
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.label)
      .sort((a, b) => Y(a.m.y) - Y(b.m.y))
      .forEach(({ m, i }) => {
        const mx = X(m.x);
        const my = Y(m.y);
        const w = textWidth(m.label as string, "label", true);
        const box = (s: Spot) => {
          const x1 = s.anchor === "end" ? s.x - w : s.anchor === "middle" ? s.x - w / 2 : s.x;
          return { x1, x2: x1 + w, y1: s.y - lh / 2, y2: s.y + lh / 2 };
        };
        const spots: Spot[] = [
          { x: mx - 8, y: my, anchor: "end" },
          { x: mx + 8, y: my, anchor: "start" },
          { x: mx, y: my - 14, anchor: "middle" },
          { x: mx, y: my + 14, anchor: "middle" },
        ];
        for (let k = 1; k <= 6; k += 1)
          spots.push(
            { x: mx - 8, y: my - k * lh, anchor: "end" },
            { x: mx + 8, y: my - k * lh, anchor: "start" },
          );
        const free = (s: Spot) => {
          const b = box(s);
          if (b.x1 < left + 2 || b.x2 > width - PAD || b.y1 < topY - 6 || b.y2 > bottom - 2)
            return false;
          return taken.every((t) => b.x2 <= t.x1 || t.x2 <= b.x1 || b.y2 <= t.y1 || t.y2 <= b.y1);
        };
        const spot = spots.find(free) ?? (spots[0] as Spot);
        taken.push(box(spot));
        spotOf.set(i, spot);
      });
    (f.markers ?? []).forEach((m, i) => {
      items.push({
        key: `m${i}`,
        t: "node",
        cx: X(m.x),
        cy: Y(m.y),
        r: 5,
        state: stateOf(m.s) === "none" ? "current" : stateOf(m.s),
      });
      if (m.label)
        items.push({
          key: `ml${i}`,
          t: "text",
          x: spotOf.get(i)?.x ?? X(m.x) - 8,
          y: spotOf.get(i)?.y ?? Y(m.y),
          text: m.label,
          role: "label",
          anchor: spotOf.get(i)?.anchor ?? "end",
          mono: true,
          weight: 600,
        });
    });
    return { width, height, items };
  });
}

// ---------------------------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------------------------

type Layouts = { [K in keyof FrameByViz]: (frames: FrameByViz[K][]) => VizScene[] };

export const LAYOUTS: Layouts = {
  ArrayViz: layoutArray,
  GridViz: layoutGrid,
  GraphViz: layoutGraph,
  TreeViz: layoutTree,
  TableViz: layoutTable,
  StructViz: layoutStruct,
  LineViz: layoutLine,
  PlotViz: layoutPlot,
  StdinScene: layoutStdinScene,
  JudgeScene: layoutJudgeScene,
};

/** Lay out every frame of one panel (all steps of all presets, so the box never changes). */
export function layoutPanel<K extends keyof FrameByViz>(
  viz: K,
  frames: FrameByViz[K][],
): VizScene[] {
  const fn = LAYOUTS[viz] as (frames: FrameByViz[K][]) => VizScene[];
  return fn(frames);
}

export { FONT };
