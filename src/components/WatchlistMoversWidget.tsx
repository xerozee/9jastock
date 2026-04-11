'use client';

import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useWatchlist } from '@/lib/watchlistContext';
import { Stock } from '@/types/stock';

interface WatchlistMoversWidgetProps {
  stocks: Stock[];
}

export default function WatchlistMoversWidget({ stocks }: WatchlistMoversWidgetProps) {
  const { watchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Watchlist Movers</h3>
        </div>
        <div className="text-center py-6">
          <Star className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No stocks in your watchlist</p>
          <Link href="/stocks" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
            Browse stocks to add
          </Link>
        </div>
      </div>
    );
  }

  const watchlistStocks = stocks
    .filter(s => watchlist.includes(s.symbol))
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

  if (watchlistStocks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Watchlist Movers</h3>
        </div>
        <Link
          href="/watchlist"
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {watchlistStocks.map((stock) => {
          const isPositive = stock.changePercent >= 0;
          return (
            <Link
              key={stock.symbol}
              href={`/stocks/${stock.symbol}`}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {stock.symbol}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
              </div>
              <div className="text-right ml-3">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  ₦{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`ml-3 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
