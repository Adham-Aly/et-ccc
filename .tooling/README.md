# `.tooling/` — what it is, and how to remove it

`.tooling/` holds the state, config and binaries for every build tool this project uses, so that
nothing is installed globally and deleting the workspace leaves the Manager's Mac exactly as it
was before P3 (plan §9, operating-rules §7). This file documents every entry, how activation
works, how to re-run the containment proof, the allow-list policy, and exact removal steps.

## 1. Entries

| Path | What it is | Version | Installed by | Used by | Tracked? |
|---|---|---|---|---|---|
| `env.sh` | Containment environment: redirects every tool's home/cache/config into `.tooling/` | — | hand-written, P3 | sourced by every `.tooling/bin/*` wrapper | tracked |
| `npmrc` | npm user config (`npm_config_userconfig` points here instead of `~/.npmrc`) | — | hand-written, P3 | `.tooling/bin/npm` | tracked |
| `contain-allowlist.txt` | Backstop allow-list for `contain-snapshot`'s "outside the workspace" sweep | — | hand-written, P3 | `.tooling/bin/contain-snapshot` | tracked |
| `requirements-tools.txt` | Exact pins + PyPI sha256 hashes for the tools venv (ruff, vermin) | — | hand-written, P3 | `.tooling/bin/tools-pip install --require-hashes -r …` | tracked |
| `guard-cases.tsv` | Regression battery for `guard-bash` (block/pass cases) | — | hand-written, P3 | `.tooling/bin/guard-test` | tracked |
| `README.md` | This file | — | P3 | — | tracked |
| `bin/` | Wrappers and guards (below) | — | hand-written, P3 | called directly, or via `npm run …` | tracked |
| `node/` | Node.js tarball, unpacked | v24.21.0 | official tarball, SHA-256 checked against `nodejs.org` SHASUMS | `.tooling/bin/node`, `.tooling/bin/npm` | **ignored** |
| `npm-cache/` | npm's package/tarball cache | — | written by npm on first use | npm internals | **ignored** |
| `npm-global/` | Where `npm_config_prefix` points (a real `-g` install would land here, but `-g` is blocked) | — | written by npm if ever used | — | **ignored** |
| `corepack-home/` | `COREPACK_HOME` | — | written by corepack if invoked | — | **ignored** |
| `pypy38/` | PyPy 3.8 tarball, unpacked | 3.8 v7.3.11 (Python 3.8.16), macOS arm64 | official tarball, SHA-256 checked against pypy.org | `.tooling/bin/pypy38` | **ignored** |
| `venvs/tools/` | A Python venv built from `pypy38`, holding `ruff` and `vermin` | ruff 0.16.8, vermin 1.8.0 | `pypy38 -m venv` then `tools-pip install --require-hashes` | `.tooling/bin/ruff`, `.tooling/bin/vermin`, `.tooling/bin/tools-pip` | **ignored** |
| `xdg/` | `XDG_CACHE_HOME`/`XDG_CONFIG_HOME`/`XDG_DATA_HOME`/`XDG_STATE_HOME`, plus pip's cache and ruff's cache | — | written by tools that follow XDG, and pip/ruff via explicit env vars | gh, pip, ruff, node's REPL history, Python history | **ignored** |
| `playwright-browsers/` | Chromium/WebKit/Firefox binaries | installed in P4 | `PLAYWRIGHT_BROWSERS_PATH` | `.tooling/bin/pw`, Playwright test runs | **ignored** |
| `impeccable-home/` | Impeccable engine binary, downloaded by the skill's own launcher | engine 0.1.5 (darwin-arm64) | downloaded by `.claude/skills/impeccable/scripts/impeccable` on first run; checksum-verified against its `.sha256` sidecar | `.tooling/bin/impeccable`, the Impeccable PostToolUse/Stop hooks | **ignored** |
| `avoid-ai-writing-src/` | Full unpacked tarball of the avoid-ai-writing repo | v3.35.0 @ commit `fc979c6489ec0ac81a77236782ba496da81b24cb` | downloaded tarball, SHA-256 recorded in `work/03-setup/tool-versions.md` | source of `.claude/skills/avoid-ai-writing/` (copied from `skills/avoid-ai-writing/` inside this tarball) | **ignored** |
| `downloads/` | The raw tarballs and checksum files for every download above, kept as provenance | — | curl, at install time | not used at runtime; audit trail only | **ignored** |
| `locks/` | Build lock (`build.lock`) so only one `next build` runs at a time | — | written by `next build` (from P4) | `next build` | **ignored** |
| `snapshots/<label>/` | Containment proofs: `before/`, `after/`, `backstop.txt`, `report.txt`, `*-classified.txt` | — | `.tooling/bin/contain-snapshot` | G-CONTAIN audits | **ignored** |

