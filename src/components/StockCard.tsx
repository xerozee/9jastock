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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-200 overflow-hidden card-hover">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/stocks/${stock.symbol}`} className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stock.symbol}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                  isPositive
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                }`}
              >
                {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-1">{stock.name}</p>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWatchlist(stock.symbol);
            }}
            className={`p-2 rounded-xl transition-all ${
              inWatchlist
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
                : 'text-gray-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={18} fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        <Link href={`/stocks/${stock.symbol}`}>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stock.price)}
              </span>
              <span
                className={`block text-sm font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{formatCurrency(stock.change)}
              </span>
            </div>
            {showDetails && (
              <div className="text-right text-sm text-gray-500 dark:text-slate-400">
                <p>Vol: {formatVolume(stock.volume)}</p>
                <p>MCap: {formatCurrency(stock.marketCap)}</p>
              </div>
            )}
          </div>
        </Link>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-slate-400">Sector</span>
              <p className="font-medium text-gray-900 dark:text-white">{stock.sector}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-slate-400">P/E Ratio</span>
              <p className="font-medium text-gray-900 dark:text-white">{stock.pe?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
