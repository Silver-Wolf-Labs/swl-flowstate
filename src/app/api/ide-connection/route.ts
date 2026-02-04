import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const CONNECTION_FILE = path.join(process.cwd(), ".flowstate-ide-connection.json");
const REDIS_CONNECTION_KEY = "flowstate:ide-connection";
const REDIS_HISTORY_KEY = "flowstate:ide-history";

// Lazy initialize Redis client
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }
  return null;
}

export type IDEType = "cursor" | "vscode" | "windsurf" | "intellij" | "unknown";

export interface IDEConnectionState {
  isConnected: boolean;
  connectedIDE: IDEType | null;
  sessionStartTime: number | null; // timestamp when current session started
  lastHeartbeat: number | null; // timestamp of last heartbeat
  currentSessionDuration: number; // seconds in current session
  disconnectedByUser?: boolean; // true if user explicitly disconnected (prevents auto-reconnect from heartbeats)
}

export interface IDEConnectionHistory {
  totalConnectionTime: number; // total seconds across all sessions
  sessionsCount: number;
  todayConnectionTime: number; // seconds connected today
  weekConnectionTime: number; // seconds connected this week
  lastSessionDate: string | null; // ISO date string
  dailyHistory: Record<string, number>; // date -> seconds
}

const defaultConnectionState: IDEConnectionState = {
  isConnected: false,
  connectedIDE: null,
  sessionStartTime: null,
  lastHeartbeat: null,
  currentSessionDuration: 0,
};

const defaultHistory: IDEConnectionHistory = {
  totalConnectionTime: 0,
  sessionsCount: 0,
  todayConnectionTime: 0,
  weekConnectionTime: 0,
  lastSessionDate: null,
  dailyHistory: {},
};

