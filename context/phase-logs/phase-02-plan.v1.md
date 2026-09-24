# Phase 2: Implementation plan (phase log)

Orchestrator: planning-orchestrator (Opus 5.5). Run v1, started and finished 2026-09-23.

## Summary

We wrote the full build plan, `context/implementation-plan.md` (v1.0, waiting for Manager approval). From now on it is the single source of truth.

- **The app.** A static website with no server and no accounts. The learner's progress is saved in their own browser, with a backup file they can download.
- **Python in the browser.** Python runs in the browser with a tool called Pyodide. That Python is a newer version than the contest uses, so the app checks for and blocks features the contest's older Python 3.8 does not have. Every piece of teaching code is also tested against the contest's real Python.
- **Problem links.** They all come from one list of problems and are checked automatically.
  - **WMOJ has none of the 2020 contest problems.** We recommend sending those 9 to DMOJ as an exception. The Manager needs to decide.
- **Content.** About 233 lessons, 119 problem pages and roughly 490k words. It is written one curriculum stage per phase, after a 3-lesson pilot that the Manager must approve first.
- **The plan's phases.**
  - Phases 3–8 set up the tools, the app and the engine, then run the pilot.
  - Phases 9–16 write the content.
  - Phase 17 audits the whole course.
  - Phase 18 is release QA.
  - Phase 19 covers maintenance.
- **Items waiting for the Manager.** An independent critic reviewed the draft and every finding was addressed. 16 items need the Manager's input, each with a recommendation. The most urgent: approve the plan, version control (git), the 2020 links, the voice sample, and the swarm budget for the content phases.

## What was done

| Worker | Model | Task | Output |
|---|---|---|---|
| W1 | Opus | Tech stack, browser Python, how to enforce Python 3.8, editor, content stack, testing tools (web-verified 2026-09-23) | `research/03-plan/_working/w1-tech-stack.md` |
| W2 | Opus | Curriculum digest turned into a content architecture: pedagogy, content model/schemas, progress and mastery, volumes, link attachment, content gates, pilot choice | `research/03-plan/_working/w2-content-architecture.md` |
| W3 | Sonnet | Containment mechanics: env redirects, Node/npm, Playwright, Pyodide, PyPy/uv, Impeccable, avoid-ai-writing, snapshot proof, git | `research/03-plan/_working/w3-containment.md` |
| W4 | Sonnet | Live WMOJ/DMOJ slug verification, link-verification design, QA tooling (Playwright, visual, axe, linkinator, content lints, Lighthouse) | `research/03-plan/_working/w4-links-and-qa.md` |
| W5 | Opus | Independent critique of the draft plan against all 20 Manager requirements | `research/03-plan/_working/w5-critique.md` |

- W1–W4 ran in parallel.
- The orchestrator wrote the draft plan itself so it reads in one voice. W5 then critiqued it and found 2 blockers, 15 major issues, 23 minor issues and 5 nits. The orchestrator rewrote the plan to address all of them.
- No worker spawned subagents, installed anything, or touched `main-app/`.

## Deliverables

- `context/implementation-plan.md`: the plan (v1.0, pending approval).
- `research/03-plan/_working/w1…w5-*.md`: worker research and critique. These are evidence only; where they differ, the plan wins (plan §16.1 lists the differences).
- `context/phase-logs/phase-02-plan.md`: this log.
- Updates to `context/decisions.md` (D-012 to D-019, plus the pending items) and `context/progress.md`.

## Key findings / decisions

- **Architecture (D-013).** The app is a static Next.js export: 16.3.6 with React 19.3, TypeScript 6.0.3, Tailwind 4.3 and shadcn on Base UI. There is no backend. Progress is stored in IndexedDB, with export and import.
- **Node (D-014).** Node is a workspace-local 26.x tarball. The Homebrew Node 26.0.0 is missing its patches and is never used.
- **Python in the browser.**
  - Pyodide 314.0.7 (CPython 3.14) is self-hosted and runs as a static module worker. That avoids Turbopack bug #98841.
  - A runaway program is stopped by terminating the worker and switching to a pre-warmed spare, so no COOP/COEP headers are needed.
  - A device-speed factor adjusts time limits for slower hardware.
  - A beginner-friendly error explainer is part of the design.
- **Python 3.8 in three layers (D-015).**
  1. A static check in the browser (`ast`, vermin and a custom `compat38.py`). It blocks Submit but never Run.
  2. A runtime shim that removes library features newer than 3.8.
  3. An authoring gate: ruff (py38), vermin, PyPy 3.8 7.3.11 natively, and the exact PyPy 7.3.9 under Rosetta at stage acceptance and release.
