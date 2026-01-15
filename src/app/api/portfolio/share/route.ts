import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, holdings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

function generateShareId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let shareId = user.shareId;
    
    if (!shareId) {
      shareId = generateShareId();
      await db.update(users).set({ shareId }).where(eq(users.id, session.userId));
    }

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error getting share ID:", error);
    return NextResponse.json({ error: "Failed to get share ID" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareId = generateShareId();
    await db.update(users).set({ shareId }).where(eq(users.id, session.userId));

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error generating share ID:", error);
    return NextResponse.json({ error: "Failed to generate share ID" }, { status: 500 });
  }
}
