// remark-lint config for MDX (plan §4.2, brief). Runs via `npm run lint:mdx` (added with the
// content pipeline, plan §12 P4 step 5) as `remark . --ext mdx --frail`.
//
// remark-frontmatter tells remark to treat the `---\n...\n---` YAML block every lesson starts
// with as frontmatter, not as markdown content — without it, remark-lint parses the YAML list
// syntax (`  - objective one`) as a two-space-indented markdown list and flags it
// (list-item-bullet-indent), which isn't a real content issue.
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkPresetLintConsistent from "remark-preset-lint-consistent";
import remarkPresetLintRecommended from "remark-preset-lint-recommended";

/** @type {import('unified').Preset} */
const config = {
  plugins: [remarkMdx, remarkFrontmatter, remarkPresetLintRecommended, remarkPresetLintConsistent],
};

export default config;
