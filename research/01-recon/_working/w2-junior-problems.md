# W2 — CCC Junior Problems Analysis (2014–2026)

Worker W2, Phase 1 (Recon). Written 2026-09-21. Audience: later agents building the curriculum for a zero-experience Python learner aiming at a perfect CCC Senior score, with Junior as the on-ramp.

**Method.** Every problem title and summary below comes from the official CEMC problem-set HTML pages for each year, which I downloaded and read in full. The 2022–2026 technique notes come from the official CEMC Junior commentaries. Difficulty is calibrated against (a) the official per-problem averages in the CEMC Results booklets and (b) DMOJ point values from the DMOJ API. Nothing below comes from memory alone. Anything I could not verify is marked **UNVERIFIED**.

---

## 0. Key sources

| What | URL |
|---|---|
| Past contests index (all problem sets, commentaries, test data) | https://cemc.uwaterloo.ca/resources/past-contests?grade=All&academic_year=All&contest_category=29 |
| CCC main page (format, levels, languages) | https://cemc.uwaterloo.ca/contests/ccc |
| CCC Rules (current) | https://cccgrader.com/rules.pdf |
| CCC Grader language versions | https://cccgrader.com/sample_soln.pdf |
| Junior problem sets | `https://cemc.uwaterloo.ca/sites/default/files/documents/{YEAR}/{file}`, where file = `2014CCCJrProblems.html`, `2015CCCJrProblems.html`, `2016CCCJrProblems.html`, `{2017..2021}CCCJrProblemSet.html`, `2025/2022CCCJrProblemSet.html` (the 2022 set sits in the 2025 folder), `2023CCCJrProblemSet.html`, `2024CCCJrProblems.html`, `2025CCCJrProblems.html`, `2026CCCJrProblems.html` |
| Junior commentaries | `.../2024/2022CCCJrCommentary.html`, `.../2024/2023CCCJrCommentary.html`, `.../2024/2024CCCJrCommentary.html`, `.../2026/2025CCCJrCommentary.html`, `.../2026/2026CCCJrCommentary.html` |
| Senior problem sets (used to check J/S overlap) | same folder pattern: `{YEAR}CCCSrProblems.html` / `{YEAR}CCCSrProblemSet.html` |
| Results booklets (per-problem averages) | `.../{YEAR}/{YEAR}CCCResults.pdf` (2016–2026; none found for 2014/2015 at this path) |
| DMOJ metadata (title, points, type tags, limits) | `https://dmoj.ca/api/v2/problem/ccc{YY}j{N}`; problems shared with Senior are only listed under their Senior code, e.g. `ccc26s2` |
| Sample Python solutions repo (spot check) | https://github.com/doduoduoniaodo/CCC-Solutions |

---

## 1. Junior contest format facts (verified, with year)

- **Current format (CEMC CCC page, read 2026-09):** Junior and Senior each have **5 problems × 15 marks = 75**, and you get **3 hours**. The official outline of Junior difficulty:
  - Q1–2 are "Straightforward (e.g. basic loops and conditions)".
  - Q3–4 are "More challenging (e.g. some combination of loops, conditions and counting)".
  - Q5 is "Progressively advanced material (e.g. recursion, two-dimensional arrays, efficient/insightful algorithms)".
  - Subtasks give partial marks. Later subtasks exist specifically to reward efficient solutions.
- **Rules (cccgrader.com/rules.pdf, current):**
  - Input comes from stdin and output goes to stdout. **Output must match exactly, with no prompts.**
  - The default limit is **3 s and 512 MB** unless a problem says otherwise.
  - You get up to 50 submissions per problem, at most one per minute.
  - Your problem score is the max over your submissions. Your overall score is the max of your Junior and Senior scores.
  - The 3-hour timer is shared if you write both contests.
  - Feedback is shown per subtask.
  - Official language documentation is allowed. Web search, forums and generative AI are forbidden.
- **Python on the CCC Grader (sample_soln.pdf, current):** "Python 3" runs on **PyPy3 7.3.9, which implements Python 3.8.13**. "Python 2" runs on PyPy 7.3.9 (Python 2.7.18). Consequences:
  - **Python 3.10+ syntax such as `match` is unavailable.**
  - Neither are 3.9+ helpers: `math.lcm`, `str.removeprefix`, `list[int]` generics, `itertools.pairwise`, and `bisect` with `key=`.
  - Available on 3.8: `math.isqrt`, `math.comb`, `math.prod` and the walrus operator.
  - The feature list is inferred from the version number, not tested on the grader.
  - **Exception, 2026 J4:** the problem statement says Python 3 for that one problem is evaluated with **CPython 3.10.12 instead of PyPy3**, and warns about memory. So the CEMC can switch interpreters per problem, which makes the "Technical Notes" section of each problem worth reading.
- **Languages allowed (current):** C, C++, Python 2, Python 3, Java. The CEMC states: "it may not always be possible to achieve a perfect score with a particular language choice (for example, Python or Java)".
- **2014–2016 format:**
  - Each PDF says the solutions could be graded by the teacher (keyboard input) or on the online grader.
  - There was **at most 5 s execution time per test case**.
  - Students could write only one paper.
  - 2016 was scored out of 75 with 15 marks per problem (2016 J5 statement: "For 8 of the 15 available marks...").
  - 2014/2015 used the same 5-problem Junior layout. The **15-marks-per-problem scale for 2014/2015 is UNVERIFIED**, because no results booklet was found. The 2015 J5 statement gives its subtasks as percentages.
- **2017:** each problem statement showed its own time limit (J1–J4 1 s, J5 2 s).
- **2025:** **no official results were released** because "a significant number of students ... submitted code that they did not write themselves" (2025 Results booklet). **2026:** results were released. Junior had 3,421 contestants, down from 6,185 in 2024.
- **Number of Junior problems:** 5 in every year from 2014 to 2026, with no exceptions found.

