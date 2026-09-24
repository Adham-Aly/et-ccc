// npm run viz:shots [-- --scope <id>] [-- --url=http://localhost:4100] [-- --page=/path]
//                   [-- --widths=390,768,1440] [-- --out=<dir>] [-- --no-crawl] [-- --all-steps]
//
// Screenshots every visual (each <figure class="vz-figure">) on /dev/viz and on every lesson page
// reachable from /learn, at its first, middle and last step, at a phone, a tablet and a desktop width.
// While doing so it checks, in a real browser, what the static G-VIZ width check predicts:
// every SVG text renders at no less than 14 px (values) or 12 px (labels and titles) and only
// from the app's two font families (no fallback glyphs), the page
// never scrolls sideways, and the console stays free of errors and warnings.
//
// Without --url it leases a port (scripts/port-lease.mjs), starts `next dev`, writes
// work/04-app/_run/viz-shots.pid, and stops the server and releases the port when done.
import { type ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { APP_ROOT, parseArgs } from "./lib";

const MIN_PX = { value: 14, label: 12, title: 12 } as const;
const HEADER_CLEARANCE = 96;

interface Problem {
  where: string;
  message: string;
}

function option(flags: Set<string>, name: string): string[] {
  return [...flags].filter((f) => f.startsWith(`${name}=`)).map((f) => f.slice(name.length + 1));
}

const { scope, flags } = parseArgs(process.argv.slice(2));
const widths = (option(flags, "widths")[0] ?? "390,768,1440").split(",").map(Number);
const outDir = path.resolve(APP_ROOT, option(flags, "out")[0] ?? "test-results/viz-shots");
const extraPages = option(flags, "page");
const crawl = !flags.has("no-crawl");
/** `--all-steps`: shoot every step of every preset instead of first, middle and last. */
const allSteps = flags.has("all-steps");
const RUN_DIR = path.resolve(APP_ROOT, "..", "work", "04-app", "_run");

async function waitForServer(url: string, child: ChildProcess | null): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) throw new Error("next dev exited before it was ready");
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} did not answer within 120 s`);
}

/** Does anything accept connections on localhost:port (IPv4 or IPv6)? */
function answers(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host: "localhost" });
    sock.once("connect", () => {
      sock.destroy();
      resolve(true);
    });
    sock.once("error", () => resolve(false));
  });
}

async function startServer(): Promise<{ base: string; stop: () => Promise<void> }> {
  const lease = (await import(path.join(APP_ROOT, "scripts", "port-lease.mjs"))) as {
    leasePort: (
      name: string,
      o: { releaseOnExit: boolean },
    ) => Promise<{ port: number; release: () => void }>;
  };
  // A leased port can still have a listener that took it without a lease (the lease probe
  // binds 127.0.0.1 only; `next dev` listens on ::). Keep such a lease, so the next call skips
  // it, and lease again.
  const held: (() => void)[] = [];
  let leased = await lease.leasePort("viz-shots", { releaseOnExit: true });
  while (await answers(leased.port)) {
    held.push(leased.release);
    leased = await lease.leasePort("viz-shots", { releaseOnExit: true });
  }
  for (const r of held) r();
  const { port, release } = leased;
  const nextBin = path.join(APP_ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
    cwd: APP_ROOT,
    env: process.env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout?.on("data", (d) => {
    log += String(d);
  });
  child.stderr?.on("data", (d) => {
    log += String(d);
  });
  fs.mkdirSync(RUN_DIR, { recursive: true });
  const pidFile = path.join(RUN_DIR, "viz-shots.pid");
  fs.writeFileSync(pidFile, `${child.pid}\n`);
  const base = `http://localhost:${port}`;
  const stop = async () => {
    if (child.exitCode === null && child.pid) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // already gone
      }
      await new Promise((r) => setTimeout(r, 800));
      if (child.exitCode === null) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          // already gone
        }
      }
    }
    fs.rmSync(pidFile, { force: true });
    release();
  };
  try {
    await waitForServer(`${base}/dev/viz`, child);
  } catch (err) {
    await stop();
    // Next runs one dev server per project; when one is already up, it names it. Use that one
    // (read-only: it is someone else's, so it is never stopped here).
    const existing = /access the existing server at (http:\/\/\S+?),?\s/.exec(log)?.[1];
    if (existing) {
      console.log(`viz:shots: using the dev server already running at ${existing}`);
      await waitForServer(`${existing}/dev/viz`, null);
      return { base: existing, stop: async () => {} };
    }
    throw new Error(`${(err as Error).message}\n${log.slice(-2000)}`);
  }
  return { base, stop };
}

