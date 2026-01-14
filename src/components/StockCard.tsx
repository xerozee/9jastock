'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Stock } from '@/types/stock';
import { formatCurrency, formatVolume } from '@/lib/stockData';
import { useWatchlist } from '@/lib/watchlistContext';

interface StockCardProps {
  stock: Stock;
  showDetails?: boolean;
}

export default function StockCard({ stock, showDetails = false }: StockCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/stocks/${stock.symbol}`} className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{stock.symbol}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isPositive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">{stock.name}</p>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWatchlist(stock.symbol);
            }}
            className={`p-2 rounded-lg transition-colors ${
              inWatchlist
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
            }`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={18} fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        <Link href={`/stocks/${stock.symbol}`}>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(stock.price)}
              </span>
              <span
                className={`block text-sm ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}{formatCurrency(stock.change)}
              </span>
            </div>
            {showDetails && (
              <div className="text-right text-sm text-gray-500">
                <p>Vol: {formatVolume(stock.volume)}</p>
                <p>MCap: {formatCurrency(stock.marketCap)}</p>
              </div>
            )}
          </div>
        </Link>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Sector</span>
              <p className="font-medium text-gray-900">{stock.sector}</p>
            </div>
            <div>
              <span className="text-gray-500">P/E Ratio</span>
              <p className="font-medium text-gray-900">{stock.pe?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
