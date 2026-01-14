import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';
import { fetchLiveQuotes, hasSession, NGX_TV_SYMBOLS } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check if TradingView session is configured
    if (!hasSession()) {
      // Return static data if no session
      const stocks = nigerianStocks.map(stock => ({
        ...stock,
        isLive: false,
        lastUpdated: Date.now(),
      }));

      return NextResponse.json({
        success: true,
        data: stocks,
        liveCount: 0,
        totalCount: stocks.length,
        timestamp: Date.now(),
        note: 'TradingView session not configured. Add TRADINGVIEW_SESSION to .env.local for live data.',
      });
    }

    // Fetch live quotes from TradingView
    const symbols = Object.keys(NGX_TV_SYMBOLS);
    const liveQuotes = await fetchLiveQuotes(symbols);

    // Merge live data with static stock info
    const stocks = nigerianStocks.map(stock => {
      const liveQuote = liveQuotes.get(stock.symbol);

      if (liveQuote && liveQuote.price > 0) {
        return {
          ...stock,
          price: liveQuote.price,
          change: liveQuote.change,
          changePercent: liveQuote.changePercent,
          volume: liveQuote.volume || stock.volume,
          open: liveQuote.open || stock.open,
          high: liveQuote.high || stock.high,
          low: liveQuote.low || stock.low,
          previousClose: liveQuote.previousClose || stock.previousClose,
          isLive: true,
          lastUpdated: liveQuote.timestamp,
        };
      }

      return {
        ...stock,
        isLive: false,
        lastUpdated: Date.now(),
      };
    });

    const liveCount = stocks.filter(s => s.isLive).length;

    return NextResponse.json({
      success: true,
      data: stocks,
      liveCount,
      totalCount: stocks.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching live stocks:', error);

    // Return static data as fallback
    return NextResponse.json({
      success: false,
      data: nigerianStocks.map(stock => ({ ...stock, isLive: false, lastUpdated: Date.now() })),
      liveCount: 0,
      totalCount: nigerianStocks.length,
      timestamp: Date.now(),
      error: 'Failed to fetch live data, showing cached data',
    });
  }
}
