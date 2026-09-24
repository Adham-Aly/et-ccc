# W4: CCC Senior S4 and S5, 2014–2026: Analysis and Python Feasibility

Worker W4, Phase 1 (Recon). Written 2026-09-21. For other agents. Companion deliverable: `../python-for-ccc.md`.

## How this was researched

- **Statements and subtasks** come from the official CEMC HTML problem sets, one per year, 2014–2026. URLs follow the pattern `https://cemc.uwaterloo.ca/sites/default/files/documents/<Y>/<Y>CCCSr{Problems,ProblemSet}.html`. The exact list is under "Sources".
- **Official solution ideas** come from CEMC Senior commentaries, which exist for **2022, 2023, 2024 and 2025 only**. No 2026 commentary was published as of 2026-09-21: the 2026 commentary URL returns the site's 404 page. For 2014–2021 and 2026, algorithms are taken from public solution repos with explanations (A-stick-bug, Kytabyte, aeternalis1, geekedu), cross-checked against the statement constraints and DMOJ problem tags.
- **Grader facts** (see `python-for-ccc.md` section 1):
  - The CCC Grader's "Python 3" is **PyPy3 7.3.9 (Python 3.8.13)**, and was PyPy in every archived version since 2018.
  - The default limit is **3 s / 512 MB** with **no published Python multiplier** (rules.pdf, 2020–2026).
  - Most statements since 2018 print no time limit. 2017 printed limits (S4 3 s, S5 5 s).
- **DMOJ evidence.** The DMOJ API (`/api/v2/problem/<code>` and `/api/v2/submissions?problem=<code>&language=PYPY3&result=AC`) was queried. After the first few calls, DMOJ's Cloudflare returned 403 for the rest of this session. One data point was retrieved: **ccc25s5 has 19 accepted PyPy3 submissions, and DMOJ's limit for it is 4.0 s / 512 MB**. Retries over about 30 minutes all stayed blocked, so the retry script was stopped. Any DMOJ counts not shown here are **pending/UNVERIFIED**, and verdicts rely on the other evidence listed.
- **Difficulty** is my 1–10 estimate for a Senior contestant (10 = hardest). It is informed by the official problem averages from the CEMC Results booklets. That table is below; "nonzero" is the average among students who scored more than 0.

### Official problem averages (all Senior contestants / nonzero only)

From `https://cemc.uwaterloo.ca/sites/default/files/documents/<Y>/<Y>CCCResults.pdf`:

| Year | S4 avg (all / nonzero) | S5 avg (all / nonzero) | Notes |
|---|---|---|---|
| 2016 | 0.83 / 4.65 | 0.94 / 2.26 | |
| 2017 | 3.92 / 8.25 | 0.17 / 10.83 | |
| 2018 | 0.66 / 7.52 | 0.10 / 5.28 | |
| 2019 | 0.13 / 4.82 | 0.06 / 6.87 | |
| 2020 | 0.38 / 8.30 | 0.08 / 13.00 | |
| 2021 | 0.72 / 7.42 | 0.46 / 7.08 | |
| 2022 | 0.47 / 5.81 | 0.12 / 12.74 | |
| 2023 | 0.40 / 6.05 | 0.16 / 4.56 | |
| 2024 | 0.46 / 6.45 | 0.26 / 2.27 | |
| 2025 | n/a | n/a | **No official results released because of widespread rule violations** (2025 Results PDF) |
| 2026 | 0.41 / 7.37 | **0.05 / 1.12** | 2,439 Senior contestants. **Top official score 69/75; no official 75** |

The key fact for the project: in 2026 **nobody officially achieved 75/75**. S5 2026 had a nonzero average of 1.12/15. A "perfect score" target is therefore extremely ambitious. Full marks on S1–S4 plus S5 partials is a realistic top-tier target, about 60+/75, which would have been top ~15 in 2026.

---

## Per-problem analysis

Feasibility legend:

- **FEASIBLE-CPy**: passes in CPython.
- **FEASIBLE-PyPy**: needs PyPy. This is fine, because the CCC Grader *is* PyPy.
- **VERY HARD**: possible in PyPy only with heavy constant-factor work.
- **LIKELY IMPOSSIBLE**: within 3 s in Python.

Because the official grader runs PyPy, "FEASIBLE-PyPy" is effectively "feasible at the CCC".

### 2026

#### 2026 S4: Minecarts
- **Summary:**
  - There are N carts with a_i gems.
  - A LIFO side track (a stack) lets carts be reordered to non-decreasing order.
  - Up to K spare gems can be placed into the *empty* carts (a_i = 0).
  - Minimise the side-track capacity, which is the maximum stack size needed.
- **Constraints:** N ≤ 3·10^5, K ≤ 10^12, a_i ≤ 10^6. Limit: default 3 s / 512 MB (not stated in the statement).
- **Subtasks (15 marks):**

  | Marks | N | K |
  |---|---|---|
  | 2 | ≤ 5000 | K = 0 |
  | 2 | ≤ 5000 | K = 10^12 |
  | 2 | ≤ 5000 | any K |
  | 3 | ≤ 3·10^5 | K = 0 |
  | 3 | ≤ 3·10^5 | K = 10^12 |
  | 3 | ≤ 3·10^5 | any K |

  - With K = 0 the problem is "stack-sorting capacity". Per A-stick-bug, the answer reduces to max over i of (number of smaller elements to the right). That is O(N^2) for the small subtask, or O(N log N) with a **Fenwick tree** for the large one.
  - K = 10^12 means the zeros can be filled freely.
  - General K needs the full idea.
- **Full solution** (A-stick-bug Python, `2026/CCC '26 S4 - Minecarts.py`; no official commentary yet):
  - Count smaller elements to the right with a **Fenwick tree**.
  - Observe that the maximum occurs at prefix-maximum "records", so only records and zeros matter.
  - **Binary search on the answer.** The check greedily assigns spare gems left to right, using a **monotonic deque** with a global offset.
  - Total O(N log N).
- **Topics:** Greedy, observations about stack sorting, Fenwick tree, binary search on answer, monotonic deque. DMOJ tags: Data Structures, Greedy.
- **Difficulty:** 8/10 (average 0.41 overall, 7.37 nonzero).
- **Python:** **FEASIBLE-PyPy (probable).**
  - O(N log N) with N = 3·10^5 means about 6·10^6 Fenwick steps plus ~19 × O(N) deque checks. That is comfortable in PyPy.
  - A-stick-bug's Python file presents itself as a full solution. It doesn't state an AC, but its style implies one (UNVERIFIED).
  - DMOJ PyPy3 AC count: pending.

