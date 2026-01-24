import { NextResponse } from 'next/server';
import { scrapeCompanyData, generateCompanyUrl, AFCompanyData } from '@/lib/africanFinancialsBrowser';
import { connectToDatabase, AFCompanyData2 } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const refresh = searchParams.get('refresh') === 'true';
  
  if (!symbol) {
    return NextResponse.json({
      success: false,
      error: 'Symbol parameter is required',
    }, { status: 400 });
  }
  
  try {
    await connectToDatabase();
    
    const existingData = await AFCompanyData2.findOne({ symbol: symbol.toUpperCase() }).lean();
    
    const needsRefresh = !existingData || 
      refresh || 
      (existingData.scrapedAt && (Date.now() - new Date(existingData.scrapedAt as Date).getTime()) > 7 * 24 * 60 * 60 * 1000);
    
    if (existingData && !needsRefresh) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: existingData,
      });
    }
    
    console.log(`[API] Scraping fresh data for ${symbol}...`);
    const freshData = await scrapeCompanyData(symbol.toUpperCase());
    
    if (freshData.found || !existingData) {
      await AFCompanyData2.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        {
          ...freshData,
          symbol: symbol.toUpperCase(),
          scrapedAt: new Date(),
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }
    
    return NextResponse.json({
      success: true,
      source: freshData.found ? 'scraped' : (existingData ? 'cache' : 'not_found'),
      data: freshData.found ? freshData : (existingData || {
        symbol: symbol.toUpperCase(),
        name: '',
        url: generateCompanyUrl(symbol),
        found: false,
        dividends: [],
        documents: [],
      }),
    });
  } catch (error) {
    console.error('[API] Error fetching company data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        symbol: symbol.toUpperCase(),
        name: '',
        url: generateCompanyUrl(symbol),
        found: false,
        dividends: [],
        documents: [],
      },
    }, { status: 500 });
  }
}
