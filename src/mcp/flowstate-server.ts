#!/usr/bin/env node
/**
 * FlowState MCP Server
 * 
 * An MCP server that integrates FlowState productivity features with IDEs like Cursor, VS Code, etc.
 * 
 * Features:
 * - Start/stop focus sessions
 * - Get timer status
 * - Change mood
 * - Get productivity stats
 * - Receive notifications
 * - Sync with web dashboard
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

// Web app sync URL - defaults to production, set FLOWSTATE_WEB_URL=http://localhost:3000 for local dev
const WEB_APP_URL = process.env.FLOWSTATE_WEB_URL || "https://flowstate-swl.vercel.app";

// Detect which IDE is running based on environment
function detectIDE(): "cursor" | "vscode" | "windsurf" | "intellij" | "unknown" {
  // Check common environment variables set by IDEs
  const termProgram = process.env.TERM_PROGRAM || "";
  const vscodeIpcHook = process.env.VSCODE_IPC_HOOK || "";
  const cursorIpcHook = process.env.CURSOR_IPC_HOOK || "";

  // Additional Cursor detection - check various env vars that Cursor sets
  const isCursor =
    cursorIpcHook ||
    termProgram.toLowerCase().includes("cursor") ||
    process.env.CURSOR_TRACE_ID ||
    process.env.CURSOR_CHANNEL ||
    (process.env.APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL && vscodeIpcHook?.includes("cursor")) ||
    process.env.__CFBundleIdentifier?.includes("cursor") ||
    process.env.XPC_SERVICE_NAME?.includes("cursor") ||
    // MCP servers in Cursor are typically spawned with cursor in the path
    process.env._?.includes("cursor") ||
    process.argv.some(arg => arg.toLowerCase().includes("cursor"));

  if (isCursor) {
    return "cursor";
  }
  if (vscodeIpcHook || termProgram.toLowerCase().includes("vscode")) {
    return "vscode";
  }
  if (process.env.WINDSURF_IPC_HOOK || termProgram.toLowerCase().includes("windsurf")) {
    return "windsurf";
  }
  if (process.env.IDEA_INITIAL_DIRECTORY || process.env.JETBRAINS_IDE) {
    return "intellij";
  }
  // Default to cursor since this MCP server is primarily used with Cursor
  // If other IDEs are detected, they would have matched above
  return "cursor";
}

// File-based flag to track IDE connection state (shared across all MCP server instances)
const CONNECTION_FLAG_FILE = path.join(os.tmpdir(), "flowstate-ide-connected");

// Check if IDE is connected (reads from file)
function isIDEConnectedFlag(): boolean {
  try {
    return fs.existsSync(CONNECTION_FLAG_FILE);
  } catch {
    return false;
  }
}

// Set IDE connection state (writes to file)
function setIDEConnectedFlag(connected: boolean) {
  try {
    if (connected) {
      fs.writeFileSync(CONNECTION_FLAG_FILE, Date.now().toString());
    } else {
      if (fs.existsSync(CONNECTION_FLAG_FILE)) {
        fs.unlinkSync(CONNECTION_FLAG_FILE);
      }
    }
  } catch (error) {
    console.error("Failed to update connection flag:", error);
  }
}

// Send IDE connection heartbeat
async function sendIDEHeartbeat() {
  // Only send heartbeat if connected (check file flag)
  const connected = isIDEConnectedFlag();
  console.error(`[FlowState] Heartbeat check - file exists: ${connected}, path: ${CONNECTION_FLAG_FILE}`);
  if (!connected) {
    console.error(`[FlowState] Skipping heartbeat - not connected`);
    return;
  }

  try {
    const ide = detectIDE();
    console.error(`[FlowState] Sending heartbeat for ${ide}`);
    await fetch(`${WEB_APP_URL}/api/ide-connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "heartbeat", ide }),
    });
  } catch (error) {
    // Web app might not be running, that's okay
    console.error("IDE heartbeat failed:", error);
  }
}

// Send IDE connect event
async function sendIDEConnect() {
  try {
    const ide = detectIDE();
    await fetch(`${WEB_APP_URL}/api/ide-connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connect", ide }),
    });
    setIDEConnectedFlag(true);
  } catch (error) {
    console.error("IDE connect failed:", error);
  }
}

// Send IDE disconnect event
async function sendIDEDisconnect() {
  try {
    const ide = detectIDE();
    setIDEConnectedFlag(false); // Set flag BEFORE sending request so other processes stop immediately
    await fetch(`${WEB_APP_URL}/api/ide-connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect", ide }),
    });
  } catch (error) {
    console.error("IDE disconnect failed:", error);
  }
}

// Sync state with web app
async function syncWithWebApp(updates: Record<string, unknown>, scrollTo?: string) {
  try {
    // Always include source: "mcp" to identify updates from IDE
    const payload = {
      ...updates,
      source: "mcp",
      ...(scrollTo ? { scrollTo } : {}),
    };
    await fetch(`${WEB_APP_URL}/api/flowstate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Also send heartbeat on every sync
    await sendIDEHeartbeat();
  } catch (error) {
    // Web app might not be running, that's okay
    console.error("Web sync failed (web app may not be running):", error);
  }
}

// FlowState state management (shared via file or environment)
interface FlowStateSession {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  startedAt: string | null;
  currentMood: "focus" | "calm" | "energetic" | "creative";
  sessionsCompleted: number;
  totalFocusTime: number; // seconds
}

// Default session state
let sessionState: FlowStateSession = {
  isRunning: false,
  mode: "focus",
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  startedAt: null,
  currentMood: "focus",
  sessionsCompleted: 0,
  totalFocusTime: 0,
};

// Timer interval
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Mode durations in seconds
const DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// ============================================
// AI MOOD DETECTION SYSTEM
// ============================================

type MoodId = "focus" | "calm" | "energetic" | "creative";

interface MoodSuggestion {
  mood: MoodId;
  confidence: number;
  reasoning: string[];
  tips: string[];
}

// Circadian rhythm-based mood mapping
const TIME_MOOD_MAP: Record<string, { mood: MoodId; weight: number }> = {
  "05": { mood: "calm", weight: 0.7 },
  "06": { mood: "calm", weight: 0.8 },
  "07": { mood: "energetic", weight: 0.6 },
  "08": { mood: "focus", weight: 0.9 },
  "09": { mood: "focus", weight: 1.0 },
  "10": { mood: "focus", weight: 1.0 },
  "11": { mood: "focus", weight: 0.9 },
  "12": { mood: "creative", weight: 0.7 },
  "13": { mood: "calm", weight: 0.6 },
  "14": { mood: "creative", weight: 0.7 },
  "15": { mood: "focus", weight: 0.8 },
  "16": { mood: "energetic", weight: 0.8 },
  "17": { mood: "energetic", weight: 0.7 },
  "18": { mood: "creative", weight: 0.8 },
  "19": { mood: "creative", weight: 0.9 },
  "20": { mood: "calm", weight: 0.8 },
  "21": { mood: "calm", weight: 0.9 },
  "22": { mood: "calm", weight: 0.7 },
  "23": { mood: "calm", weight: 0.6 },
  "00": { mood: "focus", weight: 0.5 },
  "01": { mood: "focus", weight: 0.4 },
  "02": { mood: "calm", weight: 0.3 },
  "03": { mood: "calm", weight: 0.3 },
  "04": { mood: "calm", weight: 0.4 },
};

// Day of week patterns
const DAY_MOOD_BIAS: Record<number, { mood: MoodId; weight: number }> = {
  0: { mood: "calm", weight: 0.3 },
  1: { mood: "focus", weight: 0.4 },
  2: { mood: "focus", weight: 0.5 },
  3: { mood: "focus", weight: 0.5 },
  4: { mood: "creative", weight: 0.4 },
  5: { mood: "energetic", weight: 0.4 },
  6: { mood: "creative", weight: 0.3 },
};

// Mood tips
const MOOD_TIPS: Record<MoodId, string[]> = {
  focus: [
    "Close unnecessary tabs and apps",
    "Put your phone in another room",
    "Use the Pomodoro technique for sustained attention",
    "Take short breaks every 25-30 minutes",
  ],
  calm: [
    "Take deep breaths before starting",
    "Work at a steady, comfortable pace",
    "Don't rush - quality over speed",
    "Play ambient or lo-fi music",
  ],
  energetic: [
    "Tackle challenging tasks first",
    "Keep momentum with quick wins",
    "Stay hydrated and take movement breaks",
    "Channel energy into productive output",
  ],
  creative: [
    "Allow yourself to explore tangents",
    "Brainstorm without judgment",
    "Take walks to spark ideas",
    "Try unconventional approaches",
  ],
};

function detectMood(): MoodSuggestion {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, "0");
  const dayOfWeek = now.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const scores: Record<MoodId, { score: number; reasons: string[] }> = {
    focus: { score: 0, reasons: [] },
    calm: { score: 0, reasons: [] },
    energetic: { score: 0, reasons: [] },
    creative: { score: 0, reasons: [] },
  };

  // Time-based scoring (40%)
  const timeData = TIME_MOOD_MAP[hour];
  if (timeData) {
    scores[timeData.mood].score += timeData.weight * 40;
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    scores[timeData.mood].reasons.push(
      `${timeData.mood === "focus" ? "Peak focus hours" : 
        timeData.mood === "creative" ? "Creative time of day" :
        timeData.mood === "energetic" ? "High energy period" : 
        "Natural wind-down time"} (${timeStr})`
    );
  }

  // Day of week (20%)
  const dayData = DAY_MOOD_BIAS[dayOfWeek];
  if (dayData) {
    scores[dayData.mood].score += dayData.weight * 20;
    scores[dayData.mood].reasons.push(
      `${dayNames[dayOfWeek]}s are great for ${dayData.mood === "focus" ? "focused work" : 
        dayData.mood === "creative" ? "creative thinking" : 
        dayData.mood === "energetic" ? "high-energy tasks" : "relaxed productivity"}`
    );
  }

  // Session-based (40%)
  if (sessionState.sessionsCompleted >= 6) {
    scores.calm.score += 24;
    scores.calm.reasons.push(`You've completed ${sessionState.sessionsCompleted} sessions - consider a calmer pace`);
  } else if (sessionState.sessionsCompleted === 0) {
    scores.energetic.score += 16;
    scores.energetic.reasons.push("Start your day with energy to build momentum");
  } else if (sessionState.sessionsCompleted >= 2 && sessionState.currentMood === "focus") {
    scores.creative.score += 16;
    scores.creative.reasons.push("After focused work, a creative session can spark new ideas");
  }

  // Find best mood
  let bestMood: MoodId = "focus";
  let highestScore = 0;
  for (const [mood, data] of Object.entries(scores)) {
    if (data.score > highestScore) {
      highestScore = data.score;
      bestMood = mood as MoodId;
    }
  }

  return {
    mood: bestMood,
    confidence: Math.min(100, Math.round(highestScore)),
    reasoning: scores[bestMood].reasons.filter(Boolean),
    tips: MOOD_TIPS[bestMood],
  };
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night warrior!";
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  if (hour < 21) return "Good evening!";
  return "Good night!";
}

// Helper functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function startTimer(scrollTo?: string) {
  if (timerInterval) clearInterval(timerInterval);
  
  sessionState.isRunning = true;
  sessionState.startedAt = new Date().toISOString();
  
  // Sync with web app
  syncWithWebApp({
    isRunning: true,
    mode: sessionState.mode,
    timeRemaining: sessionState.timeRemaining,
    totalTime: sessionState.totalTime,
    currentMood: sessionState.currentMood,
    sessionsCompleted: sessionState.sessionsCompleted,
    totalFocusTime: sessionState.totalFocusTime,
  }, scrollTo || "timer");
  
  timerInterval = setInterval(() => {
    if (sessionState.timeRemaining > 0) {
      sessionState.timeRemaining--;
      // Sync every 10 seconds to reduce load
      if (sessionState.timeRemaining % 10 === 0) {
        syncWithWebApp({
          timeRemaining: sessionState.timeRemaining,
          isRunning: true,
        });
      }
    } else {
      // Timer finished
      stopTimer();
      if (sessionState.mode === "focus") {
        sessionState.sessionsCompleted++;
        sessionState.totalFocusTime += sessionState.totalTime;
      }
      // Auto-switch to break
      if (sessionState.mode === "focus") {
        sessionState.mode = sessionState.sessionsCompleted % 4 === 0 ? "longBreak" : "shortBreak";
      } else {
        sessionState.mode = "focus";
      }
      sessionState.totalTime = DURATIONS[sessionState.mode];
      sessionState.timeRemaining = DURATIONS[sessionState.mode];
      
      // Sync completion
      syncWithWebApp({
        isRunning: false,
        mode: sessionState.mode,
        timeRemaining: sessionState.timeRemaining,
        totalTime: sessionState.totalTime,
        sessionsCompleted: sessionState.sessionsCompleted,
        totalFocusTime: sessionState.totalFocusTime,
      });
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  sessionState.isRunning = false;
  
  // Sync with web app
  syncWithWebApp({
    isRunning: false,
    timeRemaining: sessionState.timeRemaining,
  });
}

function resetTimer() {
  stopTimer();
  sessionState.timeRemaining = DURATIONS[sessionState.mode];
  sessionState.totalTime = DURATIONS[sessionState.mode];
  sessionState.startedAt = null;
  
  // Sync with web app
  syncWithWebApp({
    isRunning: false,
    timeRemaining: sessionState.timeRemaining,
    totalTime: sessionState.totalTime,
  });
}

// Create MCP server
const server = new Server(
  {
    name: "flowstate-productivity",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "start_focus_session",
        description: "Start a focus session (Pomodoro timer). Use this when you want to begin a focused work period.",
        inputSchema: {
          type: "object" as const,
          properties: {
            duration: {
              type: "number",
              description: "Duration in minutes (default: 25)",
            },
          },
        },
      },
      {
        name: "pause_focus_session",
        description: "Pause the current focus session, preserving the remaining time. Use this when you need a temporary break but want to continue later.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "resume_focus_session",
        description: "Resume a paused focus session from where you left off. Use this to continue after pausing.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "stop_focus_session",
        description: "Stop and reset the current focus session. Use this when you want to completely end the session and start fresh.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "get_timer_status",
        description: "Get the current status of the focus timer including time remaining, mode, and session count.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "set_mood",
        description: "Set your current mood to adapt the productivity environment. Options: focus, calm, energetic, creative.",
        inputSchema: {
          type: "object" as const,
          properties: {
            mood: {
              type: "string",
              enum: ["focus", "calm", "energetic", "creative"],
              description: "Your current mood",
            },
          },
          required: ["mood"],
        },
      },
      {
        name: "get_productivity_stats",
        description: "Get your productivity statistics including sessions completed, total focus time, and current streak.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "take_break",
        description: "Start a break session. Optionally specify short (5 min) or long (15 min) break.",
        inputSchema: {
          type: "object" as const,
          properties: {
            type: {
              type: "string",
              enum: ["short", "long"],
              description: "Break type (default: short)",
            },
          },
        },
      },
      {
        name: "skip_break",
        description: "Skip the current break and start a new focus session immediately.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "reset_timer_config",
        description: "Reset the timer configuration to defaults (25 min focus, 5 min short break, 15 min long break). Use this to restore default settings on a device.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "suggest_mood",
        description: "Get an AI-powered mood suggestion based on time of day, day of week, and your productivity patterns. Use this to optimize your work environment.",
        inputSchema: {
          type: "object" as const,
          properties: {
            apply: {
              type: "boolean",
              description: "If true, automatically apply the suggested mood (default: false)",
            },
          },
        },
      },
      {
        name: "get_mood_tips",
        description: "Get productivity tips for your current mood or a specified mood.",
        inputSchema: {
          type: "object" as const,
          properties: {
            mood: {
              type: "string",
              enum: ["focus", "calm", "energetic", "creative"],
              description: "The mood to get tips for (default: current mood)",
            },
          },
        },
      },
      {
        name: "open_dashboard",
        description: "Open the FlowState dashboard in the default browser. Use 'flowstate init' or 'open flowstate' to trigger this. Optionally set mood and auto-connect to YouTube.",
        inputSchema: {
          type: "object" as const,
          properties: {
            mood: {
              type: "string",
              enum: ["focus", "calm", "energetic", "creative"],
              description: "Set mood when opening (optional)",
            },
            autoConnectYoutube: {
              type: "boolean",
              description: "Auto-connect to YouTube when dashboard opens (default: true)",
            },
          },
        },
      },
      {
        name: "disconnect_ide",
        description: "Disconnect from the FlowState dashboard and stop IDE tracking. Use 'flowstate disconnect' to trigger this.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "start_focus_session": {
      const duration = (args?.duration as number) || 25;
      sessionState.mode = "focus";
      sessionState.totalTime = duration * 60;
      sessionState.timeRemaining = duration * 60;
      startTimer();
      return {
        content: [
          {
            type: "text" as const,
            text: `🎯 Focus session started! Duration: ${duration} minutes.\n\nTime remaining: ${formatTime(sessionState.timeRemaining)}\n\nTip: Stay focused and avoid distractions. You've got this!`,
          },
        ],
      };
    }

    case "pause_focus_session": {
      const wasRunning = sessionState.isRunning;
      const timeSpent = sessionState.totalTime - sessionState.timeRemaining;
      stopTimer();
      return {
        content: [
          {
            type: "text" as const,
            text: wasRunning
              ? `⏸️ Focus session paused.\n\nTime remaining: ${formatTime(sessionState.timeRemaining)}\nTime spent: ${formatTime(timeSpent)}\n\nSay "resume timer" to continue.`
              : "No active session to pause.",
          },
        ],
      };
    }

    case "resume_focus_session": {
      if (sessionState.isRunning) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Timer is already running!",
            },
          ],
        };
      }
      if (sessionState.timeRemaining <= 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No paused session to resume. Use 'start timer' to begin a new session.",
            },
          ],
        };
      }
      startTimer();
      return {
        content: [
          {
            type: "text" as const,
            text: `▶️ Focus session resumed!\n\nTime remaining: ${formatTime(sessionState.timeRemaining)}\n\nKeep going, you've got this!`,
          },
        ],
      };
    }

    case "stop_focus_session": {
      const wasRunning = sessionState.isRunning;
      const timeSpent = sessionState.totalTime - sessionState.timeRemaining;
      resetTimer();
      return {
        content: [
          {
            type: "text" as const,
            text: wasRunning
              ? `⏹️ Focus session stopped and reset.\n\nTime spent before stopping: ${formatTime(timeSpent)}\nSessions completed today: ${sessionState.sessionsCompleted}\n\nTimer reset to ${formatTime(DURATIONS.focus)}.`
              : "No active session. Timer reset to defaults.",
          },
        ],
      };
    }

    case "get_timer_status": {
      const progress = Math.round(
        ((sessionState.totalTime - sessionState.timeRemaining) / sessionState.totalTime) * 100
      );
      return {
        content: [
          {
            type: "text" as const,
            text: `⏱️ Timer Status\n\n${sessionState.isRunning ? "🟢 Running" : "⚪ Paused"}\nMode: ${sessionState.mode === "focus" ? "🎯 Focus" : sessionState.mode === "shortBreak" ? "☕ Short Break" : "🌴 Long Break"}\nTime remaining: ${formatTime(sessionState.timeRemaining)}\nProgress: ${progress}%\nCurrent mood: ${sessionState.currentMood}\nSessions completed: ${sessionState.sessionsCompleted}`,
          },
        ],
      };
    }

    case "set_mood": {
      const mood = args?.mood as "focus" | "calm" | "energetic" | "creative";
      if (!["focus", "calm", "energetic", "creative"].includes(mood)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Invalid mood. Please choose from: focus, calm, energetic, creative",
            },
          ],
          isError: true,
        };
      }
      sessionState.currentMood = mood;
      
      // Sync with web app and scroll to music section
      syncWithWebApp({
        currentMood: mood,
      }, "music");
      
      const moodEmojis = {
        focus: "🎯",
        calm: "🧘",
        energetic: "⚡",
        creative: "🎨",
      };
      const moodDescriptions = {
        focus: "Deep Focus mode - minimize distractions, maximize output",
        calm: "Calm mode - relaxed and steady progress",
        energetic: "Energetic mode - high energy, fast-paced work",
        creative: "Creative mode - explore ideas, think outside the box",
      };
      return {
        content: [
          {
            type: "text" as const,
            text: `${moodEmojis[mood]} Mood set to: ${mood.charAt(0).toUpperCase() + mood.slice(1)}\n\n${moodDescriptions[mood]}\n\n🌐 Web dashboard updated - scrolling to music player!`,
          },
        ],
      };
    }

    case "get_productivity_stats": {
      const hours = Math.floor(sessionState.totalFocusTime / 3600);
      const minutes = Math.floor((sessionState.totalFocusTime % 3600) / 60);
      return {
        content: [
          {
            type: "text" as const,
            text: `📊 Productivity Stats\n\n🎯 Sessions completed: ${sessionState.sessionsCompleted}\n⏱️ Total focus time: ${hours}h ${minutes}m\n${sessionState.currentMood === "focus" ? "🎯" : sessionState.currentMood === "calm" ? "🧘" : sessionState.currentMood === "energetic" ? "⚡" : "🎨"} Current mood: ${sessionState.currentMood}\n\n💡 Tip: Try to complete at least 4 focus sessions for optimal productivity!`,
          },
        ],
      };
    }

    case "take_break": {
      const breakType = (args?.type as "short" | "long") || "short";
      sessionState.mode = breakType === "long" ? "longBreak" : "shortBreak";
      sessionState.totalTime = DURATIONS[sessionState.mode];
      sessionState.timeRemaining = DURATIONS[sessionState.mode];
      startTimer();
      return {
        content: [
          {
            type: "text" as const,
            text: `${breakType === "long" ? "🌴" : "☕"} ${breakType === "long" ? "Long" : "Short"} break started!\n\nDuration: ${breakType === "long" ? "15" : "5"} minutes\n\nTake a moment to stretch, hydrate, and rest your eyes.`,
          },
        ],
      };
    }

    case "skip_break": {
      if (sessionState.mode !== "focus") {
        sessionState.mode = "focus";
        sessionState.totalTime = DURATIONS.focus;
        sessionState.timeRemaining = DURATIONS.focus;
        startTimer();
        return {
          content: [
            {
              type: "text" as const,
              text: "⏭️ Break skipped! Starting new focus session.\n\nRemember: regular breaks help maintain long-term productivity!",
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: "You're already in focus mode!",
          },
        ],
      };
    }

    case "reset_timer_config": {
      // Reset to defaults: 25 min focus, 5 min short break, 15 min long break
      const defaultConfig = {
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        timeRemaining: 25 * 60,
        totalTime: 25 * 60,
        isRunning: false,
        mode: "focus" as const,
      };
      
      sessionState.mode = "focus";
      sessionState.totalTime = DURATIONS.focus;
      sessionState.timeRemaining = DURATIONS.focus;
      sessionState.isRunning = false;
      
      await syncWithWebApp(defaultConfig);
      
      return {
        content: [
          {
            type: "text" as const,
            text: "🔄 Timer configuration reset to defaults!\n\n• Focus: 25 minutes\n• Short Break: 5 minutes\n• Long Break: 15 minutes\n\nThe browser will update on the next sync (refresh the page or wait a few seconds).",
          },
        ],
      };
    }

    case "suggest_mood": {
      const suggestion = detectMood();
      const apply = args?.apply as boolean;
      const greeting = getTimeGreeting();
      
      const moodEmojis: Record<MoodId, string> = {
        focus: "🎯",
        calm: "🧘",
        energetic: "⚡",
        creative: "🎨",
      };

      const moodNames: Record<MoodId, string> = {
        focus: "Deep Focus",
        calm: "Calm",
        energetic: "Energetic",
        creative: "Creative",
      };

      let response = `🤖 AI Mood Suggestion\n\n${greeting}\n\n`;
      response += `${moodEmojis[suggestion.mood]} Recommended: **${moodNames[suggestion.mood]}**\n`;
      response += `📊 Confidence: ${suggestion.confidence}%\n\n`;
      
      if (suggestion.reasoning.length > 0) {
        response += `**Why this mood?**\n`;
        suggestion.reasoning.forEach(reason => {
          response += `• ${reason}\n`;
        });
        response += "\n";
      }

      response += `**Quick tip:** ${suggestion.tips[Math.floor(Math.random() * suggestion.tips.length)]}`;

      if (apply) {
        sessionState.currentMood = suggestion.mood;
        response += `\n\n✅ Mood has been applied!`;
      } else {
        response += `\n\n💡 Use \`set_mood ${suggestion.mood}\` to apply this suggestion.`;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: response,
          },
        ],
      };
    }

    case "get_mood_tips": {
      const targetMood = (args?.mood as MoodId) || sessionState.currentMood;
      const tips = MOOD_TIPS[targetMood];
      
      const moodEmojis: Record<MoodId, string> = {
        focus: "🎯",
        calm: "🧘",
        energetic: "⚡",
        creative: "🎨",
      };

      let response = `${moodEmojis[targetMood]} **${targetMood.charAt(0).toUpperCase() + targetMood.slice(1)} Mode Tips**\n\n`;
      tips.forEach((tip, i) => {
        response += `${i + 1}. ${tip}\n`;
      });

      return {
        content: [
          {
            type: "text" as const,
            text: response,
          },
        ],
      };
    }

    case "open_dashboard": {
      const mood = args?.mood as MoodId | undefined;
      const autoConnectYoutube = args?.autoConnectYoutube !== false; // default true

      // Set mood if provided
      if (mood && ["focus", "calm", "energetic", "creative"].includes(mood)) {
        sessionState.currentMood = mood;
      }

      // Build URL with query params - NO scrollTo, page opens at top
      const params = new URLSearchParams();
      params.set("fromIDE", "true");
      if (autoConnectYoutube) {
        params.set("autoConnect", "youtube");
      }
      if (mood) {
        params.set("mood", mood);
      }
      // Don't set scrollTo - let page open at top, scroll happens on specific commands

      const url = `${WEB_APP_URL}?${params.toString()}`;

      // Send IDE connect event to track connection
      await sendIDEConnect();

      // Sync state to web app (no scrollTo)
      await syncWithWebApp({
        currentMood: sessionState.currentMood,
        isRunning: sessionState.isRunning,
        mode: sessionState.mode,
        timeRemaining: sessionState.timeRemaining,
        totalTime: sessionState.totalTime,
        sessionsCompleted: sessionState.sessionsCompleted,
        totalFocusTime: sessionState.totalFocusTime,
      });

      // Open browser using system command
      const { exec } = await import("child_process");
      exec(`open "${url}"`, (error) => {
        if (error) {
          console.error("Failed to open browser:", error);
        }
      });

      const moodEmojis: Record<MoodId, string> = {
        focus: "🎯",
        calm: "🧘",
        energetic: "⚡",
        creative: "🎨",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: `🚀 Opening FlowState Dashboard!\n\n${mood ? `${moodEmojis[mood]} Mood: ${mood}\n` : ""}${autoConnectYoutube ? "🎵 Auto-connecting to YouTube...\n" : ""}\n📍 URL: ${url}`,
          },
        ],
      };
    }

    case "disconnect_ide": {
      // Send disconnect event to the API
      await sendIDEDisconnect();

      return {
        content: [
          {
            type: "text" as const,
            text: `👋 Disconnected from FlowState!\n\nIDE tracking has been stopped. Your session data has been saved.\n\nRun 'flowstate init' to reconnect.`,
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: "text" as const,
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "flowstate://status",
        name: "FlowState Status",
        description: "Current FlowState productivity status and timer information",
        mimeType: "application/json",
      },
      {
        uri: "flowstate://stats",
        name: "Productivity Statistics",
        description: "Your productivity statistics and analytics",
        mimeType: "application/json",
      },
      {
        uri: "flowstate://mood-suggestion",
        name: "AI Mood Suggestion",
        description: "AI-powered mood suggestion based on time, day, and productivity patterns",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "flowstate://status":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                isRunning: sessionState.isRunning,
                mode: sessionState.mode,
                timeRemaining: formatTime(sessionState.timeRemaining),
                timeRemainingSeconds: sessionState.timeRemaining,
                progress: Math.round(
                  ((sessionState.totalTime - sessionState.timeRemaining) / sessionState.totalTime) * 100
                ),
                currentMood: sessionState.currentMood,
              },
              null,
              2
            ),
          },
        ],
      };

    case "flowstate://stats":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                sessionsCompleted: sessionState.sessionsCompleted,
                totalFocusTimeMinutes: Math.floor(sessionState.totalFocusTime / 60),
                currentMood: sessionState.currentMood,
                currentMode: sessionState.mode,
              },
              null,
              2
            ),
          },
        ],
      };

    case "flowstate://mood-suggestion":
      const suggestion = detectMood();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                suggestedMood: suggestion.mood,
                confidence: suggestion.confidence,
                reasoning: suggestion.reasoning,
                tips: suggestion.tips,
                currentMood: sessionState.currentMood,
                greeting: getTimeGreeting(),
              },
              null,
              2
            ),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FlowState MCP Server running on stdio");

  // Send initial connect event
  await sendIDEConnect();

  // Send periodic heartbeats every 10 seconds
  setInterval(async () => {
    await sendIDEHeartbeat();
  }, 10000);
}

main().catch(console.error);
