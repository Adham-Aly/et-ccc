#!/usr/bin/env node
// scripts/perf-budgets.mjs — G-PERF (plan §7: "Lighthouse on key templates ...; first-load JS per
// route under the P4 budget ..."). Two independent checks, both against a real local production
// build (scripts/support/local-server.mjs, its own `.next-perf` dist dir):
//
//   1. Build stats: reads Turbopack's own `diagnostics/route-bundle-stats.json` (an official
//      per-build artifact — the closest thing Next 16 has to the old webpack build's printed
//      "First Load JS" column, which Turbopack's `next build` no longer prints) for each budgeted
//      route's `firstLoadUncompressedJsBytes`, and fails if it exceeds that route's budget.
//   2. Lighthouse: audits each budgeted route's rendered page (performance category only —
//      accessibility is G-PAGE's job, via axe, not duplicated here), against a Chromium instance
//      launched through Playwright itself (`chromium.launch()`, same pinned browser every other
//      suite uses) rather than Lighthouse's own `chrome-launcher`. This is not a style choice: a
//      chrome-launcher-driven "Chrome for Testing" writes a Crashpad crash-reporting database
//      (`settings.dat`) to a fixed `~/Library/Application Support/.../Crashpad/` path that is
//      hardcoded on macOS and outside `--user-data-dir` — verified unfixable via
//      --disable-crash-reporter/--disable-breakpad/--crash-dumps-dir and an overridden $HOME (all
//      tried, all failed, each caught by a real containment proof, plan §9.4). A Playwright-
//      launched instance does not write it at all (verified the same way) — Lighthouse only needs
//      a Chrome DevTools Protocol port to attach to, and Playwright's own `--remote-debugging-
//      port` flag exposes exactly that.
//
// Budgets live in BUDGETS below and are documented/justified in work/04-app/perf-budgets.md
// (measured baseline + reasoning) — the two must be kept in sync by hand, the same as
// tools/style/thresholds.json's "P4 default, P5 recalibrates" convention.
//
// Reports: one JSON (the full Lighthouse result, verbatim) and one Markdown summary per route,
// written to work/04-app/perf/ (tracked — these are the run records, not scratch output).
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import { chromium } from "playwright";
import { buildAndServe } from "./support/local-server.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "..");
const reportsDir = path.join(repoRoot, "work", "04-app", "perf");

/** A free TCP port on 127.0.0.1, for Chrome's --remote-debugging-port (not one of the app-server
 * leases in scripts/port-lease.mjs's 4100-4199 range — a CDP port is a different kind of
 * resource, released the moment this process's browser closes). */
async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function log(msg) {
  console.log(`perf-budgets: ${msg}`);
}

// Routes audited (batch 3 item 4): home, the course map, the fixture lesson with the most visuals
// (M90.3 has all 8 remaining panel visualizers plus a Scene — requests.md), and /problems.
// `bundleRoute` is the Turbopack route pattern route-bundle-stats.json keys dynamic routes by
// (one shared bundle per pattern, regardless of the actual params).
const ROUTES = [
  { id: "home", path: "/", bundleRoute: "/" },
  { id: "course-map", path: "/learn", bundleRoute: "/learn" },
  {
    id: "fixture-lesson-most-visuals",
    path: "/learn/fx/M90.3/visuals",
    bundleRoute: "/learn/[stage]/[module]/[lesson]",
  },
  { id: "problems", path: "/problems", bundleRoute: "/problems" },
];

// P4 default budgets (work/04-app/perf-budgets.md has the measured baseline, the observed
// run-to-run LCP variance on a shared dev machine, and the reasoning; P5 recalibrates once real
// content/visual volume is in and this runs against an idle deployment rather than a laptop
// shared with sibling agents' builds). Bundle bytes are firstLoadUncompressedJsBytes (Turbopack's
// own unit); Lighthouse metrics are its own units (ms, unitless CLS, 0-1 performance score).
const BUDGETS = {
  home: { firstLoadJsBytes: 700_000, performanceScoreMin: 0.85, lcpMs: 3000, tbtMs: 300, cls: 0.1 },
  "course-map": {
    firstLoadJsBytes: 700_000,
    performanceScoreMin: 0.85,
    lcpMs: 3000,
    tbtMs: 300,
    cls: 0.1,
  },
  "fixture-lesson-most-visuals": {
    firstLoadJsBytes: 900_000,
    performanceScoreMin: 0.75,
    lcpMs: 3500,
    tbtMs: 500,
    cls: 0.1,
  },
  problems: {
    firstLoadJsBytes: 700_000,
    performanceScoreMin: 0.85,
    lcpMs: 3000,
    tbtMs: 300,
    cls: 0.1,
  },
};

