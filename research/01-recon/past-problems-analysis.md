# CCC Past Problems Analysis, 2014–2026 (Junior J1–J5 and Senior S1–S5)

Phase 1 (Recon) consolidated deliverable, written 2026-09-21 by W3 (round 2).

**Depth lives in the working files. This file is the tight index.**
- Junior J1–J5: `_working/w2-junior-problems.md` (W2)
- Senior S1–S3: `_working/w3-senior-s1-s3.md` (W3)
- Senior S4–S5 and DMOJ Python evidence: `_working/w4-senior-s4-s5.md` (W4)
- Grader, Python and rules context: `python-for-ccc.md`, `ccc-format-and-rules.md`
- Bibliography: `sources.md`

---

## 0. Ground rules for reading this file

### 0.1 Python environment (reconciled and verified)

Earlier, the W3 notes said "PyPy availability UNVERIFIED". That is now **resolved**.

- **The official CCC Grader's "Python 3" is PyPy3 7.3.9, running Python 3.8.13.**
  - Re-verified by W3 on 2026-09-21. `https://cccgrader.com/sample_soln.pdf` reads "Compiler Version: Pypy3 7.3.9 (running Python 3.8.13)".
  - "Python 2" is PyPy 7.3.9 (Python 2.7.18).
  - W1 and W4 found the same PDF unchanged in Wayback snapshots through 2026-08. The Grader used PyPy3 in every archived version since 2018.
- **Per-problem exception.** The **2026 J4** statement says: "Python 3 submissions for this problem will be evaluated using the standard interpreter python3 (Version 3.10.12) instead of pypy3 7.3.9 (Version 3.8.13)."
  - Re-verified in `2026CCCJrProblems.html`.
  - No 2026 Senior statement has such a note (W3 grep of `2026CCCSrProblems.html`).
  - Lesson: **always read a problem's Technical Notes.**
- **Default limits: 3 s and 512 MB "unless stated otherwise"** (`cccgrader.com/rules.pdf`, 2026). No Python multiplier is published.
  - Statements from 2018 on print no limits. 2017 printed 1–5 s. 2013–2016 used 5 s.
  - **DMOJ limits differ from the CCC's.** Examples: DMOJ 0.5 s for 20S3 and 25S1; 7 s for 25S3.
- **CEMC's own warning (CCC page, 2026):** "it may not always be possible to achieve a perfect score with a particular language choice (for example, Python or Java)."
- **Language level: write Python 3.8 only.**
  - No `match`, `math.lcm`, `functools.cache`, runtime `list[int]` hints, `bisect(key=)`, `itertools.pairwise`, `str.removeprefix`, `int.bit_count`, `dict | dict`, or `math.gcd` with more than 2 arguments.
  - **Checked:** none of the techniques recommended in this file or in `w3-senior-s1-s3.md` needs Python 3.9 or later. The building blocks are `sys.stdin.buffer`, `heapq`, `bisect` (no `key=`), `collections.deque`/`Counter`, `itertools.permutations`/`accumulate`, `re.findall`, two-argument `math.gcd`, `math.isqrt` (3.8), and f-strings.
  - Known 3.9+ traps in public repos: A-stick-bug uses `functools.cache` (14S5, 18S4), `math.lcm` (21S5) and `list[int]` (17S5). Replace them with `lru_cache(maxsize=None)`, `a // gcd(a, b) * b`, and no annotation.

### 0.2 Python verdict legend (for the official PyPy3 Grader, 3 s default)

| Verdict | Meaning |
|---|---|
| **OK** | Straightforward in any Python |
| **OK-IO** | Fine, but needs fast I/O (`sys.stdin.buffer.read().split()`, output joined once) |
| **OK-PyPy** | Needs PyPy speed or careful constant factors. It passes on the Grader, but would likely TLE in CPython (for example on DMOJ `PY3`) |
| **TIGHT** | Borderline even in PyPy; needs flat arrays, no recursion, inlining |
| **HARD/INF?** | A Python full solution is very hard or probably impossible (partials only) |

Other conventions:
- **Difficulty (1–10)** uses one absolute scale across both divisions: 1 means a trivial J1, 10 means the hardest S5.
  - Senior values are W3/W4's ratings.
  - Junior values are W2's Junior-relative scores converted by ×0.7 and rounded (minimum 1).
  - Shared problems take the Senior rating.
  - All ratings are informed by the CEMC per-problem averages (section 2.3).
- **Shared problems** are marked `J4=S1` etc. They are verified against both official problem sets (W2 section 2).
- **Flags.** "UNVERIFIED" is carried forward from the working files. "(comm.)" means the full-solution technique comes from community sources, because no official commentary exists: 2014–2021 and 2026 Senior. Official commentaries exist for Senior 2022–2025 and Junior 2022–2026.

---

## 1. Per-year tables

