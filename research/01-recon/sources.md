# Phase 1 (Recon) — Consolidated Bibliography

Compiled 2026-09-21 by W3 (round 2). It merges and deduplicates the sources of:
- `ccc-format-and-rules.md` (W1)
- `_working/w1-notes.md` (W1)
- `_working/w2-junior-problems.md` (W2)
- `_working/w3-senior-s1-s3.md` (W3)
- `_working/w4-senior-s4-s5.md` and `python-for-ccc.md` (W4)
- `design-skill-recommendation.md`

**How to read it.** "Supports" says which claims rely on the source. "Applies to" is the contest year or version the source covers. "Used by" names the files that cite it.

**Access notes (2026-09-21):**
- DMOJ HTML pages, editorials and most API calls were blocked by Cloudflare after a short burst. Only the `/api/v2/problem/<code>` metadata (and one submissions query, for ccc25s5) came through.
- cccsolutions.ca renders its content with JavaScript, so it could not be read.
- Luogu solution pages require a login.

---

## 1. CEMC primary sources

### 1.1 Contest pages and rules

| URL | Supports | Applies to | Used by |
|---|---|---|---|
| https://cemc.uwaterloo.ca/contests/ccc | Format (5 × 15 = 75, 3 h), languages (C, C++, Python 2/3, Java), difficulty guide per question, the warning that "it may not always be possible to achieve a perfect score with ... Python", Distinction cutoffs, eligibility, CCO/CIW. The live page shows 2027; Wayback snapshots were used for 2025 (2024-12-28) and 2026 (2025-11-10) | 2025–2027 | W1, W2, W4 |
| https://cccgrader.com/rules.pdf | 3 s / 512 MB default; stdin/stdout; exact output; ≤ 50 submissions per problem, one per minute; best submission counts; per-subtask feedback; ban on AI, web and starter code; allowed documentation. The PDF was created 2026-02-17; Wayback copies are from 2020-03, 2023-03 and 2025-03 | 2020–2026 | W1, W2, W4 |
| https://cccgrader.com/sample_soln.pdf | **Grader versions: Python 3 = PyPy3 7.3.9 (Python 3.8.13); Python 2 = PyPy 7.3.9 (2.7.18); GCC 11.4.0 -O2 -std=c++17; OpenJDK 17.0.10.** The PDF was created 2024-04-12. Re-verified by W3 on 2026-09-21. Older Wayback versions show PyPy3 5.10.1 (2018–19) and PyPy3 7.3.1 (Python 3.6.9, 2022–23) | 2018–2026 | W1, W2, W3, W4 |
| https://cccgrader.com/directions.pdf | Grader mechanics: "skipped" tests within a batch, file naming, the Java class name, the recursion-limit note, the note that "fast input" is sometimes needed, maximum of Junior/Senior. Created 2024-05-29 | 2024–2026 | W1 |
| https://cccgrader.com | Grader home page. Its HTML contains **obsolete commented-out text** (Python 3.4.0, GCC 4.8.4) that should not be used | n/a | W1 |
| https://cemc.uwaterloo.ca/resources/past-contests?contest_category=29 (also `?grade=All&academic_year=All&contest_category=29`) | Index of all CCC problem sets, commentaries, test data and results booklets | 2016–2026 (older ones by URL pattern) | W1, W2, W3 |
| https://cemc.uwaterloo.ca/sites/default/files/documents/2025/cco_summary.pdf | CCO 2025 still ran (26–30 May) and medallists were published | 2025 | W1 |

### 1.2 Problem sets

URL pattern: `https://cemc.uwaterloo.ca/sites/default/files/documents/<folder>/<file>`. These support problem titles, statements, constraints, subtasks, shared J/S problems, per-problem technical notes, and the 2015 and 2017 time limits.

