'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, AlertCircle, ExternalLink, RefreshCw, Building2, TrendingUp } from 'lucide-react';

interface Dividend {
  fiscalYear: string;
  dividendType: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  declarationDate?: string;
  exDate?: string;
}

interface Document {
  title: string;
  type: string;
  year: number;
  url: string;
  publishedDate?: string;
  metrics?: {
    revenue?: string;
    profit?: string;
    eps?: string;
  };
}

interface CompanyData {
  symbol: string;
  name: string;
  url: string;
  found: boolean;
  sector?: string;
  dividends: Dividend[];
  documents: Document[];
  profile?: {
    description?: string;
    ceo?: string;
    headquarters?: string;
    employees?: string;
    founded?: string;
    industry?: string;
  };
}

interface AfricanFinancialsDataProps {
  symbol: string;
  companyName?: string;
}

const SYMBOL_MAPPING: Record<string, string> = {
  'ACCESSCORP': 'ACCESS',
  'GTCO': 'GUARANTY',
  'ZENITHBANK': 'ZENITH',
  'FBNH': 'FIRSTBANK',
  'UBA': 'UBA',
  'DANGCEM': 'DANGCEM',
  'MTNN': 'MTNN',
  'BUACEMENT': 'BUACEMENT',
  'WAPCO': 'LAFARGE',
  'NESTLE': 'NESTLE',
  'NB': 'NB',
  'GUINNESS': 'GUINNESS',
  'FLOURMILL': 'FLOURMILL',
  'OKOMUOIL': 'OKOMU',
  'PRESCO': 'PRESCO',
  'SEPLAT': 'SEPLAT',
  'OANDO': 'OANDO',
  'FIDELITYBK': 'FIDELITY',
  'STANBIC': 'STANBIC',
  'ETI': 'ETI',
  'FCMB': 'FCMB',
  'WEMABANK': 'WEMA',
  'STERLINGNG': 'STERLING',
  'UNIONBNK': 'UNION',
  'UNITYBNK': 'UNITY',
  'JBERGER': 'JULIUS',
  'CADBURY': 'CADBURY',
  'UNILEVER': 'UNILEVER',
  'PZ': 'PZ',
  'TRANSCORP': 'TRANSCORP',
  'TOTAL': 'TOTAL',
  'CONOIL': 'CONOIL',
  'ETERNA': 'ETERNA',
  'MOBIL': 'MOBIL',
  'BERGER': 'BERGER',
  'CUSTODIAN': 'CUSTODIAN',
  'AIICO': 'AIICO',
  'MANSARD': 'MANSARD',
  'NEM': 'NEM',
  'LASACO': 'LASACO',
  'ROYALEX': 'ROYALEX',
  'CORNERST': 'CORNERST',
  'MAYBAKER': 'MAYBAKER',
  'GLAXOSMITH': 'GLAXO',
  'PHARMDEKO': 'PHARMDEKO',
  'FIDSON': 'FIDSON',
  'NEIMETH': 'NEIMETH',
  'SKYAVN': 'SKYAVN',
  'INTBREW': 'INTBREW',
  'HONYFLOUR': 'HONYFLOUR',
  'DANGSUGAR': 'DANGSUGAR',
  'VITAFOAM': 'VITAFOAM',
  'AIRTELAFRI': 'AIRTEL',
  'ARADEL': 'ARADEL',
  'GEREGU': 'GEREGU',
  'BUAFOODS': 'BUAFOODS',
};

function getAfricanFinancialsSymbol(tvSymbol: string): string {
  return SYMBOL_MAPPING[tvSymbol.toUpperCase()] || tvSymbol.replace(/CORP$|BANK$|BK$|NG$/, '').toUpperCase();
}

export default function AfricanFinancialsData({ symbol, companyName }: AfricanFinancialsDataProps) {
  const afSymbol = getAfricanFinancialsSymbol(symbol);
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/african-financials/company?symbol=${afSymbol}${refresh ? '&refresh=true' : ''}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setData({
          symbol: afSymbol,
          name: companyName || '',
          url: `https://africanfinancials.com/company/ng-${afSymbol.toLowerCase()}/`,
          found: false,
          dividends: [],
          documents: [],
        });
      }
    } catch (err) {
      console.error('Error fetching African Financials data:', err);
      setError('Failed to load data');
      setData({
        symbol: afSymbol,
        name: companyName || '',
        url: `https://africanfinancials.com/company/ng-${afSymbol.toLowerCase()}/`,
        found: false,
        dividends: [],
        documents: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [afSymbol]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Company Financials</h3>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const notFoundMessage = (
    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <div>
        <p className="text-amber-800 dark:text-amber-300 font-medium">Not Found</p>
        <p className="text-amber-600 dark:text-amber-400 text-sm">
          Financial data for {symbol} is not currently available.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Company Financials</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {data?.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg transition-colors"
            >
              <span>View Full Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!data?.found ? (
          notFoundMessage
        ) : (
          <>
            {data.profile?.description && (
              <div className="pb-4 border-b border-gray-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.profile.description}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Dividend History</h4>
              </div>
              
              {data.dividends.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>No dividend data available</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">Year</th>
                        <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">Type</th>
                        <th className="text-right py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">Amount</th>
                        <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dividends.slice(0, 5).map((div, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                          <td className="py-2 px-2 text-slate-900 dark:text-white">{div.fiscalYear}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              div.dividendType === 'Interim' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {div.dividendType}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-slate-900 dark:text-white">
                            {div.currency} {div.amount.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-400">{div.paymentDate || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Financial Documents</h4>
              </div>
              
              {(() => {
                const uniqueDocs = data.documents.reduce((acc, doc) => {
                  if (!acc.find(d => d.url === doc.url)) {
                    const relevantTypes = ['Annual Report', 'Interim Report', 'Quarterly Report'];
                    if (relevantTypes.includes(doc.type)) {
                      acc.push(doc);
                    }
                  }
                  return acc;
                }, [] as Document[]).sort((a, b) => (b.year || 0) - (a.year || 0));
                
                return uniqueDocs.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>No financial documents available</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uniqueDocs.slice(0, 10).map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">{doc.type}</span>
                            <span>{doc.year}</span>
                            {doc.publishedDate && <span>{doc.publishedDate}</span>}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
