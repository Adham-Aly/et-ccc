// Zod schemas for every visual data file (plan §4.11.6, G-VIZ): the per-visualizer frame
// schemas, the `.frames.json` / `.trace.json` files written by tools/viz, and the authored
// `.viz.yaml` / `.trace.yaml` configs. Pure TypeScript (no JSX, no Next imports) so the Node
// gate scripts can load it with type stripping (tools/viz/register.mjs).
import { z } from "zod";

// The state vocabulary lives in ./states (no Zod), so client code can use it without pulling
// Zod into the browser bundle.
import { VIZ_STATES } from "./states";

export { STATE_CODES, type StateCode, stateOf, VIZ_STATES, type VizState } from "./states";

const stateCodeRe = /^[_.qcdpmx#]*$/;

export const stateSchema = z.enum(VIZ_STATES);
/** A string of state codes, one per item. */
export const stateStringSchema = z
  .string()
  .regex(stateCodeRe, "state codes must be one of _ . q c d p m x #");

export const valueSchema = z.union([z.string().max(40), z.number(), z.null()]);
export type VizValue = z.infer<typeof valueSchema>;

const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, "ids use letters, digits, _ and -");
const labelSchema = z.string().min(1).max(40);

export const pointerSchema = z.strictObject({
  name: z.string().min(1).max(12),
  at: z.number().int(),
  side: z.enum(["above", "below"]).optional(),
  /** The one pointer that carries the "current" weight (bold label). */
  strong: z.boolean().optional(),
});

export const rangeSchema = z.strictObject({
  from: z.number().int(),
  to: z.number().int(),
  label: z.string().min(1).max(24),
  side: z.enum(["above", "below"]).optional(),
});

export const compareSchema = z.strictObject({
  a: z.number().int(),
  b: z.number().int(),
  text: z.string().min(1).max(16),
});

// ---------------------------------------------------------------------------------------------
// Frames, one schema per visualizer (plan §4.11.2)
// ---------------------------------------------------------------------------------------------

export const arrayFrameSchema = z
  .strictObject({
    values: z.array(valueSchema).min(1).max(16),
    states: stateStringSchema.optional(),
    pointers: z.array(pointerSchema).max(4).optional(),
    ranges: z.array(rangeSchema).max(2).optional(),
    compare: compareSchema.optional(),
    name: z.string().max(12).optional(),
    indexBase: z.number().int().optional(),
    indices: z.boolean().optional(),
    circular: z.boolean().optional(),
  })
  .superRefine((f, ctx) => {
    const n = f.values.length;
    if (f.states !== undefined && f.states.length !== n) {
      ctx.addIssue({
        code: "custom",
        message: `states has ${f.states.length} codes for ${n} values`,
      });
    }
    for (const p of f.pointers ?? []) {
      if (p.at < -1 || p.at > n)
        ctx.addIssue({ code: "custom", message: `pointer ${p.name} out of range` });
    }
    for (const r of f.ranges ?? []) {
      if (r.from < 0 || r.to >= n || r.from > r.to) {
        ctx.addIssue({ code: "custom", message: `range ${r.label} out of range` });
      }
    }
    if (f.compare && (f.compare.a < 0 || f.compare.a >= n || f.compare.b < 0 || f.compare.b >= n)) {
      ctx.addIssue({ code: "custom", message: "compare index out of range" });
    }
  });

export const gridFrameSchema = z
  .strictObject({
    /** One string of state codes per row. */
    cells: z.array(stateStringSchema.min(1).max(12)).min(1).max(12),
    values: z.array(z.array(valueSchema)).optional(),
    indices: z.boolean().optional(),
  })
  .superRefine((f, ctx) => {
    const cols = f.cells[0]?.length ?? 0;
    if (f.cells.some((row) => row.length !== cols)) {
      ctx.addIssue({ code: "custom", message: "every grid row needs the same number of cells" });
    }
    if (f.values) {
      if (f.values.length !== f.cells.length || f.values.some((row) => row.length !== cols)) {
        ctx.addIssue({ code: "custom", message: "values must have the grid's shape" });
      }
    }
  });

