import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import crypto from "crypto";
import mongoose from "mongoose";

function generateShareId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let shareId = user.shareId;
    
    if (!shareId) {
      shareId = generateShareId();
      await User.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { shareId } }
      );
    }

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error getting share ID:", error);
    return NextResponse.json({ error: "Failed to get share ID" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    await connectToDatabase();
    const shareId = generateShareId();
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { shareId } }
    );

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error generating share ID:", error);
    return NextResponse.json({ error: "Failed to generate share ID" }, { status: 500 });
  }
}
