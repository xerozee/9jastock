'use client';

import { useState, useEffect, memo } from 'react';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown, 
  DollarSign, BarChart2, RefreshCw, ExternalLink, Building2,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface ExtractedMetrics {
  revenue?: number;
  revenueChange?: number;
  operatingProfit?: number;
  operatingProfitChange?: number;
  profitAfterTax?: number;
  profitAfterTaxChange?: number;
  earningsPerShare?: number;
  totalAssets?: number;
  totalEquity?: number;
  dividendPerShare?: number;
}

interface FinancialDocument {
  _id: string;
  symbol: string;
  companyName: string;
  documentType: string;
  year: number;
  period?: string;
  title: string;
  summary?: string;
  documentUrl: string;
  publishedDate: string;
  extractedMetrics?: ExtractedMetrics;
}

interface FinancialDocumentsProps {
  symbol: string;
  companyName?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  return `₦${value.toLocaleString()}`;
}

function formatDocType(type: string): string {
  const types: Record<string, string> = {
    annual_report: 'Annual Report',
    interim_report: 'Interim Report',
    abridged_report: 'Abridged Report',
    presentation: 'Presentation',
    circular: 'Circular',
    prospectus: 'Prospectus',
  };
  return types[type] || type;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function MetricBadge({ label, value, change }: { label: string; value?: number; change?: number }) {
  if (value === undefined) return null;
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {formatCurrency(value)}
      </span>
      {change !== undefined && (
        <span className={`text-xs flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function DocumentCard({ doc }: { doc: FinancialDocument }) {
  const [expanded, setExpanded] = useState(false);
  const metrics = doc.extractedMetrics;
  
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-green-500/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              doc.documentType === 'annual_report' 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : doc.documentType === 'interim_report'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : doc.documentType === 'presentation'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-400'
            }`}>
              {formatDocType(doc.documentType)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {doc.year} {doc.period && `(${doc.period})`}
            </span>
          </div>
          
          <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
            {doc.title}
          </h4>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(doc.publishedDate)}
            </span>
          </div>
        </div>
        
        <a
          href={doc.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ExternalLink size={16} />
          View
        </a>
      </div>
      
      {metrics && Object.keys(metrics).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700"
          >
            <BarChart2 size={14} />
            Key Metrics
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              <MetricBadge label="Revenue" value={metrics.revenue} change={metrics.revenueChange} />
              <MetricBadge label="PAT" value={metrics.profitAfterTax} change={metrics.profitAfterTaxChange} />
              {metrics.earningsPerShare !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-gray-400">EPS:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{metrics.earningsPerShare.toFixed(2)}
                  </span>
                </div>
              )}
              <MetricBadge label="Total Assets" value={metrics.totalAssets} />
              <MetricBadge label="Total Equity" value={metrics.totalEquity} />
            </div>
          )}
        </>
      )}
      
      {doc.summary && expanded && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {doc.summary}
        </p>
      )}
    </div>
  );
}

function FinancialDocuments({ symbol, companyName }: FinancialDocumentsProps) {
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/financial-documents?symbol=${symbol}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (err) {
      setError('Failed to fetch financial documents');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [symbol]);
  
  const filteredDocs = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.documentType === filter);
  
  const documentTypes = [...new Set(documents.map(d => d.documentType))];
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Documents</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Documents
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({documents.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDocuments}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Data
          </span>
        </div>
      </div>
      
      {documentTypes.length > 1 && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            All ({documents.length})
          </button>
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {formatDocType(type)} ({documents.filter(d => d.documentType === type).length})
            </button>
          ))}
        </div>
      )}
      
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {error ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No financial documents available for {companyName || symbol}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Documents will be added as they become available
            </p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <DocumentCard key={doc._id} doc={doc} />
          ))
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Updated every 6 hours
        </p>
      </div>
    </div>
  );
}

export default memo(FinancialDocuments);
