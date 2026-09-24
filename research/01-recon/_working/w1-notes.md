# W1 raw notes (contest format & rules)

Work files (downloaded PDFs/HTML, text extracts) were kept in the session scratchpad, not in the repo. This file records what was fetched and the raw numbers pulled out, so the work can be re-checked.

## Primary documents fetched (2026-09-21)
- CCC contest page (current, now showing CCC 2027 dates): https://cemc.uwaterloo.ca/contests/ccc
- Wayback snapshots of the same page: 2024-12-28 (describes CCC 2025) and 2025-11-10 (describes CCC 2026). I diffed the two (diff below).
- CCC Rules PDF: https://cccgrader.com/rules.pdf (PDF CreationDate 2026-02-17, so this is the CCC 2026 version)
- Language details / sample programs: https://cccgrader.com/sample_soln.pdf (CreationDate 2024-04-12)
- Grader instructions: https://cccgrader.com/directions.pdf (CreationDate 2024-05-29)
- cccgrader.com home page. WARNING: its HTML contains commented-out stale text (Python 3.4.0, GCC 4.8.4, Pascal/PHP/Perl). That text is NOT shown to users and NOT current. Do not cite it.
- Results booklets: https://cemc.uwaterloo.ca/sites/default/files/documents/YYYY/YYYYCCCResults.pdf for 2016–2026
- Senior problem sets 2022–2026 (HTML + EF PDFs), plus Senior PDFs from 2005, 2008, 2010, 2012–2021 (for the instruction pages)
- Senior commentaries 2022–2025. The 2026 Senior commentary is not published (404; past-contests page lists no Senior solutions for 2026).
- DMOJ API v2 problem objects for ccc23s*, ccc24s/j*, ccc25s/j*, ccc26s/j* (time limit, memory limit, points, language list). The HTML pages, /runtimes/ and /api/v2/languages are behind Cloudflare and could not be fetched.
- 2025 CCO summary: https://cemc.uwaterloo.ca/sites/default/files/documents/2025/cco_summary.pdf

## Diff: CCC page, Dec-2024 (CCC 2025) vs Nov-2025 (CCC 2026)
- Dates: 2025 = Wed Feb 19 2025 (Americas) / Thu Feb 20 2025 (elsewhere). 2026 = Wed Feb 18 2026 / Thu Feb 19 2026.
- Timing: 2025 said "Contest Supervisors are expected to administer the contest within the two-week contest period". 2026 dropped the two-week window. Current (2027) text: "as close to the beginning of the school day as possible ... on the official contest date".
- 2026 added screen recordings ("a new measure being used for the first time this year"). They are optional but strongly recommended for anyone hoping for a CCO/CIW invitation.
- 2026 added the CIW (Canadian Informatics Workshop, about 10 female-identifying/non-binary Senior participants). CIW languages: C++ or Python.
- 2026 dropped Junior honour rolls.
- Eligibility cutoff year: born on/after 1 Jul 2005 (CCC 2025), 1 Jul 2006 (CCC 2026), 1 Jul 2007 (CCC 2027).
- Language sentence in 2025: perfect score may not be possible in Python or Java "because the design of some languages limits the participants' ability to solve the hardest part of the hardest problems". The 2026+ wording is shorter but says the same thing.
- Stats block: 2024 J avg 39.77 / S avg 26.79, cutoffs J 51 / S 32, N J 6184 / S 3948. 2025 J avg 39.90 / S avg 23.71, cutoffs J 50 / S 34, N J 4758 / S 3917. 2026 J 42.65 / S 15.56, cutoffs J 58 / S 26, N J 3421 / S 2439.

## Senior perfect-score counts from the booklets' "Student Rankings" tables
Method: the rank of the first score below 75, minus 1.
- 2016: 75 at rank 1, 73 at rank 8 → 7 perfect (N=1225)
- 2017: 73 at rank 6 → 5 (N=1925)
- 2018: 69 at rank 4 → 3 (N=2144)
- 2019: 64 at rank 4 → 3 (N=2719)
- 2020: 69 at rank 10 → 9 (N=2827)
- 2021: 73 at rank 33 → 32 (N=2920)
- 2022: 70 at rank 18 → 17 (N=3262)
- 2023: 67 at rank 9 → 8 (N=3420)
- 2024: 72 at rank 7 → 6 (N=3947)
- 2025: no rankings published (results withheld)
- 2026: top score 69 (rank 1), 65, 61; 60 at rank 13 → 0 perfect. The ranking list covers official participants only (N=2439).

