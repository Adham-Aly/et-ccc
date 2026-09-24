# .tooling/bin/_wrap.sh — shared helper for the wrappers (sourced, not executed).
# shellcheck shell=bash
. "/Users/adham/Developer/et-ccc/.tooling/env.sh"
wrap_die() { echo "[et-ccc wrapper] $*" >&2; exit 126; }
# wrap_exec <expected-prefix> <binary> args...  — refuses to run anything that does not resolve
# (after symlinks) to a file under <expected-prefix>.
wrap_exec() {
  local prefix="$1" bin="$2"; shift 2
  [ -x "$bin" ] || wrap_die "$(basename "$bin") is not installed at $bin (see .tooling/README.md)"
  local real; real="$(/usr/bin/perl -MCwd=realpath -e 'print realpath($ARGV[0])' "$bin" 2>/dev/null)"
  [ -n "$real" ] || real="$bin"
  case "$(printf '%s' "$real" | tr 'A-Z' 'a-z')/" in
    "$(printf '%s' "$prefix" | tr 'A-Z' 'a-z')"/*) ;;
    *) wrap_die "$bin resolves to $real, outside $prefix; refusing";;
  esac
  exec "$bin" "$@"
}
