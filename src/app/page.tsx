'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import StockCard from '@/components/StockCard';
import StockGridSkeleton from '@/components/StockGridSkeleton';
import LandingPage from '@/components/LandingPage';
import { useLiveStocks, formatLastUpdate } from '@/lib/useLiveStocks';
import { useAuth } from '@/hooks/useAuth';
import { Stock, MarketSummary } from '@/types/stock';
import { MARKET_INDEX_CONFIG, SECTOR_MAPPINGS, REFRESH_INTERVALS } from '@/lib/marketConfig';

function computeMarketSummary(stocks: Stock[]): MarketSummary {
  const advancers = stocks.filter(s => s.changePercent > 0).length;
  const decliners = stocks.filter(s => s.changePercent < 0).length;
  const unchanged = stocks.filter(s => s.changePercent === 0).length;
  const totalMarketCap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);

  const financialStocks = stocks.filter(s => s.sector === SECTOR_MAPPINGS.financial);
  const consumerStocks = stocks.filter(s => s.sector === SECTOR_MAPPINGS.consumer);
  const oilGasStocks = stocks.filter(s => s.sector === SECTOR_MAPPINGS.oilGas);
  const industrialStocks = stocks.filter(s => s.sector === SECTOR_MAPPINGS.industrial);
  const insuranceStocks = stocks.filter(s => s.sector === SECTOR_MAPPINGS.insurance);

  const calcIndex = (sectorStocks: Stock[], baseValue: number) => {
    if (sectorStocks.length === 0) return { value: baseValue, change: 0, changePercent: 0 };
    const avgChange = sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length;
    const change = baseValue * (avgChange / 100);
    return { value: baseValue + change, change, changePercent: avgChange };
  };

  const allShareAvgChange = stocks.length > 0
    ? stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length
    : 0;
  const allShareChange = MARKET_INDEX_CONFIG.allShare.baseValue * (allShareAvgChange / 100);

  return {
    totalMarketCap,
    totalVolume,
    advancers,
    decliners,
    unchanged,
    indices: [
      {
        name: MARKET_INDEX_CONFIG.allShare.name,
        value: MARKET_INDEX_CONFIG.allShare.baseValue + allShareChange,
        change: allShareChange,
        changePercent: allShareAvgChange,
      },
      {
        name: MARKET_INDEX_CONFIG.ngx30.name,
        ...calcIndex(stocks.slice(0, 30), MARKET_INDEX_CONFIG.ngx30.baseValue),
      },
      {
        name: MARKET_INDEX_CONFIG.banking.name,
        ...calcIndex(financialStocks, MARKET_INDEX_CONFIG.banking.baseValue),
      },
      {
        name: MARKET_INDEX_CONFIG.consumerGoods.name,
        ...calcIndex(consumerStocks, MARKET_INDEX_CONFIG.consumerGoods.baseValue),
      },
      {
        name: MARKET_INDEX_CONFIG.oilGas.name,
        ...calcIndex(oilGasStocks, MARKET_INDEX_CONFIG.oilGas.baseValue),
      },
      {
        name: MARKET_INDEX_CONFIG.industrial.name,
        ...calcIndex(industrialStocks, MARKET_INDEX_CONFIG.industrial.baseValue),
      },
      {
        name: MARKET_INDEX_CONFIG.insurance.name,
        ...calcIndex(insuranceStocks, MARKET_INDEX_CONFIG.insurance.baseValue),
      },
    ],
  };
}

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const refreshInterval = isAuthenticated
    ? REFRESH_INTERVALS.authenticated
    : REFRESH_INTERVALS.guest;
  const { stocks, isLoading, error, refresh, lastRefresh } = useLiveStocks(refreshInterval);

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
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Last update: {formatLastUpdate(lastRefresh)}</span>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh stock data"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
        <SearchBar />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Failed to load stock data
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}. Showing cached data if available.
            </p>
            <button
              onClick={refresh}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

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
          <StockGridSkeleton />
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
          <StockGridSkeleton />
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
          <StockGridSkeleton />
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
