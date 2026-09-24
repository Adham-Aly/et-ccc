// tests/visual/pages/code-scroll.spec.ts: every code, output and traceback region that scrolls
// sideways shows its affordance, and its longest line ends one inline padding clear of the
// border when scrolled to the end. Runs on every visual project (Chromium and WebKit at 390, 768,
// 1440); the fixture lesson has every variant (plain, highlighted, input/output, traceback,
// bad38).
import { expect, test } from "@playwright/test";
import { STATE_LESSON } from "../../a11y/routes";
import { gotoSettled, seedReadState, settle } from "../../a11y/settle";

const PAGES = [STATE_LESSON, "/dev/design"];

for (const path of PAGES) {
  test(`${path}: overflowing code regions show a scroll affordance and keep end padding`, async ({
    page,
  }) => {
    await seedReadState(page, []);
    await gotoSettled(page, path);
    const regions = page.locator("[data-scroll-x]");
    const count = await regions.count();
    expect(count).toBeGreaterThan(0);

    let overflowing = 0;
    for (let i = 0; i < count; i++) {
      const region = regions.nth(i);
      await region.scrollIntoViewIfNeeded();
      const info = await region.evaluate((el) => ({
        overflow: el.scrollWidth - el.clientWidth,
        fadeOpacity: Number(
          getComputedStyle(el.parentElement?.querySelector("[data-scroll-fade]") as Element)
            .opacity,
        ),
        scrollbar: getComputedStyle(el).scrollbarWidth,
        timelines: CSS.supports("animation-timeline: scroll()"),
      }));

      if (info.overflow <= 1) {
        // Nothing to scroll: no fade may cover the text.
        expect(info.fadeOpacity, `region ${i} fits but shows a fade`).toBe(0);
        continue;
      }
      overflowing++;

      // At the start there is more to the right: the affordance must be visible.
      if (info.timelines) {
        expect(info.fadeOpacity, `region ${i}: fade missing at scroll start`).toBeGreaterThan(0.9);
      } else {
        expect(info.scrollbar, `region ${i}: no visible scrollbar fallback`).toBe("thin");
      }

      // Scrolled to the end: the fade is gone and the last glyph clears the border.
      await region.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await settle(page);
      const end = await region.evaluate((el) => {
        const box = el.getBoundingClientRect();
        let right = 0;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) right = Math.max(right, r.right);
        }
        const fade = el.parentElement?.querySelector("[data-scroll-fade]") as Element;
        return { gap: box.right - right, fadeOpacity: Number(getComputedStyle(fade).opacity) };
      });
      expect(
        end.gap,
        `region ${i}: last glyph is ${end.gap}px from the border`,
      ).toBeGreaterThanOrEqual(15);
      if (info.timelines) {
        expect(end.fadeOpacity, `region ${i}: fade still shown at the end`).toBeLessThan(0.05);
      }
    }
    // The gallery's wide-line sample always overflows, so every run checks the affordance.
    if (path === "/dev/design") expect(overflowing).toBeGreaterThan(0);
  });
}
