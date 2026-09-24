// lib/content/remark-fenced-code.ts — converts every fenced code block (```python,
// ```python bad38) in the mdast tree into a `<Code lang="python" variant="bad38">` JSX element,
// so the single `Code` component in the MDX map (brief §4) handles both fenced blocks and
// `<Code file="..." />` the same way. Written by hand (no unist-util-visit dependency — not on
// the approved list, brief §2 A1) since mdast's `children` recursion is simple enough directly.

interface MdCodeNode {
  type: "code";
  lang?: string | null;
  meta?: string | null;
  value: string;
}

interface MdParent {
  type: string;
  children?: unknown[];
}

function isCodeNode(node: unknown): node is MdCodeNode {
  return typeof node === "object" && node !== null && (node as { type?: unknown }).type === "code";
}

function toJsxCodeNode(node: MdCodeNode) {
  const lang = node.lang ?? "text";
  const variant = (node.meta ?? "").trim() === "bad38" ? "bad38" : "normal";
  return {
    type: "mdxJsxFlowElement",
    name: "Code",
    // The block's source goes in a `code` attribute, never as JSX children: MDX/JSX children
    // text goes through the standard whitespace-cleaning algorithm at compile time (trim each
    // line, join with a single space) — correct for prose, but it silently strips a Python
    // block's indentation (bug: requests.md W2 r8 review, fixed with a repro in
    // tests/unit/content/mdx-fenced-code.test.ts). An attribute value is a plain string literal
    // in the compiled output and is never whitespace-cleaned, so it survives byte-for-byte.
    attributes: [
      { type: "mdxJsxAttribute", name: "lang", value: lang },
      { type: "mdxJsxAttribute", name: "variant", value: variant },
      { type: "mdxJsxAttribute", name: "code", value: node.value },
    ],
    children: [],
    data: { _mdxExplicitJsx: true },
  };
}

function walk(node: MdParent): void {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.map((child) => {
    if (isCodeNode(child)) return toJsxCodeNode(child);
    walk(child as MdParent);
    return child;
  });
}

export function remarkFencedCode() {
  return (tree: MdParent) => {
    walk(tree);
  };
}
