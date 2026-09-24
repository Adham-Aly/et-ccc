# Containment: WebKit's per-bundle storage — RESOLVED

Batch 1 found (`playwright-first-run.md`) that running any WebKit browser context makes macOS's
system WebKit framework write outside the workspace: `~/Library/WebKit/org.webkit.Playwright/`,
`~/Library/Caches/org.webkit.Playwright/`, `~/Library/Preferences/org.webkit.Playwright.plist`,
via `WKWebsiteDataStore`'s per-bundle-ID storage model, with no Playwright CLI flag to redirect
it.

## Fix

`playwright.config.ts` now sets `launchOptions.env` on the three `webkit-*` projects only:

```ts
const webkitHome = path.join(workspaceRoot, ".tooling", "webkit-home");
const webkitLaunchEnv = { ...process.env, CFFIXED_USER_HOME: webkitHome };
// ...
use: { ...devices["Desktop Safari"], viewport: {...}, launchOptions: { env: webkitLaunchEnv } }
```

`CFFIXED_USER_HOME` is a CoreFoundation environment variable, honoured by every Apple framework
that would otherwise resolve `NSHomeDirectory()` (including WebKit's storage and preferences
code), and it is process-scoped: it is set only in the `env` passed to the WebKit browser process
Playwright launches, **not** globally in `.tooling/env.sh` (which would risk affecting `gh`/git/
Keychain lookups for every other tool — those must keep reading the Manager's real `$HOME`, plan
§9.2). Real `HOME` is untouched for every other process, including the `next start` webServer and
the Playwright test runner itself.

## Proof

- **WebKit-only run** (`wk-redirect`, 3 webkit projects): diff shows `HOME_Library_WebKit.txt`
  unchanged (`OK`); backstop 14/14 allow-listed, zero `HARD-FAIL`, zero `UNLISTED`. Confirmed by
  inspection that WebKit's storage actually landed inside the workspace:
  `.tooling/webkit-home/Library/WebKit/org.webkit.Playwright/WebsiteData` and
  `.tooling/webkit-home/Library/Caches/org.webkit.Playwright/WebKit`.
- **Combined run** (`wk-combined`, all 6 chromium+webkit projects): diff clean, backstop 12/12
  allow-listed, zero `HARD-FAIL`, zero `UNLISTED`. All 6 smoke tests passed.
- No `~/Library/Preferences/org.webkit.Playwright.plist` was created this run (confirmed absent
  after both runs) — `CFFIXED_USER_HOME` also redirects `NSUserDefaults`'s backing store.

**Verdict: RESOLVED.** `.tooling/webkit-home/` is gitignored the same way every other
`.tooling/*` subtree is (root `.gitignore`'s `.tooling/*` pattern, no explicit un-ignore for
`webkit-home`). No `.tooling/contain-allowlist.txt` entry is needed for
`org.webkit.Playwright*` any more; the earlier finding in `playwright-first-run.md` is
superseded by this fix.

Full reports: `.tooling/snapshots/wk-redirect/report.txt`, `.tooling/snapshots/wk-combined/report.txt`.
