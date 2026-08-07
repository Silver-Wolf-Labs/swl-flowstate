import type { Page, Locator } from "@playwright/test";

/** Section anchors rendered by src/app/page.tsx. */
export const SECTIONS = {
  mood: "#mood-selector",
  music: "#music",
  timer: "#focus",
  analytics: "#analytics",
  ideAnalytics: "#ide-analytics",
} as const;

export const MOODS = ["focus", "calm", "energetic", "creative"] as const;
export type Mood = (typeof MOODS)[number];

/**
 * Loads the dashboard and waits until it is actually interactive.
 *
 * The page mounts a particle canvas and several Framer Motion sections, so
 * "load" alone is not a useful signal.
 */
export async function gotoDashboard(page: Page, query = ""): Promise<void> {
  await page.goto(`/${query}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).first().waitFor({ state: "visible" });
}

/**
 * Freezes animations so screenshots are stable and scroll-triggered sections
 * render immediately instead of waiting on the viewport.
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}

/**
 * Waits until no element is mid-fade.
 *
 * Framer Motion animates content in from `opacity: 0`. An accessibility or visual
 * check that runs during that window measures half-transparent text and reports
 * contrast failures that no user ever sees.
 */
export async function settleAnimations(page: Page): Promise<void> {
  // Only elements Framer Motion is actively animating matter, and it drives them
  // through inline styles — so sample `style.opacity` rather than calling
  // getComputedStyle on every node, which is far too slow to poll on this page.
  // Some elements are translucent by design, so wait for values to stop changing
  // rather than for an absolute threshold that would never be met.
  const sample = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[style*='opacity']"))
        .map((el) => el.style.opacity)
        .join(",")
    );

  let previous = await sample();
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.waitForTimeout(150);
    const current = await sample();
    if (current === previous) return;
    previous = current;
  }

  // Under heavy load opacities may still be drifting when we run out of patience.
  // Snap only elements that are mid-*entrance* to fully opaque, so a contrast
  // failure always reflects a real colour choice rather than a frame caught
  // mid-fade. Anything intentionally translucent is left alone: Framer Motion
  // sets inline opacity while animating, so an inline value is the tell.
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>("[style*='opacity']").forEach((el) => {
      const inline = Number(el.style.opacity);
      if (inline > 0 && inline < 1) el.style.opacity = "1";
    });
  });
}

/**
 * Stops Framer Motion mid-flight so screenshots are reproducible.
 *
 * Playwright's `animations: "disabled"` only freezes CSS animations. This UI
 * animates through Framer Motion, which writes inline styles from a
 * requestAnimationFrame loop — several of them `repeat: Infinity`. Two identical
 * consecutive frames therefore never occur and `toHaveScreenshot` retries until it
 * times out. Cutting the rAF loop pins every element at its current value.
 */
export async function freezeMotion(page: Page): Promise<void> {
  await settleAnimations(page);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  // Let the last scheduled frame land before capturing.
  await page.waitForTimeout(100);
}

/**
 * Scrolls an element into view without requiring it to hold still first.
 *
 * Playwright's own scrollIntoViewIfNeeded waits for the element to be "stable"
 * — two animation frames at the same position. Several elements here animate
 * with `repeat: Infinity`, so on a loaded machine that condition is never met and
 * the call times out even though the page is perfectly healthy. A plain DOM
 * scroll has no such precondition, so it reports layout problems instead of load.
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
  await locator.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

/**
 * Scrolls a section into view and waits for its entrance animation to settle.
 * Sections use whileInView, so they stay invisible until scrolled to.
 */
export async function revealSection(page: Page, selector: string): Promise<Locator> {
  const section = page.locator(selector);
  await scrollIntoView(section);
  await section.waitFor({ state: "visible" });
  // whileInView transitions are staggered up to ~0.4s on an idle machine, but a
  // fixed sleep is a guess: on a loaded CI runner the stagger stretches out and a
  // too-short wait reads content that is still fading in. Wait for the real signal.
  await settleAnimations(page);
  return section;
}

/** The focus timer card. */
export function timerCard(page: Page): Locator {
  return page.locator(SECTIONS.timer);
}

/** Reads the timer's mm:ss display. */
export async function readTimer(page: Page): Promise<string> {
  const display = timerCard(page).locator(".font-mono").first();
  const text = (await display.textContent()) ?? "";
  return text.replace(/\s+/g, "");
}

/** Parses mm:ss into total seconds. */
export function toSeconds(display: string): number {
  const match = display.match(/(\d+):(\d+)/);
  if (!match) throw new Error(`Unrecognized timer display: "${display}"`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** The timer's Start/Pause button. */
export function startPauseButton(page: Page): Locator {
  return timerCard(page).getByRole("button", { name: /start|pause/i });
}

/**
 * Restores the shared timer/session state to its defaults.
 *
 * /api/flowstate is a single global record (one JSON file locally, one Redis key
 * in production), so specs that drive the timer must start from a known baseline
 * instead of inheriting whatever the previous test left behind.
 */
export async function resetTimerState(page: Page): Promise<void> {
  await page.request.post("/api/flowstate", {
    data: {
      isRunning: false,
      mode: "focus",
      timeRemaining: 25 * 60,
      totalTime: 25 * 60,
      focusDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      scrollTo: null,
    },
  });
}

/** The IDE Connection Analytics card. */
export function ideAnalyticsCard(page: Page): Locator {
  return page.locator(SECTIONS.ideAnalytics);
}

/**
 * Resets server-side IDE connection state so tests start from a known baseline.
 * Safe to call against the local target; skipped for production.
 */
export async function resetIDEConnection(page: Page): Promise<void> {
  await page.request.delete("/api/ide-connection");
}

/**
 * Registers a connected IDE client, letting tests exercise the connected UI
 * without a real MCP server attached.
 */
export async function connectIDE(page: Page, ide: string): Promise<void> {
  await page.request.post("/api/ide-connection", {
    data: { action: "connect", ide },
  });
}