Column abbreviations: **Diff** = difficulty; **Py** = Python verdict; **Cheap partial route** = the easiest subtask marks.

### 2014

Sources: CEMC 2014 Jr/Sr problem sets. No results booklet, so no averages. Subtasks are given as percentages or not at all.

| # | Title | Topic | Key techniques (full marks) | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Triangle Times | conditionals | if/elif on 3 angles | 1 | OK | none (whole problem easy) |
| J2 | Vote Count | strings | count A vs B | 1 | OK | none |
| J3 | Double Dice | simulation | loop plus accumulators | 1 | OK | none |
| J4=S1 | Party Invitation | list simulation | rebuild the list per round; 1- vs 0-based positions | 1 | OK | none |
| J5=S2 | Assigning Partners | dict/mapping | name → partner map; check symmetry and no self-partner | 2 | OK | none |
| S3 | The Geneva Confection | stack | simulate the branch as a stack, O(N) per test | 3 | OK | none (no subtasks) |
| S4 | Tinted Glass Window | coordinate compression + sweep | 2D difference array on the compressed grid, O(N²) | 6 | OK-PyPy | 10%: N, K ≤ 100 with small coordinates |
| S5 | Lazy Fox | DP over sorted pairs | sort about 2·10⁶ pair distances (packed ints), DP with equal-distance buffering | 8 | HARD | 20%: N ≤ 50; 40%: N ≤ 200 (O(N³) memo) |

### 2015

Sources: CEMC 2015 sets. The instructions give **5 s per test**.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Special Day | conditionals | tuple/date comparison | 1 | OK | none |
| J2 | Happy or Sad | strings | `str.count` | 1 | OK | none |
| J3 | Rövarspråket | string building | `ord`/`chr`, nearest vowel | 2 | OK | none |
| J4 | Wait Time | event simulation | per-friend dict, time counter | 3 | OK | none |
| J5 | π-day | DP / memo recursion | partition count with `lru_cache(maxsize=None)` or a table | 6 | OK-PyPy | 20%: n ≤ 9 brute recursion; 50%: n ≤ 70 |
| S1 | Zero That Out | stack | list append/pop | 1 | OK | none |
| S2 | Jerseys | greedy | mark used jerseys, O(J+A) | 2 | OK-IO | 50%: J, A ≤ 10³ |
| S3 | Gates | greedy + DSU | largest free gate ≤ g_i via "next free" DSU (iterative find) | 6 | OK | ≥ 40%: G, P ≤ 2000 with an O(PG) scan |
| S4 | Convex Hull | Dijkstra on states | (node, wear) states, flat dist array | 6 | OK-PyPy | 40%: K = 1 (plain Dijkstra) |
| S5 | Greedy For Pies | multi-dimensional DP | sort extras, 3D bottom-up DP | 8 | HARD | 20%: M = 0 (house robber); M = 1 |

### 2016

Averages: 2016CCCResults.pdf. There were 1225 Senior and 2008 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Tournament Selection | counting | count W, map to group | 1 | OK | none |
| J2 | Magic Squares | 2D lists | row/column sums | 1 | OK | none |
| J3 | Hidden Palindrome | brute force | all substrings O(n³) | 3 | OK | none |
| J4 | Arrival Time | time simulation | minute-by-minute with rush-hour rule, `:02d` | 4 | OK | none |
| J5=S2 | Tandem Bicycle | sorting + greedy | min: both ascending; max: one reversed | 3 | OK | 8 marks for type 1 only |
| S1 | Ragaman | counting | letter counts, stars fill the gap | 2 | OK | 8/15: no `*` |
| S3 | Phonomenal Reviews | tree | prune non-Pho leaves; answer = 2·edges − diameter (two BFS) | 7 | OK (iterative) | 3: M = 2 (BFS distance); M ≤ 8 permutations → 9 |
| S4 | Combining Riceballs | interval DP | can[i][j] with two-pointer transitions, O(N³) | 7 | OK-PyPy | 1 + 2: N ≤ 10 brute force |
| S5 | Circle of Life | doubling / XOR | state after 2^k steps = XOR of shifted cells; O(N log T) | 7 | OK | 1: N, T ≤ 15 simulate; +6 cycle detection for N ≤ 15 |

### 2017

