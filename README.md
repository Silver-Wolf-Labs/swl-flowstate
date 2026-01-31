# FlowState

### Mood-Adaptive Productivity Dashboard with AI & IDE Integration

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MCP-Enabled-FF6B6B?style=for-the-badge" alt="MCP" />
</p>

<p align="center">
  <em>Stay in flow while coding. Control your productivity from your IDE or the web.</em>
</p>

<p align="center">
  <strong>Built with 🐺 by Silver Wolf Labs</strong>
</p>

---

## 🎮 Three Ways to Control FlowState

<table>
<tr>
<td width="33%" align="center">

### 🖥️ Web Dashboard
Click buttons directly in the beautiful UI

</td>
<td width="33%" align="center">

### 🤖 AI Assistant
Natural language commands in your IDE

</td>
<td width="33%" align="center">

### ⚡ MCP Tools
Structured commands for automation

</td>
</tr>
</table>

---

## 🚀 IDE Integration (MCP)

FlowState includes a **Model Context Protocol (MCP)** server that lets you control your productivity dashboard directly from **Cursor**, **VS Code**, or any MCP-compatible IDE.

### Quick Start

```bash
# Say this to your AI assistant:
"flowstate init"
```

This opens the dashboard in your browser with YouTube auto-connected and synced to your IDE.

### Natural Language Commands

Just talk to your AI assistant naturally:

| What you say | What happens |
|--------------|--------------|
| `"flowstate init"` | Opens dashboard with YouTube connected |
| `"set my mood to focus"` | Switches to Deep Focus mode |
| `"I need to concentrate"` | AI suggests and applies optimal mood |
| `"what mood should I be in?"` | AI analyzes your patterns and suggests |
| `"start a focus session"` | Begins 25-min pomodoro timer |
| `"how productive have I been?"` | Shows your stats and insights |
| `"I'm feeling tired"` | AI suggests Calm mode with reasoning |
| `"open flowstate with creative mood"` | Opens dashboard in Creative mode |

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `open_dashboard` | Launch FlowState in browser with auto-connect |
| `set_mood` | Change mood (focus, calm, energetic, creative) |
| `suggest_mood` | AI analyzes and recommends optimal mood |
| `get_mood_tips` | Get productivity tips for current mood |
| `start_focus_session` | Start a pomodoro timer |
| `stop_focus_session` | Stop the current session |
| `take_break` | Switch to break mode |
| `skip_break` | Skip break and continue focusing |
| `get_timer_status` | Check timer state |
| `get_productivity_stats` | View your productivity metrics |

### Setup for Cursor IDE

Add to your `mcp.json` (or Cursor MCP settings):

```json
{
  "mcpServers": {
    "flowstate": {
      "command": "/path/to/swl-flowstate/src/mcp/run-server.sh",
      "args": []
    }
  }
}
```

### Real-Time Sync

Changes sync **bidirectionally**:
- Change mood in IDE → Web UI updates instantly
- Click buttons in web → IDE state stays current
- Timer updates flow both directions

---

## 🧠 AI Mood Detection

FlowState uses AI to suggest the optimal mood based on:

| Factor | How it's used |
|--------|---------------|
| **Time of Day** | Morning energy, afternoon focus, evening creativity |
| **Day of Week** | Weekday productivity vs weekend relaxation |
| **Your Stats** | Sessions completed, focus time, streaks |
| **Patterns** | Peak productivity hours, session history |

```
🤖 AI Mood Suggestion

Good evening!

🎨 Recommended: Creative
📊 Confidence: 78%

Why this mood?
• Creative time of day (7:00 PM)
• Low session count today - fresh energy
• Weekend approaching - relaxed mindset

Quick tip: Try unconventional approaches
```

---

## ✨ Features

### 🎯 Mood Modes

| Mode | Vibe | Best For |
|------|------|----------|
| **Deep Focus** | Purple/Violet | Crushing complex problems |
| **Energetic** | Orange/Amber | High-velocity shipping |
| **Creative** | Pink/Rose | Exploring new ideas |
| **Calm** | Teal/Cyan | Steady, relaxed progress |

### ⏱️ Focus Timer
- Pomodoro-style sessions with custom focus, short break, and long break durations
- Visual progress ring with animations
- **Sound notifications** when sessions end
- **Browser notifications** for background awareness
- Auto-switching between focus and break modes

### 🎵 Vibe Zone
- **YouTube** - 24/7 lofi livestreams
- **Spotify** - Curated focus playlists
- **SoundCloud** - Ambient and electronic
- **Apple Music** - Integrated playback
- Auto-connects when launching from IDE

### 📊 Analytics
- Daily focus time tracking
- Weekly performance charts
- Activity heatmap
- AI-powered insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Animations** | Framer Motion 12 |
| **Language** | TypeScript 5 |
| **IDE Integration** | Model Context Protocol (MCP) |
| **Email** | Resend API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Silver-Wolf-Labs/swl-flowstate.git
cd swl-flowstate

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Documentation

- [Quick Start Guide](docs/QUICK-START-GUIDE.md)
- [MCP Setup](docs/MCP-SETUP.md)
- [API Reference](docs/API.md)
- [Command Cheat Sheet](docs/CHEATSHEET.md)

### Environment Variables

Create `.env.local` (see `.env.example` for the full list):

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=your_apple_music_token_here
NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

---

## 📁 Project Structure

```
flowstate/
├── docs/
│   ├── QUICK-START-GUIDE.md    # Quick start guide
│   ├── MCP-SETUP.md            # MCP setup instructions
│   ├── API.md                  # API reference
│   ├── CHEATSHEET.md           # Command cheat sheet
│   └── AGENT-WORKFLOW.md       # Agent workflow rules
├── public/
│   └── soundcloud-placeholder.svg
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/           # OAuth callbacks
│   │   │   │   ├── soundcloud/ # SoundCloud callback
│   │   │   │   └── spotify/    # Spotify callback
│   │   │   ├── contact/        # Email API
│   │   │   └── flowstate/      # Sync endpoint
│   │   └── page.tsx            # Main dashboard
│   ├── components/
│   │   ├── dashboard/          # Feature components
│   │   └── ui/                 # Reusable UI
│   ├── hooks/
│   │   ├── use-analytics.ts
│   │   ├── use-flowstate-sync.ts  # IDE sync hook
│   │   └── use-music.ts
│   ├── lib/
│   │   ├── mood-detection.ts   # AI mood logic
│   │   └── music/              # Service integrations
│   └── mcp/
│       ├── flowstate-server.ts # MCP server
│       ├── run-server.sh       # Server launcher
│       └── README.md           # MCP documentation
└── mcp-config.json             # Cursor MCP config
```

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE.md) file for details.
---

<p align="center">
  <strong>FlowState</strong> · Control your flow from anywhere
</p>

<p align="center">
  <sub>Made with ❤️ and lots of ☕ by Silver Wolf Labs</sub>
</p>
