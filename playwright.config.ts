import { defineConfig, devices } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * FlowState UI test configuration.
 *
 * Two target environments, selected with TEST_TARGET:
 *   - "local" (default): builds and serves the app inside the runner. Full suite.
 *   - "production": smoke tests only, against the live Vercel deploy.
 *
 * See tests/README.md for the full rationale.
 */
const TARGET = process.env.TEST_TARGET === "production" ? "production" : "local";
const PRODUCTION_URL = process.env.PRODUCTION_URL || "https://flowstate-swl.vercel.app";
const LOCAL_URL = process.env.LOCAL_URL || "http://127.0.0.1:3100";
const baseURL = TARGET === "production" ? PRODUCTION_URL : LOCAL_URL;

const isCI = !!process.env.CI;

/**
 * Sandbox for the app's server-side state files. The API routes persist timer and
 * IDE-connection state to disk; pointing them here means a real MCP session
 * running on the developer's machine cannot flip state mid-assertion.
 */
// Deliberately NOT under test-results/: Playwright wipes its output directory at
// the start of every run, which would delete the state files out from under the
// running server and make its writes fail.
const STATE_DIR = path.join(__dirname, ".playwright-state");
if (TARGET === "local") fs.mkdirSync(STATE_DIR, { recursive: true });

export default defineConfig({
  testDir: "./tests",
  // Animation-heavy UI plus a real Pomodoro timer: some specs legitimately wait.
  // Generous on purpose — a GitHub-hosted runner is a 2-core VM, and every page
  // here paints a particle canvas plus continuous Framer Motion work. Timeouts
  // tuned on an idle laptop turn a slow runner into a wall of fake failures,
  // which is worse than a slow suite: nobody trusts a nightly that cries wolf.
  timeout: 120_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      // Framer Motion and the particle canvas never settle to identical pixels,
      // so allow a small diff rather than chasing false positives.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  fullyParallel: true,
  // A stray .only in a PR should not silently shrink the nightly run.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Capped deliberately. The app runs a particle canvas and continuous Framer
  // Motion animations, so each page is CPU-hungry; oversubscribing the machine
  // starves the browsers and produces navigation timeouts that look like product
  // bugs. Two workers is the point where the suite stays fast and stays honest.
  workers: 2,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    // Consumed by scripts/summarize-results.mjs to build the CI summary and issue body.
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
    ...(isCI ? [["github"] as const] : []),
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Nightly runs are unattended; fail loudly rather than hanging. Still bounded,
    // just above the worst-case cold paint on a loaded 2-core runner.
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },

  projects:
    TARGET === "production"
      ? [
          {
            name: "production-smoke",
            use: { ...devices["Desktop Chrome"] },
            testMatch: /smoke\.spec\.ts/,
          },
        ]
      : [
          {
            name: "chromium-desktop",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
            testIgnore: /visual\.spec\.ts/,
          },
          {
            name: "mobile-safari",
            use: { ...devices["iPhone 14"] },
            // Layout and touch-target checks; the heavier suites stay desktop-only
            // to keep the nightly run inside a sensible wall-clock budget.
            testMatch: /(responsive|smoke)\.spec\.ts/,
          },
          {
            name: "visual",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
            testMatch: /visual\.spec\.ts/,
          },
        ],

  // Local target builds and serves the real production bundle. Reusing an already
  // running dev server locally keeps the feedback loop fast.
  webServer:
    TARGET === "local"
      ? {
          command: "npm run build && npx next start -p 3100",
          url: LOCAL_URL,
          reuseExistingServer: !isCI,
          timeout: 300_000,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            // Keep the nightly run off any shared Redis so tests never mutate
            // real user state; the API routes fall back to local files.
            UPSTASH_REDIS_REST_URL: "",
            UPSTASH_REDIS_REST_TOKEN: "",
            // And keep those files out of the repo root, so a developer's live
            // MCP session cannot bleed into assertions about connection state.
            FLOWSTATE_STATE_DIR: STATE_DIR,
          },
        }
      : undefined,
});
