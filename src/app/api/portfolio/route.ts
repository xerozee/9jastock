import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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

    const items = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.userId, session.userId));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
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

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(portfolioItems)
      .where(
        and(
          eq(portfolioItems.userId, session.userId),
          eq(portfolioItems.symbol, symbol)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ message: "Already in portfolio" }, { status: 200 });
    }

    const [item] = await db
      .insert(portfolioItems)
      .values({
        userId: session.userId,
        symbol,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding to portfolio:", error);
    return NextResponse.json({ error: "Failed to add to portfolio" }, { status: 500 });
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

    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await db
      .delete(portfolioItems)
      .where(
        and(
          eq(portfolioItems.userId, session.userId),
          eq(portfolioItems.symbol, symbol)
        )
      );

    return NextResponse.json({ message: "Removed from portfolio" });
  } catch (error) {
    console.error("Error removing from portfolio:", error);
    return NextResponse.json({ error: "Failed to remove from portfolio" }, { status: 500 });
  }
}
