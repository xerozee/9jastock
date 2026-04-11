import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase, Watchlist } from "@/lib/mongodb";
import mongoose from "mongoose";

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
    const doc = await Watchlist.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    return NextResponse.json({
      symbols: doc?.symbols || [],
      updatedAt: doc?.updatedAt || null,
    });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await request.json();
    const { symbols } = body;

    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: "symbols must be an array" }, { status: 400 });
    }

    const uniqueSymbols = [...new Set(symbols.map((s: string) => s.toUpperCase()))];

    await connectToDatabase();
    const doc = await Watchlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { symbols: uniqueSymbols, updatedAt: new Date() },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      symbols: doc?.symbols || uniqueSymbols,
      updatedAt: doc?.updatedAt,
    });
  } catch (error) {
    console.error("Watchlist PUT error:", error);
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
  }
}
