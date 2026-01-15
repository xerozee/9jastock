'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ArrowUpDown, RefreshCw, Wifi } from 'lucide-react';
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
      {/* Live Data Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={18} className="animate-pulse" />
              <span className="text-sm font-medium">{liveCount} stocks with live data</span>
            </div>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={fetchLiveStocks}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Sector Filter */}
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[180px]"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
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

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAndSortedStocks.length} of {stocks.length} stocks
        {selectedSector !== 'all' && ` in ${selectedSector}`}
      </div>

      {/* Stock Table */}
      {isLoading && liveStocks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <RefreshCw size={32} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading live stock data...</p>
        </div>
      ) : filteredAndSortedStocks.length > 0 ? (
        <StockTable stocks={filteredAndSortedStocks} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No stocks found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSector('all');
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Stocks</h1>
          <p className="text-gray-600 dark:text-slate-400">
            Browse and filter all stocks listed on the Nigerian Stock Exchange (NGX) with live prices
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
            <RefreshCw size={32} className="animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Loading stocks...</p>
          </div>
        }>
          <StocksContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
