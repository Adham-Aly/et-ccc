# guard-bash test battery (containment auditor, Task C)

Method: piped hook JSON (`{"tool_name":"Bash","tool_input":{"command":"…"}}`) into
`.tooling/bin/guard-bash` directly. Exit 2 = blocked (expected `block`), exit 0 = allowed
(expected `pass`). No blocked command was ever executed for real; only its JSON text was fed
to the guard script (read-only). `.tooling/bin/pypy38 -c "import json,..."` was used to build
the JSON payloads safely (via `.tooling/bin/*`, never a bare tool).

Note on timing: the task brief says "the hook is not live until the session restarts", but in
this auditor's own session the `PreToolUse` hook for Bash **was already live** — a compound
command containing `gh auth login` etc. was blocked by the harness itself before reaching a
shell. This is recorded as an observation under Task A/finding A-2, not a defect.

Note on the rewrite: `.tooling/bin/guard-bash` was rewritten by setup-orchestrator at ~22:47
(lexer fix for quoted heredoc bodies). All results below are against the **rewritten** version.
setup-orchestrator also added `.tooling/bin/guard-test` + `.tooling/guard-cases.tsv` (75 cases,
regression harness). That harness was run first:

```
$ .tooling/bin/guard-test
guard-test: 75 ok, 0 mismatches
```

All 75 existing regression cases pass. The auditor treats that suite as a baseline and adds the
cases below, which were **not** in `guard-cases.tsv`.

## Supplemental battery (auditor-authored)

| # | Expected | Command | Got | Result |
|---|---|---|---|---|
| 1 | block | `diff <(node -v) <(echo x)` (process substitution) | block | OK |
| 2 | block | `NPM -v` (uppercase command) | block | OK |
| 3 | block | `no''de -v` (empty single-quotes splitting the word) | block | OK |
| 4 | block | `node -v # git push --force is fine to mention here` (comment stripping) | block | OK |
| 5 | block | `{ node -v; }` (brace grouping) | block | OK |
| 6 | block | `node -v &` (background operator) | block | OK |
| 7 | pass | `.tooling/bin/git config --glob user.name x` (abbreviated `--global`; git does not accept this abbreviation in practice) | pass | OK |
| 8 | block | `X=$(node -v); echo $X` (command substitution assigned to a var) | block | OK |
| 9 | block | `f(){ node -v; }; f` (shell function wrapping a banned command) | block | OK |
| 10 | block | `BIN=/opt/homebrew/bin/node; $BIN -v` (**variable holds the banned command, then invoked unquoted**) | **pass** | **MISMATCH — bypass** |
| 11 | block | `BIN=node; "$BIN" -v` (same, quoted) | **pass** | **MISMATCH — bypass** |
| 12 | block | `printf "npm -v" | sh` (script text as `sh`'s stdin, not a `-c` argument) | **pass** | **MISMATCH — bypass** |
| 13 | block | `cat script.sh | bash` (arbitrary file content piped into bash) | **pass** | **MISMATCH — bypass (opaque-content class)** |
| 14 | block | `bash < script.sh` (same, via redirection) | **pass** | **MISMATCH — bypass (opaque-content class)** |
| 15 | block | `. ./script.sh` (dot-source) | **pass** | **MISMATCH — bypass (opaque-content class)** |
| 16 | block | `source ./script.sh` | **pass** | **MISMATCH — bypass (opaque-content class)** |
| 17 | block | `alias n2=node; n2 -v` (shell alias indirection) | **pass** | **MISMATCH — bypass, but non-interactive shells do not expand aliases by default, so this is lower practical risk; not exploited live** |
| 18 | block | `CMD=node; exec "$CMD" -v` | **pass** | **MISMATCH — bypass, same class as #10/#11** |
| 19 | block | `F=/opt/homebrew/bin/node; "$F" --version` | **pass** | **MISMATCH — bypass, same class as #10/#11** |

## Analysis and findings

**Class 1 — variable-indirection bypass (cases 10, 11, 18, 19). Severity: blocking.**
`guard-bash` inspects only literal command-position words. When the command word is a shell
variable reference (`$BIN`, `"$CMD"`, `"$F"`) rather than a literal tool name, the lexer stores
the literal text `$BIN` (etc.) as the command word; `banned_name('$BIN')` does not match any
banned pattern, so the segment passes. At actual shell execution time the variable expands to
the real binary path and runs it completely unwrapped — no `env.sh`, no containment redirects,
no `wrap_exec` binary-resolution check. This defeats the guard for any command line that
assigns a banned binary's name or path to a variable and invokes it through that variable on
the same or a later line within one Bash call. It requires no special privilege and is a single
extra line ordinary authoring work might plausibly produce by accident (e.g. copy-pasting a
snippet that resolves a binary path into a variable first).
*Suggested fix:* track simple `VAR=value` assignments seen earlier in the same `check_cmdline`
call whose value's basename matches a banned name or a known absolute path to one (e.g.
`/opt/homebrew/bin/*`, `$ET_T/node/bin/node`, `$ET_T/venvs/tools/bin/*`), and flag a later bare
`$VAR` / `"$VAR"` in command position that references it. This will not catch every case (a
variable set in a *previous* Bash call, or via `export` from a parent shell, is invisible to a
per-call hook by construction) but it closes the common, easily-produced form. Document the
residual gap in `.tooling/README.md`.

