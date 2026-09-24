# Phase 1 — Recon: Phase Log

Orchestrator: recon-orchestrator (Opus 5) · Run: v1 · Started 2026-09-21 21:44 · Finished 2026-09-21 22:15

## Summary

We researched what a complete beginner has to learn to get a perfect score on the CCC Senior contest in Python. Everything was checked against the contest organiser's own website and public sources, not taken from memory.

- **The contest:** 5 problems, 15 marks each (75 total). You get 3 hours, write it online, and are supervised at school. You can submit a problem many times; only your best attempt counts, and wrong attempts cost nothing. Part marks come from easier sub-parts of each problem.
- **Python:** allowed, but the contest runs it in an older, faster variant (PyPy, equal to Python 3.8). The organiser says a perfect score may not always be possible in Python, so the course must teach speed techniques and avoid newer Python features.
- **Difficulty:** it is real and rising. No one scored 75/75 in 2026 (the top score was 69). The 2025 results were withheld because of cheating. AI tools and pre-written code are banned during the contest.
- **Main output:** a 105-module learning map, in order from "what is a program" up to the hardest problems. Each module lists the real past contest problems that need it and those problems to practise.
- **Design:** we recommend one tool, "Impeccable", to keep the app looking polished and consistent. Anthropic's official "frontend-design" is the backup choice. Nothing is installed until the Manager approves.

## What was done

Round 1 used 5 workers (Opus 5) running in parallel. None of them spawned any subagents.

| Worker | Scope | Output |
|---|---|---|
| W1 | Contest format, rules, grader, history, scoring and CCO link | `ccc-format-and-rules.md`, `_working/w1-notes.md` |
| W2 | Junior J1–J5, 2014–2026 (65 problems) | `_working/w2-junior-problems.md` |
| W3 | Senior S1–S3, 2014–2026 (39 problems) | `_working/w3-senior-s1-s3.md` |
| W4 | Senior S4–S5, 2014–2026, plus how feasible each is in Python | `_working/w4-senior-s4-s5.md`, `python-for-ccc.md` |
| W5 | Design skill research (read-only, nothing installed) | `design-skill-recommendation.md` |

Round 2 (synthesis) continued two existing workers via SendMessage rather than spawning new ones. That kept the worker count at 5.
- **W3:** wrote `past-problems-analysis.md` and `sources.md`. It also settled a disagreement between workers about whether the grader uses PyPy: it confirmed PyPy3 7.3.9 / Python 3.8.13 by checking `cccgrader.com/sample_soln.pdf` itself. It then fixed two counting errors in the working notes.
- **W4:** wrote `curriculum-map.md`.

## Deliverables (`research/01-recon/`)

- `ccc-format-and-rules.md`: the current format (2026, compared with 2025), grader behaviour, limits, languages, rules, a history timeline, score statistics, the link to CCO, and what all this means for the curriculum.
- `past-problems-analysis.md`: a table for each year 2014–2026 (J1–J5 and S1–S5) giving topic, techniques, difficulty, Python verdict and the cheap partial-marks route. Also covers trends, topic counts and score targets by learning stage.
- `curriculum-map.md`: **the key deliverable.** It contains:
  - 105 modules, IDs M0.1 to C.10, across Stages 0–7 plus a contest-skills track;
  - for each module: purpose, the CCC problems that use it, prerequisites, depth needed, Python 3.8 notes and a practice set;
  - a dependency graph, a coverage matrix for 2019–2026 Senior problems, a list of Python-infeasible problems and a pacing estimate.
- `python-for-ccc.md`: the grader's Python environment, fast input/output, how to avoid recursion limits, performance pitfalls, a tour of the standard-library tools, traps for features newer than 3.8, problems that are hard in Python, and code snippets.
- `design-skill-recommendation.md`: Impeccable, with project-local install steps for later and the runners-up. Marked PENDING MANAGER APPROVAL — DO NOT INSTALL.
- `sources.md`: the consolidated bibliography, grouped by type, with the year each source applies to.
- `_working/`: the raw worker analyses, which give per-problem depth.

## Key findings / decisions

**Format (2026):**
- 5 problems × 15 marks = 75, in 3 hours on the CCC Online Grader, supervised at school. It ran on a single date: Feb 18, 2026 in the Americas.
- Up to 50 submissions per problem, and the best one counts.
- Default limits are 3 s and 512 MB, with no published multiplier for Python.

