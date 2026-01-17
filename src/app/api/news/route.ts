import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, NewsArticle, User } from '@/lib/mongodb';
import { getUserTier, TIER_LIMITS } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

interface NewsCache {
  data: any[];
  stats: { total: number; last24h: number; lastHour: number };
  timestamp: number;
}

let newsCache: NewsCache | null = null;
const CACHE_TTL = 2 * 60 * 1000;
let lastScrapeTime = 0;
const SCRAPE_INTERVAL = 10 * 60 * 1000;

async function triggerBackgroundScrape() {
  const now = Date.now();
  if (now - lastScrapeTime < SCRAPE_INTERVAL) {
    return;
  }
  
  lastScrapeTime = now;
  
  try {
    const { runNewsScraper } = await import('@/lib/newsScraper');
    console.log('[News API] Starting background scrape...');
    runNewsScraper().then(result => {
      console.log('[News API] Background scrape completed:', result);
      newsCache = null;
    }).catch(err => {
      console.error('[News API] Background scrape failed:', err);
    });
  } catch (error) {
    console.error('[News API] Failed to start background scrape:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const symbol = searchParams.get('symbol');
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    const hours = parseInt(searchParams.get('hours') || '168', 10);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Check user tier and apply limits
    const session = await getServerSession(authOptions);
    let tier = 'guest';
    if (session?.user) {
      await connectToDatabase();
      const user = await User.findById((session.user as any).id).lean();
      tier = getUserTier(user);
    }
    const maxArticles = TIER_LIMITS[tier as keyof typeof TIER_LIMITS].newsArticles;
    limit = Math.min(limit, maxArticles);
    
    if (forceRefresh) {
      newsCache = null;
    }
    
    triggerBackgroundScrape();
    
    const hasFilters = source || symbol || limit !== 50 || hours !== 168;
    
    // Don't use cache for non-premium users since limit varies
    if (!hasFilters && newsCache && Date.now() - newsCache.timestamp < CACHE_TTL && tier === 'premium') {
      return NextResponse.json({
        success: true,
        data: newsCache.data,
        stats: newsCache.stats,
        filters: { source, symbol, limit, hours },
        cached: true,
        cacheAge: Math.floor((Date.now() - newsCache.timestamp) / 1000),
        nextRefresh: Math.floor((SCRAPE_INTERVAL - (Date.now() - lastScrapeTime)) / 1000),
      });
    }
    
    await connectToDatabase();
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const query: any = {
      scrapedAt: { $gte: cutoffDate },
    };
    
    if (source) {
      query.source = source;
    }
    
    if (symbol) {
      query.symbol = symbol;
    }
    
    const articles = await NewsArticle.find(query)
      .sort({ scrapedAt: -1 })
      .limit(limit)
      .lean();

    const formattedArticles = articles.map(a => ({
      id: a._id.toString(),
      title: a.title,
      summary: a.summary,
      content: a.content,
      url: a.url,
      source: a.source,
      category: a.category,
      symbol: a.symbol,
      imageUrl: a.imageUrl,
      publishedAt: a.publishedAt,
      scrapedAt: a.scrapedAt,
    }));
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [total, last24h, lastHour] = await Promise.all([
      NewsArticle.countDocuments(),
      NewsArticle.countDocuments({ scrapedAt: { $gte: oneDayAgo } }),
      NewsArticle.countDocuments({ scrapedAt: { $gte: oneHourAgo } }),
    ]);
    
    const statsResult = { total, last24h, lastHour };
    
    if (!hasFilters) {
      newsCache = {
        data: formattedArticles,
        stats: statsResult,
        timestamp: Date.now(),
      };
    }
    
    return NextResponse.json({
      success: true,
      data: formattedArticles,
      stats: statsResult,
      filters: { source, symbol, limit, hours },
      cached: false,
      nextRefresh: Math.floor((SCRAPE_INTERVAL - (Date.now() - lastScrapeTime)) / 1000),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      },
      { status: 500 }
    );
  }
}
