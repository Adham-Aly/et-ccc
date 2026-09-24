# W1: Technical architecture and stack recommendation

Worker W1, Phase 2 (Implementation plan). Written 2026-09-23. Audience: the planning orchestrator.

Method: every version below was checked on 2026-09-23 against the npm registry (`registry.npmjs.org/<pkg>`), PyPI, the vendors' docs/blogs, or with a local experiment. Local experiments ran on this machine: macOS 26.6.2 arm64, Node v26.0.0 (Homebrew), npm 11.12.1, uv 0.12.5 (already present at `~/.local/bin/uv`), CPython 3.14.7. **Nothing was installed.** The vermin test loaded the wheel into memory; nothing was written to disk. "UNVERIFIED" marks anything I could not confirm.

---

## 0. Decisions at a glance

| Area | Recommendation |
|---|---|
| Framework | **Next.js 16.3.6** (Active LTS line), App Router, `output: 'export'` (fully static), Turbopack (the default). React **19.3.0**. |
| Node | Target the **Node 26** line. It becomes LTS in October 2026 and every tool below accepts it. The installed 26.0.0 works, but it is 10 patch releases behind (latest 26.10.0). Pin a current 26.x patch, contained in the workspace (see §1.4). |
| Language | **TypeScript 6.0.3** (safe default). TS 7.0.2 is supported by `next build` but has no JS API yet (§1.3). |
| Package manager | **npm** (bundled with Node; no extra binary). Use a project `.npmrc` with an in-workspace cache, `min-release-age`, `save-exact`, and `engine-strict`. |
| Hosting model | **Static site with local-first progress** (IndexedDB plus export/import of a progress file). No server, no accounts. The Manager chooses where it is served (§2.3). |
| Python in browser | **Pyodide 314.0.7** (CPython 3.14.2), self-hosted from `public/`, run in a **module Web Worker loaded from a static file** (not bundled by Turbopack). Stdin comes from a text box. Timeouts work by terminating the worker, with a pre-warmed spare. The SharedArrayBuffer interrupt is used only when the page happens to be cross-origin isolated. |
| 3.8 enforcement | **Three layers.** (1) In-browser static check: `ast.parse(feature_version=(3,8))`, **vermin 1.8.0**, and a custom checker. (2) In-browser runtime "3.8 shim" that removes 3.9+ module APIs. (3) **CI hard gate:** every reference solution and every code block runs under real **PyPy3.8** (7.3.11 native arm64 via uv; exact 7.3.9 osx64 via Rosetta) plus `ruff --target-version py38`. |
| Editor | **CodeMirror 6** (`@codemirror/*` 6.x, `@codemirror/lang-python` 6.2.1) behind a small in-house React wrapper. Not Monaco. |
| Content | MDX files in `content/`, compiled at build time in React Server Components by **`@mdx-js/mdx` 3.1.1 `evaluate()`**, with an in-repo typed loader. Frontmatter is validated with **Zod 4.6.5**. **Shiki 4.4.3** highlights code at build time. **KaTeX 0.18.9** is available for occasional math. Diagrams are **hand-authored React SVG components**. |
| Styling | **Tailwind CSS 4.3.3** (CSS-first `@theme` tokens that Impeccable's DESIGN.md can drive). **shadcn/ui components on Base UI** (`@base-ui/react` 1.8.0). `next/font/local` with committed WOFF2 files. **lucide-react** icons. |
| Tests | **Vitest 5.0.1**, **Playwright 1.63.0** (Chromium 153 / Firefox 155 / WebKit 26.6), `toHaveScreenshot`, **@axe-core/playwright 4.13.0**, **Biome 2.5.14** (lint and format), `tsc --noEmit`, **linkinator 8.1.0** plus a custom D-008 link validator, and a Python CI gate (PyPy3.8 + ruff). |

---

## 1. Next.js, React, TypeScript, Node, package manager

### 1.1 Next.js status (Sept 2026)
- **Latest stable is 16.3.6**, published 2026-09-22 as an out-of-band security release ("Upgrade to 16.3.6 (Active LTS) or 15.5.26 (Maintenance LTS)"). The canary is 16.4.0-canary.40. Support policy: **16.x = Active LTS** (since 2025-10-21), 15.x = Maintenance LTS. No Next 17 has been announced.
- Next publishes security releases roughly monthly (July, August, and September 2026 all had one; the August release fixed two Critical issues). **Pin exactly and plan to bump patches.** A static export has little server attack surface, so most of these CVEs will not affect us, but the build toolchain still needs updating.
- **16.3 (2026-08-03)** brought 90% less dev memory, a Turbopack FS cache for `next build` (on by default), TS 7 support in `next build`, `import.meta.glob` in Turbopack, "Instant Navigations" (opt-in; relies on `cacheComponents` and server features we will not use), and an experimental Rust React Compiler.
- **App Router** is the default and recommended router. `create-next-app` defaults to TypeScript, Tailwind, ESLint, App Router, Turbopack, and AGENTS.md (plus a CLAUDE.md referencing it).
- **Turbopack is the default bundler** for both `next dev` and `next build` (webpack only via `--webpack`).
- **Linting is no longer run by `next build`** (removed in 16). You run your linter from npm scripts. Next officially supports ESLint *or* Biome.
- Minimum Node **20.9** (`engines: >=20.9.0` in `next@16.3.6`). Supported browsers: Chrome/Edge/Firefox 111+, Safari 16.4+.
- `next dev` "writes and maintains a version-matched AGENTS.md block" pointing agents at the docs bundled in `node_modules/next/dist/docs/`. **This is useful for our build agents**, since they get version-matched docs offline. The orchestrator should expect that file to be auto-edited.

### 1.2 Static export (`output: 'export'`): viable, with known limits
From the official guide (docs version 16.3.6):
- **Works:** Server Components (run at build time), Client Components, `generateStaticParams` dynamic routes, GET Route Handlers with `dynamic = 'force-static'` (useful for emitting `search-index.json`, `curriculum.json`, etc.), `next/font`, `next/link` client navigation.
- **Not supported:** dynamic routes with `dynamicParams: true` or without `generateStaticParams`, cookies, **rewrites/redirects/headers in `next.config`**, proxy (formerly middleware), ISR, **default image optimization**, draft mode, Server Actions, and intercepting routes.
- Consequences for us:
  - Every route is enumerated at build time (`/learn/[stage]/[module]` from the curriculum manifest). Set `export const dynamicParams = false`.
  - `images: { unoptimized: true }`. Images are mostly SVG anyway.
  - **HTTP headers (COOP/COEP, cache-control) must come from the host config**, not `next.config`. This is why the Python runner must not *depend* on cross-origin isolation (§3.4).
  - `trailingSlash: true` so every route emits `route/index.html`, which works on any static host without rewrites.
  - `next start` does not serve an export. Serve `out/` with any static server (see §2.3).
  - `next/font/google` downloads font files *at build time* (needs network). Use `next/font/local` with committed WOFF2 so builds are offline-reproducible.

### 1.3 React and TypeScript
- **React 19.3.0** (latest, 2026-09-09). The App Router uses Next's bundled React canary regardless; declare `react`/`react-dom` 19.3.0 for tooling. Peer range in next: `^18.2.0 || ^19.0.0`.
- **TypeScript: 7.0.2 is "latest" on npm** (the Go-native port, released July 2026). Next 16.3 runs the project-local `tsc` CLI by default (`experimental.useTypeScriptCli`, default on) "while its JavaScript API is unavailable". The catch: **TS 7 has no JS API**. `typescript-eslint` 8.70.1 declares `typescript: >=4.8.4 <6.1.0`, and `create-next-app@16.3.6` still scaffolds `typescript: ^5`. **Recommendation: pin TypeScript 6.0.3**, which every tool accepts. If we use Biome (no TS API dependency), moving to TS 7 later is a one-line change. Revisit after launch.
- React Compiler: optional. Leave it off at first (fewer moving parts).

### 1.4 Node version: is v26.0.0 OK?
- Node 26 was released 2026-05-05 and is "Current". **It is promoted to LTS in October 2026** (endoflife.date lists active support to 2027-10-27 and security support to 2029-04-30). Node 24 is Active LTS until 2026-10-20 and in security support until 2028-04-30. Node 27 moves to the new one-major-a-year schedule (alpha October 2026, release April 2027).
- Compatibility of the recommended tools with Node 26 (from the `engines` fields):

  | Tool | Node requirement | 26.x ok? |
  |---|---|---|
  | next 16.3.6 | `>=20.9.0` | yes |
  | vitest 5.0.1 | `^22.12 \|\| ^24 \|\| >=26.0.0` | yes |
  | jsdom 30.1.1 | `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` | yes |
  | @playwright/test 1.63.0 | `>=20` | yes |
  | shiki 4.4.3 | `>=20` | yes |
  | linkinator 8.1.0 | `>=22` | yes |
  | pyodide 314.0.7 (Node tests) | `>=18`; JSPI flag only needed on Node ≤24 | yes |
  | npm 12.1.0 (if upgraded) | `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` | yes |

- **Verdict:** Node 26 is the right line to target. It will be LTS for the whole build and beyond. **26.0.0 itself is the very first release of the line**, and the latest is **26.10.0**, so it has missed every 26.x security patch. For a machine that only builds and serves a local static site the risk is low, but a quality-first setup should use a current patch. Updating Homebrew's Node is a machine-global change, so doing it the R15 way means a workspace-local Node (the official tarball unpacked under the workspace, with a PATH prefix in the workspace scripts). **The containment worker (W3) and the Manager should decide which.** Record the choice in `package.json` `engines` (e.g. `"node": ">=26.0.0 <27"`) and in `.node-version`.
- **Corepack is not bundled since Node 25** (TSC vote), and it is absent on this machine. That is a point in npm's favour.

### 1.5 Package manager: npm
- **npm** is already present (11.12.1, bundled with Node). **pnpm is not installed** (would need `npm i pnpm` inside the workspace; corepack is gone).
- The supply-chain features that used to favour pnpm now exist in npm: **npm ≥11.10 supports `min-release-age`** (a quarantine for newly published versions). pnpm 11 enables `minimumReleaseAge` by default. npm also has `ignore-scripts`.
- Containment is equally achievable with both: a project `.npmrc` with `cache=<workspace>/.cache/npm` (pnpm would additionally need `store-dir`). pnpm's hard-linked global store is a liability for "delete the folder, leave zero traces" unless reconfigured.
- **Recommendation: npm.** Suggested `main-app/.npmrc` (W3 owns the final version): `cache=../.cache/npm`, `save-exact=true`, `engine-strict=true`, `min-release-age=3` (days), `fund=false`, `audit=true`, `update-notifier=false`. Commit `package-lock.json`. **Do not scaffold with `npx create-next-app`**. Install `next react react-dom` manually (the docs give a "Manual installation" path). That gives full control and avoids its ESLint 9 / TS 5 defaults and the npx cache in `~/.npm/_npx`.
- **Containment flags this worker noticed (for W3):** set `NEXT_TELEMETRY_DISABLED=1` (Next telemetry persists config in the OS user config dir), `PLAYWRIGHT_BROWSERS_PATH=<workspace>/.cache/ms-playwright` (default is `~/Library/Caches/ms-playwright`), `UV_CACHE_DIR`, `UV_PYTHON_INSTALL_DIR`, and `uv python install --no-bin` (otherwise uv puts shims in `~/.local/bin`).

---

## 2. Rendering and hosting model

### 2.1 Options compared

| | (a) Static site + local-first progress | (b) Server + accounts + DB |
|---|---|---|
| Fit for a single learner | Exact fit | Over-built |
| Moving parts | Build → `out/` → any static host | Node runtime, auth, DB, migrations, secrets, backups |
| Security surface | Near zero (no server code; Next's monthly server CVEs mostly don't apply) | Must track Next server CVEs, auth, DB exposure |
| Python execution | In the browser either way | In the browser either way (server-side execution is a sandboxing project of its own) |
| Durability of progress | Browser storage can be evicted (see Safari risk below), so export/import is required | Durable, multi-device |
| Cost / ops | Free on any static host, or local | Paid host or self-run server |
| Offline | Easy (after first load) | Harder |
| Manager visibility of learner progress | Only via exported progress file | Dashboard possible |

### 2.2 Recommendation: (a), designed to upgrade later
- **Storage:** IndexedDB via **`idb` 8.0.3** (a tiny promise wrapper). Store one versioned progress document (module status, exercise attempts, best code per exercise, drill stats, settings), validated with the same **Zod** schema on read. Add explicit `schemaVersion` plus migration functions. Call `navigator.storage.persist()` on first use.
- **Export/import:** "Download progress" (JSON file, Zod-validated on import, with merge-or-replace choice). Show a gentle "last backup N days ago" reminder. In Chromium, optionally offer continuous autosave to a user-chosen file through the File System Access API. This is progressive, not required.
- **Safari eviction risk (important):** WebKit's ITP deletes *all* script-writable storage (IndexedDB, localStorage, Cache Storage, service worker registrations) after **7 days of Safari use without interaction with the site**. Apps added to the Home Screen or Dock are exempt. Mitigations: recommend Chrome/Edge/Firefox, or "Add to Dock" in Safari, plus the backup reminder. Put this in the onboarding page.
- **Upgrade path to (b)** if the Manager later wants sync or monitoring: keep all persistence behind a `ProgressStore` interface so a remote implementation can be added without touching UI code.

### 2.3 Where to serve it (Manager decision)
Every option serves the same `out/` folder:
1. **Local only.** A workspace script serves `out/` (e.g. `serve` 14.2.6 as a devDependency, or `python3 -m http.server`, which maps `.wasm` to `application/wasm`). Zero external dependencies. The learner uses `http://localhost:PORT`.
2. **Vercel / Cloudflare Pages / Netlify (static).** Free tiers. All three let you set **custom headers** (`vercel.json`, or a `_headers` file on Cloudflare/Netlify), so we can send `Cache-Control: immutable` for `/pyodide/<version>/*` and, if wanted, COOP/COEP. Privacy: public by default. Password protection is a paid feature on Vercel. Cloudflare Access can gate a site for free for small teams (UNVERIFIED current limits).
3. **GitHub Pages.** Cannot set headers (long-standing community request). Cross-origin isolation would need `coi-serviceworker` (0.1.7, last published 2023), which forces a reload on first visit. Project pages also need `basePath`. **Least preferred.**

**Decisions the Manager must make:** (i) local-only vs. hosted URL; (ii) if hosted, public vs. access-controlled; (iii) whether the learner might use Safari (affects onboarding copy).

### 2.4 Offline / PWA: not in v1, keep it cheap later
- After the first load, HTTP caching plus immutable versioned Pyodide paths make repeat visits fast. The learner will be online when studying.
- A full PWA adds a service worker lifecycle, cache invalidation bugs, and update prompts. The benefits are small for one learner. **Skip in v1.** Optional later step: a small hand-written service worker in `public/` that precaches `/pyodide/<ver>/*` and the HTML routes. A service worker could also inject COOP/COEP (the coi-serviceworker technique). Serwist (`@serwist/next` 9.5.12) exists, but a 60-line hand-written worker is simpler and avoids bundler coupling. Installing to the Dock also helps with Safari eviction.

---

## 3. In-browser Python

### 3.1 Options

| Engine | Python version | Verdict |
|---|---|---|
| **Pyodide 314.0.7** (2026-09-14) | **CPython 3.14.2** in wasm (Emscripten 5.0.3) | **Recommended.** Real CPython and full stdlib (heapq, bisect, collections, itertools, functools, math, sys all present). Actively maintained. Versioning now tracks Python (314.x = 3.14; next major 315 for 3.15, alpha on npm). |
| Pyodide 0.17.0 (2021-04-21) | CPython **3.8.2** (0.16.1 changelog: "Pyodide includes CPython 3.8.2"; 0.18.0: "Pyodide now runs Python 3.9.5") | Tempting because it is *real 3.8*. Assets still exist on jsDelivr (`pyodide.asm.wasm` 11.4 MB + `.data` 5.3 MB). **Rejected as primary:** 5 years unmaintained, old Emscripten, classic-worker `importScripts` API, no `setStdin`, slower 3.8 interpreter (3.11+ was 10–60% faster), and not on npm. Keep only as a fallback idea if the 3.8 compatibility layers prove leaky. |
| Brython 3.14.3 | Transpiles Python to JS. Old 3.8.x releases exist | Semantics and performance differ from CPython/PyPy (ints, recursion, stdlib coverage). Not faithful enough for a judge. |
| Skulpt | Python 3.7-ish grammar subset | Incomplete. No. |
| PyScript | A framework *on top of* Pyodide/MicroPython | Adds an abstraction we don't need. |
| MicroPython (wasm) | MicroPython dialect | Not CPython-compatible enough (stdlib gaps). No. |
| RustPython | Targets 3.14 semantics | Immature and slower. No. |
| PyPy in wasm | none found | No maintained PyPy wasm/browser build exists (searched; nothing current). **You cannot run the grader's PyPy3.8 in the browser.** |

**So: an exact Python 3.8 in the browser is only possible via the abandoned Pyodide 0.17.** The robust design is modern Pyodide plus the 3.8 enforcement layers in §4, with PyPy3.8 as the authoritative CI gate.

### 3.2 Assets, size, self-hosting (measured)
- The `pyodide@314.0.7` npm tarball contains exactly the core runtime: `pyodide.mjs` (17.9 KB), `pyodide.asm.mjs` (1.25 MB), `pyodide.asm.wasm` (9.6 MB), `python_stdlib.zip` (2.5 MB), `pyodide-lock.json` (119 KB), and `.d.ts` types. **About 13.4 MB raw, and about 6.3 MB over the wire compressed** (measured: wasm gzips to 3.5 MB; the stdlib zip is already compressed at 2.5 MB). No other packages are needed (vermin is shipped as its own 98 KB wheel, §4).
- **Self-host:** a `scripts/sync-pyodide.mjs` (run as `prebuild`/`predev`) copies the five runtime files from the exact-pinned `node_modules/pyodide` into `public/pyodide/314.0.7/`, verifies SHA-256 against a committed manifest, and never touches a CDN. Alternative: commit the 13 MB directly. The copy-from-pinned-npm approach avoids binary churn and stays reproducible from the lockfile.
- Load with `loadPyodide({ indexURL: '/pyodide/314.0.7/', lockFileURL: '/pyodide/314.0.7/pyodide-lock.json', checkAPIVersion: true })` and never call `loadPackage` for anything not self-hosted, so there is no hidden CDN fallback. Add an E2E test that fails if any request leaves the origin.
- **Load time:** the Pyodide roadmap states "a first load ... 6.4 MB download, and the environment initialization takes 4 to 5 seconds" (that figure may predate recent releases). Expect roughly 1–3 s on warm cache on a modern laptop (UNVERIFIED; measure in a spike). Mitigations: start the worker as soon as any page with an editor mounts (or on idle from the home page), show a friendly "Python is starting" state, and serve `/pyodide/<ver>/*` with `Cache-Control: public, max-age=31536000, immutable` where the host allows.
- Browser support (Pyodide docs): Firefox 112+, Chrome 112+, Safari 16.4+. That is compatible with Next's and Tailwind's floors. Workers must be **module workers** (314 dropped classic workers because `pyodide.asm.mjs` is ESM).

### 3.3 Worker architecture
- **Turbopack gotcha (important):** Next.js issue #98841 (opened 2026-09-17, affects 16.3.0/16.3.5/16.4 canary) reports that Turbopack emits `new Worker(url, { type: 'module' })` with `type: undefined`, so the worker becomes a *classic* worker. Pyodide 314 **requires a module worker**. The issue was auto-closed for lacking a repro, so treat the bug as live. **Design: do not bundle the Python worker.** Ship it as a static ES module, `public/py/worker.mjs` (authored in TS under `py-runtime/` and compiled by a tiny `tsc`/esbuild step, or plain JS with `// @ts-check` and JSDoc types). Create it with `new Worker('/py/worker.mjs', { type: 'module' })`. Turbopack never sees it. The Python side (`harness.py`, `compat38.py`, the vermin wheel) sits next to it in `public/py/`.
- **Message protocol:** `init`, `check(code)` (static 3.8 lint, §4), `run(code, stdin, limits)`, `grade(code, tests[], limits)`. The worker returns stdout, stderr, the exception (type, message, line number, cleaned traceback), wall time per test, and a truncation flag.
- **Fresh state per test:** execute learner code with `pyodide.runPython(code, { globals: freshDict, filename: '<main.py>' })` (or `pyodide.globals.get('dict')()`), with a new dict per test. Reset `sys.stdin`, `sys.stdout`, `sys.stderr`, and `sys.setrecursionlimit(1000)` before each test. Scrub `__main__` module state. Imported stdlib modules persist, which is harmless.
- **Stdin (batch, like the CCC grader):** the input is fully known before the run, so no interactive blocking I/O is needed. Inside the harness, set `sys.stdin = io.TextIOWrapper(io.BytesIO(data_bytes), encoding='utf-8')`. That makes `input()`, `sys.stdin.readline()`, `sys.stdin.read()`, and `sys.stdin.buffer.read()` (the fast-I/O idiom from the recon) all behave. Also set `pyodide.setStdin({ stdin: ... })` from the same data so the low-level fd-0 paths (`open(0).read()`, `os.read(0, n)`) work too. The docs note that the `stdin` callback appends newlines to strings lacking them; prefer returning a `Uint8Array` of the exact bytes to keep EOF-without-newline cases faithful. **Spike-test all five idioms** (Playwright + Node Pyodide). **No interactive `input()` prompts** (CCC forbids prompts anyway). The UI has an explicit "Input" box.
- **Stdout/stderr capture:** redirect `sys.stdout` to `io.TextIOWrapper(io.BytesIO())` inside Python and read it once at the end. That is far faster than a JS callback per line, it supports `sys.stdout.buffer.write`, and it lets us cap output size (e.g. 1 MB, then kill: "output limit exceeded"). Keep `setStdout({ batched })` only as a fallback for fd-level writes.
- **Output comparison:** exact match after normalising trailing whitespace per line and trailing blank lines at EOF, mirroring common judge checkers. Show a diff for the first mismatched line. (The content/QA workers should confirm the checker policy; the CCC rules say output must match exactly.)
- **Timeouts and interruption:**
  - `setInterruptBuffer(SharedArrayBuffer)` raises `KeyboardInterrupt` cooperatively. **SharedArrayBuffer requires cross-origin isolation (COOP `same-origin` + COEP `require-corp`/`credentialless`).** Static export can't set headers, and GitHub Pages can't at all. Safari has no plans for COEP `credentialless`. COEP also blocks cross-origin embeds (YouTube, external images) that lack CORP.
  - **Primary mechanism (works everywhere): `worker.terminate()` on timeout or Stop, then swap in a pre-warmed spare worker** (keep one idle, initialised worker ready). The cost is one Pyodide re-init per kill, hidden by the spare. Use the SharedArrayBuffer interrupt **only if `self.crossOriginIsolated` is true** (e.g. if the Manager picks a host with headers), because it gives a nicer "stopped at line N" traceback.
  - Wall-clock limit per test in-app: generous (e.g. 10 s default, configurable per exercise). **Never present in-browser timings as grader timings** (see 3.5).
- **Things that do not work in Pyodide** (docs: "can be imported, but are not functional"): `threading`, `multiprocessing`, sockets. The recon's `threading.stack_size` + `Thread` trick cannot run in the browser. That is acceptable: the recon already recommends iterative DFS, and the in-browser checker should warn when it sees `threading`.

### 3.4 Recursion behaviour vs PyPy
- CPython 3.14's default recursion limit is 1000. Since 3.12, pure-Python calls no longer consume the C stack, so in Pyodide **a learner could `sys.setrecursionlimit(10**6)` and recurse far deeper than PyPy 7.3.9 allows.** PyPy: "sets the limit only approximately, by setting the usable stack space to n * 768 bytes", about 1400 frames by default (recon §3). Pyodide also has historical failure modes where very deep recursion raises a fatal JS `RangeError: Maximum call stack size exceeded` instead of `RecursionError` (issues #5959 and #5987, and discussion #2818 with setrecursionlimit(3000) on 0.29). That kills the worker, so treat it like a timeout and respawn.
- **Policy:** reset the limit to 1000 before each run. Have the checker warn on `sys.setrecursionlimit`/`threading` ("works here but is not reliable on the CCC grader; see Iterative DFS"). Where it matters, exercises include a deep-input test (e.g. path of 2·10^5) that recursive solutions *should* fail. **Spike needed:** measure the maximum depth Pyodide 314 reaches in each browser with limit 1000 and with a raised limit, and make the harness catch the `RangeError` cleanly.

### 3.5 Timing differences (major teaching risk)
- Pyodide roadmap: "Across benchmarks Pyodide is currently around 3x to 5x slower than native Python." PyPy's JIT is often 5–50× faster than CPython on the tight integer loops typical of S4/S5 (recon §1). **The same learner solution can therefore be roughly 10–100× slower in the browser than on the grader** (inference from the two sources; UNVERIFIED as a number).
- Design consequences for the plan:
  - In-app tests check **correctness** on small and medium inputs. Big-input performance is validated **on DMOJ/WMOJ with PyPy3** (links per D-008) and taught explicitly.
  - Show elapsed time as "time in your browser" and never compare it to the 3 s limit.
  - Optional: a one-off calibration benchmark to express an in-browser run as "roughly N× slower than the grader". Only if it can be done honestly.
- Other 3.14-vs-3.8 behaviour gaps to neutralise in the harness:
  - **Int→str digit limit.** CPython ≥3.11 raises `ValueError: Exceeds the limit (4300 digits)` (verified locally on 3.14.7), while PyPy 7.3.9 has no such limit. **Call `sys.set_int_max_str_digits(0)` in the harness preamble.**
  - Error messages and tracebacks differ (3.14's are friendlier). That's fine, but don't teach exact message text.
  - Set iteration order can differ between CPython and PyPy. Teach "never rely on set order".

---

## 4. Python 3.8 compatibility enforcement

### 4.1 What each mechanism catches (measured on CPython 3.14.7 = Pyodide 314's parser)
`ast.parse(src, feature_version=(3, 8))`, per the docs "best-effort ... no guarantee", lowest supported (3,7):

| Feature (min version) | `ast` feature_version=(3,8) | vermin 1.8.0 (target 3.8) |
|---|---|---|
| `match` (3.10) | **caught** | caught |
| `except*` (3.11), `type X =` / `def f[T]` (3.12), t-strings / unparenthesised `except A, B` (3.14) | **caught** | (not tested) |
| Parenthesised context managers (3.9/3.10) | missed | **caught** (3.9) |
| Relaxed decorators (3.9) | missed | **caught** |
| PEP 701 f-strings: same quotes nested, `\` in expression (3.12) | missed | **missed** (reports 3.6) |
| `a[*b]`, `*args: *Ts` (3.11), walrus in subscript (3.10) | missed | not tested (ruff catches) |
| `math.lcm`, `functools.cache`, `zoneinfo`, `random.randbytes` (3.9) | missed | **caught** |
| `dict \| dict`, `d \|= {...}` (3.9) | missed | **caught** |
| `str.removeprefix` on a literal | missed | **caught** |
| `s.removeprefix(...)` on a variable | missed | **missed** (unknown type) |
| `x.bit_count()` (3.10) | missed | **caught** (literal and variable) |
| `bisect_left(..., key=)`, `zip(strict=)`, `itertools.pairwise`, `Counter.total` (3.10) | missed | **caught** |
| `itertools.batched` (3.12), `math.cbrt` (3.11), `sys.set_int_max_str_digits` (3.11) | missed | **caught** |
| `math.gcd(a, b, c)` (3.9) | missed | **missed** (reports 3.5) |
| `def f(x: list[int])` (3.9, evaluated at def time) | missed | **missed** by default (needs `--eval-annotations`) |
| `T = list[int]` (3.9) | missed | **missed** |
| 3.8 features correctly *allowed*: walrus, `math.isqrt/comb/prod`, `pow(a,-1,m)`, `f'{x=}'` | ok | ok (reports ≤3.8) |

vermin facts: **1.8.0** (2025-11-20), pure Python, **no dependencies**, a 98 KB `py3-none-any` wheel, `requires_python >=3.0`. It has a library API (`vermin.Config`, `config.add_target((True,(3,8)))`, `vermin.visit(src, config)` → `.minimum_versions()`, `.output_text()`), and analysed a 20-line file in about 1 ms. It parses with the *host* `ast`, so running it inside Pyodide 3.14 behaves exactly like my local 3.14 test. **It can run in Pyodide.** It imports `multiprocessing` only for the multi-file CLI path; `visit()` is single-threaded. Loading: `pyodide.unpackArchive(wheelBytes, 'wheel')`, no micropip. Spike-confirm inside Pyodide.

### 4.2 Recommended layers
1. **In-browser static check (on Run, debounced while typing), shown as CodeMirror lint diagnostics:**
   - `ast.parse(feature_version=(3,8))`, then **vermin** (target 3.8, `eval_annotations` on), then **`compat38.py`, a custom AST/tokenize checker** covering the gaps above: `math.gcd`/`math.lcm` arity; subscripting builtins `list/dict/set/tuple/frozenset/type` (and `collections.*`) anywhere outside string annotations; method-name heuristics for `.removeprefix`, `.removesuffix`, `.bit_count`, `.total` (UNVERIFIED member of this rule: `.is_integer` on int is 3.12) with the wording "if this is a str/int, it needs Python 3.9+"; **PEP 701 f-string detection** via the 3.14 tokenizer (`FSTRING_START`: a nested string token using the same quote character, a backslash or comment inside a replacement field); `X | Y` in annotations; warnings for `sys.setrecursionlimit`, `threading`, `sys.set_int_max_str_digits`. Every message is written for a beginner and links to the "Python 3.8 on the grader" lesson.
   - Findings **block "Submit" (grading) but not "Run"**. The learner can still experiment, and the message explains why the grader would reject it.
2. **In-browser runtime shim (`compat38.py`, applied before learner code):** make 3.9+ *module-level* APIs fail as they would on 3.8.
   - Delete `math.lcm`, `math.cbrt`, `math.exp2`, `math.nextafter`, `math.ulp`, `functools.cache`, `itertools.pairwise`, `itertools.batched`, `random.randbytes`, and `sys.set_int_max_str_digits` (after the harness uses it).
   - Wrap `bisect.*` to reject `key=`, builtin `zip` to reject `strict=`, and `math.gcd` to reject more than 2 arguments.
   - Block imports of 3.9+ modules (`zoneinfo`, `graphlib`, `tomllib`) with a `sys.meta_path` finder.
   - Built-in type methods (`str.removeprefix`, `int.bit_count`, `list[int]`) **cannot** be removed from immutable builtin types, so layer 1 covers them.
   - Unit-test this shim.
3. **CI hard gate at authoring time** (a Python test runner under `tools/pycheck/`, invoked by `npm run check:python`):
   - Extract **every** Python snippet from `content/**/*.mdx` (code fences tagged `python`, exercise starters, reference solutions, test generators) plus all exercise test cases.
   - **Run each reference solution against its tests under real PyPy3.8.** Primary: **PyPy 7.3.11 (pypy3.8, CPython 3.8.16 stdlib), native macOS arm64**, installed by `UV_PYTHON_INSTALL_DIR=<ws>/.tools/python UV_CACHE_DIR=<ws>/.cache/uv uv python install pypy@3.8 --no-bin` (verified available offline: `pypy-3.8.16-macos-aarch64-none`). Exact grader version: **PyPy 7.3.9 has no macOS arm64 build** (arm64 macOS arrived in 7.3.10). `pypy3.8-v7.3.9-osx64.tar.bz2` (25.5 MB, verified HTTP 200 on downloads.python.org) runs under **Rosetta 2, which works on this machine** (verified). Apple says **macOS 27 is the last release with general Rosetta support**, so treat the 7.3.9 run as a periodic "exact" check. The long-term fallback is `pypy3.8-v7.3.9-linux64.tar.bz2` in a Linux CI runner.
   - Also run the same tests **in Pyodide under Node** (the `pyodide` npm package works in Node ≥18) with the same `harness.py`. That proves each exercise works in the *in-app* environment too, including that the tests are small enough to run in the browser.
   - **`ruff check --target-version py38`** (ruff 0.16.8, installed in a workspace venv via uv). Ruff reports version-related *syntax* errors, including PEP 701 f-strings before 3.12, parenthesised context managers, star-index and star-annotations, `match`, and relaxed decorators. It fills the syntax gaps that vermin misses. Plus vermin (`-t=3.8- --eval-annotations --violations`) and the custom `compat38.py` over the same snippets.
   - Optionally, CPython 3.8.13 (the exact stdlib version the grader's PyPy reports) via `uv python install cpython@3.8.13 --no-bin` as a second interpreter. It is cheap and gives CPython-vs-PyPy behaviour diffs.
   - The gate fails the build on any violation. Deliberately "wrong" snippets (showing a 3.9 feature failing) need an explicit fence flag such as `python bad38`.
   - **Do not ship ruff's wasm build** (`@astral-sh/ruff-wasm-web`, about 11 MB unpacked) to the browser; it's CI-only.

---

## 5. Code editor: CodeMirror 6

| | CodeMirror 6 | Monaco 0.56.0 |
|---|---|---|
| Mobile/touch | Designed for it (contentEditable-based) | README: mobile browsers "No" (not supported) |
| Bundle | Modular; a basic Python setup is a few hundred KB min (UNVERIFIED exact) | Multi-MB, and needs its own workers. `@monaco-editor/react` loads from a CDN by default, which we'd have to override |
| Accessibility | Tab not bound by default to pass WCAG "no keyboard trap"; Escape-then-Tab and Ctrl-M/Shift-Alt-M escape hatches | VS Code-grade, but heavy |
| Beginner fit | Minimal UI you can style fully; easy light theme; lint gutter via `@codemirror/lint` | IDE-like chrome that overwhelms beginners |
| Python | `@codemirror/lang-python` 6.2.1 (Lezer grammar) | Built-in |

**Recommendation: CodeMirror 6** with packages `@codemirror/state` 6.7.6, `view` 6.43.13, `commands` 6.11.1, `language` 6.12.4, `autocomplete` 6.20.3, `lint` 6.9.7, `search`, and `lang-python` 6.2.1. Use a **small in-house React wrapper** (mount an `EditorView` in `useEffect`, controlled via transactions) rather than `@uiw/react-codemirror`, whose peer deps pull in `@codemirror/theme-one-dark` and `@babel/runtime`. Build a custom **light** theme from the same design tokens as the Shiki theme so static and editable code look the same. Bind `indentWithTab` (beginners expect Tab to indent) *and* document the Escape-then-Tab escape hatch in the UI, as the CodeMirror docs ask. Use 4-space indent, bracket matching, and close-brackets. Keep autocomplete off by default (the contest has no autocomplete, and learners should type templates from memory).

---

## 6. Content rendering stack

### 6.1 Options status (2026-09)
- **`@next/mdx` 16.3.6.** Official. Under Turbopack, remark/rehype plugins must be given **as strings with serializable options** ("JavaScript functions can't be passed to Rust"). No frontmatter support by default (use `export const metadata` or `remark-mdx-frontmatter`). Fine for pages, but awkward for a typed catalogue of about 105 modules and exercises. Function-valued options, such as Shiki transformers, are impossible.
- **next-mdx-remote.** **Archived by HashiCorp on 2026-04-09** (last 6.0.0, 2026-02). Do not use.
- **next-mdx-remote-client 2.1.12** (2026-08-11). The maintained community successor. A thin wrapper over `@mdx-js/mdx`, single maintainer.
- **Content Collections.** `@content-collections/core` 0.15.3 (2026-09-21, active), but `@content-collections/mdx` was last published 2025-03-10 and `@content-collections/next` 2026-02-14. Pre-1.0.
- **Velite 0.4.0** (2026-06-17; 1.0.0-alpha.3 in progress). Pre-1.0, separate build process, no Next plugin yet.
- **Contentlayer.** Abandoned (0.3.4); the `contentlayer2` fork was last released 2025-05. Do not use.
- **Fumadocs MDX 15.4.3.** Active, but tied to the Fumadocs docs framework. Too opinionated for a course app.

### 6.2 Recommendation: in-repo typed loader + `@mdx-js/mdx` `evaluate()` in RSC
- `content/` holds `stages/<stage>/<module>/index.mdx` plus `exercises/<id>/{statement.mdx, starter.py, solution.py, tests/*.in|*.out, meta.yaml}` (the exact layout is W2's call).
- `lib/content/` has a loader that reads files with `fs` (build time only), parses frontmatter with **`yaml` 2.9.1** (or `vfile-matter` 5.0.1), and validates it with **Zod 4.6.5** schemas (module ID, prerequisites that must exist, stage, exercise references, CCC problem refs that must satisfy the D-008 URL rules). The build fails with file and field in the error. It exports **typed** getters (`getModule(id)`, `getCurriculum()`), and `generateStaticParams` comes straight from them.
- A server component compiles MDX with **`@mdx-js/mdx` 3.1.1 `evaluate()`** and a **fixed component map** (`<Callout>`, `<Exercise id>`, `<Quiz>`, `<TryIt>`, `<Graph>`, `<Tree>`, `<Grid>`, `<StepThrough>`, `<CccProblem id>`). Authors don't import components, which keeps the content vocabulary consistent. Because this runs in normal server JS (not a Turbopack loader), **any plugin, including function-valued Shiki transformers, works**, and static export renders it to HTML at build. (`next-mdx-remote-client/rsc` is an acceptable drop-in if the team prefers a wrapper.)
- Plugins: `remark-gfm` 4.0.1, `remark-math` 6.0.0 + `rehype-katex` 7.0.1 (KaTeX **0.18.9**, server-rendered HTML with only CSS and fonts shipped), `rehype-slug` 6.0.0, `@shikijs/rehype` 4.4.3. **Shiki 4.4.3** uses one light theme (e.g. `github-light` or a custom theme generated from DESIGN.md tokens) with zero client JS for static code.
- **Math need is small** (Big-O, sums, modular arithmetic). KaTeX at build time costs nothing at runtime, so include it, but the style guide should prefer plain text where possible.
- **Diagrams: hand-authored React SVG components** (arrays with pointers, grids, graphs with authored coordinates, trees, DP tables, `StepThrough` for animated algorithm steps). They are deterministic, accessible (`<title>`/`<desc>`, text alternatives), themeable from the same tokens, and testable with screenshots. **Reject Mermaid 12.0.0**: heavy client runtime (or a headless browser at build), little layout control, visually inconsistent, needs Node ≥22.12.
- A content validation script (`npm run check:content`) runs the loader, the Zod schemas, prerequisite DAG checks, D-008 link checks, and the Python extraction for §4.3.

---

## 7. Styling and UI
- **Tailwind CSS 4.3.3** (v4.3 released 2026-05-08; no v5 announced; Tailwind Labs joined Shopify 2026-09-09) via `@tailwindcss/postcss` 4.3.3. Use CSS-first config: design tokens as CSS variables in `@theme`, **the natural place for Impeccable's DESIGN.md tokens**, so the design skill and code share one source of truth. Browser floor: Chrome 111, Safari 16.4, Firefox 128. `@tailwindcss/typography` 0.5.20 is optional for lesson prose. Custom prose styles derived from DESIGN.md are probably better, and Impeccable should decide.
- **Light mode only (R6):** set `color-scheme: light` on `:root` plus `<meta name="color-scheme" content="light">` so OS dark mode never darkens form controls or scrollbars. Never emit `dark:` variants, and add a lint/grep check that fails on `dark:` or `prefers-color-scheme: dark` in the source.
- **Components: shadcn/ui (CLI `shadcn` 4.21.0) on Base UI.** shadcn made **Base UI the default in July 2026**, and it still supports Radix. `@base-ui/react` **1.8.0** (stable since 1.0 in December 2025, maintained full-time by the MUI team). Radix (`radix-ui` 1.6.7) is maintained but has slowed since the WorkOS acquisition. shadcn copies component source into the repo (we own and restyle it), which suits Impeccable. The `cn` helper now ships as the `cn` package (0.4.0), or use `clsx` + `tailwind-merge` 3.7.0. Run the shadcn CLI with the workspace npm cache (W3).
- **Fonts:** `next/font/local` with WOFF2 files committed under `app/fonts/` (sourced once from Fontsource packages, e.g. `@fontsource-variable/*`, or Google Fonts). This gives offline builds and automatic `font-display`/preload. Font choice belongs to Impeccable. Pick a code font with clear `0/O`, `1/l/I` distinctions.
- **Icons: lucide-react 1.47.0** (tree-shakeable, consistent stroke). Keep to one set.
- Keep the UI dependency list short: no state library beyond React state/context; `idb` for storage; `zod` shared between content and progress schemas.

---

## 8. Testing and quality stack (tool choice and versions; W3 covers containment)
- **Unit/integration: Vitest 5.0.1** (2026-09-15; peer Vite ^6.4/^7/^8) with `@vitejs/plugin-react` 6.1.1, and `jsdom` 30.1.1 or `happy-dom` 20.14.5 for DOM units. Cover the content loader and schemas, the progress store and migrations, the output checker (normalisation, diff), the D-008 URL builder, and the Pyodide harness **in Node** (`pyodide` runs under Node, which is fast for testing `harness.py`, `compat38.py`, stdin idioms, and the vermin integration without a browser).
- **E2E: Playwright 1.63.0** (Chromium 153, Firefox 155, **WebKit 26.6**). Run all three engines: WebKit approximates Safari, and Pyodide/wasm behaviour differs per engine. Serve the **built static export** for E2E, not `next dev`. Key flows: first visit, Python boot, run with stdin, grade pass/fail, infinite loop → timeout → recovery with the spare worker, 3.8 lint blocks submit, progress export/import round-trip, "no request leaves origin".
- **Visual regression:** Playwright `toHaveScreenshot` with animations disabled, fonts loaded, fixed viewport set (e.g. 390×844, 768×1024, 1440×900), and a small `maxDiffPixelRatio`. Baselines are OS- and browser-specific, so generate and compare them on the same machine.
- **Accessibility:** `@axe-core/playwright` 4.13.0 (axe-core 4.13.0) on every route template and on key states (dialogs open, lint errors shown), with WCAG 2.2 AA tags.
- **Lint and format: Biome 2.5.14** (one tool, fast, no TS JS-API dependency, officially offered by Next ≥16). *Why not ESLint:* `create-next-app` still pins `eslint: ^9`, **ESLint 9 reached EOL on 2026-08-06**, and `eslint-config-next` 16.3.6 depends on `eslint-plugin-react`, `jsx-a11y`, and `import`, whose peer ranges stop at ESLint 9. `typescript-eslint` also caps TypeScript at <6.1. An ESLint 10 flat config with only `@next/eslint-plugin-next` + `typescript-eslint` + `react-hooks` is possible if the orchestrator wants Next-specific rules; Biome's `next` and `react` domains plus axe cover most of it. Prettier is unnecessary with Biome.
- **Type-check:** `tsc --noEmit` (TS 6.0.3) as its own script. `next build` also type-checks via the CLI.
- **Links:** **linkinator 8.1.0** crawling the served `out/` for internal links and anchors. Plus a **custom D-008 validator** that checks the *format* of every CCC link (WMOJ `/problems/cccYYx#` for 2020–2026, DMOJ `/problem/cccYYx#/` before 2020) at content-build time. A **separate, throttled, manually triggered** job verifies that each slug exists on WMOJ/DMOJ and caches the results in a committed JSON file, so regular builds don't hammer external judges. (W4 covers link QA in depth.)
- **Python gate:** §4.2 layer 3 (PyPy3.8 + Pyodide-in-Node + ruff + vermin + compat38).
- One aggregate script, `npm run verify`, runs Biome, tsc, Vitest, the content check, the Python gate, the build, linkinator, and Playwright (E2E, visual, axe).

---

## 9. Pinned versions

All "latest" values were read from `registry.npmjs.org/<pkg>` (dist-tags + publish time) on 2026-09-23 unless another URL is given.

| Component | Pin | Released | Verified on / note |
|---|---|---|---|
| next | **16.3.6** | 2026-09-22 | npm; nextjs.org/blog (security update 2026-09-22) |
| react / react-dom | **19.3.0** | 2026-09-09 | npm |
| typescript | **6.0.3** (7.0.2 is `latest`) | TS 7.0.2: 2026-07-08 | npm; Next docs `useTypeScriptCli`; typescript-eslint peer `<6.1.0` |
| @types/node / @types/react | 26.6.2 / 19.3.0 | 2026-09 | npm |
| Node.js | **26.x latest patch (26.10.0)**; machine has 26.0.0 | 26.0.0: 2026-05-05 | endoflife.date/nodejs; nodejs.org release schedule post |
| npm | 11.12.1 (bundled); 12.1.0 available | — | local `npm -v`; npm registry |
| pyodide | **314.0.7** (CPython 3.14.2) | 2026-09-14 | npm; pyodide.org changelog |
| vermin (wheel, vendored) | **1.8.0** | 2025-11-20 | pypi.org/pypi/vermin/json; tested locally |
| PyPy (CI, native) | **pypy3.8 v7.3.11** (Python 3.8.16) macOS arm64 via uv | 2022-12-29 | `uv python list` (uv 0.12.5); doc.pypy.org release-v7.3.11 |
| PyPy (CI, exact grader) | **pypy3.8 v7.3.9 osx64** under Rosetta | 2022-03-30 | downloads.python.org (HTTP 200, 25.5 MB); doc.pypy.org release-v7.3.9 (no macOS arm64) |
| CPython 3.8 (CI, optional) | 3.8.13 via uv (python-build-standalone) | — | `uv python list` |
| ruff (CI only) | 0.16.8 | 2026-09 | pypi.org/pypi/ruff/json |
| codemirror core packages | state 6.7.6, view 6.43.13, commands 6.11.1, language 6.12.4, autocomplete 6.20.3, lint 6.9.7 | 2026 | npm |
| @codemirror/lang-python | 6.2.1 | — | npm |
| @mdx-js/mdx | 3.1.1 | — | npm |
| remark-gfm / remark-math / rehype-katex / rehype-slug | 4.0.1 / 6.0.0 / 7.0.1 / 6.0.0 | — | npm |
| katex | 0.18.9 | — | npm |
| shiki / @shikijs/rehype | 4.4.3 | 2026-08-10 | npm |
| zod | 4.6.5 | 2026-09-13 | npm |
| yaml | 2.9.1 | 2026-09-11 | npm |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | 2026-07-16 | npm; tailwindcss.com/blog |
| @base-ui/react | 1.8.0 | 2026-09-04 | npm; shadcn changelog (Base UI default July 2026) |
| shadcn (CLI) | 4.21.0 | 2026-09-04 | npm |
| tailwind-merge / clsx (or `cn`) | 3.7.0 / 2.1.1 (cn 0.4.0) | — | npm |
| lucide-react | 1.47.0 | — | npm |
| idb | 8.0.3 | — | npm |
| vitest | 5.0.1 | 2026-09-15 | npm |
| @vitejs/plugin-react | 6.1.1 | — | npm |
| jsdom / happy-dom | 30.1.1 / 20.14.5 | — | npm |
| @playwright/test | 1.63.0 (Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6) | 2026-09-04 | npm; playwright.dev/docs/release-notes |
| @axe-core/playwright | 4.13.0 | — | npm |
| @biomejs/biome | 2.5.14 | 2026-09-16 | npm |
| linkinator | 8.1.0 | — | npm |
| serve (local static serving, optional) | 14.2.6 | 2026-03-03 | npm |

Could not verify: Pyodide warm-start time on current hardware; the exact CodeMirror bundle size for our setup; that vermin's `visit()` runs unmodified inside Pyodide (it runs on CPython 3.14.7, the same parser); that PyPy 7.3.9 osx64 runs cleanly on macOS 26 under Rosetta; Pyodide 314's maximum recursion depth per browser; whether the `stdin` callback preserves a missing final newline when given bytes. **All of these belong in a Phase-3 "runtime spike" task before content production.**

---

## 10. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | In-browser Python is 3.14, not 3.8 | Three enforcement layers (§4). The CI gate uses real PyPy3.8. |
| 2 | Timing: Pyodide is roughly 10–100× slower than grader PyPy on hot loops | Correctness-only tests in-app. Performance verified on WMOJ/DMOJ PyPy3. Honest UI copy. |
| 3 | Recursion semantics differ (deeper in Pyodide; possible fatal `RangeError`) | Reset limit each run. Checker warnings. Deep-input tests. Treat `RangeError` as a crash and respawn. |
| 4 | Int→str 4300-digit limit in CPython 3.14 | `sys.set_int_max_str_digits(0)` in the harness. |
| 5 | Turbopack emits module workers as classic workers (#98841) | Worker is a static file in `public/py/`, not bundled. |
| 6 | SharedArrayBuffer needs COOP/COEP, which static export can't set (GitHub Pages never can); COEP breaks external embeds; Safari lacks `credentialless` | Terminate-and-respawn timeouts with a pre-warmed spare. SAB interrupt only when `crossOriginIsolated`. Avoid third-party embeds. |
| 7 | Static export: no headers, redirects, middleware, image optimisation, or server actions | Enumerate all routes. `dynamicParams=false`. Headers in host config. `images.unoptimized`. `trailingSlash`. |
| 8 | Safari ITP deletes local progress after 7 days of Safari use without visiting | Onboarding guidance, backup reminder, export/import, `storage.persist()`, Dock install. |
| 9 | Pyodide stdin semantics (newline appending, fd-0 vs `sys.stdin`) | Byte-exact `TextIOWrapper(BytesIO)` plus a `setStdin` Uint8Array. A spike tests five idioms. |
| 10 | Next.js monthly security releases | Exact pins. Patch-bump task in the maintenance checklist. Static export limits exposure. |
| 11 | ESLint 9 EOL / TS 7 ecosystem gaps | Biome + TS 6.0.3. |
| 12 | Rosetta ends after macOS 27, which ends the exact-7.3.9 local check | Native PyPy 7.3.11 is the everyday gate; 7.3.9 linux64 on a Linux runner long-term. |
| 13 | ~6 MB Python download on first visit | Pre-warm, immutable caching, friendly loading state. Optional service worker later. |
| 14 | `next dev` auto-edits AGENTS.md; `create-next-app` writes AGENTS.md/CLAUDE.md into `main-app/` | Scaffold manually. Decide how `main-app/AGENTS.md` coexists with workspace agent rules. |
| 15 | Containment leaks (npm cache, Next telemetry, Playwright browsers, uv shims) | Env vars and `.npmrc` listed in §1.5, handed to W3. |

---

## 11. Open decisions for the Manager / orchestrator
1. **Hosting:** local-only vs hosted (Vercel / Cloudflare Pages / Netlify), and public vs access-controlled (§2.3).
2. **Node:** accept system Node 26.0.0, or add a workspace-local Node 26.10.x (recommended; W3 to specify).
3. **Learner's browser:** if Safari, accept the eviction guidance or require Dock install.
4. **Output checker policy:** exact vs trailing-whitespace-tolerant (recommend tolerant, matching judges; confirm against CCC practice).
5. **Exact PyPy 7.3.9 under Rosetta** as a periodic check (recommended while macOS ≤27), or native 7.3.11 only.

---

## Sources
- Next.js blog index (16.3.6 security release 2026-09-22; LTS lines): https://nextjs.org/blog
- Next.js 16.3 release post: https://nextjs.org/blog/next-16-3
- Next.js support policy: https://nextjs.org/support-policy
- Next.js installation (Node 20.9 minimum, browsers, Turbopack default, ESLint/Biome, `next build` no longer lints): https://nextjs.org/docs/app/getting-started/installation
- Next.js static exports guide (v16.3.6): https://nextjs.org/docs/app/guides/static-exports
- Next.js `useTypeScriptCli` / TypeScript 7: https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli
- Next.js MDX guide (Turbopack string plugins, frontmatter): https://nextjs.org/docs/app/guides/mdx
- create-next-app template deps (typescript ^5, eslint ^9): https://raw.githubusercontent.com/vercel/next.js/v16.3.6/packages/create-next-app/templates/index.ts
- Turbopack module-worker issue #98841: https://github.com/vercel/next.js/issues/98841
- npm registry (all npm versions/dates/engines/peers): https://registry.npmjs.org/ (e.g. https://registry.npmjs.org/next)
- Node.js release schedule change: https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule
- Node.js 26.0.0 release: https://nodejs.org/en/blog/release/v26.0.0
- Node.js EOL table: https://endoflife.date/nodejs
- Corepack no longer distributed from Node 25: https://socket.dev/blog/node-js-tsc-votes-to-stop-distributing-corepack , https://github.com/nodejs/corepack/issues/722
- npm `min-release-age`: https://www.brandonpugh.com/til/node/package-version-cooldown/ ; pnpm 11 minimumReleaseAge: https://pnpm.io/blog/releases/11.0
- Pyodide 314.0 release blog: https://blog.pyodide.org/posts/314-release/
- Pyodide changelog: https://pyodide.org/en/stable/project/changelog.html
- Pyodide 0.17.0 / 0.18.0 changelogs (3.8.2 → 3.9.5): https://pyodide.org/en/0.17.0/project/changelog.html , https://pyodide.org/en/0.18.0/project/changelog.html
- Pyodide keyboard interrupts: https://pyodide.org/en/stable/usage/keyboard-interrupts.html
- Pyodide streams (stdin/stdout): https://pyodide.org/en/stable/usage/streams.html
- Pyodide web worker (module workers required): https://pyodide.org/en/stable/usage/webworker.html
- Pyodide downloading and deploying: https://pyodide.org/en/stable/usage/downloading-and-deploying.html
- Pyodide supported browsers: https://pyodide.org/en/stable/usage/index.html
- Pyodide Python compatibility (threading/multiprocessing non-functional): https://pyodide.org/en/stable/usage/wasm-constraints.html
- Pyodide roadmap (3–5× slower; 6.4 MB first load): https://pyodide.org/en/stable/project/roadmap.html
- Pyodide recursion issues: https://github.com/pyodide/pyodide/issues/5959 , https://github.com/pyodide/pyodide/issues/5987 , https://github.com/pyodide/pyodide/discussions/2818
- Pyodide release assets: https://github.com/pyodide/pyodide/releases ; jsDelivr https://cdn.jsdelivr.net/pyodide/v314.0.7/full/
- Brython (3.14.3): https://github.com/brython-dev/brython ; Skulpt: https://github.com/skulpt/skulpt ; RustPython: https://github.com/RustPython/RustPython
- vermin: https://github.com/netromdk/vermin ; https://pypi.org/project/vermin/
- Python `ast` docs (feature_version best-effort, min 3.7): https://docs.python.org/3/library/ast.html
- Ruff version-related syntax errors (PEP 701 before 3.12, etc.): https://github.com/astral-sh/ruff/pull/16543 , https://github.com/astral-sh/ruff/issues/6591
- PyPy 7.3.9 release (platforms; no macOS arm64): https://doc.pypy.org/en/latest/release-v7.3.9.html
- PyPy 7.3.11 release (pypy3.8 3.8.16; Apple M1 arm64): https://doc.pypy.org/en/latest/release-v7.3.11.html
- PyPy downloads: https://downloads.python.org/pypy/
- Rosetta end of general support after macOS 27: https://developer.apple.com/news/?id=w5ngl9k2 , https://www.macrumors.com/2026/06/10/macos-golden-gate-last-to-support-intel-apps/
- COOP/COEP background: https://web.dev/articles/coop-coep ; MDN COEP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ; Safari and credentialless: https://blog.stackblitz.com/posts/cross-browser-with-coop-coep/
- GitHub Pages headers + coi-serviceworker: https://github.com/gzuidhof/coi-serviceworker , https://github.com/orgs/community/discussions/13309 , https://blog.tomayac.com/2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/
- Safari 7-day storage cap: https://selfstore.dev/blog/browser-storage-is-not-durable ; MDN storage quotas/eviction: https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Monaco README (no mobile support): https://github.com/microsoft/monaco-editor ; Monaco mobile issue: https://github.com/microsoft/monaco-editor/issues/1504
- CodeMirror Tab handling / accessibility: https://codemirror.net/examples/tab/ ; Replit "Betting on CodeMirror": https://blog.replit.com/codemirror
- next-mdx-remote archived (2026-04-09) and alternatives: https://github.com/hashicorp/next-mdx-remote , https://www.pkgpulse.com/guides/contentlayer-vs-velite-vs-next-mdx-remote-mdx-content-2026
- Velite: https://github.com/zce/velite ; Content Collections: https://www.content-collections.dev/
- Tailwind blog (v4.3; Shopify): https://tailwindcss.com/blog ; Tailwind compatibility: https://tailwindcss.com/docs/compatibility
- shadcn/ui changelog (Base UI default July 2026): https://ui.shadcn.com/docs/changelog , https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- Playwright release notes (1.63 browsers): https://playwright.dev/docs/release-notes
- ESLint version support (v9 EOL 2026-08-06): https://eslint.org/version-support/
- Local experiments (2026-09-23, this machine): `ast.parse(feature_version=(3,8))` matrix and vermin 1.8.0 detection matrix on CPython 3.14.7; `uv python list --only-downloads --offline`; HTTP HEAD checks of PyPy and Pyodide assets; Pyodide 314.0.7 npm tarball listing and gzip sizes; int→str digit-limit check.
