import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { holdings } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

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

    const userHoldings = await db
      .select()
      .from(holdings)
      .where(eq(holdings.userId, session.userId))
      .orderBy(desc(holdings.purchaseDate));

    const holdingsWithNumbers = userHoldings.map(h => ({
      ...h,
      shares: parseFloat(h.shares),
      purchasePrice: parseFloat(h.purchasePrice),
    }));

    return NextResponse.json({ data: holdingsWithNumbers });
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

    const [newHolding] = await db
      .insert(holdings)
      .values({
        userId: session.userId,
        symbol: symbol.toUpperCase(),
        shares: shares.toString(),
        purchasePrice: purchasePrice.toString(),
        purchaseDate: new Date(purchaseDate),
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      data: {
        ...newHolding,
        shares: parseFloat(newHolding.shares),
        purchasePrice: parseFloat(newHolding.purchasePrice),
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

    const deleted = await db
      .delete(holdings)
      .where(and(eq(holdings.id, holdingId), eq(holdings.userId, session.userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete holding:", error);
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
}
