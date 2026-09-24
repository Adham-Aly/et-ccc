# Containment: first `next build`

`npm run build` (`node scripts/assert-contained.mjs && node scripts/build-lock.mjs -- next build`)
under `.tooling/locks/build.lock`. Verdict: **PASS**.

- Diff: nothing under any watched location changed beyond `OK` (unchanged) entries.
- Backstop: 7 paths newer than the marker, all allow-listed pre-existing OS/browser/harness
  churn (this session's Claude Code subagent transcript, Brave/Chrome preference and state
  files) — zero `HARD-FAIL`, zero `UNLISTED`.
- **Telemetry check (plan §9.6):** `~/Library/Preferences/nextjs-nodejs/config.json` already
  existed before this session (birth 2026-05-24, from unrelated prior Next.js use on this Mac)
  and was not modified by this build (`OK` in the diff). `NEXT_TELEMETRY_DISABLED=1` holds:
  Next wrote no telemetry file for this project.
- Route output: `/` and `/_not-found` both prerendered as static content (`○ (Static)`); no
  dynamic routes in the build output (G-BUILD).
- Build lock (`.tooling/locks/build.lock`) was created and released cleanly around the run.

Full report: `.tooling/snapshots/next-build-1/report.txt`.
