# Curriculum Map: From Absolute Zero to Full Marks on CCC Senior S5 (Python)

Worker W4, Phase 1 (Recon), round 2. Written 2026-09-21. **Audience:** the agent that will turn this into app lessons. **Status:** the key deliverable of Recon.

This file is an ordered, prerequisite-aware inventory of every concept and skill a learner who has never opened a code editor needs to reach full marks on the CCC Senior contest in Python. Every module has a stable ID (for example `M5.4`); lesson planners should key lessons, exercises and progress tracking to these IDs.

## Sources

The map synthesises the Recon research. Please cite those files rather than re-deriving:

| File | Contents |
|---|---|
| `_working/w2-junior-problems.md` | Junior 2014–2026 analysis, 44-item concept list, 13 absolute-zero prerequisites |
| `_working/w3-senior-s1-s3.md` | S1–S3 2014–2026 analysis, 27-step technique list, partial-marks table |
| `_working/w4-senior-s4-s5.md` | S4–S5 2014–2026 analysis, Python feasibility, trends |
| `python-for-ccc.md` | Grader Python environment, fast I/O, recursion, pitfalls, stdlib, templates |
| `ccc-format-and-rules.md` | Format, rules, limits, scoring history |

Facts newly verified for this file (2026-09-21):

| Fact | Source |
|---|---|
| PyPy3.8 v7.3.9 installers still exist (linux64, win64, osx64) at https://downloads.python.org/pypy/ | HTTP 200 checks |
| PyPy v7.3.11 was the last release that included PyPy3.8 ("we intend to drop support for this version in an upcoming release"); v7.3.12 shipped only 3.9 and 3.10 | https://doc.pypy.org/en/latest/release-v7.3.11.html, https://doc.pypy.org/en/latest/release-v7.3.12.html |
| CPython 3.8 reached end-of-life on 2024-10-07 | https://devguide.python.org/versions/ |
| Current Pyodide ships CPython 3.14.2, so an in-browser runner would accept 3.9+ code the Grader rejects | https://pyodide.org/en/stable/project/changelog.html |
| `vermin` detects the minimum Python version code needs and can lint against target 3.8 (`--violations -t=3.8-`) | https://github.com/netromdk/vermin |

## Conventions

**Problem references** use the form `2024 S4` or `2019 J5`. Shared Junior/Senior problems are written like `2026 J5/S2`. DMOJ lists shared problems only under the Senior code (for example `ccc26s2`).

**Depth** has three levels:

| Level | Meaning |
|---|---|
| awareness | Knows it exists and when it applies. May need to look it up (only the official docs are allowed in contest). |
| working | Can implement it correctly in untimed practice. |
| mastery | Can type it from memory, bug-free, under contest time pressure, and recognise when a problem needs it. |

**The Python environment on the Grader:**
- The default is **PyPy3 7.3.9, which is Python 3.8.13**.
- Some individual problems override this. 2026 J4 ran CPython 3.10.12.
- **Every lesson must use Python 3.8-compatible code only.** Module M1.15 covers this boundary.

**Target complexity rule of thumb** (taught in M2.9; used everywhere):

| Bound on N | Target complexity |
|---|---|
| ≤ 10 | O(N!), O(2^N·N) |
| ≤ 20 | O(2^N) |
| ≤ 400–500 | O(N^3) |
| ≤ 5000 | O(N^2) |
| ≤ 2·10^5 – 10^6 | O(N log N) or O(N) |
| ≥ 10^9 | O(log N), O(√N), or O(1) math |

In PyPy, budget roughly 10^7–10^8 simple operations per second, and 10–50× fewer in CPython. **This is an estimate** from practitioner reports; per-problem evidence is in w4 and w3.

---

## Stage overview

| Stage | Name | Goal / exit criterion | Contest payoff |
|---|---|---|---|
| 0 | Orientation and tooling | Can write, run, test and submit a program that reads stdin and prints to stdout | none directly |
| 1 | Python fundamentals | Fluent in Python 3.8 core syntax and data types | J1–J2 |
| 2 | Problem-solving foundations | Reads a statement, designs before coding, tests, debugs, estimates complexity | J1–J3 |
| 3 | Junior J1–J3 | Solves any J1–J3 from 2014–2026 with full marks | about 45/75 Junior |
| 4 | Junior J4–J5 / Senior S1–S2 | Full marks on J4, most of J5, S1, S2 | 75 Junior; about 30/75 Senior |
| 5 | Senior S3 | Full marks on most S3; always banks the S3 partials | about 35–45 Senior (Certificate of Distinction level was 26–34 in 2024–2026) |
| 6 | Senior S4 | Full marks on most S4; S5 partials | about 55–65 Senior (likely CCO-invitation range, about 50–60) |
| 7 | Senior S5 / advanced | Full S5 on feasible problems; knows which cannot be done in Python | 65–75 Senior (75 had 0 official scorers in 2026) |
| C | Contest skills (cross-cutting) | Rules, templates from memory, subtask strategy, time management, stress testing, mock contests | multiplies every stage |

Where Stage C interleaves with the main path:

| Main-path stage | Contest-track modules introduced |
|---|---|
| Stage 0 | C.1 |
| Stage 2 | C.2 and C.10 |
| Stage 3 | C.4 and C.6 |
| Stage 4 | C.3 and C.7 |
| Stage 5 onward | C.5, C.8 and C.9, continuously |

---

## Stage 0: Orientation and tooling

#### M0.1 What a program is
- **What:**
  - A program is a text file of instructions that runs top to bottom.
  - The *interpreter* runs `.py` files.
  - Input goes in and output comes out.
  - The distinction between source code, running it, and the result.
- **Why:** This is the prerequisite to everything; w2 §7 lists it as absolute-zero item 1.
- **Prereqs:** none. **Depth:** working.
- **Python notes:** Name the interpreter explicitly: "Python 3" on the Grader means PyPy3 (a faster Python). The learner does not need to understand JIT compilation yet.
- **Practice:** a hello-world program; then echoing a line.

