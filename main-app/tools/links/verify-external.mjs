#!/usr/bin/env node
// tools/links/verify-external.mjs — G-LINK-EXT (plan §7: "External non-judge links resolve").
//
// Run MANUALLY only, never from verify:fast/verify:full or any test suite (plan "determinism: no
// network in normal tests" — the same reason tools/links/verify-judges.mjs is manual-only).
// Invoke with `npm run links:external` from `main-app/`.
//
// Checks every entry in content/registry/external-links.yaml (the allow-list G-LINK-FMT resolves
// every raw external URL in lesson MDX against). Two techniques, reused from verify-judges.mjs:
//
//   - wmoj.ca URLs (wmoj-home, wmoj-signup): a plain HTTP 200 proves nothing — WMOJ answers 200
//     even for a broken/missing page, with the literal marker `NEXT_HTTP_ERROR_FALLBACK` in the
//     body (verify-judges.mjs's own comment). So these get the same body check, not just a status
//     check.
//   - dmoj.ca URLs (dmoj-home, dmoj-signup): sits behind Cloudflare; this script does not try to
//     get past it (plan §4.7, no circumvention) — recorded as "manual", same as every DMOJ
//     problem link, not attempted automatically.
//   - Everything else (docs.python.org, cemc.uwaterloo.ca, ...): a plain reachability check —
//     status 2xx counts as ok, anything else (4xx/5xx/timeout/DNS failure) is a failure.
//
// Writes work/04-app/external-links-run-1.md (always this filename — "run 1" means "the record of
// the most recent run", not a session counter, matching wmoj-verification-run-1.md's convention).
// Never writes to verified.json (that file is judge-problem links only, a distinct schema).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN_APP_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(MAIN_APP_ROOT, "..");
const EXTERNAL_LINKS_YAML = path.join(MAIN_APP_ROOT, "content", "registry", "external-links.yaml");
const RUN_LOG_MD = path.join(REPO_ROOT, "work", "04-app", "external-links-run-1.md");

const POLITE_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = "et-ccc-link-verifier/1 (+manual run; contact: repo owner; one pass, no crawl)";
const WMOJ_ERROR_MARKER = "NEXT_HTTP_ERROR_FALLBACK";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function politeGet(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT },
      signal: controller.signal,
    });
    const body = await res.text();
    return { ok: true, status: res.status, body };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: "",
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function loadLinks() {
  const raw = fs.readFileSync(EXTERNAL_LINKS_YAML, "utf8");
  return parse(raw).links;
}

async function verifyLink(link) {
  const isDmoj = /\bdmoj\.ca\b/i.test(link.url);
  if (isDmoj) {
    return {
      id: link.id,
      url: link.url,
      status: "manual",
      note: "dmoj.ca is behind Cloudflare — never scraped (plan §4.7, no circumvention). Confirm by hand in a normal browser.",
    };
  }

  const res = await politeGet(link.url);
  const isWmoj = /\bwmoj\.ca\b/i.test(link.url);

  if (!res.ok) {
    return { id: link.id, url: link.url, status: "unverified", note: `fetch failed: ${res.error}` };
  }
  if (res.status < 200 || res.status >= 300) {
    return { id: link.id, url: link.url, status: "broken", note: `HTTP ${res.status}` };
  }
  if (isWmoj && res.body.includes(WMOJ_ERROR_MARKER)) {
    return {
      id: link.id,
      url: link.url,
      status: "broken",
      note: `HTTP ${res.status}, but the body is WMOJ's own "${WMOJ_ERROR_MARKER}" fallback page`,
    };
  }
  return { id: link.id, url: link.url, status: "ok", note: `HTTP ${res.status}` };
}

async function verifyAll(links) {
  console.log(`\n=== G-LINK-EXT (automated where possible) — ${links.length} link(s) ===`);
  const results = [];
  for (const link of links) {
    // eslint-disable-next-line no-await-in-loop
    const result = await verifyLink(link);
    console.log(
      `  ${result.status.padEnd(10)} ${link.id} (${link.url})${result.note ? ` — ${result.note}` : ""}`,
    );
    results.push(result);
    if (result.status !== "manual") {
      // eslint-disable-next-line no-await-in-loop
      await sleep(POLITE_DELAY_MS);
    }
  }
  return results;
}

function writeRunLog(results) {
  const ok = results.filter((r) => r.status === "ok").length;
  const broken = results.filter((r) => r.status === "broken").length;
  const unverified = results.filter((r) => r.status === "unverified").length;
  const manual = results.filter((r) => r.status === "manual").length;

  const lines = [
    "<!-- Written by `npm run links:external` (tools/links/verify-external.mjs) — always",
    "     overwrites this file with the latest run; do not hand-edit. -->",
    "",
    "# External links verification — run 1",
    "",
    `Run at: ${new Date().toISOString()}`,
    "Tool: `main-app/tools/links/verify-external.mjs` (`npm run links:external` from `main-app/`)",
    "",
    `${results.length} entries in \`content/registry/external-links.yaml\` checked. ${ok} ok, ${broken} broken, ${unverified} unverified (fetch failure — re-run), ${manual} manual (Cloudflare-protected, needs a by-hand check).`,
    "",
  ];

  if (broken > 0) {
    lines.push("## Broken", "");
    for (const r of results.filter((x) => x.status === "broken")) {
      lines.push(`- \`${r.id}\` (${r.url}): ${r.note}`);
    }
    lines.push("");
  }
  if (unverified > 0) {
    lines.push("## Could not verify (network failure — re-run)", "");
    for (const r of results.filter((x) => x.status === "unverified")) {
      lines.push(`- \`${r.id}\` (${r.url}): ${r.note}`);
    }
    lines.push("");
  }
  if (manual > 0) {
    lines.push("## Manual (Cloudflare-protected — confirm by hand)", "");
    for (const r of results.filter((x) => x.status === "manual")) {
      lines.push(`- \`${r.id}\` (${r.url}): ${r.note}`);
    }
    lines.push("");
  }
  lines.push("## All results", "", "| id | url | status | note |", "|---|---|---|---|");
  for (const r of results) {
    lines.push(`| \`${r.id}\` | ${r.url} | ${r.status} | ${r.note ?? ""} |`);
  }
  lines.push("");

  fs.mkdirSync(path.dirname(RUN_LOG_MD), { recursive: true });
  fs.writeFileSync(RUN_LOG_MD, lines.join("\n"), "utf8");
}

async function main() {
  const links = loadLinks();
  const results = await verifyAll(links);
  writeRunLog(results);
  console.log(`\nWrote work/04-app/external-links-run-1.md.`);

  const hardFailures = results.filter((r) => r.status === "broken" || r.status === "unverified");
  if (hardFailures.length > 0) {
    console.error(`\nlinks:external: ${hardFailures.length} link(s) not confirmed working:`);
    for (const r of hardFailures) console.error(`  - ${r.id}: ${r.status} (${r.note})`);
    process.exit(1);
  }
  console.log("\nlinks:external: every automatically-checkable link resolves.");
}

main();
