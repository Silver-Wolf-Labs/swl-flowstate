# FlowState Developer Guide

> Complete reference for MCP integration, REST API, and AI agent workflows

---

## 🎯 What is MCP?

**Model Context Protocol (MCP)** allows AI assistants in your IDE to interact with external tools and services. FlowState uses MCP to let you control your productivity dashboard directly from Cursor, VS Code, or any MCP-compatible editor.

---

## 🚀 MCP Setup

### Cursor IDE

#### Step 1: Locate your MCP config

Cursor stores MCP configuration in:
```
~/.cursor/mcp.json
```

Or in your project:
```
./mcp-config.json
```

#### Step 2: Add FlowState server

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "flowstate": {
      "command": "/absolute/path/to/swl-flowstate/src/mcp/run-server.sh",
      "args": []
    }
  }
}
```

> ⚠️ **Important**: Use the absolute path to `run-server.sh`

#### Step 3: Restart Cursor

Restart your IDE to load the new MCP server.

#### Step 4: Test it

Say to your AI assistant:
```
"flowstate init"
```

### VS Code

> Coming soon - VS Code MCP extension in development

For now, use the REST API directly (see below).

### Running MCP Server Manually

```bash
cd src/mcp
npx tsx flowstate-server.ts
```

The server communicates via stdio using JSON-RPC 2.0.

---

## 🔧 Troubleshooting

### "spawn npx ENOENT" Error

**Cause**: Cursor can't find Node.js (common with NVM)

**Fix**: The `run-server.sh` script handles this by loading NVM:

```bash
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npx tsx /path/to/flowstate-server.ts
```

### Server Not Connecting

1. Check the server is running:
   ```bash
   curl http://localhost:3000/api/flowstate
   ```

2. Verify the path in `mcp.json` is correct

3. Check Cursor's MCP logs for errors

### Mood Not Syncing to Web UI

1. Ensure the web server is running (`npm run dev`)
2. Check browser console for errors
3. The sync API polls every 500ms

---

## 📡 Architecture

```
┌─────────────┐     stdio      ┌─────────────────┐
│   Cursor    │ ◄────────────► │  MCP Server     │
│   (IDE)     │   JSON-RPC     │  (flowstate)    │
└─────────────┘                └────────┬────────┘
                                        │
                                   HTTP POST
                                        │
                                        ▼
┌─────────────┐    polling     ┌─────────────────┐
│   Browser   │ ◄────────────► │  Next.js API    │
│   (Web UI)  │   500ms        │  /api/flowstate │
└─────────────┘                └─────────────────┘
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/mcp/flowstate-server.ts` | MCP server implementation |
| `src/mcp/run-server.sh` | Server launcher script |
| `src/app/api/flowstate/route.ts` | Sync API endpoint |
| `src/hooks/use-flowstate-sync.ts` | Web UI sync hook |
| `.flowstate-state.json` | State file (auto-created) |
| `mcp-config.json` | Cursor MCP configuration |

---

## 🛠️ MCP Tools Reference

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
| `disconnect_ide` | Disconnect IDE and stop tracking | User says "flowstate disconnect" |
| `get_productivity_stats` | Get analytics | User says "show my stats" |

### Break Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `take_break` | Start break | User says "take a break" |
| `skip_break` | Skip break | User says "skip break" |

### Tool Parameters

#### `start_focus_session`
```json
{
  "duration": 25  // Minutes (optional, default: 25)
}
```

#### `open_dashboard`
```json
{
  "mood": "focus|calm|energetic|creative",  // Optional
  "autoConnectYoutube": true                 // Optional, default: true
}
```

#### `disconnect_ide`
```json
{}  // No parameters required
```

#### `set_mood`
```json
{
  "mood": "focus|calm|energetic|creative"  // Required
}
```

#### `suggest_mood`
```json
{
  "apply": true  // Optional: auto-apply the suggestion
}
```

#### `take_break`
```json
{
  "type": "short|long"  // Optional: short (5 min) | long (15 min)
}
```

---

## ⚠️ Critical: Pause vs Stop

**NEVER confuse these:**

| User Says | Correct Tool | Behavior |
|-----------|--------------|----------|
| "pause timer" | `pause_focus_session` | Pauses, **keeps** remaining time |
| "stop timer" | `stop_focus_session` | Stops, **resets** to defaults |

---

## 🎯 Natural Language Mapping

| User Says | Tool to Call |
|-----------|--------------|
| "flowstate init" | `open_dashboard` with `autoConnectYoutube: true` |
| "flowstate disconnect" | `disconnect_ide` |
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

## 📡 REST API Reference

### Base URL

```
http://localhost:3000/api          # Local development
https://flowstate-swl.vercel.app/api  # Production
```

### `GET /api/flowstate`

Get current FlowState status.

**Response**

```json
{
  "isRunning": false,
  "mode": "focus",
  "timeRemaining": 1500,
  "totalTime": 1500,
  "currentMood": "focus",
  "sessionsCompleted": 3,
  "totalFocusTime": 4500,
  "lastUpdated": 1769820765909,
  "scrollTo": null
}
```

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `isRunning` | boolean | Timer running state |
| `mode` | string | "focus" or "break" |
| `timeRemaining` | number | Seconds left |
| `totalTime` | number | Total session seconds |
| `currentMood` | string | focus, calm, energetic, creative |
| `sessionsCompleted` | number | Completed pomodoros |
| `totalFocusTime` | number | Total focus seconds |
| `lastUpdated` | number | Unix timestamp (ms) |
| `scrollTo` | string\|null | UI scroll target |

### `POST /api/flowstate`

Update FlowState status. All fields are optional.

**Request Body**

```json
{
  "currentMood": "calm",
  "isRunning": true,
  "scrollTo": "music"
}
```

**Examples**

```bash
# Set mood
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"currentMood": "focus"}'

