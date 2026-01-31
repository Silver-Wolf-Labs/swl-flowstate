import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// State file path (in project root)
const STATE_FILE = path.join(process.cwd(), ".flowstate-state.json");

export interface FlowStateSync {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeRemaining: number;
  totalTime: number;
  currentMood: "focus" | "calm" | "energetic" | "creative";
  sessionsCompleted: number;
  totalFocusTime: number;
  lastUpdated: number;
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
  scrollTo: null,
};

async function readState(): Promise<FlowStateSync> {
  try {
    const data = await fs.readFile(STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultState;
  }
}

async function writeState(state: FlowStateSync): Promise<void> {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
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
    
    const newState: FlowStateSync = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now(),
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
  await writeState({ ...defaultState, lastUpdated: Date.now() });
  return NextResponse.json({ success: true });
}
