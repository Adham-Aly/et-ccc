# et-ccc Implementation Plan

**Status:** v2.1, APPROVED. v2.0 was approved by the Manager as the single source of truth and amended in place, in this file, by the Manager's answers to every open question (D-030, 2026-09-23) → v2.1 (plan-amender, same day; D-031). v1.0 remains archived as `context/implementation-plan.v1.md` and is **superseded in full**.
**Authority:** this file is the single source of truth for the whole build (D-011). What gets built, and what does not, depends only on this file. Changes need Manager approval and a row in §1 Changelog.

---

## 0. How to use this plan

### 0.1 Who reads what

| You are | Read first | Then |
|---|---|---|
| Any agent starting cold | `context/00-START-HERE.md`, then this file §0–§3, then `context/progress.md` | Your phase in §12 and the files it lists under "Read first" |
| Main session | §0, §1, §11, §12.0, your current phase, §15 | `progress.md` and the last phase log |
| Phase orchestrator | §0–§3, §8, §11, §13, your phase in §12 | The sections your phase references |
| Worker | Only what your prompt lists; the prompt quotes the rules you must obey | Nothing else unless told |

### 0.2 Order of authority

1. The Manager's latest explicit instruction.
2. This plan decides build scope, architecture and orchestration. If it conflicts with `operating-rules.md` on **process**, `operating-rules.md` wins unless this plan records a Manager-approved change (operating-rules §0).
3. `decisions.md` holds the rulings behind this plan. §3 maps each constraint to its decision ID. **D-020 overrides every earlier decision it conflicts with.**
4. Research files (`research/**`) are **evidence only**. Where they disagree with this plan, this plan wins (§16.1). Large parts of `research/03-plan/_working/*` describe the v1 app (browser Python, exercises, grading) and are **obsolete**; §16.1 says which parts still apply.

### 0.3 Resuming after an interruption

1. Read `progress.md` and find the phase marked `IN PROGRESS` or `REDO REQUESTED`.
2. Read that phase in §12, its checklist in `progress.md`, and, for content phases, `work/NN-<name>/ledger.generated.md` and `defects.md` (§13.3).
3. Continue from the first unchecked item. Never redo an item marked done unless its output file is missing or fails its gate; if that happens, log it.
4. Agent IDs don't survive a session restart. If a worker you would have continued with SendMessage is gone, spawn **one** replacement of the same role and model, give it the item's files and its `defects.md` entries, and log the handover. Replacements count against the phase's spawn cap (§11.4).
5. A half-written module (files present, `status` still `planned` or `drafted`) goes to the replacement author, who reads the files, decides to continue or restart, and logs the choice.
6. Stop stale background servers recorded in `work/NN-<name>/_run/*.pid` (§4.10) before starting new ones.
7. Run `git status` on the phase branch. Uncommitted work is normal mid-phase; never discard it.
8. If the §1 Changelog has entries dated after the phase started, follow the new plan and note that in the phase log.

### 0.4 Tags

- **[DECIDED]** Settled here, with a reason. Changes only through the changelog.
- **[MANAGER]** Needs Manager approval (§15, and `decisions.md` → Pending Manager approval). A stated default is used only where the text says work may continue on it.
- **[SPIKE]** An unverified technical fact. The named phase confirms it before anything depends on it. A spike may adjust details not tagged [DECIDED]; changing a [DECIDED] item stops the phase until a changelog entry is approved.
- **[NOT YET EXECUTED]** A step that is planned only. Nobody runs it before its phase.

"Local" in this plan means inside this workspace on the Manager's Mac (the build machine). The **learner** needs nothing but a browser to use the app (§4.1).

---

## 1. Changelog

| Version | Date | Author | Change | Manager approval |
|---|---|---|---|---|
| v1.0 | 2026-09-23 | planning-orchestrator (Phase 2) | First version: static export, in-browser Python (Pyodide), exercises with autograding, mastery and review, 16 build phases. | Rejected by D-020 |
| v2.0 | 2026-09-23 | plan-reviser (Phase 2 redo) | Full rewrite after Manager critique D-020, plus the Manager's mid-redo instruction D-021 (extensive visuals and animations). See §1.1. All sections changed; §4.11 is new. | Approved, amended by v2.1 |
| v2.1 | 2026-09-23 | plan-amender | Amends v2.0 with the Manager's answers to every v2.0 open question (D-030). See §1.2. No section untouched; the biggest changes are: all problem walkthroughs, editorials, solution pages and per-problem hints removed; all system/environment setup content removed (M0.2, M0.3 dropped); M7.14 (C++ bridge) kept, stripped of setup and scoring framing; practice links capped at CCC 2014–2026 with a permanent post-2026 rejection; Vercel previews and production both public, no bypass secret; §15 reduced to a resolved-questions pointer. | Approved (D-030 is itself the approval) |

### 1.1 v2.0: the Manager's critique and what changed

**The critique (D-020, summarised).** v1 misread the product. The Manager wants a lean **reading and learning** app, not an interactive judge. v1 built a Python runtime in the browser, a grader, about 1,230 graded items, checkpoints, spaced review, drills and mock contests, and planned about 294 agent spawns over 16 phases, which is far beyond the Manager's quota. v1 also kept hosting local by default, sent 2020 problems to WMOJ (where they do not exist), and left version control as plain local git.

| D-020 point | What v2 does | Where |
|---|---|---|
| 1. Purely a reading/learning app; no code execution of any kind | Pyodide, the runner, the editor, the worker, the 3.8 runtime shim, the device factor, verdicts and the error explainer are **deleted**. Code in lessons is read-only, syntax-highlighted at build time, with a copy button. Python 3.8 correctness of shown code is checked at **authoring time** only (§4.5). | §2, §4.4, §4.5, §4.8 |
| 2. No exercises, quizzes, tests, autograding; gut the machinery | All exercise block types, hints tiers, checkpoints, mastery, Leitner review, drills, mock contests, test specs, comparators, IndexedDB progress and export/import are **deleted**. The only persisted state is an optional "mark as read" flag in localStorage (§4.8). | §2.3, §4.6, §4.8 |
| 3. Deployed on Vercel as a regular Next.js app; nothing on the learner's machine; lean | Regular Next.js App Router app on Vercel, every page prerendered at build time (SSG), no backend, no API, no database. Preview deployment per pushed branch, production from `main`. Local tooling is for building only and stays contained (R15). | §4.1, §10 |
| 4. Links: 2021–2026 → WMOJ, 2020 and earlier → DMOJ; prefer WMOJ | `judgeUrl()` year bands changed; the 2020 exception and v1 Q-1 are gone. Practice selection is **WMOJ-first**, enforced by a lint (G-LINK-PREF). Registry and verification kept. | §4.7, §6.4, §7 |
| 5. Private GitHub repo via `gh` | New step in P3 (the first build phase), with auth checks, a record of what `gh` touches outside the workspace, the Vercel link in P4, and a commit/branch policy. **[NOT YET EXECUTED]** | §10, §12 P3–P4 |
| 6. Far smaller orchestration | 7 phases instead of 16 (plus maintenance), at most 3 concurrent workers, no swarms, no Workflow tool, no extra nesting, Sonnet for bulk writing. About **41 spawns in total vs about 294 in v1**. | §11, §12 |
| Keep what is still valid | Light mode, Impeccable and avoid-ai-writing with total containment, the voice sample, the pilot lessons, no score targets, Python 3.8 compatibility of shown code, Manager reports, the redo protocol and the engineering standards (now including E2E and pixel checks of the **deployed** site). | §3, §6, §8, §9, §11.6, §13 |
| **D-021 (Manager, during the redo): extensive visuals and animations, same UI/UX bar** | A first-class **visualization system** (§4.11): animated step-throughs of algorithms and of Python code execution, played back from traces **generated at authoring time by running the real Python** (so nothing executes in the browser and D-020 still holds), plus static diagrams and concept animations. A visual design language in `DESIGN.md`, per-visual quality gates (G-VIZ), frame-level visual regression, accessibility and reduced-motion rules, and visuals in all three pilots. | §2, §4.8, §4.9, §4.11, §5, §6, §7, §11.5, §12 |
| Open questions | Resolved ones deleted (v1 Q-1, Q-3, Q-5, Q-6, Q-8, Q-11, Q-12, Q-16 and all runner/grader/exercise items). Only genuinely open items remain, each with a recommendation. | §15 |

Rules:
- Every change adds a row saying what changed, why, and which sections changed.
- A phase already `DONE` is not re-run automatically after a change. The Manager decides whether it needs a redo (operating-rules §6).

### 1.2 v2.1: the Manager's answers (D-030) and what changed

**The answers (D-030, summarised).** The Manager approved plan v2.0 as the single source of truth and answered every §15 open question in one pass, closing all of them (no open question remains; §15 is now a pointer to D-030). The two biggest rulings: the app must be as lean as possible, with no problem walkthroughs, editorials, solution pages or per-problem hints anywhere, and no system/environment setup content anywhere.

| D-030 point | What v2.1 does | Where |
|---|---|---|
| Q-20: no walkthroughs, editorials or hints | `WorkedProblem`, the `solutions/` folder, `work/cemc-data/`, and G-SOLUTION are **deleted**. The `hint` field is gone from practice-list entries. Stage 3–7 lessons demonstrate a technique on the author's own worked example, never a specific registry problem's solution; the app never says a solution or walkthrough exists, in-app or elsewhere. | §2.2, §2.3, §3, §4.3, §4.5, §4.6.2–§4.6.5, §5.1, §6.1, §6.2, §6.3, §6.5, §6.6, §6.7, §7, §14 |
| Q-19: no setup content | M0.2 ("Writing and running Python") and M0.3 ("Terminal basics and input files") are **dropped** — they existed only to install and run Python locally. Stage 0 now runs M0.1 → M0.4 → M0.5 → M0.6 → M0.7. `/start` no longer covers local setup. Curriculum modules: **104** (was 105; §2.2). | §2.2, §4.1 (routes), §5.3, §12 P6, §14 |
| Q-10: keep M7.14 | The C++ bridge module is back in scope, written with no install/compiler-setup content and no scoring or "impossible in Python" framing. | §2.2, §5.3, §12 P8, §14 |
| Q-7: practice scope | Practice-list problem picks are **CCC 2014–2026 only**; 2021–2026 → WMOJ, 2014–2020 → DMOJ, WMOJ preferred; no pre-2014, no non-CCC problems; some modules may carry no practice link. | §4.7 |
| Q-9: link rule past 2026 | Permanent: the build rejects any year after 2026. Not a placeholder pending a future ruling. | §4.7, §12 P10, §14 |
| Q-2: subtasks | A lesson may state **one problem's own** subtask breakdown, as a fact, only when teaching partial-marks strategy; never totals, cutoffs or goals. | §4.7, §6.5 |
| Q-4: voice sample | An agent drafts the 400–600-word sample with avoid-ai-writing; the Manager approves or rejects it (was: the Manager writes it). | §6.3, §12 P5 |
| Q-18: Vercel | Personal Hobby account; previews and production are **both public**; no preview protection, no bypass secret, no `.tooling/secrets/`. | §4.1, §9.1, §10.5, §14 |
| D-021 confirmed | No change: extensive visuals and animations stay exactly as in v2.0. | §4.11 |
| Q-13, Q-15 | Approved as recommended, no plan change beyond recording the approval. | §9.5, §9.7 |
| Q-17 | Approved as recommended: repo `et-ccc`, private, via `gh` in P3; existing global git identity, read-only; commit and push the phase branch at each phase end and before any redo; merge to `main` only after Manager approval of the phase. | §10 |
| Q-14 | Approved: the main session updates `operating-rules.md`, `00-START-HERE.md`, `project-brief.md` and `README.md` to match v2.1 (done alongside this amendment). | §12 P3 |
| Scope and cost | Content volume, example-file count and the cost estimate scale down with the removal of walkthroughs, solutions and CEMC-data checking. Agent headcounts are unchanged: the per-phase author counts were already ranges (≈7–9 modules per author) and the net module-count change (105 → 104) still fits them. Total: **41 spawns, cap 48**, unchanged from v2.0. | §2.2, §11.5 |

Rule: this amendment edits v2.0 in place; it does not renumber sections that are unaffected.

---

## 2. What we are building

### 2.1 Product

A free, non-commercial, light-mode-only **reading app** built with Next.js and deployed on Vercel. It takes one learner from **no programming experience** to the knowledge needed for CCC Senior S1–S5 in **Python 3.8**, the language level of the CCC grader's PyPy.

- It teaches with clear explanations, worked examples and **read-only** Python code, and makes **extensive use of visuals and animations** wherever they help understanding: step-by-step animations of algorithms, animated traces of Python code running line by line, and clear static diagrams (§4.11, D-021). Every visual is held to the same UI/UX standard as the rest of the app.
- It teaches **concepts and links CCC problems, nothing else**: no problem walkthroughs, editorials, solution pages or per-problem hints anywhere, and no mention that a solution or walkthrough exists elsewhere (D-030 Q-20).
- Practice happens **outside** the app: every module points to real CCC problems from **2014–2026** on **WMOJ** (2021–2026, preferred) or **DMOJ** (2014–2020), where the learner submits and gets judged.
- The app contains **no system or environment setup content** — no OS instructions, no online editors, no installing Python, PyPy or Thonny (D-030 Q-19). Lessons go straight into learning; the **app** itself needs nothing but a browser, and setting up Python on the learner's own computer is entirely outside its scope.

### 2.2 Scope in numbers

Estimates; the P5 pilot recalibrates them through a changelog entry.

