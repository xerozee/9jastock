import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Return stock data with metadata
  // Note: For live data, integrate with a real data provider API
  // Options: Yahoo Finance, Alpha Vantage, or NGXEQTY API on RapidAPI

  const stocks = nigerianStocks.map(stock => ({
    ...stock,
    isLive: false, // Set to true when using real API
    lastUpdated: Date.now(),
  }));

  return NextResponse.json({
    success: true,
    data: stocks,
    liveCount: 0, // Will show live count when connected to real API
    totalCount: stocks.length,
    timestamp: Date.now(),
    note: 'Using demo data. For live prices, view individual stock pages with TradingView charts.',
  });
}