---

## 2. Junior/Senior overlap (verified against both official problem sets)

The official pages label shared problems as "J4/S1", "J5/S2" and so on from 2018. For 2014, 2016 and 2017 I confirmed the overlap by matching titles and statements between the Junior and Senior sets.

| Year | Shared problem | Title |
|---|---|---|
| 2014 | J4 = S1 | Party Invitation |
| 2014 | J5 = S2 | Assigning Partners |
| 2015 | none | (S1 "Zero That Out" is not in the Junior set) |
| 2016 | J5 = S2 | Tandem Bicycle |
| 2017 | **J5 = S3** | Nailed It! (the only case of S3 overlap) |
| 2018 | J4 = S2 | Sunflowers |
| 2019 | J4 = S1 | Flipper |
| 2020 | J5 = S2 | Escape Room |
| 2021 | J5 = S2 | Modern Art |
| 2022 | J4 = S2 | Group Work (DMOJ calls it "Good Groups", ccc22s2) |
| 2023 | J4 = S1 | Trianglane |
| 2024 | **none** | J5 Harvest Waterloo is Junior-only; S1 is "Hat Circle" |
| 2025 | **none** | S1 is "Positioning Peter's Paintings" |
| 2026 | J5 = S2 | Beams of Light |

Notes:
- **2022 J4/S2 used different subtask weights per level.** Junior gave 4+10+1: only 1 mark needed the efficient dict-based lookup. Senior gave 3+5+7. The same problem is therefore "easier" as a Junior problem.
- **DMOJ lists shared problems only under the Senior code** (e.g. `ccc26s2`, `ccc20s2`).
- Takeaway for the curriculum: 11 of the 13 years share a problem, and in each of those years **mastering J4/J5 means already solving one of S1–S3**.

---

## 3. Per-year tables

Columns:
- **Diff** is on a 1–10 scale relative to the Junior contest: 1 = trivial J1, 10 = the hardest J5 seen. It weighs the official all-contestant average (out of 15) and DMOJ points.
- **Avg** is the official all-contestant average from the Results booklet (2016–2026, none for 2025).
- **DMOJ** is DMOJ points: 3 = easy, 5, 7, 10, and 20 = hard.

### 2014 (source: 2014CCCJrProblems.html; no results booklet found)

| # | Title | Summary | Topics | Techniques / Python constructs | Subtasks | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|
| J1 | Triangle Times | Read 3 angles and classify as Equilateral, Isosceles, Scalene or Error. | conditionals | `int(input())`, if/elif/else, `==`, `and`, sum | none | 1 | 3 | none |
| J2 | Vote Count | Count A vs B characters in a string (V ≤ 15) and print A, B or Tie. | counting, strings | `str.count` or a loop, comparison | none | 1 | 3 | none |
| J3 | Double Dice | Simulate n ≤ 15 dice rounds. Each player starts at 100 and the lower roll loses the higher value. | simulation | for loop, `split()`/`map(int,...)`, accumulators | none | 2 | 3 | none |
| J4 (=S1) | Party Invitation | Friends 1..K. In each of m rounds, remove the people at positions that are multiples of r_i, then print who is left. | list manipulation, simulation | lists, list comprehension with `enumerate`, 1-based vs 0-based positions | none | 3 | 5 (S1) | trivial sizes |
| J5 (=S2) | Assigning Partners | Two lines of N names define partner pairs. Check the pairing is symmetric and nobody is their own partner. | mappings, validation | `dict` from `zip`, loop checks | none | 3 | 5 (S2) | trivial sizes |

### 2015 (source: 2015CCCJrProblems.html)

| # | Title | Summary | Topics | Techniques | Subtasks | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|
| J1 | Special Day | Is a (month, day) date Before, After, or on Feb 18 ("Special")? | conditionals | nested/compound if, tuple comparison | none | 1 | 3 | none |
| J2 | Happy or Sad | Count `:-)` and `:-(` in a line and print none, unsure, happy or sad. | strings | `str.count`, if-chains | none | 1 | 3 | none |
| J3 | Rövarspråket | Replace each consonant with itself + nearest vowel (ties go to the earlier vowel) + next consonant (z stays z). | string building, char arithmetic | `ord`/`chr`, lookup tables, loops, `''.join` | none | 3 | 5 | none |
| J4 | Wait Time | Process R/S/W message log entries. Compute each friend's total reply wait, or −1 if a message was never answered. | simulation, event processing | `dict` per friend, time counter, sorted output | none | 4 | 5 | none |
| J5 | π-day | Count the ways to give n ≤ 250 pie pieces to k people with non-decreasing amounts (integer partitions). | combinatorics, **DP/recursion** | recursion + memoization (`functools.lru_cache`) or a 2D/3D DP table | 20% n≤9, 50% n≤70, 85% n≤120 | 8 | 10 (DP) | plain recursion blows up exponentially, so memoize. Watch recursion depth; DMOJ TL is 0.5 s |

### 2016 (source: 2016CCCJrProblems.html; averages from 2016CCCResults.pdf; 2,008 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Tournament Selection | Count W among 6 lines and map the count to group 1, 2, 3 or −1. | counting, conditionals | loop of `input()`, counter, if/elif | none | 12.58 | 1 | 3 | none |
| J2 | Magic Squares | Is a 4×4 grid magic (all row and column sums equal)? | 2D lists | nested lists, `sum`, column sums with zip or loops | none | 10.32 | 2 | 3 | none |
| J3 | Hidden Palindrome | Find the length of the longest palindromic substring of a string with ≤ 40 letters. | strings, **brute force** | nested loops over substrings, slicing `s[::-1]` | none | 5.72 | 4 | 5 | O(n³) is fine |
| J4 | Arrival Time | Departure HH:MM plus a 2-hour commute, where rush hours (07–10, 15–19) halve the speed. Output the arrival time. | time simulation | parse `HH:MM`, minute-by-minute simulation, modulo 24h, zero-padded output (`f"{h:02d}"`) | none | 5.35 | 5 | 5 | none |
| J5 (=S2) | Tandem Bicycle | Pair two teams of N ≤ 100 speeds to minimise (Q1) or maximise (Q2) the sum of per-pair max speeds. | **greedy + sorting** | `sort`, `reverse`, `zip` | 8 marks Q1, 7 marks Q2 | 3.76 | 5 | 5 (S2) | none |

