'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Share2, ExternalLink, Loader2, ChevronRight } from 'lucide-react';

interface XPost {
  id: string;
  platform: string;
  author: string;
  authorHandle?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  url?: string;
  stockMentions?: string[];
  verified?: boolean;
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'mixed';
}

export default function MarketBuzzX() {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSymbols, setUserSymbols] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchUserStocks = async () => {
      try {
        const [profileRes, watchlistRes] = await Promise.all([
          fetch('/api/profile', { credentials: 'include' }),
          fetch('/api/watchlist', { credentials: 'include' })
        ]);
        
        const symbols: string[] = [];
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.holdings) {
            symbols.push(...profileData.holdings.map((h: any) => h.symbol.replace('NGX:', '').toUpperCase()));
          }
          if (profileData.portfolioItems) {
            symbols.push(...profileData.portfolioItems.map((p: any) => p.symbol.replace('NGX:', '').toUpperCase()));
          }
        }
        
        if (watchlistRes.ok) {
          const watchlistData = await watchlistRes.json();
          if (watchlistData.data) {
            watchlistData.data.forEach((w: any) => {
              const sym = typeof w === 'string' ? w : w?.symbol;
              if (sym && typeof sym === 'string') {
                symbols.push(sym.replace('NGX:', '').toUpperCase());
              }
            });
          }
        }
        
        const uniqueSymbols = [...new Set(symbols.filter(s => s && typeof s === 'string'))];
        setUserSymbols(uniqueSymbols);
      } catch (error) {
        console.error('Failed to fetch user stocks:', error);
      }
    };
    
    fetchUserStocks();
  }, []);

  useEffect(() => {
    const fetchPosts = async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      try {
        const generalRes = await fetch('/api/social?platform=twitter&limit=15', { credentials: 'include' });
        if (generalRes.ok) {
          const data = await generalRes.json();
          const allPosts = data.posts || [];
          setPosts(allPosts.slice(0, 10));
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch market buzz:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchPosts();
    
    const interval = setInterval(() => fetchPosts(true), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userSymbols]);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'bearish': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'mixed': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/50 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Market Buzz
          </h2>
          <Link
            href="/blog"
            className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest Nigerian stock market discussions from X
          </p>
          {lastUpdated && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              {isRefreshing && <Loader2 className="w-3 h-3 animate-spin" />}
              Updated {formatTime(lastUpdated.toISOString())}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No market buzz available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {post.author}
                    </span>
                    {post.verified && (
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5c-1.51 0-2.816.917-3.437 2.25-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(post.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(post.sentiment)}`}>
                        {post.sentiment}
                      </span>
                    )}
                    {post.stockMentions && post.stockMentions.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        ${post.stockMentions[0]}
                      </span>
                    )}
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
