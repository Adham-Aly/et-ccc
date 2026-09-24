// tests/unit/scripts/port-lease.test.ts — regression test for a real bug (orchestrator relay,
// found by W3): scripts/port-lease.mjs's checkPortFree() only tried to bind 127.0.0.1, so a
// server already listening on `::` (IPv6 "any address", which — unless IPV6_V6ONLY is set —
// also accepts IPv4 connections on the same port on macOS/Linux) could still let a *second*
// bind to 127.0.0.1 on the same port succeed, so leasePort() handed out a port that was already
// serving something else (this is exactly what happened to W3: a leased port collided with an
// already-running dev server). Fixed by checking every host a server might realistically bind
// to (127.0.0.1, ::1, 0.0.0.0, ::) and treating the port as free only when all of them are.
import net from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { checkPortFree } from "../../../scripts/port-lease.mjs";

describe("checkPortFree", () => {
  let occupied: net.Server | null = null;

  afterEach(async () => {
    if (occupied) {
      await new Promise<void>((resolve) => occupied?.close(() => resolve()));
      occupied = null;
    }
  });

  it("reports a genuinely free port as free", async () => {
    // Ask the OS for an ephemeral port, then immediately release it — vanishingly unlikely to
    // be reclaimed by anything else inside this test's lifetime.
    const probe = net.createServer();
    const port = await new Promise<number>((resolve, reject) => {
      probe.once("error", reject);
      probe.listen(0, "127.0.0.1", () => {
        const address = probe.address();
        resolve(typeof address === "object" && address ? address.port : 0);
      });
    });
    await new Promise<void>((resolve) => probe.close(() => resolve()));

    expect(await checkPortFree(port)).toBe(true);
  });

  it("reports a port bound on 127.0.0.1 as busy", async () => {
    occupied = net.createServer();
    const port = await new Promise<number>((resolve, reject) => {
      occupied?.once("error", reject);
      occupied?.listen(0, "127.0.0.1", () => {
        const address = occupied?.address();
        resolve(typeof address === "object" && address ? address.port : 0);
      });
    });

    expect(await checkPortFree(port)).toBe(false);
  });

  it("reports a port bound on :: (IPv6 any) as busy — the bug this regression test covers", async () => {
    occupied = net.createServer();
    let port: number;
    try {
      port = await new Promise<number>((resolve, reject) => {
        occupied?.once("error", reject);
        occupied?.listen(0, "::", () => {
          const address = occupied?.address();
          resolve(typeof address === "object" && address ? address.port : 0);
        });
      });
    } catch (err) {
      // Some sandboxes disallow binding IPv6 entirely; that's a real environment constraint,
      // not something this test can fix, so skip rather than fail on an unrelated limitation.
      occupied = null;
      console.warn(`skipping :: bind test: ${(err as Error).message}`);
      return;
    }

    expect(await checkPortFree(port)).toBe(false);
  });
});