const graphNodeSchema = z.strictObject({
  id: idSchema,
  /** Layout position in grid units (the renderer spaces units evenly). */
  x: z.number().min(0).max(8),
  y: z.number().min(0).max(8),
  label: z.string().max(4).optional(),
  value: valueSchema.optional(),
  s: stateStringSchema.length(1).optional(),
});

export const graphFrameSchema = z
  .strictObject({
    nodes: z.array(graphNodeSchema).min(1).max(16),
    edges: z
      .array(
        z.strictObject({
          a: idSchema,
          b: idSchema,
          w: valueSchema.optional(),
          s: stateStringSchema.length(1).optional(),
        }),
      )
      .max(32),
    directed: z.boolean().optional(),
    valueLabel: z.string().max(10).optional(),
  })
  .superRefine((f, ctx) => {
    const ids = new Set(f.nodes.map((n) => n.id));
    if (ids.size !== f.nodes.length) ctx.addIssue({ code: "custom", message: "duplicate node id" });
    for (const e of f.edges) {
      if (!ids.has(e.a) || !ids.has(e.b)) {
        ctx.addIssue({ code: "custom", message: `edge ${e.a}-${e.b} names a missing node` });
      }
    }
  });

export interface TreeNodeData {
  id: string;
  label: string;
  note?: string | undefined;
  s?: string | undefined;
  e?: string | undefined;
  children?: TreeNodeData[] | undefined;
}

const treeNodeSchema: z.ZodType<TreeNodeData> = z.lazy(() =>
  z.strictObject({
    id: idSchema,
    label: z.string().min(1).max(14),
    /** A short annotation under the node, e.g. a return value "= 3". */
    note: z.string().max(10).optional(),
    s: stateStringSchema.length(1).optional(),
    /** State of the edge from the parent. */
    e: stateStringSchema.length(1).optional(),
    children: z.array(treeNodeSchema).max(4).optional(),
  }),
);

export const treeFrameSchema = z
  .strictObject({ root: treeNodeSchema.nullable() })
  .superRefine((f, ctx) => {
    let count = 0;
    const ids = new Set<string>();
    const walk = (n: TreeNodeData, depth: number) => {
      count += 1;
      if (ids.has(n.id))
        ctx.addIssue({ code: "custom", message: `duplicate tree node id ${n.id}` });
      ids.add(n.id);
      if (depth > 6) ctx.addIssue({ code: "custom", message: "tree deeper than 6 levels" });
      for (const c of n.children ?? []) walk(c, depth + 1);
    };
    if (f.root) walk(f.root, 0);
    if (count > 31) ctx.addIssue({ code: "custom", message: "tree has more than 31 nodes" });
  });

export const tableFrameSchema = z
  .strictObject({
    cells: z.array(z.array(valueSchema).min(1).max(10)).min(1).max(10),
    states: z.array(stateStringSchema).optional(),
    rowHeads: z.array(valueSchema).optional(),
    colHeads: z.array(valueSchema).optional(),
    rowTitle: z.string().max(12).optional(),
    colTitle: z.string().max(12).optional(),
    /** Dependency arrows, [row, col] → [row, col]. */
    arrows: z
      .array(
        z.strictObject({
          from: z.tuple([z.number().int(), z.number().int()]),
          to: z.tuple([z.number().int(), z.number().int()]),
        }),
      )
      .max(4)
      .optional(),
  })
  .superRefine((f, ctx) => {
    const rows = f.cells.length;
    const cols = f.cells[0]?.length ?? 0;
    if (f.cells.some((r) => r.length !== cols))
      ctx.addIssue({ code: "custom", message: "ragged table" });
    if (f.states && (f.states.length !== rows || f.states.some((r) => r.length !== cols))) {
      ctx.addIssue({ code: "custom", message: "states must have the table's shape" });
    }
    if (f.rowHeads && f.rowHeads.length !== rows)
      ctx.addIssue({ code: "custom", message: "rowHeads length" });
    if (f.colHeads && f.colHeads.length !== cols)
      ctx.addIssue({ code: "custom", message: "colHeads length" });
    for (const a of f.arrows ?? []) {
      for (const [r, c] of [a.from, a.to]) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) {
          ctx.addIssue({ code: "custom", message: "arrow cell out of range" });
        }
      }
    }
  });

export const STRUCT_KINDS = ["stack", "queue", "deque", "heap", "map", "set"] as const;

