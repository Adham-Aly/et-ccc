# Phase 2: Implementation plan (phase log, redo v2)

Agent: plan-reviser (Opus 5.5), working alone with no workers. Run v2, 2026-09-23. The v1 log is archived as `phase-02-plan.v1.md` and the v1 plan as `context/implementation-plan.v1.md`.

## How this redo answers the Manager's critique (D-020, plus D-021)

The Manager rejected plan v1.0 because it misread the product and was far too big to run. Point by point:

| Manager's point | What v2 does | Plan section |
|---|---|---|
| **1. Purely a reading/learning app, with no code execution of any kind** | All of it is gone: in-browser Python (Pyodide), the runner, the editor, the 3.8 runtime shim, verdicts and the error explainer. Code in lessons is read-only, with a copy button. Python 3.8 correctness is checked when the content is written, never in the app. | §2.3, §4.4, §4.5 |
| **2. No exercises, quizzes, tests or autograding** | Also gone: every exercise type, hint tier, checkpoint, mastery badge, review schedule, drill, mock contest, test case, progress database and export/import. What remains: lessons, navigation, search, and one optional "mark as read" flag in the browser, each justified in a short list (§4.8). | §2.3, §4.6, §4.8 |
| **3. Deployed on Vercel, nothing on the learner's machine, lean** | A regular Next.js app on Vercel with every page pre-built. There is no backend, API or database. Every pushed branch gets a preview link and `main` is production. Build tooling stays inside the workspace. | §4.1, §10.5 |
| **4. Links: 2021–2026 to WMOJ, 2020 and earlier to DMOJ, with WMOJ preferred** | `judgeUrl()` now uses the new year bands, so v1's 2020 exception and Q-1 are gone. A lint enforces WMOJ-first practice choices: any DMOJ pick needs a reason when a WMOJ problem fits. The registry and link verification are kept. | §4.7, G-LINK-PREF |
| **5. Private GitHub repo via `gh`** | P3 step 1 covers the auth checks, `gh repo create … --private --source=. --remote=origin --push`, and a visibility check. It also records what `gh` touches outside the workspace. It changes nothing there: `gh` is already logged in and global git already uses it. The Vercel link is a Manager action in P4. Commits happen at phase ends under a standing instruction (Q-17), with no AI co-author lines. **Not yet executed.** | §10 |
| **6. Much smaller orchestration** | 7 phases instead of 16. At most 3 workers at once. No swarms, no Workflow tool, no extra nesting. Sonnet writes Stages 0–4; Opus handles design, the visuals engine, the pilots, the hardest lessons and every review. About **41 agent spawns in total, against about 294 in v1**. | §11, §12 |
| **Keep what still holds** | Kept: light mode, Impeccable and avoid-ai-writing (fully contained), the voice sample, the pilot lessons, no score targets, Python 3.8 code, Manager reports, the redo protocol, and the engineering standards. The standards now also require E2E and pixel checks of the **deployed** site. | §3, §6, §8, §9 |
| **Open questions** | Resolved questions are deleted. 14 items remain, each with a recommendation. | §15 |
| **D-021 (Manager, sent during this redo): extensive visuals and animations** | A new visualization system (§4.11) with animated step-throughs of algorithms and line-by-line traces of Python code. Every animation replays data recorded by running the real Python while the content is written, so nothing executes in the browser and D-020 still holds. The visuals share one visual language, have accessibility and reduced-motion rules and their own quality gate (G-VIZ), and get frame-level screenshot checks. All three pilots include visuals. | §4.11 and throughout |

## Summary

- Plan v2.0 (`context/implementation-plan.md`) is written and waiting for Manager approval. It replaces v1.0 in full.
- **The app:** a lean reading app on Vercel. It has clear lessons, read-only Python examples, many visuals and animations, search, and "mark as read". Practice happens on WMOJ and DMOJ through links.
- **The phases:**
  - P3 sets up tooling, containment and the private GitHub repo.
  - P4 builds the app, the design, the visuals engine and the deployment.
  - P5 covers the voice, the problem list and three pilot lessons (hard gate).
  - P6–P8 write the content in three batches of stages.
  - P9 reviews everything and releases.
  - P10 is maintenance on demand.
- **Size:** about 41 agents over the whole project (cap 48), against about 294 in v1.
- **Needs the Manager:** approve the plan, plus 13 open questions. The urgent ones are the repo specifics, the Vercel account, the learner's computer, the voice sample, and custom inputs in visuals.