### 2017 (source: 2017CCCJrProblemSet.html; 2,360 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Quadrant Selection | Print the quadrant of (x, y). | conditionals | if/elif with `and` | none | 12.03 | 1 | 3 | none |
| J2 | Shifty Sum | N + N·10 + … + N·10^k. | loops, arithmetic | for loop or `**` | none | 10.53 | 1 | 3 | none |
| J3 | Exactly Electrical | Can you go from (a,b) to (c,d) on a grid using exactly t moves? | **math insight** (Manhattan distance + parity) | `abs`, `%` | 3 marks tiny coords, 3 marks t ≤ 8 | **1.02** | 5 | 3 | the brute-force subtasks were meant for BFS/search; the insight is O(1) |
| J4 | Favourite Times | Count clock times from 12:00 over D ≤ 10⁹ minutes whose digits form an arithmetic sequence. | simulation + **periodicity** | digit extraction, 12-hour clock logic, count per 720-minute cycle × full cycles + remainder | 4 marks D ≤ 10,000 | 0.36 | 6 | 5 | simulating 10⁹ minutes is far too slow, so use the cycle |
| J5 (=S3) | Nailed It! | N ≤ 10⁶ wood lengths ≤ 2000. Pair them into boards to make the longest fence of equal-sum boards; also count the heights that achieve it. | **counting array / frequency** | `cnt[length]`, loop over pairs of lengths (2000² sums), `min` of counts | 7 marks N≤100, +6 N≤1000, +1 N≤10⁵ | 0.28 | 8 | 7 (S3) | reading 10⁶ ints needs `sys.stdin`. The 2000×2000 loop is 4·10⁶, fine in PyPy |

### 2018 (source: 2018CCCJrProblemSet.html; 3,017 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Telemarketer or not? | 4 digits: first ∈ {8,9}, last ∈ {8,9}, middle two equal → ignore, otherwise answer. | conditionals | `in`, `and` | none | 13.04 | 1 | 3 | none |
| J2 | Occupy parking | Count positions where both strings have `C`. | strings, counting | index loop or `zip` | none | 10.73 | 1 | 3 | none |
| J3 | Are we there yet? | Given 4 gaps between 5 cities on a line, print the 5×5 distance table. | **prefix sums**, 2D output | cumulative positions, `abs`, `' '.join(map(str,row))` | none | 9.33 | 2 | 3 | none |
| J4 (=S2) | Sunflowers | An N×N table (N ≤ 100) was rotated by a multiple of 90°. Restore it so rows and columns increase. | **2D arrays, rotation** | rotate with `zip(*grid[::-1])`, check first row/col ordering | none | 2.74 | 5 | 5 (S2) | none |
| J5 | Choose your own path | Pages form a directed graph (N ≤ 10⁴). Is every page reachable from page 1, and what is the shortest path to an ending page? | **graphs, BFS** | adjacency lists, `collections.deque`, distance array | 4 marks small, +3 acyclic, +4 medium | 0.25 | 7 | 7 | BFS is O(N+M), fine |

### 2019 (source: 2019CCCJrProblemSet.html; 3,713 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Winning Score | Two teams' counts of 3/2/1-point scores. Output A, B or T. | arithmetic, conditionals | 6 `int(input())` | none | 13.92 | 1 | 3 | none |
| J2 | Time to Decompress | Each line "N x" → print x repeated N times. | loops, strings | `split`, string `*` | none | 10.70 | 1 | 3 | none |
| J3 | Cold Compress | Run-length encode each line into "count char" pairs. | strings, **run detection** | loop comparing with the previous char, output building | none | 5.82 | 3 | 5 | none |
| J4 (=S1) | Flipper | Apply ≤ 10⁶ H/V flips to the 2×2 grid [1 2 / 3 4] and print the result. | simulation → **parity insight** | count H and V mod 2, or simulate by swapping | 8 marks ≤ 1000 chars | 8.35 | 3 | 3 (S1) | direct simulation of 10⁶ swaps is fine in PyPy; parity is O(1) |
| J5 | Rule of Three | Given 3 substitution rules, find a sequence of exactly S ≤ 15 rule applications turning I into F, and print the steps. | **recursive search / backtracking** with pruning | DFS recursion, string slicing/replace at a position, path recording, pruning by length bounds, memoising dead states in a set | 7 marks S ≤ 6, +7 S ≤ 12 (1 mark for S ≤ 15) | **0.20** | **10** | **20** (Divide & Conquer, Recursion) | the hardest Junior problem in this period. Exponential search needs pruning and a visited set of (step, string) pairs. **UNVERIFIED** whether pure Python reliably gets the last mark |

