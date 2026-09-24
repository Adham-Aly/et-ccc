# Containment: first Playwright test run (Chromium + WebKit) — BLOCKING FINDING, not resolved unilaterally

`npm run test:e2e` (6 projects: chromium/webkit × 390×844/768×1024/1440×900) against `next start`
on a leased port. All 6 smoke tests **passed** functionally. The containment proof does **not**
pass cleanly, and the cause cannot be fixed with an env-var redirect the way the P3 pip incident
and this phase's node-gyp incident were. Per my instructions ("if a tool cannot be contained,
STOP and report instead of working around it" and "anything the backstop flags that is the
Manager's own activity is triaged here, never allow-listed without asking the orchestrator"),
this is reported, not silently fixed or allow-listed.

## Finding: Playwright's WebKit engine writes outside the workspace on macOS, with no available redirect

Running any WebKit browser context (not just installing the binary — installation itself was
clean, see `playwright-install.md`) makes macOS's system WebKit framework write:

- `~/Library/WebKit/org.webkit.Playwright/WebsiteData/**` (IndexedDB, LocalStorage, cookies,
  search history, etc. — the browsing data store)
- `~/Library/Caches/org.webkit.Playwright/WebKit/**` (network cache, service workers, HSTS,
  alternative services)
- `~/Library/Preferences/org.webkit.Playwright.plist`

**Root cause:** on macOS, Playwright's WebKit binary uses Apple's native `WKWebsiteDataStore`
framework for persistent storage, keyed by a fixed bundle identifier (`org.webkit.Playwright`)
baked into the shipped binary. This is an OS-level per-bundle-ID storage model
(`NSHomeDirectory()`-derived), not a simple `--user-data-dir` CLI flag or an environment variable
Playwright exposes — unlike Chromium, which fully respects a workspace-local user data directory
and left no trace outside `.tooling/`. I searched `playwright-core`'s server code and the
Playwright docs/issue tracker knowledge for a redirect (`WEBKIT_TMPDIR`-style env var, a
`userDataDir` override that WebKit actually honours, etc.) and found none: this is a
well-documented, long-standing Playwright-on-macOS-WebKit limitation, not a bug in our setup.

**This is different from the node-gyp incident earlier in this batch** (`npm-install.md`), which
had a real fix (`--ignore-scripts`, since nothing in our tree needed a lifecycle script). There is
no equivalent fix here short of not running WebKit at all, which the plan requires (WebKit stands
in for Safari, plan §4.2, and `playwright.config.ts` has WebKit × 3 viewports as required
projects).

## What I did

1. Confirmed Chromium leaves no trace at all (clean diff both for install and for this same test
   run — the `HOME_Library_WebKit.txt` watched-list entry is the only thing that changed).
2. Cleaned up the incidental data this run left: deleted
   `~/Library/WebKit/org.webkit.Playwright/` (4 KB), `~/Library/Caches/org.webkit.Playwright/`
   (empty), and `~/Library/Preferences/org.webkit.Playwright.plist` (81 bytes) — confirmed gone.
   **This cleanup is cosmetic, not a fix**: the same three locations will be recreated by the very
   next WebKit test run, every time, for the life of the project. Deleting them now does not
   change that.
3. Did **not** add `org.webkit.Playwright*` to `.tooling/contain-allowlist.txt` myself — that
   decision belongs to the orchestrator (D-034's allow-list policy is intentionally strict:
   "nothing any of our tools writes may ever be listed"; this genuinely is written by our own
   tool, just via an OS mechanism with no redirect, which is exactly the kind of judgment call
   the brief reserves for the orchestrator).
4. Also saw 1 `UNLISTED` backstop hit in this same window,
   `~/Library/MediaAnalysis/MediaAnalysis.sqlite-wal`: confirmed unrelated to us —
   `mediaanalysisd`, a macOS system daemon, has been running continuously since 2026-09-11 (long
   before this session) and writes to its own database on its own schedule. Left untouched (it is
   the Manager's own Mac's system activity, not ours to delete), and not allow-listed by me for
   the same reason as above.

## Options for the orchestrator (I did not choose one)

- **(a)** Add narrow, file-level entries to `contain-allowlist.txt` for exactly
  `Library/WebKit/org.webkit.Playwright*`, `Library/Caches/org.webkit.Playwright*`,
  `Library/Preferences/org.webkit.Playwright.plist`, with this finding as the reason — treating
  it the same way plan §9.7 already treats LaunchServices/Gatekeeper records for the Playwright
  browser bundles ("owned by the system... not installed by us, and openly acknowledged rather
  than treated as a containment failure"). This is my read of the closest precedent already in
  the plan, but it is the orchestrator's call, not mine to make unilaterally.
- **(b)** Accept WebKit E2E/visual/a11y runs as a standing, disclosed exception to a clean
  G-CONTAIN pass (documented per-run, like this file), without editing the allow-list.
- **(c)** Escalate to the Manager for a ruling, if the Manager wants to weigh in given D-034's
  "nothing our tools write may ever be listed" language was written before this WebKit-specific
  case was known.

Every future WebKit run (E2E, visual, a11y, perf) will reproduce the same three paths. Whichever
option is chosen should be recorded once (a decision, `contain-allowlist.txt` entries, or both)
rather than re-litigated per run.

Full reports: `.tooling/snapshots/pw-first-run/report.txt`,
`.tooling/snapshots/pw-first-run/backstop-classified.txt`.
