# Project Brief

## 1. Task

Build a complete web application that teaches a learner with **absolutely zero programming experience** everything they need to achieve a **full score on the CCC Senior** contest (Canadian Computing Competition, run by the CEMC, University of Waterloo), using **Python** as their contest language.

## 2. Purpose

The app is being built by the Manager (the human directing this work) for a specific learner. It must be a self-sufficient path from "never written a line of code" to "can solve every CCC Senior problem (S1–S5) within the contest's time limits in Python."

## 3. Goals

- G1. Cover the full learning path: Python fundamentals → CCC Junior-level problem solving → CCC Senior-level (S1 through S5) algorithms and techniques.
- G2. Teach Python specifically for competitive programming, including Python's performance pitfalls and how to work within contest time/memory limits.
- G3. Be genuinely usable by an absolute beginner: no assumed knowledge, carefully ordered prerequisites.
- G4. Look polished and professional.
- G5. Make extensive, high-quality use of visuals and animations (step-throughs of algorithms, animated traces of Python code, diagrams) wherever they aid learning, to the same UI/UX standard as the rest of the app (D-021).
- G6. Stay as lean as possible: the app teaches concepts and links CCC problems, nothing else. No problem walkthroughs, editorials, solution pages, per-problem hints, or system/environment setup content of any kind (D-030).

## 4. Formal requirements

### Functional
- R1. Content scope spans everything from CCC Junior up to CCC Senior, as determined by the recon phase (`research/01-recon/`).
- R2. The learner's contest language is Python; all teaching, examples and exercises use Python.
- R3. The target learner starts with no programming experience.

### Technical
- R4. Built with **Next.js**, deployed on **Vercel**. A lean, read-only learning app: no code execution, no judge, no grading, no in-house exercises or tests. Practice = external links to WMOJ/DMOJ only (D-020).
- R5. The Next.js app lives in `main-app/`. It must not be initialized until a build phase explicitly authorizes it.

### Design
- R6. **Light mode only.** No dark theme or dark mode anywhere — not in the app, not in reports.
- R7. The app must look good (polished, modern, pixel-careful UI).
- R8. Exactly **one** design skill: **Impeccable** (Manager-approved, D-005 ruling). Not installed until the main session instructs an orchestrator to do so, and then fully contained per R15.

### Process
- R9. Work proceeds in sequential phases, each run by one orchestrator agent. See `operating-rules.md`.
- R10. Every phase ends with a plain-language HTML report for the Manager on `~/Desktop` (see `operating-rules.md` §5).
- R11. The Manager may at any time ask to redo a phase, edit outputs, re-run an orchestrator, or adjust direction. The workspace must make this easy (see `operating-rules.md` §6).
- R12. Everything lives only in this workspace: no global config, no user/global memory, no global skills. Workspace-local skills only if truly necessary (discouraged).

### Content rules (apply to the entire application)
- R13. **CRITICAL — problem links.** Every CCC problem / practice problem referenced anywhere in the app links to an online judge as follows:
  - Years **2021–2026** → **wmoj.ca** (prioritize WMOJ where possible): `https://wmoj.ca/problems/<slug>` (plural `problems`, no trailing slash), e.g. `https://wmoj.ca/problems/ccc25j1`.
  - Years **2014–2020** (not on WMOJ) → **dmoj.ca**: `https://dmoj.ca/problem/<slug>/` (singular `problem`, trailing slash), e.g. `https://dmoj.ca/problem/ccc19s1/`.
  - Slug = `ccc` + 2-digit year + `j`/`s` + number (`ccc25j1`, `ccc19s5`). WMOJ uses the same slug convention as DMOJ. Verify slugs before shipping.
  - **Scope: CCC 2014–2026 only.** No problem before 2014, no non-CCC problem, and years after 2026 are permanently rejected by the build (D-030 Q-7, Q-9). Some modules may have no practice link.
- R14. **No score targets.** The app never mentions target scores, "realistic ceilings", or expected results. It stays focused on learning.
- R16. **Exactly one anti-AI-writing skill: avoid-ai-writing** (D-009 ruling). All teaching prose must be free of AI writing style. Fully contained per R15.
- R15. **Total containment of tooling.** Any skill, tool, package, binary, cache or config installed for this project lives entirely inside this workspace. Deleting the workspace must leave zero traces on the machine. See `operating-rules.md` §7.
- R17. **No problem walkthroughs, editorials, solution pages or per-problem hints, anywhere, ever.** The app teaches concepts and links CCC problems (2014–2026 only); it never solves, walks through, or points to a solution for a specific problem (D-030 Q-20).
- R18. **No system/environment setup content.** No OS-specific instructions, no online editors, no installing Python, PyPy or Thonny. Lessons go straight into learning (D-030 Q-19).

## 5. Phases

| # | Name | Status |
|---|---|---|
| 1 | Recon — determine all knowledge required for a perfect CCC Senior score in Python; recommend one design skill | see `progress.md` |
| 2 | Implementation plan — `context/implementation-plan.md`, the source of truth for all later phases | see `progress.md` |
| 3+ | Defined in `context/implementation-plan.md` | — |
