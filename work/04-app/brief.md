# P4 brief — architecture, ownership and conventions

Written by `app-orchestrator` (Opus). Every P4 worker reads this in full. The plan (`context/implementation-plan.md` v2.2) wins where this brief is silent; this brief wins on P4 implementation details (it records the orchestrator's architecture decisions, logged as D-041 onward at phase end).

## 1. Hard rules (restated from plan §11.3; binding on every worker)

1. **You must NOT spawn any subagents or use the Agent/Workflow tools. Do all work yourself.**
2. Installs: only what your prompt names, only through the wrappers, with a G-CONTAIN proof (`.tooling/bin/contain-snapshot before|after|diff <label>`) around each first install or first run. Proofs go to `work/04-app/containment/`.
3. **Call tools only through `.tooling/bin/*` or `npm run …`** (`.tooling/bin/npm run <script>` from `main-app/`). Never bare `node`, `npm`, `npx`, `pip`, `python3`, `pypy`, `playwright`, `git`, `gh`, `vercel`, `brew`. `npm exec` only as `.tooling/bin/npm exec --no -- <bin>` for pinned local devDependencies. No `create-next-app`, no shadcn CLI, no `npx <remote>`.
4. **Never commit, push or change git/gh config (the orchestrator does git). Never add co-author lines. Write nothing outside the workspace. Scratch files go in `work/04-app/_scratch/`. Do not write agent memory.**
5. Servers: lease a port with `main-app/scripts/port-lease.mjs` (4100–4199), write `work/04-app/_run/<name>.pid`, and stop what you start before returning. `next build` only under the build lock (`.tooling/locks/build.lock`, via the npm script).
6. App-wide content rules (they bind fixture content, UI copy and code too):
   - **R13 / D-020:** CCC problem links only through the registry (`judgeUrl()` / `ProblemLink` / `Practice`); 2021–2026 → `https://wmoj.ca/problems/<slug>`, 2014–2020 → `https://dmoj.ca/problem/<slug>/`; WMOJ preferred; **CCC 2014–2026 only**, any later year is a permanent build error; never type a judge URL anywhere outside the registry code.
   - **R14:** no score targets, cutoffs, "realistic" scores, ceilings, medals, CCO qualification, "Python can't/too slow". Leak list: plan §5.4. Wording rules: plan §6.5.
   - **C20 / D-030 Q-20:** no problem walkthroughs, editorials, solution pages or per-problem hints, ever, and no mention that one exists anywhere.
   - **C21 / D-030 Q-19:** no system/environment setup content (no OS instructions, online editors, installing Python/PyPy/Thonny).
   - **Python 3.8 only** in every shown code sample.
   - **Light mode only.** No `dark:` classes, no `prefers-color-scheme: dark`, no dark theme imports.
   - **No exercises, quizzes, answer boxes, predict-the-output, or code execution** in the app.
   - **Visuals only from the §4.11 library, fed by data recorded at authoring time** under PyPy 3.8.
7. Engineering standards (plan §8): reproduce bugs end to end first (failing Playwright test, then fix, test stays); be picky about the UI down to the pixel and fix anything off even if unrelated; **zero warnings, zero failures, zero flakes**; quality over development cost; keep it simple (no dependency without a clear need); determinism (pinned versions, committed generated outputs, no network in normal tests); **never hand-edit generated files** (`AGENTS.md`, `.out`, `.trace.json`, `.frames.json`, `ledger.generated.md`, `verified.json`). Anything broken that you cannot fix goes to `work/04-app/defects.md` as blocking.
8. Return at most 10 lines with file paths. Write results to files first. A return with no file counts as not done.

## 2. Architecture decisions (orchestrator)

- **A1 Stack:** exactly plan §4.2, exact pins (`save-exact`), re-check each package's current patch inside the listed line at install time and record the actual pins in `work/04-app/versions.md`. Node `engines: "24.x"` (D-033). Additional runtime deps allowed: `@mdx-js/mdx`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`, `rehype-slug`, `shiki`, `zod`, `yaml`, `motion`, `d3-hierarchy`, `minisearch`, `@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`; `tailwindcss` + `@tailwindcss/postcss`. Dev: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/d3-hierarchy`, `@biomejs/biome`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `linkinator`, `cspell`, `remark-cli` + `remark-mdx` + `remark-lint` presets, `lighthouse`. Anything else needs the orchestrator's OK (ask in your return or in `defects.md`).
- **A2 No shadcn CLI.** The two interactive pieces that need primitives (search dialog, mobile nav) are hand-written on `@base-ui/react` in `components/ui/`.
- **A3 Rendering:** App Router, every page SSG. `generateStaticParams` + `export const dynamicParams = false` on every dynamic route. No API routes, server actions, middleware/proxy, cookies, `headers()`, ISR. The only route handler is the search index (`app/search-index.json/route.ts`, `export const dynamic = 'force-static'`). Security headers in `next.config.ts` per plan §4.1. No `output: 'export'`.
- **A4 Content root and fixtures.** The loader reads the real course from `main-app/content/`. **In non-production builds** (`VERCEL_ENV !== 'production'`; local builds count as non-production unless `ETCCC_ENV=production` is set for a production-mode test) it also mounts the fixture course from `main-app/tests/fixtures/content/` as an extra stage with id **`fx`** titled "Fixtures (preview only)". Fixture modules carry normal statuses (`gated`/`reviewed`) so they render with the Draft badge. Production never includes stage `fx`, regardless of status (a unit test and an E2E test in production mode prove it). All E2E and visual tests target the fixture routes, so the suites stay stable across all later phases.
- **A5 Real content in P4:** `content/course.yaml` lists the stages and all **104** modules (IDs and titles from `research/01-recon/curriculum-map.md`, minus M0.2 and M0.3, with M7.14 kept, plan §5.3) with `status: planned`, so the course map shows "Coming soon". P5 owns the final data; mark the file header "P4 skeleton, P5 finalises". `content/registry/ccc-problems.yaml`: a stub with all **119** unique CCC 2014–2026 problems (year, level, number, derived slug, Junior aliases for crossovers, provisional title from the recon files where known, `internal.titleSource`). `glossary.yaml`, `concepts.yaml`, `ui/strings.yaml`: minimal real skeletons with the schema; P5 writes the real copy.
- **A6 Draft visibility:** Production renders only `accepted`; previews/local render `gated`, `reviewed`, `accepted` (Draft badge on the first two); `planned`/`drafted` show as "Coming soon" with no link everywhere.
- **A7 MDX:** `@mdx-js/mdx` `evaluate()` in RSC with a fixed component map (`lib/content/mdx-components.tsx`): `Callout`, `Term`, `Details`, `Code`, `Output`, `ProblemLink`, `Practice`, `JudgeLink`, `Figure`, `Diagram`, `StepThrough`, `CodeTrace`, `Scene`. Authors never import. Unknown components fail the build. Shiki at build time with the custom light theme generated from DESIGN.md tokens (`lib/content/shiki-theme.ts`).
- **A8 Client JS budget:** only plan §4.8 features (search, mark-as-read, visual players, copy button, mobile nav). Everything else is server-rendered. Players hydrate lazily near the viewport with a server-rendered, fully meaningful first frame.
- **A9 Read state:** one localStorage key `etccc:read:v1` → `{lessonId: ISODate}`; every access in try/catch; app identical minus check marks when storage throws.
- **A10 Design tokens:** single source is `main-app/DESIGN.md` → `app/globals.css` `@theme` (Tailwind 4 CSS-first) → Shiki theme → viz token module `components/viz/tokens.ts` (reads the same CSS custom properties; SVG uses `var(--…)`). No hard-coded colours outside the token files (a lint checks `components/viz` and `components/content`).
- **A11 PRODUCT.md and DESIGN.md live in `main-app/`** (plan §4.3); Impeccable's context loader is pointed at them with `--target main-app/...`.
- **A12 Fonts:** `next/font/local` from committed WOFF2 in `app/fonts/`, fetched once from the official upstream release (record URL, licence, SHA-256 in `work/04-app/fonts.md`; OFL or similar only). No remote fonts at runtime.
- **A13 Scripts** (`main-app/package.json`), every one prefixed by `node scripts/assert-contained.mjs &&`: `dev`, `build` (under the lock), `start`, `lint`, `typecheck`, `test:unit`, `content:check`, `content:status`, `check:python`, `gen:outputs`, `gen:viz`, `check:viz`, `viz:shots`, `style:check`, `lint:r14`, `lint:light`, `spell`, `lint:mdx`, `links:verify`, `links:internal`, `test:e2e`, `test:visual`, `test:a11y`, `perf`, `verify:fast` (accepts `-- --scope <id>`), `verify:full`, `deployed-url`. `prebuild` runs G-SCHEMA + G-LINK-FMT + the G-VIZ schema part.
- **A14 Gate fixtures:** every §7 gate has a failing fixture under `tests/fixtures/gates/<gate-id>/` and a Vitest or script test proving the gate fails on it (and passes on the clean fixture content).
- **A15 Vercel:** no `vercel.json` unless needed; root dir `main-app`; the build must need no Python and no network beyond npm.

## 3. Ownership (who writes which files)

Workers only write files they own. To change another owner's file, write the request into `work/04-app/requests.md` (`[from] → [to]: what and why`) and tell the orchestrator in your return; the orchestrator relays it.

| Area | Owner |
|---|---|
| `package.json`, `package-lock.json`, `.npmrc`, `next.config.ts`, `tsconfig.json`, `biome.json`, `vitest.config.ts`, `playwright.config.ts`, `cspell.json`, `.remarkrc*`, `postcss.config.mjs`, `main-app/CLAUDE.md` | app & QA engineer |
| `lib/content/**` (loader, schemas, MDX compile, component map), `lib/registry/**`, `lib/search/**`, `lib/read-state/**`, `content/**` (skeletons), `tests/fixtures/content/**` (except `visuals/` and `*.trace.json` data, see below), `tools/{pycheck,links,lint,style}/**`, `scripts/**`, `tests/{unit,e2e,visual,a11y}/**`, `app/**/page.tsx` data wiring (`generateStaticParams`, loaders), `app/search-index.json/` | app & QA engineer |
| `PRODUCT.md`, `DESIGN.md`, `app/globals.css`, `app/layout.tsx`, `app/fonts/**`, `app/not-found.tsx`, the **markup and styling** of every route page (after the app engineer's data wiring exists), `components/ui/**`, `components/layout/**`, `components/content/**` (Callout, Term, Details, Code block chrome + copy button, Output, ProblemLink/Practice/JudgeLink presentation, lesson/module/course-map/problem-list presentation), `lib/content/shiki-theme.ts` | design lead |
| `components/viz/**` (tokens, primitives, visualizers, player, scenes, Figure/Diagram/StepThrough/CodeTrace/Scene), `lib/viz/**` (Zod schemas, frame helpers), `tools/viz/**` (`trace.py`, `vizrec.py`, gen/check/shots scripts), `app/dev/viz/**`, fixture visuals (`tests/fixtures/content/**/visuals/**`, `**/*.trace.json`) and the **visual language section** of DESIGN.md (drafted with the design lead: the design lead writes the section skeleton and colour-meaning tokens first, the visualization engineer completes it) | visualization engineer |

Shared seams:
- The app engineer creates route files with data wiring and plain semantic markup first; the design lead then owns their presentation. Coordinate through `work/04-app/requests.md`.
- The component map (`lib/content/mdx-components.tsx`) is the app engineer's; it imports the design lead's and the viz engineer's components by their agreed names and props (see §4).
- `package.json` scripts for viz (`gen:viz`, `check:viz`, `viz:shots`) point to `tools/viz/*` files the viz engineer owns; the app engineer adds the script lines on request.

## 4. Component contracts (MDX API; props are the stable interface)

```
<Callout kind="note|warning|grader-tip" title?>…</Callout>
<Term id="variable">variable</Term>            // id resolves in glossary.yaml
<Details summary="…">…</Details>               // native <details>
<Code file="examples/x.py" lines?="1-5" highlight?="3,4" caption? showOutput?=true expectError?="IndexError" />
```python / ```python bad38                      // fenced blocks
<Output file="examples/x.out" />                // only committed generated files
<ProblemLink id="ccc23s1" />                    // "2023 S1: <title>" + judge badge, link from judgeUrl()
<Practice />                                    // renders module.yaml practice list (module's last lesson)
<JudgeLink judge="wmoj|dmoj" kind="home|signup" />
<Figure caption="…" alt="…">{visual}</Figure>   // number, caption, text alternative, <details> steps-as-text
<Diagram viz="ArrayViz" data={…} | frames="visuals/x.frames.json" step?={0} />
<StepThrough frames="visuals/x.frames.json" />  // presets come from the .viz.yaml
<CodeTrace trace="examples/x.trace.json" />
<Scene name="stdin-flow" … />
```

## 5. Fixture course (`tests/fixtures/content/`, stage `fx`)

At least: one Stage-0/1-shaped module with a lesson using every text/code component (`Callout` ×3 kinds, `Term`, `Details`, `Code` with lines/highlight/caption, `.in`/`.out`, `expectError`, a `bad38` block, `Output`) and a `CodeTrace` covering loops, lists, a function call and recursion; one technique-shaped module with `StepThrough`s (GridViz + StructViz queue, with 2–3 presets) and a practice list with a WMOJ problem, a DMOJ problem with `why`, a crossover (rendered "2022 J4 (same problem as 2022 S2)"); one module per remaining visualizer (at least one fixture visual per visualizer), a `Scene`, a `Diagram`, a KaTeX formula; a second lesson for prev/next; module prerequisites. Fixture prose is neutral placeholder teaching text that still obeys every rule in §1.6 (it is visible on previews).

## 6. Where results go

- Code: `main-app/**`.
- Notes, logs, handoffs: `work/04-app/_working/<role>-notes.md`.
- Requests between workers: `work/04-app/requests.md`.
- Defects: `work/04-app/defects.md` (`ID | item | severity | found by | status | note`).
- Containment proofs: `work/04-app/containment/<label>.*`.
- Screenshots for review: `work/04-app/_scratch/shots/<role>/…` (not committed); final report screenshots are taken by the orchestrator.

## 7. Seam refinements (orchestrator, after batch 1)

- **Route files are thin and belong to W1:** each `app/**/page.tsx` only loads data (loader, `generateStaticParams`, `dynamicParams = false`, `generateMetadata`) and renders one presentational component with typed props, e.g. `<LessonPage lesson={…} module={…} nav={…} />`. **W2 owns those presentational components** in `components/layout/` (`HomePage`, `StartPage`, `CourseMapPage`, `ModulePage`, `LessonPage`, `ProblemsPage`, `SearchPage`, `GlossaryPage`, `AboutPage`) plus `app/layout.tsx`, `app/not-found.tsx`, `app/globals.css`. The prop types live in `lib/content/types.ts` (W1) — W2 imports them; if W2 needs a new field, request it.
- **Viz public API:** W3 first publishes `components/viz/index.ts` exporting `Figure`, `Diagram`, `StepThrough`, `CodeTrace`, `Scene` with the §4 contract props (working stubs are fine at first), and `lib/viz/validate.ts` exporting `validateVisualFile(path)` for `content:check`. W1 wires them into the MDX component map and `prebuild` as soon as they exist.
- **Client features (§4.8):** logic in `lib/read-state`, `lib/search` (W1); their UI components (mark-as-read cell, continue block, search dialog, mobile nav, copy button) are W2's in `components/ui` / `components/content`, calling W1's hooks.
- **Package installs:** W1 only. Requests in `requests.md`.
- **Build lock:** only one `next build` at a time (the lock enforces it). Prefer `next dev` on a leased port for screenshots.
- **Working title:** "CCC Python Course" until P5/Manager decides; the name comes only from `content/ui/strings.yaml`.
- **npm installs:** the `.tooling/bin/npm` wrapper now forces `ignore-scripts` for install-type commands (node-gyp containment finding); do not pass `--ignore-scripts` yourself and never set it in `.npmrc` (it would stop `prebuild` on Vercel).
