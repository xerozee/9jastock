import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User, Holding } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ shareId }).lean();

    if (!user) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const userHoldings = await Holding.find({ userId: user._id }).lean();

    const formattedHoldings = userHoldings.map(h => ({
      id: h._id.toString(),
      userId: h.userId.toString(),
      symbol: h.symbol,
      shares: h.shares,
      purchasePrice: h.purchasePrice,
      purchaseDate: h.purchaseDate,
      notes: h.notes,
      createdAt: h.createdAt,
    }));

    return NextResponse.json({
      owner: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      holdings: formattedHoldings,
    });
  } catch (error) {
    console.error("Error fetching public portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
