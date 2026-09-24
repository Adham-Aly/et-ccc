import { describe, expect, it } from "vitest";
import {
  initialPlayerState,
  keyAction,
  makePlayerReducer,
  type PlayerState,
  SPEEDS,
} from "../../../lib/viz/player-state";

const reduce = makePlayerReducer([5, 2]);
const at = (step: number, extra: Partial<PlayerState> = {}): PlayerState => ({
  ...initialPlayerState(),
  step,
  ...extra,
});

describe("player reducer", () => {
  it("steps within bounds and pauses on manual stepping", () => {
    expect(reduce(at(0), { type: "prev" }).step).toBe(0);
    expect(reduce(at(4), { type: "next" }).step).toBe(4);
    const s = reduce(at(1, { playing: true }), { type: "next" });
    expect(s).toMatchObject({ step: 2, playing: false });
  });

  it("seek clamps and rounds, first/last jump", () => {
    expect(reduce(at(0), { type: "seek", step: 9 }).step).toBe(4);
    expect(reduce(at(0), { type: "seek", step: -3 }).step).toBe(0);
    expect(reduce(at(0), { type: "seek", step: 2.6 }).step).toBe(3);
    expect(reduce(at(2), { type: "last" }).step).toBe(4);
    expect(reduce(at(2, { playing: true }), { type: "first" })).toMatchObject({
      step: 0,
      playing: false,
    });
  });

  it("plays to the last step and stops there (no loop)", () => {
    let s = reduce(at(2), { type: "play" });
    expect(s.playing).toBe(true);
    s = reduce(s, { type: "tick" });
    expect(s).toMatchObject({ step: 3, playing: true });
    s = reduce(s, { type: "tick" });
    expect(s).toMatchObject({ step: 4, playing: false });
    expect(reduce(s, { type: "tick" })).toBe(s);
  });

  it("play on the last step restarts from the first", () => {
    expect(reduce(at(4), { type: "play" })).toMatchObject({ step: 0, playing: true });
  });

  it("toggle alternates play and pause", () => {
    const playing = reduce(at(0), { type: "toggle" });
    expect(playing.playing).toBe(true);
    expect(reduce(playing, { type: "toggle" }).playing).toBe(false);
  });

  it("switching presets resets to step 1, paused, and clamps", () => {
    expect(reduce(at(3, { playing: true }), { type: "preset", preset: 1 })).toMatchObject({
      preset: 1,
      step: 0,
      playing: false,
    });
    expect(reduce(at(0), { type: "preset", preset: 7 }).preset).toBe(1);
    const p1 = { ...at(0), preset: 1 };
    expect(reduce(p1, { type: "last" }).step).toBe(1);
  });

  it("a one-step visual never plays", () => {
    const one = makePlayerReducer([1]);
    const s = at(0);
    expect(one(s, { type: "play" })).toBe(s);
  });

  it("speed changes keep the step", () => {
    expect(reduce(at(2), { type: "speed", speed: "2" })).toMatchObject({ step: 2, speed: "2" });
  });
});

describe("keyboard map and speeds", () => {
  it("maps the documented keys only", () => {
    expect(keyAction("ArrowLeft")).toEqual({ type: "prev" });
    expect(keyAction("ArrowRight")).toEqual({ type: "next" });
    expect(keyAction(" ")).toEqual({ type: "toggle" });
    expect(keyAction("Home")).toEqual({ type: "first" });
    expect(keyAction("End")).toEqual({ type: "last" });
    expect(keyAction("Enter")).toBeNull();
    expect(keyAction("ArrowUp")).toBeNull();
  });

  it("transitions always fit inside a step", () => {
    for (const s of SPEEDS) expect(s.transitionMs * 2).toBeLessThan(s.stepMs);
  });
});
