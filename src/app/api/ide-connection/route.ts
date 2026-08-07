import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// FLOWSTATE_STATE_DIR lets a test run keep its state out of the developer's real
// files, so an actual MCP session cannot contaminate assertions (and vice versa).
const STATE_DIR = process.env.FLOWSTATE_STATE_DIR || process.cwd();
const CONNECTION_FILE = path.join(STATE_DIR, ".flowstate-ide-connection.json");
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

export type IDEType = "claude-code" | "cursor" | "vscode" | "windsurf" | "intellij" | "unknown";

export interface IDEConnectionState {
  isConnected: boolean;
  connectedIDE: IDEType | null;
  sessionStartTime: number | null; // timestamp when current session started
  lastHeartbeat: number | null; // timestamp of last heartbeat
  currentSessionDuration: number; // seconds in current session
  disconnectedByUser?: boolean; // true if user explicitly disconnected (prevents auto-reconnect from heartbeats)
  // Last heartbeat per client. Several clients can be live at once (e.g. Claude
  // Code running in Cursor's terminal), so we track them individually instead of
  // letting whichever connected first own the whole session.
  clients?: Partial<Record<IDEType, number>>;
}

// A client is considered live if it has sent a heartbeat within this window.
const STALE_MS = 30000;

// Clients whose last heartbeat is within the stale window
function liveClients(
  clients: Partial<Record<IDEType, number>> | undefined,
  now: number
): IDEType[] {
  if (!clients) return [];
  return (Object.entries(clients) as [IDEType, number][])
    .filter(([, lastSeen]) => now - lastSeen <= STALE_MS)
    .sort((a, b) => b[1] - a[1])
    .map(([ide]) => ide);
}

export interface IDEBreakdownEntry {
  totalTime: number; // total seconds connected from this client
  sessionsCount: number;
  lastConnectedAt: string | null; // ISO date string
}

export interface IDEConnectionHistory {
  totalConnectionTime: number; // total seconds across all sessions
  sessionsCount: number;
  todayConnectionTime: number; // seconds connected today
  weekConnectionTime: number; // seconds connected this week
  lastSessionDate: string | null; // ISO date string
  dailyHistory: Record<string, number>; // date -> seconds
  ideBreakdown: Partial<Record<IDEType, IDEBreakdownEntry>>; // per-client totals
}

const defaultConnectionState: IDEConnectionState = {
  isConnected: false,
  connectedIDE: null,
  sessionStartTime: null,
  lastHeartbeat: null,
  currentSessionDuration: 0,
  clients: {},
};

