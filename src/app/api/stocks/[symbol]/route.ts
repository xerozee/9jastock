import { NextRequest, NextResponse } from 'next/server';
import { getStockBySymbol } from '@/lib/stockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  // Get stock info
  const stock = getStockBySymbol(upperSymbol);

  if (!stock) {
    return NextResponse.json(
      { success: false, error: 'Stock not found' },
      { status: 404 }
    );
  }

  // Return stock data
  // Note: For live data, integrate with a real data provider API
  return NextResponse.json({
    success: true,
    data: {
      ...stock,
      isLive: false, // Set to true when using real API
      lastUpdated: Date.now(),
    },
    timestamp: Date.now(),
    note: 'Using demo data. View TradingView chart below for live prices.',
  });
}
