# CCC Format & Rules: Current State (2026) and History

**Worker:** W1, Phase 1 (Recon). **Researched:** 2026-09-21.
**Scope:** Canadian Computing Competition (CCC), run by the CEMC at the University of Waterloo, with a focus on the Senior contest written in Python.
**Raw notes and extracted numbers:** `research/01-recon/_working/w1-notes.md`.

**How facts are tagged**
- Every fact gives the year it applies to.
- **[P]** = primary source (CEMC, cccgrader.com, or official CCC problem and results PDFs).
- **[S]** = secondary source (DMOJ, blogs, news).
- **UNVERIFIED** = not confirmed by any source I could reach.

## Key primary sources
| Source | URL | Version / date |
|---|---|---|
| CCC contest page | https://cemc.uwaterloo.ca/contests/ccc | Live page now shows CCC 2027. Wayback snapshots were used for CCC 2025 (2024-12-28) and CCC 2026 (2025-11-10). |
| CCC Rules | https://cccgrader.com/rules.pdf | PDF created 2026-02-17, so it is the CCC 2026 rules. |
| Language details and sample programs | https://cccgrader.com/sample_soln.pdf | PDF created 2024-04-12 |
| CCC Grader instructions | https://cccgrader.com/directions.pdf | PDF created 2024-05-29 |
| 2026 Senior problems | https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCSrProblems.html (PDF: .../2026CCCSeniorEF.pdf) | CCC 2026 |
| 2026 Junior problems | https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCJrProblems.html | CCC 2026 |
| Results booklets | https://cemc.uwaterloo.ca/sites/default/files/documents/YYYY/YYYYCCCResults.pdf | 2016–2026 |
| Past contests index | https://cemc.uwaterloo.ca/resources/past-contests?contest_category=29 | Problems, commentary and test data, 2016–2026 |

> **Warning for other agents:** the HTML source of cccgrader.com contains commented-out, obsolete text (for example "Python 3 -- Python 3.4.0", "GCC 4.8.4", Pascal/PHP/Perl). The page does not display it and it is not current. Some secondary sites repeat it. Do not use it.

---

## 1. Current structure (CCC 2026, compared with CCC 2025)

| Item | CCC 2026 (Feb 2026) | CCC 2025 (Feb 2025) | Source |
|---|---|---|---|
| Divisions | Junior and Senior | Same | [P] CCC page |
| Problems | 5 per division | 5 | [P] |
| Marks | 15 per problem, 75 total | Same | [P] CCC page ("Each question is worth 15", "Score out of 75") |
| Partial marks | Problems may be split into subtasks, each worth part of the 15 marks | Same | [P] CCC page; subtask tables in each statement |
| Duration | 3 hours. Each participant gets their own timer, which starts when they confirm their biographical information on the Grader. | Same | [P] CCC page, rules.pdf |
| Date | Wed **18 Feb 2026** (North and South America); Thu **19 Feb 2026** (elsewhere) | Wed 19 Feb 2025 / Thu 20 Feb 2025 | [P] Wayback snapshots of the CCC page |
| When in the day | "as close to the beginning of the school day as possible". The 2027 page adds "on the official contest date". | Schools could run it **anywhere in a two-week contest period** | [P] snapshot diff |
| Delivery | "Written in school, participants write online, individually" on the CCC Online Grader, supervised by a teacher (the Contest Supervisor) | Same wording | [P] |
| Screen recording | **New in 2026.** Optional, but "strongly recommend[ed]" for anyone hoping for a CCO/CIW invitation. Recordings are kept by the school for a month. Without one, "evidence of broken rules is more likely to lead to disqualification". | None | [P] |
| Who can write | Any full-time student. **Official** participants (born on or after 1 Jul 2006 for CCC 2026; 1 Jul 2005 for 2025; 1 Jul 2007 for 2027) who write at a Canadian school and live in Canada, or who write at a school outside Canada, are eligible for the honour roll and for CCO/CIW invitations. Unofficial participants still get certificates. | Same rule | [P] |
| Choosing a division | Anyone can choose either division, whatever their grade. Junior is meant for "beginner to intermediate" programmers, Senior for "intermediate to advanced". | Junior was described as "beginner" | [P] |
| Writing both divisions | **Allowed.** One 3-hour timer covers both contests, and the higher of the two scores counts: "We will take the maximum score between the Junior and Senior contest as the student's overall score." | Same (the directions.pdf 2024 version says the same) | [P] rules.pdf, directions.pdf |
| Shared problems | 2026: **J5 = S2** ("Beams of Light"). 2023: J4 = S1. 2022: J4 = S2. | 2025: no shared S problem found | [P] problem sets |
| Honour roll | Senior only. Junior honour rolls were dropped starting with 2026. | Junior and Senior (in principle) | [P] |
| Fee | $10 per participant plus a $5 processing fee per order | Same | [P] |
| Sponsor | Hudson River Trading | | [P] |

