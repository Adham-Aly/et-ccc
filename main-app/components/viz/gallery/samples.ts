// Inline sample frames for the /dev/viz gallery: every visualizer in every state it draws.
// Neutral data made up for the gallery (no CCC problem, no solution).
import type {
  ArrayFrame,
  GraphFrame,
  GridFrame,
  LineFrame,
  PlotFrame,
  StructFrame,
  TableFrame,
  TreeFrame,
} from "@/lib/viz/schema";

export const arrayStates: ArrayFrame = {
  name: "nums",
  values: [3, 8, 5, 1, 9, 4, 7],
  states: ".qcdpmx",
  pointers: [
    { name: "lo", at: 0 },
    { name: "mid", at: 2, strong: true },
    { name: "hi", at: 6 },
  ],
  ranges: [{ from: 0, to: 6, label: "7 items" }],
};

export const arrayCompare: ArrayFrame = {
  values: [2, 5, 8, 11, 14],
  states: "__mm_",
  compare: { a: 1, b: 2, text: "5 < 8" },
  pointers: [
    { name: "i", at: 1, side: "above" },
    { name: "j", at: 2, side: "above" },
  ],
  ranges: [{ from: 1, to: 3, label: "window", side: "below" }],
};

export const arrayCircular: ArrayFrame = {
  values: ["a", "b", "c", "d", "e"],
  states: "d.c..",
  pointers: [{ name: "head", at: 2, strong: true }],
  circular: true,
  indices: true,
};

export const gridStates: GridFrame = {
  cells: ["pp.#..", ".pq#.x", "cpd..m", "dpp##."],
  values: [
    [0, 1, null, null, null, null],
    [1, 2, 3, null, null, null],
    [2, 3, 4, null, null, null],
    [3, 4, 5, null, null, null],
  ],
};

export const gridPlain: GridFrame = {
  cells: ["....", ".##.", "...."],
  indices: false,
};

export const graphStates: GraphFrame = {
  directed: false,
  valueLabel: "distance",
  nodes: [
    { id: "A", x: 0, y: 1, s: "d", value: 0 },
    { id: "B", x: 1.5, y: 0, s: "c", value: 2 },
    { id: "C", x: 1.5, y: 2, s: "q", value: 5 },
    { id: "D", x: 3, y: 0, s: "p", value: 3 },
    { id: "E", x: 3, y: 2, s: ".", value: "∞" },
    { id: "F", x: 4.5, y: 1, s: "x", value: "∞" },
  ],
  edges: [
    { a: "A", b: "B", w: 2, s: "p" },
    { a: "A", b: "C", w: 5, s: "d" },
    { a: "B", b: "D", w: 1, s: "c" },
    { a: "B", b: "C", w: 4, s: "m" },
    { a: "C", b: "E", w: 3, s: "q" },
    { a: "D", b: "F", w: 6, s: "x" },
    { a: "E", b: "F", w: 1 },
  ],
};

export const graphDirected: GraphFrame = {
  directed: true,
  nodes: [
    { id: "1", x: 0, y: 0 },
    { id: "2", x: 2, y: 0, s: "c" },
    { id: "3", x: 1, y: 1.5, s: "d" },
    { id: "4", x: 3, y: 1.5 },
  ],
  edges: [
    { a: "1", b: "2" },
    { a: "2", b: "4", s: "q" },
    { a: "3", b: "1", s: "d" },
    { a: "3", b: "2" },
  ],
};

export const treeStates: TreeFrame = {
  root: {
    id: "r",
    label: "f(4)",
    s: "c",
    children: [
      {
        id: "a",
        label: "f(3)",
        s: "d",
        note: "= 3",
        e: "d",
        children: [
          { id: "aa", label: "f(2)", s: "d", note: "= 2", e: "d" },
          { id: "ab", label: "f(1)", s: "p", note: "= 1", e: "p" },
        ],
      },
      {
        id: "b",
        label: "f(2)",
        s: "q",
        e: "q",
        children: [
          { id: "ba", label: "f(1)", s: "m", e: "m" },
          { id: "bb", label: "f(0)", s: "x", e: "x" },
        ],
      },
    ],
  },
};

