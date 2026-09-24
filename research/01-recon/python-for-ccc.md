# Python for the CCC: Environment, Speed, Toolbox and Pitfalls

Worker W4, Phase 1 (Recon). Written 2026-09-21. Audience: the agents that will build the curriculum and the app.

Every fact has a source and the year it applies to. **UNVERIFIED** marks anything not confirmed from a primary source. The problem-by-problem feasibility data behind section 9 is in `_working/w4-senior-s4-s5.md`.

---

## 0. TL;DR for curriculum designers

1. **"Python 3" on the official CCC Grader is PyPy3, not CPython.** It is **PyPy3 7.3.9, running Python 3.8.13**. This is the current sample-solutions sheet on cccgrader.com. That PDF was created 2024-04-12, and the Wayback Machine shows the same file through 2026-08-15. Earlier versions were also PyPy: PyPy3 5.10.1 in 2018–2019 and PyPy3 7.3.1 (Python 3.6.9) in 2022–2023. Sources: https://cccgrader.com/sample_soln.pdf and Wayback snapshots of it (20190405, 20220309, 20230530, 20240614 through 20260815).
2. **The language level is Python 3.8.** Anything newer fails on the grader even if it works at home: `math.lcm`, `functools.cache`, `list[int]` annotations evaluated at runtime, `dict | dict`, `str.removeprefix` (3.9); `bisect(..., key=)`, `int.bit_count()`, `match`/`case`, `itertools.pairwise`, `zip(strict=)` (3.10+). Students must practise with PyPy 3.8 syntax. Section 5 has the table.
3. **Limits: 3 seconds and 512 MB by default, "unless stated otherwise".** No Python multiplier is published. Source: https://cccgrader.com/rules.pdf (PDF dated 2026-02-17; the same wording is in the Wayback copies from 2020-03, 2023-03 and 2025-03). Most statements from 2018 on print no limit, so the 3 s default applies. The 2017 statements printed per-problem limits (S4 3 s, S5 5 s).
4. **CEMC warns that Python may not reach full marks.** The CCC page says that while the grader supports several languages, *"it may not always be possible to achieve a perfect score with a particular language choice (for example, Python or Java)."* Source: https://cemc.uwaterloo.ca/contests/ccc (2026). Plan for a small number of S5 (sometimes S4) problems where a correct O(N log N) Python solution still times out on the last subtask.
5. **No starter code is allowed during the contest.** Rules (2026): *"Access to other source or starter code is not allowed during the competition."* Only the official docs at docs.python.org are allowed, so every template here (fast I/O, DSU, Fenwick, segment tree, Dijkstra, iterative DFS) must be **memorised and typed from scratch**. The app should drill typing them.
6. **Scoring: best submission per problem, up to 50 submissions per problem, one per minute.** Feedback is shown per test case up to the first failure in each subtask. So a slow-but-correct Python submission for the small subtasks is free insurance. Source: rules.pdf (2026).

---

## 1. The contest's Python environment (verified)

| Item | Value | Year / source |
|---|---|---|
| Languages allowed at CCC | C, C++, Python 2, Python 3, Java | 2026, https://cemc.uwaterloo.ca/contests/ccc |
| "Python 3" implementation | **PyPy3 7.3.9 (Python 3.8.13)** | sample_soln.pdf created 2024-04-12, still served 2026-08 (Wayback) |
| "Python 2" implementation | PyPy 7.3.9 (Python 2.7.18) | same |
| Earlier Python 3 | PyPy3 7.3.1 (Python 3.6.9) | Wayback 2022-03 and 2023-05 |
| Earlier Python 3 | PyPy3 5.10.1 | Wayback 2018-02 and 2019-04 |
| C++ for comparison | GCC 11.4.0, `-O2 -std=c++17 -static` | sample_soln.pdf (2024–2026) |
| Default time limit | 3 s per test | rules.pdf 2020, 2023, 2025, 2026 |
| Default memory limit | 512 MB | same |
| Python time multiplier | **None published** (UNVERIFIED whether any exists internally) | rules.pdf is silent |
| Submissions | ≤ 50 per problem, ≥ 1 min apart; best score counts | rules.pdf 2026 |
| I/O | stdin/stdout only; no files; output must match exactly; no prompts | rules.pdf 2026 |
| Allowed references | docs.python.org/3/reference (and /2/), plus C/C++/Java docs | rules.pdf 2026 (it lists `/reference/index.html`; UNVERIFIED whether the Library Reference pages are covered, though they are "official language documentation") |
| Forbidden | Web search, AI tools (including in-IDE AI), forums, prewritten code | rules.pdf 2026 |
| Contest | 5 problems × 15 marks = 75, 3 hours | cemc.uwaterloo.ca/contests/ccc (2026) |
| CCO (next stage) | **C++ only** | cemc.uwaterloo.ca/contests/ccc (2026) |

