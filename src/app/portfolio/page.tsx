"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Plus,
  X,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  Search,
  Clock
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sector: string;
  perfWeek?: number;
  perfMonth?: number;
  perfYear?: number;
}

export default function PortfolioPage() {
  const [portfolioSymbols, setPortfolioSymbols] = useState<string[]>([]);
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [stocksData, setStocksData] = useState<Map<string, StockData>>(new Map());
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) {
      setPortfolioSymbols(JSON.parse(saved));
    }
    fetchStocksData();
  }, []);

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolioSymbols));
  }, [portfolioSymbols]);

  const fetchStocksData = async () => {
    setIsLoadingStocks(true);
    try {
      const response = await fetch("/api/stocks");
      if (response.ok) {
        const data = await response.json();
        const stocksMap = new Map<string, StockData>();
        data.data.forEach((stock: StockData) => {
          stocksMap.set(stock.symbol, stock);
        });
        setStocksData(stocksMap);
        setAllStocks(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch stocks data:", error);
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const addToPortfolio = (symbol: string) => {
    if (!portfolioSymbols.includes(symbol)) {
      setPortfolioSymbols([...portfolioSymbols, symbol]);
    }
    setShowAddModal(false);
    setSearchQuery("");
  };

  const removeFromPortfolio = (symbol: string) => {
    setPortfolioSymbols(portfolioSymbols.filter(s => s !== symbol));
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
    return `₦${value.toLocaleString()}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toString();
  };

  const calculatePortfolioStats = () => {
    let totalChange = 0;
    let gainers = 0;
    let losers = 0;
    let validStocks = 0;

    portfolioSymbols.forEach(symbol => {
      const stock = stocksData.get(symbol);
      if (stock) {
        validStocks++;
        totalChange += stock.changePercent || 0;
        if ((stock.changePercent || 0) > 0) gainers++;
        else if ((stock.changePercent || 0) < 0) losers++;
      }
    });

    const avgChange = validStocks > 0 ? totalChange / validStocks : 0;
    return { avgChange, gainers, losers };
  };

  const filteredStocks = allStocks.filter(stock => 
    !portfolioSymbols.includes(stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = calculatePortfolioStats();

  return (
    <AuthGuard pageName="your portfolio">
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 dark:from-slate-800 dark:via-purple-900 dark:to-slate-800 rounded-3xl p-8 mb-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4">
                <Briefcase size={16} />
                <span>Personal Portfolio</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Portfolio</h1>
              <p className="text-purple-100 dark:text-slate-300 text-lg">
                Track your favorite Nigerian stocks in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                <span>Add Stock</span>
              </button>
              <button
                onClick={fetchStocksData}
                disabled={isLoadingStocks}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoadingStocks ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 mb-6">
            <Clock size={14} />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

        {portfolioSymbols.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Stocks Tracked</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{portfolioSymbols.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Avg. Daily Change</p>
              <p className={`text-3xl font-bold ${stats.avgChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.avgChange >= 0 ? "+" : ""}{isNaN(stats.avgChange) ? "0.00" : stats.avgChange.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Gainers Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.gainers}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Decliners Today</p>
              <p className="text-3xl font-bold text-red-600">{stats.losers}</p>
            </div>
          </div>
        )}

        {isLoadingStocks ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : portfolioSymbols.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your portfolio is empty</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Start adding stocks to track their performance and build your investment watchlist
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              <span>Add Your First Stock</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Change</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">Volume</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase hidden lg:table-cell">Market Cap</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {portfolioSymbols.map((symbol) => {
                    const stock = stocksData.get(symbol);
                    const isPositive = (stock?.changePercent || 0) >= 0;

                    return (
                      <tr key={symbol} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/stocks/${symbol}`} className="group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center">
                                <span className="text-purple-700 dark:text-purple-400 font-bold text-sm">
                                  {symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-1 transition-colors">
                                  {symbol}
                                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
                                  {stock?.name || symbol}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₦{stock?.price?.toFixed(2) || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                            isPositive ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                          }`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="font-medium text-sm">
                              {isPositive ? "+" : ""}{stock?.changePercent?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-400 hidden md:table-cell">
                          {stock?.volume ? formatVolume(stock.volume) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-400 hidden lg:table-cell">
                          {stock?.marketCap ? formatCurrency(stock.marketCap) : "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removeFromPortfolio(symbol)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                            title="Remove from portfolio"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Stock to Portfolio</h2>
              <button
                onClick={() => { setShowAddModal(false); setSearchQuery(""); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {filteredStocks.slice(0, 20).map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => addToPortfolio(stock.symbol)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center">
                      <span className="text-purple-700 dark:text-purple-400 font-bold text-sm">
                        {stock.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-[180px]">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₦{stock.price?.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
              {filteredStocks.length === 0 && (
                <p className="text-center py-8 text-gray-500 dark:text-slate-400">No stocks found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
