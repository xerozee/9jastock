import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase, Holding } from "@/lib/mongodb";
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
    const userHoldings = await Holding.find({
      userId: new mongoose.Types.ObjectId(userId),
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
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
      userId: new mongoose.Types.ObjectId(userId),
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Holding ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const holding = await Holding.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!holding) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    await Holding.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    return NextResponse.json({ message: "Holding deleted successfully" });
  } catch (error) {
    console.error("Failed to delete holding:", error);
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
}