#### 2026 S5: On the Fence
- **Summary:**
  - On an N×M grid, choose ≤ K cells forming a 4-connected fence that includes cell (R, C).
  - Maximise the number of cells enclosed. "Inside" means the cell cannot reach an edge cell by 8-directional moves.
  - T test cases.
- **Constraints:** N, M ≤ 10^9, T ≤ 1000. Limit: default 3 s.
- **Subtasks:**

  | Marks | T | N, M | Other |
  |---|---|---|---|
  | 1 | ≤ 1000 | ≤ 10^9 | K = NM (closed-form; A-stick-bug Python gets this 1/15) |
  | 2 | ≤ 10 | ≤ 6 | brute force |
  | 2 | ≤ 10 | ≤ 40 | |
  | 2 | ≤ 10 | ≤ 300 | |
  | 2 | ≤ 10 | ≤ 2000 | |
  | 3 | ≤ 10 | ≤ 10^6 | |
  | 3 | ≤ 1000 | ≤ 10^9 | O(1)/O(log) per test casework |

- **Full solution:** **UNVERIFIED.** No official commentary is out yet, and no public full solution was found. A-stick-bug: "No idea how to solve the full problem." DMOJ tags are "Ad Hoc, Intermediate Math" and the problem is worth **30 points on DMOJ** (the highest of any recent CCC problem).
  - It is likely geometric/number-theoretic casework:
    - the optimal enclosing shape (near-square or diamond-like rectangle) for a perimeter budget K;
    - distance from (R, C) to the fence;
    - use of the grid border to save blocks;
    - optimisation of a quadratic in the side lengths.
  - The subtask ladder (6 → 40 → 300 → 2000 → 10^6 → 10^9) suggests O((NM)^2) brute force, then O(N^2) enumeration of rectangles, then O(N) enumeration of one side, then O(1)/O(log) formulas.
- **Topics:** Ad hoc geometry, math optimisation, casework, brute force for small cases.
- **Difficulty:** 10/10 (average 0.05; nonzero 1.12 — the hardest S5 in the dataset).
- **Python:** The full solution is almost certainly O(1)–O(log) per test, so the language doesn't matter: **FEASIBLE** once solved. The difficulty is purely mathematical.

### 2025

#### 2025 S4: Floor is Lava
- **Summary:**
  - Graph with N rooms and M tunnels; each tunnel has a temperature c.
  - Boots start at level 0. Changing the level by d costs d, and you can only cross a tunnel at exactly its level.
  - Find the minimum cost from room 1 to room N.
- **Constraints:** N, M ≤ 2·10^5, c ≤ 10^9. Limit: default 3 s.
- **Subtasks:**
  - 2 marks: tree (M = N−1); follow the unique path.
  - 4 marks: c ≤ 10; Dijkstra on (node, level) with 11N states.
  - 4 marks: degree ≤ 5; Dijkstra on the *edge graph* with cost |w(e)−w(f)| between adjacent edges.
  - 5 marks: general.
- **Full solution** (official commentary 2025):
  - States are edges.
  - At each node, sort the incident edges by weight and connect only consecutive ones (cost = difference). This gives O(M) auxiliary edges, because intermediate "pit stops" are free.
  - Add a virtual weight-0 edge at node 1.
  - Run **Dijkstra** on the auxiliary graph: O(M log M).
- **Topics:** Graph modelling and state design, **Dijkstra**, sorting, a graph-sparsification trick.
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-PyPy.** About 4·10^5 states and 10^6 edges; Dijkstra with heapq in PyPy runs in about 1–2 s. A-stick-bug has a Python multi-layer Dijkstra (`CCC '25 S4 - Floor is Lava.py`); its score isn't stated. DMOJ count: pending. DMOJ limit: pending.

#### 2025 S5: To-Do List
- **Summary:**
  - Online insert/delete of jobs (release s, duration t).
  - After each update, print the minimum makespan of a single machine with release times and no preemption.
  - The input is encrypted with the previous answer, which forces an online solution.
- **Constraints:** Q ≤ 10^6, s, t ≤ 10^6. **DMOJ: 4.0 s, 512 MB** (verified via the DMOJ API, 2026). CCC: default 3 s (not stated).
- **Subtasks:**
  - 2 marks: Q ≤ 3000; keep a sorted list and simulate, O(Q^2).
  - 6 marks: inserts only; a map of merged "clumps" (ordered map or DSU-like merging), O(Q log Q).
  - 7 marks: general.
- **Full solution** (official commentary 2025):
  - Process jobs in release order.
  - The answer is max over i of (r_i + sum of t over jobs released at or after r_i).
  - Keep a **static segment tree over release times 0..10^6** (size 2^20).
  - Each node's summary is (answer, total t), combined as `ans(AB) = max(ans(A)+t(B), ans(B))`.
  - Alternative view: composition of max-plus "job functions".
  - O(s_max + Q log s_max).
- **Topics:** Greedy/exchange argument, **segment tree with a custom monoid**, function composition, online decoding.
- **Difficulty:** 9/10.
- **Python:** **FEASIBLE-PyPy, verified on DMOJ.** The DMOJ API (2026-09-21) listed **19 accepted PYPY3 submissions** for ccc25s5, dated 2025-05 through 2026-04. Their total CPU times across all tests were 24–79 s, and DMOJ's limit is 4 s per test. The CCC limit is 3 s, so it is tight. CPython count: pending (expected ~0). Techniques: read all input at once, parallel int arrays, bottom-up update loop, join output.

### 2024

#### 2024 S4: Painting Roads
- **Summary:**
  - Colour a minimum number of edges red or blue.
  - For every grey edge (u, v) there must be an alternating red/blue path from u to v.
- **Constraints:** N, M ≤ 2·10^5; the graph may be disconnected. Limit: default 3 s.
- **Subtasks:**
  - 2 marks: Hamiltonian path 1–2–…–N; alternate colours along it.
  - 3 marks: N = M, connected (one cycle).
  - 3 marks: cactus; any spanning forest works, then colour the tree paths.
  - 7 marks: general.
- **Full solution** (official commentary 2024):
  - Take a **DFS tree** of each component. DFS trees in undirected graphs have no cross edges.
  - Colour each tree edge by the parity of its depth.
  - O(N + M).
