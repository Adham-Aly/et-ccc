# Decisions

Entry format:

```
### D-NNN — <title>
- Date: YYYY-MM-DD
- Phase: <phase>
- Decided by: Manager | main session | <orchestrator>
- Decision: ...
- Rationale: ...
```

## Pending Manager approval

_(none — all v2.0 questions answered 2026-09-23, see D-030)_

## Decided

### D-005 — Design skill: Impeccable (fallback: Anthropic `frontend-design`)
- Date: 2026-09-21
- Phase: 1
- Decided by: recon-orchestrator (recommendation only; NOT installed)
- Decision: Use **Impeccable** (`pbakaus/impeccable`, skill v4.3.1, Apache-2.0) as the single design skill, installed later at project scope only per `research/01-recon/design-skill-recommendation.md` (pin version; set `IMPECCABLE_HOME` inside the workspace so nothing is written to `~/.impeccable`; enforce light mode via PRODUCT.md/DESIGN.md/CLAUDE.md). Fallback if the Manager prefers no third-party code/binaries: Anthropic's official `frontend-design`.
- Rationale: Only candidate that persists a shared design record (PRODUCT.md/DESIGN.md) across sessions → consistency across many lesson pages; has reading-page mode, typography/accessibility commands and an automated contrast/drift checker. Caveats: heavy, fast-moving, engine download, hooks.

### D-006 — Target framing: 75/75 goal, ~63–68 realistic in Python
- Date: 2026-09-21
- Phase: 1
- Decided by: recon-orchestrator (proposal)
- Decision: Curriculum covers everything needed for 75/75, but tells the learner honestly that some S5 problems are likely infeasible in Python and that full S1–S4 + S5 partials is the realistic ceiling.
- Rationale: CEMC itself states a perfect score may not be possible in Python; nobody scored 75 in 2026.

### D-005 ruling — APPROVED by Manager (2026-09-21), with total-containment condition
- Use **Impeccable**. It is **not yet installed**; a later orchestrator installs it only when the main session instructs.
- **Total containment (non-negotiable):** the skill, its engine/binaries, packages, caches, config, hooks, state — everything — must live inside this workspace. Deleting the workspace folder must remove 100% of it with zero traces anywhere else on the machine (no `~/.impeccable`, no `~/.claude/`, no global npm/pip/brew, no global caches, no shell profile edits). The installer must verify this (e.g. check home dir and global locations before/after) and document it. See `operating-rules.md` §7.

### D-006 ruling — REJECTED by Manager (2026-09-21)
- **No score target anywhere in the app.** Do not mention 75/75, "realistic ceiling", expected scores, or Python-infeasibility framing to the student. The app stays focused on learning. (Recon deliverables still contain this material; it is for agents only and must not surface in app content.)

### D-008 — Problem links: WMOJ for 2020–2026, DMOJ for pre-2020 (Manager, 2026-09-21)
- **Status: year bands SUPERSEDED by D-020** (2021–2026 → WMOJ; 2020 and earlier → DMOJ; WMOJ preferred). URL formats and slug rule still apply.
- Applies to the **entire application** — every CCC problem and practice problem link.
- CCC problems from **2020–2026 inclusive** → **wmoj.ca**. Format: `https://wmoj.ca/problems/ccc25j1` (note: `/problems/`, plural, no trailing slash).
- CCC problems **before 2020** (not on WMOJ) → **dmoj.ca**. Format: `https://dmoj.ca/problem/ccc19s1/` (note: `/problem/`, singular, trailing slash).
- Slug: `ccc` + 2-digit year + `j`/`s` + problem number (e.g. `ccc25j1`, `ccc19s5`). Some DMOJ/WMOJ problems have variant slugs (e.g. split parts); verify slugs exist before shipping.
- See `project-brief.md` R13.



### D-001 — Workspace structure and agent process
- Date: 2026-09-21
- Phase: 0
- Decided by: Manager (requirements), main session (layout)
- Decision: Layout in `README.md`; process in `operating-rules.md`. All agents Opus 5; workers never spawn subagents; context lives in files; plain-language HTML report to `~/Desktop` after every phase, never published.
- Rationale: Keep the main session lean and make long-running work resumable after interruption.

