import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    cookieStore.delete("session_id");

    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}/`);
  } catch (error) {
    console.error("Logout error:", error);
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}/`);
  }
}
