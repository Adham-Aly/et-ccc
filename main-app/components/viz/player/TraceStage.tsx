import { ArrowUpFromLine } from "lucide-react";
import type { CodeToken } from "@/components/content/highlight";
import { MIN_RATIO, type VizItem, type VizScene } from "@/lib/viz/geometry";
import type { TraceState } from "@/lib/viz/trace";
import { SceneSvg } from "../SceneSvg";
import { syntaxVar } from "../syntax";

export interface TraceStageProps {
  lines: CodeToken[][];
  state: TraceState;
  scene: VizScene;
  box: { width: number; height: number };
  /** Reserved output lines (largest across the steps): the panel never grows. */
  outputLines: number;
  stepLabel: string;
  entering?: Set<string> | undefined;
  exiting?: VizItem[] | undefined;
}

function Caret({ hollow }: { hollow: boolean }) {
  return (
    <svg
      className={`vz-code-caret${hollow ? " vz-prev" : ""}`}
      viewBox="0 0 8 10"
      aria-hidden="true"
    >
      <path d="M0.75 0.75L7.25 5L0.75 9.25Z" />
    </svg>
  );
}

/** Code pane + frames/objects panel + output so far (DESIGN.md → Code trace layout). */
export function TraceStage({
  lines,
  state,
  scene,
  box,
  outputLines,
  stepLabel,
  entering,
  exiting,
}: TraceStageProps) {
  const out = state.output.replace(/\n$/, "");
  const reserved = Math.max(1, outputLines);
  return (
    <div className="vz-stage">
      {/* Side by side only when the code column shows its longest line whole and the state panel
          still keeps its text at the minimum sizes (its min width); otherwise the row wraps into
          code, output, then frames and objects. */}
      <div
        className="vz-trace"
        style={{ ["--vz-state-min" as string]: `${Math.ceil(box.width * MIN_RATIO)}px` }}
      >
        <div className="vz-trace-left">
          {/* biome-ignore lint/a11y/useSemanticElements: a scroll container inside a figure, not a page section */}
          <div
            className="vz-trace-code"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable code region must be keyboard-reachable (WCAG 2.1.1)
            tabIndex={0}
            role="region"
            aria-label={`Code, line ${state.line} is next`}
          >
            <div className="vz-code">
              {lines.map((tokens, i) => {
                const no = i + 1;
                const cur = no === state.line;
                const prev = !cur && no === state.prevLine;
                return (
                  <div className="vz-code-line" key={no} data-cur={cur ? "" : undefined}>
                    <span className="vz-code-no">
                      {cur || prev ? <Caret hollow={prev} /> : null}
                      {no}
                    </span>
                    <span className="vz-code-text">
                      {tokens.length === 0 ? " " : null}
                      {tokens.map((t, k) => (
                        <span
                          // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional and static
                          key={k}
                          style={{
                            color: syntaxVar(t.color),
                            fontWeight: t.bold ? 700 : undefined,
                          }}
                        >
                          {t.content}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="vz-trace-out">
            <div className="vz-trace-out-head">
              <ArrowUpFromLine aria-hidden="true" size={14} strokeWidth={1.75} />
              Output so far
            </div>
            <pre style={{ minHeight: `calc(${reserved} * 1lh + 16px)` }}>
              {out === "" && !state.exception ? (
                <span className="vz-empty">(nothing printed yet)</span>
              ) : (
                out
              )}
              {state.exception ? (
                <>
                  {out === "" ? "" : "\n"}
                  <span className="vz-exc">{state.exception}</span>
                </>
              ) : null}
            </pre>
          </div>
        </div>
        <div className="vz-trace-state">
          <SceneSvg
            scene={scene}
            box={box}
            title={`Frames and objects, ${stepLabel}`}
            entering={entering}
            exiting={exiting}
          />
        </div>
      </div>
    </div>
  );
}
