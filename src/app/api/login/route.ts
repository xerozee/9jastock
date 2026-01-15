import { NextRequest, NextResponse } from "next/server";
import { getLoginUrl, STATE_COOKIE, isSecureOrigin } from "@/lib/auth";

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
  const origin = getOrigin(request);
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
