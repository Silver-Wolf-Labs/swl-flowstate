import { test, expect } from "./support/fixtures";
import { gotoDashboard, SECTIONS } from "./support/helpers";

/**
 * Smoke suite: does the page load and render its core structure?
 * Runs against both the local build and production, so it must not mutate state.
 */
test.describe("smoke", () => {
  test("dashboard loads with no console or network errors", async ({ page, problems }) => {
    await gotoDashboard(page);

    await expect(page).toHaveTitle(/flowstate/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    // problems fixture asserts a clean console at teardown.
    expect(problems).toEqual([]);
  });

  test("all dashboard sections are present in the DOM", async ({ page }) => {
    await gotoDashboard(page);

    for (const [name, selector] of Object.entries(SECTIONS)) {
      await expect(page.locator(selector), `section "${name}" should exist`).toHaveCount(1);
    }
  });

  test("primary landmarks and headings are rendered", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeAttached();

    // Exactly one h1 — multiple h1s are a real accessibility/SEO defect.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("core API routes respond successfully", async ({ page }) => {
    await page.goto("/");

    for (const route of ["/api/flowstate", "/api/ide-connection", "/api/tour/status"]) {
      const response = await page.request.get(route);
      expect(response.status(), `GET ${route}`).toBe(200);
      // Every one of these must return JSON the client can parse.
      expect(() => response.json(), `GET ${route} should return JSON`).not.toThrow();
    }
  });

  test("legal pages are reachable", async ({ page }) => {
    for (const path of ["/privacy-policy", "/terms-and-conditions"]) {
      const response = await page.goto(path);
      expect(response?.status(), `GET ${path}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    }
  });

  test("unknown routes render the 404 page rather than crashing", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/not found|404/i);
  });
});
