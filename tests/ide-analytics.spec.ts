import { test, expect } from "./support/fixtures";
import {
  gotoDashboard,
  revealSection,
  SECTIONS,
  ideAnalyticsCard,
  resetIDEConnection,
  connectIDE,
} from "./support/helpers";

/**
 * IDE Connection Analytics. These tests mutate server-side connection state, so
 * they are excluded from the production smoke run and run serially — the
 * connection registry is global, and parallel workers would connect and
 * disconnect clients out from under each other.
 */
test.describe.configure({ mode: "serial" });

test.describe("IDE connection analytics", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
    await resetIDEConnection(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await revealSection(page, SECTIONS.ideAnalytics);
  });

  test.afterEach(async ({ page }) => {
    await resetIDEConnection(page);
  });

  test("shows a disconnected state when no client is attached", async ({ page }) => {
    await expect(ideAnalyticsCard(page)).toContainText(/disconnected/i);
  });

  test("exposes the three analytics tabs", async ({ page }) => {
    const card = ideAnalyticsCard(page);

    for (const tab of [/current session/i, /cumulative/i, /history/i]) {
      await expect(card.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("tabs switch content without errors", async ({ page, problems }) => {
    const card = ideAnalyticsCard(page);

    await card.getByRole("button", { name: /cumulative/i }).click();
    await expect(card).toContainText(/all time/i);

    await card.getByRole("button", { name: /history/i }).click();
    await expect(card).toContainText(/last 7 days/i);

    await card.getByRole("button", { name: /current session/i }).click();
    expect(problems).toEqual([]);
  });

  test("a connected Claude Code client is named in the UI", async ({ page }) => {
    await connectIDE(page, "claude-code");

    const card = ideAnalyticsCard(page);
    // The dashboard polls every 5s; give it a cycle to pick the client up.
    await expect(card).toContainText(/claude code/i, { timeout: 15_000 });
    await expect(card).toContainText(/connected right now/i);
  });

  test("two simultaneous clients are both listed", async ({ page }) => {
    await connectIDE(page, "claude-code");
    await connectIDE(page, "cursor");

    const card = ideAnalyticsCard(page);
    await expect(card).toContainText(/cursor/i, { timeout: 15_000 });
    await expect(card).toContainText(/claude code/i);
  });

  test("cumulative tab breaks time down per client", async ({ page }) => {
    await connectIDE(page, "claude-code");

    const card = ideAnalyticsCard(page);
    await expect(card).toContainText(/claude code/i, { timeout: 15_000 });

    await card.getByRole("button", { name: /cumulative/i }).click();
    await expect(card).toContainText(/time by client/i);
    await expect(card).toContainText(/claude code/i);
  });

  test("history tab renders a 7-day chart with weekday labels", async ({ page }) => {
    const card = ideAnalyticsCard(page);
    await card.getByRole("button", { name: /history/i }).click();

    await expect(card).toContainText(/last 7 days/i);
    // Seven bars, each labelled with a weekday abbreviation.
    const labels = card.locator("span.text-\\[10px\\]");
    await expect(labels).toHaveCount(7);
  });

  test("connection API rejects an unknown action", async ({ page }) => {
    const response = await page.request.post("/api/ide-connection", {
      data: { action: "definitely-not-valid" },
    });
    expect(response.status()).toBe(400);
  });

  test("an explicit disconnect is not undone by a later heartbeat", async ({ page }) => {
    await connectIDE(page, "claude-code");
    await page.request.post("/api/ide-connection", { data: { action: "disconnect" } });

    // Regression guard for the disconnectedByUser flag (commit 84c3193).
    await page.request.post("/api/ide-connection", {
      data: { action: "heartbeat", ide: "claude-code" },
    });

    const state = await (await page.request.get("/api/ide-connection")).json();
    expect(state.state.isConnected, "heartbeat must not resurrect a user disconnect").toBe(false);
  });
});
