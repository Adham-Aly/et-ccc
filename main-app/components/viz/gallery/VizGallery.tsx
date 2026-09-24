// The /dev/viz gallery (plan §4.11.6): every primitive, every visualizer in every state, every
// player state, the code tracer and each scene. Where visual baselines and the design review
// start. Previews only (the route 404s in production).
import path from "node:path";
import type { ReactNode } from "react";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { h1Class, h2Class } from "@/components/layout/type-styles";
import { PAD, type VizItem, type VizScene } from "@/lib/viz/geometry";
import type { VizState } from "@/lib/viz/schema";
import { CodeTrace } from "../CodeTrace";
import { Diagram } from "../Diagram";
import { Legend } from "../player/Legend";
import { Scene } from "../Scene";
import { SceneSvg } from "../SceneSvg";
import { StepThrough } from "../StepThrough";
import * as S from "./samples";

const GALLERY_DIR = path.join(process.cwd(), "app", "dev", "viz");

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-14 border-rule border-t pt-6 first-of-type:mt-10 first-of-type:border-t-0 first-of-type:pt-0"
    >
      <h2 className={h2Class}>{title}</h2>
      {intro ? <p className="mt-2 max-w-(--measure) text-ink-2 text-small">{intro}</p> : null}
      <div className="mt-6 flex max-w-(--measure-wide) flex-col gap-10">{children}</div>
    </section>
  );
}

function Entry({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div data-gallery={id}>
      <p className="mb-2 font-semibold text-ink-3 text-label">{label}</p>
      {children}
    </div>
  );
}

const STATES: VizState[] = [
  "none",
  "unvisited",
  "frontier",
  "current",
  "done",
  "path",
  "compare",
  "invalid",
  "wall",
  "changed",
];

function primitivesScene(): VizScene {
  const items: VizItem[] = [];
  const w = 30;
  const gap = 4;
  STATES.forEach((s, i) => {
    items.push({
      key: `c${s}`,
      t: "cell",
      x: PAD + i * (w + gap),
      y: PAD + 8,
      w,
      h: w,
      state: s,
      text: i < 9 ? String(i) : "",
    });
  });
  const y2 = PAD + 8 + w + 34;
  STATES.slice(0, 8).forEach((s, i) => {
    items.push({
      key: `n${s}`,
      t: "node",
      cx: PAD + 17 + i * 42,
      cy: y2,
      r: 16,
      state: s,
      text: String.fromCharCode(65 + i),
    });
  });
  const y3 = y2 + 44;
  STATES.slice(0, 8).forEach((s, i) => {
    items.push({
      key: `e${s}`,
      t: "edge",
      x1: PAD + i * 42,
      y1: y3,
      x2: PAD + i * 42 + 32,
      y2: y3,
      state: s,
    });
  });
  return { width: PAD * 2 + STATES.length * (w + gap) - gap, height: y3 + 14, items };
}

/** ∞ next to the digits it could be mistaken for, in cells, nodes and distance badges. */
function glyphScene(): VizScene {
  const items: VizItem[] = [];
  const values = ["8", "∞", "0", "10", "-1", "∞"];
  values.forEach((v, i) => {
    items.push({
      key: `c${i}`,
      t: "cell",
      x: PAD + i * 44,
      y: PAD,
      w: 44,
      h: 40,
      state: "none",
      text: v,
    });
  });
  ["8", "∞", "3"].forEach((v, i) => {
    const cx = PAD + 24 + i * 70;
    items.push({ key: `n${i}`, t: "node", cx, cy: PAD + 76, r: 18, state: "none", text: v });
    items.push({ key: `b${i}`, t: "badge", x: cx, y: PAD + 112, text: v });
  });
  return { width: PAD * 2 + values.length * 44, height: PAD + 130, items };
}

