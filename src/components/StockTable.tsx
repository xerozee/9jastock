'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Stock } from '@/types/stock';
import { formatCurrency, formatVolume } from '@/lib/stockData';
import { useWatchlist } from '@/lib/watchlistContext';

interface StockTableProps {
  stocks: Stock[];
  title?: string;
}

export default function StockTable({ stocks, title }: StockTableProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Volume
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Market Cap
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const inWatchlist = isInWatchlist(stock.symbol);

              return (
                <tr
                  key={stock.symbol}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-gray-700 dark:text-slate-300 truncate max-w-xs block">
                      {stock.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stock.price)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${
                        isPositive
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-medium text-sm">
                        {isPositive ? '+' : ''}
                        {stock.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <span className="text-gray-600 dark:text-slate-400">{formatVolume(stock.volume)}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className="text-gray-600 dark:text-slate-400">
                      {formatCurrency(stock.marketCap)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => toggleWatchlist(stock.symbol)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          inWatchlist
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-500'
                            : 'bg-gray-100 dark:bg-slate-600 text-gray-400 dark:text-slate-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 hover:text-yellow-500'
                        }`}
                        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Star size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
