import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { analyzeStock, StockData } from '@/lib/openai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
    const baseUrl = isProduction 
      ? 'https://9jastocks.app' 
      : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';
    
    const stocksResponse = await fetch(`${baseUrl}/api/stocks`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!stocksResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }

    const stocksData = await stocksResponse.json();
    const stock = stocksData.stocks?.find(
      (s: any) => s.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const stockData: StockData = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      sector: stock.sector,
      dividendYield: stock.dividendYield,
      peRatio: stock.peRatio,
      marketCap: stock.marketCap,
      volume: stock.volume,
      rsi: stock.rsi,
      high52Week: stock.high52Week,
      low52Week: stock.low52Week,
    };

    const analysis = await analyzeStock(stockData);

    return NextResponse.json({
      analysis,
      stock: stockData,
    });
  } catch (error) {
    console.error('Stock analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze stock' }, { status: 500 });
  }
}