function toolsScene(): VizScene {
  const items: VizItem[] = [];
  for (let i = 0; i < 5; i += 1) {
    items.push({
      key: `c${i}`,
      t: "cell",
      x: PAD + 20 + i * 40,
      y: 60,
      w: 40,
      h: 40,
      state: i === 2 ? "current" : "none",
      text: String(i * 3),
    });
  }
  items.push({
    key: "dim",
    t: "dim",
    x1: PAD + 20,
    x2: PAD + 220,
    y: 18,
    yRef: 60,
    label: "range",
    kind: "range",
  });
  items.push({
    key: "cmp",
    t: "dim",
    x1: PAD + 80,
    x2: PAD + 160,
    y: 40,
    yRef: 60,
    label: "3 < 9",
    kind: "compare",
  });
  items.push({
    key: "pu",
    t: "pointer",
    x: PAD + 100,
    y: 104,
    dir: "up",
    label: "i",
    strong: true,
  });
  items.push({ key: "pu2", t: "pointer", x: PAD + 180, y: 104, dir: "up", label: "j" });
  items.push({ key: "pl", t: "pointer", x: PAD + 224, y: 80, dir: "left", label: "top" });
  items.push({ key: "badge", t: "badge", x: PAD + 300, y: 80, text: "12" });
  items.push({ key: "slot1", t: "slot", x: PAD + 20, y: 150, w: 70, h: 44, open: "top" });
  items.push({ key: "slot2", t: "slot", x: PAD + 110, y: 150, w: 90, h: 44, open: "ends" });
  items.push({ key: "slot3", t: "slot", x: PAD + 220, y: 150, w: 50, h: 44, open: "none" });
  items.push({
    key: "slot4",
    t: "slot",
    x: PAD + 285,
    y: 150,
    w: 50,
    h: 44,
    open: "none",
    strong: true,
  });
  items.push({
    key: "arrow",
    t: "arrow",
    d: `M ${PAD + 24} 226 C ${PAD + 80} 226, ${PAD + 120} 250, ${PAD + 180} 250`,
    state: "none",
    dot: { x: PAD + 24, y: 226 },
  });
  items.push({
    key: "arrowq",
    t: "arrow",
    d: `M ${PAD + 200} 226 L ${PAD + 330} 226`,
    state: "frontier",
  });
  items.push({
    key: "t1",
    t: "text",
    x: PAD + 200,
    y: 248,
    text: "label 14",
    role: "label",
    anchor: "start",
  });
  items.push({
    key: "t2",
    t: "text",
    x: PAD + 280,
    y: 248,
    text: "v=16",
    role: "value",
    anchor: "start",
  });
  return { width: 356, height: 266, items };
}

function RawFigure({ scene, title }: { scene: VizScene; title: string }) {
  return (
    <figure className="vz-figure" data-exhibit="">
      <div className="vz-frame vz-static">
        <div className="vz-stage">
          <SceneSvg
            scene={scene}
            box={{ width: scene.width, height: scene.height }}
            title={title}
          />
        </div>
      </div>
    </figure>
  );
}

function D({
  viz,
  data,
  caption,
  alt,
  title,
}: {
  viz: string;
  data: unknown;
  caption: string;
  alt: string;
  title?: string;
}) {
  return <Diagram viz={viz} data={data} title={title} figure={{ caption, alt }} />;
}

