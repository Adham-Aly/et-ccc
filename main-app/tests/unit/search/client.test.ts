// tests/unit/search/client.test.ts — regression test for a bug W2 hit end to end: the search
// panel's "Try again" button never recovered after one failed `/search-index.json` fetch,
// because `loadSearch()` cached the rejected promise forever. Reproduces the failure first (a
// second call after a failed first call used to return the *same* rejected promise instead of
// retrying), then proves the fix (lib/search/client.ts clears `cached` on rejection).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_FETCH = globalThis.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("loadSearch", () => {
  it("retries after a failed fetch instead of replaying the same rejection forever", async () => {
    const failing = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    globalThis.fetch = failing as unknown as typeof fetch;

    const { loadSearch } = await import("../../../lib/search/client");

    await expect(loadSearch()).rejects.toThrow("search index fetch failed: 500");
    expect(failing).toHaveBeenCalledTimes(1);

    // A user hitting "Try again" calls loadSearch() again. With the bug, this returned the same
    // cached rejected promise and never touched the network again.
    const succeeding = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          kind: "lesson",
          id: "m1/l1",
          title: "A lesson",
          label: "A lesson",
          href: "/learn/s0/M0.1/l1",
        },
      ],
    });
    globalThis.fetch = succeeding as unknown as typeof fetch;

    const engine = await loadSearch();
    expect(succeeding).toHaveBeenCalledTimes(1);
    expect(engine.search("lesson")).toHaveLength(1);
  });

  it("caches a successful load so a third call makes no further network request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { loadSearch } = await import("../../../lib/search/client");
    await loadSearch();
    await loadSearch();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
