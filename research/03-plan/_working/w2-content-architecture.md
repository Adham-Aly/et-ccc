# W2: Content architecture proposal

Phase 2 (Implementation plan), worker W2. Written 2026-09-23. Audience: the planning orchestrator and the agents who will build and write the app content. The content spec is still `research/01-recon/curriculum-map.md`. This file covers how that spec becomes lessons, exercises, data files and quality gates, and it avoids copying the spec.

Summary of recommendations:

1. **Everything checkable is derived, never typed.** Judge URLs come from the problem registry. Expected outputs, trace tables and constraint tables are generated at build time by running code. Prose never hand-types a URL, an expected output or a subtask bound.
2. **Content is data plus MDX.** Each lesson is one MDX file of prose and block components. Each exercise is a YAML file validated by a schema, and its Python lives in real `.py` files that CI can lint and run.
3. **Pedagogy fades across stages.** Stages 0 and 1 follow PRIMM with subgoal-labelled worked examples, predict-the-output, Parsons problems, trace tables and completion problems. From Stage 5 on, lessons put the problem first: bank the partials, climb a hint ladder, read the editorial, do a Python speed pass, then solve it again from memory later.
4. **In-app tests check correctness and complexity class. The external judge checks real speed.** Browser tests are sized so the right algorithm passes easily in browser CPython and the wrong complexity class fails by orders of magnitude. The app shows no scores or targets. It says where exact timing gets checked: WMOJ/DMOJ as PyPy3, or local PyPy 3.8.
5. **Guided but never locked.** A "recommended next" path, soft prerequisite warnings, mastery checkpoints, a Leitner review queue, and local-first versioned progress with export and import.
6. **Volume**: about 233 lessons, 119 CCC problem pages, about 1,230 graded items and roughly 490k words of prose (details in section 5). The batching unit is one module per worker task, plus problem pages in batches of 3 to 5.

---

## 1. Curriculum digest

### 1.1 Stages and module counts

| Stage | Name | Modules | IDs | Depth mix (from the map) |
|---|---|---|---|---|
| 0 | Orientation and tooling | 7 | M0.1–M0.7 | working/mastery |
| 1 | Python fundamentals (3.8 only) | 15 | M1.1–M1.15 | almost all mastery |
| 2 | Problem-solving foundations | 9 | M2.1–M2.9 | mastery |
| 3 | Junior J1–J3 | 10 | M3.1–M3.10 | mastery (M3.8 working) |
| 4 | Junior J4–J5 / Senior S1–S2 | 15 | M4.1–M4.15 | mostly mastery; M4.7, M4.10, M4.14 working |
| 5 | Senior S3 | 13 | M5.1–M5.13 | mostly mastery; M5.4, M5.6, M5.13 working |
| 6 | Senior S4 | 13 | M6.1–M6.13 | mixed; M6.4, M6.6, M6.8, M6.12, M6.13 working |
| 7 | Senior S5 / advanced | 14 | M7.1–M7.14 | mostly working/awareness; M7.1, M7.12 mastery |
| C | Contest skills (cross-cutting) | 10 | C.1–C.10 | mostly mastery |
| **Total** | | **106** | | |

**Count discrepancy to resolve:** D-007 says 105 modules, but the map defines 106 headings. The likely explanation is that M7.14 (C++ bridge, "optional track, outside the Python goal") was left out of the count. Recommendation: keep M7.14 as an optional, reading-only module. Its C++ code blocks are exempt from the Python lints and are tagged `lang: cpp`.

### 1.2 Dependency structure

- The map gives a full adjacency list (module ← prerequisites). It is a DAG. The build should load it into `content/course.yaml` as each module's `prereqs` field, then assert acyclicity and that every prerequisite sits in the same or an earlier stage. One exception: `C.9 ← Stage 3 (Jr) / Stage 5 (Sr)` is a stage-level prerequisite, so the schema needs a `prereqStages` field.
- Main technique chains, which pedagogy and the lint both need to know:
  - recursion (M1.14) → backtracking (M4.10) / memo-DP (M4.11) → interval, tree and advanced DP (M5.12, M6.5–M6.7) → DP with hashmap (M7.7)
  - stack/queue (M4.8) + graph modelling (M4.12) → BFS (M4.13) → iterative DFS (M5.7) → trees (M5.8) → DFS tree (M6.4) / tree DP (M6.5)
  - heaps (M5.11) → Dijkstra (M6.1) → state-space modelling (M6.2); DSU (M5.10) → Kruskal (M6.3)
  - prefix sums (M4.3) → difference arrays (M4.4) and Fenwick (M6.10) → segment tree (M7.1) → lazy propagation (M7.2) / online (M7.11)
  - frequency (M3.6) → sliding window (M5.3) → rolling hash (M5.4) / monotonic deque (M6.11)
  - brute force (M2.5) → pattern discovery (M5.2) → ad hoc math S5 (M7.10); brute force → stress testing (C.6)
- M7.1 depends on M7.4 (exchange arguments), so M7.4 must come before M7.1 in the Stage 7 ordering even though its number is higher. **Course order is set in `course.yaml`, not by ID number.**

### 1.3 Contest-skills track placement

| Main stage | Contest modules inserted |
|---|---|
| 0 | C.1 (rules and integrity) |
| 2 | C.2 (Python docs), C.10 (local judging) |
| 3 | C.4 (subtasks and partial marks), C.6 (stress testing) |
| 4 | C.3 (templates from memory; the spaced drills start here), C.7 (reading verdicts) |
| 5+ | C.5 (time management), C.8 (output edge cases), C.9 (mock contests), all ongoing |

In the app, C modules sit inside the stage where they are introduced, listed after that stage's main modules. They keep their `C.x` IDs. C.3 is a standing drill system (section 4.4) rather than lessons you finish once.

### 1.4 What the build must take from "Notes for the lesson-building agent"

