'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, ExternalLink, TrendingUp, Clock, RefreshCw, Loader2 } from 'lucide-react';

type SocialPlatform = 'all' | 'reddit' | 'tradingview' | 'twitter' | 'news';

interface SocialPost {
  id: string;
  platform: 'reddit' | 'tradingview' | 'twitter' | 'news';
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  image?: string;
  url?: string;
  stockMentions?: string[];
  subreddit?: string;
  verified?: boolean;
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  sentimentScore?: number;
}

const PLACEHOLDER_POSTS: SocialPost[] = [
  {
    id: '1',
    platform: 'reddit',
    author: 'NigeriaInvestor',
    content: "DANGCEM just broke through resistance at ₦630. Technical analysis shows strong bullish momentum with RSI above 60. Volume picking up significantly this week. Anyone else loading up?",
    timestamp: '2 hours ago',
    likes: 47,
    comments: 23,
    subreddit: 'r/NigerianStocks',
    stockMentions: ['DANGCEM'],
    sentiment: 'bullish',
  },
  {
    id: '2',
    platform: 'twitter',
    author: 'Lagos Stock Watch',
    authorHandle: '@LagosStockWatch',
    content: "Breaking: GTBank reports Q4 earnings beat expectations. Revenue up 18% YoY. The banking sector is showing resilience despite macro headwinds. $GTCO looking strong heading into 2026.",
    timestamp: '4 hours ago',
    likes: 128,
    comments: 34,
    shares: 45,
    stockMentions: ['GTCO'],
    verified: true,
    sentiment: 'bullish',
  },
  {
    id: '3',
    platform: 'tradingview',
    author: 'ChartMaster_NG',
    content: "ZENITHBANK forming a classic cup and handle pattern on the daily chart. Breakout target around ₦42. Set your alerts! This could run 15-20% from current levels.",
    timestamp: '5 hours ago',
    likes: 89,
    comments: 41,
    stockMentions: ['ZENITHBANK'],
    sentiment: 'bullish',
  },
  {
    id: '4',
    platform: 'news',
    author: 'Nairametrics',
    content: "NGX All-Share Index closes up 0.8% today. Banking stocks lead gains. Foreign investors returning to Nigerian equities as FX concerns ease. Outlook remains positive for Q1.",
    timestamp: '6 hours ago',
    likes: 62,
    comments: 15,
    stockMentions: ['MTNN', 'DANGCEM'],
    sentiment: 'bullish',
  },
];

const platformConfig = {
  reddit: {
    name: 'Reddit',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    ),
  },
  tradingview: {
    name: 'TradingView',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  twitter: {
    name: 'X (Twitter)',
    color: 'bg-slate-800 dark:bg-white',
    textColor: 'text-slate-800 dark:text-white',
    bgColor: 'bg-slate-800/10 dark:bg-white/10',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  news: {
    name: 'News',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-600/10',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
      </svg>
    ),
  },
};

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

function PostCard({ post }: { post: SocialPost }) {
  const config = platformConfig[post.platform];
  const avatarColor = generateAvatarColor(post.author);
  const initials = post.author.substring(0, 2).toUpperCase();
  const sentiment = post.sentiment ? sentimentConfig[post.sentiment] : null;

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 hover:shadow-lg transition-all duration-300 hover:border-green-500/30">
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
            {post.subreddit && (
              <span className="text-sm text-orange-500 font-medium">
                {post.subreddit}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} text-xs font-medium`}>
              {config.icon}
              <span>{config.name}</span>
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
                  className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
                >
                  ${stock}
                </a>
              ))}
            </div>
          )}
          
          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700/50 aspect-video relative">
              <img src={post.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/50">
            <button className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-red-500 transition-colors text-sm">
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
            {post.shares !== undefined && (
              <button className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-green-500 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </button>
            )}
            {post.url && (
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto text-gray-500 dark:text-slate-400 hover:text-green-500 transition-colors"
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

export default function SocialFeed() {
  const [activeFilter, setActiveFilter] = useState<SocialPlatform>('all');
  const [posts, setPosts] = useState<SocialPost[]>(PLACEHOLDER_POSTS);
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/social?platform=${activeFilter}&limit=20`);
      const data = await response.json();
      
      if (data.success && data.posts.length > 0) {
        setPosts(data.posts);
        setLastUpdated(new Date());
      } else if (data.posts?.length === 0) {
        setPosts(PLACEHOLDER_POSTS);
      }
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const runCrawler = async () => {
    setCrawling(true);
    setError(null);
    try {
      const response = await fetch('/api/social/crawl', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await fetchPosts();
      } else {
        setError(data.error || 'Crawler failed');
      }
    } catch (err: any) {
      console.error('Crawler error:', err);
      setError('Failed to run crawler');
    } finally {
      setCrawling(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.platform === activeFilter);

  const filters: { value: SocialPlatform; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'tradingview', label: 'TradingView' },
    { value: 'twitter', label: 'X (Twitter)' },
    { value: 'news', label: 'News' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Market Buzz
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            AI-powered sentiment from social media & news
            {lastUpdated && (
              <span className="ml-2">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={runCrawler}
            disabled={crawling}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {crawling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {crawling ? 'Crawling...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800/50 rounded-lg p-1 mb-4 overflow-x-auto">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeFilter === filter.value
                ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      
      {posts === PLACEHOLDER_POSTS && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Click "Refresh" to crawl latest posts from Reddit, Twitter, TradingView & Nigerian news sources
          </p>
        </div>
      )}
    </div>
  );
}
