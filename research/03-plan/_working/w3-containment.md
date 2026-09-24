**PHASE 2 WORKER OUTPUT — NOT YET APPROVED. NOTHING WAS INSTALLED.**

# W3 — Total Containment of Installed Tooling

Researched 2026-09-23 via web search (all URLs cited; prior model knowledge treated as stale per D-003/operating-rules §4). Nothing was installed, downloaded to disk, or run in this session except read-only inspection commands (`uname`, `node --version`, `npm config get`, `curl -sI`, `curl` of a PyPy checksums page for verification, `pgrep`, `arch -x86_64 /usr/bin/true`). Machine verified live: macOS 26.6.2 (Darwin 25.6.0), **arm64** (Apple Silicon), Node **v26.0.0** at `/opt/homebrew/bin/node`, npm **11.12.1** at `/opt/homebrew/bin/npm`, npm cache currently `~/.npm`, npm prefix currently `/opt/homebrew`, Python **3.14.7** at `/opt/homebrew/bin/python3`. `main-app/` is currently empty (no Next.js app scaffolded yet). No git repo in the workspace. **Rosetta 2 is already installed and running on this machine** (`oahd` running, `arch -x86_64 /usr/bin/true` succeeds) — this is a pre-existing OS capability, not something this project would install.

Everything below is a **procedure to run later**, only when the main session explicitly instructs an install, per operating-rules §7.

---

## 1. Recommended `.tooling/` layout

```
et-ccc/
├── .tooling/
│   ├── env.sh                    # sourced by every agent before any tool command (§2)
│   ├── node/                     # OPTIONAL workspace-local Node tarball, if chosen over Homebrew (§3)
│   ├── npm-cache/                # npm_config_cache target
│   ├── npm-global/               # npm_config_prefix target (npm -g would land here; we avoid npm -g anyway)
│   ├── npmrc                     # npm_config_userconfig target (project .npmrc, see §3)
│   ├── xdg/
│   │   ├── cache/                # XDG_CACHE_HOME
│   │   ├── config/                # XDG_CONFIG_HOME
│   │   └── data/                  # XDG_DATA_HOME
│   ├── playwright-browsers/      # PLAYWRIGHT_BROWSERS_PATH (§4)
│   ├── impeccable-home/          # IMPECCABLE_HOME (§7)
│   ├── uv/
│   │   ├── python-install/       # UV_PYTHON_INSTALL_DIR
│   │   ├── python-cache/         # UV_PYTHON_CACHE_DIR
│   │   ├── cache/                 # UV_CACHE_DIR
│   │   ├── tools/                 # UV_TOOL_DIR
│   │   └── tool-bin/              # UV_TOOL_BIN_DIR
│   ├── pypy/                     # pypy3.8-v7.3.9-osx64 (or CPython 3.8 fallback), for CI checks (§6)
│   ├── venvs/
│   │   └── vermin/               # workspace venv running vermin (§6)
│   ├── corepack-home/            # COREPACK_HOME (only if pnpm-via-corepack is ever used)
│   ├── git-config                # GIT_CONFIG_GLOBAL target (empty file), local git identity (§10)
│   ├── tmp/                       # optional TMPDIR — see the TMPDIR caveat in §2, do NOT use for Playwright
│   └── snapshots/                 # before/after proof files from the verification script (§9)
├── .claude/
│   └── skills/
│       ├── impeccable/            # project-scope skill (D-005, not yet installed)
│       └── avoid-ai-writing/      # project-scope skill (D-009, not yet installed)
├── main-app/
│   └── public/
│       └── pyodide/               # self-hosted Pyodide assets (§5)
└── (rest of workspace, unchanged)
```

`.gitignore` (once version control exists, see §10) must exclude at least: `.tooling/npm-cache/`, `.tooling/xdg/`, `.tooling/playwright-browsers/`, `.tooling/impeccable-home/`, `.tooling/uv/`, `.tooling/pypy/`, `.tooling/venvs/`, `.tooling/corepack-home/`, `.tooling/tmp/`, `.tooling/snapshots/`, `.tooling/node/` (if used), `main-app/public/pyodide/` (large binary; decide per D — Pyodide is likely small enough to commit or should be fetched by a setup script instead of committed; flagged as an open question, not decided here).

---

## 2. The contained environment file — `.tooling/env.sh`