This is the only year with a printed TL per problem: J1–J4 1 s, J5 2 s; S1 1, S2 1, S3 2, S4 3, S5 5 s. There were 1925 Senior and 2360 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Quadrant Selection | conditionals | if/elif | 1 | OK | none |
| J2 | Shifty Sum | loops | powers of 10 | 1 | OK | none |
| J3 | Exactly Electrical | math insight | Manhattan distance ≤ t and same parity | 4 | OK | 6: tiny coords / t ≤ 8 via BFS or search |
| J4 | Favourite Times | periodicity | count per 720-minute cycle × cycles + remainder | 4 | OK | 4: D ≤ 10 000 simulate |
| J5=S3 | Nailed It! | frequency counting | cnt[len ≤ 2000]; loop over pairs of lengths (about 4·10⁶) | 5 | OK-PyPy | Sr: 5 (N ≤ 100 all pairs), +4 (N ≤ 1000); Jr weights 7/6/1/1 |
| S1 | Sum Game | prefix sums | running totals | 1 | OK | 7: N ≤ 1000 |
| S2 | High Tide, Low Tide | sorting | interleave the reversed lower half with the upper half | 2 | OK | none |
| S4 | Minimum Cost Flow | MST + DSU | Kruskal preferring original edges; enhancer case | 7 | OK | 3 + 5 + 3 with D = 0 (plain Kruskal tie-break) |
| S5 | RMT | sqrt decomposition + Fenwick | heavy/light line split, lazy rotation | 9 | HARD/INF? | 2: N, Q ≤ 1000 brute force |

### 2018

There were 2144 Senior and 3017 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Telemarketer or not? | conditionals | `in`, `and` | 1 | OK | none |
| J2 | Occupy parking | strings | `zip` compare | 1 | OK | none |
| J3 | Are we there yet? | prefix sums | cumulative positions, 5×5 table | 1 | OK | none |
| J4=S2 | Sunflowers | 2D rotation | rotate with `zip(*g[::-1])` until ordered | 3 | OK | none |
| J5 | Choose your own path | graph BFS | adjacency lists, deque | 5 | OK | 4: small; +3 acyclic |
| S1 | Voronoi Villages | sorting | min over (v[i+1] − v[i−1]) / 2, `.1f` | 2 | OK | none |
| S3 | RoboThieves | grid BFS | camera marking; 0-cost conveyor moves with loop detection | 7 | OK | 5: plain BFS; +5 with cameras |
| S4 | Balanced Trees | memo + number theory | f(n) over ⌊n/k⌋ blocks, `lru_cache(maxsize=None)` | 6 | OK | 5: N ≤ 1000 direct DP |
| S5 | Maximum Strategic Savings | MST + DSU | Kruskal over edge types with two DSUs | 8 | OK | 2 + 2 + 5: explicit Kruskal on small graphs |

### 2019

There were 2719 Senior and 3713 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Winning Score | arithmetic | weighted sums | 1 | OK | none |
| J2 | Time to Decompress | strings | string `*` | 1 | OK | none |
| J3 | Cold Compress | run detection | run-length encode | 2 | OK | none |
| J4=S1 | Flipper | parity | count H and V mod 2 | 1 | OK | 8: ≤ 1000 chars |
| J5 | Rule of Three | backtracking | DFS with pruning plus visited (step, string) set | 7 | TIGHT (UNVERIFIED last mark) | 7: S ≤ 6; +7 S ≤ 12 |
| S2 | Pretty Average Primes | primes | sieve to 2·10⁶ (bytearray), search outward from N | 3 | OK | 6: N < 1000 trial division |
| S3 | Arithmetic Square | constructive casework | propagate lines with 2 knowns; fix one free cell and repeat | 7 | OK | 4: ≤ 3 X's (propagation only); +4 ≥ 7 X's |
| S4 | Tourism | DP + range max | block prefix/suffix maxima, O(N) | 9 | TIGHT | 3: 2K ≥ N; +3 O(NK) DP |
| S5 | Triangle: The Data Structure | 2D doubling DP | triangle sparse table | 9 | HARD/INF? | 4: N ≤ 1000 |

### 2020

There were 2827 Senior and 3769 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Dog Treats | arithmetic | one formula | 1 | OK | none |
| J2 | Epidemiology | while loop | running totals | 1 | OK | none |
| J3 | Art | min/max parsing | `split(',')`, min/max ± 1 | 1 | OK | 12: two-digit coords |
| J4 | Cyclic Shifts | strings / brute force | all rotations plus `in` | 3 | OK | 6: \|S\| = 3 |
| J5=S2 | Escape Room | graph BFS | nodes = products r·c; edge r·c → value; BFS 1 → M·N | 5 | OK-IO / OK-PyPy | 1: 2×2; +2 M = 1; +4 unique values |
| S1 | Surmising a Sprinter's Speed | sort + scan | sort by t, max \|Δx/Δt\| | 2 | OK | 7: N ≤ 1000 O(N²) |
| S3 | Searching for Strings | hashing | sliding 26-count window plus rolling hash in a set | 8 | OK-PyPy | 3: \|N\| ≤ 8 permutations; +2 +2 (≤ 2000) with a set of slices = 7 |
| S4 | Swapping Seats | prefix sums (circular) | prefix counts over the doubled string, both orders | 6 | OK-PyPy | 4 + 4: no C (two letters) |
| S5 | Josh's Double Bacon Deluxe | probability DP | back-to-front probabilities, O(N) | 8 | OK (Python 15/15 self-reported) | 4: N ≤ 10⁵, M ≤ 1000 |

