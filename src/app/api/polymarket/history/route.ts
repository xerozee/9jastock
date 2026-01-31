import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/polymarket-bot';

export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
