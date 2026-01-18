import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, SocialPost, User } from '@/lib/mongodb';
import { getUserTier } from '@/lib/subscription';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const MAX_POST_AGE_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    await connectToDatabase();
    const user = await User.findById((session.user as any).id).lean();
    const tier = getUserTier(user);
    
    if (tier !== 'premium') {
      return NextResponse.json({ success: false, error: 'Premium subscription required' }, { status: 403 });
    }
    
    const latestPost = await SocialPost.findOne({ platform: 'twitter' })
      .sort({ scrapedAt: -1 })
      .lean();
    
    const now = Date.now();
    const lastScraped = latestPost?.scrapedAt ? new Date(latestPost.scrapedAt).getTime() : 0;
    const timeSinceLastScrape = now - lastScraped;
    
    if (timeSinceLastScrape < REFRESH_INTERVAL_MS) {
      const existingPosts = await SocialPost.find({ 
        platform: 'twitter', 
        isActive: true 
      })
        .sort({ publishedAt: -1 })
        .limit(15)
        .lean();
      
      return NextResponse.json({
        success: true,
        refreshed: false,
        message: 'Data is still fresh',
        posts: existingPosts.length,
        nextRefreshIn: Math.ceil((REFRESH_INTERVAL_MS - timeSinceLastScrape) / 1000),
      });
    }
    
    console.log('[X Refresh] Triggering X/Twitter crawler...');
    
    const { crawlXPosts } = await import('@/lib/xTwitterCrawler');
    const crawlResult = await crawlXPosts();
    
    console.log(`[X Refresh] Crawl complete: ${crawlResult.postsProcessed} new posts`);
    
    return NextResponse.json({
      success: true,
      refreshed: true,
      postsProcessed: crawlResult.postsProcessed,
      errors: crawlResult.errors,
    });
  } catch (error: any) {
    console.error('X refresh error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const latestPost = await SocialPost.findOne({ platform: 'twitter' })
      .sort({ scrapedAt: -1 })
      .lean();
    
    const postCount = await SocialPost.countDocuments({ platform: 'twitter', isActive: true });
    
    const oldestAllowed = new Date(Date.now() - MAX_POST_AGE_MS);
    const staleCount = await SocialPost.countDocuments({ 
      platform: 'twitter', 
      isActive: true,
      publishedAt: { $lt: oldestAllowed }
    });
    
    const now = Date.now();
    const lastScraped = latestPost?.scrapedAt ? new Date(latestPost.scrapedAt).getTime() : 0;
    const needsRefresh = (now - lastScraped) > REFRESH_INTERVAL_MS;
    
    return NextResponse.json({
      success: true,
      lastScraped: latestPost?.scrapedAt || null,
      postCount,
      staleCount,
      needsRefresh,
      refreshIntervalMinutes: REFRESH_INTERVAL_MS / 60000,
    });
  } catch (error: any) {
    console.error('X status check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
