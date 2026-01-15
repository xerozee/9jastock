import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(null, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(null, { status: 401 });
    }

    const user = await getUser(session.userId);
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
