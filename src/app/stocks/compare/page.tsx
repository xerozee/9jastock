'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X, Plus, BarChart3, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumGate from '@/components/PremiumGate';
import { useLiveStocks } from '@/lib/useLiveStocks';
import { Stock } from '@/types/stock';

const COMPARE_METRICS = [
  { key: 'price', label: 'Price', format: 'currency' },
  { key: 'changePercent', label: 'Change %', format: 'percent' },
  { key: 'marketCap', label: 'Market Cap', format: 'large' },
  { key: 'volume', label: 'Volume', format: 'large' },
  { key: 'pe', label: 'P/E Ratio', format: 'number' },
  { key: 'eps', label: 'EPS', format: 'currency' },
  { key: 'dividendYield', label: 'Dividend Yield', format: 'percentValue' },
  { key: 'roe', label: 'ROE', format: 'percentValue' },
  { key: 'roa', label: 'ROA', format: 'percentValue' },
  { key: 'debtToEquity', label: 'Debt/Equity', format: 'number' },
  { key: 'currentRatio', label: 'Current Ratio', format: 'number' },
  { key: 'grossMargin', label: 'Gross Margin', format: 'marginPercent' },
  { key: 'netMargin', label: 'Net Margin', format: 'marginPercent' },
  { key: 'rsi', label: 'RSI (14)', format: 'number' },
  { key: 'high52Week', label: '52W High', format: 'currency' },
  { key: 'low52Week', label: '52W Low', format: 'currency' },
  { key: 'perfWeek', label: '1W Performance', format: 'percentValue' },
  { key: 'perfMonth', label: '1M Performance', format: 'percentValue' },
  { key: 'perfYear', label: '1Y Performance', format: 'percentValue' },
  { key: 'beta', label: 'Beta', format: 'number' },
] as const;

function formatMetricValue(value: unknown, format: string): string {
  if (value === undefined || value === null) return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';

  switch (format) {
    case 'currency':
      return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent':
      return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    case 'percentValue':
      return `${num.toFixed(2)}%`;
    case 'marginPercent':
      return `${(num * 100).toFixed(2)}%`;
    case 'large':
      if (num >= 1e12) return `₦${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `₦${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `₦${(num / 1e6).toFixed(2)}M`;
      return num.toLocaleString();
    case 'number':
      return num.toFixed(2);
    default:
      return String(value);
  }
}

function getBestValue(values: (number | undefined | null)[], metric: string): number | null {
  const valid = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (valid.length === 0) return null;
  
  const higherBetter = ['changePercent', 'dividendYield', 'roe', 'roa', 'currentRatio', 'grossMargin', 'netMargin', 'perfWeek', 'perfMonth', 'perfYear', 'eps'];
  const lowerBetter = ['pe', 'debtToEquity'];
  
  if (higherBetter.includes(metric)) return Math.max(...valid);
  if (lowerBetter.includes(metric)) return Math.min(...valid.filter(v => v > 0));
  return null;
}

export default function StockComparePage() {
  const { isPremium, limits } = useSubscription();
  const { stocks } = useLiveStocks(limits.refreshInterval);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return stocks
      .filter(s => 
        (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) &&
        !selectedSymbols.includes(s.symbol)
      )
      .slice(0, 8);
  }, [searchQuery, stocks, selectedSymbols]);

  const selectedStocks = useMemo(() => 
    selectedSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean) as Stock[],
    [selectedSymbols, stocks]
  );

  function addStock(symbol: string) {
    if (selectedSymbols.length < 4 && !selectedSymbols.includes(symbol)) {
      setSelectedSymbols(prev => [...prev, symbol]);
    }
    setSearchQuery('');
    setShowSearch(false);
  }

  function removeStock(symbol: string) {
    setSelectedSymbols(prev => prev.filter(s => s !== symbol));
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/stocks" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 text-sm mb-4">
            <ArrowLeft size={16} className="mr-1" /> Back to Stocks
          </Link>
          <div className="flex items-center gap-3">
            <Scale className="text-emerald-500" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Compare Stocks</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Select up to 4 stocks to compare side by side</p>
            </div>
          </div>
        </div>

        {!isPremium ? (
          <PremiumGate
            title="Stock Comparison Tool"
            description="Upgrade to Premium to compare stocks side-by-side with comprehensive metrics."
            features={["Compare up to 4 stocks", "20+ financial metrics", "Performance comparison", "Valuation ratios", "Technical indicators", "Risk metrics"]}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              {selectedStocks.map(stock => (
                <div key={stock.symbol} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{stock.symbol}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{stock.name}</span>
                  </div>
                  <button onClick={() => removeStock(stock.symbol)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}

              {selectedSymbols.length < 4 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors text-sm"
                  >
                    <Plus size={16} /> Add Stock
                  </button>

                  {showSearch && (
                    <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50">
                      <div className="p-3">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search stocks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                          />
                        </div>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border-t border-gray-100 dark:border-slate-700">
                          {searchResults.map(stock => (
                            <button
                              key={stock.symbol}
                              onClick={() => addStock(stock.symbol)}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                            >
                              <div>
                                <span className="font-medium text-sm text-gray-900 dark:text-white">{stock.symbol}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{stock.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">₦{stock.price.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedStocks.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select stocks to compare</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Add Stock" above to start comparing NGX stocks side-by-side</p>
              </div>
            ) : selectedStocks.length === 1 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Add at least one more stock to begin comparison</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-40">Metric</th>
                      {selectedStocks.map(stock => (
                        <th key={stock.symbol} className="px-4 py-3 text-center">
                          <Link href={`/stocks/${stock.symbol}`} className="hover:text-emerald-600 transition-colors">
                            <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">{stock.name}</p>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_METRICS.map((metric, idx) => {
                      const values = selectedStocks.map(s => (s as Record<string, unknown>)[metric.key] as number | undefined);
                      const bestVal = getBestValue(values, metric.key);
                      return (
                        <tr key={metric.key} className={`border-b border-gray-50 dark:border-slate-700/50 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-slate-700/20' : ''}`}>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{metric.label}</td>
                          {selectedStocks.map(stock => {
                            const val = (stock as Record<string, unknown>)[metric.key] as number | undefined;
                            const isBest = bestVal !== null && val !== undefined && val !== null && val === bestVal;
                            const formatted = formatMetricValue(val, metric.format);
                            return (
                              <td key={stock.symbol} className={`px-4 py-3 text-center font-medium ${
                                isBest ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-900 dark:text-white'
                              } ${metric.key === 'changePercent' && val !== undefined && val !== null ? (val >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                                {formatted}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
