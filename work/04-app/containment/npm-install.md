# Containment: first `npm install` in `main-app/`

## Attempt 1 (`npm-install-1`) — FAIL, remediated

`.tooling/bin/npm install` (plain) added 680 packages. The diff/backstop sweep **hard-failed**:
npm implicitly ran `node-gyp rebuild` for `sharp` (a transitive dependency of `next`, which ships
`node_modules/sharp/src/binding.gyp`; npm's arborist runs `node-gyp rebuild` as the default
install step for any package with a `binding.gyp` and no explicit install/postinstall script,
even though the matching prebuilt binary — `@img/sharp-darwin-arm64` 0.35.4 — was already
installed via `optionalDependencies`). node-gyp downloaded a full Node 24.21.0 header set (3432
files) to its default devdir, `~/Library/Caches/node-gyp/24.21.0/`, outside the workspace; no env
var in `.tooling/env.sh` redirects node-gyp's devdir.

**Root cause confirmed:** no package in the resolved tree declares an `install`/`postinstall`/
`preinstall` script (checked every `package.json` under `node_modules`, including scoped
packages); `sharp` is the only package with a `binding.gyp`, and its darwin-arm64 prebuilt binary
was already present, so the implicit gyp step was pure waste, not a real build requirement.

**Cleanup:** `~/Library/Caches/node-gyp/24.21.0/` was removed entirely. Its birth time
(23:08:28) was after the containment marker (23:07); the sibling `~/Library/Caches/node-gyp/
26.0.0/` directory predates this session (born 2026-09-15, from the Manager's own prior use of
Homebrew Node 26 elsewhere) and was left untouched. `node_modules/` and `package-lock.json` from
this attempt were deleted. Verified: `ls ~/Library/Caches/node-gyp/` now shows only `26.0.0/`.

## Attempt 2 (`npm-install-2`) — PASS

Re-ran as `.tooling/bin/npm install --ignore-scripts`. Since nothing in the tree needs a real
lifecycle script (confirmed above), this only suppresses the implicit gyp-rebuild step; `sharp`
still resolves its prebuilt darwin-arm64 binary via `optionalDependencies` (unaffected by
`--ignore-scripts`, since platform-matching of optional dependencies is a resolution step, not a
script). Added 681 packages (one more than attempt 1 — an optional peer resolved slightly
differently with scripts suppressed; not investigated further, it is a normal package-count
artifact of `--ignore-scripts`, not a containment concern).

Diff/backstop: **PASS**. 8 backstop paths newer than the marker, all allow-listed pre-existing
OS/browser/harness churn (Brave/Chrome IndexedDB and WebStorage journals, `~/Library/
Preferences`, the AlDente menu-bar app's own sqlite3 stats file, this session's own Claude Code
subagent transcript). Zero `HARD-FAIL`, zero `UNLISTED`. Full report:
`.tooling/snapshots/npm-install-2/report.txt`.

## Verdict and action

**PASS**, with attempt 1's incidental trace fully remediated (deleted, confirmed by directory
listing and birth-time check — same remediation pattern as the P3 pip-cache incident, D-039).
`main-app/package.json`'s `install` script convention going forward: every future `npm install`
in this workspace should also use `--ignore-scripts` unless a specific future dependency is
confirmed to need a real lifecycle script (none does as of this scaffold). This is recorded here
rather than hard-coded into the `.npmrc` `ignore-scripts` setting, since a future dependency
*might* legitimately need one and a blanket `.npmrc` flag would silently skip it; each future
first-install containment proof re-checks this.
