'use client';

import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowUp, ArrowDown, Minus, Zap } from 'lucide-react';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Market Cap</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalMarketCap)}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Total value</p>
        </div>

        <div className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <Activity size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Volume</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatVolume(summary.totalVolume)}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Shares traded</p>
        </div>

        <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800/50 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-xl">
              <ArrowUp size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Gainers</span>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.advancers}</p>
          <div className="flex items-center mt-1">
            <div className="h-1.5 bg-green-200 dark:bg-green-800 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500" style={{ width: `${advancerPercent}%` }} />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 ml-2 font-medium">{advancerPercent.toFixed(0)}%</span>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-5 border border-red-100 dark:border-red-800/50 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-xl">
              <ArrowDown size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Losers</span>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.decliners}</p>
          <div className="flex items-center mt-1">
            <div className="h-1.5 bg-red-200 dark:bg-red-800 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-red-500 dark:bg-red-400 rounded-full transition-all duration-500" style={{ width: `${declinerPercent}%` }} />
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 ml-2 font-medium">{declinerPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Market Indices</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Live performance tracking</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-gray-100 dark:bg-slate-700">
          {summary.indices.map((index, i) => {
            const isPositive = index.change >= 0;
            const isFirst = i === 0;
            return (
              <div
                key={index.name}
                className={`bg-white dark:bg-slate-800 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isFirst ? 'lg:col-span-1' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{index.name}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {index.value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`text-right ml-3 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="text-sm font-bold">
                        {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs mt-1">
                      {isPositive ? '+' : ''}{index.change.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Market Breadth</h3>
        <div className="space-y-3">
          <div className="flex rounded-xl overflow-hidden h-8">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${advancerPercent}%` }}
            >
              {advancerPercent > 15 && (
                <span className="text-xs font-bold text-white">{summary.advancers}</span>
              )}
            </div>
            <div
              className="bg-gray-300 dark:bg-slate-600 flex items-center justify-center transition-all duration-500"
              style={{ width: `${unchangedPercent}%` }}
            >
              {unchangedPercent > 10 && (
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{summary.unchanged}</span>
              )}
            </div>
            <div
              className="bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${declinerPercent}%` }}
            >
              {declinerPercent > 15 && (
                <span className="text-xs font-bold text-white">{summary.decliners}</span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
              <span className="font-medium">{summary.advancers} Gainers</span>
              <span className="text-gray-400 dark:text-slate-500">({advancerPercent.toFixed(1)}%)</span>
            </span>
            <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span className="font-medium">{summary.unchanged} Unchanged</span>
            </span>
            <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
              <span className="font-medium">{summary.decliners} Losers</span>
              <span className="text-gray-400 dark:text-slate-500">({declinerPercent.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
