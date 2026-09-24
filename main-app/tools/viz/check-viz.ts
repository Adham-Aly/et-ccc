// npm run check:viz [-- --scope <id>] [-- --schema-only] [-- --root=<dir>]: the G-VIZ gate (tools/viz/check.ts).
import { checkViz } from "./check";
import { findVisuals, parseArgs } from "./lib";

const { scope, roots, flags } = parseArgs(process.argv.slice(2));
const schemaOnly = flags.has("schema-only");
const findings = checkViz({ roots: roots, scope, schemaOnly });
const count = findVisuals(roots, scope).length;
for (const f of findings) console.error(`G-VIZ [${f.rule}] ${f.file}: ${f.message}`);
console.log(
  `G-VIZ${schemaOnly ? " (schema only)" : ""}: ${count} visual(s)${scope ? ` in scope ${scope}` : ""}, ${findings.length} problem(s).`,
);
process.exit(findings.length > 0 ? 1 : 0);
