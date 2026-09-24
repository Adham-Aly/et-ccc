"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { VizItem, VizScene } from "@/lib/viz/geometry";
import {
  initialPlayerState,
  keyAction,
  makePlayerReducer,
  type PlayerAction,
  SPEEDS,
} from "@/lib/viz/player-state";
import { FramesStage } from "./FramesStage";
import type { PlayerProps } from "./PlayerMount";
import { PlayerView } from "./PlayerView";
import { prepareFrames, prepareTrace, stepLabel } from "./prepare";
import { TraceStage } from "./TraceStage";

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Items that appeared and items that left between two scenes of one panel. */
function presence(
  prev: VizScene | undefined,
  next: VizScene,
): { entering: Set<string>; exiting: VizItem[] } {
  if (!prev) return { entering: new Set(), exiting: [] };
  const before = new Set(prev.items.map((i) => i.key));
  const after = new Set(next.items.map((i) => i.key));
  return {
    entering: new Set(next.items.filter((i) => !before.has(i.key)).map((i) => i.key)),
    exiting: prev.items.filter((i) => !after.has(i.key)),
  };
}

const ACTIONS: Record<string, PlayerAction> = {
  restart: { type: "restart" },
  prev: { type: "prev" },
  play: { type: "toggle" },
  next: { type: "next" },
};

/** The interactive player (lazy chunk). Plays back recorded frames; executes nothing. */
export function Player({ data, focusCtl, pendingCtl }: PlayerProps) {
  const frames = useMemo(() => (data.kind === "frames" ? prepareFrames(data) : null), [data]);
  const trace = useMemo(() => (data.kind === "trace" ? prepareTrace(data) : null), [data]);
  const totals = useMemo(() => data.presets.map((p) => p.steps.length), [data]);
  const reducer = useMemo(() => makePlayerReducer(totals), [totals]);
  const [state, dispatch] = useReducer(reducer, data, (d) => ({
    ...initialPlayerState(d.initialPreset),
    step: d.demo?.step ?? 0,
  }));
  const [live, setLive] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastChange = useRef(0);
  const snapNext = useRef(false);
  const prevScenes = useRef<VizScene[] | null>(null);
  const [exiting, setExiting] = useState<VizItem[][]>([]);
  const speed = SPEEDS.find((s) => s.id === state.speed) ?? SPEEDS[1];

  const act = useCallback(
    (a: PlayerAction) => {
      setLive(true);
      const el = frameRef.current;
      const jump =
        a.type === "seek" ||
        a.type === "preset" ||
        a.type === "first" ||
        a.type === "last" ||
        a.type === "restart";
      const running = performance.now() - lastChange.current < speed.transitionMs * 2;
      if (el && (jump || running)) {
        // Interruption rule: finish the running transition at once, then start the next one.
        el.classList.add("vz-snap");
        void el.offsetWidth;
        if (!jump) el.classList.remove("vz-snap");
        else snapNext.current = true;
      }
      dispatch(a);
    },
    [speed.transitionMs],
  );

  // Scene(s) for the current step.
  const scenes: VizScene[] = useMemo(() => {
    if (frames) return frames.map((p) => p.scenes[state.preset]?.[state.step] as VizScene);
    if (trace) return [trace.scenes[state.preset]?.[state.step] as VizScene];
    return [];
  }, [frames, trace, state.preset, state.step]);

  // Items new at this step fade in (second phase); items that left fade out.
  const entering = useMemo(() => {
    const prev = prevScenes.current;
    return scenes.map((s, i) => presence(prev?.[i], s).entering);
  }, [scenes]);

  useLayoutEffect(() => {
    const prev = prevScenes.current;
    prevScenes.current = scenes;
    lastChange.current = performance.now();
    if (snapNext.current) {
      snapNext.current = false;
      const el = frameRef.current;
      if (el) {
        void el.offsetWidth;
        el.classList.remove("vz-snap");
      }
      setExiting([]);
    } else if (prev && prev !== scenes && live) {
      setExiting(scenes.map((s, i) => presence(prev[i], s).exiting));
    }
  }, [scenes, live]);

  useEffect(() => {
    if (exiting.every((e) => e.length === 0)) return;
    const t = setTimeout(() => setExiting([]), reducedMotion() ? 0 : speed.transitionMs + 40);
    return () => clearTimeout(t);
  }, [exiting, speed.transitionMs]);

  // Playback: one step every stepMs; the reducer stops it on the last step (no loops).
  useEffect(() => {
    if (!state.playing) return;
    const t = setInterval(() => dispatch({ type: "tick" }), speed.stepMs);
    return () => clearInterval(t);
  }, [state.playing, speed.stepMs]);

  // Restore focus and replay a click made before the chunk loaded.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount only
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (focusCtl) {
      const target =
        focusCtl === "frame" ? el : el.querySelector<HTMLElement>(`[data-ctl="${focusCtl}"]`);
      target?.focus();
    }
    const replay = pendingCtl ? ACTIONS[pendingCtl] : undefined;
    if (replay) act(replay);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const t = e.target as HTMLElement;
    // The range and the radios keep their native keys; the code pane keeps its scroll keys.
    if (t instanceof HTMLInputElement || t.classList.contains("vz-trace-code")) return;
    const a = keyAction(e.key);
    if (!a) return;
    e.preventDefault();
    act(a);
  };
  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    // Space on a focused button would also click it on key-up; the group already handled it.
    if (e.key === " " && e.target instanceof HTMLButtonElement) e.preventDefault();
  };

  const total = totals[state.preset] ?? 1;
  const label = stepLabel(state.step, total);
  let caption = "";
  let skipped: number | null = null;
  let stage: ReactNode = null;
  if (data.kind === "frames" && frames) {
    const step = data.presets[state.preset]?.steps[state.step];
    caption = step?.caption ?? "";
    skipped = step?.skipped ?? null;
    stage = (
      <FramesStage
        layout={data.layout}
        panels={data.panels}
        scenes={scenes}
        boxes={frames.map((p) => p.box)}
        stepLabel={label}
        entering={live ? entering : undefined}
        exiting={live ? exiting : undefined}
      />
    );
  } else if (data.kind === "trace" && trace) {
    const st = trace.states[state.preset]?.[state.step];
    if (st) {
      caption = st.caption;
      skipped = st.skipped;
      stage = (
        <TraceStage
          lines={data.lines}
          state={st}
          scene={scenes[0] as VizScene}
          box={trace.box}
          outputLines={trace.outputLines}
          stepLabel={label}
          entering={live ? entering[0] : undefined}
          exiting={live ? exiting[0] : undefined}
        />
      );
    }
  }

  return (
    <PlayerView
      uid={data.uid}
      label={data.label}
      presets={data.presets.map((p) => ({ id: p.id, label: p.label }))}
      preset={state.preset}
      step={state.step}
      total={total}
      playing={state.playing}
      speed={state.speed}
      caption={caption}
      skipped={skipped}
      stage={stage}
      legend={data.legend}
      act={act}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      frameRef={frameRef}
      live={live}
      reducedMotion={data.demo?.reducedMotion}
    />
  );
}
