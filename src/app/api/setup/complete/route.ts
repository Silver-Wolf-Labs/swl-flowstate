import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const SETUP_FILE = path.join(process.cwd(), ".flowstate-setup.json");
const REDIS_SETUP_KEY = "flowstate:setup";

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

interface SetupStatus {
  isComplete: boolean;
  completedAt: string | null;
  selectedIDEs: string[];
  envVarsConfigured: string[];
}

const defaultStatus: SetupStatus = {
  isComplete: false,
  completedAt: null,
  selectedIDEs: [],
  envVarsConfigured: [],
};

// Read setup status
async function readSetupStatus(): Promise<SetupStatus> {
  const redisClient = getRedis();

  try {
    if (redisClient) {
      const status = await redisClient.get<SetupStatus>(REDIS_SETUP_KEY);
      return status || defaultStatus;
    } else {
      const data = await fs.readFile(SETUP_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return defaultStatus;
  }
}

// Write setup status
async function writeSetupStatus(status: SetupStatus): Promise<void> {
  const redisClient = getRedis();

  if (redisClient) {
    await redisClient.set(REDIS_SETUP_KEY, status);
  } else {
    await fs.writeFile(SETUP_FILE, JSON.stringify(status, null, 2));
  }
}

// GET - Check setup status
export async function GET() {
  try {
    const status = await readSetupStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error reading setup status:", error);
    return NextResponse.json(defaultStatus);
  }
}

// POST - Mark setup as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envVars, selectedIDEs } = body;

    // Determine which env vars were configured
    const envVarsConfigured: string[] = [];
    if (envVars) {
      if (envVars.spotifyClientId) envVarsConfigured.push("spotify");
      if (envVars.youtubeApiKey) envVarsConfigured.push("youtube");
      if (envVars.appleMusicDeveloperToken) envVarsConfigured.push("appleMusic");
      if (envVars.soundcloudClientId) envVarsConfigured.push("soundcloud");
    }

    const status: SetupStatus = {
      isComplete: true,
      completedAt: new Date().toISOString(),
      selectedIDEs: selectedIDEs || [],
      envVarsConfigured,
    };

    await writeSetupStatus(status);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error saving setup status:", error);
    return NextResponse.json(
      { error: "Failed to save setup status" },
      { status: 500 }
    );
  }
}

// DELETE - Reset setup status
export async function DELETE() {
  try {
    await writeSetupStatus(defaultStatus);
    return NextResponse.json({ success: true, status: defaultStatus });
  } catch (error) {
    console.error("Error resetting setup status:", error);
    return NextResponse.json(
      { error: "Failed to reset setup status" },
      { status: 500 }
    );
  }
}

