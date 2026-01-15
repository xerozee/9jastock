import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const hours = parseInt(searchParams.get('hours') || '168', 10);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (forceRefresh) {
      newsCache = null;
    }
    
    triggerBackgroundScrape();
    
    const hasFilters = source || symbol || limit !== 50 || hours !== 168;
    
    if (!hasFilters && newsCache && Date.now() - newsCache.timestamp < CACHE_TTL) {
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
    
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const conditions = [];
    
    if (source) {
      conditions.push(eq(newsArticles.source, source));
    }
    
    if (symbol) {
      conditions.push(eq(newsArticles.symbol, symbol));
    }
    
    conditions.push(gte(newsArticles.scrapedAt, cutoffDate));
    
    const articles = await db.select()
      .from(newsArticles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(newsArticles.scrapedAt))
      .limit(limit);
    
    const stats = await db.select({
      total: sql<number>`count(*)`,
      last24h: sql<number>`count(*) filter (where scraped_at > now() - interval '24 hours')`,
      lastHour: sql<number>`count(*) filter (where scraped_at > now() - interval '1 hour')`,
    }).from(newsArticles);
    
    const statsResult = stats[0] || { total: 0, last24h: 0, lastHour: 0 };
    
    if (!hasFilters) {
      newsCache = {
        data: articles,
        stats: statsResult,
        timestamp: Date.now(),
      };
    }
    
    return NextResponse.json({
      success: true,
      data: articles,
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