/** Lesson pages reachable from /learn (stage → module → lesson links). */
async function crawlLessons(browser: Browser, base: string): Promise<string[]> {
  const page = await browser.newPage();
  const seen = new Set<string>();
  const lessons = new Set<string>();
  const queue = ["/learn"];
  while (queue.length > 0) {
    const url = queue.shift() as string;
    if (seen.has(url)) continue;
    seen.add(url);
    const res = await page.goto(base + url, { waitUntil: "domcontentloaded" });
    if (!res || res.status() >= 400) continue;
    const links = await page.$$eval('a[href^="/learn/"]', (as) =>
      as.map((a) => new URL((a as HTMLAnchorElement).href).pathname.replace(/\/$/, "")),
    );
    for (const l of links) {
      const depth = l.split("/").filter(Boolean).length;
      if (depth === 4) lessons.add(l);
      else if (depth < 4 && !seen.has(l)) queue.push(l);
    }
  }
  await page.close();
  return [...lessons].filter((l) => !scope || l.includes(scope.toLowerCase().replace(".", "-")));
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
}

/** Every SVG text inside the figure that renders below its role's minimum. */
/** The app's two families (DESIGN.md → Typography); anything else in a visual is a fallback. */
const APP_FONTS = /^Atkinson Hyperlegible (Next|Mono)\b/;

/**
 * Every SVG text in the figure whose glyphs came (even partly) from a font outside the app's two
 * families, as Chromium reports it (CSS.getPlatformFontsForNode): a missing glyph in our fonts.
 */
async function fallbackGlyphs(page: Page, fig: number): Promise<string[]> {
  // CDP node ids go stale if React replaces nodes mid-query; take one fresh snapshot and retry.
  try {
    return await fallbackGlyphsOnce(page, fig);
  } catch {
    await settle(page);
    return fallbackGlyphsOnce(page, fig);
  }
}

async function fallbackGlyphsOnce(page: Page, fig: number): Promise<string[]> {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds: figs } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "figure.vz-figure",
    });
    const figId = figs[fig];
    if (figId === undefined) return [];
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: figId,
      selector: "svg text, svg tspan",
    });
    const bad: string[] = [];
    for (const nodeId of nodeIds) {
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      const foreign = fonts.filter((f) => !APP_FONTS.test(f.familyName));
      if (foreign.length === 0) continue;
      const { outerHTML } = await cdp.send("DOM.getOuterHTML", { nodeId });
      const text = outerHTML.replace(/<[^>]+>/g, "");
      bad.push(`"${text}" uses ${foreign.map((f) => f.familyName).join(", ")}`);
    }
    return bad;
  } finally {
    await cdp.detach();
  }
}

async function smallText(page: Page, fig: number): Promise<string[]> {
  return page.evaluate(
    ({ fig, min }) => {
      const el = document.querySelectorAll("figure.vz-figure")[fig];
      if (!el) return [];
      const bad: string[] = [];
      for (const t of el.querySelectorAll<SVGTextElement>("svg text")) {
        const cls = t.getAttribute("class") ?? "";
        const role = cls.includes("vz-t-value")
          ? "value"
          : cls.includes("vz-t-title")
            ? "title"
            : "label";
        const style = getComputedStyle(t);
        if (style.display === "none" || style.visibility === "hidden" || !t.textContent?.trim())
          continue;
        const ctm = t.getScreenCTM();
        if (!ctm) continue;
        const px = Number.parseFloat(style.fontSize) * Math.hypot(ctm.a, ctm.b);
        const need = min[role as keyof typeof min];
        if (px + 0.05 < need)
          bad.push(`"${t.textContent.trim()}" ${px.toFixed(1)} px (${role}, min ${need})`);
      }
      return bad;
    },
    { fig, min: MIN_PX },
  );
}