Design principle confirmed by research: **do not override `HOME` itself.** Rationale below (this directly answers the task's "consider whether overriding HOME is safer" question):

**HOME-override analysis**
- **Pro:** a single variable redirects *every* tool that falls back to `$HOME` for anything not otherwise configured, including tools this research did not enumerate (a real gap-closer).
- **Con (decisive):** Claude Code itself, the shell (`~/.zshrc`/`~/.zprofile` sourcing, if any subshell reads it), Homebrew (`brew` shims resolve via `$HOME` in some setups), and macOS `getpwnam`-based path resolution for `~` in various CLIs all assume `$HOME` is the real user home. If `env.sh` exported `HOME` into the *same* process/session that runs Claude Code and other unrelated commands, it risks breaking credential lookups (SSH agent, keychain, `~/.ssh`), Homebrew, and Claude Code's own `~/.claude` state — none of which this project should perturb. Overriding `HOME` is only safe if scoped to a **subshell wrapper around a single tool invocation** (e.g. `env HOME=... npx playwright test`), not sourced into the interactive/agent shell. That is strictly more fragile than naming each tool's own override variable, because a few tools (Homebrew's own `brew`, some Python tooling, `ssh`) do not have an independent override and *require* real `$HOME` to function at all, so a blanket `HOME=` wrapper would break them if they were ever invoked in the same wrapped command.
- **Recommendation:** do **not** override `HOME`. Use each tool's dedicated variable (all listed below), which is the documented, supported mechanism for every tool in scope here. This is also strictly auditable: every write path is named ahead of time instead of hoped-for.

```bash
#!/usr/bin/env bash
# .tooling/env.sh — source this before any tool command in this workspace.
# Redirects every tool's global/home-directory state into the workspace.
# Do NOT override HOME (see research/03-plan/_working/w3-containment.md §2).

# Resolve the workspace root regardless of caller's cwd.
ET_CCC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
export ET_CCC_ROOT
T="$ET_CCC_ROOT/.tooling"

# --- npm / Node -------------------------------------------------------
export npm_config_cache="$T/npm-cache"
export npm_config_prefix="$T/npm-global"                # npm -g target; avoid npm -g anyway (see §3)
export npm_config_userconfig="$T/npmrc"                  # project-level .npmrc lives here, not ~/.npmrc
export npm_config_globalconfig="$T/npm-global/npmrc"      # avoid touching /opt/homebrew/etc/npmrc
export npm_config_update_notifier=false
export npm_config_fund=false
export npm_config_audit=false
# npx (npm exec) reads npm_config_cache too, so npx's package cache also lands under $T/npm-cache
# instead of the default ~/.npm/_npx. Verify per §3.

# --- XDG base directories (covers many CLI tools that follow the spec) -
export XDG_CACHE_HOME="$T/xdg/cache"
export XDG_CONFIG_HOME="$T/xdg/config"
export XDG_DATA_HOME="$T/xdg/data"
export XDG_STATE_HOME="$T/xdg/state"

# --- Playwright ---------------------------------------------------------
export PLAYWRIGHT_BROWSERS_PATH="$T/playwright-browsers"
export PLAYWRIGHT_SKIP_BROWSER_GC=1     # do not let Playwright prune "unused" browsers outside our control
export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1  # avoid xdg autoinstall of OS deps outside workspace (verify per tool version)

# --- Next.js / Vercel telemetry -----------------------------------------
export NEXT_TELEMETRY_DISABLED=1
# NOTE: NEXT_TELEMETRY_DISABLED only stops next from asking about / sending telemetry
# on THIS run; it does not delete or avoid the `conf`-package config file at
# ~/Library/Preferences/nextjs-nodejs/config.json if it already exists or if `next`
# still probes/writes it before checking the env var. See §2 caveats and the
# snapshot design (§9) — verify empirically at install time; if it writes there
# regardless, run `npx next telemetry disable` once inside a HOME-wrapped subshell
# (see the HOME-override analysis above) purely for this one command, or accept it
# as a documented, tiny (~100 byte JSON) exception and note it as NOT FULLY CONTAINED.

# --- Corepack (only if pnpm-via-corepack is ever used) -------------------
export COREPACK_HOME="$T/corepack-home"

# --- Python / uv ----------------------------------------------------------
export UV_CACHE_DIR="$T/uv/cache"
export UV_PYTHON_INSTALL_DIR="$T/uv/python-install"
export UV_PYTHON_CACHE_DIR="$T/uv/python-cache"
export UV_PYTHON_BIN_DIR="$T/uv/python-bin"
export UV_TOOL_DIR="$T/uv/tools"
export UV_TOOL_BIN_DIR="$T/uv/tool-bin"
export UV_NO_CONFIG=1                       # ignore any ~/.config/uv/uv.toml if one exists
export UV_INSTALL_DIR="$T/uv/bin"           # only relevant if the uv BINARY itself is installed here (§6)
export UV_UNMANAGED_INSTALL="$T/uv/bin"     # if used, prevents uv's installer from touching shell profiles
export PIP_CACHE_DIR="$T/xdg/cache/pip"     # in case anything shells out to pip directly
export PIP_CONFIG_FILE="$T/pip.conf"        # empty/absent by default; avoid reading ~/.pip/pip.conf
export PYTHONPYCACHEPREFIX="$T/xdg/cache/pycache"

# --- Impeccable (D-005, not yet installed) --------------------------------
export IMPECCABLE_HOME="$T/impeccable-home"

# --- git (D-011 input, §10) ------------------------------------------------
export GIT_CONFIG_GLOBAL="$T/git-config"    # empty file; git reads nothing from ~/.gitconfig
export GIT_CONFIG_SYSTEM=/dev/null

# --- TMPDIR: deliberately NOT redirected here. See §2 caveats. -----------
# Chromium/Playwright fail with "AF_UNIX path too long" once TMPDIR plus its
# own subdirectory name exceeds ~104 bytes on macOS, and this workspace's
# absolute path is already long. macOS's own per-session /var/folders TMPDIR
# is short-lived, per-process, and auto-purged by the OS — it is not "installed
# state" in the sense operating-rules §7 cares about. Leave TMPDIR unset
# (system default) for anything that launches a browser. If a specific
# non-browser tool needs a workspace TMPDIR, set it narrowly for that one
# command, not globally here.
```

### What each redirect is verified to cover, and what it does NOT cover

| Tool | Global write location on macOS (verified) | Redirect variable | Source |
|---|---|---|---|
| npm | `~/.npm` (cache) | `npm_config_cache` | npm docs |
| npm | `~/.npmrc` (user config) | `npm_config_userconfig` | npm docs |
| npm | global config `$PREFIX/etc/npmrc` | `npm_config_globalconfig` | npm docs |
| npm global installs | `$PREFIX/lib/node_modules`, `$PREFIX/bin` | `npm_config_prefix` | npm docs |
| npx (npm exec) | `~/.npm/_npx` | `npm_config_cache` (npx shares npm's cache root) | bobbyhadz.com, npm docs — **verify empirically per §3**, some npx versions have used a separate `_npx` root under the cache dir specifically |
| Next.js CLI telemetry | `~/Library/Preferences/nextjs-nodejs/config.json` (via the `conf` npm package, `env-paths`-style OS convention) | `NEXT_TELEMETRY_DISABLED=1` disables sending, **does not guarantee no file is written** | multiple sources incl. florian-martens Medium post, nextjs.org/telemetry — **UNVERIFIED whether the file is still created when the env var is set before first run; test in §9** |
| next-swc / SWC | project-local `.swc/` or `node_modules/.cache` (config-dependent), **not** `~/.cache` by default | none needed if left at default | vercel/next.js PR #38175, swc-project discussion #4023 |
| Playwright | `~/Library/Caches/ms-playwright` | `PLAYWRIGHT_BROWSERS_PATH` | playwright.dev/docs/browsers |
| Corepack | `$HOME/.cache/node/corepack` | `COREPACK_HOME` | nodejs/corepack README |
| uv (cache) | `~/.cache/uv` (or XDG) | `UV_CACHE_DIR` | docs.astral.sh/uv/reference/environment |
| uv (managed Pythons) | `~/.local/share/uv/python` | `UV_PYTHON_INSTALL_DIR` | docs.astral.sh/uv/reference/environment |
| uv (managed tools) | `~/.local/share/uv/tools` | `UV_TOOL_DIR` | docs.astral.sh/uv/reference/environment |
| uv (the `uv` binary itself, if self-installed) | `~/.local/bin` | `UV_INSTALL_DIR` (or skip entirely, see §6 — recommend NOT self-installing uv via its installer) | docs.astral.sh/uv/reference/installer |
| pip (if invoked directly) | `~/.cache/pip`, `~/.pip/pip.conf` / `~/.config/pip/pip.conf` | `PIP_CACHE_DIR`, `PIP_CONFIG_FILE` | inferred from XDG/pip conventions — **UNVERIFIED against a 2026 pip release, treat as best-effort** |
| ESLint | project-root `.eslintcache` by default (project-local already) | none needed | eslint/eslint#13897 |
| Vitest | `node_modules/.vite` (Vite's `cacheDir`, project-local already) | none needed | vitest.dev/config/cache |
| Impeccable engine binary | `~/.impeccable/bin/<version>/impeccable` | `IMPECCABLE_HOME` | pbakaus/impeccable launcher script (fetched and read directly, §7) |
| git | reads (does not write) `~/.gitconfig`; `git init` never writes there | `GIT_CONFIG_GLOBAL=<empty file>` prevents even the read | git-scm.com/docs/git-config; verified via research, see §10 |

---

## 3. Node / npm

**Recommendation: use the system Homebrew Node 26 read-only, do not install a workspace-local Node.**

- Verified live: `/opt/homebrew/bin/node` is v26.0.0. Node 26 shipped 2026-05-05 as a **Current** (non-LTS) release; it becomes **Active LTS on 2026-10-28** (about 5 weeks from today). It is not yet LTS but is on the standard path to it. Source: Node.js v26.0.0 release blog, nodejs.org/en/about/eol, endoflife.date/nodejs (via search 2026-09-23).
- Next.js's minimum supported Node version is **>=20.9.0** (confirmed against Next 16.3.5's engines field); Node 26 comfortably satisfies any current or near-future Next.js major version. Source: nextjs.org/docs/app/guides/upgrading/version-16 (via search).
- Using the pre-existing Homebrew binary **read-only** (never `brew install`/`brew upgrade` it, never write into `/opt/homebrew`) is explicitly allowed by operating-rules §7's spirit and the task brief ("read-only use is not an install"). This is simplest and has zero containment surface of its own — Homebrew's node formula is not "installed for this project".
- **Caveat / risk:** Node 26 will flip from Current to LTS in ~5 weeks, which historically has occasionally included small last-mile behavior changes before an LTS release stabilizes. If the build phase wants hard reproducibility independent of what's on this machine (e.g. a different contributor's machine has a different Homebrew Node version), download a **workspace-local Node tarball** instead:
  ```bash
  # OPTION B — workspace-local Node (only if reproducibility across machines is required)
  curl -fsSL -o "$T/node.tar.gz" "https://nodejs.org/dist/v24.9.0/node-v24.9.0-darwin-arm64.tar.gz"
  curl -fsSL -o "$T/node.tar.gz.sha256" "https://nodejs.org/dist/v24.9.0/SHASUMS256.txt.asc"  # verify manually
  mkdir -p "$T/node" && tar -xzf "$T/node.tar.gz" -C "$T/node" --strip-components=1
  export PATH="$T/node/bin:$PATH"
  ```
  Pin to the Node 24 "Krypton" LTS line (Active LTS through 2028) rather than Node 26, since the workspace-local path exists specifically for stability. **UNVERIFIED**: the exact current Node 24 patch version and its SHASUMS256 URL — re-check at install time (`https://nodejs.org/dist/latest-v24.x/`).
  - This is the standard official-tarball method; nothing is written outside `.tooling/node/` and no shell profile is touched (only `PATH` inside the sourced `env.sh`, which is workspace-scoped).

**Project `.npmrc`** — write this as `$T/npmrc` (the file `npm_config_userconfig` points at), not `~/.npmrc`:
```ini
cache=/Users/adham/Developer/et-ccc/.tooling/npm-cache
prefix=/Users/adham/Developer/et-ccc/.tooling/npm-global
update-notifier=false
fund=false
audit=false
```
(Use absolute paths — npm does not reliably expand `~` or relative paths in every context inside an `.npmrc` value.)

**`npx` never writing to `~/.npm/_npx`:** with `npm_config_cache` redirected, `npx`/`npm exec`'s ephemeral-package cache (the `_npx` subfolder) is created under the redirected cache root, not `~/.npm`. This is the documented mechanism (npm_config_ prefix applies to every npm config key, and npx shares npm's cache config) but the **exact subfolder behavior should be verified empirically** at install time: run `npx --yes cowsay hi` (or any harmless package) with `env.sh` sourced, then check `ls "$T/npm-cache"` for a `_npx` directory and confirm `~/.npm/_npx` is untouched (see the snapshot procedure, §9). **Do not use `npx` for anything in this project's real workflow anyway** — every tool procedure below uses a pinned tarball/binary fetch instead of `npx`, precisely to avoid this whole class of risk (this matches D-009's explicit "never use npx" ruling for avoid-ai-writing, extended here as a project-wide default).