export const tableStates: TableFrame = {
  rowTitle: "i",
  colTitle: "w",
  colHeads: [0, 1, 2, 3, 4, 5],
  rowHeads: [0, 1, 2, 3],
  cells: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 3, 3, 3, 3],
    [0, 0, 3, 4, 4, 7],
    [0, 0, 3, 4, 5, null],
  ],
  states: ["dddddd", "dddddd", "ddmddm", "ddddpc"],
  arrows: [
    { from: [2, 5], to: [3, 5] },
    { from: [2, 2], to: [3, 5] },
  ],
};

export const structStack: StructFrame = {
  kind: "stack",
  name: "stack",
  items: [
    { v: 4, s: "d" },
    { v: 9, s: "d" },
    { v: 2, s: "c" },
  ],
};

export const structQueue: StructFrame = {
  kind: "queue",
  name: "queue",
  items: [
    { v: "A", s: "c" },
    { v: "C", s: "q" },
    { v: "D", s: "q" },
    { v: "F", s: "q" },
  ],
};

export const structDeque: StructFrame = {
  kind: "deque",
  name: "deque",
  items: [
    { v: 7, s: "d" },
    { v: 5, s: "m" },
    { v: 2, s: "c" },
  ],
};

export const structHeap: StructFrame = {
  kind: "heap",
  name: "heap",
  items: [
    { v: 1, s: "c" },
    { v: 3, s: "m" },
    { v: 2, s: "m" },
    { v: 7 },
    { v: 4 },
    { v: 5, s: "q" },
    { v: 9 },
  ],
};

export const structMap: StructFrame = {
  kind: "map",
  name: "count",
  items: [
    { k: "'a'", v: 3, s: "c" },
    { k: "'b'", v: 1 },
    { k: "'z'", v: 2, s: "d" },
  ],
};

export const structSet: StructFrame = {
  kind: "set",
  name: "seen",
  items: [{ v: 2 }, { v: 3, s: "c" }, { v: 5 }, { v: 7, s: "q" }, { v: 11, s: "x" }],
};

export const lineStates: LineFrame = {
  min: 0,
  max: 10,
  points: [
    { x: 2, label: "a", s: "d" },
    { x: 6, label: "b", s: "c" },
  ],
  intervals: [
    { a: 1, b: 4, label: "[1, 4]", s: "d", row: 0 },
    { a: 3, b: 7, label: "[3, 7]", s: "c", row: 1 },
    { a: 8, b: 10, label: "[8, 10]", s: "q", row: 0 },
  ],
  sweep: { x: 5, label: "x = 5" },
};

export const lineWheel: LineFrame = {
  kind: "wheel",
  min: 0,
  max: 12,
  at: 9,
  points: [
    { x: 3, label: "start", s: "d" },
    { x: 9, s: "c" },
  ],
};

export const plotStates: PlotFrame = {
  x: { min: 0, max: 10, label: "x" },
  y: { min: 0, max: 30, label: "f(x)" },
  series: [
    {
      id: "f",
      label: "f(x)",
      pts: Array.from(
        { length: 21 },
        (_, i) => [i / 2, (i / 2 - 6) ** 2 * 0.7 + 3] as [number, number],
      ),
      style: 0,
    },
    {
      id: "g",
      label: "x + 5",
      pts: [
        [0, 5],
        [10, 15],
      ],
      style: 1,
    },
    {
      id: "h",
      label: "3x",
      pts: [
        [0, 0],
        [10, 30],
      ],
      style: 2,
      s: "d",
    },
  ],
  band: { a: 3, b: 8, label: "search range" },
  vline: { x: 6, label: "mid" },
  markers: [{ x: 6, y: 3, label: "3" }],
};