### 2021

A remote-writing year (secondary source). There were 2920 Senior and 4003 Junior contestants, and **32 perfect Senior scores**.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Boiling Water | formula | P = 5B − 400; sign | 1 | OK | none |
| J2 | Silent Auction | max with tie-break | strict `>` | 1 | OK | none |
| J3 | Secret Instructions | sentinel loop | `while True`/`break`, slicing | 1 | OK | none |
| J4 | Arranging Books | greedy counting | misplaced-region counts, 2-cycles then 3-cycles | 5 | OK | 7: only L/S, ≤ 1000 |
| J5=S2 | Modern Art | parity counting | r·(N−c) + (M−r)·c | 3 | OK-IO | 1 + 4 + 5 = 10: simulate the grid when small |
| S1 | Crazy Fencing | geometry sum | trapezoids; print `.5` correctly (checker tolerance UNVERIFIED) | 1 | OK | none |
| S3 | Lunch Concert | convexity + binary search | binary/ternary search on c, or slope sweep over sorted breakpoints | 7 | OK-PyPy | 4: try every c ≤ 2000 |
| S4 | Daily Commute | BFS + multiset | reverse BFS; min(i + walk[S_i]) with a lazy-deletion heap | 7 | OK-PyPy | 2 + 2 + 3: recompute BFS per day |
| S5 | Math Homework | difference arrays + gcd | 16 diff arrays, lcm via gcd, sparse-table gcd check | 7 | OK-PyPy (no `math.lcm`) | 3: Z ≤ 2 small; +4 Z ≤ 16 small |

### 2022

Official commentaries exist from this year on. There were 3262 Senior and 4909 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Cupcake Party | arithmetic | formula | 1 | OK | none |
| J2 | Fergusonball Ratings | loop + flag | two lines per player | 1 | OK | none |
| J3 | Harp Tuning | tokenizing | character state machine | 3 | OK | 5: one instruction |
| J4=S2 | Group Work (DMOJ: Good Groups) | dict lookup | name → group dict, O(1) checks | 3 | OK | Sr 3 + 5 (small, list search); Jr gives 14/15 without a dict |
| J5 | Square Pool | candidate coordinates | edges from tree coordinates, O(T³) | 7 | OK | 3: T = 1; +5 N ≤ 50 |
| S1 | Good Fours and Good Fives | math loop | loop over a, check (N − 4a) % 5 | 2 | OK | 3 hard-code; +2 +2 multiples of 4/5 |
| S3 | Good Samples | constructive greedy | track the good-suffix length; choose each new note's contribution greedily | 7 | OK | 3: N ≤ 16, M = 2 brute force (2¹⁶) |
| S4 | Good Triplets | counting + prefix sums | circular counts, O(N + C) | 7 | OK-PyPy | 3: N ≤ 200 O(N³); +3 C ≤ 6000 |
| S5 | Good Influencers | tree DP | 3-state DP, iterative post-order | 8 | OK-PyPy | 5: path, N ≤ 2000 |

### 2023

There were 3420 Senior and 6242 Junior contestants.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Deliv-e-droid | arithmetic | formula plus bonus | 1 | OK | none |
| J2 | Chili Peppers | lookup table | dict literal | 1 | OK | none |
| J3 | Special Event | column counting | max plus ties, `','.join` | 2 | OK | 6: one all-day; 6: unique max |
| J4=S1 | Trianglane | counting | 3·black − 2·shared edges (vertical pairs only at even columns) | 2 | OK | 3 + 3 + 5 = 11 with C ≤ 2000 |
| J5 | CCC Word Hunt | grid brute force | 8 directions plus one right-angle bend | 6 | OK | 2 + 2 + 2: straight lines only |
| S2 | Symmetric Mountains | O(N²) interval expansion | expand from each centre, adding \|h_l − h_r\| | 5 | **OK-PyPy** (12.5M ops; CPython TLEs) | 5: N ≤ 300 O(N³) |
| S3 | Palindromic Poster | constructive casework | first R rows / C columns of `a`, rest `b`; special-case 0, N, M and parity | 7 | OK | 2: R = C = 1; +2 N = M = 2 by hand |
| S4 | Minimum Cost Roads | Dijkstra + MST | unique-shortest-path test via N× Dijkstra; DSU for 0-length edges | 7 | OK-PyPy | 3: all lengths 0 (MST) |
| S5 | The Filter | number theory (Cantor) | base-3 pruning, iterate f(r) with memo | 9 | TIGHT | 3: N a power of 3; +4 N ≤ 10⁵ |

### 2024

