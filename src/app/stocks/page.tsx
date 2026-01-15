'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ArrowUpDown, RefreshCw, Wifi, TrendingUp, Clock } from 'lucide-react';
import StockTable from '@/components/StockTable';
import AuthGuard from '@/components/AuthGuard';
import { nigerianStocks, getAllSectors } from '@/lib/stockData';
import { Stock } from '@/types/stock';

type SortOption = 'name' | 'price' | 'change' | 'volume' | 'marketCap' | 'gainers' | 'losers';

function StocksContent() {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get('sort') as SortOption) || 'name';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const sectors = getAllSectors();

  const fetchLiveStocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stocks');
      if (response.ok) {
        const data = await response.json();
        setLiveStocks(data.data || []);
        setLiveCount(data.liveCount || 0);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch live stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStocks();
    const interval = setInterval(fetchLiveStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stocks = liveStocks.length > 0 ? liveStocks : nigerianStocks;

  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      );
    }

    if (selectedSector !== 'all') {
      result = result.filter((stock) => stock.sector === selectedSector);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
        case 'gainers':
          comparison = a.changePercent - b.changePercent;
          break;
        case 'losers':
          comparison = b.changePercent - a.changePercent;
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
        default:
          comparison = 0;
      }

      if (sortBy === 'gainers') {
        return -comparison;
      } else if (sortBy === 'losers') {
        return comparison;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [stocks, searchQuery, selectedSector, sortBy, sortOrder]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Wifi className="text-green-500" size={18} />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {liveCount} stocks with live data
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                <Clock size={14} />
                <span className="text-sm">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={fetchLiveStocks}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[180px]"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[160px]"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="gainers">Top Gainers</option>
              <option value="losers">Top Losers</option>
              <option value="volume">Volume</option>
              <option value="marketCap">Market Cap</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-slate-400">
        Showing {filteredAndSortedStocks.length} of {stocks.length} stocks
        {selectedSector !== 'all' && ` in ${selectedSector}`}
      </div>

      {isLoading && liveStocks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <RefreshCw size={32} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Loading live stock data...</p>
        </div>
      ) : filteredAndSortedStocks.length > 0 ? (
        <StockTable stocks={filteredAndSortedStocks} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">No stocks found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSector('all');
            }}
            className="mt-4 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

export default function StocksPage() {
  return (
    <AuthGuard pageName="the stocks page">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 dark:from-slate-800 dark:via-emerald-900 dark:to-slate-800 rounded-3xl p-8 mb-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4">
                <TrendingUp size={16} />
                <span>NGX Listed Stocks</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">All Stocks</h1>
              <p className="text-green-100 dark:text-slate-300 text-lg">
                Browse and filter all 145+ stocks listed on the Nigerian Stock Exchange with live prices
              </p>
            </div>
          </div>

          <Suspense fallback={
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
              <RefreshCw size={32} className="animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-slate-400">Loading stocks...</p>
            </div>
          }>
            <StocksContent />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  );
}
