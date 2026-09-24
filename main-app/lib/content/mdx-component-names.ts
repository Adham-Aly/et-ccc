// lib/content/mdx-component-names.ts — the fixed set of JSX tag names a lesson .mdx file may use
// (brief §4, plan §4.6.1: "authors never import"). Kept as a plain-data module (no JSX) so
// scripts/gates/content-check.ts's static G-SCHEMA check (design-review.md A1-4: "confirm an
// unknown MDX component fails content:check/build, not just at render time") can read it through
// the Node type-stripping register hook (tools/viz/register.mjs: "only .ts files are loadable
// this way — no JSX"), without pulling in lib/content/mdx-components.tsx's React component code.
//
// lib/content/mdx-components.tsx's `createMdxComponents()` returns exactly these keys —
// tests/unit/content/mdx-component-names.test.ts asserts the two never drift apart.
export const MDX_COMPONENT_NAMES = [
  "Callout",
  "Term",
  "Details",
  "Code",
  "Output",
  "ProblemLink",
  "Practice",
  "JudgeLink",
  // The visual components (components/viz/mdx.tsx's createVizComponents), spread into the map by
  // lib/content/mdx-components.tsx.
  "Figure",
  "Diagram",
  "StepThrough",
  "CodeTrace",
  "Scene",
] as const;
