'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, ArrowRight, Clock, RefreshCw, Zap, Crown } from 'lucide-react';
import StockTable from '@/components/StockTable';
import StockCard from '@/components/StockCard';
import AuthGuard from '@/components/AuthGuard';
import WatchlistXPosts from '@/components/WatchlistXPosts';
import { useWatchlist } from '@/lib/watchlistContext';
import { useLiveStocks } from '@/lib/useLiveStocks';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_LIMITS } from '@/lib/subscription';
import { PremiumBadge } from '@/components/PremiumWrapper';
import { WatchlistSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const { isPremium, tier } = useSubscription();
  const refreshInterval = TIER_LIMITS[tier]?.refreshInterval || TIER_LIMITS.guest.refreshInterval;
  const { stocks: allStocks, isLoading, lastRefresh, refresh, isRefreshing } = useLiveStocks(refreshInterval);
  
  const watchlistStocks = useMemo(() => {
    return allStocks.filter(stock => watchlist.includes(stock.symbol));
  }, [allStocks, watchlist]);

  const gainers = watchlistStocks.filter((s) => s.change > 0).length;
  const losers = watchlistStocks.filter((s) => s.change < 0).length;
  const unchanged = watchlistStocks.filter((s) => s.change === 0).length;

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return 'Not available';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <AuthGuard pageName="your watchlist">
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`relative rounded-3xl p-8 mb-8 text-white overflow-hidden ${
          isPremium 
            ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 dark:from-slate-900 dark:via-amber-900/50 dark:to-slate-800' 
            : 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 dark:from-slate-800 dark:via-amber-900 dark:to-slate-800'
        }`} style={isPremium ? { boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' } : undefined}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                isPremium ? 'bg-amber-600/50 border border-amber-400/50' : 'bg-white/10 backdrop-blur-sm'
              }`}>
                {isPremium ? <Crown size={16} className="text-amber-200" /> : <Star size={16} fill="currentColor" />}
                <span>{isPremium ? 'Premium Watchlist' : 'Favorite Stocks'}</span>
                {isPremium && <PremiumBadge size="sm" />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Watchlist</h1>
              <p className="text-amber-100 dark:text-slate-300 text-lg">
                {isPremium ? 'Real-time tracking with 1-minute updates' : 'Track your favorite Nigerian stocks in one place'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500">
            <Clock size={14} />
            <span>Last update: {formatLastUpdate(lastRefresh)}</span>
            {isRefreshing && (
              <span className="flex items-center gap-1 text-amber-500">
                <RefreshCw size={12} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isPremium 
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
          }`}>
            {isPremium ? <Zap size={12} /> : <Clock size={12} />}
            <span>Auto-refresh: {isPremium ? '1 min' : '5 min'}</span>
          </div>
        </div>

        {watchlistStocks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Stocks Watched</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{watchlistStocks.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
                  <TrendingUp size={14} className="text-green-500" />
                  <span>Gainers</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{gainers}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
                  <TrendingDown size={14} className="text-red-500" />
                  <span>Losers</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{losers}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Unchanged</p>
                <p className="text-3xl font-bold text-gray-500 dark:text-slate-400">{unchanged}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {watchlistStocks.slice(0, 4).map((stock) => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="text-amber-500" size={20} fill="currentColor" />
                  Watchlist ({watchlistStocks.length} stocks)
                </h2>
              </div>
              <StockTable stocks={watchlistStocks} />
            </div>

            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Watchlist Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Gainers</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{gainers}</p>
                  <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">stocks up today</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="text-red-600" size={20} />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Losers</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{losers}</p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">stocks down today</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-700/50 dark:to-slate-700/50 rounded-2xl border border-gray-200 dark:border-slate-600">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Unchanged</p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-slate-300">{unchanged}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">stocks flat today</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <WatchlistXPosts watchlistSymbols={watchlist} />
            </div>
          </>
        ) : isLoading ? (
          <WatchlistSkeleton count={5} />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <EmptyState
              type="watchlist"
              title="Your watchlist is empty"
              description="Start building your watchlist by clicking the star icon on any stock you want to track."
              actionLabel="Browse Stocks"
              actionHref="/stocks"
            />
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