There were 3947 Senior and 6185 Junior contestants. **No shared J/S problem this year.**

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Conveyor Belt Sushi | arithmetic | 3R + 4G + 5B | 1 | OK | none |
| J2 | Dusa And The Yobis | while loop, unknown input count | read until the stop condition | 1 | OK | none |
| J3 | Bronze Count | distinct/sorting | set, sort desc, 3rd value; or counts[0..75] | 2 | OK | 6 + 7: small N |
| J4 | Troublesome Keys | string case analysis | first mismatch, sets, verify | 4 | OK | 3 + 3 + 5: N ≤ 50 |
| J5 | Harvest Waterloo | flood fill | iterative BFS/DFS on a grid | 5 | OK (iterative) | 1: no hay; +4 rectangles |
| S1 | Hat Circle | indexing | compare h[i] and h[(i + N/2) % N] | 1 | OK-IO | 2 + 1 + 2 special cases |
| S2 | Heavy-Light Composition | counting | Counter plus alternation check | 2 | OK | 5: only a/b hard-code |
| S3 | Swipe | two pointers + constructive | compress(B) is a subsequence of A; left swipes, then reversed right swipes | 7 | OK | 2: N = 2; +4 N ≤ 8 BFS; **⌊M/2⌋ for YES/NO only**, so 7/15 with no construction |
| S4 | Painting Roads | DFS tree | colour by depth parity (true iterative DFS) | 6 | OK (iterative) | 2: path; +3 one cycle |
| S5 | Chocolate Bar Partition | prefix sums + DP + hashmap | mean shift ×N; dict from prefix value to best dp | 9 | OK-PyPy | 2 + 2 + 1: N ≤ 20 brute force |

### 2025

**No official results.** CEMC withheld them over rule violations: "many students submitted code that they did not write themselves" (2025CCCResults.pdf). No shared J/S problem. The contest ran over a two-week window.

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Roller Coaster Ride | arithmetic | N ≤ C·P | 1 | OK | none |
| J2 | Donut Shop | loop | two lines per event | 1 | OK | none |
| J3 | Product Codes | tokenizing | char classes, signed multi-digit numbers | 3 | OK | 2 + 2: single digits |
| J4 | Sunny Days | run processing | left run + 1 + right run around each P; all-S edge case | 4 | OK-IO | 2 + 4 = 6: O(N²) flip each day |
| J5 | Connecting Territories | grid DP | row-by-row rolling DP, cost `(r*C + c) % M + 1` | 6 | **HARD/INF?** (4·10⁸ updates; W2 UNVERIFIED) | 3 + 8 + 2 = 13: R, C ≤ 100 |
| S1 | Positioning Peter's Paintings | O(1) math | min(side-by-side, stacked) perimeter | 1 | OK | 5 + 5: squares |
| S2 | Cryptogram Cracking Club | parsing + modulo | `re.findall(r'([a-z])(\d+)')`, c %= total, scan | 3 | OK | 6: expand the pattern (small) |
| S3 | Pretty Pens | greedy + dynamic ordered sets | max(T, T − min top + max non-top) under updates; heaps with lazy deletion | 8 | OK-PyPy | 5: Q = 0 static greedy; +2 +2 for M = 1, 2 |
| S4 | Floor is Lava | Dijkstra on edge-states | connect sorted adjacent incident edges | 7 | OK-PyPy | 2: tree; +4 c ≤ 10 layered Dijkstra |
| S5 | To-Do List | segment tree (custom monoid), online | ans(AB) = max(ans(A) + t(B), ans(B)) over 2²⁰ leaves | 9 | TIGHT (DMOJ: 19 PyPy3 ACs at 4 s) | 2: Q ≤ 3000; +6 inserts only |

### 2026 (most recent contest: 18–19 February 2026)

There were **2439** official Senior participants and 3421 Junior. **No official 75/75 (top score 69).** No official Senior commentary exists (404 as of 2026-09-21), so S1, S3, S4 and S5 techniques are (comm.).

| # | Title | Topic | Key techniques | Diff | Py | Cheap partial route |
|---|---|---|---|---|---|---|
| J1 | Concert Tickets | arithmetic | `Y remaining` or `N` | 1 | OK | none |
| J2 | Olympic Scores | min/max | sum − max − min, × D | 1 | OK | none |
| J3 | Creative Candy Consumption | two-pointer simulation | indices, not `s[1:]` | 3 | OK-IO | 2 + 4 + 7 = 13 at ≤ 50 |
| J4 | Snail Path | sets/hashing | set of int-encoded cells; **runs on CPython 3.10.12 for this problem** | 4 | OK (memory care) | 4 + 3 + 6 = 13 with M ≤ 1200 |
| J5=S2 | Beams of Light | difference array | +1/−1 at clipped interval ends, prefix sum, O(1) queries | 3 | OK-IO | Sr: 1 + 2 + 3 = 6 at N ≤ 50 |
| S1 | Baby Hop, Giant Hop | number-theory casework | d = \|B−A\|, q, r = divmod(d, K); fewest = min(q + r, q + 1 + K − r); second-fewest distinct via candidate set (comm.) | 4 | OK (big ints free) | 11/15 for T = 1 only; small-range BFS as a checker |
| S3 | Common Card Choice | parity + constructive + randomized | two evens / even + 2 odds / 4 odds, so brute force any 4 cards; hidden subtask: 100 disjoint random (2,2) guesses (comm.) | 7 | OK | 2 + 1 + 1 + 2 + 2 = 8 without the hidden-values trick |
| S4 | Minecarts | Fenwick + binary search + greedy | count smaller elements to the right; records; binary search on answer with a monotonic deque (comm.) | 8 | OK-PyPy (probable) | 2 + 2 + 2: N ≤ 5000; +3 +3 K = 0 / K = 10¹² large |
| S5 | On the Fence | ad hoc geometry/math | UNVERIFIED (no public full solution); likely O(1) casework per test | 10 | math-bound | 1: K = NM closed form; +2 N, M ≤ 6 brute force |

