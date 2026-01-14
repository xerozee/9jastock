import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const items = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.userId, session.user.id))
    .orderBy(portfolioItems.addedAt);
  
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { symbol } = await request.json();
  
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  
  const existing = await db
    .select()
    .from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.userId, session.user.id),
        eq(portfolioItems.symbol, symbol.toUpperCase())
      )
    );
  
  if (existing.length > 0) {
    return NextResponse.json({ error: "Stock already in portfolio" }, { status: 409 });
  }
  
  const [item] = await db
    .insert(portfolioItems)
    .values({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    })
    .returning();
  
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { symbol } = await request.json();
  
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  
  await db
    .delete(portfolioItems)
    .where(
      and(
        eq(portfolioItems.userId, session.user.id),
        eq(portfolioItems.symbol, symbol.toUpperCase())
      )
    );
  
  return NextResponse.json({ success: true });
}
