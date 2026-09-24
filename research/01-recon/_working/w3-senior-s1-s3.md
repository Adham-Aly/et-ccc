# W3 — CCC Senior S1–S3 analysis, 2014–2026

Worker W3, Phase 1 (Recon). Written 2026-09-21.

> **Round-2 correction (2026-09-21).** The official CCC Grader's Python 3 **is PyPy3 7.3.9 (Python 3.8.13)**. W3 re-verified this at https://cccgrader.com/sample_soln.pdf. The one exception found is 2026 J4, which runs on CPython 3.10.12.
>
> Wherever this file says "CPython is borderline/TLE, PyPy recommended", the Grader verdict is **feasible**; the CPython caveat applies only to DMOJ `PY3` practice. Examples: 23S2, 21S3, 20S3, 20S2, 17S3.
>
> "numpy" and "sortedcontainers" should be treated as unavailable. The consolidated verdicts are in `../past-problems-analysis.md`.
>
> Missing shared-problem marks in the tables below: 2014 J4=S1 and J5=S2, 2016 J5=S2, 2017 J5=S3, 2018 J4=S2.

## 0. How this file was built (read first)

**Primary sources, downloaded and read in full as text (S1–S3 sections):**
- Official CEMC Senior problem sets for 2014–2026, all under `https://cemc.uwaterloo.ca/sites/default/files/documents/<YYYY>/...`:
  - `2014/2014CCCSrProblems.html`, `2015/2015CCCSrProblems.html` (plus `2024/2015CCCSrProblemSet.pdf`, which has the 2015 contest instructions), `2016/2016CCCSrProblems.html`, `2017/2017CCCSrProblemSet.html`, `2018/2018CCCSrProblemSet.html`, `2019/2019CCCSrProblemSet.html`, `2020/2020CCCSrProblemSet.html`, `2021/2021CCCSrProblemSet.html`, `2022/2022CCCSrProblemSet.html`, `2023/2023CCCSrProblemSet.html`, `2024/2024CCCSrProblems.html`, `2025/2025CCCSrProblems.html`, `2026/2026CCCSrProblems.html`.
- Official CEMC **Senior Problem Commentaries** (the official editorials): `2024/2022CCCSrCommentary.html`, `2024/2023CCCSrCommentary.html`, `2024/2024CCCSrCommentary.html`, `2025/2025CCCSrCommentary.html`. **No 2026 Senior commentary was published** (`2026/2026CCCSrCommentary.html` returns 404 as of 2026-09-21). The **2026 Junior commentary** (`2026/2026CCCJrCommentary.html`) covers J5/S2 *Beams of Light*. I found no official commentary for 2014–2021.
- Official CEMC **Results booklets** (`<YYYY>/<YYYY>CCCResults.pdf`, 2016–2026), which give per-problem **average scores**, used below as an objective difficulty signal. **2025 has no results or averages:** CEMC withheld official 2025 results because "many students submitted code that they did not write themselves" (2025CCCResults.pdf, signed J.P. Pretti and Troy Vasiga).
- The past-contests index I crawled: `https://cemc.uwaterloo.ca/resources/past-contests?contest_category=29`.

**Secondary sources:**
- DMOJ API `https://dmoj.ca/api/v2/problem/ccc<YY>s<N>`, for time limit, memory limit, points and DMOJ type tags on all 39 problems. I pulled this data on 2026-09-22 UTC. After that, Cloudflare blocked DMOJ HTML pages, editorials and submission lists, so I could not get **solve counts or Python/PyPy AC status**. That is a known gap.
- Community solutions and editorials: Misaka16172's blog editorial for 2026 S3 (GitHub `Misaka16172/misaka16172.github.io`, `solution-p15542.html`); GitHub `DanPlus6/CompetitiveProgramming` (2026 C++ solutions); GitHub `doduoduoniaodo/CCC-Solutions` (Python solutions, including 2026 S1/S2 and 2024 S3); USACO Guide and jeffreyxiao.me for 2016 S3; USACO forum and search snippets for 2019 S3 and 2021 S3. Luogu mirrors: P15536–P15544 are CCC 2026 J1–S5.

**Conventions:**
- "Official TL" means a time limit printed on the CEMC statement. Only 2017 prints one per problem: S1 1 s, S2 1 s, S3 2 s. The 2015 instructions say "5 seconds of execution time per test case" for all Senior problems. From 2018 on, CEMC statements print **no** time limits. The "DMOJ TL/ML" values below are DMOJ's mirror limits, **not necessarily the official grader's**.
- Each problem is worth **15 marks** in every year covered.
- "Avg" is the CEMC average score over all Senior contestants, followed by the average over contestants with a non-zero score, both out of 15.
- Difficulty (1–10) is **my judgement**, anchored on the CEMC averages and DMOJ points: 1 means a trivial loop; 10 means top-of-S3 hard.
- Python notes are my analysis of operation counts against the DMOJ limits. Python/PyPy availability and timing **on the official CCC grader is UNVERIFIED here** (another worker covers the rules and judge). Treat "CPython OK" as "likely OK, not tested".
- Title mismatches:
  - 2014 S1 is "Party Invitation" on CEMC but "Party Invitation 2.0" on DMOJ.
  - 2022 S2 is "Group Work" in the CEMC problem set, "Good Groups" on DMOJ.
- Shared Junior/Senior problems: 2019 J4/S1, 2020 J5/S2, 2021 J5/S2, 2022 J4/S2, 2023 J4/S1, 2026 J5/S2.

### 0.1 Master table (all 39 problems)

