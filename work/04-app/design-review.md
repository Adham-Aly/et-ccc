# P4 orchestrator review: architecture, code, pixels and motion

Reviewer: `app-orchestrator` (Opus). This is a running record, with the final sign-off at the end. Each finding is either fixed by its owner or listed as a defect in `defects.md`.

## Round 1: design record and UI (W2), 2026-09-23/24

| # | Where | Finding | Owner | Status |
|---|---|---|---|---|
| R1-1 | sidebar, /learn, module lists | Wrapped "Soon"/"Coming soon" tags fell onto an orphan line and sat indented from the title edge | W2 | fixed (r7: trailing column; own line aligned to the title on phones) |
| R1-2 | lesson body | A body that opens with an H2 got a double gap (specificity bug), which also affected /dev/design | W2 | fixed (r7) |
| R1-3 | typography | The slashed zero in the sans reads "Ø" in headings. Atkinson Next has no plain-zero alternate (verified) | W2 | accepted; noted for the Manager checkpoint |
| R1-4 | content skeleton | Stage 0 titled "Orientation and tooling" (setup framing, C21); M0.7 said "CCC Grader and DMOJ" instead of WMOJ + DMOJ; M7.13 "bridge to CCO" (leak list) | W1 | fixed |
| R1-5 | lesson title block @390 | Cells wrapped into half-ruled rows | W2 | fixed (r9: one equal row; Draft on its own ruled row) |
| R1-6 | callouts @1440 | Callouts ran to the wide measure | W2 | fixed (r9: width is opt-in; measure table in DESIGN.md) |
| R1-7 | fenced code | Indentation stripped (JSX-children whitespace), so the bad38 `match` block was wrong code | W1 | fixed with a regression test |
| R1-8 | copy | "1 lessons" | W1 + W2 | fixed |
| R1-9 | KaTeX | Stylesheet never loaded, so math rendered twice | W2 | fixed |

## Round 1: visualization system (W3)

| # | Where | Finding | Owner | Status |
|---|---|---|---|---|
| V1-1 | Dijkstra distance boxes | "∞" reads as a sideways "8" (probable font fallback), a correctness risk for a beginner | W3 | fixed (∞ drawn from the sans; viz:shots fails on any font fallback) |
| V1-2 | heap panel | Tree node, array cell and index labels scattered across the panel | W3 | round 2: one unit now, but text is cramped in the circles, index labels collide, tree and array nearly touch, and panel scales differ at 390; a collision check was requested |
| V1-3 | figure frame | 2 px blue line along the bottom edge, overrunning the right corner | W3 | not a defect (the focus-visible ring was clipped by element shots; shots now blur first) |
| V1-4 | captions | Code identifiers set in the sans; "(distance,node)" spacing | W3 | fixed (backtick → Mono spans) |
| V1-5 | architecture | CSS transitions instead of Motion (plan §4.2 [DECIDED]) | Manager | `decision-motion.md`, recommendation: accept CSS |
| V1-6 | player chunk | 110.6 kB gzip, caused by Zod leaking into the client; W3 fixed it to 18.3 kB and added a bundle-boundary test | W3 | fixed |

## Round 1: architecture and code (W1)

| # | Where | Finding | Owner | Status |
|---|---|---|---|---|
| A1-1 | `external-links.yaml`, `judge-url.ts` | WMOJ sign-up URL `/user/register` is a live 404; the working URL is `/auth/signup`. DMOJ sign-up should be `/accounts/register/` | W1 | fixed |
| A1-2 | judge home/sign-up URLs | Defined twice (TS constants and YAML); plan §4.7 wants the YAML only | W1 | fixed |
| A1-3 | `external-links.yaml` | Python and PyPy download pages on the allow-list conflict with C21 (no setup content) | W1 | fixed |
| A1-4 | MDX map | `DraftBadge`/`ComingSoon` exposed to authors; `OutputTag` has no path-traversal guard; an unknown component must fail statically | W1 | fixed |
| A1-5 | `lib/content/env.ts` | Relies on Vercel exposing `VERCEL_ENV` at build time. Log the resolved env in prebuild; verify on the first preview build, and on production after the merge | W1 + orchestrator | fixed |
| A1-6 | local builds | A shared `.next` meant builds killed a running dev server; an un-ignored `.next-local/` broke Tailwind for every dev page | W1 / orchestrator | `.next-*/` ignored (orchestrator); env-driven dist dirs (W1) open |
| A1-7 | `scripts/port-lease.mjs` | Missed servers listening on `::` | W1 | fixed |
| A1-8 | `lib/read-state` | Stored JSON is not shape-checked (arrays and non-string values pass), and `id in map` sees prototype keys; use `Object.hasOwn` and validate entries | W1 | fixed |
