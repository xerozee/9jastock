import { NextRequest, NextResponse } from 'next/server';
import { runCrawler } from '@/lib/socialCrawler';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      console.log('Crawler triggered without admin key, proceeding anyway in dev mode');
    }

    console.log('Starting social media crawler...');
    const result = await runCrawler();

    return NextResponse.json({
      success: result.success,
      message: `Processed ${result.postsProcessed} new posts`,
      postsProcessed: result.postsProcessed,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined,
    });
  } catch (error: any) {
    console.error('Crawler API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Social media crawler endpoint. Use POST to trigger a crawl.',
    endpoints: {
      'POST /api/social/crawl': 'Run the crawler to fetch new posts',
      'GET /api/social': 'Get social feed posts',
    },
  });
}
