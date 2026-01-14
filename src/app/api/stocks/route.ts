import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';
import { 
  fetchNigerianStocksFromScanner, 
  hasSession, 
  getCachedQuote,
  getLastScanTime,
  getAllCachedQuotes
} from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    const lastScan = getLastScanTime();
    const timeSinceLastScan = now - lastScan;
    const cachedQuotes = getAllCachedQuotes();

    if (hasSession() && (cachedQuotes.size === 0 || timeSinceLastScan > CACHE_TTL)) {
      await fetchNigerianStocksFromScanner();
    }

    const stocks = nigerianStocks.map(stock => {
      const cached = getCachedQuote(stock.symbol);
      if (cached && cached.price > 0) {
        const isFresh = (now - cached.timestamp) < CACHE_TTL;
        return {
          ...stock,
          name: cached.name || stock.name,
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          volume: cached.volume || stock.volume,
          open: cached.open || stock.open,
          high: cached.high || stock.high,
          low: cached.low || stock.low,
          previousClose: cached.previousClose || stock.previousClose,
          marketCap: cached.marketCap || stock.marketCap,
          high52Week: cached.high52Week || stock.high52Week,
          low52Week: cached.low52Week || stock.low52Week,
          isLive: isFresh,
          lastUpdated: cached.timestamp,
        };
      }
      return {
        ...stock,
        isLive: false,
        lastUpdated: now,
      };
    });

    const liveCount = stocks.filter(s => s.isLive).length;

    return NextResponse.json({
      success: true,
      data: stocks,
      liveCount,
      totalCount: stocks.length,
      timestamp: now,
      lastScan: lastScan > 0 ? lastScan : null,
    });
  } catch (error) {
    console.error('Error in stocks API:', error);

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
    });
  }
}
