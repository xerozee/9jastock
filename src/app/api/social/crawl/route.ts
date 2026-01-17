import { NextRequest, NextResponse } from 'next/server';
import { runCrawler } from '@/lib/socialCrawler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const maxDuration = 60;

let lastCrawlTime: number | null = null;
const CRAWL_COOLDOWN_MS = 60000;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    const hasAdminKey = adminKey && authHeader === `Bearer ${adminKey}`;
    
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    
    if (!hasAdminKey && !isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to use this feature.' },
        { status: 401 }
      );
    }
    
    if (lastCrawlTime && Date.now() - lastCrawlTime < CRAWL_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((CRAWL_COOLDOWN_MS - (Date.now() - lastCrawlTime)) / 1000);
      return NextResponse.json(
        { success: false, error: `Please wait ${remainingSeconds} seconds before crawling again.` },
        { status: 429 }
      );
    }
    
    lastCrawlTime = Date.now();
    
    console.log('Starting social media crawler...');
    const result = await runCrawler();

    return NextResponse.json({
      success: result.success,
      message: `Processed ${result.postsProcessed} new posts`,
      postsProcessed: result.postsProcessed,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined,
    });
  } catch (error: any) {
    console.error('Crawler error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run crawler' },
      { status: 500 }
    );
  }
}
