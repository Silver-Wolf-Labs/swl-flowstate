# Codex Workflow (FlowState Repo)

This file documents how to work with this repo across sessions.

## Default deployment flow after changes
- Run: `git add -A && git commit -m "chore: Updates from GPT Codex" && git push origin master`
- Deploy: `npx vercel --prod --force 2>&1 | grep "Production:" | tail -1`
- Alias: `npx vercel alias <deployment-url> flowstate-swl.vercel.app`

## Production URL for "flowstate init"
- `https://flowstate-swl.vercel.app?fromIDE=true&autoConnect=youtube`

## Timer command rules
- "pause timer" should:
  1) `GET /api/flowstate` to read current `timeRemaining`
  2) `POST /api/flowstate` with:
     - `isRunning: false`
     - `timeRemaining: <current value>`
     - `source: "mcp"`

## Notes
- Use production URL by default (not localhost).
- Keep responses concise.
