// Deliberately failing fixture for G-UI-LIGHT (plan §7, brief §1.6). This directory is outside
// the scanned set (app/, components/, lib/, content/, tests/fixtures/content/), so it never
// trips the real lint:light run — only the Vitest test in
// tests/unit/gates/lint-light.test.ts points the scanner at this file directly.
import darkTheme from "./dark-theme";

export function BadComponent() {
  return (
    <div className="bg-white dark:bg-black" data-theme={darkTheme}>
      This must never render: light mode only.
    </div>
  );
}