**Official difficulty guide** ([P] CCC page, 2025 and 2026 wording is the same):
- Senior Q1–2: "Basic algorithms (e.g. sorting, searching)".
- Senior Q3–4: "More advanced algorithms (e.g. careful counting, more advanced mathematical reasoning)".
- Senior Q5: "IOI level question".
- Junior: Q1–2 basic loops and conditions; Q3–4 combinations of these plus counting; Q5 recursion, 2D arrays, efficient algorithms.

**Subtasks in practice (CCC 2026 Senior, from the statements [P]):**
- S1: 5+6+2+2 marks.
- S3: 2+1+1+2+2+7 marks. The last 7 marks are an unusual output-only case where every card value is given as −1.
- S4: 2+2+2+3+3+3 marks.
- S5: 2+2+2+2+3+3 marks.
- Early subtasks have small bounds (brute force works). Later subtasks need the efficient algorithm.
- Some problems give half marks inside a subtask. For example, CCC 2024 S3: "for a subtask worth M marks, you will receive ⌊M/2⌋ marks for a solution that only correctly outputs the first line of output."
- CCC 2026 S1 says full marks need 64-bit integers (values up to 10^18). Python integers handle this automatically.
- 2026 S3 accepts **any valid answer** ("If there are several ways ... print any of them"), which means a special checker is used.

## 2. Judging system (CCC Online Grader, https://cccgrader.com)
All from rules.pdf (2026) and directions.pdf (2024) [P]:
- **Submissions:** "up to 50 submissions per problem", and "at most once per minute to any particular problem".
- **Feedback during the contest:**
  - Feedback is always shown for the sample test cases.
  - For each subtask: if every test case passes, you get feedback for each test case. Otherwise you get feedback for every test case up to and including the first one that fails.
  - Possible results: correct, compilation error, time-limit exceeded, run-time error, wrong answer.
  - directions.pdf adds **skipped test**: once one test in a batch fails, the rest of that batch is skipped. So subtasks are judged as batches that stop at the first failure.
- **Score:** "We will take the **maximum** score over all submissions for each problem as the student score for that problem." It is **not** the last submission. Wrong submissions cost nothing except the 50-per-problem cap and the one-minute gap.
- **Subtask scoring:** in practice a subtask's marks are all or nothing, since a batch stops at its first failed test. The only exception is where a statement says otherwise (for example the half-mark rule in 2024 S3). The rules never state this in so many words.
- **Supervisors:** teachers can watch a live scoreboard of their own school's participants. Results appear in the Contest Supervisor Portal "within a few weeks".
- **Submission mechanics:** choose the problem, choose the language, upload a file, submit.
  - File names may contain only letters, digits, `_` or `-`.
  - Python 2 and Python 3 are separate choices and are not interchangeable.
  - Java code must be in `Main.java` with class `Main` and no package.
  - The Grader logs you out after about 10 minutes of inactivity. The timer keeps running, but you can log back in.
- **End of contest:** only submissions received within the 3 hours count. The rules warn "there is some risk when submissions are made near the end of the contest."
- **Rule-breaking:** using forbidden tools or collaborating gets a score of 0. The school is notified, the student is banned from all future CCCs, University of Waterloo admission offers may be revoked, and in severe cases the school can be banned.
- **After the contest:** do not discuss the problems online for 48 hours.

