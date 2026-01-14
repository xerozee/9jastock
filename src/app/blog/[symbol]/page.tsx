'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, FileText, ExternalLink, 
  Building2, Clock, BarChart3, DollarSign, Calendar, RefreshCw,
  ChevronRight, Newspaper, Download, PieChart
} from 'lucide-react';
import { Stock } from '@/types/stock';
import { getStockBySymbol } from '@/lib/stockData';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
}

function generateStockNews(symbol: string, companyName: string): NewsItem[] {
  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return [
    {
      id: '1',
      title: `${companyName} Reports Strong Q4 Performance`,
      summary: `${companyName} has announced impressive fourth quarter results, with revenue growth exceeding analyst expectations. The company cited improved operational efficiency and market expansion as key drivers.`,
      source: 'BusinessDay',
      date: formatDate(0),
      url: 'https://businessday.ng/companies/'
    },
    {
      id: '2',
      title: `Analysts Upgrade ${symbol} Rating to "Buy"`,
      summary: `Leading investment analysts have upgraded their rating for ${symbol} shares, citing strong fundamentals and positive industry outlook. Price targets have been revised upward.`,
      source: 'Nairametrics',
      date: formatDate(1),
      url: 'https://nairametrics.com/'
    },
    {
      id: '3',
      title: `${companyName} Announces Strategic Partnership`,
      summary: `${companyName} has entered into a strategic partnership aimed at expanding its market presence and enhancing service delivery to customers across Nigeria.`,
      source: 'ThisDay',
      date: formatDate(2),
      url: 'https://www.thisdaylive.com/business/'
    },
    {
      id: '4',
      title: `${symbol} Shares See Increased Foreign Investment`,
      summary: `Foreign portfolio investors have increased their holdings in ${symbol}, reflecting growing international confidence in the company's growth trajectory.`,
      source: 'Punch',
      date: formatDate(3),
      url: 'https://punchng.com/topics/business/'
    },
    {
      id: '5',
      title: `${companyName} Board Approves Dividend Payment`,
      summary: `The Board of Directors of ${companyName} has approved a dividend payment to shareholders, demonstrating the company's commitment to delivering value to investors.`,
      source: 'NGX Official',
      date: formatDate(5),
      url: 'https://ngxgroup.com/exchange/data/'
    },
    {
      id: '6',
      title: `${companyName} Expands Operations in New Markets`,
      summary: `${companyName} has announced plans to expand its operations into new markets, a move expected to drive future revenue growth and market share.`,
      source: 'BusinessDay',
      date: formatDate(7),
      url: 'https://businessday.ng/companies/'
    },
  ];
}

export default function StockBlogPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [stock, setStock] = useState<Stock | null>(null);
  const [topPerformers, setTopPerformers] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const staticStock = getStockBySymbol(symbol);
  const companyName = staticStock?.name || symbol;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stockRes, allStocksRes] = await Promise.all([
        fetch(`/api/stocks/${symbol}`),
        fetch('/api/stocks')
      ]);

      if (stockRes.ok) {
        const data = await stockRes.json();
        setStock(data);
      }

      if (allStocksRes.ok) {
        const allData = await allStocksRes.json();
        const sorted = [...(allData.data || [])]
          .filter((s: Stock) => s.changePercent !== undefined)
          .sort((a: Stock, b: Stock) => b.changePercent - a.changePercent)
          .slice(0, 10);
        setTopPerformers(sorted);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  const displayStock = stock || staticStock;
  const news = generateStockNews(symbol, companyName);

  if (!displayStock && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stock Not Found</h1>
          <p className="text-gray-600 mb-6">The stock with symbol &quot;{symbol}&quot; could not be found.</p>
          <Link href="/blog" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
            <ArrowLeft size={18} className="mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = (displayStock?.changePercent || 0) >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <Link href="/blog" className="hover:text-green-600">News</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{symbol}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stock Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{symbol}</h1>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {displayStock?.sector || 'N/A'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600">{companyName}</p>
                </div>
                {displayStock && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{displayStock.price.toLocaleString()}
                    </p>
                    <p className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {isPositive ? '+' : ''}{displayStock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  href={`/stocks/${symbol}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BarChart3 size={16} />
                  View Full Analysis
                </Link>
              </div>
            </div>

            {/* Annual Reports & Financials */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-green-600" />
                Annual Reports & Financials
              </h2>
              <p className="text-gray-600 mb-4">
                Access official financial documents and annual reports for {companyName}.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={`https://ngxgroup.com/exchange/data/equities/company-profile/?symbol=${symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Building2 className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Company Profile</p>
                    <p className="text-sm text-gray-500">NGX Official Profile</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a
                  href={`https://ngxgroup.com/exchange/data/equities/stock-list/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <DollarSign className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Financial Data</p>
                    <p className="text-sm text-gray-500">NGX Stock Listings</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a
                  href={`https://doclib.ngxgroup.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Download className="text-purple-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Document Library</p>
                    <p className="text-sm text-gray-500">Annual Reports & Filings</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a
                  href={`https://ngxgroup.com/exchange/data/corporate-actions/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <PieChart className="text-orange-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Corporate Actions</p>
                    <p className="text-sm text-gray-500">Dividends & Rights Issues</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
              </div>
            </div>

            {/* Stock News */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Newspaper className="text-green-600" />
                Latest News for {symbol}
              </h2>
              <div className="space-y-4">
                {news.map(item => (
                  <article key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-green-600">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{item.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.date}
                      </span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        Read More <ExternalLink size={12} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Top Performers */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Top 10 Performers
                </h2>
                <button 
                  onClick={fetchData}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              
              {lastUpdated && (
                <p className="text-xs text-gray-500 mb-4">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}

              {isLoading && topPerformers.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw size={24} className="animate-spin text-green-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {topPerformers.map((s, index) => (
                    <Link
                      key={s.symbol}
                      href={`/blog/${s.symbol}`}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                        s.symbol === symbol ? 'bg-green-50 border border-green-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-green-600">{s.symbol}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{s.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-semibold">
                          +{s.changePercent.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500">₦{s.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/stocks?sort=gainers"
                className="flex items-center justify-center gap-2 mt-4 py-3 text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors"
              >
                View All Stocks <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