| Year | # | Title | Core technique (full marks) | DMOJ TL / ML | DMOJ pts | CEMC avg (all / non-zero) | Diff |
|---|---|---|---|---|---|---|---|
| 2014 | S1 | Party Invitation | list simulation | 2 s / 256 MB | 5 | n/a | 1 |
| 2014 | S2 | Assigning Partners | dict / mapping check | 2 s / 256 MB | 5 | n/a | 2 |
| 2014 | S3 | The Geneva Confection | stack simulation | 3 s / 256 MB | 7 | n/a | 3 |
| 2015 | S1 | Zero That Out | stack | 5 s / 256 MB | 3 | n/a | 1 |
| 2015 | S2 | Jerseys | greedy + array lookup | 5 s / 256 MB | 5 | n/a | 2 |
| 2015 | S3 | Gates | greedy + DSU "next free slot" (or sorted structure) | 1 s (PY 2.5 s) / 256 MB | 10 | n/a | 6 |
| 2016 | S1 | Ragaman | letter counting | 2 s / 256 MB | 3 | 11.03 / 13.09 | 2 |
| 2016 | S2 | Tandem Bicycle | sorting + greedy | 2 s / 256 MB | 5 | 10.44 / 13.59 | 3 |
| 2016 | S3 | Phonomenal Reviews | tree pruning + tree diameter (DFS/BFS) | 2 s / 256 MB | 12 | 1.39 / 8.40 | 7 |
| 2017 | S1 | Sum Game | prefix sums | 1 s / 256 MB | 3 | 14.12 / 14.93 | 1 |
| 2017 | S2 | High Tide, Low Tide | sorting + interleaving | 1 s / 256 MB | 5 | 13.24 / 14.71 | 2 |
| 2017 | S3 | Nailed It! | frequency counting over value range | 2 s / 256 MB | 7 | 6.20 / 11.04 | 5 |
| 2018 | S1 | Voronoi Villages | sorting + min over gaps, float formatting | 1 s / 256 MB | 3 | 9.70 / 11.85 | 2 |
| 2018 | S2 | Sunflowers | 2D grid rotation | 1 s / 256 MB | 5 | 8.09 / 14.79 | 3 |
| 2018 | S3 | RoboThieves | grid BFS with 0-cost conveyor moves and camera marking | 0.5 s / 256 MB | 10 | 1.11 / 9.46 | 7 |
| 2019 | S1 | Flipper | parity counting | 1 s / 1 GB | 3 | 13.47 / 14.91 | 1 |
| 2019 | S2 | Pretty Average Primes | sieve / primality test | 1 s / 1 GB | 5 | 6.71 / 10.16 | 3 |
| 2019 | S3 | Arithmetic Square | casework constructive on a 3×3 grid | 0.6 s / 512 MB | 12 | 1.43 / 6.42 | 7 |
| 2020 | S1 | Surmising a Sprinter's Speed | sort + max adjacent slope | 1 s / 512 MB | 5 | 8.79 / 10.66 | 2 |
| 2020 | S2 | Escape Room | BFS over values / graph modelling | 2 s / 512 MB | 10 | 4.16 / 9.02 | 5 |
| 2020 | S3 | Searching for Strings | sliding-window counts + rolling hash + set | 0.5 s / 512 MB | 12 | 1.83 / 5.64 | 8 |
| 2021 | S1 | Crazy Fencing | trapezoid area sum | 1 s / 1 GB | 5 | 13.38 / 14.56 | 1 |
| 2021 | S2 | Modern Art | parity counting of row/column flips | 3 s / 1 GB | 7 | 9.50 / 11.41 | 3 |
| 2021 | S3 | Lunch Concert | convex cost; binary/ternary search on answer, or slope sweep | 3 s / 1 GB | 10 | 2.47 / 6.58 | 7 |
| 2022 | S1 | Good Fours and Good Fives | loop over one variable (math) | 2 s / 1 GB | 5 | 11.03 / 12.18 | 2 |
| 2022 | S2 | Group Work (DMOJ: Good Groups) | dict / hash-map lookup | 4 s / 1 GB | 5 | 6.44 / 11.06 | 3 |
| 2022 | S3 | Good Samples | constructive greedy with counting | 1 s / 1 GB | 10 | 1.41 / 7.40 | 7 |
| 2023 | S1 | Trianglane | careful counting on a grid | 1 s / 1 GB | 5 | 11.06 / 12.52 | 2 |
| 2023 | S2 | Symmetric Mountains | O(N²) interval DP / expand-from-centre | 1 s / 1 GB | 7 | 4.26 / 8.61 | 5 |
| 2023 | S3 | Palindromic Poster | constructive casework | 1 s / 1 GB | 10 | 1.56 / 5.90 | 7 |
| 2024 | S1 | Hat Circle | array indexing (i + N/2) | 3 s / 1 GB | 3 | 13.73 / 14.48 | 1 |
| 2024 | S2 | Heavy-Light Composition | frequency counting + alternation check | 3 s / 1 GB | 5 | 10.68 / 14.01 | 2 |
| 2024 | S3 | Swipe | subsequence check (two pointers) + constructive op ordering | 3 s / 1 GB | 10 | 1.65 / 3.49 | 7 |
| 2025 | S1 | Positioning Peter's Paintings | O(1) formula (min of two layouts) | 0.5 s / 512 MB | 3 | none published | 1 |
| 2025 | S2 | Cryptogram Cracking Club | RLE parsing + modulo + cumulative scan | 2 s / 512 MB | 7 | none published | 3 |
| 2025 | S3 | Pretty Pens | greedy insight + dynamic ordered sets (BBST / heaps with lazy deletion) under updates | 7 s / 512 MB | 10 | none published | 8 |
| 2026 | S1 | Baby Hop, Giant Hop | number-theory casework (div/mod, parity, "second best") with 64-bit ints | 3 s / 1 GB | 5 | 7.69 / 9.81 | 4 |
| 2026 | S2 | Beams of Light | difference array / interval merging | 3 s / 1 GB | 7 | 6.01 / 9.26 | 3 |
| 2026 | S3 | Common Card Choice | parity insight + tiny brute force; randomized disjoint guessing for last subtask | 1 s / 1 GB | 7 | 1.39 / 7.31 | 7 |

Senior participation counts from the results booklets: 2016: 1225; 2017: 1925; 2018: 2144; 2019: 2719; 2020: 2827; 2021: 2920; 2022: 3262; 2023: 3420; 2024: 3947; 2025: not published; **2026: 2439**, a sharp drop after the 2025 cheating incident. I have not researched the cause; flag it for the rules/format worker.

---

## 1. Per-year detail

Each subtask line below is **marks: constraint → what earns it**.

### 2014
Sources: CEMC 2014 Senior problem set; DMOJ ccc14s1–s3. No subtask tables. The 2014 statements give no partial-mark breakdown, so partial marks come only from test cases passed (UNVERIFIED how many tests were small).

| # | Title | Summary | Constraints | Topics | Full-mark technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Party Invitation | Friends 1..K in a list; each round removes every r_i-th remaining position; print the survivors. | K ≤ 100, m ≤ 10, 2 ≤ r_i ≤ 100 | simulation, lists | Rebuild the list each round, keeping indices where (pos+1) % r ≠ 0. O(K·m). | 1 | Trivial. |
| S2 | Assigning Partners | Two lines of N names; the i-th name on line 2 is the partner of the i-th name on line 1. Check that partnering is symmetric and nobody is their own partner. | 1 < N ≤ 30 | dict/mapping | Map name → partner; check p[p[x]] == x and p[x] ≠ x. O(N). | 2 | Trivial. |
| S3 | The Geneva Confection | Cars in a top-to-bottom order; you may move cars to the lake or to a side branch (a stack). Can you pour 1..N in order? T ≤ 10 tests. | N ≤ 100 000, T ≤ 10 | stack simulation | Pop cars from the bottom of the mountain line (input is listed top to bottom); push each onto the branch unless it is the next needed; drain the branch whenever its top is the next needed. O(N) per test. | 3 | Fine; read all input with `sys.stdin`. |

