import { framesFileSchema } from "@/lib/viz/schema";
import { figureLabel } from "./FigureShell";
import type { FigureInfo } from "./figure-context";
import { playerUid } from "./load";
import type { FramesPlayerData } from "./player/types";
import { FramesPlayer } from "./StepThrough";
import { buildScene } from "./scenes";

export interface SceneProps {
  /** A named concept animation from components/viz/scenes (stdin-flow, how-judging-works, growth-rates). */
  name: string;
  figure?: FigureInfo;
  [prop: string]: unknown;
}

/** A concept animation: frames built from Zod-validated props, played by the shared player. */
export function Scene({ name, figure, ...props }: SceneProps) {
  const built = buildScene(name, props);
  // The built frames obey the same schema as a recorded .frames.json.
  const check = framesFileSchema.safeParse({ schema: 1, kind: "frames", id: name, ...built });
  if (!check.success) {
    throw new Error(
      `<Scene name="${name}"> built invalid frames: ${check.error.issues[0]?.message ?? ""}`,
    );
  }
  const data: FramesPlayerData = {
    kind: "frames",
    uid: playerUid(name, figure?.number),
    label: figureLabel(figure, built.alt),
    layout: built.layout,
    panels: built.panels,
    presets: built.presets,
    legend: [],
    initialPreset: 0,
  };
  return <FramesPlayer data={data} alt={figure?.alt ?? built.alt} figure={figure} kind="scene" />;
}
