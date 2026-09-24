import type { VizState } from "@/lib/viz/schema";
import { STATE_META } from "../tokens";

function hatch(): string {
  return "M1.5 8.5L8.5 1.5M1.5 14.5L14.5 1.5M7.5 14.5L14.5 7.5";
}

/** Legend: one swatch per state the visual uses, drawn with the exact cue (DESIGN.md). */
export function Legend({ states, label = "Legend" }: { states: VizState[]; label?: string }) {
  const shown = states.filter((s): s is Exclude<VizState, "none"> => s !== "none");
  if (shown.length === 0) return null;
  return (
    <ul className="vz-legend" aria-label={label}>
      {shown.map((s) => (
        <li key={s}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <g className="vz-cell" data-s={s}>
              <rect className="vz-shape" x={1.5} y={1.5} width={13} height={13} rx={2} />
              {s === "path" ? (
                <rect className="vz-ring" x={4} y={4} width={8} height={8} rx={1} />
              ) : null}
              {s === "invalid" ? (
                <line className="vz-strike" x1={3.5} y1={12.5} x2={12.5} y2={3.5} />
              ) : null}
              {s === "wall" ? <path className="vz-hatch" d={hatch()} /> : null}
            </g>
          </svg>
          {STATE_META[s].label}
        </li>
      ))}
    </ul>
  );
}
