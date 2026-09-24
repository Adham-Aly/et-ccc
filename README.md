# et-ccc — CCC Senior Python Learning App

A lean Next.js reading/learning app, deployed on Vercel, that takes a learner with **zero** programming experience to the knowledge needed for the **CCC Senior** contest, using **Python**. It teaches concepts and links real CCC problems (2014–2026, on WMOJ/DMOJ) — nothing else: no code execution, no judge or grading, no problem walkthroughs, editorials or hints, and no system/environment setup content. It makes extensive, high-quality use of visuals and animations wherever they aid learning.

This workspace is built by a hierarchy of AI agents working in sequential phases. Everything the agents need to resume work lives in this workspace.

**Any agent entering this workspace: read `context/00-START-HERE.md` first.**

## Layout

| Path | Purpose |
|---|---|
| `context/` | Shared source of truth: implementation plan, brief, rules, progress, decisions, phase handoff logs |
| `research/` | Phase research deliverables (one numbered folder per research phase) |
| `work/` | Build-phase deliverables (P3 on): containment proofs, spikes, reviews, ledgers, defects, report assets |
| `manager-reports/` | Copies of the plain-language HTML reports delivered to the Manager's `~/Desktop` |
| `main-app/` | The Next.js application (intentionally empty until the build phase initializes it) |
| `.tooling/` | All installed-tool state (Node, PyPy, skills, wrappers), created in P3; tools are called only through `.tooling/bin/*` or `npm run …` |

## GitHub and Vercel

A private GitHub repo (`et-ccc`) is created with `gh` in P3, using the Manager's existing login and identity, read-only. Each phase commits and pushes its own branch; `main` is merged only after the Manager approves that phase. The app deploys to Vercel from P4 on: every pushed branch gets a public preview, `main` is production, and both are public with no preview protection. Details: `context/implementation-plan.md` §9–§10.