### D-002 — Stack and theme
- Date: 2026-09-21
- Phase: 0
- Decided by: Manager
- Decision: Next.js app in `main-app/`, light mode only. Learner's contest language is Python.

### D-003 — Research is web-verified; prior knowledge is presumed stale
- Date: 2026-09-21
- Phase: 0 (applies to all research)
- Decided by: Manager
- Decision: Recon-orchestrator and all research workers must web-search extensively and assume their prior knowledge about the CCC is outdated/wrong.
- Rationale: CCC format and difficulty have changed a lot over time.

### D-004 — Course code targets Python 3.8 (PyPy3 7.3.9) only
- Date: 2026-09-21
- Phase: 1
- Decided by: recon-orchestrator
- Decision: All teaching code, examples and exercises must run on Python 3.8 as run by PyPy3 7.3.9 (the CCC Online Grader's "Python 3", verified via cccgrader.com/sample_soln.pdf, still current at CCC 2026). No 3.9+ features (`math.lcm`, `functools.cache`, `list[int]`, `bisect key=`, `match`). Iterative DFS is the default; fast I/O is taught from the Junior level.
- Rationale: Code using newer features fails on the official grader; grader limits (3 s / 512 MB default) have no Python multiplier.

### D-007 — Curriculum structure = `research/01-recon/curriculum-map.md`
- Date: 2026-09-21
- Phase: 1
- Decided by: recon-orchestrator
- Decision: 105 modules (M0.1–C.10) in Stages 0–7 plus a contest-skills track, with prerequisite IDs and practice sets, is the content spec for later build phases.
- Rationale: Covers absolute zero → S5, cross-checked by a 2019–2026 Senior coverage matrix.

### D-009 ruling — avoid-ai-writing APPROVED by Manager (2026-09-23)
- Use **avoid-ai-writing** (`conorbronsdon/avoid-ai-writing`, pin v3.35.0, commit `fc979c6489ec0ac81a77236782ba496da81b24cb`, MIT) as the single anti-AI-writing skill, instead of Humanizer. Token cost is explicitly not a concern for the Manager.
- Not yet installed. Install only when the main session instructs, fully contained per `operating-rules.md` §7: copy the pinned skill folder into the workspace `.claude/skills/`; run its Node detector/validator scripts with the system `node` from inside the workspace; never use `npx`, `npm -g`, its MCP server, or the user-scope plugin route.
- Use its `warm` voice + `docs` context profiles, plus a workspace style guide with a hand-written teaching-voice sample that overrides its blog/social-post tone advice.
- Pilot on 2–3 sample lessons before mass content production; tune if prose comes out clipped or opinionated.
- Details: `research/02-writing-style-skill/recommendation.md` (runner-up section).

### D-010 — Model policy for subagents (Manager, 2026-09-23)
- Supersedes the "all Opus 5" rule in D-001. Spawned agents at every tier use **only Opus 5.5 or Sonnet 5**, chosen per task to balance output quality against cost. The per-phase assignment is defined in `context/implementation-plan.md`.

### D-011 — Implementation plan is the single source of truth (Manager, 2026-09-23)
- `context/implementation-plan.md` defines the entire end-to-end build and agent orchestration. What gets done, and what does not, depends solely on it. Changes require Manager approval and a changelog entry in the plan.


### D-012: Implementation plan v1.0 written (pending Manager approval)
- **Status: SUPERSEDED by D-022** (plan v1.0 rejected by the Manager in D-020).
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision: `context/implementation-plan.md` v1.0 defines the build from P3 to P19 (maintenance), the agent orchestration, the quality gates and containment. It was revised after an independent Opus critique (`research/03-plan/_working/w5-critique.md`).
- Rationale: D-011.

### D-013: Static export, local-first, no backend
- **Status: SUPERSEDED by D-020 / D-023.** No static export, no IndexedDB progress, no export/import; regular Next.js SSG on Vercel. "No backend, no accounts, no telemetry" still holds.
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision: Next.js static export (`output: 'export'`). Progress is stored in IndexedDB behind a `ProgressStore` interface, with JSON export/import and a backup reminder. No accounts, server, DB or telemetry. Hosting is a Manager choice (Q-5).
- Rationale: A single learner. Python runs in the browser either way. There is no attack surface or ops, and it costs nothing.

### D-014: Stack pins and workspace Node
- **Status: AMENDED by D-020 / D-023.** Pyodide, CodeMirror, idb, uv and PyPy 7.3.9 removed; Node major must match Vercel's build image (not 26.x by default); Motion and d3-hierarchy added (D-021). Current pins: plan v2 §4.2.
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  - App: Next.js 16.3.6, React 19.3.0, TypeScript 6.0.3, Tailwind 4.3.3, shadcn on Base UI 1.8.0, CodeMirror 6, MDX via `@mdx-js/mdx` 3.1.1 + Zod 4.6.5, Shiki 4.4.3, idb, MiniSearch.
  - Tests and tooling: Vitest 5.0.1, Playwright 1.63.0 (all 3 engines), axe 4.13.0, Biome 2.5.14, linkinator, LHCI (filesystem upload only).
  - Python: Pyodide 314.0.7; PyPy 3.8 7.3.11 plus 7.3.9 (Rosetta).
  - Node is a workspace-local 26.x tarball; Homebrew Node is never used.
  - Details: plan §4.2.
- Rationale: Versions verified on 2026-09-23 (W1). ESLint 9 has reached end of life. next-mdx-remote is archived. Homebrew Node 26.0.0 is unpatched.

### D-015: Python 3.8 enforcement in three layers
- **Status: SUPERSEDED by D-020 / D-025.** Layers 1 and 2 (in-browser check, runtime shim) are gone with the runner; only authoring-time checks remain (plan v2 §4.5).
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  1. In-browser static check (`ast` feature_version, vermin, custom `compat38.py`). Errors block Submit but not Run; warnings are advisory.
  2. Runtime shim that removes 3.9+ library APIs.
  3. Authoring gate: ruff py38, vermin, and every reference solution run under PyPy 3.8 and in Node Pyodide. Exact PyPy 7.3.9 at stage acceptance and release.
- Rationale: No maintained Python 3.8 or PyPy runs in the browser. Each layer catches gaps the others miss (W1 measured matrix).

### D-016: Problem registry and link verification
- **Status: AMENDED by D-020 / D-024.** Registry, `judgeUrl()`, lints, snapshot and verification methods kept; the 2020 exception is gone (2020 → DMOJ by rule); WMOJ-first selection added.
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  - A single registry (`content/registry/ccc-problems.yaml`, 119 unique problems). URLs come only from `judgeUrl()`.
  - Lints: G-LINK-FMT, G-LINK-REF, and no raw judge URLs.
  - A committed `verified.json` snapshot is a release gate.
  - WMOJ is verified automatically by checking page content, because it returns 200 for missing problems. DMOJ is verified through a Manager-assisted checklist, with no Cloudflare circumvention.
  - Crossover problems use the Senior slug.
  - The CCC 2020 exception is pending (Q-1).
- Rationale: R13 is critical. W4's live checks found the WMOJ 2020 gap and the crossover slugs.

### D-017: Orchestration model
- **Status: SUPERSEDED by D-020 / D-027.** 7 phases, ≤ 3 concurrent workers, about 41 spawns in total; no per-stage content phases, no swarm approvals.
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  - Tiers: main, then phase orchestrator (Opus), then workers. No third tier.
  - Content is produced in one phase per curriculum stage (P9–P16).
  - Models are assigned per role in plan §11.2: Opus for judgment, teaching prose, hard algorithms and review; Sonnet for specified or mechanical work that is checked downstream.
  - Every spawn passes an explicit `model`, and `fork` is never used.
  - At most 5 concurrent workers.
  - The content phases and the audit need Manager swarm approval. The Workflow tool is not used.
- Rationale: Per-stage phases give stage coherence without unverified 3-level nesting or changes to operating-rules. They also give a Manager checkpoint per stage.

### D-018: Containment enforcement model
- **Status: still valid, AMENDED by D-028** (gh/git wrappers, guard also blocks global git/gh config writes; no Rosetta).
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  - All tool state lives in `.tooling/`.
  - Tools are called only through the `.tooling/bin/*` wrappers or `npm run`. An `assert-contained` guard runs in every npm script, and a PreToolUse hook rejects bare tool calls.
  - The `.claude/settings.json` env block uses literal paths.
  - The session restarts after P3, followed by a fresh-subagent verification.
  - Every install or first run needs a before/after snapshot plus a backstop sweep. A trace named after a project tool is a hard fail. An explicit allow-list covers system and harness noise.
- Rationale: Each Bash call is a fresh shell, and global uv and Homebrew node are already on PATH, so sourcing `env.sh` alone would leak (W5 BL-2).

### D-019: Content contract and pipeline
- **Status: SUPERSEDED by D-020 / D-026.** No exercises, PRIMM blocks, checkpoints, mastery, Leitner review, drills or problem pages; the reading-app content model and pipeline are in plan v2 §4.6 and §6.
- Date: 2026-09-23
- Phase: 2
- Decided by: planning-orchestrator
- Decision:
  - The content model is W2's (MDX + YAML/Zod + `.py`, a fixed component map, stable IDs), with the plan's overrides:
    - committed deterministic facts;
    - timing kept separately under G-TIMING;
    - registry-only pages for all 119 problems from day one;
    - error-explainer and UI-string files.
  - Pedagogy: PRIMM-style lessons with fading support; problem-first from Stage 5.
  - Progress: mastery checkpoints, soft prerequisites, Leitner review, drills with no time goals.
  - Workflow: a 3-lesson pilot, then per-item author → verifier → critic → acceptance.
  - The contract is frozen in P8.
- Rationale: Everything checkable is derived by the build. The approach is backed by CS-education evidence (W2).

### D-020 — Manager critique of plan v1.0 → plan v2 redo (Manager, 2026-09-23)
Plan v1.0 (archived: `context/implementation-plan.v1.md`) misread the app's purpose. Rulings, which override D-013, D-015, D-017, D-019 and any v1 content that conflicts:
1. **Purely a learning/reading app.** No built-in judge, no grading, no code execution of any kind (no in-browser Python, no Pyodide, no runner).
2. **No in-house exercises, quizzes, tests or autograding at all.** The only practice is external links to CCC problems on WMOJ/DMOJ. Gut all interactive-learning machinery built around exercises.
3. **Deployed on Vercel** as a regular Next.js app. Nothing runs on the learner's machine. The app should be lean.
4. **Problem links (supersedes D-008 years):** WMOJ has CCC problems from **2021 onward** (2021 is the earliest year on WMOJ). **2021–2026 → WMOJ** (`https://wmoj.ca/problems/<slug>`); **2020 and earlier → DMOJ** (`https://dmoj.ca/problem/<slug>/`). Prioritize WMOJ problems wherever a WMOJ problem fits. This resolves plan-v1 Q-1.
5. **Version control:** create a **private GitHub repo with the `gh` CLI**. Recorded in the plan only; do not create it until the plan's phase says so.
6. **Agent orchestration must be far more conservative and much smaller in scale** than v1, to fit the Manager's quota.

### D-021 — Extensive visuals and animations (Manager, 2026-09-23, during the Phase 2 redo)
- Decided by: Manager
- Decision: The app must extensively use visuals, animations and visualization tools wherever they aid learning, with the same high UI/UX standard as the rest of the app. Incorporated into plan v2.0 §4.11 and throughout.

### D-022: Implementation plan v2.0 written (pending Manager approval)
- Date: 2026-09-23
- Phase: 2 (redo)
- Decided by: plan-reviser
- Decision: `context/implementation-plan.md` v2.0 replaces v1.0 in full. It answers every point of D-020 (plan §1.1) and adds D-021. Phases P3–P9 plus on-demand P10.
- Rationale: D-011, D-020, D-021.

### D-023: Regular Next.js SSG on Vercel, no backend
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser
- Decision: App Router, every route prerendered (`generateStaticParams`, `dynamicParams = false`), no API routes, middleware, ISR or database; not `output: 'export'`. Vercel Git integration set up by the Manager in the dashboard (no Vercel CLI); preview per branch, production from `main`; production shows only accepted modules, previews show drafts. Local Node matches Vercel's build major. Details: plan §4.1, §4.2.
- Rationale: A read-only app for one learner needs no server; SSG on Vercel keeps headers working with zero ops.

### D-024: Links, registry and WMOJ-first selection
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser (applying D-020)
- Decision: `judgeUrl()`: 2021–2026 → WMOJ (56 problems), 2020 and earlier → DMOJ (63 in 2014–2020), later years a build error. Practice and walkthrough problems are chosen WMOJ-first; a DMOJ pick needs a `why` when a WMOJ problem for the module exists (G-LINK-PREF). Crossovers use the Senior slug. Verification: WMOJ automated by content check, DMOJ by Manager checklist; committed `verified.json` is a release gate. Practice is external links only.
- Rationale: D-020 rulings 2 and 4; W4's live findings.

### D-025: Python 3.8 correctness at authoring time only
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser
- Decision: Every shown Python artefact passes ruff (py38), vermin and `py_compile` under PyPy 3.8 v7.3.11; shown outputs are generated by PyPy 3.8 and committed; shown full CCC solutions pass official CEMC data (local only, never committed) or a reviewed stress test. PyPy 7.3.9/Rosetta and uv dropped.
- Rationale: The learner submits on PyPy 3.8; with no runtime in the app, the only place to enforce this is authoring.

### D-026: Reading-app content model and pipeline
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser
- Decision: MDX + YAML/Zod + `.py`, fixed component map (text, code, links, visuals). Only client features: search, mark-as-read (one localStorage key), copy button, mobile nav, visual players. Module pipeline: author (contiguous module runs) → gates → one Opus reviewer per phase → fixes → orchestrator acceptance. Pilots M1.1, M4.13, M6.1, Manager-approved before content phases. Details: plan §4.6, §4.8, §6.
- Rationale: D-020 removes all exercise machinery; one reviewer per phase replaces v1's per-batch verifier and critic.

### D-027: Conservative orchestration
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser (applying D-020 ruling 6)
- Decision: main → orchestrator → workers only; ≤ 3 concurrent workers; no swarms, no Workflow tool, no fork. 7 phases (P3 Setup, P4 App, P5 Pilot, P6–P8 Content A/B/C, P9 Release) plus on-demand P10. About 41 spawns in total (19 Opus, 22 Sonnet; cap 48) vs about 294 in v1. Sonnet writes Stages 0–4; Opus writes Stages 5–7 and the pilots, reviews every content phase, and designs the app and visualization system. Details: plan §11.
- Rationale: The Manager's quota.

### D-028: Private GitHub repo via the existing `gh` login; Vercel via dashboard
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser (applying D-020 ruling 5)
- Decision: P3 step 1 creates the private repo with `gh repo create <name> --private --source=. --remote=origin --push` after auth checks. `gh` is already logged in (keyring, `repo` scope) and global git already uses gh's credential helper, so no global changes are made; `gh auth login/setup-git` and `git config --global/--system` are blocked by the guard hook. `gh` cache/state is redirected into `.tooling/xdg/`. Phase branches push to Vercel previews; `main` merges only after Manager approval. **NOT YET EXECUTED.** Details: plan §10.
- Rationale: D-020; no global side effects (R12, R15).

### D-029: Visualization system
- Date: 2026-09-23 · Phase: 2 (redo) · Decided by: plan-reviser (applying D-021)
- Decision: An in-house SVG visualization library (nine visualizers, shared player, code tracer, concept scenes) with Motion for animation and d3-hierarchy for tree layout. All animation data is recorded at authoring time by running the real Python under PyPy 3.8 (`sys.settrace` tracer and a `vizrec` recorder), committed, validated by Zod, and checked by G-VIZ; nothing executes in the browser. One visual language in `DESIGN.md`; reduced motion, keyboard and text alternatives required; frame-level visual regression. At least one step-through per Stage 3–7 technique module and code tracers throughout Stages 0–2. Details: plan §4.11.
- Rationale: D-021, within D-020's no-execution rule.


### D-030 — Manager answers to all plan v2.0 open questions (Manager, 2026-09-23)
- **P2-B:** Plan v2.0 APPROVED as the single source of truth, amended by the answers below (→ v2.1).
- **D-021 visuals:** CONFIRMED by the Manager. Keep extensive visuals/animations.
- **Q-17 repo:** private repo `et-ccc`; the Manager's existing global git identity, used read-only; each phase is committed and pushed on its phase branch at phase end and before any redo, merged to `main` only after Manager approval of the phase.
- **Q-13 traces:** ACCEPTED as recommended. The Playwright browser bundle records, TMPDIR leftovers, Claude Code session files, and read-only use of the existing `gh` login and git config are system/harness/Manager-owned.
- **Q-14 process-file edits:** APPROVED. Update `operating-rules.md`, `00-START-HERE.md` and `project-brief.md` to match the plan.
- **Q-15:** APPROVED. avoid-ai-writing runs on the workspace-local Node.
- **Q-18 Vercel:** personal (Hobby) account; **previews and production both public** (no preview protection, no bypass secret).
- **Q-21 visuals input:** presets only, 2–3 authored presets per visual, recorded from the real Python. No custom input.
- **Q-19 setup:** the app contains **no system/environment setup content at all**: no Windows/macOS/Linux/online-editor setup, no installing Python/PyPy/Thonny. Lessons go straight into learning. Remove any setup modules/lessons from scope.
- **Q-20 solutions:** **no problem walkthroughs or editorials at all**, and no per-problem hints. Lessons teach concepts and link CCC problems; that's it. The app never mentions solutions/walkthroughs or that the learner should find them elsewhere. Keep the app lean, minimal development cost/overhead.
- **Q-2 subtasks:** allowed, one problem at a time, when teaching partial-marks strategy. Never totals, cutoffs or goals.
- **Q-4 voice sample:** an agent drafts the 400–600-word sample using avoid-ai-writing; the Manager approves or rejects it.
- **Q-7 practice scope:** **only CCC 2014–2026 problems.** Some modules may have no practice link. No pre-2014, no non-CCC problems.
- **Q-10 M7.14 C++ bridge:** KEEP it (Manager overrode the recommendation). Being a C++ module, it must not include any environment/setup content (per Q-19) or scoring framing (R14).
- **Q-9 CCC 2027+:** N/A. 2026 is the latest year the app will ever link. The build rejects years after 2026.

### D-031 — Plan v2.1 written
- Date: 2026-09-23
- Phase: 2 (amendment)
- Decided by: plan-amender
- Decision: `context/implementation-plan.md` v2.1 applies every D-030 answer throughout the plan (architecture, content model, curriculum scope, phases, agent budgets, quality gates, risks and §15), in place over v2.0. Curriculum modules: 105 → 104 (M0.2/M0.3 dropped, M7.14 restored). Agent estimate recomputed: unchanged at 41 spawns (19 Opus, 22 Sonnet), cap 48. §15 is now a short "Resolved questions" pointer to D-030, with no open items. Process files (`operating-rules.md`, `00-START-HERE.md`, `project-brief.md`, `README.md`) updated to match (D-030 Q-14).
- Rationale: D-011 (the plan needs a changelog entry and Manager approval for every change); D-030 is that approval, given in advance as answers to every open question.

### D-032 — Manager go-ahead: execute plan v2.1 end to end (Manager, 2026-09-23)
- Date: 2026-09-23
- Phase: all (P3–P9)
- Decided by: Manager
- Decision: "complete the plan, end to end. implement everything it outlines fully, from the first to the last steps ... taking pauses to ask me things if it ever needs it, or if something arises that needs me, between phases - otherwise it is totally fine if the work finishes without my input at all." This is the launch authorisation for every phase and the **install authorisation** for P3 (Node, PyPy 3.8 + tools venv, both skills, private repo `et-ccc`) and P4 (npm deps in `main-app/`, Playwright browsers, Lighthouse), all under §9 containment. Manager gates in the plan (session restart after P3, Vercel link, look & feel, voice/pilot approval, DMOJ checklist, final acceptance) still pause for the Manager; the main session asks at those points.

### D-032-A1 — Hard cap: at most 3 worker spawns per phase (Manager, 2026-09-23)
- Date: 2026-09-23
- Phase: P4 onward (P3 already within it: 1 worker)
- Decided by: Manager
- Decision: "future phases are each capped at exactly 3 subagent spawns each, and no more" — clarified by the Manager: the orchestrator is not counted; it may spawn **at most 3 workers per phase**; the Manager report agent is separate. No contingency spawns above 3; lost workers are replaced only from the same 3, otherwise the orchestrator finishes the work or asks the Manager. Plan amended to **v2.2** by the main session: P4 = app & QA engineer (Sonnet), design lead (Opus), visualization engineer (Opus), with the orchestrator doing the review; P6/P7/P8 = 2 authors + 1 Opus reviewer each (longer contiguous runs, continued via SendMessage); P5 and P9 unchanged. Total ≈32 spawns (was 41). `operating-rules.md` §2 updated.
- Rationale: the Manager judged P3's usage excessive and wants a strict ceiling on agent usage.

### D-033 — Local Node pinned to v24.21.0 (SPIKE S-1 result)
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: Vercel builds and Functions support Node 24.x (default), 22.x and 20.x; 26.x exists only on Vercel Sandboxes; 20.x is deprecated on 2026-10-01. The workspace Node is the official `node-v24.21.0-darwin-arm64` tarball (SHA-256 checked) in `.tooling/node/`. P4 sets `"engines": { "node": "24.x" }` in `main-app/package.json`. Evidence: `work/03-setup/spike-S1.md`.
- Rationale: Plan §4.2 / R-9: local builds must use the same major as Vercel's build image.

### D-034 — Containment proof tooling and allow-list policy
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: `.tooling/bin/contain-snapshot before|after|diff|classify` implements plan §9.4: stat snapshots of 56 watched global locations, then a backstop `find $HOME -newer marker` (pruning the workspace case-insensitively, `~/Library/CloudStorage` and `~/.Trash`). Every changed path is classified: tool-named paths hard-fail. Three narrow exemption classes exist, each documented with a reason. (a) `collision`: Apple-owned names that contain a tool token, e.g. `~/Library/Biome` or the system WebKit caches. (b) A **content-verified** harness exemption: `~/.npm/_logs/*-debug-0.log` passes only when the log proves it is Homebrew npm running exactly `npm --global config get prefix`. That is the Claude Code harness's periodic probe, seen at 22:01 before P3 began. (c) The `allow` globs for OS, harness and the Manager's own apps. Everything else fails. The idle calibration run and the P3 run both PASS.
- Rationale: A raw `find -newer` over `$HOME` returns hundreds of OS/browser/harness writes per minute, so without a precise allow-list the proof could never be clean. Hard-fail-first ordering means no allow-list entry can hide a write that is named after one of our tools.

### D-035 — Wrappers and guard scope
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: Wrappers `.tooling/bin/{node,npm,pypy38,ruff,vermin,pw,gh,git}` (plan §9.2) plus `impeccable`, `tools-pip` (tools venv only), `check-secrets` (G-SECRETS), `contain-snapshot` and `guard-test`. Each wrapper sources `env.sh` and refuses to run a binary whose realpath is not under its expected prefix. The wrappers also refuse dangerous forms themselves, as defence in depth: `npm -g`, `npm exec` without `--no`, `gh auth login|logout|refresh|setup-git|switch|token`, `gh config set`, gh extensions and aliases, `git config --global|--system`, `--no-verify`, and force or delete pushes. The PreToolUse guard (`guard-bash`, system perl, no project tool) lexes each command into segments, so quoted arguments and quoted heredoc bodies are never commands. It blocks bare project tools in any command position (including inside `$( )`, backticks, `bash -c` and `eval`), **including bare `git` and `gh`**, as `00-START-HERE.md` requires. Regression battery: `.tooling/guard-cases.tsv`, run by `.tooling/bin/guard-test`.
- Rationale: Plan §9.2, R-12. Bare `gh` would miss the XDG cache redirect; bare `git` is harmless but inconsistent with the "wrappers only" rule. Finding: the harness hot-loaded `.claude/settings.json` hooks mid-session (the env block still needs the restart). The first guard version falsely blocked a quoted heredoc, which led to the lexer rewrite and the battery.

### D-036 — `.gitignore` additions beyond plan §10.3
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: Also track `.tooling/npmrc`, `.tooling/requirements-tools.txt` and `.tooling/guard-cases.tsv` (config and tests needed to rebuild and verify the tooling from a clean clone). Also ignore `.claude/settings.local.json`, `.impeccable/config.local.json`, `.impeccable/hook.cache.json`, `.impeccable/hook.pending.json` and `*.tsbuildinfo` (machine-local or generated).
- Rationale: A fresh clone must be able to reproduce the exact tool setup; local caches must never be committed.

### D-037 — Impeccable installed at project scope, hooks in `.claude/settings.json`, no subagent definitions
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: skill-v4.3.1 (commit `cd12f866`) copied from the tag tarball into `.claude/skills/impeccable/`; the engine 0.1.5 was downloaded by its own checksum-verifying launcher into `IMPECCABLE_HOME=.tooling/impeccable-home`. The PostToolUse(Edit|Write) and Stop hooks use the upstream launcher command, so the engine's hook detection recognises them, prefixed with `export IMPECCABLE_HOME=… IMPECCABLE_NO_TELEMETRY=1`. They live in the project `.claude/settings.json` (upstream uses `settings.local.json`; the engine accepts either). `.impeccable/config.json`: hook enabled and consent accepted; `context/`, `research/`, `work/`, `manager-reports/`, `.tooling/` and `.claude/` are ignored by the detector. Telemetry is off via `IMPECCABLE_NO_TELEMETRY=1` and `DO_NOT_TRACK=1`. The upstream `.claude/agents/impeccable-*.md` subagent definitions were **not** installed.
- Rationale: Plan §9.5. Workers must never spawn subagents (rules §2), so the skill must do its asset, doc and review flows inline.

### D-038 — Python toolchain and the G-PY-38 split
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: PyPy 3.8 v7.3.11 arm64 (native, no Rosetta). The tools venv is built from it, with ruff 0.16.8 and vermin 1.8.0 installed through `pip --require-hashes --only-binary=:all:` against PyPI digests (`.tooling/requirements-tools.txt`). Finding for P4: vermin running on PyPy 3.8 cannot parse 3.9+ syntax; it prints "Not enough evidence" and **exits 0**. G-PY-38 therefore treats `py_compile` under PyPy 3.8 as the syntax gate and vermin as the API gate, fails if either fails, and its `bad38` fixture covers both. ruff 0.16's defaults include `I` and `YTT` rules even with `--isolated`, so P4 must configure ruff's rules explicitly.
- Rationale: Plan §4.5 and D-025. A gate that silently passes 3.10 syntax would defeat R-1.

### D-039 — Containment incident: pip wrote to the Manager's `~/Library/Caches/pip` (remediated)
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: The first `pip install` into the tools venv was run as `.tooling/venvs/tools/bin/python -m pip`, bypassing `env.sh`. pip therefore used its default cache and wrote 6 files and 20 directories into the Manager's pre-existing `~/Library/Caches/pip`. Remediation: every entry born after the phase marker was removed; the recorded mtimes of `http/` and `selfcheck/` were restored from the before snapshot; one pre-existing dir mtime was reset to its birth time. Net trace: one stale HTTP cache entry that pip had replaced in place is gone from the Manager's pip cache (a cache, not state). Prevention: the `.tooling/bin/tools-pip` wrapper (asserts the pip redirects); the guard blocks bare or direct `pip`/`python`; the re-run through the wrapper cached in `.tooling/xdg/cache/pip`. Log: `work/03-setup/containment/pip-cache-cleanup.txt`.
- Rationale: Operating-rules §7 requires every trace to be proved or disclosed. This one is disclosed, and its cause is fixed.

### D-040 — G-STYLE import form for avoid-ai-writing
- Date: 2026-09-23
- Phase: 3
- Decided by: setup-orchestrator
- Decision: avoid-ai-writing v3.35.0 @ `fc979c6` is installed at `.claude/skills/avoid-ai-writing/`, with the full tarball in `.tooling/avoid-ai-writing-src/`. `detector/patterns.js` and `validate.js` are CommonJS with a **static** API. `tools/style/detect.mjs` (P4/P5) must therefore `import AIDetector from '<rel>/.claude/skills/avoid-ai-writing/detector/patterns.js'` (default import) and call `AIDetector.analyzeText(text, { context })`. The validator runs as `.tooling/bin/node .claude/skills/avoid-ai-writing/detector/validate.js <orig> <new>` (exit 0 PASS, 1 FAIL). Verified by the P3 smoke test.
- Rationale: Plan §6.3 asks P3 to confirm the import path.