### 2015
Sources: CEMC 2015 problem set (HTML + PDF); DMOJ. The 2015 instructions give **5 s per test case** for Senior problems (official, 2015 only).

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Zero That Out | Read K numbers; 0 means "remove the last kept number"; output the sum. | K ≤ 100 000 | none | Stack (list append/pop). O(K). | 1 | Trivial. |
| S2 | Jerseys | J jerseys with sizes S/M/L; A athletes each request (size, number). An athlete is satisfied by that number with size ≥ requested. Maximize satisfied requests. | 50%: J, A ≤ 10³; 50%: J, A ≤ 10⁶ | 50% small / 50% large | Greedy: for each request in order, if jersey #n is still free and size ≥ requested, give it and mark it used. O(J+A). | 2 | Up to 2×10⁶ input lines: use `sys.stdin.buffer.read().split()`. Map S/M/L to 0/1/2. |
| S3 | Gates | Plane i must dock at a free gate in 1..g_i; stop at the first plane that cannot dock. Maximize planes docked. | G, P ≤ 10⁵; ≥40% of marks: G, P ≤ 2000 | 40% small | Greedy: give each plane the **largest free gate ≤ g_i**. Find it with a DSU "next free to the left" (parent[g] = g−1 after use) with path compression, O((G+P)·α). A sorted list plus bisect also works. | 6 | DMOJ gives PY2/PY3 a special **2.5 s** limit (default 1 s). Write DSU `find` **iteratively** (recursion depth). The popular `bisect` + `list.pop(i)` Python solution is O(G·P) memmove in the worst case; it passes on DMOJ but is not a safe pattern. |

### 2016
Sources: CEMC 2016 problem set and results; DMOJ; USACO Guide / jeffreyxiao.me analyses for S3.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Ragaman | Is string 2 (letters and `*`) a wildcard anagram of string 1? | N ≤ 100 | 8/15: no `*` | Count letters; for each letter, count2[c] ≤ count1[c]; stars fill the rest (equal lengths). O(N). | 2 | Trivial (`collections.Counter`). |
| S2 | Tandem Bicycle | Pair N people from country A with N from country B; a pair's speed is max(a,b). Minimize (Q1) or maximize (Q2) the sum. | N ≤ 100, speeds ≤ 10⁶ | 8/15 type 1, 7/15 type 2 | Sort both. **Min:** pair both ascending. **Max:** pair one ascending with the other descending. O(N log N). | 3 | Trivial. |
| S3 | Phonomenal Reviews | In a tree of N nodes with M marked (Pho) nodes, find the shortest walk visiting all marked nodes, starting anywhere. | 2 ≤ M ≤ N ≤ 10⁵ | 3: M=2, N≤100 · +3: M≤3, N≤100 · +3: M≤8, N≤100 · +4: N≤1000 · +2: full | (1) Prune every subtree containing no marked node. (2) Answer = 2·(edges in pruned tree) − (diameter of pruned tree). Find the diameter with two BFS runs. O(N). | 7 | N = 10⁵ recursion will crash CPython; use **iterative** DFS/BFS or peel leaves with a queue. BFS on 10⁵ nodes is fine in CPython. Partials: M=2 is just one BFS distance; M ≤ 8 allows permutations × pairwise distances. |

### 2017
Sources: CEMC 2017 problem set, which **prints official TLs**: S1 1 s, S2 1 s, S3 2 s. Results give the averages.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Sum Game | Two teams' daily runs over N days; find the largest K with equal cumulative totals. | N ≤ 10⁵, runs ≤ 20 | 7/15: N ≤ 1000 | Running prefix sums; remember the last day they are equal. O(N). | 1 | Trivial. |
| S2 | High Tide, Low Tide | Reorder distinct measurements as low, high, low, high… with lows decreasing and highs increasing. | N ≤ 100 | none | Sort; lows = lower half reversed, highs = upper half; interleave (mind odd N). O(N log N). | 2 | Trivial. |
| S3 | Nailed It! | N wood lengths; a board is two pieces; a fence is boards of equal height. Output the max fence length and the number of heights achieving it. | N ≤ 10⁶, L_i ≤ 2000 | 5: N≤100 · +4: N≤1000 · +3: N≤100 000 · +3: full | Count frequencies cnt[1..2000]. For each height h (2..4000), boards(h) = Σ_{a<b, a+b=h} min(cnt[a], cnt[b]) + ⌊cnt[h/2]/2⌋. That is O(2000²) = 4×10⁶, independent of N. | 5 | Reading 10⁶ ints: `sys.stdin.buffer`. The 2000² double loop is ≈ 2–4 M iterations; CPython takes about 1–2 s against a 2 s limit (tight). Loop only over distinct lengths, or use PyPy. |

### 2018
Sources: CEMC 2018 problem set and results; DMOJ; community editorials for S3.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Voronoi Villages | N distinct points on a line; each interior village's neighbourhood is half the gap to the left plus half the gap to the right; output the minimum, with one decimal. | 3 ≤ N ≤ 100, \|V\| ≤ 10⁹ | none | Sort; min over i of (v[i+1] − v[i−1]) / 2; format with `.1f`. | 2 | Trivial. Pitfall: format as `f"{x:.1f}"`. |
| S2 | Sunflowers | An N×N grid was rotated by a multiple of 90°; restore the orientation where rows and columns increase. | N ≤ 100 | none | Rotate up to 3 times and check that the first row and column increase, or check which corner holds the minimum. O(N²). | 3 | `list(zip(*g[::-1]))` rotates. Trivial. |
| S3 | RoboThieves | Grid with walls, cameras, conveyors (L/R/U/D) and empty cells. Output the minimum steps from S to every empty cell, avoiding cells seen by cameras. Conveyor moves are free; conveyors can loop. | 4 ≤ N, M ≤ 100 | 5: no cameras or conveyors · +5: no conveyors · +5: full | (1) Mark cells seen by each camera, scanning 4 directions until a wall; conveyors do not block sight but are safe to stand on. (2) BFS where stepping onto a conveyor follows it at zero cost (0-1 BFS, or resolve conveyor chains with loop detection). If S itself is seen, all answers are −1. O(NM). | 7 | 10⁴ cells: CPython is fine even at DMOJ's 0.5 s. Use a `deque`. The difficulty is all in correctness details, not speed. |

### 2019
Sources: CEMC 2019 problem set and results; DMOJ; USACO forum and snippets for S3.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 (=J4) | Flipper | Apply a string of H/V flips to the 2×2 grid [[1,2],[3,4]]; print the final grid. | ≤ 10⁶ chars | 8/15: ≤ 1000 chars | Only the parity of the H count and of the V count matters. O(len). | 1 | `s.count('H') % 2`. Trivial. |
| S2 | Pretty Average Primes | For each N, find primes A, B with (A+B)/2 = N. | T ≤ 1000, 4 ≤ N ≤ 10⁶ | 6/15: N < 1000 | Sieve of Eratosthenes up to 2×10⁶; for each N try d = 0,1,2,… until N−d and N+d are both prime (d is small in practice). | 3 | Sieve with `bytearray` slice assignment is fast. Naive trial division per candidate may TLE at 1 s. |
| S3 | Arithmetic Square | Fill the X's in a 3×3 grid so that every row and column is an arithmetic sequence (integer common difference). A solution is guaranteed. | values in [−10⁶, 10⁶]; output within ±10⁹ | 4: ≤ 3 X's · +3: values in [−10, 10] · +4: ≥ 7 X's · +2: all values even · (remaining 2: full) | Repeatedly fill any line that has 2 known cells (the middle is (a+c)/2, an end is 2b−a). When stuck, set one unknown to a chosen value (e.g. 0 or a nearby value keeping integrality) and propagate again. Casework and proof of correctness are the hard part. O(1). | 7 | No performance concern. Mind integer division with the parity of a+c; Python `//` floors negatives, so check `(a+c) % 2 == 0`. |

