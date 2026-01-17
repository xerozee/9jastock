'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, ExternalLink, Clock, RefreshCw, Loader2 } from 'lucide-react';

interface XPost {
  id: string;
  platform: string;
  author: string;
  authorHandle?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  stockMentions: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  url?: string;
}

const sentimentConfig = {
  bullish: { label: 'Bullish', color: 'text-green-500', bg: 'bg-green-500/10' },
  bearish: { label: 'Bearish', color: 'text-red-500', bg: 'bg-red-500/10' },
  neutral: { label: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  mixed: { label: 'Mixed', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
};

function generateAvatarColor(name: string): string {
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-orange-500', 'bg-red-500', 'bg-cyan-500', 'bg-indigo-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function XPostCard({ post }: { post: XPost }) {
  const avatarColor = generateAvatarColor(post.author);
  const initials = post.author.substring(0, 2).toUpperCase();
  const sentiment = post.sentiment ? sentimentConfig[post.sentiment] : null;

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-500/30">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {post.author}
            </span>
            {post.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
            {post.authorHandle && (
              <span className="text-sm text-gray-500 dark:text-slate-400 truncate">
                {post.authorHandle}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/10 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X (Twitter)</span>
            </div>
            {sentiment && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${sentiment.bg} ${sentiment.color} text-xs font-medium`}>
                <span>{sentiment.label}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{post.timestamp}</span>
            </div>
          </div>
          
          <p className="mt-2 text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
            {post.content}
          </p>
          
          {post.stockMentions && post.stockMentions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.stockMentions.map(stock => (
                <a 
                  key={stock} 
                  href={`/stocks/${stock}`}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                >
                  ${stock}
                </a>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-sm">
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </div>
            {post.shares > 0 && (
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-sm">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </div>
            )}
            {post.url && (
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto text-gray-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface WatchlistXPostsProps {
  watchlistSymbols: string[];
}

export default function WatchlistXPosts({ watchlistSymbols }: WatchlistXPostsProps) {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedPosts: XPost[] = [];
      
      if (watchlistSymbols.length > 0) {
        const watchlistRes = await fetch(`/api/social/watchlist?symbols=${watchlistSymbols.join(',')}`, { credentials: 'include' });
        if (watchlistRes.ok) {
          const data = await watchlistRes.json();
          fetchedPosts = data.posts || [];
        }
      }
      
      if (fetchedPosts.length < 10) {
        const generalRes = await fetch('/api/social?platform=twitter&limit=15', { credentials: 'include' });
        if (generalRes.ok) {
          const data = await generalRes.json();
          const generalPosts = data.posts || [];
          const existingIds = new Set(fetchedPosts.map(p => p.id));
          const newPosts = generalPosts.filter((p: XPost) => !existingIds.has(p.id));
          fetchedPosts = [...fetchedPosts, ...newPosts].slice(0, 10);
        }
      }
      
      setPosts(fetchedPosts.slice(0, 10));
    } catch (err: any) {
      console.error('Failed to fetch X posts:', err);
      setError('Failed to load posts from X');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [watchlistSymbols.join(',')]);

  if (!watchlistSymbols.length && posts.length === 0 && !loading) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 dark:bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                What X is Saying
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Latest posts about your watchlist stocks
              </p>
            </div>
          </div>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <XPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-slate-400">
              No recent posts found for your watchlist stocks.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
              Try refreshing or add more stocks to your watchlist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
