# W3 visualization notes (Phase 4)

Working notes of the visualization engineer: decisions, measurements, and what is still open.
The design record is `main-app/DESIGN.md` → Visual Language ([W3] parts); this file is the why.

## What exists

- **Data and schemas**: `lib/viz/schema.ts` (Zod: frame schemas per visualizer, `.frames.json`,
  `.trace.json`, `.viz.yaml`, `.trace.yaml`), `lib/viz/states.ts` (state vocabulary, no Zod),
  `lib/viz/validate.ts` (`validateVisualFile` for W1's content check and prebuild).
- **Authoring tools (PyPy 3.8)**: `tools/viz/vizrec.py` (the recorder a `.viz.py` imports),
  `tools/viz/trace.py` (line tracer for CodeTrace, with captions written from the events).
- **Scripts**: `gen:viz`, `check:viz` (G-VIZ), `viz:shots`. Logic in `tools/viz/lib.ts`,
  `tools/viz/check.ts`; CLIs in `tools/viz/{gen-viz,check-viz,viz-shots}.ts`.
- **Library**: layouts in `lib/viz/layout*.ts`; renderer `components/viz/SceneSvg.tsx` +
  `primitives/`; player in `components/viz/player/`; MDX components `Figure`, `StepThrough`,
  `CodeTrace`, `Diagram`, `Scene` (three scenes); `createVizComponents(baseDir)` for W1's MDX map;
  `remarkFigureNumbers` numbers figures.
- **Gallery**: `/dev/viz` (dev only), sections Primitives, Visualizers, Players, Code trace, Scenes.
- **Fixture visuals**: M90.1 CodeTrace; M90.2 BFS grid + queue (3 presets); M90.3 array two
  pointers, Dijkstra graph + heap, recursion tree, route-count table (+ a Diagram of it), interval
  merge on a number line, binary search on a plot, plus W1's stdin-flow scene. Every frames
  visual has a consistency check against its example program.

## Decisions

1. **Frames at authoring time, layout at render time.** A `.viz.py` records plain frame data
   (values and state codes), never coordinates. Layout is TypeScript, shared by SSR, the client
   player and G-VIZ, so the width check measures exactly what readers see.
2. **One box per panel across every step and preset** (union layout). No layout shift while
   stepping or switching presets; TreeViz lays out the union tree, which is why tree ids must name
   positions (G-VIZ `tree-ids`).
3. **CSS transitions instead of the Motion library.** The choreography needed (two phases,
   interruption, reduced motion) is a few CSS rules plus class toggles (`.vz-live`, `.vz-snap`,
   `.vz-enter`, `.vz-exit`). No runtime dependency, nothing to configure for reduced motion
   beyond `--vz-dur: 0ms`, and the lazy chunk stays small. DESIGN.md's W2 text mentions
   `MotionConfig`; the behaviour it asks for is implemented, without Motion.
4. **Styling by state custom properties** (`data-s` → `--vz-fill`, `--vz-edge`, …). Colours only
   through `var(--color-viz-…)`; a unit test scans for literal colours.
5. **Lazy hydration.** The server renders the first frame and the full chrome; `PlayerMount`
   loads the one shared player chunk when a figure comes within 600 px of the viewport, or on
   focus, pointer or click (the click is replayed, focus restored). Frozen gallery demos never
   hydrate.
6. **Text measurement** uses a per-character advance table for Atkinson Hyperlegible Next,
   measured in Chromium (`_scratch/w3/advances.mjs`), and 0.62 em for Mono. Layout adds a 3%
   margin; label knockouts use the raw advance so they hug the glyphs.
7. **Labels paint last, on a knockout.** A halo alone let sweep lines, `mid` lines and edges show
   between letters; free-standing text now paints above every shape on a stage-coloured rect.
8. **Relative imports inside the viz modules** that Node tools and Vitest load (scenes, tokens):
   neither resolves `@/` without extra config.

## Decision for the Manager: Motion vs CSS transitions (plan §4.2 marks Motion [DECIDED])

1. The player runs on CSS transitions and keyframes (`components/viz/viz.css`, about 60 lines), not Motion. `motion` stays in package.json until you rule; W1 owns it.
2. Measured cost avoided: the lazy player chunk is **18.3 kB gzip** today. Motion's smallest React set for enter/exit (`LazyMotion` + `domAnimation` + `m` + `AnimatePresence` + `MotionConfig`, React external, minified with the repo's rolldown) adds **27.7 kB gzip**, so the chunk would be about 46 kB. With layout animations (`domMax`) it adds **40.8 kB**, about 59 kB, against the 60 kB budget.
3. Nothing in the §4.11 motion rules needs Motion. Two-phase cause-then-effect sequencing is `transition-delay`. Enter and exit are keyframes plus one render that keeps exiting items. Interruption is the `.vz-snap` class. Reduced motion is `--vz-dur: 0ms`. "Layout" movement is a CSS `transform` transition on positioned SVG groups; SVG has no DOM layout to measure.
4. What Motion would add that we don't use: spring physics, gestures and drag, FLIP layout measurement of HTML boxes, and animating between unrelated elements. None of these is in the brief, and spring or bouncy motion is ruled out by DESIGN.md's single easing curve.
5. Recommendation: accept CSS-only for the visualization library, and keep Motion available for W2's UI surfaces only if they need it. If the ruling is to use Motion anyway, the player swap is contained to `Player.tsx`, `SceneSvg.tsx` and `viz.css`.

