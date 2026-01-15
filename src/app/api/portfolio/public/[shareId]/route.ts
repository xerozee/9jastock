import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, holdings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.shareId, shareId));

    if (!user) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const userHoldings = await db
      .select()
      .from(holdings)
      .where(eq(holdings.userId, user.id));

    return NextResponse.json({
      owner: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      holdings: userHoldings,
    });
  } catch (error) {
    console.error("Error fetching public portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
