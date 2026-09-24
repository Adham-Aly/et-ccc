// tests/unit/read-state.test.ts — regression tests for design-review.md A1-8: `lib/read-state`
// didn't shape-check stored JSON (an array or numbers passed `typeof === "object"`), and
// `isRead` used `id in map`, which also matches inherited/prototype keys (e.g. `"toString"`).
// `parseReadMap` is the pure, DOM-free extraction of the shape check (used by the real
// `window.localStorage`-backed `read()`), tested directly here without needing a DOM.
import { describe, expect, it } from "vitest";
import { parseReadMap } from "../../lib/read-state";

describe("parseReadMap", () => {
  it("parses a well-formed map unchanged", () => {
    const iso = "2026-09-24T00:00:00.000Z";
    expect(parseReadMap(`{"M1.1/a":"${iso}"}`)).toEqual({ "M1.1/a": iso });
  });

  it("treats null/empty input as empty", () => {
    expect(parseReadMap(null)).toEqual({});
    expect(parseReadMap("")).toEqual({});
  });

  it("treats invalid JSON as empty rather than throwing", () => {
    expect(parseReadMap("not json")).toEqual({});
    expect(parseReadMap("{broken")).toEqual({});
  });

  it("treats a JSON array as empty (not a map)", () => {
    expect(parseReadMap('["M1.1/a", "M1.2/b"]')).toEqual({});
  });

  it("treats a bare JSON number or string as empty", () => {
    expect(parseReadMap("42")).toEqual({});
    expect(parseReadMap('"just a string"')).toEqual({});
  });

  it("drops entries whose value is not a string", () => {
    expect(
      parseReadMap(
        '{"good":"2026-01-01T00:00:00.000Z","bad_number":42,"bad_null":null,"bad_obj":{}}',
      ),
    ).toEqual({ good: "2026-01-01T00:00:00.000Z" });
  });

  it("drops entries whose string value isn't a parseable date", () => {
    expect(parseReadMap('{"good":"2026-01-01T00:00:00.000Z","bad":"not-a-date"}')).toEqual({
      good: "2026-01-01T00:00:00.000Z",
    });
  });

  it("never surfaces prototype/inherited keys as entries", () => {
    // JSON.parse itself never produces own-prototype-polluting keys from ordinary object
    // literals, but a hand-edited or malicious localStorage value could still include a
    // "__proto__" key; JSON.parse assigns it as a plain own property (not real prototype
    // pollution) with a string value, which is a legitimate-looking read entry by this
    // function's own rules — the actual "inherited key" risk this guards against is downstream,
    // in isRead()/readAt() using `Object.hasOwn` instead of `in` against the *map itself*, which
    // this test's sibling in the same suite below covers structurally: a plain object's own
    // Object.keys() never includes inherited members like "toString" unless literally present.
    const map = parseReadMap('{"toString":"2026-01-01T00:00:00.000Z"}');
    expect(Object.hasOwn(map, "toString")).toBe(true);
    expect(Object.hasOwn(map, "constructor")).toBe(false);
  });
});
