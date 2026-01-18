'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Newspaper, ExternalLink, Clock, 
  Building2, BarChart3, FileText, RefreshCw, ChevronRight, Wifi, WifiOff, Lock, LogIn,
  MessageCircle, Heart, Share2, Loader2, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Stock } from '@/types/stock';
import { NewsListSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  source: string;
  url: string;
  category: string | null;
  symbol: string | null;
  publishedAt: string | null;
  scrapedAt: string;
}

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


const NEWS_REFRESH_PREMIUM = 2 * 60 * 1000;
const NEWS_REFRESH_FREE = 6 * 60 * 60 * 1000;
const NEWS_REFRESH_GUEST = 6 * 60 * 60 * 1000;
const GUEST_ARTICLE_LIMIT = 5;

const sentimentConfig = {
  bullish: { label: 'Bullish', color: 'text-green-500', bg: 'bg-green-500/10' },
  bearish: { label: 'Bearish', color: 'text-red-500', bg: 'bg-red-500/10' },
  neutral: { label: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  mixed: { label: 'Mixed', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
};

export default function BlogPage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const { isPremium, tier } = useSubscription();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isXLoading, setIsXLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newsLastUpdated, setNewsLastUpdated] = useState<Date | null>(null);
  const [newsStats, setNewsStats] = useState<{ total: number; last24h: number; lastHour: number } | null>(null);
  const [nextRefresh, setNextRefresh] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const refreshInterval = isPremium 
    ? NEWS_REFRESH_PREMIUM 
    : NEWS_REFRESH_FREE;

  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stocks');
      if (response.ok) {
        const data = await response.json();
        setStocks(data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setIsNewsLoading(true);
      const url = forceRefresh ? '/api/news?limit=100&hours=720&refresh=true' : '/api/news?limit=100&hours=720';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNews(data.data || []);
        setNewsStats(data.stats || null);
        setNextRefresh(data.nextRefresh || 0);
        setNewsLastUpdated(new Date());
        setIsLive(true);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setIsLive(false);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  const fetchXPosts = useCallback(async () => {
    try {
      setIsXLoading(true);
      const response = await fetch('/api/social?platform=twitter&limit=8');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.posts?.length > 0) {
          setXPosts(data.posts);
        }
      }
    } catch (error) {
      console.error('Failed to fetch X posts:', error);
    } finally {
      setIsXLoading(false);
    }
  }, []);

  const stockRefreshInterval = isPremium 
    ? 1 * 60 * 1000 
    : 30 * 60 * 1000;

  const xRefreshInterval = isPremium ? 2 * 60 * 1000 : 30 * 60 * 1000;

  useEffect(() => {
    fetchStocks();
    fetchNews();
    if (isAuthenticated) {
      fetchXPosts();
    }
    const stockInterval = setInterval(fetchStocks, stockRefreshInterval);
    const newsInterval = setInterval(() => fetchNews(), refreshInterval);
    const xInterval = isAuthenticated ? setInterval(fetchXPosts, xRefreshInterval) : null;
    return () => {
      clearInterval(stockInterval);
      clearInterval(newsInterval);
      if (xInterval) clearInterval(xInterval);
    };
  }, [fetchStocks, fetchNews, fetchXPosts, isAuthenticated, isPremium, refreshInterval, stockRefreshInterval, xRefreshInterval]);

  const topPerformers = [...stocks]
    .filter(s => s.changePercent !== undefined)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);

  const displayedNews = isAuthenticated ? news.slice(0, 10) : news.slice(0, GUEST_ARTICLE_LIMIT);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateStr);
  };

  const truncateSummary = (text: string | null, maxLength: number = 150) => {
    if (!text) return null;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                <Clock className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Limited News Access
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Showing {GUEST_ARTICLE_LIMIT} articles. Sign in for full access and real-time updates.
                </p>
              </div>
            </div>
            <button
              onClick={login}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              <LogIn size={18} />
              Sign In Free
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Newspaper className="text-green-600" />
                Market News & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay informed with the latest Nigerian stock market news, analysis, and corporate updates
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                {isLive ? (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <Wifi className="text-green-500" size={18} />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {isAuthenticated ? 'Live News Feed' : 'News Feed'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                      <WifiOff className="text-orange-500" size={18} />
                    </div>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Connecting...
                    </span>
                  </div>
                )}
              </div>
              {newsLastUpdated && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  Updated: {newsLastUpdated.toLocaleTimeString()}
                </p>
              )}
              {newsStats && isAuthenticated && (
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-gray-500 dark:text-slate-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">{newsStats.last24h}</span> today
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    <span className="font-semibold">{newsStats.total}</span> total
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Auto-refresh: {isAuthenticated ? 'every 10 min' : 'every 6 hours'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {isAuthenticated && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6">
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => fetchNews(true)}
                    disabled={isNewsLoading}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={isNewsLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {isNewsLoading && news.length === 0 ? (
              <NewsListSkeleton count={4} />
            ) : displayedNews.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <EmptyState
                  type="news"
                  title="No news available"
                  description="Market news will appear here once available. Check back soon for the latest updates."
                  actionLabel={isAuthenticated ? "Refresh News" : undefined}
                  onAction={isAuthenticated ? () => fetchNews(true) : undefined}
                />
              </div>
            ) : (
              <div className="grid gap-6">
                {displayedNews.map(item => {
                  const previewText = truncateSummary(item.summary) || truncateSummary(item.title, 100);
                  return (
                    <article key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={12} />
                              {formatRelativeTime(item.publishedAt || item.scrapedAt)}
                            </span>
                            {item.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            )}
                            {item.symbol && isAuthenticated && (
                              <Link 
                                href={`/stocks/${item.symbol}`}
                                className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-800"
                              >
                                {item.symbol}
                              </Link>
                            )}
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.title}
                            </a>
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {previewText || 'Click to read the full article and get detailed insights on this market news.'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(item.publishedAt || item.scrapedAt)}
                            </span>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Read Full Article <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
                
                {!isAuthenticated && news.length > GUEST_ARTICLE_LIMIT && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                    <Lock className="mx-auto text-green-600 dark:text-green-400 mb-3" size={32} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {news.length - GUEST_ARTICLE_LIMIT} More Articles Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Sign in to access all news articles and real-time updates every 10 minutes.
                    </p>
                    <button
                      onClick={login}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <LogIn size={18} />
                      Sign In for Full Access
                    </button>
                  </div>
                )}
                
                {isAuthenticated && news.length > 10 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Showing 10 of {news.length} articles
                  </p>
                )}
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden relative">
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
                          Market Buzz from X
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Latest posts about Nigerian stocks
                        </p>
                      </div>
                    </div>
                    {isPremium && (
                      <button
                        onClick={fetchXPosts}
                        disabled={isXLoading}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                      >
                        {isXLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                      </button>
                    )}
                  </div>
                </div>

                <div className={`p-6 ${!isPremium ? 'blur-sm pointer-events-none select-none' : ''}`}>
                  {isXLoading && xPosts.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : xPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {xPosts.slice(0, 6).map(post => {
                        const sentiment = post.sentiment ? sentimentConfig[post.sentiment] : null;
                        return (
                          <div key={post.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm flex-shrink-0">
                                {post.author.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                    {post.author}
                                  </span>
                                  {post.verified && (
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                  )}
                                  {post.authorHandle && (
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                      {post.authorHandle}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
                                <p className="mt-2 text-gray-700 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                                  {post.content}
                                </p>
                                {post.stockMentions && post.stockMentions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {post.stockMentions.slice(0, 3).map(stock => (
                                      <Link 
                                        key={stock} 
                                        href={`/stocks/${stock}`}
                                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                                      >
                                        ${stock}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {post.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> {post.comments}
                                  </span>
                                  {post.url && (
                                    <a 
                                      href={post.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-auto text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                    >
                                      View <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-slate-400">
                        No posts from X yet. Click Refresh to load latest market buzz.
                      </p>
                    </div>
                  )}
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px]">
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">X Market Buzz</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
                        Upgrade to Premium for real-time social sentiment analysis
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {isAuthenticated && (
            <div className="lg:w-80">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sticky top-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={20} />
                    Top 10 Performers
                  </h2>
                  {isPremium && (
                    <button 
                      onClick={fetchStocks}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                  )}
                </div>
                
                <div className={!isPremium ? 'blur-sm pointer-events-none select-none' : ''}>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}

                  {isLoading && topPerformers.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw size={24} className="animate-spin text-green-600" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topPerformers.map((stock, index) => (
                        <Link
                          key={stock.symbol}
                          href={`/stocks/${stock.symbol}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index < 3 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">{stock.symbol}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{stock.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600 font-semibold">
                              +{stock.changePercent.toFixed(2)}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">₦{stock.price.toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/stocks?sort=gainers"
                    className="flex items-center justify-center gap-2 mt-4 py-3 text-green-600 font-medium hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  >
                    View All Stocks <ChevronRight size={16} />
                  </Link>
                </div>

                {!isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px]">
                    <div className="text-center p-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Top Performers</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Premium feature
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        Upgrade
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