// Read connection state
async function readConnectionState(): Promise<IDEConnectionState> {
  const redisClient = getRedis();
  try {
    if (redisClient) {
      const state = await redisClient.get<IDEConnectionState>(REDIS_CONNECTION_KEY);
      return state || defaultConnectionState;
    } else {
      const data = await fs.readFile(CONNECTION_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return defaultConnectionState;
  }
}

// Write connection state
async function writeConnectionState(state: IDEConnectionState): Promise<void> {
  const redisClient = getRedis();
  if (redisClient) {
    await redisClient.set(REDIS_CONNECTION_KEY, state, { ex: 3600 });
  } else {
    await fs.writeFile(CONNECTION_FILE, JSON.stringify(state, null, 2));
  }
}

// Read history
async function readHistory(): Promise<IDEConnectionHistory> {
  const redisClient = getRedis();
  try {
    if (redisClient) {
      const history = await redisClient.get<IDEConnectionHistory>(REDIS_HISTORY_KEY);
      return history || defaultHistory;
    } else {
      const historyFile = CONNECTION_FILE.replace(".json", "-history.json");
      const data = await fs.readFile(historyFile, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return defaultHistory;
  }
}

// Write history
async function writeHistory(history: IDEConnectionHistory): Promise<void> {
  const redisClient = getRedis();
  if (redisClient) {
    await redisClient.set(REDIS_HISTORY_KEY, history);
  } else {
    const historyFile = CONNECTION_FILE.replace(".json", "-history.json");
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
  }
}

// Helper to get today's date key
function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper to calculate week's connection time
function calculateWeekTime(dailyHistory: Record<string, number>): number {
  const now = new Date();
  let weekTotal = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    weekTotal += dailyHistory[key] || 0;
  }
  return weekTotal;
}

// GET - Read current connection state and history
export async function GET() {
  const state = await readConnectionState();
  const history = await readHistory();

  // Check if connection is stale (no heartbeat in 30 seconds)
  const now = Date.now();
  const isStale = state.lastHeartbeat && (now - state.lastHeartbeat > 30000);

  if (isStale && state.isConnected) {
    // Mark as disconnected
    const updatedState = { ...state, isConnected: false };
    await writeConnectionState(updatedState);
    return NextResponse.json({ state: updatedState, history });
  }

  // Update today's time in history
  const todayKey = getTodayKey();
  const updatedHistory = {
    ...history,
    todayConnectionTime: history.dailyHistory[todayKey] || 0,
    weekConnectionTime: calculateWeekTime(history.dailyHistory),
  };

  return NextResponse.json({ state, history: updatedHistory });
}

// POST - Handle connection events (connect, heartbeat, disconnect)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ide } = body as { action: "connect" | "heartbeat" | "disconnect"; ide?: IDEType };

    const state = await readConnectionState();
    const history = await readHistory();
    const now = Date.now();
    const todayKey = getTodayKey();

    if (action === "connect") {
      const newState: IDEConnectionState = {
        isConnected: true,
        connectedIDE: ide || "unknown",
        sessionStartTime: now,
        lastHeartbeat: now,
        currentSessionDuration: 0,
        disconnectedByUser: false, // Clear the flag on explicit connect
      };
      await writeConnectionState(newState);

      // Increment session count
      const newHistory = {
        ...history,
        sessionsCount: history.sessionsCount + 1,
        lastSessionDate: new Date().toISOString(),
      };
      await writeHistory(newHistory);

      return NextResponse.json({ success: true, state: newState, history: newHistory });
    }

    if (action === "heartbeat") {
      // If user explicitly disconnected, ignore heartbeats until they reconnect with "connect" action
      if (state.disconnectedByUser) {
        return NextResponse.json({ success: false, ignored: true, reason: "User disconnected", state, history });
      }

      if (!state.isConnected || !state.sessionStartTime) {
        // Auto-connect if not connected (and not explicitly disconnected by user)
        const newState: IDEConnectionState = {
          isConnected: true,
          connectedIDE: ide || state.connectedIDE || "unknown",
          sessionStartTime: now,
          lastHeartbeat: now,
          currentSessionDuration: 0,
          disconnectedByUser: false,
        };
        await writeConnectionState(newState);
        return NextResponse.json({ success: true, state: newState, history });
      }

      // Calculate session duration
      const sessionDuration = Math.floor((now - state.sessionStartTime) / 1000);
      const timeSinceLastHeartbeat = state.lastHeartbeat
        ? Math.floor((now - state.lastHeartbeat) / 1000)
        : 0;

      const newState: IDEConnectionState = {
        ...state,
        lastHeartbeat: now,
        currentSessionDuration: sessionDuration,
      };
      await writeConnectionState(newState);

      // Update history with time since last heartbeat
      const currentDayTime = history.dailyHistory[todayKey] || 0;
      const newHistory: IDEConnectionHistory = {
        ...history,
        totalConnectionTime: history.totalConnectionTime + timeSinceLastHeartbeat,
        todayConnectionTime: currentDayTime + timeSinceLastHeartbeat,
        dailyHistory: {
          ...history.dailyHistory,
          [todayKey]: currentDayTime + timeSinceLastHeartbeat,
        },
      };
      newHistory.weekConnectionTime = calculateWeekTime(newHistory.dailyHistory);
      await writeHistory(newHistory);

      return NextResponse.json({ success: true, state: newState, history: newHistory });
    }

    if (action === "disconnect") {
      const sessionDuration = state.sessionStartTime
        ? Math.floor((now - state.sessionStartTime) / 1000)
        : 0;

      const newState: IDEConnectionState = {
        isConnected: false,
        connectedIDE: null,
        sessionStartTime: null,
        lastHeartbeat: null,
        currentSessionDuration: 0,
        disconnectedByUser: true, // Prevent auto-reconnect from heartbeats
      };
      await writeConnectionState(newState);

      return NextResponse.json({ success: true, state: newState, history });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("IDE connection error:", error);
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}

// DELETE - Reset connection state and history
export async function DELETE() {
  await writeConnectionState(defaultConnectionState);
  await writeHistory(defaultHistory);
  return NextResponse.json({ success: true, state: defaultConnectionState, history: defaultHistory });
}

