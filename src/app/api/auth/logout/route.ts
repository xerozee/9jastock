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

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
