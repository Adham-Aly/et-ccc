// remark-lint config for MDX (plan §4.2, brief). Runs via `npm run lint:mdx` (added with the
// content pipeline, plan §12 P4 step 5) as `remark . --ext mdx --frail`.
import remarkMdx from "remark-mdx";
import remarkPresetLintConsistent from "remark-preset-lint-consistent";
import remarkPresetLintRecommended from "remark-preset-lint-recommended";

/** @type {import('unified').Preset} */
const config = {
  plugins: [remarkMdx, remarkPresetLintRecommended, remarkPresetLintConsistent],
};

export default config;
