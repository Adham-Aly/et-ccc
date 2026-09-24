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
    attributes: [
      { type: "mdxJsxAttribute", name: "lang", value: lang },
      { type: "mdxJsxAttribute", name: "variant", value: variant },
    ],
    children: [{ type: "text", value: node.value }],
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
