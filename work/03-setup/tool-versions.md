# P3 tool versions and provenance

Installed 2026-09-23 by `setup-orchestrator` (P3). Everything lives inside the workspace. Tools are called only through `.tooling/bin/*`.

| Tool | Version | Location | Source | Integrity |
|---|---|---|---|---|
| Node.js | **v24.21.0** (LTS "Krypton", released 2026-09-07) | `.tooling/node/` | `https://nodejs.org/dist/v24.21.0/node-v24.21.0-darwin-arm64.tar.gz` | SHA-256 `bed7eea5325e1108f32ce5228ddd6a5f0f08a499ee42aa7442aea583702f6057`, matched against `https://nodejs.org/dist/v24.21.0/SHASUMS256.txt` (fetched over HTTPS; the SHASUMS GPG signature was not checked, since that would need a keyring) |
| npm | 11.19.0 (bundled with Node 24.21.0) | `.tooling/node/lib/node_modules/npm` | bundled | as Node |
| PyPy | **3.8 v7.3.11** (Python 3.8.16), macOS arm64, native (no Rosetta) | `.tooling/pypy38/` | `https://downloads.python.org/pypy/pypy3.8-v7.3.11-macos_arm64.tar.bz2` | SHA-256 `78cdc79ff964c4bfd13eb45a7d43a011cbe8d8b513323d204891f703fdc4fa1a`, matched against `https://www.pypy.org/checksums.html` |
| pip (tools venv) | 22.0.4 (bundled via ensurepip) | `.tooling/venvs/tools/` | PyPy's ensurepip | bundled |
| ruff | **0.16.8** | `.tooling/venvs/tools/bin/ruff` | PyPI | `pip --require-hashes --only-binary=:all:` against PyPI sha256 digests (`.tooling/requirements-tools.txt`) |
| vermin | **1.8.0** | `.tooling/venvs/tools/bin/vermin` | PyPI | same |
| Impeccable skill | **skill-v4.3.1** (commit `cd12f8660e2dde57b9615c8a6b8ea674101f9cfc`, still the latest skill release on 2026-09-23) | `.claude/skills/impeccable/` | `https://codeload.github.com/pbakaus/impeccable/tar.gz/cd12f866…` | tarball SHA-256 `6833f7a1d6380218c0af12adf74bdd2db303e96c6a73b9a1126800c26ce0672e` (recorded; the commit SHA in the URL is the pin) |
| Impeccable engine | **0.1.5** (`engine-v0.1.5`, darwin-arm64) | `.tooling/impeccable-home/bin/0.1.5/impeccable` | downloaded by the skill's launcher on first run | the launcher checks the release's `.sha256` sidecar and refuses to run on a mismatch; binary SHA-256 `0d48b6e16aa97664fdbe607d5da9ae320e389a1843e0ff1328f8c2530530320d` |
| avoid-ai-writing | **v3.35.0** @ `fc979c6489ec0ac81a77236782ba496da81b24cb` | `.claude/skills/avoid-ai-writing/` (copied from `skills/avoid-ai-writing/`); full tarball unpacked in `.tooling/avoid-ai-writing-src/` | `https://codeload.github.com/conorbronsdon/avoid-ai-writing/tar.gz/fc979c6…` | tarball SHA-256 `96d99f9ce57c19895a639649e88877834eb2306c8793a7f665dabdcfb9d0899b` (recorded; the commit SHA is the pin) |

Pre-existing system tools used read-only (not installed by us): `/opt/homebrew/bin/gh` 2.92.0 (the Manager's login, keyring), `/usr/bin/git` 2.50.1 (Apple Git-155; the Manager's global identity `adham-aly`), `/usr/bin/perl` 5.34.1 (guard hook, realpath), `/usr/bin/curl`, `/usr/bin/find`, `/usr/bin/stat`, `plutil`, `shasum`, `tar`.

Downloads (tarballs, checksum files) are kept in `.tooling/downloads/` (gitignored) as provenance.

## Smoke tests (all passed, 2026-09-23)

| Check | Result |
|---|---|
| `.tooling/bin/node -v`, `-p process.execPath` | `v24.21.0`, `/Users/adham/Developer/et-ccc/.tooling/node/bin/node` |
| `.tooling/bin/npm config get cache prefix userconfig globalconfig` | all four under `.tooling/`; npm's debug log went to `.tooling/npm-cache/_logs` |
| `.tooling/bin/npm i -g x`, `npm exec x`, `npm exec --yes x` | refused by the wrapper (exit 126) |
| `.tooling/bin/pypy38 --version` | Python 3.8.16, PyPy 7.3.11, `platform.machine()` = arm64 |
| `pypy38 -m py_compile` on 3.8 code / on `match` + walrus + `dict[str,int]` code | pass / `SyntaxError` exit 1 |
| `ruff check --target-version py38` | runs; cache in `.tooling/xdg/cache/ruff` |
| `vermin -t=3.8- --violations` on `str.removeprefix` + `math.lcm` | reports 3.9 minimum, exit 1 |
| Impeccable `engine-probe`, `detect` on a sample page | `impeccable-engine 0.1.5`; 4 findings (low contrast ×2, overused font, AI palette) |
| Impeccable `hook` (simulated PostToolUse on `main-app/*.html`) | returns `hookSpecificOutput.additionalContext` with findings, exit 0 |
| avoid-ai-writing `AIDetector.analyzeText` via ESM default import from `.claude/skills/avoid-ai-writing/detector/patterns.js` | sloppy sample: 7 issues, score 21; plain sample: 0 issues |
| `detector/validate.js orig rewrite` | identical: `PASS`, exit 0; code block changed: `FAIL [code-block-modified]`, exit 1 |

## Findings the next phases need

1. **Vercel/Node:** local Node major 24 = Vercel's default build major (SPIKE S-1, `spike-S1.md`). `main-app/package.json` must set `"engines": { "node": "24.x" }`.
2. **G-STYLE import:** `patterns.js` and `validate.js` are CommonJS. From ESM use a default import (`import AIDetector from '…/detector/patterns.js'`) or `createRequire`. The API is **static**: `AIDetector.analyzeText(text, { context })` (not `new AIDetector()`). This works while no `package.json` with `"type": "module"` sits between `.claude/skills/avoid-ai-writing/` and the root (none does).
3. **G-PY-38:** vermin runs on PyPy 3.8, so it **cannot parse** 3.9+/3.10 syntax. On such a file it prints "Not enough evidence…" and **exits 0**. Syntax is gated by `py_compile` under PyPy 3.8; vermin gates library/API use only. G-PY-38 must fail if *either* fails, and the `bad38` fixture must include both a syntax case and an API case.
4. **ruff 0.16 defaults** now include isort (`I001`) and flake8-2020 (`YTT`) rules, even with `--isolated`. P4 must set the rule set explicitly in `main-app` config.
5. **pip** is reachable only through `.tooling/bin/tools-pip` (tools venv). Upgrading pip itself is not needed.