- **Links (D-016).**
  - One registry holds all links. `judgeUrl()` is the only URL builder, and no raw judge URLs may appear in content.
  - Every problem must be verified in a committed snapshot before release.
  - WMOJ answers HTTP 200 even for missing problems, so the checker reads the page content. DMOJ blocks automated checks, so a Manager-assisted checklist is the primary way to verify it; we do not work around Cloudflare.
  - WMOJ has **no CCC 2020** problems. That is 9 unique problems, since 2020 J5 = S2. This is Q-1.
  - Crossover problems use the Senior slug, because that is how both judges host them.
- **Content (D-019).**
  - Format: MDX plus YAML (checked with Zod) plus real `.py` files.
  - Nothing that can be checked is typed by hand: links, expected outputs, traces and constraints are all generated.
  - The lesson approach fades support over the course: guided micro-cycles and worked examples early, problem-first teaching late.
  - Mastery checkpoints; guided navigation with no locks; Leitner review; template drills with no time goals; and a problem ladder that mirrors the subtasks.
- **Orchestration (D-017).**
  - The standard 3 tiers: main session, then the phase orchestrator, then workers.
  - Content runs as **one phase per curriculum stage**. We rejected stage-lead sub-orchestrators: they need an unverified third nesting level and would change operating-rules.
  - Model choices are made role by role (plan §11.2). Opus handles judgment, teaching prose, hard algorithms and review. Sonnet handles mechanical or well-specified work that is always checked afterwards.
  - Every spawn names its model explicitly and never uses fork.
  - The content phases (P9–P16) and the audit (P17) need swarm approval. The Workflow tool is not used.
- **Containment (D-018).**
  - Everything lives under `.tooling/`.
  - Tools are only called through wrapper scripts, backed by an npm-script guard and a PreToolUse hook that rejects bare `npm`/`node`/`uv` calls.
  - After P3 the Claude Code session must be restarted, and a fresh subagent then verifies the setup.
  - Every install and first run is followed by a before/after snapshot and a sweep. Any trace named after a project tool is a hard failure.
- **Engineering standards** (plan §8): reproduce bugs end-to-end first, zero warnings or flakes, zero open defects at every phase exit, and never hand-edit generated files.

## Open questions & items awaiting Manager approval

Plan §15 has full recommendations. They are listed in `decisions.md` → Pending.

1. **Approve the plan** (D-011/D-012).
2. Q-1: the 2020 links go to DMOJ as an exception.
3. Q-2: problems show their own subtask marks, and mock contests show a grader-style result.
4. Q-3: git, with a standing instruction to make a checkpoint commit.
5. Q-4: the Manager writes the voice sample.
6. Q-5: hosting.
7. Q-6: Safari.
8. Q-7: links for problems that aren't from the CCC.
9. Q-8: CEMC test data used in CI only.
10. Q-9: links for 2027 and later.
11. Q-10: drop M7.14 (C++).
12. Q-11: defer the local-setup lessons.
13. Q-12: swarm approvals.
14. Q-13: system and harness traces.
15. Q-14: process-file edits.
16. Q-15: workspace Node for avoid-ai-writing.
17. Q-16 (for information only): crossover slugs.

## Known gaps / risks / suggested follow-ups

- **Unverified until the spikes.**
  - S-0 in P3: PyPy 7.3.9 under Rosetta on macOS 26, and whether WMOJ offers PyPy3.
  - S-1 in P4: Pyodide start time, the stdin idioms, vermin inside Pyodide, recursion depth, how long respawning takes, and the device factor.
  - P3 also confirms the harness details: that `settings.json` env is applied, that hooks fire, and whether Next's telemetry file is written.
- **Version conflict.** W1 and W4 found different Playwright versions (1.63.0 vs 1.62.1). The plan pins 1.63.0, re-checked at install.
- **DMOJ.** DMOJ can't be checked automatically, so the release depends on the Manager doing a manual check of about 63 URLs (about 10 minutes).
- **Estimates.** Volume and agent-count estimates will be recalibrated after the pilot (P8).
- **Rosetta.** Support ends after macOS 27, which removes the exact 7.3.9 check on this Mac. The long-term fallback is a Linux runner.
- **Follow-up for the main session after approval.** Update `00-START-HERE.md`, adding the `work/` folder and the tool-wrapper rule, and update `operating-rules.md` §2 to point to plan §11.2 (Q-14).

## Instructions for the next phase (P3 Tooling & containment)

1. Read `context/implementation-plan.md` first: §0–§3, §9, §10, §11, and §12 P3.
2. Don't start until the Manager has approved the plan, authorised installs for P3, and ruled on Q-3, Q-13 and Q-15.
3. Read `research/03-plan/_working/w3-containment.md`, applying the overrides in plan §16.1. Also read the install sections of `research/01-recon/design-skill-recommendation.md` and `research/02-writing-style-skill/recommendation.md`.
4. Build the snapshot tooling and take the "before" snapshot **before** installing anything. Record the proofs in `work/03-tooling/containment/`.
5. End P3 by asking the main session to have the Manager restart the Claude Code session (plan §9.3).
