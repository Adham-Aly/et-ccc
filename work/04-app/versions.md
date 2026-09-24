# P4 batch 1 — package versions

Checked 2026-09-24 by the app & QA engineer (W1) against `registry.npmjs.org` via
`.tooling/bin/npm view <pkg> version|versions --json`, immediately before install. All pins are
**exact** (`save-exact=true` in `main-app/.npmrc`); every one below matches what
`main-app/package-lock.json` actually resolved (checked directly from the lockfile after
install — no drift).

Node/npm: workspace Node **v24.21.0** (from P3, D-033), npm **11.19.0** bundled. `engines.node`
in `package.json`: `"24.x"`.

## Runtime dependencies (brief §2 A1)

| Package | Plan §4.2 / brief line | Installed | Note |
|---|---|---|---|
| next | 16.3.x | **16.3.6** | current patch on the 16.3 line |
| react | 19.3.x | **19.3.0** | |
| react-dom | 19.3.x | **19.3.0** | |
| tailwindcss | 4.3.x | **4.3.3** | |
| @tailwindcss/postcss | matches tailwindcss | **4.3.3** | |
| @mdx-js/mdx | mdx 3.1.x | **3.1.1** | |
| remark-gfm | additional runtime dep | **4.0.1** | |
| remark-math | additional runtime dep | **6.0.0** | |
| rehype-katex | additional runtime dep | **7.0.1** | |
| katex | KaTeX 0.18.x | **0.18.9** | |
| rehype-slug | additional runtime dep | **6.0.0** | |
| shiki | 4.4.x | **4.4.3** | |
| zod | zod 4.6.x | **4.6.5** | |
| yaml | yaml 2.9.x | **2.9.1** | |
| motion | 12.x (listed major; latest overall is 13.x, not installed — plan pins the 12 line) | **12.43.0** | latest on the 12.x line |
| d3-hierarchy | 3.x | **3.1.2** | latest overall (no 4.x exists yet) |
| minisearch | latest at install | **7.2.0** | |
| @base-ui/react | 1.8.x | **1.8.0** | |
| lucide-react | 1.47.x | **1.47.0** | |
| clsx | additional runtime dep | **2.1.1** | |
| tailwind-merge | additional runtime dep | **3.7.0** | |

## Dev dependencies

| Package | Plan §4.2 / brief line | Installed | Note |
|---|---|---|---|
| typescript | TS 6.0.x | **6.0.3** | TS 7.0.2 exists but has no JS API yet (research note, still true); ecosystem (Biome, Vitest types) caps below 6.1 per plan |
| postcss | needed by @tailwindcss/postcss's postcss.config.mjs | **8.5.28** | not in brief's explicit list; required to run the Tailwind v4 PostCSS plugin at all |
| @types/node | matches Node major (24.x) | **24.13.6** | picked the 24.x line, not the newer 26.x line the registry's "latest" resolves to, since the workspace runtime is Node 24 |
| @types/react | 19.3.x | **19.3.0** | |
| @types/react-dom | 19.3.x | **19.3.0** | |
| @types/d3-hierarchy | matches d3-hierarchy | **3.1.7** | |
| @biomejs/biome | 2.5.x | **2.5.14** | |
| vitest | 5.0.x | **5.0.1** | |
| @playwright/test | 1.63.x | **1.63.0** | |
| @axe-core/playwright | 4.13.x | **4.13.0** | |
| linkinator | 8.1.x | **8.1.0** | |
| cspell | latest at install | **10.3.3** | |
| remark-cli | brief: "remark-cli + remark-mdx + remark-lint presets" | **12.0.1** | |
| remark-mdx | " | **3.1.1** | |
| remark-preset-lint-recommended | " (package is named `remark-preset-lint-recommended`, not `remark-lint-recommended` — that name 404s on the registry) | **7.0.1** | |
| remark-preset-lint-consistent | " | **6.0.1** | |
| lighthouse | latest at install | **13.5.0** | installed as a devDependency; first run deferred to a later P4 step per the brief |

## Playwright browsers

Installed via `.tooling/bin/pw install chromium webkit` into
`.tooling/playwright-browsers/` (`PLAYWRIGHT_BROWSERS_PATH`):

- Chromium (Chrome for Testing) **153.0.8010.12** (playwright chromium v1243), plus its bundled
  FFmpeg v1011 and Chrome Headless Shell.
- WebKit **26.6** (playwright webkit v2359).

No Firefox in P4 (brief §1, explicit).

## Deviations from the research doc (`w1-tech-stack.md`)

That doc (obsolete per the brief's reading list, only §1/§6–§8 relevant) recommended Next
`output: 'export'`, Pyodide-in-browser, CodeMirror, and TypeScript ecosystem choices for a fully
static export. The plan (v2.1/v2.2, authoritative) removed all of that: no `output: 'export'`
(plan §4.1, a regular Vercel build so `next.config` headers keep working), no browser-side Python
runtime at all (D-020: nothing executes in the browser), no editor. None of those packages are in
this project's `package.json`.
