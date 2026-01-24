import { NextResponse } from 'next/server';
import { scrapeCompanyData, generateCompanyUrl, AFCompanyData } from '@/lib/africanFinancialsBrowser';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const AFCompanyDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: String,
  url: String,
  found: { type: Boolean, default: false },
  sector: String,
  dividends: { type: mongoose.Schema.Types.Mixed, default: [] },
  documents: { type: mongoose.Schema.Types.Mixed, default: [] },
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
}, { strict: false });

function getAFCompanyDataModel() {
  if (mongoose.models.AFCompanyData2) {
    return mongoose.models.AFCompanyData2;
  }
  return mongoose.model('AFCompanyData2', AFCompanyDataSchema);
}

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
    
    const AFCompanyDataModel = getAFCompanyDataModel();
    
    const existingData = await AFCompanyDataModel.findOne({ symbol: symbol.toUpperCase() }).lean();
    
    const needsRefresh = !existingData || 
      refresh || 
      (existingData.updatedAt && (Date.now() - new Date(existingData.updatedAt as Date).getTime()) > 7 * 24 * 60 * 60 * 1000);
    
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
      await AFCompanyDataModel.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        {
          ...freshData,
          symbol: symbol.toUpperCase(),
          updatedAt: new Date(),
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
