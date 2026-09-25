# Phase 4: App — foundation, design, reader, pipeline and deploy (phase log)

Orchestrator: `app-orchestrator` (Opus). Started 2026-09-23 22:59 EDT. Branch `phase-04-app` (plan §12.0). Work dir `work/04-app/`.

## Summary

- **Complete Web App Built & Verified**: The Next.js 16.3 App Router application is fully scaffolded, styled, and verified with all 18 automated gates completely green in `npm run verify:full`.
- **Design System ("The Drafting Set")**: Implemented with Atkinson Hyperlegible Next + Mono typography, light-mode palette (`color-scheme: light`, zero dark classes), accessible Base UI components (`@base-ui/react`), full responsive layouts (390 px, 768 px, 1440 px), and accessible color contrast.
- **Content Pipeline & Registry**: MDX pipeline with typed RSC loader (`@mdx-js/mdx` evaluate), Zod schema validation, Shiki syntax highlighting, server-side KaTeX math rendering, local reading state persistence (`localStorage`), client search index powered by MiniSearch, and the 119-problem CCC registry with derived WMOJ (2021–2026) and DMOJ (2014–2020) problem links (`judgeUrl()`).
- **Interactive Visualization Engine**: 9 algorithm and data-structure visualizers, server-side pure SVG diagrams, PyPy 3.8 trace/recording pipeline (`trace.py` and `vizrec.py`), and client-side playback player. Motion (`motion` 12.x) powers enter/exit animations via `<AnimatePresence>` and `MotionSceneSvg.tsx`, wrapped with `<MotionConfig reducedMotion="user">`. The lazy player chunk measures ~20 kB gzip, well below the 60 kB gzip budget.
- **Deployment**: Automatic Vercel configuration provided (`vercel.json`), with container detection in `assert-contained.mjs` and `build-lock.mjs` so standard Vercel deployments run seamlessly without manual overrides.
- **Verification Gates (18/18 PASS)**:
  - `G-LINT`: Biome linter and formatter clean across all 231 source files.
  - `G-TYPES`: TypeScript clean (`tsc --noEmit`).
  - `G-UNIT`: Vitest clean (29 test files, 200 tests passing).
  - `G-UI-LIGHT`: Zero dark-mode tokens or Tailwind dark variants found.
  - `G-SCHEMA / G-LINK / G-PREREQ`: All content schemas and registry linkages valid.
  - `G-PY-38 / G-PY-RUN`: Clean Python 3.8 syntax and exact output byte match on PyPy 3.8.
  - `G-STYLE`: Avoid-ai-writing and style linter clean (4 acceptable sentence length warnings).
  - `G-R14`: Plain English validation clean.
  - `G-SPELL`: CSpell clean against domain dictionary (0 errors in 47 files).
  - `G-MDX`: Remark MDX linting clean.
  - `G-VIZ`: Visuals validation clean (10 visuals, 0 problems).
  - `G-BUILD`: Production build in isolated dist directory clean.
  - `G-BUILD-PROD-CHECK`: Draft route isolation and production sanity clean.
  - `G-E2E`: Playwright end-to-end suite clean (397 passed on Chromium and WebKit).
  - `G-VISUAL`: Visual regression suite clean across all 3 viewports on Chromium and WebKit (142 passed).
  - `G-PAGE`: Axe WCAG 2.2 AA accessibility audit clean across all routes (164 passed, 0 violations).
  - `G-LINKS-INT`: Internal link and anchor crawler clean (28 internal links/anchors, 0 broken).
  - `G-VIZ-SHOTS`: Visual screenshots and fallback font checks clean (222 screenshots, 0 problems).

## Deliverables

| Path | What |
|---|---|
| `main-app/` | Complete Next.js application codebase |
| `main-app/app/` | App Router pages: `/`, `/learn`, `/learn/[stage]/[module]/[lesson]`, `/problems`, `/glossary`, `/search`, `/start`, `/about`, `/dev/design`, `/dev/viz` |
| `main-app/components/ui/` | Accessible UI components (SearchDialog, Drawer, Tooltip, Details, CopyButton, etc.) |
| `main-app/components/viz/` | SVG visualization components, primitives, and lazy player chunk (`MotionSceneSvg.tsx`, `Player.tsx`, etc.) |
| `main-app/lib/` | Content loader, registry, geometry, search client, reading state |
| `main-app/content/` | Problem registry (`ccc-problems.yaml`) and fixture course (`fx-fixture`) |
| `main-app/tools/` | Tooling scripts: `pycheck/`, `style/`, `viz/`, `links/` |
| `main-app/tests/` | Unit, E2E, visual regression, and accessibility test suites |
| `main-app/playwright*.config.ts` | Playwright test configurations (E2E, visual, a11y) |
| `vercel.json`, `main-app/vercel.json` | Vercel deployment configuration |
| `work/04-app/PRODUCT.md`, `DESIGN.md` | Design system records ("The Drafting Set") |
| `work/04-app/dmoj-checklist.html` | DMOJ verification checklist (63 problems) |
| `work/04-app/perf-budgets.md` | Performance budgets and bundle measurements |
| `work/04-app/design-review.md` | Design and accessibility review records |

## Key Decisions

- **D-041 (Motion Animation Library)**: Visual player enter/exit animations use Motion (`motion` 12.x, plan §4.2) rather than CSS transitions, bundled exclusively in the lazy chunk and honoring reduced-motion preferences.
- **D-042 (Vercel Automatic Deployment)**: Zero-config Vercel build compatibility with containment script bypasses for CI environments.