function readBundleStats(distPath) {
  const file = path.join(distPath, "diagnostics", "route-bundle-stats.json");
  if (!fs.existsSync(file)) {
    throw new Error(
      `${file} not found — Turbopack's route-bundle-stats.json diagnostic is missing (Next version change?)`,
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|");
}

// Lighthouse's raw report embeds base64 screenshots (a filmstrip plus the final-state frame) —
// useful in the interactive viewer, but they are most of a committed report's size (roughly half,
// measured) for no benefit as tracked JSON. Every score/metric/audit-detail stays; only the image
// payloads are replaced with a short note.
function stripScreenshots(lhr) {
  const out = structuredClone(lhr);
  for (const id of ["screenshot-thumbnails", "final-screenshot", "full-page-screenshot"]) {
    const audit = out.audits?.[id];
    if (audit) audit.details = { omitted: "base64 screenshot data stripped before committing" };
  }
  return out;
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });

  const server = await buildAndServe({ distDir: ".next-perf", leaseName: "perf", log });

  const failures = [];
  const rows = [];

  try {
    const bundleStats = readBundleStats(server.distPath);

    const debugPort = await getFreePort();
    log(`launching Chromium (Playwright-managed, CDP port ${debugPort}) ...`);
    const browser = await chromium.launch({
      headless: true,
      args: [`--remote-debugging-port=${debugPort}`],
    });

    try {
      for (const route of ROUTES) {
        const budget = BUDGETS[route.id];
        const url = new URL(route.path, server.base).toString();
        log(`auditing ${route.id} (${url}) ...`);

        const stat = bundleStats.find((s) => s.route === route.bundleRoute);
        const firstLoadJsBytes = stat?.firstLoadUncompressedJsBytes ?? null;

        const result = await lighthouse(url, {
          port: debugPort,
          output: "json",
          logLevel: "error",
          onlyCategories: ["performance"],
        });
        const lhr = result.lhr;
        const performanceScore = lhr.categories.performance.score;
        const lcpMs = lhr.audits["largest-contentful-paint"]?.numericValue ?? null;
        const tbtMs = lhr.audits["total-blocking-time"]?.numericValue ?? null;
        const cls = lhr.audits["cumulative-layout-shift"]?.numericValue ?? null;

        fs.writeFileSync(
          path.join(reportsDir, `${route.id}.json`),
          JSON.stringify(stripScreenshots(lhr), null, 2),
        );

        const routeFailures = [];
        if (firstLoadJsBytes === null) {
          routeFailures.push(`no bundle stats found for route pattern "${route.bundleRoute}"`);
        } else if (firstLoadJsBytes > budget.firstLoadJsBytes) {
          routeFailures.push(
            `first-load JS ${firstLoadJsBytes}B exceeds budget ${budget.firstLoadJsBytes}B`,
          );
        }
        if (performanceScore === null || performanceScore < budget.performanceScoreMin) {
          routeFailures.push(
            `performance score ${performanceScore} below budget ${budget.performanceScoreMin}`,
          );
        }
        if (lcpMs === null || lcpMs > budget.lcpMs) {
          routeFailures.push(`LCP ${lcpMs}ms exceeds budget ${budget.lcpMs}ms`);
        }
        if (tbtMs === null || tbtMs > budget.tbtMs) {
          routeFailures.push(`TBT ${tbtMs}ms exceeds budget ${budget.tbtMs}ms`);
        }
        if (cls === null || cls > budget.cls) {
          routeFailures.push(`CLS ${cls} exceeds budget ${budget.cls}`);
        }

        rows.push({
          route,
          budget,
          firstLoadJsBytes,
          performanceScore,
          lcpMs,
          tbtMs,
          cls,
          ok: routeFailures.length === 0,
        });
        for (const f of routeFailures) failures.push(`${route.id}: ${f}`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    await server.stop();
  }

  const lines = [
    "<!-- Auto-generated by `npm run perf` (scripts/perf-budgets.mjs) — do not hand-edit. -->",
    "",
    "# G-PERF run",
    "",
    `Generated ${new Date().toISOString()}.`,
    "",
    "| Route | First-load JS | Budget | Perf score | LCP | TBT | CLS | Result |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map((r) => {
      const jsKb =
        r.firstLoadJsBytes === null ? "n/a" : `${Math.round(r.firstLoadJsBytes / 1024)} kB`;
      const budgetKb = `${Math.round(r.budget.firstLoadJsBytes / 1024)} kB`;
      const score = r.performanceScore === null ? "n/a" : Math.round(r.performanceScore * 100);
      const lcp = r.lcpMs === null ? "n/a" : `${Math.round(r.lcpMs)} ms`;
      const tbt = r.tbtMs === null ? "n/a" : `${Math.round(r.tbtMs)} ms`;
      const cls = r.cls === null ? "n/a" : r.cls.toFixed(3);
      return `| ${mdEscape(r.route.path)} | ${jsKb} | ${budgetKb} | ${score} | ${lcp} | ${tbt} | ${cls} | ${r.ok ? "PASS" : "FAIL"} |`;
    }),
    "",
    failures.length === 0
      ? "All routes within budget."
      : `${failures.length} budget miss(es):\n\n${failures.map((f) => `- ${f}`).join("\n")}`,
    "",
  ];
  fs.writeFileSync(path.join(reportsDir, "summary.md"), lines.join("\n"));
  log(`wrote ${path.join(reportsDir, "summary.md")} and one JSON report per route.`);

  if (failures.length > 0) {
    console.error(`perf-budgets: ${failures.length} budget miss(es):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  log("clean — every route within its performance and first-load JS budget.");
}

main().catch((err) => {
  console.error(`perf-budgets: ${err instanceof Error ? err.stack : String(err)}`);
  process.exit(1);
});
