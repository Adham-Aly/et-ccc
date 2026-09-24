# et-ccc Implementation Plan

**Status:** v1.0, draft for Manager approval. Written in Phase 2 by the planning-orchestrator on 2026-09-23 and revised after an independent critique.
**Authority:** this file is the single source of truth for the whole build (D-011). What gets built, and what does not, depends only on this file. Changes need Manager approval and a row in §1 Changelog.

---

## 0. How to use this plan

### 0.1 Who reads what

| You are | Read first | Then |
|---|---|---|
| Any agent starting cold | `context/00-START-HERE.md`, then this file §0–§3, then `context/progress.md` | Your phase in §12 and the files it lists under "Read first" |
| Main session | §0, §1, §11, §12.0 (phase index), your current phase, §15 | `progress.md` and the last phase log |
| Phase orchestrator | §0–§3, §11, §13, your phase in §12 | The sections your phase references |
| Worker | Only what your prompt lists; the prompt quotes the rules you must obey | Nothing else unless told |

### 0.2 Order of authority

1. The Manager's latest explicit instruction.
2. This plan decides build scope, architecture and orchestration. If it conflicts with `operating-rules.md` on **process**, `operating-rules.md` wins unless this plan records a Manager-approved change (operating-rules §0).
3. `decisions.md` holds the rulings behind this plan. §3 maps each constraint to its decision ID.
4. Research files (`research/**`, including `research/03-plan/_working/*`) are **evidence only**. Where they disagree with this plan, this plan wins; the known disagreements are listed in §16.1. Never apply a worker file's recommendation that this plan overrides.

### 0.3 Resuming after an interruption

1. Read `progress.md` and find the phase marked `IN PROGRESS` or `REDO REQUESTED`.
2. Read that phase in §12, its checklist in `progress.md`, and, for content phases, the phase's `ledger.generated.md` and `defects.md` (§13.3).
3. Continue from the first unchecked item. Never redo an item marked done unless its output file is missing or fails its gate; if that happens, log it.
4. Agent IDs don't survive a session restart. If a worker you would have continued with SendMessage is unavailable, spawn a new one of the same role and model. Give it the item's files plus its `defects.md` entries, and log the handover.
5. A half-written item (files present, status still `planned` or `drafted`) is handed to a new author. That author reads the existing files, decides to continue or restart, and logs the choice.
6. Kill stale background processes recorded in `work/NN-<name>/_run/*.pid` (§4.11) before starting servers.
7. If the §1 Changelog has entries dated after the phase started, follow the new plan and note that in the phase log.

### 0.4 Tags

- **[DECIDED]** Settled here, with a reason. It changes only through the changelog.
- **[MANAGER]** Needs Manager approval (§15, and `decisions.md` → Pending Manager approval). The stated default is used only where the text says work may continue on it.
- **[SPIKE]** An unverified technical fact. A named spike must confirm it before anything depends on it. A spike can adjust only details not tagged [DECIDED]. Changing a [DECIDED] item stops the phase until a changelog entry is approved.

"CI" in this plan means `npm run verify:full` run locally on this Mac. There is no CI server.

---

## 1. Changelog

| Version | Date | Author | Change | Manager approval |
|---|---|---|---|---|
| v1.0 | 2026-09-23 | planning-orchestrator (Phase 2) | First version. Drafted from worker research W1–W4 and revised after independent critique W5 (`research/03-plan/_working/w5-critique.md`). | Pending |

Rules:
- Every change adds a row saying what changed, why, and which sections changed.
- A phase already `DONE` is not re-run automatically after a change. The Manager decides whether it needs a redo (operating-rules §6).

---

## 2. What we are building

### 2.1 Product

A free, non-commercial, light-mode-only Next.js web app. It takes one learner from **no programming experience** to solving CCC Senior problems S1–S5 in **Python 3.8**, the language level of the CCC grader's PyPy.

- It teaches with explanations, worked examples and the learner's own Python, written and run in the browser.
- Exercises are graded automatically against test cases.
- For full-speed judging it links out to the real judges, WMOJ and DMOJ.

### 2.2 Scope in numbers

Source: `research/03-plan/_working/w2-content-architecture.md` §5. The pilot recalibrates these through a changelog entry.

| Item | Estimate |
|---|---|
| Curriculum modules | **105** (D-007). `curriculum-map.md` has a 106th heading, M7.14 "C++ bridge", which is **out of scope by default** because it conflicts with R2 and R14 (§15 Q-10). |
| Lessons | ≈233 |
| CCC problem pages | **119**: every unique Junior and Senior problem from 2014–2026, with shared J/S problems counted once |
| Graded items | ≈1,230: ≈687 micro items, ≈525 code or debug exercises, 16 template drills |
| Worked examples / checkpoint items | ≈259 / ≈800 |
| Prose | ≈490k words: ≈355k in lessons, ≈137k on problem pages |
| Test cases | ≈7,700, mostly generated |
| Mock contests | 26: 13 Senior papers and 13 Junior papers |

### 2.3 Non-goals

- No accounts, server, database, analytics or telemetry (§4.1).
- No dark mode anywhere (R6).
- No score targets, cutoffs, expected results, or "Python can't do this" framing (R14, D-006 ruling).
- No verbatim CEMC statements (§6.6).
- No PWA or offline mode in v1.
- No C++ content (R2).
- No second design skill or writing-style skill (R8, R16).

---

## 3. Fixed constraints

| # | Constraint | Source | Enforced in |
|---|---|---|---|
| C1 | Next.js app in `main-app/`, empty until P4 | R4, R5, D-002 | §12 P4 |
| C2 | Light mode only; polished and careful down to the pixel | R6, R7 | §4.9, G-UI-LIGHT, G-VISUAL |
| C3 | Absolute-beginner learner; Python only | R2, R3 | §5 |
| C4 | Content spec is `research/01-recon/curriculum-map.md` | D-007 | §6 |
| C5 | All teaching code is Python 3.8 compatible (the grader runs PyPy3 7.3.9) | D-004 | §4.5, G-PY-* |
| C6 | Links: 2020–2026 → `https://wmoj.ca/problems/<slug>`; before 2020 → `https://dmoj.ca/problem/<slug>/`; every link verified | R13, D-008 | §4.7, G-LINK-* |
| C7 | No score targets in the app | R14, D-006 ruling | §6.5, G-R14 |
| C8 | Impeccable is the design skill, installed contained | R8, D-005 ruling | §9, P3, P4 |
| C9 | avoid-ai-writing v3.35.0 @ `fc979c6`, contained. Uses `warm` + `docs`, a style guide with a hand-written voice sample, a 2–3 lesson pilot first, and detector + validator gates | R16, D-009 ruling | §6.3, §9, P3, P8, G-STYLE |
| C10 | Total containment of all tooling, with before/after proof | R15, rules §7 | §9, G-CONTAIN |
| C11 | Plain-language HTML report to `~/Desktop` after every phase; never published; light theme | R10, rules §5 | §11.8 |
| C12 | The Manager may redo, critique or adjust any phase | R11, rules §6 | §13.4 |
| C13 | Only Opus 5.5 (`"opus"`) or Sonnet 5 (`"sonnet"`) for spawned agents | D-010 | §11.2, §11.3 |
| C14 | Workers never spawn subagents | rules §2 | §11.3 |
| C15 | Manager's engineering standards (§8) | Manager global rules | §8 |
| C16 | No commits unless the Manager asks; never add AI co-author lines | Manager global rules | §10 |
| C17 | CEMC material is CC BY-NC 4.0; nobody may charge for access to past contests | cemc.uwaterloo.ca/copyright | §6.6 |

---

## 4. Architecture

### 4.1 Rendering and hosting [DECIDED]

**A fully static site with local-first progress and no backend.** It is built with `next build` and `output: 'export'`.

- **Why:** there is one learner, and a static site has no server attack surface, no auth, no database, no ops and no cost. Python runs in the browser in either model; a server-side runner would be a sandboxing project of its own.
- **Progress:** stored in IndexedDB behind a `ProgressStore` interface.
  - Export and import as one JSON file.
  - A "last backup N days ago" reminder.
  - `navigator.storage.persist()` is requested on first use.
- **Safari:** WebKit deletes all site storage after 7 days of Safari use without a visit to the site. Onboarding therefore advises Chrome, Edge or Firefox, or "Add to Dock" in Safari, and encourages backups (§15 Q-6).
- **Later:** a remote `ProgressStore` could add sync. That is out of scope for v1.
- **Hosting [MANAGER, Q-5]:** the build works on any host. Its deliverable is `out/` plus a contained local serve script. If it is hosted, prefer a host that supports custom headers (Cloudflare Pages, Vercel, Netlify) over GitHub Pages.

Consequences of the static export:
- `generateStaticParams` with `dynamicParams = false` on every dynamic route.
- `trailingSlash: true` and `images.unoptimized`.
- No `next.config` headers, redirects or middleware.
- Fonts are loaded with `next/font/local` from committed WOFF2 files, so the build needs no network.

### 4.2 Stack and pinned versions [DECIDED]

Versions were checked on 2026-09-23 (`w1-tech-stack.md` §9).
- Pins are **exact** (`save-exact`).
- The phase that installs a package re-checks the current patch and records the actual pin in its phase log.
- Patch bumps are allowed. Anything beyond the listed line needs a changelog entry.

| Layer | Choice | Pin | Why |
|---|---|---|---|
| Runtime | Node.js 26 line (LTS from 2026-10-28), **workspace-local official tarball** in `.tooling/node/` with a SHA-256 check against `SHASUMS256.txt` | latest 26.x patch (26.10.0 today) | Homebrew's Node 26.0.0 has missed every 26.x security patch, and updating it would be a global change. A contained tarball is reproducible. The Homebrew Node and npm are **never used** for the project. This deviates from D-009's "system node" wording (§15 Q-15). |
| Package manager | npm (bundled with the workspace Node) | bundled | Corepack is gone since Node 25. The project `.npmrc` sets `save-exact`, `engine-strict`, `min-release-age=3`, `fund=false`, `update-notifier=false`, and a cache inside the workspace. |
| Framework | Next.js: App Router, Turbopack, static export | 16.3.6 (Active LTS) | R4; the current LTS line. |
| UI runtime | React / react-dom | 19.3.0 | Required by Next 16. |
| Language | TypeScript | 6.0.3 | TS 7 has no JS API yet, and the tool ecosystem caps below 6.1. |
| Styling | Tailwind CSS with CSS-first `@theme` tokens | 4.3.3 | Impeccable's DESIGN.md tokens map onto `@theme` directly. |
| Components | shadcn/ui source in the repo, on Base UI | CLI 4.21.0, `@base-ui/react` 1.8.0 | We own the source. Base UI has been shadcn's default since July 2026. |
| Icons | lucide-react | 1.47.0 | One consistent set. |
| Editor | CodeMirror 6 with an in-house React wrapper | state 6.7.6, view 6.43.13, lang-python 6.2.1, lint 6.9.7, … | Monaco doesn't support mobile, is heavy, and brings IDE chrome. |
| Browser Python | Pyodide, self-hosted, in a module Web Worker | 314.0.7 (CPython 3.14.2) | The only maintained full-CPython wasm runtime. No browser PyPy or maintained 3.8 build exists. |
| Content | MDX via `@mdx-js/mdx` `evaluate()` in RSC; in-repo typed loader; YAML + Zod | mdx 3.1.1, zod 4.6.5, yaml 2.9.1 | next-mdx-remote was archived in April 2026. Contentlayer is dead. Velite and Content Collections are pre-1.0. `@next/mdx` can't take function-valued plugins under Turbopack. |
| Highlighting | Shiki at build time, one custom light theme | 4.4.3 | No client JS for static code. |
| Math | remark-math + rehype-katex, rendered on the server | KaTeX 0.18.9 | Rarely needed; costs nothing at runtime. |
| Diagrams | Hand-authored React SVG components | — | Deterministic, accessible, themeable and screenshot-testable. Mermaid is rejected. |
| Storage | IndexedDB via `idb` | 8.0.3 | More than 1,000 drafts would outgrow localStorage. |
| Search | Build-time JSON index + MiniSearch on the client | latest at install | Lessons, glossary and problems. Small, with no binary, so it is easy to contain. |
| Unit tests | Vitest + jsdom | 5.0.1 / 30.1.1 | Current, and runs on Node 26. |
| E2E, visual, a11y | Playwright (Chromium, Firefox, WebKit) + `@axe-core/playwright` | 1.63.0 / 4.13.0 | WebKit stands in for Safari. Pyodide/wasm behaviour differs between engines. |
| Lint and format | Biome | 2.5.14 | ESLint 9 reached end of life on 2026-08-06, and Next's ESLint config doesn't support v10 yet. Next officially offers Biome. |
| Link crawl | linkinator (project-local) | 8.1.0 | Internal links. Judge links use the dedicated verifier (§4.7). |
| Content lint | remark-lint (MDX-aware) + custom remark plugins; cspell with a domain dictionary | latest at install | §7. |
| Performance | Lighthouse CI (`@lhci/cli`, project-local) with `CHROME_PATH` set to Playwright's full Chromium and `upload.target: "filesystem"` | latest at install | The default upload is **public** and must never be used. |
| Python CI | uv (workspace-local release binary) → **PyPy 3.8 7.3.11 native arm64** for everyday runs, and **PyPy 7.3.9 osx64 under Rosetta** as the exact grader match at stage acceptance and release. A venv with **ruff 0.16.8** and **vermin 1.8.0**, plus **pypy/pypdf** for reading the CEMC statement cache. | as listed | PyPy 7.3.9 has no arm64 build. Rosetta is an existing system component that we don't install. Apple ends general Rosetta support after macOS 27 (R-9). |

### 4.3 Repository layout [DECIDED]