- **Topics:** Graph traversal, **DFS tree property** (back edges only), spanning forest, constructive output.
- **Difficulty:** 6/10 once you know the DFS-tree fact. The average was low (0.46), so contestants found it hard.
- **Python:** **FEASIBLE-PyPy, and in CPython too if iterative.** The recursion depth can reach 2·10^5. A-stick-bug's recursive version with `setrecursionlimit(300000)` is described as AC ("proof by AC") on DMOJ. On the CCC grader, use an **iterative true DFS** (iterator-index stack); a BFS-like stack is not a DFS tree. DMOJ count: pending.

#### 2024 S5: Chocolate Bar Partition
- **Summary:** Split a 2×N grid into the maximum number of connected parts, all with the same average.
- **Constraints:** N ≤ 2·10^5, T ≤ 10^8. Limit: default 3 s.
- **Subtasks:**

  | Marks | N | T |
  |---|---|---|
  | 2 | N = 2 | T ≤ 5 |
  | 2 | N ≤ 8 | T ≤ 20 |
  | 1 | N ≤ 20 | |
  | 2 | N ≤ 100 | |
  | 2 | N ≤ 1000 | T ≤ 100 |
  | 3 | N ≤ 2000 | T ≤ 10^5 |
  | 3 | N ≤ 2·10^5 | T ≤ 10^8 |

  The middle subtasks reward suboptimal DPs. The commentary notes these use component sum, both-row prefix, or suboptimal transitions as the state.
- **Full solution** (official commentary 2024):
  - Subtract the mean (scale by N to stay integral) so every part must sum to 0.
  - Define dp[k][i] with a "sticking-out" component on row k, with 4 transitions over prefix sums.
  - The O(N^2) version becomes O(N log N) or O(N) expected with **hash maps from prefix-sum value to best dp**.
- **Topics:** **Prefix sums, DP with hashing/maps**, a careful case analysis of 2-row shapes.
- **Difficulty:** 9/10 (nonzero average 2.27).
- **Python:** **FEASIBLE-PyPy (probable).** O(N) dict operations with N = 2·10^5 are cheap. The difficulty is the DP design. A-stick-bug got only 2/15 (brute force). DMOJ count: pending.

### 2023

#### 2023 S4: Minimum Cost Roads
- **Summary:** Choose a minimum-cost subset of roads that preserves all pairwise shortest-path distances.
- **Constraints:** N, M ≤ 2000, lengths 0..10^9, costs ≤ 10^9. Limit: default 3 s.
- **Subtasks:**
  - 3 marks: all l = 0; MST (Kruskal) per component.
  - 6 marks: l ≥ 1, no multi-edges; keep edge e iff it is the *unique* shortest path. Check with N× Dijkstra.
  - 6 marks: general; contract 0-length components via MST, dedupe multi-edges, then apply the previous subtask.
- **Official alternative:** a Kruskal-like pass. Sort edges by (length, cost) and add an edge if it improves the current shortest path between its endpoints (Dijkstra per edge, bounded by l).
- **Topics:** **Dijkstra (all-pairs via N runs), MST/Kruskal + DSU**, a proof-heavy greedy, graph contraction.
- **Complexity:** O(N·M log N) ≈ 2000 × 2000 × 11 ≈ 4.4·10^7 heap operations in the worst case.
- **Difficulty:** 7/10.
- **Python:** **VERY HARD to FEASIBLE-PyPy.**
  - N Dijkstras over 2000 nodes / 2000 edges is about 4·10^6 edge relaxations plus heap operations. That should be fine in PyPy.
  - An O(N^3) Floyd–Warshall (8·10^9) is impossible.
  - Early-terminating Dijkstra per edge (the alternative solution) is cheaper.
  - DMOJ count: pending.

#### 2023 S5: The Filter
- **Summary:** Output all x in [0, N] with x/N in the Cantor set.
- **Constraints:** N ≤ 10^9; the output has at most 10^6 numbers. Limit: default 3 s.
- **Subtasks:**
  - 3 marks: N a power of 3; recursive self-similar construction.
  - 4 marks: N ≤ 10^5; iterate f(r) = 3·min(r, 1−r) with cycle detection, or 49 iterations. The worst case is N = 51169.
  - 8 marks: N ≤ 10^9; use the first 18 filters to prune to < 10^6 candidates (enumerate via base-3 structure), then run the iteration on each, with memoisation. About 130 iterations in the worst case.
- **Complexity:** O(N^{2/3} log N) (commentary 2023).
- **Topics:** **Number theory/self-similarity, base-3 reasoning, modular arithmetic on numerators, cycle detection, pruning/memoisation.**
- **Difficulty:** 9/10 (nonzero average 4.56).
- **Python:** **VERY HARD.**
  - Up to about 10^6 candidates × up to ~130 iterations in the worst case, though typically far fewer, plus memo lookups.
  - Enumerating candidates via the 18-filter pruning (a DFS over base-3 digits) is about 2^18 × ... operations.
  - This is PyPy-borderline. It needs integer-only arithmetic (numerators mod N) and early exits.
  - DMOJ count: pending (UNVERIFIED).

### 2022

#### 2022 S4: Good Triplets
- **Summary:** Count triples of points on a circle (circumference C) whose triangle strictly contains the centre.
- **Constraints:** N ≤ 10^6, C ≤ 10^6. Limit: default 3 s.
- **Subtasks:**
  - 3 marks: N ≤ 200; O(N^3).
  - 3 marks: C ≤ 6000; count by location, O(C^2) with prefix sums.
  - 6 marks: distinct positions.
  - 3 marks: general.
- **Full solution** (official commentary 2022): O(N + C). Use location counts and **prefix sums**, sliding the first point and maintaining the product of pair counts. "Requires strong familiarity with prefix sum arrays"; watch off-by-one at exactly C/2.
- **Topics:** **Combinatorics and counting, prefix sums, circular arrays** (complementary counting also works).
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-PyPy.** O(N + C) ≈ 2·10^6 operations. Read with `sys.stdin.buffer`. It is even plausible in CPython with care. DMOJ count: pending.

#### 2022 S5: Good Influencers
- **Summary:** In a tree, pay C_i to have a "Y" node convert all its neighbours. Find the minimum cost to make everyone "Y".
- **Constraints:** N ≤ 2·10^5, C_i ≤ 1000. Limit: default 3 s.
- **Subtasks:**
  - 5 marks: path, N ≤ 2000; O(N^2) line DP.
  - 7 marks: tree, N ≤ 2000; O(N^2) tree DP.
  - 3 marks: N ≤ 2·10^5; O(N) tree DP.