**Class 2 — opaque-content bypass (cases 12–16). Severity: blocking, but only partially fixable.**
`sh`/`bash` reading a script from stdin (`printf … | sh`, `bash < file`) or from a sourced file
(`. file`, `source file`) is invisible to a hook that only sees the literal `tool_input.command`
string — the actual commands live in data the hook never receives. This is a structural limit
of a static, single-string lexical guard, not a fixable parsing bug. Two partial mitigations
are practical and cheap: (a) block bare `sh`/`bash`/`zsh` invoked **without** a `-c` argument
(our own wrappers never need this form; `pw`, `node`, etc. are all invoked directly, never
piped into a shell), which would catch cases 12–14 without breaking any legitimate use in this
project; (b) flag `.`/`source` on any path outside `.tooling/bin/` and `main-app/scripts/` as a
warning worth a second look, though this is a blunter instrument since sourcing project shell
libraries (e.g. `env.sh` itself, which is meant to be sourced) is normal and desired. Recommend
(a) as a guard change; recommend that `.tooling/README.md` and worker prompts state plainly
that the guard cannot see inside piped/sourced file content, so this remains a matter of agent
discipline, not just tooling, same as any other static analyzer's blind spot.

**Class 3 — shell alias indirection (case 17). Severity: minor / informational.**
Defining an alias and invoking it in the same command line is a textual bypass in principle
(`alias n2=node; n2 -v` passes the guard). It was **not exploited for real** — only the JSON
text was fed to `guard-bash`, per the task's "never run a blocked command for real" rule — so
whether it is exploitable in practice depends on whether the harness's non-interactive Bash
invocation expands aliases (`shopt -s expand_aliases`/zsh's alias-expansion mode). The system
prompt for this session notes `find` is already aliased to `bfs`, which shows *some* aliasing is
active in this shell, so the risk is not zero. Recommended, low-cost mitigations: (a) have
`guard-bash` flag any `alias` definition whose right-hand side's basename matches a banned name
(catches the definition, regardless of whether the later invocation is itself caught); (b) note
the residual risk in `.tooling/README.md`.

## What did *not* bypass (checked and confirmed safe)

- Bare calls after `;`, `&&`, `||`, `|`, in `(...)`, `$(...)`, backticks, inside `bash -c`/`sh -c`/
  `eval`, after `sudo`/`env`/`time`/`nohup`/`timeout`/`xargs`, after leading `VAR=x` assignments,
  via absolute paths (`/opt/homebrew/bin/node`, `.tooling/node/bin/node`,
  `.tooling/venvs/tools/bin/python`) — all correctly blocked (75/75 in `guard-cases.tsv`).
- Versioned names `python3.12`, `pip3.11`, `pypy3.8` — blocked.
- `git config --global/--system` (including `git -C . config --system ...`), `--no-verify`,
  force/delete pushes in every listed form, `gh auth login/logout/refresh/setup-git/switch/token`,
  `gh config set`, `gh extension install` — all blocked, including through the `.tooling/bin/`
  wrapper paths themselves (defense in depth: the wrapper *and* the guard both refuse).
- False positives checked: heredoc bodies (quoted and unquoted, including one mentioning
  `npm -g`, `git config --global` and `gh auth login` in prose), quoted arguments, grep
  patterns over source mentioning tool names, commit messages mentioning tool names, `which
  node`, `type -a git`, wrapper calls by absolute and relative path,
  `cd main-app && ../.tooling/bin/npm run build` — none blocked.
- Non-Bash tool payload (`{"tool_name":"Read",...}`) and malformed JSON (`garbage`) both exit 0
  (allowed) as required.

## Recommended additions to `.tooling/guard-cases.tsv`

```
block	BIN=/opt/homebrew/bin/node; $BIN -v
block	BIN=node; "$BIN" -v
block	CMD=node; exec "$CMD" -v
block	printf "npm -v" | sh
block	bash < script.sh
block	. ./script.sh
block	source ./script.sh
block	alias n2=node; n2 -v
```
(Left as `block` — the expected/target behavior after a fix, not the current behavior. All are
currently `pass`, i.e. currently mismatching against this target list. Do not merge into
`guard-cases.tsv` until `guard-bash` is changed to actually block them, or `guard-test` will
fail immediately.)