## Senior problem averages (all contestants / non-zero), taken from the booklets
2016 S1–S5: 11.03/13.09, 10.44/13.59, 1.39/8.40, 0.83/4.65, 0.94/2.26
2017: 14.12/14.93, 13.24/14.71, 6.20/11.04, 3.92/8.25, 0.17/10.83
2018: 9.70/11.85, 8.09/14.79, 1.11/9.46, 0.66/7.52, 0.10/5.28
2019: 13.47/14.91, 6.71/10.16, 1.43/6.42, 0.13/4.82, 0.06/6.87
2020: 8.79/10.66, 4.16/9.02, 1.83/5.64, 0.38/8.30, 0.08/13.00
2021: 13.38/14.56, 9.50/11.41, 2.47/6.58, 0.72/7.42, 0.46/7.08
2022: 11.03/12.18, 6.44/11.06, 1.41/7.40, 0.47/5.81, 0.12/12.74
2023: 11.06/12.52, 4.26/8.61, 1.56/5.90, 0.40/6.05, 0.16/4.56
2024: 13.73/14.48, 10.68/14.01, 1.65/3.49, 0.46/6.45, 0.26/2.27
2026: 7.69/9.81, 6.01/9.26, 1.39/7.31, 0.41/7.37, 0.05/1.12

## Honour-roll group boundaries (Senior)
The lower bound of Group 1 by year: 2017 51, 2018 56, 2019 48, 2020 54, 2021 64, 2022 60, 2023 52, 2024 60, 2026 51.
2026 groups: G1 51–75, G2 45–50, G3 39–44, G4 35–38.

Canadian-located entries in Senior honour-roll Group 1 (my count by province code; a rough proxy for CCO invitations): 2026: 21 at ≥51; 2024: 28 at ≥60; 2023: 22 at ≥52.

## Instruction pages in old Senior PDFs
- 2005/2008/2010/2012: input from the file sX.in, output to screen, teacher-judged. "You may only compete in one competition." Books and written materials allowed. Top 20 invited to Stage 2 (C, C++ or Pascal).
- 2013/2014/2015/2016: dual mode. If the teacher grades, input comes from sX.in; on the On-line CCC grader, input comes from stdin. Senior limit 5 s per test case. 2014/2015 name the stage "CCO". 2016 says CCO languages are C, C++, Java or Pascal.
- 2017: each problem states its own time limit (S1 1 s, S2 1 s, S3 2 s, S4 3 s, S5 5 s). There is no longer a separate instructions page.
- 2018 onward: no per-problem time limits in the statements. The rules PDF gives a default of 3 s / 512 MB "unless stated otherwise".

## Python details on the CCC Grader
- sample_soln.pdf (Apr 2024): Python 3 = "Pypy3 7.3.9 (running Python 3.8.13)". Python 2 = "Pypy 7.3.9 (running Python 2.7.18)". C/C++ GCC 11.4.0 (-O2, C++ with -std=c++17 -static). Java OpenJDK 17.0.10, class Main.
- 2026 J4 (Snail Path) technical note: "Python 3 submissions for this problem will be evaluated using the standard interpreter python3 (Version 3.10.12) instead of pypy3 7.3.9 (Version 3.8.13)." So in 2026 the default Python 3 on the contest grader was still PyPy3 7.3.9 (Python 3.8 language level). CPython 3.10.12 was used only when a problem said so.
- directions.pdf: Python limits recursion depth, and you can raise it with sys.setrecursionlimit. Sometimes "fast input" is needed for a perfect score.

## DMOJ (API v2 values; DMOJ sets its own limits, which differ from the CCC Grader)
ccc26s1 3s/1024MB 5pts; s2 3s 7pts; s3 1s 7pts; s4 2s 15pts; s5 5s 30pts
ccc25s1 0.5s/512MB 3pts; s2 2s 7pts; s3 7s 10pts; s4 4s 12pts; s5 4s 17pts
ccc24s1–s5 all 3s/1024MB; points 3/5/10/12/20
ccc23s1 1s, s2 1s, s3 1s, s4 2s, s5 2s, all 1024MB; points 5/7/10/15/20
language_resource_limits is [] for all of these, so there are no per-language limits on DMOJ. PY3 and PYPY3 are both accepted.
DMOJ runtime Dockerfile (github DMOJ/runtimes-docker tier1): Debian sid python3 plus the latest PyPy3 from pypy.org. I could not read the exact live versions (Cloudflare).