### 2020 (source: 2020CCCJrProblemSet.html; 3,769 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Dog Treats | Is S + 2M + 3L ≥ 10? Print happy or sad. | arithmetic, if | none | none | 14.19 | 1 | 3 | none |
| J2 | Epidemiology | Each day every newly infected person infects R more. Find the first day the total exceeds P ≤ 10⁷. | **while loop** simulation | running totals, while | none | 10.87 | 2 | 3 | none |
| J3 | Art | N paint points given as "X,Y". Output the smallest enclosing frame (min−1, max+1). | min/max, parsing | `split(',')`, `min`, `max` | 12 marks: all two-digit coords | 7.75 | 2 | 3 | parse on the comma, not by fixed width |
| J4 | Cyclic Shifts | Does text T (≤ 1000 chars) contain any cyclic shift of S? | strings, brute force | build all rotations `s[i:]+s[:i]`, `in` operator | 6 marks \|S\| = 3 | 5.97 | 4 | 5 | O(\|S\|·\|T\|) with built-in `in` is fine |
| J5 (=S2) | Escape Room | M×N ≤ 1000×1000 grid of values. From cell value x you may jump to any (a,b) with a·b = x. Can you reach (M,N)? | **graphs, BFS** (reverse the jump: search from the target) | 2D input, dict value → cells, BFS with deque, visited set, divisor enumeration | 1 mark 2×2, +2 M=1, +4 unique values, +4 ≤ 200×200 | 1.02 | 9 | 10 (S2) | 10⁶ numbers: use `sys.stdin.buffer.read().split()`. The reverse-BFS approach is fast enough; divisor-per-cell forward BFS may TLE in Python |

### 2021 (source: 2021CCCJrProblemSet.html; 4,003 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Boiling Water | P = 5B − 400. Then print −1, 0 or 1 for below, at or above sea level. | formula, if | none | none | 14.02 | 1 | 3 | note: pressure > 100 means **below** sea level (−1) |
| J2 | Silent Auction | Name/bid pairs. Highest bid wins; ties go to the earliest. | max with tie-break | loop, strict `>` comparison | none | 11.15 | 1 | 3 | none |
| J3 | Secret Instructions | 5-digit codes: digit-sum parity of the first two gives left/right (00 means repeat the previous); the last 3 digits are steps. Input ends at 99999. | **sentinel loop**, strings | `while True` + `break`, slicing, `%` | none | 9.53 | 2 | 5 | none |
| J4 | Arranging Books | Minimum swaps to sort a string of L/M/S (≤ 500k chars) into L…M…S. | **greedy counting** | count letters, count misplaced items per region, pair direct swaps then 3-cycles | 7 marks L/S ≤ 1000, +2 L/S 500k, +4 LMS ≤ 1000, +2 LMS 500k | 2.37 | 7 | 7 (Greedy) | the O(n) counting solution is fine |
| J5 (=S2) | Modern Art | M×N canvas. K row/column toggles. Count gold cells. | 2D simulation → **counting/parity** | toggle counts per row/col mod 2; answer = r(N−c) + c(M−r) | 1 mark 1×1, 4 marks 1 row, 5 marks ≤ 100², 5 marks MN ≤ 5·10⁶, K ≤ 10⁶ | 2.97 | 6 | 7 (S2) | a full grid toggle simulation TLEs. The parity formula is O(M+N+K); read input quickly |

### 2022 (source: 2025/2022CCCJrProblemSet.html + 2022 Jr commentary; 4,909 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Cupcake Party | 8R + 3S − 28. | arithmetic | none | none | 14.03 | 1 | 3 | none |
| J2 | Fergusonball Ratings | Rating = 5·points − 3·fouls per player. Count ratings > 40 and append `+` if every player is > 40. | loop, count, flag | reads 2 lines per loop iteration, boolean flag, string concatenation | none | 12.58 | 2 | 3 | print exactly one line |
| J3 | Harp Tuning | Split one line like `AFB+8HC-4` into instructions and print "letters tighten/loosen N". | **tokenizing** strings | character loop with state/previous char, `isalpha`/`isdigit` | 5/5/3/2 by instruction count, letters, multi-digit turns | 7.84 | 4 | 5 | none |
| J4 (=S2) | Group Work | Count the violated must-be-together / must-be-apart constraints given groups of 3. | **dict lookup**, logic | map name → group id via `dict`, compare | Jr: 4 (Y=0) + 10 + 1 (100k) | 3.60 | 5 | 5 (S2) | the last mark needs O(1) dict lookup, not list search |
| J5 | Square Pool | N×N yard (N ≤ 500k) with T ≤ 100 trees. Find the largest tree-free square. | brute force → **recursion** → **coordinate candidates** (cubic in T) | nested loops, recursion splitting the region, candidate top/left edges from tree coordinates | 3 T=1, 5 N≤50 T≤10, 4 N≤500k T≤10, 3 T≤100 | 0.78 | 10 | 10 | "Earning more than 8 marks on J5 was especially difficult" (commentary). O(T³) = 10⁶ is fine |

### 2023 (source: 2023CCCJrProblemSet.html + 2023 Jr commentary; 6,242 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Deliv-e-droid | 50P − 10C, plus 500 if P > C. | arithmetic, if | none | none | 13.41 | 1 | 3 | none |
| J2 | Chili Peppers | Sum the SHU values for N pepper names from a fixed table. | **lookup table** | `dict` literal, accumulate | none | 12.21 | 1 | 3 | none |
| J3 | Special Event | N people × 5 days of Y/. availability. Print the day(s) with the most attendees, comma-separated. | counting per column, ties | list of 5 counts, `max`, `','.join` | 6 one all-day, 6 unique max, 3 ties | 8.68 | 3 | 5 | no trailing comma |
| J4 (=S1) | Trianglane | 2×C strip of alternating up/down triangles, some black. Compute the perimeter of the black regions. | **counting/geometry** | 3·(black count) − 2·(shared edges); vertical adjacency only at even columns | 3/3/5 (C ≤ 2000), 4 (C ≤ 200k) | 4.79 | 5 | 5 (S1) | one pass; no built-in search inside a loop |
| J5 | CCC Word Hunt | Count occurrences of word W in an R×C ≤ 100×100 grid along straight lines (8 directions) or with one right-angle bend. | **2D grid brute force**, direction vectors | `dr, dc` lists, bounds checks, helper functions, perpendicular direction pairs | 2 horizontal, 2 +vertical, 2 +diagonal, 9 with bends | 0.76 | 8 | 10 | brute force is intended ("not possible to solve more efficiently"); the difficulty is implementation and edge cases |

