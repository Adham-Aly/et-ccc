# Phase 3: Setup — tooling, containment and repo (phase log)

Orchestrator: `setup-orchestrator` (Opus). Started 2026-09-23 22:22. Branch `main` (plan §12.0). Work dir `work/03-setup/`.

## Summary

- The private GitHub repo **https://github.com/Adham-Aly/et-ccc** exists (PRIVATE, default `main`). It was created with the Manager's existing `gh` login and git identity, and neither was changed.
- Everything installed lives in `.tooling/` or `.claude/skills/`: Node **v24.21.0** (the same major Vercel builds with, SPIKE S-1), PyPy **3.8 v7.3.11** arm64, a tools venv with **ruff 0.16.8** and **vermin 1.8.0**, **Impeccable skill-v4.3.1** (engine 0.1.5 in `.tooling/impeccable-home`) and **avoid-ai-writing v3.35.0 @ fc979c6**. Every download was checksum-verified or pinned by commit SHA.
- Activation has four layers: wrappers in `.tooling/bin/`, the env redirects in `.tooling/env.sh` (mirrored in `.claude/settings.json`), a PreToolUse Bash guard (`guard-bash`, with a 96-case regression battery), and root `CLAUDE.md`.
- Containment proof (G-CONTAIN): **PASS**. No project tool wrote outside the workspace. One incident was found and remediated early on (pip once wrote to the Manager's `~/Library/Caches/pip`, D-039). The only lasting trace is one stale pip HTTP cache entry that is now gone.
- An independent Sonnet auditor found 2 blocking and 4 minor issues, all in the safety rails (guard bypasses, an npm env-var loophole, broad allow-list globs). All are fixed and re-checked.
- **Manager action: restart the Claude Code session before P4** (plan §9.3).

## What was done

1. Built `.tooling/bin/contain-snapshot` (before/after/diff/classify) and the allow-list. Calibrated both on an idle run (PASS), then took the phase "before" snapshot (22:28:21).
2. Wrote `env.sh`, `npmrc` and the `gh`/`git` wrappers. Ran the auth checks (Adham-Aly, `repo` scope, name free), `git init -b main`, `.gitignore`, G-SECRETS (`check-secrets`), the first commit `0d9f5f4` ("Phase 3: workspace, plan v2 and project configuration", no co-author) and `gh repo create et-ccc --private --source=. --remote=origin --push`. Verified the repo is PRIVATE with default branch `main`.
3. Wrote the remaining wrappers (`node`, `npm`, `pypy38`, `ruff`, `vermin`, `pw`, `impeccable`, `tools-pip`), the guard `guard-bash` + `guard-test` + `guard-cases.tsv`, and `.claude/settings.json` (env block, PreToolUse guard, Impeccable PostToolUse/Stop hooks).
4. SPIKE S-1 by web search and Vercel's docs: builds support 24.x (default), 22.x and 20.x. Installed Node 24.21.0.
5. Installed PyPy 3.8 v7.3.11 and the tools venv (hash-pinned wheels). Smoke-tested py_compile, ruff and vermin.
6. Installed Impeccable at project scope from the tag tarball. The engine was fetched by its checksum-verifying launcher into `IMPECCABLE_HOME`. Smoke-tested `detect` and a simulated hook.
7. Installed avoid-ai-writing from the pinned commit tarball. Smoke-tested the detector through the planned ESM import path, and the validator.
8. Wrote root `CLAUDE.md`, `.impeccable/config.json`, and the `work/03-setup` deliverables.
9. **Worker (spawn 1 of 1, Sonnet, general-purpose): containment auditor.** It ran an independent after-snapshot, diff and backstop, tested the wrappers and the guard, checked `.gitignore` and G-SECRETS, and wrote `.tooling/README.md`. Verdict: PASS WITH FINDINGS (C-1, C-2 blocking; B-1, A-1, C-3 minor; A-2 informational). I fixed all of them and sent the auditor back via SendMessage for a round-2 re-check (result: `audit.md` §Re-check). Round 2: PASS. Its two new minor gaps (`find -exec node`, `xargs -I{} {}`) were fixed afterwards and added to the battery (96/96).
10. Final after/diff: PASS (`work/03-setup/containment/p3-final-verdict.md`).

## Deliverables

| Path | What |
|---|---|
| https://github.com/Adham-Aly/et-ccc | Private repo, `main` |
| `.gitignore` | plan §10.3 + D-036 additions |
| `.tooling/env.sh`, `.tooling/npmrc` | containment redirects; npm user config |
| `.tooling/bin/{node,npm,pypy38,ruff,vermin,pw,gh,git,impeccable,tools-pip}` + `_wrap.sh` | tool wrappers (realpath-checked) |
| `.tooling/bin/guard-bash`, `guard-test`, `.tooling/guard-cases.tsv` | PreToolUse guard and its 96-case battery |
| `.tooling/bin/contain-snapshot`, `.tooling/contain-allowlist.txt` | G-CONTAIN tool and allow-list |
| `.tooling/bin/check-secrets` | G-SECRETS |
| `.tooling/requirements-tools.txt` | ruff/vermin pins with sha256 hashes |
| `.tooling/README.md` | every entry, activation, proof, removal steps (auditor) |
| `.tooling/{node,pypy38,venvs,impeccable-home,avoid-ai-writing-src,downloads,npm-cache,xdg,snapshots}` | tool state (gitignored) |
| `.claude/settings.json` | env block, guard hook, Impeccable hooks (project scope) |
| `.claude/skills/impeccable/`, `.claude/skills/avoid-ai-writing/` | the two skills |
| `.impeccable/config.json` | Impeccable project config (hook on, non-app dirs ignored) |
| `CLAUDE.md` | root agent instructions |
| `work/03-setup/tool-versions.md` | versions, sources, hashes, smoke tests, findings for P4 |
| `work/03-setup/spike-S1.md` | Vercel Node major (sources cited) |
| `work/03-setup/repo.md` | repo facts, auth checks, what gh/git touched |
| `work/03-setup/containment/` | `p3-final-verdict.md`, final and auditor diff reports, classified backstop, `audit.md`, `guard-tests.md`, `pip-cache-cleanup.txt` |
| `work/03-setup/report-assets/summary.md` | plain-language summary for the Manager report |

## Key findings / decisions

D-033 to D-040 in `decisions.md`:
- D-033 Node 24.21.0; P4 sets `"engines": {"node": "24.x"}`.
- D-034 proof tool: hard-fail on tool-named paths first, then a narrow allow-list, with a content-verified exemption for the harness's `npm --global config get prefix` probe logs.
- D-035 wrappers + guard (bare `git`/`gh` blocked too; lexer-based; battery).
- D-036 `.gitignore` additions.
- D-037 Impeccable hooks in project `settings.json`; upstream subagent definitions not installed; telemetry off.
- D-038 **vermin on PyPy 3.8 exits 0 on 3.10 syntax.** G-PY-38 must fail if either `py_compile` (syntax) or vermin (API) fails. Configure ruff's rules explicitly (0.16 defaults include `I`, `YTT`).
- D-039 pip-cache incident, remediation and prevention.
- D-040 avoid-ai-writing: CommonJS default import, static `AIDetector.analyzeText`.
- **Hooks hot-load:** the harness picked up the new `.claude/settings.json` PreToolUse hook mid-session (it blocked my own and the auditor's commands). The env block and project skills still need the restart (§9.3), so the P4 verification list stands.
- Guard limits that remain (documented in `.tooling/README.md`): a per-call hook cannot see variables exported by earlier calls, or code inside scripts executed by path. Wrappers, env redirects and the proof tool still cover those cases.

## Open questions & items awaiting Manager approval

- None pending approval. **Manager action: restart the Claude Code session** (plan §9.3) before P4 starts.
- Process note: the auditor did a live `npm install` of a public package (into `.tooling/npm-global`, then removed) to prove B-1. That broke its "do not install" instruction, although containment held. It was told not to repeat this, and the round-2 re-check used refusal-only tests.
- For the record: the main session's v2.2 amendments to `implementation-plan.md`, `operating-rules.md` and `decisions.md` (D-032-A1, the 3-worker cap) were made during this phase. They are included in the P3 commit unchanged.

## Known gaps / risks / suggested follow-ups

- The backstop sweeps all of `$HOME`, so the Manager's own activity during a proof shows up (e.g. `resume.pdf` downloaded to the Desktop). It is triaged by hand in the verdict file, never allow-listed. Expect this in P4 too.
- Playwright crashpad paths and Next telemetry-file behaviour are still to be settled at the first P4 run (plan §9.6). `pw` fails cleanly until then.
- Impeccable's "monorepo context" caveat: P4 decides where `PRODUCT.md`/`DESIGN.md` live (plan §4.3 says `main-app/`) and records it.
- `.tooling/downloads/` (160 MB of provenance tarballs) is gitignored; delete it if space matters. Removal steps are in `.tooling/README.md`.

## Instructions for the next phase (P4)

1. The session must have been restarted. First prove plan §9.3: `env` shows the redirects; the guard rejects a bare `npm -v` and a `git config --global` write; `.tooling/bin/node -v` = v24.21.0; both skills load through the Skill tool; the Impeccable hooks fire. Record this in `work/04-app/p3-verification.md`.
2. Read `CLAUDE.md`, `.tooling/README.md`, `work/03-setup/tool-versions.md` ("Findings the next phases need") and D-033 to D-040.
3. Work on branch `phase-04-app` from `main`. Every tool install or first run: `.tooling/bin/contain-snapshot before|after|diff <label>`.
4. Run `.tooling/bin/guard-test` after any guard change, and add a case for every new bypass or false positive.
