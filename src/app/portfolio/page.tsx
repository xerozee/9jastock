"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Clock,
  Calendar,
  DollarSign,
  Hash,
  Trash2,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Crown,
  Sparkles,
  Zap
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useSubscription } from "@/hooks/useSubscription";
import { TIER_LIMITS } from "@/lib/subscription";
import { PremiumBadge } from "@/components/PremiumWrapper";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sector: string;
}

interface Holding {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  notes: string | null;
  createdAt: string;
}

interface GroupedHolding {
  symbol: string;
  name: string;
  totalShares: number;
  avgCostBasis: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Holding[];
}

export default function PortfolioPage() {
  const { isPremium, tier } = useSubscription();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [stocksMap, setStocksMap] = useState<Map<string, StockData>>(new Map());
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSymbols, setExpandedSymbols] = useState<Set<string>>(new Set());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [newHolding, setNewHolding] = useState({
    symbol: "",
    shares: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isLoadingShare, setIsLoadingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<{ currentCount: number; maxItems: number } | null>(null);
  const [showNonPremiumNotice, setShowNonPremiumNotice] = useState(false);

  const refreshInterval = TIER_LIMITS[tier]?.refreshInterval || TIER_LIMITS.free.refreshInterval;

  useEffect(() => {
    if (!hasFetched) {
      fetchHoldings();
      fetchStocksData();
      setHasFetched(true);
    }
  }, [hasFetched]);

  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    if (refreshInterval > 0 && hasFetched) {
      refreshIntervalRef.current = setInterval(() => {
        setIsAutoRefreshing(true);
        fetchStocksData(false).finally(() => setIsAutoRefreshing(false));
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, hasFetched]);

  useEffect(() => {
    if (!isLoadingHoldings && holdings.length > 0 && !isPremium) {
      setShowNonPremiumNotice(true);
    }
  }, [holdings, isLoadingHoldings, isPremium]);

  const fetchHoldings = async (showLoading = true) => {
    if (showLoading) setIsLoadingHoldings(true);
    try {
      const response = await fetch("/api/holdings");
      if (response.ok) {
        const data = await response.json();
        setHoldings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch holdings:", error);
    } finally {
      setIsLoadingHoldings(false);
    }
  };

  const fetchStocksData = async (showLoading = true) => {
    if (showLoading) setIsLoadingStocks(true);
    try {
      const response = await fetch("/api/stocks");
      if (response.ok) {
        const data = await response.json();
        const map = new Map<string, StockData>();
        data.data.forEach((stock: StockData) => {
          map.set(stock.symbol, stock);
        });
        setStocksMap(map);
        setAllStocks(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch stocks data:", error);
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const handleShare = async () => {
    setIsLoadingShare(true);
    setShowShareModal(true);
    try {
      const response = await fetch("/api/portfolio/share");
      if (response.ok) {
        const data = await response.json();
        setShareId(data.shareId);
      }
    } catch (error) {
      console.error("Failed to get share link:", error);
    } finally {
      setIsLoadingShare(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined" && shareId) {
      return `${window.location.origin}/portfolio/share/${shareId}`;
    }
    return "";
  };

  const copyShareLink = async () => {
    const url = getShareUrl();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolding.symbol || !newHolding.shares || !newHolding.purchasePrice) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: newHolding.symbol,
          shares: parseFloat(newHolding.shares),
          purchasePrice: parseFloat(newHolding.purchasePrice),
          purchaseDate: newHolding.purchaseDate,
          notes: newHolding.notes || null,
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.limitReached) {
        setShowAddModal(false);
        setUpgradeInfo({ currentCount: data.currentCount, maxItems: data.maxItems });
        setShowUpgradeModal(true);
        return;
      }

      if (response.ok) {
        await fetchHoldings();
        setShowAddModal(false);
        setNewHolding({
          symbol: "",
          shares: "",
          purchasePrice: "",
          purchaseDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Failed to add holding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    try {
      const response = await fetch("/api/holdings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: holdingId }),
      });

      if (response.ok) {
        await fetchHoldings();
      } else {
        const data = await response.json();
        console.error("Delete failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to delete holding:", error);
    }
  };

  const selectStock = (stock: StockData) => {
    setNewHolding({
      ...newHolding,
      symbol: stock.symbol,
      purchasePrice: stock.price.toString(),
    });
    setSearchQuery("");
  };

  const toggleExpanded = (symbol: string) => {
    const newExpanded = new Set(expandedSymbols);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedSymbols(newExpanded);
  };

  const findStockBySymbol = (symbol: string): StockData | undefined => {
    const exactMatch = stocksMap.get(symbol);
    if (exactMatch) return exactMatch;
    
    const withPrefix = stocksMap.get(`NGX:${symbol}`);
    if (withPrefix) return withPrefix;
    
    for (const [key, stock] of stocksMap) {
      if (key.replace('NGX:', '') === symbol) return stock;
    }
    return undefined;
  };

  const groupedHoldings = useMemo(() => {
    const groups = new Map<string, GroupedHolding>();

    holdings.forEach(holding => {
      const stock = findStockBySymbol(holding.symbol);
      const currentPrice = stock?.price || holding.purchasePrice;
      const holdingValue = holding.shares * currentPrice;
      const holdingCost = holding.shares * holding.purchasePrice;

      if (groups.has(holding.symbol)) {
        const group = groups.get(holding.symbol)!;
        group.totalShares += holding.shares;
        group.totalCost += holdingCost;
        group.currentValue += holdingValue;
        group.holdings.push(holding);
      } else {
        groups.set(holding.symbol, {
          symbol: holding.symbol,
          name: stock?.name || holding.symbol,
          totalShares: holding.shares,
          avgCostBasis: holding.purchasePrice,
          totalCost: holdingCost,
          currentPrice,
          currentValue: holdingValue,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          holdings: [holding],
        });
      }
    });

    groups.forEach(group => {
      group.avgCostBasis = group.totalCost / group.totalShares;
      group.totalGainLoss = group.currentValue - group.totalCost;
      group.totalGainLossPercent = ((group.currentValue - group.totalCost) / group.totalCost) * 100;
    });

    return Array.from(groups.values()).sort((a, b) => b.currentValue - a.currentValue);
  }, [holdings, stocksMap]);

  const portfolioStats = useMemo(() => {
    const totalValue = groupedHoldings.reduce((sum, g) => sum + g.currentValue, 0);
    const totalCost = groupedHoldings.reduce((sum, g) => sum + g.totalCost, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    const positionsCount = groupedHoldings.length;
    const transactionsCount = holdings.length;

    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent, positionsCount, transactionsCount };
  }, [groupedHoldings, holdings]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredStocks = allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingStocks || isLoadingHoldings;

  return (
    <AuthGuard pageName="your portfolio">
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`relative rounded-3xl p-8 mb-8 text-white overflow-hidden ${
          isPremium 
            ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-500 dark:from-slate-900 dark:via-amber-900/50 dark:to-slate-800' 
            : 'bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 dark:from-slate-800 dark:via-purple-900 dark:to-slate-800'
        }`} style={isPremium ? { boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' } : undefined}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                isPremium ? 'bg-amber-500/30 border border-amber-400/50' : 'bg-white/10 backdrop-blur-sm'
              }`}>
                {isPremium ? <Crown size={16} className="text-amber-200" /> : <Briefcase size={16} />}
                <span>{isPremium ? 'Premium Portfolio' : 'Holdings Tracker'}</span>
                {isPremium && <PremiumBadge size="sm" />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Portfolio</h1>
              <p className={`text-lg ${isPremium ? 'text-amber-100' : 'text-purple-100 dark:text-slate-300'}`}>
                {isPremium ? 'Real-time tracking with 1-minute updates' : 'Track your NGX stock holdings and performance'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                <span>Add Position</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all"
                title="Share Portfolio"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => { fetchHoldings(false); fetchStocksData(false); }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500">
              <Clock size={14} />
              <span>Prices updated: {lastUpdated.toLocaleTimeString()}</span>
              {isAutoRefreshing && (
                <span className="flex items-center gap-1 text-amber-500">
                  <RefreshCw size={12} className="animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isPremium 
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
            }`}>
              {isPremium ? <Zap size={12} /> : <Clock size={12} />}
              <span>Auto-refresh: {isPremium ? '1 min' : '5 min'}</span>
            </div>
          </div>
        )}

        {holdings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioStats.totalValue)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${portfolioStats.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {portfolioStats.totalGainLoss >= 0 ? "+" : ""}{formatCurrency(portfolioStats.totalGainLoss)}
              </p>
              <p className={`text-sm ${portfolioStats.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {portfolioStats.totalGainLossPercent >= 0 ? "+" : ""}{formatNumber(portfolioStats.totalGainLossPercent)}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Cost Basis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioStats.totalCost)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Positions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{portfolioStats.positionsCount}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{portfolioStats.transactionsCount} transactions</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your portfolio is empty</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Start tracking your holdings by adding your first stock position with shares and purchase details
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              <span>Add Your First Position</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedHoldings.map(group => {
              const isExpanded = expandedSymbols.has(group.symbol);
              const isPositive = group.totalGainLoss >= 0;

              return (
                <div key={group.symbol} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => toggleExpanded(group.symbol)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center">
                          <span className="text-purple-700 dark:text-purple-400 font-bold">{group.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <Link href={`/stocks/${group.symbol}`} className="group" onClick={e => e.stopPropagation()}>
                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-1 transition-colors">
                              {group.symbol}
                              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{group.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Shares</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(group.totalShares)}</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Avg Cost</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(group.avgCostBasis)}</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Current Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(group.currentPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Value</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(group.currentValue)}</p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Gain/Loss</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                            isPositive ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                          }`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="font-medium text-sm">{isPositive ? "+" : ""}{formatNumber(group.totalGainLossPercent)}%</span>
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-slate-500">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-slate-700">
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50">
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Transaction History</p>
                        <div className="space-y-2">
                          {group.holdings.map(holding => {
                            const holdingValue = holding.shares * group.currentPrice;
                            const holdingCost = holding.shares * holding.purchasePrice;
                            const holdingGain = holdingValue - holdingCost;
                            const holdingGainPercent = ((holdingValue - holdingCost) / holdingCost) * 100;
                            const isHoldingPositive = holdingGain >= 0;

                            return (
                              <div key={holding.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                    <Calendar size={14} />
                                    <span>{new Date(holding.purchaseDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                    <Hash size={14} />
                                    <span>{formatNumber(holding.shares)} shares</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                    <DollarSign size={14} />
                                    <span>@ {formatCurrency(holding.purchasePrice)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className={`text-sm font-medium ${isHoldingPositive ? "text-green-600" : "text-red-600"}`}>
                                    {isHoldingPositive ? "+" : ""}{formatCurrency(holdingGain)} ({isHoldingPositive ? "+" : ""}{formatNumber(holdingGainPercent)}%)
                                  </div>
                                  <button
                                    onClick={() => handleDeleteHolding(holding.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete transaction"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Stock Position</h2>
              <button
                onClick={() => { setShowAddModal(false); setSearchQuery(""); setNewHolding({ symbol: "", shares: "", purchasePrice: "", purchaseDate: new Date().toISOString().split("T")[0], notes: "" }); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddHolding} className="p-5 space-y-4">
              {!newHolding.symbol ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a stock..."
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto -mx-5 px-5">
                    {filteredStocks.slice(0, 15).map((stock) => (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => selectStock(stock)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center">
                            <span className="text-purple-700 dark:text-purple-400 font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-[180px]">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">₦{stock.price?.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                    {filteredStocks.length === 0 && (
                      <p className="text-center py-8 text-gray-500 dark:text-slate-400">No stocks found</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800 rounded-xl flex items-center justify-center">
                      <span className="text-purple-700 dark:text-purple-300 font-bold">{newHolding.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900 dark:text-purple-200">{newHolding.symbol}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{stocksMap.get(newHolding.symbol)?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewHolding({ ...newHolding, symbol: "" })}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Number of Shares
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        min="0.000001"
                        value={newHolding.shares}
                        onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                        placeholder="100"
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Purchase Price (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newHolding.purchasePrice}
                        onChange={(e) => setNewHolding({ ...newHolding, purchasePrice: e.target.value })}
                        placeholder="25.50"
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={newHolding.purchaseDate}
                      onChange={(e) => setNewHolding({ ...newHolding, purchaseDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={newHolding.notes}
                      onChange={(e) => setNewHolding({ ...newHolding, notes: e.target.value })}
                      placeholder="e.g., Bought via GTBank"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {newHolding.shares && newHolding.purchasePrice && (
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Investment</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(newHolding.shares) * parseFloat(newHolding.purchasePrice))}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !newHolding.shares || !newHolding.purchasePrice}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Position
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                Share Portfolio
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {isLoadingShare ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : shareId ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Anyone with this link can view your portfolio holdings and performance.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareUrl()}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 border-none rounded-xl text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                        copied
                          ? "bg-green-500 text-white"
                          : "bg-purple-500 hover:bg-purple-600 text-white"
                      }`}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    This link will remain active until you generate a new one.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">Failed to generate share link. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNonPremiumNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
              <p className="text-white/90">
                Portfolio tracking is now a Premium feature
              </p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Your existing portfolio with {holdings.length} position{holdings.length > 1 ? 's' : ''} is safely stored. Upgrade to Premium to:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>View real-time portfolio returns</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>1-minute live price updates</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>Add unlimited positions</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Share2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>Share your portfolio performance</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNonPremiumNotice(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Maybe Later
                </button>
                <Link
                  href="/pricing"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Portfolio Limit Reached</h2>
              <p className="text-white/90">
                You're tracking {upgradeInfo?.currentCount || 0} of {upgradeInfo?.maxItems || 10} stocks
              </p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Upgrade to Premium for unlimited portfolio tracking and more:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>Unlimited stock tracking</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>1-minute real-time data refresh</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>AI-powered stock recommendations</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Maybe Later
                </button>
                <Link
                  href="/pricing"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
