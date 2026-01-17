'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Star, Crown, X } from 'lucide-react';
import { Stock } from '@/types/stock';
import { formatCurrency, formatVolume } from '@/lib/stockData';
import { useWatchlist } from '@/lib/watchlistContext';

interface StockCardProps {
  stock: Stock;
  showDetails?: boolean;
}

export default function StockCard({ stock, showDetails = false }: StockCardProps) {
  const { isInWatchlist, toggleWatchlist, maxItems } = useWatchlist();
  const [showLimitToast, setShowLimitToast] = useState(false);
  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  const handleToggleWatchlist = () => {
    const result = toggleWatchlist(stock.symbol);
    if (result.limitReached) {
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 4000);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:-translate-y-1"
      style={{ transform: 'perspective(1000px)', transformStyle: 'preserve-3d' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/stocks/${stock.symbol}`} className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stock.symbol}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold shadow-sm ${
                  isPositive
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                }`}
              >
                {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 truncate mt-1">{stock.name}</p>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleWatchlist();
            }}
            className={`p-2 rounded-xl transition-all shadow-sm ${
              inWatchlist
                ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                : 'text-gray-500 dark:text-slate-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-slate-700'
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
                className={`block text-sm font-semibold ${
                  isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{formatCurrency(stock.change)}
              </span>
            </div>
            {showDetails && (
              <div className="text-right text-sm text-gray-600 dark:text-slate-400">
                <p>Vol: {formatVolume(stock.volume)}</p>
                <p>MCap: {formatCurrency(stock.marketCap)}</p>
              </div>
            )}
          </div>
        </Link>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-slate-400 font-medium">Sector</span>
              <p className="font-semibold text-gray-900 dark:text-white">{stock.sector}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-slate-400 font-medium">P/E Ratio</span>
              <p className="font-semibold text-gray-900 dark:text-white">{stock.pe?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      {showLimitToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <Crown className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Watchlist limit reached ({maxItems} stocks)</p>
              <Link href="/pricing" className="text-xs underline hover:no-underline">
                Upgrade to Premium for unlimited
              </Link>
            </div>
            <button onClick={() => setShowLimitToast(false)} className="p-1 hover:bg-amber-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