#### M0.2 Writing and running Python (editor and runtime)
- **What:**
  - Use an editor (the app's editor, then optionally a local editor such as VS Code *with AI features off*).
  - Run code and see output and errors.
  - Understand which Python version is running.
- **Why:**
  - The CCC allows any editor or IDE, but **no AI tools inside the IDE** (rules.pdf, 2026).
  - The learner must be able to run code outside the app before contest day.
- **Prereqs:** M0.1. **Depth:** working.
- **Python notes:**
  - **Recommended local setup:** install **PyPy3.8 v7.3.9**, which matches the Grader. Downloads for linux64, win64 and osx64 are at https://downloads.python.org/pypy/, and v7.3.11 has macos_arm64.
  - The fallback is any CPython 3.8+ plus `vermin -t=3.8- --violations file.py` to flag newer features.
  - The in-app runner (for example Pyodide, which is CPython 3.14) **must add a 3.8 compatibility check**, because it will happily run `match`, `math.lcm` and similar.
- **Practice:** run programs that print, and programs with deliberate errors.

#### M0.3 Terminal basics and input files
- **What:**
  - Open a terminal, `cd`, and run `python3 s1.py` or `pypy3 s1.py`.
  - Redirect input with `< in.txt` and output with `> out.txt`.
  - Compare outputs with `diff` (macOS/Linux) or `fc` (Windows).
  - Paste multi-line input and signal end-of-file (Ctrl-D, or Ctrl-Z then Enter).
- **Why:**
  - Needed to test against the official CEMC test data zips (for example `2026CCCSeniorTestData.zip` on the past-contests page).
  - Needed to run the stress tests in C.6.
- **Prereqs:** M0.2. **Depth:** working.
- **Python notes:** Reading until EOF (M1.6) only works predictably with redirected input.
- **Practice:** run 2024 J1 against its official test files.

#### M0.4 The standard input/output model and exact output
- **What:**
  - The judge feeds input on stdin and compares your stdout **exactly**.
  - No prompts, no extra text, and the exact case and spacing.
  - Understand line structure and trailing newlines.
- **Why:**
  - rules.pdf (2026): "Output must match the output format ... exactly. Prompts or additional output must not be produced."
  - Case traps: 2025 J1 wants lowercase `yes`/`no`; 2026 J1 wants `Y 25`.
- **Prereqs:** M0.1. **Depth:** mastery.
- **Python notes:** `input("Enter N")` prints a prompt, which gives WA. `print(a, b)` inserts a single space.
- **Practice:** 2019 J1, 2020 J1, 2025 J1, 2026 J1.

#### M0.5 How judging works
- **What:**
  - There are hidden tests grouped into **subtasks (batches)**.
  - Verdicts: correct, WA, TLE, RTE, compile error, skipped.
  - A batch stops at its first failure, and a subtask is all-or-nothing unless the statement says otherwise.
  - Your score per problem is the **maximum over your submissions**.
  - You may submit up to 50 times per problem, at most once per minute.
- **Why:**
  - Every problem uses this model (rules.pdf 2026; directions.pdf 2024).
  - It is also the basis of partial-marks strategy (C.4).
- **Prereqs:** M0.4. **Depth:** mastery.
- **Python notes:** A deep-recursion crash shows up as RTE. Slow input shows up as TLE.
- **Practice:** submit deliberately wrong and deliberately slow versions of 2021 J2 and read the verdicts.

#### M0.6 Reading error messages
- **What:**
  - Read a traceback and find the line number.
  - Common errors: `SyntaxError`, `IndentationError`, `NameError`, `TypeError` (`"3" + 4`), `ValueError` (`int("3 4")`), `IndexError`, `KeyError`, `ZeroDivisionError`, `RecursionError`.
- **Why:** w2 §7 lists this as absolute-zero item 8. It is the first debugging skill.
- **Prereqs:** M0.2. **Depth:** mastery.
- **Python notes:**
  - PyPy error text differs slightly from CPython's.
  - The Grader does not show tracebacks, only "run-time error".
- **Practice:** a debug-this set in the app built from J1/J2 solutions with injected bugs.

#### M0.7 Online judges: the CCC Grader and DMOJ
- **What:**
  - **CCC Grader** workflow: log in, choose the problem, choose "Python 3", upload a `.py` file, read the feedback. File names may only contain letters, digits, `_` and `-`. You are logged out after about 10 minutes of inactivity.
  - **DMOJ** workflow: problem codes such as `ccc24s3`. Choose **PYPY3** to mirror the Grader.
  - DMOJ's limits (for example ccc25s1 0.5 s, ccc25s3 7 s) and its newer Python versions differ from the Grader's.
- **Why:** This is where all practice and the real contest happen (ccc-format-and-rules.md §2, §4).
- **Prereqs:** M0.5. **Depth:** working.
- **Python notes:**
  - **DMOJ accepts 3.9+ features that the Grader rejects.** Enforce M1.15 before every DMOJ submission.
  - Several public "AC on DMOJ" Python solutions use `functools.cache`, `math.lcm` and `list[int]` annotations, and would crash on the Grader (python-for-ccc.md §5).
- **Practice:** submit 2024 J1 and 2024 S1 on DMOJ as PYPY3.

---

## Stage 1: Python fundamentals (Python 3.8 only)

#### M1.1 Values, types, variables and `print`
- **What:** `int`, `str`, `float`, `bool`; assignment (`=` is not equality); reassignment; naming; printing several values.
- **Why:** Every J1 (for example 2022 J1, 2023 J1, 2024 J1).
- **Prereqs:** M0.4. **Depth:** mastery.
- **Python notes:** Case-sensitive names. Never shadow built-ins (`list`, `sum`, `max`, `input`, `id`).
- **Practice:** 2024 J1 Conveyor Belt Sushi, 2022 J1 Cupcake Party, 2020 J1 Dog Treats.

#### M1.2 Integer arithmetic and operators
- **What:**
  - `+ - * // % **`, precedence, and `abs`.
  - `/` returns a float.
  - `//` floors toward −∞ (`-7 // 2 == -4`) and `%` is non-negative for a positive modulus (`-3 % 5 == 2`). Both differ from C++.
- **Why:**
  - J1 formulas: 2023 J1, 2021 J1.
  - Div/mod casework: 2022 S1, 2026 S1.
  - Parity checks with negative values: 2019 S3.
- **Prereqs:** M1.1. **Depth:** mastery.
- **Python notes:**
  - The official Python sample solution on cccgrader.com uses `/` and prints a float, which is a real trap (w2 §7).
  - Python ints never overflow.
- **Practice:** 2023 J1, 2021 J1 Boiling Water, 2017 J2 Shifty Sum, 2022 S1.

#### M1.3 Reading input
- **What:**
  - `int(input())`, `input().split()`, `map(int, ...)`.
  - Several values on one line; several lines; reading N items after a count.
- **Why:** Every problem. 2014 J3 and 2019 J2 have multi-token lines.
- **Prereqs:** M1.1. **Depth:** mastery.
- **Python notes:**
  - `input()` strips the newline.
  - With `sys.stdin.readline`, the newline is kept, so strings need `.strip()`.
  - Fast input comes later, in M3.10.
- **Practice:** 2019 J1, 2014 J3 Double Dice, 2020 J3 Art (the `split(',')` separator).

#### M1.4 Booleans and conditionals
- **What:** `if/elif/else`, comparisons, chained comparisons (`a < b < c`), `and`/`or`/`not`, `in`.
- **Why:** Every J1: 2014 J1, 2015 J1, 2017 J1, 2018 J1, 2026 J1.
- **Prereqs:** M1.2. **Depth:** mastery.
- **Python notes:** Tuple comparison (`(m, d) < (2, 18)`) is lexicographic, which is handy for 2015 J1.
- **Practice:** 2014 J1 Triangle Times, 2015 J1 Special Day, 2017 J1 Quadrant Selection, 2018 J1 Telemarketer.

#### M1.5 `for` loops and `range`
- **What:** `for i in range(n)`, `range(a, b, step)`, loops that read one or two lines per iteration, and nested loops.
- **Why:** 2014 J3, 2019 J2, 2022 J2, 2025 J2.
- **Prereqs:** M1.4. **Depth:** mastery.
- **Python notes:** Use `for _ in range(n)` when the index is unused.
- **Practice:** 2016 J1, 2019 J2, 2022 J2 Fergusonball Ratings, 2025 J2 Donut Shop.

#### M1.6 `while` loops, `break`/`continue`, sentinels and EOF
- **What:**
  - Condition-driven loops and `while True` with `break`.
  - Sentinel input (2021 J3 stops at 99999).
  - Input whose length isn't given (2024 J2), read until EOF with `sys.stdin`.
- **Why:** 2020 J2, 2021 J3, 2024 J2.
- **Prereqs:** M1.5. **Depth:** mastery.
- **Python notes:** The EOF idiom is `for line in sys.stdin:` or `data = sys.stdin.read().split()`, not a bare `input()` loop, which raises `EOFError`.
- **Practice:** 2020 J2 Epidemiology, 2021 J3 Secret Instructions, 2024 J2 Dusa And The Yobis.

#### M1.7 Strings
- **What:**
  - Indexing and slicing (including `[::-1]`), `len`, iterating over characters.
  - Methods: `count`, `find`, `replace`, `split`, `join`, `strip`, `upper`/`lower`, `isdigit`, `isalpha`, `isupper`.
  - Repetition with `*`, `ord`/`chr`, and immutability.
- **Why:** 2014 J2, 2015 J2, 2015 J3, 2016 J3, 2019 J3, 2020 J4, 2024 S2.
- **Prereqs:** M1.5. **Depth:** mastery.
- **Python notes:**
  - Building a string with `+=` in a loop is **quadratic on PyPy**; use a list and then `"".join(...)` (python-for-ccc.md §4).
  - `str.removeprefix` doesn't exist in 3.8.
- **Practice:** 2014 J2 Vote Count, 2015 J2 Happy or Sad, 2019 J2, 2016 J3 Hidden Palindrome, 2015 J3 Rövarspråket.

#### M1.8 Lists (1D and 2D)
- **What:**
  - Create, index (0-based vs 1-based problems), append/pop, `len`, `sum`/`min`/`max`, `sort`/`sorted`, list comprehensions, `enumerate`, `zip`.
  - 2D lists `g[r][c]`.
  - **The aliasing bug:** `[[0]*m]*n` creates n references to the same row.
- **Why:** 2014 J4/S1, 2016 J2, 2018 J4/S2, 2023 J3, 2026 J2.
- **Prereqs:** M1.5. **Depth:** mastery.
- **Python notes:**
  - Hidden O(n) costs: `pop(0)`, `insert(0, x)`, `remove`, `index`, `x in list`, and slicing (M3.9).
  - Allocate `n + 1` slots for 1-indexed problems.
- **Practice:** 2026 J2 Olympic Scores, 2016 J2 Magic Squares, 2014 J4/S1 Party Invitation, 2023 J3 Special Event.

#### M1.9 Tuples, dictionaries and sets
- **What:**
  - Tuple packing and unpacking.
  - `dict` (get, set, `in`, iteration, `.get(k, default)`).
  - `set` (add, `in`, union and difference).
  - `collections.Counter` and `defaultdict`.
- **Why:**
  - Lookup: 2023 J2, 2014 J5/S2, 2015 J4, 2022 J4/S2.
  - Membership: 2026 J4, 2024 J5.
- **Prereqs:** M1.8. **Depth:** mastery.
- **Python notes:**
  - Dict merge with `|` needs 3.9, so it isn't available.
  - Integer keys are faster than tuple keys on PyPy (M4.1).
- **Practice:** 2023 J2 Chili Peppers, 2014 J5/S2 Assigning Partners, 2015 J4 Wait Time.

#### M1.10 Functions and scope
- **What:**
  - `def`, parameters, `return`, local vs global, `nonlocal`/`global`.
  - Helper functions to avoid repeated code.
  - Wrapping the program in `def main(): ...; main()` for speed.
- **Why:**
  - The 2023 J5 commentary recommends helpers for Word Hunt.
  - Needed for every template in C.3.
- **Prereqs:** M1.8. **Depth:** mastery.
- **Python notes:**
  - Local variables are faster than globals.
  - Mutable default arguments persist between calls.
  - `UnboundLocalError` appears when you assign to a global without declaring it.
- **Practice:** 2023 J5 CCC Word Hunt (partial subtasks), 2016 J4 Arrival Time.

#### M1.11 Output formatting
- **What:**
  - `" ".join(map(str, xs))`, f-strings, zero padding (`f"{h:02d}"`), fixed decimals (`f"{x:.1f}"`).
  - Printing an integer vs a `.5` value.
  - No trailing separators.
- **Why:**
  - 2016 J4 (HH:MM), 2018 J3 (distance table), 2018 S1 (`.1f`), 2021 S1 (`18.5` vs `75`), 2023 J3 (comma list with no trailing comma).
  - 2026 S3: the checker reportedly did not trim trailing spaces (community report, UNVERIFIED).
- **Prereqs:** M1.7. **Depth:** mastery.
- **Python notes:** `round()` uses banker's rounding (`round(2.5) == 2`). Prefer format strings.
- **Practice:** 2018 J3 Are we there yet?, 2016 J4 Arrival Time, 2018 S1 Voronoi Villages, 2021 S1 Crazy Fencing.

#### M1.12 Floats, precision and big integers
- **What:**
  - Float rounding error; never compare floats with `==`.
  - Scale to integers where possible.
  - Arbitrary-precision ints.
  - `math.isqrt` rather than `math.sqrt` for large ints.
  - Integer ceiling division `-(-a // b)`.
- **Why:**
  - Floats: 2020 S1 (relative error 1e-5), 2020 S5 (absolute error 1e-6), 2021 S1.
  - Big values: 2026 S1 (10^18), 2022 S3 (K ≤ 10^18), 2016 S5 (T ≤ 10^15).
  - Exact integers needed: 2024 S5 (scale the mean by N) and 2014 S5 (squared distances).
- **Prereqs:** M1.2. **Depth:** mastery.
- **Python notes:** No `long long` worries, but ints above about 2^63 are slower on PyPy.
- **Practice:** 2021 S1, 2020 S1 Surmising a Sprinter's Speed, 2026 S1 (T=1 subtasks).

#### M1.13 Imports and the standard library tour
- **What:**
  - `import`/`from ... import`.
  - Modules: `sys`, `math` (`gcd`, `isqrt`, `comb`, `inf`), `collections` (`deque`, `Counter`, `defaultdict`), `itertools` (`permutations`, `combinations`, `product`, `accumulate`), `heapq`, `bisect`, `functools` (`lru_cache`, `reduce`), `re`, `random`, `operator.itemgetter`.
  - Each is introduced deeply in its own module; this is the first tour.
- **Why:** Every Stage 4+ module. python-for-ccc.md §6 is the toolbox.
- **Prereqs:** M1.10. **Depth:** working here, and mastery later per tool.
- **Python notes:**
  - Third-party packages (numpy, sortedcontainers) are **not available**. w3 marks sortedcontainers as UNVERIFIED; assume absent.
  - Learn the 3.8 function signatures only.
- **Practice:** re-solve 2016 S1 Ragaman with `Counter`, and 2016 J3 with `itertools.combinations`.

#### M1.14 Recursion fundamentals
- **What:**
  - Base case and recursive case; the call stack.
  - The recursion limit (1000 by default on CPython; about 1400 calls with default settings on PyPy per doc.pypy.org).
  - `sys.setrecursionlimit` and its limits.
- **Why:** 2015 J5, 2019 J5, 2022 J5 (region splitting), and brute-force subtasks everywhere.
- **Prereqs:** M1.10. **Depth:** working.
- **Python notes:**
  - **Deep recursion (> ~10^4) is unsafe on the Grader.**
  - The threading stack-size trick is UNVERIFIED on PyPy/the Grader.
  - The iterative replacements are in M5.7.
- **Practice:** factorial/Fibonacci drills; 2015 J5 π-day (20% subtask with n ≤ 9).

#### M1.15 The Python 3.8 language boundary
- **What:** Know which features are **not** available on the Grader, and use the 3.8 substitutes.

  | Not available | Added in | Use instead |
  |---|---|---|
  | `match`/`case` | 3.10 | `if`/`elif` chains |
  | `math.lcm` | 3.9 | `a // gcd(a, b) * b` |
  | `math.gcd` with 3+ arguments | 3.9 | `functools.reduce(gcd, xs)` |
  | `functools.cache` | 3.9 | `lru_cache(maxsize=None)` |
  | runtime `list[int]` annotations | 3.9 | drop the annotation, or `from __future__ import annotations` |
  | `dict \| dict` | 3.9 | `{**a, **b}` or `.update` |
  | `str.removeprefix` | 3.9 | slicing |
  | `bisect(..., key=)` | 3.10 | bisect a parallel key list |
  | `int.bit_count` | 3.10 | `bin(x).count('1')` |
  | `itertools.pairwise` | 3.10 | `zip(a, a[1:])` |
  | `zip(strict=)` | 3.10 | check lengths yourself |

  **Available in 3.8:** walrus `:=`, `math.comb`/`perm`/`isqrt`/`prod`, `pow(a, -1, m)`, `accumulate(initial=)`, f-strings.
- **Why:** The Grader is PyPy3 7.3.9 / Python 3.8.13 (sample_soln.pdf, 2024–2026). Real published Python CCC solutions break on this (python-for-ccc.md §5).
- **Prereqs:** M1.13. **Depth:** mastery. This should be enforced by an app linter, not left to memory alone.
- **Python notes:** 2026 J4 was run on CPython 3.10.12 as a per-problem exception. Teach "always write 3.8" anyway.
- **Practice:** a "port this to 3.8" drill using the A-stick-bug 2021 S5 and 2018 S4 style solutions.

---

## Stage 2: Problem-solving foundations

#### M2.1 Reading a CCC problem statement
- **What:**
  - The sections: Problem Description, Input Specification (bounds), Output Specification, Sample Input/Output with Explanation, the **subtask table**, and "Technical Notes".
  - Underline every bound.
  - Identify 1-indexing and "any valid answer" wording.
- **Why:**
  - Every problem.
  - Technical notes matter: 2026 J4 announced a per-problem CPython switch and a memory warning.
  - Special output rules: 2024 S3 gives half marks for the first line; 2026 S3 accepts any valid answer.
- **Prereqs:** M0.5. **Depth:** mastery.
- **Python notes:** Watch for "64-bit integers" notes (2016 S5, 2026 S1); they are irrelevant in Python.
- **Practice:** annotate the statements of 2024 S3, 2026 S3 and 2021 J3 in the app without coding them.

#### M2.2 Algorithm-first thinking
- **What:** Work the sample by hand, write steps in plain language or pseudocode, then translate to code. Separate "develop the algorithm" from "implement it".
- **Why:** The 2025 J4 commentary recommends exactly this separation (w2 §7).
- **Prereqs:** M2.1. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2017 J3 Exactly Electrical (find the insight on paper), 2014 J4/S1.

#### M2.3 Simulation
- **What:** Model the process literally, with state variables and a loop per step. Know when simulation is too slow (M2.9).
- **Why:** 2014 J3, 2014 J4/S1, 2015 J4, 2016 J4, 2019 J4/S1 (small subtask), 2021 J5/S2 (small subtasks), 2026 J3.
- **Prereqs:** M1.6, M1.8. **Depth:** mastery.
- **Python notes:** Simulating 10^6 simple steps is fine in PyPy; 10^8 is not.
- **Practice:** 2014 J3 Double Dice, 2016 J4 Arrival Time, 2015 J4 Wait Time, 2014 S3 The Geneva Confection.

#### M2.4 Accumulator patterns
- **What:** Running sum, count, min and max, "best so far with tie-breaking", boolean flags, and the "first/last occurrence" pattern.
- **Why:**
  - 2021 J2 (earliest bid wins ties), 2022 J2 (flag), 2024 J3 (third-highest distinct score), 2026 J2.
  - 2017 S1 (last day with equal cumulative totals).
- **Prereqs:** M1.5. **Depth:** mastery.
- **Python notes:** Initialise with `float('-inf')` or the first element.
- **Practice:** 2021 J2 Silent Auction, 2016 J1, 2024 J3 Bronze Count, 2017 S1 Sum Game.

#### M2.5 Brute force and complete search
- **What:**
  - Try all candidates with nested loops.
  - Enumerate substrings, pairs, triples, subsets (`itertools.product`, bitmasks) and permutations.
  - Prune obvious waste.
- **Why:**
  - Full solutions: 2016 J3, 2020 J4, 2023 J5, 2022 S1.
  - **Partial marks on almost every S3–S5**: 2026 S5 (N, M ≤ 6), 2024 S5 (N ≤ 8), 2022 S3 (N ≤ 16, M = 2), 2024 S3 (N ≤ 8), 2026 S3 (N ≤ 3 or 10).
  - It is also the verifier in C.6.
- **Prereqs:** M1.8, M1.13. **Depth:** mastery.
- **Python notes:** `itertools.permutations` and `product` are fast. 3^10 assignments (2026 S3, N ≤ 10) is fine.
- **Practice:** 2016 J3 Hidden Palindrome, 2020 J4 Cyclic Shifts, 2022 S1 Good Fours and Good Fives, 2023 J5, then the brute-force subtasks of 2022 S3 and 2024 S5.

#### M2.6 Case analysis and edge cases
- **What:**
  - Enumerate special situations: empty or minimum input, all-equal values, ties, boundaries, N = 1, disconnected graphs, impossible cases.
  - Check each case against the statement.
- **Why:**
  - 2025 J4 (all S), 2023 J3 (ties), 2024 J4, 2026 J5/S2 (clamping to [1, N]), 2019 S3, 2023 S3 (R ∈ {0, N}), 2026 S1 (T = 2 "second fewest").
  - Disconnected graphs: 2024 S4 sample 2 and 2023 S4 subtask 1.
- **Prereqs:** M2.2. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2021 J1 (the sign convention), 2025 J4 Sunny Days, 2025 S1, 2026 S1.

#### M2.7 Testing
- **What:**
  - Run the samples and compare character by character.
  - Write your own small tests, edge-case tests and **maximum-size tests** (to check speed).
  - Keep test files and use the official CEMC test data.
- **Why:** The Grader shows only sample feedback plus per-subtask feedback up to the first failure. Local testing is the main safety net.
- **Prereqs:** M0.3, M2.6. **Depth:** mastery.
- **Python notes:** Generate a maximum-size test with a short Python script (`random`), then time it with `time pypy3 sol.py < big.txt`.
- **Practice:** for 2026 J5/S2, write an N = 5·10^5 test and time it.

#### M2.8 Debugging
- **What:**
  - Reproduce the bug on the smallest failing input.
  - Print intermediate state (to **stderr** or removed before submitting), use `assert`, and bisect the code.
  - Know the common bug families: off-by-one, 0- vs 1-indexing, aliasing, mutating while iterating, integer vs float division, forgotten `.strip()`, wrong variable reuse.
- **Why:** Every problem. The top beginner pitfalls are in python-for-ccc.md §9.
- **Prereqs:** M0.6, M2.7. **Depth:** mastery.
- **Python notes:** `print(..., file=sys.stderr)` doesn't affect judged output (standard behaviour; that the Grader ignores stderr is UNVERIFIED, so remove it anyway).
- **Practice:** the app's "find the bug" set; the 2020 S1 variant that forgets to sort.

#### M2.9 Complexity analysis and deriving the target from N
- **What:**
  - Count operations and use Big-O (O(1), O(log N), O(N), O(N log N), O(N^2), O(N^3), O(2^N)).
  - Map each subtask bound to the complexity it needs (table in "Conventions").
  - Know the costs of built-ins.
  - Understand memory: 512 MB, and a list of ints on PyPy is about 8 bytes each.
- **Why:**
  - Every subtask table is a complexity ladder: 2024 S5 goes 2 → 8 → 20 → 100 → 1000 → 2000 → 2·10^5, and 2026 S5 goes 6 → 40 → 300 → 2000 → 10^6 → 10^9.
  - The J3–J4 large subtasks since 2021 punish O(N^2) (w2 §5).
- **Prereqs:** M2.5. **Depth:** mastery.
- **Python notes:** PyPy roughly 10^7–10^8 simple ops per second; CPython 10–50× slower (estimate). 2023 S2 at 12.5·10^6 updates is fine in PyPy but risky in CPython.
- **Practice:** classify the subtasks of 2025 J4, 2022 S1, 2023 S2, 2024 S5 and 2026 S4 before solving.

---

## Stage 3: Junior J1–J3

#### M3.1 Formula-plus-condition problems (J1 pattern)
- **What:** Read a few numbers, compute a formula, branch on the result, and print exactly.
- **Why:** Every J1 from 2014 to 2026.
- **Prereqs:** M1.4, M1.11. **Depth:** mastery.
- **Python notes:** none.
- **Practice (easiest first):** 2024 J1, 2023 J1, 2022 J1, 2020 J1, 2019 J1, 2025 J1, 2026 J1, 2021 J1, 2014 J1, 2017 J1, 2018 J1, 2015 J1.

#### M3.2 Loop-and-count problems (J2 pattern)
- **What:** A loop over the input with counting or accumulation, including the variants "two lines per item" and "count not given".
- **Why:** Every J2: 2016 J1, 2019 J2, 2020 J2, 2021 J2, 2022 J2, 2023 J2, 2024 J2, 2025 J2, 2026 J2.
- **Prereqs:** M1.6, M2.4. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2017 J2, 2014 J2, 2018 J2, 2019 J2, 2026 J2, 2023 J2, 2022 J2, 2025 J2, 2021 J2, 2020 J2, 2024 J2.

#### M3.3 String processing I: counting, runs and building
- **What:**
  - Character counting and run detection (compare with the previous character).
  - Run-length encoding.
  - Building output with a list plus join.
  - Substring and palindrome checks.
- **Why:** 2019 J3, 2025 J4 (blocks of S), 2024 S2 (heavy/light), 2016 J3, 2019 J4/S1.
- **Prereqs:** M1.7, M2.4. **Depth:** mastery.
- **Python notes:** Avoid string `+=` in loops.
- **Practice:** 2015 J2, 2019 J3 Cold Compress, 2018 J2, 2016 J3, 2024 S2 Heavy-Light Composition.

#### M3.4 String processing II: tokenizing with state
- **What:**
  - Scan characters while keeping state (current letter group, number being built, sign).
  - Split mixed letter/number strings.
  - Use `re.findall` as an alternative.
- **Why:** 2022 J3 Harp Tuning, 2025 J3 Product Codes (negative multi-digit numbers), 2021 J3, 2025 S2 (RLE with multi-digit counts).
- **Prereqs:** M3.3. **Depth:** mastery.
- **Python notes:** `re.findall(r'([a-z])(\d+)', s)` is available in 3.8.
- **Practice:** 2021 J3, 2022 J3, 2025 J3, 2025 S2 (the small subtasks first).

#### M3.5 Lookup tables
- **What:** Encode fixed tables as `dict` or list literals: prices, vowel rules, "who beats whom".
- **Why:** 2023 J2 (Scoville values), 2015 J3 (nearest vowel), 2026 J3 (candy game).
- **Prereqs:** M1.9. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2023 J2, 2015 J3, 2026 J3 (small subtasks).

#### M3.6 Frequency arrays and counting
- **What:**
  - Count occurrences with an array indexed by value (`cnt[v] += 1`) or with `Counter`.
  - Loop over the value range instead of the items.
  - Compare two frequency profiles (anagrams).
- **Why:** 2016 S1 (anagram with wildcards), 2017 J5/S3 (lengths ≤ 2000), 2024 J3 (scores ≤ 75), 2024 S2, 2020 S3 (window letter counts).
- **Prereqs:** M1.8, M1.9. **Depth:** mastery.
- **Python notes:** A list of size V+1 beats a dict when V is small (≤ 10^6).
- **Practice:** 2016 J1, 2016 S1 Ragaman, 2024 J3, 2017 J5/S3 Nailed It! (N ≤ 1000 subtasks first).

#### M3.7 Grid basics
- **What:**
  - Read grids of characters or numbers.
  - Index as `g[r][c]`, with bounds checks.
  - Direction vectors (4 and 8 directions) and row and column sums.
  - Neighbour scanning.
- **Why:** 2016 J2, 2023 J4/S1 (triangle adjacency), 2023 J5 (8 directions plus bends), 2026 J4 (N/E/S/W moves), 2023 S3 (poster construction).
- **Prereqs:** M1.8. **Depth:** mastery.
- **Python notes:** Store rows as strings when read-only. Hoist `row = g[r]` in inner loops.
- **Practice:** 2016 J2, 2023 J4/S1 Trianglane, 2023 J5 CCC Word Hunt, 2026 J4 Snail Path (small subtasks).

#### M3.8 Clock and calendar arithmetic, modulo and periodicity
- **What:**
  - Minutes ↔ HH:MM, wrapping with `% 1440` or `% 720`.
  - Detect a period and compute "full cycles × per-cycle count + remainder".
- **Why:** 2016 J4, 2017 J4 (D ≤ 10^9 minutes, 720-minute cycle), 2015 J1.
- **Prereqs:** M1.2, M2.3. **Depth:** working.
- **Python notes:** none.
- **Practice:** 2015 J1, 2016 J4, 2017 J4 Favourite Times.

#### M3.9 Linear-pass thinking and hidden costs of built-ins
- **What:**
  - Recognise that `x in list`, `list.remove`, `list.index`, `count` inside a loop, and slicing `s[1:]` are each O(n).
  - Rewrite the solution as one pass with indices and counters.
- **Why:**
  - Commentary warnings: 2023 J4/S1, 2024 J3, 2025 J4, 2026 J3.
  - `s = s[1:]` fails the last 2 marks of 2026 J3.
- **Prereqs:** M2.9. **Depth:** mastery.
- **Python notes:** The same patterns are even slower relative to C++ in Python.
- **Practice:** 2026 J3 Creative Candy Consumption (all subtasks), 2024 J3 (full), 2025 J4 Sunny Days (from O(N^2) to O(N)), 2023 J4/S1 (full).

#### M3.10 Fast input and output
- **What:**
  - `sys.stdin.buffer.read().split()` with a moving index, or `input = sys.stdin.readline`.
  - Collect output in a list and write it once with `sys.stdout.write("\n".join(out) + "\n")`.
  - Wrap the program in `main()`.
- **Why:**
  - Inputs of 10^5–10^6 lines: 2015 S2, 2017 J5/S3, 2019 S4, 2020 J5/S2, 2021 J5/S2, 2024 S1, 2025 S5, 2026 J3, 2026 J5/S2 (1.5 M input lines, 5·10^5 output lines).
  - CEMC directions.pdf: "Occasionally, to obtain a perfect score, 'fast input' is required."
- **Prereqs:** M1.3, M1.11. **Depth:** mastery. It is also a C.3 template.
- **Python notes:** Tokens are bytes (`b'A'`). `int(b'12')` works. See python-for-ccc.md §2.
- **Practice:** 2024 S1 Hat Circle, 2026 J5/S2 Beams of Light, 2015 S2 Jerseys, 2019 J4/S1 Flipper.

---

## Stage 4: Junior J4–J5 / Senior S1–S2

#### M4.1 Hash-based lookup
- **What:**
  - O(1) average membership and mapping with dict and set.
  - Encode composite keys as ints (`x * BIG + y`) or tuples.
  - Reverse maps (value → positions).
  - Deduplication.
- **Why:**
  - 2022 J4/S2 (the last subtask needs dict lookup), 2024 J4, 2026 J4 (a set of up to 4·10^6 squares), 2020 J5/S2 (value → cells).
  - Also 2020 S3 (a set of distinct window hashes) and 2025 S3 (per-colour structures).
- **Prereqs:** M1.9, M2.9. **Depth:** mastery.
- **Python notes:**
  - Int keys are faster and lighter than tuple keys.
  - 2026 J4 ran on CPython, where 4 M tuples are memory-heavy, so an int encoding is safer.
- **Practice:** 2014 J5/S2, 2022 J4/S2 Group Work (full), 2024 J4 Troublesome Keys, 2026 J4 Snail Path (full).

#### M4.2 Sorting with keys, and greedy
- **What:**
  - `sort`/`sorted` with `key=`, `reverse=True`, tuple ordering, argsort, and stability.
  - Greedy choices justified by a simple exchange argument.
  - Pairing strategies such as "smallest with largest".
- **Why:**
  - 2016 J5/S2 (min/max pairing), 2017 S2 (interleave), 2018 S1, 2020 S1 (sort by time), 2021 J4 (swap counting), 2015 S2.
  - Later: 2015 S3 (largest free gate), 2025 S4 (sorted incident edges), 2026 S4 (greedy gem assignment).
- **Prereqs:** M1.8, M2.4. **Depth:** mastery.
- **Python notes:** Sorting tuples is faster than `lambda` keys. `operator.itemgetter` is fast.
- **Practice:** 2016 J5/S2 Tandem Bicycle, 2017 S2 High Tide Low Tide, 2018 S1, 2020 S1, 2021 J4 Arranging Books, 2015 S2 Jerseys.

#### M4.3 Prefix sums (1D, 2D, prefix/suffix max)
- **What:**
  - `P[i] = P[i-1] + a[i]`, range sum `P[r] - P[l-1]`, and counting prefixes per category.
  - 2D prefix sums.
  - Prefix and suffix maximums.
- **Why:**
  - 2018 J3, 2017 S1, 2020 S4 (per-letter prefix counts on the doubled string), 2022 S4 (O(N + C) counting), 2024 S5 (prefix sums of mean-shifted rows).
  - 2019 S4 (prefix/suffix block maxima).
- **Prereqs:** M1.8, M2.9. **Depth:** mastery.
- **Python notes:** `itertools.accumulate(a, initial=0)` works in 3.8. `accumulate(a, max)` gives prefix maxima.
- **Practice:** 2018 J3, 2017 S1 Sum Game, 2020 S4 Swapping Seats (the no-C subtasks first), 2022 S4 (C ≤ 6000 subtask).

#### M4.4 Difference arrays and interval clamping
- **What:**
  - Range updates via `d[a] += 1; d[b+1] -= 1` followed by a prefix sum.
  - Clamp intervals to [1, N].
  - Merge sorted intervals as the alternative.
  - Use one difference array per category (for example 16 of them).
- **Why:**
  - 2026 J5/S2 (the canonical example).
  - 2021 S5 (16 difference arrays, one per possible GCD value).
  - 2014 S4 (2D difference on a compressed grid, see M6.8).
- **Prereqs:** M4.3. **Depth:** mastery.
- **Python notes:** Allocate size N+2 to avoid bounds checks.
- **Practice:** 2026 J5/S2 Beams of Light (full), 2021 S5 (Z ≤ 2 subtask).

#### M4.5 Mathematical insight: parity, invariants, closed forms
- **What:**
  - Replace a simulation with an invariant: parity of flips, Manhattan distance plus parity, "only counts matter".
  - Derive formulas by reasoning about small cases.
- **Why:**
  - 2017 J3, 2019 J4/S1, 2021 J5/S2 (r·(N−c) + (M−r)·c), 2023 J4/S1 (3B − 2·shared), 2025 S1 (min of two layouts).
  - 2026 S3 (parity of card values).
  - 2023 S5 (Cantor-set structure).
- **Prereqs:** M2.3, M2.6. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2017 J3 Exactly Electrical, 2019 J4/S1, 2025 S1, 2021 J5/S2 Modern Art (full), 2023 J4/S1 (full).

#### M4.6 Number theory I
- **What:**
  - Divisibility, floor division with negatives, remainders, parity.
  - `math.gcd`, and lcm via gcd.
  - Primality by trial division up to √n; the Sieve of Eratosthenes (`bytearray` slice assignment).
  - Divisor enumeration.
  - "Linear combination" loops (4a + 5b = N).
- **Why:** 2019 S2 (sieve up to 2·10^6), 2022 S1, 2026 S1 (div/mod casework at 10^18), 2026 S3 (gcd > 1 via parity), 2021 S5 (gcd/lcm of values ≤ 16), 2020 J5/S2 (factor pairs).
- **Prereqs:** M1.2, M2.5. **Depth:** mastery for gcd/mod/parity; working for the sieve.
- **Python notes:** There is no `math.lcm` in 3.8. The sieve is `is_p[i*i::i] = bytes(len(range(i*i, n+1, i)))`.
- **Practice:** 2022 S1, 2019 S2 Pretty Average Primes, 2026 S1 Baby Hop Giant Hop (all subtasks), 2026 S3 (non-hidden subtasks).

#### M4.7 Grid transformations
- **What:** Rotate by 90° (`[list(r) for r in zip(*g[::-1])]`), transpose, flip, and check orientation invariants.
- **Why:** 2018 J4/S2 Sunflowers, 2019 J4/S1 (flips), and transposition symmetry in 2023 S3.
- **Prereqs:** M3.7. **Depth:** working.
- **Python notes:** `zip(*g)` transposes.
- **Practice:** 2019 J4/S1, 2018 J4/S2 Sunflowers.

#### M4.8 Stacks and queues
- **What:**
  - A stack is a list with `append`/`pop`; a queue is `collections.deque`.
  - LIFO/FIFO simulations and matching.
  - "Stack sorting" reasoning.
- **Why:** 2015 S1 (undo with 0), 2014 S3 (the side-branch stack), 2026 S4 (a LIFO side track), and BFS (M4.13).
- **Prereqs:** M1.8. **Depth:** mastery.
- **Python notes:** Never use `list.pop(0)`; use `deque.popleft()`.
- **Practice:** 2015 S1 Zero That Out, 2014 S3 The Geneva Confection.

#### M4.9 Two pointers and index pointers
- **What:**
  - Move indices instead of mutating sequences.
  - Two-sequence merge and match; subsequence test.
  - Expanding and shrinking windows (leading into M5.3).
- **Why:** 2026 J3 (two candy lines), 2024 S3 (compressed B as a subsequence of A), 2021 S3 alternatives, 2016 S4 (two pointers inside interval DP).
- **Prereqs:** M3.9. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** 2026 J3 (full), 2024 S3 Swipe (the YES/NO line first; half marks per subtask).

#### M4.10 Backtracking search with pruning
- **What:** Recursive exhaustive search (DFS over choices), with pruning by bounds and memoised dead states (a visited set of (step, state)).
- **Why:**
  - 2019 J5 Rule of Three (DMOJ 20 points; the hardest Junior problem of the period).
  - 2022 J5 (region splitting).
  - Brute-force subtasks of 2024 S3 (N ≤ 8) and 2026 S5 (N, M ≤ 6).
- **Prereqs:** M1.14, M2.5. **Depth:** working.
- **Python notes:**
  - The depth is small here, so recursion is fine.
  - Whether pure Python gets the last mark of 2019 J5 is UNVERIFIED (w2).
- **Practice:** 2019 J5 (S ≤ 6, then ≤ 12), 2022 J5 Square Pool (small subtasks).

#### M4.11 Memoization and introductory dynamic programming
- **What:**
  - Overlapping subproblems.
  - Top-down memo with `lru_cache(maxsize=None)` or a dict.
  - Bottom-up tables, 1D/2D DP, rolling arrays (keep 2 rows).
  - Defining the state and the transition.
- **Why:** 2015 J5 (integer partitions), 2025 J5 (row-by-row grid DP), 2022 S5 (line DP subtask), 2023 S2 (interval recurrence), and the base for every DP in Stage 6.
- **Prereqs:** M1.14, M2.5. **Depth:** mastery.
- **Python notes:**
  - `functools.cache` is not in 3.8.
  - Use bottom-up loops for large tables; recursive memo is slow and has limited depth on PyPy.
  - The last subtask of 2025 J5 (R, C = 20,000, about 4·10^8 updates) is likely infeasible in Python (w2).
- **Practice:** 2015 J5 π-day, 2025 J5 Connecting Territories (to 13/15), then 2022 S5 subtask 1.

#### M4.12 Graphs I: modelling and adjacency lists
- **What:**
  - Nodes and edges, directed vs undirected.
  - Build adjacency lists (`adj = [[] for _ in range(n+1)]`).
  - Implicit graphs: grid cells, values, products.
  - Reverse edges.
- **Why:** 2018 J5 (pages), 2020 J5/S2 (nodes are products r·c), 2021 S4, and all S4 graph problems.
- **Prereqs:** M1.8, M1.9. **Depth:** mastery.
- **Python notes:** A list of lists beats a dict of lists when ids are dense.
- **Practice:** 2018 J5 Choose your own path (small subtasks), 2020 J5/S2 (subtasks 1–3).

#### M4.13 BFS and flood fill (iterative)
- **What:**
  - BFS with `deque` and a distance array; shortest path in unweighted graphs.
  - Grid BFS with 4 directions.
  - Mark visited **on push**.
  - Connected components; reachability.
- **Why:**
  - 2018 J5, 2024 J5 (flood fill), 2020 J5/S2 (BFS over values), 2016 S3, 2018 S3.
  - BFS state-space brute force for small subtasks (2024 S3, N ≤ 8) and as a checker (2026 S1).
- **Prereqs:** M4.8, M4.12. **Depth:** mastery. It is a C.3 template.
- **Python notes:** Iterative BFS avoids recursion limits. The 2024 J5 commentary mentions `setrecursionlimit` for DFS; prefer BFS on the Grader.
- **Practice:** 2024 J5 Harvest Waterloo, 2018 J5 (full), 2020 J5/S2 Escape Room (full).

#### M4.14 Compressed data and values you cannot expand
- **What:**
  - Work with run-length-encoded or implicit sequences without materialising them.
  - Reduce with modulo over the period.
  - Prefix scan over (value, count) pairs.
  - Handle counts up to 10^12.
- **Why:** 2025 S2 (RLE pattern repeated infinitely, c ≤ 10^12), 2017 J4 (cycles), 2016 S5 (T ≤ 10^15 steps, see M6.12).
- **Prereqs:** M3.4, M3.8. **Depth:** working.
- **Python notes:** Big ints are free.
- **Practice:** 2017 J4 (full), 2025 S2 Cryptogram Cracking Club (full).

#### M4.15 Circular arrays
- **What:** Index with `(i + k) % N`, double the array to linearise a circle, and use arc-length reasoning on circles.
- **Why:** 2024 S1 (the person opposite is `(i + N/2) % N`), 2020 S4 (circular seating), 2022 S4 (points on a circle), 2016 S5 (circular automaton).
- **Prereqs:** M1.8, M1.2. **Depth:** mastery.
- **Python notes:** Negative indices wrap silently in Python, which can hide bugs.
- **Practice:** 2024 S1 Hat Circle, 2020 S4 (subtasks), 2022 S4 (N ≤ 200 subtask).

---

## Stage 5: Senior S3

#### M5.1 Constructive problem solving
- **What:**
  - Build any valid witness, or prove it is impossible.
  - Start from a simple pattern ("fill with `a`, the rest `b`").
  - Handle extreme cases (0, all), and use symmetry (transpose, reverse).
  - Maintain an invariant while building greedily.
  - **Always verify your output with a checker** before submitting.
- **Why:** Five of the last eight S3s are constructive: 2019 S3, 2022 S3, 2023 S3, 2024 S3, 2026 S3. 2021 S5 also asks you to "output any valid sequence or Impossible".
- **Prereqs:** M2.5, M2.6, M4.5. **Depth:** mastery. It is *the* critical S3 skill (w3 §2.2).
- **Python notes:** Output of up to 4·10^6 characters (2023 S3) must be built as row strings and joined.
- **Practice:** 2023 S3 Palindromic Poster (R = C = 1, then N = 2, then full), 2019 S3 Arithmetic Square, 2022 S3 Good Samples, 2024 S3 Swipe (the full construction), 2026 S3.

#### M5.2 Pattern discovery by small-case enumeration
- **What:**
  - Write a brute force for tiny inputs, print a table of answers, and spot the pattern or formula.
  - Form a hypothesis, prove it (or at least stress-test it, C.6), then implement.
- **Why:**
  - 2026 S5 (brute force for N, M ≤ 6 to explore fence shapes), 2023 S5 (which x/N survive), 2022 S3, 2019 S3, 2026 S1 (T = 2 casework).
  - Math-heavy S5s depend on this: 2020, 2023 and 2026 were math or ad hoc (w4 trends).
- **Prereqs:** M2.5, M1.10. **Depth:** mastery.
- **Python notes:** Python is ideal for quick exploration scripts.
- **Practice:** tabulate 2018 S4 f(N) for N ≤ 50; tabulate 2026 S1 answers for small A, B, K with BFS; tabulate 2023 S5 for powers of 3.

#### M5.3 Sliding windows with counts
- **What:**
  - A fixed-length window maintaining letter counts in O(1) per step, plus a "matches" counter.
  - Variable windows (distinct elements in the window).
- **Why:** 2020 S3 (permutations of the needle as windows of the haystack), 2022 S3 (the window of distinct notes), 2019 S4 (windows of length K).
- **Prereqs:** M3.6, M4.9. **Depth:** mastery.
- **Python notes:** Use a 26-element int list, not a Counter, in the hot loop.
- **Practice:** 2020 S3 Searching for Strings (to 7/15 without hashing), 2022 S3 (M = 2 subtask).

#### M5.4 Hashing: polynomial rolling hash
- **What:**
  - `h = (h*B + c) % M`, removing the leading character, and precomputed powers.
  - Collision risk: use a double hash or one mod near 2^61.
  - A set of hashes to count distinct substrings.
- **Why:** 2020 S3 (the last 8 marks).
- **Prereqs:** M5.3, M4.1, M4.6 (modulo basics). **Depth:** working.
- **Python notes:** Big ints make `% ((1 << 61) - 1)` easy but slower; keep values reduced every step. DMOJ's limit is 0.5 s, which is tight, so use PyPy (w3).
- **Practice:** 2020 S3 (full).

#### M5.5 Binary search
- **What:**
  - `bisect_left`/`bisect_right` on sorted lists, and coordinate lookup.
  - **Binary search on the answer** over a monotone feasibility predicate.
  - Integer loop invariants (`lo < hi`, `mid = (lo + hi) // 2`).
- **Why:** 2021 S3 (sign of f(c+1) − f(c)), 2015 S3 (bisect alternative), 2026 S4 (binary search on side-track capacity), and the M6.8 coordinate lookups.
- **Prereqs:** M4.2, M2.9. **Depth:** mastery. It is a C.3 template.
- **Python notes:** There is no `key=` in 3.8's `bisect`. `insort` is O(n) per insertion.
- **Practice:** bisect drills on 2020 S1 data, then 2021 S3 Lunch Concert (full), then 2026 S4 (with K = 10^12 in the subtasks).

#### M5.6 Convex functions: ternary search and slope sweep
- **What:**
  - Recognise a convex piecewise-linear cost.
  - Find its minimum by ternary search, by binary search on the slope, or by sweeping sorted breakpoints while tracking the slope.
- **Why:** 2021 S3.
- **Prereqs:** M5.5, M4.2. **Depth:** working.
- **Python notes:** Prefer the O(N log N) sweep; 60 × 2·10^5 evaluations is borderline in CPython (w3).
- **Practice:** 2021 S3 (4-mark brute force → 13 marks → full).

#### M5.7 Iterative DFS and recursion elimination
- **What:**
  - An explicit stack DFS.
  - Preorder and reverse-preorder (post-order) processing.
  - A *true* DFS order with per-node iterator indices (needed for DFS-tree properties).
  - The generator "bootstrap" pattern.
- **Why:** 2016 S3 (N = 10^5), 2022 S5 (tree DP at depth 2·10^5), 2024 S4 (a DFS tree on 2·10^5 nodes), and DSU `find`.
- **Prereqs:** M4.13, M1.14. **Depth:** mastery. It is a C.3 template.
- **Python notes:**
  - On PyPy, `setrecursionlimit` maps to about 768 bytes of stack per level, and the default is about 1400 calls (doc.pypy.org).
  - The threading trick is UNVERIFIED on the Grader.
  - Templates are in python-for-ccc.md §3.3.
- **Practice:** re-implement 2024 J5 with an explicit stack; 2016 S3 (full); 2024 S4 (full).

#### M5.8 Trees I: rooting, parent/order arrays, pruning and diameter
- **What:**
  - A tree has N−1 edges and unique paths.
  - Root it, compute parent, depth and order arrays.
  - Prune leaves repeatedly with a queue.
  - Diameter via two BFS runs.
  - Subtree aggregates via reverse order.
- **Why:** 2016 S3 (prune unmarked subtrees, then 2·edges − diameter), 2022 S5 (tree DP base), 2025 S4 subtask 1 (the unique path in a tree).
- **Prereqs:** M4.13, M5.7. **Depth:** mastery.
- **Python notes:** Use iterative traversals only.
- **Practice:** 2016 S3 Phonomenal Reviews (M = 2 → M ≤ 8 → full), 2025 S4 subtask 1.

#### M5.9 BFS variants: multi-source, 0-1 BFS, zero-cost moves, reverse graph
- **What:**
  - Several starting nodes.
  - Edge weights 0/1 via `appendleft`/`append`.
  - Forced zero-cost moves (conveyors) with loop detection.
  - BFS from the target on the reversed graph.
- **Why:** 2018 S3 (conveyors, cameras), 2021 S4 (reverse BFS from N), 2020 J5/S2 (search backward from the target).
- **Prereqs:** M4.13. **Depth:** mastery.
- **Python notes:** none beyond `deque`.
- **Practice:** 2018 S3 RoboThieves (5 → 10 → 15), 2021 S4 Daily Commute (subtasks 1–3 via per-day BFS).

#### M5.10 Disjoint Set Union (union-find)
- **What:**
  - `find` with path halving (iterative) and union by size.
  - Connectivity queries.
  - The "next free slot" DSU trick.
  - Contracting components.
- **Why:** 2015 S3 Gates (the next free gate ≤ g), 2017 S4, 2018 S5, 2023 S4 (Kruskal / 0-length contraction).
- **Prereqs:** M1.8, M1.10. **Depth:** mastery. It is a C.3 template.
- **Python notes:** A recursive `find` risks deep recursion before compression; use the iterative version.
- **Practice:** 2015 S3 Gates (40% brute force → full DSU), then M6.3 problems.

#### M5.11 Heaps and lazy deletion; ordered-set substitutes
- **What:**
  - `heapq` min-heap (negate for max).
  - Push/pop of (key, id) pairs.
  - **Lazy deletion** with validity checks or version numbers, simulating a multiset or BBST.
  - Maintaining aggregates under point updates.
- **Why:** 2025 S3 Pretty Pens (per-colour max-heaps, a heap of tops, a heap of non-tops), 2021 S4 (the minimum of i + walk[S_i] under swaps), Dijkstra (M6.1).
- **Prereqs:** M4.2, M4.1. **Depth:** mastery.
- **Python notes:** Python has **no built-in balanced BST** and no sortedcontainers, so lazy-deletion heaps are the standard substitute.
- **Practice:** 2021 S4 (full), 2025 S3 (Q = 0 → M ≤ 10 → full).

#### M5.12 O(N^2) DP on intervals and centre expansion
- **What:**
  - Recurrences of the form value(l, r) = value(l+1, r−1) + cost(l, r).
  - Expand from each centre (odd and even lengths).
  - Keep only the answer per length, not a 2D table.
- **Why:** 2023 S2 Symmetric Mountains (about 12.5·10^6 updates at N = 5000), 2016 J3 (palindrome checks).
- **Prereqs:** M4.11. **Depth:** mastery.
- **Python notes:**
  - It is fine in PyPy with a tight inner loop.
  - In CPython it takes several seconds, so it is a real risk (w3).
  - Never allocate a 5000×5000 table of Python ints (25 M cells).
- **Practice:** 2016 J3, 2023 S2 (N ≤ 300 O(N^3) subtask → full O(N^2)).

#### M5.13 Randomized strategies
- **What:** Shuffle, make random guesses, reason about failure probability, and use a fixed seed for reproducibility.
- **Why:** 2026 S3 (the last 7 marks: up to 100 disjoint guesses on hidden values). Randomised stress tests (C.6) use the same skills.
- **Prereqs:** M1.13, M4.6. **Depth:** working.
- **Python notes:** `random.shuffle` and `random.randint`.
- **Practice:** 2026 S3 (hidden subtask).

---

## Stage 6: Senior S4

#### M6.1 Dijkstra's shortest paths
- **What:**
  - Non-negative weighted graphs.
  - `heapq` with lazy skipping (`if d > dist[u]: continue`).
  - All-pairs shortest paths via N runs; early termination.
  - Checking whether an edge is the *unique* shortest path.
- **Why:** 2015 S4 (over (node, damage) states), 2023 S4 (N× Dijkstra, then keep edges that are the unique shortest path), 2025 S4 (on the edge-state graph), and 2021 S4 partial subtasks.
- **Prereqs:** M4.12, M5.11. **Depth:** mastery. It is a C.3 template.
- **Python notes:**
  - Use flat int arrays for `dist`.
  - Encode (distance, node) as one int if needed (python-for-ccc.md §6.1).
  - 2023 S4: 2000 runs × 2000 edges is fine in PyPy. Floyd–Warshall (8·10^9 operations) is not.
- **Practice:** 2015 S4 Convex Hull (K = 1 subtasks → full), 2025 S4 Floor is Lava (subtask 2 → 3 → full), 2023 S4 Minimum Cost Roads.

#### M6.2 State-space graph modelling and sparsification
- **What:**
  - Expand states: (node, resource used), (node, level), or edges as states.
  - Add virtual start edges.
  - Contract zero-cost components.
  - Remove dominated transitions (connect only consecutive sorted weights at each node).
  - Remove self-loops and duplicate multi-edges.
- **Why:** 2015 S4 ((island, hull wear) with K ≤ 200), 2025 S4 (11N states for c ≤ 10; edge-states with O(M) transitions for full), 2023 S4 (contract 0-length edges via MST; keep the shortest multi-edge).
- **Prereqs:** M6.1, M4.2. **Depth:** mastery. This is how recent S4s are designed (w4 trends).
- **Python notes:** Index states as `node*K + h` in a flat list.
- **Practice:** 2015 S4, 2025 S4 (all subtasks), 2023 S4 subtask 3.

#### M6.3 Minimum spanning tree: Kruskal plus DSU
- **What:**
  - Sort edges and union them.
  - A spanning forest over multiple components.
  - Tie-breaking (prefer original edges).
  - Kruskal over edge *types* with two DSUs and counting of copies.
- **Why:** 2017 S4 (the minimum number of days; with enhancer D), 2018 S5 (a product graph, two DSUs), 2023 S4 subtask 1 (MST when all l = 0).
- **Prereqs:** M5.10, M4.2. **Depth:** mastery. It is a C.3 template.
- **Python notes:** Sort `(w, u, v)` tuples directly.
- **Practice:** 2023 S4 subtask 1, 2017 S4 Minimum Cost Flow (D = 0 subtasks → full), 2018 S5 Maximum Strategic Savings.

#### M6.4 DFS tree properties
- **What:** In an undirected DFS tree every non-tree edge is a back edge (there are no cross edges). Know depth parity, and the difference between tree edges and back edges.
- **Why:** 2024 S4 Painting Roads (colour tree edges by depth parity).
- **Prereqs:** M5.7. **Depth:** working. Awareness of bridges and articulation points is an extension, but none are needed in 2014–2026.
- **Python notes:** A stack that pushes all neighbours at once does **not** produce a DFS tree; use the iterator-index template (python-for-ccc.md §3.3).
- **Practice:** 2024 S4 (Hamiltonian path subtask → single cycle → cactus → full).

#### M6.5 Tree DP
- **What:**
  - Root the tree.
  - Keep several states per node (for example influenced-by-parent, neutral, influences-parent).
  - Combine children in post-order and handle leaf and root cases.
- **Why:** 2022 S5 Good Influencers (3-state tree DP in O(N)).
- **Prereqs:** M5.8, M4.11. **Depth:** mastery.
- **Python notes:** Iterative post-order only (the depth reaches 2·10^5 on a path).
- **Practice:** 2022 S5 (path subtask → N ≤ 2000 tree → full).

#### M6.6 Interval DP (O(N^3))
- **What:**
  - `can[i][j]` / `dp[i][j]` over subarrays, from shorter intervals to longer ones.
  - Split points.
  - Two-pointer optimisation of the transition.
- **Why:** 2016 S4 Combining Riceballs (N ≤ 400).
- **Prereqs:** M4.11, M4.3, M4.9. **Depth:** working.
- **Python notes:** Use a flat boolean table and bottom-up loops. About 10^7 operations is fine in PyPy.
- **Practice:** 2016 S4 (N ≤ 10 → N ≤ 50 → full).

#### M6.7 Advanced DP design
- **What:**
  - Multi-dimensional states (position × resources used).
  - DP over events sorted by a key, with deferred updates for equal keys.
  - DP whose transition needs a range maximum (optimised with prefix/suffix maxima, a monotonic deque or a segment tree).
  - "Sticking-out component" shape DP.
- **Why:** 2015 S5 Greedy For Pies (sorted extras + 3D DP), 2014 S5 Lazy Fox (DP over pairs sorted by distance), 2019 S4 Tourism (block DP + range max), 2024 S5 (2-row shape DP, see M7.7).
- **Prereqs:** M4.11, M4.3, M6.11. **Depth:** mastery for recognising DP; working for these harder shapes.
- **Python notes:**
  - These are the **most Python-hostile S4/S5 problems** (w4): 2015 S5, 2014 S5 and 2019 S4 are VERY HARD.
  - Use rolling arrays, packed-int sorting and flat lists (M7.12).
- **Practice:** 2019 S4 (2K ≥ N subtask → K ≤ 100 → full), 2015 S5 (M = 0 → M = 1 → M ≤ 10 → full), 2014 S5 (N ≤ 50 → 200 → 2000).

#### M6.8 Coordinate compression and sweep line
- **What:**
  - Map large coordinates to ranks (`sorted(set(...))` plus a dict or bisect).
  - A 2D difference array on the compressed grid, weighted by real widths and heights.
  - A sweep over sorted events.
- **Why:** 2014 S4 Tinted Glass Window (N ≤ 1000, coordinates ≤ 10^9); also 2021 S3's breakpoint sweep.
- **Prereqs:** M4.3, M4.4, M5.5. **Depth:** working.
- **Python notes:** A 2000×2000 compressed grid is 4·10^6 cells; use a flat list in PyPy.
- **Practice:** 2014 S4 (K ≤ 100 → K ≤ 1000 → full).

#### M6.9 Counting and combinatorics
- **What:**
  - Count instead of enumerating.
  - Complementary counting.
  - C(n, 2) and C(n, 3), products of counts.
  - Sliding a pointer while maintaining a product of counts.
  - Geometric conditions on a circle (all arcs < C/2).
- **Why:** 2022 S4 Good Triplets (O(N + C)), 2015 J5 (partitions), 2017 J5/S3 (pair counting).
- **Prereqs:** M4.3, M4.15, M3.6. **Depth:** mastery for counting; working for combinatorics.
- **Python notes:** `math.comb` exists in 3.8. Python has no overflow.
- **Practice:** 2017 J5/S3 (full), 2022 S4 (N ≤ 200 → C ≤ 6000 → full).

#### M6.10 Fenwick tree (Binary Indexed Tree)
- **What:**
  - Point update and prefix-sum query in O(log N).
  - Counting smaller elements to the left or right (inversions) over compressed values.
- **Why:** 2026 S4 Minecarts (counting smaller elements to the right), 2017 S5 (small-line updates in sqrt decomposition).
- **Prereqs:** M4.3, M2.9. **Depth:** mastery. It is a C.3 template.
- **Python notes:** Inline the loops in the hot path. Size it to the value range (10^6 for 2026 S4).
- **Practice:** a standalone inversion-counting exercise, then 2026 S4 (K = 0 subtasks → full).

#### M6.11 Monotonic stack and deque
- **What:** Next-greater element, sliding-window maximum, and a monotonic queue with a global offset.
- **Why:** 2026 S4 (the feasibility check with an offset deque), 2019 S4 (the range max of the previous window), and 2019 S5 alternatives.
- **Prereqs:** M4.8, M5.3. **Depth:** mastery.
- **Python notes:** Store indices in a `deque`.
- **Practice:** a window-max drill, then 2019 S4 and 2026 S4.

#### M6.12 Doubling and binary lifting on sequences
- **What:** Compute the effect of 2^k steps from the 2^(k−1)-step effect, then decompose T in binary. This is sparse-table-like combining.
- **Why:** 2016 S5 Circle of Life (XOR automaton; state after 2^k steps is x[i−2^k] XOR x[i+2^k]), 2019 S5 (triangle doubling), and M7.3.
- **Prereqs:** M4.15, M4.5. **Depth:** working.
- **Python notes:** A list comprehension per level is fast enough (50 levels × 10^5).
- **Practice:** 2016 S5 (N ≤ 15 cycle detection → N ≤ 4000 → full).

#### M6.13 Memoisation over floor-division blocks
- **What:**
  - The values ⌊n/k⌋ take only O(√n) distinct values.
  - Group k by equal quotient.
  - Memoise a recursion on those values.
- **Why:** 2018 S4 Balanced Trees (N ≤ 10^9).
- **Prereqs:** M4.11, M4.6. **Depth:** working.
- **Python notes:** Use `@lru_cache(maxsize=None)` or a dict. The depth is about log N, so recursion is safe.
- **Practice:** 2018 S4 (N ≤ 1000 → 5·10^4 → 10^6 → full).

---

## Stage 7: Senior S5 and advanced

#### M7.1 Segment tree (iterative, custom merge)
- **What:**
  - A bottom-up array tree of size 2^k, with point update and range query.
  - **Custom monoids** (a pair summary such as (answer, total), or max-plus function composition).
  - A static tree over the value domain.
- **Why:** 2025 S5 To-Do List (a tree over release times 0..10^6 with summary (ans, sum t)), 2021 S5 (range-gcd check), 2019 S4 (range max alternative).
- **Prereqs:** M6.10, M4.3, M7.4. **Depth:** mastery. It is a C.3 template.
- **Python notes:**
  - Use parallel int arrays instead of tuple nodes and inline the combine.
  - 2025 S5 has **19 DMOJ PyPy3 ACs** at a 4 s limit (w4), so it is feasible but tight at the Grader's 3 s.
  - Never use a recursive segment tree.
- **Practice:** a point-update range-sum tree, then a range-max tree, then 2025 S5 (Q ≤ 3000 → insert-only → full).

#### M7.2 Lazy propagation
- **What:** Range updates with deferred tags pushed down on access.
- **Why:** No 2014–2026 S4/S5 strictly required it (w4). It is common at CCO/IOI and a plausible future S5.
- **Prereqs:** M7.1. **Depth:** awareness to working.
- **Python notes:** It is heavy in Python. Prefer difference arrays or offline tricks when they suffice.
- **Practice:** non-CCC range-add/range-sum exercises (the app can author these).

#### M7.3 Sparse table
- **What:** O(N log N) preprocessing for O(1) idempotent range queries (min, max, gcd).
- **Why:** 2021 S5 Math Homework (verifying every range GCD); the doubling ideas in 2019 S5.
- **Prereqs:** M6.12, M4.6. **Depth:** working.
- **Python notes:** Build with list comprehensions level by level. The query uses `bit_length()`, which is available in 3.8.
- **Practice:** 2021 S5 (Z ≤ 2 → Z ≤ 16 small → full).

#### M7.4 Exchange arguments, scheduling and greedy proofs
- **What:**
  - Prove an order is optimal by swapping adjacent out-of-order items.
  - Derive a closed formula once sorted (makespan = max over i of (r_i + suffix sum of t)).
  - Merge "clumps".
- **Why:** 2025 S5 (the official commentary's exchange argument), 2017 S4 (tie-break reasoning), 2025 S3 (the greedy insight), 2026 S4 (greedy gem assignment).
- **Prereqs:** M4.2, M2.2. **Depth:** working.
- **Python notes:** none.
- **Practice:** 2025 S5 subtask 1 (sort and simulate), then subtask 2 (merging clumps with inserts only).

#### M7.5 Probability and expected value
- **What:** Probability of events, conditional reasoning, processing from the back, linearity of expectation, and floating-point tolerance.
- **Why:** 2020 S5 Josh's Double Bacon Deluxe (O(N) from the back; absolute error 1e-6).
- **Prereqs:** M4.11, M1.12. **Depth:** working.
- **Python notes:** Kytabyte reports a Python 15/15 (w4). Print with `"%.9f"`.
- **Practice:** 2020 S5 (N ≤ 10^5, M ≤ 1000 → M ≤ 5000 → full).

#### M7.6 Number theory II
- **What:**
  - Modular arithmetic, `pow(a, b, m)`, the modular inverse `pow(a, -1, m)` (3.8+).
  - Base-k representations.
  - Self-similar sets.
  - Iterating a map on fractions x/N kept as integer numerators, with cycle detection.
  - The lcm/gcd structure of constraints.
- **Why:** 2023 S5 The Filter (the Cantor set; iterate f(r) = 3·min(r, 1−r); prune with 18 filters), 2021 S5 (A_i = lcm of the covering Z values), 2020 S3 (hashing mod arithmetic).
- **Prereqs:** M4.6, M5.2. **Depth:** working.
- **Python notes:**
  - 2023 S5 is **VERY HARD** in Python: up to 10^6 candidates × up to about 130 iterations in the worst case.
  - Use integer numerators, early exits and memoisation.
- **Practice:** 2023 S5 (power of 3 → N ≤ 10^5 → full).

#### M7.7 DP with hash maps (prefix-sum-keyed DP)
- **What:**
  - Transitions of the form "best dp[j] with P[j] == P[i]" (or P[j] == −P[i]).
  - Maintain dict maps from a prefix-sum value to the best dp.
  - Mean-shift so the target sum is 0.
- **Why:** 2024 S5 Chocolate Bar Partition (O(N^2) → O(N) with maps).
- **Prereqs:** M6.7, M4.3, M4.1. **Depth:** working.
- **Python notes:** Scale by N to stay in integers (`N*T − total`). Use `dict.get(key, NEG)`.
- **Practice:** 2024 S5 (N = 2 → N ≤ 8 → … → full).

#### M7.8 2D range-max DP and doubling on shapes
- **What:** The maximum over all K-size sub-shapes by combining overlapping smaller shapes (a size-l triangle from 3 triangles of size about 2l/3), and 2D max structures.
- **Why:** 2019 S5 Triangle: The Data Structure (N ≤ 3000).
- **Prereqs:** M6.12, M7.3. **Depth:** awareness to working.
- **Python notes:** **LIKELY IMPOSSIBLE in Python** at full scale (about 2·10^8 operations). Bank the N ≤ 1000 subtask (4 marks). Kytabyte notes even C++ needed a second version to pass on DMOJ.
- **Practice:** 2019 S5 (N ≤ 1000 subtask only).

#### M7.9 Sqrt decomposition
- **What:** Split into √N blocks or classify items as heavy or light; handle big groups lazily and small groups directly.
- **Why:** 2017 S5 RMT (big vs small subway lines).
- **Prereqs:** M6.10, M2.9. **Depth:** awareness.
- **Python notes:** **VERY HARD / LIKELY IMPOSSIBLE** in Python (the best public Python score is 5/15, per A-stick-bug). Bank the subtasks.
- **Practice:** 2017 S5 (N, Q ≤ 1000 and contiguous-lines subtasks).

#### M7.10 Ad hoc math and geometry optimisation casework
- **What:**
  - Reduce a combinatorial optimisation to a formula over a few parameters (side lengths, distances to the border, budget K).
  - Casework on position and boundaries.
  - Optimise a quadratic in integers.
  - Verify against brute force (M5.2, C.6).
- **Why:** 2026 S5 On the Fence (DMOJ 30 points; nonzero average 1.12/15; **no official or public full solution found**, per w4), 2022 S4 (geometry on a circle), 2025 S1 (layout casework).
- **Prereqs:** M5.2, M4.5, M2.6. **Depth:** working. The ceiling here is unbounded.
- **Python notes:** Once found, the solution is O(1)–O(log) per test, so the language doesn't matter.
- **Practice:** 2026 S5 (K = NM subtask → N, M ≤ 6 brute force → N, M ≤ 40 enumeration). Mark the full solution as an open problem in the app until CEMC publishes a commentary.

#### M7.11 Online algorithms and encrypted input
- **What:**
  - Input decoded with the previous answer (`s = (s' + ans) mod p`) forces answering each query before reading the next.
  - Offline sorting tricks don't apply.
- **Why:** 2025 S5.
- **Prereqs:** M7.1, M3.10. **Depth:** working.
- **Python notes:** You can still read all tokens at once; decode them inside the loop (python-for-ccc.md §2.4).
- **Practice:** 2025 S5 (decode sample 1 by hand, then implement).

#### M7.12 Python constant-factor engineering at scale
- **What:** A performance checklist:
  - `main()` function; read everything at once; join output.
  - Flat 1D arrays; parallel lists instead of tuples; int-encoded keys.
  - Inlined hot helpers; no recursion.
  - Sort packed ints; avoid slicing and copies.
  - Measure with a maximum-size test.
  - Know when to stop and bank partial marks.
- **Why:**
  - Needed for full marks on the PyPy-tight problems: 2025 S5, 2019 S4, 2014 S5, 2015 S5, 2023 S2 (CPython), 2020 S3, 2023 S5.
  - CEMC warns Python may not reach a perfect score (CCC page, 2026).
- **Prereqs:** M2.9, M3.10, M5.7. **Depth:** mastery.
- **Python notes:** python-for-ccc.md §4 and §10.
- **Practice:** optimise a slow but correct 2025 S5 until the maximum-size test runs in under 3 s locally in PyPy3.8.

#### M7.13 LCA and binary lifting on trees (bridge to CCO)
- **What:** Ancestor tables `up[k][v]`, LCA queries, and path aggregates.
- **Why:** No 2014–2026 S4/S5 needed it (w4). It is a common next step and plausible in a future S5.
- **Prereqs:** M5.8, M6.12. **Depth:** awareness.
- **Python notes:** Build `up` iteratively. Memory is about 18·N ints.
- **Practice:** non-CCC exercises authored by the app.

#### M7.14 C++ bridge (optional)
- **What:** Read C++ solutions and, optionally, translate a Python solution to C++ (I/O, vectors, `long long`, `priority_queue`, `set`).
- **Why:**
  - Some S5s are likely impossible in Python (2019 S5, 2017 S5).
  - **The CCO requires C++** (CCC page, 2026).
  - Many community editorials are C++ only.
- **Prereqs:** Stage 6 complete. **Depth:** awareness. This is an optional track, outside the Python goal.
- **Python notes:** n/a.
- **Practice:** read the C++ reference solutions for 2019 S5 and 2017 S5.

---

## Track C: Contest skills (cross-cutting)

#### C.1 CCC rules and integrity
- **What:** The 2026 rules:
  - Internet only for editing, compiling, submitting and **official language docs**.
  - **No generative AI**, including AI inside an IDE.
  - **No prewritten source or starter code**, printed or electronic.
  - Calculators, rough paper and paper dictionaries are allowed.
  - One 3-hour timer covers both divisions, and the maximum of the Junior and Senior scores counts.
  - Don't discuss problems online for 48 hours.
  - Screen recording is strongly recommended for anyone hoping for a CCO invitation.
  - Penalties include disqualification and a ban.
- **Why:** 2025 results were withheld because of cheating (2025CCCResults.pdf), and the 2026 rules tightened.
- **Prereqs:** none. Introduce it in Stage 0. **Depth:** mastery.
- **Python notes:** The allowed docs are docs.python.org/3 (the rules list the Language Reference URL; whether the Library Reference is covered is UNVERIFIED).
- **Practice:** an app quiz on the rules; the mock-contest mode enforces them.

#### C.2 Using the official Python docs under contest conditions
- **What:** Find function signatures fast on docs.python.org (the `heapq`, `bisect`, `collections`, `itertools`, `math` pages), and check the "Added in version" notes.
- **Why:** The docs are the only allowed reference, and the version notes guard the 3.8 boundary.
- **Prereqs:** M1.13. **Depth:** working.
- **Python notes:** Point learners at the **3.8 docs** (docs.python.org/3.8/) to see 3.8 signatures. The rules list `/3/`; UNVERIFIED whether `/3.8/` counts as the same resource.
- **Practice:** timed lookup drills ("find the signature of `heapq.heappushpop`").

#### C.3 Typing templates from memory
- **What:** Drills in typing these from scratch, correctly, with timing:
  - fast I/O;
  - BFS (graph and grid);
  - iterative DFS and post-order;
  - Dijkstra;
  - DSU;
  - Kruskal;
  - binary search on the answer;
  - Fenwick tree;
  - iterative segment tree;
  - sparse table;
  - sieve;
  - prefix and difference arrays;
  - monotonic deque;
  - rolling hash;
  - stress-test harness.
- **Why:** The rules ban prewritten code, so every template must come from memory.
- **Prereqs:** the module that introduces each template. **Depth:** mastery.
- **Python notes:** Use the canonical 3.8-safe versions in python-for-ccc.md §2, §3.3 and §6.5.
- **Practice:** spaced repetition in the app. Suggested targets: fast I/O under 1 minute, BFS under 3, DSU under 3, Dijkstra under 5, Fenwick under 3, segment tree under 8 (estimates).

#### C.4 Subtask and partial-marks strategy
- **What:**
  - Read the subtask table first and map each subtask to an algorithm.
  - Bank brute-force and special-structure subtasks early.
  - Check for decision-only credit (2024 S3).
  - Scores keep the best submission, so partial submissions never hurt.
- **Why:**
  - w3 §4 and w4 give a partial-marks table per problem.
  - Examples: 2026 S4 gives 10 marks from the special K cases; 2025 S5 gives 8 marks without deletions; 2024 S5 gives 5 marks for N ≤ 20.
- **Prereqs:** M2.1, M2.9. **Depth:** mastery.
- **Python notes:** If a correct full solution TLEs only on the last subtask, stop after a bounded optimisation effort (M7.12).
- **Practice:** "partials-only" drills: 20 minutes per S3–S5 problem, maximising banked marks.

#### C.5 Time management over 3 hours
- **What:**
  - A suggested plan: S1–S2 in 30–45 minutes; S3 full or partial by about 90 minutes; S4 partials, then full; S5 subtasks last.
  - Keep 10 minutes of buffer and **submit well before the end** (rules: late submissions are risky).
  - Rules for when to abandon a problem.
  - Remember the Grader logs you out after about 10 minutes idle while the timer keeps running.
- **Why:**
  - Senior averages drop steeply from S1 to S5.
  - The 2026 S1 average was only 7.69, so don't assume S1 is quick.
- **Prereqs:** C.4. **Depth:** mastery.
- **Python notes:** none.
- **Practice:** timed mock contests (C.9).

#### C.6 Stress testing against a brute force
- **What:**
  - Write `brute.py`, `fast.py` and `gen.py` (random small inputs with a seed).
  - Loop until the outputs differ, then minimise the failing case.
  - Write a **checker** for "any valid answer" problems.
- **Why:** An essential habit for S3–S5 (w3 technique 27). It is how greedy and constructive insights are verified: 2022 S3, 2023 S3, 2024 S3, 2025 S3, 2026 S1, 2026 S3.
- **Prereqs:** M2.5, M2.7, M0.3. **Depth:** mastery. It is a C.3 template.
- **Python notes:** A 10-line shell or Python loop with `subprocess`. It is allowed in contest because you write it during the contest.
- **Practice:** stress-test a deliberately buggy 2020 S1 or 2026 S1 solution.

#### C.7 Reading Grader feedback and submission discipline
- **What:**
  - Interpret per-test verdicts and skipped tests.
  - Diagnose TLE, RTE and WA.
  - One submission per minute per problem, 50 maximum.
  - Pick the right language (Python 3, not Python 2).
  - Use valid file names.
- **Why:** rules.pdf and directions.pdf (2024–2026).
- **Prereqs:** M0.5, M0.7. **Depth:** mastery.
- **Python notes:** An RTE on large tests is often deep recursion or memory; a TLE is often I/O or O(N^2).
- **Practice:** diagnose-the-verdict exercises in the app.

#### C.8 Output edge cases and special checkers
- **What:**
  - "Any valid answer" (special checker).
  - Float tolerance (2020 S1, 2020 S5).
  - Half marks for the first line (2024 S3).
  - `IMPOSSIBLE`/`-1`/`NO` spellings.
  - 1-indexed output (2026 S3).
  - No trailing spaces (2026 S3 community report).
- **Why:** Constructive S3s dominate recently (w3).
- **Prereqs:** M1.11, M5.1. **Depth:** mastery.
- **Python notes:** Use `" ".join`, never `print(*x, end=" ")` loops.
- **Practice:** 2023 S3, 2024 S3, 2026 S3 output drills.

#### C.9 Mock contests and upsolving
- **What:**
  - Full 3-hour past papers under enforced rules (no AI, no web, no templates, docs only).
  - Upsolve afterwards using the CEMC commentaries (2022–2025 Senior; 2022–2026 Junior).
  - Keep an error log.
- **Why:** This transfers the skills to contest conditions.
- **Prereqs:** Stage 3 for Junior mocks; Stage 5+ for Senior mocks. **Depth:** mastery.
- **Python notes:** Grade with PyPy3.8 locally, or on DMOJ with PYPY3 plus the 3.8 lint.
- **Practice order:** Senior papers from 2017 onward, then 2014–2016, then the most recent last (2024, 2025, 2026).

#### C.10 Local judging with official test data
- **What:** Download a CEMC `<Y>CCCSeniorTestData.zip`, run every input with a timeout, and diff against the expected outputs.
- **Why:** An offline check that mirrors the Grader's per-subtask feedback. The zips are on the past-contests page (2016–2026 for Senior, per w2 and w4).
- **Prereqs:** M0.3, M2.7. **Depth:** working.
- **Python notes:** Use `timeout 3 pypy3 sol.py < in > out` to mimic the 3 s limit (a local machine is not the Grader, so treat it as indicative).
- **Practice:** run a 2026 S2 solution against the full test data.

---

## Prerequisite dependency summary

### Adjacency list (module ← prerequisites)

```
M0.1 ← -          M0.2 ← M0.1       M0.3 ← M0.2       M0.4 ← M0.1
M0.5 ← M0.4       M0.6 ← M0.2       M0.7 ← M0.5
M1.1 ← M0.4       M1.2 ← M1.1       M1.3 ← M1.1       M1.4 ← M1.2
M1.5 ← M1.4       M1.6 ← M1.5       M1.7 ← M1.5       M1.8 ← M1.5
M1.9 ← M1.8       M1.10 ← M1.8      M1.11 ← M1.7      M1.12 ← M1.2
M1.13 ← M1.10     M1.14 ← M1.10     M1.15 ← M1.13
M2.1 ← M0.5       M2.2 ← M2.1       M2.3 ← M1.6,M1.8  M2.4 ← M1.5
M2.5 ← M1.8,M1.13 M2.6 ← M2.2       M2.7 ← M0.3,M2.6  M2.8 ← M0.6,M2.7
M2.9 ← M2.5
M3.1 ← M1.4,M1.11 M3.2 ← M1.6,M2.4  M3.3 ← M1.7,M2.4  M3.4 ← M3.3
M3.5 ← M1.9       M3.6 ← M1.8,M1.9  M3.7 ← M1.8       M3.8 ← M1.2,M2.3
M3.9 ← M2.9       M3.10 ← M1.3,M1.11
M4.1 ← M1.9,M2.9  M4.2 ← M1.8,M2.4  M4.3 ← M1.8,M2.9  M4.4 ← M4.3
M4.5 ← M2.3,M2.6  M4.6 ← M1.2,M2.5  M4.7 ← M3.7       M4.8 ← M1.8
M4.9 ← M3.9       M4.10 ← M1.14,M2.5 M4.11 ← M1.14,M2.5 M4.12 ← M1.8,M1.9
M4.13 ← M4.8,M4.12 M4.14 ← M3.4,M3.8 M4.15 ← M1.2,M1.8
M5.1 ← M2.5,M2.6,M4.5  M5.2 ← M2.5,M1.10  M5.3 ← M3.6,M4.9
M5.4 ← M5.3,M4.1,M4.6  M5.5 ← M4.2,M2.9  M5.6 ← M5.5,M4.2  M5.7 ← M4.13,M1.14
M5.8 ← M4.13,M5.7 M5.9 ← M4.13      M5.10 ← M1.8,M1.10 M5.11 ← M4.1,M4.2
M5.12 ← M4.11     M5.13 ← M1.13,M4.6
M6.1 ← M4.12,M5.11 M6.2 ← M6.1,M4.2 M6.3 ← M5.10,M4.2 M6.4 ← M5.7
M6.5 ← M5.8,M4.11 M6.6 ← M4.11,M4.3,M4.9 M6.7 ← M4.11,M4.3,M6.11
M6.8 ← M4.3,M4.4,M5.5 M6.9 ← M4.3,M4.15,M3.6 M6.10 ← M4.3,M2.9
M6.11 ← M4.8,M5.3 M6.12 ← M4.15,M4.5 M6.13 ← M4.11,M4.6
M7.1 ← M6.10,M4.3,M7.4 M7.2 ← M7.1 M7.3 ← M6.12,M4.6 M7.4 ← M4.2,M2.2
M7.5 ← M4.11,M1.12 M7.6 ← M4.6,M5.2 M7.7 ← M6.7,M4.3,M4.1
M7.8 ← M6.12,M7.3 M7.9 ← M6.10,M2.9 M7.10 ← M5.2,M4.5,M2.6
M7.11 ← M7.1,M3.10 M7.12 ← M2.9,M3.10,M5.7 M7.13 ← M5.8,M6.12 M7.14 ← Stage 6
C.1 ← -   C.2 ← M1.13   C.3 ← (each template's module)   C.4 ← M2.1,M2.9
C.5 ← C.4 C.6 ← M2.5,M2.7,M0.3   C.7 ← M0.5,M0.7   C.8 ← M1.11,M5.1
C.9 ← Stage 3 (Jr) / Stage 5 (Sr)   C.10 ← M0.3,M2.7
```

### Mermaid graph (key technique chains)

```mermaid
graph TD
  S0[Stage 0 Tooling] --> S1[Stage 1 Python 3.8]
  S1 --> S2[Stage 2 Problem solving]
  S2 --> S3[Stage 3 J1-J3]
  S3 --> S4[Stage 4 J4-J5 / S1-S2]
  S4 --> S5[Stage 5 S3]
  S5 --> S6[Stage 6 S4]
  S6 --> S7[Stage 7 S5]

  M1_14[M1.14 Recursion] --> M4_10[M4.10 Backtracking]
  M1_14 --> M4_11[M4.11 Memo/DP]
  M4_11 --> M5_12[M5.12 O(N^2) interval DP]
  M4_11 --> M6_5[M6.5 Tree DP]
  M4_11 --> M6_6[M6.6 Interval DP]
  M4_11 --> M6_7[M6.7 Advanced DP]
  M6_7 --> M7_7[M7.7 DP + hashmap]

  M4_8[M4.8 Stack/Queue] --> M4_13[M4.13 BFS]
  M4_12[M4.12 Graph modelling] --> M4_13
  M4_13 --> M5_7[M5.7 Iterative DFS]
  M4_13 --> M5_9[M5.9 BFS variants]
  M5_7 --> M5_8[M5.8 Trees]
  M5_7 --> M6_4[M6.4 DFS tree]
  M5_8 --> M6_5
  M5_11[M5.11 Heaps + lazy deletion] --> M6_1[M6.1 Dijkstra]
  M4_12 --> M6_1
  M6_1 --> M6_2[M6.2 State-space modelling]
  M5_10[M5.10 DSU] --> M6_3[M6.3 Kruskal MST]

  M4_3[M4.3 Prefix sums] --> M4_4[M4.4 Difference arrays]
  M4_3 --> M6_10[M6.10 Fenwick]
  M6_10 --> M7_1[M7.1 Segment tree]
  M7_4[M7.4 Exchange arguments] --> M7_1
  M7_1 --> M7_2[M7.2 Lazy propagation]
  M7_1 --> M7_11[M7.11 Online / encrypted]
  M4_15[M4.15 Circular] --> M6_12[M6.12 Doubling]
  M6_12 --> M7_3[M7.3 Sparse table]
  M7_3 --> M7_8[M7.8 2D doubling]

  M4_2[M4.2 Sorting + greedy] --> M5_5[M5.5 Binary search]
  M5_5 --> M5_6[M5.6 Ternary / slope sweep]
  M3_6[M3.6 Frequency] --> M5_3[M5.3 Sliding window]
  M5_3 --> M5_4[M5.4 Rolling hash]
  M5_3 --> M6_11[M6.11 Monotonic deque]
  M6_11 --> M6_7

  M2_5[M2.5 Brute force] --> M5_2[M5.2 Pattern discovery]
  M4_5[M4.5 Math insight] --> M5_1[M5.1 Constructive]
  M5_2 --> M7_10[M7.10 Ad hoc math S5]
  M4_6[M4.6 Number theory I] --> M7_6[M7.6 Number theory II]
  M2_5 --> C6[C.6 Stress testing]
```

---

## Coverage matrix: 2019–2026 Senior S1–S5 → modules

Base modules M0.x, M1.1–M1.11 and M2.1–M2.9 are assumed for every problem and not repeated. "(P)" marks modules needed only for partial subtasks.

| Problem | Core full-mark modules | Supporting / partial modules | Python status (from w3/w4) |
|---|---|---|---|
| 2019 S1 Flipper (=J4) | M4.5, M3.3 | M2.3 (P) | trivial |
| 2019 S2 Pretty Average Primes | M4.6 (sieve) | M2.5 (P) | fine with a `bytearray` sieve |
| 2019 S3 Arithmetic Square | M5.1, M2.6, M4.6 (parity) | M5.2, M2.5 (P: small values) | fine |
| 2019 S4 Tourism | M6.7, M6.11 or M7.1, M4.3 (prefix/suffix max), M3.10 | M4.11 (P: O(NK)) | VERY HARD (N = 10^6) |
| 2019 S5 Triangle: The Data Structure | M7.8, M6.12, M7.3, M7.12, M3.10 | M2.5 (P: N ≤ 1000) | LIKELY IMPOSSIBLE; bank 4 marks |
| 2020 S1 Surmising a Sprinter's Speed | M4.2, M1.12 | – | fine |
| 2020 S2 Escape Room (=J5) | M4.12, M4.13, M4.1, M3.10, M5.9 (reverse) | M4.6 (P: divisors) | PyPy advisable |
| 2020 S3 Searching for Strings | M5.3, M5.4, M4.1, M3.6 | M2.5 (P: permutations + set) | tight (DMOJ 0.5 s); PyPy |
| 2020 S4 Swapping Seats | M4.15, M4.3, M3.9, M3.10 | M2.5 (P) | FEASIBLE-PyPy (probable) |
| 2020 S5 Josh's Double Bacon Deluxe | M7.5, M1.12, M3.10 | M4.11 (P) | feasible (Python 15/15 reported) |
| 2021 S1 Crazy Fencing | M1.12, M1.11 | – | trivial |
| 2021 S2 Modern Art (=J5) | M4.5, M3.10 | M2.3 (P) | fine |
| 2021 S3 Lunch Concert | M5.6, M5.5, M4.2, M4.3 | M2.5 (P: try every c) | prefer the sweep; PyPy |
| 2021 S4 Daily Commute | M5.9, M5.11, M4.12, M3.10 | M6.1 (P: per-day search) | FEASIBLE-PyPy |
| 2021 S5 Math Homework | M4.4, M4.6, M7.3 or M7.1, M1.15 (no `math.lcm`) | – | FEASIBLE-PyPy |
| 2022 S1 Good Fours and Good Fives | M4.6, M2.5 | – | trivial |
| 2022 S2 Group Work (=J4) | M4.1 | – | trivial |
| 2022 S3 Good Samples | M5.1, M5.3, M1.12 (K ≤ 10^18), M3.10 (output) | M2.5 (P: 2^16), M5.2 | fine |
| 2022 S4 Good Triplets | M6.9, M4.3, M4.15, M3.10 | M2.5 (P: O(N^3)) | FEASIBLE-PyPy |
| 2022 S5 Good Influencers | M6.5, M5.8, M5.7, M4.11 | M4.11 (P: line DP) | FEASIBLE-PyPy (iterative) |
| 2023 S1 Trianglane (=J4) | M3.7, M4.5, M3.9 | – | trivial if linear |
| 2023 S2 Symmetric Mountains | M5.12, M7.12 | M2.5 (P: O(N^3)) | PyPy fine; CPython risky |
| 2023 S3 Palindromic Poster | M5.1, M3.7, M2.6, C.8 | M2.5 (P: 2×2) | fine |
| 2023 S4 Minimum Cost Roads | M6.1, M6.2, M6.3, M5.10 | M6.3 (P: subtask 1) | FEASIBLE-PyPy / hard |
| 2023 S5 The Filter | M7.6, M4.5, M5.2, M7.12, M3.10 (output) | M4.14 (P: powers of 3) | VERY HARD |
| 2024 S1 Hat Circle | M4.15, M3.10 | – | trivial (fast input) |
| 2024 S2 Heavy-Light Composition | M3.6, M3.3 | – | trivial |
| 2024 S3 Swipe | M4.9, M5.1, C.8 (half marks) | M4.13 (P: BFS over arrays, N ≤ 8) | fine |
| 2024 S4 Painting Roads | M6.4, M5.7, M4.12 | M4.13 (P: path/cycle), M5.8 | FEASIBLE (iterative DFS) |
| 2024 S5 Chocolate Bar Partition | M7.7, M6.7, M4.3, M1.12 | M2.5 (P: N ≤ 8), M4.11 | FEASIBLE-PyPy (probable) |
| 2025 S1 Positioning Peter's Paintings | M4.5, M2.6 | – | trivial |
| 2025 S2 Cryptogram Cracking Club | M4.14, M3.4, M4.6 (mod) | – | fine |
| 2025 S3 Pretty Pens | M5.11, M4.1, M4.2, M7.4 (greedy insight) | M4.2 (P: Q = 0 greedy) | feasible; heavy implementation |
| 2025 S4 Floor is Lava | M6.1, M6.2, M4.2 | M5.8 (P: tree path) | FEASIBLE-PyPy |
| 2025 S5 To-Do List | M7.1, M7.4, M7.11, M7.12, M3.10 | M7.4 (P: sort + simulate; insert-only clumps) | FEASIBLE-PyPy (19 DMOJ PyPy3 ACs) |
| 2026 S1 Baby Hop, Giant Hop | M4.6, M2.6, M1.12 | M4.13 (P / checker: BFS), C.6 | fine |
| 2026 S2 Beams of Light (=J5) | M4.4, M3.10 | M2.5 (P) | fine with fast I/O |
| 2026 S3 Common Card Choice | M4.6 (parity/gcd), M5.1, M5.13, C.8 | M2.5 (P: N ≤ 10) | fine |
| 2026 S4 Minecarts | M6.10, M5.5, M6.11, M4.2, M4.8 (stack sorting) | M2.5 (P: N ≤ 5000 O(N^2)) | FEASIBLE-PyPy (probable) |
| 2026 S5 On the Fence | M7.10, M5.2 | M2.5 (P: N, M ≤ 6), M4.13 (P: flood fill to check "inside") | full solution unknown; math-bound |

### Sanity check: modules not exercised by 2019–2026 Senior

These are kept because earlier or Junior problems use them, or they are plausible future topics:

| Module | Used by |
|---|---|
| M3.8 | 2016 J4, 2017 J4 |
| M4.7 | 2018 S2 |
| M4.10 | 2019 J5; partials of 2024 S3 and 2026 S5 |
| M6.6 | 2016 S4 |
| M6.8 | 2014 S4 |
| M6.12 | 2016 S5, 2019 S5 |
| M6.13 | 2018 S4 |
| M7.2 | future-proofing |
| M7.9 | 2017 S5 |
| M7.13 | CCO bridge |
| M7.14 | optional |

Every other module appears at least once in the matrix above.

### Junior 2019–2026 quick coverage (on-ramp check)

| Year | J1 | J2 | J3 | J4 | J5 |
|---|---|---|---|---|---|
| 2019 | M3.1 | M3.2, M1.7 | M3.3 | = S1 | M4.10 |
| 2020 | M3.1 | M1.6 | M1.3, M2.4 | M2.5, M1.7 | = S2 |
| 2021 | M3.1, M2.6 | M2.4 | M1.6, M3.4 | M4.2, M4.5 | = S2 |
| 2022 | M3.1 | M3.2 | M3.4 | = S2 | M4.10, M2.5 |
| 2023 | M3.1 | M3.5 | M3.6, M1.11 | = S1 | M3.7, M2.5 |
| 2024 | M3.1 | M1.6 | M3.6, M3.9 | M4.1, M2.6 | M4.13 |
| 2025 | M3.1 | M3.2 | M3.4 | M3.3, M3.9 | M4.11 (13/15 likely the Python ceiling) |
| 2026 | M3.1 | M1.8 | M4.9, M3.9, M3.5 | M4.1, M3.7 | = S2 (M4.4) |

---

## Python-infeasible or edge items, and how the curriculum should handle them

| Item | Evidence | How to handle it |
|---|---|---|
| 2019 S5 Triangle (full) | about 2·10^8 operations; no known Python full solution; even C++ needed a v2 on DMOJ (w4) | Teach M7.8 at awareness level. Practise **only the N ≤ 1000 subtask (4 marks)**. Show the C++ reference as reading material (M7.14). Label it "not achievable in Python" in the app. |
| 2017 S5 RMT (full) | best public Python 5/15; sqrt decomposition (w4) | Awareness of M7.9 only. Bank the subtasks. |
| 2019 S4, 2014 S5, 2015 S5 | VERY HARD in Python; authors report 5/15, 9/15, 10/15 (w4) | Treat them as M7.12 optimisation labs. Set a target score per problem and don't require 15/15. |
| 2023 S5 The Filter | VERY HARD (up to 10^6 × 130 iterations worst case) | Teach the math (M7.6). Ask for 7/15 as the baseline and full marks as a stretch. |
| 2025 S5 To-Do List | feasible but tight: 19 DMOJ PyPy3 ACs at 4 s; the Grader has 3 s | Use it as the flagship M7.12 exercise. Require the local max-test to finish in under 2.5 s. |
| 2023 S2, 2020 S3, 2021 S3, 2020 S2 | CPython-risky; PyPy fine (w3) | Always test in PyPy3.8. Teach why CPython is slower. |
| 2025 J5 last subtask | about 4·10^8 updates; likely infeasible (w2) | Aim for 13/15 and explain CEMC's language warning. |
| 2019 J5 last mark | UNVERIFIED in pure Python (w2) | Treat it as a stretch goal. |
| 2026 S5 full | no official or public full solution yet (w4) | Present the subtasks. Mark the full solution "open". Re-check the CEMC past-contests page for a 2026 Senior commentary before authoring this lesson. |
| Deep recursion | PyPy stack about 1400 calls by default; the threading trick is UNVERIFIED on the Grader | Teach iterative traversal as the default (M5.7). Allow recursion only when the depth is ≤ about 10^3 or about log N. |
| 3.9+ features | the Grader is Python 3.8.13 | Enforce with an app linter (a vermin-like check), and explain why in M1.15. |
| Per-problem interpreter switches | 2026 J4 ran CPython 3.10.12 (w2, W1) | Teach M2.1: always read "Technical Notes". Write 3.8-safe code regardless. |
| No ordered set / BBST in the stdlib | 2025 S3 | Heaps with lazy deletion (M5.11); a Fenwick tree over a compressed domain (M6.10) for order statistics. |
| DMOJ vs Grader differences | DMOJ limits (0.5–7 s) and newer Pythons | Practise on DMOJ with PYPY3 plus the 3.8 lint, and double-check against local PyPy3.8 7.3.9 timing. |
| A perfect 75 in general | 0 official perfect scores in 2026; CEMC says Python may not reach a perfect score | Set milestone goals in the app (distinction about 26–34, CCO about 50–60, 75 stretch). Keep M7.14 (C++) available. |

---

## Suggested pacing (ESTIMATE)

These are **estimates** for a motivated learner starting from zero, including practice time. They are not researched facts; calibrate them with real learner data later.

| Stage | Hours (estimate) | Cumulative | Milestone |
|---|---|---|---|
| 0 Orientation and tooling | 5–10 | 5–10 | Submits a J1 on DMOJ and runs official test data locally |
| 1 Python fundamentals | 40–60 | 45–70 | Solves all J1 and most J2 |
| 2 Problem-solving foundations | 20–30 | 65–100 | Explains the target complexity for any subtask table |
| 3 Junior J1–J3 | 30–45 | 95–145 | Full marks on J1–J3 across 2014–2026 |
| 4 J4–J5 / S1–S2 | 70–100 | 165–245 | About 75 Junior; S1+S2 = 30 reliably |
| 5 Senior S3 | 90–130 | 255–375 | S3 full on at least half of 2016–2026; partials always |
| 6 Senior S4 | 110–160 | 365–535 | S4 full on most feasible problems; mocks about 55–65 |
| 7 Senior S5 / advanced | 130–220+ | 495–755+ | S5 full on feasible ones; mocks 65+ |
| C Contest track | 40–70, interleaved (not additive in the calendar) | – | About 8–12 full mock contests completed |

- **Total:** about 500–800 hours. That is roughly 12–20 months at 8–10 hours per week.
- **Roughly 40–50% of each stage should be problem practice**, not lessons.
- Spaced repetition for C.3 templates: about 10 minutes a day from Stage 4 onward.

---

## Notes for the lesson-building agent

1. Key every lesson, exercise, hint and progress record to the module IDs above. Where a lesson needs more granularity, add sub-IDs such as `M5.4a`, `M5.4b`.
2. For each practice problem, the app needs:
   - the statement (link to CEMC or rewrite; **do not copy verbatim at scale**, and check licensing in a later phase);
   - the subtask table;
   - the official test data;
   - a reference solution **verified in PyPy3.8 7.3.9**.
3. Build graded ladders per problem that mirror the subtask tables (brute force → intermediate → full). Stage 5+ lessons should always start with "bank the partials".
4. Enforce the Python 3.8 boundary in the in-app runner (Pyodide is CPython 3.14). A vermin-style AST check is one option (UNVERIFIED whether vermin itself runs under Pyodide; it is pure Python).
5. The open items to recheck before authoring are:
   - 2026 S5 full solution and the 2026 Senior commentary;
   - DMOJ Python/PyPy AC counts, which were blocked in this session;
   - whether the CCC 2027 Grader upgrades from PyPy3 7.3.9.
