# P3 containment audit (containment-auditor)

## Verdict

**Round 1: PASS WITH FINDINGS. Round 2 (final, see "Re-check (round 2)" below): PASS.**

Round 1 summary (superseded by round 2, kept for the record): no data left the workspace, the
pip-cache incident was fully and verifiably cleaned up, and the tool's own `contain-snapshot diff`
reported PASS, but `guard-bash` had real, reproducible bypasses (variable indirection; opaque
piped/sourced content) and the npm wrapper's global-install block could be bypassed via
`npm_config_*` environment variables (contained by the prefix redirect, but the intended rule
was still defeated). All round-1 findings were fixed by setup-orchestrator and independently
re-verified in round 2, below, without ever letting a real install run during re-verification.
Two new, narrower gaps (`find -exec`, `xargs -I{}`) were found while re-probing the fixed guard;
see the round-2 section for why they do not block sign-off.

## Findings

| ID | Severity | Finding | Evidence | Suggested fix |
|---|---|---|---|---|
| A-1 | minor | `contain-allowlist.txt` globs with a trailing `*` match the whole subtree (by design: `*` matches `/`), so entries like `allow Library/Keychains*` and `allow Library/Developer*` exempt **everything ever written under those trees**, not just today's observed churn. Nothing in our toolchain writes to the Keychain or to Xcode's `Library/Developer`, so this is currently safe, but it is broader than the reason line states ("macOS keychain (gh token is READ from it only)" reads as if only reads are expected, yet the glob would also hide a write). | `.tooling/contain-allowlist.txt`, "macOS system churn" section | Narrow to the specific files/prefixes actually observed (e.g. `Library/Keychains/login.keychain-db*`) where practical, or add a comment making explicit that the glob is deliberately subtree-wide and why that is still safe. |
| A-2 | informational | The task brief states "the hook is not live until the session restart", but in this auditor's own session `.claude/settings.json`'s `PreToolUse` hook for Bash **was already live** — a compound command containing `gh auth login` was blocked by the harness itself. | Direct observation during Task B/C testing (see `work/03-setup/containment/guard-tests.md`) | Update the plan's/CLAUDE.md's assumption, or note explicitly that hot-loading is harness-version-dependent and must be verified per session, not assumed either way. |
| B-1 | minor | `.tooling/bin/npm`'s global-install/`exec` guard inspects only `argv`. Setting `npm_config_global=true` or `npm_config_location=global` as an **environment variable** before calling `.tooling/bin/npm install <pkg>` bypasses the wrapper's own `-g`/`--global` detection entirely and performs a real (arbitrary-package) install that the wrapper was supposed to refuse. Verified live: `npm_config_location=global .tooling/bin/npm install foo` installed `foo` from the public npm registry into `.tooling/npm-global/lib/node_modules/foo` without any block. **Containment itself held** — `npm_config_prefix` is redirected into `.tooling/`, so the install landed inside the workspace and was removed immediately after the test — but the "no remote package fetch without going through `npm exec --no --`" and "no global operations" policies were both defeated in intent. | Live reproduction (test artifact removed afterward); wrapper source `.tooling/bin/npm` | Have the wrapper explicitly unset/clear `npm_config_global`, `npm_config_location`, and any other env var whose value could override the CLI-flag checks, before the argv scan, or check `${npm_config_global:-}`/`${npm_config_location:-}` in addition to argv. |
| C-1 | blocking | `guard-bash` can be bypassed by assigning a banned binary's path/name to a shell variable and invoking it through that variable in the same command line: `BIN=/opt/homebrew/bin/node; $BIN -v` and `BIN=node; "$BIN" -v` both return **pass** (should block). The guard only recognizes literal command-position text; a variable reference is opaque to it, while the shell itself resolves it normally at execution time — fully unwrapped, no redirects, no `wrap_exec` prefix check. | `work/03-setup/containment/guard-tests.md` §"Class 1", reproduced by piping JSON to `.tooling/bin/guard-bash` (read-only; the underlying command was never executed) | Track `VAR=value` assignments in the same `check_cmdline` call and flag a later bare `$VAR`/`"$VAR"` in command position when `value`'s basename matches a banned name or a known tool path. Document the residual gap (a variable set in a prior Bash call, or exported from a parent shell, cannot be seen by a per-call hook). |
| C-2 | blocking | `guard-bash` cannot see inside a script piped into `sh`/`bash` (`printf "npm -v" | sh`), redirected in (`bash < script.sh`), or sourced (`. ./script.sh`, `source ./script.sh`) — all four return **pass**. This is a structural limit of a single-string lexical filter, not a fixable parsing bug, but it is a real, practical gap. | `work/03-setup/containment/guard-tests.md` §"Class 2" | Block bare `sh`/`bash`/`zsh` invoked **without** a `-c` argument (this project's legitimate uses are all `-c` forms or direct wrapper calls, so this would not break any known workflow); state plainly in `.tooling/README.md` (done, §3) that sourced/piped file content is outside the guard's reach and remains a matter of agent discipline. |
| C-3 | minor | `alias n2=node; n2 -v` passes the guard (textual alias indirection). Not exploited live (per the task's "never run a blocked command for real" rule, and because non-interactive shells do not expand aliases by default, so real-world exploitability is uncertain in this harness). | `work/03-setup/containment/guard-tests.md` §"Class 3" | Flag `alias` definitions whose right-hand side's basename matches a banned name. Low priority given the uncertain exploitability, but cheap to add. |
| D | none | No findings — see Task D below. | | |

No finding required treating the phase's actual output as unsafe: the pip-cache incident is
fully verified cleaned up (Task A), `contain-snapshot diff` reports PASS with zero HARD-FAIL and
zero UNLISTED paths, and G-SECRETS correctly catches a planted fake token and would never even
see a planted `.env` (the `.gitignore`'s `.env*` rule excludes it before `check-secrets` looks).

---

## Task A — after-snapshot, diff, backstop, allow-list review

- `.tooling/bin/contain-snapshot after p3-setup` then `... diff p3-setup` were run. Result:
  `RESULT: PASS` — 915 paths newer than the marker in the `$HOME` backstop sweep, all 915
  classified `allowed`/`allowed-collision`/`allowed-harness-npm-probe`; **zero HARD-FAIL, zero
  UNLISTED**. Full report copied to `work/03-setup/containment/p3-after-diff-report.txt`.
- Watched-locations section: all entries `OK` except four `CHURN` (`.agents`, `.config`,
  `.local`, `.npm` dir mtimes) — inspected `watched-classified.txt` line by line; every changed
  path under those four is either the harness's synced-skills manifest, the Manager's own
  `herdr` session-manager files, or the harness's documented `npm --global config get prefix`
  probe log (matched by the `harness_npm_probe` content check, not just by path). None is a
  project-tool write.
- **Independent, tool-free spot checks** of the specific paths the task brief lists (`~/.impeccable`,
  `~/.npmrc`, `~/.node_repl_history`, `~/.cache/pip`, `~/Library/Caches/pip`,
  `~/Library/Caches/com.apple.python`, `~/.local/share/pypy*`, `~/.config/gh`, `~/.cache/gh`,
  `~/.local/state/gh`, `~/.gitconfig`, `~/.claude/skills`, `~/.claude/plugins`,
  `~/.claude/settings.json`, `~/.agents` other than `skills/synced`, `/opt/homebrew/lib/node_modules`,
  shell profiles): `~/.impeccable` and `~/.npmrc` do not exist; `~/.node_repl_history` is an
  empty 0-byte file dated May 19 (untouched, pre-existing); `~/.cache/pip` does not exist;
  `~/Library/Caches/com.apple.python` last touched Sep 8 (pre-P3); no `~/.local/share/pypy*`;
  `~/.config/gh`, `~/.cache/gh`, `~/.local/state/gh` all last touched before the P3 marker (June/
  August); `~/.gitconfig` last touched July 11 (pre-P3); `~/.claude/skills` is a pre-existing
  symlink to `~/.agents/skills` (Aug 28); `~/.claude/plugins` and `~/.claude/settings.json`
  (Sep 23 22:20:31, before the 22:28:21 marker) unchanged; `~/.agents` itself (excluding
  `skills/synced`, which is explicitly acknowledged harness churn) shows only pre-marker file
  mtimes; `/opt/homebrew/lib/node_modules` contains only Homebrew's own `npm`/`typescript`,
  untouched; shell profiles (`.zshrc`, `.zprofile`, `.zshenv`, `.profile`) all pre-date the
  marker; no `.bashrc`/`.bash_profile` exist. **All confirmed clean.**
- **Pip-cache incident, independently re-verified** (not just re-reading the orchestrator's own
  note): all 26 paths listed in `pip-cache-cleanup.txt` (6 files, 20 directories) confirmed
  absent from `~/Library/Caches/pip`. The `before` and `after` snapshot files for both
  `~/Library/Caches/pip/http` and `~/Library/Caches/pip/selfcheck` (`diff` of the stat listings)
  are **byte-identical** — the cleanup restored the tree exactly, including the reset mtime on
  `http/a/1/9/5/3` (confirmed at `2026-09-08 10:05:48`, matching the claimed birth-time reset).
  Current contents of `~/Library/Caches/pip` show only `http-v2/*` (pip's newer cache format,
  pre-existing) and the untouched `http/a/1/9/5/3` leaf plus `selfcheck/*`.
- **Allow-list critical review:** see finding A-1 (subtree-wide trailing-`*` globs on
  Keychains/Developer paths). Checked for glob edge cases in `contain-snapshot classify()`:
  `case` matching is used consistently (so `?` does match a literal space, as documented, e.g.
  `Library/Application?Support`), the tool-name hard-fail regex runs **before** the allow-list
  check (so a `collision` entry is required, not just an `allow`, to exempt a tool-named path —
  confirmed by reading `classify()`), and `ROOT`/paths are lower-cased for the case-insensitive
  workspace prune (`-ipath "$ROOT"`) as well as for `TOK` matching. No bug found in the
  classifier's glob handling itself.

## Task B — wrapper tests

All of `node`, `npm`, `pypy38`, `ruff`, `vermin`, `tools-pip`, `gh`, `git`, `impeccable`,
`contain-snapshot`, `check-secrets` were exercised directly:

- `node -v` / `-p process.execPath` → `v24.21.0`, workspace path. `-p process.env.npm_config_cache`
  → `.tooling/npm-cache`. Correct.
- `npm -v` → `11.19.0`. `-g`, `--global`, `install -g foo`, `exec foo` (no `--no`), `exec --yes foo`
  all refused, exit 126, with the correct message. `exec --no -- true` correctly reached npm
  (failed only because `main-app` has no `node_modules` yet — expected pre-P4).
  **See finding B-1**: `npm_config_global`/`npm_config_location` env-var bypass, contained but real.
- `pypy38 --version` → `Python 3.8.16 … PyPy 7.3.11`. `-c "import os;print(os.environ['PIP_CONFIG_FILE'])"`
  → `/dev/null`, confirming the redirect is visible inside the child.
- `ruff --version` → `0.16.8`; `vermin --version` → `1.8.0`; `tools-pip --version` → pip 22.0.4
  from the tools venv.
- `gh --version` → `2.92.0`; `gh auth status --hostname github.com` shows logged in as
  `Adham-Aly`; `gh api user --jq .login` → `Adham-Aly`. All read-only, harmless.
- `git --version` → `2.50.1`; `git status --short --ignored` works normally.
- Blocked forms (`gh auth login/logout/refresh/setup-git/token`, `gh config set`,
  `git config --global/--system`, `git commit --no-verify`, `git push --force/-f/--delete`) were
  all intercepted by the **harness's own PreToolUse hook** before reaching the wrapper (see
  finding A-2) — the wrapper's own internal refusal logic for these same forms was verified by
  source-code inspection instead (`.tooling/bin/gh`, `.tooling/bin/git`), and matches the guard's
  intent exactly (same subcommand checks, same exit-126 convention).
- `pw --version` fails cleanly: `[et-ccc wrapper] playwright is not installed at
  .../main-app/node_modules/.bin/playwright (see .tooling/README.md)`, exit 126 — expected, since
  Playwright arrives in P4.
- No case-sensitivity, `-g=true`, `--location global` (two-word form; npm does not parse it that
  way, so not applicable), or path-traversal bypass found in any wrapper's own argv-scanning
  logic by source review, beyond the env-var gap already noted in B-1.

## Task C — guard-bash battery

Full battery, results and analysis: `work/03-setup/containment/guard-tests.md`. Summary: the
setup-orchestrator's own 75-case regression suite (`.tooling/bin/guard-test`) passes 75/75. This
auditor's 19 supplemental adversarial cases found three bypass classes (C-1 variable
indirection, C-2 opaque piped/sourced content, C-3 shell aliasing) and confirmed no false
positives beyond what the existing suite already checks (heredocs, quoted args, grep patterns,
commit messages, `which`/`type`, relative wrapper paths from a subdirectory). Non-Bash tool
payloads and malformed JSON both correctly exit 0.

## Task D — `.gitignore` and G-SECRETS

- `.gitignore` matches plan §10.3 exactly (`.tooling/*` with the four/five documented
  exceptions — `env.sh`, `bin/`, `README.md`, `contain-allowlist.txt`, plus the CLAUDE.md-approved
  additions `npmrc`, `requirements-tools.txt`, and `guard-cases.tsv`, the last added by
  setup-orchestrator mid-phase for the new regression suite), plus the standard build/output,
  scratch, secrets and OS sections, plus Impeccable local/cache files
  (`.impeccable/config.local.json`, `.impeccable/hook.cache.json`, `.impeccable/hook.pending.json`)
  and `.claude/settings.local.json`.
- `git check-ignore -v` confirms every large/binary/generated directory is ignored:
  `.tooling/node`, `.tooling/pypy38`, `.tooling/venvs`, `.tooling/downloads`,
  `.tooling/impeccable-home`, `.tooling/avoid-ai-writing-src`, `.tooling/snapshots`,
  `.tooling/xdg`, `.tooling/npm-cache`, `.tooling/npm-global`, `.tooling/corepack-home`, and
  `work/03-setup/_scratch/` — all via the expected `.gitignore` rule.
- `git status --short --ignored` at audit time shows the expected mid-phase state: modified
  tracked files (`.gitignore`, `contain-snapshot`, `contain-allowlist.txt`, `env.sh`, and several
  `context/*.md` files — all part of this phase's in-progress work, not this audit's concern),
  and several correctly-untracked-but-not-ignored new files (`.claude/`, `.impeccable/`,
  `CLAUDE.md`, the new `guard-bash`/`guard-test`/`impeccable`/`tools-pip` wrappers,
  `guard-cases.tsv`, `requirements-tools.txt`, `work/`) awaiting `git add -A` at commit time.
  Nothing unexpected or secret-shaped appears in the untracked list.
- **`check-secrets` proof:** baseline run PASS (122 files). Planted
  `work/03-setup/zz-secret-test/fake-token.txt` containing `ghp_` + 36 `A`s, and
  `work/03-setup/zz-secret-test/.env` containing fake `SECRET=`/`DATABASE_URL=` lines (a
  non-ignored path, per the task's instruction, since `_scratch/` is itself gitignored).
  Re-ran `check-secrets`: **FAIL**, correctly flagging
  `work/03-setup/zz-secret-test/fake-token.txt:1:ghp_***REDACTED***` (redaction confirmed — the
  real token text never appears in the tool's own output). The `.env` file was separately
  confirmed excluded from `git ls-files --cached --others --exclude-standard` by the blanket
  `.env*` gitignore rule (`git check-ignore -v` → matched `.gitignore:26:.env*`), i.e. it could
  never reach `git add -A` in the first place — a second layer of defense working as intended,
  ahead of `check-secrets` even needing to look at file contents. Deleted both planted files;
  `check-secrets` returned to **PASS** (122 files, same count as baseline).

## Re-check (round 2)

Re-checked every round-1 finding against setup-orchestrator's fixes. Method for B-1 was
corrected per the orchestrator's instruction: verified only by confirming the wrapper refuses
with exit 126, and by confirming afterward that `.tooling/npm-global` gained nothing — no real
install was ever allowed to run this time.

- **C-1 (variable indirection) — fixed.** `${BIN} -v`, `exec $X`, `env $X`, `BIN=node; exec
  "$BIN" -v`, `X="node"; $X -v`, `a=node b=$a; $b -v`, `$(echo node) -v`, `` `echo node` -v ``
  all now **block**. Confirmed by piping JSON to `guard-bash` directly (no command executed).
- **C-2 (opaque piped/sourced content) — fixed, with two residual gaps found.**
  `bash -n; npm -v` blocks (correctly — `bash -n` itself is allowed since it runs nothing, but
  the guard still checks the rest of the command line); `source .tooling/bin/npm` and
  `. .tooling/bin/git status` block; `. .tooling/env.sh` and `source .tooling/env.sh` correctly
  still pass (the one sourcing that's meant to happen). **New gaps found, not yet fixed:**
  `find . -exec node {} \;`, `find . -exec node {} +`, and `find . -execdir node {} \;` all
  **pass** when they should block — `find -exec` runs an arbitrary command from an argument,
  not from ordinary command position, so it falls outside every check in `check_segment`.
  `printf "%s" node | xargs -I{} {} -v` also **passes** — same class as the sh/bash-without-`-c`
  gap the fix already closed, but for `xargs -I{}`, where the executed command is the
  placeholder `{}` itself, filled in from piped data at runtime, not literal text in the command
  string. (The already-fixed case `ls | xargs -I{} node {}`, where "node" appears literally in
  the xargs template, still correctly blocks — this is specifically about `{}` used *as* the
  command.)
- **C-3 (alias indirection) — fixed.** `unalias -a; node -v`, `declare -f node; node -v`,
  `type node && node -v`, `x() { command node "$@"; }; x -v`, `read -r x <<< "node"; $x -v` all
  block (several of these are new variants beyond the original alias case, added to probe
  whether the fix generalized — it does, via the same dynamic-command-name check). Confirmed
  `alias mynode=".tooling/bin/node"; mynode -v` correctly still **passes**: aliasing to the
  correct wrapper path is legitimate, not a bypass, and the fix's `is_wrapper_path` check on the
  alias target handles this correctly.
- `.tooling/bin/guard-test` → **90/90**, matching the orchestrator's report. The auditor's 8
  round-1 cases plus the 7 the orchestrator added are all present in `guard-cases.tsv` and pass.
- **B-1 (npm env-var bypass) — fixed.** Re-verified **without ever letting an install run**, per
  the corrected instruction: `npm_config_global=true|1|yes`, `NPM_CONFIG_GLOBAL=true`
  (case-insensitive), `npm_config_location=global`, `--location=global`, and `--location global`
  (two words) were each tried against `.tooling/bin/npm --version` or `.tooling/bin/npm ls` —
  every one refused with **exit 126** and the message `npm_config_global / npm_config_location=global
  are forbidden` (or the existing `global npm operations are forbidden` message for the `--location`
  flag forms). `.tooling/npm-global/lib/node_modules` was confirmed empty afterward — nothing
  installed.
- **A-1 (allow-list scope) — fixed.** `Keychains*` and `Developer*` subtree-wide entries are
  gone (confirmed absent from `.tooling/contain-allowlist.txt`; a comment at line 15 records
  their removal — "unobserved speculative entries such as Keychains and Xcode were removed").
  In their place: `Library/Keychains` (bare, dir mtime only) plus the single file
  `Library/Keychains/login.keychain-db`; `Library/Containers/com.apple.*` and
  `Library/Group?Containers/group.com.apple.*` (narrowed from a bare `Containers*`); the Photos
  analysis daemons remain narrow single-bundle-ID entries as before; `Downloads` is now a bare
  entry (dir mtime only, no subtree). All confirmed by direct inspection of
  `.tooling/contain-allowlist.txt`.
- **Final proof reviewed and independently reproduced.**
  `work/03-setup/containment/p3-final-verdict.md` reports 2 UNLISTED paths
  (`~/Desktop` and `~/Desktop/resume.pdf`) and reasons them as the Manager's own manual download
  (Brave quarantine xattr, `kMDItemWhereFroms` = overleaf.com, creator "LaTeX with hyperref"),
  correctly left un-allow-listed rather than papered over. The auditor independently re-ran
  `.tooling/bin/contain-snapshot after p3-setup && .tooling/bin/contain-snapshot diff p3-setup`
  from scratch and got the **same result**: 2187 paths newer than the marker, 2185 allowed, 0
  HARD-FAIL, exactly 2 UNLISTED (`/Users/adham/Desktop` and
  `/Users/adham/Desktop/resume.pdf`), and independently confirmed the file's extended attributes
  match the verdict document's claims (`xattr -l` and `mdls` run directly against
  `~/Desktop/resume.pdf`). The reasoning is sound: this is manual Manager activity unrelated to
  any project tool, correctly surfaced rather than hidden, and the raw tool's FAIL (from the 2
  UNLISTED lines) is properly overridden by human review in the final verdict document, not by
  weakening the allow-list.

### Round-2 verdict

**PASS.** Every round-1 blocking and minor finding (C-1, C-2's fixed portion, C-3, B-1, A-1) is
confirmed fixed by independent re-test, with no install ever allowed to run during
re-verification. Two new minor gaps were found while trying to break the fixed guard again
(`find -exec`/`find -execdir`, and `xargs -I{}` used as the executed command) — both are
narrower and less commonly triggered than the round-1 findings, are documented in
`.tooling/README.md` and below, and do not block sign-off: recommend adding them to
`.tooling/guard-cases.tsv` as target `block` cases (currently `pass`) and fixing in a follow-up
if time allows before P4, otherwise carrying them forward as an acknowledged, documented
residual gap. The pip-cache incident remains independently verified clean, and the final
containment proof (`p3-final-verdict.md`) was independently reproduced and its reasoning about
the one open item (`resume.pdf`) checked and confirmed correct.

New cases to add to `.tooling/guard-cases.tsv` (target `block`, currently `pass` — do not merge
until `guard-bash` is changed, or `guard-test` will fail):

```
block	find . -exec node {} \;
block	find . -exec node {} +
block	find . -execdir node {} \;
block	printf "%s" node | xargs -I{} {} -v
```

## Task E — `.tooling/README.md`

Written: `.tooling/README.md`. Covers the entry table (path, contents, version, installer,
consumer, tracked/ignored), the wrapper table (resolves-to, refuses), the four activation
layers plus the session-restart caveat (including the A-2 observation), how to run the G-CONTAIN
proof, the allow-list glob policy (including the `*`-matches-`/` caveat), removal steps tool by
tool (Node; npm cache/prefix; PyPy; tools venv; Impeccable skill + engine + `.impeccable/` +
hooks in `.claude/settings.json`; avoid-ai-writing skill + src; the guard hook + settings env;
downloads; snapshots), "delete the workspace removes everything local; the GitHub/Vercel
projects live in the Manager's accounts", and the acknowledged outside-workspace traces
(§9.7 list plus the pip-cache incident, independently re-verified above).

## Orchestrator follow-up (after round 2)

Both round-2 gaps are fixed in `guard-bash`: commands inside `find -exec/-execdir/-ok/-okdir` are checked, and a `{}` placeholder in command position is blocked. The 6 cases were added to `.tooling/guard-cases.tsv`; `guard-test` passes 96/96. No open findings.