const defaultHistory: IDEConnectionHistory = {
  totalConnectionTime: 0,
  sessionsCount: 0,
  todayConnectionTime: 0,
  weekConnectionTime: 0,
  lastSessionDate: null,
  dailyHistory: {},
  ideBreakdown: {},
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

// Read history (backfills fields added after a history file was first written)
async function readHistory(): Promise<IDEConnectionHistory> {
  const redisClient = getRedis();
  try {
    let history: IDEConnectionHistory | null;
    if (redisClient) {
      history = await redisClient.get<IDEConnectionHistory>(REDIS_HISTORY_KEY);
    } else {
      const historyFile = CONNECTION_FILE.replace(".json", "-history.json");
      history = JSON.parse(await fs.readFile(historyFile, "utf-8"));
    }
    if (!history) return defaultHistory;
    return { ...defaultHistory, ...history, ideBreakdown: history.ideBreakdown || {} };
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
  const isStale = state.lastHeartbeat && (now - state.lastHeartbeat > STALE_MS);

  if (isStale && state.isConnected) {
    // Mark as disconnected
    const updatedState = { ...state, isConnected: false, clients: {} };
    await writeConnectionState(updatedState);
    return NextResponse.json({ state: updatedState, history, activeIDEs: [] });
  }

  // Update today's time in history
  const todayKey = getTodayKey();
  const updatedHistory = {
    ...history,
    todayConnectionTime: history.dailyHistory[todayKey] || 0,
    weekConnectionTime: calculateWeekTime(history.dailyHistory),
  };

  // Drop stale clients so the dashboard only shows what's currently live
  const activeIDEs = state.isConnected ? liveClients(state.clients, now) : [];

  return NextResponse.json({ state, history: updatedHistory, activeIDEs });
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
      const connectingIDE = ide || "unknown";
      const newState: IDEConnectionState = {
        isConnected: true,
        connectedIDE: connectingIDE,
        sessionStartTime: now,
        lastHeartbeat: now,
        currentSessionDuration: 0,
        disconnectedByUser: false, // Clear the flag on explicit connect
        clients: { ...state.clients, [connectingIDE]: now },
      };
      await writeConnectionState(newState);

      // Increment session count, globally and for this client
      const connectedIDE = newState.connectedIDE || "unknown";
      const nowIso = new Date().toISOString();
      const previousEntry = history.ideBreakdown?.[connectedIDE];
      const newHistory = {
        ...history,
        sessionsCount: history.sessionsCount + 1,
        lastSessionDate: nowIso,
        ideBreakdown: {
          ...history.ideBreakdown,
          [connectedIDE]: {
            totalTime: previousEntry?.totalTime || 0,
            sessionsCount: (previousEntry?.sessionsCount || 0) + 1,
            lastConnectedAt: nowIso,
          },
        },
      };
      await writeHistory(newHistory);

      return NextResponse.json({ success: true, state: newState, history: newHistory });
    }

    if (action === "heartbeat") {
      // If user explicitly disconnected, ignore heartbeats until they reconnect with "connect" action
      if (state.disconnectedByUser) {
        return NextResponse.json({ success: false, ignored: true, reason: "User disconnected", state, history });
      }

      const heartbeatIDE = ide || state.connectedIDE || "unknown";

      if (!state.isConnected || !state.sessionStartTime) {
        // Auto-connect if not connected (and not explicitly disconnected by user)
        const newState: IDEConnectionState = {
          isConnected: true,
          connectedIDE: heartbeatIDE,
          sessionStartTime: now,
          lastHeartbeat: now,
          currentSessionDuration: 0,
          disconnectedByUser: false,
          clients: { ...state.clients, [heartbeatIDE]: now },
        };
        await writeConnectionState(newState);

        const previousEntry = history.ideBreakdown?.[heartbeatIDE];
        const newHistory: IDEConnectionHistory = {
          ...history,
          ideBreakdown: {
            ...history.ideBreakdown,
            [heartbeatIDE]: {
              totalTime: previousEntry?.totalTime || 0,
              sessionsCount: (previousEntry?.sessionsCount || 0) + 1,
              lastConnectedAt: new Date(now).toISOString(),
            },
          },
        };
        await writeHistory(newHistory);
        return NextResponse.json({ success: true, state: newState, history: newHistory });
      }

      // Calculate session duration
      const sessionDuration = Math.floor((now - state.sessionStartTime) / 1000);
      const timeSinceLastHeartbeat = state.lastHeartbeat
        ? Math.floor((now - state.lastHeartbeat) / 1000)
        : 0;

      // Per-client elapsed time, capped at the stale window so a long gap
      // between heartbeats isn't billed as continuous connection time.
      const clientLastSeen = state.clients?.[heartbeatIDE];
      const clientElapsed = clientLastSeen
        ? Math.min(Math.floor((now - clientLastSeen) / 1000), STALE_MS / 1000)
        : 0;

      const updatedClients = { ...state.clients, [heartbeatIDE]: now };
      // Keep the headline IDE stable; only hand it over once it goes stale.
      const currentIDEStillLive =
        state.connectedIDE && liveClients(updatedClients, now).includes(state.connectedIDE);

      const newState: IDEConnectionState = {
        ...state,
        connectedIDE: currentIDEStillLive ? state.connectedIDE : heartbeatIDE,
        lastHeartbeat: now,
        currentSessionDuration: sessionDuration,
        clients: updatedClients,
      };
      await writeConnectionState(newState);

      // Update history with time since last heartbeat
      const currentDayTime = history.dailyHistory[todayKey] || 0;
      const previousEntry = history.ideBreakdown?.[heartbeatIDE];
      const newHistory: IDEConnectionHistory = {
        ...history,
        totalConnectionTime: history.totalConnectionTime + timeSinceLastHeartbeat,
        todayConnectionTime: currentDayTime + timeSinceLastHeartbeat,
        dailyHistory: {
          ...history.dailyHistory,
          [todayKey]: currentDayTime + timeSinceLastHeartbeat,
        },
        ideBreakdown: {
          ...history.ideBreakdown,
          [heartbeatIDE]: {
            totalTime: (previousEntry?.totalTime || 0) + clientElapsed,
            sessionsCount: previousEntry?.sessionsCount || 0,
            lastConnectedAt: new Date(now).toISOString(),
          },
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
        clients: {},
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

