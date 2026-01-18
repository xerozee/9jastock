'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, RefreshCw, AlertCircle, Crown, Zap } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import MarketHours from '@/components/MarketHours';
import StockCard from '@/components/StockCard';
import StockGridSkeleton from '@/components/StockGridSkeleton';
import MarketingLandingPage from '@/components/MarketingLandingPage';
import MarketBuzzX from '@/components/MarketBuzzX';
import { useLiveStocks, formatLastUpdate } from '@/lib/useLiveStocks';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Stock, MarketSummary } from '@/types/stock';
import { MARKET_INDEX_BASE_VALUES } from '@/lib/marketConfig';
import { PremiumBadge } from '@/components/PremiumWrapper';

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

  const allShareBase = MARKET_INDEX_BASE_VALUES['NGX All-Share Index'];
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
        ...calcIndex(stocks.slice(0, 30), MARKET_INDEX_BASE_VALUES['NGX 30 Index']),
      },
      {
        name: 'NGX Banking Index',
        ...calcIndex(financialStocks, MARKET_INDEX_BASE_VALUES['NGX Banking Index']),
      },
      {
        name: 'NGX Consumer Goods',
        ...calcIndex(consumerStocks, MARKET_INDEX_BASE_VALUES['NGX Consumer Goods']),
      },
      {
        name: 'NGX Oil & Gas Index',
        ...calcIndex(oilGasStocks, MARKET_INDEX_BASE_VALUES['NGX Oil & Gas Index']),
      },
      {
        name: 'NGX Industrial Index',
        ...calcIndex(industrialStocks, MARKET_INDEX_BASE_VALUES['NGX Industrial Index']),
      },
      {
        name: 'NGX Insurance Index',
        ...calcIndex(insuranceStocks, MARKET_INDEX_BASE_VALUES['NGX Insurance Index']),
      },
    ],
  };
}

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const { limits, isPremium, tier } = useSubscription();
  
  const refreshInterval = limits.refreshInterval;
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
    return <MarketingLandingPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isPremium 
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent' 
                : 'text-gray-900 dark:text-white'
            }`}>
              Market Overview
            </h1>
            {isPremium && <PremiumBadge size="sm" />}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isPremium 
                ? 'bg-amber-500/20 border border-amber-500/30' 
                : 'bg-green-100 dark:bg-green-900/40'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isPremium ? 'bg-amber-400' : 'bg-green-500'}`} />
              <span className={`text-xs font-medium ${
                isPremium ? 'text-amber-400' : 'text-green-700 dark:text-green-400'
              }`}>
                {isPremium ? '1min Live' : 'Live'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Last update: {formatLastUpdate(lastRefresh)}</span>
            </div>
            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                isPremium 
                  ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20' 
                  : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              {isPremium ? <Zap size={14} className={isLoading ? 'animate-pulse' : ''} /> : <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              {isPremium ? 'Ultra Refresh' : 'Refresh'}
            </button>
          </div>
        </div>
        <SearchBar />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">Failed to load stock data</p>
            <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
          </div>
          <button
            onClick={() => refresh()}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <section className="mb-6">
        <MarketHours />
      </section>

      <section className="mb-8">
        <MarketOverview summary={marketSummary} />
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Gainers</h2>
          <Link
            href="/stocks?sort=gainers"
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <StockGridSkeleton count={4} />
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
          <Link
            href="/stocks?sort=losers"
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <StockGridSkeleton count={4} />
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
          <Link
            href="/stocks?sort=volume"
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <StockGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostActive.map((stock) => (
              <StockCard key={stock.symbol} stock={stock as Stock} showDetails />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <MarketBuzzX />
      </section>

    </div>
  );
}
