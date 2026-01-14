'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import StockCard from '@/components/StockCard';
import { useLiveStocks, formatLastUpdate } from '@/lib/useLiveStocks';
import { getMarketSummary } from '@/lib/stockData';
import { Stock } from '@/types/stock';

// 30 minutes in milliseconds
const REFRESH_INTERVAL = 30 * 60 * 1000;

export default function Dashboard() {
  const { stocks, isLoading, error, liveCount, refresh, lastRefresh } = useLiveStocks(REFRESH_INTERVAL);
  const marketSummary = getMarketSummary();

  // Calculate top gainers, losers, most active from live data
  const topGainers = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  const topLosers = [...stocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 4);

  const mostActive = [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to 9jaStock
          </h1>
          <p className="text-green-100 text-lg mb-6">
            Track Nigerian Stock Exchange (NGX) stocks in real-time. Monitor market performance,
            discover opportunities, and build your watchlist.
          </p>
          <SearchBar />
        </div>
      </div>

      {/* Live Data Status Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {liveCount > 0 ? (
                <>
                  <Wifi className="text-green-500" size={20} />
                  <span className="text-sm font-medium text-green-600">
                    {liveCount} stocks with live data
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="text-orange-500" size={20} />
                  <span className="text-sm font-medium text-orange-600">
                    Using cached data
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} />
              <span className="text-sm">
                Last update: {formatLastUpdate(lastRefresh)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Auto-refresh: every 30 minutes
            </span>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
            {error} - Showing cached data
          </div>
        )}
      </div>

      {/* Market Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Overview</h2>
        <MarketOverview summary={marketSummary} />
      </section>

      {/* Top Gainers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Top Gainers</h2>
          <Link
            href="/stocks?sort=gainers"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-40 rounded-xl" />
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

      {/* Top Losers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Top Losers</h2>
          <Link
            href="/stocks?sort=losers"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-40 rounded-xl" />
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

      {/* Most Active */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Most Active</h2>
          <Link
            href="/stocks?sort=volume"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-40 rounded-xl" />
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

      {/* Stats */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stocks.length}</div>
            <div className="text-sm text-gray-500">Total Stocks</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{liveCount}</div>
            <div className="text-sm text-gray-500">Live Data</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stocks.filter(s => s.changePercent > 0).length}
            </div>
            <div className="text-sm text-gray-500">Gainers</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stocks.filter(s => s.changePercent < 0).length}
            </div>
            <div className="text-sm text-gray-500">Losers</div>
          </div>
        </div>
      </section>
    </div>
  );
}