async function shootPage(browser: Browser, base: string, url: string, problems: Problem[]) {
  const slug = url.replace(/^\//, "").replace(/\//g, "_") || "home";
  let shots = 0;
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: width < 640 ? 844 : 900 },
      reducedMotion: "reduce",
    });
    const logs: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") logs.push(m.text());
    });
    page.on("pageerror", (e) => logs.push(String(e)));
    try {
      await page.goto(base + url, { waitUntil: "networkidle" });
    } catch (err) {
      // A dev server can drop a connection while it (re)compiles; wait for it once and retry.
      console.log(
        `viz:shots: ${url} @${width}: ${(err as Error).message.split("\n")[0]}; retrying once`,
      );
      await waitForServer(base + url, null);
      await page.goto(base + url, { waitUntil: "networkidle" });
    }
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await settle(page);
    const count = await page.locator("figure.vz-figure").count();
    for (let i = 0; i < count; i += 1) {
      const fig = page.locator("figure.vz-figure").nth(i);
      const name =
        (await fig.evaluate((f) => f.closest("[data-gallery]")?.getAttribute("data-gallery"))) ??
        `${i + 1}-${await fig.getAttribute("data-viz")}`;
      if (scope && url.startsWith("/dev/") && !name.includes(scope)) continue;
      const where = `${url} [${name}] @${width}`;
      await fig.evaluate((f, clear) => {
        window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - clear);
      }, HEADER_CLEARANCE);
      const group = fig.locator('[role="group"][data-player]');
      const isPlayer = (await group.count()) > 0;
      const frozen = (await fig.locator(".vz-mount[data-frozen]").count()) > 0;
      const stepsToShoot: [string, (() => Promise<void>) | null][] = [["first", null]];
      if (isPlayer && !frozen) {
        await page
          .locator("figure.vz-figure")
          .nth(i)
          .locator("[data-player][data-ready]")
          .waitFor({ timeout: 15_000 })
          .catch(() => problems.push({ where, message: "the player never hydrated" }));
        const total = Number(
          (await fig.locator('input[data-ctl="scrub"]').getAttribute("max")) ?? 1,
        );
        const mid = Math.floor((total - 1) / 2);
        await group.focus();
        await page.keyboard.press("Home");
        if (total > 2) {
          stepsToShoot.push([
            "mid",
            async () => {
              await group.focus();
              await page.keyboard.press("Home");
              for (let k = 0; k < mid; k += 1) await page.keyboard.press("ArrowRight");
            },
          ]);
        }
        if (total > 1) {
          stepsToShoot.push([
            "last",
            async () => {
              await group.focus();
              await page.keyboard.press("End");
            },
          ]);
        }
      }
      if (allSteps && isPlayer && !frozen) {
        // Every step of every preset: p<preset>-s<step>.
        stepsToShoot.length = 0;
        const presets = Math.max(1, await fig.locator('input[data-ctl^="preset-"]').count());
        for (let k = 0; k < presets; k += 1) {
          if (presets > 1) await fig.locator(`input[data-ctl="preset-${k}"]`).check();
          const n = Number((await fig.locator('input[data-ctl="scrub"]').getAttribute("max")) ?? 1);
          for (let st = 0; st < n; st += 1) {
            const pk = k;
            const target = st;
            stepsToShoot.push([
              `p${k + 1}-s${String(st + 1).padStart(2, "0")}`,
              async () => {
                if (presets > 1) await fig.locator(`input[data-ctl="preset-${pk}"]`).check();
                await group.focus();
                await page.keyboard.press("Home");
                for (let m = 0; m < target; m += 1) await page.keyboard.press("ArrowRight");
              },
            ]);
          }
        }
      }
      for (const [label, go] of stepsToShoot) {
        if (go) await go();
        // The keys above leave keyboard focus on the player, whose :focus-visible ring sits 2 px
        // outside the frame; an element shot would clip it to a stray line. Blur before shooting.
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        await settle(page);
        for (const s of await smallText(page, i)) {
          problems.push({ where: `${where} ${label}`, message: `text too small: ${s}` });
        }
        if (width === widths[0]) {
          for (const s of await fallbackGlyphs(page, i)) {
            problems.push({
              where: `${where} ${label}`,
              message: `glyph from a fallback font: ${s}`,
            });
          }
        }
        const file = path.join(outDir, `${slug}-${width}-${name}-${label}.png`);
        await fig.screenshot({ path: file, animations: "disabled" });
        shots += 1;
      }
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0)
      problems.push({
        where: `${url} @${width}`,
        message: `page scrolls sideways by ${overflow} px`,
      });
    for (const l of logs)
      problems.push({ where: `${url} @${width}`, message: `console: ${l.slice(0, 300)}` });
    await page.close();
  }
  return shots;
}

async function main(): Promise<number> {
  fs.mkdirSync(outDir, { recursive: true });
  const given = option(flags, "url")[0];
  const server = given
    ? { base: given.replace(/\/$/, ""), stop: async () => {} }
    : await startServer();
  const problems: Problem[] = [];
  let shots = 0;
  let pages: string[] = [];
  const browser = await chromium.launch();
  try {
    if (!given) await waitForServer(`${server.base}/dev/viz`, null);
    pages = ["/dev/viz", ...extraPages];
    if (crawl) pages.push(...(await crawlLessons(browser, server.base)));
    for (const url of pages) shots += await shootPage(browser, server.base, url, problems);
  } finally {
    await browser.close();
    await server.stop();
  }
  for (const p of problems) console.error(`viz:shots ${p.where}: ${p.message}`);
  console.log(
    `viz:shots: ${pages.length} page(s), ${shots} screenshot(s) in ${path.relative(APP_ROOT, outDir)}, ${problems.length} problem(s).`,
  );
  return problems.length > 0 ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`viz:shots: ${(err as Error).stack ?? err}`);
    process.exit(1);
  },
);