## Measurements (2026-09-24)

- **Lazy player chunk**: 18.3 kB gzip (53.5 kB raw), one shared file. Target was ≤ 60 kB.
  Before splitting `states.ts` out of `schema.ts` it was 110.6 kB gzip: Zod had been pulled in
  through `stateOf`. `tests/unit/viz/bundle-boundary.test.ts` now guards this. The always-loaded
  mount code is about 2 kB + 4 kB gzip in page chunks. Measured from a production build in
  `test-results/w3-build` (built under the build lock; `tsconfig.json` and `next-env.d.ts`
  restored afterwards).
- **Long tasks** (PerformanceObserver `longtask`, 390 px, production build, M90.3 lesson with 8
  visuals, M90.1 trace lesson, `/dev/viz`): none during load, scroll-driven hydration, or 4 s of
  playback. With 4× CPU throttling: none during scroll or playback; 51–78 ms tasks at page load
  (page hydration, the same on pages without visuals).
- **Minimum text size** in a real browser: 0 problems at 390, 600, 640, 700, 768, 1024 and 1440 px
  across 5 pages (292 screenshots at four widths). The 768 px run found CodeTrace labels at
  9.8 px (two columns squeezed the state panel); fixed by giving the state column a 22rem minimum
  and stacking below 44rem of player width.
- **Horizontal scroll**: none at any of those widths.
- **axe** (wcag2a/aa, 2.1, 2.2 aa, best-practice) on every `figure.vz-figure` after hydration,
  390 and 1440, four pages: 0 violations.
- **Tests**: 84 viz unit tests (schemas, reducer, keyboard map, trace expansion, layouts, remark
  plugin, tokens against `globals.css`, scenes, bundle boundary, and every G-VIZ rule on its own
  failing fixture).

## Bugs found and fixed on the way (reproduced first)

- Trace end step pointed at the last traced line inside a function (11) while its caption said
  the module line (16) ran; now the module frame's line (error ends keep the raising line).
  Regression test in `trace.test.ts`. The `/dev/viz` demo had the same bug.
- Recursion tree ids by call order collided across presets and corrupted the union tree; new
  G-VIZ rule `tree-ids` with a fixture.
- Compare bracket legs ran through pointer labels; heap values touched their circles; an empty
  heap drew nothing; the table's vertical dependency arrow sat on the current caret.
- G-VIZ scanned `{/* … */}` MDX comments as live components.
- Review round 2: heap text touched node edges and index labels crowded nodes; heap is now pills
  with indices only under the array. New G-VIZ rule `collision` (`lib/viz/collide.ts`, fixture
  `G-VIZ/collision`, unit test over every gallery sample and scene) then caught: tree pills and
  judge boxes too tight, plot marker values overlapping each other and the y ticks, and the
  vline label over the y-axis title. All fixed. Row figures now share one scale (`--vz-n*`,
  `data-row-at`).

## Open

- `--color-viz-changed` needs to land in `app/globals.css` (asked W2; fallback in place).
- `leasePort` misses listeners on `::` (asked W1; `viz:shots` works around it).
- Builds writing to `.next` kill running dev servers (asked orchestrator/W1 for a separate build
  dist dir). `viz:shots` reuses a running dev server and retries a dropped page load once.
- W1-owned lint/typecheck failures seen at the end of the session:
  `tests/e2e/support/fixtures.ts` (lint), `tests/e2e/copy-button.spec.ts:47` (TS2532).