## 3. Time and memory limits
- **CCC Grader default (2026 rules):** "Unless stated otherwise, programs will be evaluated with a **3 second time limit and a 512 MB memory limit**." [P]
- **2024–2026 statements:** none of the Senior statements (2024, 2025, 2026) give a per-problem time limit. I grepped all three.
  - Only one 2026 statement carries a technical note: J4 says that too much memory may give "an unpredictable error message", and that it runs Python 3 on CPython (see §4).
  - So the 3 s / 512 MB default presumably applied. The Grader screen shows each submission's run time.
  - The actual per-problem limits used on the 2024–2026 Grader: **UNVERIFIED** (the contest environment needs a login).
- **The rules do not say limits differ by language.** CEMC instead warns that a perfect score may not be possible in Python (§4).
- **Historical limits** [P, old statement PDFs]:
  - 2013–2016: "5 seconds of execution time per test case" for Senior, both for teacher grading and on the Grader.
  - 2017: a limit per problem (S1 1 s, S2 1 s, S3 2 s, S4 3 s, S5 5 s; J1 1 s).
  - 2018 onward: no limits printed in the statements.
- **DMOJ limits (what the learner will practise against) [S, DMOJ API v2].** DMOJ sets its own limits, which can be stricter or looser than the CCC Grader. None of these problems has a per-language exception (`language_resource_limits: []`).

| DMOJ code | Time | Memory | DMOJ points |
|---|---|---|---|
| ccc26s1 / s2 / s3 / s4 / s5 | 3 / 3 / **1** / 2 / 5 s | 1024 MB | 5 / 7 / 7 / 15 / 30 |
| ccc25s1 / s2 / s3 / s4 / s5 | **0.5** / 2 / 7 / 4 / 4 s | 512 MB | 3 / 7 / 10 / 12 / 17 |
| ccc24s1–s5 | 3 s each | 1024 MB | 3 / 5 / 10 / 12 / 20 |
| ccc23s1 / s2 / s3 / s4 / s5 | 1 / 1 / 1 / 2 / 2 s | 1024 MB | 5 / 7 / 10 / 15 / 20 |
| ccc25j1–j5 | 1 / 1 / 1 / 1 / 5 s | 256 MB | 3 / 3 / 5 / 5 / 7 |
| ccc24j1–j5 | 3 s each | 1024 MB | 3 / 3 / 5 / 7 / 7 |
| ccc26j1–j4 | 3 s each | 1024 MB | 3 / 3 / 3 / 5 (ccc26j5 = ccc26s2) |

## 4. Languages and Python specifics
- **Allowed languages (CCC 2025, 2026 and 2027 pages):** "C, C++, Python 2, Python 3, or Java." [P]
  - Pascal, PHP and Perl were once on the Grader. The 2013–2016 statements mention Pascal, and a 2021 third-party notice listed Pascal/Perl/PHP.
  - Those three are gone by 2025. Year dropped: **UNVERIFIED**.
- **The key warning from CEMC [P]:**
  - Current wording: "it may not always be possible to achieve a perfect score with a particular language choice (for example, Python or Java). However, there is always at least one choice of programming language for which it is possible to achieve a perfect score."
  - The 2025 wording added "because the design of some languages limits the participants' ability to solve the hardest part of the hardest problems."
  - **So CEMC does not promise that 75/75 can be reached in Python.**
- **Exact Python on the CCC Grader [P]:**
  - **Python 3 = PyPy3 7.3.9, running Python 3.8.13** (sample_soln.pdf, Apr 2024).
  - **Python 2 = PyPy 7.3.9, running Python 2.7.18.**
  - This was still true at CCC 2026. The 2026 J4 statement says: "Python 3 submissions for this problem will be evaluated using the standard interpreter python3 (Version 3.10.12) instead of pypy3 7.3.9 (Version 3.8.13)."
  - So the **default was PyPy3 (Python 3.8 language level)**, and specific problems could switch to CPython 3.10.12.
  - Consequences:
    - (a) PyPy's JIT speeds up loops a lot, but its startup cost and memory use are higher.
    - (b) **Only Python ≤ 3.8 syntax and standard library are safe.** That means no `match` statements (3.10), no `math.lcm`/`math.nextafter` (3.9), no `list[int]` type hints at runtime (3.9), no `itertools.pairwise` (3.10), no `bisect` `key=` argument (3.10), and no `str.removeprefix` (3.9). The walrus operator (3.8), `math.comb`, `math.isqrt` and `math.prod` (3.8) are fine.
  - Other languages on the same page: GCC 11.4.0 (`-O2 -std=c++17 -static`) and OpenJDK 17.0.10.
