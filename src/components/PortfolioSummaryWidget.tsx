'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdingsCount: number;
}

export default function PortfolioSummaryWidget() {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const holdings = data.holdings || [];

        if (holdings.length === 0) {
          setSummary(null);
          setLoading(false);
          return;
        }

        let totalValue = 0;
        let totalCost = 0;
        for (const h of holdings) {
          totalCost += (h.averagePrice || h.buyPrice || 0) * (h.shares || h.quantity || 0);
          totalValue += (h.currentPrice || h.averagePrice || h.buyPrice || 0) * (h.shares || h.quantity || 0);
        }

        const totalReturn = totalValue - totalCost;
        const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

        setSummary({
          totalValue,
          totalCost,
          totalReturn,
          totalReturnPercent,
          holdingsCount: holdings.length,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-4 animate-pulse" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio</h3>
        </div>
        <div className="text-center py-4">
          <PieChart className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No holdings yet</p>
          <Link href="/portfolio" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
            Add your first stock
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = summary.totalReturn >= 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio</h3>
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
        >
          Details <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          ₦{summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className={`flex items-center gap-2 mb-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="font-semibold text-sm">
          {isPositive ? '+' : ''}₦{Math.abs(summary.totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          {isPositive ? '+' : ''}{summary.totalReturnPercent.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-700">
        <span>{summary.holdingsCount} holding{summary.holdingsCount !== 1 ? 's' : ''}</span>
        <span>Cost: ₦{summary.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}