### 2024 (source: 2024CCCJrProblems.html + 2024 Jr commentary; 6,185 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Conveyor Belt Sushi | 3R + 4G + 5B. | arithmetic | none | none | 13.60 | 1 | 3 | none |
| J2 | Dusa And The Yobis | Keep eating while the Yobi is smaller than Dusa, and print Dusa's size at the first one that isn't. **The number of inputs is not given.** | **while loop with unknown input count** | `while` + `input()`, break condition | none | 11.72 | 2 | 3 | the commentary calls this "a twist ... at this early point" |
| J3 | Bronze Count | N ≤ 250k scores (0..75). Find the 3rd-highest distinct score and how many got it. | max/distinct, sorting, counting | `set`, `sorted(reverse=True)`, `count`, or a frequency array of size 76 | 6 distinct small, 7 non-distinct small, 2 N ≤ 250k | 9.30 | 3 | 5 | use a constant number of passes; avoid `list.remove` in a loop |
| J4 | Troublesome Keys | Given pressed and displayed strings, find the silly key (types a wrong letter), the wrong letter, and the quiet key (types nothing). | strings, **case analysis**, simulation, sets/dicts | set differences, scan for the first mismatch, `str.replace` for verification | 3/3/5 (N ≤ 50), 4 (N ≤ 500k) | 3.25 | 6 | 7 | the pass count must not depend on N |
| J5 | Harvest Waterloo | R×C ≤ 100k patch with S/M/L pumpkins and hay `*`. Sum the pumpkin values reachable from the start. | **flood fill (BFS/DFS)** on a grid | grid as list of lists, deque/stack, visited marking, 4-direction moves | 1 no hay, 4 rectangles, 5 small, 5 large | 1.90 | 7 | 7 (Graph Theory) | recursive DFS needs `sys.setrecursionlimit` (commentary), and deep recursion is risky in PyPy, so **prefer iterative BFS**. Mark cells visited when pushing, not when popping |

### 2025 (source: 2025CCCJrProblems.html + 2025 Jr commentary; **no official results released**, so no averages)

| # | Title | Summary | Topics | Techniques | Subtasks | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|
| J1 | Roller Coaster Ride | Are you on the next train? Check N ≤ C·P. | arithmetic, if | none | none | 1 | 3 | output lowercase yes/no |
| J2 | Donut Shop | Start with D. Apply E events, each a `+`/`-` line followed by a quantity line. | loop, conditional updates | read 2 lines per iteration, string vs int | none | 2 | 3 | none |
| J3 | Product Codes | For each code: keep the uppercase letters in order and append the sum of all (possibly negative, multi-digit) integers. | **tokenizing**, char classes | `isupper`/`islower`/`isdigit`, number building, sign handling | 2 positive single-digit, 2 single-digit, 7 multi-digit positive, 4 all | 4 | 5 | none |
| J4 | Sunny Days | N ≤ 500k S/P days with exactly one day wrong. Find the max possible consecutive S run. | **run/block processing**, one-pass | block lengths, combine left-run + 1 + right-run around each P; special case of all S → N−1 | 2 one S-block then P-block, 4 mixed N ≤ 1000, 9 N ≤ 500k | 6 | 5 | the O(N²) "flip each day" approach gets 6/15. Needs O(N). Read with `sys.stdin` |
| J5 | Connecting Territories | R×C grid whose costs repeat 1..M in reading order. Find the min-cost top-to-bottom path, moving to the same column or a diagonal neighbour each row. | **dynamic programming** (row by row), memoization | cost formula `(r*C+c)%M+1`, DP with only 2 rows (rolling arrays) | 3 R=2 C≤10, 8 R,C ≤ 10 (plain recursion), 2 R,C ≤ 100, 2 R,C ≤ 20,000 | 8 | 7 (DP) | the final subtask is up to 4·10⁸ cell updates. **UNVERIFIED and likely infeasible in Python even under PyPy** within a few seconds. A clear case of CEMC's warning that a perfect score may be impossible in Python. Expect 13/15 in Python unless there is a cleverer insight (none found) |

### 2026 (source: 2026CCCJrProblems.html + 2026 Jr commentary; 3,421 Junior contestants)

