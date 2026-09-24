# Design lead notes (W2, P4)

## Batch 1: design record (2026-09-23)

Deliverables: `main-app/PRODUCT.md`, `main-app/DESIGN.md` (with the `@theme` token block and the Visual Language skeleton), `main-app/app/fonts/*` (3 WOFF2 + 2 OFL texts), `work/04-app/fonts.md`, Impeccable surface brief `main-app/.impeccable/surfaces/app-learn-stage-module-lesson-page-tsx.md`.

### How Impeccable was run (and where this run departs from its default flow)

| Impeccable step | What happened | Why |
|---|---|---|
| `impeccable context` | Ran (from the workspace root with `--target main-app/PRODUCT.md`, then from `main-app/`). | Skill setup step. |
| **Run Impeccable from `main-app/`** | With cwd `main-app/`, the launcher resolves `projectRoot = main-app`, finds `PRODUCT.md`/`DESIGN.md` there and keeps surface briefs in `main-app/.impeccable/surfaces/`. From the workspace root it looks for `PRODUCT.md` at the root. Canonical files stay in `main-app/` (brief A11); later Impeccable calls must use cwd `main-app/`. | Brief A11 path. `main-app/.impeccable/` holds only development contracts (not served by Next; it is outside `app/` and `public/`). The root `.impeccable/config.json` (hook settings from P3) is untouched. |
| `init` interview (AskUserQuestion) | Not available: there is no user in this run and no question tool; the orchestrator's instruction is to answer from the project documents and never block. Every PRODUCT.md fact cites its source; the few inferences are marked "Inferred". | Orchestrator instruction; init.md's "infer from the explicit brief and label assumptions" path. |
| `init` workflow default (`buildPath`) | Not asked, nothing written to `.impeccable/config.json`. No image generation is used in this project (orchestrator rule), so the build is **code-led**. | Orchestrator rule: no image-plate or image-generation flows. |
| Live mode setup | Skipped. | Needs a running dev server and CSP edits; not in this batch. |
| `concept-seed --scope direction --mode read` | Ran from `main-app/`; seed key **82d206fe**; assigned index 5 of my grounded list. | new-work.md makes the roll mandatory for a new world. |
| Decision page (`serve-question`) | Not served. No one can answer it; the unattended rule applies ("proceed with the assigned direction and state the assumptions"). | Orchestrator rule; avoids a server outside the leased-port scheme. |
| Telemetry ping (`--kind … --from 82d206fe`) | **Not sent.** | It would be network traffic about this project from a contained tool; nothing was chosen by a user, and containment comes first (plan §9). |
| QUALITY BAR boards (remote images) | Not opened. | The chosen direction is my own grounded candidate (no board); challengers were weighed on their written system grammar. |
| DESIGN.md timing | Written now, before any UI, as the build specification. new-work.md normally writes DESIGN.md at the finish from the built world. | The orchestrator needs one token source now (brief A10) so the app engineer and W3 can build. The finish pass (Impeccable `document`, scan mode) re-checks it against the code in a later batch and updates it. |
| `.impeccable/design.json` sidecar | Deferred to that finish pass. | The sidecar renders built components; none exist yet. |
| Subagent flows (finish reviewer, documenter, asset producer) | Not used; any review or documentation pass is done in-thread (degraded path) and disclosed. | Hard rule: workers never spawn subagents. |

### Direction workshop (new-work §3, unattended)

Mechanism: the only course from zero to CCC Senior in Python 3.8 that shows every program actually running. Audience scene: a secondary-school student at a desk after school, laptop, daylight or a desk lamp, 20–60 minutes, over months. Category rut: grey docs template with a blue sidebar and cards; its predictable opposite: a dark "hacker terminal" look. Both are excluded.

My grounded list, ordered by resonance (three or more material families: stationery, print/computing, wayfinding, technical drawing, reference publishing, archive):