What this means:

- **PyPy is a JIT compiler.** Tight loops over ints and lists are often 5–50× faster than CPython. But:
  - Recursion is slow and the stack is small (see section 3).
  - String `+=` in a loop is quadratic (pypy.org, 2023).
  - Startup and JIT warm-up cost a few tenths of a second.
  - Some C-accelerated CPython idioms are not faster on PyPy. `numpy` is absent (UNVERIFIED, but assume no third-party packages).
- **DMOJ is the standard practice judge** and has `PY3` (CPython) and `PYPY3`. When practising on DMOJ, **submit as PyPy3** to match the CCC grader. DMOJ's PyPy3 is newer than 3.8 (exact version UNVERIFIED; check https://dmoj.ca/runtimes/). **A solution that uses 3.9+ features can pass on DMOJ and then fail on the real CCC grader.**
- DMOJ time limits for CCC problems are set by DMOJ, not CEMC, and often differ from 3 s (for example `ccc25s5` has 4.0 s and 512 MB on DMOJ, per the DMOJ API in 2026). Treat a DMOJ AC as strong but not conclusive evidence of passing on the CCC grader.
- **2025 results were withheld.** CEMC released no official 2025 results because of widespread rule violations (unauthorised external help). Source: https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCResults.pdf. This is a reminder to the app about academic integrity.

---

## 2. Fast input/output

On PyPy, `input()` is slow for 10^5–10^6 lines. Several recent S4/S5 problems have up to 10^6 numbers:

- 2025 S5: Q ≤ 10^6 lines
- 2022 S4: N ≤ 10^6
- 2020 S4/S5: N ≤ 10^6
- 2019 S4: N ≤ 10^6
- 2019 S5: up to ~4.5 million numbers (N = 3000 triangle)

### 2.1 Read everything at once (fastest, preferred)

```python
import sys
data = sys.stdin.buffer.read().split()   # list of bytes tokens
# int(b'123') works directly on bytes
n = int(data[0]); k = int(data[1])
a = list(map(int, data[2:2 + n]))
```

Use a moving index for mixed formats:

```python
import sys
def main():
    data = sys.stdin.buffer.read().split()
    pos = 0
    n = int(data[pos]); pos += 1
    edges = []
    for _ in range(n - 1):
        u = int(data[pos]); v = int(data[pos + 1]); pos += 2
        edges.append((u, v))
main()
```

String tokens (for example `A`/`D` in 2025 S5) come back as bytes, so compare with `b'A'`. Or decode once: `sys.stdin.buffer.read().decode().split()`.

### 2.2 Line by line (when the input is interactive-style or line structure matters)

```python
import sys
input = sys.stdin.readline          # keeps the trailing '\n'!
n = int(input())                    # int() tolerates '\n'
s = input().strip()                 # ALWAYS strip strings
a, b = map(int, input().split())
```

Pitfall: after `input = sys.stdin.readline`, a string read keeps its `'\n'`. `len(s)` is then off by one and `s == "YES"` is False. Always call `.strip()` or `.rstrip('\n')`.

### 2.3 Output: build once, write once

```python
import sys
out = []
for q in range(Q):
    ...
    out.append(str(ans))
sys.stdout.write("\n".join(out) + "\n")
```

- Never call `print()` 10^6 times. It is roughly 10× slower.
- Never build output with `s += ...`, which is quadratic on PyPy (section 4).
- For a space-separated array: `print(" ".join(map(str, arr)))`.
- For an answer string such as 2024 S4's `RGGRGRB`: build a list of characters and `"".join(...)`.
- Floats (2020 S5 needs absolute error < 1e-6): `print("%.9f" % p)` or `print(f"{p:.9f}")`.

### 2.4 Online-decoded input (2025 S5 pattern)

2025 S5 encrypted each query with the previous answer (`s = (s' + ans) mod (10^6+3)`). You can still read all input at once, because only the *values* depend on the previous answer, not *how many tokens* there are. Decode inside the loop.

---

## 3. Recursion: limits, iterative DFS, and what works on the grader

### 3.1 Facts

- CPython's default recursion limit is 1000.
- On PyPy, `sys.setrecursionlimit(n)` "sets the limit only approximately, by setting the usable stack space to n * 768 bytes". With default settings about 1400 recursive calls fit in the standard stack. Source: https://doc.pypy.org/en/latest/cpython_differences.html.
- Trees and paths in S4/S5 regularly have depth up to 2·10^5 (for example 2022 S5 N ≤ 2·10^5 and 2024 S4 N ≤ 2·10^5).
- **Deep recursion is also slow on PyPy.** Practitioner advice, not a primary source: A-stick-bug's 2015 S5 file says "10/15, recursion is too slow (at least for python)".

### 3.2 `sys.setrecursionlimit` plus `threading.stack_size`: do not rely on it