---

## 2. Trend analysis (weighted toward 2019–2026)

### 2.1 Topic frequency (primary topic per problem; W3 classification)

Topic key:
- **Impl** = direct implementation / arithmetic
- **Sim** = simulation
- **Str** = string processing
- **Count** = counting / frequency / parity
- **Hash** = dict/set lookup or hashing
- **Greedy** = sorting + greedy
- **Prefix** = prefix sums / difference arrays / compression
- **Math** = number theory / formula casework
- **Brute** = complete search / backtracking
- **DP**
- **Graph** = BFS/DFS/Dijkstra/MST
- **Tree**
- **DS** = stack/DSU/heap/Fenwick/segment tree/sqrt
- **Constr** = constructive / output-a-witness
- **BinSearch**

In the per-slot columns, shared problems count in both slots. "Unique" counts each problem once.

**All years, 2014–2026 (130 slots, 119 unique problems):**

| Topic | J1 | J2 | J3 | J4 | J5 | S1 | S2 | S3 | S4 | S5 | Unique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Impl | 13 | 8 | 1 | 1 | · | 1 | 1 | · | · | · | 24 |
| Str | · | 4 | 5 | 2 | · | · | 1 | · | · | · | 12 |
| Graph | · | · | · | · | 3 | · | 1 | 1 | 6 | 1 | 11 |
| Math | · | · | 1 | 1 | · | 4 | 1 | · | · | 4 | 11 |
| DP | · | · | · | · | 2 | · | 1 | · | 3 | 4 | 10 |
| Count | · | · | 2 | 2 | 2 | 2 | 2 | 1 | · | · | 8 |
| DS | · | · | · | · | · | 1 | · | 3 | 1 | 3 | 8 |
| Sim | · | 1 | 2 | 4 | · | 2 | · | · | · | · | 7 |
| Prefix | · | · | 1 | 1 | 1 | 1 | 1 | · | 3 | · | 7 |
| Greedy | · | · | · | · | 1 | 2 | 3 | · | · | · | 5 |
| Constr | · | · | · | · | · | · | · | 5 | · | · | 5 |
| Brute | · | · | 1 | · | 3 | · | · | · | · | · | 4 |
| Hash | · | · | · | 2 | 1 | · | 2 | 1 | · | · | 4 |
| Tree | · | · | · | · | · | · | · | 1 | · | 1 | 2 |
| BinSearch | · | · | · | · | · | · | · | 1 | · | · | 1 |

**2019–2026 only (80 slots):**

| Topic | J1 | J2 | J3 | J4 | J5 | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|---|---|---|---|---|
| Impl | 8 | 6 | 1 | · | · | 1 | · | · | · | · |
| Str | · | 1 | 4 | 2 | · | · | 1 | · | · | · |
| Math | · | · | · | · | · | 4 | 1 | · | · | 3 |
| Graph | · | · | · | · | 2 | · | 1 | · | 4 | · |
| Count | · | · | 2 | 2 | 1 | 1 | 2 | · | · | · |
| Constr | · | · | · | · | · | · | · | **5** | · | · |
| DP | · | · | · | · | 1 | · | 1 | · | 1 | 2 |
| DS | · | · | · | · | · | · | · | 1 | 1 | 2 |
| Prefix | · | · | · | 1 | 1 | · | 1 | · | 2 | · |
| Hash | · | · | · | 2 | · | · | 1 | 1 | · | · |
| Brute | · | · | · | · | 3 | · | · | · | · | · |
| Sim | · | 1 | 1 | 1 | · | 1 | · | · | · | · |
| BinSearch / Greedy / Tree | · | · | · | · | · | 1 (Greedy) | · | 1 (BinSearch) | · | 1 (Tree) |

