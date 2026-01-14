'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Newspaper, ExternalLink, Clock, 
  Building2, BarChart3, FileText, RefreshCw, ChevronRight
} from 'lucide-react';
import { Stock } from '@/types/stock';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
  category: string;
  symbol?: string;
}

const NEWS_SOURCES = [
  { id: 'ngx', name: 'NGX Official', color: 'bg-green-100 text-green-800' },
  { id: 'businessday', name: 'BusinessDay', color: 'bg-blue-100 text-blue-800' },
  { id: 'nairametrics', name: 'Nairametrics', color: 'bg-purple-100 text-purple-800' },
  { id: 'thisday', name: 'ThisDay', color: 'bg-orange-100 text-orange-800' },
  { id: 'punch', name: 'Punch', color: 'bg-red-100 text-red-800' },
];

function generateMarketNews(): NewsItem[] {
  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return [
    {
      id: '1',
      title: 'NGX All-Share Index Gains 1.2% on Banking Sector Rally',
      summary: 'The Nigerian stock market extended its bullish run as banking stocks led gains across the board. Investors showed renewed confidence following positive Q4 earnings reports.',
      source: 'ngx',
      date: formatDate(0),
      url: 'https://ngxgroup.com/exchange/data/',
      category: 'Market Update'
    },
    {
      id: '2',
      title: 'Dangote Cement Reports Record Revenue in FY 2025',
      summary: 'Dangote Cement Plc has announced record-breaking revenue figures, driven by increased domestic demand and export growth to other African markets.',
      source: 'businessday',
      date: formatDate(0),
      url: 'https://businessday.ng/companies/',
      category: 'Earnings',
      symbol: 'DANGCEM'
    },
    {
      id: '3',
      title: 'Central Bank Holds Interest Rate Steady at 27.5%',
      summary: 'The Monetary Policy Committee has decided to maintain the benchmark interest rate, citing the need to balance inflation control with economic growth.',
      source: 'nairametrics',
      date: formatDate(1),
      url: 'https://nairametrics.com/',
      category: 'Economy'
    },
    {
      id: '4',
      title: 'GTBank Completes Digital Banking Platform Upgrade',
      summary: 'Guaranty Trust Holding Company has announced the successful completion of its next-generation digital banking infrastructure upgrade.',
      source: 'thisday',
      date: formatDate(1),
      url: 'https://www.thisdaylive.com/business/',
      category: 'Technology',
      symbol: 'GTCO'
    },
    {
      id: '5',
      title: 'Oil & Gas Stocks Surge on Rising Crude Prices',
      summary: 'Energy sector stocks on the NGX recorded significant gains as international crude oil prices continued their upward trajectory amid global supply concerns.',
      source: 'punch',
      date: formatDate(1),
      url: 'https://punchng.com/topics/business/',
      category: 'Energy'
    },
    {
      id: '6',
      title: 'Zenith Bank Declares N3.50 Interim Dividend',
      summary: 'Zenith Bank Plc has declared an interim dividend of N3.50 per share for the financial year, reflecting strong profitability and shareholder value commitment.',
      source: 'businessday',
      date: formatDate(2),
      url: 'https://businessday.ng/companies/',
      category: 'Dividend',
      symbol: 'ZENITHBANK'
    },
    {
      id: '7',
      title: 'Foreign Portfolio Investors Return to Nigerian Equities',
      summary: 'Foreign investors have increased their positions in Nigerian stocks, attracted by attractive valuations and improving macroeconomic indicators.',
      source: 'nairametrics',
      date: formatDate(2),
      url: 'https://nairametrics.com/',
      category: 'Investment'
    },
    {
      id: '8',
      title: 'BUA Foods Expands Production Capacity by 40%',
      summary: 'BUA Foods Plc has commissioned new production lines that will increase its manufacturing capacity by 40%, targeting growing domestic and export demand.',
      source: 'ngx',
      date: formatDate(2),
      url: 'https://ngxgroup.com/exchange/data/',
      category: 'Corporate',
      symbol: 'BUAFOODS'
    },
    {
      id: '9',
      title: 'SEC Approves New Guidelines for Rights Issues',
      summary: 'The Securities and Exchange Commission has released updated guidelines for rights issues, aimed at protecting retail investors and improving market transparency.',
      source: 'thisday',
      date: formatDate(3),
      url: 'https://www.thisdaylive.com/business/',
      category: 'Regulation'
    },
    {
      id: '10',
      title: 'MTN Nigeria Reports 15% Revenue Growth in Q4',
      summary: 'MTN Nigeria Communications Plc has posted a 15% year-on-year revenue growth in the fourth quarter, driven by data services and mobile money expansion.',
      source: 'punch',
      date: formatDate(3),
      url: 'https://punchng.com/topics/business/',
      category: 'Earnings',
      symbol: 'MTNN'
    },
    {
      id: '11',
      title: 'Nigerian Stock Market Cap Crosses N65 Trillion Mark',
      summary: 'The total market capitalization of the Nigerian Stock Exchange has surpassed N65 trillion for the first time, reflecting growing investor confidence.',
      source: 'businessday',
      date: formatDate(3),
      url: 'https://businessday.ng/companies/',
      category: 'Market Update'
    },
    {
      id: '12',
      title: 'Seplat Energy Announces Major Oil Discovery',
      summary: 'Seplat Energy Plc has announced a significant oil discovery in its OML blocks, potentially adding substantial reserves to its portfolio.',
      source: 'nairametrics',
      date: formatDate(4),
      url: 'https://nairametrics.com/',
      category: 'Energy',
      symbol: 'SEPLAT'
    },
  ];
}

