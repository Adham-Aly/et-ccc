// tests/unit/content/mdx-fenced-code.test.ts — regression test for a real bug (relayed via
// requests.md, W2's r8 review): fenced code in a lesson MDX file loses its indentation. Root
// cause: lib/content/remark-fenced-code.ts turned a fenced block's source text into an MDX JSX
// *child text node*. MDX/JSX text children go through the standard JSX whitespace-cleaning
// algorithm at compile time (trim each line, drop blank lines, join with a single space) — the
// same rule that lets you indent JSX in your own source without it leaking into rendered text.
// That is correct for prose but wrong for a code block's children: it silently flattens
// multi-line, indented Python into one line. This test compiles real MDX through the same
// `evaluate()` + `remarkFencedCode` pipeline `lib/content/mdx.ts` uses (renders the resulting
// element tree so the component actually receives its props — creating an element does not
// invoke the component), and checks the exact fixture block from
// tests/fixtures/content/stages/fx-fixture/M90.1-fixture-text-and-code/lessons/components-one.mdx
// (a `match`/`case` block marked `bad38`) reaches `<Code>` with its indentation intact.
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { remarkFencedCode } from "../../../lib/content/remark-fenced-code";

// The exact fenced block from the fixture lesson (kept inline so this test does not depend on
// the fixture file's prose staying byte-identical around it).
const SOURCE = [
  "```python bad38",
  "match len([1, 2, 3]):",
  "    case 3:",
  '        print("three items")',
  "    case _:",
  '        print("some other count")',
  "```",
  "",
].join("\n");

const EXPECTED_CODE = [
  "match len([1, 2, 3]):",
  "    case 3:",
  '        print("three items")',
  "    case _:",
  '        print("some other count")',
].join("\n");

describe("remarkFencedCode through @mdx-js/mdx evaluate()", () => {
  it("passes a fenced block's original indentation and line breaks to <Code>, not flattened JSX child text", async () => {
    // A plain object (not a `let`, to sidestep TS narrowing a closure-mutated `let` to `never`)
    // holding whatever props the stub below captures.
    const captured: { props: Record<string, unknown> | null } = { props: null };
    // A stub standing in for the real `Code` from lib/content/mdx-components.tsx: only captures
    // the props MDX actually delivers, so this test fails the same way regardless of whether the
    // text arrives as `children` (the bug) or a `code` attribute (the fix).
    function Code(props: Record<string, unknown>) {
      captured.props = props;
      return null;
    }

    const { default: Content } = await evaluate(SOURCE, {
      ...runtime,
      remarkPlugins: [remarkFencedCode],
    });
    // Calling Content(...) only builds the element tree (React.createElement does not invoke
    // component functions) — it must actually be rendered for `Code` to run and capture props.
    renderToStaticMarkup(Content({ components: { Code } }));

    if (captured.props === null) throw new Error("Code component never rendered");
    const props = captured.props;
    const deliveredText =
      typeof props.code === "string"
        ? props.code
        : Array.isArray(props.children)
          ? props.children.join("")
          : typeof props.children === "string"
            ? props.children
            : "";

    expect(deliveredText).toBe(EXPECTED_CODE);
    expect(deliveredText).toContain("    case 3:");
    expect(deliveredText).toContain('        print("three items")');
  });
});
