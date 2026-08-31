import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const PATHS = ["/", "/services", "/prices", "/contacts"];

for (const width of WIDTHS) {
  for (const path of PATHS) {
    test(`нет горизонтального скролла на ${path} при ширине ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(hasHorizontalScroll, `${path} at ${width}px has horizontal overflow`).toBe(false);
    });
  }
}
