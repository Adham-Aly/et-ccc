# Operating Rules

These rules bind every agent working in this workspace, at every tier, unless the Manager explicitly overrides them.

## 0. Source of truth

`context/implementation-plan.md` (once written) is the single source of truth for what gets built and how agents are organized. If it conflicts with this file, the plan wins for build scope; this file wins for process rules unless the plan says the Manager changed them.

## 1. Core philosophy: keep the top lean

- Token load belongs at the **lowest tier**. Workers do the heavy reading, searching and writing.
- Higher tiers stay lean: orchestrators coordinate and synthesize; the main session only launches orchestrators and relays results to the Manager.
- Information flows **through files, not through messages**. Agents write detailed results to the workspace and return only a short summary plus file paths to whoever spawned them.
- The main session should never need to read deliverables in full; it reads `progress.md` and the phase log summary.

## 2. Agent hierarchy

| Tier | Role | Spawns |
|---|---|---|
| 0 | **Main session** ("orchestrator of orchestrators"). Talks to the Manager, launches one phase orchestrator at a time, launches the Manager-report agent after each phase. | Orchestrators, report agents |
| 1 | **Phase orchestrator** (e.g. `recon-orchestrator`). Plans the phase, dispatches workers, integrates their output, updates context. | Workers (count per `implementation-plan.md`; default max 5) |
| 2 | **Worker**. Does focused work and writes results to files. | **Nothing. Workers must never spawn subagents.** |

Hard rules:
- **Model:** spawned agents use **only Opus 5.5 or Sonnet 5** (D-010), assigned per phase/task in `context/implementation-plan.md` §11 (model policy, caps and the spawn budget per phase).
- **Workers never spawn subagents.** Critical. Orchestrators must state this explicitly in every worker prompt.
- **No swarms, no Workflow tool, no `fork`.** At most 3 workers run at once in any phase (`context/implementation-plan.md` §11.1, §11.4).
- Orchestrators run **sequentially**, one phase at a time.
- No global side effects: nothing written outside this workspace except the Manager report on `~/Desktop`. No global/user memory, no global skills, no global config.
- No installing packages, skills, or tools unless the phase instructions explicitly authorize it.

## 3. Context update protocol (mandatory for every orchestrator)

**At phase start**
1. Read `00-START-HERE.md`, `project-brief.md`, this file, `progress.md`, `decisions.md`, and the phase logs your phase depends on.
2. In `progress.md`, set your phase to `IN PROGRESS`, with a start timestamp and your planned worker breakdown.

**During the phase**
3. After each worker finishes, update your phase's checklist in `progress.md` (what finished, where its output is). This is what makes an interrupted phase resumable: a fresh orchestrator must be able to read `progress.md` and continue without redoing finished work.
4. Workers write raw notes to `research/NN-<name>/_working/` (or another location the orchestrator designates) and return only a brief summary + file paths.

**At phase end**
5. Write the phase log `context/phase-logs/phase-NN-<name>.md` with these sections:
   - **Summary** (5–10 lines, plain language)
   - **What was done** (workers dispatched, what each produced)
   - **Deliverables** (every file produced, with a one-line description)
   - **Key findings / decisions**
   - **Open questions & items awaiting Manager approval**
   - **Known gaps / risks / suggested follow-ups**
   - **Instructions for the next phase** (what to read first, what to build on)
6. Append decisions to `decisions.md` (format in that file). Items needing the Manager's approval go under **Pending Manager approval**.
7. Set your phase to `DONE` in `progress.md` with an end timestamp and pointers to the phase log and deliverables.
8. Return to the main session a **short** message (≤ 15 lines): outcome, pointer to the phase log, anything requiring the Manager's attention. Do not paste deliverables.

## 4. Deliverable quality

- Deliverables are Markdown, well structured, with sources cited (URLs) where facts come from the web.
- **Research must be web-search driven.** Every agent doing research must search the web extensively and treat its own prior knowledge and assumptions as **outdated and likely wrong** — the CCC's format, rules, scoring, judge, and difficulty have changed substantially over the years. Verify every claim against current sources; never state a fact from memory alone.
- Prefer primary sources (e.g. cemc.uwaterloo.ca) over secondhand ones. Mark uncertain facts as uncertain. Note the year each fact applies to.
- Deliverables are written for the **next agents** (detailed, precise). Manager-facing material is produced separately (§5).

