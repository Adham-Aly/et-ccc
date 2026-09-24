#!/usr/bin/env node
// scripts/links-internal.mjs — G-LINKS-INT (plan §7: "linkinator over the local production
// server: zero broken internal links or anchors"). Builds and serves a real local production
// build (scripts/support/local-server.mjs, its own `.next-links-check` dist dir — never the
// plain `.next` a developer's `next dev` might be using), then crawls it with linkinator,
// checking every internal link and every in-page anchor (`#fragment`) it finds by following
// `href`s recursively from `/`.
//
// External links (wmoj.ca, dmoj.ca, and anything in external-links.yaml) are deliberately
// skipped here, not followed or checked — that is G-LINK-EXT's job (manual, `links:external`,
// plan §7), and this gate must stay network-deterministic like every other `verify:full` gate
// (tools/links/verify-judges.mjs's own comment: "no network in normal tests"). `linksToSkip`
// below drops anything that does not start with the local server's own origin.
import { check, LinkState } from "linkinator";
import { buildAndServe } from "./support/local-server.mjs";

function log(msg) {
  console.log(`links-internal: ${msg}`);
}

async function main() {
  const server = await buildAndServe({
    distDir: ".next-links-check",
    leaseName: "links-internal",
    log,
  });

  let result;
  try {
    log(`crawling ${server.base} ...`);
    result = await check({
      path: server.base,
      recurse: true,
      checkFragments: true,
      concurrency: 5,
      linksToSkip: async (link) => !link.startsWith(server.base),
    });
  } finally {
    await server.stop();
  }

  const broken = result.links.filter((l) => l.state === LinkState.BROKEN);
  const checked = result.links.filter((l) => l.state !== LinkState.SKIPPED);
  log(`checked ${checked.length} internal link(s)/anchor(s), ${broken.length} broken.`);

  if (broken.length > 0) {
    console.error("links-internal: broken internal link(s)/anchor(s):");
    for (const l of broken) {
      const status = l.status ?? "error";
      console.error(`  [${status}] ${l.url}${l.parent ? ` (linked from ${l.parent})` : ""}`);
    }
    process.exit(1);
  }

  log("clean — no broken internal links or anchors.");
}

main().catch((err) => {
  console.error(`links-internal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
