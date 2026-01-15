import { NextRequest, NextResponse } from "next/server";
import { deleteSession, getLogoutUrl, SESSION_COOKIE } from "@/lib/auth";
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
  const origin = getOrigin(request);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (sessionId) {
    await deleteSession(sessionId);
  }
  
  const logoutUrl = getLogoutUrl(origin);
  
  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete(SESSION_COOKIE);
  
  return response;
}
