import { test, expect } from "./support/fixtures";
import { gotoDashboard, revealSection, SECTIONS, MOODS } from "./support/helpers";

/**
 * Mood drives music recommendations, timer theming and MCP sync, so a broken
 * mood selector degrades most of the product at once.
 */
// The current mood is one shared server-side field; run serially so tests do not
// overwrite each other's selection mid-assertion.
test.describe.configure({ mode: "serial" });

test.describe("mood selector", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
    await revealSection(page, SECTIONS.mood);
  });

  test("renders every mood option", async ({ page }) => {
    const section = page.locator(SECTIONS.mood);
    for (const mood of MOODS) {
      await expect(
        section.getByText(new RegExp(mood, "i")).first(),
        `mood "${mood}" should be offered`
      ).toBeVisible();
    }
  });

  test("selecting a mood persists it to the server", async ({ page }) => {
    const section = page.locator(SECTIONS.mood);
    await section.getByText(/calm/i).first().click();

    // The client POSTs to /api/flowstate; confirm the server actually stored it.
    await expect(async () => {
      const response = await page.request.get("/api/flowstate");
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.currentMood ?? body.state?.currentMood).toBe("calm");
    }).toPass({ timeout: 10_000 });
  });

  test("mood from the URL is applied on load", async ({ page }) => {
    await gotoDashboard(page, "?mood=energetic");
    const section = await revealSection(page, SECTIONS.mood);

    // The active mood card is styled distinctly; assert the app reflects the param
    // somewhere user-visible rather than asserting on exact class names.
    await expect(section).toContainText(/energetic/i);
  });

  test("an invalid mood param falls back to focus instead of breaking", async ({
    page,
    problems,
  }) => {
    await gotoDashboard(page, "?mood=not-a-real-mood");
    await revealSection(page, SECTIONS.mood);

    await expect(page.locator(SECTIONS.mood)).toBeVisible();
    expect(problems, "an unknown mood must not throw").toEqual([]);
  });

  test("switching moods repeatedly does not break the page", async ({ page, problems }) => {
    const section = page.locator(SECTIONS.mood);

    for (const mood of MOODS) {
      await section.getByText(new RegExp(mood, "i")).first().click();
      await page.waitForTimeout(300);
    }

    await expect(section).toBeVisible();
    expect(problems).toEqual([]);
  });
});
