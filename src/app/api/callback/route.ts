import { NextRequest, NextResponse } from "next/server";
import { handleCallback, SESSION_COOKIE, STATE_COOKIE, isSecureOrigin } from "@/lib/auth";
import { cookies } from "next/headers";

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  
  const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
  if (replitDevDomain) {
    return `https://${replitDevDomain}`;
  }
  
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const origin = getOrigin(request);
  
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_params", origin));
  }
  
  if (!expectedState) {
    return NextResponse.redirect(new URL("/?error=missing_state", origin));
  }
  
  try {
    const { sessionId } = await handleCallback(code, state, expectedState, origin);
    
    const response = NextResponse.redirect(new URL("/", origin));
    
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
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }
}
