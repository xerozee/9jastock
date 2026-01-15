'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Newspaper, ExternalLink, Clock, 
  Building2, BarChart3, FileText, RefreshCw, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { Stock } from '@/types/stock';

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

const NEWS_SOURCES = [
  { id: 'all', name: 'All Sources', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { id: 'TradingView', name: 'TradingView', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { id: 'Nairametrics', name: 'Nairametrics', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { id: 'BusinessDay', name: 'BusinessDay', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { id: 'Punch', name: 'Punch', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

const NEWS_REFRESH_INTERVAL = 30 * 60 * 1000;

export default function BlogPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newsLastUpdated, setNewsLastUpdated] = useState<Date | null>(null);
  const [newsStats, setNewsStats] = useState<{ total: number; last24h: number; lastHour: number } | null>(null);
  const [nextRefresh, setNextRefresh] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);

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
      const url = forceRefresh ? '/api/news?limit=50&refresh=true' : '/api/news?limit=50';
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

  useEffect(() => {
    fetchStocks();
    fetchNews();
    const stockInterval = setInterval(fetchStocks, 5 * 60 * 1000);
    const newsInterval = setInterval(() => fetchNews(), NEWS_REFRESH_INTERVAL);
    return () => {
      clearInterval(stockInterval);
      clearInterval(newsInterval);
    };
  }, [fetchStocks, fetchNews]);

  const topPerformers = [...stocks]
    .filter(s => s.changePercent !== undefined)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);

  const filteredNews = activeSource === 'all'
    ? news
    : news.filter(n => n.source === activeSource);

  const getSourceInfo = (sourceId: string) => 
    NEWS_SOURCES.find(s => s.id === sourceId) || NEWS_SOURCES[0];

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

  return (
    <AuthGuard pageName="market news">
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      Live News Feed
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
              {newsStats && (
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
                Auto-refresh: every 30 min
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* News Sources Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {NEWS_SOURCES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => setActiveSource(source.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeSource === source.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
                <button
                  onClick={() => fetchNews(true)}
                  disabled={isNewsLoading}
                  className="ml-auto px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isNewsLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* News Grid */}
            {isNewsLoading && news.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw size={32} className="animate-spin text-green-600" />
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
                <Newspaper className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No News Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  News articles are being scraped from multiple sources. Check back soon!
                </p>
                <button
                  onClick={() => fetchNews(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Refresh News
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredNews.slice(0, 10).map(item => {
                  const sourceInfo = getSourceInfo(item.source);
                  const previewText = truncateSummary(item.summary) || truncateSummary(item.title, 100);
                  return (
                    <article key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceInfo.color}`}>
                              {item.source}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={12} />
                              {formatRelativeTime(item.publishedAt || item.scrapedAt)}
                            </span>
                            {item.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            )}
                            {item.symbol && (
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
                {filteredNews.length > 10 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Showing 10 of {filteredNews.length} articles
                  </p>
                )}
              </div>
            )}

            {/* News Sources Section */}
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">News Sources</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a 
                  href="https://ngxgroup.com/exchange/data/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Building2 className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">NGX Official</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Official exchange news</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://businessday.ng/companies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Newspaper className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">BusinessDay</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business & markets</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://nairametrics.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <BarChart3 className="text-purple-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Nairametrics</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Financial analysis</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://www.thisdaylive.com/business/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                >
                  <FileText className="text-orange-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">ThisDay</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nigerian business</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://punchng.com/topics/business/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Newspaper className="text-red-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Punch</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">National news</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://www.sec.gov.ng/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Building2 className="text-gray-600 dark:text-gray-300" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SEC Nigeria</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Regulatory updates</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar - Top Performers */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Top 10 Performers
                </h2>
                <button 
                  onClick={fetchStocks}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              
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
                      href={`/blog/${stock.symbol}`}
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
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