| # | Title | Summary | Topics | Techniques | Subtasks | Avg | Diff | DMOJ | Python notes |
|---|---|---|---|---|---|---|---|---|---|
| J1 | Concert Tickets | Can Besa buy B of T tickets when P are sold? Print `Y remaining` or `N`. | arithmetic, if | f-string/print with a space | none | 14.49 | 1 | 3 | none |
| J2 | Olympic Scores | 5 judge scores. Drop one max and one min, sum the rest, multiply by D. | min/max, sum | list + `sum - max - min`, or running min/max | none | 13.33 | 1 | 3 | none |
| J3 | Creative Candy Consumption | Two R/G/B strings (≤ 10⁶ each) play a rock-paper-scissors "eat" game until a line empties. Count how many candies each person ate. | **simulation with two pointers** | while loop, index pointers instead of slicing, dict of "who beats whom" | 2 (1 candy each), 4 (Ngoc empties first, ≤ 50), 7 (≤ 50), 2 (≤ 10⁶) | 8.31 | 4 | 3 | **slicing `s = s[1:]` in the loop is O(n²) and fails the last 2 marks**. Use indices |
| J4 | Snail Path | Snail moves N/E/S/W (≤ 20 squares per move, M ≤ 200k moves). Count entries into already-slimy squares. | grid simulation, **sets / hashing** | set of `(x,y)` tuples, direction deltas; alternatively total steps − distinct squares | 4 (only S/E, small), 3 (small), 6 (M ≤ 1200), 2 (M ≤ 200k) | 4.19 | 5 | 5 | up to 4·10⁶ steps. **The Grader runs this problem with CPython 3.10.12, not PyPy** (statement's Technical Notes; memory warning). A set of up to 4M tuples in CPython is memory-heavy but intended; encoding `x*BIG+y` as an int is a lighter option |
| J5 (=S2) | Beams of Light | N ≤ 500k parking spots, L ≤ 500k lights covering [P−S, P+S], Q ≤ 500k queries: is spot q lit? | **difference array + prefix sums** or interval merging | `diff[a]+=1; diff[b+1]-=1`, running sum, clamping to [1,N] | 1 (L ≤ 1), 2 (small), 3 (N ≤ 50, large L,Q), 9 (all large) | 2.36 | 6 | 7 (S2, Data Structures) | 1.5M lines of input and 500k lines of output: **must use `sys.stdin` and `'\n'.join` output**. A per-line `print` loop may TLE |

---

## 4. Official averages at a glance (all contestants, /15)

| Year | J1 | J2 | J3 | J4 | J5 | # Jr contestants |
|---|---|---|---|---|---|---|
| 2016 | 12.58 | 10.32 | 5.72 | 5.35 | 3.76 | 2,008 |
| 2017 | 12.03 | 10.53 | 1.02 | 0.36 | 0.28 | 2,360 |
| 2018 | 13.04 | 10.73 | 9.33 | 2.74 | 0.25 | 3,017 |
| 2019 | 13.92 | 10.70 | 5.82 | 8.35 | 0.20 | 3,713 |
| 2020 | 14.19 | 10.87 | 7.75 | 5.97 | 1.02 | 3,769 |
| 2021 | 14.02 | 11.15 | 9.53 | 2.37 | 2.97 | 4,003 |
| 2022 | 14.03 | 12.58 | 7.84 | 3.60 | 0.78 | 4,909 |
| 2023 | 13.41 | 12.21 | 8.68 | 4.79 | 0.76 | 6,242 |
| 2024 | 13.60 | 11.72 | 9.30 | 3.25 | 1.90 | 6,185 |
| 2025 | n/a (results withheld) | | | | | n/a |
| 2026 | 14.49 | 13.33 | 8.31 | 4.19 | 2.36 | 3,421 |

Sources: `{YEAR}CCCResults.pdf`. The booklets also give "non-zero score" averages, e.g. 2026 J4 non-zero average 13.05 and J5 7.65.

---

## 5. (a) Trend analysis 2019–2026

1. **J1–J2 are stable and trivial.** J1 is always a single formula plus one if. J2 is one loop plus accumulate/count/max. The average rose from about 10.7 (2019–2021 J2) to about 12–13 (2022–2026 J2).
   - Small twists appear in J2: an unknown input count (2024 J2 needs a while loop), two input lines per loop iteration (2022 J2, 2025 J2), and a lookup table (2023 J2).
2. **J3 has become the "string processing / careful implementation" slot and now always has subtasks.**
   - Examples: RLE (2019), parsing (2020), sentinel loop (2021), tokenizing (2022 J3, 2025 J3), ties formatting (2023), distinct 3rd max (2024), two-pointer simulation (2026).
   - Since 2022 every J3 has a subtask table. Since 2024, J3 often includes a **large-input subtask worth 2 marks** that punishes O(n²) (2024 J3 N ≤ 250k; 2026 J3 10⁶ chars).
3. **J4 is where efficiency first matters.** Every J4 from 2021 on has a final subtask with N in the hundreds of thousands: 2021 J4 500k, 2022 J4 100k, 2023 J4 200k, 2024 J4 500k, 2025 J4 500k, 2026 J4 200k moves.
   - The intended fix is usually **one linear pass**, **a dict/set for O(1) lookup**, or **counting**.
   - The commentaries repeatedly warn about hidden O(n) inside a loop: built-in search, `str` concatenation, `list.remove`, slicing.
   - Topics are strings, grids and counting. None need real algorithms beyond hashing and one-pass logic.
4. **J5 has moved from "Senior-level algorithm" toward "classic first algorithm, clearly signposted".**
   - 2019 J5 (backtracking with pruning, DMOJ 20) and 2020 J5/S2 (BFS on an implicit graph, DMOJ 10) were the hardest.
   - 2022 J5 (Square Pool) stayed very hard ("Earning more than 8 marks ... especially difficult").
   - 2023 J5 (Word Hunt) was pure brute force whose difficulty was implementation.
   - 2024 J5 is a textbook **flood fill/BFS**, 2025 J5 a textbook **grid DP**, and 2026 J5 a textbook **difference array / prefix sum**. Each is a standard technique any "intro to competitive programming" course covers, and the commentaries now name the technique explicitly (BFS/DFS, memoization/dynamic programming, prefix sums).
   - The **top J5 subtask is usually worth only 2–5 marks**. Most J5 marks (8–11/15) come from brute force on small inputs.
5. **Subtask structure is now universal from J3 upward.** It follows a pattern: tiny special case → general small case → large case needing efficiency. This is excellent for a learner because partial solutions pay.
6. **Shared J/S problems:** 2019–2023 always shared J4 or J5 with S1 or S2. 2024 and 2025 shared nothing. 2026 shared J5 = S2 again. There is no stable pattern, but when a problem is shared it is at S1 or S2 level.
7. **Recurring topic families (2019–2026):**
   - strings/tokenizing: 2019 J3, 2020 J4, 2021 J3, 2022 J3, 2024 J4, 2025 J3, 2025 J4, 2026 J3
   - 2D grids: 2019 J4, 2020 J5, 2021 J5, 2022 J5, 2023 J4, 2023 J5, 2024 J5, 2025 J5, 2026 J4
   - counting/parity insight: 2019 J4, 2021 J4, 2021 J5, 2023 J4
   - graph search BFS/flood fill: 2020 J5, 2024 J5 (plus 2018 J5)
   - DP: 2025 J5 (plus 2015 J5)
   - prefix sums/difference arrays: 2026 J5 (plus 2018 J3)
   - hashing (dict/set): 2022 J4, 2024 J4, 2026 J4
8. **Python-specific trend.**
   - Large inputs (up to about 10⁶ tokens) now appear at J3–J5, so **fast I/O is a Junior skill**.
   - At least one recent J5 top subtask (2025 J5, R = C = 20,000) looks **infeasible in Python** (UNVERIFIED; no Python full-solution evidence found).
   - The Grader default is PyPy3 (Python 3.8), with occasional per-problem CPython overrides (2026 J4).

---

## 6. (b) Consolidated concept & skill list (ordered from most basic)

Each item is tagged with example problems (YY = year, Jn = problem).

### Tier 0 — Program I/O and values
1. **Reading one integer per line** (`int(input())`). Almost every problem; e.g. 26 J1, 25 J1, 24 J1, 20 J1, 19 J1.
2. **Printing results exactly** (no prompts, exact case/spacing). All problems; e.g. 25 J1 lowercase `yes`, 26 J1 `Y 25`, 21 J1 two lines.
3. **Integer arithmetic and operator precedence** (`+ - * // % **`). 24 J1, 22 J1, 23 J1, 21 J1, 17 J2.
4. **Variables and reassignment/accumulators.** 25 J2, 20 J2, 14 J3.
5. **Strings as values:** reading a whole line, comparing strings, `==`. 16 J1, 25 J2 (`+`/`-` symbols), 23 J2.

### Tier 1 — Control flow
6. **if / elif / else, comparison and boolean operators** (`and`, `or`, `not`, chained comparisons). 14 J1, 15 J1, 17 J1, 18 J1, 20 J1, 25 J1, 26 J1.
7. **Counted loops** (`for _ in range(n)`), including reading 1 or 2 lines per iteration. 14 J3, 19 J2, 22 J2, 25 J2, 21 J2.
8. **While loops, sentinel values and unknown input length** (`while True`/`break`, or read until EOF). 20 J2, 21 J3 (99999 sentinel), 24 J2 (count not given).
9. **Running max/min/count/flag patterns**, with tie-breaking. 21 J2 (earliest wins ties), 22 J2 (gold flag), 26 J2, 24 J3.
10. **Splitting a line into tokens** (`split()`, `map(int, ...)`, custom separators like `split(',')`). 14 J3, 19 J2, 20 J3 (comma), 21 J5, 26 J4.

### Tier 2 — Strings and sequences
11. **Indexing, slicing, `len`, iterating characters, 0- vs 1-based indexing.** 18 J2, 19 J3, 21 J3, 14 J4 (positions), 19 J5 (1-indexed output).
12. **String methods** (`count`, `in`, `find`, `replace`, `isupper`, `isdigit`, `join`, repetition `*`). 14 J2, 15 J2, 19 J2, 20 J4, 24 J4, 25 J3.
13. **Character arithmetic** (`ord`/`chr`) and small lookup tables. 15 J3.
14. **Building output strings** (`' '.join`, `','.join`, f-strings, zero padding `:02d`). 16 J4, 18 J3, 23 J3, 22 J3.
15. **Runs/blocks of equal characters (run-length logic).** 19 J3, 25 J4, 21 J4 (counting regions).
16. **Tokenizing with state (a small "parser").** 22 J3, 25 J3, 21 J3.

### Tier 3 — Collections
17. **Lists:** append, sum/min/max, sort, `count`, list of counts. 23 J3, 26 J2, 24 J3, 16 J5, 14 J4.
18. **Dictionaries as lookup tables and maps.** 23 J2 (price table), 14 J5 (partner map), 15 J4 (per-friend totals), 22 J4 (name → group).
19. **Sets for membership/visited tracking.** 26 J4 (slimy squares), 24 J5 (visited), 24 J3 (distinct scores).
20. **Frequency/counting arrays** (index = value). 17 J5 (lengths ≤ 2000), 24 J3 (scores ≤ 75), 16 J1.
21. **2D lists (grids):** reading, indexing `g[r][c]`, row/column sums, bounds checks. 16 J2, 18 J4, 20 J5, 23 J5, 24 J5, 25 J5.
22. **Coordinate/direction vectors** (`dr, dc`, N/E/S/W deltas, 8 directions). 26 J4, 23 J5, 24 J5, 17 J3.
23. **Tuples as keys/points.** 26 J4, 20 J5.

### Tier 4 — Problem-solving patterns
24. **Direct simulation** of a described process. 14 J3, 14 J4, 15 J4, 16 J4, 19 J4, 21 J5 (small subtasks), 26 J3.
25. **Brute force / complete search over all candidates.** 16 J3 (all substrings), 20 J4 (all rotations), 22 J5 (small subtask), 23 J5 (all placements), 25 J4 (flip each day, partial).
26. **Case analysis and edge cases** (empty or all-same input, ties, boundaries). 25 J4 (all S), 23 J3 (ties), 24 J4 (silly vs quiet order), 21 J1 (sign convention), 26 J5 (clamp to [1,N]).
27. **Mathematical insight replacing simulation** (parity, periodicity, closed forms). 17 J3 (Manhattan distance + parity), 17 J4 (720-minute cycle), 19 J4 (flip parity), 21 J5 (toggle parity formula), 23 J4 (3B − 2·shared).
28. **Greedy + sorting.** 16 J5, 21 J4.
29. **Prefix sums / cumulative sums.** 18 J3, 26 J5.
30. **Difference arrays (range updates).** 26 J5.
31. **Two pointers / index pointers instead of mutation.** 26 J3.
32. **Functions** for reusable logic (reduce repetitive, error-prone code). 23 J5 (commentary recommends it), 25 J5, 19 J5.

### Tier 5 — Efficiency (required for full marks from J3 up)
33. **Estimating running time from bounds** (roughly 10⁷–10⁸ simple ops per second in PyPy, much less in CPython; O(n²) with n = 500k is too slow). 25 J4, 24 J4, 23 J4, 21 J4, 26 J5; the commentaries state this explicitly.
34. **Hidden costs of built-ins** (`in` on lists, `list.remove`, `s[1:]`, string `+=` in loops). 23 J4, 24 J3, 25 J4, 26 J3 commentaries.
35. **Hash-based O(1) lookup** (dict/set) instead of list search. 22 J4 (last mark), 24 J4, 26 J4.
36. **Fast input/output in Python** (`sys.stdin.readline`, `sys.stdin.buffer.read().split()`, `'\n'.join`). 17 J5 (10⁶ ints), 20 J5 (10⁶ cells), 21 J5, 25 J4, 26 J3, 26 J5.
37. **Memory awareness** (don't store a 20k×20k grid; keep only 2 rows; beware many tuples). 25 J5, 26 J4.

### Tier 6 — First "real" algorithms (J5 level; also Senior S1–S3)
38. **Recursion** (base case, recursive case, recursion limit). 15 J5, 19 J5, 22 J5, 24 J5 (DFS variant), 25 J5.
39. **Backtracking search with pruning.** 19 J5.
40. **Memoization / dynamic programming** (subproblems, tables, rolling arrays). 15 J5, 25 J5.
41. **Graph modelling** (pages, cells or values as nodes) with adjacency lists. 18 J5, 20 J5.
42. **BFS/DFS and flood fill** (queue with `collections.deque`, visited marking, shortest path in unweighted graphs). 18 J5, 20 J5, 24 J5.
43. **Interval reasoning** (merging intervals, clamping). 26 J5, 22 J5 (candidate edges).
44. **Coordinate-candidate reduction** (only tree coordinates matter). 22 J5.

---

## 7. (c) "Absolute-zero" prerequisites (before J1)

Everything below comes before the first J1 exercise. Each item is justified by what J1 and the Grader actually require.

1. **What a program is:** a sequence of instructions the computer runs top to bottom. It is text in a `.py` file and is run by the Python interpreter.
2. **Running code:**
   - Where to type code: an editor or IDE, or an online editor. The CCC rules allow any editor except AI tools.
   - How to run it and how to see output and error messages.
   - For the web app, an in-browser runner (e.g. Pyodide), so the learner never has to install anything, is an architectural idea for later phases.
3. **Standard input / standard output as a concept:**
   - The judge types (pipes) the input to your program. Your program prints the answer and nothing else. **No prompts like `input("Enter a number: ")`**, because the rules say prompts or extra output break the exact match.
   - One `input()` call reads one line.
4. **Values and types:** integers vs strings. `"5"` is not `5`, so convert with `int()`. Printing numbers and strings; `print(a, b)` inserts a space.
5. **Variables and assignment** (`=` is not equality). Naming. Reassignment.
6. **Arithmetic operators and precedence.** Integer division `//` and remainder `%`. Why `/` gives a float: the official Python sample solution uses `/` and prints a float, which is a real trap for exact-match output.
7. **Syntax basics:**
   - indentation defines blocks
   - colons after `if`/`for`/`while`
   - case sensitivity
   - quotes around strings
   - comments
8. **Reading error messages:** SyntaxError, NameError, TypeError (e.g. `"3" + 4`), ValueError (e.g. `int("3 4")`), IndentationError, and how to use a traceback's line number.
9. **Testing with sample input:**
   - copy the sample input, run, and compare with the sample output character for character
   - then invent your own tests, including edge cases
10. **How judging works:**
    - hidden test cases
    - verdicts: correct, wrong answer, time-limit exceeded, run-time error
    - subtasks and partial marks
    - up to 50 submissions, and your best counts
    - the 3-hour clock
    - The CCC-specific details come from cccgrader.com/rules.pdf.
11. **Reading a problem statement:** Problem Description / Input Specification / Output Specification / Sample Input / Output, plus the subtask table and bounds. Every CCC problem uses this structure.
12. **Basic computational thinking:** break a problem into steps, work an example by hand, then translate the steps into code. The 2025 J4 commentary explicitly recommends separating "develop the algorithm" from "implement it".
13. **Python version awareness:** the Grader runs PyPy3 with Python 3.8 semantics, so the curriculum should teach only 3.8-compatible syntax (no `match`, no `math.lcm`, and so on).

---

## 8. Notes, caveats, UNVERIFIED items

- **UNVERIFIED:**
  - whether 2014/2015 problems were each worth 15 marks (no results booklet found)
  - whether Python can fully solve 2025 J5's final subtask (4·10⁸ DP updates; no Python evidence found)
  - whether pure Python gets the last mark on 2019 J5
  - the exact per-problem time limits on the current CCC Grader for past problems. The rules default is 3 s / 512 MB; DMOJ limits (from its API) differ, e.g. 25 J5 is 5 s / 256 MB on DMOJ.
- DMOJ points were fetched from `https://dmoj.ca/api/v2/problem/<code>` on 2026-09-21. DMOJ lists shared problems only under the Senior code.
- For 2024 the J1 title was confirmed via DMOJ (`ccc24j1` = "Conveyor Belt Sushi") because the CEMC HTML heading anchor was stripped.
- Test data for past years is downloadable from the Past Contests page, e.g. `2026/2026CCCJuniorTestData.zip`. This is useful for the app's auto-grader in later phases.
- The Junior commentaries (2022–2026) are the best source for **officially intended techniques** and wording. The curriculum can mirror their progression from subtask 1 to full solution.