export const structFrameSchema = z
  .strictObject({
    kind: z.enum(STRUCT_KINDS),
    name: z.string().max(12).optional(),
    items: z
      .array(
        z.strictObject({
          v: valueSchema,
          /** Key, for kind "map". */
          k: valueSchema.optional(),
          s: stateStringSchema.length(1).optional(),
          /** Stable identity so an item keeps its place in motion across steps. */
          id: z.string().max(24).optional(),
        }),
      )
      .max(15),
  })
  .superRefine((f, ctx) => {
    if (f.kind === "map" && f.items.some((i) => i.k === undefined)) {
      ctx.addIssue({ code: "custom", message: "map items need a key k" });
    }
    const ids = f.items.map((i) => i.id).filter((i) => i !== undefined);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "duplicate item id" });
  });

export const lineFrameSchema = z
  .strictObject({
    kind: z.enum(["line", "wheel"]).optional(),
    min: z.number().int(),
    max: z.number().int(),
    /** Tick every `tick` units (line) — default 1. */
    tick: z.number().int().positive().optional(),
    points: z
      .array(
        z.strictObject({
          x: z.number(),
          label: z.string().max(8).optional(),
          s: stateStringSchema.length(1).optional(),
        }),
      )
      .max(16)
      .optional(),
    intervals: z
      .array(
        z.strictObject({
          a: z.number(),
          b: z.number(),
          label: z.string().max(10).optional(),
          s: stateStringSchema.length(1).optional(),
          row: z.number().int().min(0).max(3).optional(),
        }),
      )
      .max(10)
      .optional(),
    sweep: z.strictObject({ x: z.number(), label: z.string().max(10).optional() }).optional(),
    /** Wheel only: the pointer's position. */
    at: z.number().int().optional(),
  })
  .superRefine((f, ctx) => {
    if (f.max <= f.min) ctx.addIssue({ code: "custom", message: "max must exceed min" });
    const kind = f.kind ?? "line";
    const span = f.max - f.min;
    if (kind === "wheel" && (f.min !== 0 || span > 24)) {
      ctx.addIssue({ code: "custom", message: "a wheel runs from 0 to at most 24 positions" });
    }
    if (kind === "line" && span / (f.tick ?? 1) > 20) {
      ctx.addIssue({ code: "custom", message: "more than 20 ticks on a number line" });
    }
  });

const axisSchema = z.strictObject({
  min: z.number(),
  max: z.number(),
  label: z.string().max(24),
  ticks: z.array(z.number()).max(8).optional(),
});

export const plotFrameSchema = z
  .strictObject({
    x: axisSchema,
    y: axisSchema,
    series: z
      .array(
        z.strictObject({
          id: idSchema,
          label: z.string().max(14),
          pts: z.array(z.tuple([z.number(), z.number()])).max(200),
          /** Line style 0 solid, 1 dashed, 2 dotted, 3 dash-dot: never colour alone. */
          style: z.number().int().min(0).max(3).optional(),
          s: stateStringSchema.length(1).optional(),
        }),
      )
      .max(5),
    markers: z
      .array(
        z.strictObject({
          x: z.number(),
          y: z.number(),
          label: z.string().max(12).optional(),
          s: stateStringSchema.length(1).optional(),
        }),
      )
      .max(8)
      .optional(),
    vline: z.strictObject({ x: z.number(), label: z.string().max(12).optional() }).optional(),
    band: z
      .strictObject({ a: z.number(), b: z.number(), label: z.string().max(12).optional() })
      .optional(),
  })
  .superRefine((f, ctx) => {
    if (f.x.max <= f.x.min || f.y.max <= f.y.min)
      ctx.addIssue({ code: "custom", message: "empty axis range" });
  });

// Scene panels (components/viz/scenes): frames built in TypeScript from Zod-validated props.
export const stdinSceneFrameSchema = z.strictObject({
  lines: z.array(z.string().max(24)).min(1).max(6),
  /** How many lines input() has consumed so far. */
  used: z.number().int().min(0),
  code: z.array(z.string().max(40)).min(1).max(6),
  /** Index of the code line about to run (or -1 when finished). */
  at: z.number().int(),
  vars: z.array(z.tuple([z.string().max(10), z.string().max(24)])).max(6),
  /** Name of the variable that just received a value. */
  fresh: z.string().max(10).optional(),
});

