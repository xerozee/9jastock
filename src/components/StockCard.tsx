'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Star, Activity } from 'lucide-react';
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
    <div className="scifi-card group">
      {/* Holographic shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,255,200,0.05)] to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      <div className="relative p-5">
        {/* Header with symbol and trend indicator */}
        <div className="flex items-start justify-between mb-4">
          <Link href={`/stocks/${stock.symbol}`} className="flex-1">
            <div className="flex items-center gap-3">
              {/* Stock Symbol with glow */}
              <div className="relative">
                <span className="text-xl font-bold tracking-wider text-white">
                  {stock.symbol}
                </span>
                <div className={`absolute -bottom-1 left-0 right-0 h-[2px] ${
                  isPositive ? 'bg-[var(--stock-up)]' : 'bg-[var(--stock-down)]'
                } opacity-50`} />
              </div>

              {/* Trend Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                  isPositive
                    ? 'stock-badge-up'
                    : 'stock-badge-down'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] truncate mt-2 font-medium">
              {stock.name}
            </p>
          </Link>

          {/* Watchlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWatchlist(stock.symbol);
            }}
            className={`relative p-2.5 rounded-lg transition-all duration-300 ${
              inWatchlist
                ? 'text-[var(--accent-warning)] bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.3)] shadow-[0_0_15px_rgba(255,170,0,0.3)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[rgba(0,255,200,0.1)] border border-transparent hover:border-[rgba(0,255,200,0.2)]'
            }`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={18} fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Price Display */}
        <Link href={`/stocks/${stock.symbol}`}>
          <div className="flex items-end justify-between">
            <div>
              {/* Main Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {formatCurrency(stock.price)}
                </span>
                <Activity size={16} className={`${isPositive ? 'text-[var(--stock-up)]' : 'text-[var(--stock-down)]'} animate-pulse`} />
              </div>

              {/* Change Amount */}
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'stock-up' : 'stock-down'
                }`}
              >
                {isPositive ? '+' : ''}{formatCurrency(stock.change)}
              </span>
            </div>

            {showDetails && (
              <div className="text-right space-y-1">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                  <span className="opacity-70">Vol:</span>{' '}
                  <span className="text-white font-medium">{formatVolume(stock.volume)}</span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                  <span className="opacity-70">MCap:</span>{' '}
                  <span className="text-white font-medium">{formatCurrency(stock.marketCap)}</span>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">Sector</span>
              <p className="text-sm font-medium text-[var(--accent-secondary)]">{stock.sector}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">P/E Ratio</span>
              <p className="text-sm font-medium text-white">{stock.pe?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-4 right-4 h-[1px] ${
          isPositive
            ? 'bg-gradient-to-r from-transparent via-[var(--stock-up)] to-transparent'
            : 'bg-gradient-to-r from-transparent via-[var(--stock-down)] to-transparent'
        } opacity-30`} />
      </div>
    </div>
  );
}
