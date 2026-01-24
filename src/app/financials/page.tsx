'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  DollarSign, 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  TrendingUp, 
  Calendar,
  BarChart3,
  BookOpen,
  Presentation,
  Download,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  PieChart
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import PremiumGate from '@/components/PremiumGate';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';

type TabType = 'overview' | 'reports' | 'dividends' | 'companies';
type ReportType = 'all' | 'Annual Report' | 'Interim Report' | 'Quarterly Report' | 'Presentation' | 'Other';

interface CompanyStats {
  symbol: string;
  afSymbol: string;
  name: string;
  url: string;
  totalDocuments: number;
  annualReports: number;
  interimReports: number;
  quarterlyReports: number;
  presentations: number;
  otherDocs: number;
  dividendCount: number;
  latestYear: number;
  profile?: { description?: string };
  scrapedAt: string;
}

interface Document {
  title: string;
  type: string;
  year: number;
  url: string;
  companySymbol: string;
  companyName: string;
  publishedDate?: string;
}

interface Dividend {
  fiscalYear: string;
  dividendType: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  companySymbol: string;
  companyName: string;
}

interface Stats {
  totalCompanies: number;
  totalDocuments: number;
  totalDividends: number;
  annualReports: number;
  interimReports: number;
  quarterlyReports: number;
  presentations: number;
}

function FinancialsContent() {
  const { isPremium } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<ReportType>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);

  useEffect(() => {
    if (!isPremium) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/financials/companies');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setCompanies(data.companies || []);
          setDocuments(data.documents || []);
          setDividends(data.dividends || []);
        } else {
          setError(data.error || 'Failed to load data');
        }
      } catch (err) {
        setError('Failed to fetch financial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isPremium]);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(documents.map(d => d.year))].filter(y => y > 2000).sort((a, b) => b - a);
    return uniqueYears;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let result = [...documents];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.companyName.toLowerCase().includes(query) ||
        d.companySymbol.toLowerCase().includes(query) ||
        d.title.toLowerCase().includes(query)
      );
    }
    
    if (reportFilter !== 'all') {
      result = result.filter(d => d.type === reportFilter);
    }
    
    if (yearFilter !== 'all') {
      result = result.filter(d => d.year === parseInt(yearFilter));
    }
    
    return result;
  }, [documents, searchQuery, reportFilter, yearFilter]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.symbol.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const filteredDividends = useMemo(() => {
    if (!searchQuery) return dividends;
    const query = searchQuery.toLowerCase();
    return dividends.filter(d => 
      d.companyName.toLowerCase().includes(query) ||
      d.companySymbol.toLowerCase().includes(query)
    );
  }, [dividends, searchQuery]);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: PieChart },
    { id: 'reports' as TabType, label: 'Reports', icon: FileText },
    { id: 'dividends' as TabType, label: 'Dividends', icon: DollarSign },
    { id: 'companies' as TabType, label: 'Companies', icon: Building2 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Financial Reports & Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive financial data for {stats?.totalCompanies || 0} Nigerian companies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Companies</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalCompanies || 0}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Documents</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalDocuments || 0}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Annual Reports</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.annualReports || 0}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Dividend Records</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalDividends || 0}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'reports' || activeTab === 'companies' || activeTab === 'dividends') && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {activeTab === 'reports' && (
              <>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value as ReportType)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="Annual Report">Annual Reports</option>
                  <option value="Interim Report">Interim Reports</option>
                  <option value="Quarterly Report">Quarterly Reports</option>
                  <option value="Presentation">Presentations</option>
                </select>
                
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Document Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Annual Reports', count: stats?.annualReports || 0, color: 'bg-blue-500' },
                    { label: 'Interim Reports', count: stats?.interimReports || 0, color: 'bg-emerald-500' },
                    { label: 'Quarterly Reports', count: stats?.quarterlyReports || 0, color: 'bg-amber-500' },
                    { label: 'Presentations', count: stats?.presentations || 0, color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Top Companies by Documents
                </h3>
                <div className="space-y-3">
                  {companies.slice(0, 5).map((company) => (
                    <Link
                      key={company.symbol}
                      href={`/stocks/${company.symbol}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{company.symbol}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{company.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{company.totalDocuments}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">documents</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Latest Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.slice(0, 6).map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{doc.companySymbol}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{doc.type}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{doc.publishedDate || doc.year || 'N/A'}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Company</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Published</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Title</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredDocuments.slice(0, 50).map((doc, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <Link href={`/stocks/${doc.companySymbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                          {doc.companySymbol}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.type === 'Annual Report' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          doc.type === 'Interim Report' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          doc.type === 'Quarterly Report' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                          doc.type === 'Presentation' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {doc.publishedDate || doc.year || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{doc.title}</td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">No reports found matching your criteria</p>
              </div>
            )}
            {filteredDocuments.length > 50 && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 text-center text-sm text-slate-600 dark:text-slate-400">
                Showing 50 of {filteredDocuments.length} reports
              </div>
            )}
          </div>
        )}

        {activeTab === 'dividends' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {dividends.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Dividend Data Available</h3>
                <p className="text-slate-500 dark:text-slate-400">Dividend information will appear here once available from African Financials.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Company</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Fiscal Year</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Type</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredDividends.slice(0, 50).map((div, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <Link href={`/stocks/${div.companySymbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                            {div.companySymbol}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{div.fiscalYear}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                            {div.dividendType || 'Cash'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                          {div.currency || '₦'}{div.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{div.paymentDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Link
                key={company.symbol}
                href={`/stocks/${company.symbol}`}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {company.symbol}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{company.name}</p>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{company.annualReports}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Annual</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{company.interimReports}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Interim</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{company.quarterlyReports}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quarterly</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{company.presentations}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Presentations</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{company.totalDocuments} total documents</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Latest: {company.latestYear}</span>
                </div>
              </Link>
            ))}
            
            {filteredCompanies.length === 0 && (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">No companies found matching your search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FinancialsWrapper() {
  const { isPremium, statusResolved } = useSubscription();
  
  if (!statusResolved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 py-8 px-4">
        <div className="max-w-2xl mx-auto mt-20">
          <PremiumGate 
            title="Financial Reports & Analysis"
            description="Access comprehensive financial reports, dividend history, and in-depth analysis for Nigerian companies"
            features={[
              'Annual & Interim Reports',
              'Dividend History Tracker',
              'Company Financial Profiles',
              'Document Download Access'
            ]}
          />
        </div>
      </div>
    );
  }
  
  return <FinancialsContent />;
}

export default function FinancialsPage() {
  return (
    <AuthGuard>
      <FinancialsWrapper />
    </AuthGuard>
  );
}
