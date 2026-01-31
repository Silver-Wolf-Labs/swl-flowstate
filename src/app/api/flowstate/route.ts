import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// State file path for local development
const STATE_FILE = path.join(process.cwd(), ".flowstate-state.json");
const REDIS_KEY = "flowstate:state";

// Check if we're in production with Redis configured
const isProduction = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client only if credentials are available
let redis: Redis | null = null;
if (isProduction) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export interface FlowStateSync {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeRemaining: number;
  totalTime: number;
  currentMood: "focus" | "calm" | "energetic" | "creative";
  sessionsCompleted: number;
  totalFocusTime: number;
  lastUpdated: number;
  lastMcpUpdate: number;
  scrollTo?: "mood" | "timer" | "music" | "analytics" | null;
}

const defaultState: FlowStateSync = {
  isRunning: false,
  mode: "focus",
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  currentMood: "focus",
  sessionsCompleted: 0,
  totalFocusTime: 0,
  lastUpdated: Date.now(),
  lastMcpUpdate: 0,
  scrollTo: null,
};

// Read state from Redis (production) or file (development)
async function readState(): Promise<FlowStateSync> {
  try {
    if (redis) {
      // Production: Use Redis
      const state = await redis.get<FlowStateSync>(REDIS_KEY);
      return state || defaultState;
    } else {
      // Development: Use file
      const data = await fs.readFile(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return defaultState;
  }
}

// Write state to Redis (production) or file (development)
async function writeState(state: FlowStateSync): Promise<void> {
  if (redis) {
    // Production: Use Redis with 1 hour expiry
    await redis.set(REDIS_KEY, state, { ex: 3600 });
  } else {
    // Development: Use file
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  }
}

// GET - Read current state
export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

// POST - Update state
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const currentState = await readState();
    
    // Check if this update is from MCP (includes source: "mcp")
    const isMcpUpdate = updates.source === "mcp";
    // Remove source from updates before saving
    const { source, ...stateUpdates } = updates;
    
    const newState: FlowStateSync = {
      ...currentState,
      ...stateUpdates,
      lastUpdated: Date.now(),
      // Update lastMcpUpdate only if this is from MCP
      lastMcpUpdate: isMcpUpdate ? Date.now() : currentState.lastMcpUpdate,
    };
    
    await writeState(newState);
    
    return NextResponse.json({ success: true, state: newState });
  } catch (error) {
    console.error("FlowState sync error:", error);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}

// DELETE - Reset state
export async function DELETE() {
  const resetState = { ...defaultState, lastUpdated: Date.now() };
  await writeState(resetState);
  return NextResponse.json({ success: true, state: resetState });
}
