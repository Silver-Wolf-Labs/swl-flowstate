# FlowState Cheat Sheet

> Quick reference for controlling FlowState from your IDE

---

## 🚀 Getting Started

```
"flowstate init"
```
Opens the dashboard with YouTube auto-connected.

---

## 🎯 Mood Commands

### Set Mood Directly

| Say this | Result |
|----------|--------|
| `"set mood to focus"` | 🎯 Deep Focus mode |
| `"set mood to calm"` | 🧘 Calm mode |
| `"set mood to energetic"` | ⚡ Energetic mode |
| `"set mood to creative"` | 🎨 Creative mode |

### Natural Language

| Say this | AI interprets as |
|----------|------------------|
| `"I need to concentrate"` | → Deep Focus |
| `"I'm feeling relaxed"` | → Calm |
| `"Let's get pumped"` | → Energetic |
| `"Time to brainstorm"` | → Creative |

### AI Suggestions

| Command | What it does |
|---------|--------------|
| `"what mood should I be in?"` | AI analyzes and suggests |
| `"suggest a mood"` | Get recommendation with reasoning |
| `"I'm feeling tired"` | AI suggests based on context |
| `"help me choose a mood"` | Interactive suggestion |

---

## ⏱️ Timer Commands

### Start & Stop

| Command | Action |
|---------|--------|
| `"start a focus session"` | Begin 25-min pomodoro |
| `"start focusing"` | Same as above |
| `"stop the timer"` | End current session |
| `"pause my session"` | Stop focus session |

### Breaks

| Command | Action |
|---------|--------|
| `"take a break"` | Switch to break mode |
| `"I need a break"` | Same as above |
| `"skip break"` | Skip and continue focusing |
| `"keep working"` | Skip break |

### Status

| Command | Action |
|---------|--------|
| `"how much time left?"` | Check remaining time |
| `"timer status"` | Full timer info |
| `"am I on a break?"` | Check current mode |

### Settings

| Command | Action |
|---------|--------|
| `"reset timer config"` | Reset to defaults (25/5/15 min) |
| `"reset timer to defaults"` | Same as above |
| `"restore default timer"` | Same as above |

---

## 📊 Stats & Insights

| Command | What you get |
|---------|--------------|
| `"how productive have I been?"` | Full stats summary |
| `"show my stats"` | Sessions, focus time, streaks |
| `"my productivity"` | Performance overview |
| `"give me tips"` | Mood-specific productivity tips |
| `"how can I be more productive?"` | AI tips for current mood |

---

## 🎵 Music & Dashboard

| Command | Action |
|---------|--------|
| `"flowstate init"` | Open dashboard + YouTube |
| `"open flowstate"` | Open dashboard |
| `"open flowstate with focus mood"` | Open + set mood |
| `"launch the dashboard"` | Open in browser |

---

## 🔧 MCP Tool Reference

For automation and scripting, these are the raw MCP tools:

```
open_dashboard      - Launch web UI
set_mood            - Change mood state  
suggest_mood        - AI mood recommendation
get_mood_tips       - Productivity tips
start_focus_session - Begin timer
stop_focus_session  - End timer
take_break          - Switch to break
skip_break          - Skip break mode
reset_timer_config  - Reset timer to defaults (25/5/15)
get_timer_status    - Timer info
get_productivity_stats - Analytics data
```

### Tool Parameters

#### `open_dashboard`
```json
{
  "mood": "focus|calm|energetic|creative",
  "autoConnectYoutube": true
}
```

#### `set_mood`
```json
{
  "mood": "focus|calm|energetic|creative"
}
```

#### `suggest_mood`
```json
{
  "apply": true  // Auto-apply the suggestion
}
```

#### `start_focus_session`
```json
{
  "duration": 25  // Minutes (default: 25)
}
```

---

## 💡 Pro Tips

### Combine Commands
```
"open flowstate with energetic mood and start a focus session"
```

### Context-Aware Suggestions
```
"It's late and I'm tired but need to finish this feature"
→ AI will suggest Calm mode with reasoning
```

### Quick Workflow
```
1. "flowstate init"           # Open dashboard
2. "what mood should I be in" # Get AI suggestion  
3. "start focusing"           # Begin session
4. "how productive was I"     # Check stats after
```

---

## 🎨 Mood Quick Reference

| Mood | Color | Best For | Music Vibe |
|------|-------|----------|------------|
| 🎯 **Focus** | Purple | Deep work, complex problems | Lo-fi, ambient |
| 🧘 **Calm** | Teal | Steady progress, reviewing | Peaceful, nature |
| ⚡ **Energetic** | Orange | Shipping fast, high velocity | Upbeat, electronic |
| 🎨 **Creative** | Pink | Brainstorming, exploring | Experimental, indie |

---

## ⌨️ Keyboard Shortcuts (Web UI)

| Key | Action |
|-----|--------|
| `Space` | Play/Pause timer |
| `R` | Reset timer |
| `1-4` | Select mood (Focus, Energetic, Creative, Calm) |

---

## 🔗 Quick Links

- **Dashboard**: https://flowstate-swl.vercel.app
- **Local Dev**: http://localhost:3000
- **MCP Config**: `mcp-config.json`
- **MCP Server**: `src/mcp/flowstate-server.ts`

---

<p align="center">
  <strong>FlowState</strong> · Your productivity, your way
</p>