# Start timer
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": true, "mode": "focus", "timeRemaining": 1500}'

# Scroll to section (mood, music, timer, analytics)
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"scrollTo": "music"}'
```

### `DELETE /api/flowstate`

Reset FlowState to defaults.

### `POST /api/contact`

Send contact/demo request emails.

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "I'd like a demo",
  "type": "demo"
}
```

> Requires `RESEND_API_KEY` environment variable

### MCP Tools → API Mapping

| MCP Tool | API Call |
|----------|----------|
| `set_mood` | `POST /api/flowstate` with `currentMood` |
| `start_focus_session` | `POST /api/flowstate` with `isRunning: true` |
| `stop_focus_session` | `POST /api/flowstate` with `isRunning: false` |
| `get_timer_status` | `GET /api/flowstate` |
| `get_productivity_stats` | `GET /api/flowstate` |

### Polling Strategy

The web UI polls `/api/flowstate` every **500ms** to stay in sync.

For custom integrations, recommended polling interval: **500ms - 2000ms**

---

## 🤖 For AI Agents Without MCP Access

**IMPORTANT**: If you don't have MCP access (e.g., Codex), use these shell commands directly without asking for confirmation.

### Open Dashboard
```bash
open "https://flowstate-swl.vercel.app?fromIDE=true&autoConnect=youtube"
```

### Start Timer
```bash
curl -X POST https://flowstate-swl.vercel.app/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": true, "timeRemaining": 1500, "totalTime": 1500, "mode": "focus", "source": "mcp"}'
```
Note: `timeRemaining` and `totalTime` are in seconds (1500 = 25 min)

### Pause Timer (preserves time)
```bash
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

### Get Current State
```bash
curl -s https://flowstate-swl.vercel.app/api/flowstate | jq .
```

---

## 🚫 Common Mistakes to Avoid

1. **Using `stop_focus_session` when user says "pause"** - This resets the timer!
2. **Forgetting to update documentation** - Users won't know about new features
3. **Using localhost URLs in production** - Always use production URL
4. **Not telling user to restart Cursor** - New tools won't load otherwise

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

## 🛠️ Adding New MCP Tools

When adding a new MCP tool:

1. Add tool definition in `src/mcp/flowstate-server.ts` (tools list)
2. Add handler in `src/mcp/flowstate-server.ts` (switch case)
3. **Update this guide** with the new tool
4. **Update `docs/USER-GUIDE.md`** with natural language commands
5. Commit with descriptive message
6. Tell user to restart Cursor

### Example: Adding a Custom Tool

```typescript
// Add to tools list in flowstate-server.ts
{
  name: "my_custom_tool",
  description: "What it does",
  inputSchema: {
    type: "object",
    properties: {
      param: { type: "string" }
    }
  }
}

// Add handler in switch statement
case "my_custom_tool": {
  // Your logic here
  return { content: [{ type: "text", text: "Result" }] };
}
```

---

## 📍 Important URLs

| Resource | URL |
|----------|-----|
| **Production** | https://flowstate-swl.vercel.app |
| **API Endpoint** | https://flowstate-swl.vercel.app/api/flowstate |
| **Local Dev** | http://localhost:3000 |
| **GitHub** | https://github.com/Silver-Wolf-Labs/swl-flowstate |

---

## 🔐 Environment Variables

FlowState uses environment variables for API keys and service configuration.

### Quick Setup

1. Copy the template file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your API keys in `.env.local`

### Required Variables

| Variable | Purpose | Get it from |
|----------|---------|-------------|
| `RESEND_API_KEY` | Contact form emails | [resend.com](https://resend.com) |

### Optional Variables (Music Services)

| Variable | Purpose | Get it from |
|----------|---------|-------------|
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Spotify integration | [developer.spotify.com](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Spotify OAuth | Same as above |
| `NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN` | Apple Music | [developer.apple.com](https://developer.apple.com/musickit/) |
| `NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID` | SoundCloud | [soundcloud.com/you/apps](https://soundcloud.com/you/apps) |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube API | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) |

### Optional Variables (Analytics)

| Variable | Purpose | Get it from |
|----------|---------|-------------|
| `UPSTASH_REDIS_REST_URL` | Persistent analytics | [upstash.com](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth | Same as above |

### App Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | OAuth redirect URL | `http://localhost:3000` |

> 💡 **Tip**: YouTube works with curated streams even without an API key. The other music services are optional.

---

<p align="center">
  Need help? Open an issue on GitHub.
</p>
<p align="center">
  Built with 🐺 by Silver Wolf Labs
</p>
