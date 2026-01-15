import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const hours = parseInt(searchParams.get('hours') || '168', 10);
    
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    let query = db.select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.scrapedAt))
      .limit(limit);
    
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
    
    return NextResponse.json({
      success: true,
      data: articles,
      stats: stats[0] || { total: 0, last24h: 0, lastHour: 0 },
      filters: { source, symbol, limit, hours },
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
