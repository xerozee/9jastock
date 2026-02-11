import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, DividendHistory } from '@/lib/mongodb';

const API_SECRET_KEY = process.env.API_SECRET_KEY;

function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return !!API_SECRET_KEY && apiKey === API_SECRET_KEY;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized - API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { dividends } = body;

    if (!Array.isArray(dividends)) {
      return NextResponse.json(
        { error: 'Dividends must be an array' },
        { status: 400 }
      );
    }

    if (dividends.length === 0) {
      return NextResponse.json(
        { insertedCount: 0, modifiedCount: 0, totalCount: 0 },
        { status: 200 }
      );
    }

    await connectToDatabase();

    let insertedCount = 0;
    let modifiedCount = 0;

    for (const dividend of dividends) {
      const { symbol, period, dividendAmount, ...data } = dividend;

      if (!symbol || dividendAmount === undefined) {
        console.warn('Skipping dividend record with missing symbol or dividendAmount:', dividend);
        continue;
      }

      // Upsert logic: match on symbol + period + dividendAmount
      const filter: Record<string, unknown> = {
        symbol: symbol.toUpperCase(),
        dividendAmount,
      };

      if (period) {
        filter.period = period;
      }

      const result = await DividendHistory.updateOne(
        filter,
        {
          $set: {
            symbol: symbol.toUpperCase(),
            dividendAmount,
            period: period || undefined,
            ...data,
            scrapedAt: new Date(),
          }
        },
        {
          upsert: true,
        }
      );

      if (result.upsertedId) {
        insertedCount++;
      } else {
        modifiedCount++;
      }
    }

    return NextResponse.json({
      insertedCount,
      modifiedCount,
      totalCount: insertedCount + modifiedCount,
    });
  } catch (error) {
    console.error('Error in bulk dividend seed:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk dividend seed' },
      { status: 500 }
    );
  }
}
