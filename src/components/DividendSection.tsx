'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Calendar, ExternalLink, Clock, CheckCircle,
  AlertCircle, Gift, TrendingUp
} from 'lucide-react';

interface DividendRecord {
  _id: string;
  symbol: string;
  companyName?: string;
  period?: string;
  declarationDate?: string;
  exDividendDate?: string;
  recordDate?: string;
  paymentDate?: string;
  agmDate?: string;
  dividendAmount: number;
  dividendType: 'interim' | 'final' | 'special' | 'bonus';
  currency: string;
  dividendYield?: number;
  bonusShares?: string;
  fiscalYear?: number;
  fiscalQuarter?: number;
  qualificationDate?: string;
  closureStart?: string;
  closureEnd?: string;
  eDividendRegistrationUrl?: string;
  source?: string;
  sourceUrl?: string;
  scrapedAt: string;
}

interface DividendStats {
  hasDividends: boolean;
  totalDividends: number;
  averageDividend: number;
  latestDividend: DividendRecord | null;
  dividendFrequency: string;
  yearsOfDividends: number;
}

interface DividendResponse {
  dividends: DividendRecord[];
  stats: DividendStats | null;
  count: number;
}

interface DividendSectionProps {
  symbol: string;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isFutureDate(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date.getTime() > Date.now();
}

function SkeletonLoader() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
        <div className="h-40 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
        <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

interface TimelineItemProps {
  label: string;
  date: string | undefined;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isLast?: boolean;
}

function TimelineItem({ label, date, icon: Icon, isLast = false }: TimelineItemProps) {
  const future = isFutureDate(date);
  const hasDate = date && formatDate(date) !== 'N/A';

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 ${future ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30' : hasDate ? 'border-emerald-600 bg-emerald-600' : 'border-gray-400 bg-gray-400 dark:border-slate-500 dark:bg-slate-500'}`} />
        {!isLast && (
          <div className={`w-0.5 h-8 ${hasDate ? 'bg-emerald-500/40' : 'bg-gray-300 dark:bg-slate-600'}`} />
        )}
      </div>
      <div className="-mt-1 flex-1">
        <div className="flex items-center gap-2">
          <Icon size={14} className={future ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {future && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">Upcoming</span>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${future ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatDate(date)}
        </p>
      </div>
    </div>
  );
}

export default function DividendSection({ symbol }: DividendSectionProps) {
  const [data, setData] = useState<DividendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDividends() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/dividends?symbol=${encodeURIComponent(symbol)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchDividends();
    }
  }, [symbol]);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dividend Information</h2>
        </div>
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
          <AlertCircle size={16} />
          <p className="text-sm">Failed to load dividend information. Please try again later.</p>
        </div>
      </div>
    );
  }

  const dividends = data?.dividends || [];
  const stats = data?.stats;
  const latest = stats?.latestDividend || dividends[0] || null;
  const hasDividends = dividends.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dividend Information</h2>
        {stats && stats.hasDividends && (
          <span className="ml-auto text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
            {stats.dividendFrequency}
          </span>
        )}
      </div>

      {!hasDividends ? (
        <div className="text-center py-8">
          <DollarSign size={40} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No dividend information available for this stock
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {latest && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Latest Dividend
                </h3>
                {latest.period && (
                  <span className="text-xs px-2 py-0.5 bg-white/60 dark:bg-slate-800/60 text-emerald-700 dark:text-emerald-400 rounded-full">
                    {latest.period}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mb-1">Dividend Per Share</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                    ₦{latest.dividendAmount.toFixed(2)}
                  </p>
                </div>

                {latest.dividendYield != null && latest.dividendYield > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 dark:bg-emerald-500 rounded-full">
                    <TrendingUp size={14} className="text-white" />
                    <span className="text-sm font-semibold text-white">
                      {latest.dividendYield.toFixed(2)}% yield
                    </span>
                  </div>
                )}
              </div>

              {latest.bonusShares && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <Gift size={14} />
                  <span>Bonus Shares: {latest.bonusShares}</span>
                </div>
              )}
            </div>
          )}

          {latest && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar size={14} />
                Key Dates
              </h3>
              <div className="pl-1">
                <TimelineItem
                  label="Qualification Date"
                  date={latest.qualificationDate}
                  icon={CheckCircle}
                />
                <TimelineItem
                  label={latest.closureEnd ? `Closure Period (${formatDate(latest.closureStart)} – ${formatDate(latest.closureEnd)})` : 'Closure Date'}
                  date={latest.closureStart}
                  icon={Clock}
                />
                <TimelineItem
                  label="AGM Date"
                  date={latest.agmDate}
                  icon={Calendar}
                />
                <TimelineItem
                  label="Payment Date"
                  date={latest.paymentDate}
                  icon={DollarSign}
                  isLast
                />
              </div>
            </div>
          )}

          {latest && (
            <div>
              {latest.eDividendRegistrationUrl ? (
                <a
                  href={latest.eDividendRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                >
                  <DollarSign size={18} />
                  Claim Your Dividend
                  <ExternalLink size={14} />
                </a>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                  <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">E-Dividend Registration</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Register for e-dividends with your stockbroker or CSCS to receive dividend payments directly to your bank account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {dividends.length > 1 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock size={14} />
                Dividend History
              </h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Symbol</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Period</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">DPS (₦)</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Yield</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dividends.map((d) => (
                      <tr
                        key={d._id}
                        className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{d.symbol}</td>
                        <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{d.period || '—'}</td>
                        <td className="py-2 px-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          ₦{d.dividendAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400">
                          {d.dividendYield != null ? `${d.dividendYield.toFixed(2)}%` : '—'}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-500 dark:text-gray-400">
                          {formatDate(d.paymentDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
