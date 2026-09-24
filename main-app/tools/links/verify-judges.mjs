#!/usr/bin/env node
// tools/links/verify-judges.mjs — the live judge-link verifier (plan §4.7, brief A6/A7).
//
// Run MANUALLY only, never from verify:fast/verify:full, prebuild, or any test suite (plan
// "determinism: no network in normal tests"; this is the one tool exempt from that rule because
// its entire job is checking the outside world). Invoke with `npm run links:verify` from
// `main-app/`.
//
// What it does:
//   1. WMOJ (2021-2026, automated): fetches https://wmoj.ca/sitemap.xml once as a reachability/
//      cross-reference check, then GETs each of the registry's WMOJ problem pages directly, one
//      at a time with a short delay ("politely" — plan §4.7). WMOJ answers HTTP 200 even for a
//      problem that does not exist, so status codes prove nothing: a missing problem's page body
//      contains the literal marker `NEXT_HTTP_ERROR_FALLBACK`; a present problem's page embeds a
//      `"problem":{"id":"<slug>","name":"CCC '<yy> <L><n> - <title>"}` JSON fragment we parse for
//      the judge's own title, which we compare against the registry's title.
//   2. DMOJ (2014-2020, Manager-assisted): DMOJ sits behind Cloudflare and we do not try to get
//      past it (plan §4.7 — no circumvention). Instead this script (re)writes
//      `work/04-app/dmoj-checklist.html`, a static checklist of every DMOJ URL with its expected
//      title, for the Manager to open in a normal browser and confirm by hand. Results only
//      become `status: "ok"`/`"method": "manual"` once someone edits `verified.json` themselves
//      after that manual pass (this script never marks a DMOJ entry "ok" on its own).
//   3. Writes `content/registry/verified.json` (schema: `verifiedFileSchema`,
//      `lib/content/schemas.ts`) — the single source G-LINK-LIVE reads. No silent fallback: a
//      missing or mismatched problem is recorded as such, never dropped or guessed at.
//
// This file, and this file only, is allowed to hold a raw `wmoj.ca`/`dmoj.ca` string outside
// `lib/registry/judge-url.ts` (tools/lint/no-raw-judge-urls.mjs allow-lists both).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN_APP_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(MAIN_APP_ROOT, "..");
const REGISTRY_YAML = path.join(MAIN_APP_ROOT, "content", "registry", "ccc-problems.yaml");
const VERIFIED_JSON = path.join(MAIN_APP_ROOT, "content", "registry", "verified.json");
const DMOJ_CHECKLIST_HTML = path.join(REPO_ROOT, "work", "04-app", "dmoj-checklist.html");
const RUN_LOG_MD = path.join(REPO_ROOT, "work", "04-app", "wmoj-verification-run-1.md");

const WMOJ_ORIGIN = "https://wmoj.ca";
const DMOJ_ORIGIN = "https://dmoj.ca";
const POLITE_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = "et-ccc-link-verifier/1 (+manual run; contact: repo owner; one pass, no crawl)";

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

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_YAML, "utf8");
  const data = parse(raw);
  return data.problems;
}

function judgeWmojUrl(slug) {
  return `${WMOJ_ORIGIN}/problems/${slug}`;
}
function judgeDmojUrl(slug) {
  return `${DMOJ_ORIGIN}/problem/${slug}/`;
}

/** Extracts the judge-side title from a WMOJ problem page's embedded JSON, e.g.
 * `"problem":{"id":"ccc23j1","name":"CCC '23 J1 - Deliv-e-droid",...}` -> "Deliv-e-droid". */