1. Key every lesson, exercise, hint and progress record to module IDs. Sub-IDs like `M5.4a` are allowed. (Section 3 uses slugged lesson IDs under the module ID.)
2. Each practice problem needs a statement (link plus paraphrase, never verbatim), the subtask table, test data, and a reference solution verified in PyPy3.8 7.3.9.
3. Build graded ladders that mirror subtask tables (brute force → intermediate → full). Stage 5+ lessons start with "bank the partials".
4. Enforce the 3.8 boundary in the runner (W1's area) and in CI (section 7).
5. Recheck before authoring: whether a 2026 Senior commentary exists (S1, S3, S4 and S5 currently rely on community sources), DMOJ PyPy AC counts, and whether the CCC 2027 Grader moves off PyPy3 7.3.9.

### 1.5 Recon material that must not leak into app content

Recon files are written for agents. Several passages break R14/D-006 and **must not be carried into lessons**. Every content worker prompt should list them:

- The map's stage overview "Contest payoff" column (for example "about 45/75 Junior").
- The "Suggested pacing" milestones that contain scores ("mocks 65+").
- Per-module lines such as M4.11 "to 13/15", M7.8 "LIKELY IMPOSSIBLE in Python", M7.9 "VERY HARD / LIKELY IMPOSSIBLE", and the whole "Python-infeasible or edge items" table ("Label it 'not achievable in Python'", "Set a target score per problem", "Ask for 7/15 as the baseline").
- `past-problems-analysis.md` §2.3 averages and §2.5 "Realistic score targets by stage".
- `ccc-format-and-rules.md` §7 cutoffs (Distinction, honour roll, CCO line) and §8 item 1 and item 10.
- The C.3 time goals ("fast I/O under 1 minute"). These are not score targets, but they are expected results. Show only the learner's personal best (section 4.4).

How to handle the Python-hard problems without that framing: the problem page's ladder contains only the rungs that have a verified reference solution. The last rung is either "all subtasks" or an **extension** section that explains the full algorithm, with no claim either way about what Python can reach. Feasibility notes stay in an `internal` block of the registry, which the renderer never reads and a lint enforces.

### 1.6 Stage 0 corrections needed from the map

- M0.7 and the M0.3–M0.5 practice lines say "submit on DMOJ" for 2021–2024 problems. Under R13, 2020–2026 practice goes to **WMOJ**. M0.7 must teach **both** judges: WMOJ for 2020–2026 and DMOJ before 2020, including account creation and picking a PyPy3 language on each. Whether WMOJ offers PyPy3, and which version, is **unverified** and belongs to W4.
- Local tooling (M0.2's PyPy install, M0.3's terminal) is a heavy start for someone at absolute zero, and the in-browser runner covers Stages 0 and 1. Recommendation: keep the module IDs and order but mark the local-setup lessons `deferrable: true`, so the path offers them again at the start of Stage 2, where M2.7 and C.10 need them. This is a presentation change and does not change the curriculum.

---

## 2. Pedagogy: from absolute zero to S5

### 2.1 Evidence base (short)

- **Read and trace before you write.** Tracing and "explain in plain English" skills correlate with, and appear to come before, code-writing skill (Lopez, Whalley, Robbins & Lister 2008; Lister et al. 2009).
- **PRIMM** (Predict, Run, Investigate, Modify, Make) was trialled with about 500 students aged 11 to 14 and gives a lesson shape that starts from reading working code (Sentance, Waite & Kallia 2019).
- **Worked examples help novices, and fading them helps the move to problem solving.** Their advantage reverses as expertise grows (the expertise reversal effect; Kalyuga et al.; Renkl & Atkinson; Salden et al. 2010).
- **Subgoal labels** in worked examples improved novel problem solving and were linked to lower withdrawal and failure rates in CS1 (Margulieux, Morrison & Decker 2020).
- **Parsons problems** gave the same learning as writing or fixing code in less time (Ericson, Margulieux & Rick 2017). Distractors lower efficiency (Harms et al. 2016). When distractors are used, pairing each one with its correct line lowers extraneous load (Denny et al. 2008). A 2024 ICER study found distractors pull attention to code details. Conclusion: no distractors at first, then paired distractors.
- **Enhanced error messages** reduced errors and repeated errors for novices (Becker et al. 2016).
- **Mastery learning** gave an average effect of about 0.48 SD, and stricter mastery thresholds did better (Kulik, Kulik & Bangert-Drowns 1990).
- **Hints:** learners who click straight through to the bottom-out hint learn less, and help-seeking behaviour explains a lot of the variance in learning gains (Aleven, Koedinger, Roll et al.). So hints come in tiers, and the full solution needs an attempt first.
- **Spacing and retrieval:** strong lab evidence, but in real STEM courses spaced quizzing gave clear gains in only some courses (a 2024 set of single-paper meta-analyses). Conclusion: keep the review queue short and cheap, and rely mostly on cumulative checkpoints.
- **Competitive-programming practice norms:** solve volume at your level, upsolve every problem you couldn't finish, implement a solution after reading it, and run timed mocks (USACO Guide, "How to Practice").

### 2.2 Lesson shape by stage

| Stages | Dominant shape | Block mix per lesson | Scaffolding |
|---|---|---|---|
| 0–1 | **PRIMM micro-cycles.** One new idea per section: subgoal-labelled worked example → predict-the-output → run → investigate (trace table or "change one thing" MCQ) → modify → make (small code exercise) | ~5 micro-items (predict, MCQ, Parsons, trace, fill-in) + ~3 code exercises | Maximum. Parsons without distractors first, then paired distractors. Completion problems with fewer blanks each time (faded examples). A friendly error explainer in the runner. Targeted feedback for known wrong outputs ("you printed 5.0, not 5"). |
| 2–3 | **Guided problem solving.** An explicit process with fixed subgoal labels: *Read → Find the bounds → Work the sample by hand → Plan in plain words → Code → Test edge cases → Submit.* Every J1–J3 walkthrough is a "guided solve" with a checkpoint at each subgoal | 1–2 worked problems, then faded problems, then 2–3 independent ones; CCC callouts | Still high but fading. Parsons only for new patterns. Tracing moves to loops and accumulators. The fast I/O skeleton (M3.10) becomes the house default. |
| 4 | **Technique lessons.** Concept and visual trace → template shown as a worked example → Parsons of the template → implement a drill → CCC ladder (brute force → full) | 1 technique worked example, 1 template Parsons, 2 code exercises, 1–3 problem ladders | Medium. Each template enters the C.3 drill queue as soon as its module is done. |
| 5–7 | **Problem first.** Read and annotate the subtask table → bank the partials (brute-force rung) → hint ladder toward the insight → editorial with a proof sketch → Python speed pass → upsolve reflection → a spaced re-solve from scratch | Mostly problem ladders and technique drills. Worked examples only for new data structures (segment tree, Fenwick, iterative DFS) | Low by default; hints on demand. Templates are typed from memory (drill mode has no snippets and no autocomplete). |
| C | Rules quizzes, verdict diagnosis, docs-lookup drills, stress-test labs, mock contests | varies | n/a |

Rules that hold at every stage:

- **One new concept per lesson section.** Define each term the first time it appears, through a glossary component, so the prerequisite lint can check it.
- **Every code exercise shows samples first**, the way the CCC statement does, and the sample group is always visible.
- **"Bank the partials" gets taught as a habit, not a score.** Wording like "Submit the brute force first, since the grader keeps your best submission", never "this gets you N marks toward X".
- **Algorithm templates.** After a template's lesson, it moves into the drill system (section 4.4). Lessons say plainly that the contest bans prewritten code, and that this is why the templates get practised from memory.

### 2.3 Teaching Python performance

A spiral. Each idea appears early in small form and comes back when it matters:

| Where | What is taught |
|---|---|
| M1.7, M1.8 | `"".join` rather than `+=`; `pop(0)` and `x in list` cost O(n); the aliasing bug |
| M1.10 | Wrap the program in `main()`; locals are faster |
| M2.9 | Counting operations; mapping N to a target complexity (the map's table); the rough operations-per-second budget for PyPy, phrased as a planning tool |
| M3.9 | Hidden costs of built-ins, rewritten as one linear pass |
| M3.10 | Fast I/O (`sys.stdin.buffer.read().split()`, output joined once). **From here on every reference solution uses the house skeleton.** |
| M4.13, M5.7 | BFS iterative by default; iterative DFS as the default DFS; recursion allowed only when depth is small, with the depth rule stated |
| M4.11, M5.12 | Bottom-up DP, rolling arrays, no 5000×5000 tables |
| M6.x | Flat arrays, int-encoded keys, lazy-deletion heaps |
| M7.12 | The full checklist, practised as a "make this correct but slow solution fast" lab, measured locally with PyPy 3.8 on a maximum-size input |

**House skeleton** (defined once in the style guide and used by every Stage 3+ reference solution):

```python
import sys

def main():
    data = sys.stdin.buffer.read().split()
    # parse with an index into data
    out = []
    # ... solve ...
    sys.stdout.write("\n".join(out) + "\n")

main()
```

### 2.4 Browser speed versus grader speed (message design, no score framing)

The in-browser runner is CPython on WebAssembly (W1 will confirm the version). It is slower than the grader's PyPy3, often by a lot, and its speed depends on the device. The design:

- **What in-app tests check:** correctness plus **complexity class**. Complexity tests are sized so the intended algorithm finishes in about a second or less in the browser, while the next class up (for example O(N²) against O(N log N)) would need 100× or more of the limit. The browser time limit catches the wrong algorithm and infinite loops. It does not model the grader's 3 s.
- **What the app tells the learner:** each run's output panel shows "Ran in browser Python · 0.42 s", with an info popover:
  > Your browser runs a different Python from the contest grader, and it is usually slower. The speed tests here are sized so that the right algorithm passes easily and a slower algorithm clearly doesn't. To check real timing, submit on the linked judge using PyPy 3, or run the program locally with PyPy 3.8.
- **Where it is taught:** M0.2 (first mention), M2.9 (why the operation count matters more than the stopwatch), M3.10 (fast I/O matters even when browser tests pass), and every Stage 5+ problem page's "Check the speed for real" step, which links to the judge through the registry and gives the local PyPy command.
- **Wording bans:** no "Python is too slow for", no "you can't get full marks", no score numbers. Say "this subtask's full-size input is where constant factors matter; see M7.12".

---

## 3. Content model

### 3.1 Principles

1. **Stable IDs.** Stage `s0`–`s7` and `c`. Module = the map ID (`M4.13`, `C.3`). Lesson = `<moduleId>/<slug>` (`M4.13/grid-bfs`). Exercise = `<lessonId>/<slug>` (`M4.13/grid-bfs/count-regions`). Order lives in list fields, never in IDs, so a new lesson doesn't renumber progress keys.
2. **Derived, never typed:** judge URLs, expected outputs for predict and runnable blocks, trace tables, subtask tables rendered in prose, and time limits all come from the build.
3. **Prose in MDX, data in YAML, code in `.py`.** MDX holds explanation and block tags. YAML holds exercise data validated by Zod. Python files are real files that vermin, PyPy3.8 and the test runner can run directly.
4. **Every exercise has a content hash**, so progress can tell when content changed underneath a saved result.

### 3.2 Directory layout

```
main-app/content/
  course.yaml                         # ordered stages -> ordered modules (incl. C.x placement), prereqs
  style/house-skeleton.py             # canonical fast-I/O skeleton (imported by lint + drills)
  glossary.yaml                       # term -> definition, introducedIn (module ID)
  concepts.yaml                       # Python feature -> introducing module (for the prereq lint)
  registry/
    ccc-problems.yaml                 # THE problem registry (all 119), single source of links
    external-links.yaml               # allow-list of non-problem URLs (docs.python.org, CEMC, PyPy)
  templates/                          # C.3 drill templates
    fast-io/ template.py  harness.yaml  meta.yaml
    bfs-grid/ ...  dsu/ ...  dijkstra/ ...  fenwick/ ...  segtree/ ...  (16 total)
  stages/
    s1-python-fundamentals/
      stage.yaml
      M1.5-for-loops/
        module.yaml                   # id, title, prereqs, depth, introduces, practice set, checkpoint
        lessons/
          repeat-with-range.mdx
          nested-loops.mdx
        exercises/
          repeat-with-range/
            count-up.yaml
            count-up.starter.py
            count-up.solution.py
            count-up.wrong-off-by-one.py      # optional "decoy" solutions that must fail
            count-up.tests/               # only when tests are too big to inline
        checkpoint.yaml               # module mastery quiz (mixed item types)
  problems/
    ccc24s3/
      page.yaml                       # subtasks, checker, limits, ladder rungs, hints
      summary.mdx                     # paraphrased statement + attribution (never verbatim)
      editorial.mdx                   # walkthrough: partials route -> insight -> full -> speed pass
      solutions/ rung1-brute.py rung2-yesno.py full.py
      tests/ samples/ g1/ g2/ ...     # small committed tests (*.in / *.out)
      gen/ gen.py                     # generator for complexity tests (seeded)
      checker.py                      # when output is not unique / partial credit
  mock-contests/
    senior-2024.yaml                  # which problems, timer, rules banner (problems from registry)
```

Build output (generated, not committed): `main-app/.generated/content/*.json` (compiled lessons, resolved links, predicted outputs, traces) and `public/tests/<exerciseOrProblemId>/*.gz` (materialised generated tests), which the runner fetches lazily.

### 3.3 TypeScript schema (authoring types; Zod mirrors them)

```ts
// ---------- course structure ----------
type StageId = 's0'|'s1'|'s2'|'s3'|'s4'|'s5'|'s6'|'s7';
type ModuleId = `M${number}.${number}` | `C.${number}`;
type Depth = 'awareness' | 'working' | 'mastery';

interface Course { stages: { id: StageId; modules: ModuleId[] }[] }   // order = learning path

interface Stage {
  id: StageId; title: string;
  exitSkills: string[];            // skill statements only, never scores ("Can solve J1–J3 style problems")
}

interface Module {
  id: ModuleId; title: string; stage: StageId;
  prereqs: ModuleId[]; prereqStages?: StageId[];
  depth: Depth; optional?: boolean; deferrable?: boolean;
  introduces: string[];            // concept keys from concepts.yaml / glossary.yaml
  lessons: string[];               // lesson slugs in order
  practice: PracticeRef[];         // module-level practice set (from curriculum map)
  checkpoint?: string;             // checkpoint.yaml
  templates?: TemplateId[];        // templates this module introduces -> enter C.3 drills
}

interface PracticeRef {
  problem: ProblemId;              // registry key, e.g. 'ccc24s3'
  role: 'core' | 'extra' | 'partials';
  focus?: string;                  // e.g. "subtasks 1–2", "the YES/NO line first"
  rungs?: number[];                // which ladder rungs are in scope for this module
}

// ---------- lessons ----------
interface LessonFrontmatter {
  id: string;                      // 'M4.13/grid-bfs'
  title: string;
  minutes: number;                 // estimated time; shown per lesson only
  objectives: string[];            // "You can..." statements
  uses?: string[];                 // concept keys used but taught elsewhere (checked by lint)
  preview?: string[];              // concepts intentionally shown before being taught
}
// MDX body = prose + block components:
//   <WorkedExample id="..."/> <Predict id/> <Parsons id/> <FillIn id/> <Trace id/> <Choice id/>
//   <Code id/> <Debug id/> <Explain id/> <Reflect id/> <ProblemCallout problem="ccc24j5" focus="..."/>
//   <Term k="subtask"/> <Callout kind="note|warn|speed"/> <RunnableSnippet file="..." stdin="..."/>

// ---------- exercises ----------
type Exercise =
  | WorkedExample | PredictOutput | Choice | Parsons | FillIn | TraceTable
  | CodeExercise | DebugExercise | ComplexityPick | ExplainPlain | Reflection | VerdictDiagnosis;

interface ExerciseBase {
  id: string; kind: Exercise['kind'];
  required: boolean;               // gates lesson completion
  reviewable?: boolean;            // eligible for spaced review queue
  hints?: Hint[];                  // tiered, see 3.5
  concepts?: string[];
}

interface WorkedExample extends ExerciseBase {
  kind: 'worked';
  file: string;                    // .py, runnable
  stdin?: string;
  steps: { label: string; lines: [number, number]; md: string }[];   // subgoal labels
  selfExplain?: { prompt: string; modelAnswer: string };             // ungraded, self-check
}

interface PredictOutput extends ExerciseBase {
  kind: 'predict';
  file: string; stdin?: string;
  // expectedOutput is GENERATED at build by running `file` under Python 3.8
  compare: 'lines' | 'exact';
  afterReveal: string;             // explanation shown after Run
}

interface Choice extends ExerciseBase {
  kind: 'choice'; multi?: boolean;
  prompt: string; code?: string;
  options: { md: string; correct: boolean; feedback: string }[];     // per-option misconception feedback
}

interface Parsons extends ExerciseBase {
  kind: 'parsons';
  prompt: string;
  blocks: string[];                // correct program split into blocks (from solution file)
  indentGraded: boolean;           // Python: usually true
  distractors?: { pairedWith: number; code: string; why: string }[];  // paired only
  grading: 'order' | 'tests';      // 'tests' = assemble and run -> accepts any valid order
  tests?: TestSpec;
}

interface FillIn extends ExerciseBase {
  kind: 'fillin';
  template: string;                // code with ___1___, ___2___ gaps
  blanks: { id: string; accept?: string[] }[];     // optional quick string check
  tests: TestSpec;                 // authoritative: run the completed program
}

interface TraceTable extends ExerciseBase {
  kind: 'trace';
  file: string; stdin?: string;
  watch: string[];                 // variable names (columns)
  stops: { line: number }[];       // capture points (rows); table GENERATED via sys.settrace
  prefilledRows?: number;          // fading: early lessons prefill more rows
}

interface CodeExercise extends ExerciseBase {
  kind: 'code' | 'modify';         // 'modify' starts from a worked example's file
  prompt: string;                  // mdx string
  starter?: string;                // file
  solution: string;                // file; reference, 3.8, must pass all tests
  decoys?: { file: string; mustFailGroups: string[] }[];  // test-adequacy checks
  tests: TestSpec;
  feedback?: { when: { group?: string; outputMatches?: string; error?: string }; md: string }[];
  revealPolicy?: RevealPolicy;
}

interface DebugExercise extends Omit<CodeExercise, 'kind'> { kind: 'debug'; buggy: string; bugLines?: number[] }

interface ComplexityPick extends ExerciseBase {   // M2.9, C.4: "which complexity does each subtask need?"
  kind: 'complexity';
  rows: { bound: string; answer: 'O(1)'|'O(log N)'|'O(N)'|'O(N log N)'|'O(N^2)'|'O(N^3)'|'O(2^N)'|'O(N!)' }[];
  problem?: ProblemId;             // bounds rendered from registry data when present
}

interface ExplainPlain extends ExerciseBase { kind: 'explain'; code: string; modelAnswer: string }  // self-assessed
interface Reflection extends ExerciseBase { kind: 'reflect'; prompt: string }                       // stored locally
interface VerdictDiagnosis extends ExerciseBase {  // C.7
  kind: 'verdict'; code: string; verdict: 'WA'|'TLE'|'RTE'|'CE';
  options: { md: string; correct: boolean; feedback: string }[];
}

// ---------- hints and reveal ----------
interface Hint { level: 1|2|3|4; kind: 'nudge'|'approach'|'plan'|'code'; md: string }
interface RevealPolicy { minRuns?: number; minSeconds?: number }   // default: 1 run OR 180 s
```

### 3.4 Grading and hints per exercise type

| Type | Grading | Hints | Data needed | Stages |
|---|---|---|---|---|
| Worked example | none; "Run it" optional; self-explanation self-checked | n/a | `.py`, steps with subgoal labels | all, heavy in 0–4 |
| Predict the output | typed answer vs **build-generated** output (`lines` mode by default); then the learner runs it | none; explanation after the reveal | `.py`, stdin | 0–3 |
| Choice / multi-select | answer key; per-option feedback aimed at the misconception | none (the feedback is the teaching) | options + feedback | all |
| Parsons | `tests` mode: assemble, run, pass tests (accepts any valid order). `order` mode only for non-executable fragments | 1 hint: "the first line is…" | blocks from the solution file, paired distractors | 1–4 |
| Fill in the blanks | run the completed program against the tests; blank regex only for instant feedback | 1–2 | template, tests | 1–3 |
| Trace table | cell-by-cell against the **build-generated** trace; wrong cells highlighted | "step through line N" | `.py`, watch vars, stop lines | 0–2 (plus trees/BFS queues in 4–5) |
| Code / modify | runner against the test groups; batch semantics | 4 tiers + solution reveal | starter, solution, decoys, tests, targeted feedback | all |
| Debug | tests; optional "which line" choice first | 2–3 tiers | buggy file, solution, tests | 0–3, C.7 |
| Complexity pick | answer key per row | link to M2.9 | bounds (from registry for CCC) | 2+, C.4 |
| Explain in plain English | self-assessed against a model answer | n/a | code, model answer | 1–3 |
| Reflection | not graded; stored locally | n/a | prompt | 5+ (upsolve logs), C.9 |
| Verdict diagnosis | answer key | n/a | code, verdict | C.7 |
| CCC problem ladder | runner against registry-linked tests per rung/subtask; checker when needed | 4 tiers per rung + editorial reveal | see 3.7 | 3+ |
| Template drill | harness tests (for example a DSU operation sequence); time recorded | none in drill mode; "show template" ends the drill as a failed recall | template, harness | 4+ |

**Hint tiers** (the same shape everywhere):
1. *Nudge:* what to notice ("Look at the bound on N").
2. *Approach:* which idea or module applies, with a link to the lesson.
3. *Plan:* subgoal-level steps in plain words or pseudocode.
4. *Key code:* the crucial line or loop, not the whole program.
5. *Solution:* needs `revealPolicy` (at least one run, or 3 minutes on the exercise). A viewed solution marks the item `completedWithSolution` and schedules it for a later retry. There is no penalty language: "We'll bring this one back in a few days."

### 3.5 Test-case format for in-browser grading

```ts
interface TestSpec {
  compare: CompareMode;                     // default 'lines'
  timeLimitMs?: number;                     // default: derived (below)
  outputLimitBytes?: number;                // default 1 MiB (stops runaway prints)
  groups: TestGroup[];
}
type CompareMode =
  | { mode: 'lines' }                       // default: per-line trailing whitespace + trailing blank lines ignored,
                                            //   but a 'format warning' is shown if the raw bytes differ
  | { mode: 'exact' }                       // byte-exact after CRLF->LF (C.8 drills, M0.4 mastery)
  | { mode: 'tokens' }                      // whitespace-insensitive; only when a statement allows it
  | { mode: 'float'; abs?: number; rel?: number }   // 2020 S1 (rel 1e-5), 2020 S5 (abs 1e-6)
  | { mode: 'checker'; file: string };      // python checker: (input, expected, actual) -> {ok, fraction?, msg}

interface TestGroup {
  id: string;                    // 'samples' | 'g1' ...
  name?: string;
  visible: boolean;              // samples always visible (like the Grader)
  marks?: number;                // CCC problem pages only: the statement's own subtask marks
  kind: 'sample' | 'correctness' | 'complexity';
  batch: boolean;                // true = stop at the first failure, rest shown as 'Skipped' (CCC semantics)
  tests: (InlineTest | FileTest | GeneratedTest)[];
}
interface InlineTest { stdin: string; stdout?: string }      // stdout omitted = generated from the reference
interface FileTest { in: string; out?: string }              // committed *.in / *.out
interface GeneratedTest { gen: string; args: string[]; seed: number }  // input made at build; output from the reference
```

- **Expected outputs are generated** by running the reference solution under PyPy3.8 7.3.9 at build time, unless a hand-checked `.out` is committed (samples copied from the statement under attribution; see 7.9).
- **Time limit derivation:** `timeLimitMs = clamp(8 × referenceMsInHeadlessPyodide, 2000, 15000)`, measured in CI on the same Pyodide build the app ships. The value is a guard, not a grader simulation (section 2.4).
- **Complexity group sizing:** the author picks N so that the reference runs in about ≤ 1 s in headless Pyodide and the declared decoy (the wrong-complexity solution) goes over the limit by ≥ 10×. CI checks both. Input size cap per test is 1 MiB gzipped. Inputs at 10⁶ tokens are left out on purpose: they test constant factors, which is the external judge's job.
- **Verdict vocabulary** matches the Grader: Correct, Wrong Answer, Time Limit Exceeded, Run-time Error, Skipped, Compile Error. The app adds **3.8 Compatibility Error** from W1's checker, with a link to M1.15.
- **Memory limits** are not enforced in the browser (not reliable in Pyodide). Memory lessons (M2.9, M4.1 on the 2026 J4 note) are taught, not tested.
- **Special cases the format must cover:** 2024 S3 (half marks for a correct first line: a checker returns `fraction: 0.5`); "any valid answer" (2019 S3, 2022 S3, 2023 S3, 2024 S3, 2026 S3, 2021 S5); float tolerance; 2026 S3's hidden-values subtask (the checker holds the hidden values); 2025 S5's online-decoded input (normal stdin, nothing special).

### 3.6 Problem registry

One file, `content/registry/ccc-problems.yaml`, with one entry per **unique** problem (shared J/S problems appear once, under their Senior slot, with aliases). It is the only place a judge URL can come from.

```ts
type ProblemId = `ccc${string}`;           // the judge slug, e.g. 'ccc24s3'

interface CccProblem {
  id: ProblemId;
  year: number;                   // 2014..2026 today
  level: 'J' | 'S';               // canonical (Senior for shared problems)
  number: 1|2|3|4|5;
  aliases: { level: 'J'|'S'; number: number }[];   // e.g. 2026 J5 for ccc26s2
  title: string;                  // official title (a short factual name)
  slug: string;                   // derived: `ccc${yy}${level.toLowerCase()}${number}`
  slugOverride?: { slug: string; evidence: string };  // variant slugs, with proof
  // url is NEVER stored; computed by judgeUrl()
  verified: {
    status: 'unverified' | 'ok' | 'mismatch' | 'missing';
    checkedAt?: string; httpStatus?: number; titleOnJudge?: string;
  };
  topics: Topic[];                // the taxonomy from past-problems-analysis §2.1
  modules: { core: ModuleId[]; partials: ModuleId[] };   // coverage matrix
  difficulty: number;             // 1..10 absolute scale (display allowed: it isn't a target)
  subtasks?: { marks: number; constraint: string }[];     // rendered by component, never typed in prose
  outputRule?: 'exact' | 'anyValid' | 'float' | 'halfFirstLine' | 'hiddenValues';
  commentary: 'official' | 'community' | 'none';
  testData: 'official' | 'none';
  content: 'registryOnly' | 'page' | 'ladder' | 'editorial';
  internal?: {                    // agent-only; the renderer never imports this key (lint-enforced)
    pythonNotes?: string; recon?: string[];
  };
}

function judgeUrl(p: CccProblem): string {
  const slug = p.slugOverride?.slug ?? p.slug;
  if (p.year >= 2020 && p.year <= 2026) return `https://wmoj.ca/problems/${slug}`;   // plural, no trailing slash
  if (p.year < 2020) return `https://dmoj.ca/problem/${slug}/`;                     // singular, trailing slash
  throw new Error(`No link rule for CCC ${p.year}; Manager decision needed`);
}
```

- Registry entries are rendered by `<ProblemLink id>`, `<ProblemCallout id>` and the problem browser. **Content must never contain a raw `wmoj.ca` or `dmoj.ca` URL** (lint, section 7).
- Build-time assertion: every URL the build emits matches `^https://wmoj\.ca/problems/ccc2[0-6][js][1-5]$` for 2020–2026 or `^https://dmoj\.ca/problem/ccc(0\d|1\d)[js]\d[a-z0-9_]*/$` before 2020, and the year in the slug matches the entry's year.
- Release gate: every registry entry that the shipped content references must have `verified.status: ok` (W4 designs the checker).
- Shared problems: DMOJ lists them only under the Senior code (for example `ccc26s2`). **Whether WMOJ also uses only the Senior code is unverified** (W4). The registry's `slugOverride` handles either answer.

### 3.7 CCC problem pages (the "solve a real CCC problem" type)

```yaml
# content/problems/ccc24s3/page.yaml
problem: ccc24s3
summaryFile: summary.mdx          # paraphrase + samples + attribution line
attribution: cemc-cc-by-nc        # renders the standard CEMC credit
rungs:
  - id: r1
    title: Two elements
    groups: [samples, g1]
    solution: solutions/rung1-brute.py
    hints: [...]
  - id: r2
    title: Small arrays by search
    groups: [g1, g2]
    solution: solutions/rung2-bfs.py
  - id: r3
    title: Decide YES or NO for all sizes
    groups: [g3y]                 # checker gives half credit for the first line
  - id: full
    title: Build the swipes
    groups: [g1, g2, g3]
    solution: solutions/full.py
tests: { compare: { mode: checker, file: checker.py }, groups: [...] }
editorial: editorial.mdx          # sections: Read -> Bank partials -> Insight -> Full -> Speed pass -> Re-solve later
speedCheck: true                  # shows "Check the speed for real" -> judgeUrl + local PyPy command
```

Each page has: the paraphrased summary with samples, the subtask table (from the registry), the ladder, the tiered hints per rung, the editorial (shown after the reveal policy is met), the judge link, "Used in" backlinks to modules, and a reflection box for upsolve notes.

---

## 4. Progress and mastery model

### 4.1 Completion rules

- **Block done:** required exercise passed, or `completedWithSolution` after at least one attempt. Reading blocks count as done when the learner scrolls past them or presses "Next".
- **Lesson complete:** every `required` block is done.
- **Module complete:** every lesson is complete **and** the checkpoint is passed. The checkpoint is 6 to 12 mixed items: roughly 70% from this module and 30% retrieval from its prerequisites. The pass mark is every item correct, with up to two tries per item. Kulik's meta-analysis favours high thresholds, and a retry keeps that from turning into a trap. A failed checkpoint points the learner to the specific lessons behind the missed items and allows a retake with fresh item variants.
- **Module mastered:** checkpoint passed with no hints, **and** one spaced review of the module's reviewable items passed at least 7 days later. The mastered state appears as a quiet badge on the module card. It never shows as a percentage or score.
- **CCC problem states:** `not started` → `attempted` → `some rungs` → `all rungs`. The page shows per-subtask ticks with the statement's own marks, as the Grader would. No totals are added up across problems or stages (see open question Q3).

### 4.2 Navigation: guided but not locked

- **Recommended next** on the dashboard follows `course.yaml` order and skips modules the learner has marked as known.
- **No hard locks.** Opening a lesson whose prerequisites aren't done shows a soft banner, for example: "This lesson uses lists (M1.8), which you haven't finished yet. Go to M1.8, or continue anyway."
- **Skip-ahead checkpoints:** any module's checkpoint can be taken cold. Passing it marks the module `complete (tested out)`.
- **Deferrable lessons** (local tooling) show up in the path again where they become needed.

### 4.3 Spaced review

- Leitner boxes with intervals of 1, 3, 7, 16 and 35 days. Correct moves an item up one box. Wrong, or solution viewed, moves it back to box 1.
- Review items are exercises flagged `reviewable` (about one or two per lesson), checkpoint items, the C.3 templates, and **CCC re-solves**: a problem finished with the editorial shown comes back as "solve from scratch" after 7 days.
- The daily queue is capped (default 10 items, about 10 minutes) so review never crowds out new learning.

### 4.4 C.3 template drills

- Each template (fast I/O, grid BFS, graph BFS, iterative DFS and post-order, Dijkstra, DSU, Kruskal, binary search on the answer, Fenwick, iterative segment tree, sparse table, sieve, prefix and difference arrays, monotonic deque, rolling hash, stress-test harness: 16 in total) has a canonical 3.8 file and a harness of operation-sequence tests.
- Drill mode: a blank editor, no autocomplete, no snippets, a stopwatch. Passing the harness counts as a successful recall. The app records the time and shows **personal best and trend only**, with no fixed goals.
- A template enters the drill queue when its introducing module is complete, and after that it follows the Leitner schedule.

### 4.5 Local-first storage

W1 picks the storage technology. IndexedDB is recommended because code drafts for more than 1,000 items will outgrow localStorage. The shape:

```ts
interface ProgressDBv1 {
  schemaVersion: 1;
  createdAt: string; updatedAt: string;
  contentVersion: string;                       // build id of the content the data was recorded against
  settings: { editorFontSize: number; reviewCap: number; showLocalSetupReminders: boolean };
  exercises: Record<string, {
    status: 'untouched' | 'attempted' | 'passed' | 'completedWithSolution';
    contentHash: string;                        // flags "content updated since you did this"
    hintsUsed: number; runs: number; firstPassedAt?: string; lastAttemptAt?: string;
    groupsPassed?: string[];
  }>;
  lessons: Record<string, { completedAt?: string }>;
  modules: Record<ModuleId, {
    state: 'notStarted' | 'inProgress' | 'complete' | 'testedOut' | 'mastered';
    checkpoint?: { passedAt?: string; attempts: number; usedHints: boolean };
  }>;
  problems: Record<ProblemId, { rungsPassed: string[]; editorialViewed: boolean; notes?: string }>;
  reviews: Record<string, { box: 1|2|3|4|5; dueAt: string; history: { at: string; ok: boolean; ms?: number }[] }>;
  drafts: Record<string, { code: string; savedAt: string }>;       // per exercise / rung
  attempts: { id: string; at: string; verdicts: Record<string, string> }[];  // capped ring buffer (e.g. 2,000)
  mocks: { id: string; startedAt: string; endedAt?: string; results: Record<ProblemId, string[]> }[];
}
```

- **Migrations:** `migrations/vN_to_vN+1.ts`, run in order when the app loads. Each one has a unit test with a fixture from the old version.
- **Export and import:** one JSON file (`et-ccc-progress-YYYY-MM-DD.json`) with the schema version and a checksum. Import validates, migrates, then either merges (keeping the best status per item and the later draft) or replaces, as the learner chooses.
- **Content drift:** if an exercise's `contentHash` changes, its status is kept and an "updated" marker is added. If an exercise is deleted, its record goes to `orphans` and is never silently dropped.

---

## 5. Volume estimates and batching

### 5.1 Per stage (lessons and their exercises; CCC problem pages counted separately in 5.2)

| Stage | Modules | Lessons | Worked examples | Micro items (predict, choice, Parsons, fill-in, trace) | Code/debug exercises | Checkpoint items | CCC practice refs (module sets) | Prose words (est.) |
|---|---|---|---|---|---|---|---|---|
| 0 | 7 | 10 | 12 | 40 | 10 | 50 | 8 | 15k |
| 1 | 15 | 45 | 60 | 225 | 135 | 150 | 47 | 68k |
| 2 | 9 | 18 | 25 | 72 | 45 | 80 | 30 | 30k |
| 3 | 10 | 20 | 20 | 60 | 50 | 80 | 54 | 30k |
| 4 | 15 | 36 | 45 | 110 | 90 | 120 | 46 | 55k |
| 5 | 13 | 32 | 35 | 65 | 70 | 100 | 28 | 50k |
| 6 | 13 | 30 | 30 | 45 | 60 | 100 | 23 | 45k |
| 7 | 14 | 26 | 22 | 30 | 45 | 80 | 13 | 40k |
| C | 10 | 16 | 10 | 40 | 20 + 16 template drills | 40 | 6 | 22k |
| **Total** | **106** | **~233** | **~259** | **~687** | **~525 + 16** | **~800** | **255 refs** | **~355k** |

Assumptions: Stage 1 has about 3 lessons per module, because an absolute beginner needs finer steps (for example M1.8 splits into 1D lists, 2D lists and aliasing, and hidden costs). Stages 5 to 7 have about 2.3, because much of the teaching moves onto problem pages. Lesson prose runs about 1,500 words early and 1,500 to 2,000 later (more code, less text). Checkpoint items are mostly choice or predict variants and are cheap.

### 5.2 CCC problem pages

| Tier | Problems | Content | Words each | Words total |
|---|---|---|---|---|
| Easy (J1–J2 slots) | ~26 | summary, samples, 2 hints, short editorial, tests | ~400 | ~10k |
| Middle (J3–J5 non-shared, S1–S2) | ~54 | summary, ladder of 1–3 rungs, 4-tier hints, editorial | ~900 | ~49k |
| Hard (S3–S5) | 39 | summary, ladder of 3–6 rungs, hints per rung, full editorial with proof sketch and speed pass | ~2,000 | ~78k |
| **Total** | **119** | | | **~137k** |

About 330 rung reference solutions and roughly 3,500 test files (mostly generated). Exercise tests add another ~4,200 (about 8 per code exercise, mostly inline).

### 5.3 Grand totals

- **~233 lessons, 119 problem pages, ~1,230 graded exercise items** (687 micro + 525 code/debug + 16 template drills), plus **~259 worked examples** (ungraded), **~800 checkpoint items** and **~250 review-flagged items**.
- **~490k words** of prose (355k lessons + 137k problem pages). Prose checks are the costliest gate, so plan the style-review budget around this number.
- **~7,700 test cases** (tests generated by a script count as data, not writing).

### 5.4 Batching for content production

- **Unit of work:** one module per worker task (lessons + exercises + checkpoint + `module.yaml`), about 6 to 12k words. Tiny modules are paired (M0.x two per task; C.1+C.2, C.7+C.8). That gives about **85 module tasks**.
- **Problem pages:** 3 to 5 problems per task, grouped by technique family so one worker holds one editorial frame (for example "S3 constructive: 19S3, 22S3, 23S3, 24S3, 26S3"). That gives about **30 problem tasks**.
- **Foundation tasks, done before any stage batch:**
  1. Registry population (119 entries, subtasks and topics from the recon files) plus link verification (W4's tool).
  2. `concepts.yaml`, `glossary.yaml` and `course.yaml` (ordering, prereqs, C.x placement).
  3. Templates plus the house skeleton (canonical code and harnesses).
  4. Workspace style guide, with the teaching-voice sample.
  5. The pilot (section 8).
- **Order:** lessons in a stage can be written in parallel once the foundations exist, because callouts render from the registry even when the problem page isn't written yet. Stages can also run in parallel, but a critic pass per stage should come before the next stage's batch is accepted.
- **Strongest model needed (Opus 5.5 writer, plus an Opus critic):**
  - **Stages 0–1.** Technically easy, but the voice for an absolute beginner, the misconception feedback and the fading design are the hardest writing to get right.
  - **S3–S5 problem pages and Stages 5–7 lessons.** Correct proofs and editorials, 2026 S1, S3, S4 and S5 with no official commentary, and Python performance work.
  - **M2.9, M7.12 and the performance callouts.** These need the "no score framing" nuance.
  - **Templates (C.3).** Canonical code gets copied everywhere, so it must be right.
- **Most mechanical (Sonnet 5, with Opus spot-checks):** registry entries, J1–J2 and most J3 problem pages, test generators and inline tests for simple exercises, checkpoint and review item banks, glossary, and C.1/C.2/C.7 quizzes.

---

## 6. Where practice links attach

### 6.1 Attachment points

1. **Module practice sets** (`module.yaml → practice`), shown at the end of each module as "Practise with real CCC problems". Ordered easiest first, following the map, with `focus` notes such as "subtasks 1–2 first".
2. **In-lesson callouts** (`<ProblemCallout problem="ccc24j5" focus="..."/>`), placed right after the technique is taught. They show the title, a one-line paraphrase, the in-app page link and the judge link.
3. **Problem pages** (section 3.7) are the in-app workspace for each problem, and each has the judge link.
4. **Problem browser** (`/problems`): filter by year, J/S, slot number, topic, module, stage and personal status; group by year or by topic; each row shows "2024 S3 · Swipe", its topics, "Used in" modules and both links.
5. **Mock contests** (C.9): one per past paper (13 Senior, 13 Junior), built from the registry.

### 6.2 Counts from the curriculum map

- **Distinct CCC problems referenced: 119**, which is **every** Junior and Senior problem from 2014 to 2026 (130 slots minus 11 shared problems). Counted by script over every `YYYY J/Sn` reference, with shared problems folded into their Senior slug.

| Judge (by R13) | Years | Junior | Senior | Total |
|---|---|---|---|---|
| WMOJ `https://wmoj.ca/problems/<slug>` | 2020–2026 | 30 | 35 | **65** |
| DMOJ `https://dmoj.ca/problem/<slug>/` | 2014–2019 | 24 | 30 | **54** |

- Module practice sets hold **255 problem references** (a problem can appear in several modules). Per stage: S0 8, S1 47, S2 30, S3 54, S4 46, S5 28, S6 23, S7 13, C 6.
- Shared problems to watch for slugs: 14 J4=S1, 14 J5=S2, 16 J5=S2, 17 J5=S3, 18 J4=S2, 19 J4=S1, 20 J5=S2, 21 J5=S2, 22 J4=S2 (DMOJ title "Good Groups"), 23 J4=S1, 26 J5=S2.

### 6.3 Non-CCC practice

- The map names **no** external non-CCC judge problems (no USACO, CSES, Codeforces or non-CCC DMOJ). Its non-CCC practice is **app-authored**: M7.2 (range-add/range-sum), M7.13 (LCA), M6.10 (standalone inversion counting), M6.11 (window-max drill), M5.5 (bisect drills), M1.14 (factorial/Fibonacci), M1.15 ("port to 3.8" drill), C.2 (docs lookup), plus every Stage 0–2 exercise. These become ordinary `CodeExercise`s with no external link.
- Other external links do appear in the map: A-stick-bug's GitHub (M1.15, M7.14), CEMC past-contest pages and test-data zips (M0.3, C.10), PyPy downloads (M0.2), docs.python.org (C.2). They go into `registry/external-links.yaml` as an allow-list.
- **Open question Q1:** if later content wants non-CCC judge problems (CSES, USACO or non-CCC DMOJ/WMOJ problems) for extra practice on M7.2 or M7.13, what is the link rule? Proposal: they are allowed only through a separate `registry/other-problems.yaml` with the judge's canonical URL and a verified flag, labelled "extra practice (not CCC)". The R13 rule stays reserved for CCC problems.

---

## 7. Content quality gates

Every gate runs in CI (`npm run content:check`) and blocks release. Python tooling is the contained PyPy3.8 7.3.9 / CPython 3.8 from W3's plan.

1. **Schema validation.** Zod over every YAML and all MDX frontmatter. IDs unique. Every `<Block id>` resolves. Every `problem:` key exists in the registry. Module prereqs match the map's adjacency list, acyclic, never pointing forward in `course.yaml`. The `internal` key never appears in the compiled output.
2. **Python 3.8 compliance.**
   - `vermin -t=3.8- --violations` over every `.py` file and every fenced `python` block pulled from MDX.
   - `py_compile` of each under PyPy3.8.
   - Blocks marked runnable are executed with their stdin, and the output shown in the lesson must equal the real output (the displayed output is generated, so this is a regeneration diff).
3. **Reference solutions.**
   - Every `solution` and rung solution passes all its groups under **PyPy3.8 7.3.9** with grader-like limits (3 s).
   - For CCC problems with official data, it also passes the CEMC test data locally (the data is cached in the workspace; see Q2).
   - It also passes in **headless Pyodide** within the in-app limit, because the learner's correct code must pass in the browser too.
4. **Test adequacy.** Every `decoy` fails exactly its `mustFailGroups`. Each rung solution passes its own groups and fails later rungs' complexity groups. Complexity groups show at least a 10× separation (section 3.5).
5. **Generated artefacts are fresh.** Predict outputs, trace tables and time limits are regenerated, and CI fails on any difference from the committed build output.
6. **Style.**
   - avoid-ai-writing detector with the `warm` + `docs` profiles on prose pulled from MDX (code, inline code and link targets removed).
   - The workspace style-guide lint (banned words, no em dashes, sentence-case headings).
   - For Stages 0–2, a readability ceiling (for example Flesch-Kincaid grade ≤ 9) and a warning for sentences over 30 words.
7. **No-score-target lint.** Case-insensitive, over all prose, hints, feedback and UI strings in content. Matches are errors unless inside a registry-rendered subtask table:
   - `\b\d{1,2}\s*/\s*(75|15)\b`, `75/75`, `perfect score`, `full score`, `full marks`, `max(imum)? score`
   - `target (score|mark)`, `aim for \d`, `realistic`, `ceiling`, `stretch goal`, `expected (score|result)`, `you should (get|score)`
   - `cutoff`, `distinction`, `honou?r roll`, `CCO (invitation|qualif)`, `qualify`, `percentile`, `top \d+%`, `medal`
   - `(infeasible|impossible|not achievable|too slow|can't pass|cannot pass).{0,40}python` and the reverse order `python.{0,40}(infeasible|impossible|too slow)`
   - `average (score|of \d)`, `\bscored\b`, `contestants scored`, `DMOJ points`
   - The C.3 time goals ("under \d+ minutes?") in drill contexts.
   A reviewed allow-list file handles true exceptions such as "Crazy Fencing: print 18.5".
8. **Link lint.**
   - No raw `wmoj.ca`, `dmoj.ca`, `cemc.uwaterloo.ca` or other URLs in MDX/YAML prose. Problem links go through `<ProblemLink>`; other URLs must match `external-links.yaml`.
   - Unit tests for `judgeUrl()` (the 2019/2020 and 2026/2027 year boundaries, plural/singular path, trailing slash).
   - Every URL the build emits matches the regexes in 3.6.
   - The release gate requires `verified.status: ok` for every referenced problem.
   - A scheduled live check (W4) re-verifies HTTP status and judge title.
9. **Prerequisite-order lint (an approximation).**
   - `concepts.yaml` maps detectable Python features to the module that introduces them. Examples: AST nodes (`For` → M1.5, `While`/`Break` → M1.6, `ListComp` → M1.8, `Dict`/`Set` → M1.9, `FunctionDef` → M1.10, `JoinedStr` → M1.11, self-recursive calls → M1.14), builtins and methods (`enumerate`/`zip` → M1.8, `.join` → M1.7/M1.11), and imports (`deque` → M4.8, `heapq` → M5.11, `bisect` → M5.5, `lru_cache` → M4.11, `sys.stdin.buffer` → M3.10).
   - A Python `ast` pass over every code artefact collects the features it uses and fails when a feature's module comes later in `course.yaml` than the lesson, unless it is listed in the lesson's `preview`.
   - Prose terms: `glossary.yaml` has `introducedIn`, and a regex pass warns when a glossary term appears before its module (with `<Term>` required on first use).
   - This catches most ordering slips. It can't tell whether an idea was *explained* well; the critic review covers that.
10. **Copyright.**
    - `summary.mdx` must not be verbatim. An n-gram check against a locally cached copy of the CEMC statement (never shipped) fails on any run of 12 or more identical words outside sample I/O blocks, and warns above an overall similarity threshold.
    - Every problem page renders the attribution component.
    - Titles and sample I/O are allowed with attribution. CEMC materials are licensed CC BY-NC 4.0 (cemc.uwaterloo.ca/copyright), which also says no one may charge for access to past contests. The app must stay free and non-commercial.
11. **Facts come from data.** Constraint numbers, subtask marks and time limits in prose must be rendered from the registry or `page.yaml`. A lint flags a `≤ 10^k` or `N ≤` pattern in a problem page's MDX when it isn't inside a data component.
12. **Content review.** A critic agent pass per batch against a pedagogy rubric: one idea per section, subgoal labels present, misconception feedback on choice items, hint tiers that don't give away the answer at level 1, and no leaked recon framing.

---

## 8. Pilot recommendation

Three pilots, one from each end of the course and one in the middle. Together they cover every block type, both judges, the checker and ladder machinery, and the no-score wording. Run them end to end (schema → gates → rendered in the app) before any batch writing starts. D-009 asks for this before mass production.

1. **M1.1 "Variables and reassignment"** (absolute zero, Stage 1). It tests the beginner voice and the full PRIMM cycle: a subgoal-labelled worked example, predict-the-output, a trace table for reassignment (the `=`-is-not-equality misconception), a Parsons problem without distractors, a fill-in, a small stdin/stdout code exercise with targeted feedback ("you printed a prompt"), a choice item with misconception feedback, and a callout to 2024 J1 (WMOJ link).
2. **M4.13 "Grid BFS and flood fill"** (mid-stage algorithm). It tests the technique-lesson shape: a trace of the queue as a table, a template worked example, a Parsons of the template with paired distractors ("mark visited on pop" as the paired distractor), a code exercise with a complexity group and a decoy, registration of the C.3 `bfs-grid` drill, and callouts to 2024 J5 (WMOJ) **and** 2018 J5 (DMOJ). Both link rules are exercised.
3. **Problem page ccc24s3 "Swipe"** with its M5.1/M4.9 walkthrough (a CCC walkthrough). It tests the ladder (N = 2 → BFS for N ≤ 8 → YES/NO for all → full construction), the **half-marks-for-the-first-line checker**, an "any valid answer" checker, bank-the-partials wording, the hint tiers per rung, the editorial structure, the "Check the speed for real" step, the paraphrase and attribution plus the n-gram gate. An official 2024 Senior commentary exists, so correctness can be checked against a primary source.

Pilot exit criteria: every gate in section 7 passes; the Manager reads all three; the style guide and the avoid-ai-writing settings are tuned; time spent per lesson and per problem page is measured to recalibrate section 5.

---

## 9. Open questions for the orchestrator or Manager

- **Q1.** Link rule for non-CCC judge problems, if any are added (section 6.3).
- **Q2.** Official CEMC test data. CC BY-NC 4.0 allows reuse with attribution for non-commercial use. Options: (a) use it only in CI to verify reference solutions and not ship it; (b) ship subsets inside problem pages with attribution. Recommendation: (a) now, plus app-generated tests. That avoids large assets and keeps every test sized for the browser.
- **Q3.** Is showing the statement's own subtask marks, and a mock-contest total, allowed under R14? Proposal: yes for per-subtask marks on a problem page and a mock-contest result screen that mirrors what the Grader shows, since these are facts about a problem or the learner's own result. There is never a comparison with cutoffs, averages or goals, and never a total across problems or stages outside mock contests.
- **Q4.** Link rule for CCC 2027 and later (`judgeUrl` currently throws).
- **Q5.** Whether WMOJ offers PyPy3 and uses Senior-only slugs for shared problems (W4).
- **Q6.** Should M7.14 (C++) count as a module (106) or stay an optional appendix (105)?
- **Q7.** Deferring the local-setup lessons (M0.2 local part, M0.3) to the start of Stage 2 (section 1.6).

---

## Sources

- Sentance, S., Waite, J., & Kallia, M. (2019). Teaching computer programming with PRIMM: a sociocultural perspective. *Computer Science Education* 29(2–3). https://www.tandfonline.com/doi/full/10.1080/08993408.2019.1608781 ; project page https://computingeducationresearch.org/projects/primm/
- Lopez, M., Whalley, J., Robbins, P., & Lister, R. (2008). Relationships between reading, tracing and writing skills in introductory programming. ICER. https://dl.acm.org/doi/10.1145/1404520.1404531 ; Lister et al. (2009) https://dl.acm.org/doi/10.1145/1595496.1562930
- Margulieux, L., Morrison, B., & Decker, A. (2020). Reducing withdrawal and failure rates in introductory programming with subgoal labeled worked examples. *IJ STEM Ed*. https://link.springer.com/article/10.1186/s40594-020-00222-7
- Salden, R. et al. (2010). The expertise reversal effect and worked examples in tutored problem solving. http://www.cee.uma.pt/ron/Salden%20et%20al.%20-%20The%20Expertise%20Reversal%20Effect%20and%20Worked%20Examples.pdf ; Kalyuga & Renkl (2010) special-issue introduction https://link.springer.com/article/10.1007/s11251-009-9102-0
- Ericson, B., Margulieux, L., & Rick, J. (2017). Solving Parsons problems versus fixing and writing code. Koli Calling. https://dl.acm.org/doi/10.1145/3141880.3141895 ; Ericson et al. (2022) Parsons Problems and Beyond (ITiCSE WG) https://dl.acm.org/doi/abs/10.1145/3571785.3574127
- Harms, K. et al. (2016). Distractors in Parsons problems decrease learning efficiency. https://kharms.infosci.cornell.edu/downloads/harmsk-icer-2016.pdf ; "Distractors make you pay attention" (ICER 2024) https://dl.acm.org/doi/fullHtml/10.1145/3632620.3671114
- Becker, B. et al. (2016). Effective compiler error message enhancement for novice programming students. *Computer Science Education* 26. https://www.tandfonline.com/doi/full/10.1080/08993408.2016.1225464
- Kulik, C.-L., Kulik, J., & Bangert-Drowns, R. (1990). Effectiveness of mastery learning programs: a meta-analysis. https://journals.sagepub.com/doi/10.3102/00346543060002265
- Aleven, V., Roll, I., McLaren, B., & Koedinger, K. (2016). Help helps, but only so much: research on help seeking with intelligent tutoring systems. https://link.springer.com/article/10.1007/s40593-015-0089-1
- Single-paper meta-analyses of spaced retrieval practice in nine introductory STEM courses (2024). *IJ STEM Ed*. https://link.springer.com/article/10.1186/s40594-024-00468-5
- USACO Guide, "How to Practice". https://usaco.guide/general/practicing
- CEMC copyright and licensing (CC BY-NC 4.0; no fees for access to past contests), read 2026-09-23. https://cemc.uwaterloo.ca/copyright
- Workspace: `research/01-recon/curriculum-map.md`, `past-problems-analysis.md`, `ccc-format-and-rules.md`, `python-for-ccc.md`.