- **How Python is run:** the program is uploaded as a `.py` file. Input comes from stdin and output goes to stdout.
  - directions.pdf notes Python's stricter recursion limit, which "can be controlled using sys.setrecursionlimit(limit)".
  - It also says "Occasionally, to obtain a perfect score, 'fast input' is required."
- **Documentation allowed during the contest:** https://docs.python.org/3/reference/index.html (and the Python 2 equivalent). The rules list this Language Reference URL. Whether the library docs at docs.python.org/3/library count as allowed "official programming language documentation" is not stated explicitly. They are probably covered by that phrase, but this is **UNVERIFIED**.
- **CCO / CIW:** CCO participants must use **C++** (2025, 2026). CIW participants use C++ or Python (2026). So a Python-only learner can write the CCC but would need C++ for the CCO.
- **DMOJ [S]:**
  - All CCC problems accept both `PY3` (CPython) and `PYPY3` (API language lists).
  - DMOJ's runtime image installs Debian's `python3` and the latest PyPy3 from pypy.org (github.com/DMOJ/runtimes-docker, tier1 Dockerfile). These are therefore **newer** than the CCC Grader's PyPy3 7.3.9 / Python 3.8.
  - Exact live versions (dmoj.ca/runtimes is Cloudflare-blocked): **UNVERIFIED**.
  - A learner practising on DMOJ could use 3.10+ features that would **fail on the CCC Grader**.

## 5. Input/output conventions and what is permitted
**I/O (2026 rules [P]):**
- "All input is from standard input and all output is to standard output. Submitted programs must not read or write to files."
- "Output must match the output format specified in the problem exactly. Prompts or additional output must not be produced."
- History:
  - Up to 2012, input came from a file `sX.in`.
  - 2013–2016 supported both modes: a file for teacher grading, stdin for the Grader.

**Allowed during the contest (2026 rules [P]):**
- Internet may be used only "for editing code, code compilation, contest submission, and consulting official programming language documentation". Listed examples: cplusplus.com, cppreference, the Java 17 API, the Python 2/3 reference, the GNU C manual.
- "All other Internet use is forbidden. This includes email, chat, web search, code forums, and **generative AI such as CoPilot or ChatGPT**."
- "Any editors or integrated development environments (IDEs) can be used ... This includes online editors and online compilation tools. However, **AI-based tools within an IDE cannot be used**."
- "Access to other source or starter code is not allowed ... both electronic and printed source code, either created by the contestant or gathered elsewhere." **So no personal templates or snippet libraries.**
- Allowed physical items: most calculators, rough/graph paper, rulers, compasses, and paper translation dictionaries. Electronic translators are not allowed.
- Change over time: the pre-2016 instructions allowed "Books and written materials". The 2026 rules list only the items above and ban printed source code. Whether printed non-code notes are allowed in 2026: **UNVERIFIED** (the rules neither list nor ban them explicitly).

**Rule changes, 2023–2026:**

