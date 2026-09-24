// npm run gen:viz [-- --scope <id>]: regenerate every `.frames.json` (from `<name>.viz.py` via
// vizrec) and `.trace.json` (from the shown example via trace.py) under PyPy 3.8. The generated
// files are committed; the Vercel build never needs Python (plan §4.11.6).
import fs from "node:fs";
import { findVisuals, generate, parseArgs, rel, VizError } from "./lib";

const { scope, roots } = parseArgs(process.argv.slice(2));
const visuals = findVisuals(roots, scope);
let failed = 0;
let written = 0;
for (const v of visuals) {
  try {
    const { text } = generate(v);
    const before = fs.existsSync(v.output) ? fs.readFileSync(v.output, "utf8") : null;
    if (before !== text) {
      fs.writeFileSync(v.output, text);
      written += 1;
      console.log(`gen:viz: wrote ${rel(v.output)} (${Buffer.byteLength(text)} bytes)`);
    }
  } catch (err) {
    failed += 1;
    const rule = err instanceof VizError ? `[${err.rule}] ` : "";
    console.error(`gen:viz: ${rule}${(err as Error).message}`);
  }
}
console.log(
  `gen:viz: ${visuals.length} visual(s)${scope ? ` in scope ${scope}` : ""}, ${written} updated, ${failed} failed.`,
);
process.exit(failed > 0 ? 1 : 0);
