// Named concept animations (plan §4.11.1 "Scene"). Each has Zod-validated props and builds
// frames for the shared player, deterministically, at build time.
import type { z } from "zod";
import { buildGrowth, growthProps } from "./growth-rates";
import { buildJudging, judgingProps } from "./how-judging-works";
import { buildStdinFlow, stdinFlowProps } from "./stdin-flow";
import type { SceneBuild } from "./types";

interface SceneDef<S extends z.ZodType> {
  props: S;
  build: (props: z.infer<S>) => SceneBuild;
}

function def<S extends z.ZodType>(props: S, build: (p: z.infer<S>) => SceneBuild): SceneDef<S> {
  return { props, build };
}

export const SCENES = {
  "stdin-flow": def(stdinFlowProps, buildStdinFlow),
  "how-judging-works": def(judgingProps, buildJudging),
  "growth-rates": def(growthProps, buildGrowth),
} as const;

export type SceneName = keyof typeof SCENES;
export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

export function buildScene(name: string, props: unknown): SceneBuild {
  if (!(name in SCENES))
    throw new Error(`<Scene name="${name}">: unknown scene (${SCENE_NAMES.join(", ")})`);
  const scene = SCENES[name as SceneName] as SceneDef<z.ZodType>;
  const parsed = scene.props.safeParse(props);
  if (!parsed.success) {
    throw new Error(
      `<Scene name="${name}">: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(props)"}: ${i.message}`).join("; ")}`,
    );
  }
  return scene.build(parsed.data);
}