**Python on the grader:**
- "Python 3" = **PyPy3 7.3.9 (Python 3.8.13)**. The grader has used PyPy since at least 2018.
- CEMC can switch the interpreter for a single problem. 2026 J4 used CPython 3.10.12.
- Features newer than 3.8 will fail: `math.lcm`, `functools.cache`, `list[int]` annotations, `bisect` with `key=`, `match`.
- **The course must teach Python 3.8-compatible code only.**

**Rules:**
- Only official language documentation is allowed.
- Generative AI is banned, including AI in the editor. Prepared templates are banned, so algorithms must be typed from memory.
- Input comes from stdin, output goes to stdout, and output must match exactly.
- Students can write both Junior and Senior within the same timer.

**Difficulty and results:**
- No perfect Senior score in 2026 (the top score was 69). There were 3–17 perfect scores a year in 2016–2024.
- The 2025 official results were withheld over cheating.
- S3 averages only 1–2.5 out of 15.

**Trends 2019–2026:**
- S1 now involves math and casework.
- S3 is mostly "construct any valid answer" problems.
- S4 is mostly graph modelling (Dijkstra, MST, DFS).
- S5 alternates between segment trees / DP and ad hoc math.
- Junior J4 and J5 already need fast input and linear-time solutions.

**Python feasibility:**
- Most S4/S5 problems can pass under PyPy.
- 2019 S5 is likely impossible, and 2017 S5 ranges from very hard to likely impossible.
- 2023 S5 is very hard.
- The curriculum handles these explicitly: see its Python-infeasible items list.

**Realistic target:** full marks on S1–S4 plus S5 partial marks (about 63–68). A perfect 75 is a stretch goal. This is a worker estimate.

**Design skill:** Impeccable (`pbakaus/impeccable`, skill v4.3.1). This is **pending Manager approval**.

## Open questions & items awaiting Manager approval

1. **Approve the design skill** (D-005): Impeccable, or the fallback, Anthropic's official `frontend-design`.
   - Impeccable is a third-party tool. It downloads an engine and adds hooks.
   - By default it writes to `~/.impeccable` unless `IMPECCABLE_HOME` is set to a folder inside the workspace.
   - Pick `frontend-design` if you want no third-party code at all.
2. **Confirm the target.** The course aims for 75/75 but tells the learner honestly that roughly 63–68 is the realistic top result in Python. Is that framing acceptable?
3. **In-app code runner (for a later phase).** Browser Python (Pyodide) is CPython 3.14, which differs from the grader's Python 3.8. The app will need a check that flags features newer than 3.8, and must warn that browser speed does not predict grader speed.

## Known gaps / risks / suggested follow-ups

- DMOJ blocked scraping (Cloudflare 403), so we don't know per-problem Python/PyPy acceptance counts; only 2025 S5 was confirmed (19 PyPy AC). Feasibility verdicts are mostly estimates.
- Official per-problem time limits for 2018–2026 are not printed by CEMC; the DMOJ limits are used as a proxy.
- The 2026 Senior official commentary is not yet published, and the full 2026 S5 solution is unknown.
- The CCO cutoff (~50–60) is an estimate; no official cutoff is published.
- The results for 2014/2015 are only partly verified.
- If the 2027 grader upgrades from PyPy3 7.3.9, the 3.8 constraint could relax. Re-check before the app ships.
- Whether the threading stack-size trick works on the grader under PyPy is unverified. The curriculum teaches iterative DFS as the default.

## Instructions for the next phase

1. Read `research/01-recon/curriculum-map.md` first. It is the spec for the course content: module IDs, order, prerequisites and practice sets. Its section "Notes for the lesson-building agent" is written for you.
2. Next read `python-for-ccc.md`, which fixes the Python 3.8 / PyPy constraints for all code examples, and `ccc-format-and-rules.md`, which drives the contest-skills lessons and the grader simulation.
3. Use `past-problems-analysis.md` and `_working/*` for per-problem detail when writing exercises and walkthroughs. Do not copy CEMC problem statements verbatim without checking the copyright/usage terms; link to CEMC instead, or paraphrase.
4. Do not install the design skill until the Manager approves D-005. Then install it at **project scope only**, following `design-skill-recommendation.md`. Keep the app light-mode only (R6).
5. `main-app/` is still empty and must stay so until a build phase is authorized.
