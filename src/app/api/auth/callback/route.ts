import { NextRequest, NextResponse } from "next/server";
import { handleCallback, SESSION_COOKIE, STATE_COOKIE, isSecureOrigin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const origin = request.nextUrl.origin;
  
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_params", request.url));
  }
  
  if (!expectedState) {
    return NextResponse.redirect(new URL("/?error=missing_state", request.url));
  }
  
  try {
    const { sessionId } = await handleCallback(code, state, expectedState, origin);
    
    const response = NextResponse.redirect(new URL("/", request.url));
    
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: isSecureOrigin(origin),
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    
    response.cookies.delete(STATE_COOKIE);
    
    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
