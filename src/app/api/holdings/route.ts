import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { connectToDatabase, Holding } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
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
    const userHoldings = await Holding.find({
      userId: new mongoose.Types.ObjectId(session.userId),
    })
      .sort({ purchaseDate: -1 })
      .lean();

    const holdingsWithIds = userHoldings.map(h => ({
      id: h._id.toString(),
      userId: h.userId.toString(),
      symbol: h.symbol,
      shares: h.shares,
      purchasePrice: h.purchasePrice,
      purchaseDate: h.purchaseDate,
      notes: h.notes,
      createdAt: h.createdAt,
    }));

    return NextResponse.json({ data: holdingsWithIds });
  } catch (error) {
    console.error("Failed to fetch holdings:", error);
    return NextResponse.json({ error: "Failed to fetch holdings" }, { status: 500 });
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

    const body = await request.json();
    const { symbol, shares, purchasePrice, purchaseDate, notes } = body;

    if (!symbol || !shares || !purchasePrice || !purchaseDate) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, shares, purchasePrice, purchaseDate" },
        { status: 400 }
      );
    }

    if (shares <= 0 || purchasePrice <= 0) {
      return NextResponse.json(
        { error: "Shares and purchase price must be positive numbers" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const newHolding = await Holding.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      symbol: symbol.toUpperCase(),
      shares,
      purchasePrice,
      purchaseDate: new Date(purchaseDate),
      notes: notes || null,
    });

    return NextResponse.json({
      data: {
        id: newHolding._id.toString(),
        userId: newHolding.userId.toString(),
        symbol: newHolding.symbol,
        shares: newHolding.shares,
        purchasePrice: newHolding.purchasePrice,
        purchaseDate: newHolding.purchaseDate,
        notes: newHolding.notes,
        createdAt: newHolding.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to add holding:", error);
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const holdingId = searchParams.get("id");

    if (!holdingId) {
      return NextResponse.json({ error: "Missing holding ID" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await Holding.deleteOne({
      _id: new mongoose.Types.ObjectId(holdingId),
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete holding:", error);
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
}