## What was done

- Read the critique (D-020), the context files, and all of v1 (the plan and its log).
- Checked `gh` and git on this Mac (read-only; no changes):
  - `gh` 2.92.0 from Homebrew is logged in (keyring, `repo` scope).
  - Global git already uses `gh` for GitHub credentials and has an identity set.
- Rewrote the plan as v2.0. Midway through, the Manager added D-021 (visuals), so the new §4.11 was written and folded into every affected section.
- Updated `decisions.md` and `progress.md`.
- Did no web research. Facts that need current checks are tagged as spikes for the phases that use them:
  - S-1 (P3): the Node versions Vercel supports.
  - S-2 (P4): Vercel deployment statuses and the preview-protection bypass.
- Spawned no agents, installed nothing, created no repo, and did not touch `main-app/`.

## Deliverables

- `context/implementation-plan.md`: plan v2.0 (pending approval).
- `context/phase-logs/phase-02-plan.md`: this log.
- `context/decisions.md`: D-008 and D-012 to D-019 marked as superseded or amended. Added D-021 (the Manager's visuals instruction) and D-022 to D-029 (the v2 decisions). The pending list is replaced with the v2 open questions.
- `context/progress.md`: Phase 2 set to DONE (redo v2), plus a row for the Manager report.

## Key findings / decisions

- **D-023:** Next.js with every page pre-built, on Vercel. Production shows only accepted modules and previews also show drafts. Local Node matches Vercel's.
- **D-024:** 56 problems link to WMOJ (2021–2026) and 63 to DMOJ (2014–2020). Practice choices are WMOJ-first. Verification is automated for WMOJ and done by the Manager with a checklist for DMOJ.
- **D-025:** Python 3.8 is enforced only while content is written: ruff, vermin, and PyPy 3.8 runs of every shown output. Shown CCC solutions are checked against the official data. PyPy 7.3.9, Rosetta and uv are no longer needed.
- **D-026:** The content model and pipeline for a reading app: an author, then automated gates, then one Opus reviewer per phase, then acceptance.
- **D-027:** Orchestration is 41 spawns (19 Opus, 22 Sonnet) with at most 3 at once and the plain main → orchestrator → workers shape.
- **D-028:** The GitHub repo reuses the existing `gh` login, so nothing global changes. Vercel is linked in its dashboard, and the Vercel CLI is not used.
- **D-029:** The visualization system is an in-house SVG library with Motion for animation. Its data is recorded from the real Python, so nothing executes in the browser.

## Open questions & items awaiting Manager approval

These are in plan §15 and `decisions.md` → Pending:
- P2-B: approve plan v2.0.
- Needed before P3:
  - Q-17: repo name, identity and standing commit instruction.
  - Q-13: traces left outside the workspace.
  - Q-14: edits to the process files.
  - Q-15: which Node runs avoid-ai-writing.
- Q-18: the Vercel account and whether previews are protected (needed at the P4 Vercel link).
- Q-21: custom inputs in visuals (needed before P4).
- Needed before P5:
  - Q-19: the learner's computer and Python setup.
  - Q-20: how much solution content to include.
  - Q-2: subtask facts in lessons.
  - Q-4: the voice sample.
  - Q-7: practice beyond CCC 2014–2026.
  - Q-10: dropping M7.14.
- Q-9: links for 2027 and later (by P10).

## Known gaps / risks / suggested follow-ups

- **Unverified until the spikes:**
  - S-1: the Node versions Vercel supports.
  - S-2: GitHub deployment statuses and the preview-protection bypass. The fallback is in Q-18.
- **Size estimates:**
  - Content volume (about 300k words) and the number of visuals (about 400–550) are estimates. P5 measures tokens per module and recalibrates §2.2 and §11.5.
  - The visuals add real authoring work to every content phase. Author and reviewer counts were kept the same, and the P5 measurement will show whether that holds.
- **Fewer reviewers than v1.** Quality depends on the pilots, the gates, one Opus reviewer per phase, and the Manager's sample reviews on the preview (R-7).
- **Process files are out of date.** `operating-rules.md` §8 still says WMOJ covers 2020–2026. The main session should fix it once the plan is approved (Q-14).

## Instructions for the next phase (P3 Setup)

1. Start only after:
   - the Manager approves plan v2.0 (P2-B);
   - installs are authorised;
   - the Manager rules on Q-13, Q-14, Q-15 and Q-17.
2. Read `context/implementation-plan.md` §0–§3, §9, §10, §11 and §12 P3. Then read `research/03-plan/_working/w3-containment.md`, applying the overrides in plan §16.1.
3. Build the snapshot tooling and take the "before" snapshot first. Then create the GitHub repo (§10.3), running the auth checks before anything else. Then install the tooling.
4. End P3 by asking the Manager to restart the Claude Code session (§9.3).

---

## v2.1 amendment (2026-09-23, plan-amender)

The Manager answered every v2.0 open question in one pass — **D-030** — and approved plan v2.0 as the single source of truth, amended by those answers. plan-amender applied every D-030 answer to `context/implementation-plan.md` in place, producing **v2.1**. This section records that amendment; it does not replace the redo-v2 log above, which still describes how v2.0 came to be.

### What changed

- **No problem walkthroughs, editorials, solution pages or per-problem hints, anywhere (D-030 Q-20).** Deleted: the `WorkedProblem` MDX component, the `solutions/` content folder, `work/cemc-data/` (the CEMC test-data cache), and the G-SOLUTION gate. The `hint` field is gone from practice-list entries. Stage 3–7 lessons now demonstrate a technique on the author's own worked example, never a specific registry problem's solution. G-R14 gained patterns for "a solution/walkthrough/editorial exists elsewhere."
- **No system/environment setup content, for any OS, online editors, or installing Python/PyPy/Thonny (D-030 Q-19).** **M0.2** ("Writing and running Python") and **M0.3** ("Terminal basics and input files") are dropped outright — they existed only for local setup. Stage 0 now runs M0.1 → M0.4 → M0.5 → M0.6 → M0.7. `/start` no longer covers local setup.
- **M7.14 (C++ bridge) is kept** (the Manager overrode the plan's own recommendation to drop it, D-030 Q-10), written with no setup content and no scoring/"impossible in Python" framing.
- **Curriculum modules: 104** (was 105 — minus M0.2/M0.3, plus M7.14 restored).
- **Practice links: CCC 2014–2026 only** (D-030 Q-7); years after 2026 are a **permanent** build rejection, not a placeholder awaiting a future ruling (D-030 Q-9). No pre-2014, no non-CCC problems.
- **Subtasks** may appear as one problem's own breakdown when teaching partial-marks strategy; never totals, cutoffs or goals (D-030 Q-2, confirmed as recommended).
- **Voice sample:** an agent drafts it with avoid-ai-writing; the Manager approves or rejects it (D-030 Q-4) — not the Manager writing it, as v2.0 had proposed.
- **Vercel:** personal Hobby account; previews and production are **both public**; no preview protection, no bypass secret. `.tooling/secrets/` and the Protection-Bypass steps in §10.5 are removed.
- **Repo, containment, process-file edits (Q-13, Q-14, Q-15, Q-17):** approved as recommended; no plan change beyond recording the approval.
- **§15** is now a short "Resolved questions" list pointing to `decisions.md` → D-030. No open question remains.
- **Agent estimate recomputed:** unchanged at **41 spawns (19 Opus, 22 Sonnet), cap 48.** The per-phase module-count shift (P6: 33 → 31; P8: 41 → 42) still fits each phase's existing ≈7–9-modules-per-author range, so headcounts don't move. What shrinks is token cost per module: prose is now estimated at ≈240k–260k words (was ≈300k), with no walkthrough sections, no `solutions/` files and no CEMC-data work.
- Added a v2.1 changelog entry (plan §1, §1.2) documenting every point above with its plan-section mapping.

### Process files (D-030 Q-14, done alongside this amendment)

Updated `context/operating-rules.md`, `context/00-START-HERE.md`, `context/project-brief.md` and `README.md` to match plan v2.1: WMOJ/DMOJ year bands (2021–2026 / 2014–2020), the model/cap/no-swarm rules from plan §11, the work folders, tool wrappers, GitHub and Vercel, the visuals requirement, and the no-setup/no-walkthroughs/lean-app rules. `project-brief.md` gained G5–G6 and R17–R18 for this.

### Context bookkeeping

- `context/progress.md`: overall status line updated; Phase 2 status and this amendment logged.
- `context/decisions.md`: **D-031** — "Plan v2.1 written."

### Instructions for the next phase (unchanged)

P3 Setup proceeds exactly as instructed above, now reading plan **v2.1** instead of v2.0. Nothing in P3's steps changed; the plan it reads did.
