'use client';

import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { MarketSummary } from '@/types/stock';
import { formatCurrency, formatVolume } from '@/lib/stockData';

interface MarketOverviewProps {
  summary: MarketSummary;
}

export default function MarketOverview({ summary }: MarketOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <BarChart3 size={18} />
            <span className="text-sm">Market Cap</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(summary.totalMarketCap)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <Activity size={18} />
            <span className="text-sm">Total Volume</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatVolume(summary.totalVolume)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <ArrowUp size={18} />
            <span className="text-sm">Advancers</span>
          </div>
          <p className="text-xl font-bold text-green-600">{summary.advancers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <ArrowDown size={18} />
            <span className="text-sm">Decliners</span>
          </div>
          <p className="text-xl font-bold text-red-600">{summary.decliners}</p>
        </div>
      </div>

      {/* Market Indices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Indices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.indices.map((index) => {
            const isPositive = index.change >= 0;
            return (
              <div
                key={index.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{index.name}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {index.value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="text-sm font-medium">
                      {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-sm">
                    {isPositive ? '+' : ''}{index.change.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Breadth */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Breadth</h3>
        <div className="flex items-center space-x-2">
          <div
            className="h-4 bg-green-500 rounded-l"
            style={{
              width: `${(summary.advancers / (summary.advancers + summary.decliners + summary.unchanged)) * 100}%`,
            }}
          />
          <div
            className="h-4 bg-gray-400"
            style={{
              width: `${(summary.unchanged / (summary.advancers + summary.decliners + summary.unchanged)) * 100}%`,
            }}
          />
          <div
            className="h-4 bg-red-500 rounded-r"
            style={{
              width: `${(summary.decliners / (summary.advancers + summary.decliners + summary.unchanged)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="flex items-center text-green-600">
            <ArrowUp size={14} className="mr-1" />
            {summary.advancers} Gainers
          </span>
          <span className="flex items-center text-gray-500">
            <Minus size={14} className="mr-1" />
            {summary.unchanged} Unchanged
          </span>
          <span className="flex items-center text-red-600">
            <ArrowDown size={14} className="mr-1" />
            {summary.decliners} Losers
          </span>
        </div>
      </div>
    </div>
  );
}
