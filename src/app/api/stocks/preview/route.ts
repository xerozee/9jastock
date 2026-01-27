import { NextResponse } from 'next/server';
import { getAllCachedQuotes, LiveQuote } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PREVIEW_STOCKS = ['DANGCEM', 'GTCO', 'ZENITH', 'ACCESSCORP', 'MTNN'];

interface PreviewStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

function convertToPreview(quote: LiveQuote): PreviewStock {
  return {
    symbol: quote.symbol,
    name: quote.name || quote.symbol,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
  };
}

export async function GET() {
  try {
    const cachedQuotesMap = getAllCachedQuotes();
    const cachedQuotes = Array.from(cachedQuotesMap.values());
    
    if (cachedQuotes.length === 0) {
      return NextResponse.json({
        stocks: [],
        isLive: false,
        message: 'Market data loading...',
      });
    }

    const previewStocks: PreviewStock[] = [];
    
    for (const symbol of PREVIEW_STOCKS) {
      const quote = cachedQuotes.find(q => q.symbol === symbol);
      if (quote) {
        previewStocks.push(convertToPreview(quote));
      }
    }

    if (previewStocks.length < 3) {
      const topMovers = cachedQuotes
        .filter(q => q.price > 0 && Math.abs(q.changePercent) > 0)
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 5)
        .map(convertToPreview);
      
      if (topMovers.length > previewStocks.length) {
        return NextResponse.json({
          stocks: topMovers.slice(0, 5),
          isLive: true,
          lastUpdated: Date.now(),
        });
      }
    }

    return NextResponse.json({
      stocks: previewStocks.slice(0, 5),
      isLive: true,
      lastUpdated: Date.now(),
    });

  } catch (error) {
    console.error('Error fetching preview stocks:', error);
    return NextResponse.json({
      stocks: [],
      isLive: false,
      error: 'Failed to fetch stock data',
    }, { status: 500 });
  }
}
