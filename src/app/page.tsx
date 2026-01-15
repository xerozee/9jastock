'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Market Overview
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/40 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Clock size={14} />
            <span>Last update: {formatLastUpdate(lastRefresh)}</span>
          </div>
        </div>
        <SearchBar />
      </div>

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
          <Link
            href="/stocks?sort=losers"
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
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
          <Link
            href="/stocks?sort=volume"
            className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
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

    </div>
  );
}
