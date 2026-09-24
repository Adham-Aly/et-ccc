# .tooling/env.sh — containment environment for every tool in this workspace (plan §9.1–§9.2).
# Sourced by every .tooling/bin/* wrapper. Redirects each tool's home/cache/config/state into
# .tooling/ so that deleting the workspace leaves nothing behind (operating-rules §7).
#
# Deliberately NOT changed: HOME (breaks Keychain/gh/git lookups), TMPDIR (Chromium socket-path
# limit), GIT_CONFIG_GLOBAL (the Manager's global git identity is used read-only, plan §10/§16.1).
# The same variables are repeated as literal paths in .claude/settings.json "env" (except PATH).

ET_CCC_ROOT="/Users/adham/Developer/et-ccc"
export ET_CCC_ROOT
ET_T="$ET_CCC_ROOT/.tooling"

# --- Node / npm / corepack -----------------------------------------------------------------------
export npm_config_userconfig="$ET_T/npmrc"                 # instead of ~/.npmrc
export npm_config_globalconfig="$ET_T/npm-global/etc/npmrc" # instead of <prefix>/etc/npmrc
export npm_config_prefix="$ET_T/npm-global"                # npm -g would land here (the wrapper blocks -g)
export npm_config_cache="$ET_T/npm-cache"                  # instead of ~/.npm (also npx's _npx)
export npm_config_update_notifier=false
# npm 11 warns on unknown npm_config_* keys; a reverted P4 settings.json edit hot-loaded
# npm_config_devdir into the running session, so drop it (harmless no-op otherwise).
unset npm_config_devdir
export npm_config_fund=false
export COREPACK_HOME="$ET_T/corepack-home"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export COREPACK_ENABLE_AUTO_PIN=0
export NODE_REPL_HISTORY="$ET_T/xdg/state/node_repl_history"   # instead of ~/.node_repl_history

# --- XDG base dirs (gh cache/state, and any XDG-following tool) ------------------------------------
export XDG_CACHE_HOME="$ET_T/xdg/cache"
export XDG_CONFIG_HOME="$ET_T/xdg/config"
export XDG_DATA_HOME="$ET_T/xdg/data"
export XDG_STATE_HOME="$ET_T/xdg/state"

# --- Playwright / Next.js ---------------------------------------------------------------------------
export PLAYWRIGHT_BROWSERS_PATH="$ET_T/playwright-browsers"
export NEXT_TELEMETRY_DISABLED=1

# --- Python (PyPy 3.8 + tools venv) ----------------------------------------------------------------
export PIP_CONFIG_FILE=/dev/null                           # pip loads no global/user/site config at all
export PIP_CACHE_DIR="$ET_T/xdg/cache/pip"
export PIP_DISABLE_PIP_VERSION_CHECK=1
export PYTHONNOUSERSITE=1                                   # never read ~/.local/lib/python*
export PYTHONUSERBASE="$ET_T/xdg/data/python-userbase"
export PYTHONPYCACHEPREFIX="$ET_T/xdg/cache/pycache"        # no __pycache__ litter, nothing global
export PYTHONHISTORY="$ET_T/xdg/state/python_history"
export RUFF_CACHE_DIR="$ET_T/xdg/cache/ruff"

# --- Impeccable ------------------------------------------------------------------------------------
export IMPECCABLE_HOME="$ET_T/impeccable-home"             # instead of ~/.impeccable

# --- gh / git (use the Manager's existing login and identity, read-only; plan §10.2) ---------------
export GH_CONFIG_DIR="$HOME/.config/gh"                    # keep reading the existing login despite XDG_CONFIG_HOME
export GH_NO_UPDATE_NOTIFIER=1
export GH_NO_EXTENSION_UPDATE_NOTIFIER=1
export GH_PROMPT_DISABLED=1
export GIT_TERMINAL_PROMPT=0

# --- PATH: workspace Node first, so npm scripts and shebangs resolve to it -------------------------
case ":$PATH:" in *":$ET_T/node/bin:"*) ;; *) export PATH="$ET_T/node/bin:$PATH";; esac

# --- Impeccable telemetry off (engine honours either; concept "ping" to impeccable.style) ----------
export IMPECCABLE_NO_TELEMETRY=1
export DO_NOT_TRACK=1
