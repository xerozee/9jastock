import { NextRequest, NextResponse } from 'next/server';
import { getYahooFinanceData } from '@/lib/yahooFinance';

export const dynamic = 'force-dynamic';

const yahooCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const cleanSymbol = symbol.toUpperCase().replace('NGX:', '').replace('NSENG:', '');
    
    const cached = yahooCache.get(cleanSymbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }
    
    const yahooData = await getYahooFinanceData(cleanSymbol);
    
    if (yahooData) {
      yahooCache.set(cleanSymbol, {
        data: yahooData,
        timestamp: Date.now()
      });
    }
    
    return NextResponse.json({
      success: true,
      data: yahooData
    });
    
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Yahoo Finance data' },
      { status: 500 }
    );
  }
}