export const VERDICTS = ["AC", "WA", "TLE", "RTE", "MLE"] as const;

export const judgeSceneFrameSchema = z.strictObject({
  tests: z
    .array(
      z.strictObject({
        name: z.string().max(10),
        verdict: z.enum(VERDICTS).nullable(),
        s: stateStringSchema.length(1),
      }),
    )
    .min(1)
    .max(6),
  /** Which stage of the pipeline is active: feed input, run, compare. */
  phase: z.enum(["idle", "input", "run", "compare", "done"]),
  active: z.number().int(),
});

// ---------------------------------------------------------------------------------------------
// Visualizer registry (names are the MDX / `.viz.yaml` names)
// ---------------------------------------------------------------------------------------------

export const FRAME_SCHEMAS = {
  ArrayViz: arrayFrameSchema,
  GridViz: gridFrameSchema,
  GraphViz: graphFrameSchema,
  TreeViz: treeFrameSchema,
  TableViz: tableFrameSchema,
  StructViz: structFrameSchema,
  LineViz: lineFrameSchema,
  PlotViz: plotFrameSchema,
  StdinScene: stdinSceneFrameSchema,
  JudgeScene: judgeSceneFrameSchema,
} as const;

/** The panel visualizers a `.frames.json` may use (CodeTraceViz has its own file type). */
export const PANEL_VIZ = [
  "ArrayViz",
  "GridViz",
  "GraphViz",
  "TreeViz",
  "TableViz",
  "StructViz",
  "LineViz",
  "PlotViz",
] as const;
export type PanelVizName = (typeof PANEL_VIZ)[number];
export type FrameVizName = keyof typeof FRAME_SCHEMAS;
/** The nine library visualizers of plan §4.11.2. */
export const LIBRARY_VIZ = [...PANEL_VIZ, "CodeTraceViz"] as const;

export type ArrayFrame = z.infer<typeof arrayFrameSchema>;
export type GridFrame = z.infer<typeof gridFrameSchema>;
export type GraphFrame = z.infer<typeof graphFrameSchema>;
export type TreeFrame = z.infer<typeof treeFrameSchema>;
export type TableFrame = z.infer<typeof tableFrameSchema>;
export type StructFrame = z.infer<typeof structFrameSchema>;
export type LineFrame = z.infer<typeof lineFrameSchema>;
export type PlotFrame = z.infer<typeof plotFrameSchema>;
export type StdinSceneFrame = z.infer<typeof stdinSceneFrameSchema>;
export type JudgeSceneFrame = z.infer<typeof judgeSceneFrameSchema>;

export interface FrameByViz {
  ArrayViz: ArrayFrame;
  GridViz: GridFrame;
  GraphViz: GraphFrame;
  TreeViz: TreeFrame;
  TableViz: TableFrame;
  StructViz: StructFrame;
  LineViz: LineFrame;
  PlotViz: PlotFrame;
  StdinScene: StdinSceneFrame;
  JudgeScene: JudgeSceneFrame;
}

// ---------------------------------------------------------------------------------------------
// `.frames.json` (generated by tools/viz/gen-viz.mjs from `<name>.viz.py`, never hand-edited)
// ---------------------------------------------------------------------------------------------

export const panelSpecSchema = z.strictObject({
  id: idSchema,
  viz: z.enum(Object.keys(FRAME_SCHEMAS) as [FrameVizName, ...FrameVizName[]]),
  title: z.string().max(24).optional(),
});
export type PanelSpec = z.infer<typeof panelSpecSchema>;

export const stepSchema = z.strictObject({
  caption: z.string().min(1).max(320),
  /** Present on a "skip ahead" step: how many recorded steps it stands for. */
  skipped: z.number().int().positive().optional(),
  panels: z.record(z.string(), z.unknown()),
});

export const presetSchema = z.strictObject({
  id: idSchema,
  label: labelSchema,
  steps: z.array(stepSchema).min(1).max(200),
});

