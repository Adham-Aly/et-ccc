// The lazy player chunk must not bundle Zod (measured: 110.6 kB gzip with it, 18.3 kB without).
// Client-side viz modules may import only types from lib/viz/schema; runtime values such as
// stateOf come from the Zod-free lib/viz/states.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Every module the client player reaches (Player.tsx and what it imports, transitively). */
const CLIENT = [
  "lib/viz/geometry.ts",
  "lib/viz/layout.ts",
  "lib/viz/layout-scenes.ts",
  "lib/viz/layout-trace.ts",
  "lib/viz/player-state.ts",
  "lib/viz/states.ts",
  "lib/viz/trace.ts",
  "components/viz/SceneSvg.tsx",
  "components/viz/primitives/index.tsx",
  "components/viz/syntax.ts",
  "components/viz/tokens.ts",
  "components/viz/player/FramesStage.tsx",
  "components/viz/player/Legend.tsx",
  "components/viz/player/Player.tsx",
  "components/viz/player/PlayerMount.tsx",
  "components/viz/player/PlayerView.tsx",
  "components/viz/player/TraceStage.tsx",
  "components/viz/player/prepare.ts",
  "components/viz/player/types.ts",
];

describe("client bundle boundary", () => {
  it.each(CLIENT)("%s imports only types from lib/viz/schema and nothing from zod", (file) => {
    const text = fs.readFileSync(path.join(appRoot, file), "utf8");
    expect(text).not.toMatch(/from "zod"/);
    for (const m of text.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+"[^"]*\/schema"/g)) {
      if (m[1]) continue;
      const names = (m[2] ?? "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      const values = names.filter((n) => !n.startsWith("type "));
      expect(values, `${file} imports values from schema`).toEqual([]);
    }
  });

  it("covers every module in components/viz/player", () => {
    const dir = path.join(appRoot, "components/viz/player");
    for (const f of fs.readdirSync(dir)) {
      expect(CLIENT).toContain(`components/viz/player/${f}`);
    }
  });
});
