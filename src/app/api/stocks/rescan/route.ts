import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { fetchNigerianStocksFromScanner, getAllCachedQuotes } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Rescan] Starting manual stock rescan...');
    
    const beforeCount = getAllCachedQuotes().size;
    
    const stocks = await fetchNigerianStocksFromScanner();
    
    const afterCount = getAllCachedQuotes().size;
    const newStocksFound = afterCount - beforeCount;
    
    console.log(`[Rescan] Complete. Found ${stocks.length} stocks. Cache: ${beforeCount} -> ${afterCount}`);
    
    return NextResponse.json({
      success: true,
      totalStocks: stocks.length,
      previousCount: beforeCount,
      currentCount: afterCount,
      newStocksFound: Math.max(0, newStocksFound),
      stocks: stocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: s.price,
        changePercent: s.changePercent,
      })),
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('[Rescan] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to rescan stocks',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cachedQuotes = getAllCachedQuotes();
    const stocks = Array.from(cachedQuotes.values());
    
    return NextResponse.json({
      totalStocks: stocks.length,
      stocks: stocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: s.price,
        changePercent: s.changePercent,
      })),
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('[Rescan] GET Error:', error);
    return NextResponse.json({
      totalStocks: 0,
      stocks: [],
      error: 'Failed to get stock data',
    }, { status: 500 });
  }
}