| Senior file (folder) | Junior file (folder) | Year | Notes |
|---|---|---|---|
| `2026CCCSrProblems.html` (2026); PDF `2026CCCSeniorEF.pdf` | `2026CCCJrProblems.html` (2026) | 2026 | J4 statement: "evaluated using ... python3 (Version 3.10.12) instead of pypy3 7.3.9 (Version 3.8.13)". Re-verified by W3 |
| `2025CCCSrProblems.html` (2025); PDF `2025CCCSeniorEF.pdf` | `2025CCCJrProblems.html` (2025) | 2025 | |
| `2024CCCSrProblems.html` (2024) | `2024CCCJrProblems.html` (2024) | 2024 | 24S3 half-mark rule |
| `2023CCCSrProblemSet.html` (2023) | `2023CCCJrProblemSet.html` (2023) | 2023 | |
| `2022CCCSrProblemSet.html` (2022) | `2022CCCJrProblemSet.html` (**2025** folder) | 2022 | |
| `<Y>CCCSrProblemSet.html` (<Y>) | `<Y>CCCJrProblemSet.html` (<Y>) | 2017–2021 | 2017 prints per-problem TLs |
| `2016CCCSrProblems.html` (2016) | `2016CCCJrProblems.html` (2016) | 2016 | |
| `2015CCCSrProblems.html` (2015); PDF `2015CCCSrProblemSet.pdf` (**2024** folder) | `2015CCCJrProblems.html` (2015) | 2015 | The PDF instructions give 5 s per test |
| `2014CCCSrProblems.html` (2014) | `2014CCCJrProblems.html` (2014) | 2014 | |
| 2005/2008/2010/2012/2013 Senior PDFs (older folders) | — | ≤ 2013 | History: file input, teacher grading, first mention of the Grader (W1) |

### 1.3 Official solutions and commentaries

| URL | Supports | Applies to | Used by |
|---|---|---|---|
| …/2025/2025CCCSrCommentary.html | Official S1–S5 methods (S3 Pretty Pens BBST; S4 edge-state Dijkstra; S5 segment tree) | 2025 | W3, W4 |
| …/2024/2024CCCSrCommentary.html | S1–S5 (S3 Swipe subsequence plus ordering; S4 DFS tree; S5 DP plus hashmap) | 2024 | W3, W4 |
| …/2024/2023CCCSrCommentary.html | S1–S5 (S2 centre expansion; S3 construction; S4 Dijkstra/MST; S5 Cantor) | 2023 | W3, W4 |
| …/2024/2022CCCSrCommentary.html | S1–S5 (S2 dict for the last mark; S3 greedy; S4 prefix sums; S5 tree DP) | 2022 | W3, W4 |
| …/2026/2026CCCJrCommentary.html | J1–J5, including J5/S2 Beams of Light (difference array or interval merge) | 2026 | W2, W3 |
| …/2026/2025CCCJrCommentary.html | J1–J5 methods | 2025 | W2 |
| …/2024/2024CCCJrCommentary.html, …/2024/2023CCCJrCommentary.html, …/2024/2022CCCJrCommentary.html | Junior methods | 2022–2024 | W2 |
| …/2026/2026CCCSrCommentary.html | **Returns 404 as of 2026-09-21.** No official 2026 Senior editorial | 2026 | W1, W3, W4 |
| Test data: `…/<Y>/<Y>CCCSeniorTestData.zip`, `…/<Y>/<Y>CCCJuniorTestData.zip`, and S3 bigfiles `https://s3.amazonaws.com/cemc.drupal/documents/bigfiles/{,prod/}<Y>CCCSeniorTestData.zip` (2019, 2020, 2024, 2025, 2026) | Official test data for the app's auto-grader | 2016–2026 | W2, W3 |

### 1.4 Results booklets

`https://cemc.uwaterloo.ca/sites/default/files/documents/<Y>/<Y>CCCResults.pdf`

| Year(s) | Supports | Used by |
|---|---|---|
| 2016–2024, 2026 | Per-problem averages (all contestants and non-zero scorers), contestant counts, rankings, perfect-score counts, honour roll | W1, W2, W3, W4 |
| 2025 | **No official results.** The co-chairs' statement that "many students submitted code that they did not write themselves" | W1, W2, W3, W4 |
| 2026 | 2439 official Senior participants; **top score 69, no 75**; the ranking covers official participants only | W1, W4 |

---

## 2. Judges and problem mirrors

