// tests/e2e/copy-button.spec.ts — G-E2E: the code block's copy button, including that it hands
// the browser the exact source text (byte-for-byte indentation included — the same fenced-code
// bug fixed in lib/content/remark-fenced-code.ts, requests.md W2 r8 review, reproduced first at
// the unit level in tests/unit/content/mdx-fenced-code.test.ts; this is the same guarantee
// checked end to end in a real page).
//
// This deliberately does NOT round-trip through the real OS/Chromium clipboard
// (`navigator.clipboard.readText()`): that was tried first and found genuinely flaky in this
// environment — `writeText()` reporting success (the UI's own "Copied" state, which only flips
// after the write's promise resolves) while a subsequent `readText()` intermittently came back
// empty, with no permissions/timing change making it reliable. Instead, an init script replaces
// `navigator.clipboard.writeText` with a recorder before the page loads, so the assertion is on
// the exact string the app handed the Clipboard API — deterministic, and arguably more faithful
// to what actually ships (the DOM/JS boundary CodeBlock.tsx controls), not a third-party OS
// service this app doesn't own.
import { expect, test } from "./support/fixtures";

async function installClipboardRecorder(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __copiedTexts: string[] }).__copiedTexts = calls;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          calls.push(text);
          return Promise.resolve();
        },
      },
    });
  });
}

test("copies the file-based code block's exact text, indentation included", async ({ page }) => {
  await installClipboardRecorder(page);
  await page.goto("/learn/fx/M90.1/components-one");
  await page.waitForLoadState("networkidle");

  const frame = page.locator("[data-code-frame]").first();
  await frame.getByRole("button", { name: "Copy" }).click();
  await expect(frame.locator('[aria-live="polite"]')).toContainText("Copied");

  const copiedTexts = await page.evaluate(
    () => (window as unknown as { __copiedTexts: string[] }).__copiedTexts,
  );
  const shownLines = await frame.locator("pre code span.whitespace-pre").allInnerTexts();
  const shownCode = shownLines.join("\n");
  expect(copiedTexts).toHaveLength(1);
  const [copied] = copiedTexts;
  expect((copied ?? "").replace(/\r\n/g, "\n")).toBe(shownCode.replace(/\r\n/g, "\n"));
});

test("copies the fenced bad38 block with its indentation intact", async ({ page }) => {
  await installClipboardRecorder(page);
  await page.goto("/learn/fx/M90.1/components-one");

  const frame = page
    .locator("[data-code-frame]")
    .filter({ hasText: "Not valid on the CCC grader" });
  await frame.getByRole("button", { name: "Copy" }).click();
  await expect(frame.locator('[aria-live="polite"]')).toContainText("Copied");

  const copiedTexts = await page.evaluate(
    () => (window as unknown as { __copiedTexts: string[] }).__copiedTexts,
  );
  expect(copiedTexts).toHaveLength(1);
  const [copied] = copiedTexts;
  expect(copied ?? "").toContain("    case 3:");
  expect(copied ?? "").toContain('        print("three items")');
});

test("shows a fallback state and selects the code when the clipboard API is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    // Simulate a browser/context where the Clipboard API write rejects (e.g. no permission).
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("denied")),
      },
    });
  });

  await page.goto("/learn/fx/M90.1/components-one");
  const frame = page.locator("[data-code-frame]").first();
  await frame.getByRole("button", { name: "Copy" }).click();

  await expect(frame.getByText("Press Ctrl+C to copy")).toBeVisible();
  const selection = await page.evaluate(() => window.getSelection()?.toString());
  expect(selection?.length ?? 0).toBeGreaterThan(0);
});
