import { FigureShell, figureLabel } from "./FigureShell";
import type { FigureInfo } from "./figure-context";
import { loadFrames, playerUid, presetIndex } from "./load";
import { FramesStage } from "./player/FramesStage";
import { PlayerMount } from "./player/PlayerMount";
import { PlayerView } from "./player/PlayerView";
import { legendStates, prepareFrames, stepLabel } from "./player/prepare";
import type { FramesPlayerData, PlayerDemo } from "./player/types";

export interface StepThroughProps {
  /** `visuals/<name>.frames.json`, relative to the module directory. */
  frames: string;
  /** Initial preset id (defaults to the first preset). */
  preset?: string;
  /** Absolute module directory; bound by createVizComponents. */
  baseDir?: string;
  figure?: FigureInfo;
  /** Gallery only (/dev/viz): show one frozen player state. Not part of the MDX contract. */
  demo?: PlayerDemo;
}

/** An algorithm step-through: recorded frames, one or two panels, the shared player. */
export function StepThrough({ frames, preset, baseDir, figure, demo }: StepThroughProps) {
  const file = loadFrames(baseDir, frames);
  const initialPreset = presetIndex(file.presets, preset, frames);
  const data: FramesPlayerData = {
    kind: "frames",
    uid: playerUid(file.id, figure?.number),
    label: figureLabel(figure, file.alt),
    layout: file.layout,
    panels: file.panels,
    presets: file.presets.map((p) => ({ id: p.id, label: p.label, steps: p.steps })),
    legend: [],
    initialPreset,
    demo,
  };
  return (
    <FramesPlayer data={data} alt={figure?.alt ?? file.alt} figure={figure} kind="step-through" />
  );
}

/** Server render of a frames player (StepThrough and Scene): first frame + lazy player. */
export function FramesPlayer({
  data,
  alt,
  figure,
  kind,
}: {
  data: FramesPlayerData;
  alt: string;
  figure: FigureInfo | undefined;
  kind: string;
}) {
  const prepared = prepareFrames(data);
  const withLegend: FramesPlayerData = {
    ...data,
    legend: legendStates(prepared.flatMap((p) => p.scenes.flat())),
  };
  const ip = data.initialPreset;
  const steps = data.presets[ip]?.steps ?? [];
  const at = data.demo?.step ?? 0;
  const first = steps[at];
  return (
    <FigureShell
      kind={kind}
      figure={figure}
      alt={alt}
      steps={data.presets.map((p) => ({ label: p.label, captions: p.steps.map((s) => s.caption) }))}
    >
      <PlayerMount data={withLegend}>
        <PlayerView
          uid={data.uid}
          label={data.label}
          presets={data.presets.map((p) => ({ id: p.id, label: p.label }))}
          preset={ip}
          step={at}
          total={steps.length}
          playing={data.demo?.frozen?.playing ?? false}
          speed="1"
          caption={first?.caption ?? ""}
          skipped={first?.skipped}
          legend={withLegend.legend}
          reducedMotion={data.demo?.reducedMotion}
          stage={
            <FramesStage
              layout={data.layout}
              panels={data.panels}
              scenes={prepared.map((p) => p.scenes[ip]?.[at]).filter((s) => s !== undefined)}
              boxes={prepared.map((p) => p.box)}
              stepLabel={stepLabel(at, steps.length)}
            />
          }
        />
      </PlayerMount>
    </FigureShell>
  );
}
