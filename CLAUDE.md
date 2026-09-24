# et-ccc: instructions for every agent

**Start here:** read `context/00-START-HERE.md` before doing anything. `context/implementation-plan.md` is the single source of truth; `context/progress.md` says what is done and what is next.

## Hard rules

- **Call tools only through `.tooling/bin/*`** (npm scripts: `.tooling/bin/npm run …`). Never call `node`, `npm`, `npx`, `pip`, `python3`, `pypy`, `brew`, `playwright`, `vercel`, `git` or `gh` bare. Wrappers: `.tooling/bin/{node,npm,pypy38,ruff,vermin,pw,gh,git,impeccable,tools-pip}`. A PreToolUse guard (`.tooling/bin/guard-bash`, regression cases in `.tooling/guard-cases.tsv`, run `.tooling/bin/guard-test`) blocks bare calls.
- **Nothing is written outside this workspace** (operating-rules §7). No global installs, no `npm -g`, no `npx <remote package>` (only `.tooling/bin/npm exec --no -- <bin>` for pinned local devDependencies), no Homebrew, no user-scope skills, plugins or MCP servers, no agent memory. Every tool's home, cache and config are redirected into `.tooling/` (`.tooling/env.sh`, mirrored in `.claude/settings.json`).
- **Never change the Manager's gh or git config:** no `gh auth login|logout|refresh|setup-git`, no `git config --global|--system`. No `--no-verify`, no force-push, no rewriting pushed history.
- **Commits:** plain messages naming the phase and outcome. Never add co-author lines or agent names. Only the phase orchestrator commits and pushes (plan §10.4). Run `.tooling/bin/check-secrets` (G-SECRETS) before every commit.
- **Agents:** main session → phase orchestrator → workers only. Workers never spawn subagents. No swarms, no Workflow tool, no `fork`. At most 3 worker spawns per phase (plan §11.4).
- **Containment proof:** after installing or first-running any tool, run `.tooling/bin/contain-snapshot before|after|diff <label>` (plan §9.4). Removal steps: `.tooling/README.md`.
- **App rules (brief R13, R14, R17, R18; plan §2.3):** light mode only; Python 3.8 only in shown code; judge links only through the registry (2021–2026 → WMOJ, 2014–2020 → DMOJ, WMOJ preferred, CCC 2014–2026 only); no score targets; no problem walkthroughs, editorials, solution pages or per-problem hints; no system or environment setup content; no exercises, quizzes or code execution in the app.
- **Engineering standards (plan §8):** reproduce bugs end to end first; be picky about the UI down to the pixel; zero warnings, failures and flakes; never hand-edit generated files.

## Skills (project scope, in `.claude/skills/`)

- **impeccable** (skill-v4.3.1, engine 0.1.5 in `.tooling/impeccable-home`): design work in P4 and later. Light mode only. Do not use its subagent or image-plate flows.
- **avoid-ai-writing** (v3.35.0 @ `fc979c6`): all teaching prose, `warm` voice and `docs` context. The G-STYLE detector imports `.claude/skills/avoid-ai-writing/detector/patterns.js` (CommonJS: default import; static `AIDetector.analyzeText(text, opts)`).
