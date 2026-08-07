# FlowState UI testing

Playwright suite covering the dashboard's functionality, accessibility, responsive
layout and visual appearance. It runs on every push and on a nightly schedule
(see `.github/workflows/nightly-ui-tests.yml`).

## Running locally

```bash
npx playwright install --with-deps chromium webkit   # once

npm run test:ui              # full suite (builds and serves the app for you)
npm run test:ui:headed       # watch it drive a real browser
npm run test:ui:debug        # step through with the inspector
npm run test:ui:report       # open the HTML report from the last run
npm run test:ui:smoke        # smoke tests only — fastest signal
npm run test:ui:prod         # smoke tests against the live Vercel deploy
```

The config starts its own server on port 3100. If you already have one running
there it is reused, which keeps the loop fast — but note that a *dev* server
serves different code than the production build CI tests, so re-run against a
clean build before trusting a green result.

## What each spec covers

| Spec | Covers |
| --- | --- |
| `smoke.spec.ts` | Page loads clean, all sections render, API routes respond, legal pages and 404 work. Safe against production — mutates nothing. |
| `focus-timer.spec.ts` | The Pomodoro timer: countdown rate, pause, reset, mode switching, settings, and the MCP sync contract. |
| `mood-selector.spec.ts` | Mood options, server persistence, `?mood=` deep links, invalid input. |
| `ide-analytics.spec.ts` | IDE Connection Analytics: connected/disconnected states, the three tabs, multi-client tracking, per-client time, 7-day history, and the disconnect-vs-heartbeat regression guard. |
| `navigation.spec.ts` | Header nav, pricing/contact/demo modals (including Escape), contact validation, footer links. |
| `accessibility.spec.ts` | axe-core WCAG 2.0/2.1 A + AA audit, accessible names on every control, keyboard navigation, image alt text. |
| `responsive.spec.ts` | Horizontal overflow and tap-target size at 375/768/1280/1920px. |
| `visual.spec.ts` | Screenshot baselines for the hero, mood selector, timer, IDE analytics card and footer. |

## Finding bugs nobody wrote a test for

`support/fixtures.ts` extends `test` with a `problems` fixture. Any spec that
declares it fails if the page logged a console error, threw, had a request fail,
or received an HTTP 4xx/5xx — even when every explicit assertion passed. This is
what catches regressions no one thought to assert on.

`IGNORED_PATTERNS` in that file is deliberately narrow (third-party music embeds
with no CI credentials, blocked autoplay, favicon). Widening it hides real bugs.

## Test targets

`TEST_TARGET` selects the environment:

- **`local`** (default) — builds the production bundle and serves it in the runner.
  Runs the whole suite, including specs that mutate server state.
- **`production`** — smoke tests only, against the live deploy. Nothing here writes
  state, so it is safe to point at the real site.

For the local target the config blanks `UPSTASH_REDIS_REST_URL`/`_TOKEN` and sets
`FLOWSTATE_STATE_DIR` to a scratch directory. That matters: the API routes persist
timer and IDE-connection state to disk, so without it a real MCP session running
on your machine would flip state mid-assertion, and a nightly run could overwrite
production Redis.

## Determinism

This UI animates heavily, which is the main source of screenshot and audit flake.
Four helpers handle it:

- `disableAnimations()` — injects zero-duration CSS.
- `settleAnimations()` — waits until computed opacities stop changing. Auditing
  mid-fade makes axe measure half-transparent text and report contrast failures
  that no user ever sees.
- `freezeMotion()` — cuts the `requestAnimationFrame` loop. Playwright's
  `animations: "disabled"` only stops CSS animations; Framer Motion drives inline
  styles from rAF, several with `repeat: Infinity`, so two identical frames never
  occur and `toHaveScreenshot` retries until timeout.
- `scrollIntoView()` — a plain DOM scroll. **Do not use Playwright's
  `scrollIntoViewIfNeeded()` in this repo.** It waits for the element to be
  "stable" (two animation frames at the same position), and elements animating
  with `repeat: Infinity` never satisfy that on a busy machine — the call times out
  while the page is perfectly healthy. This was the single largest source of false
  failures in the suite: the same specs passed in isolation and failed as a group.

Timeouts are deliberately generous (120s per test, 60s navigation). A
GitHub-hosted runner is a 2-core VM and every page paints a particle canvas, so
limits tuned on an idle laptop turn a slow runner into a wall of fake failures.
A nightly that cries wolf gets ignored, which is worse than a slow one.

Specs that share server-side state (`focus-timer`, `mood-selector`,
`ide-analytics`) and `visual` declare `test.describe.configure({ mode: "serial" })`
— the app keeps one global timer/connection record, so parallel workers would
clobber each other rather than test the product.

## Visual baselines

Baselines live in `visual.spec.ts-snapshots/` and are committed. They are
platform-specific (`-darwin`, `-linux`), so accept an intentional design change on
the same OS CI uses, or the nightly run will diff against a macOS baseline:

```bash
npm run test:ui:update
```

Review the regenerated PNGs before committing — that diff is the only thing
standing between a design fix and a silently accepted visual regression.

## Nightly reporting

The workflow runs the full local suite plus a production smoke test each night at
03:00 UTC and reports through two channels:

1. **The HTML report, as a run artifact** — a trace, screenshot and video for
   every failure. Download the `playwright-report` artifact from the run, unzip
   it, then:

   ```bash
   npx playwright show-report path/to/playwright-report
   ```

   It is an artifact rather than a GitHub Pages site because Pages on a private
   repo needs a paid plan, and artifacts are free.

2. **A GitHub issue** — opened on first failure and updated with a comment on
   subsequent nights, then closed automatically once the suite goes green again.
   Set the repo variable `NIGHTLY_REVIEWERS` (e.g. `fau1095,daniels-handle`) to
   control who gets pinged; it defaults to the repo owner alone.

Every run also writes the same summary to the job's **Actions summary** page, so
a green/red verdict with counts is visible without downloading anything.

`scripts/summarize-results.mjs` builds the Markdown for all of these from
`test-results/results.json`.