## 5. Manager report (automatic at the end of every phase)

After each phase, the main session spawns a small report agent (model per the plan) that:
- Reads the phase log (and only as much of the deliverables as needed).
- Loads the `artifact-design` skill **solely for its design guidance / UI quality**.
- Writes a single self-contained `.html` file to `~/Desktop/et-ccc-phase-NN-<name>-report.html`, plus a copy in `manager-reports/`.
- **Never publishes** it: no Artifact publish, no claude.ai link, no upload anywhere.
- **Light theme only** — no dark mode, no `prefers-color-scheme: dark` styles.
- Content: brief, non-technical, non-detailed. What happened, what was found, what was decided, what needs the Manager's input, what comes next. Strip jargon and anything a non-technical manager would not find relevant.

## 6. Redos, edits and critiques

The Manager may ask to redo a phase, edit outputs, re-run an orchestrator, or change direction at any time.
- A redo is a new run of the same phase. Before overwriting, rename the previous phase log to `phase-NN-<name>.v<k>.md` and move superseded deliverables into `research/NN-<name>/_superseded/v<k>/`.
- Record the Manager's critique and the redo in `decisions.md` and `progress.md`.
- A redo orchestrator must read the Manager's critique first and address it explicitly in its phase log.

## 7. Total containment of installed tooling (Manager requirement)

Anything installed for this project — skills, their engines/binaries, npm/pip packages, caches, config, hooks, state — must live **entirely inside this workspace**. If the workspace folder is deleted, nothing may remain anywhere else on the machine.
- Never write to `~/.claude/`, `~/.impeccable`, `~/.npm`, `~/.cache`, global `node_modules`, Homebrew, pyenv, shell profiles, or any other location outside the workspace.
- Redirect every tool's home/cache/config dir into the workspace (environment variables, local config files, `--prefix`, project-scoped skill/plugin install). Put tooling state under a dedicated workspace folder (e.g. `.tooling/`) and document it.
- Before and after any install, snapshot the relevant global locations and prove nothing changed. Record the proof and the exact install/uninstall steps in the phase log.
- If a tool cannot be fully contained, **stop and report** instead of installing it.

## 8. App-wide content rules

See `project-brief.md` R13–R14 and R17–R18: problem links (**WMOJ covers 2021–2026, DMOJ covers 2014–2020**, WMOJ preferred, exact URL formats, CCC 2014–2026 only — nothing before 2014 or after 2026); no score targets; no problem walkthroughs, editorials, solution pages or per-problem hints anywhere (the app teaches concepts and links CCC problems, nothing else); no system/environment setup content of any kind (OS, online editors, installing Python/PyPy/Thonny). Every content/build orchestrator must restate these rules in its worker prompts.

## 9. Work folders, tooling and deployment (from `context/implementation-plan.md`, once P3 runs)

- **`work/NN-<name>/`** holds each phase's artefacts: containment proofs, spikes, reviews, ledgers, defects, report assets and scratch/run files. Workers write there, never elsewhere, unless their orchestrator names a different location.
- **Tools are called only through `.tooling/bin/*` wrappers or `npm run …`**, never bare (`node`, `npm`, `python3`, `pypy`, `git`, `gh`, …). A guard hook rejects bare calls and any global config write. This is stated verbatim in every worker prompt from P3 on.
- **GitHub:** a private repo (`et-ccc`) created with `gh` in P3, using the Manager's existing login and global git identity, read-only. Every phase commits and pushes its branch at phase end and before any redo; `main` is merged only after the Manager approves that phase.
- **Vercel:** a regular Next.js app on the Manager's personal Hobby account. Every pushed branch gets a public preview; `main` is production; both are public, with no preview protection and no bypass secret.
- **Visuals:** the app makes extensive, high-quality use of visuals and animations (step-throughs, code traces, diagrams), to the same UI/UX bar as the rest of the app, with 2–3 authored presets per visual recorded from real Python at authoring time. Every UI-touching or visual-touching task ends with a screenshot review (`implementation-plan.md` §4.11, §8).
- **The app is a lean reading/learning app:** no code execution, no judge or grading, no in-house exercises, no problem walkthroughs/editorials/hints, and no system/environment setup content. See `implementation-plan.md` §2 and §5.3 for exactly what that excludes.
