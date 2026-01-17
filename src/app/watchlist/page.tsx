'use client';

import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import StockTable from '@/components/StockTable';
import StockCard from '@/components/StockCard';
import AuthGuard from '@/components/AuthGuard';
import WatchlistXPosts from '@/components/WatchlistXPosts';
import { useWatchlist } from '@/lib/watchlistContext';
import { getStocksBySymbols } from '@/lib/stockData';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const watchlistStocks = getStocksBySymbols(watchlist);

  const gainers = watchlistStocks.filter((s) => s.change > 0).length;
  const losers = watchlistStocks.filter((s) => s.change < 0).length;
  const unchanged = watchlistStocks.filter((s) => s.change === 0).length;

  return (
    <AuthGuard pageName="your watchlist">
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 dark:from-slate-800 dark:via-amber-900 dark:to-slate-800 rounded-3xl p-8 mb-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4">
              <Star size={16} fill="currentColor" />
              <span>Favorite Stocks</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Watchlist</h1>
            <p className="text-amber-100 dark:text-slate-300 text-lg">
              Track your favorite Nigerian stocks in one place
            </p>
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
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-amber-500" size={40} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your watchlist is empty
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-8">
                Start building your watchlist by clicking the star icon on any stock you want to track.
              </p>
              <Link
                href="/stocks"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <TrendingUp size={18} />
                Browse Stocks
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
