import { test, expect } from "./support/fixtures";
import {
  gotoDashboard,
  revealSection,
  SECTIONS,
  timerCard,
  readTimer,
  toSeconds,
  startPauseButton,
  resetTimerState,
} from "./support/helpers";

/**
 * The Pomodoro timer is FlowState's core feature. These tests drive it through
 * real user interactions rather than inspecting internal state.
 *
 * Serial: the timer is backed by one shared server-side record, so parallel
 * workers would clobber each other's clock rather than test the product.
 */
test.describe.configure({ mode: "serial" });

test.describe("focus timer", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
    await resetTimerState(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await revealSection(page, SECTIONS.timer);
  });

  test.afterEach(async ({ page }) => {
    await resetTimerState(page);
  });

  test("starts at 25:00 in a paused state", async ({ page }) => {
    await expect(startPauseButton(page)).toContainText(/start/i);
    expect(toSeconds(await readTimer(page))).toBe(25 * 60);
    await expect(timerCard(page)).toContainText(/paused/i);
  });

  test("counts down while running and reports Running", async ({ page }) => {
    await startPauseButton(page).click();
    await expect(startPauseButton(page)).toContainText(/pause/i);
    await expect(timerCard(page)).toContainText(/running/i);

    // Measure against the wall clock we actually observed rather than the sleep we
    // asked for: a loaded CI runner can stretch a 3s wait well past 3s, and
    // comparing to the nominal duration would fail on machine load, not on a bug.
    const startedAt = Date.now();
    const before = toSeconds(await readTimer(page));
    await page.waitForTimeout(3_000);
    const after = toSeconds(await readTimer(page));
    const elapsed = (Date.now() - startedAt) / 1000;

    expect(after, "the timer must count down while running").toBeLessThan(before);

    // The clock should track real time. Generous bounds still catch a timer that
    // ticks at double speed or barely moves.
    const ticked = before - after;
    expect(ticked).toBeGreaterThanOrEqual(Math.floor(elapsed * 0.5));
    expect(ticked).toBeLessThanOrEqual(Math.ceil(elapsed * 1.5) + 1);
  });

  test("pause freezes the countdown", async ({ page }) => {
    await startPauseButton(page).click();
    await page.waitForTimeout(1_500);

    await startPauseButton(page).click();
    await expect(startPauseButton(page)).toContainText(/start/i);

    const atPause = toSeconds(await readTimer(page));
    await page.waitForTimeout(2_500);
    const later = toSeconds(await readTimer(page));

    expect(later, "timer must not tick while paused").toBe(atPause);
  });

  test("reset returns the timer to its full duration", async ({ page }) => {
    await startPauseButton(page).click();
    await page.waitForTimeout(2_000);
    expect(toSeconds(await readTimer(page))).toBeLessThan(25 * 60);

    // Reset is the icon-only button to the left of Start/Pause.
    await timerCard(page).getByRole("button").first().click();

    await expect(async () => {
      expect(toSeconds(await readTimer(page))).toBe(25 * 60);
    }).toPass({ timeout: 5_000 });
    await expect(startPauseButton(page)).toContainText(/start/i);
  });

  test("switching modes loads that mode's duration", async ({ page }) => {
    const card = timerCard(page);

    await card.getByRole("button", { name: /short break/i }).click();
    await expect(async () => {
      expect(toSeconds(await readTimer(page))).toBe(5 * 60);
    }).toPass({ timeout: 5_000 });

    await card.getByRole("button", { name: /long break/i }).click();
    await expect(async () => {
      expect(toSeconds(await readTimer(page))).toBe(15 * 60);
    }).toPass({ timeout: 5_000 });

    await card.getByRole("button", { name: /focus time/i }).click();
    await expect(async () => {
      expect(toSeconds(await readTimer(page))).toBe(25 * 60);
    }).toPass({ timeout: 5_000 });

    // The active mode must be announced, not conveyed by colour alone.
    await expect(card.getByRole("button", { name: /focus time/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("settings panel opens and exposes duration controls", async ({ page }) => {
    const card = timerCard(page);
    // Settings is the last icon button in the control row.
    await card.getByRole("button").last().click();

    await expect(card.getByText(/timer settings/i)).toBeVisible();
  });

  test("a browser-driven timer is device-local and restarts clean on reload", async ({ page }) => {
    await startPauseButton(page).click();
    await page.waitForTimeout(2_000);
    expect(toSeconds(await readTimer(page))).toBeLessThan(25 * 60);

    await page.reload({ waitUntil: "domcontentloaded" });
    await revealSection(page, SECTIONS.timer);

    // By design (see focus-timer.tsx: "Timer config is intentionally NOT synced"),
    // only MCP drives cross-device state — a locally started timer does not persist.
    // This test pins that contract so a future sync change is a deliberate decision.
    expect(toSeconds(await readTimer(page))).toBe(25 * 60);
    await expect(startPauseButton(page)).toContainText(/start/i);
  });

  test("an MCP-driven timer update is reflected in the dashboard", async ({ page }) => {
    // The MCP server is the one writer that must reach the UI across reloads.
    await page.request.post("/api/flowstate", {
      data: { source: "mcp", isRunning: false, mode: "shortBreak", timeRemaining: 4 * 60, totalTime: 5 * 60 },
    });

    await expect(async () => {
      expect(toSeconds(await readTimer(page))).toBe(4 * 60);
    }).toPass({ timeout: 15_000 });
  });
});
