# FlowState Agent Workflow

> Instructions for AI agents (Cursor, GPT Codex, etc.) to properly interact with FlowState.

---

## 🔑 Key Rules

1. **Cursor agents**: Use MCP tools via `user-flowstate` server.
2. **Codex/other agents**: Use shell fallbacks (see below).
3. **Production URL** - Always use `https://flowstate-swl.vercel.app` (not localhost).
4. **Update docs** - When adding new MCP tools, ALWAYS update `docs/CHEATSHEET.md`.

---

## 🚨 For Agents WITHOUT MCP Access (Codex, etc.)

If you don't have MCP tools, use these shell commands:

### Open Dashboard (flowstate init)
```bash
open "https://flowstate-swl.vercel.app?fromIDE=true&autoConnect=youtube"
```

### Start Timer
```bash
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": true, "timeRemaining": 1500, "totalTime": 1500, "mode": "focus", "source": "mcp"}'
```
Note: `timeRemaining` and `totalTime` are in seconds (1500 = 25 min, 600 = 10 min, 120 = 2 min)

### Pause Timer (preserves time)
```bash
# First GET current state
curl -s https://flowstate-swl.vercel.app/api/flowstate | jq .

# Then POST with isRunning: false (keep the timeRemaining from GET)
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": false, "source": "mcp"}'
```

### Resume Timer
```bash
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": true, "source": "mcp"}'
```

### Stop Timer (resets to defaults)
```bash
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": false, "timeRemaining": 1500, "totalTime": 1500, "mode": "focus", "source": "mcp"}'
```

### Set Mood
```bash
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"currentMood": "calm", "source": "mcp"}'
```
Options: `focus`, `calm`, `energetic`, `creative`

### Get Current State
```bash
curl -s https://flowstate-swl.vercel.app/api/flowstate | jq .
```

---

## 🛠️ Available MCP Tools

### Timer Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `start_focus_session` | Start timer | User says "start timer", "start pomo", "focus for X min" |
| `pause_focus_session` | Pause (keeps time) | User says "pause timer", "pause" |
| `resume_focus_session` | Resume paused timer | User says "resume timer", "continue" |
| `stop_focus_session` | Stop and reset | User says "stop timer", "stop" |
| `get_timer_status` | Check timer state | User says "timer status", "how much time left" |
| `reset_timer_config` | Reset to defaults (25/5/15) | User says "reset timer config" |

### Mood Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `set_mood` | Change mood | User says "set mood to X" |
| `suggest_mood` | AI suggestion | User says "what mood should I be in", "suggest mood" |
| `get_mood_tips` | Productivity tips | User says "give me tips" |

### Dashboard Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `open_dashboard` | Open web UI | User says "flowstate init", "open flowstate" |
| `get_productivity_stats` | Get analytics | User says "show my stats" |

### Break Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `take_break` | Start break | User says "take a break" |
| `skip_break` | Skip break | User says "skip break" |

---

## ⚠️ Critical: Pause vs Stop

**NEVER confuse these:**

| User Says | Correct Tool | Behavior |
|-----------|--------------|----------|
| "pause timer" | `pause_focus_session` | Pauses, **keeps** remaining time |
| "stop timer" | `stop_focus_session` | Stops, **resets** to defaults |

---

## 📝 Tool Parameters

### `start_focus_session`
```json
{
  "duration": 25  // Minutes (optional, default: 25)
}
```

**Examples:**
- "start timer" → `{"duration": 25}`
- "start timer for 10 min" → `{"duration": 10}`
- "focus for 45 minutes" → `{"duration": 45}`

### `open_dashboard`
```json
{
  "mood": "focus",           // Optional: focus|calm|energetic|creative
  "autoConnectYoutube": true // Optional: auto-connect YouTube
}
```

**Examples:**
- "flowstate init" → `{"autoConnectYoutube": true}`
- "open flowstate with calm mood" → `{"mood": "calm", "autoConnectYoutube": true}`

### `set_mood`
```json
{
  "mood": "focus"  // Required: focus|calm|energetic|creative
}
```

### `suggest_mood`
```json
{
  "apply": true  // Optional: auto-apply the suggestion
}
```

### `take_break`
```json
{
  "type": "short"  // Optional: short (5 min) | long (15 min)
}
```

---

## 🔄 Deployment Flow

After making code changes:

```bash
# 1. Commit and push
git add -A && git commit -m "feat: Description" && git push origin master

# 2. Deploy to Vercel
npx vercel --prod --force 2>&1 | grep "Production:" | tail -1

# 3. Update alias (use the URL from step 2)
npx vercel alias <deployment-url> flowstate-swl.vercel.app
```

---

## 🧪 Testing MCP Tools

To test a tool works:

```
CallMcpTool:
  server: "user-flowstate"
  toolName: "get_timer_status"
  arguments: {}
```

---

## 📚 Always Update Documentation

When adding a new MCP tool:

1. Add tool definition in `src/mcp/flowstate-server.ts` (tools list)
2. Add handler in `src/mcp/flowstate-server.ts` (switch case)
3. **Update `docs/CHEATSHEET.md`** with:
   - Natural language commands
   - MCP tool reference
   - Parameters if any
4. Commit with descriptive message
5. Tell user to restart Cursor

---

## 🎯 Natural Language Mapping

| User Says | Tool to Call |
|-----------|--------------|
| "flowstate init" | `open_dashboard` with `autoConnectYoutube: true` |
| "start timer for X min" | `start_focus_session` with `duration: X` |
| "start pomo" | `start_focus_session` |
| "pause timer" | `pause_focus_session` |
| "resume timer" | `resume_focus_session` |
| "stop timer" | `stop_focus_session` |
| "set mood to calm" | `set_mood` with `mood: "calm"` |
| "what mood should I be in" | `suggest_mood` |
| "suggest a mood and apply it" | `suggest_mood` with `apply: true` |
| "take a break" | `take_break` |
| "take a long break" | `take_break` with `type: "long"` |
| "skip break" | `skip_break` |
| "reset timer config" | `reset_timer_config` |
| "how much time left" | `get_timer_status` |
| "show my stats" | `get_productivity_stats` |
| "give me tips" | `get_mood_tips` |

---

## 🚫 Common Mistakes to Avoid

1. **Using `stop_focus_session` when user says "pause"** - This resets the timer!
2. **Forgetting to update CHEATSHEET.md** - Users won't know about new features
3. **Using localhost URLs** - Always use production URL
4. **Not telling user to restart Cursor** - New tools won't load otherwise
5. **Making raw HTTP calls** - Use MCP tools instead

---

## 📍 Important URLs

- **Production**: https://flowstate-swl.vercel.app
- **API Endpoint**: https://flowstate-swl.vercel.app/api/flowstate
- **GitHub**: https://github.com/Silver-Wolf-Labs/sw-personal

---

<p align="center">
  <strong>FlowState</strong> · IDE-First Productivity
</p>
