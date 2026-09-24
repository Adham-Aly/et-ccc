// tests/unit/content/mdx-component-names.test.ts — keeps lib/content/mdx-component-names.ts (a
// plain-data module content-check.ts's Node-type-stripping gate script can load without a JSX
// transform) in sync with the real, JSX-bearing component map in
// lib/content/mdx-components.tsx. If a component is ever added, renamed or removed in one file
// without the other, content:check's static "unknown MDX component" check (design-review.md
// A1-4) would silently drift out of date — this test fails loudly instead.
import { describe, expect, it } from "vitest";
import { MDX_COMPONENT_NAMES } from "../../../lib/content/mdx-component-names";
import { createMdxComponents } from "../../../lib/content/mdx-components";

describe("MDX_COMPONENT_NAMES matches the real component map", () => {
  it("has exactly the same keys as createMdxComponents() returns", () => {
    const real = Object.keys(createMdxComponents({ moduleDir: process.cwd() })).sort();
    const declared = [...MDX_COMPONENT_NAMES].sort();
    expect(declared).toEqual(real);
  });
});
