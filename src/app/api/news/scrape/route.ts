import { NextResponse } from 'next/server';
import { runNewsScraper } from '@/lib/newsScraper';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('Unauthorized scrape attempt - invalid or missing authorization');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Starting scheduled news scrape...');
    const result = await runNewsScraper();
    
    return NextResponse.json({
      success: true,
      message: 'News scraper completed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News scraper error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'News scraper endpoint. Use POST to trigger scraping.',
    usage: 'POST /api/news/scrape',
  });
}
