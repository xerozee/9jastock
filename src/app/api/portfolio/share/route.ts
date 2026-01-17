import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/server-auth";
import crypto from "crypto";
import mongoose from "mongoose";

function generateShareId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(authUser.id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let shareId = user.shareId;

    if (!shareId) {
      shareId = generateShareId();
      await User.updateOne(
        { _id: new mongoose.Types.ObjectId(authUser.id) },
        { $set: { shareId } }
      );
    }

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error getting share ID:", error);
    return NextResponse.json(
      { error: "Failed to get share ID" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const shareId = generateShareId();
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(authUser.id) },
      { $set: { shareId } }
    );

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error generating share ID:", error);
    return NextResponse.json(
      { error: "Failed to generate share ID" },
      { status: 500 }
    );
  }
}