| URL | Supports | Applies to | Used by |
|---|---|---|---|
| https://dmoj.ca/api/v2/problem/ccc{YY}{j,s}{N} (e.g. https://dmoj.ca/api/v2/problem/ccc26s3) | DMOJ time/memory limits, points, type tags and language lists for all CCC problems. Limits differ from the CCC Grader. Only ccc15s3 has a Python-specific limit (2.5 s) | 2014–2026 problems; data pulled 2026-09-21/22 | W1, W2, W3, W4 |
| https://dmoj.ca/api/v2/problems | Bulk DMOJ points for S4/S5 | 2014–2026 | W4 |
| https://dmoj.ca/api/v2/submissions?problem=ccc25s5&language=PYPY3&result=AC | **19 PyPy3 AC submissions** for 2025 S5 (4 s DMOJ limit) | 2025 S5 | W4 |
| https://dmoj.ca/runtimes/ | DMOJ interpreter versions. Blocked; exact versions UNVERIFIED (newer than 3.8 per github.com/DMOJ/runtimes-docker) | current | W1, W4 |
| https://dmoj.ca/contest/ccc26s | DMOJ mirror of CCC 2026 Senior | 2026 | W3 |
| https://dmoj.ca/problem/ccc21s3/editorial (and other `/editorial` pages) | Community editorials. Seen only via search snippets; blocked | various | W3 |
| https://www.luogu.com.cn/problem/P15536 … P15544 | Luogu mirrors of CCC 2026 J1–J5 and S1–S5 (IDs verified by title). Solutions need a login | 2026 | W3 |
| https://www.luogu.com/article/q3kdmm93 | Luogu editorial for 2026 J5/S2 Beams of Light | 2026 | W3 |
| https://cboj.ca/problem/ccc20s3, https://mcpt.ca/problem/ccc18s3 | Alternative mirrors (not relied on) | 2018–2021 | W3 |

---

## 3. Community editorials and solution repositories

| URL | Supports | Applies to | Used by |
|---|---|---|---|
| https://github.com/doduoduoniaodo/CCC-Solutions | Python CCC solutions. Used to check Python styles for 23S2, 24S3, 26S1, 20S2 and 15S3. Some S3s have no Python solution | 1996–2026 | W2, W3 |
| https://github.com/A-stick-bug/CCC-Solutions | Python S4/S5 solutions with self-reported scores (e.g. 15S5 "10/15, PYTHON IS TOO SLOW", 19S4 5/15). Evidence of the 3.9+ traps: `functools.cache`, `math.lcm`, `list[int]` | 2014–2026 | W4 |
| https://github.com/Kytabyte/CCC | C++/Python solutions with a grade table (20S4 Python 8/15; 20S5 Python 15/15) | 2014–2021 | W4 |
| https://github.com/aeternalis1/Contest-problems | C++ full solutions (CCC folder) | 2014–2019 | W4 |
| https://github.com/DanPlus6/CompetitiveProgramming (National Contests/CCC/2026) | C++ solutions for 2026 J1–S3. Used for the 26S1 candidate-set approach and the 26S3 brute-force plus random-guess approach | 2026 | W3 |
| https://github.com/Misaka16172/misaka16172.github.io (`solution-p15542.html`, posted 2026-03-08) | 2026 S3 editorial: parity argument, the random disjoint-guess analysis, and a claim that the official checker is strict about trailing spaces (single source, UNVERIFIED) | 2026 | W3 |
| https://github.com/CCCSolutions/CCCSolutions and https://cccsolutions.ca/ | Solution site (JavaScript-rendered; content not retrievable) | 1996–2026 | W3 |
| https://usaco.guide/problems/ccc-phenomenal-reviews/solution | 2016 S3: pruning plus tree diameter | 2016 | W3 |
| https://jeffreyxiao.me/blog/ccc-2016-analysis/ | 2016 analysis | 2016 | W3 |
| https://forum.usaco.guide/t/ccc-2019-s3-help/3941 | 2019 S3 casework approach | 2019 | W3 |
| https://www.geekedu.org/blogs/canadian-coding-competition-ccc-problem-solution-senior-2019 | 2019 S4/S5 editorial (DP plus range max; triangle doubling) | 2019 | W4 |
| https://github.com/kingMonkeh/CCC-Solutions, https://github.com/TommyPang/CCC-Solutions, https://github.com/Rivers47/CCC-solutions, https://github.com/sjay05/CCC-Solutions | Seen in searches; not relied on | various | W3 |
| https://wcipeg.com/wiki/Canadian_Computing_Competition | History: founding, Stage 1/2, Junior/Senior split, Grader start year | 1995–2014 | W1 |
| KTBYTE blog (URL not recorded by W1) | Remote writing in 2021–2022 and the return to in-person in 2023 (secondary; UNVERIFIED) | 2021–2023 | W1 |
| https://thelogic.co/news/waterloo-university-coding-competition-ai-cheating/ | Press on the 2025 withholding and AI cheating (2025-04-25) | 2025 | W1 |
| https://www.techspot.com/news/107701-ai-cheating-forces-university-waterloo-withhold-coding-competition.html | Press, same topic (2025-04-28) | 2025 | W1 |
| Wikipedia, "Canadian Computing Competition" | History (secondary) | 1995– | W1 |

