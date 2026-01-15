'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Wifi, WifiOff, Clock, Lock, LogIn } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import StockCard from '@/components/StockCard';
import LandingPage from '@/components/LandingPage';
import { useLiveStocks, formatLastUpdate } from '@/lib/useLiveStocks';
import { useAuth } from '@/hooks/useAuth';
import { Stock, MarketSummary } from '@/types/stock';

const REFRESH_INTERVAL_AUTHENTICATED = 5 * 60 * 1000;
const REFRESH_INTERVAL_GUEST = 6 * 60 * 60 * 1000;

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  return `₦${value.toLocaleString()}`;
}

function computeMarketSummary(stocks: Stock[]): MarketSummary {
  const advancers = stocks.filter(s => s.changePercent > 0).length;
  const decliners = stocks.filter(s => s.changePercent < 0).length;
  const unchanged = stocks.filter(s => s.changePercent === 0).length;
  const totalMarketCap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);

  const financialStocks = stocks.filter(s => s.sector === 'Financial Services');
  const consumerStocks = stocks.filter(s => s.sector === 'Consumer Goods');
  const oilGasStocks = stocks.filter(s => s.sector === 'Oil & Gas');
  const industrialStocks = stocks.filter(s => s.sector === 'Industrial Goods');
  const insuranceStocks = stocks.filter(s => s.sector === 'Insurance');

  const calcIndex = (sectorStocks: Stock[], baseValue: number) => {
    if (sectorStocks.length === 0) return { value: baseValue, change: 0, changePercent: 0 };
    const avgChange = sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length;
    const change = baseValue * (avgChange / 100);
    return { value: baseValue + change, change, changePercent: avgChange };
  };

  const allShareBase = 99876.54;
  const allShareAvgChange = stocks.length > 0 
    ? stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length 
    : 0;
  const allShareChange = allShareBase * (allShareAvgChange / 100);

  return {
    totalMarketCap,
    totalVolume,
    advancers,
    decliners,
    unchanged,
    indices: [
      {
        name: 'NGX All-Share Index',
        value: allShareBase + allShareChange,
        change: allShareChange,
        changePercent: allShareAvgChange,
      },
      {
        name: 'NGX 30 Index',
        ...calcIndex(stocks.slice(0, 30), 3456.78),
      },
      {
        name: 'NGX Banking Index',
        ...calcIndex(financialStocks, 876.32),
      },
      {
        name: 'NGX Consumer Goods',
        ...calcIndex(consumerStocks, 1234.56),
      },
      {
        name: 'NGX Oil & Gas Index',
        ...calcIndex(oilGasStocks, 567.89),
      },
      {
        name: 'NGX Industrial Index',
        ...calcIndex(industrialStocks, 2345.67),
      },
      {
        name: 'NGX Insurance Index',
        ...calcIndex(insuranceStocks, 234.56),
      },
    ],
  };
}

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  
  const refreshInterval = isAuthenticated ? REFRESH_INTERVAL_AUTHENTICATED : REFRESH_INTERVAL_GUEST;
  const { stocks, isLoading, error, liveCount, refresh, lastRefresh } = useLiveStocks(refreshInterval);

  const marketSummary = useMemo(() => computeMarketSummary(stocks), [stocks]);

  const topGainers = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  const topLosers = [...stocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 4);

  const mostActive = [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading 9jaStock...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={login} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 dark:from-slate-800 dark:via-slate-900 dark:to-emerald-900 rounded-3xl p-8 md:p-10 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>{isAuthenticated ? 'Live Market Data' : 'Market Overview'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Nigerian Stock Exchange <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-100">Tracker</span>
          </h1>
          <p className="text-green-100 dark:text-slate-300 text-lg mb-6 leading-relaxed">
            Track NGX stocks in real-time. Monitor market performance,
            discover opportunities, and build your portfolio.
          </p>
          {isAuthenticated && <SearchBar />}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {liveCount > 0 ? (
                <>
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Wifi className="text-green-500" size={18} />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {liveCount} stocks with live data
                  </span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                    <WifiOff className="text-orange-500" size={18} />
                  </div>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Using cached data
                  </span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <Clock size={16} />
              <span className="text-sm">
                Last update: {formatLastUpdate(lastRefresh)}
              </span>
            </div>
            <span className="hidden md:inline text-xs text-gray-400 dark:text-slate-500">
              Auto-refresh: {isAuthenticated ? 'every 5 minutes' : 'every 6 hours'}
            </span>
          </div>
          {isAuthenticated && (
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-xl">
            {error} - Showing cached data
          </div>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Market Overview</h2>
        <MarketOverview summary={marketSummary} />
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Gainers</h2>
          {isAuthenticated ? (
            <Link
              href="/stocks?sort=gainers"
              className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              View all <ArrowRight size={18} className="ml-1" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              <Lock size={14} />
              <span>Sign in to view all</span>
            </button>
          )}
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-800 animate-pulse h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topGainers.map((stock) => (
              <StockCard key={stock.symbol} stock={stock as Stock} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Losers</h2>
          {isAuthenticated ? (
            <Link
              href="/stocks?sort=losers"
              className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              View all <ArrowRight size={18} className="ml-1" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              <Lock size={14} />
              <span>Sign in to view all</span>
            </button>
          )}
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-800 animate-pulse h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topLosers.map((stock) => (
              <StockCard key={stock.symbol} stock={stock as Stock} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Most Active</h2>
          {isAuthenticated ? (
            <Link
              href="/stocks?sort=volume"
              className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              View all <ArrowRight size={18} className="ml-1" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              <Lock size={14} />
              <span>Sign in to view all</span>
            </button>
          )}
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-800 animate-pulse h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostActive.map((stock) => (
              <StockCard key={stock.symbol} stock={stock as Stock} showDetails />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-100 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stocks.length}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Total Stocks</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-100 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{liveCount}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Live Data</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-100 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stocks.filter(s => s.changePercent > 0).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Gainers</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-100 dark:border-slate-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stocks.filter(s => s.changePercent < 0).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Losers</div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="mt-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Unlock Full Access</h3>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Sign in to access real-time data updates every 5 minutes, detailed stock analysis, 
            portfolio tracking, personalized watchlists, and daily market newsletters.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <LogIn size={20} />
            Sign In for Free
          </button>
        </section>
      )}
    </div>
  );
}
