import { test as base, expect, type Page, type ConsoleMessage } from "@playwright/test";

export interface PageProblem {
  kind: "console-error" | "page-error" | "failed-request" | "http-error";
  detail: string;
}

/**
 * Console/network noise that is expected and not worth failing a nightly run over.
 * Keep this list short and specific — a broad pattern here hides real bugs.
 */
const IGNORED_PATTERNS: RegExp[] = [
  // Third-party music embeds are not configured in CI (no API keys/OAuth).
  /spotify|soundcloud|apple ?music|youtube|ytimg|googlevideo|scdn\.co/i,
  // React DevTools suggestion in dev builds.
  /Download the React DevTools/i,
  // Autoplay is blocked in headless Chromium; not a product bug.
  /play\(\) failed|NotAllowedError|autoplay/i,
  // Favicon is not part of what we test.
  /favicon/i,
];

function isIgnored(text: string): boolean {
  return IGNORED_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Collects console errors, uncaught exceptions and failed requests for a page.
 * Returned array is live: assert on it at the end of a test.
 */
export function watchForProblems(page: Page): PageProblem[] {
  const problems: PageProblem[] = [];

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (isIgnored(text)) return;
    problems.push({ kind: "console-error", detail: text });
  });

  page.on("pageerror", (error) => {
    if (isIgnored(error.message)) return;
    problems.push({ kind: "page-error", detail: `${error.name}: ${error.message}` });
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    if (isIgnored(url)) return;
    const failure = request.failure()?.errorText ?? "unknown";
    // Aborted requests are normal when navigating away mid-flight.
    if (failure.includes("ERR_ABORTED")) return;
    problems.push({ kind: "failed-request", detail: `${request.method()} ${url} — ${failure}` });
  });

  page.on("response", (response) => {
    const status = response.status();
    if (status < 400) return;
    const url = response.url();
    if (isIgnored(url)) return;
    problems.push({ kind: "http-error", detail: `${status} ${response.request().method()} ${url}` });
  });

  return problems;
}

/** Formats problems into a readable assertion message. */
export function formatProblems(problems: PageProblem[]): string {
  return problems.map((p) => `  [${p.kind}] ${p.detail}`).join("\n");
}

interface Fixtures {
  /** Problems seen on the page during the test. Auto-asserted to be empty at teardown. */
  problems: PageProblem[];
}

/**
 * Extends the base test so every spec using `problems` fails when the page logs
 * an error or a request breaks — catching regressions no assertion targets directly.
 */
export const test = base.extend<Fixtures>({
  problems: async ({ page }, use) => {
    const problems = watchForProblems(page);
    await use(problems);
    if (problems.length > 0) {
      throw new Error(
        `Page reported ${problems.length} problem(s):\n${formatProblems(problems)}`
      );
    }
  },
});

export { expect };
