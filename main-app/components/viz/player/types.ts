// Serializable data a player receives from its server component (passed through PlayerMount).
import type { CodeToken } from "@/components/content/highlight";
import type { PanelSpec, TraceFile, VizState } from "@/lib/viz/schema";

export interface FramesStep {
  caption: string;
  skipped?: number | undefined;
  panels: Record<string, unknown>;
}

/** Gallery-only presentation options (the /dev/viz player-state entries). */
export interface PlayerDemo {
  /** Start on this step instead of the first. */
  step?: number | undefined;
  /** Never hydrate: a frozen picture of one player state (e.g. "playing"). */
  frozen?: { playing: boolean } | undefined;
  /** Force the reduced-motion timings regardless of the OS setting. */
  reducedMotion?: boolean | undefined;
}

export interface FramesPlayerData {
  kind: "frames";
  uid: string;
  /** Accessible name of the player group (figure number and caption). */
  label: string;
  layout: "single" | "row";
  panels: PanelSpec[];
  presets: { id: string; label: string; steps: FramesStep[] }[];
  legend: VizState[];
  initialPreset: number;
  demo?: PlayerDemo | undefined;
}

export interface TracePlayerData {
  kind: "trace";
  uid: string;
  label: string;
  /** Highlighted source lines (Shiki tokens, colours mapped to syntax tokens). */
  lines: CodeToken[][];
  presets: TraceFile["presets"];
  legend: VizState[];
  initialPreset: number;
  demo?: PlayerDemo | undefined;
}

export type PlayerData = FramesPlayerData | TracePlayerData;
