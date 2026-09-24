// Expand a `.trace.json` preset (compact deltas) into full per-step states for CodeTraceViz.
import type { HeapObject, TraceFile, TraceStep, TraceValue } from "./schema";

export interface TraceFrameState {
  /** Function name; "<module>" is the global frame. */
  f: string;
  l: number;
  v: [string, TraceValue][];
}

export interface TraceState {
  index: number;
  line: number;
  /** The line that ran just before (the hollow caret), or null on the first step. */
  prevLine: number | null;
  event: TraceStep["e"];
  /** Oldest first. */
  stack: TraceFrameState[];
  heap: Map<number, HeapObject>;
  /** Everything printed so far. */
  output: string;
  exception: string | null;
  returned: TraceValue | null;
  caption: string;
  skipped: number | null;
  /** "frameIndex:name" of variables whose value (or referenced object) changed at this step. */
  changedVars: Set<string>;
  /** Heap ids created or changed at this step. */
  changedObjects: Set<number>;
}

export function expandTrace(steps: TraceStep[]): TraceState[] {
  const heap = new Map<number, HeapObject>();
  let output = "";
  let prev: TraceState | null = null;
  const out: TraceState[] = [];
  steps.forEach((s, index) => {
    const changedObjects = new Set<number>();
    for (const [id, obj] of Object.entries(s.h ?? {})) {
      heap.set(Number(id), obj);
      changedObjects.add(Number(id));
    }
    for (const id of s.hd ?? []) heap.delete(id);
    output += s.o ?? "";
    const changedVars = new Set<string>();
    s.st.forEach((fr, fi) => {
      const before = prev?.stack[fi];
      const same = before !== undefined && before.f === fr.f;
      const old = new Map(same ? before.v : []);
      for (const [name, value] of fr.v) {
        const was = old.get(name);
        const refChanged = Array.isArray(value) && changedObjects.has(value[0]);
        if (was === undefined || JSON.stringify(was) !== JSON.stringify(value) || refChanged) {
          if (prev !== null) changedVars.add(`${fi}:${name}`);
        }
      }
    });
    const state: TraceState = {
      index,
      line: s.l,
      prevLine: prev === null ? null : prev.line,
      event: s.e,
      stack: s.st.map((f) => ({ f: f.f, l: f.l, v: f.v })),
      heap: new Map(heap),
      output,
      exception: s.x ?? null,
      returned: s.r ?? null,
      caption: s.c,
      skipped: s.skipped ?? null,
      changedVars,
      changedObjects: prev === null ? new Set() : changedObjects,
    };
    out.push(state);
    prev = state;
  });
  return out;
}

export function expandTraceFile(file: TraceFile): TraceState[][] {
  return file.presets.map((p) => expandTrace(p.steps));
}

/** Largest number of output lines across the steps (reserved height: no layout shift). */
export function maxOutputLines(states: TraceState[]): number {
  let max = 0;
  for (const s of states) {
    const text = s.output.replace(/\n$/, "");
    const n = text === "" ? 0 : text.split("\n").length;
    max = Math.max(max, n + (s.exception ? 1 : 0));
  }
  return max;
}