```
et-ccc/
├── CLAUDE.md                     (P3) pointer to context/00-START-HERE.md + hard rules + "tools only via .tooling/bin"
├── README.md
├── context/                      source of truth
├── research/NN-<name>/           Phases 1–2 research (evidence only)
├── work/NN-<name>/               Phase 3+ artefacts: containment proofs, spikes, reviews, ledgers,
│                                 report-assets/, _working/ (worker notes), _scratch/, _run/ (pid files), _render/ (build slots)
├── work/cemc-cache/              (P8) cached CEMC statements + official test data; never shipped, git-ignored
├── manager-reports/
├── .tooling/                     all tool state (§9): env.sh, bin/ (wrappers, guards), node/, uv/, pypy/, venvs/,
│                                 npm-cache/, npm-global/, npmrc, xdg/, playwright-browsers/, impeccable-home/,
│                                 avoid-ai-writing-src/ (full pinned tarball contents), locks/, snapshots/,
│                                 contain-allowlist.txt, git-config, README.md
├── .impeccable/                  Impeccable config (written by Impeccable, inside the workspace)
├── .claude/
│   ├── settings.json             (P3) env redirects (literal absolute paths), PreToolUse guard hook, Impeccable hooks
│   └── skills/{impeccable,avoid-ai-writing}/
└── main-app/                     (P4)
    ├── package.json  package-lock.json  .npmrc  .node-version  next.config.ts  tsconfig.json  biome.json
    ├── vitest.config.ts  playwright.config.ts  lighthouserc.json  cspell.json
    ├── CLAUDE.md                 hand-written; "@AGENTS.md" + pointer to ../context/00-START-HERE.md
    ├── AGENTS.md                 generated and maintained by Next; never hand-edited
    ├── PRODUCT.md  DESIGN.md     Impeccable design record (P4)
    ├── app/                      routes (§4.10), app/fonts/*.woff2
    ├── components/{ui,blocks,diagrams,editor,layout}/
    ├── lib/{content,progress,runner,registry,review,search}/
    ├── py-runtime/               worker source + harness.py + compat38.py + errors.py + vermin wheel → built to public/py/
    ├── public/py/                built worker (a static ES module, not bundled by Turbopack)
    ├── public/pyodide/314.0.7/   synced from node_modules with SHA-256 check (git-ignored)
    ├── content/                  course content (§4.6)
    ├── tools/{pycheck,links,lint,style}/
    ├── scripts/                  sync-pyodide, verify, content-status, render-slot, port-lease, assert-contained
    └── tests/{unit,e2e,visual,a11y,fixtures}/
```

### 4.4 Python runner

**Engine**
- Pyodide 314.0.7 is served from `/pyodide/314.0.7/`: about 13.4 MB raw, about 6.3 MB compressed.
- Loaded with `loadPyodide({ indexURL, lockFileURL, checkAPIVersion: true })`.
- `loadPackage` is never called for anything that isn't self-hosted.
- An E2E test fails if any request leaves the origin.

**Worker**
- `public/py/worker.mjs` is a static ES module, compiled from `py-runtime/` by a small esbuild step.
- It is started with `new Worker('/py/worker.mjs', { type: 'module' })`.
- Turbopack never bundles it, which avoids Next.js issue #98841 (module workers emitted as classic workers).

**Protocol**
- Messages: `init`, `check(code)`, `run(code, stdin, limits)`, `grade(code, tests[], limits)`.
- Results carry stdout, stderr, the exception (type, message, line, cleaned traceback), wall time per test, and a truncation flag.
- The UI shows the worker state as `data-py-status="loading|ready|running|crashed"`. E2E tests wait on this attribute, never on `networkidle`.

**Harness (`harness.py`), per test**
- A fresh globals dict.
- stdin is `TextIOWrapper(BytesIO(exact_bytes))`, plus `setStdin` with a `Uint8Array` of the same bytes. This makes all five idioms work: `input()`, `readline()`, `read()`, `sys.stdin.buffer.read()` and `open(0).read()`.
- stdout and stderr are captured to BytesIO, with a 1 MiB output cap.
- `setrecursionlimit(1000)`.
- `sys.set_int_max_str_digits(0)`, because CPython ≥3.11 refuses to print big integers that PyPy prints fine.
- The 3.8 runtime shim (§4.5, layer 2).
- A check for `input("…")` with a non-empty prompt. That is a classic CCC wrong-answer trap, so the learner gets a clear warning.

**Timeouts**
- Primary: `worker.terminate()`, then an instant swap to a **pre-warmed spare worker**. This works on any host.
- The SharedArrayBuffer interrupt, which gives "stopped at line N", is used **only when** `crossOriginIsolated` is true.
- Time limits are committed data (§4.6.4) and are multiplied by a **device factor**:
  - On first load the runner runs a 200 ms reference benchmark and computes `deviceFactor = clamp(measured / baseline, 1, 4)`.
  - The factor is stored in settings, so slower phones and tablets aren't failed for being slow.
  - The limit guards against infinite loops and wrong complexity classes. It **never** simulates the grader.

**Crashes**
A JS `RangeError` from deep recursion, or a wasm crash, becomes: respawn, then the verdict "Run-time Error (the program crashed; very deep recursion is a common cause, see Iterative DFS)".

