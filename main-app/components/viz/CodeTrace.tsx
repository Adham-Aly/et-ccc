import { highlightLines } from "@/components/content/highlight";
import { FigureShell, figureLabel } from "./FigureShell";
import type { FigureInfo } from "./figure-context";
import { loadTrace, playerUid, presetIndex } from "./load";
import { PlayerMount } from "./player/PlayerMount";
import { PlayerView } from "./player/PlayerView";
import { legendStates, prepareTrace, stepLabel } from "./player/prepare";
import { TraceStage } from "./player/TraceStage";
import type { PlayerDemo, TracePlayerData } from "./player/types";

export interface CodeTraceProps {
  /** `examples/<name>.trace.json`, relative to the module directory. */
  trace: string;
  preset?: string;
  baseDir?: string;
  figure?: FigureInfo;
  /** Gallery only (/dev/viz): show one frozen player state. Not part of the MDX contract. */
  demo?: PlayerDemo;
}

/** Python code running line by line: current line, frames and objects, output so far. */
export async function CodeTrace({ trace, preset, baseDir, figure, demo }: CodeTraceProps) {
  const file = loadTrace(baseDir, trace);
  const ip = presetIndex(file.presets, preset, trace);
  const lines = await highlightLines(file.code, "python");
  const prepared = prepareTrace(file);
  const data: TracePlayerData = {
    kind: "trace",
    uid: playerUid(file.id, figure?.number),
    label: figureLabel(figure, file.alt),
    lines,
    presets: file.presets,
    legend: legendStates(prepared.scenes.flat()),
    initialPreset: ip,
    demo,
  };
  const at = demo?.step ?? 0;
  const first = prepared.states[ip]?.[at];
  const scene = prepared.scenes[ip]?.[at];
  const total = file.presets[ip]?.steps.length ?? 1;
  if (!first || !scene) throw new Error(`${trace}: empty trace`);
  return (
    <FigureShell
      kind="code-trace"
      figure={figure}
      alt={figure?.alt ?? file.alt}
      steps={file.presets.map((p) => ({ label: p.label, captions: p.steps.map((s) => s.c) }))}
    >
      <PlayerMount data={data}>
        <PlayerView
          uid={data.uid}
          label={data.label}
          presets={file.presets.map((p) => ({ id: p.id, label: p.label }))}
          preset={ip}
          step={at}
          total={total}
          playing={demo?.frozen?.playing ?? false}
          reducedMotion={demo?.reducedMotion}
          speed="1"
          caption={first.caption}
          skipped={first.skipped}
          legend={data.legend}
          stage={
            <TraceStage
              lines={lines}
              state={first}
              scene={scene}
              box={prepared.box}
              outputLines={prepared.outputLines}
              stepLabel={stepLabel(at, total)}
            />
          }
        />
      </PlayerMount>
    </FigureShell>
  );
}