- **Full solution** (official commentary 2022): **Tree DP** with 3 states per node (influenced by parent / neutral / influences parent). Careful transitions; O(N).
- **Topics:** **Tree DP**, rooted tree traversal.
- **Difficulty:** 8/10 (nonzero average 12.74: those who got going did well).
- **Python:** **FEASIBLE-PyPy.** O(N), but it needs an **iterative post-order**, because the depth reaches 2·10^5 on a path. DMOJ count: pending.

### 2021

#### 2021 S4: Daily Commute
- **Summary:**
  - Directed walkways (1 minute each) and a subway route (permutation).
  - Each day two route positions are swapped; output the fastest trip from 1 to N.
- **Constraints:** N, W, D ≤ 2·10^5. Limit: default 3 s.
- **Subtasks:**
  - 2 marks: ≤ 10.
  - 2 marks: ≤ 200.
  - 3 marks: ≤ 2000; recompute per day with BFS/Dijkstra.
  - 8 marks: full.
- **Full solution** (Kytabyte and A-stick-bug analyses):
  - Getting off the train is never useful except once, so answer = min over i of (i + walk[S_i]).
  - walk[] is a **reverse-graph BFS** from N.
  - Maintain the minimum under swaps with a multiset. In Python, use a **heap with lazy deletion**.
  - O((N + D) log N).
- **Topics:** **BFS on reversed graph**, key observation, **heap with lazy deletion / multiset**.
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-PyPy.** A-stick-bug has a Python full attempt using heapq (score not stated). DMOJ count: pending.

#### 2021 S5: Math Homework
- **Summary:** Build an array where each of M given ranges has a specified GCD Z ≤ 16, or report Impossible.
- **Constraints:** N, M ≤ 1.5·10^5. Limit: default 3 s.
- **Subtasks:**
  - 3 marks: Z ≤ 2, N, M ≤ 2000.
  - 4 marks: Z ≤ 16, N, M ≤ 2000.
  - 8 marks: full.
- **Full solution:**
  - A_i = lcm of all Z covering i. Use **16 difference arrays**, one per value of Z.
  - Then verify every constraint with a **range-GCD structure**: sparse table or segment tree.
  - O((N + M) log N).
- **Topics:** **Difference arrays, lcm/gcd number theory, sparse table / segment tree**.
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-PyPy.** A sparse table over 1.5·10^5 × 18 levels is about 2.7·10^6 gcds. A-stick-bug has a full Python version, but it uses `math.lcm` (3.9+) and **would crash on the CCC grader (3.8)**. Replace it with `a*b//gcd(a,b)`. DMOJ count: pending.

### 2020

#### 2020 S4: Swapping Seats
- **Summary:** A circular string of A/B/C. Find the minimum number of swaps to make each letter contiguous.
- **Constraints:** N ≤ 10^6. Limit: default 3 s.
- **Subtasks:**
  - 4 marks: no C, N ≤ 5000.
  - 4 marks: no C.
  - 4 marks: N ≤ 5000.
  - 3 marks: remainder.
- **Full solution:**
  - Try both orders (ABC and ACB) and every rotation start.
  - Use **prefix counts** over the doubled string to count misplaced letters in each block.
  - Swaps = misplaced − min(cross pairs) using the pairwise-exchange formula.
  - O(N).
- **Topics:** **Prefix sums on a circular/doubled array, greedy counting.**
- **Difficulty:** 6/10.
- **Python:** **FEASIBLE-PyPy (probable).** 6 prefix arrays × 2·10^6 is heavy in CPython. Kytabyte's Python got **8/15**, likely CPython or an inefficient version. A-stick-bug has a Python version. Avoid slicing and use flat int lists. DMOJ count: pending.

#### 2020 S5: Josh's Double Bacon Deluxe
- **Summary:** Find the probability that the last person gets their favourite burger under the random-pick process.
- **Constraints:** N ≤ 10^6, M ≤ 5·10^5. Answer within 1e-6. Limit: default 3 s.
- **Subtasks:**
  - 4 marks: N ≤ 10^5, M ≤ 1000.
  - 5 marks: M ≤ 5000.
  - 6 marks: full.
- **Full solution:**
  - Process from the back.
  - Probability that the coach's random pick "passes" to the last occurrence of each burger type: pr[b] = total/(N−i) at the last occurrence of b.
  - O(N) (Kytabyte C++ and Python).
- **Topics:** **Probability, DP / linearity of expectation, reverse iteration.**
- **Difficulty:** 8/10 (the insight is hard; the code is short).
- **Python:** **FEASIBLE-CPy/PyPy.** **Kytabyte reports Python 15/15** (self-reported; judge not stated). O(N) with dict/list operations.

### 2019

#### 2019 S4: Tourism
- **Summary:** Split N attractions into the minimum number of days (≤ K per day), maximising the sum of the daily maxima.
- **Constraints:** N ≤ 10^6, a_i ≤ 10^9. Limit: default 3 s.
- **Subtasks:**
  - 3 marks: 2K ≥ N (two days).
  - 3 marks: K ≤ 100, N ≤ 10^5; O(NK) DP.
  - 9 marks: full.
- **Full solution:**
  - Every day is constrained, so dp is only needed on block boundaries.
  - O(N) with **prefix/suffix maxima of the previous and next K-blocks**, or O(N log N) with a **segment tree / monotonic deque** for range max of (dp + max) (geekedu editorial).
- **Topics:** **DP with range-max optimisation, sliding window / monotonic queue / segment tree.**
- **Difficulty:** 9/10 (average 0.13).
- **Python:** **VERY HARD.**
  - The O(N) version with N = 10^6 is feasible in PyPy with flat lists and fast I/O.
  - The O(N log N) segment-tree version is risky.
  - A-stick-bug's Python is 5/15 (work in progress). DMOJ count: pending.

#### 2019 S5: Triangle: The Data Structure
- **Summary:** Sum of the maximum over all size-K sub-triangles of a size-N triangle.
- **Constraints:** N ≤ 3000, so about 4.5·10^6 values. Limit: default 3 s.
- **Subtasks:** 4 marks for N ≤ 1000; 11 marks for full.
- **Full solution:**
  - DP doubling. A triangle of size l is covered by 3 overlapping triangles of size about 2l/3, or by a size-K triangle built from smaller ones.
  - O(N^2 log_{1.5} K) (geekedu editorial).
  - Alternatives: a 2D max BIT (A-stick-bug C++), or a monotonic-queue O(N^2) approach.
