# W4 — Problem-link verification feasibility & QA/testing strategy

Worker W4, Phase 2 (Implementation plan). Read `context/project-brief.md` (R13, R14), `context/decisions.md` (D-008), `research/01-recon/curriculum-map.md`, and `context/phase-logs/phase-01-recon.md` (Known gaps: DMOJ Cloudflare 403) before this run. All findings below were produced today (2026-09-23) with live `curl`, `WebFetch` and `WebSearch` calls; nothing is carried over from training-data memory of these sites. Anything not independently confirmed today is marked **UNVERIFIED**.

---

## Part A — Problem-link verification feasibility

### A1. Do wmoj.ca and dmoj.ca respond to automated requests?

| Site | Method | Result |
|---|---|---|
| `wmoj.ca` | `curl -sI` / `curl -s` (plain UA, no cookies, no JS) | **Works.** Vercel-hosted Next.js app. Every `/problems/<slug>` request returns **HTTP 200**, including for slugs that don't exist — see A1a. No Cloudflare challenge, no bot wall observed. `robots.txt` present (`Disallow: /admin/`, `/manager/`, `/api/`; `Allow: /`), `sitemap.xml` present and fetchable. |
| `dmoj.ca` | `curl -sI` / `curl -s`, and `WebFetch` (a different fetcher) | **Blocked.** Every request, including to `/api/v2/problems`, returns **HTTP 403** from Cloudflare with `cf-mitigated: challenge` and a "Just a moment..." interstitial. This reproduces the Phase 1 "Known gaps" finding exactly — DMOJ cannot be scraped by either `curl` or the `WebFetch` tool as of today. Confirmed on both a real slug (`ccc19s1`) and a fake one; both get the same 403 challenge page, so **status code carries no information on DMOJ** for automated tools. |

**A1a — Critical finding: WMOJ never returns a real HTTP 404.** `https://wmoj.ca/problems/ccc99z9` (a deliberately fake slug) returns **HTTP 200**, identical status/headers to a real problem page, because it's a client-rendered Next.js catch-all route. **HTTP status code cannot be used to verify a WMOJ slug.** The page body must be inspected instead. Two reliable, cheap markers found by diffing a real page (`ccc25j1`) against the fake one:
- A **missing** slug's HTML contains the literal string `NEXT_HTTP_ERROR_FALLBACK;404` (Next.js's not-found digest, embedded in the RSC payload) and a `<meta name="robots" content="noindex"/>` tag.
- A **real** slug's HTML contains none of that, and instead contains real problem-statement text (`Input Specification`, `Output Specification`, `Sample Input`).

Recommended check: `grep -qv 'NEXT_HTTP_ERROR_FALLBACK'` on the GET body (do **not** rely on `curl -sI`/HEAD status).

### A2. Public API? Best-effort slug verification for 2014–2026