Not under `.tooling/` but part of the same containment story:

| Path | What it is | Tracked? |
|---|---|---|
| `.impeccable/` | Impeccable's own config (`config.json`) and local caches (`hook.cache.json`, `hook.pending.json`, `config.local.json` — all gitignored) | config.json tracked; caches ignored |
| `.claude/settings.json` | The `env` block (redirect variables as literal paths), the `PreToolUse` Bash guard hook, and the Impeccable `PostToolUse`/`Stop` hooks | tracked |
| `.claude/skills/impeccable/`, `.claude/skills/avoid-ai-writing/` | The two project-scope skills, copied into the workspace (never installed at user scope) | tracked |

## 2. `.tooling/bin/` wrappers

| Wrapper | Resolves to | Refuses |
|---|---|---|
| `_wrap.sh` | (shared helper, not a standalone tool) — sources `env.sh`; `wrap_exec` refuses to `exec` anything whose realpath (symlinks resolved) does not fall under the wrapper's declared prefix | anything outside its prefix |
| `node` | `.tooling/node/bin/node` | anything else named `node` |
| `npm` | `.tooling/node/bin/npm` | `-g`/`--global`/`--location=global`/`--global=true`/`--location global` (as two words); `npm exec`/`npm x` without `--no` (and `--yes`/`-y` explicitly, since that can fetch remote packages); as of the P3 round-2 fix, also the environment-variable form of the same thing — `npm_config_global=true/1/yes` and `npm_config_location=global`, checked case-insensitively (so `NPM_CONFIG_GLOBAL=true` is caught too). The env-var form was a real gap found during the first audit pass: since `npm_config_prefix` is already redirected into `.tooling/`, a "global" install driven that way still landed inside the workspace, but it defeated the wrapper's own `-g` refusal. Verified fixed by confirming the wrapper refuses with exit 126 in every form; no install was allowed to run during the re-check. |
| `pypy38` | `.tooling/pypy38/bin/pypy3.8` | anything else |
| `ruff` | `.tooling/venvs/tools/bin/ruff` | anything else |
| `vermin` | `.tooling/venvs/tools/bin/vermin` | anything else |
| `tools-pip` | `.tooling/venvs/tools/bin/python -m pip`, only after confirming `PIP_CONFIG_FILE=/dev/null` and `PIP_CACHE_DIR` are the redirected values | running without `env.sh`'s pip redirects in effect (the root cause of the pip-cache incident, §5) |
| `pw` | `main-app/node_modules/.bin/playwright` (installed in P4; fails cleanly with "not installed" until then) | anything else |
| `gh` | `/opt/homebrew/bin/gh` (system gh, the Manager's pre-existing login) | `auth login/logout/refresh/setup-git/switch/token`, `config set/clear-cache`, `extension`/`ext` install, `alias set/delete/import` |
| `git` | `/usr/bin/git` (system git, the Manager's pre-existing identity) | `config --global`/`--system`, `--no-verify` anywhere, force/delete pushes (`-f`, `--force`, `--force-with-lease`, `--force-if-includes`, `--mirror`, `--delete`/`-d`, `+ref`) |
| `impeccable` | `.claude/skills/impeccable/scripts/impeccable` | anything else; also refuses to run unless `IMPECCABLE_HOME` is the redirected path |
| `check-secrets` | (not a passthrough wrapper) — G-SECRETS scanner over `git ls-files --cached --others --exclude-standard` | — |
| `contain-snapshot` | (not a passthrough wrapper) — the G-CONTAIN proof tool, §3 | — |
| `guard-bash` | (not a passthrough wrapper) — the PreToolUse guard, §4 | — |
| `guard-test` | (not a passthrough wrapper) — runs `.tooling/guard-cases.tsv` through `guard-bash` and reports mismatches | — |

Every passthrough wrapper's refusal exits **126**. `wrap_exec`'s prefix check is
case-insensitive (the filesystem is case-insensitive) and resolves symlinks with
`/usr/bin/perl -MCwd=realpath`, so a symlink planted to point outside the prefix is caught, not
just a literal path outside it.

## 3. Activation: the four layers (plan §9.2)

Each Bash call is a fresh shell, and Homebrew's `node`/`npm` are already on `PATH`, so no single
layer is trusted alone:

1. **Wrappers** (`.tooling/bin/*`, above) — the primary, always-available path. `CLAUDE.md` and
   every worker prompt say: call tools only through `.tooling/bin/*` or `npm run …`.
2. **Script guard** — every npm script in `main-app/package.json` begins with
   `node scripts/assert-contained.mjs`, which fails unless the redirect env vars all resolve
   inside the workspace (added in P4).
3. **Hook guard** — `.claude/settings.json`'s `PreToolUse` hook runs `.tooling/bin/guard-bash`
   on every Bash tool call. It parses the command text (handling `;`, `&&`, `||`, `|`,
   subshells, `$( )`, backticks, `bash -c`/`sh -c`/`eval`, quoted heredoc bodies vs. unquoted
   ones, leading `VAR=x`, `sudo`/`env`/`time`/`nohup`/`timeout`/`xargs` prefixes) and blocks
   (exit 2) bare calls to project tools, `git config --global/--system`, `--no-verify`, force
   or delete pushes, and `gh auth login/logout/refresh/setup-git/switch/token`. As of the P3
   round-2 fix it additionally blocks: a command name built from a variable, `$( )` or backtick
   substitution in command position (`$BIN`, `"$X"`, `${BIN}`, `` `echo node` `` — anything not
   a literal name or a `.tooling/bin/*` path, since the guard cannot see what such a name
   resolves to); `sh`/`bash`/`zsh` invoked without `-c` (script file, stdin or pipe — `bash -n`,
   syntax-check only, is still allowed since it runs nothing); `source`/`.` of anything except
   `.tooling/env.sh` itself (which is meant to be sourced); and an `alias` whose right-hand side
   names a project tool by a bare/banned name (aliasing to a `.tooling/bin/*` path is fine and
   still passes). It is a static lexical filter, not a sandbox, and two gaps remain, found during
   the round-2 re-check and not yet fixed: `find -exec node {} \;` / `find -exec … +` (the
   executed command is an argument to `find`, not in ordinary command position) and
   `... | xargs -I{} {} -v` (the executed command comes from piped-in data, resolved by `xargs`
   at runtime, not from literal text in the command string) both still pass. Full battery and
   analysis: `work/03-setup/containment/guard-tests.md` and its "Re-check (round 2)" section in
   `work/03-setup/containment/audit.md`. Run the regression battery with `.tooling/bin/guard-test`
   (reads `.tooling/guard-cases.tsv`, 90 cases as of round 2); add a case there for every bypass
   or false positive found, in the form `block<TAB>command` or `pass<TAB>command`.
4. **Env block** — `.claude/settings.json`'s `env` object repeats the redirect variables from
   `env.sh` as literal absolute paths (everything except `PATH`, which the harness does not let
   settings override), so tools launched by the harness itself (not through a wrapper) still
   see the redirected cache/config locations.

`HOME` is never overridden (it would break Keychain/`gh`/`git` lookups). `TMPDIR` is never
redirected (Chromium's Unix-socket path-length limit). `GIT_CONFIG_GLOBAL` is never set — the
Manager's global git identity is used read-only.

## 4. Session restart (plan §9.3)

Settings `env`, hooks and project skills load once, at session start — except that, in practice
during P3, the `PreToolUse` hook itself turned out to be **hot-loaded mid-session**: sessions
already running picked up `guard-bash` edits (and the hook's own addition) without a restart,
confirmed independently by the auditor being blocked by it before any restart had happened. The
`env` block (§3 layer 4) does **not** hot-load the same way and still needs a session restart to
take effect for tools the harness launches directly (as opposed to through a `.tooling/bin/*`
wrapper, which always sources `env.sh` itself regardless of the harness's own env). So: assume
the hook is live and verify it directly; do not assume the `env` block is live without a
restart. Before relying on either, confirm in the current session:

```
.tooling/bin/node -v                                   # the workspace Node, not Homebrew's
echo '{"tool_name":"Bash","tool_input":{"command":"npm -v"}}' | .tooling/bin/guard-bash; echo $?   # expect 2
```

and confirm both skills load through the Skill tool, and the Impeccable hooks fire on an
Edit/Write.

## 5. Running the containment proof (G-CONTAIN, plan §9.4)

```
.tooling/bin/contain-snapshot before <label>   # touch a marker, stat-snapshot every watched path
# … do the install / first run being proved …
.tooling/bin/contain-snapshot after  <label>   # stat-snapshot again
.tooling/bin/contain-snapshot diff   <label>   # diff + backstop sweep of $HOME; prints a report; exits 1 on failure
```

Output goes to `.tooling/snapshots/<label>/` (gitignored) — `report.txt` is the human-readable
summary; `backstop-classified.txt` and `watched-classified.txt` show the verdict
(`allowed` / `allowed-collision` / `allowed-harness-npm-probe` / `HARD-FAIL` / `UNLISTED`) for
every changed path. `contain-snapshot classify <abs-path>` classifies one path on demand.
`.tooling/bin/check-secrets` (G-SECRETS) must also pass before any commit.

## 6. Allow-list policy (`.tooling/contain-allowlist.txt`)

Lines are `allow <glob>` or `collision <glob>`, matched with a shell `case` pattern against the
path relative to `$HOME`, where `*` also matches `/` (so a trailing `*` allows a whole subtree,
not just direct children — read every entry with that in mind). Only paths written by macOS
itself, by the Manager's own apps, or by the Claude Code harness belong here; nothing any of our
tools writes may ever be listed, and every project-tool-named path (`node`, `npm`, `playwright`,
`chromium`, `webkit`, `firefox`, `pypy`, `python`, `next`, `impeccable`, `biome`, `lighthouse`,
`cspell`, `vitest`, `vercel`, `ruff`, `vermin`, `avoid-ai-writing`, …) hard-fails the sweep
**before** the allow-list is even consulted, unless it is also listed under `collision` with a
named unrelated owner (e.g. Apple's own "Biome" activity store vs. the Biome linter). Add an
entry only for genuine, observed OS/app/harness churn, with a one-line reason, and prefer the
narrowest glob that still covers the churn (e.g. a specific `com.apple.*` cache bundle ID over a
bare `Library/Caches`, where practical). The list fails closed: an unobserved, speculative entry
is not added just because it seems plausible (`Keychains*` and `Developer*` subtree-wide globs
were removed in the P3 round-2 fix for exactly this reason — nothing had actually been observed
writing there beyond a couple of specific files). Where a whole subtree previously looked
necessary, prefer explicit file-level entries instead: `Library/Keychains` (dir mtime only) plus
`Library/Keychains/login.keychain-db` (securityd updates it on every app's Keychain access; `gh`
only reads its token) rather than `Library/Keychains*`; `Library/Containers/com.apple.*` and
`Library/Group?Containers/group.com.apple.*` (Apple's own sandboxed apps) rather than a bare
`Library/Containers*`; `Downloads` as a bare entry (dir mtime only, from browsers' temporary
download bookkeeping) rather than `Downloads*`, so that any actual new file placed there still
hard-fails or shows UNLISTED, which is exactly how the Manager's own manual download of
`resume.pdf` to `~/Desktop` was correctly surfaced (not allow-listed) and had to be reviewed by
hand — see `work/03-setup/containment/p3-final-verdict.md` and the "Re-check (round 2)" section
of `work/03-setup/containment/audit.md`.

## 7. Removal — tool by tool

Deleting the whole workspace (`rm -rf` the `et-ccc` directory) removes every one of these. The
steps below are for removing one tool without touching the rest.

- **Node.js:** `rm -rf .tooling/node .tooling/npm-cache .tooling/npm-global .tooling/corepack-home`. Nothing outside the workspace references it (no shell profile edits were made).
- **npm cache/config:** `rm -rf .tooling/npm-cache .tooling/npm-global`; `.tooling/npmrc` can stay (it is inert without `npm_config_userconfig` pointing at it, which only the `npm` wrapper sets).
- **PyPy 3.8:** `rm -rf .tooling/pypy38`.
- **Tools venv (ruff, vermin):** `rm -rf .tooling/venvs`.
- **Impeccable:** `rm -rf .tooling/impeccable-home .claude/skills/impeccable .impeccable`; then remove the Impeccable `PostToolUse` and `Stop` hook entries from `.claude/settings.json` (the two blocks whose command references `.claude/skills/impeccable/scripts/impeccable hook`).
- **avoid-ai-writing:** `rm -rf .tooling/avoid-ai-writing-src .claude/skills/avoid-ai-writing`.
- **The guard hook and settings env:** remove the `PreToolUse` block from `.claude/settings.json` and delete `.tooling/bin/guard-bash` and `.tooling/bin/guard-test`; remove the `env` object from `.claude/settings.json` if no wrapper is kept either (otherwise leave it — the wrappers still need `env.sh`, and `.claude/settings.json`'s `env` is a second copy of the same values for tools the harness launches directly).
- **Downloads (provenance tarballs):** `rm -rf .tooling/downloads` — safe at any time; nothing reads from it at runtime.
- **Snapshots:** `rm -rf .tooling/snapshots` — safe at any time; they are proof artifacts, not state.
- **Everything at once:** `rm -rf .tooling .impeccable .claude/skills` plus the hook/env blocks in `.claude/settings.json`, or simply delete the workspace.

There is no `.git/info/exclude` block for Impeccable or anything else in this project — worktree
excludes were not used; everything ignore-related lives in the tracked `.gitignore`.

## 8. What deleting the workspace does and does not remove

Deleting the workspace removes **all local state**: every path listed above, `.git/`, and the
git history that only exists locally. It does **not** remove:

- **The GitHub repository** — it lives in the Manager's GitHub account (`et-ccc`, private,
  created by `gh repo create` in P3) and is removed there, by the Manager, if ever wanted.
- **The Vercel project** (from P4 on) — lives in the Manager's personal Hobby account.

## 9. Traces outside the workspace (acknowledged, plan §9.7, and the pip-cache incident)

The following are owned by the system, the harness, or the Manager, not installed by us, and are
openly acknowledged rather than treated as containment failures:

- LaunchServices/Gatekeeper records for the Playwright browser bundles (macOS records that a
  binary was run; it does not retain the binary's data).
- `TMPDIR` leftovers, purged by the OS on its own schedule (`TMPDIR` is deliberately not
  redirected — see §3).
- The Claude Code harness's own session files under `~/.claude/` (transcripts, session state,
  the synced-skills manifest under `~/.agents/skills/synced`, etc.) — all covered by explicit
  `allow` entries in `contain-allowlist.txt`.
- The Manager's **pre-existing** `gh` login (`~/.config/gh/hosts.yml`/`config.yml`, the macOS
  Keychain entry) and global git config/identity — read only, never written, per §10.2 of the
  plan.

**The pip-cache incident (2026-09-23 22:33):** the tools venv's `pip` was run once directly,
without `env.sh` sourced, and wrote 6 files and 20 directories into the Manager's pre-existing
`~/Library/Caches/pip` (instead of `.tooling/xdg/cache/pip`), and replaced one pre-existing
cache entry under `~/Library/Caches/pip/http/a/1/9/5/3` via an atomic rename. The orchestrator
removed exactly the 26 entries born after the phase marker and reset the `http` and `selfcheck`
directory mtimes to their pre-incident values; the one replaced HTTP cache entry could not be
restored byte-for-byte (pip will refetch it on demand — it is a cache, not state), so its parent
directory's mtime was reset to that entry's own birth time instead. Full detail:
`work/03-setup/containment/pip-cache-cleanup.txt`. This auditor independently re-verified the
cleanup: every one of the 26 listed paths is confirmed absent, and the `before` and `after`
snapshots of both `~/Library/Caches/pip/http` and `~/Library/Caches/pip/selfcheck` are
byte-identical (see `work/03-setup/containment/audit.md`, Task A). Root cause and fix: **always**
use `.tooling/bin/tools-pip`, which sources `env.sh` and additionally refuses to run unless
`PIP_CONFIG_FILE=/dev/null` and `PIP_CACHE_DIR` already point into `.tooling/`; `guard-bash`
blocks any bare `pip`/`python3`/`pypy` invocation as a second layer.
