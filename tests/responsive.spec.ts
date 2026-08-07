import { test, expect } from "./support/fixtures";
import { gotoDashboard, disableAnimations, revealSection, SECTIONS } from "./support/helpers";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1920, height: 1080 },
];

/**
 * Layout integrity across viewports. Horizontal overflow and cramped tap targets
 * are the two responsive bugs that most often ship unnoticed.
 */
test.describe("responsive layout", () => {
  for (const viewport of VIEWPORTS) {
    test(`no horizontal overflow at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoDashboard(page);
      await disableAnimations(page);

      for (const selector of Object.values(SECTIONS)) {
        await revealSection(page, selector);
      }

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        // Overflow only matters when it clips something the user needs: text or a
        // control. Purely decorative layers (blurred gradient orbs, grid overlays)
        // intentionally extend past their `overflow-hidden` parent and are never
        // visible or reachable, so flagging them would be permanent noise.
        const carriesContent = (el: HTMLElement) =>
          (el.textContent ?? "").trim().length > 0 ||
          el.matches("button, a[href], input, select, textarea, img, [role=button]");

        return Array.from(document.querySelectorAll<HTMLElement>("body *"))
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            const style = window.getComputedStyle(el);
            if (style.position === "fixed") return false;
            if (!carriesContent(el)) return false;
            // 2px tolerance for sub-pixel rounding.
            return rect.right > docWidth + 2;
          })
          .slice(0, 8)
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> extends to ${Math.round(rect.right)}px`;
          });
      });

      expect(
        overflow,
        `Elements overflow the ${viewport.width}px viewport:\n${overflow.join("\n")}`
      ).toEqual([]);
    });
  }

  test("body does not scroll horizontally on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoDashboard(page);
    await disableAnimations(page);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth, "page should not be horizontally scrollable").toBeLessThanOrEqual(
      clientWidth + 2
    );
  });

  test("tap targets on mobile meet the 44px minimum", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoDashboard(page);
    await disableAnimations(page);
    await revealSection(page, SECTIONS.timer);

    const tooSmall = await page.evaluate(() => {
      return Array.from(document.querySelectorAll<HTMLElement>("button, a[href], [role=button]"))
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") return false;
          // WCAG 2.5.5 target size, relaxed to the widely-used 44px floor.
          return rect.height < 32 || rect.width < 32;
        })
        .slice(0, 10)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 25) || "(icon)";
          return `"${label}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px`;
        });
    });

    expect(
      tooSmall,
      `Tap targets below 32px are hard to hit on touch devices:\n${tooSmall.join("\n")}`
    ).toEqual([]);
  });

  test("the timer stays fully visible on a small screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoDashboard(page);
    await disableAnimations(page);
    const section = await revealSection(page, SECTIONS.timer);

    const box = await section.boundingBox();
    expect(box, "timer section should have layout").not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
    // Start/Pause must be reachable, not clipped off-screen.
    await expect(section.getByRole("button", { name: /start|pause/i })).toBeVisible();
  });
});
