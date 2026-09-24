# G-PERF budgets (P4 default)

Owner: W1 (app & QA). Enforced by `main-app/scripts/perf-budgets.mjs` (`npm run perf` from
`main-app/`), which is its own standalone command — not part of `verify:fast`/`verify:full`,
matching the plan's gate table (§7): G-PERF runs at "P4 exit, release", the same timing as
G-LINK-LIVE's live check and G-LINK-EXT.

## What it checks, and against what

Four routes (plan brief's ask: home, the course map, the fixture lesson with the most visuals,
and `/problems`):

| Route id | Path | Why this one |
|---|---|---|
| `home` | `/` | first thing every visitor loads |
| `course-map` | `/learn` | the busiest static page (every stage/module/prereq rendered at once) |
| `fixture-lesson-most-visuals` | `/learn/fx/M90.3/visuals` | the heaviest lesson page: all 8 remaining panel visualizers plus a `<Scene>`, per requests.md — the worst case for the lazy visual chunk and for layout shift |
| `problems` | `/problems` | the full registry table, every CCC problem |

Two independent measurements per route:

1. **First-load JS**, from Turbopack's own `diagnostics/route-bundle-stats.json` build artifact
   (`firstLoadUncompressedJsBytes`) — not from Lighthouse. Next 16's Turbopack `next build` no
   longer prints the old webpack-era "First Load JS" table column, so this diagnostic file is the
   only build-time source left; it is an official Next artifact, not something this script parses
   out of human-readable log text.
2. **Lighthouse** (performance category only — accessibility is G-PAGE's job via axe, not
   duplicated here): performance score, Largest Contentful Paint, Total Blocking Time, Cumulative
   Layout Shift.

Both run against a real local production build (`scripts/support/local-server.mjs`, its own
`.next-perf` dist dir — never a developer's `next dev`'s `.next`).

## Measured baseline (this Mac, 2026-09-24, three consecutive runs)

| Route | First-load JS | Perf score | LCP | TBT | CLS |
|---|---|---|---|---|---|
| `/` | ~572 kB | 96-99 | 2109-2615 ms | 3-9 ms | 0.000 |
| `/learn` | ~572 kB | 96-99 | 2259-2766 ms | 4-9 ms | 0.000 |
| `/learn/fx/M90.3/visuals` | ~575 kB | 97 | 2555-3065 ms | 4 ms | 0.000 |
| `/problems` | ~572 kB | 99 | 2258-2765 ms | 4-5 ms | 0.000 |

TBT and CLS are excellent and stable across runs (single-digit ms; zero layout shift — the lazy
visual chunk and the fonts are not causing any shift). LCP is the noisy metric: it swung by
roughly 500-900ms run to run on the *same* build with *no* code changes between runs, on a laptop
that had sibling agents' own builds/dev servers running concurrently in the same session. This is
read as environment contention, not a real signal — P5, once this runs against an idle deployment
(or in CI with a dedicated runner), should recalibrate LCP tighter once the noise floor is known.

## Budgets (P4 default — see BUDGETS in perf-budgets.mjs, kept in sync by hand)

| Route | First-load JS budget | Perf score min | LCP budget | TBT budget | CLS budget |
|---|---|---|---|---|---|
| `home` | 700 kB | 0.85 | 3000 ms | 300 ms | 0.1 |
| `course-map` | 700 kB | 0.85 | 3000 ms | 300 ms | 0.1 |
| `fixture-lesson-most-visuals` | 900 kB | 0.75 | 3500 ms | 500 ms | 0.1 |
| `problems` | 700 kB | 0.85 | 3000 ms | 300 ms | 0.1 |

Reasoning:

- **First-load JS**: ~22% headroom over the measured ~572-575 kB baseline for the three plain
  pages, ~36% headroom for the visual-heavy lesson (measured ~575 kB, same shared framework
  bundle as everything else right now since only M90.3's own visuals lazy-load on interaction —
  the budget leaves room for that page's *own* module code to grow before the lazy chunk itself
  is the bottleneck).
- **Performance score / LCP / TBT**: budgeted above the observed noisy-but-typical range (not the
  best-case run) specifically so a real regression trips this gate without every run on a busy
  shared machine being a coin flip. TBT's budget has enormous headroom on purpose (observed
  3-9 ms against a 300-500 ms budget) — it is the metric this budget trusts most (essentially
  zero variance across runs), so a real regression that pushes TBT anywhere near budget is a
  strong, low-noise signal even while LCP stays loose.
- **CLS**: kept at the standard "good" Core Web Vitals threshold (0.1) even though every measured
  run was exactly 0.000 — there is no reason to loosen a metric with zero observed noise.
- **The lesson page gets the most headroom everywhere** (perf score floor 0.75 vs 0.85, LCP 3500ms
  vs 3000ms, TBT 500ms vs 300ms): it is genuinely doing more work (all remaining visualizers) and
  is exactly the page the plan singles out as the one to watch, not one to hold to the same bar as
  a plain static page.

## A containment finding worth recording (plan §9.4)

The first attempt used Lighthouse's own `chrome-launcher` to spawn Chrome, which — even headless,
even with an explicit `--user-data-dir` inside the workspace — wrote a Crashpad crash-reporting
database (`settings.dat`) to a fixed `~/Library/Application Support/Google/Chrome for
Testing/Crashpad/` path. This path is hardcoded by Chromium on macOS and is **not** configurable
via `--user-data-dir`, `--disable-crash-reporter`, `--disable-breakpad`, `--crash-dumps-dir`, or
an overridden `$HOME` env var for the child process (all four tried; each still leaked, each
caught by `.tooling/bin/contain-snapshot before|after|diff perf-lighthouse-first-run`). Switching
to launching Chromium through **Playwright** itself (`chromium.launch()`, the same pinned browser
every other suite already uses) instead of `chrome-launcher`, and pointing Lighthouse at its CDP
port (`--remote-debugging-port`) rather than having Lighthouse spawn its own Chrome, avoids the
write entirely — verified with a clean `contain-snapshot diff` (0 UNLISTED paths). The
`chrome-launcher` devDependency was removed; `perf-budgets.mjs`'s own header comment has the full
account.
