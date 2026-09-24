// lib/content/reading-time.ts — readingMinutes (W2 request, requests.md): word count of the MDX
// prose / 200, rounded, minimum 1.

/** Strips MDX/markdown syntax that isn't prose the learner reads at reading pace. */
function proseOnly(mdx: string): string {
  return (
    mdx
      // frontmatter
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      // fenced code blocks (```...```)
      .replace(/```[\s\S]*?```/g, " ")
      // JSX/MDX component tags, e.g. <Code .../> or <Callout kind="note">...</Callout> tags
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      // inline code
      .replace(/`[^`]*`/g, " ")
      // markdown link/image syntax -> keep the link text
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      // headings/emphasis markers
      .replace(/[#*_>`-]/g, " ")
  );
}

export function readingMinutes(mdx: string): number {
  const words = proseOnly(mdx)
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  return Math.max(1, Math.round(words.length / 200));
}