1. Quad-ruled maths exercise book (graph paper, pencil, margin line).
2. Transit line map (stages as lines, modules as stations).
3. Line-printer program listing (green-bar tractor-feed paper, sprocket holes, line numbers).
4. Scholarly textbook with sidenotes.
5. **Engineering drafting sheet and drawing set** (board cover, title block, dimension lines, pencil vs ink, non-photo blue, checker's highlighter and redline).
6. Naturalist's field guide (plates, numbered keys).
7. Library card catalogue.

Assigned: **5, the drafting set.** It carries the product truth well: IDs and facts in title blocks, ranges as dimension lines, draft/done as pencil/ink, "you are here" as the checker's yellow, invalid as the redline, and a real reason for the lettering choice (unambiguous characters). No factual grounds to re-roll.

Challenger verdicts (fused with PRODUCT.md facts, weighed on audience identification and product clarity):

| Challenger | Verdict | What the direction kept (raise) |
|---|---|---|
| Cloud quarry | Declined (both axes) | **One Active Edge**: one silver saw line is the active edge → at most one element carries the heavy "current" outline. |
| Sneaker box stacks | Declined | **One label grid** rules every index row (course map, module lessons, practice, problems, glossary, search). |
| Yé-yé pop sleeve | Declined | A module's lessons are a **small closed set**; read items drop to a tint (ink-2), never hidden. |
| Airline timetable slide rack | Declined (raked panes and one type size hurt reading) | **State is a mark in a fixed cell**: filled holds, hollow does not → the read cell. |
| Hand-drawn zine explainer | **Competitive** (holds audience identification for a teenager; loses product clarity and would tire across 215 lessons and invite the cream-paper cliché) | Its highlighter swipe on "the one line that matters" → checker's yellow on highlighted and current code lines. |
| Film cutting bench | Declined (black ground conflicts with light-only; product clarity) | **A flag where you stopped** → the folded tape flag on "Continue where you left off". |

Standing exit (category canon: a standard docs template) was not taken; no user asked for it.

### Answers I gave on the user's behalf (and assumptions)

1. **Primary user and scene**: one secondary-school student, laptop first, phone second (project brief §2, R3; plan §4.9). Session length and "months" are inferred from scope.
2. **Product name**: undecided in every project document. Working title "CCC Python Course" in DESIGN.md frontmatter only; the rendered wordmark reads `ui/strings.yaml` (P5 or the Manager decides). *Needs a decision before P5 ships copy.*
3. **Brand assets**: none exist; no logo is created. Judges are text badges only; nothing imitates CEMC, WMOJ or DMOJ marks (inferred from C17 and good practice).
4. **Physical scene → light**: desk, daylight or lamp; light is also a hard project rule (R6).
5. **Colour strategy**: Restrained (neutrals + one interactive blue) on reading surfaces; a fixed marking vocabulary in code and visuals (Read mode default).
6. **Fonts**: Atkinson Hyperlegible Next + Mono (reasons in `work/04-app/fonts.md`).
7. **"On this page"**: static list at ≥1280 px, no scroll-spy (not in the §4.8 client budget).
8. **Term**: native `popover` (no JS) with the definition and a glossary link. Assumes native popover is acceptable as non-JS HTML; if the orchestrator disagrees, fall back to a plain link to `/glossary#id`.
9. **Search shortcut**: `/` opens the dialog (part of the search feature). No other global shortcut.
10. **Problem and judge links** open in a new tab with a visually hidden "(opens on WMOJ in a new tab)" hint, so the lesson stays open.
11. **Callout labels**: "Note", "Watch out", "Grader tip"; bad38 label "Not valid on the CCC grader"; all final copy is P5's in `ui/strings.yaml`.
12. **Reading time** in the title-block strip assumes the loader can provide minutes per lesson (words / 200, rounded). *Request to the app engineer below.*
13. **Home stage index** shows each stage's one-line goal from `course.yaml`; the goal must never carry the recon "Contest payoff" wording (leak list §5.4).

### Contrast record

Computed from the hex tokens (`work/04-app/_scratch/palette.cjs`). Text pairs used by the system, lowest first: ink-3 on board 5.45, ink-3 on sheet-sunk 5.76, redline on redline-soft 5.63, syntax comment on check-soft 5.44, blueline on check 5.85, ink-3 on paper 6.12, ink-2 on board 7.68, blueline on paper 7.45, ink on paper 16.09. Non-text: rule-strong on paper 3.56, on board 3.17 (control and cell boundaries); every state stroke ≥ 3.56. Construction blue (1.80) is decorative only. Forbidden pairs: ink-3 on done (3.96), check, board-deep.

### Requests raised (also in `work/04-app/requests.md`)

- W2 → app engineer: expose `readingMinutes` per lesson from the loader (words / 200, min 1), for the title-block strip.
- W2 → app engineer: confirm `main-app/.impeccable/` is committed (development contract only; excluded from nothing Next serves).

### Next batch (waiting for the scaffold hand-over)

`app/globals.css` from the token block, `app/layout.tsx` with `next/font/local`, header/sidebar/sheet layout, all `components/content/**` and `components/ui/**`, every route's presentation, `lib/content/shiki-theme.ts`, then one batched screenshot round at 390/768/1440 and the in-thread finish review + `document` scan pass.

## Batch 2: build record (2026-09-23)

### What was built
`app/globals.css`, `app/layout.tsx`, `app/not-found.tsx`, `app/dev/design/page.tsx` (preview only, W1's `notFoundOutsideDevPreview()`), `lib/content/shiki-theme.ts`, `components/ui/**`, `components/content/**`, `components/layout/**` (nine page components, header, frame, sidebar, breadcrumb, title-block strip, closing title block, On this page, index row, 404 drawing, design gallery).

### Decisions
- Prose rules are scoped away from components with `data-ui`; `data-plain` opts a link out of prose styling; `data-exhibit` marks wide items. Reason: prose underlines and list padding leaked into index rows, practice lists and badges in round 1.
- `cn()` uses `extendTailwindMerge` with the custom theme tokens. Reason: plain tailwind-merge treated `text-label` as a colour and dropped `text-paper` (the primary button text disappeared).
- Code gutter width is `max(2, digits)ch + 1.5rem`, not a fixed rem. Reason: fixed widths clipped 3-digit numbers against the frame edge. The first and last lines carry the block padding so the gutter rule runs edge to edge.
- Input and Output sit side by side only when both exist and there is no error. Reason: a traceback in a half-width column wrapped badly.
- Index rows align ID, title and meta on the first baseline. Reason: the smaller ID text sat 2 px high at every width.
- The glossary letter strip is a bordered 7- or 13-column grid. Reason: a wrapping flex row left a ragged last line on phones.
- The mobile drawer is paper; the course navigation below it sits on the board ground. Reason: on pages without course nav, the empty board half looked unfinished. The current item gets a 2 px ink bar, matching the desktop header.
- Italic is a separate, non-preloaded face; Mono is preloaded because code appears above the fold on lesson pages.
- The slashed zero in Atkinson Next ("Stage 0", "4.0") is kept as part of the typeface's legibility design.
- Temporary adapters (`read-state.ts`, `search-source.ts`, UI string defaults) are deleted now that W1's `lib/read-state`, `lib/search/client` and `getUiStrings()` exist.

### Review rounds (`work/04-app/_scratch/shots/w2/`)
- r1–r4: every existing route at 390×844, 768×1024 and 1440×900, plus element shots of the gallery (r1p–r3p). Fixed everything listed above.
- r5 (confirm): all routes plus `/search?q=…` states and `/dev/design`; r5p element shots; r5s/r6s interactive states (search dialog empty/results/no-results, mobile drawer at 390 and 768, skip link).
- Not yet shot: lesson and module pages, sidebar and mark-as-read flows. They need W1's fixture course (`tests/fixtures/content`), which does not exist yet.

### Impeccable
- `impeccable detect --json components app` (cwd `main-app/`): no findings.

### Orchestrator review fixes (after r5)
- Status tags moved to a trailing column: the sidebar "Soon" tag sits in `3.25rem | 1fr | auto`, and index rows put Coming soon / Draft in the meta column from 640 px and on their own line under the title on phones (left edge = title edge). Reason: wrapped titles pushed inline tags onto orphan, mis-indented lines. Index rows now only create the columns they use, so an empty marks column no longer leaves a 16 px gap at the right.
- `.prose-sheet > :first-child { margin-top: 0 }`: `.prose-sheet h2` (3rem) outranked `> *` (0), so a body opening with an H2 got a double gap under the title block. The gallery's first block also dropped its top rule and margin.
- Slashed zero: Atkinson Next has no plain-zero alternate (no `zero`/`ssNN`/`cvNN`; `aalt` 1–3 unchanged; see `_scratch/fonts/zero-features.png`). Kept, and recorded in DESIGN.md → Numerals.
- r7 shots: `work/04-app/_scratch/shots/w2/r7/`. One run logged "Can't perform a React state update on a component that hasn't mounted yet" at 768 right after a dev-server cold start. It did not recur in 6 more runs × 3 viewports × 4 routes, so I treat it as a dev-compile artifact. Watch for it in the E2E console-error gate.

### Fixture-course review (r8, confirm r8c)
- Shots: `_scratch/shots/w2/r8/` (lesson, module, sidebar at 3 widths), `r8s/` (mark-as-read before and after, Term popover, Details open, sidebar and drawer with a read lesson, home continue block, course-map check marks), `r8c/` (confirm).
- Fixed: KaTeX CSS was never loaded, so math showed twice, unstyled (now imported by LessonPage). The Term popover ran off the right edge on phones (it now spans the gutters). The crossover "(same problem as …)" is inline after the badge. Sidebar ID column widened to 3.5rem (M90.1 and M4.10 touched their titles), and rows reserve a transparent 1 px border so the current tab doesn't shift. The other-stages column is now 2rem, so "Junior J4–J5 / Senior S1–S2" no longer breaks at the en dash.
- Raised with W1: fenced code loses its indentation through MDX (the bad38 `match` example renders flat); "1 lessons" needs singular string keys.

### r9 fixes
- Title-block strip: the cells always share one row in equal columns with rules between them. On phones the Draft badge gets its own ruled row. Checked at 390 with M4.15 / 12 of 12 / 25 min (gallery block "Title-block strip (longest values)").
- Measure by block type: `data-wide` (code assemblies, the lone Output panel) plus `figure`, `table` and display math go to 48rem. Callouts, Details and Practice keep 42rem. `data-exhibit` now controls spacing only. The table is in DESIGN.md → Layout and in the /dev/design gallery.
- Corner radii are consistent: callouts, code frames, IO panels, Details and W3's `.vz-figure` all use `--radius-box` (6 px).
- Singular count strings wired (`lessonCountOne`, `modulesOne`).
