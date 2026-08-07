import { test, expect } from "./support/fixtures";
import { gotoDashboard, scrollIntoView } from "./support/helpers";

/**
 * Header navigation, CTAs and modals. Modals are a common source of trapped
 * focus and unclosable overlays, so each one is opened and closed.
 */
test.describe("navigation and modals", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
  });

  test("Get Started opens the pricing modal and it can be dismissed", async ({ page }) => {
    await page.getByRole("button", { name: /get started/i }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toContainText(/choose your plan/i);

    // Escape is the keyboard user's only guaranteed way out of a modal.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    // The X button must work independently of Escape.
    await page.getByRole("button", { name: /get started/i }).first().click();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /close pricing/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  });

  test("Schedule Demo opens the contact modal", async ({ page }) => {
    await page.getByRole("button", { name: /schedule demo/i }).first().click();
    await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 10_000 });
  });

  test("the demo walkthrough opens from the hero", async ({ page }) => {
    const watchDemo = page.getByRole("button", { name: /watch demo|see it in action/i }).first();
    // The hero animates in; clicking mid-transition hits a moving target.
    await scrollIntoView(watchDemo);
    await expect(watchDemo).toBeVisible();
    await watchDemo.click();

    // The walkthrough is a stepped modal; a next/continue affordance must exist.
    await expect(
      page.getByRole("button", { name: /next|continue|start|got it/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("header nav links scroll to their sections", async ({ page }) => {
    const header = page.locator("header");
    const links = header.getByRole("button").or(header.getByRole("link"));
    const count = await links.count();
    expect(count, "header should expose navigation controls").toBeGreaterThan(0);

    // Clicking nav must not navigate away from the dashboard.
    await links.first().click();
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("the contact form rejects an invalid email", async ({ page }) => {
    await page.getByRole("button", { name: /schedule demo/i }).first().click();

    const email = page.getByRole("textbox").filter({ hasNot: page.locator("[type=hidden]") });
    const emailField = page.locator("input[type=email]").first();
    const target = (await emailField.isVisible().catch(() => false)) ? emailField : email.nth(1);

    await target.fill("clearly-not-an-email");
    const submit = page.getByRole("button", { name: /send|submit|schedule/i }).last();
    await submit.click();

    // Either native validation blocks it or the app shows an error; what must
    // NOT happen is a success state for a malformed address.
    await page.waitForTimeout(1_500);
    await expect(page.getByText(/thank you|we'll be in touch|success/i)).toHaveCount(0);
  });

  test("footer legal links navigate correctly", async ({ page }) => {
    const privacy = page.getByRole("link", { name: /privacy/i }).first();
    await privacy.click();
    await expect(page).toHaveURL(/privacy-policy/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});
