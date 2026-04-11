'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Filter, Search, ArrowUpDown, TrendingUp, TrendingDown, X, SlidersHorizontal } from 'lucide-react';
import { Stock } from '@/types/stock';

interface StockScreenerProps {
  stocks: Stock[];
}

type SortKey = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'pe' | 'dividendYield' | 'roe';

const SECTORS = [
  'All Sectors',
  'Financial Services',
  'Consumer Goods',
  'Industrial Goods',
  'Oil & Gas',
  'Insurance',
  'Healthcare',
  'Agriculture',
  'Technology',
  'Services',
  'Construction',
  'Natural Resources',
  'Conglomerates',
  'Utilities',
  'ICT',
];

export default function StockScreener({ stocks }: StockScreenerProps) {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All Sectors');
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minYield, setMinYield] = useState('');
  const [maxPE, setMaxPE] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [changeFilter, setChangeFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  const filtered = useMemo(() => {
    let result = [...stocks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }

    if (sector !== 'All Sectors') {
      result = result.filter(s => s.sector === sector);
    }

    if (changeFilter === 'gainers') result = result.filter(s => s.changePercent > 0);
    if (changeFilter === 'losers') result = result.filter(s => s.changePercent < 0);

    if (minYield) {
      const min = parseFloat(minYield);
      if (!isNaN(min)) result = result.filter(s => (s.dividendYield || 0) >= min);
    }

    if (maxPE) {
      const max = parseFloat(maxPE);
      if (!isNaN(max)) result = result.filter(s => s.pe && s.pe > 0 && s.pe <= max);
    }

    if (minVolume) {
      const min = parseFloat(minVolume);
      if (!isNaN(min)) result = result.filter(s => s.volume >= min * 1000);
    }

    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey] as number || 0;
      const bVal = (b as Record<string, unknown>)[sortKey] as number || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [stocks, search, sector, sortKey, sortAsc, minYield, maxPE, minVolume, changeFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const activeFilters = [
    sector !== 'All Sectors' ? sector : null,
    changeFilter !== 'all' ? changeFilter : null,
    minYield ? `Yield ≥ ${minYield}%` : null,
    maxPE ? `P/E ≤ ${maxPE}` : null,
    minVolume ? `Vol ≥ ${minVolume}K` : null,
  ].filter(Boolean);

  function clearFilters() {
    setSector('All Sectors');
    setChangeFilter('all');
    setMinYield('');
    setMaxPE('');
    setMinVolume('');
  }

  function formatLargeNum(v: number): string {
    if (v >= 1e12) return `₦${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `₦${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `₦${(v / 1e6).toFixed(1)}M`;
    return v.toLocaleString();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
        >
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition-colors ${
            showFilters || activeFilters.length > 0
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilters.length > 0 && (
            <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{activeFilters.length}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Performance</label>
              <select
                value={changeFilter}
                onChange={(e) => setChangeFilter(e.target.value as 'all' | 'gainers' | 'losers')}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
              >
                <option value="all">All</option>
                <option value="gainers">Gainers only</option>
                <option value="losers">Losers only</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Div. Yield %</label>
              <input
                type="number"
                placeholder="e.g. 3"
                value={minYield}
                onChange={(e) => setMinYield(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max P/E Ratio</label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={maxPE}
                onChange={(e) => setMaxPE(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Volume (K)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={minVolume}
                onChange={(e) => setMinVolume(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
              />
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <span className="text-xs text-gray-500">Active:</span>
              {activeFilters.map(f => (
                <span key={f} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                  {f}
                </span>
              ))}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 ml-auto">Clear all</button>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {filtered.length} stock{filtered.length !== 1 ? 's' : ''} found
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              {[
                { key: 'symbol' as SortKey, label: 'Stock' },
                { key: 'price' as SortKey, label: 'Price' },
                { key: 'changePercent' as SortKey, label: 'Change' },
                { key: 'volume' as SortKey, label: 'Volume' },
                { key: 'marketCap' as SortKey, label: 'Market Cap' },
                { key: 'pe' as SortKey, label: 'P/E' },
                { key: 'dividendYield' as SortKey, label: 'Yield' },
              ].map(col => (
                <th key={col.key} className={`px-4 py-3 ${col.key === 'symbol' ? 'text-left' : 'text-right'}`}>
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {col.label} <ArrowUpDown size={12} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s) => {
              const isPos = s.changePercent >= 0;
              return (
                <tr key={s.symbol} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/stocks/${s.symbol}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <span className="font-semibold text-gray-900 dark:text-white">{s.symbol}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{s.name}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    ₦{s.price.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isPos ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                    {s.volume >= 1000 ? `${(s.volume / 1000).toFixed(0)}K` : s.volume}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">
                    {formatLargeNum(s.marketCap)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                    {s.pe ? s.pe.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className={(s.dividendYield || 0) >= 5 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                      {s.dividendYield ? `${s.dividendYield.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <div className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-700">
            Showing first 50 of {filtered.length} results
          </div>
        )}
      </div>
    </div>
  );
}