| Year | Change | Source |
|---|---|---|
| 2021–2022 | Remote participation from home was allowed (COVID period) | [S] KTBYTE blog. Details **UNVERIFIED** from a primary source. |
| 2023 | Back to in-person only, under supervision at a registered school | [S] KTBYTE (quotes the organisers' Jan 2023 note) |
| 2025 | A two-week administration window was allowed. **Results were withheld**: the co-chairs (J.P. Pretti and Troy Vasiga) wrote that "many students submitted code that they did not write themselves", and ranking was "neither equitable, fair, or accurate". The booklet has no ranking or honour roll. Press cited AI assistants such as Copilot (The Logic, 2025-04-25; TechSpot, 2025-04-28). The CCO still ran (26–30 May 2025, with medallists published). | [P] 2025CCCResults.pdf, 2025 cco_summary.pdf; [S] https://thelogic.co/news/waterloo-university-coding-competition-ai-cheating/ , https://www.techspot.com/news/107701-ai-cheating-forces-university-waterloo-withhold-coding-competition.html |
| 2026 | Single official contest date (no two-week window). Screen recordings recommended. Explicit bans on generative AI and on AI tools inside IDEs. Junior honour roll dropped. CIW added (CIW itself may predate 2026; its first year is UNVERIFIED). Ranking list covers official participants only. | [P] snapshot diff, rules.pdf (Feb 2026), 2026 booklet |
| AI clause | The first year the rules explicitly named ChatGPT/Copilot: **UNVERIFIED**. It is certainly present in the Feb 2026 rules. | |

## 6. History of format changes (timeline)

| Years | Format facts | Source |
|---|---|---|
| 1995–1996 | CCC founded (1995); first contest held in 1996 | [S] Wikipedia, PEGWiki |
| 1996–1999 | A single Stage 1 paper: 5 problems × 15 marks = 75, 3 hours | [S] PEGWiki (https://wcipeg.com/wiki/Canadian_Computing_Competition) |
| 2000 onward | Stage 1 split into **Junior** and **Senior** | [S] PEGWiki |
| ≤2012 | Teachers ran the contest and marked with official test data. Input came from `sX.in`. Any language the teacher could judge was allowed (Turing, VB, Pascal, C/C++, Java and others). Top 2 Senior per region got plaques and $100. Top 20 went to "CCC Stage 2" (C, C++ or Pascal only). "You may only compete in one competition." | [P] 2005/2008/2010/2012 Senior PDFs; [S] Wikipedia |
| 2012–2013 | The CEMC online judge (CCC Grader) was introduced. PEGWiki says 2012. The first statement to mention it is **2013**, which offered both teacher and Grader modes. | [P] 2013 PDF; [S] PEGWiki. The exact year is uncertain. |
| 2013–2016 | Senior limit of 5 s per test case, in both modes | [P] |
| 2014 | Stage 2 renamed **Canadian Computing Olympiad (CCO)** | [S] PEGWiki; [P] 2014/2015 PDFs say "CCO" |
| 2016 | Last statement set to mention teacher grading and "only compete in one competition". CCO languages listed as C, C++, Java or Pascal. | [P] 2016 PDF |
| 2017 | Time limit printed per problem (1–5 s). Subtasks described in words ("For 7 of the 15 points available, N ≤ 1000"). | [P] 2017 PDF |
| 2018 onward | No time limits printed in statements. Subtask mark tables. Online Grader only (teacher grading gone; the exact year it ended is UNVERIFIED). | [P] |
| 2021–2022 | Remote writing allowed | [S] |
| 2023 | In-person at school again | [S] |
| By 2024 | Languages: C, C++, Python 2, Python 3, Java. Python runs on PyPy 7.3.9. 50 submissions per problem, best submission counts, one timer across both divisions. | [P] sample_soln.pdf, directions.pdf, CCC page |
| 2025 | Two-week window; results withheld because of cheating | [P] |
| 2026 | Single date, screen recording, strict AI ban, Senior-only honour roll, CIW | [P] |
| 2027 | Wed 17 Feb 2027 / Thu 18 Feb 2027 | [P] live CCC page |

**Point totals:**
- In every year sampled from 2008 to 2026, Senior was 5 × 15 = 75 [P, statements and booklets].
- I found no primary evidence of a different Senior total. Any such years before 2008 are **UNVERIFIED**.
- The per-problem DMOJ point values in §3 are DMOJ's own weights, **not** CCC marks.

## 7. Scoring outcomes
**Senior statistics** [P, results booklets]. "S avg" is the sum of the five all-contestant problem averages. "Group 1 min" is the lowest score in Senior honour-roll Group 1.

| Year | Senior N | S avg /75 | S5 avg (all / non-zero) | **Perfect 75s** | Next-best score | Group 1 min |
|---|---|---|---|---|---|---|
| 2016 | 1225 | 24.6 | 0.94 / 2.26 | 7 | 73 | — |
| 2017 | 1925 | 37.7 | 0.17 / 10.83 | 5 | 73 | 51 |
| 2018 | 2144 | 19.7 | 0.10 / 5.28 | 3 | 69 | 56 |
| 2019 | 2719 | 21.8 | 0.06 / 6.87 | 3 | 64 | 48 |
| 2020 | 2827 | 15.2 | 0.08 / 13.00 | 9 | 69 | 54 |
| 2021 | 2920 | 26.5 | 0.46 / 7.08 | **32** (remote year) | 73 | 64 |
| 2022 | 3262 | 19.5 | 0.12 / 12.74 | 17 | 70 | 60 |
| 2023 | 3420 | 17.4 | 0.16 / 4.56 | 8 | 67 | 52 |
| 2024 | 3947 | 26.8 | 0.26 / 2.27 | 6 | 72 | 60 |
| 2025 | 3917 | 23.71 (CCC page) | n/a | **not published** | n/a | n/a |
| 2026 | 2439 (official only) | 15.56 | 0.05 / 1.12 | **0** (top score 69) | 69, 65, 61 | 51 |

Notes:
- Perfect counts = the rank of the first score below 75, minus 1, from the "Student Rankings" tables.
- In 2026 the ranking covers official participants only. Earlier booklets do not say whether unofficial participants are included (**UNVERIFIED**).
- **A perfect Senior score is rare:**
  - 3–17 per year in 2016–2024 (2021, a remote year, had 32). That is about 0.1–0.5% of Senior contestants.
  - **Nobody scored 75 in 2026.** The S5 average among contestants who scored on it was 1.12/15.
  - Even the S4 all-contestant averages are only 0.4–0.7.

**Certificate of Distinction (top 25%) cutoffs** [P, CCC page]:
| Year | Senior cutoff | Junior cutoff |
|---|---|---|
| 2024 | 32 | 51 |
| 2025 | 34 | 50 |
| 2026 | 26 | 58 |

**Junior 2026 comparison:** 176 perfect scores out of 3421 (75 at rank 1, next score 73 at rank 177) [P].

**Link to the CCO:**
- About 20 of the top **official** CCC Senior participants from Canadian schools are invited to the CCO (a week at Waterloo in spring, used to pick the IOI team). Citizens or permanent residents at schools abroad may also be invited. Selection is "at the discretion of the CEMC". [P]
- CCO medals are "based on their results in both the CCC and CCO competitions". Gold gets $500, silver $200. [P]
- CIW: about 10 top official female-identifying or non-binary Senior participants. [P]
- No invitation cutoff score is published. The 2024 invitee list existed at .../2024/CCO_invite.pdf but could not be retrieved.
- **Estimate** (my count of Canadian-located names in honour-roll Group 1, ignoring opt-outs):
  - 2026: 21 Canadian students scored ≥51, so the invitation line was roughly **~50**.
  - 2024: 28 Canadians scored ≥60, so roughly **~60+**.
  - 2023: 22 Canadians scored ≥52, so roughly **~52**.
  - The exact cutoffs are **UNVERIFIED**.

**Meaning of "perfect score":** 75/75 on the Senior paper, which requires full marks on all five problems including S5 ("IOI level").

## 8. Implications for the curriculum
1. **Treat 75/75 in Python as a stretch goal, not a guarantee.**
   - CEMC itself says Python may not reach a perfect score.
   - The Grader runs PyPy3 7.3.9 (Python 3.8) under a default 3 s limit.
   - The app should teach Python performance habits from day one:
     - fast input (`sys.stdin.buffer.read().split()` / `sys.stdin.readline`);
     - avoiding per-element function-call overhead in hot loops;
     - flat lists instead of nested objects;
     - iterative DFS/BFS instead of recursion, or `sys.setrecursionlimit` together with a threading stack-size workaround (the latter is **UNVERIFIED** on PyPy/the Grader);
     - `heapq`, `bisect`, `collections.deque`, `array`, prefix sums.
   - Consider an optional late module on reading C++ solutions or writing C++ for S5. This is also needed for the CCO.
2. **Restrict the language level to Python 3.8.**
   - Tell exercises, linters and any in-app runner to reject 3.9+ features (`match`, `math.lcm`, `bisect` `key=`, `itertools.pairwise`, `str.removeprefix`, built-in generic hints such as `list[int]`).
   - Warn that DMOJ's newer PyPy/CPython will accept code the CCC Grader rejects.
3. **Plan for partial marks.**
   - The score is the best submission per problem, and wrong submissions cost nothing (≤50 per problem, one per minute).
   - Teach "bank the subtasks":
     - write brute force for the small subtasks first and submit;
     - then write the efficient solution;
     - read the subtask table before designing anything.
   - Train learners to match each subtask to the complexity it needs (for example N ≤ 5000 means O(N²), N ≤ 3×10^5 means O(N log N)).
4. **Use feedback well.** Sample results are always shown, and each subtask shows results up to its first failing test. Teach learners to read the verdicts (WA/TLE/RTE, skipped tests) and to adjust, rather than guess.
5. **Get I/O exactly right.**
   - Read stdin, write stdout, no prompts, no file I/O.
   - Match output format exactly; some problems accept any valid answer.
   - Handle large numbers (10^18 is native in Python) and edge cases such as N = 0 lights or A = B.
   - The app's judge should compare output as strictly as the CCC Grader does.
6. **Test against the samples, then beyond them.**
   - Write your own tests and stress tests (brute force compared with the fast solution on random inputs).
   - Use CEMC's official test data (published per year as zip files) to grade practice runs.
7. **Manage the 3 hours.**
   - Senior averages drop steeply from S1 to S5.
   - A strong plan: finish S1–S2 quickly, bank the subtasks of S3–S5, then push for full solutions.
   - Submit well before the end, because late submissions are risky.
   - One timer covers both Junior and Senior. The learner should write only Senior once ready.
8. **Train under contest conditions.**
   - Practise with no AI, no web search and no personal templates (templates are banned in 2026).
   - Allow only the official Python docs. Teach navigation of docs.python.org, since it is the only reference allowed.
   - The app's "mock contest" mode should enforce all of this.
9. **Practise on the right platforms.**
   - DMOJ (ccc* problems, PYPY3 recommended to mirror the Grader) and the CCC Grader practice contests.
   - DMOJ time limits differ from the CCC Grader's (for example ccc25s1 is 0.5 s on DMOJ).
10. **Set realistic milestones from the data.**
    - Certificate of Distinction: about 26–34/75.
    - Honour roll: about 35–51.
    - Likely CCO invitation: about 50–60 (Canadian official participants).
    - Perfect: 75.

## Open / unverified items
1. The actual per-problem time and memory limits on the CCC Grader for 2024–2026 (statements print none; the rules default is 3 s / 512 MB).
2. Whether the default PyPy3 7.3.9 / Python 3.8 changed after April 2024 (the 2026 J4 note suggests it did not). Whether CCC 2027 will upgrade.
3. Exact live Python/PyPy versions on DMOJ (dmoj.ca/runtimes is blocked by Cloudflare).
4. The year the explicit AI clause entered the rules, and the full text of the 2025 rules.
5. Primary confirmation of remote writing in 2021–2022 and the in-person return in 2023 (only secondary sources so far).
6. The year Pascal, PHP and Perl were removed from the Grader. The year teacher-graded mode ended (2017 or later).
7. Online-grader start year (2012 per PEGWiki vs first mention in the 2013 statement).
8. Whether the older booklet rankings include unofficial participants (this affects the perfect-score counts).
9. CCO invitation cutoffs for any year (invitee lists could not be retrieved; my values are estimates).
10. Whether printed non-code notes and docs.python.org/3/library are explicitly allowed in 2026.
11. Pre-2008 Senior point totals (assumed 75; not checked against primary sources).
12. 2026 Senior commentary/editorial is not yet published (404 as of 2026-09-21).