**Sources:** [npm config docs](https://docs.npmjs.com/cli/v11/using-npm/config/), [.npmrc docs](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/), [npx cache location — bobbyhadz](https://bobbyhadz.com/blog/npm-change-cache-location), [Node.js v26.0.0 release](https://nodejs.org/en/blog/release/v26.0.0), [Next.js v16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16), [Node.js EOL](https://nodejs.org/en/about/eol).

---

## 4. Playwright

**Recommendation: Chromium only**, unless the build phase specifically needs cross-browser testing (this app is a Next.js educational site with a light-mode-only requirement — Chromium is sufficient for E2E and screenshot verification per the user's global CLAUDE.md "test in an E2E setting" rule).

**Contained install:**
```bash
source "$ET_CCC_ROOT/.tooling/env.sh"     # sets PLAYWRIGHT_BROWSERS_PATH
cd "$ET_CCC_ROOT/main-app"                 # once it exists; playwright is a devDependency there
npm install --save-dev @playwright/test    # lands in main-app/node_modules, not global
npx --prefix . playwright install chromium # downloads only chromium into $T/playwright-browsers
```
- `PLAYWRIGHT_BROWSERS_PATH` must be set **identically at install time and at test-run time** (documented requirement — playwright.dev/docs/browsers), which `env.sh` guarantees since every agent sources it first.
- `npx playwright install chromium` here is the one narrow, documented use of `npx` that's unavoidable (it's Playwright's own installer subcommand, run against the **local** `@playwright/test` devDependency, not a network fetch of an unpinned package) — confirm the resolved package version is pinned in `main-app/package.json`/`package-lock.json` before running it, so the install is reproducible.

**macOS side effects found:**
- **Browser cache:** without the redirect, Chromium lands in `~/Library/Caches/ms-playwright`. Confirmed via multiple sources including a GitHub issue specifically about this path being purged by macOS ([naitokosuke/dotfiles#476](https://github.com/naitokosuke/dotfiles/issues/476)) — a secondary reason to redirect it into the workspace: macOS's cache-purging behavior for `~/Library/Caches` could otherwise silently delete the browser mid-project.
- **Gatekeeper / notarization:** Chromium binaries downloaded this way are not Apple-notarized the way a `brew install --cask chromium` build is; macOS Gatekeeper may show an "Allow" prompt or block execution the first time a given Chromium binary runs, depending on how it was quarantined on download (`curl`/`npx` downloads are typically not quarantined the way a browser-downloaded file is, since the quarantine xattr is set by apps that call the `LSQuarantine` API, which Node's fetcher does not). **UNVERIFIED**: whether Playwright's own Node-based downloader sets the quarantine xattr on the unpacked Chromium binary on this specific macOS/Playwright version combination — check at install time with `xattr -l "$T/playwright-browsers"/**/Chromium.app/Contents/MacOS/Chromium` after install; if `com.apple.quarantine` is present and blocks headless launch, either `xattr -dr com.apple.quarantine <path>` (a local, non-persistent, per-file operation entirely inside the workspace — does not touch any global Gatekeeper database) or accept a one-time interactive approval.
- **Keychain / mock keychain:** Playwright launches Chromium with `--use-mock-keychain` by default specifically to avoid real macOS Keychain prompts (confirmed via search of Playwright's known Chromium launch flags). No keychain access should occur in headless test runs.
- **Crash reporter:** **UNVERIFIED** — could not confirm from search whether Playwright's bundled Chromium writes crash dumps to `~/Library/Application Support/Google/Chrome Crashpad` or an equivalent path outside `PLAYWRIGHT_BROWSERS_PATH`. Verify at install time: run one test, then `find ~/Library/Application\ Support -iname '*crashpad*' -newer <marker file>` (see snapshot design, §9). If it writes there, the two known mitigations are launching with `--disable-crash-reporter` (pass via Playwright's `launchOptions.args`) or accepting it as a small, documented exception.

**Verify:**
```bash
source .tooling/env.sh
echo $PLAYWRIGHT_BROWSERS_PATH
ls .tooling/playwright-browsers            # should contain chromium-<rev>/
ls ~/Library/Caches/ms-playwright 2>&1     # should fail ("No such file or directory")
```

**Uninstall:** `rm -rf .tooling/playwright-browsers` (plus `npm uninstall @playwright/test` in `main-app/` if removing the dependency entirely).

**Sources:** [Playwright Browsers docs](https://playwright.dev/docs/browsers), [PLAYWRIGHT_BROWSERS_PATH reference — QASkills.sh](https://qaskills.sh/blog/playwright-browsers-path-environment-variable-reference), [naitokosuke/dotfiles#476](https://github.com/naitokosuke/dotfiles/issues/476).

---

## 5. Pyodide (self-hosted, no CDN)

**Verified current version: Pyodide 314.0.7** (released 2026-09-14). Note: Pyodide's versioning scheme changed to track its bundled CPython version — `314.x.y` bundles **CPython 3.14.x** — confirmed via the project's own changelog ("Upgraded to Python 3.14.2") and its GitHub releases page, which lists `314.0.7` as the current "Latest" alongside legacy `0.27.x`/`0.29.x` tags from an older scheme still being tagged in parallel. Source: [github.com/pyodide/pyodide/releases](https://github.com/pyodide/pyodide/releases), [pyodide.org changelog](https://pyodide.org/en/stable/project/changelog.html).

**Important cross-check for this project:** D-004 pins the *teaching/grading* Python target to **Python 3.8 semantics (PyPy3 7.3.9 / CCC grader)**. Pyodide 314.x runs **CPython 3.14** in-browser. If Pyodide is used for any in-browser "run your code" sandbox, its behavior (available stdlib features, error messages, `match` statements working, f-string nuances, etc.) will **not** match the CCC grader's Python 3.8, and could actively mislead a learner into writing code that runs in-browser but fails on the grader. **This is a product-design flag for the plan, not a containment issue** — flagging it here because it surfaced during this research and the user's global CLAUDE.md instructs surfacing anything that "looks off" even outside the immediate task.

**Self-hosting mechanics:**
- Install the npm package (as a dependency only, to get a pinned, checksummed tarball via the npm registry rather than an ad hoc download) or fetch the GitHub release tarball directly — either avoids any CDN reference at runtime.
- `pyodide-core-314.0.7.tar.bz2` is the minimal runtime bundle (loader `pyodide.mjs`, `pyodide.asm.mjs`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`). The **full** distribution (`pyodide-314.0.7.tar.bz2`) additionally bundles every pure/binary wheel Pyodide ships and is **200+ MB**; the npm package's unpacked size is **~13.9 MB** (`registry.npmjs.org/pyodide/latest`, `dist.unpackedSize` field, fetched live 2026-09-23) which corresponds to the core runtime plus JS glue, not the full wheel set.
- **Recommendation:** use `npm install pyodide --save` in `main-app/`, then copy (via a small `postinstall`/setup script, not a manual one-off) the files Pyodide needs into `main-app/public/pyodide/`:
  ```bash
  mkdir -p main-app/public/pyodide
  cp node_modules/pyodide/pyodide.{mjs,asm.mjs,asm.wasm} main-app/public/pyodide/
  cp node_modules/pyodide/python_stdlib.zip main-app/public/pyodide/
  cp node_modules/pyodide/pyodide-lock.json main-app/public/pyodide/
  ```
  Only add specific extra package `.whl`/`.zip` files (also present in `node_modules/pyodide/`) if a lesson genuinely needs a package beyond the stdlib (e.g. none for a CCC-prep tool, most likely).
- **Serving requirements:** `.wasm` must be served as `Content-Type: application/wasm` — Next.js's default static file server for `public/` does this correctly for `.wasm` in modern versions, but **verify** with `curl -I` against the dev/prod server once `main-app/` exists. No CORS headers are required for same-origin hosting (same-origin requests don't trigger CORS preflight); CORS only matters if a CDN were used, which this design explicitly avoids.
- **Set `indexURL`** to the local public path when calling `loadPyodide`, e.g. `loadPyodide({ indexURL: "/pyodide/" })`, so no network call ever leaves the origin.

**Verify:** after copying, `ls main-app/public/pyodide` should show the 5 files above; load the page and confirm (via browser devtools Network tab, or `mcp__claude-in-chrome` tooling in a later build/verification phase) that no request goes to `cdn.jsdelivr.net` or `pyodide-cdn2.iodide.io`.

**Uninstall:** `npm uninstall pyodide` in `main-app/`, `rm -rf main-app/public/pyodide`.

**Open question for the plan (not resolved here):** whether to commit `public/pyodide/` (adds ~10–15 MB to the repo, but it's the whole point of self-hosting — no build-time fetch dependency) vs. fetch it via a `postinstall`/setup script run once per environment (smaller repo, but re-introduces a network dependency at setup time, which is fine for containment since npm's own tarball is already checksummed by npm, but should be a deliberate decision).

**Sources:** [pyodide npm package](https://www.npmjs.com/package/pyodide) ([registry.npmjs.org/pyodide/latest](https://registry.npmjs.org/pyodide/latest)), [Pyodide downloading and deploying docs](https://pyodide.org/en/stable/usage/downloading-and-deploying.html), [Pyodide releases](https://github.com/pyodide/pyodide/releases), [Pyodide changelog](https://pyodide.org/en/stable/project/changelog.html), [pyodide/pyodide discussion #4373 — Next.js usage](https://github.com/pyodide/pyodide/discussions/4373).

---

## 6. Python 3.8 / PyPy3.8 for CI checks (vermin etc.)

**Key finding: PyPy 7.3.9 has no macOS arm64 build.** PyPy only gained Apple Silicon (arm64) support starting with **PyPy 7.3.10** (December 2022); 7.3.9 (the exact version pinned by D-004 as matching the CCC grader) predates that and only ships **`pypy3.8-v7.3.9-osx64.tar.bz2`** — an **x86_64** build. Confirmed live: this file exists and downloads successfully (`curl -sI` → HTTP 200, `content-length: 25529516` ≈ 24.3 MB, `last-modified: 2026-05-26`, matching the 24M listed on `pypy.org/download.html`). Source: [PyPy v7.3.10 release notes](https://doc.pypy.org/en/latest/release-v7.3.10.html) ("first release to include Apple Silicon"), [PyPy M1 support post](https://pypy.org/posts/2022/07/m1-support-for-pypy.html), file existence and size verified directly at `https://downloads.python.org/pypy/pypy3.8-v7.3.9-osx64.tar.bz2`.

**This machine can run it anyway, without installing anything new**, because **Rosetta 2 is already present and running** here (verified live: `pgrep oahd` succeeds, `arch -x86_64 /usr/bin/true` succeeds). Rosetta 2 is a macOS system component, not project tooling — it is not "installed for this project" and this research did not install it. **If a future contributor's Mac does not have Rosetta 2 enabled, this procedure cannot silently proceed**: enabling Rosetta (`softwareupdate --install-rosetta`) is a **system-wide, non-workspace install** and must **stop and report** rather than be run automatically by any agent, per operating-rules §7. Document this as a machine prerequisite, not a workspace install step.

**Recommended contained install (exact-match option, preferred for CI fidelity with the real grader):**
```bash
source .tooling/env.sh
mkdir -p .tooling/pypy
curl -fsSL -o .tooling/pypy/pypy3.8-v7.3.9-osx64.tar.bz2 \
  https://downloads.python.org/pypy/pypy3.8-v7.3.9-osx64.tar.bz2
# Verify checksum against https://www.pypy.org/checksums.html — fetch fresh and grep at install time;
# the value transcribed during this research is UNVERIFIED (a 64-hex-char SHA-256 read through a
# summarizing fetch is not trustworthy without a byte-for-byte re-check):
curl -fsSL https://www.pypy.org/checksums.html | grep -A2 'pypy3.8-v7.3.9-osx64.tar.bz2'
shasum -a 256 .tooling/pypy/pypy3.8-v7.3.9-osx64.tar.bz2   # compare by eye against the grepped line
tar -xjf .tooling/pypy/pypy3.8-v7.3.9-osx64.tar.bz2 -C .tooling/pypy --strip-components=1
arch -x86_64 .tooling/pypy/bin/pypy3.8 --version   # run under Rosetta 2; expect "Python 3.8.x" + "PyPy 7.3.9"
```
This gives byte-for-byte the interpreter the CCC Online Grader uses (per D-004's citation of cccgrader.com/sample_soln.pdf), for anything that must be checked against the real grader semantics (e.g. running example solutions locally before publishing them as lesson content).

**Simpler fallback (if only `vermin`-style static analysis is needed, not actual execution):** vermin **parses source into an AST and never executes it**, so it does not need to run *under* Python 3.8 at all — it needs to run under *some* Python (3.14 is fine, since vermin ships as a pure package with no C-extension version coupling) and is told the **target** version via `-t=3.8`. Confirmed: `vermin` installs via `pip install vermin` and its `-t=V` flag sets "target version that files must abide by ... exit code 1 if not met" — this is a static compatibility check, not an interpreter substitution. **This means vermin does not need PyPy 3.8 or CPython 3.8 installed at all** — it can run under the already-present system Python 3.14 (or a workspace uv-managed Python), just pointed at `-t=3.8`. Recommend using **vermin under a uv-managed CPython** (workspace-contained, arm64-native, no Rosetta needed) for the *static* check, and reserve the **PyPy 3.8 x86_64 binary under Rosetta** for the rarer case of actually *executing* example solutions to confirm grader-identical runtime behavior.

**vermin, contained, in a workspace venv via uv:**
```bash
source .tooling/env.sh
uv venv .tooling/venvs/vermin --python 3.12   # any modern CPython; vermin itself is version-agnostic
uv pip install --python .tooling/venvs/vermin/bin/python vermin
.tooling/venvs/vermin/bin/vermin -t=3.8 -t=3.8 --no-tips main-app/  # -t twice pins exact target per vermin docs
```
(`uv venv`/`uv pip` write only inside the given `--python`-resolved interpreter and the target venv path, both inside `.tooling/`, given the `UV_*` redirects from `env.sh`.)

**If actual CPython 3.8 execution (not PyPy) is ever needed and Rosetta-based PyPy is undesirable:** `python-build-standalone` (the project `uv` itself uses for managed Pythons) has **no aarch64-apple-darwin release for CPython 3.8** — Apple Silicon support in that project started at Python 3.9, and 3.8 does not build cleanly against the macOS 11+ SDK required for arm64 (confirmed via search of the project's own build docs and its releases page, which lists no CPython 3.8.x asset in any recent release window). The closest contained option there is the same pattern: `uv python install cpython-3.8.20-darwin-x86_64-none` (uv does list this as available, per `uv python list --all-versions`) and run it under Rosetta 2, i.e. functionally equivalent to the PyPy option above, just CPython instead of PyPy. Given D-004 specifically pins PyPy 3.8 as the grader's actual interpreter, **prefer the PyPy 7.3.9 x86_64 tarball** over a uv-managed CPython 3.8 for any check that cares about grader-identical behavior.

**Uninstall:** `rm -rf .tooling/pypy .tooling/venvs/vermin .tooling/uv`.

**Sources:** [PyPy download page](https://www.pypy.org/download.html), [PyPy v7.3.10 release notes](https://doc.pypy.org/en/latest/release-v7.3.10.html), [PyPy M1 support announcement](https://pypy.org/posts/2022/07/m1-support-for-pypy.html), [PyPy checksums page](https://www.pypy.org/checksums.html), [python-build-standalone releases](https://github.com/astral-sh/python-build-standalone/releases), [uv environment variables](https://docs.astral.sh/uv/reference/environment/), [uv installer reference](https://docs.astral.sh/uv/reference/installer/), [vermin repo](https://github.com/netromdk/vermin), live verification: `curl -sI https://downloads.python.org/pypy/pypy3.8-v7.3.9-osx64.tar.bz2` and `pgrep oahd` / `arch -x86_64 /usr/bin/true` run in this session.

---

## 7. Impeccable (D-005, approved by Manager with containment condition)

**Re-checked version: still `skill-v4.3.1`** (published 2026-09-09), confirmed as the latest skill release as of 2026-09-23 via the GitHub Releases API (`api.github.com/repos/pbakaus/impeccable/releases`) — next-most-recent is engine `v0.1.5` (2026-09-08, a separate release track from the skill itself). This matches the prior recon finding in `research/01-recon/design-skill-recommendation.md`; no version drift to report.

**What it writes, read directly from the launcher script** (`.claude/skills/impeccable/scripts/impeccable` at tag `skill-v4.3.1`, fetched and read this session):
- **No Node/npx dependency at all** — the script explicitly documents that it "never needs Node"; confirmed no `npx`/`npm` invocation anywhere in it. This removes one entire class of leakage risk (it cannot write to `~/.npm`).
- Cache root: `${IMPECCABLE_HOME:-$HOME/.impeccable}` — confirms the prior recon doc's finding; setting `IMPECCABLE_HOME` (as `env.sh` does, to `.tooling/impeccable-home`) fully redirects it.
- Under that root it writes: `bin/<version>/impeccable[.exe]` (the versioned engine binary), `bin/impeccable[.exe]` (an unversioned convenience copy/symlink), and a transient `bin/<version>/.impeccable.part.<pid>` staging file during download — all inside the redirected root once `IMPECCABLE_HOME` is set.
- **Download/verification:** fetches the engine binary from `https://github.com/pbakaus/impeccable/releases/download/engine-v<version>/...` plus a `.sha256` sidecar, hashes the download with `shasum -a 256`/`sha256sum`, and **refuses to run** the binary if the sidecar is missing or the hash mismatches. This is a real, code-level integrity check, not a documentation claim.
- **No telemetry** found in the script.
- The `.claude/settings.json`/`.claude/settings.local.json` hook registration (from the prior recon doc) and `.impeccable/config.json`/`.impeccable/config.local.json` are written **inside the workspace** (`.claude/` and `.impeccable/` at the workspace root) regardless of `IMPECCABLE_HOME` — these were already correctly scoped in the prior recon doc's plan and remain so.

**Contained install + verify + uninstall:** unchanged from `research/01-recon/design-skill-recommendation.md`'s "Install instructions" section — that procedure (Option B, manual copy pinned to `skill-v4.3.1`, plus setting `IMPECCABLE_HOME` in project `.claude/settings.json`) is confirmed correct by this session's direct read of the launcher source and needs no revision. Re-quoting the critical env line for `.claude/settings.json`:
```json
{ "env": { "IMPECCABLE_HOME": "/Users/adham/Developer/et-ccc/.tooling/impeccable-home" } }
```
(Path updated here to live under `.tooling/` per this doc's layout, §1, rather than the prior doc's `.impeccable-home/` at the root — either location is equally contained; `.tooling/impeccable-home` is preferred for consistency with every other tool's state living under one directory.)

**Nothing found in this research that cannot be contained.** Impeccable is the cleanest of all the tools researched here: no Node dependency, one clearly documented override variable, and a code-verified checksum gate on its only network download.

**Sources:** [pbakaus/impeccable releases (GitHub API)](https://api.github.com/repos/pbakaus/impeccable/releases), launcher script read directly from `https://raw.githubusercontent.com/pbakaus/impeccable/skill-v4.3.1/.claude/skills/impeccable/scripts/impeccable`, `research/01-recon/design-skill-recommendation.md` (prior phase deliverable, cross-checked not re-derived from scratch).

---

## 8. avoid-ai-writing (D-009, approved by Manager, pinned commit)

Repo structure confirmed **at the pinned commit** `fc979c6489ec0ac81a77236782ba496da81b24cb` (via GitHub's tree API for that exact SHA, not a branch head):

```
skills/avoid-ai-writing/
├── SKILL.md                    21,289 bytes — frontmatter: name, description, version 3.35.0, license MIT
├── detector/
│   ├── patterns.js             139,522 bytes — the AIDetector engine (zero npm deps, pure Node)
│   ├── validate.js              15,392 bytes — preservation validator (post-rewrite diff check)
│   └── CATEGORIES.md            13,069 bytes — the 54-category pattern catalog documentation
├── references/
│   └── patterns.md              96,488 bytes — the full pattern reference (the ~30k-token "required reading" flagged as a cost in the prior recon doc)
├── examples/
│   ├── README.md
│   ├── prose.json
│   └── technical.json
├── scripts/
│   ├── check-style.js            9,653 bytes
│   ├── markdown-prose.js        13,005 bytes
│   └── normalize-quotes.js       5,003 bytes
└── agents/
    └── openai.yaml                 280 bytes
```
Root `package.json` at this commit: `name: avoid-ai-writing-detector`, `version: 3.35.0`, **no runtime `dependencies` or `devDependencies` listed** (confirms the "zero-dependency Node detector" claim from the prior recon doc), `bin` entries `avoid-ai-writing` → `bin/avoid-ai-writing.js` and `avoid-ai-writing-gate` → `bin/avoid-ai-writing-gate.js`, and `engines` requiring **Node >= 18** (Node 26 on this machine satisfies this trivially).

**Scripts, exact CLI usage, confirmed by reading source at the pinned commit:**
- **Detector** (`bin/avoid-ai-writing.js`, and equivalently `detector/patterns.js`'s `AIDetector` class): reads a file path argument or stdin (`-` or no argument), UTF-8 text only; flags: `--context <general|technical>` (default `general`), `--source-mode <plain|rendered-markdown>` (default `plain`); prints the full `analyzeText()` result as JSON to stdout; **exit 0** on a successful run (regardless of whether issues were found — the JSON payload carries the findings), **exit 2** on usage errors or I/O failures. Uses only Node built-ins (`fs`, `util`) plus the local `AIDetector` module — no third-party requires.
- **Preservation validator** (`detector/validate.js`): `node detector/validate.js <original> <rewritten>` — exits non-zero if a rewrite corrupted code blocks, tables, URLs, or headings, or introduced more flagged patterns than it removed. This is the recommended check after any Humanizer/avoid-ai-writing rewrite pass in the content workflow.
- **`scripts/check-style.js`**: `node scripts/check-style.js <file> --config <path>` — exit 0 clean, 1 hard violation, 2 tool error.
- **`scripts/normalize-quotes.js`**: `node scripts/normalize-quotes.js <rewritten> --reference <original> --write`, with `--quotes straight|curly` overrides.

**Voice and context profile selection:** both are CLI flags read directly from `SKILL.md`'s documented invocation surface: `--voice casual|professional|technical|warm|blunt` and `--context linkedin|blog|technical-blog|investor-email|docs|casual`. D-009 pins `warm` + `docs`, i.e. every invocation for this project's lesson content should pass `--voice warm --context docs` (or the natural-language equivalent inside a Claude Code session, which the SKILL.md says also works: "rewrite in warm voice for docs"). No dependency on npm packages for either profile — they only affect which sections of `references/patterns.md`/`CATEGORIES.md` the model is instructed to weight, and adjust severity thresholds in the detector's scoring, all of which is local, data-driven logic in `patterns.js`.

**Fetching exactly this commit without a git clone into `~`:**
```bash
source .tooling/env.sh
mkdir -p .tooling/downloads
curl -fsSL -o .tooling/downloads/avoid-ai-writing-fc979c6.tar.gz \
  "https://github.com/conorbronsdon/avoid-ai-writing/archive/fc979c6489ec0ac81a77236782ba496da81b24cb.tar.gz"
# GitHub's codeload tarball for an exact commit SHA is itself a strong pin — the SHA is
# baked into the URL, so if the download succeeds it is provably that commit's tree.
# Cross-check the tree contents against the API tree listing already captured above.
shasum -a 256 .tooling/downloads/avoid-ai-writing-fc979c6.tar.gz   # record the hash for the phase log; GitHub does not publish a separate published checksum for commit tarballs, so this is a record-for-reproducibility hash, not a third-party-verified one
mkdir -p /tmp-extract-avoid-ai-writing   # use the session scratchpad in practice, not literal /tmp — see note below
tar -xzf .tooling/downloads/avoid-ai-writing-fc979c6.tar.gz -C .tooling/downloads --strip-components=1
mkdir -p .claude/skills/avoid-ai-writing
cp -R .tooling/downloads/skills/avoid-ai-writing/. .claude/skills/avoid-ai-writing/
rm -rf .tooling/downloads   # or keep it as a provenance artifact; either is fine, it's inside the workspace either way
```
(The `/tmp-extract-avoid-ai-writing` line above is illustrative only — the actual install step should extract straight into `.tooling/downloads/` inside the workspace, as the rest of the snippet does; no system `/tmp` use is needed here since the download and extraction both target workspace paths directly.)

**Must-avoid install routes, confirmed present in the README at this commit and explicitly excluded by D-009:**
- `npm install -g avoid-ai-writing-detector` (global npm)
- `git clone ... ~/.claude/skills/avoid-ai-writing` (user-scope, writes into the real `~/.claude`)
- `/plugin marketplace add conorbronsdon/avoid-ai-writing` (Cowork/Claude plugin marketplace, user-scope by default)
- The bundled **MCP server**, `avoid-ai-writing-mcp`, installed via `claude mcp add avoid-ai-writing -- npx -y avoid-ai-writing-mcp@0.1.0` — this is the single clearest violation in the whole README: it both runs `npx` (writing to `~/.npm`) and registers an MCP server, which for Claude Code is itself typically recorded in `~/.claude.json` or project `.mcp.json`; **do not use this**, per D-009's explicit exclusion.
- `clawhub install avoid-ai-writing` and the OpenAI Plugins Directory route — both third-party distribution channels outside this project's control, not used.

**Verify:**
```bash
ls .claude/skills/avoid-ai-writing/SKILL.md .claude/skills/avoid-ai-writing/detector/patterns.js
grep -m1 version .claude/skills/avoid-ai-writing/SKILL.md   # expect version: 3.35.0
node .claude/skills/avoid-ai-writing/bin/avoid-ai-writing.js --help 2>&1 | head -5   # confirm it runs under system/workspace node with zero installs
```
Then run the standard before/after snapshot (§9) around the whole fetch+copy sequence to prove nothing landed in `~/.claude`, `~/.npm`, or `~/.cache`.

**Uninstall:** `rm -rf .claude/skills/avoid-ai-writing`. No MCP server was registered, no npm global package installed, so there is nothing else to remove.

**Sources:** GitHub tree API at the pinned commit (`api.github.com/repos/conorbronsdon/avoid-ai-writing/git/trees/fc979c6489ec0ac81a77236782ba496da81b24cb?recursive=1`), `package.json`, `SKILL.md`, `bin/avoid-ai-writing.js`, and `README.md` all fetched directly from `raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/fc979c6489ec0ac81a77236782ba496da81b24cb/...` in this session; prior recon doc `research/02-writing-style-skill/recommendation.md` (cross-checked, not re-derived).

---

## 9. Snapshot / verification script design

**Principle:** snapshot *before* touching anything, run the install, snapshot *after*, diff. A missing "before" snapshot makes any "after" claim unfalsifiable, so the install procedure for every tool above must run the "before" half first.

**Paths to snapshot (macOS-specific, covering everything named in this research plus the standard suspects the task asked to catch):**
```
~/.npm
~/.npmrc
~/.node-gyp
~/Library/Caches/ms-playwright
~/Library/Caches/next-swc          # speculative — verify it's not actually used; not confirmed by research
~/Library/Preferences/nextjs-nodejs
~/.cache
~/.cache/uv
~/.cache/node/corepack
~/.local/share/uv
~/.local/bin
~/.config
~/.config/uv
~/.impeccable
~/.claude
~/.claude.json
~/.claude/skills
~/.claude/plugins
~/.gitconfig
~/.ssh/known_hosts                 # sanity check nothing touches this, even though nothing here should
/opt/homebrew                       # confirm no brew install/upgrade occurred (mtimes only; contents change often on a live machine, see caveat below)
/tmp                                 # best-effort; macOS purges this continuously regardless
$TMPDIR                              # the per-session /var/folders/... path from `getconf DARWIN_USER_TEMP_DIR`
~/Library/Application Support/Google/Chrome Crashpad   # Playwright crash dumps, if any (§4 UNVERIFIED item)
/etc/paths.d, /etc/paths, ~/.zshrc, ~/.zprofile, ~/.bash_profile, ~/.profile   # shell profile edits
```

**How (concrete commands):**
```bash
# --- before ---
MARKER="$ET_CCC_ROOT/.tooling/snapshots/marker-$(date +%s)"
touch "$MARKER"
for p in ~/.npm ~/.npmrc ~/Library/Caches/ms-playwright ~/Library/Preferences/nextjs-nodejs \
         ~/.cache ~/.local/share/uv ~/.local/bin ~/.config ~/.impeccable ~/.claude ~/.claude.json \
         ~/.gitconfig /opt/homebrew ~/.zshrc ~/.zprofile ~/.bash_profile ~/.profile; do
  if [ -e "$p" ]; then
    find "$p" -maxdepth 6 -exec stat -f '%N|%z|%m' {} \; > "$ET_CCC_ROOT/.tooling/snapshots/before-$(basename "$p").txt" 2>/dev/null
  else
    echo "ABSENT" > "$ET_CCC_ROOT/.tooling/snapshots/before-$(basename "$p").txt"
  fi
done

# ... run the install step here ...

# --- after ---
for p in ~/.npm ~/.npmrc ~/Library/Caches/ms-playwright ~/Library/Preferences/nextjs-nodejs \
         ~/.cache ~/.local/share/uv ~/.local/bin ~/.config ~/.impeccable ~/.claude ~/.claude.json \
         ~/.gitconfig /opt/homebrew ~/.zshrc ~/.zprofile ~/.bash_profile ~/.profile; do
  if [ -e "$p" ]; then
    find "$p" -maxdepth 6 -exec stat -f '%N|%z|%m' {} \; > "$ET_CCC_ROOT/.tooling/snapshots/after-$(basename "$p").txt" 2>/dev/null
  else
    echo "ABSENT" > "$ET_CCC_ROOT/.tooling/snapshots/after-$(basename "$p").txt"
  fi
done

# --- diff, plus a catch-all newer-file sweep as a backstop for paths not explicitly listed above ---
for f in "$ET_CCC_ROOT"/.tooling/snapshots/before-*.txt; do
  after="${f/before-/after-}"
  diff "$f" "$after" && echo "OK: no change in $(basename "$f")" || echo "CHANGED: $(basename "$f") — investigate"
done
find ~ -maxdepth 4 -newer "$MARKER" ! -path "$ET_CCC_ROOT/*" 2>/dev/null   # backstop: anything else under $HOME touched during install, excluding the workspace itself
```

**What counts as proof:**
- Every `diff` above reports no change, **and**
- The catch-all `find ~ -newer "$MARKER" ! -path "$ET_CCC_ROOT/*"` sweep returns **empty** (this is the actual proof of "nothing else, anywhere" — the explicit path list can miss something; the sweep is the real safety net), **and**
- `git status`/`brew list --versions <formula>` (read-only) confirm no Homebrew formula changed if Homebrew was touched at all, **and**
- The result, including the raw before/after files, is saved under `.tooling/snapshots/` and referenced in the phase log as the evidence artifact (per operating-rules §7: "Record the proof ... in the phase log").

**Caveats on the design:**
- `stat -f` is BSD/macOS syntax (this machine); note this explicitly if the snapshot script is ever run on Linux CI — GNU `stat` needs different format flags.
- `/opt/homebrew` changes constantly on a live developer machine for reasons unrelated to this project (other Homebrew activity); a change there is a **signal to investigate**, not automatically a failure — cross-check with `brew list --versions` for the specific formulas this project might touch (`node`), not a blanket diff.
- `/tmp` and `$TMPDIR` are excluded from "proof of zero traces" in the strict sense, since macOS purges them independent of anything this project does — but the sweep still reports on them for completeness during a single verification run.
- `find -newer` is a much stronger backstop than the explicit `stat` loop above; if the two ever disagree, trust `find -newer`.

---

## 10. Version control recommendation input

- **`git init` does not write to `~/.gitconfig`.** Git *reads* the global config (for `user.name`/`user.email` etc.) but `git init` only creates `.git/` inside the target directory; nothing about initializing a repo writes to the user's global config. Confirmed via git-scm.com's own `git-config` documentation and cross-checked in this session's research (no source found or expected to claim otherwise — this matches standard git behavior).
- **A fully contained git setup for this workspace:**
  ```bash
  export GIT_CONFIG_GLOBAL="$ET_CCC_ROOT/.tooling/git-config"   # empty file; git will not read ~/.gitconfig at all
  export GIT_CONFIG_SYSTEM=/dev/null                             # also skip /etc/gitconfig, for completeness
  git init "$ET_CCC_ROOT"
  git -C "$ET_CCC_ROOT" config user.name "adham"                 # writes to .git/config, i.e. LOCAL scope only
  git -C "$ET_CCC_ROOT" config user.email "moizllmuser@gmail.com"
  ```
  With `GIT_CONFIG_GLOBAL` pointed at an empty file inside `.tooling/`, git never even reads the real `~/.gitconfig` for this workspace's commands, which sidesteps any ambiguity about "reads, doesn't write" — it does neither. All `git config` calls without `--global`/`--system` write to the repo-local `.git/config`, which lives inside the workspace and disappears if the workspace is deleted.
  - Note: `GIT_CONFIG_GLOBAL` must be set in `env.sh` for *every* git invocation in this workspace (already added to §2's `env.sh`), otherwise an agent running `git` without sourcing `env.sh` first would fall back to reading (not writing) the real `~/.gitconfig`, which is a containment leak in the sense of "the workspace's behavior depends on machine state outside it," even though it's read-only and not itself destructive.
- This is direct input for whatever the plan's version-control recommendation ends up being (not decided in this document — that's a plan-level decision, not a containment mechanic).

**Sources:** [git-config documentation](https://git-scm.com/docs/git-config), general git behavior cross-checked via search (2026-09-23).

---

## Anything that cannot be fully contained

1. **Next.js telemetry config file** (`~/Library/Preferences/nextjs-nodejs/config.json`) — **UNVERIFIED** whether `NEXT_TELEMETRY_DISABLED=1` prevents the file from being created at all, or only prevents the *content* of it from being sent. If the file is still created, it is a small (roughly 100-byte) JSON preference file, not an installed package, binary, or persistent tooling state — a borderline case, not a hard blocker. **Action for the install phase:** test this empirically (snapshot `~/Library/Preferences/nextjs-nodejs` before and after the very first `next` command with `env.sh` sourced) and report the actual result in the phase log; if it writes there, either accept it as a tiny documented exception or wrap the one-time `next telemetry disable` command in a scoped `HOME=` subshell (see the HOME-override analysis in §2) purely to redirect that single write, without exporting `HOME` into the general agent environment.
2. **Rosetta 2 being absent on a future machine** — this research's PyPy 3.8/CPython 3.8 CI-check procedure (§6) depends on Rosetta 2, which is already present on *this* machine but is a system-level, non-workspace component. If a future contributor's Mac lacks it, enabling it (`softwareupdate --install-rosetta`) is outside workspace scope and must **stop and report** rather than be silently run. Not a blocker for this machine; flagged as a portability caveat.
3. **`npx playwright install chromium`** (§4) is the one place this document recommends using `npx` at all — it's Playwright's own installer subcommand run against a version-pinned local devDependency, not an arbitrary network package fetch, and its only global-write behavior is the browser binary itself, which `PLAYWRIGHT_BROWSERS_PATH` redirects. This is judged acceptably contained (not a blocker) but is explicitly the one exception to this document's "never use npx" default, so it's called out here rather than left implicit.
4. **Playwright's crash-reporter write location** (§4) — UNVERIFIED, not confirmed either way by search. Needs an empirical check during the install phase, not a hard stop.
5. **Nothing else researched here required stopping.** Impeccable (§7) and avoid-ai-writing (§8), the two actual third-party skills approved by the Manager, both have fully documented, fully containable install paths with no remaining unknowns beyond the ordinary "verify empirically" steps every install here already calls for.

---

## Sources (consolidated)

- npm config: https://docs.npmjs.com/cli/v11/using-npm/config/ , https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/
- npx cache location: https://bobbyhadz.com/blog/npm-change-cache-location
- Next.js telemetry: https://nextjs.org/telemetry , https://florian-martens.medium.com/how-to-stop-your-next-js-app-from-sending-telemetry-data-to-vercel-cf499c773f94
- next-swc cache: https://github.com/vercel/next.js/pull/38175 , https://github.com/swc-project/swc/discussions/4023
- Playwright browsers: https://playwright.dev/docs/browsers , https://qaskills.sh/blog/playwright-browsers-path-environment-variable-reference , https://github.com/naitokosuke/dotfiles/issues/476
- Chromium/TMPDIR socket path limit: https://groups.google.com/a/chromium.org/g/chromium-bugs/c/E3x_1364sM4/m/cLo9xeYT17oJ , https://github.com/python/cpython/issues/93852
- Pyodide: https://www.npmjs.com/package/pyodide , https://registry.npmjs.org/pyodide/latest , https://pyodide.org/en/stable/usage/downloading-and-deploying.html , https://github.com/pyodide/pyodide/releases , https://pyodide.org/en/stable/project/changelog.html , https://github.com/pyodide/pyodide/discussions/4373
- uv environment variables and installer: https://docs.astral.sh/uv/reference/environment/ , https://docs.astral.sh/uv/reference/installer/ , https://docs.astral.sh/uv/reference/storage/
- PyPy: https://www.pypy.org/download.html , https://doc.pypy.org/en/latest/release-v7.3.10.html , https://pypy.org/posts/2022/07/m1-support-for-pypy.html , https://www.pypy.org/checksums.html , https://downloads.python.org/pypy/pypy3.8-v7.3.9-osx64.tar.bz2 (existence/size verified live)
- python-build-standalone: https://github.com/astral-sh/python-build-standalone/releases , https://gregoryszorc.com/docs/python-build-standalone/stable/building.html
- vermin: https://github.com/netromdk/vermin
- corepack: https://github.com/nodejs/corepack/blob/main/README.md
- git config: https://git-scm.com/docs/git-config
- Node.js versions: https://nodejs.org/en/blog/release/v26.0.0 , https://nodejs.org/en/about/eol , https://nextjs.org/docs/app/guides/upgrading/version-16
- Claude Code config dir (checked, not relied on): https://github.com/anthropics/claude-code/issues/28808
- Impeccable: https://api.github.com/repos/pbakaus/impeccable/releases , https://raw.githubusercontent.com/pbakaus/impeccable/skill-v4.3.1/.claude/skills/impeccable/scripts/impeccable , `research/01-recon/design-skill-recommendation.md`
- avoid-ai-writing: https://api.github.com/repos/conorbronsdon/avoid-ai-writing/git/trees/fc979c6489ec0ac81a77236782ba496da81b24cb?recursive=1 , https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/fc979c6489ec0ac81a77236782ba496da81b24cb/package.json , https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/fc979c6489ec0ac81a77236782ba496da81b24cb/SKILL.md , https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/fc979c6489ec0ac81a77236782ba496da81b24cb/README.md , https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/fc979c6489ec0ac81a77236782ba496da81b24cb/bin/avoid-ai-writing.js , `research/02-writing-style-skill/recommendation.md`
- ESLint/Vitest cache defaults: https://github.com/eslint/eslint/issues/13897 , https://vitest.dev/config/cache
- Live machine verification performed in this session: `uname -m`, `sw_vers`, `node --version`, `npm --version`, `npm config get cache/prefix`, `python3 --version`, `pgrep oahd`, `arch -x86_64 /usr/bin/true`, `curl -sI https://downloads.python.org/pypy/pypy3.8-v7.3.9-osx64.tar.bz2`

**Marked UNVERIFIED in this document (do not treat as confirmed without re-checking at install time):** the exact SHA-256 for `pypy3.8-v7.3.9-osx64.tar.bz2` transcribed via a summarizing fetch (§6); whether `NEXT_TELEMETRY_DISABLED=1` prevents file creation vs. only prevents sending (§2, §Blockers); whether Playwright's Chromium writes crash dumps outside `PLAYWRIGHT_BROWSERS_PATH` on this OS/version combo (§4); whether npx's cache genuinely uses `npm_config_cache` for the `_npx` subfolder on the exact npm 11.12.1 build on this machine (§3); `~/Library/Caches/next-swc` as a real path (included in the snapshot list defensively, not confirmed to exist) (§9); pip's exact 2026 config/cache env var names (§2 table); current Node 24 LTS patch version and its official SHASUMS URL if the workspace-local Node option is chosen (§3).
