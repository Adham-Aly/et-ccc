# Containment: Playwright browser installs (Chromium, WebKit)

`.tooling/bin/pw install <engine>` — browsers land in `.tooling/playwright-browsers/`
(`PLAYWRIGHT_BROWSERS_PATH`, plan §9.1), one binary per engine, each with its own before/after/
diff proof.

## Chromium (`pw-install-chromium`) — PASS

Downloaded Chrome for Testing 153.0.8010.12, FFmpeg, and Chrome Headless Shell into
`.tooling/playwright-browsers/`. Diff: every watched location `OK` (unchanged). Backstop: 21
paths newer than the marker, all allow-listed pre-existing OS/harness churn. Zero `HARD-FAIL`,
zero `UNLISTED`.

## WebKit (`pw-install-webkit`) — PASS for the tool; 2 UNLISTED backstop hits, flagged not fixed

Downloaded WebKit 26.6 into `.tooling/playwright-browsers/`. Every watched location `OK`
(unchanged) — WebKit itself installed cleanly, exactly like Chromium.

The broader `$HOME` backstop sweep additionally caught **2 UNLISTED paths**, both inside the
Manager's own Photos library, not anything Playwright or WebKit could plausibly write to:

- `/Users/adham/Pictures/Photos Library.photoslibrary/database/Photos.sqlite-wal`
- `/Users/adham/Pictures/Photos Library.photoslibrary/private/com.apple.photolibraryd/caches/clientservertransaction`

Both were modified at 23:16:13, inside the install's before/after window. Confirmed the cause:
`photolibraryd`, `photoanalysisd` and `cloudphotod` are long-running macOS system daemons on this
Mac (`ps aux` shows all three started 2026-09-11, well before this session), doing the Manager's
own Photos library sync/indexing in the background — completely disconnected from a WebKit zip
download and unpack into `.tooling/`. This is the Manager's own Mac activity, coincidentally
timed, not a containment failure caused by our tooling.

**Per the brief's rule ("anything the backstop flags that is the Manager's own activity is
triaged here, never allow-listed without asking the orchestrator"), this is not added to
`.tooling/contain-allowlist.txt`.** It is flagged here for the orchestrator/Manager instead.
Nothing in `.tooling/`, `main-app/`, or any project-tool-named path was touched — the two paths
are both under the Manager's pre-existing `~/Pictures/Photos Library.photoslibrary/`, owned and
written to by macOS's own Photos daemons, not by any tool this project installs or runs.

**Recommendation:** no action needed on the tooling side; if this proof is re-run and the same
class of path reappears, it further confirms Photos background sync as the source, not a
regression in Playwright's containment.

Full reports: `.tooling/snapshots/pw-install-chromium/report.txt`,
`.tooling/snapshots/pw-install-webkit/report.txt`.