### 2020
Sources: CEMC 2020 problem set and results; DMOJ; GitHub solutions.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Surmising a Sprinter's Speed | Given (time, position) observations, output the max speed you can be sure was reached. | N ≤ 10⁵, T ≤ 10⁹, \|X\| ≤ 10⁹ | 7/15: N ≤ 1000 | Sort by time; answer = max over adjacent pairs of \|Δx/Δt\|. Relative error 10⁻⁵ allowed. O(N log N). | 2 | Trivial. The low average (8.79) suggests many forgot to sort or used an O(N²) approach. |
| S2 (=J5) | Escape Room | M×N grid of values; from a cell with value x you may jump to any (a,b) with a·b = x. Can you reach (M,N) from (1,1)? | M, N ≤ 1000, values ≤ 10⁶ | 1: 2×2 · +2: M=1 · +4: values unique · +4: M, N ≤ 200 · (remaining 4: full) | Model nodes as **products r·c**. Cell (r,c) with value v gives edge (r·c) → v. BFS from product 1 to target M·N. O(MN) with no divisor enumeration. The naive approach enumerates divisors of x for each visited cell. | 5 | 10⁶ input ints: `sys.stdin.buffer.read().split()`. A list of 10⁶+1 lists costs heavy memory in CPython; use a dict or an adjacency array. CPython is borderline at DMOJ's 2 s; PyPy is safer. |
| S3 | Searching for Strings | Count **distinct** permutations of needle N that occur as substrings of haystack H. | \|N\|, \|H\| ≤ 2×10⁵ | 3: \|N\|≤8, \|H\|≤200 · +2: ≤ 200 · +2: ≤ 2000 · (remaining 8: full) | Slide a window of length \|N\| over H with 26 letter counts (O(1) update and match check). For matching windows, insert a **rolling hash** of the window into a set (double hash or a mod near 2⁶¹ against collisions). O(\|H\|·26) or O(\|H\|). | 8 | DMOJ TL is **0.5 s**. A CPython 2×10⁵-step loop with hash arithmetic is tight; PyPy recommended. For the ≤ 2000 subtasks, putting substring slices in a Python `set` works (7 marks without hashing). Python's big ints make a single mod 2⁶¹−1 easy. |

### 2021
Sources: CEMC 2021 problem set and results; DMOJ; community editorials (binary/ternary search, slope sweep).

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Crazy Fencing | Sum of trapezoid areas w_i·(h_i + h_{i+1})/2. | N ≤ 10 000, h, w ≤ 100 | none stated | Direct sum. O(N). | 1 | Output format: samples show `18.5` and `75`. Compute 2·area as an integer and print an integer or `.5` accordingly. Whether a float checker is used is UNVERIFIED. |
| S2 (=J5) | Modern Art | M×N canvas; K row/column toggles; count gold cells. | 1: 1×1 · +4: M=1, N≤100 · +5: M, N ≤ 100, K ≤ 100 · +5: MN ≤ 5×10⁶, K ≤ 10⁶ | as listed | Track the flip parity of each row and column; with r rows and c columns flipped odd times, gold = r·(N−c) + (M−r)·c. O(M+N+K). Simulating the grid is O(K·max(M,N)). | 3 | 10⁶ query lines: fast input. Do not build a 5×10⁶ grid. |
| S3 | Lunch Concert | Friend i at P_i with walking cost W_i/metre and hearing range D_i. Choose integer c to minimize Σ W_i·max(0, \|P_i − c\| − D_i). | N ≤ 2×10⁵; P, D ≤ 10⁹ (full) | 4: N≤2000, P,D≤2000 · +9: P,D ≤ 10⁶ · +2: P,D ≤ 10⁹ | The cost is a **convex piecewise-linear** function of c. Options: binary search on the sign of f(c+1) − f(c), or ternary search, each O(N log range); or sweep the 2N breakpoints sorted, tracking the slope, O(N log N). The 4-mark subtask: try every c in [0, 2000], O(2000·N). | 7 | Binary/ternary search costs ≈ 30–60 evaluations × 2×10⁵ = 6–12 M operations. CPython is likely > 3 s; **prefer the O(N log N) slope sweep in CPython, or use PyPy**. The answer can exceed 32 bits (no issue in Python). |

### 2022
Sources: CEMC 2022 problem set, **official commentary**, results.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Good Fours and Good Fives | Count the (a,b) ≥ 0 with 4a + 5b = N. | N ≤ 10⁶ | 3: N ≤ 10 (hard-code) · +2: multiple of 4 · +2: multiple of 5 · +8: full | Loop over a from 0 to N/4 and check (N−4a) % 5 == 0. O(N). A nested loop over both variables is O(N²), too slow at 10⁶. | 2 | Trivial. |
| S2 (=J4) | Group Work (Good Groups) | X "must be together" and Y "must be apart" constraints, then G groups of 3. Count violated constraints. | G, X, Y ≤ 10⁵ | 3: G≤50, X≤50, Y=0 · +5: G≤50, X,Y≤50 · +7: ≤ 10⁵ | Dict name → group id; check each constraint in O(1). O(X+Y+G). Commentary: an inefficient look-up still earned 14/15 at Junior (Senior table: 8/15 for small). | 3 | Python dict is the idiomatic tool. Pitfall per commentary: assuming name order, or thinking a group violates only one constraint. |
| S3 | Good Samples | Build N notes with pitches in 1..M and **exactly K** good samples (substrings with all-distinct notes), or output −1. | N ≤ 10⁶, K ≤ 10¹⁸ | 3: N≤16, M=2 (brute force) · +3: M=2 · +4: M=N · +5: full | K must be in [N, max], where max is achieved with window length min(i, M) at each position. Greedy construction: keep the length of the current good suffix; each new note adds between 1 and min(suffix+1, M) good samples; choose the largest addition ≤ remaining K − (notes left) and realize it by repeating the note that sits that many positions back. O(N). | 7 | Output 10⁶ numbers with `' '.join(map(str, ...))`. Big K is free in Python. The logic is simple once seen; CPython O(N) is fine at 1 s if the loop body is lean. |

