# App & QA engineer (W1) — batch 1 notes (scaffold)

## What was done

Manual scaffold of `main-app/` (no `create-next-app`), per plan §12 P4 step 2 / brief:

- `package.json` (exact pins, `engines.node: "24.x"`, `"type": "module"` — added to silence a
  Vitest/Vite config-loader warning; safe because there is no root `package.json`, so it can't
  affect the avoid-ai-writing CommonJS import path D-040 depends on, which resolves from
  `.claude/skills/avoid-ai-writing/` outside `main-app/` entirely), `package-lock.json`,
  `.npmrc` (`save-exact`, `engine-strict`, `fund=false`, `update-notifier=false`).
- `next.config.ts` (security headers per plan §4.1: `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, a CSP with `frame-ancestors 'none'; object-src 'none'`;
  `reactStrictMode: true`; no `output: 'export'`).
- `tsconfig.json` (strict + `noUncheckedIndexedAccess` + `noImplicitOverride` +
  `noFallthroughCasesInSwitch`; deliberately **not** `exactOptionalPropertyTypes` — too much
  friction for the design lead's and viz engineer's component props for the value it adds;
  `allowJs`/`checkJs` added later to type-check the `.mjs` gate scripts from the Vitest test;
  `tests/fixtures/gates` excluded, since that fixture is deliberately broken for the scanner, not
  meant to compile). Next auto-edited it twice (jsx → react-jsx, include additions) — left as-is,
  never hand-reverted (plan §8.8 "generated files are never hand-edited" — these edits are
  Next's own, not mine).
- `postcss.config.mjs` + Tailwind 4 CSS-first `app/globals.css` (`@import "tailwindcss";` +
  `color-scheme: light`) — placeholder, design lead replaces it.
- `biome.json` (zero-warning: migrated to the `preset` config form on Biome's own suggestion;
  `noConsole` off for `scripts/**`/`tools/**` since the gate runner and future Python-tool
  wrappers are CLIs that legitimately print; formatter on; generated files ignored).
- `vitest.config.ts`, `playwright.config.ts` (6 projects: chromium/webkit × 390×844/768×1024/
  1440×900; `webServer` runs `next start` on `PLAYWRIGHT_PORT` env var, set by whoever leases the
  port; retries 0; fullyParallel), `cspell.json` + `dictionaries/et-ccc-domain.txt` (starter
  set), `.remarkrc.mjs` (remark-mdx + recommended/consistent presets — not yet wired to an npm
  script; `lint:mdx` comes with the content pipeline batch).
- `main-app/.gitignore` added (see "Root/gitignore" below) — needed for Biome's
  `vcs.useIgnoreFile`, which errors without a `.gitignore` in the Biome root itself.
- `app/layout.tsx`, `app/page.tsx`: plain semantic markup, `<html lang="en">` +
  `<meta name="color-scheme" content="light">`, no styling.
- `scripts/assert-contained.mjs`: checks every redirect var from `.tooling/env.sh` resolves
  inside `.tooling/`, that `process.execPath` is the workspace Node, and that nothing outside the
  workspace precedes the workspace Node's `bin/` in `PATH` (had to special-case
  `node_modules/.bin` entries — npm legitimately prepends the local one *and* every ancestor
  directory's `node_modules/.bin`, most of which don't exist; only a non-`node_modules/.bin`,
  non-workspace entry is now flagged).
- `scripts/port-lease.mjs` (4100–4199, `.tooling/locks/ports/*.lock`, stale-lock reclaim by
  checking `process.kill(pid, 0)`; CLI `lease`/`release` plus an importable `leasePort`/
  `releasePortByName` API for a script that leases-runs-releases in one process).
- `scripts/build-lock.mjs` (`.tooling/locks/build.lock`, `openSync(..., "wx")` exclusive-create
  with a polling wait, `Atomics.wait` for a dependency-free synchronous sleep); wired into
  `npm run build`.
- `scripts/verify.mjs` (`verify:fast`/`verify:full`, `--scope` accepted but not yet meaningful —
  no scoped gate exists until the content pipeline batch, so it just runs the full set and says
  so). Fast: G-LINT, G-TYPES, G-UNIT, G-UI-LIGHT. Full: fast + G-BUILD. Both green.
- `main-app/CLAUDE.md`: Next generated `@AGENTS.md` as the initial content on the first
  `next dev` run (confirmed by reading `generate-agent-files.js`: once `AGENTS.md` exists and
  hosts the managed block, `CLAUDE.md` is never touched again — `claudeMd: 'skipped'` — so it was
  safe to append the required pointer/rule content below the `@AGENTS.md` line by hand).
- G-UI-LIGHT (`lint:light`): `scripts/gates/lint-light.mjs` scans `app/`, `components/`, `lib/`,
  `content/`, `tests/fixtures/content/` for `dark:` classes, `prefers-color-scheme: dark`, and
  dark-theme imports; failing fixture at `tests/fixtures/gates/G-UI-LIGHT/` (outside the scanned
  set on purpose, so the real gate stays clean); Vitest test proves both directions
  (`tests/unit/gates/lint-light.test.ts`).
- Playwright browsers: Chromium 153.0.8010.12 and WebKit 26.6 installed into
  `.tooling/playwright-browsers/`. Smoke E2E (`tests/e2e/smoke.spec.ts`): home page renders, no
  console errors — green on all 6 projects, against `next start` on a leased port.
- `verify:fast`, `verify:full`, `test:e2e`: all green, zero warnings, zero failures.
  `check-secrets`: PASS (177 files).

## Containment — one real finding fixed, one blocking finding not resolved by me

1. **Fixed:** first `npm install` implicitly ran `node-gyp rebuild` for `sharp` (pulled in by
   `next`, which already has a matching prebuilt binary via `optionalDependencies`), writing 3432
   header files to `~/Library/Caches/node-gyp/24.21.0/` (no env redirect covers node-gyp's
   devdir). Cleaned up; reinstalled with `--ignore-scripts` (safe — nothing in the tree has a
   real install/postinstall/preinstall script); re-proved clean.
   `work/04-app/containment/npm-install.md`.
2. **Not resolved by me, needs an orchestrator decision:** running any WebKit browser context
   makes macOS's system WebKit framework write to `~/Library/WebKit/org.webkit.Playwright/`,
   `~/Library/Caches/org.webkit.Playwright/`, `~/Library/Preferences/org.webkit.Playwright.plist`
   — an OS-level per-bundle-ID storage model with no env var or CLI redirect (unlike Chromium,
   which left zero trace). This will recur on **every** future WebKit run (E2E, visual, a11y,
   perf). Full detail and three options for the orchestrator:
   `work/04-app/containment/playwright-first-run.md`. I did not add anything to
   `.tooling/contain-allowlist.txt` — that's explicitly the orchestrator's call per the brief.
3. Also flagged (not fixed, not allow-listed): one `UNLISTED` backstop hit during the WebKit run,
   `~/Library/MediaAnalysis/MediaAnalysis.sqlite-wal` — confirmed as the Manager's own
   `mediaanalysisd` system daemon (running since well before this session), unrelated to any of
   our tools.

## Open items / requests for the next batches

- **Orchestrator decision needed:** the WebKit containment finding above (§2). Blocks a clean
  G-CONTAIN pass on every future WebKit-touching proof until settled.
- `lint:mdx` npm script isn't wired yet (`.remarkrc.mjs` exists; no `content/` MDX to lint yet —
  comes with the content pipeline batch, which also adds `content:check`, `check:python`,
  `gen:outputs`, `gen:viz`, `check:viz`, `viz:shots`, `style:check`, `lint:r14`, `spell`,
  `links:verify`, `links:internal`, `test:visual`, `test:a11y`, `perf`, `deployed-url` — all
  still to come, per brief A13).
- `verify.mjs`'s `--scope` flag is accepted but not yet meaningful; will matter once
  `content:check`/`check:python`/`check:viz` exist and can filter by module/lesson id.
- Root `.gitignore`: no changes were needed there (it already ignores `node_modules/`, `.next/`,
  `out/`, `test-results/`, `playwright-report/`, `*.tsbuildinfo` repo-wide, without a leading
  `/`, so `main-app/`'s copies are already covered). Only `main-app/.gitignore` is new, and it's
  needed for Biome, not for git itself (git already ignored everything in it via the root file).
- PRODUCT.md already exists in `main-app/` (design lead's file, in progress) — not touched.
