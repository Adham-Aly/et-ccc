#!/usr/bin/env node
// scripts/check-production-mode.mjs — the production-mode build-and-check proof (batch 3 item 4;
// plan §7 G-E2E "against the local production build"). Builds the app with
// ETCCC_ENV=production into its own dist directory (scripts/support/local-server.mjs, next.config
// .ts's ETCCC_DIST_DIR — never the plain `.next` a developer's `next dev` might be using), starts
// it on a leased port, and checks:
//
//   - /dev/viz, /dev/design, and every /learn/fx/* route 404 (draft-only surfaces, lib/content/
//     env.ts getBuildEnv() === "production" never mounts the fixture course or the dev galleries)
//   - the home page and course map never link to /dev/viz or /dev/design, and never mention the
//     fixture stage's content ("Fixture:", the M90.* module ids)
//   - /search-index.json never contains a fixture entry (href under /learn/fx, or an M90.* id)
//   - /problems never lists an M90.* module id in its "taught in" column
//
// Chained into `npm run test:e2e` ahead of the real Playwright run (package.json) rather than
// its own top-level script, since plan §4.10/brief A13's script list is the fixed one — this
// keeps to it while still running as its own build+server+teardown cycle every time G-E2E does.
import { buildAndServe } from "./support/local-server.mjs";

function log(msg) {
  console.log(`check-production-mode: ${msg}`);
}

async function get(base, urlPath) {
  const res = await fetch(new URL(urlPath, base));
  const body = await res.text();
  return { status: res.status, body };
}

async function runChecks(base) {
  const failures = [];
  function check(cond, msg) {
    if (!cond) failures.push(msg);
  }

  // 1. Draft-only routes 404 in production.
  for (const p of [
    "/dev/viz",
    "/dev/design",
    "/learn/fx/M90.1",
    "/learn/fx/M90.1/components-one",
    "/learn/fx/M90.1/components-two",
    "/learn/fx/M90.2",
    "/learn/fx/M90.2/technique",
    "/learn/fx/M90.3",
    "/learn/fx/M90.3/visuals",
  ]) {
    // eslint-disable-next-line no-await-in-loop
    const { status } = await get(base, p);
    check(status === 404, `${p} returned ${status}, expected 404 in production`);
  }

  // 2. Home and course map never reference the fixture or the dev galleries.
  const home = await get(base, "/");
  check(home.status === 200, `/ returned ${home.status}, expected 200`);
  check(!home.body.includes("/dev/viz"), "/ links to /dev/viz in production");
  check(!home.body.includes("/dev/design"), "/ links to /dev/design in production");
  check(!home.body.includes("Fixture:"), "/ mentions fixture content in production");

  const learn = await get(base, "/learn");
  check(learn.status === 200, `/learn returned ${learn.status}, expected 200`);
  check(!learn.body.includes('id="stage-fx"'), "/learn renders the fixture stage in production");
  check(!learn.body.includes("Fixture:"), "/learn mentions fixture content in production");
  check(!/\bM90\.\d/.test(learn.body), "/learn mentions a fixture module id in production");

  // 3. The search index never contains fixture entries.
  const idx = await get(base, "/search-index.json");
  check(idx.status === 200, `/search-index.json returned ${idx.status}, expected 200`);
  try {
    const entries = JSON.parse(idx.body);
    check(Array.isArray(entries), "/search-index.json did not parse to an array");
    if (Array.isArray(entries)) {
      const leaked = entries.filter(
        (e) => String(e.href ?? "").startsWith("/learn/fx") || /\bM90\.\d/.test(String(e.id ?? "")),
      );
      check(
        leaked.length === 0,
        `/search-index.json contains fixture entries: ${JSON.stringify(leaked)}`,
      );
    }
  } catch (err) {
    failures.push(`/search-index.json is not valid JSON: ${err.message}`);
  }

  // 4. /problems never lists a fixture module id.
  const problems = await get(base, "/problems");
  check(problems.status === 200, `/problems returned ${problems.status}, expected 200`);
  check(!/\bM90\.\d/.test(problems.body), "/problems mentions a fixture module id in production");

  return failures;
}

async function main() {
  const server = await buildAndServe({
    distDir: ".next-prod-check",
    leaseName: "prod-check",
    extraEnv: { ETCCC_ENV: "production" },
    log,
  });

  let failures = [];
  let threw;
  try {
    log("server up, running checks ...");
    failures = await runChecks(server.base);
  } catch (err) {
    threw = err;
  } finally {
    await server.stop();
  }

  if (threw) {
    console.error(`check-production-mode: ${threw.message}`);
    process.exit(1);
  }

  if (failures.length > 0) {
    console.error(`check-production-mode: ${failures.length} failure(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  log("clean — no draft/fixture content or dev routes reachable in a production build.");
}

main();
