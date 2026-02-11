import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, DividendHistory } from '@/lib/mongodb';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAdminRequest(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return !!ADMIN_API_KEY && apiKey === ADMIN_API_KEY;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const symbols = searchParams.get('symbols');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    } else if (symbols) {
      const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      if (symbolArray.length > 0) {
        query.symbol = { $in: symbolArray };
      }
    }
    
    if (year) {
      query.fiscalYear = parseInt(year);
    }

    const dividends = await DividendHistory.find(query)
      .sort({ paymentDate: -1 })
      .limit(limit);

    const stats = symbol ? await getDividendStats(symbol.toUpperCase()) : null;

    return NextResponse.json({
      dividends,
      stats,
      count: dividends.length
    });
  } catch (error) {
    console.error('Error fetching dividends:', error);
    return NextResponse.json({ error: 'Failed to fetch dividends' }, { status: 500 });
  }
}

async function getDividendStats(symbol: string) {
  const dividends = await DividendHistory.find({ symbol }).sort({ paymentDate: -1 });
  
  if (dividends.length === 0) {
    return {
      hasDividends: false,
      totalDividends: 0,
      averageDividend: 0,
      latestDividend: null,
      dividendFrequency: 'none',
      yearsOfDividends: 0
    };
  }

  const totalAmount = dividends.reduce((sum, d) => sum + (d.dividendAmount || 0), 0);
  const years = new Set(dividends.map(d => d.fiscalYear).filter(Boolean));
  const avgPerYear = dividends.length / Math.max(years.size, 1);

  let frequency = 'annual';
  if (avgPerYear >= 3.5) frequency = 'quarterly';
  else if (avgPerYear >= 1.5) frequency = 'semi-annual';

  return {
    hasDividends: true,
    totalDividends: dividends.length,
    averageDividend: totalAmount / dividends.length,
    latestDividend: dividends[0],
    dividendFrequency: frequency,
    yearsOfDividends: years.size
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, dividendAmount, paymentDate, ...dividendData } = body;

    if (!symbol || dividendAmount === undefined) {
      return NextResponse.json({ error: 'Symbol and dividendAmount are required' }, { status: 400 });
    }

    await connectToDatabase();

    const dividend = await DividendHistory.create({
      symbol: symbol.toUpperCase(),
      dividendAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      ...dividendData,
      scrapedAt: new Date()
    });

    return NextResponse.json(dividend);
  } catch (error) {
    console.error('Error saving dividend:', error);
    return NextResponse.json({ error: 'Failed to save dividend' }, { status: 500 });
  }
}
