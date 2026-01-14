import { NextRequest, NextResponse } from "next/server";
import { getLoginUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const hostname = request.headers.get("host") || request.nextUrl.hostname;
  const loginUrl = getLoginUrl(hostname);
  return NextResponse.redirect(loginUrl);
}
