# START HERE

This is the entry point for every agent (main session, orchestrators, workers) working in this workspace.

## Reading order

0. `context/implementation-plan.md` — **the single source of truth** for the whole build and the agent orchestration (once it exists).
1. `context/project-brief.md` — what we are building, for whom, and the formal requirements.
2. `context/operating-rules.md` — how agents are organized, what they may and may not do, and **how to update context** (mandatory).
3. `context/progress.md` — current state: which phases are done, in progress, or pending. **Check this before doing anything.**
4. `context/decisions.md` — decisions made so far and decisions awaiting the Manager's approval.
5. `context/phase-logs/` — one handoff log per phase run. Read the logs of phases your task depends on.

Workers only need to read what their orchestrator tells them to read; they must still obey `operating-rules.md`.

## File map

| File | Owner / who writes it |
|---|---|
| `context/project-brief.md` | Main session. Only changed when the Manager changes requirements. |
| `context/operating-rules.md` | Main session. Only changed when the Manager changes process. |
| `context/progress.md` | Every orchestrator updates it at phase start, at milestones, and at phase end. |
| `context/decisions.md` | Orchestrators append decisions; main session records Manager approvals. |
| `context/phase-logs/phase-NN-<name>.md` | Written by that phase's orchestrator. Rewritten (not appended) if the phase is redone; the old version is kept as `phase-NN-<name>.v<k>.md`. |
| `research/NN-<name>/` | Deliverables of research phases. `_working/` holds worker scratch notes. |
| `work/NN-<name>/` | Deliverables of build phases (P3 on): containment proofs, spikes, reviews, ledgers, defects, report assets, `_working/`, `_scratch/`, `_run/` (pid files). Workers write here, not to `research/`, from P3 on. |
| `manager-reports/` | Copy of each phase's Manager report HTML (primary copy goes to `~/Desktop`). |
| `main-app/` | The Next.js app. Empty until a build phase initializes it. |
| `.tooling/` | All installed-tool state (Node, PyPy, skills, caches, wrappers), created in P3. Never written to directly by hand. |

## Tools, GitHub and Vercel (from P3 on)

- **Call tools only through `.tooling/bin/*` wrappers or `npm run …`**, never bare (`node`, `npm`, `python3`, `pypy`, `git`, `gh`, …). A guard hook rejects bare calls and any global git/gh config change. See `context/implementation-plan.md` §9.
- **GitHub:** a private repo (`et-ccc`), created with `gh` in P3 using the Manager's existing login and global git identity, read-only. Each phase commits and pushes its own branch at phase end and before any redo; `main` is merged only after the Manager approves that phase (`context/implementation-plan.md` §10).
- **Vercel:** a regular Next.js app, deployed from P4 on. Every pushed branch gets a public preview; `main` is production. Both are public — no preview protection, no bypass secret (`context/implementation-plan.md` §4.1, §10.5).
