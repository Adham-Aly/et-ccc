import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import type { KeyboardEvent, ReactNode, Ref } from "react";
import type { PlayerAction, SpeedId } from "@/lib/viz/player-state";
import { SPEEDS } from "@/lib/viz/player-state";
import type { VizState } from "@/lib/viz/schema";
import { Legend } from "./Legend";

export interface PlayerViewProps {
  uid: string;
  label: string;
  presets: { id: string; label: string }[];
  preset: number;
  step: number;
  total: number;
  playing: boolean;
  speed: SpeedId;
  caption: string;
  skipped?: number | null | undefined;
  stage: ReactNode;
  legend: VizState[];
  /** Client only: the dispatcher. Absent on the server-rendered first frame (inert controls). */
  act?: ((a: PlayerAction) => void) | undefined;
  onKeyDown?: ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined;
  onKeyUp?: ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined;
  frameRef?: Ref<HTMLDivElement> | undefined;
  live?: boolean | undefined;
  /** Gallery only: force the reduced-motion timings. */
  reducedMotion?: boolean | undefined;
}

function Ticks({ total }: { total: number }) {
  if (total < 2 || total > 60) return null;
  const long = total > 20;
  return (
    <svg className="vz-ticks" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const x = (i / (total - 1)) * 100;
        const tall = !long || i % 5 === 0;
        return (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: ticks are positional
            key={i}
            x1={x}
            x2={x}
            y1={tall ? 0 : 3.5}
            y2={tall ? 14 : 10.5}
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/**
 * The shared player chrome (DESIGN.md → Player chrome): preset switcher, stage, control strip,
 * caption and legend inside one focusable group. Pure: the server renders it inert for the
 * first frame, the lazy client player renders the same markup with handlers.
 */
export function PlayerView(props: PlayerViewProps) {
  const {
    uid,
    label,
    presets,
    preset,
    step,
    total,
    playing,
    speed,
    caption,
    skipped,
    stage,
    legend,
    act,
  } = props;
  const last = total - 1;
  const atStart = step === 0;
  const atEnd = step >= last;
  const live = act !== undefined;
  const click = (a: PlayerAction, disabled = false) =>
    live && !disabled ? () => act(a) : undefined;
  const pct = last > 0 ? `${(step / last) * 100}%` : "0%";
  const digits = String(total).length;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a player is a group of controls around a drawing, not a form fieldset
    <div
      ref={props.frameRef}
      className={`vz-frame${props.live ? " vz-live" : ""}`}
      role="group"
      aria-roledescription="step-through"
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the player is one focusable group; ←/→, Space, Home/End work while focus is inside it (DESIGN.md)
      tabIndex={0}
      data-speed={speed}
      data-motion={props.reducedMotion ? "reduced" : undefined}
      data-player={uid}
      data-ready={live ? "" : undefined}
      onKeyDown={props.onKeyDown}
      onKeyUp={props.onKeyUp}
    >
      {presets.length > 1 ? (
        <div className="vz-presets">
          <fieldset className="vz-seg">
            <legend>Input</legend>
            {presets.map((p, i) => (
              <label key={p.id}>
                <input
                  type="radio"
                  name={`${uid}-preset`}
                  value={p.id}
                  data-ctl={`preset-${i}`}
                  {...(live
                    ? { checked: i === preset, onChange: () => act({ type: "preset", preset: i }) }
                    : { defaultChecked: i === preset })}
                />
                {p.label}
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}
      {stage}
      <div className="vz-controls">
        <div className="vz-buttons">
          <button
            type="button"
            className="vz-btn"
            data-ctl="restart"
            aria-label="Restart"
            aria-disabled={atStart}
            onClick={click({ type: "restart" }, atStart)}
          >
            <RotateCcw aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="vz-btn"
            data-ctl="prev"
            aria-label="Previous step"
            aria-disabled={atStart}
            onClick={click({ type: "prev" }, atStart)}
          >
            <StepBack aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="vz-btn vz-btn-play"
            data-ctl="play"
            aria-label={playing ? "Pause" : atEnd ? "Play from the start" : "Play"}
            aria-disabled={total < 2}
            onClick={click({ type: "toggle" }, total < 2)}
          >
            {playing ? (
              <Pause aria-hidden="true" size={18} strokeWidth={1.75} />
            ) : (
              <Play aria-hidden="true" size={18} strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            className="vz-btn"
            data-ctl="next"
            aria-label="Next step"
            aria-disabled={atEnd}
            onClick={click({ type: "next" }, atEnd)}
          >
            <StepForward aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="vz-scrub">
          <Ticks total={total} />
          <input
            className="vz-range"
            type="range"
            min={1}
            max={Math.max(total, 1)}
            step={1}
            data-ctl="scrub"
            aria-label="Step"
            aria-valuetext={`Step ${step + 1} of ${total}`}
            style={{ ["--vz-pct" as string]: pct }}
            {...(live
              ? {
                  value: step + 1,
                  onChange: (e) => act({ type: "seek", step: Number(e.currentTarget.value) - 1 }),
                }
              : { defaultValue: step + 1 })}
          />
        </div>
        <output
          className="vz-counter"
          style={{ minWidth: `${digits * 2 + 3}ch` }}
          aria-hidden="true"
        >
          {step + 1} / {total}
        </output>
        <fieldset className="vz-seg vz-speed">
          <legend>Speed</legend>
          {SPEEDS.map((s) => (
            <label key={s.id}>
              <input
                type="radio"
                name={`${uid}-speed`}
                value={s.id}
                data-ctl={`speed-${s.id}`}
                aria-label={`Speed ${s.label}`}
                {...(live
                  ? { checked: s.id === speed, onChange: () => act({ type: "speed", speed: s.id }) }
                  : { defaultChecked: s.id === speed })}
              />
              {s.label}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="vz-caption" aria-live="polite" aria-atomic="true">
        {skipped ? <span className="vz-skip">Skip ahead</span> : null}
        {caption}
      </div>
      <Legend states={legend} />
    </div>
  );
}
