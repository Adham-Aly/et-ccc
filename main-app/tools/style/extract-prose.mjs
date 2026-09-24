// tools/style/extract-prose.mjs — turns one lesson .mdx file into plain prose for G-STYLE (plan
// §6.3: "prose extracted from MDX (code, inline code and link targets removed)"). Strips
// frontmatter, fenced code blocks, inline code spans, JSX/component syntax (keeping any text
// children, since Callout/Details/Term bodies are still prose a learner reads), and link/URL
// targets while keeping link text.

export function extractProseFromMdx(raw) {
  let text = raw;
  // Frontmatter.
  text = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  // Fenced code blocks (``` ... ```), including ```python bad38.
  text = text.replace(/```[\s\S]*?```/g, "");
  // MDX/JSX comments ({/* ... */}) — author-only notes (e.g. "W3: visual here"), never rendered
  // to a learner, so they must not count as prose for G-STYLE or G-R14.
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  // Inline code spans.
  text = text.replace(/`[^`]*`/g, "");
  // Markdown links/images: [text](url) -> text ; ![alt](url) -> alt
  text = text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Bare autolinks <https://...>.
  text = text.replace(/<https?:\/\/[^>]*>/g, "");
  // JSX/component tags: <Foo bar="baz">...</Foo> or <Foo bar="baz" /> — drop the tags, keep any
  // text between an opening and closing tag on the same line pass (component children are
  // re-scanned as plain text once tags are stripped, since this regex only removes tag markup).
  text = text.replace(
    /<\/?[A-Za-z][\w.]*(?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*\s*\/?>/g,
    "",
  );
  // Markdown headings/list/quote markers at line start (keep the text).
  text = text.replace(/^(#{1,6}|[-*+]|\d+\.|>)\s+/gm, "");
  // Collapse whitespace.
  text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

/** Flattens every string value in a nested UI-strings object into one prose blob. */
export function extractProseFromStrings(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) extractProseFromStrings(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) extractProseFromStrings(v, out);
  }
  return out.join("\n");
}
