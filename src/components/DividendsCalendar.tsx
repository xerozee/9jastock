'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, DollarSign, Filter, Search,
  ChevronDown, ExternalLink, ArrowUpDown, Gift,
  TrendingUp, AlertCircle
} from 'lucide-react';

interface DividendRecord {
  _id: string;
  symbol: string;
  companyName?: string;
  period?: string;
  dividendAmount: number;
  dividendYield?: number;
  dividendType: string;
  bonusShares?: string;
  qualificationDate?: string;
  closureStart?: string;
  closureEnd?: string;
  agmDate?: string;
  paymentDate?: string;
  fiscalYear?: number;
  eDividendRegistrationUrl?: string;
  source?: string;
}

type SortField = 'qualificationDate' | 'paymentDate' | 'dividendAmount' | 'dividendYield' | 'symbol';
type SortOrder = 'asc' | 'desc';
type TimeFilter = 'all' | 'upcoming' | 'thisMonth' | 'thisQuarter' | 'past';

export default function DividendsCalendar() {
  const [dividends, setDividends] = useState<DividendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('qualificationDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchDividends() {
      try {
        setLoading(true);
        const res = await fetch('/api/dividends?limit=200');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDividends(data.dividends || []);
      } catch (err) {
        setError('Failed to load dividend data');
      } finally {
        setLoading(false);
      }
    }
    fetchDividends();
  }, []);

  const now = new Date();

  const filteredDividends = useMemo(() => {
    let filtered = [...dividends];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.symbol.toLowerCase().includes(q) ||
        (d.companyName || '').toLowerCase().includes(q)
      );
    }

    if (timeFilter !== 'all') {
      filtered = filtered.filter(d => {
        const qualDate = d.qualificationDate ? new Date(d.qualificationDate) : null;
        const payDate = d.paymentDate ? new Date(d.paymentDate) : null;
        const refDate = qualDate || payDate;
        if (!refDate) return timeFilter === 'upcoming';

        switch (timeFilter) {
          case 'upcoming':
            return refDate >= now;
          case 'past':
            return refDate < now;
          case 'thisMonth': {
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return refDate >= now && refDate <= monthEnd;
          }
          case 'thisQuarter': {
            const qEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
            return refDate >= now && refDate <= qEnd;
          }
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let valA: string | number, valB: string | number;
      switch (sortField) {
        case 'qualificationDate':
          valA = a.qualificationDate || '9999';
          valB = b.qualificationDate || '9999';
          break;
        case 'paymentDate':
          valA = a.paymentDate || '9999';
          valB = b.paymentDate || '9999';
          break;
        case 'dividendAmount':
          valA = a.dividendAmount || 0;
          valB = b.dividendAmount || 0;
          break;
        case 'dividendYield':
          valA = a.dividendYield || 0;
          valB = b.dividendYield || 0;
          break;
        case 'symbol':
          valA = a.symbol;
          valB = b.symbol;
          break;
        default:
          valA = a.qualificationDate || '9999';
          valB = b.qualificationDate || '9999';
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [dividends, searchQuery, sortField, sortOrder, timeFilter, sectorFilter, now]);

  const stats = useMemo(() => {
    const upcoming = dividends.filter(d => {
      const qd = d.qualificationDate ? new Date(d.qualificationDate) : null;
      return qd && qd >= now;
    });
    const totalYield = upcoming.reduce((sum, d) => sum + (d.dividendYield || 0), 0);
    const avgYield = upcoming.length > 0 ? totalYield / upcoming.length : 0;
    const highestDPS = upcoming.reduce((max, d) => Math.max(max, d.dividendAmount || 0), 0);
    const highestYield = upcoming.reduce((max, d) => Math.max(max, d.dividendYield || 0), 0);

    return { upcoming: upcoming.length, avgYield, highestDPS, highestYield, total: dividends.length };
  }, [dividends, now]);

  function getCountdown(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    if (diff < 0) return 'Passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function getStatusColor(dateStr: string | undefined): string {
    if (!dateStr) return 'text-gray-400';
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-gray-400';
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-amber-500';
    return 'text-emerald-500';
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
          <p className="text-xs text-gray-500">of {stats.total} total</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Avg Yield</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgYield.toFixed(2)}%</p>
          <p className="text-xs text-gray-500">upcoming dividends</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Highest DPS</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{stats.highestDPS.toFixed(2)}</p>
          <p className="text-xs text-gray-500">per share</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Best Yield</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highestYield.toFixed(2)}%</p>
          <p className="text-xs text-gray-500">dividend yield</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by stock name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="past">Past</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-left">
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort('symbol')} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200">
                    Stock <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Period</span>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort('dividendAmount')} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200">
                    DPS (₦) <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">
                  <button onClick={() => toggleSort('dividendYield')} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200">
                    Yield <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort('qualificationDate')} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200">
                    Qual. Date <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Closure</span>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">
                  <button onClick={() => toggleSort('paymentDate')} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-200">
                    Payment <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDividends.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No dividends found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredDividends.map((d) => {
                  const countdown = getCountdown(d.qualificationDate);
                  const isPast = d.qualificationDate && new Date(d.qualificationDate) < now;
                  return (
                    <tr key={d._id} className={`border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/stocks/${d.symbol}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          <p className="font-semibold text-gray-900 dark:text-white">{d.symbol}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{d.companyName}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-300">
                          {d.period || `FY ${d.fiscalYear}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">₦{d.dividendAmount.toFixed(2)}</p>
                        {d.bonusShares && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Gift size={10} /> {d.bonusShares}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`font-medium ${(d.dividendYield || 0) >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {d.dividendYield ? `${d.dividendYield.toFixed(2)}%` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white text-sm">{formatDate(d.qualificationDate)}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {d.closureStart ? `${formatDate(d.closureStart)} - ${formatDate(d.closureEnd)}` : 'TBA'}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-900 dark:text-white text-sm">{formatDate(d.paymentDate)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {isPast ? (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                            Closed
                          </span>
                        ) : countdown ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.qualificationDate)} bg-opacity-10 ${
                            getStatusColor(d.qualificationDate).includes('red') ? 'bg-red-100 dark:bg-red-900/20' :
                            getStatusColor(d.qualificationDate).includes('amber') ? 'bg-amber-100 dark:bg-amber-900/20' :
                            'bg-emerald-100 dark:bg-emerald-900/20'
                          }`}>
                            {countdown}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">TBA</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredDividends.length} of {dividends.length} dividends
        </div>
      </div>
    </div>
  );
}