```python
import sys, threading
sys.setrecursionlimit(1 << 25)
threading.stack_size(1 << 27)      # 128 MB
def main():
    ...
threading.Thread(target=main).start()
```

This trick is well known (SOI wiki: https://soi.ch/wiki/python-recursion/). Whether it works on the CCC grader under PyPy3 7.3.9 is **UNVERIFIED**. Nobody has published a test, and PyPy's stack handling differs from CPython's. It also costs memory against the 512 MB limit. A-stick-bug's 2024 S4 file uses recursive DFS with `sys.setrecursionlimit(300000)` and reports AC on DMOJ, but that is DMOJ, not the CCC grader.

**Recommendation for the curriculum: teach iterative traversal as the default for any graph or tree with more than about 1000 nodes.** Keep recursion for small inputs such as brute-force subtasks and memoised recursion on small state spaces.

### 3.3 Iterative DFS templates

**Preorder/postorder on a tree, for tree DP (2022 S5 style):**

```python
def tree_order(n, adj, root=1):
    parent = [0] * (n + 1)
    order = []                     # preorder
    parent[root] = -1
    stack = [root]
    while stack:
        u = stack.pop()
        order.append(u)
        for v in adj[u]:
            if v != parent[u]:
                parent[v] = u
                stack.append(v)
    return parent, order

parent, order = tree_order(n, adj)
dp = [0] * (n + 1)
for u in reversed(order):          # children are processed before parents
    # combine dp of children of u (children = neighbours except parent[u])
    ...
```

**A true DFS tree (2024 S4 needs a DFS tree with no cross edges).**

Pushing all neighbours onto a stack at once, as above, does **not** give a real DFS tree. The node is marked visited at the wrong time, so cross edges can appear. Use an explicit iterator index per node:

```python
def dfs_tree(n, adj, root, visited, depth, par_edge):
    visited[root] = True
    depth[root] = 0
    stack = [root]
    it = [0] * (n + 1)             # next neighbour index for each node (can be allocated once globally)
    while stack:
        u = stack[-1]
        if it[u] < len(adj[u]):
            v, e = adj[u][it[u]]
            it[u] += 1
            if not visited[v]:
                visited[v] = True
                depth[v] = depth[u] + 1
                par_edge[v] = e     # tree edge; colour by depth parity
                stack.append(v)
        else:
            stack.pop()             # post-order point: u is finished
```

**Recursion to generator ("bootstrap").** This lets recursive code keep its shape. It comes from PyRival (https://github.com/cheran-senthil/PyRival, `pyrival/misc/bootstrap.py`). It must be typed from memory during the CCC.

```python
from types import GeneratorType
def bootstrap(f, stack=[]):
    def wrapped(*args):
        if stack:
            return f(*args)
        to = f(*args)
        while True:
            if type(to) is GeneratorType:
                stack.append(to); to = next(to)
            else:
                stack.pop()
                if not stack: break
                to = stack[-1].send(to)
        return to
    return wrapped

@bootstrap
def dfs(u, p):
    for v in adj[u]:
        if v != p:
            yield dfs(v, u)       # "yield" before every recursive call
    yield None                    # "yield" instead of return
```

It is slower than a hand-written iterative loop, but much faster to write correctly under time pressure.

### 3.4 Memoised recursion to bottom-up DP

`@lru_cache(maxsize=None)` is fine for a few 10^5 states with shallow depth, for example 2018 S4, where the recursion depth is about log N.

`functools.cache` does **not exist in Python 3.8 (added in 3.9)**. On the grader use `@lru_cache(maxsize=None)`; bare `@lru_cache` without parentheses is allowed since 3.8. Source: https://docs.python.org/3/library/functools.html.

For big DP tables (interval DP in 2016 S4 with N = 400, 2014 S5 with N = 2000 and about 2·10^6 pairs), write bottom-up loops over lists. Avoid dict or lru_cache there.

---

## 4. Performance pitfalls and fixes (PyPy-focused)

| Pitfall | Why it hurts | Fix |
|---|---|---|
| Code at module top level | Globals need a dict lookup; locals are fast (CPython). PyPy's JIT also optimises function bodies better | Put everything in `def main(): ...` and call `main()` |
| `s += piece` in a loop | Quadratic on PyPy (pypy.org 2023: "Repeated string concatenation is quadratic in PyPy"; doc.pypy.org cpython_differences) | `parts.append(piece)`, then `"".join(parts)` |
| Many tiny function calls in the hot loop | Call overhead, even on PyPy | Inline small helpers (for example Fenwick loops) in the hottest loop |
| `grid = [[0]*m]*n` | **Aliasing bug**: all rows are the same list | `grid = [[0]*m for _ in range(n)]` |
| 2D list `g[i][j]` in the innermost loop | Two indexings per access | Hoist `row = g[i]`, or flatten: `g[i*m + j]` in a 1D list |
| Tuples as dict keys, e.g. `d[(i, j)]` | Tuple allocation and hashing each time | Encode as `i*M + j` (an int); PyPy dicts with all-int keys are faster (PyPy "strategies") |
| Mixed-type lists | PyPy specialises lists of all-int / all-float | Keep a list homogeneous; don't mix `None` with ints (use -1 or a large sentinel) |
| `copy.deepcopy` / slicing copies in a loop | O(n) each time | Mutate in place and undo, or copy once |
| `list.pop(0)`, `list.insert(0, x)` | O(n) | `collections.deque` (`popleft`, `appendleft`) |
| `x in some_list` | O(n) | Use a `set` / `dict`, or a boolean array `seen = [False]*(n+1)` |
| `sorted()` inside a loop | O(n log n) each time | Sort once; use `heapq` / `bisect` for dynamic order |
| `max(list)` / `sum(list[a:b])` in a loop | O(n) plus a slice copy | Prefix sums, sparse table, Fenwick or segment tree |
| Recursive segment tree | Call overhead | Iterative bottom-up segment tree (section 6.5) |
| Floats for exact comparisons | Rounding (e.g. 2014 S5 distances, 2024 S5 averages) | Compare squared distances as ints; scale by N instead of dividing (2024 S5: subtract the mean as `N*T - total`) |
| `math.sqrt` for integers ≥ 2^52 | Float rounding | `math.isqrt` (3.8+) |
| Heavy `lambda` keys on 10^6 items | Call per element | `key=itemgetter(0)`, or sort a list of tuples (lexicographic) |
| Exceptions for control flow in hot loops | Slow | Explicit checks |
| `print(*arr)` for 10^6 numbers | Slow | `" ".join(map(str, arr))` |

### 4.1 Precomputation and constant-factor habits

- Allocate arrays once: `dist = [INF] * (n + 1)`. Avoid creating lists inside loops.
- Pull attribute lookups out of the loop: `app = out.append`, `hp = heapq.heappush`.
- Loop over `range` with index, or `for x in arr` directly. On PyPy both are fine; `enumerate` is fine too.
- Use integer sentinels: `INF = 1 << 60` or `float('inf')`. Ints keep lists homogeneous, which PyPy likes.
- On PyPy, `array('i')` from the `array` module is rarely faster than a plain homogeneous list. Use it only for memory savings (for example 3·10^6 ints). An all-int list on PyPy already stores unboxed ints (UNVERIFIED for PyPy 7.3.9 specifically; general PyPy list-strategy behaviour).
- Memory: at 512 MB, a list of 10^7 Python ints is fine on PyPy (about 8 bytes each with the int strategy). On CPython it would be about 36 bytes each.

---

## 5. Python 3.8 feature boundary (what works on the CCC grader)

| Feature | Min version | OK on CCC grader (3.8)? | Source |
|---|---|---|---|
| `pow(a, -1, m)` modular inverse | 3.8 | **Yes** | docs.python.org/3/library/functions.html#pow |
| `math.comb`, `math.perm`, `math.isqrt`, `math.prod`, `math.dist` | 3.8 | **Yes** | docs.python.org/3/library/math.html |
| Walrus `:=` | 3.8 | Yes | PEP 572 |
| `@lru_cache` without parentheses | 3.8 | Yes | functools docs |
| f-strings | 3.6 | Yes | |
| `math.gcd(a, b)` (two args) | 3.5 | Yes | |
| `math.gcd(a, b, c, ...)` (many args) | 3.9 | **No**: use `functools.reduce(gcd, xs)` | whatsnew 3.9 |
| `math.lcm` | 3.9 | **No**: `a // gcd(a, b) * b` | whatsnew 3.9 |
| `functools.cache` | 3.9 | **No**: `lru_cache(maxsize=None)` | functools docs |
| `list[int]`, `dict[str,int]` annotations evaluated at runtime (e.g. in `def f(x: list[int])`) | 3.9 | **No**: raises TypeError at definition time. Drop the annotation, or use `from __future__ import annotations` | whatsnew 3.9 (PEP 585) |
| `d1 \| d2` dict merge | 3.9 | No | whatsnew 3.9 |
| `str.removeprefix/removesuffix` | 3.9 | No | whatsnew 3.9 |
| `bisect_left(a, x, key=...)` | 3.10 | **No** | docs.python.org/3/library/bisect.html |
| `int.bit_count()` | 3.10 | **No**: `bin(x).count('1')` | stdtypes docs |
| `itertools.pairwise`, `zip(strict=True)`, `match` statement | 3.10 | No | |
| `math.cbrt`, `math.exp2`, `itertools.batched` | 3.11/3.12 | No | |
| int→str 4300-digit limit (`sys.set_int_max_str_digits`) | CPython 3.11 plus backports from Sept 2022 | Probably **not present** on PyPy 7.3.9, which predates it (UNVERIFIED). Big-int printing should just work | |

Real example of this trap: public GitHub repos of Python CCC solutions that report DMOJ AC use `functools.cache` (A-stick-bug 2014 S5, 2018 S4), `math.lcm` (A-stick-bug 2021 S5) and `list[int]` annotations (A-stick-bug 2017 S5). **All three would crash on the official 3.8 grader.** Source: https://github.com/A-stick-bug/CCC-Solutions (read 2026-09-21).

---

## 6. Standard-library toolbox (when to use what)

### 6.1 `heapq`: Dijkstra, "k smallest", event simulation, greedy scheduling

```python
import heapq
def dijkstra(n, adj, src):          # adj[u] = list of (v, w)
    INF = 1 << 62
    dist = [INF] * (n + 1)
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue                # lazy deletion; essential
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist
```

- It is a min-heap. For a max-heap push `-x`.
- A faster variant avoids tuples by encoding `d * N + u` as one int. This works when d·N fits comfortably; Python has no overflow anyway.
- To delete from a heap, use lazy deletion with a "removed" counter or dict.
- CCC uses: 2015 S4 (Dijkstra over (node, damage) states), 2021 S4 (preprocessing), 2023 S4 (Dijkstra), 2025 S4 (Dijkstra on an auxiliary graph).

### 6.2 `collections.deque`: BFS, 0-1 BFS, sliding-window monotonic queue

```python
from collections import deque
def bfs(n, adj, src):
    dist = [-1] * (n + 1)
    dist[src] = 0
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist
```

**0-1 BFS** (edge weights 0/1): `appendleft` for weight 0, `append` for weight 1.

**Sliding-window maximum (monotonic deque)**, used in 2019 S4-style DP and 2026 S4:

```python
def window_max(a, k):
    dq, res = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x: dq.pop()
        dq.append(i)
        if dq[0] <= i - k: dq.popleft()
        if i >= k - 1: res.append(a[dq[0]])
    return res
```

### 6.3 `collections.Counter`, `defaultdict`

- `Counter(arr)` gives frequencies. `defaultdict(list)` gives adjacency lists for sparse ids. `defaultdict(int)` counts.
- In hot loops on PyPy, a plain list indexed by int beats any dict. Coordinate-compress first when the ids are huge.
- 2024 S5 full solution: DP with maps from prefix-sum value to best dp (commentary 2024). A plain `dict` with `.get(key, -INF)` is enough.

### 6.4 `bisect`: sorted lists, binary search, coordinate compression

```python
from bisect import bisect_left, bisect_right
xs = sorted(set(values))
comp = {v: i for i, v in enumerate(xs)}          # value -> rank
cnt_le = bisect_right(sorted_arr, x)             # how many <= x
```

- `insort` is O(n) per insert. It is fine up to about 10^5 total in PyPy, since memmove is fast (UNVERIFIED as a hard bound). Beyond that, use a Fenwick tree over compressed values.
- There is **no `key=` in 3.8**. Bisect on a parallel list of keys instead.

**Binary search on the answer** (2026 S4 uses it):

```python
lo, hi = 0, N                 # answer in [lo, hi]
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid): hi = mid
    else: lo = mid + 1
```

### 6.5 Data structures to type from memory (no library exists)

**Disjoint Set Union** (Kruskal: 2017 S4, 2018 S5, 2023 S4). It is iterative, with path halving, so there is no recursion:

```python
parent = list(range(n + 1))
size = [1] * (n + 1)
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    a, b = find(a), find(b)
    if a == b: return False
    if size[a] < size[b]: a, b = b, a
    parent[b] = a; size[a] += size[b]
    return True
```

**Kruskal:**

```python
edges.sort(key=lambda e: e[2])      # or sort tuples (w, u, v) directly (faster)
total = 0
for w, u, v in edges:
    if union(u, v): total += w
```

**Fenwick tree / BIT** (point update, prefix sum; inversions in 2026 S4; 2017 S5 partials):

```python
bit = [0] * (n + 1)
def add(i, d):                  # 1-indexed
    while i <= n:
        bit[i] += d
        i += i & -i
def pref(i):                    # sum of [1..i]
    s = 0
    while i > 0:
        s += bit[i]
        i -= i & -i
    return s
```

**Iterative segment tree** (bottom-up, size a power of two). This is the 2025 S5 full solution pattern: the commentary uses a static tree of size 2^21 over release times, with a two-number summary per node.

```python
SIZE = 1 << 20
ans = [0] * (2 * SIZE)          # parallel arrays instead of tuples (faster on PyPy)
tot = [0] * (2 * SIZE)
def update(pos, a_val, t_val):
    i = pos + SIZE
    ans[i] = a_val; tot[i] = t_val
    i >>= 1
    while i:
        l, r = 2 * i, 2 * i + 1
        tot[i] = tot[l] + tot[r]
        x = ans[l] + tot[r]            # combine(A,B) = max(ans(A)+t(B), ans(B))
        ans[i] = x if x > ans[r] else ans[r]
        i >>= 1
# answer = ans[1]
```

Range query (generic, for an associative `op`):

```python
def query(l, r):                # [l, r)
    resl = resr = IDENTITY
    l += SIZE; r += SIZE
    while l < r:
        if l & 1: resl = op(resl, seg[l]); l += 1
        if r & 1: r -= 1; resr = op(seg[r], resr)
        l >>= 1; r >>= 1
    return op(resl, resr)
```

Performance note: 2025 S5 has Q = 10^6 updates × 20 levels, about 2·10^7 simple operations. That is borderline even in PyPy under 3 s. DMOJ (4 s limit) shows PyPy3 AC submissions for `ccc25s5` from several users (19 AC submissions as of 2026-09; DMOJ API). Inline the combine and use parallel int lists rather than tuple nodes.

**Sparse table** (O(1) range min/max/gcd on a static array; 2021 S5 verification):

```python
from math import gcd
def build_sparse(a, op):
    t = [a[:]]
    j = 1
    while (1 << j) <= len(a):
        prev = t[-1]; half = 1 << (j - 1)
        t.append([op(prev[i], prev[i + half]) for i in range(len(a) - (1 << j) + 1)])
        j += 1
    return t
def query(t, l, r, op):             # inclusive [l, r]
    j = (r - l + 1).bit_length() - 1
    return op(t[j][l], t[j][r - (1 << j) + 1])
```

**Prefix sums, difference arrays and 2D prefix sums.** These appear everywhere: 2020 S4, 2022 S4, 2021 S5, 2024 S5. `itertools.accumulate(a, initial=0)` gives a prefix array; the `initial` argument is 3.8+, so it is OK on the grader.

### 6.6 `itertools`

- `accumulate` (prefix sums/max: `accumulate(a, max)`).
- `permutations`, `combinations`, `product` for brute-force subtasks (small N).
- `groupby` for run-length grouping.
- `pairwise` is **not** in 3.8.

### 6.7 `math`

`gcd`, `isqrt`, `comb`, `factorial`, `inf`, `log2`, `ceil`/`floor`.

For integer ceiling division use `-(-a // b)`, never `math.ceil(a / b)`: floats are wrong for large a.

### 6.8 `sys`

`sys.stdin`, `sys.stdout.write`, `sys.setrecursionlimit`, `sys.exit()` (early exit after printing an answer; used for "Impossible" outputs such as 2021 S5).

### 6.9 `operator`

`itemgetter(1)` is a faster sort key than `lambda x: x[1]`.

### 6.10 String methods

`split`, `strip`, `join`, `count`, `find`, `ord`/`chr`, `str.translate`, slicing, `[::-1]`. Use a list of chars for mutation.

---

## 7. Big integers and modular arithmetic

- Python ints are arbitrary precision. There is no overflow, so the "use `long long`" notes in statements do not apply (2016 S5 T ≤ 10^15, 2026 S1 values to 10^18, 2026 S4 K ≤ 10^12). The cost is speed: ints above about 2^63 are slower, especially on PyPy, where machine-size ints are unboxed. Keep values reduced where possible.
- Modular arithmetic:

```python
MOD = 10**9 + 7
x = (a * b) % MOD
p = pow(base, exp, MOD)              # fast modular exponentiation
inv = pow(a, -1, MOD)                # modular inverse (3.8+; MOD prime or gcd(a,MOD)=1)
inv_fermat = pow(a, MOD - 2, MOD)    # equivalent for prime MOD, works on any version
```

- Factorials and binomials mod p for combinatorics:

```python
N = 10**6
fact = [1] * (N + 1)
for i in range(1, N + 1): fact[i] = fact[i-1] * i % MOD
inv_fact = [1] * (N + 1)
inv_fact[N] = pow(fact[N], MOD - 2, MOD)
for i in range(N, 0, -1): inv_fact[i-1] = inv_fact[i] * i % MOD
def C(n, k): return 0 if k < 0 or k > n else fact[n] * inv_fact[k] % MOD * inv_fact[n-k] % MOD
```

- Python's `%` always returns a non-negative result for a positive modulus, so `(-3) % 5 == 2`. That differs from C++.
- `//` floors toward −∞: `-7 // 2 == -4`. Be careful with negative coordinates (2026 S1 has A, B down to −10^18).
- Exact rational comparison: `fractions.Fraction` is exact but slow. Use cross-multiplication with ints. 2023 S5 works with fractions x/N; keep numerators as ints mod N.

---

## 8. Sorting

```python
a.sort()                                   # in place, stable (Timsort)
b = sorted(pairs, key=lambda p: (p[1], -p[0]))
edges.sort()                               # tuples sort lexicographically; fastest "key"
idx = sorted(range(n), key=a.__getitem__)  # argsort
```

- Sorting 10^6 ints takes well under 1 s in PyPy.
- Sorting 10^6 tuples is slower but fine.
- Sorting about 2·10^6 tuples of floats (2014 S5 pair distances, N = 2000) is borderline. Use squared int distances and pack `(d << 22) | (i << 11) | j` into one int.
- Stability matters for tie-breaking tricks. In 2017 S4, prefer original-plan edges at equal cost by sorting on `(cost, not_original)`.

---

## 9. Common beginner Python pitfalls in contests

1. **Wrong output format.** Extra spaces or prompts (`input("Enter N: ")` prints a prompt, giving a wrong answer), `print(ans, end="")` without a newline, or printing a list with brackets.
2. **`input = sys.stdin.readline` without `.strip()`** on string input.
3. **`[[0]*m]*n` aliasing.**
4. **Integer vs float division.** `/` gives a float: `7/2 == 3.5`, and `10**18/3` loses precision. Use `//` for integers.
5. **Rounding.** `round(2.5) == 2` (banker's rounding). Use `int(x + 0.5)` or format strings.
6. **Recursion depth errors** on large tests (RecursionError / stack overflow shows as a run-time error).
7. **Mutating a list while iterating over it.**
8. **Default mutable arguments** (`def f(x, memo={})`). They persist between calls, which is sometimes intended.
9. **Shadowing built-ins** (`list`, `max`, `sum`, `input`, `id`, `len`) and then calling them.
10. **Global counters inside functions** without `nonlocal`/`global`, which raises UnboundLocalError.
11. **Using 3.9+ features that work at home** but not on PyPy 3.8 (section 5).
12. **O(n) operations hidden in "one-liners":** `x in list`, `list.index`, `list.remove`, `min(slice)`, `s[1:]` copies inside loops.
13. **Comparing floats with `==`.**
14. **Off-by-one with 1-indexed statements.** Allocate `n + 1` and ignore index 0.
15. **Not handling the edge cases listed in subtasks,** for example N = 1 or disconnected graphs (2024 S4 sample 2 is disconnected; 2023 S4 subtask 1 has multiple components).
16. **Reading input incorrectly when numbers span lines.** Token-based reading (`read().split()`) avoids this.
17. **Timing out because of `print` in a loop,** or debug prints left in.
18. **Submitting a PyPy-hostile pattern:** string `+=`, deep recursion, or a dict of tuples in the hot loop.

---

## 10. CCC problems known or suspected to be hard in Python, and workarounds

The evidence levels are:

- **(D)**: a DMOJ API count of accepted PyPy3/Python 3 submissions. Details are in `_working/w4-senior-s4-s5.md`, "DMOJ evidence".
- **(G)**: GitHub solution authors' own notes.
- **(C)**: CEMC commentary constraints and complexity.

| Problem | Python risk | Evidence | Workaround |
|---|---|---|---|
| 2014 S5 Lazy Fox (N = 2000, ~2·10^6 pairs sorted, DP over pairs) | High | (G) A-stick-bug: Python 9/15 with an O(N^3) memo; full solution only in C++; aeternalis1 full in C++ | Sort pairs as packed ints; bottom-up DP with pending updates for equal distances; flat lists. See the working file for DMOJ evidence |
| 2015 S5 Greedy for Pies (N = 3000, M = 100: about 3·10^5 states × several transitions) | High | (G) A-stick-bug: "10/15, PYTHON IS TOO SLOW"; aeternalis1 C++ | Bottom-up DP with rolling arrays, not recursion |
| 2016 S4 Combining Riceballs (N = 400, interval DP O(N^3) ≈ 6.4·10^7 naive / O(N^3) with two pointers) | Medium | (G) A-stick-bug has a full Python O(N^3) (verdict not stated) | Two-pointer interval DP (Kytabyte C++ pattern), boolean flat table |
| 2017 S5 RMT (N, Q = 1.5·10^5, sqrt decomposition / heavy-light on lines) | High | (G) A-stick-bug Python 5/15; aeternalis1 full in C++ | Sqrt decomposition with flat arrays; possibly infeasible |
| 2018 S4 Balanced Trees (N = 10^9, memo over ~√N distinct values) | Low | (G) Kytabyte and aeternalis1 in C++; A-stick-bug Python memo | Grouping `n // k` blocks + `lru_cache(maxsize=None)` (not `cache`) |
| 2019 S4 Tourism (N = 10^6 DP with range-max) | High | (G) A-stick-bug Python 5/15 | O(N) DP with prefix/suffix maxima per block (geekedu editorial), fast I/O |
| 2019 S5 Triangle (N = 3000, ~4.5·10^6 cells, DP doubling O(N^2 log K)) | High | (G) A-stick-bug full in C++ only; Kytabyte: even C++ needed v2 to pass DMOJ | Flattened 1D arrays, in-place row updates; possibly infeasible |
| 2020 S4 Swapping Seats (N = 10^6 prefix sums) | Medium | (G) Kytabyte Python 8/15 | O(N) with 3 prefix arrays over the doubled string; avoid slicing |
| 2021 S4 Daily Commute (2·10^5 BFS + multiset updates) | Medium | (G) A-stick-bug Python solution (heap with lazy deletion) | Reverse BFS + heap with lazy deletion instead of a multiset |
| 2021 S5 Math Homework (1.5·10^5, 16 difference arrays + range-gcd check) | Medium | (G) A-stick-bug Python (but uses `math.lcm`, which fails on 3.8) | Replace `lcm` with `a // gcd(a, b) * b`; sparse table for gcd |
| 2022 S5 Good Influencers (tree DP N = 2·10^5) | Medium | (C) O(N) tree DP | Iterative post-order (section 3.3) |
| 2024 S4 Painting Roads (DFS tree, N, M = 2·10^5) | Medium (recursion) | (G) A-stick-bug recursive + setrecursionlimit reports AC on DMOJ | Iterative DFS with iterator indices (a true DFS tree) |
| 2025 S5 To-Do List (Q = 10^6 updates on a 2^20 segment tree) | High but feasible in PyPy | (D) PyPy3 ACs exist on DMOJ (4 s limit) | Parallel int arrays, bottom-up update, read-all input, join output |

Some DMOJ-count entries may be marked "pending" in the working file. That happens when the DMOJ API was rate-limited during this session (Cloudflare 403). Re-run `/api/v2/submissions?problem=<code>&language=PYPY3&result=AC` to refresh them.

### General workaround techniques (ranked by payoff)

1. Wrap everything in `main()` and read all input with `sys.stdin.buffer.read().split()`.
2. Replace recursion with explicit stacks and post-order arrays.
3. Flatten 2D arrays to 1D; use parallel int lists instead of lists of tuples or objects.
4. Encode composite keys as ints (`u * BIG + v`) for dicts, sets and heaps.
5. Avoid per-element function calls in the hot loop: inline Fenwick and segment-tree code.
6. Pick the algorithm with the smallest constant factor. For example, a monotonic deque (O(N)) beats a segment tree (O(N log N)); a static iterative segment tree beats a balanced BST or `insort`; BFS beats Dijkstra when weights are 0/1.
7. Accept partial marks strategically. On problems where Python cannot pass the last subtask, a correct fast solution still collects every earlier subtask (typically 7–12 of 15). See `_working/w4-senior-s4-s5.md`, "Partial-marks strategy".

---

## Sources

- CEMC CCC page (2026): https://cemc.uwaterloo.ca/contests/ccc
- CCC Grader rules PDF (2026-02-17): https://cccgrader.com/rules.pdf, plus Wayback copies (2020-03, 2023-03, 2025-03)
- CCC Grader sample solutions (compiler versions): https://cccgrader.com/sample_soln.pdf, plus Wayback copies 2019-04, 2022-03, 2023-05, 2024-06 to 2026-08
- 2025 CCC Results (no official results released): https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCResults.pdf
- 2026 CCC Results booklet: https://cemc.uwaterloo.ca/sites/default/files/documents/2026/2026CCCResults.pdf
- CEMC Senior commentaries 2022–2025, e.g. https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCSrCommentary.html
- PyPy differences from CPython: https://doc.pypy.org/en/latest/cpython_differences.html
- PyPy blog, "Repeated string concatenation is quadratic in PyPy (and CPython)" (2023): https://pypy.org/posts/2023/01/string-concatenation-quadratic.html
- Python docs (version notes): https://docs.python.org/3/whatsnew/3.9.html, https://docs.python.org/3/library/functools.html, https://docs.python.org/3/library/math.html, https://docs.python.org/3/library/functions.html#pow, https://docs.python.org/3/library/bisect.html, https://docs.python.org/3/library/stdtypes.html
- SOI wiki, Python recursion: https://soi.ch/wiki/python-recursion/
- PyRival (bootstrap, Fenwick, SegmentTree): https://github.com/cheran-senthil/PyRival
- Python CCC solution repos with self-reported scores: https://github.com/A-stick-bug/CCC-Solutions, https://github.com/Kytabyte/CCC, https://github.com/aeternalis1/Contest-problems
- DMOJ API (problem limits, submission filters): https://dmoj.ca/api/v2/problem/ccc25s5, https://dmoj.ca/api/v2/submissions?problem=ccc25s5&language=PYPY3&result=AC