- **Topics:** **DP on 2D shapes / sparse-table-like doubling**, 2D range max.
- **Difficulty:** 9/10.
- **Python:** **LIKELY IMPOSSIBLE to VERY HARD.**
  - About 4.5·10^6 cells × ~15 doubling rounds × 3 maxes is roughly 2·10^8 operations. That is beyond 3 s even in PyPy.
  - Kytabyte notes even C++ needed a v2 to pass on DMOJ.
  - A-stick-bug has C++ only; no known Python full solution. DMOJ count: pending.
  - Partial (N ≤ 1000, 4 marks): feasible.

### 2018

#### 2018 S4: Balanced Trees
- **Summary:** Count "perfectly balanced trees" of weight N.
- **Constraints:** N ≤ 10^9. Limit: default 3 s.
- **Subtasks:**
  - 5 marks: N ≤ 1000.
  - 2 marks: N ≤ 5·10^4.
  - 2 marks: N ≤ 10^6.
  - 6 marks: full.
- **Full solution:**
  - f(n) = Σ_{k=2..n} f(⌊n/k⌋).
  - Group k by equal ⌊n/k⌋ (O(√n) blocks, the "divisor-block" trick) and **memoise** in a dict.
  - Total about O(n^{3/4}) (Kytabyte and aeternalis1 C++; A-stick-bug Python).
- **Topics:** **Memoised recursion, floor-division blocks (number theory).**
- **Difficulty:** 6/10.
- **Python:** **FEASIBLE-CPy.** About 10^5 distinct states at depth ~log n. Use `lru_cache(maxsize=None)` or a dict, **not `functools.cache`** (3.9). A-stick-bug's file uses `@cache`.

#### 2018 S5: Maximum Strategic Savings
- **Summary:**
  - N planets × M cities. There are P flight types (replicated on every planet) and Q portal types (replicated on every city index).
  - Maximise the savings = total cost − MST cost.
- **Constraints:** N, M, P, Q ≤ 10^5, so the full graph is up to 10^10 edges. Limit: default 3 s.
- **Subtasks:**
  - 2 marks: P, Q ≤ 100, unit costs.
  - 2 marks: P, Q ≤ 200.
  - 5 marks: N, M ≤ 200 (explicit Kruskal).
  - 6 marks: full.
- **Full solution:**
  - Kruskal over the P + Q edge *types* sorted by cost, with **two DSUs** (one over city indices, one over planets).
  - A flight type that joins two city-components adds (current number of planet components) copies; symmetrically for portals.
  - O((P + Q) log(P + Q)) (Kytabyte C++).
- **Topics:** **MST / Kruskal + DSU**, counting on a product graph.
- **Difficulty:** 8/10.
- **Python:** **FEASIBLE-CPy/PyPy.** Only 2·10^5 edges to sort and union. DMOJ count: pending.

### 2017

#### 2017 S4: Minimum Cost Flow
- **Summary:**
  - Given a current spanning tree, an enhancer that reduces one pipe's cost by D, and one swap per day.
  - Find the minimum number of days to reach an optimal plan.
- **Constraints:** N ≤ 10^5, M ≤ 2·10^5. **Stated limit 3 s** (2017 statement).
- **Subtasks:**
  - 3 marks: N ≤ 8, D = 0.
  - 5 marks: N ≤ 1000, M ≤ 5000, D = 0.
  - 3 marks: D = 0.
  - 2 marks: N ≤ 1000 with D.
  - 2 marks: full.
- **Full solution:**
  - **Kruskal** with tie-break preferring original edges (sort by (cost, is_new)). Days = the number of new edges used.
  - For D > 0: the maximum-cost edge in the MST can be enhanced if it is original, or if an original edge with the same cost could replace it with cost ≤ D. It needs care around the last-added edge.
  - O(M log M).
- **Topics:** **MST/Kruskal + DSU, tie-breaking**, exchange arguments.
- **Difficulty:** 7/10 (average 3.92 — accessible partials).
- **Python:** **FEASIBLE-CPy/PyPy.** A-stick-bug has a Python DSU version (score not stated; union-find recursion depth is fine with rank). DMOJ count: pending.

#### 2017 S5: RMT
- **Summary:** Circular subway lines rotate their passengers. Answer range-sum queries over stations.
- **Constraints:** N, Q ≤ 1.5·10^5, A_i ≤ 7000. **Stated limit 5 s** (2017).
- **Subtasks:**
  - 2 marks: N, Q ≤ 1000.
  - 2 marks: lines contiguous.
  - 3 marks: M ≤ 200.
  - 3 marks: each line ≤ 200 stations.
  - 5 marks: full.
- **Full solution:** **Sqrt decomposition.**
  - Big lines (> √N stations) are handled by storing per-line offsets and prefix sums, rotated lazily.
  - Small lines are rotated explicitly with **Fenwick** updates.
  - O(Q √N log N) or O(Q √N).
- **Topics:** **Sqrt decomposition, Fenwick tree, lazy rotation.**
- **Difficulty:** 9/10.
- **Python:** **VERY HARD / LIKELY IMPOSSIBLE.** A-stick-bug's Python is 5/15; aeternalis1 is C++ only; Kytabyte has no solution. DMOJ count: pending. Note that A-stick-bug's `list[int]` annotations would crash on Python 3.8.

### 2016

#### 2016 S4: Combining Riceballs
- **Summary:** Merge adjacent equal balls, or x·y·x triples, to maximise the largest ball.
- **Constraints:** N ≤ 400. Limit: not stated (2016); default assumed.
- **Subtasks:** 1 mark N = 4; 2 marks N ≤ 10; 5 marks N ≤ 50; 7 marks full.
- **Full solution:**
  - **Interval DP**: can[i][j] says whether [i, j] can become one ball.
  - With **two pointers** over the split, the transition is O(N), so the total is O(N^3) ≈ 6.4·10^7/6, about 10^7 (Kytabyte C++).
  - The naive transition is O(N^4).
- **Topics:** **Interval DP, prefix sums, two pointers.**
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-PyPy.** About 10^7 simple operations in PyPy is under 1 s. A-stick-bug has a Python interval DP. DMOJ count: pending.

