import { NextRequest, NextResponse } from 'next/server';
import { getSocialPosts, runCrawler } from '@/lib/socialCrawler';
import { connectToDatabase, SocialPost } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const stockSymbol = searchParams.get('symbol') || undefined;

    const posts = await getSocialPosts({
      platform,
      limit: Math.min(limit, 50),
      stockSymbol,
    });

    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      platform: post.platform,
      author: post.author,
      authorHandle: post.authorHandle,
      authorAvatar: post.authorAvatar,
      content: post.content,
      timestamp: formatTimeAgo(post.publishedAt),
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      verified: post.verified,
      subreddit: post.subreddit,
      stockMentions: post.stockMentions,
      sentiment: post.sentiment,
      sentimentScore: post.sentimentScore,
      image: post.imageUrl,
      url: post.originalUrl,
    }));

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length,
    });
  } catch (error: any) {
    console.error('Social API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refreshKey = searchParams.get('key');
    
    if (refreshKey !== process.env.X_BEARER_TOKEN?.slice(0, 20)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    const deleteResult = await SocialPost.deleteMany({ platform: 'twitter' });
    console.log(`Cleared ${deleteResult.deletedCount} old Twitter posts`);
    
    const reCrawl = searchParams.get('crawl') === 'true';
    let crawlResult = null;
    
    if (reCrawl) {
      crawlResult = await runCrawler();
    }
    
    return NextResponse.json({
      success: true,
      deleted: deleteResult.deletedCount,
      crawled: crawlResult?.postsProcessed || 0,
    });
  } catch (error: any) {
    console.error('Social refresh error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
