'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import StockChart from '@/components/StockChart';
import { useWatchlist } from '@/lib/watchlistContext';
import {
  getStockBySymbol,
  generateHistoricalData,
  formatCurrency,
  formatVolume,
} from '@/lib/stockData';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const stock = getStockBySymbol(symbol);

  if (!stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stock Not Found</h1>
          <p className="text-gray-600 mb-6">
            The stock with symbol &quot;{symbol}&quot; could not be found.
          </p>
          <Link
            href="/stocks"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to all stocks
          </Link>
        </div>
      </div>
    );
  }

  const historicalData = generateHistoricalData(stock.price);
  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back
      </button>

      {/* Stock Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {stock.sector}
              </span>
              <button
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`p-2 rounded-lg transition-colors ${
                  inWatchlist
                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                }`}
                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Star size={20} fill={inWatchlist ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-lg text-gray-600">{stock.name}</p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {formatCurrency(stock.price)}
            </div>
            <div
              className={`inline-flex items-center text-lg ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? (
                <TrendingUp size={20} className="mr-1" />
              ) : (
                <TrendingDown size={20} className="mr-1" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <StockChart data={historicalData} symbol={stock.symbol} />
      </div>

      {/* Stock Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trading Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stock.open)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Previous Close</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stock.previousClose)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Day High</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(stock.high)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Day Low</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(stock.low)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">52-Week High</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(stock.high52Week)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">52-Week Low</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(stock.low52Week)}</p>
            </div>
          </div>
        </div>

        {/* Market Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-lg font-semibold text-gray-900">{formatVolume(stock.volume)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stock.marketCap)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">P/E Ratio</p>
              <p className="text-lg font-semibold text-gray-900">{stock.pe?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">EPS</p>
              <p className="text-lg font-semibold text-gray-900">
                {stock.eps ? formatCurrency(stock.eps) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg col-span-2">
              <p className="text-sm text-gray-500">Dividend</p>
              <p className="text-lg font-semibold text-gray-900">
                {stock.dividend ? formatCurrency(stock.dividend) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">External Resources</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://ngxgroup.com/exchange/data/equity-data/company-listed/${stock.symbol.toLowerCase()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            View on NGX
          </a>
          <a
            href={`https://www.google.com/finance/quote/${stock.symbol}:NGX`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            Google Finance
          </a>
        </div>
      </div>
    </div>
  );
}