#### 2016 S5: Circle of Life
- **Summary:** A 1D circular automaton (rule: alive iff exactly one neighbour is alive, i.e. an XOR of the neighbours) after T ≤ 10^15 steps.
- **Constraints:** N ≤ 10^5. Limit: not stated; default assumed.
- **Subtasks:**
  - 1 mark: N, T ≤ 15.
  - 6 marks: N ≤ 15 (cycle detection).
  - 4 marks: N ≤ 4000, T ≤ 10^7.
  - 4 marks: full.
- **Full solution:**
  - Linearity over GF(2): the state after 2^k steps is cell[i−2^k] XOR cell[i+2^k].
  - Decompose T into binary for O(N log T).
- **Topics:** **Binary lifting / doubling, bit manipulation, XOR linearity.**
- **Difficulty:** 7/10.
- **Python:** **FEASIBLE-CPy/PyPy.** 50 × 10^5 = 5·10^6 list operations. A-stick-bug has a short Python solution with a list comprehension. Big T is fine because Python ints are unbounded.

### 2015

#### 2015 S4: Convex Hull
- **Summary:** Shortest time A→B with total hull wear < K.
- **Constraints:** K ≤ 200, N ≤ 2000, M ≤ 10^4. Limit: not stated; default assumed.
- **Subtasks:** 20% K = 1, N ≤ 200; 20% K = 1, N ≤ 2000; the rest full.
- **Full solution:** **Dijkstra on (node, wear) states**: 2000 × 200 = 4·10^5 states and about 4·10^6 edge relaxations.
- **Topics:** **Dijkstra with an extra state dimension.**
- **Difficulty:** 6/10.
- **Python:** **FEASIBLE-PyPy.** A-stick-bug has a Python version (score not stated). Use flat dist arrays `dist[node*K + h]`. DMOJ count: pending.

#### 2015 S5: Greedy For Pies
- **Summary:** Insert M extra pies anywhere, then take non-adjacent pies to maximise sugar.
- **Constraints:** N ≤ 3000, M ≤ 100. Limit: not stated; default assumed.
- **Subtasks:** 20% M = 0 (house robber); 20% M = 1; 20% M ≤ 10; 40% full.
- **Full solution:**
  - Sort the extras.
  - DP over (i, number of extras used from the big end, number used from the small end as fillers, taken-flag): about 3000 × 100 × 100 × 2 = 6·10^7 states in the naive form.
  - The A-stick-bug/aeternalis1 C++ solutions use a 3D DP with about 5 transitions.
- **Topics:** **DP (multi-dimensional), greedy sorting insight.**
- **Difficulty:** 8/10.
- **Python:** **VERY HARD.** A-stick-bug: "10/15, PYTHON IS TOO SLOW, CHECK C++ CODE", "recursion is too slow". A bottom-up rolling array might pass in PyPy (UNVERIFIED). DMOJ count: pending.

### 2014

#### 2014 S4: Tinted Glass Window
- **Summary:** Area where the summed tint of overlapping rectangles is ≥ T.
- **Constraints:** N ≤ 1000, coordinates ≤ 10^9. Limit: not stated; default assumed.
- **Subtasks:**
  - 10%: N, K ≤ 100.
  - 30%: N, K ≤ 1000.
  - 40%: N ≤ 100 with big coordinates.
  - The rest: full.
- **Full solution:**
  - **Coordinate compression + sweep line** (or a 2D difference array on the compressed grid).
  - O(N^2) with 2000 × 2000 = 4·10^6 cells.
- **Topics:** **Coordinate compression, 2D difference arrays / sweep line.**
- **Difficulty:** 6/10.
- **Python:** **FEASIBLE-PyPy.** 4·10^6 cells, about 1.6·10^7 operations. A-stick-bug has a Python sweep. DMOJ count: pending.

#### 2014 S5: Lazy Fox
- **Summary:** Longest sequence of visits with strictly decreasing jump distances.
- **Constraints:** N ≤ 2000. Limit: not stated; default assumed.
- **Subtasks:** 20% N ≤ 50; 40% N ≤ 200; the rest N ≤ 2000.
- **Full solution:**
  - Sort all about 2·10^6 pairs by distance.
  - Run a DP over nodes in increasing distance order, with care for equal distances (stage updates in a buffer).
  - O(N^2 log N).
- **Topics:** **Sorting-based DP over edges, geometry with squared integer distances.**
- **Difficulty:** 8/10.
- **Python:** **VERY HARD.**
  - Sorting 2·10^6 items plus a DP pass in PyPy is borderline under 3 s.
  - Pack each pair as a single int `(d << 22) | (i << 11) | j` to sort ints, not tuples.
  - A-stick-bug: "9/15, check C++ code for full solution" (their Python uses an O(N^3) memo and `functools.cache`, which is 3.9+). DMOJ count: pending.

---

## DMOJ evidence

| Code | DMOJ TL/ML | PyPy3 AC submissions | Python 3 AC | Status |
|---|---|---|---|---|
| ccc25s5 | 4.0 s / 512 MB | **19** (distinct users ≥ 10; 2025-05 to 2026-04) | pending | verified 2026-09-21 via API |
| all others | pending | pending | pending | DMOJ Cloudflare 403 after burst; re-query later |

**To refresh:**
- Limits and points: `curl https://dmoj.ca/api/v2/problem/cccYYsN`.
- Accepted submissions: `curl "https://dmoj.ca/api/v2/submissions?problem=cccYYsN&language=PYPY3&result=AC"` (same for `PY3`).
- Go slowly: one request every 4 or more seconds.

DMOJ points, a crowd-set difficulty proxy (retrieved from `/api/v2/problems` before the block):

| Year | S4 | S5 |
|---|---|---|
| 2014 | 15 | 20 |
| 2015 | 15 | 17 |
| 2016 | 15 | 20 |
| 2017 | 17 | 20 |
| 2018 | 15 | 20 |
| 2019 | 20 | 20 |
| 2020 | 12 | 17 |
| 2021 | 12 | 15 |
| 2022 | 15 | 17 |
| 2023 | 15 | 20 |
| 2024 | 12 | 20 |
| 2025 | 12 | 17 |
| 2026 | 15 | **30** |

---

## Summary table

