import { NextRequest, NextResponse } from "next/server";
import { handleCallback, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const hostname = request.headers.get("host") || request.nextUrl.hostname;
  
  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  try {
    const { sessionId } = await handleCallback(code, hostname);
    
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
