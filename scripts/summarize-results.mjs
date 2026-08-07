#!/usr/bin/env node
/**
 * Turns Playwright's JSON report into human-readable Markdown.
 *
 * Used by the nightly workflow for both the Actions run summary and the body of
 * the auto-filed GitHub issue, so a failure is understandable without opening
 * the HTML report or downloading artifacts.
 *
 * Usage: node scripts/summarize-results.mjs <results.json> [--title "..."] [--report-url URL]
 */
import { readFileSync, existsSync } from "node:fs";

const [, , resultsPath, ...rest] = process.argv;

function flag(name) {
  const index = rest.indexOf(name);
  return index !== -1 ? rest[index + 1] : undefined;
}

const label = flag("--title") ?? "UI tests";
const reportUrl = flag("--report-url");

if (!resultsPath || !existsSync(resultsPath)) {
  // No report at all usually means the suite crashed before running.
  console.log(`## ${label}\n\n⚠️ No results file found at \`${resultsPath}\` — the run likely failed before any test executed. Check the workflow logs.`);
  process.exit(0);
}

let report;
try {
  report = JSON.parse(readFileSync(resultsPath, "utf-8"));
} catch (error) {
  console.log(`## ${label}\n\n⚠️ Could not parse \`${resultsPath}\`: ${error.message}`);
  process.exit(0);
}

/** Walks the nested suite tree and yields every test with its spec context. */
function collectTests(suites, trail = []) {
  const out = [];
  for (const suite of suites ?? []) {
    const path = suite.title ? [...trail, suite.title] : trail;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        out.push({
          title: spec.title,
          file: suite.file ?? path[0] ?? "unknown",
          project: test.projectName ?? "default",
          status: test.status, // expected | unexpected | flaky | skipped
          results: test.results ?? [],
        });
      }
    }
    out.push(...collectTests(suite.suites, path));
  }
  return out;
}

const tests = collectTests(report.suites);
const failed = tests.filter((t) => t.status === "unexpected");
const flaky = tests.filter((t) => t.status === "flaky");
const skipped = tests.filter((t) => t.status === "skipped");
const passed = tests.filter((t) => t.status === "expected");

const durationMs = report.stats?.duration ?? 0;
const duration = durationMs > 60_000
  ? `${Math.round(durationMs / 60_000)}m ${Math.round((durationMs % 60_000) / 1000)}s`
  : `${Math.round(durationMs / 1000)}s`;

/** Trims Playwright's ANSI-coded, very long error output to something skimmable. */
function cleanError(text) {
  if (!text) return "";
  return text
    // Strip ANSI colour codes (ESC[..m) that Playwright embeds in error text.
    .replace(/\u001B\[[0-9;]*m/g, "")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("at "))
    .slice(0, 12)
    .join("\n")
    .trim();
}

const lines = [];
lines.push(`## ${label}`);
lines.push("");

const verdict = failed.length > 0 ? "❌ Failing" : flaky.length > 0 ? "⚠️ Passing with flakes" : "✅ All green";
lines.push(`**${verdict}** — ${passed.length} passed, ${failed.length} failed, ${flaky.length} flaky, ${skipped.length} skipped in ${duration}.`);
lines.push("");

if (reportUrl) {
  lines.push(
    `📊 [Download the HTML report](${reportUrl}) — the \`playwright-report\` artifact ` +
      "includes a trace, screenshot and video for each failure. " +
      "Open it with `npx playwright show-report <unzipped-folder>`."
  );
  lines.push("");
}

if (failed.length > 0) {
  lines.push("### Failures");
  lines.push("");
  for (const test of failed) {
    const file = String(test.file).replace(/^.*tests\//, "tests/");
    lines.push(`#### \`${test.title}\``);
    lines.push(`*${file} · project: ${test.project}*`);
    lines.push("");
    const error = cleanError(test.results.at(-1)?.error?.message);
    if (error) {
      lines.push("```");
      lines.push(error);
      lines.push("```");
    }
    lines.push("");
  }
}

if (flaky.length > 0) {
  lines.push("### Flaky (passed on retry)");
  lines.push("");
  for (const test of flaky) {
    lines.push(`- \`${test.title}\` (${test.project})`);
  }
  lines.push("");
  lines.push("_Flaky tests pass eventually but indicate a race or timing assumption worth a look._");
  lines.push("");
}

if (failed.length === 0 && flaky.length === 0) {
  lines.push("No issues found. 🎉");
}

console.log(lines.join("\n"));

// Signal failure count to the workflow without failing this script itself.
if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_OUTPUT, `failed_count=${failed.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `flaky_count=${flaky.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `passed_count=${passed.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\n`);
}
