import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Redirect back to the app with the code or error
  const redirectUrl = new URL("/", request.url);
  
  if (error) {
    redirectUrl.searchParams.set("soundcloud_error", errorDescription || error);
  } else if (code) {
    redirectUrl.searchParams.set("soundcloud_code", code);
  }

  return NextResponse.redirect(redirectUrl);
}
