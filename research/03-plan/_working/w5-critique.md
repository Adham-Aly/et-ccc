# W5: Independent critique of `context/implementation-plan.md` v1.0 (draft)

Worker W5 (critic), Phase 2. Written 2026-09-23. Read in full: the plan. Checked against: `project-brief.md`, `operating-rules.md`, `decisions.md`, `progress.md`, `phase-logs/phase-01-recon.md`, `w1`–`w4`, and `curriculum-map.md` (Conventions, Stage overview, C-track placement, adjacency list, M7.14, Notes for the lesson-building agent). Nothing was installed or edited.

One line of praise: the plan is thorough, well structured and mostly faithful to the research. The link registry, the 3.8 layering and the R14 leak list are strong.

Section references below are to the plan (`§4.7` = plan section 4.7) unless a file is named.

---

## 1. Requirement checklist

| # | Requirement | Verdict | Note |
|---|---|---|---|
| 1 | Single source of truth; cold agent can resume | **Partial** | The structure and resumption steps are good (§0, §13). But the plan adopts four `_working/` scratch files as normative ("adopted with amendments") without listing where it overrides them, and those files contradict it (MA-1). A cold P3 agent told to read "w3, all of it" gets Homebrew Node, Chromium-only Playwright and Node 24 advice that the plan rejects. |
| 2 | Big picture plus technical detail | **Pass** | Architecture, pins, content model, subsystems and gates are all present. |
| 3 | Context files per phase; resumption; ties to progress/decisions/logs/rules | **Pass** (minor gaps) | §12 and §13 cover it. Missing: a phase table of slug, log filename, `work/` dir and report filename (MI-14). Missing: a resume rule for lost SendMessage IDs and half-written items (MI-20). |
| 4 | Orchestration: agents, tasks, counts, tier, model with reasons | **Partial** | The catalogue (§11.2) and budget (§11.6) are good. Several choices are inconsistent (MA-9). The plan never states the exact `model: "opus"`/`"sonnet"` values or bans forks and default inheritance (MA-10). |
| 5 | Nesting only where it pays off; leaf workers never spawn; every prompt says so | **Partial** | The no-spawn line is verbatim in §11.3 (good). The third tier's feasibility in this harness is unverified. Its justification ignores the simpler per-stage-phase alternative. It still conflicts with operating-rules §2 until Q-14 is approved (MA-2). |
| 6 | Workflow/swarm use needs Manager approval | **Pass** | §11.5 and Q-12. |
| 7 | Changelog; plan changes need approval | **Pass** (one ambiguity) | §1 and §13.1. But the S-1 spike text lets P5 "adapt … and record a changelog request", which acts before approval (MI-17). |
| 8 | Next.js in `main-app/` (not initialised in P2), light only, polished, zero-experience learner, Python | **Partial** | All covered except that M7.14 (the C++ bridge) breaks "all teaching uses Python" (R2) (MA-8). |
| 9 | Curriculum = curriculum-map (D-007) plus other recon files | **Partial** | The P7–P10 split is correct and complete (see §4 of this file). But the Tier-3 author reading list (§11.7) omits `python-for-ccc.md`, `past-problems-analysis.md`, `ccc-format-and-rules.md` and the recon per-problem notes (MA-13). |
| 10 | Python 3.8 for all teaching code; flag/block 3.9+ in the browser | **Pass** (minor) | The three layers are excellent. Warning vs. error severity is undefined, so `sys.setrecursionlimit` (which recon teaches) would block Submit (MI-6). |
| 11 | Problem links: formats, slugs, verified, in data model and gates | **Partial** | The registry, `judgeUrl` and snapshot are strong. Three gaps: no gate forces plain-text "2024 S3" references through `<ProblemLink>`; judge home and sign-up links are blocked by the lint; the 2020 count is wrong (9 unique, not 10) (MA-6). The DMOJ method relies on getting past Cloudflare (MA-7). |
| 12 | No score targets (R14) | **Pass** (minor) | Leak list, G-R14 and Q-2 are in place. M7.14's rationale is itself R14-banned framing (MA-8). The `ceiling` pattern will flood false positives (MI-19). |
| 13 | Impeccable approved, installed later with containment proof | **Pass** | P3 T2. `.impeccable/` config dir missing from the layout (NIT-4). |
| 14 | avoid-ai-writing pinned, contained, warm+docs, style guide with hand-written sample, pilot 2–3, detector+validator gates | **Partial** | The detector path is likely wrong. The threshold metric is undefined. Nothing triggers the validator gate. The move to a workspace Node contradicts D-009's "system node" wording. "Or edits an Opus draft" weakens "hand-written" (MA-3). The pilot skips the real verifier stage (MA-12). |
| 15 | Total containment with before/after proof | **Fail as written** | The env activation model doesn't hold in this harness: shell state isn't kept between Bash calls, settings, skills and hooks load at session start, and global `uv`/`node` are already on PATH (BL-2). The plan extends W3 to Firefox and WebKit without extending the proof, and LHCI, uv provenance and OS-level traces are uncovered (MA-5). The backstop pass criterion is subjective (MA-5). |
| 16 | Manager HTML report to `~/Desktop` after every phase, never published | **Pass** (minor) | §11.8. Nothing says who captures screenshots or recordings, or how they get embedded in a self-contained file (MI-15). |
| 17 | Manager can redo/critique/adjust any phase | **Pass** | §13.4 and operating-rules §6. |
| 18 | Manager engineering standards | **Partial** | §8 is good. Two violations of "never modify auto-generated files": the P4 plan to add a pointer to Next's auto-maintained `AGENTS.md`, and a ledger that is both generated and hand-edited (MI-4, MI-5). Non-content phases have no "zero open defects" exit criterion (MI-18). |
| 19 | No git today: recommend VCS, agents never commit unless asked, no AI co-authors | **Pass** (minor) | §10 and Q-3. The tarball fallback leaves out `research/`, `work/`, `CLAUDE.md`, `.claude/settings.json` and `.tooling/{env.sh,bin}` (MI-13). |
| 20 | Decisions or open questions on hosting/backend, content pipeline, pedagogy, testing, phases, risks | **Pass** (gaps) | All present. Missing subsystems: the beginner error explainer, search, and ownership of onboarding and UI copy (MA-11). Risks missing: harness nesting, a shared working tree, and timing nondeterminism (BL-1, MA-2, MA-4). |

