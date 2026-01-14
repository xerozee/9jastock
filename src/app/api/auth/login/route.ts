import { NextRequest, NextResponse } from "next/server";
import { getLoginUrl, STATE_COOKIE, isSecureOrigin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const { url, state } = getLoginUrl(origin);
  
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isSecureOrigin(origin),
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  
  return response;
}
