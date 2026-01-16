'use client';

import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowUp, ArrowDown, Zap, Radio } from 'lucide-react';
import { MarketSummary } from '@/types/stock';
import { formatCurrency, formatVolume } from '@/lib/stockData';

interface MarketOverviewProps {
  summary: MarketSummary;
}

export default function MarketOverview({ summary }: MarketOverviewProps) {
  const totalStocks = summary.advancers + summary.decliners + summary.unchanged;
  const advancerPercent = totalStocks > 0 ? (summary.advancers / totalStocks) * 100 : 0;
  const declinerPercent = totalStocks > 0 ? (summary.decliners / totalStocks) * 100 : 0;
  const unchangedPercent = totalStocks > 0 ? (summary.unchanged / totalStocks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Cap */}
        <div className="scifi-card group">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.2)]">
                <BarChart3 size={20} className="text-[var(--accent-secondary)]" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">Market Cap</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {formatCurrency(summary.totalMarketCap)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 uppercase tracking-wide">Total value</p>
          </div>
        </div>

        {/* Volume */}
        <div className="scifi-card group">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-[rgba(255,0,255,0.15)] border border-[rgba(255,0,255,0.2)]">
                <Activity size={20} className="text-[var(--accent-tertiary)]" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">Volume</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {formatVolume(summary.totalVolume)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 uppercase tracking-wide">Shares traded</p>
          </div>
        </div>

        {/* Gainers */}
        <div className="scifi-card group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,200,0.05)] to-transparent" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-[rgba(0,255,200,0.15)] border border-[rgba(0,255,200,0.3)]">
                <ArrowUp size={20} className="text-[var(--stock-up)]" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--stock-up)] uppercase tracking-widest">Gainers</span>
            </div>
            <p className="text-3xl font-bold text-[var(--stock-up)] neon-text-subtle">{summary.advancers}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="h-1.5 bg-[var(--muted)] rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--stock-up)] to-[var(--accent-secondary)] rounded-full transition-all duration-500 shadow-[0_0_10px_var(--glow-primary)]"
                  style={{ width: `${advancerPercent}%` }}
                />
              </div>
              <span className="text-sm text-[var(--stock-up)] font-bold">{advancerPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Losers */}
        <div className="scifi-card group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,51,102,0.05)] to-transparent" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-[rgba(255,51,102,0.15)] border border-[rgba(255,51,102,0.3)]">
                <ArrowDown size={20} className="text-[var(--stock-down)]" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--stock-down)] uppercase tracking-widest">Losers</span>
            </div>
            <p className="text-3xl font-bold text-[var(--stock-down)]" style={{ textShadow: '0 0 10px rgba(255,51,102,0.5)' }}>{summary.decliners}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="h-1.5 bg-[var(--muted)] rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--stock-down)] to-[#ff6b9d] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,51,102,0.5)]"
                  style={{ width: `${declinerPercent}%` }}
                />
              </div>
              <span className="text-sm text-[var(--stock-down)] font-bold">{declinerPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="scifi-card">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)]">
                  <Zap size={20} className="text-[var(--accent-foreground)]" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  Market Indices
                  <Radio size={14} className="text-[var(--accent)] animate-pulse" />
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">Live performance tracking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {summary.indices.map((index, i) => {
            const isPositive = index.change >= 0;
            return (
              <div
                key={index.name}
                className="p-4 border-b border-r border-[var(--border)] last:border-r-0 md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 hover:bg-[rgba(0,255,200,0.02)] transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] truncate uppercase tracking-wide">{index.name}</p>
                    <p className="text-xl font-bold text-[var(--foreground)] mt-1 tracking-tight group-hover:text-[var(--accent)] transition-colors">
                      {index.value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded ${
                      isPositive ? 'stock-badge-up' : 'stock-badge-down'
                    }`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span className="text-xs font-bold">
                        {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-[var(--stock-up)]' : 'text-[var(--stock-down)]'}`}>
                      {isPositive ? '+' : ''}{index.change.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Breadth */}
      <div className="scifi-card">
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            Market Breadth
          </h3>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <div className="flex rounded-lg overflow-hidden h-10 border border-[var(--border)]">
                <div
                  className="bg-gradient-to-r from-[var(--stock-up)] to-[#00e6b8] flex items-center justify-center transition-all duration-700 relative"
                  style={{ width: `${advancerPercent}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] animate-[holoShine_2s_ease-in-out_infinite]" />
                  {advancerPercent > 15 && (
                    <span className="text-sm font-bold text-[var(--foreground)] relative z-10">{summary.advancers}</span>
                  )}
                </div>
                <div
                  className="bg-[var(--muted)] flex items-center justify-center transition-all duration-700"
                  style={{ width: `${unchangedPercent}%` }}
                >
                  {unchangedPercent > 10 && (
                    <span className="text-sm font-bold text-[var(--muted-foreground)]">{summary.unchanged}</span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-[var(--stock-down)] to-[#ff6b9d] flex items-center justify-center transition-all duration-700 relative"
                  style={{ width: `${declinerPercent}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] animate-[holoShine_2s_ease-in-out_infinite]" />
                  {declinerPercent > 15 && (
                    <span className="text-sm font-bold text-[var(--foreground)] relative z-10">{summary.decliners}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-[var(--stock-up)] to-[#00e6b8] shadow-[0_0_10px_var(--glow-primary)]" />
                <span className="font-medium text-[var(--stock-up)]">{summary.advancers} Gainers</span>
                <span className="text-[var(--muted-foreground)]">({advancerPercent.toFixed(1)}%)</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[var(--muted)]" />
                <span className="font-medium text-[var(--muted-foreground)]">{summary.unchanged} Unchanged</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-[var(--stock-down)] to-[#ff6b9d] shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
                <span className="font-medium text-[var(--stock-down)]">{summary.decliners} Losers</span>
                <span className="text-[var(--muted-foreground)]">({declinerPercent.toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