### 2023
Sources: CEMC 2023 problem set, **official commentary**, results.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 (=J4) | Trianglane | Two rows of alternating up/down triangles, some wet (1). Output the total perimeter of the wet regions. | C ≤ 200 000 | 3: no adjacent blacks, row 2 white · +3: row 2 white · +5: C ≤ 2000 general · +4: C ≤ 2×10⁵ | 3·(#black) − 2·(#adjacent black pairs), counting horizontal neighbours in each row and vertical pairs, which occur only at even indices. O(C). The commentary warns that a built-in call inside the loop (e.g. `count`) makes it O(C²). | 2 | Trivial if linear. |
| S2 | Symmetric Mountains | For every crop length, output the minimum asymmetric value Σ\|h_{l+i} − h_{r−i}\| over all crops of that length. | N ≤ 5000, h ≤ 10⁵ | 5: N ≤ 300 (O(N³)) · +5: N ≤ 5000, sorted heights · +5: full | Expand from each centre (odd and even): value(l−1, r+1) = value(l, r) + \|h_{l−1} − h_{r+1}\|. O(N²) ≈ 12.5 M updates. | 5 | **Major Python risk.** 12.5 M inner iterations in CPython take several seconds, against DMOJ's 1 s. The 2D memo version also needs a 25 M-cell list (hundreds of MB). Community advice is "use PyPy3". A numpy diagonal-vectorized version (5000 vector ops) would be fast, but whether numpy is available on the grader is UNVERIFIED. |
| S3 | Palindromic Poster | Build an N×M grid of lowercase letters with exactly R palindromic rows and C palindromic columns, or print IMPOSSIBLE. | N, M ≤ 2000 | 2: R=C=1 · +2: N=M=2 (hand or brute force) · +4: N=2 · +7: full | Commentary: fill the first R rows and first C columns with `a`, the rest with `b`. Special-case R ∈ {0, N} and C ∈ {0, M}, using transposition symmetry. The R=N case needs parity reasoning: remove column palindromes 2 at a time, or use the middle column when M is odd. Some cases (e.g. 4 4 4 1) are impossible. O(NM). | 7 | Output 4 M characters: build row strings and `sys.stdout.write('\n'.join(rows))`. No performance issue. |

### 2024
Sources: CEMC 2024 problem set, **official commentary**, results.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Hat Circle | N (even) people in a circle; count those whose hat matches the person opposite. | N ≤ 10⁶, H ≤ 2×10⁶ | 2: N ≤ 4 · +1: all H=1 · +2: alternating 0/1 · +5: N ≤ 2000 · +5: N ≤ 10⁶ | Compare h[i] and h[(i + N/2) % N]. O(N). | 1 | 10⁶ lines of input: use `sys.stdin.buffer.read().split()`. |
| S2 | Heavy-Light Composition | For each string, letters appearing more than once are heavy. Does the string alternate light/heavy? | T ≤ 10⁴, N ≤ 100 | 5: T≤4, N≤4, letters a/b · +5: T≤10, N≤30 · +2: only `a` heavy · +3: T≤10⁴ | Letter frequency (Counter); check that adjacent characters differ in heaviness. O(T·N). | 2 | Trivial. |
| S3 | Swipe | Swipe right sets A[l..r] = A[l]; swipe left sets A[l..r] = A[r]. Can A become B? If yes, output ≤ N swipes. | N ≤ 3×10⁵ | 2: N=2 · +4: N ≤ 8 (BFS over arrays) · +4: N ≤ 500 · +5: N ≤ 3×10⁵. **Half marks (⌊M/2⌋) for only the YES/NO line.** | YES iff compress(B) (runs merged) is a **subsequence** of A. Construct with two pointers: for each run [l, r] of B, find the source index i in A. Emit left swipes [l, i] in increasing order of right endpoint, then right swipes [i, r] in **reverse** order, so values are not overwritten. O(N). | 7 | O(N) in CPython is fine; join the output. The difficulty is purely insight (avg 1.65, non-zero avg 3.49, the lowest non-zero S3 average in 2016–2026). |

### 2025
Sources: CEMC 2025 problem set and **official commentary**. No averages (results withheld).

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Positioning Peter's Paintings | Min perimeter of a wall holding two upright, non-overlapping rectangles. | A, B, X, Y ≤ 10⁸ | 5: congruent squares · +5: squares · +5: rectangles | min(2(max(B,Y) + A + X), 2(max(A,X) + B + Y)): side by side vs stacked. O(1). | 1 | Trivial. |
| S2 | Cryptogram Cracking Club | A pattern is given in RLE (e.g. a4b1c2d10) and repeats infinitely. Output the c-th character (0-indexed). | \|S\| ≤ 2×10⁵; counts ≤ 10¹²; c ≤ 10¹² | 6: counts ≤ 9, pattern ≤ 2000, c ≤ 2000 · +3: pattern ≤ 10⁶, c ≤ 10⁶ · +3: pattern ≤ 10⁶, c ≤ 10¹² · +3: full | Parse (char, count) pairs; total = Σ counts; c %= total; scan pairs, subtracting counts, until c < count. O(\|S\|). Expanding the pattern fails for counts up to 10¹². | 3 | Parse with `re.findall(r'([a-z])(\d+)', s)`, which handles multi-digit counts (the 1-digit assumption is a trap). Big ints are free. |
| S3 | Pretty Pens | N pens (colour, prettiness). Pick one pen per colour for M colours, maximizing the sum, with the option to recolour one pen. Q updates change a colour or prettiness; answer after each. | N, M ≤ 2×10⁵; Q ≤ 2×10⁵ | 5: Q=0 · +2: M=1 · +2: M=2 · +2: M ≤ 10 · +2: distinct prettiness (for "right idea, buggy implementation") · +2: full | Insight: the answer is max(T, T − min(top-of-colour) + max(non-top pen)), where T is the sum of each colour's max. Maintain per-colour ordered sets, the set of tops, the set of non-tops, and T under updates: O((N+Q) log N) with BBSTs. | 8 | **Python has no built-in BBST.** Use `heapq` with **lazy deletion** (a per-colour max-heap, a min-heap of tops, a max-heap of non-tops, plus version or validity checks). `sortedcontainers` is third-party, so its grader availability is UNVERIFIED. DMOJ TL is 7 s (generous). CPython is probably feasible, but this is the hardest-to-implement S3 of the period. The 5-mark Q=0 subtask is pure O(N) greedy. |

### 2026 (most recent contest, February 2026)
Sources: CEMC 2026 problem set and results (averages); CEMC 2026 **Junior** commentary for J5/S2. **No official Senior commentary exists.** S1 and S3 approaches come from community solutions: Misaka16172 blog (2026-03-08), DanPlus6 C++, doduoduoniaodo Python. Mark those derivations **community-sourced**.

| # | Title | Summary | Constraints | Subtasks | Technique / complexity | Diff | Python |
|---|---|---|---|---|---|---|---|
| S1 | Baby Hop, Giant Hop | Hop from A to B using ±K or ±1 hops. Output the **fewest** hops (T=1) or the **second fewest distinct** hop count (T=2). | \|A\|, \|B\| ≤ 10¹⁸; 2 ≤ K ≤ 10¹⁸ | 5: 0≤A,B≤10, K=2, T=1, forward only · +6: full range, T=1 · +2: A,B ≤ 100, K ≤ 4, T∈{1,2} · +2: full, T∈{1,2} | d = \|B−A\|, q = d // K, r = d % K. Fewest = min(q + r, (q+1) + (K−r)). Second fewest is the smallest distinct value above that among the candidates: the other option, fewest+2 (a wasted ±1 pair), (q−1) + (K+r) when q ≥ 1, etc. Needs parity/casework care. Statement warns about 64-bit ints. O(1). | 4 | Python big ints remove the overflow trap. **CEMC average 7.69/15 is the lowest S1 average in 2016–2026**, and the T=2 "second fewest" casework is error-prone. Brute-force BFS over positions solves the small subtasks (A,B ≤ 100, K ≤ 4) and is a useful checker. Candidate-set details come from community code; the exact official reasoning is unpublished. |
| S2 (=J5) | Beams of Light | N spots and L lights, each covering [P−S, P+S] clipped to [1,N]. Answer Q "is spot i lit?" queries. | N, L, Q ≤ 5×10⁵ | 1: N≤50, L≤1 · +2: N,L,Q ≤ 50 · +3: N ≤ 50, L,Q ≤ 5×10⁵ · +9: all ≤ 5×10⁵ | **Difference array** (+1 at a, −1 at b+1, prefix sum) or merging sorted intervals; then O(1) per query. O(N + L + Q). | 3 | 1.5 M input lines: `sys.stdin.buffer.read().split()`; write output with a single join. Clip bounds carefully. |
| S3 | Common Card Choice | N cards; Alice and Bob take disjoint non-empty subsets (Alice not all cards) whose sums share a divisor > 1. Output a choice or NO. **Last subtask: values hidden (all −1).** Output ≤ 100 pairwise-disjoint guesses; you pass if any guess works (a solution is guaranteed to exist). | N ≤ 10⁵, c ≤ 10¹² | 2: N ≤ 3, c ≤ 100 · +1: N ≤ 10 · +1: c ≤ 2 · +2: c ≤ 10⁵ · +2: c ≤ 10¹² · +7: N = 10⁵, hidden values | Insight: **parity**. Two evens → {e1}, {e2} (gcd ≥ 2). One even and two odds → {e}, {o1, o2}. Four odds → {o1, o2}, {o3, o4} (both sums even). So with N ≥ 4 the answer is always YES, and brute-forcing subsets of any 4 cards works; for N ≤ 3, brute-force all splits and check with `math.gcd`. Hidden subtask: output up to 100 disjoint (2,2) guesses from a random shuffle; each fails only if its four cards are not "all odd" (and similar). With 100 disjoint guesses, failure probability is negligible. Community solutions mix (1,1) and (2,2) guesses (Misaka16172). | 7 | Trivial compute. Hard part: the insight and reading the output format (disjoint guesses, **1-indexed**). The blog notes the official checker did not trim trailing spaces (community report, UNVERIFIED), so print exactly. Worth 7/15 for the hidden subtask alone. |

---

## 2. Trend analysis, 2019–2026

### 2.1 Difficulty signals (CEMC averages, all Senior contestants, out of 15)

| Year | S1 | S2 | S3 | S3 non-zero avg |
|---|---|---|---|---|
| 2016 | 11.03 | 10.44 | 1.39 | 8.40 |
| 2017 | 14.12 | 13.24 | 6.20 | 11.04 |
| 2018 | 9.70 | 8.09 | 1.11 | 9.46 |
| 2019 | 13.47 | 6.71 | 1.43 | 6.42 |
| 2020 | 8.79 | 4.16 | 1.83 | 5.64 |
| 2021 | 13.38 | 9.50 | 2.47 | 6.58 |
| 2022 | 11.03 | 6.44 | 1.41 | 7.40 |
| 2023 | 11.06 | 4.26 | 1.56 | 5.90 |
| 2024 | 13.73 | 10.68 | 1.65 | 3.49 |
| 2025 | none published (results withheld) | | | |
| 2026 | **7.69** | 6.01 | 1.39 | 7.31 |

Observations:
- **S3 is consistently brutal**: the all-contestant average stays at 1.1–2.5 every year since 2018. Only 2017 (6.20) was easy. A perfect S3 score puts a student in a small minority every year, so the course must treat S3 as the pivotal problem.
- **S2 averages dropped** from about 10–13 (2016–2017) to 4–7 in 2019, 2020, 2022, 2023 and 2026, with rebounds in 2021 and 2024. S2 now routinely needs one genuine algorithmic idea, such as a sieve, BFS modelling, a dict, O(N²) centre expansion or a difference array, rather than pure implementation.
- **S1 is no longer guaranteed trivial.** 2026 S1 had the lowest S1 average on record in this dataset (7.69), because of 64-bit ranges and "second fewest" casework. 2020 S1 (8.79) and 2018 S1 (9.70) also cost marks through missed sorting or formatting details.
- In **2024–2026, bounds at N ≈ 10⁵–10⁶ appear even on S1/S2** (S1 2024: N ≤ 10⁶; S2 2026: 5×10⁵). An O(N²) approach loses the last subtask, and in Python so does slow input.

### 2.2 Topic shift for S3

| Era | S3 topics |
|---|---|
| 2014–2018 ("classic algorithm" S3) | stack (2014), greedy + DSU (2015), tree pruning + diameter (2016), frequency counting (2017), grid BFS with special moves (2018) |
| 2019–2026 ("insight / constructive" S3) | 2019 constructive casework · 2020 hashing + sliding window · 2021 convex optimization / binary search / sweep · 2022 constructive greedy · 2023 constructive casework · 2024 subsequence + constructive ordering · 2025 greedy insight + dynamic ordered data structures · 2026 parity number theory + constructive + randomization |

- **Constructive / ad hoc output-a-witness problems dominate recent S3**: 2019, 2022, 2023, 2024 and 2026 all say "output any valid X or say impossible". Five of the last eight S3s require a valid construction and many are special-judged. Teaching "how to discover a construction", with small brute-force exploration, pattern spotting and casework, is essential.
- **Graph S3s disappeared after 2018**; BFS moved down to S2 (2020). Graphs are now more typical of S4.
- **Data-structure-heavy S3** returned in 2025 (updates plus ordered sets), which is a Python pain point.
- **Math/number-theory flavour is rising**: 2019 S2 primes, 2022 S1 linear combination, 2026 S1 div/mod casework, 2026 S3 gcd/parity.

### 2.3 S1/S2 topic frequency, 2014–2026 (26 problems)

| Topic | Count | Examples |
|---|---|---|
| Straight simulation / implementation | 7 | 14S1, 15S1, 18S2, 19S1, 21S1, 21S2, 24S1 |
| Counting / frequency arrays / dict | 6 | 14S2, 16S1, 22S2, 24S2, 17S1 (prefix), 15S2 |
| Sorting + greedy | 4 | 16S2, 17S2, 18S1, 20S1 |
| Math / number theory | 4 | 19S2 (primes), 22S1, 25S1, 26S1 |
| Prefix sums / difference arrays | 2 | 17S1, 26S2 |
| Graph BFS | 1 | 20S2 |
| O(N²) interval DP / centre expansion | 1 | 23S2 |
| String parsing + modular arithmetic | 1 | 25S2 |

### 2.4 Most recurring techniques across S1–S3 (all years)

1. Fast input and linear loops at N ≈ 10⁵–10⁶ (almost every year).
2. Frequency counting with arrays and dicts: 14S2, 16S1, 17S3, 20S3, 22S2, 24S2, 26S3 (brute-force checks).
3. Sorting, alone or with greedy: 16S2, 17S2, 18S1, 20S1, 15S3, 21S3 (sweep).
4. Constructive / casework: 19S3, 22S3, 23S3, 24S3, 26S3, 26S1.
5. Math with div/mod/parity/gcd: 19S2, 22S1, 25S2, 26S1, 26S3.
6. BFS on grids and graphs: 16S3, 18S3, 20S2.
7. Prefix sums and difference arrays: 17S1, 26S2 (and prefix-sum-like accumulation in 25S2).

---

## 3. Consolidated technique list for S1–S3 full marks (prerequisite order)

"Depth" means how far the learner must go for CCC S1–S3, not the whole topic.

| # | Technique | Depth needed | Example problems |
|---|---|---|---|
| 1 | Python basics: variables, int/str/float, `if`, `for`/`while`, functions | fluent | all |
| 2 | Input parsing: `input()`, `split`, multiple lines, then **fast I/O** (`sys.stdin.buffer.read().split()`, `sys.stdout.write`, `'\n'.join`) | essential; 10⁶-line inputs appear often | 15S2, 17S3, 20S2, 21S2, 24S1, 26S2 |
| 3 | Exact output formatting (floats with `.1f`, spaces, YES/NO, "any valid answer") | essential | 18S1, 20S1, 21S1, 24S3, 26S3 |
| 4 | Lists/arrays, indexing, modular (circular) indexing | fluent | 14S1, 24S1, 23S1 |
| 5 | Strings: counting, slicing, palindromes, parsing with `re` | solid | 16S1, 24S2, 25S2, 23S3 |
| 6 | 2D grids: nested lists, rotation/transposition, neighbour scanning | solid | 18S2, 18S3, 23S1, 23S3, 21S2 |
| 7 | Integer math: `//`, `%`, parity, floor with negatives, big integers (free in Python), `math.gcd` | solid; heavily tested lately | 22S1, 25S2, 26S1, 26S3, 19S3 |
| 8 | Brute force / complete search (loops over candidates, subsets via `itertools`, permutations) | solid; it is the key to partial marks | 22S1, 26S3, 16S3 partials, 22S3 st1, 24S3 st2 |
| 9 | Complexity estimation (≈10⁷ simple operations/s in CPython; read the bounds and pick O(N), O(N log N) or O(N²)) | essential | every problem with subtasks |
| 10 | Frequency counting: arrays over value ranges, `dict`, `Counter`, `set` | fluent | 14S2, 16S1, 17S3, 22S2, 24S2, 20S3 |
| 11 | Stack / queue (`list`, `collections.deque`) | solid | 14S3, 15S1, BFS |
| 12 | Sorting (including by key) and greedy arguments | solid | 16S2, 17S2, 18S1, 20S1, 15S3 |
| 13 | Prefix sums and **difference arrays** | solid | 17S1, 26S2, 25S2 (cumulative) |
| 14 | Simulation with state compression (parity of flips, "only counts matter") | solid | 19S1, 21S2 |
| 15 | Primes: sieve of Eratosthenes, trial division | moderate | 19S2 |
| 16 | Two pointers / subsequence matching / sliding window | solid | 24S3, 20S3, 23S2 |
| 17 | Binary search (`bisect`; binary search on the answer or on a monotone predicate) | moderate | 21S3, 15S3 (alt.) |
| 18 | Convexity / ternary search / slope sweep | moderate (one problem) | 21S3 |
| 19 | Graphs: adjacency lists, BFS (shortest path in unweighted graphs), grid BFS, 0-1 BFS / zero-cost moves, iterative DFS | solid | 16S3, 18S3, 20S2 |
| 20 | Trees: pruning leaves, diameter via two BFS | moderate | 16S3 |
| 21 | Basic DP / interval recurrences (value(l, r) from value(l+1, r−1)) | moderate | 23S2 |
| 22 | Hashing: polynomial rolling hash, collision safety, set of hashes | moderate | 20S3 |
| 23 | Union-Find (DSU), iterative `find` with path compression | moderate | 15S3 |
| 24 | Heaps (`heapq`) with **lazy deletion** as a BBST substitute; maintaining aggregates under point updates | advanced for S3 | 25S3 |
| 25 | Constructive problem-solving: build a witness, handle edge cases (0 / all / parity), use symmetry (transpose), verify with a brute-force checker | **critical for recent S3** | 19S3, 22S3, 23S3, 24S3, 26S3 |
| 26 | Randomized strategies (shuffle, probabilistic guarantees) | light | 26S3 last subtask |
| 27 | Stress testing: write a brute force and compare it against the fast solution on random small inputs | essential habit | all S3 |

Python-specific must-knows for S1–S3:
- Recursion limit and depth: prefer iterative DFS/BFS (16S3, DSU).
- `sys.setrecursionlimit` is not enough on its own, because deep recursion can crash the C stack.
- No built-in ordered set: use `heapq` + lazy deletion, or `bisect.insort` for small sizes (25S3).
- Avoid O(N) built-ins inside loops (`list.pop(i)`, `in list`, `count`, slicing); the 23S1 commentary warns about exactly this.
- For heavy O(N²) loops (23S2) or long float/int loops (21S3, 20S3), use PyPy if it is allowed. Grader support is UNVERIFIED here; confirm with the rules worker.

---

## 4. Partial-marks insights for S3 (and hard S2)

Pattern: nearly every S3 since 2016 gives **2–7 marks for a small-constraint brute force**, and often a few more for a special case. A learner who reliably banks S1 + S2 = 30 and grabs about 4–8 on S3 does better than a typical contestant; the S3 all-contestant average is about 1.5.

| Problem | Cheap marks | How |
|---|---|---|
| 26S3 Common Card Choice | up to 8/15 without the hidden subtask | 2: N ≤ 3 brute force over all splits with `gcd` · +1: N ≤ 10 brute force over all (A,B) assignments (3¹⁰) · the rest via the parity idea. The hidden subtask (7) needs the random disjoint-guess idea. |
| 25S3 Pretty Pens | 5/15 (Q=0) + 4 (M=1, M=2 with heaps) | Static greedy: sum of colour maxima, try moving the best second-best pen into the colour with the smallest max. Recomputing per query is O(NQ), which fails large Q, but M ≤ 10 with per-colour heaps gives +2. |
| 24S3 Swipe | 2 + 4 + (half of the rest for YES/NO) | N=2 casework; N ≤ 8 BFS over array states. **⌊M/2⌋ marks per subtask for a correct YES/NO line only**, so the subsequence test alone gives 1+2+2+2 = 7 even with no construction. |
| 23S3 Palindromic Poster | 2 + 2 (+4 with more work) | R=C=1: fill the first row and column with `a`, the rest with `b`. N=M=2: hand-solve or brute force the 2×2 grids over a few letters. |
| 22S3 Good Samples | 3 (+3) | N ≤ 16, M=2: brute force all 2¹⁶ sequences and count good samples. M=2 general: greedy alternate/repeat. |
| 21S3 Lunch Concert | 4 (+9 with a faster search) | Try every integer c in [0, 2000] and evaluate the cost in O(N): O(2000·N) = 4 M. |
| 20S3 Searching for Strings | 3 + 2 + 2 = 7 | \|N\| ≤ 8: generate distinct permutations with `itertools.permutations` + set and test `in H`. ≤ 2000: slide a window, compare counts, add the slice string to a set. Only the final 8 marks need hashing. |
| 19S3 Arithmetic Square | 4 (+3, +4, +2) | ≤ 3 X's: fill-by-propagation alone. ≥ 7 X's: simple patterns (e.g. fill everything with the single known value). Values in [−10, 10]: brute-force search over small values for the unknowns. |
| 18S3 RoboThieves | 5 + 5 | Plain grid BFS (no cameras or conveyors), then add camera marking. Conveyors are the last 5. |
| 17S3 Nailed It! | 5 + 4 + 3 | N ≤ 100: all pairs by brute force; N ≤ 1000: O(N²) pair sums with a dict; counting over lengths gets full marks. |
| 16S3 Phonomenal Reviews | 3 + 3 + 3 + 4 | M=2: BFS distance. M ≤ 3 / M ≤ 8: permutations of visit order × BFS distances. N ≤ 1000: slower pruning. |
| 15S3 Gates | 40% | O(P·G) scan for the largest free gate. |
| 23S2 Symmetric Mountains (S2) | 5 (+5) | O(N³) brute force for N ≤ 300. Sorted heights allow a prefix-sum trick. Relevant for Python users if O(N²) TLEs in CPython. |
| 26S1 Baby Hop (S1) | 11/15 for T=1 only | T=2 ("second fewest") is only 4 marks; BFS brute force for small A, B, K doubles as a checker. |

General partial-mark heuristics to teach:
1. **Read the subtask table first.** It tells you the intended complexities (N ≤ 8 means brute force or permutations; N ≤ 2000 means O(N²); N ≤ 2×10⁵ means O(N log N); N = 1 or 2 means casework).
2. **Special structures** (M=1, M=2, "sorted", "all equal", "R=C=1") are designed as stepping stones and are usually solvable in minutes.
3. **Decision-only credit.** When a problem asks for YES/NO plus a construction, check whether the decision alone earns marks (24S3 does explicitly).
4. **Brute force doubles as a verifier** for the insight needed for full marks: stress-test the greedy or constructive idea against it on random small cases.
5. Submit the partial solution **first**, then iterate. Recent CEMC grading is per-subtask, so a slow full attempt that TLEs on the large subtask still keeps the small-subtask marks, provided those tests pass.

---

## 5. Known gaps / UNVERIFIED items for the orchestrator

- **DMOJ solve counts and Python/PyPy AC status per problem: not obtained.** Cloudflare blocked `dmoj.ca` pages and the submissions API after the first API pull. The Python-feasibility calls above are analytical. Suggested follow-up: a worker with browser access checks the DMOJ "best solutions" pages filtered by PY3/PYPY3 for 23S2, 21S3, 20S3, 20S2, 17S3, 25S3.
- **Official CCC grader time limits for 2018–2026 are not printed** in CEMC statements. The DMOJ limits (e.g. 0.5 s for 20S3, 7 s for 25S3) may differ from the official ones.
- **The 2026 S1 "second fewest" exact official semantics and solution** are inferred from the samples (4 → 5 in sample 3 shows distinct values) and from community code, since no official Senior commentary exists for 2026.
- **The 2026 S3 checker note** (trailing spaces not tolerated) is a single community claim (Misaka16172 blog).
- **No official commentary exists for 2014–2021.** Techniques for those years come from the statements plus community editorials (USACO Guide, jeffreyxiao.me, GitHub repos).
- 2014–2015 statements have no mark-level subtask tables except the "50%/40%" notes shown above.
- Participation fell from 3947 (2024) to 2439 (2026). The cause is not researched (possibly a rules or format change after 2025); flag it for the format/rules worker.

## 6. Source URLs

- CEMC past contests (CCC): https://cemc.uwaterloo.ca/resources/past-contests?contest_category=29
- Problem sets:
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCSrProblems.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCSrProblems.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2024/2024CCCSrProblems.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2023/2023CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2022/2022CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2021/2021CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2020/2020CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2019/2019CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2018/2018CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2017/2017CCCSrProblemSet.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2016/2016CCCSrProblems.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2015/2015CCCSrProblems.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2024/2015CCCSrProblemSet.pdf
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2014/2014CCCSrProblems.html
- Commentaries:
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCSrCommentary.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2024/2024CCCSrCommentary.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2024/2023CCCSrCommentary.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2024/2022CCCSrCommentary.html
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCJrCommentary.html
- Results booklets (problem averages): https://cemc.uwaterloo.ca/sites/default/files/documents/<YYYY>/<YYYY>CCCResults.pdf for 2016–2026 (2025: results withheld notice).
- DMOJ API, example: https://dmoj.ca/api/v2/problem/ccc26s3 (and ccc14s1 … ccc26s3); DMOJ 2026 mirror: https://dmoj.ca/contest/ccc26s
- Luogu mirrors: https://www.luogu.com.cn/problem/P15541 (2026 S1), P15540 (J5/S2), P15542 (S3); J5/S2 article: https://www.luogu.com/article/q3kdmm93
- 2026 S3 editorial (community): https://github.com/Misaka16172/misaka16172.github.io (solution-p15542.html)
- 2026 C++ solutions: https://github.com/DanPlus6/CompetitiveProgramming (National Contests/CCC/2026)
- Python solutions: https://github.com/doduoduoniaodo/CCC-Solutions
- 2016 S3: https://usaco.guide/problems/ccc-phenomenal-reviews/solution, https://jeffreyxiao.me/blog/ccc-2016-analysis/
- 2019 S3: https://forum.usaco.guide/t/ccc-2019-s3-help/3941
- 2021 S3 editorial (DMOJ, seen via search snippet only): https://dmoj.ca/problem/ccc21s3/editorial
- CCCSolutions site (JS-rendered, content not retrievable): https://cccsolutions.ca/