export async function VizGallery() {
  const frames = "visuals/bfs-demo.frames.json";
  const trace = "examples/trace_demo.trace.json";
  return (
    <SiteFrame current="none" wide>
      <h1 className={h1Class}>Visual gallery</h1>
      <p className="mt-3 max-w-(--measure) text-body text-ink-2">
        Every primitive, visualizer, player state and scene of the visualization library, for the
        pixel review and the visual baselines. Previews only.
      </p>

      <Section
        id="primitives"
        title="Primitives"
        intro="Cells, nodes and edges in each state; pointer, dimension line, compare bracket, badge, container slots, reference arrow and text roles."
      >
        <Entry id="primitives-states" label="States: cells (none to changed), nodes, edges">
          <RawFigure scene={primitivesScene()} title="Primitives in each state" />
        </Entry>
        <Entry
          id="primitives-tools"
          label="Pointer, dimension line, compare, badge, slots, arrows, text"
        >
          <RawFigure scene={toolsScene()} title="Drawing tools" />
        </Entry>
        <Entry id="glyphs" label="Value glyphs: ∞ from the text face beside Mono digits">
          <RawFigure scene={glyphScene()} title="Value glyphs" />
        </Entry>
        <Entry id="legend" label="Legend (every state)">
          <div className="vz-frame vz-static">
            <Legend
              states={[
                "current",
                "frontier",
                "done",
                "unvisited",
                "path",
                "compare",
                "invalid",
                "wall",
                "changed",
              ]}
            />
          </div>
        </Entry>
      </Section>

      <Section
        id="visualizers"
        title="Visualizers"
        intro="Each visualizer drawing one frame (static Diagrams: no JavaScript)."
      >
        <Entry id="array" label="ArrayViz: states, pointers, range">
          <D
            viz="ArrayViz"
            data={S.arrayStates}
            caption="An array with every cell state, three pointers and a range."
            alt="Seven values; cells are not reached, queued, current, done, on the answer path, compared and invalid. Pointers lo, mid and hi sit under indices 0, 2 and 6."
          />
        </Entry>
        <Entry id="array-compare" label="ArrayViz: compare bracket, pointers above, range below">
          <D
            viz="ArrayViz"
            data={S.arrayCompare}
            caption="Two compared cells with the comparison written on the bracket."
            alt="Five values; 5 and 8 are compared (5 < 8); i and j point at them; a window spans indices 1 to 3."
          />
        </Entry>
        <Entry id="array-circular" label="ArrayViz: circular">
          <D
            viz="ArrayViz"
            data={S.arrayCircular}
            caption="A circular array: after the last index comes index 0 again."
            alt="Five letters a to e in a circle; head points at c."
          />
        </Entry>
        <Entry id="grid" label="GridViz: every state, walls, values">
          <D
            viz="GridViz"
            data={S.gridStates}
            caption="A grid with distances, walls and every cell state."
            alt="A 4 by 6 grid with walls, a green answer path, one current cell, one queued, done, compared and invalid cells."
          />
        </Entry>
        <Entry id="grid-plain" label="GridViz: no indices">
          <D
            viz="GridViz"
            data={S.gridPlain}
            caption="A plain grid without row and column numbers."
            alt="A 3 by 4 grid with two walls."
          />
        </Entry>
        <Entry id="graph" label="GraphViz: node and edge states, weights, values">
          <D
            viz="GraphViz"
            data={S.graphStates}
            caption="A weighted graph with a distance under each node."
            alt="Six nodes A to F with weighted edges; A is done, B current, C queued, D on the answer path, E not reached, F invalid."
          />
        </Entry>
        <Entry id="graph-directed" label="GraphViz: directed">
          <D
            viz="GraphViz"
            data={S.graphDirected}
            caption="A directed graph: arrows show which way each edge goes."
            alt="Four nodes with directed edges 1 to 2, 2 to 4, 3 to 1 and 3 to 2."
          />
        </Entry>
        <Entry id="tree" label="TreeViz: node and edge states, notes">
          <D
            viz="TreeViz"
            data={S.treeStates}
            caption="A recursion tree with return values under finished calls."
            alt="f(4) calls f(3) and f(2); f(3) calls f(2) and f(1); f(2) calls f(1) and f(0)."
          />
        </Entry>
        <Entry id="table" label="TableViz: headers, states, dependency arrows">
          <D
            viz="TableViz"
            data={S.tableStates}
            caption="A table filled row by row; arrows show which cells the current cell reads."
            alt="A 4 by 6 table of numbers; the current cell at row 3, column 5 reads the cells at row 2, columns 2 and 5."
          />
        </Entry>
        <Entry id="struct-stack" label="StructViz: stack">
          <D
            viz="StructViz"
            data={S.structStack}
            caption="A stack: the top is the end where items are added and removed."
            alt="A stack holding 4, 9 and 2, with 2 on top."
          />
        </Entry>
        <Entry id="struct-queue" label="StructViz: queue">
          <D
            viz="StructViz"
            data={S.structQueue}
            caption="A queue: items leave at the front and join at the back."
            alt="A queue holding A, C, D and F; A is at the front."
          />
        </Entry>
        <Entry id="struct-deque" label="StructViz: deque">
          <D
            viz="StructViz"
            data={S.structDeque}
            caption="A deque: items can leave and join at both ends."
            alt="A deque holding 7, 5 and 2."
          />
        </Entry>
        <Entry id="struct-heap" label="StructViz: heap as tree and array">
          <D
            viz="StructViz"
            data={S.structHeap}
            caption="A heap drawn twice: as a tree and as the list that stores it."
            alt="A min-heap 1, 3, 2, 7, 4, 5, 9; item i has children 2i + 1 and 2i + 2."
          />
        </Entry>
        <Entry id="struct-map" label="StructViz: dictionary">
          <D
            viz="StructViz"
            data={S.structMap}
            caption="A dictionary: each key leads to its value."
            alt="A dictionary with keys a, b and z and values 3, 1 and 2."
          />
        </Entry>
        <Entry id="struct-set" label="StructViz: set">
          <D
            viz="StructViz"
            data={S.structSet}
            caption="A set: each value at most once, in no particular order."
            alt="A set of 2, 3, 5, 7 and 11."
          />
        </Entry>
        <Entry id="line" label="LineViz: number line, intervals, points, sweep">
          <D
            viz="LineViz"
            data={S.lineStates}
            caption="Intervals on a number line with a sweep line at x = 5."
            alt="A number line from 0 to 10 with intervals [1, 4], [3, 7] and [8, 10], points a and b, and a sweep line at 5."
          />
        </Entry>
        <Entry id="wheel" label="LineViz: clock wheel">
          <D
            viz="LineViz"
            data={S.lineWheel}
            caption="A clock of 12 positions: counting past 11 wraps to 0."
            alt="A wheel with positions 0 to 11; the hand points at 9."
          />
        </Entry>
        <Entry id="plot" label="PlotViz: series styles, band, marker, vertical line">
          <D
            viz="PlotViz"
            data={S.plotStates}
            caption="Three functions on one chart, a search range and its middle."
            alt="A curve with its lowest point at x = 6, a line x + 5 and a line 3x; the range 3 to 8 is shaded."
          />
        </Entry>
      </Section>

      <Section
        id="players"
        title="Player states"
        intro="The shared player on a recorded step-through (GridViz and a StructViz queue, two presets)."
      >
        <Entry id="player-initial" label="Initial (first step; hydrates near the viewport)">
          <StepThrough
            frames={frames}
            baseDir={GALLERY_DIR}
            figure={{ caption: "Breadth-first search on a grid.", number: 1 }}
          />
        </Entry>
        <Entry id="player-mid" label="Mid-step (frozen)">
          <StepThrough
            frames={frames}
            baseDir={GALLERY_DIR}
            figure={{ caption: "The same search, part way through." }}
            demo={{ step: 6, frozen: { playing: false } }}
          />
        </Entry>
        <Entry id="player-end" label="Last step (frozen)">
          <StepThrough
            frames={frames}
            baseDir={GALLERY_DIR}
            figure={{ caption: "The same search at its last step." }}
            demo={{ step: 20, frozen: { playing: false } }}
          />
        </Entry>
        <Entry id="player-playing" label="Playing (frozen picture of the playing state)">
          <StepThrough
            frames={frames}
            baseDir={GALLERY_DIR}
            figure={{ caption: "The same search while it plays." }}
            demo={{ step: 3, frozen: { playing: true } }}
          />
        </Entry>
        <Entry id="player-reduced" label="Reduced motion (interactive; transitions snap)">
          <StepThrough
            frames={frames}
            baseDir={GALLERY_DIR}
            figure={{ caption: "The same search with reduced motion." }}
            demo={{ reducedMotion: true }}
          />
        </Entry>
        <Entry id="player-preset" label="Second preset selected">
          <StepThrough
            frames={frames}
            preset="walls"
            baseDir={GALLERY_DIR}
            figure={{ caption: "The search on the grid with walls." }}
          />
        </Entry>
      </Section>

      <Section
        id="trace"
        title="Code trace"
        intro="CodeTraceViz: loops, one list with two names, a function call and recursion."
      >
        <Entry id="trace-initial" label="Initial">
          <CodeTrace
            trace={trace}
            baseDir={GALLERY_DIR}
            figure={{ caption: "A program traced line by line.", number: 2 }}
          />
        </Entry>
        <Entry id="trace-recursion" label="Deepest recursion (frozen)">
          <CodeTrace
            trace={trace}
            baseDir={GALLERY_DIR}
            figure={{ caption: "The same program at its deepest call." }}
            demo={{ step: 29, frozen: { playing: false } }}
          />
        </Entry>
      </Section>

      <Section id="scenes" title="Scenes" intro="Named concept animations built from props.">
        <Entry id="scene-stdin" label="stdin-flow">
          <Scene
            name="stdin-flow"
            lines={["5", "red green blue", "hello"]}
            reads={[{ name: "n", as: "int" }, { name: "words", as: "split" }, { name: "word" }]}
            figure={{ caption: "How input() reads standard input one line at a time.", number: 3 }}
          />
        </Entry>
        <Entry id="scene-judging" label="how-judging-works">
          <Scene
            name="how-judging-works"
            verdicts={["AC", "WA", "TLE"]}
            figure={{ caption: "What the judge does with each test case." }}
          />
        </Entry>
        <Entry id="scene-growth" label="growth-rates">
          <Scene
            name="growth-rates"
            curves={["n", "nlogn", "n2"]}
            points={[2, 4, 8, 16, 32]}
            yMax={300}
            figure={{ caption: "How n, n log n and n² grow." }}
          />
        </Entry>
      </Section>
    </SiteFrame>
  );
}
