// The shared player's state machine (StepThrough, CodeTrace, Scene): pure, so it is unit tested
// without a browser. Playback timing lives in the client player; this only decides states.

/** Milliseconds per step and per transition at each speed (DESIGN.md → Motion, [W3] timings). */
export const SPEEDS = [
  { id: "0.5", label: "0.5×", stepMs: 2400, transitionMs: 280 },
  { id: "1", label: "1×", stepMs: 1200, transitionMs: 280 },
  { id: "2", label: "2×", stepMs: 600, transitionMs: 200 },
] as const;
export type SpeedId = (typeof SPEEDS)[number]["id"];

export interface PlayerState {
  preset: number;
  step: number;
  playing: boolean;
  speed: SpeedId;
}

export type PlayerAction =
  | { type: "next" }
  | { type: "prev" }
  | { type: "first" }
  | { type: "last" }
  | { type: "restart" }
  | { type: "seek"; step: number }
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "tick" }
  | { type: "speed"; speed: SpeedId }
  | { type: "preset"; preset: number };

export function initialPlayerState(preset = 0): PlayerState {
  return { preset, step: 0, playing: false, speed: "1" };
}

/**
 * Build the reducer for a visual whose presets have `totals[i]` steps. Rules: manual stepping,
 * seeking and jumping pause playback; play at the last step restarts from the first; playback
 * stops by itself on the last step (no loops); switching presets resets to step 1, paused.
 */
export function makePlayerReducer(totals: readonly number[]) {
  const lastOf = (preset: number) => Math.max(0, (totals[preset] ?? 1) - 1);
  return function reduce(state: PlayerState, action: PlayerAction): PlayerState {
    const last = lastOf(state.preset);
    switch (action.type) {
      case "next":
        return { ...state, step: Math.min(state.step + 1, last), playing: false };
      case "prev":
        return { ...state, step: Math.max(state.step - 1, 0), playing: false };
      case "first":
      case "restart":
        return { ...state, step: 0, playing: false };
      case "last":
        return { ...state, step: last, playing: false };
      case "seek": {
        const step = Math.min(Math.max(Math.round(action.step), 0), last);
        return { ...state, step, playing: false };
      }
      case "play":
        if (last === 0) return state;
        return state.step >= last
          ? { ...state, step: 0, playing: true }
          : { ...state, playing: true };
      case "pause":
        return state.playing ? { ...state, playing: false } : state;
      case "toggle":
        return reduce(state, { type: state.playing ? "pause" : "play" });
      case "tick": {
        if (!state.playing) return state;
        const step = Math.min(state.step + 1, last);
        return { ...state, step, playing: step < last };
      }
      case "speed":
        return { ...state, speed: action.speed };
      case "preset": {
        const preset = Math.min(Math.max(action.preset, 0), totals.length - 1);
        return { ...state, preset, step: 0, playing: false };
      }
    }
  };
}

/** Keyboard map inside the player group (DESIGN.md: only while focus is inside the group). */
export function keyAction(key: string): PlayerAction | null {
  switch (key) {
    case "ArrowLeft":
      return { type: "prev" };
    case "ArrowRight":
      return { type: "next" };
    case " ":
    case "Spacebar":
      return { type: "toggle" };
    case "Home":
      return { type: "first" };
    case "End":
      return { type: "last" };
    default:
      return null;
  }
}