**No usable public API on either judge, for different reasons:**
- **DMOJ** does have a documented `/api/v2/problems` REST API, but it sits behind the same Cloudflare challenge as everything else on the domain — confirmed 403 today, both via `curl` and `WebFetch`. It cannot be called by this worker's tools. (Whether it would work from a real headless browser with a persistent session is unknown/out of scope here.)
- **WMOJ** is *not* a DMOJ-codebase fork with a compatible API — confirmed via its GitHub repo (`WMOJ/wmoj-app`, "Open-Source Competitive Programming Platform Inspired by DMOJ", built by White Oaks Secondary School's CS Club on Next.js + Supabase, "inspired by DMOJ" but independently written). `GET /api/v2/problems` on wmoj.ca returns a normal 404 **page** (not JSON), and `robots.txt` explicitly disallows `/api/`. **There is no WMOJ API to poll.**
- **What WMOJ does have: `sitemap.xml`.** `https://wmoj.ca/sitemap.xml` lists every published page, including every problem it hosts, as plain `<loc>` entries. This is the practical bulk-listing mechanism — it returned all 56 CCC slugs WMOJ actually has (verified below to be a complete, exact match against a direct 70-slug scan) in one polite request, avoiding the need to guess-and-check hundreds of URLs.

**Method used today:** (1) fetched `sitemap.xml` once and diffed against the formulaic slug list; (2) directly content-checked all 70 formulaic slugs `ccc{20..26}{j,s}{1..5}` (the D-008 WMOJ range) with the A1a marker, one request each, `sleep 0.15` between requests (polite, ~70 requests total, ~15s); (3) used `WebSearch` (not scraping) to identify the true titles of anomalies against CEMC/DMOJ/GitHub-solution sources, since DMOJ itself can't be fetched directly.

**Result: 56 of 70 OK, 14 "missing" by the naive formula — and all 14 are explained, in two different ways:**

| Category | Slugs | Explanation | Confidence |
|---|---|---|---|
| **Genuine J/S crossover problems** (CCC sometimes reuses one problem as the last Junior problem *and* an early Senior problem; DMOJ/WMOJ host it once, under the **Senior** slug) | `ccc21j5` → really `ccc21s2`; `ccc22j4` → really `ccc22s2`; `ccc23j4` → really `ccc23s1`; `ccc26j5` → really `ccc26s2` | Confirmed both by `research/01-recon/curriculum-map.md` line 31 ("Shared Junior/Senior problems are written like `2026 J5/S2`. DMOJ lists shared problems only under the Senior code") and independently by `WebSearch` today: e.g. `ccc22s2` on WMOJ is literally titled **"CCC '22 S2 - Good Groups"**, and CEMC/YouTube sources independently confirm 2022 J4 = "Good Groups" = the same problem; DMOJ's own editorial page is titled "Editorial for CCC '22 S2 - Good Groups" and a second video is titled "CCC 2022 J4 / S2 - Good Groups". Same pattern verified for 2023 (`ccc23s1` = "Trianglane" = 2023 J4, via a public GitHub solutions repo ordering J1–J5) and for `ccc21s2`/`ccc26s2` (curriculum-map's own crossover list, cross-checked against the WMOJ scan showing `ccc21s2` and `ccc26s2` both OK). | **High** — two independent sources per case. |
| **A whole missing contest year** | `ccc20j1`–`ccc20j5`, `ccc20s1`–`ccc20s5` (all 10) | WMOJ's `sitemap.xml` contains **zero** `ccc20*` entries — its earliest year is 2021. Direct content-checks of all 10 slugs confirm every one is a true 404 (`NEXT_HTTP_ERROR_FALLBACK` marker present). This is **not** a naming-convention issue: tried `ccc20s1a`, `ccc20j1a`, `ccc20s2a` variant slugs — all also missing. It is **not** because CCC 2020 didn't happen or was COVID-cancelled — `WebSearch` confirms CCC 2020 ran normally (Feb 2020, before COVID disrupted North American events in March 2020) and that 2020 problems exist and are well documented on DMOJ (e.g. `dmoj.ca/problem/ccc20j1` = "Dog Treats", independently corroborated by a GitHub solutions repo). **WMOJ simply never mirrored 2020.** | **High** for "not on WMOJ"; the exact reason WMOJ skipped 2020 is unknown (not published anywhere found). |

**Net result for the D-008 rule (2020–2026 → WMOJ):** 66 of 70 formulaic 2020–2026 problems resolve correctly once the app's link generator knows about the 4 crossover exceptions (use the Senior slug, not the naive Junior one). **The 10 problems from 2020 have no WMOJ page at all and are a genuine rule violation** — under D-008 as literally written they'd 404. **This must go to the Manager** (see "If a problem is missing on WMOJ" below); it isn't something a generator or a silent DMOJ fallback should resolve unilaterally, because D-008 explicitly draws the 2020 line at "years before 2020 (not on WMOJ) → dmoj.ca", implying the Manager believed 2020 *was* on WMOJ.

**Pre-2020 (2014–2019) DMOJ verification:** could not be automated (Cloudflare blocks both `curl` and `WebFetch`, confirmed today, matching the Phase 1 gap). Spot-checked via `WebSearch` instead (finds indexed DMOJ page titles without hitting the site directly): `ccc14j1` confirmed ("CCC '14 J1 - Triangle Times", also mirrored on a GitHub solutions repo), `ccc19j5` and `ccc19s5` confirmed to exist as real DMOJ URLs in search results. A `ccc17s5` check did not surface a definitive hit in search results — **inconclusive, not confirmed missing**, just not corroborated; DMOJ's own listing wasn't reachable to check directly. **No pre-2020 slug was found broken**, but this is a spot-check (4 of 65 pre-2020 slugs), not exhaustive — treat pre-2020 DMOJ coverage as "no evidence of breakage" rather than "fully verified."

### A3. Link-verification mechanism design (for the build phase)

**1. Problem registry — the only source of URLs.**
A single data file, e.g. `content/problems.json` (or a Zod-typed `.ts` module), one entry per CCC problem actually referenced anywhere in the app:
```jsonc
{
  "id": "2022-j4",              // stable internal id, matches curriculum-map "2022 J4/S2" style refs
  "year": 2022, "division": "J", "number": 4,
  "title": "Good Groups",
  "judge": "wmoj",               // "wmoj" | "dmoj"
  "slug": "ccc22s2",             // the ACTUAL slug, not the naive formula — captures crossover overrides
  "crossover": "S2",             // optional: records that this is also the Senior problem
  "verifiedAt": "2026-09-23",    // last time the checker confirmed this slug resolves
  "verifiedMethod": "wmoj-content-check"
}
```
Every lesson/exercise page references a problem by `id` and renders its link from this registry — **never** hand-writes a `wmoj.ca`/`dmoj.ca` URL in MDX/content.

**2. A generator that derives URLs from year by rule, with an explicit override list.**
```
url(problem):
  if problem.slug_override: use it (registry field "slug")
  else if problem.year >= 2020: `https://wmoj.ca/problems/${cccSlug(problem)}`
  else:                          `https://dmoj.ca/problem/${cccSlug(problem)}/`
```
`cccSlug()` implements D-008's `ccc<yy><j|s><n>` rule exactly as a pure function (unit-tested against the whole curriculum list). The registry's `slug` field is the override for the ~6% of cases (crossovers, and any future WMOJ renumbering) where the formula is wrong — this is exactly what today's scan found, so the override mechanism is not speculative, it's load-bearing from day one.

**3. Verification script — API-based where possible, content-check where not, with a committed offline snapshot.**
- **WMOJ:** no real API; use `sitemap.xml` as the bulk source of truth (fast, ~1 request) to build a candidate set, then content-check (A1a marker) each registry slug that isn't in the sitemap, to positively confirm 404s rather than assume. Never trust WMOJ's HTTP status code.
- **DMOJ:** the documented `/api/v2/problems` (and `/api/v2/problem/<code>`) endpoint is the right one *if and when* it's reachable from CI's network — Cloudflare's challenge may or may not trigger for a residential/CI IP with a real browser UA; this worker's sandboxed `curl`/`WebFetch` could not get past it today, so **assume it will need a real headless browser (Playwright) with a persistent context, run manually or in a separate low-frequency job, not `curl`.**
- **Cached snapshot, committed in the repo** (e.g. `content/problems.verified.json`): `{ slug, judge, status: "ok"|"missing"|"unverified", checkedAt, method }` for every registry entry. Build-time tests and CI read **only this snapshot** — deterministic and fully offline, no network calls in the normal test suite.
- **Periodic online refresh:** a separate, manually-triggered or weekly-scheduled job re-runs the live checks (WMOJ content-check is cheap and safe to automate; DMOJ needs the headless-browser approach and should run less often / be allowed to fail soft) and opens a PR/diff against the snapshot when something changes. A snapshot entry older than e.g. 90 days should be flagged as stale in CI (warning, not hard failure) rather than silently trusted forever.

**4. CI / lint rules.**
- **No raw `wmoj.ca` / `dmoj.ca` strings anywhere in `content/` (MDX, JSON, etc.) except inside the registry file itself.** A simple `grep -rn 'wmoj\.ca\|dmoj\.ca' content/ --include='*.mdx'` (or an ESLint/remark rule) that must return nothing, enforced in CI.
- **Any 2020–2026 problem whose registry entry resolves to a `dmoj.ca` URL is a hard CI error** (this is D-008 as a lint, not just documentation) — *except* where the registry explicitly marks it `"judge": "dmoj", "exception": "wmoj-missing-2020"` with a comment linking back to the Manager decision that approved the exception (see next point). This makes the 2020 gap an explicit, auditable, Manager-approved exception rather than a silent rule violation.
- **Every registry entry must appear in `problems.verified.json` with `status: "ok"`.** Any `"missing"` or `"unverified"` entry fails the build (or is allowlisted with a tracked TODO, at the Manager's discretion) — this is what turns A2's findings into a real regression gate.
- **If a problem is missing on WMOJ:** the generator/verifier must **flag it for the Manager, never silently fall back to DMOJ.** Concretely: verification script exits non-zero (or produces a clearly-labelled report section) listing every registry entry with `status: "missing"`, and the app must not ship a link for that problem until the Manager decides (options the Manager would choose between: wait for WMOJ to add it, use DMOJ despite the year, or drop the problem reference from that lesson). This is exactly the situation the 2020 gap creates today — it should be the first item logged when this mechanism goes live.

### A4. Non-CCC practice problems

`curriculum-map.md` (the content spec, 1521 lines) was grepped exhaustively for USACO, CSES, Codeforces, Kattis, LeetCode, DWITE, ECOO, and any non-`ccc`-prefixed DMOJ problem code. **Zero hits.** Every single practice-set reference in the curriculum is a CCC problem (`20YY J#`/`20YY S#` or the `20YY J#/S#` crossover notation). So today there is nothing to decide for non-CCC problems — **but** flag as an **open question for the Manager anyway**, because:
- The curriculum could still gain non-CCC practice problems during the build phase (e.g. lesson-writers may want a USACO Bronze problem for extra drill on a technique).
- D-008/R13 as written only defines the link rule for CCC problems. If non-CCC problems are ever added, the Manager needs to decide: do they get a registry entry too (recommended, for the same link-checking benefit), and what host/format rule applies (USACO problems live at `usaco.org/index.php?page=viewproblem2&cpid=<id>`, CSES at `cses.fi/problemset/task/<id>`, Codeforces at `codeforces.com/problemset/problem/<contest>/<index>` — none of these follow the CCC slug convention, so the registry's URL-generation logic would need a per-judge branch, not just a `wmoj`/`dmoj` switch).

---

## Part B — QA/testing strategy research (current as of 2026-09-23)

### B1. Playwright — version and E2E practices for a Next.js static app

- **Current stable: Playwright 1.62.1** (released 2026-07-30); the "2026 release line" (1.60–1.62, May–Aug 2026) added isolated retries, WebP screenshots, page-scoped storage APIs, more video modes, and Ubuntu 26.04 runner support, and made UI Mode the default authoring/debugging surface. Pin an exact version in `package.json` (not `^`/`~`) so CI and local baselines never silently drift — this matters especially for visual regression (below). [Playwright release notes](https://playwright.dev/docs/release-notes), [QASkills.sh: Playwright 1.61/1.62](https://qaskills.sh/blog/playwright-1-61-whats-new-adoption-guide), [currents.dev: 1.60.0](https://currents.dev/posts/pw-1.60.0).
- **General E2E approach for a static/SSG Next.js app:** run against the production `next build && next start` (or the static export) in CI, not `next dev` — dev-mode HMR and slower compilation are a common source of flaky waits. Use Playwright's built-in web-server config (`webServer` in `playwright.config.ts`) so CI starts the app itself.
- **Visual regression (`toHaveScreenshot`):**
  - Playwright auto-disables CSS animations and waits for web fonts to finish loading before a screenshot is taken, but only when told to — pass `animations: 'disabled'` explicitly and, before critical screenshots, wait on the Font Loading API (`document.fonts.ready`) so a cold-cache first run doesn't capture a font-swap frame.
  - **OS-specific snapshot names:** Playwright's snapshot filenames are suffixed with the platform (`-darwin`, `-linux`, `-win32`) by default, because font rasterization differs per OS. Standardize on **one OS for baseline generation** — run visual tests only inside Playwright's official Docker image in CI, and generate/update baselines from that same image, never from a developer's Mac. Playwright pins its bundled browser build to the exact Playwright package version, so pinning the version (above) is what actually makes rendering reproducible across machines running the same image.
  - Prefer **component/element-level** `toHaveScreenshot()` over full-page screenshots (smaller diffs, faster, less incidental noise) except for a small number of full-page "does the whole lesson page look right" smoke shots.
  - `mask: [...]` any dynamic content (a "today" date on a lesson, a random practice-problem selector, live progress state) so timestamps/counters don't cause false failures.
  - Use a sensible non-zero `maxDiffPixelRatio`/`threshold` (start conservative, e.g. `threshold: 0.2`, `maxDiffPixelRatio: 0.01`) rather than pixel-perfect-or-fail, to absorb sub-pixel anti-aliasing noise while still catching real regressions.
  - [Playwright docs: visual comparisons](https://playwright.dev/docs/test-snapshots), [QASkills.sh: visual regression guide 2026](https://qaskills.sh/blog/playwright-visual-regression-testing-guide), [qaskills.sh: disable animations/carets](https://qaskills.sh/blog/playwright-screenshot-animation-caret-disable).
- **Flakiness controls:**
  - **Retries:** `retries: 0` locally, `retries: 1–2` in CI (standard Playwright guidance) — but retries mask, not fix, flake, so pair CI retries with `--fail-on-flaky-tests` on the main/merge-gate run, which treats any test that only passed after a retry as a failure. That surfaces flake instead of hiding it behind green CI.
  - **Burn-in / flake detection:** before merging a new or changed test, run it with `--repeat-each 10` (or `--repeat-each 20` for anything touching the Pyodide runner or visual snapshots) and `--retries 0`, so a genuinely flaky test can't hide behind a lucky pass. A stress variant (`--repeat-each 100 --workers <N> --fail-on-flaky-tests`) is worth keeping as an occasional/scheduled job rather than every-PR, for cost reasons.
  - [Playwright docs: retries](https://playwright.dev/docs/test-retries), [QASkills.sh: retries & flaky handling 2026](https://qaskills.sh/blog/playwright-retries-flaky-test-handling-guide), [BrowserStack: detect/avoid flaky tests 2026](https://www.browserstack.com/guide/playwright-flaky-tests).
- **Accessibility — `@axe-core/playwright`, WCAG 2.2 AA:**
  - `new AxeBuilder({ page }).withTags([...]).analyze()`, run on every lesson-page template at least once in CI.
  - Tag set for **WCAG 2.2 Level AA**: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']` (2.2 is additive over 2.1/2.0, so you need all four base tags plus `wcag22aa` for the new 2.2 criteria like target size and focus appearance). Optionally add `'best-practice'` for Deque's extra heuristics beyond the strict standard.
  - Automated axe scans cover roughly half of WCAG A/AA rules mechanically (color contrast, missing alt text, form labeling, ARIA misuse, heading order, etc.); manual review is still required for things like meaningful reading order, keyboard-trap edge cases in the interactive code runner, and screen-reader UX of the Pyodide output pane — call this out explicitly as a limitation, not a gap in the automation.
  - [Playwright docs: accessibility testing](https://playwright.dev/docs/accessibility-testing), [QASkills.sh: axe-core/playwright reference 2026](https://qaskills.sh/blog/axe-core-playwright-accessibility-testing-2026).
- **Testing the Pyodide Web Worker code runner:**
  - Don't use `waitUntil: 'networkidle'` to detect "Pyodide is ready" — Pyodide's own background fetches/streaming-compile can keep the network "busy" in ways that make networkidle unreliable, and Playwright/Chromium's own docs discourage `networkidle` generally. Instead, have the app itself expose a **explicit, testable ready-state** (e.g. a `data-pyodide-status="ready"` attribute on the runner root, or a visible "Ready" indicator in the UI) and use `expect(locator).toHaveAttribute(...)`/`toBeVisible()` polling, which is Playwright's standard auto-waiting mechanism, instead of a hard `page.waitForTimeout()`.
  - Give the Pyodide-ready wait a **generous, explicit timeout** distinct from the suite default (first load of the WASM runtime can be multiple seconds even locally, and slower again on a CI runner with no browser cache) — e.g. `await expect(status).toHaveText('Ready', { timeout: 30_000 })` — but keep the suite's *default* action timeout short so unrelated failures don't hang.
  - Because the runner executes in a Web Worker, assert on its effects in the main-thread DOM (output pane content, exit code badge) rather than trying to reach into worker internals — that's what Playwright can actually observe.
  - Warm the browser cache for Pyodide's WASM/data files across a test run (Playwright's persistent context / `storageState` reuse, or a single `beforeAll` navigation) so 20+ code-runner tests in one suite don't each pay the multi-MB download cost.

### B2. Link checking — internal routes and external links

- **Fully self-contained, no global install, matches R15 (total containment):**
  - **`linkinator`** (npm package) is the better fit: `npx linkinator ./out --recurse` can crawl the static-exported site plus follow external links, with per-status-code control; critically it can be installed **locally into the workspace** (`npm install --save-dev linkinator` inside the project, invoked via a local `package.json` script) rather than needing a global/`npx`-from-cache install, satisfying total containment. It also ships standalone binaries as an alternative to Node entirely.
  - **`lychee`** (Rust binary) is faster at scale but is *not* an npm package — it's distributed as a compiled binary per release. It can still satisfy containment (download the pinned binary into the workspace, e.g. `tools/lychee/`, checked into `.gitignore` but fetched by a setup script with a pinned version + checksum, never installed via `brew`/system package manager), but that's more setup than `linkinator`'s local-npm route.
  - **Recommendation:** `linkinator`, project-locally installed, for both jobs — internal route checking (crawl the built `out/` directory, assert every internal link resolves, zero 404s) and external link checking. Feed it the **registry-generated** URL list for problem links specifically (not a raw crawl) so the WMOJ/DMOJ quirks from Part A (fake-slug 200s, Cloudflare 403s) don't produce false results — this is exactly why the registry + snapshot design in A3 exists as a *separate*, purpose-built check rather than relying on a generic link crawler for judge URLs.
  - A generic crawler like `linkinator` is still valuable for everything else: internal nav links, footnotes, external references to CEMC/CEMC PDF pages, GitHub links in "further reading," etc. — content that isn't behind Cloudflare or a fake-200 app shell.
  - Sources: [linkinator (GitHub)](https://github.com/JustinBeckwith/linkinator), [linkinator (npm)](https://www.npmjs.com/package/linkinator), [lychee (GitHub)](https://github.com/lycheeverse/lychee).

### B3. Content lints — Markdown/MDX, banned phrases, spelling

- **markdownlint vs remark-lint for MDX:** `remark-lint` is the better fit here specifically *because* the content is MDX, not plain Markdown — it can be pointed at the site's actual MDX/directive parser (so JSX embedded in lesson content parses correctly), and it has MDX-aware rules (`remark-lint-mdx-jsx-attribute-sort`, `remark-lint-mdx-jsx-quote-style`, etc.) that markdownlint has no equivalent for. `markdownlint-cli` remains simpler for plain `.md` files (e.g. `research/`, `context/` docs) if those need linting too — the recon/plan documents in this workspace are plain Markdown, not MDX, so a light `markdownlint-cli` pass over `context/` and `research/` and a `remark-lint` + `eslint-mdx` pipeline over `main-app/content/` (once it exists) is a reasonable split. Both are npm packages, installable project-locally (no global install), satisfying R15.
- **Custom lint for banned phrases (R14 — no score targets):** implement as a small custom `remark` plugin (or even a plain Node script using `remark-parse` to get text nodes) that scans every MDX/MD content file for a banned-phrase list — `75/75`, `realistic ceiling`, `expected score`, `target score`, digit patterns like `\b\d{1,2}/75\b`, etc. — and fails CI with file+line on a match. This is more reliable than a raw `grep` because it can be restricted to actual rendered text nodes (skipping code blocks, where e.g. `75` might legitimately appear as a constraint like `N ≤ 75`). Keep the banned-phrase list itself in a single reviewable config file so the Manager can extend it without touching lint code.
- **Spell check — `cspell`:** npm package, fully offline (bundles its own dictionaries, no network calls, no OS spellchecker dependency), so it satisfies containment out of the box once installed project-locally. Needs a **custom project dictionary** seeded with domain vocabulary that would otherwise flood the report with false positives: `Pyodide`, `PyPy`, `CEMC`, `DMOJ`, `WMOJ`, `CCC`, module IDs (`M0.1`, `C.10`, …), problem slugs (`ccc25j1`), and competitive-programming jargon (`memoization`, `backtracking`, `bitmask`, etc.). Run it in CI over content and, optionally, in code comments/docstrings.
- Containment note for all three: install with `npm install --save-dev` inside `main-app/` (or a workspace-root tooling package), commit `package-lock.json`, and never invoke via bare `npx <pkg>` without a local install already present (bare `npx` will silently fetch-and-cache outside the workspace on first run) — this is the same containment discipline D-009/D-005 already establish for the writing-style and design skills.
- Sources: [remark-lint vs markdownlint comparison](https://github.com/remarkjs/remark-lint/blob/main/doc/comparison-to-markdownlint.md), [eslint-mdx](https://github.com/mdx-js/eslint-mdx), [cspell.org](https://cspell.org/), [cspell (npm)](https://www.npmjs.com/package/cspell).

### B4. Lighthouse / performance budgets for a Pyodide-loading site

- **Core principle, confirmed by current sources:** Pyodide's WASM runtime + stdlib payload is multi-megabyte and will tank any page-load performance budget if loaded eagerly. The fix everyone converges on is the same one already implied by Phase-1's plan: **lazy-load Pyodide only on pages that actually have a code runner**, via `next/dynamic` with SSR disabled for the runner component, triggered by user interaction or viewport-visibility of the code block, not on initial page mount.
- **Concretely:**
  - Run Lighthouse (or `next build`'s bundle analyzer) against **two budget profiles**: (a) a plain lesson page with no code runner — should hit normal strong Core Web Vitals targets (LCP, TBT, CLS) with no WASM in the bundle at all; (b) a page with a code runner — budget the Pyodide download/init separately (e.g. "runner interactive within Xs of first user interaction," not folded into the page's own TTI/LCP budget, since that download only starts on demand).
  - Set an explicit **JS bundle-size budget** in CI (e.g. via `next build`'s output or a `bundlesize`/Lighthouse CI budgets.json) that fails if Pyodide's loader code leaks into the main/shared chunk of a non-code page — this is the concrete regression test for "lazy-load actually stayed lazy."
  - Cache Pyodide's WASM/package files aggressively (long-lived `Cache-Control`, since they're versioned/immutable assets) so repeat visits across lessons don't re-download the runtime.
  - Run Lighthouse CI (`@lhci/cli`, npm-installable, project-local, same containment pattern) against both profiles on every PR that touches the runner or shared layout, with budgets as hard CI gates, not just informational scores.
- Sources: [Beyond the Server: Pyodide + WebAssembly 2026 guide](https://glinteco.com/en/post/beyond-the-server-running-high-performance-python-in-the-browser-with-pyodide-and-webassembly-2026-guide/), [Pyodide project site](https://pyodide.com/), general Next.js/Lighthouse budget guidance ([tsh.io Lighthouse checklist](https://tsh.io/blog/how-to-keep-your-lighthouse-score-high-in-next-js-applications-a-checklist)).

---

## Sources

**Live, first-party checks performed today (2026-09-23), not citations — recorded for reproducibility:**
- `https://wmoj.ca/problems/ccc25j1`, `ccc20s1`, `ccc26s1`, `ccc19s1`, `ccc99z9` (fake) — `curl -sI`/`curl -s`
- `https://wmoj.ca/robots.txt`, `https://wmoj.ca/sitemap.xml` — full fetch, 87 URLs / 56 `ccc*` slugs extracted
- `https://wmoj.ca/api/v2/problems`, `/api/problems`, `/api` — all 404 HTML (no API)
- `https://wmoj.ca/problems?search=Word%20Hunt`, `?search=Books` — WMOJ's own search endpoint used to resolve crossover slugs
- All 70 formulaic `ccc{20..26}{j,s}{1..5}` slugs content-checked directly against wmoj.ca
- `https://dmoj.ca/problem/ccc19s1/`, `ccc14j1/`, `ccc19s5/`, `ccc99z9/`, `/api/v2/problems` — all HTTP 403 (Cloudflare) via both `curl` and `WebFetch`
- `https://github.com/WMOJ/wmoj-app` — via `WebFetch`

**Web sources (via `WebSearch`), cited inline above and repeated here:**
- [Playwright release notes](https://playwright.dev/docs/release-notes)
- [QASkills.sh — Playwright 1.61/1.62 adoption guide](https://qaskills.sh/blog/playwright-1-61-whats-new-adoption-guide)
- [currents.dev — Playwright 1.60.0 release](https://currents.dev/posts/pw-1.60.0)
- [Playwright docs — visual comparisons](https://playwright.dev/docs/test-snapshots)
- [QASkills.sh — visual regression testing guide 2026](https://qaskills.sh/blog/playwright-visual-regression-testing-guide)
- [QASkills.sh — disable animations/carets in screenshots](https://qaskills.sh/blog/playwright-screenshot-animation-caret-disable)
- [Playwright docs — accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [QASkills.sh — @axe-core/playwright reference 2026](https://qaskills.sh/blog/axe-core-playwright-accessibility-testing-2026)
- [Playwright docs — retries](https://playwright.dev/docs/test-retries)
- [QASkills.sh — retries & flaky test handling 2026](https://qaskills.sh/blog/playwright-retries-flaky-test-handling-guide)
- [BrowserStack — detect/avoid Playwright flaky tests 2026](https://www.browserstack.com/guide/playwright-flaky-tests)
- [linkinator (GitHub)](https://github.com/JustinBeckwith/linkinator), [linkinator (npm)](https://www.npmjs.com/package/linkinator)
- [lychee (GitHub)](https://github.com/lycheeverse/lychee)
- [remark-lint vs markdownlint comparison](https://github.com/remarkjs/remark-lint/blob/main/doc/comparison-to-markdownlint.md)
- [eslint-mdx (GitHub)](https://github.com/mdx-js/eslint-mdx)
- [cspell.org](https://cspell.org/), [cspell (npm)](https://www.npmjs.com/package/cspell)
- [glinteco.com — Pyodide + WebAssembly 2026 guide](https://glinteco.com/en/post/beyond-the-server-running-high-performance-python-in-the-browser-with-pyodide-and-webassembly-2026-guide/)
- [Pyodide project site](https://pyodide.com/)
- [tsh.io — Lighthouse checklist for Next.js](https://tsh.io/blog/how-to-keep-your-lighthouse-score-high-in-next-js-applications-a-checklist)

## What's unverified / needs follow-up

- **DMOJ's `/api/v2/problems` and all pre-2020 slugs**: could not be reached by this worker's tools (Cloudflare 403 on every request, `curl` and `WebFetch` alike). Only 4 pre-2020 slugs were spot-checked via `WebSearch` (all confirmed except one inconclusive, `ccc17s5`, which is *unconfirmed*, not confirmed-broken). A future phase should either get a real headless-browser session past the Cloudflare challenge, or accept manual/one-time verification of the ~65 pre-2020 slugs and commit that as the initial snapshot.
- **Why WMOJ has no 2020 problems** is not documented anywhere found — worth a direct question to WMOJ's maintainers (GitHub issues) if the Manager wants a root cause rather than just a workaround.
- **cspell/markdownlint/remark-lint/linkinator/lychee exact current npm/release versions** were not individually version-pinned in this research (out of scope for a feasibility pass) — the build phase that actually installs them should pin exact versions at install time per R15/D-009's containment pattern.
- Lighthouse CI budget *numbers* (specific LCP/TBT/CLS thresholds, specific KB bundle caps) are recommendations of *mechanism*, not tuned numeric targets — those should be set once the actual app's baseline bundle exists to measure against.
