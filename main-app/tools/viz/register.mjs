// tools/viz/register.mjs: lets plain Node (type stripping, Node 24) run the app's TypeScript
// modules the way Next and TypeScript resolve them: extensionless relative imports and the `@/`
// alias (tsconfig "paths") resolve to .ts / .tsx / index.ts. Use it as
//   node --import ./tools/viz/register.mjs tools/viz/check-viz.ts
// Only .ts files are loadable this way (no JSX); every module the gate scripts reach is pure TS.
import fs from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

function tryFile(base) {
  if (/\.[cm]?[jt]sx?$/.test(base) && fs.existsSync(base)) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let base = null;
    if (specifier.startsWith("@/")) {
      base = path.join(appRoot, specifier.slice(2));
    } else if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:")
    ) {
      base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    }
    if (base !== null && !base.includes(`${path.sep}node_modules${path.sep}`)) {
      const file = tryFile(base);
      if (file !== null) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
});
