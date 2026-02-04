import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Get IP from headers (works with Vercel and most proxies)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  // Check cookie first (more reliable than IP for same-device visits)
  const cookieStore = await cookies();
  const tourCompleted = cookieStore.get("flowstate_tour_completed");

  if (tourCompleted) {
    return NextResponse.json({ completed: true, ip });
  }

  return NextResponse.json({ completed: false, ip });
}

