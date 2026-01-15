import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import mongoose from "mongoose";

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

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let shareId = user.shareId;
    
    if (!shareId) {
      shareId = generateShareId();
      await User.updateOne(
        { _id: new mongoose.Types.ObjectId(session.userId) },
        { $set: { shareId } }
      );
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

    await connectToDatabase();
    const shareId = generateShareId();
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(session.userId) },
      { $set: { shareId } }
    );

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error generating share ID:", error);
    return NextResponse.json({ error: "Failed to generate share ID" }, { status: 500 });
  }
}
