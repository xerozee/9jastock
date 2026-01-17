import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { analyzeStock, StockData } from "@/lib/openai";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "http://localhost:5000";

    const stocksResponse = await fetch(`${baseUrl}/api/stocks`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!stocksResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch stock data" },
        { status: 500 }
      );
    }

    const stocksData = await stocksResponse.json();
    const stock = stocksData.stocks?.find(
      (s: Record<string, unknown>) =>
        (s.symbol as string).toUpperCase() === symbol.toUpperCase()
    );

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    const stockData: StockData = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      sector: stock.sector,
      dividendYield: stock.dividendYield,
      peRatio: stock.peRatio,
      marketCap: stock.marketCap,
      volume: stock.volume,
      rsi: stock.rsi,
      high52Week: stock.high52Week,
      low52Week: stock.low52Week,
    };

    const analysis = await analyzeStock(stockData);

    return NextResponse.json({
      analysis,
      stock: stockData,
    });
  } catch (error) {
    console.error("Stock analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze stock" },
      { status: 500 }
    );
  }
}
