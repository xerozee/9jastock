"use client";

import { useEffect, useState, use } from "react";
import { Briefcase, TrendingUp, TrendingDown, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Holding {
  id: string;
  symbol: string;
  shares: string;
  purchasePrice: string;
  purchaseDate: string | null;
  notes: string | null;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface GroupedHolding {
  symbol: string;
  name: string;
  totalShares: number;
  avgCostBasis: number;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  transactions: Holding[];
}

export default function SharedPortfolioPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [owner, setOwner] = useState<{ firstName: string | null; lastName: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [portfolioRes, stocksRes] = await Promise.all([
          fetch(`/api/portfolio/public/${shareId}`),
          fetch("/api/stocks"),
        ]);

        if (!portfolioRes.ok) {
          if (portfolioRes.status === 404) {
            setError("This portfolio doesn't exist or has been removed.");
          } else {
            setError("Failed to load portfolio.");
          }
          setIsLoading(false);
          return;
        }

        const portfolioData = await portfolioRes.json();
        const stocksData = await stocksRes.json();

        setOwner(portfolioData.owner);
        setHoldings(portfolioData.holdings || []);
        setStocks(stocksData.data || []);
      } catch (err) {
        setError("Failed to load portfolio.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [shareId]);

  const getStockBySymbol = (symbol: string): Stock | undefined => {
    return stocks.find((s) => s.symbol === symbol || s.symbol === `NGX:${symbol}`);
  };

  const groupedHoldings: GroupedHolding[] = holdings.reduce((acc: GroupedHolding[], holding) => {
    const existing = acc.find((g) => g.symbol === holding.symbol);
    const stock = getStockBySymbol(holding.symbol);
    const shares = parseFloat(holding.shares) || 0;
    const purchasePrice = parseFloat(holding.purchasePrice) || 0;
    const currentPrice = stock?.price || purchasePrice;

    if (existing) {
      existing.totalShares += shares;
      existing.totalCost += shares * purchasePrice;
      existing.currentValue = existing.totalShares * currentPrice;
      existing.avgCostBasis = existing.totalCost / existing.totalShares;
      existing.gainLoss = existing.currentValue - existing.totalCost;
      existing.gainLossPercent = existing.totalCost > 0 ? (existing.gainLoss / existing.totalCost) * 100 : 0;
      existing.transactions.push(holding);
    } else {
      const currentValue = shares * currentPrice;
      const totalCost = shares * purchasePrice;
      acc.push({
        symbol: holding.symbol,
        name: stock?.name || holding.symbol,
        totalShares: shares,
        avgCostBasis: purchasePrice,
        currentPrice,
        currentValue,
        totalCost,
        gainLoss: currentValue - totalCost,
        gainLossPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
        transactions: [holding],
      });
    }

    return acc;
  }, []);

  const portfolioStats = {
    totalValue: groupedHoldings.reduce((sum, h) => sum + h.currentValue, 0),
    totalCost: groupedHoldings.reduce((sum, h) => sum + h.totalCost, 0),
    totalGainLoss: groupedHoldings.reduce((sum, h) => sum + h.gainLoss, 0),
    positionCount: groupedHoldings.length,
  };

  const ownerName = owner?.firstName || owner?.lastName
    ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
    : "Anonymous";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 dark:from-purple-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{ownerName}&apos;s Portfolio</h1>
              <p className="text-purple-100">Shared investment holdings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ₦{portfolioStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm">Cost Basis</p>
              <p className="text-2xl font-bold text-white">
                ₦{portfolioStats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${portfolioStats.totalGainLoss >= 0 ? "text-green-300" : "text-red-300"}`}>
                {portfolioStats.totalGainLoss >= 0 ? "+" : ""}₦{portfolioStats.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm">Positions</p>
              <p className="text-2xl font-bold text-white">{portfolioStats.positionCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groupedHoldings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Holdings Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">This portfolio is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedHoldings.map((holding) => (
              <div
                key={holding.symbol}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {holding.symbol.replace("NGX:", "").slice(0, 3)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {holding.symbol.replace("NGX:", "")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₦{holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <div className={`flex items-center justify-end gap-1 text-sm ${holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {holding.gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>
                          {holding.gainLoss >= 0 ? "+" : ""}₦{holding.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          ({holding.gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                      <p className="font-medium text-gray-900 dark:text-white">{holding.totalShares.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Cost</p>
                      <p className="font-medium text-gray-900 dark:text-white">₦{holding.avgCostBasis.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">₦{holding.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                      <p className="font-medium text-gray-900 dark:text-white">₦{holding.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Want to track your own portfolio?</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            Create Your Free Account
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
