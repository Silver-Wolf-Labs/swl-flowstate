import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle error from Spotify
  if (error) {
    return NextResponse.redirect(
      new URL(`/?spotify_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(
      new URL("/?spotify_error=missing_code", request.url)
    );
  }

  // Redirect to home with the code - client will exchange it for tokens
  return NextResponse.redirect(
    new URL(`/?spotify_code=${encodeURIComponent(code)}`, request.url)
  );
}
