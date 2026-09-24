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
