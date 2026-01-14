import { NextRequest, NextResponse } from 'next/server';
import { getStockBySymbol } from '@/lib/stockData';
import { fetchLiveQuote, hasSession } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  // Get static stock info
  const staticStock = getStockBySymbol(upperSymbol);

  if (!staticStock) {
    return NextResponse.json(
      { success: false, error: 'Stock not found' },
      { status: 404 }
    );
  }

  // Check if TradingView session is configured
  if (!hasSession()) {
    return NextResponse.json({
      success: true,
      data: {
        ...staticStock,
        isLive: false,
        lastUpdated: Date.now(),
      },
      timestamp: Date.now(),
      note: 'TradingView session not configured. Add TRADINGVIEW_SESSION to .env.local for live data.',
    });
  }

  try {
    // Fetch live quote from TradingView
    const liveQuote = await fetchLiveQuote(upperSymbol);

    if (liveQuote && liveQuote.price > 0) {
      return NextResponse.json({
        success: true,
        data: {
          ...staticStock,
          price: liveQuote.price,
          change: liveQuote.change,
          changePercent: liveQuote.changePercent,
          volume: liveQuote.volume || staticStock.volume,
          open: liveQuote.open || staticStock.open,
          high: liveQuote.high || staticStock.high,
          low: liveQuote.low || staticStock.low,
          previousClose: liveQuote.previousClose || staticStock.previousClose,
          isLive: true,
          lastUpdated: liveQuote.timestamp,
        },
        timestamp: Date.now(),
      });
    }

    // Return static data as fallback
    return NextResponse.json({
      success: true,
      data: {
        ...staticStock,
        isLive: false,
        lastUpdated: Date.now(),
      },
      timestamp: Date.now(),
      note: 'Live data unavailable for this symbol',
    });
  } catch (error) {
    console.error('Error fetching live stock:', error);

    return NextResponse.json({
      success: false,
      data: { ...staticStock, isLive: false, lastUpdated: Date.now() },
      timestamp: Date.now(),
      error: 'Failed to fetch live data',
    });
  }
}
