// The state vocabulary shared by the Zod schemas (./schema) and the client-side layouts and
// player. Kept free of Zod so the lazy player chunk never bundles it (DESIGN.md → Performance).
// ---------------------------------------------------------------------------------------------
// State vocabulary (DESIGN.md → Visual Language → State vocabulary). One letter per state keeps
// grid and table frames compact: a grid row is a string such as "..qc#d".
// ---------------------------------------------------------------------------------------------

export const STATE_CODES = {
  _: "none",
  ".": "unvisited",
  q: "frontier",
  c: "current",
  d: "done",
  p: "path",
  m: "compare",
  x: "invalid",
  "#": "wall",
} as const;

export type StateCode = keyof typeof STATE_CODES;
/** "changed" is internal (a traced value that just changed); it has no authoring code. */
export type VizState = (typeof STATE_CODES)[StateCode] | "changed";

export const VIZ_STATES = [
  "none",
  "unvisited",
  "frontier",
  "current",
  "done",
  "path",
  "compare",
  "invalid",
  "wall",
  "changed",
] as const satisfies readonly VizState[];

/** Decode a state code (a missing code means "none"). */
export function stateOf(code: string | undefined): VizState {
  if (code === undefined || code === "") return "none";
  return STATE_CODES[code as StateCode] ?? "none";
}