**Beginner error explainer (`errors.py` + `content/errors.yaml`)** [DECIDED]
- Maps exceptions and common patterns to plain-language explanations with lesson links. Covered cases include:
  - `EOFError` from reading too many lines;
  - `IndentationError` and `TabError`;
  - `NameError` from typos (with a "did you mean", computed from the program's names);
  - `TypeError` from str + int;
  - `ValueError` from `int("3 4")`;
  - `IndexError`, `KeyError`, `ZeroDivisionError`, `RecursionError`;
  - a missing `print`;
  - printing a prompt.
- Tracebacks are cleaned: harness frames are removed, and line numbers refer to the learner's code.
- P5 builds the engine side. P8 writes the explanation copy in the teaching voice. Every entry has a unit test.

**Honest about speed**
- Browser Python is often 10–100× slower than the grader's PyPy on tight loops.
- The UI shows "Ran in your browser · 0.42 s" with an info popover (wording starts from w2 §2.4 and is finalised in P8). It never compares that time to 3 s.
- Real timing is checked on the linked judge (PyPy3) or with local PyPy 3.8, which Stage 2 teaches.

**Verdicts**
- The grader's vocabulary: Correct, Wrong Answer, Time Limit Exceeded, Run-time Error, Skipped, Compile Error.
- Plus **3.8 Compatibility Error**, which links to M1.15.

**[SPIKE] S-1** runs as the first task of P4, and its results go to `work/04-foundation/spike-S1.md`. It checks:
- Pyodide cold and warm start in 3 engines;
- the five stdin idioms, including EOF without a final newline;
- vermin `visit()` inside Pyodide;
- recursion depth per engine at the default limit and at a raised limit, and a clean `RangeError` catch;
- how long terminate-and-respawn takes with a spare;
- the `.wasm` MIME type on the local server;
- the device-factor benchmark on WebKit mobile emulation.

**[SPIKE] S-0** runs in P3 and checks two things:
- PyPy 7.3.9 runs under Rosetta on macOS 26;
- whether WMOJ offers a PyPy3 language, which M0.7 needs (a web check).

### 4.5 Python 3.8 compatibility (browser runs 3.14, grader runs 3.8)

Each layer catches gaps the others miss (see the measured matrix in w1 §4.1).

**Layer 1: in-browser static check.** Runs on Run and, debounced, while typing; results show as CodeMirror diagnostics.
- `ast.parse(feature_version=(3,8))`.
- **vermin 1.8.0**, a vendored wheel, with target 3.8 and `eval_annotations`.
- **`compat38.py`**, a custom AST and tokenize checker for what the others miss:
  - `math.gcd` / `math.lcm` arity;
  - `list[int]`-style subscripted builtins;
  - `.removeprefix`, `.removesuffix`, `.bit_count` and `.total` called on variables;
  - PEP 701 f-strings;
  - `X | Y` in annotations.
- Two severities:
  - **error** (a 3.9+ feature): **blocks Submit** but not Run;
  - **warning** (advisory, never blocks): `sys.setrecursionlimit` ("fine here; on the grader deep recursion may still crash, see iterative DFS"), `threading`, `sys.set_int_max_str_digits`.
- Every rule has a positive and a negative test. Messages are written for a beginner and link to M1.15.

**Layer 2: runtime shim** (in `compat38.py`).
- Deletes `math.lcm`, `math.cbrt`, `math.exp2`, `math.nextafter`, `math.ulp`, `functools.cache`, `itertools.pairwise`, `itertools.batched` and `random.randbytes`, plus `sys.set_int_max_str_digits` after the harness has used it.
- Wraps `bisect.*` to reject `key=`, `zip` to reject `strict=`, and `math.gcd` to reject more than 2 arguments.
- A meta-path finder blocks `zoneinfo`, `graphlib` and `tomllib`.
- Unit-tested under Pyodide running in Node.

**Layer 3: authoring gate** (`tools/pycheck/`, `npm run check:python`). It extracts **every** Python artefact: fenced `python` blocks, starters, solutions, rung solutions, decoys, generators, checkers and templates. Then it runs:
- `ruff check --target-version py38`, vermin (`-t=3.8- --eval-annotations --violations`) and `compat38.py`;
- `py_compile` under PyPy 3.8;
- every reference solution against all its tests under **PyPy 3.8 (7.3.11)**, with grader-like limits;
- the same references in **Pyodide under Node** with the real `harness.py`, within the in-app limit;
- at stage acceptance and release, the same runs under the **exact PyPy 7.3.9** (G-PY-EXACT).

Snippets that deliberately show a 3.9 failure are fenced `python bad38`, and layer 1 must **fail** them.

### 4.6 Content pipeline and content model

The content contract is w2 §3 (`w2-content-architecture.md`), with the overrides in this section and in §16.1 [DECIDED].
- It is implemented in P6.
- It is **frozen** in P8. `content/CONTRACT_VERSION` plus a schema hash are recorded in the P8 log. G-SCHEMA fails if the schema hash changes without a matching migration and a changelog ID.

#### 4.6.1 Principles

1. **Nothing checkable is typed by hand.** The build derives URLs, expected outputs, trace tables, subtask tables and constraint numbers from data or by running code.
2. **File types:**
   - prose → MDX;
   - data → YAML, validated by Zod;
   - code → real `.py` files.
3. **Stable IDs:**

   | Kind | Format | Example |
   |---|---|---|
   | Stage | `s0`–`s7` | `s4` |
   | Module | map ID | `M4.13`, `C.3` |
   | Lesson | `<module>/<slug>` | `M4.13/grid-bfs` |
   | Exercise | `<lesson>/<slug>` | `M4.13/grid-bfs/count-regions` |
   | Problem | judge slug | `ccc24s3` |

   Order lives in `course.yaml`, never in IDs, so M7.4 can come before M7.1.
4. **Content hash on every exercise**, so saved progress can detect content that changed underneath it.
5. **Fixed MDX component map.** Authors never import anything:
   - exercise blocks: `WorkedExample`, `Predict`, `Parsons`, `FillIn`, `Trace`, `Choice`, `Code`, `Debug`, `Explain`, `Reflect`, `ComplexityPick`, `VerdictDiagnosis`;
   - links: `ProblemCallout`, `ProblemLink`, `JudgeLink`;
   - text and runnable code: `Term`, `Callout`, `RunnableSnippet`;
   - diagrams: `Grid`, `Graph`, `Tree`, `ArrayPointers`, `DPTable`, `StepThrough`.

#### 4.6.2 Layout (`main-app/content/`)

```
course.yaml            ordered stages → modules (C.x placement), prereqs, prereqStages
concepts.yaml          detectable Python feature → introducing module
glossary.yaml          term → definition, introducedIn
errors.yaml            error explainer copy (§4.4)
ui/strings.yaml        ALL learner-facing UI copy (buttons, empty states, verdict help, speed popover, onboarding)
style/STYLE-GUIDE.md   voice + rules + hand-written sample;  style/house-skeleton.py
registry/ccc-problems.yaml   THE problem registry;  registry/verified.json   verification snapshot
registry/external-links.yaml allow-list (docs.python.org, CEMC pages, PyPy downloads, judge home/sign-up pages)
templates/<id>/        16 C.3 templates: template.py, harness.yaml, meta.yaml
stages/<sN-name>/stage.yaml
stages/<sN-name>/<ModuleId-slug>/module.yaml, lessons/*.mdx, checkpoint.yaml,
        exercises/<lesson>/<ex>.yaml, .starter.py, .solution.py, .decoy-*.py, .facts.json (generated, committed)
problems/<slug>/page.yaml, summary.mdx, editorial.mdx, solutions/*.py, tests/, gen/gen.py, checker.py, facts.json
mock-contests/<id>.yaml
timing/timing.json     measured time limits (G-TIMING, committed; never part of G-GEN)
```

Generated artefacts come in two kinds:

1. **Deterministic facts, committed** (`*.facts.json`, `facts.json`): predict outputs, traces, expected outputs and generated test inputs. The facts generator produces them with PyPy 3.8. G-GEN regenerates them and fails on any diff.
2. **Timing data, committed** (`timing/timing.json`): the median of N runs of each reference in headless Pyodide, recorded with machine and version. A serialised job measures it (§4.11). It is **excluded from G-GEN** and checked by G-TIMING.

`.generated/` and `public/tests/*.gz` are build output, git-ignored and rebuilt from the committed files. **`next build` never needs PyPy.**

#### 4.6.3 Block and exercise types

| Type | Grading | Hints | Stages |
|---|---|---|---|
| Worked example (subgoal-labelled steps) | none; optional self-explanation | — | all, heavy in 0–4 |
| Predict the output | typed answer against committed facts, then run it | explanation shown after | 0–3 |
| Choice / multi-select | answer key, with feedback per option on the misconception | the feedback | all |
| Parsons | assemble, then run the tests (any valid order passes). Distractors are absent at first and paired later. **Keyboard alternative** to drag (WCAG 2.5.7): move-up/down buttons and indent controls | 1 | 1–4 |
| Fill in the blanks | run the completed program against the tests | 1–2 | 1–3 |
| Trace table | cell by cell against the committed trace | 1 | 0–2 (plus queues and trees in 4–5) |
| Code / modify | test groups with batch semantics | 4 tiers + solution | all |
| Debug | tests (optionally "which line?" first) | 2–3 | 0–3, C.7 |
| Complexity pick | answer key per row | link to M2.9 | 2+, C.4 |
| Explain in plain English | self-assessed against a model answer | — | 1–3 |
| Reflection / upsolve log | ungraded; stored locally | — | 5+, C.9 |
| Verdict diagnosis | answer key | — | C.7 |
| CCC problem ladder (rungs mirror the subtasks) | test groups per rung; a checker where needed | 4 tiers per rung + editorial | 3+ |
| Template drill | harness tests with a stopwatch. Shows the learner's personal best and trend, with no goals | none | 4+ |

Hints come in the same tiers everywhere:
1. Nudge.
2. Approach, with a lesson link.
3. Plan.
4. Key code.
5. Solution.

The solution unlocks only after at least one run or 3 minutes on the exercise. Viewing it gives the status `completedWithSolution` and schedules a retry: "We'll bring this one back in a few days."

#### 4.6.4 Tests and comparison

**Test spec** (`TestSpec`, per w2 §3.5)
- Groups have `visible`, `kind: sample|correctness|complexity`, `batch`, and inline, file or generated tests.
- Expected outputs come from facts. Hand-checked `.out` files are used only for CCC samples, with attribution.

**Comparison modes**

| Mode | Behaviour |
|---|---|
| `lines` (default) | Ignores trailing whitespace on each line and trailing blank lines. Shows a format warning if the raw bytes differ. |
| `exact` | Byte-exact. Used for M0.4 mastery and C.8 drills. |
| `tokens` | Compares whitespace-separated tokens. |
| `float` | Numeric comparison with abs/rel tolerance. |
| `checker` | A Python checker returns `{ok, fraction?, msg}`. Needed for any-valid-answer problems, the half credit for a correct first line in 2024 S3, and hidden values. |

[DECIDED]: in-app comparison uses `lines`, which mirrors what the judges accept. The course still teaches exact output, because the CCC rules require it.

**Complexity groups**
- Size N so the reference runs in ≤ 1 s in headless Pyodide and the declared wrong-complexity decoy exceeds the limit by ≥ 10×. G-TIMING verifies both.
- Constant-factor inputs of 10⁶ tokens are left to the external judge.

**Limits**
- The limit is `clamp(8 × referenceMedian, 2 s, 15 s) × deviceFactor`.
- Memory limits are taught but not enforced in the browser.

**Official CEMC test data** is used **only in CI** to validate reference solutions. It lives in `work/cemc-cache/` and is never shipped (§15 Q-8).

#### 4.6.5 CCC problem pages

**From day one, all 119 problems have a page.** A problem without authored content shows a "registry-only" view:
- the title;
- "walkthrough coming";
- the subtask table;
- the judge link;
- "Used in" backlinks.

This means module practice sets never link to a missing page. An authored page has:
- a paraphrased summary with samples and CEMC attribution;
- the subtask table, rendered from data;
- the rung ladder (brute force → intermediate → full), with hints on each rung;
- the editorial: Read → Bank the partials → Insight → Full → Speed pass → Re-solve later;
- "Check the speed for real", with the judge link and the local PyPy command;
- "Used in" backlinks;
- an upsolve reflection box.

Rungs exist only where a verified reference solution exists. Feasibility notes sit in the registry's `internal` block, which is never rendered. A lint enforces this.

### 4.7 Problem registry and judge links (CRITICAL, app-wide)

**The registry**
- `content/registry/ccc-problems.yaml` holds one entry per **unique** problem: 119 for 2014–2026.
- Each entry has year, level, number, aliases, title, derived slug, `slugOverride` with evidence, topics, modules, difficulty, subtasks, output rule, commentary status, test-data status, an optional `judgeException`, and an `internal` block.

**URLs are derived and never stored or typed.** `judgeUrl()` builds them:
- 2020–2026: `https://wmoj.ca/problems/<slug>` (plural, no trailing slash);
- before 2020: `https://dmoj.ca/problem/<slug>/` (singular, trailing slash);
- any other year: a **build error** (§15 Q-9).

**Crossover problems** [DECIDED, Manager FYI]
- Some problems are both a Junior and a Senior problem: `ccc21j5` = `ccc21s2`, `ccc22j4` = `ccc22s2`, `ccc23j4` = `ccc23s1`, `ccc26j5` = `ccc26s2`, and the pre-2020 crossovers.
- Both judges host each one **once, under the Senior slug**. The registry stores one entry with Junior aliases.
- A Junior reference is shown as "2022 J4 (same problem as 2022 S2)", so the judge page title doesn't confuse the learner.

**The 2020 gap [MANAGER, §15 Q-1]**
- WMOJ has **no CCC 2020 problems**. W4 confirmed this against the sitemap and by fetching every slug.
- CCC 2020 has **9 unique problems**, because 2020 J5 = S2.
- **Recommended default:** link these 9 to DMOJ (`https://dmoj.ca/problem/ccc20j1/` … `ccc20s5/`, with `ccc20j5` → `ccc20s2/`). This is a registry exception, `judgeException: wmoj-missing-2020`, citing the Manager's decision ID.
- With the exception there are 56 WMOJ links and 63 DMOJ links.
- Until the Manager rules, 2020 entries render **without** an external link, and the release gate fails on them.

**Verification** (`tools/links/verify-judges.mjs`)
- Run manually or on a schedule, never inside the normal tests.
- **WMOJ (automated):**
  - Fetch `sitemap.xml` once, then GET each slug.
  - WMOJ returns **HTTP 200 even for missing problems**, so the status code proves nothing. Missing means the body contains `NEXT_HTTP_ERROR_FALLBACK`; present means the page contains statement text.
  - Record the judge's title and compare it with the registry.
- **DMOJ (Manager-assisted, primary path):**
  - Cloudflare blocks automated access. **We do not try to get past its challenge.**
  - The verifier generates `work/NN/dmoj-checklist.html`: about 63 DMOJ URLs with the expected titles and one checkbox each.
  - The main session asks the Manager to open them in a normal browser (about 10 minutes) and confirm.
  - Results are recorded with `method: manual`, the date, and who confirmed.
  - Optional alternative, only with explicit Manager approval and the Manager present: an agent reads the pages through the Manager's own open browser (claude-in-chrome).
- **Snapshot:**
  - Results go to the committed `registry/verified.json`, with `status: ok|missing|mismatch|unverified`, `checkedAt`, `method` and `titleOnJudge`.
  - Normal builds read only this snapshot.
  - A snapshot entry older than 90 days produces a warning.

**Gates**
- **G-LINK-FMT**: every emitted URL matches its year-band regex, and the exception register is respected. A 2020–2026 problem that resolves to DMOJ is an error unless its exception has been approved.
- **G-LINK-REF**: any plain-text CCC reference must be inside a registry component (`ProblemLink`, `ProblemCallout`) or on a reviewed allow-list. This covers MDX text, YAML strings and `ui/strings.yaml`. The patterns are:
  - `\b(19|20)\d{2}\s*[JS][1-5]\b`;
  - `J\d/S\d` crossover forms;
  - `ccc\d\d[js]\d`.
- **No raw judge URLs**: a raw `wmoj.ca` or `dmoj.ca` string anywhere outside the registry code is an error. The only exceptions are the judge home and sign-up URLs listed in `external-links.yaml`, rendered by `<JudgeLink site kind>` for M0.7.
- **Unit tests** on `judgeUrl()` at the 2019/2020 and 2026/2027 boundaries.
- **Release gate:** every referenced problem must be `ok` in `verified.json`.
- **No silent fallback:** a missing problem fails the check and is listed for the Manager.

**Non-CCC problems:** none are planned. If any are ever added, they go in a separate registry (§15 Q-7).

### 4.8 Progress, mastery, review

**Completion and mastery**
- **Lesson complete:** every `required` block is done.
- **Module complete:** every lesson is complete **and** the checkpoint is passed.
  - The checkpoint has 6–12 mixed items: about 70% from this module and about 30% from its prerequisites.
  - Every item must be correct, with up to 2 tries each.
  - Failing it points the learner to the specific lessons and offers a retake with fresh variants.
- **Mastered:** the checkpoint was passed without hints, **and** a spaced review 7 or more days later was passed. This shows as a quiet badge, **never as a percentage or a score**.

**Guided, never locked**
- A "Recommended next" path.
- Soft prerequisite banners: "This lesson uses lists (M1.8), which you haven't finished yet. Go to M1.8, or continue anyway."
- Test out by taking the checkpoint cold.
- Deferrable local-setup lessons come back at the start of Stage 2 (§15 Q-11).

**Spaced review**
- Leitner boxes at 1, 3, 7, 16 and 35 days, capped at 10 items a day.
- Items come from `reviewable` exercises, checkpoint items, the C.3 templates, and CCC re-solves. A problem finished with the editorial showing comes back after 7 days as "solve from scratch".

**C.3 drills**
- 16 canonical templates, each with a harness.
- A blank editor with no autocomplete and no snippets.
- Tracks the learner's personal best and trend, with **no time goals**.

**Storage**
- `ProgressDBv1` (w2 §4.5) in IndexedDB, validated with Zod on read.
- Ordered migrations, each with a fixture test.
- Export and import of one JSON file with a checksum, as a merge or a replace.
- Changed content keeps its record and gets an "updated" marker.
- Deleted content goes to `orphans` and is never dropped silently.

**CCC problem states:** not started → attempted → some rungs → all rungs. Whether per-subtask marks are shown depends on §15 Q-2 (default: yes, per problem only). Marks are never summed across problems or stages, and never compared with cutoffs or averages.

### 4.9 UI and design system

**Design record**
- Impeccable (installed in P3) writes and maintains `PRODUCT.md` and `DESIGN.md`. They cover:
  - the audience: an absolute beginner working through hundreds of lessons;
  - the tone: calm, encouraging, focused;
  - **light mode only**;
  - typography, spacing, colour tokens, reading-page mode for lessons, and component states.
- The tokens drive Tailwind `@theme`, the Shiki theme and the CodeMirror theme, so static and editable code look identical.

**Light mode only**
- `color-scheme: light` and `<meta name="color-scheme" content="light">`.
- G-UI-LIGHT fails on any `dark:` class, `prefers-color-scheme: dark`, or dark theme import.

**Accessibility (WCAG 2.2 AA)**
- Tab indents inside the editor, and the Escape-then-Tab escape hatch is documented.
- Diagrams have `<title>` / `<desc>` and a text alternative.
- Visible focus and adequate target sizes.
- A keyboard alternative for Parsons dragging.
- `StepThrough` respects reduced motion.

**Viewports**
- 390×844, 768×1024, 1440×900 and 1920×1080 (smoke tests).
- Lessons are designed for laptops first. Editing works on tablet and phone.

**Pixel standard**
- Every route template and component state has screenshot baselines.
- Every UI change gets an Opus visual review.
- Anything off is fixed immediately, even if it is unrelated to the task (§8).

### 4.10 App surface (routes)

| Route | Purpose |
|---|---|
| `/` | Dashboard: recommended next, today's review count, recent activity, backup reminder. No scores. |
| `/start` | Onboarding: how the course works, running code, browser advice, backups, what the CCC is (no targets). |
| `/learn` | Course map: stages → modules, with states and soft prerequisite edges. |
| `/learn/[stage]/[module]` | Module overview: objectives, lessons, practice set, checkpoint, related problems. |
| `/learn/[stage]/[module]/[lesson]` | Lesson reader with runner and hints; previous/next navigation. |
| `/learn/[stage]/[module]/checkpoint` | Module checkpoint. |
| `/problems` | Problem browser: filter by year, J/S, slot, topic, module, stage, personal status. |
| `/problems/[slug]` | Problem page, authored or registry-only (§4.6.5). |
| `/review` | Spaced review session. |
| `/drills`, `/drills/[template]` | C.3 drills. |
| `/mock`, `/mock/[id]` | Mock contests: 3-hour timer, 5 problems from the registry, grader-style per-subtask feedback (subject to Q-2). |
| `/search` | Search across lessons, glossary and problems (plus a search box in the header). |
| `/glossary` | Terms, each linked to the lesson that introduces it. |
| `/settings` | Export/import, editor font size, review cap, reset. |
| `/about` | Credits, CEMC attribution (CC BY-NC 4.0), judge acknowledgements, "this app is free". |

The build fails if a route is missing from the static params or from the E2E smoke list.

### 4.11 Shared-workspace concurrency and long-running processes [DECIDED]

Up to 5 workers can share `main-app/` at once. These rules keep builds, servers and timing from interfering. P6 builds the helper scripts and tests them.

**1. Fast checks never build.**
- `verify:fast --scope <id>` runs only:
  - schema checks;
  - single-scope pycheck;
  - the facts generator for that scope;
  - the style, R14, link and prerequisite lints.
- It writes only to `work/NN/_scratch/<scope>/`.
- It never runs `next build`, a server or a browser.

**2. Builds are serialised.**
- Every `next build` goes through `npm run render -- --slot <name>`. That command:
  - takes `.tooling/locks/build.lock`;
  - builds;
  - copies the export to `work/NN/_render/<slot>/out`;
  - releases the lock.
- Servers and browsers use only the slot copy, so serving never races a later build.

**3. Ports are leased.**
- `scripts/port-lease.mjs` hands out ports from a range, 4100–4199, and records the owner.
- Every background server writes `work/NN/_run/<name>.pid`, and the script that started it stops it.
- On resume, the orchestrator kills stale PIDs (§0.3).

**4. Timing is serialised.**
- G-TIMING and the timing measurement run under `.tooling/locks/timing.lock`, and only when no build or E2E run is active.
- The orchestrator schedules it at batch boundaries.

**5. Phase-exit checks run alone.**
- `verify:full` runs only when no worker is active. The orchestrator enforces this.
- Playwright writes its results to per-run output directories, `--output work/NN/_run/pw-<run>/`.

**6. Where to start servers.** Agents start long-lived servers with the harness's background mode and always stop them. A server is never left running at the end of a worker's task.

---

## 5. Pedagogy (from absolute zero to S5)

The adopted approach is w2 §2, which rests on this evidence: PRIMM, subgoal-labelled worked examples, fading, Parsons problems, enhanced error messages, mastery learning, tiered hints, and light spaced retrieval.

| Stages | Lesson shape | Scaffolding |
|---|---|---|
| 0–1 | **PRIMM micro-cycles**, one new idea per section: worked example → predict → run → investigate (trace or "change one thing") → modify → make | Maximum. Parsons without distractors at first. Completion problems whose blanks fade over time. The error explainer. Targeted feedback for known wrong outputs. |
| 2–3 | **Guided problem solving** with fixed subgoal labels: Read → Find the bounds → Work the sample by hand → Plan in words → Code → Test edge cases → Submit | Fading. From M3.10 the fast-I/O house skeleton is the default. |
| 4 | **Technique lessons**: concept and visual trace → template as a worked example → Parsons of the template → drill → CCC ladder | Medium. Each template joins the C.3 drill queue as soon as it is learned. |
| 5–7 | **Problem first**: annotate the subtask table → bank the partials → hint ladder to the insight → editorial with a proof sketch → Python speed pass → upsolve reflection → spaced re-solve | Low. Hints on demand; templates typed from memory. |
| C | Rules quizzes, verdict diagnosis, docs-lookup drills, stress-test labs, mock contests | — |

**Rules for every stage**
- **One new concept per section.** Define each term with `<Term>` the first time it appears.
- **Samples come first** in every code exercise.
- **"Bank the partials" is a habit, not a score.** Say "the grader keeps your best submission, so submit the brute force first", never "this earns N marks".
- **Say why templates are drilled:** the contest bans prewritten code.

**Performance is taught as a spiral** (w2 §2.3):

| Idea | Module |
|---|---|
| `join` instead of `+=` | M1.7 |
| `main()` and locals | M1.10 |
| Counting operations | M2.9 |
| Hidden costs of built-ins | M3.9 |
| Fast I/O as the house default | M3.10 |
| Iterative BFS/DFS as the default | M4.13, M5.7 |
| Bottom-up DP | M4.11, M5.12 |
| Flat arrays and int-encoded keys | M6.x |
| The "make it fast" lab, timed with local PyPy 3.8 | M7.12 |

**Curriculum corrections** (w2 §1.6)
- M0.7 teaches **both** judges: WMOJ for 2020–2026 (with the 2020 exception) and DMOJ before 2020, including sign-up and how to choose PyPy3.
- The local-setup lessons (the local part of M0.2, and M0.3) are `deferrable` and come back at the start of Stage 2 (§15 Q-11).
- M7.14 (C++) is out of scope (§15 Q-10).

**Must not leak from the recon files into the app** (w2 §1.5). Every content prompt quotes this list:
- the stage "Contest payoff" column;
- pacing milestones that carry scores;
- per-module lines such as "to 13/15" and "LIKELY IMPOSSIBLE in Python";
- the framing of the Python-infeasible table;
- `past-problems-analysis.md` §2.3 and §2.5;
- `ccc-format-and-rules.md` §7 cutoffs, and §8 items 1 and 10;
- the C.3 time goals;
- M7.14's rationale.

---

## 6. Content production model

### 6.1 Units of work

- **Module task:** one module's lessons, exercises, checkpoint and `module.yaml`, about 6–12k words. Tiny modules are paired:
  - M0.x modules, two per task;
  - C.1 goes with M0.7;
  - C.2 + C.10;
  - C.4 + C.6.
  - C.7 is its own task.
- **Problem-page batch:** 3–5 problems from one technique family.
- **Foundations** (P8, before any content phase):
  - the registry and its verification;
  - `course.yaml`, `concepts.yaml` and `glossary.yaml`;
  - the 16 templates and the house skeleton;
  - the style guide;
  - `ui/strings.yaml` and `errors.yaml`;
  - the CEMC cache;
  - the pilot.

### 6.2 Item lifecycle

Each item's `module.yaml` or `page.yaml` carries a `status` field:

| Status | Meaning |
|---|---|
| `planned` | Not started. |
| `drafted` | The author has finished. |
| `gated` | `verify:fast` is green for the scope. |
| `verified` | The independent verifier found no open defects. |
| `reviewed` | The critic signed off. |
| `accepted` | The orchestrator accepted it after cross-module checks. |

- Only `accepted` content ships, and the release gate requires every item in scope to be `accepted`.
- **Sampled review (J1–J3 pages only):**
  - The critic reviews at least one in three pages per batch, plus every page the verifier flags.
  - If the sample is clean, the whole batch becomes `reviewed`.
  - If any sample fails, the critic reviews the whole batch.
- `npm run content:status` writes `ledger.generated.md` (§13.3).

### 6.3 Voice and avoid-ai-writing

**Style guide** (`content/style/STYLE-GUIDE.md`, written in P8). It covers:
- the teaching voice: warm, plain, second person, short sentences in Stages 0–2, no hype, no clipped fragments, no judgments about the learner;
- vocabulary and a terminology lock (tied to the glossary);
- code conventions: the house skeleton, naming, 4-space indents, Python 3.8 only;
- banned patterns;
- formatting: sentence-case headings, and em dashes per the pilot's calibration;
- the R14 wording rules.

It also includes a **hand-written teaching-voice sample** of about 400–600 words. The sample overrides the skill's blog and social-media tone advice wherever the two conflict. **[MANAGER] Q-4:** the Manager writes the sample, or substantially rewrites a draft, and the style guide labels its origin honestly. P8 cannot start without it.

**Skill use.** Authors invoke avoid-ai-writing with the **`warm` voice and `docs` context** when drafting and when self-editing.

**Detector gate (G-STYLE)** [DECIDED]
- **Entry point.** `tools/style/detect.mjs` imports the `AIDetector` class from `.claude/skills/avoid-ai-writing/detector/patterns.js` directly. The pinned commit's CLI `bin/avoid-ai-writing.js` lives at the repo root, not in the skill folder. P3 copies the full pinned tarball to `.tooling/avoid-ai-writing-src/` for provenance and confirms which import path works.
- **Input.** Prose extracted from MDX (code, inline code and link targets removed), plus the string values in `ui/strings.yaml` and `errors.yaml`.
- **Metric.** For each file and each detector category:
  - **hard categories** must have 0 hits;
  - **soft categories** are measured as hits per 1,000 words.
- **Calibration** (P8).
  - Run the detector on the Manager's voice sample and on the accepted pilots.
  - Write `tools/style/thresholds.json`. Each soft threshold is the pilot maximum plus a stated margin. The hard list comes from the categories the style guide bans outright.
  - Once P8 is accepted, a threshold changes only through a changelog entry.
- **Style checker.** `scripts/check-style.js` runs with the workspace style config (exit 1 means a hard violation).
- **Readability** (Stages 0–2). Flesch-Kincaid grade ≤ 9 by default, tuned in P8. A warning for sentences over 30 words.

**Validator trigger**
- Before any rewrite pass, the author saves the original to `work/NN/_rewrites/<item>/<file>.orig`.
- G-STYLE runs `detector/validate.js <orig> <current>` on every pair it finds. It fails if code, tables, URLs or headings were corrupted, or if the rewrite added more flagged patterns than it removed.
- The verifier checks that pairs exist for every rewritten file.

**Pilot (P8)**
Three pilots cover every block type, both link rules and the checker machinery:

| Pilot | What it tests |
|---|---|
| **M1.1** "Variables and reassignment" | absolute-zero teaching |
| **M4.13** "Grid BFS and flood fill" | technique lesson; WMOJ and DMOJ callouts |
| **ccc24s3** "Swipe" page | ladder, half-credit checker, any-valid checker, editorial |

- The pilots go through the **exact pipeline P9–P16 use**: author, then verifier, then critic, then acceptance.
- P8 produces all five prompt templates, calibrates the thresholds, and measures time and cost for each unit.
- **The Manager approves the pilot before mass production starts.**

### 6.4 Model per content role [DECIDED]

Reasons are in §11.2.

| Content | Author | Verifier | Critic |
|---|---|---|---|
| Stage 0–4 modules | Opus | Sonnet | Opus |
| Stage 5–7 modules, templates, M2.9, M7.12 | Opus | **Opus** | Opus |
| J1–J3 problem pages (≈39) | **Sonnet** | Sonnet | Opus (sampled, §6.2) |
| J4/J5/S1/S2 problem pages (≈41) | Opus | Sonnet | Opus |
| S3–S5 problem pages (≈39) | Opus | **Opus** | Opus |
| Registry data, simple test generators, checkpoint and review variants, glossary | Sonnet | automated gates + **fact check against the CEMC cache** (Sonnet, P8) | Opus spot-check |

### 6.5 R14 wording rules

These rules are quoted in every content prompt.

- **Never mention:**
  - target scores, or "full marks" or a "perfect score" as a goal;
  - "realistic" scores or a "ceiling";
  - cutoffs, Distinction, honour roll or CCO qualification;
  - percentiles, averages of results, or medals;
  - that Python "can't" solve something or is "too slow".
- **Subtask marks** may appear only in the subtask table rendered from the registry and in the grader-style result view (Q-2).
- **Hard problems** get an "extension" section that explains the full algorithm, with no claim about what Python can reach.
- **G-R14** uses **narrowed** patterns (w2 §7 item 7, tightened):
  - `(score|mark)s?.{0,20}(ceiling|target)`, `realistic (score|ceiling|target)`, `\b\d{1,2}\s*/\s*75\b`;
  - `(qualif\w*|invit\w*).{0,20}CCO`;
  - `average (score|mark|result)s?`;
  - and so on.
  These leave legitimate teaching terms alone ("ceiling division", "average of the array"). The list lives in `tools/lint/r14-banned.json` with a reviewed allow-list, and it covers content **and** `ui/strings.yaml`.

### 6.6 Copyright

- **Paraphrase only.** An n-gram check against the locally cached statement fails on any run of 12 or more identical words outside sample I/O. The cache is `work/cemc-cache/`, extracted with pypdf from the workspace venv.
- **Attribution** renders on every problem page.
- **Free and non-commercial:** the app never charges for access.

### 6.7 What authors read (by content type)

The orchestrator writes each prompt with precise section references.

**All authors read:**
- the style guide, pilot exemplars and prompt template;
- their module's section of `curriculum-map.md` plus the objectives of its prerequisite modules;
- `concepts.yaml` and `glossary.yaml`;
- the relevant registry entries;
- the leak list.

**By content type:**

| Author | Also reads |
|---|---|
| Stage 1, 3 and 5–7 authors | `python-for-ccc.md`: 3.8 traps, fast I/O, recursion, performance |
| C-track authors (C.1, C.4, C.7, C.8, C.9) | `ccc-format-and-rules.md`: format, grader, rules |
| Problem-page authors | the problem's row in `past-problems-analysis.md`, the per-problem notes in `research/01-recon/_working/w2-junior-problems.md`, `w3-senior-s1-s3.md` or `w4-senior-s4-s5.md`, and the cached statement and official commentary |

Those recon files are also leak sources, so the leak list travels with them.

---

## 7. Quality gates

`verify:fast --scope` runs on every change (§4.11 rule 1). `verify:full` runs at batch acceptance, phase exit and release. **Each gate has a fixture showing it catches what it claims to catch.** Every gate blocks unless noted.

| ID | Gate | Tool | When |
|---|---|---|---|
| G-LINT | Biome, zero warnings | Biome | fast |
| G-TYPES | `tsc --noEmit` | TS | fast |
| G-UNIT | Unit tests: loader, schemas, `judgeUrl`, comparator, progress store and migrations, review scheduler, search index, harness / compat38 / errors in Node Pyodide | Vitest | fast |
| G-SCHEMA | Zod over all YAML and frontmatter. Unique IDs. Every reference resolves. Prerequisites match the map, form no cycle, and never point forward. `internal` never reaches the output. The contract hash matches (§4.6) | content:check | fast |
| G-PY-38 | ruff py38 + vermin + compat38 over every Python artefact. `bad38` fences must fail | check:python | fast |
| G-PY-RUN | References pass all their groups under PyPy 3.8 (7.3.11) and under Node Pyodide. CEMC official data passes where available | check:python | fast (scope) / full |
| G-PY-EXACT | The same, under exact PyPy 7.3.9 (Rosetta) | check:python --exact | stage acceptance, release |
| G-ADEQ | Every decoy fails exactly its `mustFailGroups`. Each rung solution fails the complexity groups of later rungs | check:python | fast |
| G-GEN | Deterministic facts regenerate with no diff (timing is excluded) | content:check | fast |
| G-TIMING | Serialised re-measure. Reference ≤ 1 s. Decoy ≥ 10× the limit. Within the tolerance band of `timing.json` | check:timing | batch acceptance, release |
| G-STYLE | Detector thresholds + check-style + validator pairs + readability (§6.3) | style:check | fast |
| G-R14 | Narrowed banned-pattern lint over prose, hints, feedback, `ui/strings.yaml`, `errors.yaml` and hard-coded strings in app code | lint:r14 | fast |
| G-LINK-FMT | URL formats per year band. Exception register. No raw judge URLs except the allow-listed home and sign-up pages. External URLs on the allow-list | content:check | fast |
| G-LINK-REF | Plain-text CCC references must be inside registry components (§4.7) | content:check | fast |
| G-LINK-LIVE | `verified.json` is `ok` for every referenced problem. Snapshot older than 90 days is a warning | content:check (snapshot); links:verify (live, manual) | release hard / phase exit warn |
| G-LINK-EXT | External non-judge links resolve | links:external (live, manual) | release |
| G-PREREQ | AST features checked against `concepts.yaml`, glossary terms against `introducedIn`, with the `preview` allow-list | content:check | fast |
| G-COPY | n-gram paraphrase check. Attribution present | content:check | fast |
| G-FACTS | Constraint numbers and marks in problem MDX appear only through data components | content:check | fast |
| G-SPELL | cspell with the domain dictionary | cspell | fast |
| G-MDX | remark-lint | remark | fast |
| G-BUILD | Static export succeeds. Route list is complete | Next | full |
| G-E2E | Functional suite on **Chromium, Firefox and WebKit** against a render slot (list follows this table) | Playwright | full (Chromium smoke in batch acceptance) |
| G-VISUAL | Screenshots of every route template and key state at 3 viewports on Chromium and WebKit, plus element-level shots of components. Animations off, fonts ready, dynamic parts masked. **`maxDiffPixels` ≤ 50 per shot.** Baselines come from this Mac with pinned browsers (Docker is rejected because it can't be contained). Updating a baseline needs an Opus visual-review note | Playwright | full |
| G-PAGE | On **every built page**: axe WCAG 2.2 AA with zero violations, plus no horizontal overflow at 390 px (`scrollWidth ≤ innerWidth`; code blocks scroll inside themselves) | Playwright + axe | full |
| G-UI-LIGHT | No dark styles anywhere | grep lint | fast |
| G-PERF | Lighthouse CI with two budgets. (a) Plain lesson: **no Pyodide code in any chunk**, and LCP, CLS, TBT and shared-JS budgets set as numbers in P4 and recorded in `lighthouserc.json`. (b) Runner page: interactive within its budget after the first interaction | @lhci/cli | full |
| G-FLAKE | New or changed E2E tests: `--repeat-each 10` (20 for runner or visual tests) with `--retries 0` before acceptance. Phase-exit runs use `--fail-on-flaky-tests`. **Zero flakes tolerated** | Playwright | on change + full |
| G-LINKS-INT | linkinator over the slot's `out/`: zero broken internal links or anchors (offline) | linkinator | full |
| G-CONTAIN | Before/after snapshot proof (§9) | contain-snapshot | every tool install or first run; phase exit of P3–P7; release |

G-E2E covers:
- boot;
- stdin idioms;
- grading pass and fail;
- infinite loop → timeout → the spare worker recovers;
- the 3.8 error blocks Submit;
- the hint reveal policy;
- checkpoint, review, drills, the mock timer and search;
- the export/import round-trip;
- **no request leaves the origin**.

---

## 8. Engineering standards (bind every build phase)

1. **Reproduce bugs end to end first.** Write a failing Playwright test, or the closest real-user harness, that shows the bug as the learner would meet it. Then fix it. The test stays as a regression test.
2. **Be picky about the UI.** Every UI-touching task ends with screenshots at 3 viewports and an Opus visual review. Fix misalignment, uneven spacing, clipped text, inconsistent radii or colours, focus rings and layout shift on the spot, **even when they are unrelated to the task**.
3. **Zero warnings, zero failures, zero flakes.** Any lint warning, type error, failing test or flaky test an agent sees gets fixed, even if the agent didn't cause it. If it is out of scope, the agent files it in the phase's `defects.md` as blocking. **Every phase exits with zero open defects**, unless the Manager approves deferring one.
4. **Quality over development cost.** Prefer the robust path.
5. **Keep it simple.** Add no dependency without a clear need. Have one way to do each thing. Share Zod schemas.
6. **Determinism.** Seeded generators, pinned versions, an offline build, no network in normal tests, timing kept out of G-GEN.
7. **Definition of done.** An item is done when `verify:fast` passes for its scope. A phase is done when `verify:full` passes.
8. **Generated files are never hand-edited.** That covers Next's `AGENTS.md`, `*.facts.json`, `ledger.generated.md`, `.generated/`, and anything a tool marks as generated. Change the source or the generator instead.

---

## 9. Containment and tooling (R15, operating-rules §7)

Details: `w3-containment.md`, with the overrides in §16.1 [DECIDED].

### 9.1 State lives in `.tooling/`

| Path | Contents |
|---|---|
| `node/` | Node 26.x tarball, SHA-verified |
| `uv/` | the uv binary from the **pinned GitHub release tarball** `uv-aarch64-apple-darwin.tar.gz`, verified against its `.sha256`. Never the install script, which edits shell profiles. Never the pre-existing `~/.local/bin/uv` |
| `uv/python/` | PyPy 7.3.11 via `uv python install pypy@3.8 --no-bin` |
| `pypy/` | 7.3.9 osx64, SHA-verified against pypy.org checksums |
| `venvs/tools/` | ruff, vermin, pypdf |
| `npm-cache/`, `npm-global/`, `npmrc` | npm state and config |
| `xdg/` | XDG cache, config, data and state |
| `playwright-browsers/` | all 3 engines |
| `impeccable-home/` | Impeccable engine |
| `avoid-ai-writing-src/` | the full pinned tarball, unpacked |
| `locks/`, `snapshots/` | concurrency locks and containment proofs |
| `contain-allowlist.txt` | backstop allow-list (§9.5) |
| `git-config` | empty; the contained git config |
| `bin/`, `README.md` | wrappers and guards; `README.md` documents every entry and its uninstall step |

### 9.2 Activation that holds in this harness

Each Bash call starts a fresh shell. The machine also has a global `uv` and Homebrew `node`/`npm` on `PATH`. Activation therefore works in four layers:

1. **Wrappers.**
   - `.tooling/bin/{node,npm,npx,uv,pypy38,pypy38-exact,ruff,vermin,pw}` each `source env.sh`, assert that the resolved binary sits under `.tooling/` or `main-app/node_modules/.bin`, then `exec`.
   - `CLAUDE.md` and every prompt say: **call tools only through `.tooling/bin/*` or `npm run …` (whose scripts use the wrappers); never bare `node`, `npm`, `npx`, `uv`, `pip` or `python3`.**
2. **Script guard.** Every npm script begins with `node scripts/assert-contained.mjs`. It fails unless all redirect variables point into the workspace.
3. **Hook guard.** A project `PreToolUse` Bash hook (`.tooling/bin/guard-bash`, registered in `.claude/settings.json`) rejects commands that invoke `npm`, `npx`, `node`, `uv`, `pip`, `python3`, `pypy`, `brew` or `playwright` other than through the wrappers or `npm run`. The rejection message names the correct wrapper. This enforcement is deterministic, not a convention.
4. **Env block.** The `.claude/settings.json` `env` block repeats the redirect variables as **literal absolute paths**. It does not set `PATH`; the wrappers handle that. P3 verifies these semantics empirically.

`HOME` is **not** overridden globally. `TMPDIR` is not redirected, because of Chromium's AF_UNIX path-length limit.

`env.sh` sets:
- the redirects listed in w3 §2;
- `PLAYWRIGHT_BROWSERS_PATH`;
- `NEXT_TELEMETRY_DISABLED=1`;
- `PUPPETEER_SKIP_DOWNLOAD=1` and `PUPPETEER_CACHE_DIR`;
- `CHROME_PATH`, pointing to Playwright's full Chromium, for LHCI;
- `UV_*` (including `UV_PYTHON_BIN_DIR` and `UV_NO_CONFIG`);
- `PIP_*`;
- `IMPECCABLE_HOME`;
- `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_SYSTEM`.

### 9.3 Session restart after P3 (mandatory)

Settings env, hooks and project skills load at session start. So P3 ends by asking the Manager to **restart the Claude Code session**. Then the first step of P4 (P3.5) spawns a **fresh subagent** that proves:
- `env` shows the redirects;
- the guard hook rejects a bare `npm -v`;
- `.tooling/bin/node -v` gives the workspace Node;
- both skills load through the Skill tool;
- the Impeccable hooks fire.

The result is recorded in the P4 log.

### 9.4 npx policy and skills

**npx**
- **Never run `npx <remote package>`.** It is allowed only for exact-pinned local devDependencies, through `npm exec --no -- <bin>` (for example `playwright install chromium firefox webkit`).
- `create-next-app` is not used.

**Skills**

| Skill | Pin | Install |
|---|---|---|
| **Impeccable** | `skill-v4.3.1` (still current on 2026-09-23) | Manual project-scope copy into `.claude/skills/impeccable/`. `IMPECCABLE_HOME=.tooling/impeccable-home`. Its launcher checksum-verifies the engine download. Hooks go only in the workspace `.claude/settings.json`. Config goes in `.impeccable/`. |
| **avoid-ai-writing** | exact commit `fc979c6489ec0ac81a77236782ba496da81b24cb` (tarball) | Unpack to `.tooling/avoid-ai-writing-src/`. Copy the `skills/avoid-ai-writing/` folder to `.claude/skills/avoid-ai-writing/`. Record the tarball's SHA-256. It has zero npm deps and runs with the workspace Node. |

**Never** install avoid-ai-writing via npx, `npm -g`, its MCP server, the plugin marketplace or user scope.

### 9.5 Proof protocol (G-CONTAIN)

`.tooling/bin/contain-snapshot before|after|diff`:

1. **Marker.** Touch a marker file.
2. **Before snapshot.** Stat-snapshot these paths:
   - the w3 §9 list;
   - WebKit and Firefox locations: `~/Library/WebKit`, `~/Library/Caches/com.apple.WebKit*`, `~/Library/HTTPStorages`, `~/Library/Saved Application State`, `~/Library/Application Support/Firefox`;
   - crash-report locations: `~/Library/Logs/DiagnosticReports`, Crashpad dirs;
   - `~/Library/Preferences/nextjs-nodejs`;
   - puppeteer and lighthouse caches.
3. **Run** the step.
4. **After snapshot** and diff.
5. **Backstop.** Run `find ~ -newer <marker> ! -path "<workspace>/*"`. Two rules apply to what it finds:
   - **(a) Hard fail.** Any new path outside the workspace whose name matches a project tool (node, npm, npx, playwright, chromium, webkit, firefox, pyodide, uv, pypy, python, next, impeccable, biome, lighthouse, lhci, puppeteer, cspell, vitest, esbuild) fails the proof, whatever the allow-list says.
   - **(b) Allow-listed noise.** Other paths may appear only if they match `.tooling/contain-allowlist.txt`: explicit globs with a reason each, for example Claude Code harness state and macOS system churn unrelated to our tools. Anything else fails.
   - The sweep has a runtime bound. macOS TCC permission errors are logged, not fatal.

Proof files go to `work/NN-<name>/containment/`, and the phase log summarises them.

### 9.6 Empirical checks P3 settles (stop and report if a tool can't be contained)

- Does the Next telemetry file get written despite `NEXT_TELEMETRY_DISABLED`? If so, run `next telemetry disable` in a narrowly `HOME`-scoped subshell, or report it.
- The Playwright crashpad location, for all 3 engines (add `--disable-crash-reporter` if needed). P4 does the first-run proof per engine.
- Where npx puts its `_npx` cache.
- uv and pip config paths.
- The first LHCI run (P4).

### 9.7 System-level traces (Manager acknowledgement, §15 Q-13)

macOS itself records some things that survive deleting the workspace:
- the Rosetta translation cache (`/var/db/oah`) for PyPy 7.3.9;
- LaunchServices registration of the browser app bundles;
- Gatekeeper and syspolicyd assessments;
- `TMPDIR` leftovers until the OS purges them;
- the Claude Code harness's own session files under `~/.claude/`.

These are owned by the system or the harness, not installed by us. They are listed openly, not hidden.

### 9.8 Machine prerequisites

- macOS on arm64.
- Rosetta 2, which is already present. If it is missing, **stop and report**. Never run `softwareupdate --install-rosetta`.

### 9.9 Uninstall

Delete the workspace. `.tooling/README.md` also documents removal tool by tool.

---

## 10. Version control and checkpoints [MANAGER, §15 Q-3]

**Recommendation**
1. In P3, run `git init` at the workspace root with the contained config: `GIT_CONFIG_GLOBAL=.tooling/git-config` (empty) and `GIT_CONFIG_SYSTEM=/dev/null`.
2. Set the identity in `.git/config` only. The Manager chooses it.
3. Add a `.gitignore` covering:
   - `.tooling/` state (keep `env.sh`, `README.md`, `bin/`, `contain-allowlist.txt`);
   - `node_modules/`, `.next/`, `out/`, `.generated/`, `public/pyodide/`, `public/tests/`, `test-results/`;
   - `work/**/_scratch/`, `_render/`, `_run/`;
   - `work/cemc-cache/`.
4. **Commit only when the Manager asks.** The recommended standing instruction: "commit a checkpoint at each phase end and before any redo".
5. Messages name the phase and its outcome. **No AI co-author lines and no agent names.** No remote or push unless the Manager sets one up.

**Fallback if git is declined**
- At each phase end the orchestrator writes `work/checkpoints/phase-NN-<timestamp>.tar.gz`, containing:
  - `context/`, `research/`, `work/` (minus caches, scratch, render and run directories);
  - `CLAUDE.md`;
  - `.claude/settings.json` and `.claude/skills/`;
  - `.tooling/{env.sh,README.md,bin,contain-allowlist.txt}`;
  - `main-app/` minus `node_modules`, `.next`, `out`, `public/pyodide`, `public/tests`.
- The tarball's SHA-256 goes into the phase log.

---

## 11. Agent orchestration system

### 11.1 Tiers [DECIDED]

| Tier | Role | Model | Spawns |
|---|---|---|---|
| 0 | **Main session.** Talks to the Manager, launches one phase orchestrator at a time, launches the report agent, records Manager rulings | the Manager's session | orchestrators, report agents |
| 1 | **Phase orchestrator.** Plans the phase within this plan, writes the stage brief, dispatches workers, runs acceptance, owns the context files and the render and timing schedule | **Opus** | workers |
| 2 | **Worker** | per §11.2 | **nothing** |

**No extra tier.** An earlier draft used stage leads (a third level) under multi-stage content phases. Three options were weighed:

| Option | Pros | Cons |
|---|---|---|
| (a) One orchestrator per big multi-stage phase | — | 150–250 worker returns: too much context |
| (b) Stage leads under it | Two stages can run in parallel | Needs 3-level nesting, which this harness hasn't verified. Changes operating-rules §2. Harder to resume |
| (c) **One phase per curriculum stage** | Each orchestrator holds one stage's arc (concept order, callbacks, running examples). The ordinary 3-tier model stays as it is. A Manager checkpoint after every stage | No parallelism across stages |

**(c) was chosen.** Its throughput cost is acceptable, because the Manager values quality and simplicity over development speed. If the Manager later wants more throughput, (b) can be added with a changelog entry after a nesting spike.

### 11.2 Model policy and role catalogue [DECIDED]

**Policy**
- **Opus** where judgment, architecture, teaching-quality writing, hard algorithms or review decide the outcome.
- **Sonnet** where the work is well specified, mechanical, high-volume, or verification against explicit criteria, **and** an automated gate or an Opus reviewer checks it afterwards.
- Every Opus writing role has independent checks after it.

| Role | Model | Why |
|---|---|---|
| All phase orchestrators | Opus | Their judgment steers everything. Lean context keeps them cheap. |
| P3 toolchain installer | **Opus** | Settles the hardest unknowns in containment. Stopping and reporting correctly takes judgment. |
| P3 skills installer | Opus | Impeccable is heavy (engine download, hooks). |
| Containment auditor (P3, P18) | Sonnet | Mechanical diffing against an explicit checklist. Independence matters more than the model. |
| P4 runtime spike engineer | Opus | Hard, novel runtime questions. |
| P4 scaffold/config engineer | Sonnet | Exact spec (§4.2, §4.3). The gates catch mistakes. |
| P4 design lead | Opus | Visual and product judgment with Impeccable. Sets the look for hundreds of pages. |
| UI/visual reviewer (P4–P7, P18) | Opus | Pixel-level critique from screenshots is judgment. |
| P5 runtime engineer | Opus | Worker lifecycle, stdin/stdout fidelity, timeouts, the 3.8 layers. |
| P5 error-explainer engineer | Sonnet | A specified mapping plus tests. P8 writes the copy. |
| Code reviewer / E2E lead (P5–P7) | Opus | Independent architecture and correctness review. Writes the E2E suites. |
| P6 content-pipeline engineer | Sonnet | Implements the fully specified contract (§4.6). Reviewed by Opus. |
| P6 quality-gate engineers (2) | Sonnet | Implement the specified gates (§7) with fixtures that prove them. |
| P6 concurrency/tooling engineer | Sonnet | Render slots, port leases, locks, pid files (§4.11). A clear spec. |
| P7 learner-experience engineers (2) | Opus | Interaction design for an absolute beginner. |
| P8 style-guide and copy author | Opus | Sets the voice for about 490k words, plus all UI and error copy. |
| P8 foundations/registry worker | Sonnet | Data entry from the recon files plus the CEMC cache. Gated. |
| P8 registry fact-checker | Sonnet | Compares data against cached statements using an explicit checklist. |
| P8 template author | Opus | Canonical code that gets copied everywhere. |
| P8 pilot author | Opus | Sets the reference for all content. One author, one voice. |
| P8 pilot verifier | Sonnet | Calibrates the verifier role exactly as P9–P16 will run it. |
| Pilot and content critic | Opus | Pedagogy rubric, a novice's read, voice, subtle R14 problems. |
| Module author (P9–P16) | Opus | Teaching-quality writing, misconception design, proofs. |
| J1–J3 page author (P12) | Sonnet | Short editorials and simple ladders. Sampled Opus critic plus all gates. |
| Other page authors (P13–P16) | Opus | Editorials, proofs, partial-marks ladders. |
| Content verifier, Stages 0–4 and J pages | Sonnet | Re-runs gates. Stress tests against a brute force for simple problems. A render and checklist review. |
| Content verifier, Stages 5–7 and S3–S5 pages | **Opus** | Correct brute forces and adversarial tests for hard problems. Spotting a wrong proof takes judgment. 2026 has no official commentary. |
| P17 novice walkers, Stages 0–2 | **Opus** | This is where confusing an absolute beginner matters most. Same reasoning as the P8 critic. |
| P17 novice walkers, Stages 3–7 and pages | Sonnet | High volume, following a fixed protocol and findings template. The Opus auditor triages. |
| P17 consistency auditor, fixers | Opus | Judgment and rewriting across the whole course. |
| P18 release QA, perf/security, handoff writer | Sonnet | Running suites, fixing flakes, patch bumps, docs. The Opus reviewer covers the visuals. |
| Manager-report agent | Sonnet (Opus for P2, P8, P18) | A short plain-language page. Opus where framing the decisions matters most. |

### 11.3 Prompt contract

**For spawners (orchestrators)**
- Always pass `subagent_type: "general-purpose"` and an explicit **`model: "opus"` or `model: "sonnet"`** as §11.2 specifies.
- **Never omit `model`. Never use `fork`**, which inherits the parent's model. Never use any other model value.
- Log each spawn (role, model, purpose) in the phase checklist.

**Every worker prompt contains:**

1. The no-spawn rule, verbatim: **"You must NOT spawn any subagents or use the Agent/Workflow tools. Do all work yourself."**
2. **"Do NOT install anything."** The only exception is a phase with an install authorisation (§12.0). There, the prompt names exactly what may be installed, and requires the wrappers and the G-CONTAIN proof.
3. **"Call tools only through `.tooling/bin/*` or `npm run …`; never bare node/npm/npx/uv/pip/python3."** (From P3 on.)
4. The files to read, by path and section, and what to skip.
5. The output location, plus "write your results to files before returning; return a summary of at most 10 lines with file paths".
6. App-wide rules (operating-rules §8):
   - **R13/D-008** links only through the registry; never type a judge URL;
   - **R14** with the §5 leak list and the §6.5 wording;
   - **Python 3.8 only**;
   - **light mode only**.
7. The §8 engineering standards, summarised, including the zero-defect rule and "never edit generated files".
8. **"Never commit and never add co-author lines. Write nothing outside the workspace. Put scratch files in `work/NN-<name>/_scratch/`, not in the harness scratchpad or /tmp. Do not write agent memory."**
9. For research tasks: "Web-search; treat prior knowledge as outdated; cite URLs" (D-003).
10. For tasks that run servers: the §4.11 rules (render slot, port lease, pid file, stop what you start).

### 11.4 Concurrency and continuation

- Orchestrators run **one at a time** (rules §2).
- At most **5 workers run concurrently** in any phase.
- The total number of spawns per phase is set in §11.6 (operating-rules allows this: "count per implementation-plan.md").
- **Fix loops continue the same worker with SendMessage.** If the worker is unavailable (§0.3), spawn a replacement with the defect list.
- The **first item of each content phase runs alone** as a calibration batch before any parallel work starts.

### 11.5 Swarm and Workflow approval points [MANAGER]

The Manager's rule: before anything spawns a large swarm, the main session explains the tradeoffs and gets explicit approval.

- **Content phases P9–P16 and the audit P17 each need Manager approval before launch.** The main session presents that phase's §11.6 budget and the tradeoff: quality from independent authoring, verifying and critiquing, weighed against token cost. The Manager may give a single blanket approval for P9–P16 based on the budget table (§15 Q-12).
- **The Workflow tool is not used anywhere by default.** Scripting the §11.7 pipeline with it would need a separate explicit approval, a changelog entry, and loading the `workflow-authoring` skill first.
- Phases P3–P8 and P18 have at most 5–7 spawns each. They need no swarm approval, but do need the launch approvals shown in §12.0.

### 11.6 Agent budget per phase

Estimates only; P8 recalibrates them.

| Phase | Orchestrator | Workers (model) | Total spawns |
|---|---|---|---|
| P3 Tooling | 1 Opus | installer (Opus), skills (Opus), auditor (Sonnet) | 4 |
| P4 Foundation | 1 Opus | P3.5 check (Sonnet), spike (Opus), scaffold (Sonnet), design lead (Opus), UI reviewer (Opus) | 6 |
| P5 Runtime | 1 Opus | runtime (Opus), error explainer (Sonnet), reviewer/E2E (Opus), UI reviewer (Opus) | 5 |
| P6 Pipeline & gates | 1 Opus | pipeline (Sonnet), 2× gates (Sonnet), concurrency tooling (Sonnet), reviewer (Opus) | 6 |
| P7 Learner experience | 1 Opus | 2× LX (Opus), reviewer/E2E (Opus), UI reviewer (Opus) | 5 |
| P8 Voice, foundations, pilot | 1 Opus | style/copy (Opus), foundations (Sonnet), fact-check (Sonnet), templates (Opus), pilot author (Opus), pilot verifier (Sonnet), critic (Opus) | 8 |
| P9 S0 + C.1 (8 modules) | 1 Opus | ≈5 authors, 2 verifiers (Sonnet), 2 critics | ≈10 |
| P10 S1 (15, minus pilot M1.1) | 1 Opus | ≈14 authors, 4 verifiers, 4 critics | ≈23 |
| P11 S2 + C.2, C.10 (11) | 1 Opus | ≈10 authors, 3 verifiers, 3 critics | ≈17 |
| P12 S3 + C.4, C.6 (12) + J1–J3 pages (39) | 1 Opus | ≈11 authors (Opus), ≈10 page batches (Sonnet), 6 verifiers (Sonnet), 6 critics | ≈34 |
| P13 S4 + C.3, C.7 (17, minus pilot M4.13) + J4/J5/S1/S2 pages (41) | 1 Opus | ≈16 authors, ≈10 page batches (Opus), 7 verifiers (Sonnet), 7 critics | ≈41 |
| P14 S5 + C.5, C.8 (15) + S3 pages (12, minus pilot) | 1 Opus | ≈15 authors, ≈3 page batches, 5 verifiers (Opus), 5 critics | ≈29 |
| P15 S6 (13) + S4 pages (13) | 1 Opus | ≈13 authors, ≈4 page batches, 5 verifiers (Opus), 5 critics | ≈28 |
| P16 S7 + C.9 (14) + S5 pages (13) + 26 mocks | 1 Opus | ≈14 authors, ≈4 page batches, 1 mock builder (Sonnet), 5 verifiers (Opus), 5 critics | ≈30 |
| P17 Audit | 1 Opus | ≈4 walkers (Opus, S0–S2), ≈18 walkers (Sonnet, about 8 modules or 15 pages each), consistency auditor (Opus), 2 fixers (Opus) | ≈26 |
| P18 Release | 1 Opus | QA (Sonnet), visual reviewer (Opus), perf/security (Sonnet), auditor (Sonnet), handoff (Sonnet) | 6 |
| Reports | — | 1 per phase | 16 |

Authors and critics are Opus unless marked.

### 11.7 Content item pipeline (P8–P16)

1. **Brief.** The orchestrator writes a **stage brief**, `work/NN/brief.md`, covering: module order, concept introductions, running examples, callbacks to earlier stages, page batching, and the C-module placement.
2. **Author** (model per §6.4).
   - Reads the §6.7 list.
   - Writes the package using avoid-ai-writing (warm + docs).
   - Saves the original of any file before rewriting it (§6.3).
   - Runs `verify:fast --scope <id>` until it is green.
   - Sets `status: gated` and returns at most 10 lines.
3. **Verifier**, per batch of 3–5 items.
   - Independently re-runs the gates.
   - Writes stress tests against a brute force for every code exercise and rung.
   - Checks the hint ladders (tier 1 must never give away the answer).
   - Requests a render slot and screenshots every page at 3 viewports.
   - Checks R13, R14, prerequisites, and that the validator pairs exist.
   - Files defects in `defects.md`, and sets `verified` on items with no open defects.
4. **Critic**, per batch.
   - Applies the pedagogy rubric (w2 §7 item 12 plus §5).
   - Reads as a novice would, and checks voice and subtle R14 leaks.
   - Files findings, and sets `reviewed` on clean items.
5. **Fixes.** Findings go back to the **same author** via SendMessage. After a fix, the changed parts go through the gates and a verifier re-check again.
6. **Acceptance** by the orchestrator:
   - continuity across the batch;
   - G-TIMING and G-PY-EXACT for the batch;
   - a Chromium E2E smoke run;
   - visual review;
   - then `accepted`, and `progress.md` updated at milestones.
7. **Phase exit.** `verify:full` runs, and the report assets are produced (§11.8).

### 11.8 Manager reports (after every phase)

**The phase orchestrator produces the assets.** At phase end it writes `work/NN/report-assets/`:
- PNG screenshots of real pages, taken from a render slot;
- for P5 and P7, a short compressed WebM or GIF;
- `summary.md`.

**The report agent** (model per §11.2, spawned by the main session):
- reads the phase log and those assets, **and runs no tools**;
- loads `artifact-design` for design guidance only;
- writes one self-contained **light-theme** HTML file to `~/Desktop/et-ccc-phase-NN-<name>-report.html`, with a copy in `manager-reports/`;
- embeds images as base64 `data:` URIs, with the whole file at most 8 MB;
- **never publishes**;
- writes in plain language: what happened, what was found and decided, what needs the Manager, and what comes next.

---

## 12. Phase plan

### 12.0 Phase index

| # | Name (orchestrator) | Log | `work/` dir | Installs authorised | Swarm approval | Manager hard gate at end |
|---|---|---|---|---|---|---|
| 3 | Tooling & containment (`tooling-orchestrator`) | `phase-03-tooling.md` | `work/03-tooling/` | Node, uv, PyPy ×2, tools venv, both skills, git (if Q-3) | no | session restart; containment proof |
| 4 | Foundation, spike & design (`foundation-orchestrator`) | `phase-04-foundation.md` | `work/04-foundation/` | npm deps in `main-app/`, Playwright engines, LHCI | no | look & feel approval |
| 5 | Python runtime (`runtime-orchestrator`) | `phase-05-runtime.md` | `work/05-runtime/` | npm deps (editor, pyodide already present) | no | runtime demo |
| 6 | Content pipeline & gates (`pipeline-orchestrator`) | `phase-06-pipeline.md` | `work/06-pipeline/` | npm deps (mdx, lint, cspell, linkinator); venv additions | no | gates proven |
| 7 | Learner experience (`lx-orchestrator`) | `phase-07-lx.md` | `work/07-lx/` | npm deps (idb, minisearch) | no | LX demo |
| 8 | Voice, foundations & pilot (`pilot-orchestrator`) | `phase-08-pilot.md` | `work/08-pilot/` | venv addition (pypdf) if not yet present | no | **HARD: voice & pilot approval** |
| 9 | Content S0 + C.1 (`content-orchestrator`) | `phase-09-content-s0.md` | `work/09-content-s0/` | none | **yes** | sample review |
| 10 | Content S1 | `phase-10-content-s1.md` | `work/10-content-s1/` | none | **yes** | sample review |
| 11 | Content S2 + C.2, C.10 | `phase-11-content-s2.md` | `work/11-content-s2/` | none | **yes** | sample review |
| 12 | Content S3 + C.4, C.6 + J1–J3 pages | `phase-12-content-s3.md` | `work/12-content-s3/` | none | **yes** | sample review |
| 13 | Content S4 + C.3, C.7 + J4/J5/S1/S2 pages | `phase-13-content-s4.md` | `work/13-content-s4/` | none | **yes** | sample review |
| 14 | Content S5 + C.5, C.8 + S3 pages | `phase-14-content-s5.md` | `work/14-content-s5/` | none | **yes** | sample review |
| 15 | Content S6 + S4 pages | `phase-15-content-s6.md` | `work/15-content-s6/` | none | **yes** | sample review |
| 16 | Content S7 + C.9 + S5 pages + mocks | `phase-16-content-s7.md` | `work/16-content-s7/` | none | **yes** | sample review |
| 17 | Whole-course audit (`audit-orchestrator`) | `phase-17-audit.md` | `work/17-audit/` | none | **yes** | approve deferrals |
| 18 | Release QA & handoff (`release-orchestrator`) | `phase-18-release.md` | `work/18-release/` | patch bumps only | no | **HARD: final acceptance + deploy decision** |
| 19 | Maintenance (on demand) | `phase-19-maint-<date>.md` | `work/19-maint-<date>/` | patch bumps | no | per run |

Manager reports are named `~/Desktop/et-ccc-phase-NN-<name>-report.html`, using the log's name.

**Applies to every phase:**
- Start and finish follow operating-rules §3.
- Every phase starts only when the main session launches it. Phases that install need explicit install authorisation (rules §2).
- Exit requires **zero open defects**, `verify:full` green (from P4 on), and a clean G-CONTAIN whenever tools were installed or first run.
- The phase writes its report assets.
- A git checkpoint is taken if Q-3 was approved.
- "Read first" always means: `00-START-HERE.md`, this plan §0–§3 plus your phase, `progress.md`, `decisions.md`, the previous phase's log, **plus** whatever the phase lists.

### P3 Tooling and containment

- **Goal:**
  - `.tooling/` with wrappers, the guard hook and the settings env block;
  - `env.sh`, `contain-snapshot` and the allow-list;
  - Node 26.x, uv, PyPy 7.3.11 and 7.3.9, and the tools venv;
  - both skills installed and smoke-tested (the Impeccable engine lands in `IMPECCABLE_HOME`; the avoid-ai-writing detector, imported via `tools/style`-style code, runs on a sample);
  - `CLAUDE.md`;
  - git, if Q-3 is approved;
  - Spike S-0 (§4.4).
- **Entry:** the plan is approved; install authorisation; rulings on Q-3 and Q-13.
- **Read first:**
  - `w3-containment.md` (all; the §16.1 overrides apply);
  - `research/01-recon/design-skill-recommendation.md` (install section);
  - `research/02-writing-style-skill/recommendation.md` (runner-up section);
  - §9 of this plan.
- **Agents:**
  - **installer** (Opus): writes the snapshot tooling first and takes the "before" snapshot, installs, settles the §9.6 checks, runs S-0;
  - **skills installer** (Opus): Impeccable and avoid-ai-writing;
  - **auditor** (Sonnet): the "after" snapshot, diff and backstop; checks the wrappers and guard; writes the `.tooling/README.md` uninstall steps.
- **Deliverables:** `.tooling/**`, `.claude/settings.json`, `.claude/skills/**`, `.impeccable/`, `CLAUDE.md`, `work/03-tooling/{containment/,tool-versions.md,spike-S0.md}`.
- **Exit:**
  - the proof is clean;
  - every wrapper resolves inside the workspace;
  - the guard rejects bare calls;
  - the detector and the Impeccable engine work;
  - **the Manager restarts the session** (§9.3).

### P4 Foundation, runtime spike and design system

- **Goal:**
  - Step 1: the P3.5 fresh-agent verification (§9.3).
  - Step 2: Spike S-1 (§4.4), in a minimal `main-app/` scaffold.
  - Then:
    - the full manual scaffold (no `create-next-app`) with the §4.2 pins, static export, Biome, TS, Vitest, Playwright with 3 engines (a first-run containment proof per engine), axe, linkinator, cspell, remark-lint and LHCI (filesystem upload, first-run proof);
    - `verify:fast` / `verify:full` skeletons including G-UI-LIGHT and G-PAGE;
    - `sync-pyodide`;
    - Impeccable `teach` → `PRODUCT.md` / `DESIGN.md`;
    - tokens flowing into the Tailwind, Shiki and CodeMirror themes; fonts; base components;
    - the app shell with every §4.10 route stubbed;
    - the first visual baselines;
    - the Lighthouse budget numbers;
    - `main-app/CLAUDE.md` (with `@AGENTS.md`).
- **Entry:** P3 is done and the session has restarted.
- **Read first:** §4, §7, §8, §9.3, and `w1-tech-stack.md` §1–§3 and §5–§8.
- **Agents:** P3.5 check (Sonnet); spike (Opus); scaffold (Sonnet); design lead (Opus, uses Impeccable); UI reviewer (Opus).
- **Deliverables:** `main-app/**` (shell), `PRODUCT.md`, `DESIGN.md`, `work/04-foundation/{p3.5-check.md,spike-S1.md,design-review.md,containment/}`.
- **Exit:**
  - `verify:full` is green on the shell: build, E2E smoke in 3 engines, baselines, G-PAGE, plain-page LHCI budget, no dark styles;
  - the S-1 findings are written up, and any adaptations stay within [DECIDED] items;
  - the UI reviewer signs off.
- **Manager checkpoint:** approve the look and feel from the report screenshots. A redo is cheap at this point.

### P5 Python runtime

- **Goal:**
  - §4.4 in full: worker, harness, spare-worker timeouts, device factor, crash handling, verdicts, the speed popover;
  - §4.5 layers 1 and 2;
  - the CodeMirror editor with the light theme and lint gutter;
  - the error-explainer engine with placeholder copy;
  - a Run/Submit panel component;
  - E2E for all runner behaviour on 3 engines, with burn-in.
- **Entry:** P4 is done; the look is approved.
- **Read first:** §4.4, §4.5, §7, §8, `w1-tech-stack.md` §3–§5, `research/01-recon/python-for-ccc.md` (grader env, 3.8 traps, fast I/O), and `work/04-foundation/spike-S1.md`.
- **Agents:** runtime engineer (Opus); error explainer (Sonnet); reviewer/E2E lead (Opus); UI reviewer (Opus).
- **Exit:** `verify:full` green; G-FLAKE burn-in clean; the runner demo recording is in the report assets.
- **Manager checkpoint:** the runtime demo.

### P6 Content pipeline and quality gates

- **Goal:**
  - the §4.6 loader, Zod schemas, MDX component map (rendering stubs for the block UIs P7 will finish), facts generator, timing job, `content:check` / `content:status`, and contract versioning;
  - the §4.7 registry code: `judgeUrl`, `JudgeLink`, `verify-judges`, the DMOJ checklist generator;
  - every §7 gate, each with fixtures that fail it;
  - `tools/pycheck` (layer 3);
  - the §4.11 concurrency tooling;
  - synthetic fixture content in `tests/fixtures/content/` covering every block type and edge case (checker half credit, float, any-valid, crossover, the 2020 exception placeholder, `bad38`).
- **Entry:** P5 is done.
- **Read first:** §4.6, §4.7, §4.11, §6.2–§6.6, §7, `w2-content-architecture.md` §3 and §7, `w4-links-and-qa.md` Part A.
- **Agents:** pipeline (Sonnet); gates A: python/timing/facts (Sonnet); gates B: style/R14/links/prereq/copy (Sonnet); concurrency tooling (Sonnet); reviewer (Opus).
- **Exit:**
  - every gate is proven by a fixture;
  - `verify:full` is green on the fixtures;
  - the first **WMOJ** automated verification has run for all 119 registry stubs, with its report listing the 2020 gap and the crossovers.
- **Manager checkpoint:** gates proven; rulings on Q-1 and Q-2 are needed before P7.

### P7 Learner experience

- **Goal:**
  - full UI for every §4.6.3 block type (including the Parsons keyboard alternative), hints and the reveal policy;
  - the problem page, including the registry-only view for all 119;
  - checkpoints; progress store, migrations and export/import;
  - review, drills and the mock-contest UI (per Q-2);
  - dashboard, course map, search, glossary and settings;
  - onboarding and about pages, wired to `ui/strings.yaml` with placeholder copy;
  - E2E and visual coverage of every state.
- **Entry:** P6 is done; Q-1 and Q-2 are ruled on; Q-6 is answered.
- **Read first:** §4.6–§4.10, §7, §8, `w2-content-architecture.md` §3.4 and §4.
- **Agents:** LX-A (Opus: blocks, hints, problem pages, mocks); LX-B (Opus: progress, review, drills, dashboard, search, settings); reviewer/E2E (Opus); UI reviewer (Opus).
- **Exit:** `verify:full` green with the fixture content; zero defects; the demo recording is in the report assets.
- **Manager checkpoint:** the LX demo.

### P8 Voice, foundations and pilot

- **Goal:**
  - **Style guide** with the **Manager's voice sample**. All real `ui/strings.yaml`, `errors.yaml` and onboarding copy, written in the voice.
  - **CEMC cache** (`work/cemc-cache/`): statements, commentaries and official test data, with licence notes. PDF text is extracted with the venv's pypdf.
  - **Registry:** all 119 entries plus the Q-1 handling, then:
    - a fact check of subtasks and constraints against the cache;
    - WMOJ re-verification;
    - **the Manager-assisted DMOJ checklist**;
    - the `verified.json` snapshot.
  - **Course data:** `course.yaml`, `concepts.yaml` and `glossary.yaml`.
  - **Templates:** the 16 C.3 templates and the house skeleton, passing G-PY-EXACT.
  - **Three pilots** run through the full §11.7 pipeline.
  - **Calibration:** `thresholds.json`.
  - **Prompt templates** in `work/08-pilot/prompt-templates/`: author, page author, verifier, critic, and acceptance checklist.
  - **Recalibration** of §2.2 and §11.6 via a changelog request.
  - **Contract freeze** (§4.6).
- **Entry:** P7 is done; the voice sample exists (Q-4); Q-10 and Q-11 are ruled on.
- **Read first:**
  - §5, §6, §7, §11.7;
  - `w2-content-architecture.md` (all);
  - `curriculum-map.md`: the Stage overview, M1.1, M4.13, and the adjacency list;
  - the `past-problems-analysis.md` 2024 S3 row and the `_working/w3-senior-s1-s3.md` 2024 S3 notes;
  - `research/02-writing-style-skill/recommendation.md`;
  - `.claude/skills/avoid-ai-writing/SKILL.md`.
- **Agents:** style/copy (Opus); foundations (Sonnet); fact-check (Sonnet); templates (Opus); pilot author (Opus); pilot verifier (Sonnet); critic (Opus).
- **Exit:**
  - the pilots are `accepted` with every gate green;
  - `verified.json` is `ok` for every problem (or awaiting the Manager's DMOJ confirmation, which is listed);
  - the contract is frozen;
  - calibration and prompt templates are written.
- **HARD GATE:** the Manager reads the three pilots (from the report's screenshots and HTML, or live) and **approves voice and format**. No content phase starts without this approval.

### P9–P16 Content phases (one per curriculum stage)

The scope of each phase is in §12.0 and §11.6.

- **Entry for each:**
  - the previous phase is done;
  - **swarm approval** (§11.5);
  - for P9, the P8 hard gate has passed;
  - for P14–P16, the **first task** re-checks the 2026 Senior commentary, the 2026 S5 solution and any grader change (map note 5), and updates the registry.
- **Read first:**
  - §5, §6, §7, §11.7;
  - `work/08-pilot/prompt-templates/` and the style guide;
  - the previous content phase's `lessons-learned` section in `defects.md`;
  - this phase's `ledger.generated.md` and `defects.md` if resuming.
- **Flow:**
  1. Write the stage brief.
  2. Run the calibration item alone.
  3. Run batches through the §11.7 pipeline, with at most 5 concurrent workers.
  4. Accept each batch.
  5. Run a cross-module continuity pass (the orchestrator, or one critic continuation).
  6. Run `verify:full` including G-PY-EXACT, G-TIMING, G-VISUAL and G-PAGE on all new pages.
- **Deliverables:** content under `main-app/content/`; `work/NN/{brief.md,ledger.generated.md,defects.md,report-assets/}`.
- **Exit:** every item in scope is `accepted`; zero open defects; `verify:full` green.
- **Manager checkpoint:** sample review. The Manager may send any module back for a redo (§13.4).

### P17 Whole-course audit

- **Goal:**
  - Novice walkthroughs of every lesson and page in a served build. Walkers follow a fixed protocol: do every exercise as a beginner would, and record confusion, difficulty jumps, broken flows and UI defects in a findings template.
  - A cross-course consistency audit: terminology, prerequisite order, duplication, voice drift, R14, templates, running examples.
  - Fixes. Engine bugs go through §8.1 (E2E reproduction first).
  - Live link re-verification (WMOJ automated; the DMOJ checklist again if the snapshot is older than 90 days).
- **Entry:** P16 is done; swarm approval.
- **Agents:** §11.6: walkers are chunked at about 8 modules or 15 pages each.
- **Exit:** every finding is closed, or deferred with Manager approval; `verify:full`, G-LINK-LIVE and G-LINK-EXT are green.

### P18 Release QA and handoff

- **Goal:**
  - `verify:full` in 3 engines with burn-in (`--repeat-each 20` on the runner and visual suites);
  - a manual keyboard and VoiceOver pass on the editor and runner;
  - a pixel review of every route template;
  - the LHCI budgets;
  - patch bumps (the Next security line) with re-verification;
  - the "no request leaves the origin" check;
  - the final G-CONTAIN audit of all project tooling;
  - handoff: `main-app/README.md` (build, serve locally, back up and restore progress, update) and a check of `/start`;
  - deployment per Q-5. A hosting CLI must be contained or run by the Manager; otherwise the deliverable is a local-serve package.
- **Agents:** QA (Sonnet); visual reviewer (Opus); perf/security (Sonnet); containment auditor (Sonnet); handoff writer (Sonnet).
- **HARD GATE:** final Manager acceptance and the deployment decision.

### P19 Maintenance (on demand)

Covers:
- link re-verification when the snapshot is older than 90 days;
- Next.js and Pyodide patch bumps;
- CCC 2027+ problems (after Q-9);
- a check of the grader's Python version before each contest season. If the grader moves off PyPy 3.8, §4.5 is revisited through the changelog.

Each run has 1–3 workers and follows the same protocol.

---

## 13. Context and resumption protocol

### 13.1 Who updates what

| File | Who | When |
|---|---|---|
| `progress.md` | Phase orchestrator | Phase start (IN PROGRESS, worker plan with models); after every worker or batch (checklist line with output path); phase end (DONE, pointers) |
| `decisions.md` | Orchestrator appends; main session records Manager rulings | When a decision is made. `[MANAGER]` items go under Pending Manager approval |
| `phase-logs/phase-NN-<name>.md` | Orchestrator | Phase end. On a redo it is rewritten and the old version kept as `.v<k>` |
| `work/NN/ledger.generated.md` | `npm run content:status` only | After every status change |
| `work/NN/defects.md` | Orchestrator, verifiers, critics | Defects (ID, item, severity, found by, status) plus a "lessons learned" section for the next phase |
| `implementation-plan.md` | Main session only, after Manager approval | Every change, with a changelog row |
| `00-START-HERE.md`, `operating-rules.md`, `project-brief.md` | Main session only | When the Manager changes process or requirements |

### 13.2 What makes a phase resumable

- Workers write files **before** returning. A return with no file counts as not done.
- Checklist lines name the output files.
- Content items carry `status` in their own YAML, so `content:status` rebuilds the ledger at any time.
- Stage briefs and prompt templates are files, so a replacement agent receives identical instructions.
- PID files and locks make stale processes discoverable (§4.11).

### 13.3 Content ledger

- `ledger.generated.md` is generated from content YAML: item, type, author model, status, gates, verifier, critic, and open defect count. It is **never hand-edited**.
- `defects.md` is hand-kept and holds the defects and lessons learned.

### 13.4 Redos and critiques

Per operating-rules §6:
- The old log becomes `.v<k>`.
- Superseded artefacts go to `work/NN/_superseded/v<k>/`, including the previous module folders for content redos.
- The critique is recorded in `decisions.md` and `progress.md`.
- The redo explicitly addresses the critique.

A redo of an early phase after content exists (for example, the P4 look and feel) must list and fix the knock-on effects in the same phase: baselines, screenshots and tokens.

---

## 14. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| R-1 | Browser Python is 3.14 while the grader runs 3.8 | Three layers (§4.5) plus exact PyPy gates. |
| R-2 | Browser speed differs from the grader's by 10–100×, and learners trust browser timings | Tests check complexity class only. Honest copy. A device factor. Judge links for real timing. The difference is taught in M0.2, M2.9, M3.10 and every Stage 5+ page. |
| R-3 | Recursion depth differs, and deep recursion can throw a fatal `RangeError` | Reset the limit per run. Advisory warnings. Deep-input tests. Respawn after a crash. Iterative DFS is taught as the default. |
| R-4 | WMOJ lacks 2020; DMOJ blocks automation | Registry exception (Q-1). Manager-assisted DMOJ checklist. Committed snapshot. Release gate. |
| R-5 | Judges rename or remove problems | P19 re-verification. Snapshot age warning. `slugOverride` with evidence. |
| R-6 | Score framing leaks from recon | Leak list in every prompt. G-R14 over content and UI. Critics. M7.14 dropped. |
| R-7 | AI-sounding prose at about 490k words | Skill (warm + docs). Detector with calibrated thresholds. Validator. Hand-written voice sample. Pilot. Opus critics. |
| R-8 | Voice and quality drift across phases | Pilot exemplars. Shared prompt templates. Stage briefs. Continuity passes. `defects.md` lessons carried forward. P17 audit. |
| R-9 | Rosetta ends after macOS 27, which removes the exact 7.3.9 check | Native 7.3.11 as the everyday gate. Long-term, a linux64 7.3.9 runner (changelog entry). |
| R-10 | Turbopack module-worker bug | The worker is a static file, not bundled. |
| R-11 | Safari storage eviction | Onboarding advice, backup reminders, export/import, `persist()`. |
| R-12 | Containment leak through bare tool calls or unknown paths | Wrappers, npm-script guard, PreToolUse hook, backstop with hard-fail names, session restart and P3.5 verification. |
| R-13 | Flaky E2E, especially around Pyodide boot | Ready-state attribute, warm caches, burn-in, zero tolerance, serialised timing, render slots. |
| R-14 | Concurrent agents corrupt builds or skew timings | §4.11: serialised builds, slots, port leases, locks, pid files. |
| R-15 | Baselines drift | Local fonts, pinned browsers, one machine, strict `maxDiffPixels`, Opus note for every baseline update. |
| R-16 | Token cost of content phases | Sonnet where mechanical (§11.2). Continuation over respawn. P8 recalibration. Per-phase approval with budget. |
| R-17 | Wrong editorials or solutions on hard problems (2026 has no official commentary) | Opus authors and Opus verifiers for S3–S5 and Stages 5–7. Official CEMC data in CI. Stress tests against brute force. "Extension" framing when no verified full solution exists. |
| R-18 | CEMC licensing | Paraphrase, attribution, free and non-commercial app, official data used only in CI, n-gram gate. |
| R-19 | The grader changes for CCC 2027 | P19 check each season. The 3.8 rules live in one place. |
| R-20 | Monthly Next.js security releases | Exact pins, patch bumps in P18 and P19, static export. |
| R-21 | Session restarts break SendMessage continuation | §0.3 replacement rule; everything is file-based. |

---

## 15. Open questions for the Manager (each with a recommendation)

| ID | Question | Recommendation (default) | Needed before |
|---|---|---|---|
| Q-1 | **WMOJ has no CCC 2020 problems.** How should the 9 unique 2020 problems be linked? | Link them to **DMOJ** (`https://dmoj.ca/problem/ccc20j1/` format; `ccc20j5` → `ccc20s2/`) as a recorded exception to D-008. Until you rule, they show no external link and the release gate stays red. | P7 |
| Q-2 | May the app show a problem's **own subtask marks** and a **grader-style mock-contest result**? | Yes. These are facts about a problem and about the learner's own attempt, shown the way the grader shows them. Never totals across problems or stages, and never compared with cutoffs, averages or goals. | P7 |
| Q-3 | **Version control** | `git init` in P3 with contained config, plus a standing instruction to commit a checkpoint at each phase end. Identity is your choice; no AI co-author. Fallback: tarball checkpoints (§10). | P3 |
| Q-4 | The **hand-written teaching-voice sample** | You write about 400–600 words, or substantially rewrite a draft, and the style guide labels its origin honestly. | P8 |
| Q-5 | **Hosting** | Build host-agnostic. For v1, serve locally. If the learner is remote, use a static host with header support (Cloudflare Pages or Vercel) with access control. Decide by P18. | P18 |
| Q-6 | Will the learner use **Safari**? | If yes, onboarding asks for "Add to Dock" plus regular backups. Otherwise it recommends Chrome, Edge or Firefox. | P7 |
| Q-7 | Link rule for **non-CCC problems**, if ever added | A separate registry with canonical URLs plus verification, labelled "extra practice (not CCC)". None are planned. | if needed |
| Q-8 | **CEMC official test data** | Use it only in CI to validate reference solutions, and never ship it. | P6 |
| Q-9 | Link rule for **CCC 2027+** | Decide when 2027 problems appear on the judges. Until then the build refuses years outside 2014–2026. | P19 |
| Q-10 | **M7.14 "C++ bridge"** (the 106th heading) | **Drop it.** It conflicts with R2 (Python only), and its rationale ("some S5s are impossible in Python", "CCO needs C++") is R14-banned framing. D-007's 105 then holds exactly. | P8 |
| Q-11 | **Defer local-setup lessons** (the local part of M0.2, and M0.3) to the start of Stage 2 | Yes. It changes presentation only; the in-browser runner covers Stages 0–1. | P8 |
| Q-12 | **Swarm approvals** for P9–P16 and P17 | Approve per phase using the §11.6 budget, or give one blanket approval for P9–P16 based on the table. | P9 |
| Q-13 | **System and harness traces** that survive deleting the workspace (§9.7): the Rosetta cache, LaunchServices and Gatekeeper records, TMPDIR leftovers, Claude Code's own session files | Acknowledge them as system- or harness-owned, and keep them listed openly in the allow-list. Removing them would need system-level actions outside the workspace. | P3 |
| Q-14 | **Process-file updates** that follow from this plan: `00-START-HERE.md` gains `work/` in its file map and the tool-wrapper rule; `operating-rules.md` §2 points to §11.2 for models | After you approve the plan, the main session makes these edits. | P3 |
| Q-15 | **avoid-ai-writing runs on the workspace Node 26.x instead of "system node"** (D-009 wording) | Approve. It is contained, patched and reproducible, and the skill needs Node ≥18. | P3 |
| Q-16 | **Crossover problems** use the Senior slug on both judges (for example 2022 J4 → `ccc22s2`) | FYI, already decided: this follows how the judges host them. Junior references are labelled "same problem as S2". | — |

---

## 16. Reference index

| Topic | File |
|---|---|
| Curriculum spec | `research/01-recon/curriculum-map.md` |
| Grader Python, fast I/O, 3.8 traps | `research/01-recon/python-for-ccc.md` |
| Past problems | `research/01-recon/past-problems-analysis.md`, `research/01-recon/_working/w2-junior-problems.md`, `w3-senior-s1-s3.md`, `w4-senior-s4-s5.md` |
| Contest format and rules | `research/01-recon/ccc-format-and-rules.md` |
| Impeccable research | `research/01-recon/design-skill-recommendation.md` |
| avoid-ai-writing research | `research/02-writing-style-skill/recommendation.md` |
| Stack and runner research | `research/03-plan/_working/w1-tech-stack.md` |
| Content architecture | `research/03-plan/_working/w2-content-architecture.md` |
| Containment mechanics | `research/03-plan/_working/w3-containment.md` |
| Links and QA | `research/03-plan/_working/w4-links-and-qa.md` |
| Plan critique | `research/03-plan/_working/w5-critique.md` |
| Phase 2 log | `context/phase-logs/phase-02-plan.md` |

### 16.1 Where this plan overrides the worker research

| File, section | Worker says | Plan decides |
|---|---|---|
| w3 §3 | Use Homebrew Node 26 read-only, or a Node 24 tarball | Workspace-local **Node 26.x** tarball; Homebrew Node/npm never used (§4.2, Q-15) |
| w3 §4 | Playwright Chromium only | **Chromium, Firefox, WebKit**, each with a first-run containment proof (§4.2, §9.5) |
| w3 §2 | `env.sh` sourced before commands; `npm_config_audit=false` | Wrappers + npm-script guard + PreToolUse hook + settings env; npm `audit` is left at the project `.npmrc` choice (§9.2) |
| w3 §6, w1 §4.2 | uv from `~/.local/bin` or unspecified; paths `.tools/`, `.cache/` | Pinned uv release tarball in `.tooling/uv/`; all paths under `.tooling/` (§9.1) |
| w3 §8 | Detector via `.claude/skills/avoid-ai-writing/bin/…`; `--voice warm --context docs` on the detector | Detector imported via `tools/style/detect.mjs` from `detector/patterns.js`; warm/docs are skill-invocation profiles, the detector CLI takes `general\|technical` only (§6.3) |
| w3 §10 | Sets a specific git identity | The Manager chooses the identity (§10) |
| w4 B1 | Visual baselines generated in Docker | Baselines on this Mac with pinned browsers; Docker can't be contained (§7 G-VISUAL) |
| w4 B1 | `maxDiffPixelRatio` 0.01 | `maxDiffPixels` ≤ 50 per shot, plus element-level shots (§7) |
| w4 A3 | DMOJ verification with a headless browser past Cloudflare | Manager-assisted checklist is primary; no circumvention (§4.7) |
| w4 A3 | Registry shape `content/problems.json` with `id: "2022-j4"` | W2's registry shape (`ccc-problems.yaml`, slug IDs, aliases) (§4.7) |
| w2 §3.2 | `.generated/` compared against committed output; time limits in G-GEN | Deterministic facts committed next to content; timing in `timing.json` under G-TIMING; `.generated/` is build output only (§4.6.2) |
| w2 §3.5 | Expected outputs from PyPy 7.3.9 | Facts from PyPy 3.8 (7.3.11) everyday; exact 7.3.9 at stage acceptance and release (§4.5) |
| w2 §5.4, §9 Q6 | Keep M7.14 as optional | Drop by default (Q-10) |
| w2 §6.1 | CCC 2020 has 10 problems needing an exception | 9 unique (2020 J5 = S2) (§4.7) |
| w1 §3.3 | Wall limit 10 s default | `clamp(8 × median, 2 s, 15 s) × deviceFactor` (§4.4) |
| w1 §3.4 | `sys.setrecursionlimit` flagged by the checker | Advisory warning only; never blocks Submit (§4.5) |
| w1 §2.3 | Hosting options | Default local; Manager decides (Q-5) |