| Item | Estimate |
|---|---|
| Curriculum modules | **104**: 105 (D-007) minus **M0.2** and **M0.3** (dropped, setup-only content, D-030 Q-19) plus **M7.14** "C++ bridge" (kept, D-030 Q-10; no setup content, no scoring framing) |
| Lessons | ≈210–225 (read-only; about 800–1,300 words each — leaner than v2.0 with no walkthrough sections) |
| Prose | ≈240k–260k words (down from v2.0's ≈300k: no problem walkthroughs, editorials or hints) |
| CCC problems in the registry | **119** unique J/S problems from 2014–2026: **56 on WMOJ** (2021–2026) and **63 on DMOJ** (2014–2020), crossovers counted once. No practice link before 2014 or after 2026; some modules may have no link (D-030 Q-7). |
| Python example files | ≈850–1,200, each checked for 3.8 compatibility and, where output is shown, run under PyPy 3.8. No `solutions/` files: the app never shows a full solution to a specific CCC problem. |
| Animated step-throughs (algorithm visualizers and code tracers) | ≈150–200, with at least one in every Stage 4–7 technique module and code tracers throughout Stages 0–2 (§4.11.5). Unaffected by the walkthrough removal: step-throughs illustrate the technique itself, never a specific problem's solution. |
| Static diagrams and concept animations | ≈250–350 |

### 2.3 Non-goals (explicit)

- **No code execution in the app**: no Pyodide, no in-browser Python, no runner, no editor, no sandbox, no server-side execution (D-020).
- **No judge or grading**: no test cases, no verdicts, no autograding, no timing (D-020).
- **No in-house practice**: no exercises, quizzes, checkpoints, drills, mock contests, predict-the-output boxes or answer keys (D-020).
- **No progress machinery**: no mastery, streaks, review schedule, scores or dashboards. The only state is the optional "mark as read" flag (§4.8).
- No accounts, server, API routes, database, analytics, telemetry or Vercel Analytics/Speed Insights.
- No dark mode anywhere (R6).
- No score targets, cutoffs, expected results, or "Python can't do this" framing (R14, D-006 ruling).
- No verbatim CEMC problem statements (§6.6).
- **No problem walkthroughs, editorials, solution pages or per-problem hints, anywhere, for any problem** (D-030 Q-20, permanent — not deferred to a later phase). Lessons teach concepts and link CCC problems; that is all. The app never mentions that a solution or walkthrough exists, in-app or elsewhere.
- **No system or environment setup content**: no OS-specific instructions (Windows/macOS/Linux/ChromeOS), no online editors, no installing Python, PyPy or Thonny (D-030 Q-19). Lessons go straight into learning.
- **Visuals never execute code or check answers.** They replay traces recorded at authoring time; the learner steps and plays, but does not type code or inputs for the app to evaluate (§4.11; custom inputs are permanently declined, D-030 Q-21/confirmed).
- No PWA or offline mode. No C++ content beyond the M7.14 bridge module, which is awareness-only reading with no setup and no scoring framing (R2; D-030 Q-10). No second design or writing skill (R8, R16).

---

## 3. Fixed constraints

| # | Constraint | Source | Enforced in |
|---|---|---|---|
| C1 | Next.js app in `main-app/`, empty until P4; deployed on Vercel | R4, R5, D-002, D-020 | §4.1, P4 |
| C2 | Light mode only; polished and careful down to the pixel, on the deployed site too | R6, R7 | §4.9, G-UI-LIGHT, G-VISUAL |
| C3 | Absolute-beginner learner; Python only | R2, R3 | §5 |
| C4 | Content spec is `research/01-recon/curriculum-map.md`, adapted in §5.3 | D-007 | §5, §6 |
| C5 | All shown code is Python 3.8 compatible (the grader runs PyPy3 7.3.9) | D-004 | §4.5, G-PY-* |
| C6 | Links: 2021–2026 → `https://wmoj.ca/problems/<slug>`; 2014–2020 → `https://dmoj.ca/problem/<slug>/`; WMOJ preferred; **CCC 2014–2026 only, permanent build error for any later year**; every link verified | R13, D-020 (supersedes D-008 years), D-030 Q-7/Q-9 | §4.7, G-LINK-* |
| C7 | No score targets in the app | R14, D-006 ruling | §6.5, G-R14 |
| C8 | Impeccable is the design skill, installed contained | R8, D-005 ruling | §9, P3, P4 |
| C9 | avoid-ai-writing v3.35.0 @ `fc979c6`, contained; `warm` + `docs`; style guide with an agent-drafted voice sample the Manager approves or rejects; pilot first; detector and validator gates | R16, D-009 ruling, D-030 Q-4 | §6.3, §9, P3, P5, G-STYLE |
| C10 | Total containment of all tooling, with before/after proof | R15, rules §7 | §9, G-CONTAIN |
| C11 | Plain-language HTML report to `~/Desktop` after every phase; never published; light theme | R10, rules §5 | §11.6 |
| C12 | The Manager may redo, critique or adjust any phase | R11, rules §6 | §13.4 |
| C13 | Only Opus 5.5 (`"opus"`) or Sonnet 5 (`"sonnet"`) for spawned agents | D-010 | §11.2, §11.3 |
| C14 | Workers never spawn subagents; no swarms; no Workflow tool | rules §2, D-020 | §11 |
| C15 | Manager's engineering standards (§8) | Manager global rules | §8 |
| C16 | Commits only under the Manager's standing instruction; never add AI co-author lines or agent names | Manager global rules | §10 |
| C17 | CEMC material is CC BY-NC 4.0; nobody may charge for access to past contests | cemc.uwaterloo.ca/copyright | §6.6 |
| C18 | Private GitHub repo created with `gh`; no global config changes | D-020 | §10 |
| C19 | Extensive, high-quality visuals and animations wherever they aid learning; same UI/UX bar as the rest of the app | D-021, confirmed by D-030 | §4.11, G-VIZ, G-VISUAL |
| C20 | No problem walkthroughs, editorials, solution pages or per-problem hints anywhere; the app never mentions that one exists elsewhere; the app stays as lean as possible | D-030 Q-20 | §2.3, §4.6, §6.5 |
| C21 | No system/environment setup content of any kind (OS, online editors, installing Python/PyPy/Thonny) | D-030 Q-19 | §2.3, §5.3 |

---

## 4. Architecture

### 4.1 Rendering, hosting and deployment [DECIDED]

**A regular Next.js App Router app on Vercel, with every page prerendered at build time (static generation). No backend.**

- **Why:** the app is read-only content for one learner. Prerendered pages are served from Vercel's CDN, so there is no server code to secure, no database, no ops and no cost beyond the Manager's Vercel plan. We do **not** use `output: 'export'`: on Vercel a normal build keeps `next.config` headers and redirects working, and nothing is lost.
- **Rules for the app code:**
  - Every dynamic route has `generateStaticParams` and `export const dynamicParams = false`.
  - No API routes, server actions, middleware/proxy, cookies, `headers()` reads, ISR or on-demand revalidation. The only route handler is the search index, marked `export const dynamic = 'force-static'` (§4.8).
  - Fonts via `next/font/local` from committed WOFF2 files. No remote fonts, images or scripts; **no request leaves the origin** except the learner clicking an external link.
  - Security headers in `next.config.ts` `headers()`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (all features off), and a CSP limited to `frame-ancestors 'none'` plus `object-src 'none'`. A full script CSP is not worth nonces on a static site.
  - Judge links open in a new tab with `rel="noopener noreferrer"`.
- **The Vercel build needs no Python and no network beyond npm.** Everything Python produces (example outputs) is committed (§4.6.2). The Vercel build runs `npm ci` and `next build`, and `prebuild` runs the cheap data checks (G-SCHEMA, G-LINK-FMT) so broken content can never deploy.
- **Environments:**

  | Environment | Where | Purpose |
  |---|---|---|
  | Local dev | `next dev` in the workspace, leased port | Authoring and fast checks |
  | Local production build | `next build && next start` in the workspace | E2E and visual tests during a phase |
  | Vercel Preview | Every pushed non-`main` branch (one per phase, §10.4) | Phase-exit E2E, visual review, Manager review |
  | Vercel Production | `main` | What the learner uses |

- **Drafts.** A build reads `VERCEL_ENV`. Production renders only modules with `status: accepted`; unwritten modules appear in the course map as "Coming soon" with no link. Previews and local builds also render `gated` and `reviewed` modules with a visible "Draft" badge. So the learner can start Stage 0 as soon as P6 is approved and merged.
- **Vercel project settings** (Manager sets them in P4, §10.5): framework Next.js; root directory `main-app`; production branch `main`; Node.js version from `package.json` `engines`; no environment variables; Vercel Toolbar, comments, Analytics and Speed Insights **off** (the toolbar would also spoil screenshots); Deployment Protection **off**, so previews and production are both public (D-030 Q-18).
- **Vercel CLI is not used.** The Manager links the repo in the Vercel dashboard once. Agents find deployment URLs through GitHub deployment statuses with `gh api` (§10.5). If the CLI is ever needed, it becomes a pinned devDependency with `--global-config` inside `.tooling/` (changelog entry).
- **[SPIKE S-2, P4]** Vercel posts GitHub deployment statuses with the preview URL for this repo, so agents can find each preview's URL with `gh api`. Previews and production are **both public** on the Manager's personal Hobby account, with no Deployment Protection (D-030 Q-18), so no bypass secret or protection-bypass header is needed anywhere in the app or its tests.

### 4.2 Stack and pinned versions [DECIDED]

Versions come from v1's 2026-09-23 checks (`w1-tech-stack.md` §9). Pins are **exact** (`save-exact`). The installing phase re-checks the current patch and records the actual pin in its log. Patch bumps are allowed; anything beyond the listed line needs a changelog entry.

| Layer | Choice | Pin | Why |
|---|---|---|---|
| Runtime (local) | Node.js, **workspace-local official tarball** in `.tooling/node/`, SHA-256 checked | the **same major Vercel builds with**: 24.x expected, **[SPIKE S-1, P3]** confirms | Local builds must match Vercel's build image. Homebrew Node is never used (it is unpatched, and updating it is a global change). |
| Package manager | npm bundled with that Node | bundled | Project `.npmrc`: `save-exact`, `engine-strict`, `fund=false`, `update-notifier=false`, cache inside the workspace. |
| Framework | Next.js App Router, Turbopack | 16.3.x (Active LTS) | R4. |
| UI | React / react-dom | 19.3.x | Required by Next 16. |
| Language | TypeScript | 6.0.x | Tool ecosystem caps below 6.1. |
| Styling | Tailwind CSS, CSS-first `@theme` tokens | 4.3.x | Impeccable's DESIGN.md tokens map onto `@theme`. |
| Components | shadcn/ui source in the repo, on Base UI | CLI 4.21.x, `@base-ui/react` 1.8.x | Only for the few interactive bits (search dialog, mobile menu). |
| Icons | lucide-react | 1.47.x | One consistent set. |
| Content | MDX via `@mdx-js/mdx` `evaluate()` in RSC; typed loader; YAML + Zod | mdx 3.1.x, zod 4.6.x, yaml 2.9.x | next-mdx-remote is archived; `@next/mdx` can't take function plugins under Turbopack. |
| Highlighting | Shiki at build time, one custom light theme | 4.4.x | No client JS for code. |
| Math | remark-math + rehype-katex, server-rendered | KaTeX 0.18.x | Rare; zero runtime cost. |
| Diagrams and visualizations | In-house React SVG component library (§4.11) | — | Deterministic, accessible, themeable, screenshot-testable. Mermaid and canvas/WebGL renderers are rejected. |
| Animation | **Motion** (`motion`, the successor of Framer Motion) for enter/exit and layout animations inside visuals; CSS transitions for simple state changes | 12.x, pinned at install | One mature library with built-in reduced-motion support (`MotionConfig reducedMotion="user"`). Loaded only with the visuals (lazy). |
| Tree layout | `d3-hierarchy` (tidy tree layout only) | 3.x | Tiny, no DOM; used for recursion trees, segment trees, DSU forests. Graph positions are authored, never force-laid-out, so frames are stable. |
| Search | Build-time JSON index + MiniSearch, lazy-loaded | latest at install | Cheap (§4.8). |
| Unit tests | Vitest | 5.0.x | Loader, schemas, `judgeUrl`, search index. |
| E2E, visual, a11y | Playwright (Chromium + WebKit; Firefox smoke at release) + `@axe-core/playwright` | 1.63.x / 4.13.x | WebKit stands in for Safari. |
| Lint and format | Biome | 2.5.x | ESLint 9 is end of life; Next offers Biome. |
| Link crawl | linkinator (project-local) | 8.1.x | Internal links only; judge links use the verifier (§4.7). |
| Content lint | remark-lint (MDX-aware) + custom plugins; cspell with a domain dictionary | latest at install | §7. |
| Performance | Lighthouse (project-local, Playwright's Chromium), run at P4 exit and release against the deployment | latest at install | Budgets recorded in P4. |
| Python checks (authoring only) | **PyPy 3.8 v7.3.11** official macOS arm64 tarball in `.tooling/pypy38/` (SHA-256 against pypy.org) + a venv from it with **ruff 0.16.x** and **vermin 1.8.x** | as listed | Runs examples at the grader's language level. The exact grader build (7.3.9) is x86-only and would need Rosetta; for read-only examples the 3.8 language level is what matters, so it is dropped. uv is not needed. |

Removed from v1: Pyodide, CodeMirror, idb, esbuild worker build, uv, PyPy 7.3.9, pypdf, Lighthouse CI server config.

### 4.3 Repository layout [DECIDED]

The git repo is the **workspace root** (§10). Vercel builds only `main-app/`.

```
et-ccc/
├── CLAUDE.md                     (P3) pointer to context/00-START-HERE.md + hard rules + "tools only via .tooling/bin"
├── README.md
├── .gitignore                    (P3) §10.3
├── context/                      source of truth
├── research/                     Phases 1–2 research (evidence only)
├── work/NN-<name>/               Phase 3+ artefacts: containment proofs, spikes, reviews, ledgers, defects,
│                                 report-assets/, _working/, _scratch/, _run/ (pid files)
├── manager-reports/
├── .tooling/                     all tool state (§9): env.sh, bin/ (wrappers, guards), node/, pypy38/, venvs/,
│                                 npm-cache/, xdg/, playwright-browsers/, impeccable-home/, avoid-ai-writing-src/,
│                                 locks/, snapshots/, contain-allowlist.txt, README.md
├── .impeccable/                  Impeccable config (inside the workspace)
├── .claude/
│   ├── settings.json             (P3) env redirects (literal paths), PreToolUse guard hook, Impeccable hooks
│   └── skills/{impeccable,avoid-ai-writing}/
└── main-app/                     (P4) the Vercel project root
    ├── package.json  package-lock.json  .npmrc  next.config.ts  tsconfig.json  biome.json
    ├── vitest.config.ts  playwright.config.ts  cspell.json
    ├── CLAUDE.md                 hand-written; "@AGENTS.md" + pointer to ../context/00-START-HERE.md
    ├── AGENTS.md                 generated by Next; never hand-edited
    ├── PRODUCT.md  DESIGN.md     Impeccable design record (P4)
    ├── app/                      routes (§4.10), app/fonts/*.woff2
    ├── components/{ui,content,layout}/
    ├── components/viz/{primitives,visualizers,player,scenes}/   the visualization library (§4.11)
    ├── lib/{content,registry,search,read-state,viz}/            viz = trace schemas (Zod) + frame helpers
    ├── content/                  course content (§4.6)
    ├── tools/{pycheck,links,lint,style,viz}/                    viz = Python tracer + vizrec recorder + gate
    ├── app/dev/viz/              visual gallery of every primitive, visualizer and state (never linked; excluded from production)
    ├── scripts/                  verify, content-status, port-lease, assert-contained, deployed-url
    └── tests/{unit,e2e,visual,a11y,fixtures}/
```

### 4.4 Code in lessons (read-only) [DECIDED]

- Code comes from real `.py` files next to the lesson (`<Code file="…" />`) or from fenced `python` blocks. Both are extracted by the checks in §4.5.
- Rendered with Shiki at build time, with line numbers where useful, line highlights, and an optional caption.
- A shown **input** and **output** panel appears only when the example has a committed `.in` / `.out` pair (§4.6.2). The output is never typed by hand.
- A **copy button** (the only JS on a code block) copies the source, so the learner can paste it into their own editor.
- Deliberately wrong examples (for M1.15, "this fails on the grader") are fenced `python bad38` and rendered with a clear "not valid on the CCC grader" label.
- Deliberately failing programs (for M0.6, reading error messages) use `<Code file expectError="IndexError" />`; the check confirms the error type and the committed traceback text.

### 4.5 Python 3.8 correctness of shown code (authoring time only) [DECIDED]

The learner submits on PyPy 3.8 (CCC grader) and on WMOJ/DMOJ. Anything the app shows must be valid there. With no runtime in the app, all enforcement moves to authoring gates in `tools/pycheck/` (`npm run check:python`), run locally, never on Vercel:

1. **Static 3.8 check (G-PY-38)** over every `.py` file and every fenced `python` block: `ruff check --target-version py38`, `vermin -t=3.8- --eval-annotations --violations`, and `py_compile` under PyPy 3.8. `bad38` blocks must **fail** vermin or `py_compile`; a `bad38` block that passes is itself an error.
2. **Output reproduction (G-PY-RUN):** every example with an `.out` file is run under PyPy 3.8 with its `.in` file; stdout must match the committed `.out` byte for byte. `npm run gen:outputs -- --scope <id>` regenerates outputs; the gate re-runs and fails on any diff.

There is no third layer for shown CCC solutions: the app never shows a full solution to a specific CCC problem, so there is nothing to check against official data (D-030 Q-20 removes G-SOLUTION, `work/cemc-data/` and the `solutions/` folder entirely — v2.0 had them). Every shown example is the author's own teaching example, covered by items 1–2 above.

Performance advice (fast I/O, iterative DFS, avoiding recursion limits) is **taught**, not enforced by a runtime.

### 4.6 Content model and pipeline [DECIDED]

#### 4.6.1 Principles

1. **Nothing checkable is typed by hand.** Judge URLs come from the registry; shown outputs come from PyPy runs; problem facts come from registry data.
2. **File types:** prose → MDX; data → YAML validated by Zod; code → `.py`.
3. **Stable IDs:** stage `s0`–`s7`, `c`; module = map ID (`M4.13`, `C.3`); lesson = `<module>/<slug>`; problem = judge slug (`ccc24s3`). Order lives in `course.yaml`, never in IDs.
4. **Fixed MDX component map.** Authors never import anything:
   - text: `Callout` (note, warning, grader-tip), `Term`, `Details` (native `<details>` spoiler, no JS);
   - code: `Code`, `Output`;
   - links: `ProblemLink`, `Practice` (a module's practice list), `JudgeLink` (judge home or sign-up only). There is no `WorkedProblem` component: the app never renders a walkthrough or solution section tied to a registry problem (D-030 Q-20).
   - visuals (§4.11): `Diagram` (a static picture from any visualizer), `StepThrough` (an animated, steppable visualizer fed by a frames file), `CodeTrace` (Python code running line by line with variables, call stack and output, fed by a trace file), `Scene` (a named concept animation from `components/viz/scenes/`), `Figure` (caption, number and text alternative around any of these).

#### 4.6.2 Layout (`main-app/content/`)

```
course.yaml              ordered stages → modules (C.x placement), prereqs
glossary.yaml            term → definition, introducedIn
concepts.yaml            Python feature → introducing module (for G-PREREQ)
ui/strings.yaml          ALL learner-facing UI copy
style/STYLE-GUIDE.md     voice + rules + the agent-drafted, Manager-approved voice sample; style/house-skeleton.py
registry/ccc-problems.yaml   THE problem registry;  registry/verified.json   verification snapshot
registry/external-links.yaml allow-list (docs.python.org, CEMC pages, PyPy/Python downloads, judge home/sign-up)
stages/<sN-name>/<ModuleId-slug>/
    module.yaml          title, objectives, prereqs, lesson order, practice list, status
    lessons/<slug>.mdx
    examples/<name>.py  [.in]  [.out]          (.out generated by PyPy 3.8, committed)
    examples/<name>.trace.json                  (CodeTrace data, generated by tools/viz/trace.py, committed)
    visuals/<name>.viz.py  <name>.viz.yaml  <name>.frames.json
                         (.viz.py records frames with vizrec; .viz.yaml = visualizer type, presets, captions
                          source, consistency check; .frames.json generated by PyPy 3.8, committed)
```

`.out`, `.trace.json` and `.frames.json` files are committed so the Vercel build needs no Python. They are generated files: never hand-edited (§8.8).

#### 4.6.3 What a lesson contains

- Objectives (2–4 lines), then sections that each introduce **one** idea: explanation → worked example (code + output) → why it works → common mistakes → a "grader tip" callout where relevant.
- **Visuals wherever they help** (§4.11.5): a `CodeTrace` when the point is how Python executes (variables, loops, lists, references, function calls, recursion), a `StepThrough` when the point is how an algorithm evolves, a `Diagram` when one picture explains the structure. The text still explains everything the visual shows, so the lesson reads fully without it.
- Stage 3 onward: the technique is demonstrated on a **worked example the author writes for teaching** — reasoned through in steps (read the shape of the problem → find the bounds → brute force → the insight → the technique in code → a Python speed note) — never on a specific registry problem. The lesson never states or implies that this example solves a numbered CCC problem, and never shows a full solution to one (D-030 Q-20, C20). The module's practice list, at the end, is the only place a specific CCC problem is named.
- Ends with a recap and, on the module's last lesson, the module's **practice list**.
- "Try it" suggestions are prose only ("type this into your editor and change 5 to 7"): **no** questions, answer boxes, answer keys or tracked state.

#### 4.6.4 Practice lists (the only practice)

`module.yaml` → `practice:` is an ordered list of registry IDs, each with:
- `note` (one line: why this problem fits the module);
- `why` (**required** for any DMOJ problem when the module also has a WMOJ problem in the same topic, §4.7).

There is no `hint` field: the app gives no per-problem hints of any kind (D-030 Q-20). A module may have an empty practice list when no CCC 2014–2026 problem fits (D-030 Q-7).

`<Practice>` renders the list with the judge name, the year and level ("2023 S1", "2022 J4 (same problem as 2022 S2)"), and the link from `judgeUrl()`. No status, no checkboxes, no scores, no hints.

#### 4.6.5 Item status and ledger

Each `module.yaml` has `status`: `planned` → `drafted` → `gated` (`verify:fast --scope` green) → `reviewed` (the phase reviewer signed off) → `accepted` (the orchestrator accepted it after the render check). Only `accepted` modules appear in Production (§4.1). `npm run content:status` writes `work/NN/ledger.generated.md`.

### 4.7 Problem registry and judge links (CRITICAL, app-wide)

**The registry** — `content/registry/ccc-problems.yaml`, one entry per **unique** problem (119 for 2014–2026): year, level, number, aliases, title, derived slug, `slugOverride` with evidence, topics, modules, subtask outline (**one problem's own breakdown only**, for a lesson to state as a fact when teaching partial-marks strategy — never totals, cutoffs or goals, D-030 Q-2), and an `internal` block (never rendered).

**Scope is CCC 2014–2026 only [DECIDED, D-030 Q-7].** No pre-2014 problems and no non-CCC problems, ever. A module may carry no practice link if no problem in this range fits it.

**URLs are derived, never stored or typed.** `judgeUrl()` [DECIDED, D-020]:
- **2021–2026 → WMOJ:** `https://wmoj.ca/problems/<slug>` (plural, no trailing slash). 56 problems.
- **2020 and earlier → DMOJ:** `https://dmoj.ca/problem/<slug>/` (singular, trailing slash). 63 problems in 2014–2020, including all of 2020 (WMOJ's earliest year is 2021).
- **Any year after 2026: a permanent build error [DECIDED, D-030 Q-9].** 2026 is the final year the app will ever link; this is not a placeholder awaiting a future Manager ruling.

**Prefer WMOJ [DECIDED, D-020].** When choosing practice problems for a module, pick 2021–2026 problems (WMOJ) first. Use a DMOJ problem only when no WMOJ problem fits the technique, or as extra practice after the WMOJ ones, and give a one-line `why`. **G-LINK-PREF** warns on any module whose practice list has a DMOJ problem without `why` while a WMOJ problem tagged with the same module exists; the reviewer resolves each warning.

**Crossover problems** [DECIDED]: `ccc21j5` = `ccc21s2`, `ccc22j4` = `ccc22s2`, `ccc23j4` = `ccc23s1`, `ccc26j5` = `ccc26s2`, and the pre-2021 crossovers. Both judges host each **once, under the Senior slug**. One registry entry with Junior aliases; a Junior reference renders as "2022 J4 (same problem as 2022 S2)".

**Verification** (`tools/links/verify-judges.mjs`, run manually, never inside normal tests):
- **WMOJ (automated):** fetch `sitemap.xml` once, then GET each slug politely. WMOJ answers **HTTP 200 even for missing problems**, so status codes prove nothing: missing means the body contains `NEXT_HTTP_ERROR_FALLBACK`; present means the page contains statement text. Record the judge's title and compare it with the registry.
- **DMOJ (Manager-assisted):** Cloudflare blocks automated access and **we do not try to get past it**. The verifier writes `work/NN/dmoj-checklist.html` (about 63 URLs with expected titles and a checkbox each). The Manager opens them in a normal browser (about 10 minutes) and confirms; results are recorded as `method: manual`, with date and confirmer.
- **Snapshot:** `registry/verified.json` (committed) with `status: ok|missing|mismatch|unverified`, `checkedAt`, `method`, `titleOnJudge`. Builds read only the snapshot. Entries older than 90 days warn.

**Gates:** G-LINK-FMT (URL matches its year band; no DMOJ URL for 2021–2026 and no WMOJ URL for ≤2020), G-LINK-REF (plain-text CCC references such as `2023 S1`, `J4/S2` or `ccc23s1` must sit inside a registry component or on a reviewed allow-list, across MDX, YAML and `ui/strings.yaml`), **no raw `wmoj.ca`/`dmoj.ca` strings** outside the registry code (judge home/sign-up URLs go through `JudgeLink` and `external-links.yaml`), G-LINK-PREF, G-LINK-LIVE (release gate: every referenced problem `ok` in `verified.json`). Unit tests on `judgeUrl()` at the 2020/2021 and 2026/2027 boundaries. **No silent fallback:** a missing problem fails and is listed for the Manager.

### 4.8 Interactivity budget [DECIDED]

Everything is server-rendered HTML. These are the **only** client components, each with its reason:

| Client feature | Why it earns its place | Cost |
|---|---|---|
| **Search** (dialog in the header + `/search` page) | ≈215 lessons, a glossary and 119 problems are hard to navigate without it. The index is a static JSON file built at build time; MiniSearch loads only when search opens. | ≈10 kB gzip lazy JS + index |
| **Mark as read** (button at the end of each lesson; check marks in the course map; "Continue where you left off" on `/`) | With ≈215 lessons across months of study, the learner needs to see where they stopped. One localStorage key (`etccc:read:v1` → `{lessonId: date}`), every access in try/catch. If storage is blocked or cleared the app works exactly the same, minus the check marks. Nothing else is stored; no export/import. | < 2 kB |
| **Visual players** (`StepThrough`, `CodeTrace`, `Scene`; §4.11) | Required by D-021: seeing an algorithm or a program evolve step by step is one of the strongest aids for a beginner. Playback of precomputed data only; nothing is executed or graded. Each player hydrates only when scrolled near (lazy chunk); the server renders its first frame, so the page is complete and stable without JS. | lazy chunk shared by all visuals, budget set in P4 (target ≤ 60 kB gzip incl. Motion) + per-visual data |
| **Copy code** button | The learner practises in their own editor; copying examples accurately matters for a beginner. | < 1 kB |
| **Mobile navigation** toggle | Needed for the sidebar on phones. | Base UI primitive |

Hints and spoilers use native `<details>`, with no JS. Adding any other client feature needs a changelog entry. Static `Diagram`s are pure server-rendered SVG with no JS.

### 4.9 UI and design system

- **Design record:** Impeccable (installed in P3) writes `PRODUCT.md` and `DESIGN.md` in P4: audience (an absolute beginner reading hundreds of lessons), tone (calm, encouraging, focused), **light mode only**, typography for long reading, spacing, colour tokens, the reading-page layout, code block styles, component states, and the **visual language for diagrams and animations** (§4.11.3). Tokens drive Tailwind `@theme`, the Shiki theme and the visualization library, so code, text and visuals look like one product.
- **Light mode only:** `color-scheme: light` and `<meta name="color-scheme" content="light">`. G-UI-LIGHT fails on any `dark:` class, `prefers-color-scheme: dark`, or dark theme import.
- **Accessibility (WCAG 2.2 AA):** diagrams have `<title>`/`<desc>` and a text alternative; visible focus; adequate targets; code blocks scroll inside themselves; skip link; logical headings.
- **Viewports:** 390×844, 768×1024, 1440×900 (plus a 1920×1080 smoke). Designed for laptop reading first; phones must be comfortable.
- **Pixel standard:** every route template and component state has screenshot baselines; every UI change gets an Opus visual review; anything off is fixed at once, even when unrelated (§8).

### 4.10 App surface (routes)

| Route | Purpose |
|---|---|
| `/` | What the course is, how to use it, "Continue where you left off" (from read-state), the stage overview. No scores. |
| `/start` | Getting started: how practice works on WMOJ/DMOJ, what the CCC is (no targets). No local setup content — the app assumes the learner can already run Python (D-030 Q-19). |
| `/learn` | Course map: stages → modules, read marks, "Coming soon" for unwritten modules. |
| `/learn/[stage]/[module]` | Module overview: objectives, lessons, practice list, prerequisites. |
| `/learn/[stage]/[module]/[lesson]` | Lesson reader; previous/next; "Mark as read". |
| `/problems` | Every registry problem, grouped by year and level: title, judge, link, and "taught in" backlinks. Static; no filters. |
| `/search` | Full search (also a dialog from the header). |
| `/glossary` | Terms, each linked to the lesson that introduces it. |
| `/about` | Credits, CEMC attribution (CC BY-NC 4.0), judge acknowledgements, "this app is free". |
| `not-found` | Friendly 404 with links back. |

`/dev/viz` (the visual gallery, §4.11.6) exists only in local and preview builds and returns 404 in production.

The build fails if a route is missing from the E2E smoke list. Local servers (dev or `next start`) run on ports from `scripts/port-lease.mjs` (4100–4199), write `work/NN/_run/<name>.pid`, and are always stopped by whoever started them. `next build` runs under `.tooling/locks/build.lock`; content authors never run `next build`; they run `verify:fast` (§7) and, for screenshots, a dev server on a leased port.

### 4.11 Visualizations and animations (D-021) [DECIDED]

The app makes **extensive** use of visuals to teach: animated step-throughs of algorithms, animated traces of Python code, concept animations and static diagrams. They follow the same UI/UX bar as everything else (§4.9, §8.2), and they stay inside D-020: **nothing executes in the browser**. Every animation replays data recorded at authoring time by running the real Python under PyPy 3.8.

#### 4.11.1 Kinds of visual

| Kind | Component | What it shows | Data source |
|---|---|---|---|
| **Code tracer** | `CodeTrace` | Python code with the current line highlighted, the variables and their values (with a names → objects view for lists and dicts, so aliasing is visible), the call stack for functions and recursion, and the output so far. Like Python Tutor, but played back. | `examples/<name>.trace.json`, recorded by running the **shown** example under `sys.settrace` (`tools/viz/trace.py`), so the trace can never drift from the code |
| **Algorithm step-through** | `StepThrough` with a visualizer | An algorithm's state evolving: cells, nodes, pointers, queues, tables, with a caption per step explaining what happened and why | `visuals/<name>.frames.json`, recorded by `<name>.viz.py` through the small `vizrec` recorder API |
| **Concept animation** | `Scene` | Short explanatory animations for ideas that are not one algorithm: input flowing from stdin into `input()`, how a judge runs tests, a list growing, binary representation, growth of n vs n log n vs n² | Scene props plus authored step data, validated by Zod |
| **Static diagram** | `Diagram` | One frame of any visualizer, or a hand-positioned figure | Props or one frame |

#### 4.11.2 The visualization library (`components/viz/`)

- **Primitives:** cell, node, edge, arrow/pointer, bracket/range, label, badge, value box, container slot; all SVG, all styled from design tokens.
- **Visualizers** (each renders one frame from typed data; transitions between frames are animated):

  | Visualizer | Used for (examples) |
  |---|---|
  | `ArrayViz` | indices, pointers, windows, swaps, binary search ranges, prefix sums, difference arrays, circular arrays |
  | `GridViz` | grid basics, flood fill, BFS layers, grid DP, 2D prefix sums, grid transformations |
  | `GraphViz` | adjacency lists, BFS/DFS order, Dijkstra with distances, MST edges, DFS tree edges, state-space graphs |
  | `TreeViz` | recursion trees, rooted trees, tree DP, segment trees, Fenwick responsibility ranges, binary lifting jumps, DSU forests |
  | `TableViz` | DP tables with fill order and dependency arrows, frequency tables, lookup tables |
  | `StructViz` | stack, queue, deque, heap (as array and tree), hash map buckets, sets, monotonic stack/deque |
  | `LineViz` | number line, intervals, sweep line, coordinate compression, clock/modulo wheel |
  | `PlotViz` | function plots for convexity and ternary search, growth-rate charts |
  | `CodeTraceViz` | the code tracer layout (code + variables + stack + output) |

  A step-through may combine two visualizers side by side (for example `GraphViz` + a `StructViz` heap for Dijkstra) using a layout from the library.
- **Player** (`StepThrough`, `CodeTrace`, `Scene` share it): play/pause, previous/next step, a scrubber with step count, restart, speed (0.5×, 1×, 2×), an optional **preset** switcher (2–3 authored inputs, for example "small grid" and "grid with walls"), the per-step caption, and a legend. Keyboard: the player is one focusable group; ←/→ step, Space plays/pauses, Home/End jump; no global shortcuts. **No autoplay**; the first frame is server-rendered and fully meaningful.
- **Layout and responsiveness:** visuals have fixed aspect boxes (no layout shift), scale to the column on phones, and switch to a stacked layout (visual above, state panels below) under 640 px. Small screens never need horizontal page scroll, and a "rotate your phone" message in place of a readable visual is **not** acceptable: authors size presets so they read at 390 px.

#### 4.11.3 Visual design language (in `DESIGN.md`, P4)

- **One colour meaning everywhere:** for example unvisited, frontier/queued, current, visited/done, on the answer path, compared, invalid. States are also shown by shape, outline or icon and by labels, never by colour alone (colour-blind safe, and it still reads in a black-and-white screenshot).
- **Motion rules:** short, purposeful transitions (default 200–350 ms, one easing curve), one thing moving at a time where possible, movement that shows cause (an item slides from the queue into "current"), no decorative motion. **Reduced motion:** with `prefers-reduced-motion`, transitions become instant cross-fades or snaps; stepping still works.
- **Typography in visuals:** the app's fonts, a minimum readable size at 390 px, tabular numerals for values and indices.
- **Captions:** every step has a caption in the teaching voice (style guide, G-STYLE applies), explaining *what* changed and *why*, not just "step 7".
- **Light mode only**, like everything else.

#### 4.11.4 Accessibility

- Every visual sits in a `Figure` with a caption and a **text alternative** (a short summary plus, for step-throughs, the full ordered list of step captions in a `<details>` "Read the steps as text").
- The caption region is `aria-live="polite"`; controls have labels and visible focus; target sizes meet WCAG 2.2; the player is operable by keyboard only.
- SVGs have `<title>`/`<desc>`; decorative parts are `aria-hidden`.
- No flashing; no motion without a user action.

#### 4.11.5 Where visuals go (authoring rules)

- **Stages 0–2:** a `CodeTrace` for every new control-flow or data idea (assignment and reassignment, `if`, loops, `while` with sentinels, lists and 2D lists, references and copying, dicts and sets, functions and scope, recursion with its call stack); `Scene`s for the stdin/stdout model, how judging works, and reading error messages; `PlotViz` growth charts in M2.9.
- **Stages 3–7:** at least **one `StepThrough` per technique module**, usually on the module's own worked example (never a specific registry problem's solution, D-030 Q-20), plus `Diagram`s for structure. Hard modules (Stage 6–7) typically need two: the idea on a small input and the data structure's internal state (for example a segment tree update and query).
- **Track C:** `Scene`s where a process is the point (a contest timeline, a stress-test loop), otherwise diagrams.
- **Judgment over quota:** a visual must teach something the text alone teaches less well. The reviewer rejects decorative visuals, and flags any section where a visual is clearly missing.
- **Consistency with the code:** a step-through's `.viz.yaml` declares what it must agree with (for example "final distances equal the output of `examples/dijkstra.py` on preset 1"), and G-VIZ checks it.

#### 4.11.6 Build, data and checks

- `tools/viz/trace.py` (tracer) and `tools/viz/vizrec.py` (recorder) run under PyPy 3.8 locally: `npm run gen:viz -- --scope <id>` regenerates `.trace.json` and `.frames.json`. Frame data is compact (deltas where large); a per-visual size budget (default 150 kB raw) keeps pages light, and presets are sized to teach, not to impress.
- Zod schemas per visualizer validate every frames file at build time (`prebuild`), so a malformed visual can never deploy.
- The visual gallery `/dev/viz` renders every primitive, visualizer, player state and a sample of real content visuals; it is where visual regression baselines and the design review start.
- **G-VIZ** (§7): schema valid; regeneration produces no diff; every step has a caption; the text alternative exists; the declared consistency check passes; size budget respected; trace steps capped (default ≤ 200 steps; longer runs are summarised with "skip ahead" markers the author places).

---

## 5. Pedagogy (reading from absolute zero to S5)

### 5.1 Lesson shapes by stage

The evidence base carried over from v1 research (w2 §2) that still applies to reading: subgoal-labelled worked examples, one concept at a time, fading support, and explicit misconceptions. v1's "problem-first" shape for Stages 5–7 (walking through an actual CCC problem's solution) is gone with the walkthroughs (D-030 Q-20); Stages 5–7 stay **concept-first with the author's own worked example**, same as Stage 4.

| Stages | Lesson shape | Support |
|---|---|---|
| 0–1 | Short sections, one idea each: explain → worked example with output → a `CodeTrace` of it running line by line → common mistakes → a prose "try it in your editor" nudge | Maximum. Short sentences. Every term defined with `<Term>` on first use. |
| 2–3 | Guided problem solving with fixed subgoal labels: Read → Find the bounds → Work the sample by hand (often as a `StepThrough`) → Plan in words → Code → Test edge cases → Submit. This is a process the learner applies to the practice list's own problems; the app never runs it on a named problem itself. | Fading. From M3.10 the fast-I/O house skeleton is the default in all examples. |
| 4 | Technique lessons: the idea animated on a small input (`StepThrough`) → template as the author's own worked example → practice list | Medium. |
| 5–7 | Concept first: why the technique is needed and what problem shape it solves → the technique animated on a small worked example (`StepThrough`, plus a second visual of the data structure's internal state for the hardest modules) → the general technique in code → one problem's own subtask breakdown as a partial-marks strategy fact where it helps (D-030 Q-2, never a solution) → practice list | Low. |
| C | Contest skills as reading: rules, docs lookup, subtask strategy, time management, stress testing, reading grader feedback, running your own mock contest on the judges | — |

### 5.2 Rules for every stage

- **One new concept per section.** Define each term the first time it appears.
- **Show, then tell, then show again:** a visual introduces the idea on a tiny input, the text explains it, and the code (often traced) makes it concrete. Visual captions and prose use the same terms.
- **Samples come first** in every worked example.
- **"Bank the partials" is a habit, not a score:** "the grader keeps your best submission, so submit the brute force first", never "this earns N marks".
- **No per-problem walkthroughs, editorials or hints, ever** (D-030 Q-20, C20). The app never says a solution or walkthrough can be found elsewhere; the practice list's one-line `note` is the only per-problem prose (§4.6.4, §6.5).
- **Performance is taught as a spiral:** `join` vs `+=` (M1.7), `main()` and locals (M1.10), counting operations (M2.9), hidden costs of built-ins (M3.9), fast I/O as the house default (M3.10), iterative BFS/DFS (M4.13, M5.7), bottom-up DP (M4.11, M5.12), flat arrays and int keys (M6.x), constant-factor engineering (M7.12). Real timing is checked by the learner on the judges and in their local PyPy.

### 5.3 Curriculum adjustments for a reading app

- **M0.2 ("Writing and running Python": editor and runtime) and M0.3 ("Terminal basics and input files") are dropped entirely (D-030 Q-19).** Both exist only to get a local Python environment running (installing an interpreter, choosing an editor, opening a terminal, redirecting input/output). The app contains no system/environment setup content for any OS, so Stage 0 goes straight from **M0.1** (what a program is) to **M0.4** (stdin/stdout and exact output), **M0.5** (how judging works), **M0.6** (reading error messages) and **M0.7** (the judges). The app assumes the learner can already write and run a Python file; it never explains how. Curriculum modules: **104** (§2.2).
- **M0.7** teaches **both** judges: WMOJ for 2021–2026 and DMOJ for 2020 and earlier, and choosing the right Python language on each (P5 checks which Python/PyPy options each judge offers and whether any allows 3.9+ features, which the lesson then warns about). This is the judges' submission workflow, not local setup, so it stays.
- **C.3** (templates from memory) shows the templates as read-only code and explains how to practise typing them offline. No drills.
- **C.9** (mock contests) teaches how to sit a past paper on WMOJ under a 3-hour limit and revisit unsolved ones afterwards using only the docs and their own notes. No in-app mock, and no pointer to any outside editorial or solution.
- **C.10** (local judging with official data) teaches the skill of running your own code against official CEMC test data and comparing output, as a technique — not as a terminal tutorial. It assumes the learner already runs Python on their own machine (no re-teaching of M0.3's dropped content).
- **M7.14 (C++ bridge) is kept, with no setup and no scoring framing (D-030 Q-10).** No compiler installation, no IDE setup; it reads C++ solutions for awareness only, as a bridge to the CCO's C++ requirement, never framed as "Python can't do this" or as a walkthrough of a CCC Python problem (R14, leak list §5.4).
- **No module contains a problem walkthrough, editorial or per-problem hint** beyond the practice list's one-line `why` (D-030 Q-20). Stage 5–7 modules teach the general technique with the author's own worked example, never the solution to a specific registry problem.

### 5.4 Must not leak from the recon files into the app

Every content prompt quotes this list: the stage "Contest payoff" column; pacing milestones that carry scores; per-module lines such as "to 13/15" and "LIKELY IMPOSSIBLE in Python"; the Python-infeasible table's framing; `past-problems-analysis.md` §2.3 and §2.5; `ccc-format-and-rules.md` §7 cutoffs and §8 items 1 and 10; C.3 time goals; M7.14's rationale.

---

## 6. Content production model

### 6.1 Units of work

- **Module task:** one module's lessons, examples, visuals and `module.yaml`. No walkthroughs (D-030 Q-20). Authors get **contiguous runs of modules** (about 7–9 per author per content phase), so each author keeps one arc and one voice across related modules.
- **Foundations (P5):** registry and verification, `course.yaml`, `glossary.yaml`, `concepts.yaml`, the house skeleton, the style guide, `ui/strings.yaml`, the WMOJ-first module→problem mapping, and the three pilots.

### 6.2 Item pipeline (P5–P8)

1. **Brief.** The orchestrator writes `work/NN/brief.md`: module order and author assignment, concept introductions, running examples, callbacks to earlier stages, and each module's WMOJ-first problem picks (from the P5 mapping).
2. **Author** (model per §6.4) reads its §6.7 list, writes each module with avoid-ai-writing (`warm` + `docs`) **including its visuals** (§4.11.5: `.viz.py` recorders, `.viz.yaml`, captions, text alternatives, generated with `gen:viz`), saves originals before any rewrite pass (§6.3), runs `verify:fast --scope <id>` until green, captures screenshots of each new visual at its first, a middle and its last step at 390 px and 1440 px (`npm run viz:shots -- --scope <id>`, which starts a dev server on a leased port and stops it afterwards), sets `status: gated`, and returns at most 10 lines. Authors compose visuals from the library; a genuinely new primitive or visualizer is requested in `defects.md` and built by the orchestrator's chosen author with tests, gallery entry and reviewer sign-off.
3. **Reviewer** (one per phase, Opus) reads each gated module as a novice would, checks explanation quality, correctness of reasoning, voice, R13/R14, WMOJ preference and prerequisites, **reviews every visual from its screenshots and in the running build (does it teach, is it correct, is it pixel-clean, do captions and colours follow §4.11.3, does a section lack a visual it needs)**, looks at the rendered pages, files defects in `work/NN/defects.md`, and sets `reviewed` on clean modules. The same reviewer is continued with SendMessage across batches.
4. **Fixes** go back to the **same author** via SendMessage; changed modules re-run the gates and get a reviewer re-check.
5. **Acceptance** by the orchestrator: gates green, reviewer sign-off, the module renders cleanly; then `accepted`, and `progress.md` updated.
6. **Phase exit:** `verify:full`, then commit and push the phase branch, then E2E + visual + a11y on the **Vercel preview** (§7), then report assets.

No separate verifier or critic roles: the automated gates do the mechanical checking, and one Opus reviewer per phase supplies the judgment.

### 6.3 Voice and avoid-ai-writing

**Style guide** (`content/style/STYLE-GUIDE.md`, P5): warm, plain, second person, short sentences in Stages 0–2, no hype, no clipped fragments, no judgments about the learner; vocabulary and a terminology lock tied to the glossary; code conventions (house skeleton, naming, 4-space indents, Python 3.8 only); banned patterns; sentence-case headings; the R14 wording rules. It includes a **teaching-voice sample** (400–600 words), which overrides the skill's blog/social tone advice where they conflict. An agent drafts the sample with avoid-ai-writing; **the Manager approves or rejects it** (D-030 Q-4). P5 cannot start its pilot without an approved sample.

**Skill use:** authors invoke avoid-ai-writing with the `warm` voice and `docs` context when drafting and self-editing.

**G-STYLE** [DECIDED]:
- `tools/style/detect.mjs` imports `AIDetector` from `.claude/skills/avoid-ai-writing/detector/patterns.js` (P3 confirms the import path works with the pinned commit).
- Input: prose extracted from MDX (code, inline code and link targets removed) plus `ui/strings.yaml`.
- Hard categories: 0 hits. Soft categories: hits per 1,000 words under thresholds calibrated in P5 on the voice sample and the accepted pilots (`tools/style/thresholds.json`; later changes only via the changelog).
- `scripts/check-style.js` with the workspace style config (exit 1 = hard violation).
- **Validator:** before any rewrite pass the author saves `work/NN/_rewrites/<item>/<file>.orig`; G-STYLE runs `detector/validate.js <orig> <current>` on each pair and fails if code, tables, URLs or headings were corrupted or the rewrite added more flagged patterns than it removed.
- Readability for Stages 0–2: Flesch-Kincaid grade ≤ 9 by default (tuned in P5); warn on sentences over 30 words.

**Pilot (P5).** Three lessons that cover every content shape, both judges and the hardest writing:

| Pilot | What it tests |
|---|---|
| **M1.1** "Values, types, variables and `print`" | absolute-zero teaching, examples with outputs, **`CodeTrace`** of assignment and reassignment, a `Scene` |
| **M4.13** "BFS and flood fill (iterative)" | technique lesson, **`GridViz` + queue `StructViz` step-through** with presets, the author's own worked example (no walkthrough), a practice list with WMOJ first and a justified DMOJ pick |
| **M6.1** "Dijkstra's shortest paths" | concept-first hard-algorithm lesson, **`GraphViz` + heap step-through** with a consistency check against the shown code, Python speed notes |

The pilots run through the exact §6.2 pipeline. P5 writes the prompt templates (including a visual-authoring guide with worked `.viz.py` examples for each visualizer), calibrates thresholds, and measures time and tokens per module. **The Manager approves the pilots, including their visuals, before any content phase starts.**

### 6.4 Model per content role [DECIDED]

| Content | Author | Reviewer |
|---|---|---|
| Pilots (M1.1, M4.13, M6.1), style guide, UI copy | Opus | Opus |
| Stages 0–2 + C.1, C.2, C.10 (P6) | **Sonnet**, following the pilot exemplars and prompt templates | Opus (novice read: where a beginner gets lost matters most here) |
| Stages 3–4 + C.3, C.4, C.6, C.7 (P7) | **Sonnet** | Opus |
| Stages 5–7 + C.5, C.8, C.9 (P8): the hardest algorithm lessons | **Opus** | Opus |
| Registry data, module→problem mapping, glossary, `course.yaml` (P5) | Sonnet, checked by gates and the pilot reviewer | — |

### 6.5 R14 wording rules

Quoted in every content prompt.
- **Never mention:** target scores, "full marks" or a "perfect score" as a goal; "realistic" scores or a "ceiling"; cutoffs, Distinction, honour roll or CCO qualification; percentiles, averages of results, medals; that Python "can't" solve something or is "too slow".
- **Subtask marks** appear only as facts about one problem when teaching partial-marks strategy (D-030 Q-2). Never totals, sums, cutoffs, goals or comparisons.
- **Hard problems** get an "extension" section with the full algorithm and no claim about what Python can reach. The algorithm is general (never framed as "the solution to" a specific numbered CCC problem).
- **No problem walkthroughs, editorials, solution pages or per-problem hints, and no mention that one exists, in the app or elsewhere** (D-030 Q-20, C20). The practice list's one-line `why` (§4.6.4) is the only per-problem prose beyond the module `note`.
- **G-R14** uses narrowed patterns (`(score|mark)s?.{0,20}(ceiling|target)`, `realistic (score|ceiling|target)`, `\b\d{1,2}\s*/\s*75\b`, `(qualif\w*|invit\w*).{0,20}CCO`, `average (score|mark|result)s?`, `(solution|walkthrough|editorial).{0,20}(exists|available|can be found|see)`, …) in `tools/lint/r14-banned.json` with a reviewed allow-list, over content and `ui/strings.yaml`. Legitimate terms ("ceiling division", "average of the array") pass.

### 6.6 Copyright

- **Paraphrase only.** A practice-list `note` may reference a problem's theme in a few words; it never quotes or paraphrases the problem statement beyond that, and links to the judge for the full statement. The reviewer checks for copied wording.
- **Attribution** to the CEMC (CC BY-NC 4.0) renders on `/about` and on every page that lists CCC problems (course map, module pages, `/problems`).
- **Free and non-commercial:** the app never charges for access. No official CEMC test data is fetched, cached or shipped: the app shows no full solution to a specific CCC problem, so there is nothing to check against it (D-030 Q-20).

### 6.7 What authors read

All authors: the style guide, the pilot exemplars, the prompt template, their modules' sections of `curriculum-map.md` plus prerequisite objectives, `glossary.yaml`, `concepts.yaml`, the relevant registry entries, the brief, and the leak list (§5.4).

| Author | Also reads |
|---|---|
| Stage 1, 3 and 5–7 authors | `python-for-ccc.md`: 3.8 traps, fast I/O, recursion, performance |
| C-track authors | `ccc-format-and-rules.md`: format, grader, rules |
| Authors picking practice problems | the problem's row in `past-problems-analysis.md`, the per-problem notes in `research/01-recon/_working/w2-junior-problems.md`, `w3-senior-s1-s3.md` or `w4-senior-s4-s5.md`, and the statement on the judge or CEMC site — for writing the one-line `note`/`why` only, never a walkthrough |

Those recon files are also leak sources, so the leak list travels with them.

---

## 7. Quality gates

`verify:fast --scope <id>` runs on every change (no build, no server, no browser). `verify:full` runs at phase exit and release. **Each gate has a fixture proving it catches what it claims.** Every gate blocks unless noted.

| ID | Gate | Tool | When |
|---|---|---|---|
| G-LINT | Biome, zero warnings | Biome | fast |
| G-TYPES | `tsc --noEmit` | TS | fast |
| G-UNIT | Loader, schemas, `judgeUrl` (year boundaries), read-state, search index | Vitest | fast |
| G-SCHEMA | Zod over all YAML and frontmatter; unique IDs; every reference resolves; prerequisites match the map, no cycles, never forward; `internal` never rendered | content:check | fast (also `prebuild` on Vercel) |
| G-PY-38 | ruff py38 + vermin + `py_compile` (PyPy 3.8) over every Python artefact; `bad38` must fail | check:python | fast |
| G-PY-RUN | Every `.out` reproduces byte for byte under PyPy 3.8; `expectError` cases raise the stated error | check:python | fast (scope) / full |
| G-VIZ | Every visual: Zod-valid data; `gen:viz` regenerates with no diff; caption on every step; text alternative present; declared consistency check with the shown code passes; size and step budgets (§4.11.6); only library components used | check:viz | fast (also schema part in `prebuild`) |
| G-STYLE | Detector thresholds + check-style + validator pairs + readability (§6.3); captions included | style:check | fast |
| G-R14 | Narrowed banned patterns over prose, `ui/strings.yaml` and hard-coded strings in app code, including references to a solution/walkthrough/editorial existing elsewhere | lint:r14 | fast |
| G-LINK-FMT | Year-band URL formats; no raw judge URLs; external links on the allow-list | content:check | fast (also `prebuild`) |
| G-LINK-REF | Plain-text CCC references inside registry components | content:check | fast |
| G-LINK-PREF | WMOJ-first rule: DMOJ picks need `why` when a WMOJ problem for the module exists (warning; reviewer must resolve all) | content:check | fast |
| G-LINK-LIVE | `verified.json` is `ok` for every referenced problem; > 90 days warns | content:check (snapshot); links:verify (live, manual) | release hard / phase exit warn |
| G-LINK-EXT | External non-judge links resolve | links:external (manual) | release |
| G-PREREQ | Python features used in examples (AST) vs `concepts.yaml`; glossary terms vs `introducedIn` | content:check | fast |
| G-SPELL | cspell with the domain dictionary | cspell | fast |
| G-MDX | remark-lint | remark | fast |
| G-BUILD | `next build` succeeds with every route prerendered (no dynamic routes in the build output) | Next | full |
| G-E2E | Playwright on Chromium + WebKit: navigation, course map, lessons, module practice links equal `judgeUrl()`, search, mark-as-read (including blocked storage), **visual players** (play/pause, step, scrub, presets, keyboard only, reduced motion, lazy hydration, first frame without JS), 404, no console errors, **no request leaves the origin** | Playwright | full, against the local production build **and** the Vercel preview at phase exit |
| G-VISUAL | Screenshots of every route template and key state at 3 viewports on Chromium and WebKit; element shots of every gallery entry; **every content visual at its first, a middle and its last step** at 390 px and 1440 px; animations settled, fonts ready; `maxDiffPixels` ≤ 50; baselines from this Mac with pinned browsers; any baseline update needs an Opus visual-review note | Playwright | full (local and preview) |
| G-PAGE | Every built page: axe WCAG 2.2 AA zero violations (players included, in their initial and a mid-step state); no horizontal overflow at 390 px | Playwright + axe | full |
| G-UI-LIGHT | No dark styles anywhere | grep lint | fast |
| G-PERF | Lighthouse on key templates (including the lesson with the most visuals) against the deployment; first-load JS per route under the P4 budget; lesson pages ship only the §4.8 client code; the visual chunk loads lazily; no layout shift from players; smooth playback (no long tasks over 50 ms while stepping, measured in a Playwright trace) | Lighthouse + build stats + Playwright | P4 exit, release |
| G-FLAKE | New or changed E2E/visual tests: `--repeat-each 10 --retries 0`; phase exits use `--fail-on-flaky-tests`; zero flakes | Playwright | on change + full |
| G-LINKS-INT | linkinator over the local production server: zero broken internal links or anchors | linkinator | full |
| G-SECRETS | No tokens in tracked files (`ghp_`, `gho_`, `github_pat_`, `.env*`) | script | before every commit |
| G-CONTAIN | Before/after snapshot proof (§9) | contain-snapshot | every tool install or first run; P3, P4 exit; release |

Removed from v1: G-ADEQ, G-GEN (replaced by G-PY-RUN), G-TIMING, G-PY-EXACT, G-FACTS, G-COPY n-gram (no statement cache), runner E2E. Removed from v2.0 in v2.1: G-SOLUTION (no full CCC solutions are shown any more, D-030 Q-20).

---

## 8. Engineering standards (bind every build phase)

1. **Reproduce bugs end to end first.** Write a failing Playwright test, or the closest real-user harness, that shows the bug as the learner would meet it, on the deployed preview when the bug is deployment-specific. Then fix it. The test stays as a regression test.
2. **Be picky about the UI, visuals included.** Every UI-touching task, and every new visual, ends with screenshots at 3 viewports (visuals at several steps) and an Opus visual review. Every phase exit also checks the **deployed preview** at those viewports. Fix misalignment, uneven spacing, clipped text, inconsistent radii or colours, focus rings and layout shift on the spot, **even when unrelated to the task**.
3. **Zero warnings, zero failures, zero flakes.** Any lint warning, type error, failing or flaky test an agent sees gets fixed, even if the agent didn't cause it; if out of scope, it goes into `defects.md` as blocking. **Every phase exits with zero open defects** unless the Manager approves deferring one.
4. **Quality over development cost.** Prefer the robust path.
5. **Keep it simple.** No dependency without a clear need; one way to do each thing; no client JS beyond §4.8.
6. **Determinism.** Pinned versions, committed generated outputs, no network in normal tests, same Node major as Vercel.
7. **Definition of done.** An item is done when `verify:fast` passes for its scope. A phase is done when `verify:full` passes locally **and** the E2E/visual/a11y suites pass on its Vercel preview.
8. **Generated files are never hand-edited:** Next's `AGENTS.md`, `.out` files, `ledger.generated.md`, `verified.json` (written only by the verifier), anything a tool marks as generated.

---

## 9. Containment and tooling (R15, operating-rules §7)

`w3-containment.md` is the evidence base; this section overrides it where they differ (§16.1).

### 9.1 State lives in `.tooling/`

| Path | Contents |
|---|---|
| `node/` | Node tarball (Vercel-matching major), SHA-verified |
| `pypy38/` | PyPy 3.8 v7.3.11 macOS arm64, SHA-verified against pypy.org |
| `venvs/tools/` | ruff, vermin (pip with its cache in `.tooling/xdg/cache`) |
| `npm-cache/`, `npmrc` | npm state and config |
| `xdg/` | XDG cache, config, data, state |
| `playwright-browsers/` | Chromium, WebKit, Firefox (Firefox only for the release smoke) |
| `impeccable-home/` | Impeccable engine |
| `avoid-ai-writing-src/` | the full pinned tarball, unpacked |
| `locks/`, `snapshots/` | build lock and containment proofs |
| `contain-allowlist.txt` | backstop allow-list (§9.4) |
| `bin/`, `README.md` | wrappers and guards; `README.md` documents every entry and its removal |

### 9.2 Activation that holds in this harness

Each Bash call is a fresh shell, and Homebrew `node`/`npm` are already on `PATH`, so activation has four layers:

1. **Wrappers:** `.tooling/bin/{node,npm,pypy38,ruff,vermin,pw,gh,git}` source `env.sh`, check that the resolved binary is the intended one (under `.tooling/` or `main-app/node_modules/.bin`; for `gh` and `git` the system binaries, see §10.2), then `exec`. `CLAUDE.md` and every prompt say: **call tools only through `.tooling/bin/*` or `npm run …`.**
2. **Script guard:** every npm script begins with `node scripts/assert-contained.mjs`, which fails unless all redirect variables point into the workspace.
3. **Hook guard:** a project `PreToolUse` Bash hook (`.tooling/bin/guard-bash`) rejects bare `npm`, `npx`, `node`, `pip`, `python3`, `pypy`, `brew`, `playwright`, `vercel`, and also `git config --global|--system`, `gh auth login|logout|refresh|setup-git`, `git push --force`, and any `--no-verify`. The message names the correct wrapper.
4. **Env block:** `.claude/settings.json` `env` repeats the redirect variables as literal absolute paths (not `PATH`).

`HOME` is not overridden globally. `TMPDIR` is not redirected (Chromium's socket path limit). `env.sh` sets the w3 §2 redirects, `XDG_*` into `.tooling/xdg/`, `PLAYWRIGHT_BROWSERS_PATH`, `NEXT_TELEMETRY_DISABLED=1`, `PIP_*`, `IMPECCABLE_HOME`, `GH_NO_UPDATE_NOTIFIER=1`, and `GH_CONFIG_DIR=$HOME/.config/gh` (so the redirected `XDG_CONFIG_HOME` does not hide the Manager's existing `gh` login, §10.2).

### 9.3 Session restart after P3 (mandatory)

Settings env, hooks and project skills load at session start, so P3 ends by asking the Manager to **restart the Claude Code session**. The P4 orchestrator, itself a fresh agent in the new session, first proves: `env` shows the redirects; the guard rejects a bare `npm -v` and a `git config --global` write; `.tooling/bin/node -v` gives the workspace Node; both skills load through the Skill tool; the Impeccable hooks fire. Recorded in the P4 log.

### 9.4 Proof protocol (G-CONTAIN)

`.tooling/bin/contain-snapshot before|after|diff`:
1. Touch a marker file.
2. Stat-snapshot the w3 §9 list plus `~/Library/WebKit`, `~/Library/Caches/com.apple.WebKit*`, `~/Library/HTTPStorages`, `~/Library/Saved Application State`, `~/Library/Application Support/Firefox`, crash-report locations, `~/Library/Preferences/nextjs-nodejs`, `~/.config/gh`, `~/.cache/gh`, `~/.local/state/gh`, `~/.gitconfig`.
3. Run the step. 4. After-snapshot and diff.
5. Backstop `find ~ -newer <marker> ! -path "<workspace>/*"`: (a) **hard fail** on any new path named after a project tool (node, npm, npx, playwright, chromium, webkit, firefox, pypy, python, next, impeccable, biome, lighthouse, cspell, vitest, vercel); (b) other paths only if they match `.tooling/contain-allowlist.txt` (explicit globs with a reason each: harness state, macOS churn unrelated to our tools). Anything else fails. TCC permission errors are logged, not fatal.

Proofs go to `work/NN-<name>/containment/` and are summarised in the phase log.

### 9.5 Skills and npx

| Skill | Pin | Install |
|---|---|---|
| **Impeccable** | `skill-v4.3.1` (re-check at install) | Manual project-scope copy into `.claude/skills/impeccable/`; `IMPECCABLE_HOME=.tooling/impeccable-home`; engine download checksum-verified by its launcher; hooks only in the workspace `.claude/settings.json`; config in `.impeccable/`. |
| **avoid-ai-writing** | commit `fc979c6489ec0ac81a77236782ba496da81b24cb` (tarball) | Unpack to `.tooling/avoid-ai-writing-src/`; copy `skills/avoid-ai-writing/` to `.claude/skills/avoid-ai-writing/`; record the tarball SHA-256; runs on the workspace Node (D-030 Q-15, approved as recommended). |

Never `npx <remote package>`; only `npm exec --no -- <bin>` for exact-pinned local devDependencies. No `create-next-app`. Never install avoid-ai-writing via npx, `npm -g`, MCP, the plugin marketplace or user scope.

### 9.6 Checks P3 settles (stop and report if a tool can't be contained)

- Whether Next writes its telemetry file despite `NEXT_TELEMETRY_DISABLED` (P4 first build).
- Playwright crashpad locations for each engine (P4 first run).
- pip config paths inside the PyPy venv.
- That the `gh` wrapper reads the existing login and writes nothing outside the workspace (§10.2).

### 9.7 Traces outside the workspace (Manager acknowledgement, D-030 Q-13)

Owned by the system, the harness or the Manager, not installed by us, and listed openly: LaunchServices/Gatekeeper records for the Playwright browser bundles; `TMPDIR` leftovers until the OS purges them; the Claude Code harness's own session files under `~/.claude/`; and the Manager's **pre-existing** `gh` login (`~/.config/gh/hosts.yml`, the macOS Keychain entry) and global git config, which we only read (§10.2). v2 drops PyPy 7.3.9, so there is no Rosetta cache any more.

### 9.8 Uninstall

Delete the workspace. `.tooling/README.md` documents removal tool by tool. The GitHub repo and the Vercel project live in the Manager's accounts and are removed there if ever wanted (§10.6).

---

## 10. Version control, GitHub and Vercel [DECIDED; specifics in D-030 Q-17, Q-18]

### 10.1 When

**P3, step 1 (after the "before" snapshot and before any tooling install)** creates the repo, so that every later phase has history and P4 can link Vercel. **Status: [NOT YET EXECUTED].** Nothing in this section runs before P3 starts.

### 10.2 What `gh` and `git` touch outside the workspace

Observed read-only during this planning run (2026-09-23): `gh` 2.92.0 is installed by Homebrew at `/opt/homebrew/bin/gh`; it is **already logged in** to github.com (account `Adham-Aly`, token in the macOS Keychain, scopes include `repo`); the global git config **already** routes github.com credentials to `gh auth git-credential` and has an identity. So:

- **No global changes are needed.** We never run `gh auth login/refresh/setup-git` or `git config --global/--system`. The guard hook blocks them.
- **Reads only:** `~/.config/gh/hosts.yml` and `config.yml`, the Keychain token, `~/.gitconfig`.
- **Writes:** `gh` API cache and state go to `.tooling/xdg/` (the wrapper keeps `XDG_CACHE_HOME`/`XDG_STATE_HOME` in the workspace and sets `GH_NO_UPDATE_NOTIFIER=1`); git writes only `.git/`. P3's G-CONTAIN proof covers `~/.config/gh`, `~/.cache/gh`, `~/.local/state/gh` and `~/.gitconfig`.
- **If the login is missing or expired** when P3 runs, the orchestrator stops and asks the Manager to run `gh auth login` in their own terminal. That credential is the Manager's, outside the workspace, and is recorded in §9.7.

### 10.3 Steps (P3) [NOT YET EXECUTED]

All commands go through `.tooling/bin/gh` and `.tooling/bin/git`.

1. **Auth checks (stop on any failure):**
   - `gh --version`;
   - `gh auth status --hostname github.com` shows logged in, with `repo` scope;
   - `gh api user --jq .login` prints the expected account;
   - `gh repo view <owner>/<name>` must fail with "not found" (the name is free).
2. `git init -b main` at the workspace root.
3. Write `.gitignore`: `.tooling/*` except `env.sh`, `bin/`, `README.md`, `contain-allowlist.txt`; `node_modules/`, `.next/`, `out/`, `test-results/`, `playwright-report/`; `work/**/_scratch/`, `work/**/_run/`; `.env*`; `.vercel/`; `.DS_Store`.
4. Run G-SECRETS, then `git add -A` and review `git status` (no secrets, no large binaries).
5. First commit: `Phase 3: workspace, plan v2 and project configuration` (plain message; no AI co-author lines, no agent names).
6. `gh repo create <name> --private --source=. --remote=origin --push --description "CCC Python learning app"` (name `et-ccc`, D-030 Q-17).
7. Verify: `gh repo view <owner>/<name> --json visibility,defaultBranchRef` returns `PRIVATE` and `main`. Record the URL in the P3 log and `progress.md`.

Identity: commits use the Manager's existing global git identity, read-only (D-030 Q-17).

### 10.4 Commits, branches and pushes

- **Standing instruction (D-030 Q-17, approved as recommended):** *"At each phase end, and before any redo, the orchestrator commits the phase's work on its branch and pushes it. After I approve a phase, the main session merges it into `main` and pushes."*
- Each phase works on `phase-NN-<name>`, branched from `main`. Pushing it creates a **Vercel preview**. Merging to `main` updates **production**.
- Fix commits made during the phase-exit loop (§6.2 step 6) are part of the phase end.
- Messages name the phase and outcome. **Never** AI co-author lines or agent names, never `--no-verify`, never force-push, never rewrite pushed history.
- A redo starts a new branch `phase-NN-<name>-v<k>` from `main`; the old branch stays for reference.

### 10.5 Linking Vercel (P4, Manager action) [NOT YET EXECUTED]

After P4's scaffold is pushed, the main session asks the Manager to, in the Vercel dashboard:
1. **Add New → Project → Import Git Repository**, and grant the Vercel GitHub App access to **only this repo**.
2. Set root directory `main-app`, framework Next.js, production branch `main`, no environment variables.
3. Turn off Vercel Toolbar/comments on previews, Web Analytics and Speed Insights.
4. Confirm Deployment Protection is **off**, so previews and production are both public on the personal Hobby account (D-030 Q-18). No bypass secret is created, and none is needed: Playwright and the Manager open any preview URL directly.

Agents find a branch's preview URL with `scripts/deployed-url.mjs`, which calls `gh api repos/<owner>/<repo>/deployments?ref=<branch>` and reads the latest successful status's `environment_url`, waiting for the build to finish (SPIKE S-2).

### 10.6 Removal

Deleting the workspace removes all local state. The private repo and the Vercel project stay in the Manager's accounts until the Manager deletes them there.

---

## 11. Agent orchestration (conservative)

### 11.1 Tiers [DECIDED]

| Tier | Role | Spawns |
|---|---|---|
| 0 | **Main session.** Talks to the Manager, launches one phase orchestrator at a time, relays Manager actions (restart, Vercel link, DMOJ checklist, approvals), launches the report agent, merges approved phases. | orchestrators, report agents |
| 1 | **Phase orchestrator.** Plans the phase within this plan, writes the brief, dispatches workers, accepts work, owns the context files and the git steps of its phase. May do small tasks itself when that is cheaper than a spawn (P3 does all installs itself). | workers |
| 2 | **Worker.** Focused work, results to files. | **nothing** |

- **main → orchestrator → workers is the only shape.** No sub-orchestrators, no third tier, no `fork`. Fewer tiers are allowed (P10 maintenance: main → one worker).
- **No swarms.** At most **3 workers run at once** in any phase.
- **The Workflow tool is not used**, and no harness feature that spawns many agents at once is used.

### 11.2 Model policy [DECIDED]

- **Opus 5.5** where it clearly pays off: architecture and design (P4), the visualization library and its interaction design (P4), the pilot and the voice (P5), the hardest algorithm lessons (P8), review of every content phase, final review (P9), and orchestration of the phases whose judgment drives everything (P3, P4, P5, P8, P9).
- **Sonnet 5** for mechanical or bulk work that gates and an Opus reviewer check afterwards: scaffolding and pipeline code, QA and test suites, registry data, containment audits, content for Stages 0–4 (following the approved pilot exemplars), orchestration of P6 and P7 (a fixed pipeline with an Opus reviewer supplying the judgment), and Manager reports.

### 11.3 Prompt contract

**Spawners** always pass `subagent_type: "general-purpose"` and an explicit `model: "opus"` or `model: "sonnet"` per §11.5. Never omit `model`, never use `fork`. Log each spawn (role, model, purpose) in the phase checklist.

**Every worker prompt contains:**
1. Verbatim: **"You must NOT spawn any subagents or use the Agent/Workflow tools. Do all work yourself."**
2. **"Do NOT install anything"**, except in a phase with install authorisation, where the prompt names exactly what, and requires the wrappers and a G-CONTAIN proof.
3. **"Call tools only through `.tooling/bin/*` or `npm run …`."** (From P3 on.)
4. The files to read, by path and section, and what to skip.
5. The output location, and "write results to files before returning; return at most 10 lines with file paths".
6. App-wide rules: **R13/D-020** links only via the registry, WMOJ first, never type a judge URL, CCC 2014–2026 only; **R14** with the §5.4 leak list and §6.5 wording; **C20/D-030 Q-20**: no problem walkthroughs, editorials, solution pages or per-problem hints, ever; **C21/D-030 Q-19**: no system/environment setup content; **Python 3.8 only**; **light mode only**; **no exercises, quizzes or code execution in the app**; **visuals only from the §4.11 library, fed by recorded data**.
7. The §8 standards, summarised, including zero defects and "never edit generated files".
8. **"Never commit, push or change git/gh config (the orchestrator does git). Never add co-author lines. Write nothing outside the workspace. Scratch files go in `work/NN-<name>/_scratch/`. Do not write agent memory."**
9. For tasks that start servers: lease a port, write a pid file, stop what you start (§4.10).

### 11.4 Caps, continuation and approvals

- Each phase has a **spawn cap** (§11.5). The cap includes one contingency replacement; going above it needs the Manager's approval through the main session.
- Fix loops **continue the same worker with SendMessage**. A replacement is spawned only if the worker is gone (§0.3).
- The first module of each content phase runs alone as a calibration item before other authors start.
- Every phase needs the main session's launch; install phases need install authorisation (rules §2). No phase needs swarm approval, because no phase has more than 3 concurrent workers or more than 7 spawns (8 with the contingency).

### 11.5 Agent budget per phase

| Phase | Orchestrator | Workers (model) | Spawns | Cap |
|---|---|---|---|---|
| P3 Setup | Opus (does installs and repo itself) | containment auditor (Sonnet) | 2 | 3 |
| P4 App | Opus | app engineer (Sonnet), design lead (Opus, Impeccable), visualization engineer (Opus), QA engineer (Sonnet), reviewer: code + visual (Opus) | 6 | 7 |
| P5 Voice, registry, pilot | Opus | registry & data (Sonnet), voice & pilot author (Opus), pilot reviewer (Opus) | 4 | 5 |
| P6 Content A: Stages 0–2 (31 modules) | Sonnet | 4 authors (Sonnet, ≈7–8 modules each), reviewer (Opus) | 6 | 7 |
| P7 Content B: Stages 3–4 (28 modules) | Sonnet | 4 authors (Sonnet, ≈7 each), reviewer (Opus) | 6 | 7 |
| P8 Content C: Stages 5–7 (42 modules) | Opus | 5 authors (Opus, ≈8 each), reviewer (Opus) | 7 | 8 |
| P9 Review & release | Opus | final reviewer: course + visual (Opus), release QA (Sonnet) | 3 | 4 |
| Manager reports | — | 1 per phase (Sonnet) | 7 | 7 |
| **Total** | | | **41** (19 Opus, 22 Sonnet) | 48 |

**Compared with v1:** v1 planned about **294 spawns** (278 in 16 build phases plus 16 reports), up to 5 concurrent, with Opus in most writing and review roles and per-item author → verifier → critic triples. v2.0 planned **about 41** (cap 48), about **7× fewer**, over 7 phases with at most 3 concurrent. The biggest savings: no runtime/exercise phases (v1 P5–P7), content in 3 phases instead of 8, contiguous module runs per author instead of one author per module, one reviewer per phase instead of per-batch verifiers and critics, Sonnet for Stages 0–4, and no audit swarm (v1 P17). D-021's visuals add one spawn (the P4 visualization engineer); content visuals are made by the existing authors.

**v2.1 recomputation (D-030):** module counts shift slightly — P6 loses M0.2 and M0.3 (33 → 31 modules), P8 gains M7.14 back (41 → 42 modules) — but stay within each phase's existing per-author range (≈7–9 modules), so **author headcounts, spawns and the cap are unchanged: 41 total (19 Opus, 22 Sonnet), cap 48.** What shrinks is token cost per module, not headcount: no walkthrough sections, no `solutions/` files, no CEMC-data fetching or checking (P5), no `hint` field. Token use is now dominated by ≈240k–260k words of content and its ≈400–550 visuals (both down from v2.0's ≈300k words); P5 still measures tokens per module and recalibrates this table through a changelog entry if the reduction changes the picture.

### 11.6 Manager reports (after every phase)

- The orchestrator writes `work/NN/report-assets/`: PNG screenshots of real pages from the **Vercel preview** (from P4 on), the preview URL, and `summary.md`.
- The report agent (Sonnet, spawned by the main session) reads the phase log and those assets, **runs no tools** other than reading and writing its files, loads `artifact-design` for design guidance only, and writes one self-contained **light-theme** HTML file to `~/Desktop/et-ccc-phase-NN-<name>-report.html` with a copy in `manager-reports/`. Images are embedded as base64 (file ≤ 8 MB). It **never publishes**. Plain language: what happened, what was found and decided, what needs the Manager, what comes next, and the preview link to click.

---

## 12. Phase plan

### 12.0 Phase index

| # | Name (orchestrator) | Log | Branch / `work/` dir | Installs authorised | Manager gate at end |
|---|---|---|---|---|---|
| 3 | Setup: tooling, containment, repo (`setup-orchestrator`) | `phase-03-setup.md` | `main` (first commit) / `work/03-setup/` | Node, PyPy 3.8 + tools venv, both skills; **creates the private GitHub repo** | session restart; containment proof |
| 4 | App: foundation, design, reader, pipeline, deploy (`app-orchestrator`) | `phase-04-app.md` | `phase-04-app` / `work/04-app/` | npm deps in `main-app/`, Playwright browsers, Lighthouse | Vercel linked (mid-phase); **look & feel and visual style on the live preview** |
| 5 | Voice, registry & pilot (`pilot-orchestrator`) | `phase-05-pilot.md` | `phase-05-pilot` / `work/05-pilot/` | none | **HARD: voice & pilot approval**; DMOJ checklist |
| 6 | Content A: Stages 0–2 + C.1, C.2, C.10 (`content-orchestrator`) | `phase-06-content-a.md` | `phase-06-content-a` / `work/06-content-a/` | none | sample review on preview; merge → learner can start |
| 7 | Content B: Stages 3–4 + C.3, C.4, C.6, C.7 | `phase-07-content-b.md` | `phase-07-content-b` / `work/07-content-b/` | none | sample review on preview |
| 8 | Content C: Stages 5–7 + C.5, C.8, C.9 | `phase-08-content-c.md` | `phase-08-content-c` / `work/08-content-c/` | none | sample review on preview |
| 9 | Review & release (`release-orchestrator`) | `phase-09-release.md` | `phase-09-release` / `work/09-release/` | patch bumps only | **HARD: final acceptance; production release** |
| 10 | Maintenance (on demand) | `phase-10-maint-<date>.md` | `maint-<date>` / `work/10-maint-<date>/` | patch bumps | per run |

**Applies to every phase:**
- Start and finish follow operating-rules §3 and §13 here.
- Exit requires zero open defects, `verify:full` green (from P4 on), the preview suites green (from P4 on), and a clean G-CONTAIN whenever tools were installed or first run.
- Phase end: commit and push per §10.4, write report assets.
- "Read first" always means: `00-START-HERE.md`, this plan §0–§3 plus your phase, `progress.md`, `decisions.md`, the previous phase's log, plus whatever the phase lists.

### P3 Setup: tooling, containment and repo

- **Goal:**
  1. `contain-snapshot` tooling first, then the "before" snapshot.
  2. **GitHub repo (§10.3)** [NOT YET EXECUTED]: auth checks, `git init`, `.gitignore`, first commit, `gh repo create … --private --source=. --remote=origin --push`, visibility check.
  3. `.tooling/` with wrappers, the guard hook, the settings env block, `env.sh`, the allow-list.
  4. Node (Vercel-matching major; **SPIKE S-1**: confirm the Node majors Vercel's build image supports today and pin the same major locally and in `engines`), PyPy 3.8 v7.3.11 and the tools venv (ruff, vermin).
  5. Both skills installed and smoke-tested (the Impeccable engine lands in `IMPECCABLE_HOME`; the avoid-ai-writing detector runs on a sample through the planned import path).
  6. Root `CLAUDE.md`.
  7. Commit the P3 result on `main` and push (standing instruction permitting).
- **Entry:** plan v2.1 approved; install authorisation; D-030 rulings on Q-13, Q-14, Q-15, Q-17.
- **Read first:** §9, §10; `w3-containment.md` (with §16.1 overrides); the install sections of `research/01-recon/design-skill-recommendation.md` and `research/02-writing-style-skill/recommendation.md`.
- **Agents:** the orchestrator (Opus) does the steps itself; **auditor** (Sonnet) independently takes the "after" snapshot, diff and backstop, tests wrappers and guard, checks `.gitignore` and G-SECRETS, and writes the `.tooling/README.md` removal steps.
- **Deliverables:** `.git/` + the private GitHub repo, `.gitignore`, `.tooling/**`, `.claude/settings.json`, `.claude/skills/**`, `.impeccable/`, `CLAUDE.md`, `work/03-setup/{containment/,tool-versions.md,spike-S1.md,repo.md}`.
- **Exit:** clean proof; every wrapper resolves correctly; guard rejects bare and global-config calls; detector and Impeccable engine work; repo is private and pushed; **the Manager restarts the session** (§9.3).

### P4 App: foundation, design, reader, pipeline and deploy

- **Goal:**
  1. §9.3 verification (the orchestrator itself).
  2. Manual scaffold (no `create-next-app`) with the §4.2 pins; Biome, TS, Vitest, Playwright (Chromium + WebKit, first-run containment proof per engine), axe, linkinator, cspell, remark-lint, Lighthouse; `verify:fast` / `verify:full`; `main-app/CLAUDE.md` with `@AGENTS.md`. Commit and push `phase-04-app`.
  3. **Manager action: link Vercel (§10.5).** Then **SPIKE S-2** (deployment URL lookup; previews and production are both public, D-030 Q-18, so no protection-bypass work is needed) and a first deployed build.
  4. Impeccable `teach` → `PRODUCT.md` / `DESIGN.md`; tokens into Tailwind and Shiki; fonts; the reading layout; base components; every §4.10 route.
  5. Content pipeline (§4.6): loader, Zod schemas, the MDX component map with all diagram components, `course.yaml` handling, draft visibility by `VERCEL_ENV`, `content:check`, `content:status`.
  6. Registry code (§4.7): `judgeUrl`, `ProblemLink`, `Practice`, `JudgeLink`, `verify-judges`, the DMOJ checklist generator, a registry stub for all 119 slugs.
  7. `tools/pycheck` (§4.5), `tools/style`, `tools/lint` (R14), every §7 gate with a fixture that fails it; synthetic fixture content in `tests/fixtures/content/` covering every component, `bad38`, `expectError`, crossovers, both judges, the WMOJ-first lint.
  8. **Visualization system (§4.11):** primitives, all nine visualizers, the shared player, `Figure`/`Diagram`/`StepThrough`/`CodeTrace`/`Scene`, reduced-motion handling, lazy hydration with a server-rendered first frame; `tools/viz/trace.py` and `vizrec.py` under PyPy 3.8, `gen:viz`, `check:viz` (G-VIZ), `viz:shots`; the `/dev/viz` gallery with every primitive, visualizer and player state; the visual language written into `DESIGN.md` with the design lead; at least one fixture visual per visualizer, plus a fixture `CodeTrace` covering loops, lists, a function call and recursion.
  9. The other §4.8 client features; E2E, visual baselines (including the gallery), G-PAGE, G-PERF budgets (including the visual chunk); `scripts/deployed-url.mjs`.
- **Entry:** P3 done; session restarted; Vercel linked per D-030 Q-18 (previews and production both public, no protection).
- **Read first:** §4 (including §4.11), §7, §8, §9.3, §10.5; `w1-tech-stack.md` §1, §2, §6–§8 only (the rest is about the removed runtime); `w4-links-and-qa.md` Part A.
- **Agents:** app engineer (Sonnet: scaffold, pipeline, registry code, gates); design lead (Opus: Impeccable, design record including the visual language, tokens, layout, components); visualization engineer (Opus: §4.11 library, player, tracer and recorder, gallery); QA engineer (Sonnet: E2E, visual, a11y, perf, deployed-URL tooling); reviewer (Opus: architecture, code, pixel and motion review). At most 3 at once: scaffold first; then design lead, app engineer and visualization engineer in parallel (the visualization engineer starts from the design lead's tokens and visual language draft); then QA; then review.
- **Deliverables:** `main-app/**`, `PRODUCT.md`, `DESIGN.md`, the Vercel project, `work/04-app/{p3-verification.md,spike-S2.md,design-review.md,containment/}`.
- **Exit:** `verify:full` green locally on the fixture content; all suites green on the Vercel preview; the first WMOJ automated verification run over the 119 stubs is recorded; reviewer signs off.
- **Manager checkpoint:** approve the look and feel **and the visual/animation style** on the live preview URL (the lesson fixtures and the `/dev/viz` gallery), plus the report screenshots and a short screen recording of a step-through. A redo is cheap here.

### P5 Voice, registry and pilot

- **Goal:**
  - **Style guide** with the teaching-voice sample: an agent drafts 400–600 words with avoid-ai-writing, and the phase pauses for the **Manager to approve or reject it** (D-030 Q-4; a rejection is redrafted before the pilot continues); all real `ui/strings.yaml` copy and `/start` and `/about` text in the voice.
  - **Registry:** all 119 entries (CCC 2014–2026 only, D-030 Q-7) with titles, topics, modules, aliases and subtask outlines; WMOJ re-verification; **the Manager-assisted DMOJ checklist**; `verified.json`.
  - **WMOJ-first mapping:** for every module, the candidate practice problems, WMOJ first, DMOJ with `why` (`work/05-pilot/problem-map.md`, then written into the briefs of P6–P8). Some modules may end up with no practice link.
  - **Judge language check:** which Python/PyPy options WMOJ and DMOJ offer (web check), for M0.7.
  - **Course data:** `course.yaml`, `glossary.yaml`, `concepts.yaml`, `style/house-skeleton.py`.
  - **Three pilots** (M1.1, M4.13, M6.1) with their visuals (§6.3) through the §6.2 pipeline; `thresholds.json`; prompt templates (author, reviewer, acceptance checklist) in `work/05-pilot/prompt-templates/`; tokens and time per module measured, and a changelog request recalibrating §2.2 and §11.5.
- **Entry:** P4 done and look approved; Q-2, Q-4, Q-7, Q-10, Q-19, Q-20 already ruled on by D-030 (this phase executes them; the voice sample still needs the Manager's live approve/reject of the drafted sample).
- **Read first:** §4.11, §5, §6, §7; the `/dev/viz` gallery and `DESIGN.md`; `curriculum-map.md` (Stage overview, M1.1, M4.13, M6.1, adjacency list); `w2-content-architecture.md` §2 (pedagogy evidence) only; `research/02-writing-style-skill/recommendation.md`; `.claude/skills/avoid-ai-writing/SKILL.md`.
- **Agents:** registry & data (Sonnet); voice & pilot author (Opus: style guide, UI copy, three pilots, one voice); pilot reviewer (Opus).
- **Exit:** pilots `accepted` with every gate green on the preview; `verified.json` `ok` for every problem (or waiting only for the Manager's DMOJ confirmation, which is listed); templates and calibration written.
- **HARD GATE:** the Manager reads the three pilots on the preview URL and **approves voice, format and visuals**. No content phase starts without this.

### P6–P8 Content phases

| Phase | Scope | Authors | Suggested author split |
|---|---|---|---|
| P6 Content A | Stage 0 (**M0.1, M0.4–M0.7**; M0.2 and M0.3 dropped, D-030 Q-19), Stage 1 (M1.2–M1.15), Stage 2 (M2.1–M2.9), C.1, C.2, C.10: **31 modules** | 4 Sonnet | A1: M0.1, M0.4–M0.7 + C.1 · A2: M1.2–M1.8 · A3: M1.9–M1.15 · A4: M2.1–M2.9 + C.2 + C.10 |
| P7 Content B | Stage 3 (M3.1–M3.10), Stage 4 (M4.1–M4.15 minus M4.13), C.3, C.4, C.6, C.7: 28 modules | 4 Sonnet | B1: M3.1–M3.7 · B2: M3.8–M3.10 + C.4 + C.6 + M4.1–M4.2 · B3: M4.3–M4.9 · B4: M4.10–M4.15 (not M4.13) + C.3 + C.7 |
| P8 Content C | Stage 5 (M5.1–M5.13), Stage 6 (M6.2–M6.13), Stage 7 (**M7.1–M7.14**; M7.14 kept, D-030 Q-10), C.5, C.8, C.9: **42 modules** | 5 Opus | C1: M5.1–M5.7 + C.5 · C2: M5.8–M5.13 + C.8 · C3: M6.2–M6.8 · C4: M6.9–M6.13 + M7.1–M7.3 · **C5: M7.4–M7.14 + C.9** |

The orchestrator may rebalance the split in its brief without changing the author count. M7.14 is written with no setup content and no scoring framing (D-030 Q-10; §5.3).

- **Entry:** previous phase done and approved; P5 hard gate passed. For P8, the first task re-checks any grader change for the latest CCC year and updates the registry.
- **Read first:** §4.11, §5, §6, §7; `work/05-pilot/prompt-templates/` (including the visual-authoring guide); the style guide and pilot modules; the `/dev/viz` gallery; the previous content phase's "lessons learned" in `defects.md`; this phase's ledger and `defects.md` if resuming.
- **Flow:** brief → calibration module alone → remaining modules (≤ 3 authors at once) → reviewer per batch → fixes → acceptance → cross-module continuity pass (the reviewer, continued) → `verify:full` → commit and push → preview suites → report assets.
- **Exit:** every module in scope `accepted` with its visuals; zero open defects; `verify:full` and preview suites green.
- **Manager checkpoint:** sample review on the preview (lessons and visuals). After approval, the main session merges to `main`, and production shows the new stages.

### P9 Review and release

- **Goal:**
  - A whole-course consistency review: terminology, prerequisite order, duplication, voice drift, R14, WMOJ preference, cross-links, **visual consistency (colour meanings, motion, captions) and coverage (no technique module without its step-through)**; plus a novice read of a sample from each stage. Findings fixed (engine bugs via §8.1).
  - Live link re-verification (WMOJ automated; the DMOJ checklist again if older than 90 days); G-LINK-EXT.
  - `verify:full`; Chromium, WebKit and a Firefox smoke on the preview with G-FLAKE burn-in; pixel review of every route template on the deployed site; Lighthouse budgets; the "no request leaves the origin" check; final G-CONTAIN audit.
  - Handoff: `README.md` (how the project is built, checked, deployed and maintained) and a check of `/start`.
- **Agents:** final reviewer (Opus: course consistency and visual review); release QA (Sonnet: suites, flakes, patch bumps, link runs, containment audit, README). Fixes are made by these two, continued with SendMessage.
- **HARD GATE:** final Manager acceptance; the main session merges to `main`; the orchestrator checks production with the E2E and visual suites.

### P10 Maintenance (on demand)

Link re-verification when the snapshot is older than 90 days; Next.js patch bumps; a check of the grader's Python version before each contest season (if it moves off PyPy 3.8, §4.5 is revisited through the changelog). **No CCC year past 2026 is ever added** (D-030 Q-9 is permanent, not a placeholder — a future Manager wish to extend past 2026 would need a new changelog entry overriding D-030, not a P10 run). Each run is **main → 1 worker (Sonnet)**, or main → orchestrator → at most 2 workers for bigger runs, with the same logging, commit and preview rules.

---

## 13. Context and resumption protocol

### 13.1 Who updates what

| File | Who | When |
|---|---|---|
| `progress.md` | Phase orchestrator | Phase start (IN PROGRESS, worker plan with models, branch); after every worker or batch (checklist line with output path); phase end (DONE, pointers, commit hash, preview URL) |
| `decisions.md` | Orchestrator appends; main session records Manager rulings | When a decision is made; `[MANAGER]` items under Pending Manager approval |
| `phase-logs/phase-NN-<name>.md` | Orchestrator | Phase end; on a redo rewritten, old version kept as `.v<k>` |
| `work/NN/ledger.generated.md` | `npm run content:status` only | After every status change |
| `work/NN/defects.md` | Orchestrator, reviewers | Defects (ID, item, severity, found by, status) plus "lessons learned" for the next phase |
| `implementation-plan.md` | Main session only, after Manager approval | Every change, with a changelog row |
| `00-START-HERE.md`, `operating-rules.md`, `project-brief.md`, `README.md` | Main session only | When the Manager changes process or requirements (D-030 Q-14) |

### 13.2 What makes a phase resumable

- Workers write files **before** returning; a return with no file counts as not done.
- Checklist lines name the output files.
- Modules carry `status` in their own YAML, so `content:status` rebuilds the ledger at any time.
- Briefs and prompt templates are files, so a replacement agent gets identical instructions.
- Git: the phase branch holds all committed work; the checklist records the last commit hash.
- PID files make stale servers discoverable.

### 13.3 Content ledger

`ledger.generated.md` (generated, never hand-edited): module, author model, status, gates, reviewer, open defect count. `defects.md` is hand-kept.

### 13.4 Redos and critiques

Per operating-rules §6: the old log becomes `.v<k>`; superseded artefacts go to `work/NN/_superseded/v<k>/` (previous module folders for content redos); the critique is recorded in `decisions.md` and `progress.md`; the redo addresses it explicitly in its log; the redo works on a new branch (§10.4). A redo of an early phase after content exists (for example the P4 look) lists and fixes its knock-on effects in the same phase (baselines, screenshots, tokens).

---

## 14. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| R-1 | Shown code uses a 3.9+ feature and fails on the grader | G-PY-38 static checks and `py_compile` under PyPy 3.8 on every artefact; M1.15 teaches the boundary. |
| R-2 | A shown code example is wrong (no in-app runner to catch it) | G-PY-RUN reproduces every example's output under PyPy 3.8 byte for byte; outputs never typed by hand; Opus authors and reviewer for Stages 5–7. No full CCC solutions are shown, so there is nothing to check against official data (D-030 Q-20). |
| R-3 | The learner is confused about how to run Python, since the app teaches no setup | The app never claims to teach setup (D-030 Q-19, `/start` says so plainly); this is an accepted scope boundary, not a defect to mitigate. |
| R-4 | WMOJ or DMOJ renames, removes or goes down | Verification + snapshot + release gate; P10 re-checks; no silent fallback; the Manager decides. |
| R-5 | Score framing leaks from recon | Leak list in every prompt; G-R14; reviewers; M7.14 written with no setup or scoring framing (D-030 Q-10). |
| R-6 | AI-sounding prose, much of it by Sonnet | Skill (warm + docs); calibrated detector and validator; agent-drafted voice sample the Manager approves (D-030 Q-4); Opus pilots as exemplars; Opus reviewer every content phase. |
| R-7 | Quality drift with fewer reviewers than v1 | Contiguous module runs per author; briefs; calibration module first; continuity pass; P9 whole-course review; the Manager's per-phase sample review on the preview. |
| R-8 | *(retired in v2.1)* Vercel previews were protected and automation couldn't reach them. Resolved: previews and production are both public, no protection, no bypass secret (D-030 Q-18). | — |
| R-9 | Local build differs from Vercel's | Same Node major; `npm ci` from the lockfile; phase exit tests the deployed preview, not just local. |
| R-10 | A token or secret gets committed to the repo | `.gitignore`, G-SECRETS before every commit, never in prompts or logs; private repo. No Vercel bypass secret exists (previews and production are both public, D-030 Q-18). |
| R-11 | `gh` login expires mid-project | Auth check at every phase end before pushing; the Manager re-logs in themselves. |
| R-12 | Containment leak through bare tool calls | Wrappers, npm-script guard, PreToolUse hook, backstop, session restart and verification. |
| R-13 | Flaky E2E, especially against a remote preview | Wait for the deployment to be ready; retry-free burn-in; zero tolerance; network-independent assertions. |
| R-14 | Baselines drift | Local fonts, pinned browsers, one machine, strict `maxDiffPixels`, Opus note for every update. |
| R-15 | Token cost of content phases | Sonnet for Stages 0–4; one reviewer per phase; P5 measurement and recalibration; spawn caps. |
| R-16 | CEMC licensing | Paraphrase, attribution, free app; no official CEMC test data is fetched or shipped at all (D-030 Q-20). |
| R-17 | The grader changes for CCC 2027 | P10 seasonal check; 3.8 rules live in one place (§4.5). |
| R-18 | Next.js security releases | Exact pins; patch bumps in P9 and P10; no server code to exploit. |
| R-19 | Session restarts break SendMessage continuation | §0.3 replacement rule; everything is file-based and committed. |
| R-20 | Visuals that are wrong, confusing or decorative | Traces recorded from the real code; declared consistency checks (G-VIZ); captions in the teaching voice; reviewer judges teaching value and rejects decoration; pilots set the bar. |
| R-21 | Visuals that are heavy, janky or inaccessible | Lazy hydration, server-rendered first frame, size and step budgets, long-task check, reduced motion, keyboard and screen-reader support, frame-level visual regression. |
| R-22 | Inconsistent look across ≈500 visuals by many authors | One library and one visual language in `DESIGN.md`; authors compose, never hand-draw; the gallery; P9 consistency review. |

---

## 15. Resolved questions

Every question v2.0 raised in this section is **resolved**. The Manager answered all of them in one pass as **D-030** (`context/decisions.md`), which this v2.1 amendment applies throughout the plan. **No open question remains.**

For what each answer was and where it changed the plan, read `decisions.md` → D-030, and §1.2 above (the full per-question mapping to plan sections). Resolved: P2-B (plan approved), Q-2 (subtasks), Q-4 (voice sample), Q-7 (practice scope), Q-9 (2027+ permanently rejected), Q-10 (M7.14 kept), Q-13 (traces acknowledged), Q-14 (process-file edits, this amendment), Q-15 (avoid-ai-writing on workspace Node), Q-17 (repo specifics), Q-18 (Vercel), Q-19 (no setup content), Q-20 (no walkthroughs/hints), Q-21 (no custom visual inputs). Also resolved by D-020 in v2.0 and still resolved: Q-1, Q-3, Q-5, Q-6, Q-8, Q-11, Q-12, Q-16, and every runner/grader/exercise question from v1.

If a future need reopens any of these, it is recorded as a new decision with its own ID, not by reopening this section.

---

## 16. Reference index

| Topic | File |
|---|---|
| Curriculum spec | `research/01-recon/curriculum-map.md` |
| Grader Python, fast I/O, 3.8 traps | `research/01-recon/python-for-ccc.md` |
| Past problems | `research/01-recon/past-problems-analysis.md`, `research/01-recon/_working/w2-junior-problems.md`, `w3-senior-s1-s3.md`, `w4-senior-s4-s5.md` |
| Contest format and rules | `research/01-recon/ccc-format-and-rules.md` |
| Impeccable research | `research/01-recon/design-skill-recommendation.md` |
| avoid-ai-writing research | `research/02-writing-style-skill/recommendation.md` |
| Stack research (v1) | `research/03-plan/_working/w1-tech-stack.md` (§1, §2, §6–§8 still relevant; runtime sections obsolete) |
| Content architecture (v1) | `research/03-plan/_working/w2-content-architecture.md` (§2 pedagogy evidence still relevant; exercise/progress sections obsolete) |
| Containment mechanics | `research/03-plan/_working/w3-containment.md` |
| Links and QA | `research/03-plan/_working/w4-links-and-qa.md` (Part A still authoritative for WMOJ/DMOJ behaviour) |
| v1 plan and critique | `context/implementation-plan.v1.md`, `research/03-plan/_working/w5-critique.md` |
| Phase 2 log | `context/phase-logs/phase-02-plan.md` (v1: `phase-02-plan.v1.md`) |

### 16.1 Where this plan overrides the research

| File, section | Research says | Plan decides |
|---|---|---|
| w1 (all runtime sections), w2 §3.4–§4 | Pyodide runner, editor, exercises, test specs, progress DB, review | **Removed** (D-020) |
| w1 §2.3 | Static export; hosting options | Regular Next.js SSG on **Vercel** (§4.1) |
| w1, w3 | Node 26.x workspace tarball | Workspace tarball of **the Node major Vercel builds with** (§4.2, S-1) |
| w3 §6, w1 §4.2 | uv; PyPy 7.3.9 under Rosetta | PyPy 3.8 v7.3.11 arm64 tarball only; no uv, no Rosetta (§4.2) |
| w3 §4 | Playwright Chromium only | Chromium + WebKit; Firefox smoke at release (§4.2) |
| w3 §2 | `env.sh` sourced before commands | Wrappers + npm-script guard + PreToolUse hook + settings env (§9.2) |
| w3 §8 | Detector via `bin/…` with `--voice warm --context docs` | Detector imported from `detector/patterns.js`; warm/docs are skill-invocation profiles (§6.3) |
| w3 §10 | Contained local git with a set identity | Private GitHub repo via the existing `gh` login; the Manager's identity; no global changes (§10) |
| w4 A2–A3, D-008 | WMOJ for 2020–2026; 2020 exception | **2021–2026 → WMOJ, ≤ 2020 → DMOJ**, WMOJ preferred (§4.7, D-020) |
| w4 A3 | DMOJ verification with a headless browser past Cloudflare | Manager-assisted checklist; no circumvention (§4.7) |
| w4 B1 | Visual baselines in Docker; `maxDiffPixelRatio` 0.01 | Baselines on this Mac; `maxDiffPixels` ≤ 50 (§7) |
| w2 §5.4, §9 Q6 | Keep M7.14 as optional | **Kept**, with no setup content and no scoring framing (D-030 Q-10, §5.3) |
| w2 §1.6 | Defer local-setup lessons | **Dropped entirely**: no system/environment setup content of any kind (D-030 Q-19, §5.3) |
