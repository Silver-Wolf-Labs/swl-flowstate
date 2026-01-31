# FlowState MCP Server

An MCP (Model Context Protocol) server that integrates FlowState productivity features with IDEs like Cursor, VS Code, and other MCP-compatible tools.

## Features

### Timer Tools
- **start_focus_session** - Start a Pomodoro focus session (default 25 minutes)
- **stop_focus_session** - Pause or stop the current session
- **get_timer_status** - Get current timer status, mode, and progress
- **take_break** - Start a short (5 min) or long (15 min) break
- **skip_break** - Skip break and start a new focus session

### Mood & AI Tools
- **set_mood** - Change your mood (focus, calm, energetic, creative)
- **suggest_mood** - Get an AI-powered mood suggestion based on:
  - Time of day (circadian rhythm patterns)
  - Day of week (workday vs weekend patterns)
  - Your productivity stats (sessions completed, focus time)
- **get_mood_tips** - Get productivity tips for any mood
- **get_productivity_stats** - View your productivity statistics

### Resources
- **flowstate://status** - Real-time timer and mood status
- **flowstate://stats** - Productivity statistics
- **flowstate://mood-suggestion** - AI mood suggestion with reasoning and tips

## Setup

### For Cursor IDE

1. Open Cursor Settings (Cmd+, or Ctrl+,)
2. Go to the "MCP" section
3. Add a new MCP server with this configuration:

```json
{
  "flowstate": {
    "command": "npx",
    "args": ["tsx", "/path/to/swl-flowstate/src/mcp/flowstate-server.ts"]
  }
}
```

Or copy the contents from `mcp-config.json` in the project root.

### For VS Code with MCP Extension

If using an MCP extension for VS Code, configure it to run:

```bash
npx tsx /path/to/swl-flowstate/src/mcp/flowstate-server.ts
```

## Usage Examples

Once configured, you can ask your AI assistant things like:

**Timer Management:**
- "Start a focus session"
- "How much time is left on my timer?"
- "Take a short break"
- "Skip this break and start focusing"

**AI Mood Detection:**
- "What mood should I be in right now?"
- "Suggest a mood for me"
- "Give me productivity tips for creative mode"

**Stats & Tracking:**
- "What are my productivity stats?"
- "Set my mood to creative"
- "How many sessions have I completed?"

## Development

To run the server manually for testing:

```bash
cd swl-flowstate
npx tsx src/mcp/flowstate-server.ts
```

The server communicates via stdio and will output status messages to stderr.

## Architecture

The MCP server maintains its own timer state and can run independently of the web application. In the future, this will be synchronized with the web app via:
- Shared localStorage (for same-machine sync)
- WebSocket connection to the Next.js server
- Cloud sync for cross-device support

## Requirements

- Node.js 18+
- tsx (installed via npx)