Takeaways:
- **S3 since 2019 is the constructive slot**: 5 of 8 problems (2019, 2022, 2023, 2024, 2026) require outputting a valid construction. The others were hashing (2020), convex search (2021) and a dynamic data structure (2025).
- **S1 since 2021 is a math/casework slot**: 2021 trapezoids, 2022 4a + 5b, 2025 perimeter formula, 2026 div/mod casework. The exception is 2024 S1 (indexing).
- **S4 is the graph slot** (2021, 2023, 2024, 2025). 2026 broke the pattern with Fenwick + binary search.
- **S5 alternates** between heavy data structures (2019, 2021, 2025), DP (2022, 2024) and math/ad hoc (2020, 2023, 2026).
- **J3/J4 are string-processing and counting slots.** J5 has become a "classic first algorithm, clearly signposted" slot: 2024 flood fill, 2025 grid DP, 2026 difference array.
- **Classic S3 algorithms (graphs, trees, DSU) moved out of S3 after 2018.** BFS now appears at J5/S2 (2018 J5, 2020 J5=S2, 2024 J5) and graphs at S4.
- **Shared problems:** 10 of 13 years shared at least one problem (11 shared problems in total); 2015, 2024 and 2025 shared none. W2's "11 of 13 years" counts problems, not years. A shared problem sits at J4 or J5 and S1, S2 or (once, 2017) S3.

### 2.2 How each slot's difficulty has shifted

| Slot | 2014–2018 | 2019–2026 | Direction |
|---|---|---|---|
| J1–J2 | trivial | trivial; J2 averages rose from about 10.7 (2019–21) to 12–13 (2022–26) | stable/easier |
| J3 | mixed (5.7 → 9.3 avg, 2016–2018) | always has subtasks since 2022; 2-mark large-input traps (2024, 2026) | stable, efficiency-aware |
| J4 | 0.4–5.4 | every J4 since 2021 has a final N ≈ 10⁵–10⁶ subtask; averages 2.4–4.8 | harder (efficiency) |
| J5 | 0.25–3.8 | 0.2–3.0; hardest 2019 J5 (DMOJ 20); recent J5s are textbook algorithms | techniques more standard, still hard |
| S1 | 9.7–14.1 | 8.8–13.7, then **2026: 7.69 (lowest S1 in 2016–2026)** | no longer guaranteed trivial |
| S2 | 8.1–13.2 | **4.2–10.7**; 2020 4.16, 2023 4.26 | clearly harder (one real idea needed) |
| S3 | 1.1–6.2 | 1.4–2.5 every year; non-zero avg fell to 3.49 (2024) | persistently brutal |
| S4 | 0.66–3.9 | 0.13–0.72 | very hard; graph modelling |
| S5 | 0.10–0.94 | 0.05–0.46; 2026 non-zero avg 1.12, DMOJ 30 pts | the ceiling is rising |

### 2.3 Official per-problem averages (all contestants, out of 15)

Sources: `<Y>CCCResults.pdf`. There is no booklet for 2014/2015, and none was published for 2025.

| Year | J1 | J2 | J3 | J4 | J5 | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|---|---|---|---|---|
| 2016 | 12.58 | 10.32 | 5.72 | 5.35 | 3.76 | 11.03 | 10.44 | 1.39 | 0.83 | 0.94 |
| 2017 | 12.03 | 10.53 | 1.02 | 0.36 | 0.28 | 14.12 | 13.24 | 6.20 | 3.92 | 0.17 |
| 2018 | 13.04 | 10.73 | 9.33 | 2.74 | 0.25 | 9.70 | 8.09 | 1.11 | 0.66 | 0.10 |
| 2019 | 13.92 | 10.70 | 5.82 | 8.35 | 0.20 | 13.47 | 6.71 | 1.43 | 0.13 | 0.06 |
| 2020 | 14.19 | 10.87 | 7.75 | 5.97 | 1.02 | 8.79 | 4.16 | 1.83 | 0.38 | 0.08 |
| 2021 | 14.02 | 11.15 | 9.53 | 2.37 | 2.97 | 13.38 | 9.50 | 2.47 | 0.72 | 0.46 |
| 2022 | 14.03 | 12.58 | 7.84 | 3.60 | 0.78 | 11.03 | 6.44 | 1.41 | 0.47 | 0.12 |
| 2023 | 13.41 | 12.21 | 8.68 | 4.79 | 0.76 | 11.06 | 4.26 | 1.56 | 0.40 | 0.16 |
| 2024 | 13.60 | 11.72 | 9.30 | 3.25 | 1.90 | 13.73 | 10.68 | 1.65 | 0.46 | 0.26 |
| 2025 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 2026 | 14.49 | 13.33 | 8.31 | 4.19 | 2.36 | **7.69** | 6.01 | 1.39 | 0.41 | **0.05** |