export const framesFileSchema = z
  .strictObject({
    schema: z.literal(1),
    kind: z.literal("frames"),
    id: idSchema,
    layout: z.enum(["single", "row"]),
    panels: z.array(panelSpecSchema).min(1).max(2),
    alt: z.string().min(1).max(600),
    presets: z.array(presetSchema).min(1).max(3),
  })
  .superRefine((file, ctx) => {
    if (file.layout === "single" && file.panels.length !== 1) {
      ctx.addIssue({ code: "custom", message: 'layout "single" takes exactly one panel' });
    }
    if (file.layout === "row" && file.panels.length !== 2) {
      ctx.addIssue({ code: "custom", message: 'layout "row" takes exactly two panels' });
    }
    const presetIds = new Set<string>();
    file.presets.forEach((preset, pi) => {
      if (presetIds.has(preset.id))
        ctx.addIssue({ code: "custom", message: `duplicate preset ${preset.id}` });
      presetIds.add(preset.id);
      preset.steps.forEach((step, si) => {
        for (const panel of file.panels) {
          const data = step.panels[panel.id];
          if (data === undefined) {
            ctx.addIssue({
              code: "custom",
              path: ["presets", pi, "steps", si, "panels", panel.id],
              message: `step has no frame for panel ${panel.id}`,
            });
            continue;
          }
          const parsed = FRAME_SCHEMAS[panel.viz].safeParse(data);
          if (!parsed.success) {
            for (const issue of parsed.error.issues) {
              ctx.addIssue({
                code: "custom",
                path: ["presets", pi, "steps", si, "panels", panel.id, ...issue.path.map(String)],
                message: `${panel.viz}: ${issue.message}`,
              });
            }
          }
        }
        for (const key of Object.keys(step.panels)) {
          if (!file.panels.some((p) => p.id === key)) {
            ctx.addIssue({ code: "custom", message: `step names unknown panel ${key}` });
          }
        }
      });
    });
  });

export type FramesFile = z.infer<typeof framesFileSchema>;

// ---------------------------------------------------------------------------------------------
// `.trace.json` (generated by tools/viz/trace.py, never hand-edited). Compact deltas: a step
// carries the full call stack (small), only the heap objects that changed, and only the stdout
// text printed since the previous step. lib/viz/trace.ts expands it into full states.
// ---------------------------------------------------------------------------------------------

/** A value: a Python repr string for primitives, or [ref id] for a heap object. */
export const traceValueSchema = z.union([z.string().max(80), z.tuple([z.number().int()])]);
export type TraceValue = z.infer<typeof traceValueSchema>;

export const heapObjectSchema = z.discriminatedUnion("t", [
  z.strictObject({ t: z.literal("list"), v: z.array(traceValueSchema).max(40) }),
  z.strictObject({ t: z.literal("tuple"), v: z.array(traceValueSchema).max(40) }),
  z.strictObject({ t: z.literal("set"), v: z.array(traceValueSchema).max(40) }),
  z.strictObject({
    t: z.literal("dict"),
    v: z.array(z.tuple([traceValueSchema, traceValueSchema])).max(40),
  }),
  z.strictObject({ t: z.literal("function"), n: z.string().max(40) }),
  z.strictObject({
    t: z.literal("object"),
    c: z.string().max(40),
    v: z.array(z.tuple([z.string(), traceValueSchema])).max(20),
  }),
]);
export type HeapObject = z.infer<typeof heapObjectSchema>;

export const traceFrameSchema = z.strictObject({
  /** Function name ("<module>" for the global frame). */
  f: z.string().max(40),
  /** Line the frame is on (1-based). */
  l: z.number().int().positive(),
  /** Variables in creation order: [name, value]. */
  v: z.array(z.tuple([z.string().max(40), traceValueSchema])).max(24),
});

export const traceStepSchema = z.strictObject({
  /** Line about to run (1-based), or the line that returned/raised. */
  l: z.number().int().positive(),
  e: z.enum(["line", "call", "return", "exception", "end"]),
  /** Call stack, oldest first (index 0 is the global frame). */
  st: z.array(traceFrameSchema).min(1).max(24),
  /** Heap objects created or changed at this step. */
  h: z.record(z.string(), heapObjectSchema).optional(),
  /** Heap object ids no longer reachable. */
  hd: z.array(z.number().int()).optional(),
  /** Text printed since the previous step. */
  o: z.string().optional(),
  /** Exception text, e.g. "IndexError: list index out of range". */
  x: z.string().max(200).optional(),
  /** Return value shown on a return step. */
  r: traceValueSchema.optional(),
  c: z.string().min(1).max(320),
  skipped: z.number().int().positive().optional(),
});
export type TraceStep = z.infer<typeof traceStepSchema>;