---

## 4. Python references

| URL | Supports | Applies to | Used by |
|---|---|---|---|
| https://docs.python.org/3/reference/index.html | The only Python documentation the CCC rules name as allowed during the contest | 2026 rules | W1, W4 |
| https://docs.python.org/3/whatsnew/3.9.html | The 3.9+ feature boundary: `math.lcm`, multi-argument `gcd`, `list[int]`, `dict \| dict`, `removeprefix` | Python 3.8 vs 3.9 | W1, W4 |
| https://docs.python.org/3/library/functools.html | `functools.cache` is 3.9+; `lru_cache` without parentheses is 3.8 | 3.8/3.9 | W4 |
| https://docs.python.org/3/library/math.html | `isqrt`, `comb`, `prod` (3.8) vs `lcm` (3.9) | 3.8/3.9 | W4 |
| https://docs.python.org/3/library/functions.html#pow | `pow(a, -1, m)` (3.8) | 3.8 | W4 |
| https://docs.python.org/3/library/bisect.html | `key=` added in 3.10 | 3.10 | W4 |
| https://docs.python.org/3/library/stdtypes.html | `int.bit_count` (3.10) | 3.10 | W4 |
| https://doc.pypy.org/en/latest/cpython_differences.html | PyPy recursion/stack behaviour and other differences from CPython | PyPy 7.x | W4 |
| https://pypy.org/posts/2023/01/string-concatenation-quadratic.html | String `+=` is quadratic on PyPy | 2023 | W4 |
| https://soi.ch/wiki/python-recursion/ | The `threading.stack_size` recursion trick (UNVERIFIED on the Grader) | general | W4 |
| https://github.com/cheran-senthil/PyRival | The bootstrap (generator recursion), Fenwick and segment-tree patterns | general | W4 |
| https://usaco.guide/gold/hashing | Rolling-hash background (20S3) | general | W3 (search) |

---

## 5. Design-skill sources (from `design-skill-recommendation.md`)

| URL | Supports | Applies to |
|---|---|---|
| https://github.com/pbakaus/impeccable (releases: https://github.com/pbakaus/impeccable/releases) | **Chosen skill: Impeccable** (skill v4.3.1): README, SKILL.md, hooks, launcher, bundle signing | 2026 |
| https://impeccable.style | Impeccable's site | 2026 |
| https://registry.npmjs.org/impeccable/latest | npm package version (4.1.0) | 2026 |
| https://skillselion.com/skills/pbakaus/impeccable | Install-count claim (unverified) | 2026 |
| https://github.com/anthropics/skills/tree/main/skills/frontend-design (history: https://api.github.com/repos/anthropics/skills/commits?path=skills/frontend-design) | Runner-up and fallback: Anthropic `frontend-design` | 2026 |
| https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design | The same skill as an official plugin | 2026 |
| https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | Alternative: UI/UX Pro Max | 2026 |
| https://github.com/Leonxlnx/taste-skill | Alternative: Taste Skill | 2026 |
| https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines | Alternative: Vercel web-design-guidelines | 2026 |
| https://github.com/shadcn-ui/ui/tree/main/skills/shadcn | Alternative: shadcn skill | 2026 |
| https://composio.dev/content/top-design-skills | Comparison article (2026-05-05) | 2026 |
| https://claudeskills.info/blog/frontend-design-vs-impeccable-vs-ui-ux-pro-max/ | Comparison article (2026-07-25) | 2026 |
| https://www.firecrawl.dev/blog/best-claude-code-skills | "14 Best Claude Code Skills 2026" | 2026 |
| https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit | Awesome-list of design tooling | 2026 |
