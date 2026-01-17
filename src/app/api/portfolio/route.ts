import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase, PortfolioItem, User } from "@/lib/mongodb";
import mongoose from "mongoose";
import { getUserTier, TIER_LIMITS } from "@/lib/subscription";

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
    const items = await PortfolioItem.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).lean();

    const formattedItems = items.map(item => ({
      id: item._id.toString(),
      userId: item.userId.toString(),
      symbol: item.symbol,
      addedAt: item.addedAt,
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
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

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).lean();
    const tier = getUserTier(user);
    const maxItems = TIER_LIMITS[tier].maxPortfolioItems;

    const currentCount = await PortfolioItem.countDocuments({ userId: userObjectId });
    
    if (currentCount >= maxItems) {
      return NextResponse.json({ 
        error: `Portfolio limit reached (${maxItems} items). Upgrade to Premium for unlimited portfolio tracking.`,
        limitReached: true,
        currentCount,
        maxItems,
      }, { status: 403 });
    }

    const existing = await PortfolioItem.findOne({ userId: userObjectId, symbol });

    if (existing) {
      return NextResponse.json({ message: "Already in portfolio" }, { status: 200 });
    }

    const item = await PortfolioItem.create({
      userId: userObjectId,
      symbol,
    });

    return NextResponse.json({
      id: item._id.toString(),
      userId: item.userId.toString(),
      symbol: item.symbol,
      addedAt: item.addedAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding to portfolio:", error);
    return NextResponse.json({ error: "Failed to add to portfolio" }, { status: 500 });
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

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await PortfolioItem.deleteOne({ userId: userObjectId, symbol });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found in portfolio" }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from portfolio" });
  } catch (error) {
    console.error("Error removing from portfolio:", error);
    return NextResponse.json({ error: "Failed to remove from portfolio" }, { status: 500 });
  }
}
