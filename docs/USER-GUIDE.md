# FlowState User Guide

> Complete reference for controlling FlowState from your IDE or web dashboard

---

## ⚡ Quick Start (30 seconds)

### 1. Start the server
```bash
npm run dev
```

### 2. Open in IDE
Say to your AI assistant:
```
"flowstate init"
```

### 3. Start working
```
"set mood to focus and start a session"
```

That's it. You're in flow. 🚀

---

## 🎯 Common Workflows

### Morning Startup
```
"flowstate init"
"what mood should I be in?"
"start a focus session"
```

### Quick Focus
```
"set mood to focus"
"start focusing"
```

### End of Day Review
```
"how productive was I today?"
"give me tips for tomorrow"
```

---

## 🎨 Mood Commands

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
| `"start timer for 10 minutes"` | Custom duration (10 min) |
| `"start pomo for 45 min"` | Custom duration (45 min) |
| `"focus for 30 minutes"` | Custom duration (30 min) |
| `"pause the timer"` | Pause, keep remaining time |
| `"pause my session"` | Same as above |
| `"resume timer"` | Continue from where you paused |
| `"continue focusing"` | Same as above |
| `"stop the timer"` | Stop and reset timer |
| `"stop my session"` | Same as above |

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

## 🔗 Quick Links

- **Dashboard**: https://flowstate-swl.vercel.app
- **Local Dev**: http://localhost:3000
- **Developer Guide**: [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)
- **Main README**: [../README.md](../README.md)

---

<p align="center">
  <strong>FlowState</strong> · Your productivity, your way
</p>
<p align="center">
  Built with 🐺 by Silver Wolf Labs
</p>