function extractWmojTitle(body, slug) {
  // The page embeds this fragment inside a JS string literal in a <script> tag, so every quote
  // in it is backslash-escaped in the raw response bytes (`\"problem\":{\"id\":\"ccc23j1\"...`);
  // unescape once before matching rather than trying to encode that into the regex itself.
  const unescaped = body.replace(/\\"/g, '"');
  const re = new RegExp(`"problem":\\{"id":"${slug}","name":"([^"]*)"`);
  const m = unescaped.match(re);
  if (!m?.[1]) return null;
  const name = m[1];
  const dash = name.indexOf(" - ");
  return dash === -1 ? name.trim() : name.slice(dash + 3).trim();
}

async function verifyWmoj(problems) {
  console.log(`\n=== WMOJ (automated) — ${problems.length} problems ===`);

  // Step 1: sitemap, as a reachability + cross-reference check (not the source of truth for
  // which slugs to check — we always check every registry WMOJ id directly, next).
  const sitemapRes = await politeGet(`${WMOJ_ORIGIN}/sitemap.xml`);
  const sitemapSlugs = new Set();
  if (sitemapRes.ok && sitemapRes.status === 200) {
    for (const m of sitemapRes.body.matchAll(
      /<loc>https:\/\/wmoj\.ca\/problems\/([^<]+)<\/loc>/g,
    )) {
      sitemapSlugs.add(m[1]);
    }
    console.log(`sitemap.xml: reachable, ${sitemapSlugs.size} /problems/<slug> entries listed.`);
  } else {
    console.log(
      `sitemap.xml: could not fetch (status ${sitemapRes.status}${sitemapRes.error ? `, ${sitemapRes.error}` : ""}) — continuing with direct per-problem checks.`,
    );
  }

  const results = [];
  for (const p of problems) {
    await sleep(POLITE_DELAY_MS);
    const url = judgeWmojUrl(p.id);
    const inSitemap = sitemapSlugs.has(p.id);
    const res = await politeGet(url);
    const checkedAt = new Date().toISOString();

    if (!res.ok) {
      results.push({
        id: p.id,
        status: "unverified",
        checkedAt,
        method: "automated",
        note: res.error,
      });
      console.log(`  ${p.id}  FETCH FAILED  (${res.error})`);
      continue;
    }
    if (res.body.includes("NEXT_HTTP_ERROR_FALLBACK")) {
      results.push({ id: p.id, status: "missing", checkedAt, method: "automated" });
      console.log(`  ${p.id}  MISSING${inSitemap ? " (unexpectedly in sitemap)" : ""}`);
      continue;
    }
    const titleOnJudge = extractWmojTitle(res.body, p.id);
    if (!titleOnJudge) {
      results.push({ id: p.id, status: "unverified", checkedAt, method: "automated" });
      console.log(`  ${p.id}  present but title not parseable — recorded unverified`);
      continue;
    }
    const status = titleOnJudge === p.title ? "ok" : "mismatch";
    results.push({ id: p.id, status, checkedAt, method: "automated", titleOnJudge });
    console.log(
      status === "ok"
        ? `  ${p.id}  OK  "${titleOnJudge}"`
        : `  ${p.id}  MISMATCH  registry="${p.title}"  judge="${titleOnJudge}"`,
    );
  }
  return results;
}

/** DMOJ: never scraped. Always recorded "unverified"/"manual" until a human confirms and someone
 * hand-edits verified.json to "ok" with a date and confirmer (plan §4.7 — no circumvention). */
function recordDmoj(problems) {
  const checkedAt = new Date().toISOString();
  return problems.map((p) => ({ id: p.id, status: "unverified", checkedAt, method: "manual" }));
}

function writeDmojChecklist(problems) {
  const rows = problems
    .map(
      (p) => `      <tr>
        <td><input type="checkbox" aria-label="Confirmed ${p.id}"></td>
        <td>${p.id}</td>
        <td><a href="${judgeDmojUrl(p.id)}" target="_blank" rel="noopener noreferrer">${judgeDmojUrl(p.id)}</a></td>
        <td>${p.title}</td>
      </tr>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DMOJ checklist — et-ccc P4</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 2rem; color: #111; background: #fff; }
  h1 { font-size: 1.2rem; }
  p { color: #444; max-width: 60em; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
  th, td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; position: sticky; top: 0; }
  td:first-child { text-align: center; width: 2.5rem; }
  tr:target { background: #fff7cc; }
</style>
</head>
<body>
<h1>DMOJ checklist — ${problems.length} problems (CCC 2014-2020)</h1>
<p>
  DMOJ sits behind Cloudflare and this tool never tries to get past it (plan §4.7). Open each
  link in a normal browser, confirm the problem exists and its title matches the "expected
  title" column, then check its box. When done, tell the app &amp; QA engineer (or hand-edit
  <code>content/registry/verified.json</code> yourself): set each confirmed id's
  <code>status</code> to <code>"ok"</code>, <code>method</code> to <code>"manual"</code>, and
  <code>checkedAt</code> to today's date. Anything you could not confirm should stay
  <code>"missing"</code> with a note of what you saw instead — never left silently as-is.
</p>
<table>
  <thead>
    <tr><th>Done</th><th>id</th><th>URL</th><th>Expected title</th></tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(DMOJ_CHECKLIST_HTML), { recursive: true });
  fs.writeFileSync(DMOJ_CHECKLIST_HTML, html, "utf8");
}

function writeRunLog(wmojResults, dmojProblems) {
  const ok = wmojResults.filter((r) => r.status === "ok").length;
  const missing = wmojResults.filter((r) => r.status === "missing").length;
  const mismatch = wmojResults.filter((r) => r.status === "mismatch").length;
  const unverified = wmojResults.filter((r) => r.status === "unverified").length;

  const lines = [
    "# WMOJ verification — run 1",
    "",
    `Run at: ${new Date().toISOString()}`,
    `Tool: \`main-app/tools/links/verify-judges.mjs\` (\`npm run links:verify\` from \`main-app/\`)`,
    "",
    `${wmojResults.length} WMOJ problems checked (registry entries with year 2021-2026). ${ok} ok, ${mismatch} mismatch, ${missing} missing, ${unverified} unverified (fetch or parse failure).`,
    "",
  ];

  if (mismatch > 0) {
    lines.push("## Title mismatches (registry vs. judge)", "");
    for (const r of wmojResults.filter((x) => x.status === "mismatch")) {
      lines.push(`- \`${r.id}\`: judge says "${r.titleOnJudge}"`);
    }
    lines.push("");
  }
  if (missing > 0) {
    lines.push("## Missing on WMOJ", "");
    for (const r of wmojResults.filter((x) => x.status === "missing")) {
      lines.push(`- \`${r.id}\``);
    }
    lines.push("");
  }
  if (unverified > 0) {
    lines.push("## Could not verify (network/parse failure — re-run)", "");
    for (const r of wmojResults.filter((x) => x.status === "unverified")) {
      lines.push(`- \`${r.id}\`${r.note ? `: ${r.note}` : ""}`);
    }
    lines.push("");
  }

  lines.push(
    "## DMOJ",
    "",
    `${dmojProblems.length} DMOJ problems (2014-2020) — never scraped (Cloudflare, plan §4.7). Checklist written to \`work/04-app/dmoj-checklist.html\` for the Manager to confirm by hand; all recorded \`unverified\`/\`manual\` in \`verified.json\` until then.`,
    "",
    "## No silent fallback",
    "",
    "Every problem above is recorded in `content/registry/verified.json` with its actual status — nothing missing or mismatched was dropped or guessed at.",
    "",
  );
  fs.mkdirSync(path.dirname(RUN_LOG_MD), { recursive: true });
  fs.writeFileSync(RUN_LOG_MD, lines.join("\n"), "utf8");
}

async function main() {
  const problems = loadRegistry();
  const wmojProblems = problems.filter((p) => p.year >= 2021);
  const dmojProblems = problems.filter((p) => p.year <= 2020);

  const wmojResults = await verifyWmoj(wmojProblems);
  const dmojResults = recordDmoj(dmojProblems);
  writeDmojChecklist(dmojProblems);

  const entries = [...wmojResults, ...dmojResults].map(({ note, ...rest }) => rest);
  const verifiedFile = { entries };
  fs.mkdirSync(path.dirname(VERIFIED_JSON), { recursive: true });
  fs.writeFileSync(VERIFIED_JSON, `${JSON.stringify(verifiedFile, null, 2)}\n`, "utf8");

  writeRunLog(wmojResults, dmojProblems);

  console.log(`\nWrote content/registry/verified.json (${entries.length} entries).`);
  console.log(
    `Wrote work/04-app/dmoj-checklist.html (${dmojProblems.length} rows, for the Manager).`,
  );
  console.log(`Wrote work/04-app/wmoj-verification-run-1.md.`);

  const failures = wmojResults.filter((r) => r.status !== "ok");
  if (failures.length > 0) {
    console.log(
      `\n${failures.length} WMOJ problem(s) are not "ok" — see the run log. This is informational; links:verify never fails the build (G-LINK-LIVE is the release gate that reads verified.json).`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
