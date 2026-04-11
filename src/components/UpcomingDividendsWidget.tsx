'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Clock, DollarSign } from 'lucide-react';

interface DividendPreview {
  symbol: string;
  companyName?: string;
  dividendAmount: number;
  dividendYield?: number;
  qualificationDate?: string;
  paymentDate?: string;
}

export default function UpcomingDividendsWidget() {
  const [dividends, setDividends] = useState<DividendPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch('/api/dividends?limit=200');
        if (!res.ok) return;
        const data = await res.json();
        const now = new Date();
        const upcoming = (data.dividends || [])
          .filter((d: DividendPreview) => {
            const qd = d.qualificationDate ? new Date(d.qualificationDate) : null;
            return qd && qd >= now;
          })
          .sort((a: DividendPreview, b: DividendPreview) => {
            const da = new Date(a.qualificationDate!).getTime();
            const db = new Date(b.qualificationDate!).getTime();
            return da - db;
          })
          .slice(0, 5);
        setDividends(upcoming);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  function getCountdown(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days}d`;
    return `${Math.ceil(days / 7)}w`;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  if (dividends.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Dividends</h3>
        </div>
        <Link
          href="/dividends"
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {dividends.map((d) => (
          <Link
            key={d.symbol}
            href={`/stocks/${d.symbol}`}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {d.symbol}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {d.companyName}
              </p>
            </div>
            <div className="text-right ml-3">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">₦{d.dividendAmount.toFixed(2)}</p>
              {d.dividendYield && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{d.dividendYield.toFixed(1)}%</p>
              )}
            </div>
            <div className="ml-3 text-right">
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                {getCountdown(d.qualificationDate!)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
