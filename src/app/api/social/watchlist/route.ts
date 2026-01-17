import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, SocialPost } from '@/lib/mongodb';

let lastRequestTime: Map<string, number> = new Map();
const RATE_LIMIT_MS = 30000;

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id || session.user.email || 'anonymous';
    const now = Date.now();
    const lastRequest = lastRequestTime.get(userId) || 0;
    
    if (now - lastRequest < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000);
      return NextResponse.json(
        { success: false, error: `Please wait ${remainingSeconds} seconds before refreshing` },
        { status: 429 }
      );
    }
    
    lastRequestTime.set(userId, now);

    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    
    if (!symbolsParam) {
      return NextResponse.json(
        { success: false, error: 'No symbols provided' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).slice(0, 20);
    
    if (!symbols.length) {
      return NextResponse.json({ success: true, posts: [] });
    }

    await connectToDatabase();

    const posts = await SocialPost.find({
      platform: 'twitter',
      stockMentions: { $in: symbols },
      isActive: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    const formattedPosts = posts.map((post: any) => ({
      id: post._id.toString(),
      platform: 'twitter',
      author: post.author,
      authorHandle: post.authorHandle,
      content: post.content,
      timestamp: formatTimeAgo(post.publishedAt),
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      verified: post.verified || false,
      stockMentions: post.stockMentions || [],
      sentiment: post.sentiment,
      url: post.originalUrl,
    }));

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length,
      symbols,
    });
  } catch (error: any) {
    console.error('Watchlist X posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
