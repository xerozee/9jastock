'use client';

import Link from 'next/link';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';
import StockTable from '@/components/StockTable';
import StockCard from '@/components/StockCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWatchlist } from '@/lib/watchlistContext';
import { getStocksBySymbols } from '@/lib/stockData';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const watchlistStocks = getStocksBySymbols(watchlist);

  return (
    <ProtectedRoute>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Star className="text-yellow-500" size={32} fill="currentColor" />
          <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
        </div>
        <p className="text-gray-600">
          Track your favorite Nigerian stocks in one place
        </p>
      </div>

      {watchlistStocks.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {watchlistStocks.slice(0, 4).map((stock) => (
              <StockCard key={stock.symbol} stock={stock} showDetails />
            ))}
          </div>

          {/* Full Table */}
          <StockTable stocks={watchlistStocks} title={`Watchlist (${watchlistStocks.length} stocks)`} />

          {/* Performance Summary */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Watchlist Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Gainers</p>
                <p className="text-2xl font-bold text-green-600">
                  {watchlistStocks.filter((s) => s.change > 0).length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">Losers</p>
                <p className="text-2xl font-bold text-red-600">
                  {watchlistStocks.filter((s) => s.change < 0).length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Unchanged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {watchlistStocks.filter((s) => s.change === 0).length}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-yellow-500" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start building your watchlist by clicking the star icon on any stock you want to track.
            </p>
            <Link
              href="/stocks"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <TrendingUp size={18} className="mr-2" />
              Browse Stocks
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
