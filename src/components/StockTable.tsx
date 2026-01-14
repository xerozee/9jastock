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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Volume
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Market Cap
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Watch
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const inWatchlist = isInWatchlist(stock.symbol);

              return (
                <tr
                  key={stock.symbol}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      className="text-gray-500 hover:text-gray-700 transition-colors truncate block max-w-[200px]"
                    >
                      {stock.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(stock.price)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={`inline-flex items-center ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={14} className="mr-1" />
                      ) : (
                        <TrendingDown size={14} className="mr-1" />
                      )}
                      <span className="font-medium">
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-500 hidden md:table-cell">
                    {formatVolume(stock.volume)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-500 hidden lg:table-cell">
                    {formatCurrency(stock.marketCap)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleWatchlist(stock.symbol)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        inWatchlist
                          ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                      }`}
                    >
                      <Star size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
                    </button>
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