| Year | # | Title | Core technique(s) for 15/15 | Diff | Python verdict |
|---|---|---|---|---|---|
| 2026 | S4 | Minecarts | Fenwick (count smaller to the right), prefix-max records, binary search on answer, monotonic deque | 8 | FEASIBLE-PyPy (probable) |
| 2026 | S5 | On the Fence | Ad hoc geometry/math casework, O(1) per test (UNVERIFIED) | 10 | Feasible if solved (math-bound) |
| 2025 | S4 | Floor is Lava | Dijkstra on edge-states graph with sorted-adjacent sparsification | 7 | FEASIBLE-PyPy |
| 2025 | S5 | To-Do List | Exchange argument + static segment tree (custom monoid), online | 9 | FEASIBLE-PyPy (DMOJ PyPy3 ACs verified) |
| 2024 | S4 | Painting Roads | DFS tree (no cross edges), depth parity colouring | 6 | FEASIBLE (iterative DFS) |
| 2024 | S5 | Chocolate Bar Partition | Mean shift, prefix sums, DP + hashmap | 9 | FEASIBLE-PyPy (probable) |
| 2023 | S4 | Minimum Cost Roads | N× Dijkstra, unique-shortest-path test, MST/DSU for 0-edges | 7 | FEASIBLE-PyPy / hard |
| 2023 | S5 | The Filter | Cantor set, base 3, f(r) iteration, pruning with 18 filters | 9 | VERY HARD |
| 2022 | S4 | Good Triplets | Counting + prefix sums on circle, O(N + C) | 7 | FEASIBLE-PyPy |
| 2022 | S5 | Good Influencers | Tree DP (3 states) | 8 | FEASIBLE-PyPy (iterative) |
| 2021 | S4 | Daily Commute | Reverse BFS + heap with lazy deletion | 7 | FEASIBLE-PyPy |
| 2021 | S5 | Math Homework | 16 difference arrays, lcm, sparse table / segment tree gcd | 7 | FEASIBLE-PyPy (no math.lcm) |
| 2020 | S4 | Swapping Seats | Prefix counts on doubled circular string | 6 | FEASIBLE-PyPy (probable) |
| 2020 | S5 | Josh's Double Bacon Deluxe | Probability DP from the back | 8 | FEASIBLE (Python 15/15 reported) |
| 2019 | S4 | Tourism | DP + range max (prefix/suffix block max or segment tree/deque) | 9 | VERY HARD |
| 2019 | S5 | Triangle: The Data Structure | 2D DP doubling (triangle sparse table) | 9 | LIKELY IMPOSSIBLE (partial 4/15 fine) |
| 2018 | S4 | Balanced Trees | Memoised recursion + floor-division blocks | 6 | FEASIBLE-CPy |
| 2018 | S5 | Maximum Strategic Savings | Kruskal over edge types with two DSUs | 8 | FEASIBLE |
| 2017 | S4 | Minimum Cost Flow | Kruskal with tie-breaks + enhancer case | 7 | FEASIBLE |
| 2017 | S5 | RMT | Sqrt decomposition + Fenwick | 9 | VERY HARD / LIKELY IMPOSSIBLE |
| 2016 | S4 | Combining Riceballs | Interval DP + two pointers | 7 | FEASIBLE-PyPy |
| 2016 | S5 | Circle of Life | Binary doubling of XOR automaton | 7 | FEASIBLE |
| 2015 | S4 | Convex Hull | Dijkstra on (node, damage) | 6 | FEASIBLE-PyPy |
| 2015 | S5 | Greedy For Pies | Multi-dimensional DP after sorting extras | 8 | VERY HARD |
| 2014 | S4 | Tinted Glass Window | Coordinate compression + sweep / 2D difference | 6 | FEASIBLE-PyPy |
| 2014 | S5 | Lazy Fox | Sort 2·10^6 pairs, DP over edges | 8 | VERY HARD |

