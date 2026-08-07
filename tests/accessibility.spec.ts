import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./support/fixtures";
import {
  gotoDashboard,
  disableAnimations,
  revealSection,
  settleAnimations,
  SECTIONS,
} from "./support/helpers";

/**
 * Automated accessibility audit. axe-core catches a meaningful subset of real
 * problems (contrast, names, roles) — exactly the kind of thing that slips by
 * during visual development.
 */
test.describe("accessibility", () => {
  test("dashboard has no serious or critical axe violations", async ({ page }) => {
    // Auditing the whole dashboard means revealing every lazy section and then
    // running axe across the full tree — legitimately slower than a normal test.
    test.slow();

    await gotoDashboard(page);
    await disableAnimations(page);

    // Reveal lazy sections so they are part of the audited tree.
    for (const selector of Object.values(SECTIONS)) {
      await revealSection(page, selector);
    }
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await settleAnimations(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // The particle canvas is decorative and reports a false positive here.
      .exclude("canvas")
      .analyze();

    // Compare compact strings, not the raw axe objects — a failed toEqual on the
    // full violation tree prints hundreds of lines and buries the actual finding.
    const blocking = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map(
        (v) =>
          `${v.id} (${v.impact}) — ${v.help} → ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(" "))
            .join(" | ")}`
      );

    expect(blocking, `Accessibility violations:\n${blocking.join("\n")}`).toEqual([]);
  });

  test("legal pages have no serious or critical violations", async ({ page }) => {
    for (const path of ["/privacy-policy", "/terms-and-conditions"]) {
      await page.goto(path);
      await disableAnimations(page);
      // Framer Motion fades content in from opacity 0. Auditing mid-fade makes axe
      // measure contrast against half-transparent text and report false positives.
      await settleAnimations(page);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .exclude("canvas")
        .analyze();

      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map(
          (v) =>
            `${v.id} (${v.impact}) — ${v.help} → ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join(" | ")}`
        );

      expect(blocking, `${path} violations:\n${blocking.join("\n")}`).toEqual([]);
    }
  });

  test("every interactive control has an accessible name", async ({ page }) => {
    await gotoDashboard(page);
    await disableAnimations(page);
    for (const selector of Object.values(SECTIONS)) {
      await revealSection(page, selector);
    }

    const unnamed = await page.evaluate(() => {
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>("button, a[href], [role=button]")
      );
      return controls
        .filter((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const name =
            el.getAttribute("aria-label")?.trim() ||
            el.getAttribute("title")?.trim() ||
            el.textContent?.trim() ||
            "";
          return name.length === 0;
        })
        .map((el) => `<${el.tagName.toLowerCase()} class="${el.className}">`)
        .slice(0, 10);
    });

    expect(
      unnamed,
      `Icon-only controls need aria-label so screen readers can announce them:\n${unnamed.join("\n")}`
    ).toEqual([]);
  });

  test("the page is keyboard navigable and shows focus", async ({ page }) => {
    await gotoDashboard(page);
    await disableAnimations(page);

    // Tab through the first controls and make sure focus actually moves.
    const reached: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      reached.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName.toLowerCase()}:${el.textContent?.trim().slice(0, 20) ?? ""}` : "none";
        })
      );
    }

    const distinct = new Set(reached.filter((r) => r !== "none" && r !== "body:"));
    expect(distinct.size, `Tab should move focus between controls, saw: ${reached.join(" → ")}`)
      .toBeGreaterThan(1);
  });

  test("images declare alt text", async ({ page }) => {
    await gotoDashboard(page);

    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.hasAttribute("alt"))
        .map((img) => img.getAttribute("src") ?? "(no src)")
    );

    expect(missing, `Images without alt: ${missing.join(", ")}`).toEqual([]);
  });
});
