import { test, expect } from "@playwright/test";
import {
  gotoDashboard,
  disableAnimations,
  revealSection,
  freezeMotion,
  scrollIntoView,
  SECTIONS,
} from "./support/helpers";

/**
 * Visual regression baselines.
 *
 * Baselines are committed under tests/visual.spec.ts-snapshots/. To accept an
 * intentional design change run:  npm run test:ui:update
 *
 * Two sources of nondeterminism are neutralised on every test:
 *   - the particle canvas is masked (random by design), and
 *   - Framer Motion is frozen via freezeMotion(), because its infinite rAF-driven
 *     animations otherwise never render the same frame twice.
 */
// Serial: parallel workers starve each other of CPU, and freezeMotion() cannot
// settle a page whose animation frames are being scheduled late. Screenshots are
// cheap individually (~5s), so serialising costs little and removes the flake.
test.describe.configure({ mode: "serial" });

test.describe("visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
    await disableAnimations(page);
  });

  test("hero section", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await freezeMotion(page);
    await expect(page).toHaveScreenshot("hero.png", {
      clip: { x: 0, y: 0, width: 1440, height: 900 },
      mask: [page.locator("canvas")],
    });
  });

  test("mood selector", async ({ page }) => {
    const section = await revealSection(page, SECTIONS.mood);
    await freezeMotion(page);
    await expect(section).toHaveScreenshot("mood-selector.png", {
      mask: [page.locator("canvas")],
    });
  });

  test("focus timer", async ({ page }) => {
    const section = await revealSection(page, SECTIONS.timer);
    await freezeMotion(page);
    await expect(section).toHaveScreenshot("focus-timer.png", {
      mask: [page.locator("canvas")],
    });
  });

  test("IDE connection analytics", async ({ page }) => {
    // Reset so the card is in a deterministic disconnected state.
    await page.request.delete("/api/ide-connection");
    await page.reload({ waitUntil: "domcontentloaded" });
    await disableAnimations(page);
    const section = await revealSection(page, SECTIONS.ideAnalytics);
    await freezeMotion(page);

    await expect(section).toHaveScreenshot("ide-analytics.png", {
      mask: [
        page.locator("canvas"),
        // Live durations change every second.
        section.locator(".font-mono"),
      ],
    });
  });

  test("footer", async ({ page }) => {
    const footer = page.locator("footer");
    await scrollIntoView(footer);
    await freezeMotion(page);
    await expect(footer).toHaveScreenshot("footer.png", {
      mask: [page.locator("canvas")],
    });
  });
});