---

## 2. Findings by severity

### BLOCKER

**BL-1. Up to 8 concurrent agents share one `main-app/` working tree with no isolation (§11.4, §11.7, §7, §12 P7–P10).**
- **What's wrong.** Authors run `verify:fast -- --scope`. Verifiers "render every page in the served app and screenshot it". Leads run G-PY-EXACT and visual passes. Tier 1 runs `verify:full`. All of it can happen at once, in the same directory. Nothing is said about:
  - who owns `.next/`, `out/`, `.generated/`, `public/tests/`, `test-results/` and Playwright snapshot dirs;
  - ports for served builds;
  - how long-lived servers are started and killed (`run_in_background` servers orphaned by an interrupted agent);
  - CPU contention.
- **Why it matters.** Concurrent `next build` runs into the same `distDir`/`out/` corrupt each other. Port clashes and half-regenerated `.generated/` files produce exactly the flaky, non-reproducible failures §8 and G-FLAKE forbid. Timing-based gates (MA-4) become meaningless under 8-way load. Content phases can't run as designed.
- **Fix.** Add a §4.11 "Shared-workspace concurrency" subsection:
  1. `verify:fast --scope` must never run `next build` or a browser. It runs only schema, pycheck (single-scope), style, R14, link and prereq checks, which write only to per-scope temp dirs.
  2. Rendering and screenshots go through one **render service owned by the stage lead** (or Tier 1). It builds once per batch into `work/NN/render/<batch>/out`, serves it on a port from a per-lead range (for example lead A 41xx, lead B 42xx), and exposes a screenshot script. Or each verifier gets its own `distDir` and output dir via env (`NEXT_DIST_DIR`-style config plus `--output`), with ports allocated by `.tooling/bin/port-lease`.
  3. Timing measurements (time limits, 10× separation) run only in a serialised job with a lock file (`.tooling/locks/timing.lock`).
  4. Every background server writes a PID file under `work/NN/_run/`. Phase resume kills stale PIDs.
  5. `verify:full` runs only when no Tier-3 worker is active (Tier 1 enforces this).
  - If git is approved, consider the Agent tool's `isolation: "worktree"` for authors. That adds merge work, so the render-service approach is simpler.