**Count, 2014–2026 (26 problems):** about 17 feasible in PyPy (the grader's Python), 7 very hard, 1–2 likely impossible. Everything from 2020 to 2026 except 2023 S5 is feasible in PyPy with good technique. The main risk in recent years is **algorithmic insight, not Python speed**.

---

## Trends 2019–2026

1. **Graphs dominate S4.**
   - 2021: BFS plus a data structure.
   - 2023: Dijkstra/MST.
   - 2024: DFS tree.
   - 2025: Dijkstra with state modelling.
   - 2026 broke the pattern with greedy plus Fenwick plus binary search.
   Expect S4 to need **modelling a graph cleverly and then running a standard algorithm**.
2. **S5 alternates between heavy data structures and math/ad hoc problems.**
   - Data structures: 2019 (2D doubling), 2021 (sparse table/segment tree), 2025 (segment tree with custom merge).
   - DP: 2022 tree DP, 2024 DP with hashing.
   - Math/ad hoc: 2020 probability, 2023 Cantor/number theory, 2026 geometric casework.
3. **Subtasks are finer-grained since 2023–2024.** 2024 S5 has 7 subtasks and 2026 S5 has 7, each worth 1–3 marks. Brute force now reliably earns 2–5 marks on S5, and the subtask ladder signals the intended complexity at each step.
4. **Inputs are larger.** N and Q of 10^6 appear often (2019 S4, 2020 S4/S5, 2022 S4, 2025 S5). Fast I/O is mandatory in Python.
5. **The difficulty ceiling is rising.**
   - 2026 S5: nonzero average 1.12, DMOJ 30 points.
   - 2026 top official score: 69/75.
   - 2025 results were withdrawn over cheating. CEMC said it is "considering possible ways to address this problem for future contests", so format changes are possible (UNVERIFIED which).
6. **Online/encrypted input (2025 S5)** forces genuinely online data structures. Offline tricks don't work.
7. **Constructive output (2024 S4 colour string; 2021 S5 array or "Impossible")** means output-format discipline matters.

---

## Prerequisite-ordered list of advanced techniques for S4–S5

"Depth" is how far the learner must go.

1. **Complexity analysis and constraint reading.** From 10^6 → O(N) or O(N log N); 2000 → O(N^2); 400 → O(N^3); ≤ 20 → exponential. *Depth: mastery. Every subtask decision depends on it.*
2. **Fast Python I/O and PyPy-aware coding** (see python-for-ccc.md). *Mastery.*
3. **Sorting, custom keys, two pointers, greedy with exchange arguments** (2025 S5 proof, 2017 S4 tie-breaks, 2026 S4). *Mastery.*
4. **Prefix sums, difference arrays (1D and 2D), coordinate compression** (2014 S4, 2020 S4, 2021 S5, 2022 S4, 2024 S5). *Mastery.*
5. **Binary search (on arrays and on the answer)** (2026 S4). *Mastery.*
6. **Recursion → memoisation → bottom-up DP**:
   - 1D/2D DP (2015 S5, 2019 S4);
   - interval DP (2016 S4);
   - DP over sorted events (2014 S5);
   - memo with floor-division blocks (2018 S4).
   *Strong.*
7. **Graph representation, BFS, DFS (iterative!), connected components** (2021 S4, 2024 S4). *Mastery.*
8. **DFS tree properties** (back edges only in undirected graphs) (2024 S4). *Working knowledge.*
9. **Dijkstra with heapq; state-space graphs** ((node, extra) states; edges as states; 0-1 BFS) (2015 S4, 2023 S4, 2025 S4). *Mastery.*
10. **DSU (union-find) and Kruskal MST**, including multiple DSUs and counting (2017 S4, 2018 S5, 2023 S4). *Strong.*
11. **Trees: rooting, parent/order arrays, tree DP with multiple states** (2022 S5). *Strong.*
12. **Heaps with lazy deletion as a multiset substitute** (2021 S4; Python has no TreeMap). *Strong.*
13. **Monotonic stack/deque, sliding-window max** (2019 S4, 2026 S4). *Strong.*
14. **Fenwick tree** (point update / prefix query; counting inversions) (2026 S4, 2017 S5). *Strong.*
15. **Segment tree (iterative) with a custom merge/monoid**; lazy propagation as an extension (2025 S5, 2021 S5, 2019 S4). *Strong for the non-lazy version; lazy is working knowledge.* No S4/S5 in 2014–2026 strictly required lazy propagation.
16. **Sparse table / doubling / binary lifting** (range gcd in 2021 S5; 2016 S5 doubling; 2019 S5 triangle doubling). *Working knowledge.* LCA/binary lifting is not required by any 2014–2026 S4/S5, but it is a natural extension, e.g. for CCO.
17. **Number theory:** gcd/lcm, modular arithmetic, base-k representations, cycle detection (2021 S5, 2023 S5, 2018 S4). *Strong.*
18. **Probability and expected value; linearity of expectation** (2020 S5). *Working knowledge.*
19. **Sqrt decomposition** (2017 S5). *Awareness only.* Rare, and Python-hostile.
20. **Ad hoc math/geometry casework and proof by small cases** (2022 S4, 2026 S5): brute-force small inputs, find the pattern, then prove it. *Strong habit.* This is the key S5 skill in 2020, 2023 and 2026.

Not needed in 2014–2026 S4/S5 (so low priority): string hashing, KMP, suffix structures, network flow, convex hull trick, centroid decomposition, bitmask DP. Bitmask DP may appear in brute-force subtasks.

---

## Partial-marks strategy for S4/S5

Grounded in the rules: best score per problem, per-subtask feedback, 50 submissions.

1. **Read every subtask table first.** Recent S5s give 1–5 marks to brute force (2024 S5: 2 + 2 + 1 = 5 marks for N ≤ 20; 2026 S5: 1 + 2 = 3 marks for K = NM and N, M ≤ 6). These are the cheapest marks on the paper after S1–S3.
2. **Submit brute force early, then improve.** Only the maximum score per problem counts, so a slow correct solution never hurts.
3. **Target special-structure subtasks:**
   - trees or paths (2024 S4 subtask 1–2, 2022 S5 subtask 1, 2025 S4 subtask 1);
   - small values (2025 S4 c ≤ 10);
   - no deletions (2025 S5 subtask 2: 6 marks with a simpler idea);
   - K = 0 or maximum K (2026 S4: 2 + 2 + 3 + 3 = 10 marks from the special K cases).
4. **Time budget** (3 h total): S1–S3 in about 75–90 minutes, then S4 partials plus full, then S5 subtasks. Only then attempt the S5 full solution.
5. **In Python specifically:** if the full algorithm is known but TLEs on the last subtask, apply the constant-factor checklist (python-for-ccc.md section 4). If it still fails, leave it. The last subtask of S5 is often 3 marks (2024, 2026).
6. **A stress-test habit:** write the brute force first, then use it to check the fast solution on random small cases locally before submitting. This is allowed, since only prewritten code is banned, not code written during the contest.
7. **Realistic top-Python target:** S1–S4 full (60) plus 3–8 on S5 gives 63–68/75. That would have ranked roughly top 5 officially in 2026 (69 was first).

---

## Sources

- CEMC CCC page (2026): https://cemc.uwaterloo.ca/contests/ccc
- Problem sets:
  - https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCSrProblems.html
  - …/2025/2025CCCSrProblems.html
  - …/2024/2024CCCSrProblems.html
  - …/2023/2023CCCSrProblemSet.html
  - …/2022/2022CCCSrProblemSet.html
  - …/2021/2021CCCSrProblemSet.html
  - …/2020/2020CCCSrProblemSet.html
  - …/2019/2019CCCSrProblemSet.html
  - …/2018/2018CCCSrProblemSet.html
  - …/2017/2017CCCSrProblemSet.html
  - …/2016/2016CCCSrProblems.html
  - …/2015/2015CCCSrProblems.html
  - …/2014/2014CCCSrProblems.html
- Commentaries:
  - …/2025/2025CCCSrCommentary.html
  - …/2024/2024CCCSrCommentary.html
  - …/2024/2023CCCSrCommentary.html
  - …/2024/2022CCCSrCommentary.html
- Results: …/<Y>/<Y>CCCResults.pdf for 2016–2026 (2025: results withheld)
- Grader: https://cccgrader.com/rules.pdf, https://cccgrader.com/sample_soln.pdf (plus Wayback history)
- DMOJ API: https://dmoj.ca/api/v2/problems, https://dmoj.ca/api/v2/problem/ccc25s5, https://dmoj.ca/api/v2/submissions?problem=ccc25s5&language=PYPY3&result=AC
- Solution repos:
  - https://github.com/A-stick-bug/CCC-Solutions (Python, with scores and notes)
  - https://github.com/Kytabyte/CCC (C++/Python, grade table)
  - https://github.com/aeternalis1/Contest-problems (CCC folder; language choice signals Python difficulty)
- Editorial: https://www.geekedu.org/blogs/canadian-coding-competition-ccc-problem-solution-senior-2019
