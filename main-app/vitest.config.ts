import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "tests/e2e/**", "tests/visual/**", "tests/a11y/**"],
    passWithNoTests: false,
    reporters: ["default"],
  },
});
