# GitHub repository (plan §10.3), created in P3

| Item | Value |
|---|---|
| Repo | **https://github.com/Adham-Aly/et-ccc** |
| Visibility | **PRIVATE** (`gh repo view --json visibility,isPrivate` → `PRIVATE`, `true`) |
| Default branch | `main` |
| Remote | `origin` → `https://github.com/Adham-Aly/et-ccc.git` (HTTPS; credentials via the Manager's existing `gh auth git-credential` helper in `~/.gitconfig`, read-only) |
| Description | "CCC Python learning app" |
| First commit | `0d9f5f4d46533e8509cd650bc40b92521aacb89b`, "Phase 3: workspace, plan v2 and project configuration", author `adham-aly <adham.alysaleh@gmail.com>` (the Manager's global identity, unchanged) |
| Created | 2026-09-23 ~22:30 by `setup-orchestrator`, with `.tooling/bin/gh repo create et-ccc --private --source=. --remote=origin --push --description "CCC Python learning app"` |

## Auth checks (all passed, run through `.tooling/bin/gh`)

1. `gh --version` → 2.92.0 (2026-04-28), `/opt/homebrew/bin/gh` (pre-existing).
2. `gh auth status --hostname github.com` → logged in as **Adham-Aly** (keyring), protocol https, scopes `delete_repo, gist, read:org, repo, workflow` (includes `repo`). Token not printed.
3. `gh api user --jq .login` → `Adham-Aly`.
4. `gh repo view Adham-Aly/et-ccc` before creation → "Could not resolve to a Repository" (name free).

## What `gh` and `git` touched

- `gh` cache and state: `.tooling/xdg/{cache,state}/gh` only (the wrapper sources `env.sh`: `XDG_*` into `.tooling/xdg`, `GH_CONFIG_DIR=$HOME/.config/gh` so the existing login is read). `~/.config/gh`, `~/.cache/gh`, `~/.local/state/gh` unchanged (G-CONTAIN, `containment/`).
- `git`: wrote only `.git/`. `~/.gitconfig` read only, unchanged. The Impeccable engine adds a marked block to `.git/info/exclude` (inside the workspace).
- No `gh auth login/refresh/setup-git`, no `git config --global/--system` were run. The wrappers and the guard hook block them.

## Policy from here (plan §10.4, D-030 Q-17)

- Each later phase works on `phase-NN-<name>`, commits and pushes at phase end and before any redo; `main` is merged only after the Manager approves that phase. P3 is the exception: it commits on `main` (first commit plus the P3 result).
- Plain messages naming the phase and outcome; no co-author lines or agent names; no `--no-verify`, no force-push.
- Run `.tooling/bin/check-secrets` (G-SECRETS) before every commit.
- Removal: the repo lives in the Manager's GitHub account; delete it there if ever wanted (plan §10.6).
