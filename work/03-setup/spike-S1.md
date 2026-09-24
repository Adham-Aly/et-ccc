# SPIKE S-1: which Node major does Vercel build with?

Plan §4.2 says the local Node must be "the same major Vercel builds with: 24.x expected, [SPIKE S-1, P3] confirms". Checked on 2026-09-23 by web search and by fetching Vercel's docs directly. I treated my prior knowledge as out of date.

## Result: **Node 24.x**. Confirmed. Local Node pinned to **v24.21.0**.

| Question | Answer (2026-09-23) | Source |
|---|---|---|
| Node majors available for Vercel **builds and Functions** | **24.x (default), 22.x, 20.x**. "Only major versions are available. Vercel automatically rolls out minor and patch updates." | [Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) (page last updated 2026-02-27) |
| Default for a new project | "the latest Node.js LTS version available on Vercel" = **24.x** | same page |
| Node 26 | Available only on **Vercel Sandboxes**, not for builds or Functions (no builds/Functions announcement found) | [Node.js 26.x now available on Vercel Sandboxes](https://vercel.com/changelog/node-js-26-x-now-available-on-vercel-sandboxes); a third-party issue tracking the "Vercel build/function runtime support holdback" for 26.x: [uwe-schwarz/uweschwarz-eu#249](https://github.com/uwe-schwarz/uweschwarz-eu/issues/249) |
| Node 20 | Deprecated for Builds and Functions on **2026-10-01** | [Node.js 20 is being deprecated on October 1, 2026](https://vercel.com/changelog/node-js-20-is-being-deprecated) |
| Node 24 on Vercel | GA for builds and functions since Nov 2025 | [Node.js 24 LTS is now generally available for builds and functions](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions) |
| How the project selects it | `package.json` `"engines": { "node": "24.x" }` overrides the Project Settings value; Vercel deploys the latest 24.x | Vercel docs page above ("Version overrides in package.json") |
| Latest Node 24 patch | **v24.21.0**, 2026-09-07, LTS "Krypton" (next: none newer in `index.json`) | `https://nodejs.org/dist/index.json`, `https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt` |

## Decision for the build (D-033)

- Local: `.tooling/node/` = official `node-v24.21.0-darwin-arm64.tar.gz`, SHA-256 checked (see `tool-versions.md`). Homebrew's Node 26.0.0 is never used.
- P4 sets `main-app/package.json` → `"engines": { "node": "24.x" }` (with `engine-strict=true` in `.tooling/npmrc`) and leaves the Vercel Project Settings Node version at the default (24.x). The P4 build log must print `node -v` = 24.x on Vercel.
- Patch bumps inside 24.x are allowed (plan §4.2). Moving to 26.x needs a changelog entry once Vercel supports it for builds.
