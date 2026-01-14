"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Trash2, 
  RefreshCw,
  LogIn,
  Loader2,
  ArrowUpRight
} from "lucide-react";

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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { items, isLoading: portfolioLoading, removeFromPortfolio, refresh } = usePortfolio();
  const [stocksData, setStocksData] = useState<Map<string, StockData>>(new Map());
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      fetchStocksData();
    }
  }, [items]);

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
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch stocks data:", error);
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const handleRefresh = () => {
    refresh();
    fetchStocksData();
  };

  const handleRemove = async (symbol: string) => {
    await removeFromPortfolio(symbol);
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
    let totalVolume = 0;
    let gainers = 0;
    let losers = 0;
    let validStocks = 0;

    items.forEach(item => {
      const stock = stocksData.get(item.symbol);
      if (stock) {
        validStocks++;
        totalChange += stock.changePercent || 0;
        totalVolume += stock.volume || 0;
        if ((stock.changePercent || 0) > 0) gainers++;
        else if ((stock.changePercent || 0) < 0) losers++;
      }
    });

    const avgChange = validStocks > 0 ? totalChange / validStocks : 0;

    return { totalVolume, avgChange, gainers, losers, validStocks };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <Briefcase className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Portfolio</h1>
          <p className="text-gray-600 mb-6">
            Sign in to create and track your personal stock portfolio
          </p>
          <a
            href="/api/auth/login"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <LogIn size={20} />
            <span>Sign In to Get Started</span>
          </a>
        </div>
      </div>
    );
  }

  const stats = calculatePortfolioStats();

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Briefcase className="text-green-600" />
              My Portfolio
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName || user?.email?.split("@")[0] || "Investor"}!
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoadingStocks || portfolioLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoadingStocks ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Stocks Tracked</p>
              <p className="text-2xl font-bold text-gray-800">{items.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Avg. Daily Change</p>
              <p className={`text-2xl font-bold ${stats.avgChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.avgChange >= 0 ? "+" : ""}{isNaN(stats.avgChange) ? "0.00" : stats.avgChange.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Gainers Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.gainers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Decliners Today</p>
              <p className="text-2xl font-bold text-red-600">{stats.losers}</p>
            </div>
          </div>
        )}

        {portfolioLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your portfolio is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding stocks to track their performance
            </p>
            <Link
              href="/stocks"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <TrendingUp size={20} />
              <span>Browse Stocks</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Volume</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Market Cap</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Week</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">Month</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">Year</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const stock = stocksData.get(item.symbol);
                    const isPositive = (stock?.changePercent || 0) >= 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/stocks/${item.symbol}`} className="group">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-700 font-bold text-sm">
                                  {item.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 group-hover:text-green-600 flex items-center gap-1">
                                  {item.symbol}
                                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {stock?.name || item.symbol}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-800">
                            ₦{stock?.price?.toFixed(2) || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${
                            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="font-medium text-sm">
                              {isPositive ? "+" : ""}{stock?.changePercent?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 hidden md:table-cell">
                          {stock?.volume ? formatVolume(stock.volume) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 hidden lg:table-cell">
                          {stock?.marketCap ? formatCurrency(stock.marketCap) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right hidden lg:table-cell">
                          <span className={`font-medium ${(stock?.perfWeek || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {stock?.perfWeek !== undefined ? `${stock.perfWeek >= 0 ? "+" : ""}${stock.perfWeek.toFixed(2)}%` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden xl:table-cell">
                          <span className={`font-medium ${(stock?.perfMonth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {stock?.perfMonth !== undefined ? `${stock.perfMonth >= 0 ? "+" : ""}${stock.perfMonth.toFixed(2)}%` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden xl:table-cell">
                          <span className={`font-medium ${(stock?.perfYear || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {stock?.perfYear !== undefined ? `${stock.perfYear >= 0 ? "+" : ""}${stock.perfYear.toFixed(2)}%` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRemove(item.symbol)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from portfolio"
                          >
                            <Trash2 size={18} />
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
    </div>
  );
}
