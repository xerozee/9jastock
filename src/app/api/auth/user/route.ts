import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase, User } from "@/lib/mongodb";
import { cookies } from "next/headers";
import mongoose from "mongoose";

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

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      shareId: user.shareId,
      subscriptionStatus: user.subscriptionStatus || 'free',
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