export const tracePresetSchema = z.strictObject({
  id: idSchema,
  label: labelSchema,
  stdin: z.string().optional(),
  steps: z.array(traceStepSchema).min(1).max(200),
});

export const traceFileSchema = z
  .strictObject({
    schema: z.literal(1),
    kind: z.literal("trace"),
    id: idSchema,
    /** Example file name, relative to the trace file. */
    source: z.string().regex(/^[A-Za-z0-9_.-]+\.py$/),
    /** The exact source that was traced (drift is impossible: regeneration must give no diff). */
    code: z.string().min(1),
    alt: z.string().min(1).max(600),
    presets: z.array(tracePresetSchema).min(1).max(3),
  })
  .superRefine((file, ctx) => {
    const lineCount = file.code.replace(/\n$/, "").split("\n").length;
    file.presets.forEach((p, pi) => {
      p.steps.forEach((s, si) => {
        if (s.l > lineCount) {
          ctx.addIssue({
            code: "custom",
            path: ["presets", pi, "steps", si, "l"],
            message: "line beyond the code",
          });
        }
      });
    });
  });
export type TraceFile = z.infer<typeof traceFileSchema>;

// ---------------------------------------------------------------------------------------------
// Authored configs (YAML)
// ---------------------------------------------------------------------------------------------

const presetInputSchema = z
  .strictObject({
    id: idSchema,
    label: labelSchema,
    /** Standard input for this preset, inline… */
    stdin: z.string().optional(),
    /** …or from a file next to the config (e.g. "../examples/bfs_grid.in"). */
    stdinFile: z.string().optional(),
  })
  .refine((p) => !(p.stdin !== undefined && p.stdinFile !== undefined), {
    message: "use stdin or stdinFile, not both",
  });

export const budgetSchema = z.strictObject({
  bytes: z.number().int().positive().max(150_000).optional(),
  steps: z.number().int().positive().max(200).optional(),
});

export const vizYamlSchema = z.strictObject({
  layout: z.enum(["single", "row"]),
  panels: z.array(panelSpecSchema).min(1).max(2),
  /** Text alternative: a short summary of what the visual shows. */
  alt: z.string().min(20).max(600),
  /** Where step captions come from. Only "vizrec" (rec.step(caption, …)) exists today. */
  captions: z.literal("vizrec"),
  presets: z.array(presetInputSchema).min(1).max(3),
  consistency: z
    .strictObject({
      /** Human statement of what must agree, e.g. "Final distances equal the output of …". */
      description: z.string().min(10).max(300),
      /** Shown example the visual must agree with, relative to this file. */
      example: z.string().regex(/\.py$/),
      /** "output": the example's stdout on each preset's stdin equals the text vizrec recorded. */
      compare: z.literal("output"),
    })
    .optional(),
  budget: budgetSchema.optional(),
});
export type VizYaml = z.infer<typeof vizYamlSchema>;

export const traceYamlSchema = z.strictObject({
  /** The shown example, relative to this file. */
  example: z.string().regex(/^[A-Za-z0-9_.-]+\.py$/),
  alt: z.string().min(20).max(600),
  presets: z.array(presetInputSchema).min(1).max(3).optional(),
  maxSteps: z.number().int().positive().max(200).optional(),
  /** Author-placed "skip ahead" markers. */
  skip: z
    .array(
      z.strictObject({
        /** From the (keep+1)-th arrival at this line… */
        line: z.number().int().positive(),
        keep: z.number().int().min(0),
        /** …until execution next arrives at this line. */
        to: z.number().int().positive(),
        label: z.string().min(5).max(200),
      }),
    )
    .max(4)
    .optional(),
  /** Extra teaching notes appended to the caption the first time a line runs. */
  notes: z.record(z.string().regex(/^\d+$/), z.string().min(5).max(200)).optional(),
  budget: budgetSchema.optional(),
});
export type TraceYaml = z.infer<typeof traceYamlSchema>;
