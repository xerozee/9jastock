import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';
import { fetchLiveQuotes, hasSession, getCachedQuote } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TOP_STOCKS = [
  'GTCO', 'ZENITHBANK', 'ACCESSCORP', 'UBA', 'FBNH',
  'MTNN', 'AIRTELAFRI', 'DANGCEM', 'BUACEMENT', 'SEPLAT',
  'NESTLE', 'NB', 'GUINNESS', 'DANGSUGAR', 'FLOURMILL',
  'PRESCO', 'OKOMUOIL', 'TRANSCORP', 'GEREGU', 'BUAFOODS'
];

const CACHE_TTL = 5 * 60 * 1000;
let lastFetchTime = 0;

export async function GET() {
  try {
    const now = Date.now();
    const stocks = nigerianStocks.map(stock => {
      const cached = getCachedQuote(stock.symbol);
      if (cached && cached.price > 0) {
        const isFresh = (now - cached.timestamp) < CACHE_TTL;
        return {
          ...stock,
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          volume: cached.volume || stock.volume,
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
    const timeSinceLastFetch = now - lastFetchTime;

    if (hasSession() && timeSinceLastFetch > CACHE_TTL) {
      lastFetchTime = now;
      fetchLiveQuotes(TOP_STOCKS).catch(err => {
        console.error('Background fetch error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: stocks,
      liveCount,
      totalCount: stocks.length,
      timestamp: now,
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
