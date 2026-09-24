// Visual-language tokens (DESIGN.md → Visual Language). The values live in app/globals.css as
// CSS custom properties; this module only names them, so SVG and CSS use `var(--color-viz-…)`
// and nothing in components/viz hard-codes a colour (brief A10).
import type { VizState } from "../../lib/viz/schema";

export const vizColor = {
  stage: "var(--color-viz-stage)",
  grid: "var(--color-viz-grid)",
  ink: "var(--color-viz-ink)",
  line: "var(--color-viz-line)",
  cellLine: "var(--color-viz-cell-line)",
  unvisited: "var(--color-viz-unvisited)",
  frontier: "var(--color-viz-frontier)",
  frontierLine: "var(--color-viz-frontier-line)",
  current: "var(--color-viz-current)",
  currentLine: "var(--color-viz-current-line)",
  done: "var(--color-viz-done)",
  doneLine: "var(--color-viz-done-line)",
  path: "var(--color-viz-path)",
  pathLine: "var(--color-viz-path-line)",
  compare: "var(--color-viz-compare)",
  compareLine: "var(--color-viz-compare-line)",
  invalid: "var(--color-viz-invalid)",
  invalidLine: "var(--color-viz-invalid-line)",
  changed: "var(--color-viz-changed)",
} as const;

export const vizStroke = {
  hair: "var(--viz-stroke-hair)",
  base: "var(--viz-stroke)",
  strong: "var(--viz-stroke-strong)",
  current: "var(--viz-stroke-current)",
  dash: "var(--viz-dash)",
} as const;

/** Every CSS custom property the library reads (a unit test checks globals.css defines them). */
export const VIZ_CSS_VARS = [
  ...Object.values(vizColor),
  ...Object.values(vizStroke),
  "var(--viz-grid-size)",
  "var(--viz-grid-opacity)",
  "var(--dur-viz)",
  "var(--ease-draft)",
].map((v) => v.slice(4, -1));

/** Legend labels and the non-colour cue of each state (DESIGN.md → State vocabulary). */
export const STATE_META: Record<Exclude<VizState, "none">, { label: string; cue: string }> = {
  unvisited: { label: "Not reached", cue: "thin outline" },
  frontier: { label: "Queued", cue: "dashed outline" },
  current: { label: "Current", cue: "heavy outline and caret" },
  done: { label: "Done", cue: "grey fill" },
  path: { label: "Answer path", cue: "double outline" },
  compare: { label: "Compared", cue: "bracket with the comparison" },
  invalid: { label: "Invalid", cue: "diagonal strike" },
  wall: { label: "Wall", cue: "hatching" },
  changed: { label: "Just changed", cue: "highlight" },
};

/** Legend order (the order a learner meets the states). */
export const LEGEND_ORDER: Exclude<VizState, "none">[] = [
  "current",
  "frontier",
  "done",
  "unvisited",
  "path",
  "compare",
  "invalid",
  "wall",
  "changed",
];

export { SPEEDS, type SpeedId } from "../../lib/viz/player-state";