**BL-2. The containment activation model doesn't hold in this harness (§9 Environment, §11.3 item 2, P3 exit).**
- **What's wrong.**
  - (a) In Claude Code each Bash call is a fresh shell ("shell state does not persist"). So "requires `source .tooling/env.sh`" in a prompt protects only commands that literally chain `source … &&`. The first bare `npm`, `npx`, `node` or `uv` call leaks.
  - (b) This machine already has a global `uv` at `~/.local/bin/uv` (W1 §0) and Homebrew `node`/`npm` at `/opt/homebrew/bin`. A bare call silently uses them and writes to `~/.cache/uv` or `~/.npm`.
  - (c) The `.claude/settings.json` `env` block is created in P3, inside a session that is already running. Settings env, hooks (Impeccable's) and project skills are generally read at session start, and hooks are snapshotted then. So P4's design lead may not see Impeccable, the hooks, or the env redirects until the Manager restarts the session.
  - (d) `settings.json` env values are literal strings (no `$VAR` expansion). Setting `PATH` there replaces PATH rather than prepending, so "PATH puts `.tooling/node/bin` first" can't be expressed the same way as in `env.sh`.
  - (e) The P3 exit checks that the detector runs and the engine exists. It doesn't check that a fresh **subagent** can invoke both skills through the Skill tool.
- **Why it matters.** R15 is non-negotiable, and G-CONTAIN only diffs around installs and first runs. A later bare `npx` in P9 would go unnoticed until the P12 audit.
- **Fix.**
  1. Ship `.tooling/bin/{node,npm,npx,uv,pypy38,pypy38-exact,ruff,vermin,pw}` wrappers that `source env.sh`, assert the resolved binary is under `.tooling/` (or `main-app/node_modules/.bin`), and `exec`. CLAUDE.md and every prompt say "call tools only through `.tooling/bin/*` or `npm run …`; never bare `node`/`npm`/`npx`/`uv`/`python3`".
  2. Every npm script starts with `node scripts/assert-contained.mjs`. It fails if `npm_config_cache`, `PLAYWRIGHT_BROWSERS_PATH` and the other redirects aren't set to workspace paths.
  3. Optionally add a project `PreToolUse` Bash hook that rejects commands matching `^\s*(npm|npx|node|uv|pip|python3?)\b` unless they go through the wrappers. This is deterministic enforcement, not a convention.
  4. Add a **mandatory Manager-performed session restart** at the end of P3. Then a P3.5 check in a fresh subagent: `env` shows the redirects, `which node` resolves inside the workspace, both skills load through the Skill tool, and the Impeccable hooks fire. Record it in the P3 log.
  5. Spell out the settings.json semantics (absolute literal paths; PATH handling) in §9. Verify them empirically in P3 rather than assuming.

### MAJOR

**MA-1. `_working/` files are normative but contradict the plan, and there's no override list (§4.6, §9, §12 "Read first").**
- **What's wrong.** Examples of conflicts:
  - W3 recommends Homebrew Node read-only (or a Node 24 tarball) and Chromium-only Playwright, and uses `.cache/`-style paths and `npm_config_audit=false`.
  - W1 uses `.tools/python` and `.cache/uv`.
  - W2 says expected outputs come from PyPy 7.3.9, and that the detector takes warm+docs profiles (it doesn't; W3 found `--context general|technical`).
  - W4's registry shape (`id: "2022-j4"`, `content/problems.json`, `judge` field) differs from W2's registry and from §4.7.
  §0.2 says deliverables "never override this plan", but the plan tells P3 to read W3 "all of it" and adopts W2 as "the content contract".
- **Fix.** Add §16.1 "Overrides of worker research". It's a table: file, section, what the worker says, what the plan decides. Or better, have the P2 orchestrator write reconciled, non-scratch files (`research/03-plan/content-contract.md`, `research/03-plan/containment-procedure.md`) and point the phases at those. `_working/` stays evidence only.

**MA-2. The third tier (stage leads) is unverified in this harness, and its justification skips the simpler option (§11.1, §11.4, Q-14).**
- **What's wrong.** It's unverified that depth 3 (main → Tier 1 → stage lead → worker) is allowed. It's also unverified that SendMessage continuation and background-completion notifications work at that depth. The rationale compares against "one orchestrator with 150–250 returns". It never compares against **splitting each content phase into per-stage phases** (P7a S0+C, P7b S1, …) with ordinary Tier-1 orchestrators. That option gives the same stage coherence, needs no operating-rules change, and keeps the "max 5" default. Its only cost is throughput (no two stages in parallel). The Manager values simplicity over development cost.
- **Fix.**
  1. Add a [SPIKE] S-0 in P3: a throwaway 3-level nesting test (a lead spawns a no-op worker, continues it via SendMessage, and receives the notification), with the result in the P3 log.
  2. Rewrite the §11.1 justification as a comparison of three options: per-stage phases, stage leads, and one orchestrator. Pick one explicitly and name the fallback if S-0 fails.
  - My recommendation: per-stage phases, unless the Manager wants the parallelism.

**MA-3. The avoid-ai-writing gate is under-specified and the detector path is probably wrong (§6.3, §7 G-STYLE, §9).**
- (a) **The path.** Per W3's own tree listing at `fc979c6`, `bin/avoid-ai-writing.js` sits at the **repo root**. The skill folder `skills/avoid-ai-writing/` contains `detector/`, `scripts/`, `references/` and so on, but no `bin/`. The plan copies only the skill folder, then calls `node .claude/skills/avoid-ai-writing/bin/avoid-ai-writing.js`, which won't exist. Fix: either also copy the root `bin/` and check its relative `require` paths, or add a tiny `tools/style/detect.mjs` that imports `detector/patterns.js` (`AIDetector`) directly. Pin whichever you choose in P3.
- (b) **The thresholds.** The detector exits 0 regardless of findings, so the gate is only as good as `thresholds.json`, and the plan never says what is measured. Define:
  - the metric: per file, per category, hard-fail categories vs. density (hits per 1,000 words) for soft ones;
  - the calibration: run on the Manager's voice sample and the accepted pilots, and set each threshold at the pilot maximum (or a stated margin) with a hard floor of 0 for listed categories;
  - who may change thresholds later (changelog vs. orchestrator).
- (c) **The validator trigger.** "After any rewrite pass" isn't something a gate can detect. Require authors to save the pre-rewrite file to `work/NN/_rewrites/<id>.orig.mdx` and have G-STYLE run `validate.js` on every pair present. Or make it an author-protocol step with an evidence file that the verifier checks.
- (d) D-009 (a Manager ruling) says to run the scripts "with the system `node`". The plan uses a workspace Node. That's a sensible change, but it needs to be listed for Manager acknowledgement (§15).
- (e) Q-4 "or edits an Opus draft by hand" dilutes "hand-written". Recommend the Manager writes the sample, or rewrites a draft substantially, and it's labelled honestly in the style guide.

**MA-4. Timing-derived artefacts make generation nondeterministic, and "generated" artefacts are both committed and git-ignored (§4.4, §4.6.2, §4.6.4, §7 G-GEN, G-ADEQ).**
- **What's wrong.** Time limits are `clamp(8 × measured Pyodide time, …)`, and G-GEN requires "no diff after regeneration" for time limits. Wall-clock measurements differ run to run, and far more under concurrent load (BL-1), so G-GEN will flake. Separately, §4.6.2 says `.generated/` is git-ignored build output, while G-GEN (and W2 §7.5) compare against committed output. Only one of those can be true.
- **Fix.**
  - Split artefacts into (i) **deterministic facts** (predict outputs, traces, expected outputs), committed next to the content (for example `exercises/<ex>.expected.json`), with G-GEN diffing a regeneration against them; and (ii) **timing data**, measured once in the serialised timing job (median of N runs, recorded with machine and version), committed, and **excluded** from G-GEN.
  - A separate G-TIMING check re-measures only on demand (stage acceptance, release) with tolerance bands, and asserts the reference ≤ 1 s and the decoy ≥ 10× the limit.
  - State that `next build` reads committed artefacts and never needs PyPy.

**MA-5. There are containment gaps beyond BL-2, and the proof criterion is subjective (§9, §12 P3/P4/P12).**
- (a) **Engines.** The plan overrides W3's Chromium-only advice with Firefox and WebKit (reasonable, per W1). But W3's snapshot list and UNVERIFIED checks cover only Chromium. Add the WebKit and Firefox candidate paths (`~/Library/WebKit`, `~/Library/Caches/com.apple.WebKit*`, `~/Library/HTTPStorages`, `~/Library/Saved Application State`, `~/Library/Application Support/Firefox`, Crash Reports) and a first-run proof per engine in P4.
- (b) **Lighthouse CI.**
  - Set `upload.target: "filesystem"` in `lighthouserc.json`. The LHCI default of `temporary-public-storage` **uploads reports publicly**, which conflicts with "never published" in spirit and adds network use.
  - Set `CHROME_PATH` to the Playwright Chromium (full Chromium, not `chromium-headless-shell`).
  - Add `PUPPETEER_SKIP_DOWNLOAD=1` and `PUPPETEER_CACHE_DIR` to `env.sh` defensively.
  - Include LHCI in the first-run proof.
- (c) **uv provenance.** The plan says "workspace-local binary" but not how it's obtained. Specify: the pinned release tarball `uv-aarch64-apple-darwin.tar.gz` plus its `.sha256` from GitHub releases, unpacked to `.tooling/uv/bin`. Never the install script (it edits profiles). Never the pre-existing `~/.local/bin/uv`. Always `uv python install … --no-bin` (plus `UV_PYTHON_BIN_DIR`).
- (d) **The backstop criterion.** "Empty apart from documented OS noise" is a judgment call. The Manager uses this Mac at the same time, so `find ~ -newer` will never be empty. Define an explicit `.tooling/contain-allowlist.txt` of path globs that aren't attributable to project tools, each with a reason. Add a hard-fail rule: any new path matching project-tool names (node, npm, npx, playwright, chromium, webkit, firefox, pyodide, uv, pypy, python, next, impeccable, biome, lighthouse, lhci, cspell, vitest, esbuild) outside the workspace fails, allow-list or not. Also give a runtime bound and the TCC error handling.
- (e) **OS-level traces that survive deleting the workspace** and aren't discussed:
  - the Rosetta AOT translation cache (`/var/db/oah`) for PyPy 7.3.9;
  - the LaunchServices registration of `Chromium.app`/WebKit bundles;
  - Gatekeeper/syspolicyd assessments;
  - `TMPDIR` leftovers.
  These are system-managed, but R15 says "zero traces". List them and put them to the Manager as an acknowledged exception (extend Q-13).

**MA-6. R13 gaps: unlinked references, judge home links, the 2020 count, and the crossover decision (§4.7, §7 G-LINK-FMT, Q-1).**
- (a) R13 says **every** referenced CCC problem links to the judge. Nothing stops prose like "as in 2024 S3" without `<ProblemLink>`. Add G-LINK-REF: a text-node regex (`\b(19|20)\d{2}\s*[JS][1-5]\b`, plus `J4/S1` forms and `ccc\d\d[js]\d`) in MDX, YAML strings and UI strings must sit inside a registry component, or appear in an allow-list.
- (b) M0.7 teaches account creation on both judges, so it needs `https://wmoj.ca/` and `https://dmoj.ca/` home and sign-up links. The "no raw `wmoj.ca`/`dmoj.ca` string" lint blocks them. Add `judgeHome`/`judgeSignup` entries to `external-links.yaml` rendered by a `<JudgeLink site>` component, and let the lint allow only those exact URLs.
- (c) CCC 2020 has **9 unique problems**, not 10, because 2020 J5 = S2 (W2 §6.2). The DMOJ exception must map `ccc20j5` to `ccc20s2/`. Fix the "10" in §4.7 and Q-1. With the exception, the split becomes 56 WMOJ and 63 DMOJ.
- (d) Hosting crossovers under the Senior slug departs from R13's literal formula. It's justified by "verify slugs" and W4's evidence, but R13 is Manager-owned and CRITICAL. Record it as a decision with FYI to the Manager in the P2 report, and add the UI rule: a Junior reference shows "2022 J4 (same problem as S2)" so the judge page title doesn't confuse the learner.

**MA-7. DMOJ verification is designed to get past a Cloudflare challenge with automation (§4.7, R-4).**
- **What's wrong.** Driving headless Chromium specifically to pass Cloudflare's bot challenge is circumvention. It's likely against DMOJ's wishes, and it's brittle (challenges change, and headless is detected). Getting the release gate green shouldn't depend on it.
- **Fix.** Make the **Manager-assisted check the primary path**: a generated checklist HTML of about 63 DMOJ URLs (including the 2020 exception) that the Manager opens in a normal browser (about 10 minutes), recorded as `method: manual` with the date. Alternatively, with explicit Manager approval, an agent reads the pages through the Manager's own already-open browser (the claude-in-chrome tool), with the Manager present. Keep automated WMOJ checks as they are. Drop "politely past the challenge" wording entirely.

**MA-8. M7.14 (the C++ bridge) conflicts with R2 and R14, and Q-10 frames it as a counting issue (§2.2, §12 P10, Q-10).**
- **What's wrong.** R2 says "all teaching, examples and exercises use Python". The map's own rationale for M7.14 is "Some S5s are likely impossible in Python" and "The CCO requires C++". Those are exactly the Python-infeasibility and CCO-qualification framing the D-006 ruling and §6.5 ban.
- **Fix.** Recommend **dropping M7.14** so D-007's 105 stays literally true. Record the 106th heading as out of scope in a changelog note. If the Manager wants it anyway, Q-10 must name the R2 and R14 conflicts, and the module needs a rewritten, non-infeasibility rationale. Update §2.2, P10 and Q-10.

**MA-9. Model assignments are inconsistent in places (§11.2, §6.4).**
- (a) The novice simulator is **Opus** in P6 ("needs fine judgment on what confuses an absolute beginner") but **Sonnet** in P11, the last line of defence, at 100× the scale. Use Opus for the P11 walkthroughs of Stages 0–2 at least, or justify why Sonnet can do there what it can't do in P6.
- (b) **Content verifiers are Sonnet everywhere.** They write the brute-force stress tests and adversarial generators that R-16 relies on for S3–S5 and Stages 6–7 (2026 S1/S3/S4/S5 have no official commentary). Writing a correct brute force for an S5 problem, and spotting a subtly wrong editorial proof, is judgment-heavy. Use Opus verifiers for S3–S5 pages and Stages 5–7 modules; keep Sonnet for Stages 0–4 and J1–J3.
- (c) The toolchain installer (Sonnet) settles the hardest containment unknowns (Next telemetry file, crashpad, npx cache, uv paths) and must "stop and report correctly". That's the same reason the skills installer was made Opus. Make T1 Opus, or move those empirical checks to T2.

**MA-10. The model policy isn't mechanically enforceable as written (§11.2, §11.3).**
- **What's wrong.** D-010 allows only Opus 5.5 and Sonnet 5. The Agent tool also accepts other values, inherits the parent's model when `model` is omitted, and **ignores `model` for `subagent_type: "fork"`**.
- **Fix.** Add to the §11.3 prompt contract, for spawners:
  - "Always pass `model: "opus"` or `model: "sonnet"` explicitly, per §11.2."
  - "Never omit `model`."
  - "Never use `fork` (it inherits the parent model), and never use any other model value."
  - Tier 1 and stage leads log the model of each spawn in `progress.md` or the ledger.

**MA-11. Learner-facing subsystems and copy have no owner (§4.10, §5, §12).**
- (a) **Beginner error explainer.** It's cited (Becker 2016; §5 says "friendly error explainer") but never specified. It needs:
  - an `errors.yaml` mapping exception types and common patterns to plain-language explanations with lesson links: `EOFError` from reading too many lines, `IndentationError`/`TabError`, `NameError` typos, `TypeError` str+int, `ValueError` from `int("3 4")`, `IndexError`, `ZeroDivisionError`, `RecursionError`;
  - harness detection of `input("prompt")` with a non-empty prompt (a CCC wrong-answer trap);
  - traceback cleaning rules;
  - tests;
  - an owner: authored in P6 by the style-guide author, engine hooks in P5.
- (b) **Onboarding and UI copy.** Nobody writes `/start`, `/about`, dashboard empty states, button text, verdict explanations or the speed-honesty popover in the teaching voice. G-STYLE covers only MDX. Assign these to P6 (and P7 for any remainder) and extend G-STYLE to a UI-strings file.
- (c) **Search.** For about 233 lessons and a glossary, a beginner needs "how do I …" search. Decide: a build-time JSON index plus a small client-side library (for example MiniSearch; no binary, so easy to contain), or explicitly out of scope for v1 as a §15 item.

**MA-12. The pilot doesn't exercise the pipeline P7–P10 will use (§6.3, §12 P6, §6.4).**
- **What's wrong.** P6's exit says the pilots go "through the full §11.7 pipeline", but P6 has no Sonnet verifier and no stage lead. So the verifier prompt template, stress-test practice, render and screenshot checklist, and verifier cost are never calibrated before the swarm. Separately, §6.4 samples the J1–J3 critic at "≥ 1 in 3 pages", but §6.2 requires every item to reach `reviewed` before `accepted`.
- **Fix.**
  - Add a Sonnet (or per MA-9, Opus) verifier to P6, run the lead's acceptance step once, and produce all five prompt templates (author, verifier, critic, lead acceptance, page author).
  - Define that a sampled critic pass sets `reviewed` on the whole batch when the sample is clean, with an automatic escalation to a full review when a sample fails.

**MA-13. Authors aren't told to read the other recon files (§11.7 step 1, requirement 9).**
- **What's wrong.** Authors get the map section, prerequisites, concepts, glossary, registry and leak list. They don't get:
  - `python-for-ccc.md` (3.8 traps, fast I/O, recursion; needed by Stages 1, 3 and 5–7);
  - `ccc-format-and-rules.md` (C.1, C.4, C.7 and C.8 depend on it);
  - `past-problems-analysis.md` plus `research/01-recon/_working/w2–w4-*` per-problem notes (subtasks, pitfalls, commentary status; needed by every problem page).
- **Fix.** Add these to §11.7 by content type, with the precise sections, and have stage briefs quote the relevant excerpts. They are also leak sources, so the leak list must travel with them.

**MA-14. P5 and P11 are scoped beyond what their agent counts can deliver (§12 P5, P11, §11.6).**
- **P5.** Five workers carry the whole engine: spike, runner, 3.8 layers, loader and schemas, all 20+ gates with fixtures, all learner UI, registry verification of 119 slugs, and E2E across three engines. Each worker's context will run out several times.
  - Fix: split P5 into **P5a Runtime** (S-1, worker, harness, compat38, editor), **P5b Content pipeline and gates**, and **P5c Learner experience**, each with a Manager checkpoint. Or explicitly allow sequential worker relays with a mandated handoff file per role.
  - Also move S-1 to the **start of P4** (or split: the PyPy/Rosetta and WMOJ-PyPy3 checks in P3). P4 already bakes in `public/py`, Pyodide sync and Lighthouse budgets that S-1 could invalidate.
- **P11.** Three Sonnet walkers "do every exercise as a beginner" across about 233 lessons, about 1,230 items and 119 pages in a live app. That's impossible in 6–12 spawns.
  - Fix: chunk by stage or about 8 modules per walker spawn (about 25–30 spawns), give walkers a scripted protocol and findings template, and **resize the §11.6 budget and swarm request** to match.

**MA-15. The screenshots and recordings the Manager checkpoints depend on have no production path (§11.8, §12 P4/P5/P6).**
- **What's wrong.** The report agent (Sonnet, spawned by the main session) is supposed to include screenshots "taken from the contained Playwright", which means serving a build and running tools. That isn't in its brief, and "self-contained HTML" requires embedding the images.
- **Fix.** The **phase orchestrator** produces `work/NN/report-assets/*.png` (and a compressed short `.webm`/GIF for P5) at phase end, through the render service (BL-1). The report agent only reads files and embeds them as base64 `data:` URIs, with a stated size cap (for example ≤ 8 MB per report). It never runs tools.

### MINOR

- **MI-1. Pairing across phases.** §6.1 pairs **C.7+C.8** in one task, but C.7 is in P8 and C.8 in P9. Also, which lead owns C.1, C.2 and C.10 in P7 ("S0+C") and C.5 and C.8 in P9 isn't stated. Fix the pairing (C.7 alone, or C.7+C.4) and list C-module ownership per lead.
- **MI-2. Q-2 timing.** P5 builds the subtask-marks display and mock result UI, but Q-2 is "needed before P6". The P5 checkpoint says "before P6 finishes" while P6 entry requires it. Make Q-1 and Q-2 needed before **P5**.
- **MI-3. Links to problem pages that don't exist yet.** P7 module practice sets link to problem pages written in P8–P10, so G-LINKS-INT fails at P7 exit. Decide that `/problems/[slug]` renders for all 119 registry entries from day one (a registry-only view: title, paraphrase-pending notice, subtask table, judge link), with content filling in later.
- **MI-4. The ledger is both generated and hand-edited.** `ledger.md` mixes `content:status` output with hand-kept Defects and Lessons sections (§13.3), which violates the Manager's rule against manually editing auto-generated files and means regeneration will clobber notes. Split it into `ledger.generated.md` and `defects.md`.
- **MI-5. The AGENTS.md pointer.** P4 recommends adding a pointer line to Next's auto-maintained `main-app/AGENTS.md`. That contradicts R-20 ("treated as generated") and the Manager's rule. Put the pointer in a hand-written `main-app/CLAUDE.md` (with `@AGENTS.md`) instead.
- **MI-6. compat38 severities.** "Findings block Submit", but compat38 also emits warnings (`sys.setrecursionlimit`, `threading`). Recon teaches `setrecursionlimit` in places (`python-for-ccc.md`). Define `error` (blocks Submit: a 3.9+ feature) vs. `warning` (advisory), and add a test for each.
- **MI-7. Install authorisation.** P5's entry lacks an install authorisation. P6 may need a contained PDF-to-text tool for the CEMC statement cache. P12 and P13 do patch bumps. §11.3 item 2 lists only P3, P4 and P5. List every phase that may install, and what.
- **MI-8. CEMC statement cache and official test data have no owner.** They're needed for G-COPY and G-PY-RUN, but nobody fetches them. Assign both to the P6 foundations worker: a contained `pypdf` in the venv (not Homebrew poppler), storage under `work/cemc-cache/` (git-ignored), and licence notes.
- **MI-9. Contract freeze mechanism.** Say how the P6 freeze is enforced: `content/CONTRACT_VERSION`, schema files under a hash recorded in the P6 log, and a G-SCHEMA check that fails if the schema hash changes without a matching migration and changelog id.
- **MI-10. Pixel standard vs. `maxDiffPixelRatio ≤ 0.01`.** 1% of 1440×900 is about 13k pixels, enough to lose a button. Baselines come from one machine with pinned browsers, so use `maxDiffPixels` near 0 (for example ≤ 50) or ratio ≤ 0.001, with element-level shots for components.
- **MI-11. Lighthouse budgets.** "Strong LCP/CLS/TBT" isn't a gate. Either set numbers now (for example desktop LCP ≤ 1.2 s, CLS ≤ 0.02, TBT ≤ 100 ms, shared JS ≤ N KB gz) or state that P4 sets and records them in `lighthouserc.json` and the changelog.
- **MI-12. Network in verify:full.** G-LINKS-INT checks external links inside `verify:full`, which contradicts §8.6 ("no network in normal tests"). Move external checks to the manual/scheduled live job alongside `links:verify`.
- **MI-13. Tarball fallback scope.** It omits `research/`, `work/` (proofs, ledgers, prompt templates), `CLAUDE.md`, `.claude/settings.json` and `.tooling/{env.sh,README.md,bin}`. Include them, and still exclude caches.
- **MI-14. Phase index table.** Add one table: phase, orchestrator name, phase-log filename, `work/` dir, Desktop report filename, install authorisation, swarm approval, Manager hard gate. P12's `work/` dir isn't named at all.
- **MI-15. Registry accuracy.** Subtask marks and constraints entered by the Sonnet foundations worker are "gated by schema and link checks", but neither checks facts. Add a verifier pass against the cached statements (and G-FACTS depends on the data being right).
- **MI-16. 2026 recheck.** The map's note 5 (recheck the 2026 Senior commentary and 2026 S5 before authoring) isn't scheduled. Add it as the first task of P9 and P10.
- **MI-17. Spike adaptation.** "Adapts inside this section's intent and records a changelog request" (§4.4) lets P5 change a [DECIDED] item before approval. State that it may proceed only on non-[DECIDED] details; otherwise it stops for approval.
- **MI-18. Zero-defect exits.** §8.3 lets agents log defects instead of fixing them. Add "zero open defects" to every phase's exit criteria, not only content phases.
- **MI-19. R14 lint false positives.** The patterns will fire on legitimate teaching terms: "ceiling division" (M1.12 teaches `-(-a // b)`), "qualify" and "average" (as in array averages). Narrow the patterns (`(score|mark)s?.{0,20}ceiling`, `realistic (score|ceiling|target)`) rather than relying on a large allow-list.
- **MI-20. Resumption after a session restart.** SendMessage agent IDs don't survive a session restart. Add "or the agent is unavailable" to the fix-loop rule (§11.7 step 4). Also say how a half-written item is handled: status `planned` with files present means the new author reads the files and either continues or restarts, and logs which.
- **MI-21. Device speed.** Time limits are calibrated on this Mac's headless Pyodide, but §4.9 supports editing on phone and tablet, where wasm can be several times slower. Either add a one-off device calibration benchmark that scales limits (W1 §3.5 option), or state that the 8× margin is the policy and test it on WebKit mobile emulation.
- **MI-22. Page-level checks.** Axe and a horizontal-overflow check (`scrollWidth ≤ innerWidth` at 390 px, outside code blocks) are cheap on every built page. Run them on all content pages in `verify:full`, not only templates. That catches the diagram, table and code overflow the pixel-picky standard cares about.
- **MI-23. Harness scratchpad and memory.** Agents' system prompts steer temp files to the harness scratchpad (outside the workspace) and may offer memory features. Add to §11.3: "use `work/NN/_scratch/`; never write memory or anything outside the workspace except the Desktop report."

### NIT

- **NIT-1.** "CI" is used throughout, but there's no CI server. Define it once as "`verify:full` run locally on this Mac".
- **NIT-2.** Q-14 says "the main session makes these edits when it approves the plan". It's the Manager who approves.
- **NIT-3.** §4.2 Playwright is "latest 1.6x (1.63.0 per W1; W4 saw 1.62.1)". W1 read the npm registry directly, so state 1.63.0 as the expected pin.
- **NIT-4.** Impeccable writes `.impeccable/config*.json` at the workspace root (W3 §7). Add it to the §4.3 layout and `.gitignore` decisions.
- **NIT-5.** Parsons blocks need a keyboard alternative to drag and drop for WCAG 2.2 (2.5.7 Dragging Movements). Mention it in §4.9.

---

## 3. Faithfulness spot-checks (results)

- **P7–P10 module split: correct and complete.**
  - P7 = S0 (7) + S1 (15) + S2 (9) + C.1, C.2, C.10 = 34.
  - P8 = S3 (10) + S4 (15) + C.3, C.4, C.6, C.7 = 29.
  - P9 = S5 (13) + S6 (13) + C.5, C.8 = 28.
  - P10 = S7 (14, including M7.14) + C.9 = 15.
  - Total 106. Every C module appears once, matching the map's placement table. Cross-phase prerequisites all point backwards (for example C.6 ← M0.3, C.8 ← M5.1).
- **Problem split: correct.**
  - J1–J3: 39.
  - J4/J5/S1/S2 unique: 41 (52 slots minus 10 internal crossovers minus 2017 J5, which is S3).
  - S3/S4: 26 (including 17 S3).
  - S5: 13.
  - Total 119. WMOJ 65 / DMOJ 54 before the exception matches W2. **However**, the 2020 exception covers 9 unique problems, not 10 (MA-6c).
- **Version and choice deviations from the workers** (need entries in the override list, MA-1):
  - Node: W3 says Homebrew or Node 24; the plan uses a workspace Node 26.10. Justified in the plan, but contradicts D-009 wording.
  - Playwright engines: W3 says Chromium only; the plan uses all three. Justified by W1, but the containment research wasn't extended (MA-5a).
  - Visual baselines: W4 says Docker; the plan uses this Mac. Justified as "not containable". Sound.
  - Playwright version: 1.63.0 vs 1.62.1. W1 is authoritative.
  - Detector profiles: W2 is wrong and the plan corrects it (good). But the detector path is inherited from W3's inconsistent verify step (MA-3a).
  - Expected outputs: W2 says PyPy 7.3.9; the plan says 7.3.11 everyday and 7.3.9 at stage and release. Consistent inside the plan.

---

## 4. Top 5 changes I would make

1. **Add a shared-workspace concurrency design (BL-1)** and serialise timing work (MA-4). Move deterministic generated facts into committed files, and measure timing once, outside G-GEN.
2. **Make containment enforceable in this harness (BL-2, MA-5).** Tool wrappers plus `assert-contained` in every npm script (optionally a PreToolUse hook). A mandatory session restart and fresh-subagent verification after P3. An explicit allow-list and hard-fail rule for the backstop. Cover uv provenance, LHCI and Firefox/WebKit. Put OS-level traces to the Manager.
3. **Resolve the nesting question (MA-2).** Spike 3-level nesting in P3, compare against per-stage content phases, and adopt the simpler one unless the Manager wants parallelism. At the same time, fix the model-enforcement rules (MA-10) and upgrade the verifier and P11 novice roles (MA-9).
4. **Make the avoid-ai-writing and R13 gates concrete (MA-3, MA-6, MA-7).** The correct detector entry point, a defined threshold metric and calibration, a validator trigger, G-LINK-REF for plain-text references, allow-listed judge home links, a 2020 count of 9, and Manager-assisted DMOJ verification as the primary path.
5. **Reconcile and right-size the plan for a cold agent (MA-1, MA-14, MA-11, MA-8).** An override list (or reconciled non-scratch contract files). Split P5 and chunk P11 with real budgets. Assign the error explainer, onboarding and UI copy and decide on search. Drop M7.14, or put its R2 and R14 conflict to the Manager.
