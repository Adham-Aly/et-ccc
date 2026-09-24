import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirrors tsconfig.json's "paths": { "@/*": ["./*"] } — without this, any test that transitively
// imports a module using the "@/" alias (52 files under lib/ and components/ do, e.g.
// lib/content/mdx-components.tsx -> "@/components/ui/Badge") fails to resolve under Vitest even
// though the same import resolves fine under Next/tsc, since Vitest/Vite has no built-in
// knowledge of tsconfig path mappings.
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "tests/e2e/**", "tests/visual/**", "tests/a11y/**"],
    passWithNoTests: false,
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