export default function BlogPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const news = generateMarketNews();

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stocks');
      if (response.ok) {
        const data = await response.json();
        setStocks(data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const topPerformers = [...stocks]
    .filter(s => s.changePercent !== undefined)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);

  const filteredNews = activeSource 
    ? news.filter(n => n.source === activeSource)
    : news;

  const getSourceInfo = (sourceId: string) => 
    NEWS_SOURCES.find(s => s.id === sourceId) || NEWS_SOURCES[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Newspaper className="text-green-600" />
            Market News & Insights
          </h1>
          <p className="text-gray-600">
            Stay informed with the latest Nigerian stock market news, analysis, and corporate updates
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* News Sources Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSource(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSource === null
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Sources
                </button>
                {NEWS_SOURCES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => setActiveSource(source.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeSource === source.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
            </div>

            {/* News Grid */}
            <div className="grid gap-6">
              {filteredNews.map(item => {
                const sourceInfo = getSourceInfo(item.source);
                return (
                  <article key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceInfo.color}`}>
                            {sourceInfo.name}
                          </span>
                          <span className="text-xs text-gray-500">{item.category}</span>
                          {item.symbol && (
                            <Link 
                              href={`/stocks/${item.symbol}`}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100"
                            >
                              {item.symbol}
                            </Link>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600">
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h2>
                        <p className="text-gray-600 mb-3">{item.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {item.date}
                          </span>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            Read More <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* News Sources Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">News Sources</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a 
                  href="https://ngxgroup.com/exchange/data/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Building2 className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">NGX Official</p>
                    <p className="text-sm text-gray-500">Official exchange news</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://businessday.ng/companies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Newspaper className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">BusinessDay</p>
                    <p className="text-sm text-gray-500">Business & markets</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://nairametrics.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <BarChart3 className="text-purple-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Nairametrics</p>
                    <p className="text-sm text-gray-500">Financial analysis</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://www.thisdaylive.com/business/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <FileText className="text-orange-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">ThisDay</p>
                    <p className="text-sm text-gray-500">Nigerian business</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://punchng.com/topics/business/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Newspaper className="text-red-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">Punch</p>
                    <p className="text-sm text-gray-500">National news</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
                <a 
                  href="https://www.sec.gov.ng/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Building2 className="text-gray-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">SEC Nigeria</p>
                    <p className="text-sm text-gray-500">Regulatory updates</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-gray-400" />
                </a>
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
                  onClick={fetchStocks}
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
                  {topPerformers.map((stock, index) => (
                    <Link
                      key={stock.symbol}
                      href={`/blog/${stock.symbol}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-green-600">{stock.symbol}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-semibold">
                          +{stock.changePercent.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500">₦{stock.price.toLocaleString()}</p>
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