Averages among non-zero scorers (Senior):
- S3: 8.40 / 11.04 / 9.46 / 6.42 / 5.64 / 6.58 / 7.40 / 5.90 / **3.49** / – / 7.31 (2016–2026).
- 2026: S4 7.37, S5 **1.12**.

Shared-problem averages are listed at both levels, and the Junior population scores much lower. Examples:
- 2020 J5 1.02 vs S2 4.16 (Escape Room).
- 2023 J4 4.79 vs S1 11.06 (Trianglane).
- 2026 J5 2.36 vs S2 6.01 (Beams of Light).

### 2.4 2025 and 2026 specifics

- **2025 (Feb 19–20, with a two-week administration window):**
  - Results were withheld over widespread unauthorised help. Press cited AI tools (The Logic, TechSpot, April 2025).
  - The CCC page reports an overall Senior average of 23.71 over 3917 writers.
  - Problems: S1 is O(1) math; S2 is RLE parsing plus modulo; S3 needs updates plus ordered sets (Python heaps with lazy deletion); S4 is Dijkstra on edge states; S5 is an online segment tree. S5 has DMOJ PyPy3 ACs.
  - J5 has a 4·10⁸ DP that is probably out of reach for Python (UNVERIFIED).
- **2026 (Feb 18/19, single date):**
  - New rules: screen recording is strongly recommended, and generative AI and AI inside IDEs are explicitly banned. There is a Senior-only honour roll, and the ranking covers official participants only.
  - Senior participation fell to 2439 (from 3947 in 2024). The cause is not established; see `ccc-format-and-rules.md`.
  - **Top official score 69, with zero perfect scores.** The first time since at least 2016; perfect counts were 3–32 per year in 2016–2024. The Senior average total was 15.56/75.
  - Problems:
    - S1 has the lowest S1 average in the dataset (64-bit ranges plus "second fewest").
    - S2 = J5 is a difference array.
    - S3 is a parity insight with a 7-mark hidden-input randomized subtask.
    - S4 is a Fenwick tree plus binary search.
    - S5 has DMOJ's highest-ever CCC rating (30 points) and no public full solution.
  - J4 was graded on CPython 3.10.12, not PyPy.
  - No official Senior commentary yet.

### 2.5 Realistic score targets by stage (Senior, Python on the PyPy3 Grader)

Reference points (from `ccc-format-and-rules.md` section 7):
- Certificate of Distinction (top 25%) cutoffs: 32 (2024), 34 (2025), 26 (2026).
- Honour-roll Group 1 minimum: 51–64.
- Estimated CCO invitation line: about 50–60 (UNVERIFIED).
- 2026 top score: 69.

| Stage | Skills mastered | Typical Senior score | What it buys |
|---|---|---|---|
| A. Junior fluency | J1–J4, fast I/O, dicts/sets | Jr 45–60/75; Sr 15–25 (S1 plus S2 partials) | a Junior honour-roll-level score |
| B. S1–S2 solid | all of the Junior list, sorting/greedy, prefix sums, BFS basics, math casework | 25–35 (S1 + S2 = 30, a few S3 marks) | Distinction (top 25%) |
| C. S3 partials | brute-force subtasks everywhere, constructive practice | 35–45 (S3 at 5–10, S4 at 2–5) | upper honour roll |
| D. S1–S3 full, S4 partials | all S1–S3 techniques in `w3-senior-s1-s3.md` section 3; Dijkstra/DSU | 50–58 | around the CCO-invitation line (UNVERIFIED) |
| E. S1–S4 full, S5 partials | S4/S5 toolbox (Fenwick, segment tree, tree DP, DP optimisations) | 60–68 | top ~5 officially in 2026 (69 was first) |
| F. Perfect | S5 full, which in some years may be Python-infeasible (19S5, 17S5) or unsolved publicly (26S5) | 75 | a stretch goal: nobody reached it in 2026, and CEMC warns Python may not allow it |

---

## 3. Cross-cutting guidance for the curriculum (short)

1. Teach **fast I/O and O(N) thinking by J4/S1**. Since 2021 almost every J4, S1 and S2 has a 10⁵–10⁶ subtask.
2. Teach **constructive problem-solving** explicitly (small brute force → pattern → casework → verify with a checker). It is the dominant S3 style.
3. Teach **math/casework with integer division, mod, parity and gcd**. It dominates recent S1 and several S3/S5 problems.
4. **Python-specific:** iterative DFS/BFS, no deep recursion, heaps with lazy deletion (there is no ordered set), 3.8-only syntax, and submit as PyPy3 when practising on DMOJ.
5. **Bank subtasks.** Nearly every S3–S5 gives 2–8 marks to brute force. The best submission counts, and there are up to 50 submissions per problem.

For full technique lists see `w3-senior-s1-s3.md` sections 3–4, `w4-senior-s4-s5.md` ("Prerequisite-ordered list" and "Partial-marks strategy") and `w2-junior-problems.md` sections 6–7.
