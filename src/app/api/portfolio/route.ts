import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { connectToDatabase, PortfolioItem } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const items = await PortfolioItem.find({
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    const formattedItems = items.map((item) => ({
      id: item._id.toString(),
      userId: item.userId.toString(),
      symbol: item.symbol,
      addedAt: item.addedAt,
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(user.id);

    const existing = await PortfolioItem.findOne({ userId, symbol });

    if (existing) {
      return NextResponse.json({ message: "Already in portfolio" }, { status: 200 });
    }

    const item = await PortfolioItem.create({
      userId,
      symbol,
    });

    return NextResponse.json(
      {
        id: item._id.toString(),
        userId: item.userId.toString(),
        symbol: item.symbol,
        addedAt: item.addedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to portfolio:", error);
    return NextResponse.json(
      { error: "Failed to add to portfolio" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectToDatabase();
    await PortfolioItem.deleteOne({
      userId: new mongoose.Types.ObjectId(user.id),
      symbol,
    });

    return NextResponse.json({ message: "Removed from portfolio" });
  } catch (error) {
    console.error("Error removing from portfolio:", error);
    return NextResponse.json(
      { error: "Failed to remove from portfolio" },
      { status: 500 }
    );
  }
}
