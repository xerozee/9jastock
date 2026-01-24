'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Download, ExternalLink, Calendar, RefreshCw,
  TrendingUp, Building2, DollarSign, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

interface ReportHighlights {
  revenue?: number;
  profit?: number;
  profitBeforeTax?: number;
  totalAssets?: number;
  eps?: number;
  dividend?: number;
  dividendPerShare?: number;
  grossEarnings?: number;
  operatingProfit?: number;
}

interface FinancialReport {
  _id: string;
  symbol: string;
  companyName: string;
  reportType: 'annual' | 'interim' | 'quarterly' | 'abridged';
  reportTitle: string;
  reportUrl: string;
  documentUrl?: string;
  year: number;
  period?: string;
  publishedAt?: string;
  highlights?: ReportHighlights;
  source: string;
}

interface DividendInfo {
  symbol: string;
  companyName: string;
  dividendType: 'final' | 'interim' | 'special';
  amount: number;
  currency: string;
  declarationDate?: string;
  year: number;
}

interface FinancialReportsProps {
  symbol: string;
}

function formatCurrency(value: number | undefined): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `₦${(value / 1e3).toFixed(2)}K`;
  return `₦${value.toFixed(2)}`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function ReportTypeBadge({ type }: { type: string }) {
  const colors = {
    annual: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    interim: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    quarterly: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    abridged: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors.annual}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function ReportCard({ report, isExpanded, onToggle }: {
  report: FinancialReport;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasHighlights = report.highlights && Object.values(report.highlights).some(v => v !== undefined);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
      <div
        className="p-4 cursor-pointer flex items-start justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <ReportTypeBadge type={report.reportType} />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{report.year}</span>
            {report.period && (
              <span className="text-xs text-gray-500 dark:text-gray-400">({report.period})</span>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
            {report.reportTitle}
          </h4>
          {report.publishedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Calendar size={12} />
              Published: {formatDate(report.publishedAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={report.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="View Report"
          >
            <ExternalLink size={18} />
          </a>
          {hasHighlights && (
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasHighlights && report.highlights && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3">
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Key Highlights
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {report.highlights.grossEarnings !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Gross Earnings</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(report.highlights.grossEarnings)}
                </p>
              </div>
            )}
            {report.highlights.revenue !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(report.highlights.revenue)}
                </p>
              </div>
            )}
            {report.highlights.profit !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Profit After Tax</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(report.highlights.profit)}
                </p>
              </div>
            )}
            {report.highlights.profitBeforeTax !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Profit Before Tax</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(report.highlights.profitBeforeTax)}
                </p>
              </div>
            )}
            {report.highlights.operatingProfit !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Operating Profit</p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatCurrency(report.highlights.operatingProfit)}
                </p>
              </div>
            )}
            {report.highlights.totalAssets !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Assets</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(report.highlights.totalAssets)}
                </p>
              </div>
            )}
            {report.highlights.eps !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">EPS</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₦{report.highlights.eps.toFixed(2)}
                </p>
              </div>
            )}
            {report.highlights.dividendPerShare !== undefined && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Dividend/Share</p>
                <p className="text-sm font-semibold text-green-600">
                  ₦{report.highlights.dividendPerShare.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancialReports({ symbol }: FinancialReportsProps) {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [dividends, setDividends] = useState<DividendInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [africanFinancialsUrl, setAfricanFinancialsUrl] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'annual' | 'interim' | 'quarterly' | 'abridged'>('all');

  const fetchReports = async (refresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/financial-reports?symbol=${symbol}${refresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports || []);
        setDividends(data.dividends || []);
        setAfricanFinancialsUrl(data.africanFinancialsUrl);
        setLastUpdated(data.lastUpdated);
      } else {
        setError(data.error || 'Failed to fetch financial reports');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching financial reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchReports();
    }
  }, [symbol]);

  const filteredReports = filterType === 'all'
    ? reports
    : reports.filter(r => r.reportType === filterType);

  // Group reports by year
  const reportsByYear = filteredReports.reduce((acc, report) => {
    if (!acc[report.year]) {
      acc[report.year] = [];
    }
    acc[report.year].push(report);
    return acc;
  }, {} as Record<number, FinancialReport[]>);

  const years = Object.keys(reportsByYear).map(Number).sort((a, b) => b - a);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-emerald-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Reports</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading reports from African Financials...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-emerald-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Reports</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchReports(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-emerald-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Reports</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No financial reports available for {symbol}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Reports from African Financials will appear here when available.
          </p>
          {africanFinancialsUrl && (
            <a
              href={africanFinancialsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
            >
              Check African Financials directly <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="text-emerald-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Reports</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {reports.length} report{reports.length !== 1 ? 's' : ''} from African Financials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Reports</option>
            <option value="annual">Annual</option>
            <option value="abridged">Abridged</option>
            <option value="interim">Interim</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button
            onClick={() => fetchReports(true)}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Refresh reports"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Reports by Year */}
      <div className="space-y-6">
        {years.map((year) => (
          <div key={year}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              {year}
              <span className="text-xs font-normal text-gray-400">
                ({reportsByYear[year].length} report{reportsByYear[year].length !== 1 ? 's' : ''})
              </span>
            </h3>
            <div className="space-y-3">
              {reportsByYear[year].map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  isExpanded={expandedReport === report._id}
                  onToggle={() => setExpandedReport(
                    expandedReport === report._id ? null : report._id
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Source Attribution */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Data sourced from African Financials
          {lastUpdated && ` • Last updated: ${formatDate(lastUpdated)}`}
        </p>
        {africanFinancialsUrl && (
          <a
            href={africanFinancialsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            View all on African Financials <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
