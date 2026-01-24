'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Star, RefreshCw, Clock, 
  Activity, BarChart3, PieChart, DollarSign, Percent, TrendingDown as TrendDown,
  ChevronRight, Building2, LineChart, Scale, Wallet, Users, BarChart2, Plus, Check,
  Target, AlertTriangle, Briefcase, FileText, Globe, Phone, MapPin, Info
} from 'lucide-react';

const TradingViewWidget = lazy(() => import('@/components/TradingViewWidget'));
const TradingViewTechnicalAnalysis = lazy(() => import('@/components/TradingViewTechnicalAnalysis'));
const TradingViewFinancials = lazy(() => import('@/components/TradingViewFinancials'));
const FinancialDocuments = lazy(() => import('@/components/FinancialDocuments'));

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="h-[500px] bg-slate-100 dark:bg-slate-700/50 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 dark:text-slate-500">Loading chart...</p>
        </div>
      </div>
    </div>
  );
}

function WidgetSkeleton({ title, height = 450 }: { title: string; height?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div style={{ height: `${height}px` }} className="bg-slate-100 dark:bg-slate-700/50 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 dark:text-slate-500">Loading {title}...</p>
        </div>
      </div>
    </div>
  );
}
import LiveIndicator from '@/components/LiveIndicator';
import PremiumGate from '@/components/PremiumGate';
import TechnicalAnalysisSummary from '@/components/TechnicalAnalysisSummary';
import { useWatchlist } from '@/lib/watchlistContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useLiveStock, formatLastUpdate } from '@/lib/useLiveStocks';
import {
  getStockBySymbol,
  formatCurrency,
  formatVolume,
  formatLargeNumber,
} from '@/lib/stockData';
import { Stock } from '@/types/stock';
import { YahooFinanceData } from '@/lib/yahooFinance';

function getRecommendationLabel(value: number | undefined): { label: string; color: string; bg: string } {
  if (value === undefined || value === 0) return { label: 'Neutral', color: 'text-gray-600', bg: 'bg-gray-100' };
  if (value >= 0.5) return { label: 'Strong Buy', color: 'text-green-700', bg: 'bg-green-100' };
  if (value >= 0.1) return { label: 'Buy', color: 'text-green-600', bg: 'bg-green-50' };
  if (value <= -0.5) return { label: 'Strong Sell', color: 'text-red-700', bg: 'bg-red-100' };
  if (value <= -0.1) return { label: 'Sell', color: 'text-red-600', bg: 'bg-red-50' };
  return { label: 'Neutral', color: 'text-gray-600', bg: 'bg-gray-100' };
}

function getRSIStatus(rsi: number | undefined): { label: string; color: string } {
  if (!rsi) return { label: 'N/A', color: 'text-gray-500' };
  if (rsi >= 70) return { label: 'Overbought', color: 'text-red-600' };
  if (rsi <= 30) return { label: 'Oversold', color: 'text-green-600' };
  return { label: 'Neutral', color: 'text-gray-600' };
}

function formatYahooPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

function formatYahooLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `₦${(value / 1e3).toFixed(2)}K`;
  return `₦${value.toFixed(2)}`;
}

function StatCard({ label, value, subValue, icon: Icon, trend }: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={16} className="text-gray-400 dark:text-gray-500" />}
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${trendColor}`}>{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
}

function PerformanceBar({ label, value }: { label: string; value: number | undefined }) {
  if (value === undefined || value === 0) return null;
  const isPositive = value >= 0;
  const width = Math.min(Math.abs(value), 100);
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
          <div 
            className={`absolute h-full ${isPositive ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'} rounded-full`}
            style={{ width: `${width / 2}%` }}
          />
        </div>
        <span className={`text-sm font-medium w-16 text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function TechnicalGauge({ label, value, min, max, zones }: { 
  label: string; 
  value: number | undefined;
  min: number;
  max: number;
  zones?: { oversold: number; overbought: number };
}) {
  if (value === undefined) return null;
  const percent = ((value - min) / (max - min)) * 100;
  const clampedPercent = Math.max(0, Math.min(100, percent));
  
  let statusColor = 'bg-gray-500';
  if (zones) {
    if (value <= zones.oversold) statusColor = 'bg-green-500';
    else if (value >= zones.overbought) statusColor = 'bg-red-500';
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium dark:text-gray-200">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full relative">
        <div 
          className={`absolute w-3 h-3 ${statusColor} rounded-full -top-0.5 transform -translate-x-1/2`}
          style={{ left: `${clampedPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function AnalystRatingBar({ buy, hold, sell }: { buy: number; hold: number; sell: number }) {
  const total = buy + hold + sell;
  if (total === 0) return <p className="text-gray-500 text-sm">No analyst data available</p>;
  
  const buyPercent = (buy / total) * 100;
  const holdPercent = (hold / total) * 100;
  const sellPercent = (sell / total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex h-6 rounded-lg overflow-hidden">
        {buy > 0 && (
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${buyPercent}%` }}
          >
            {buy}
          </div>
        )}
        {hold > 0 && (
          <div 
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${holdPercent}%` }}
          >
            {hold}
          </div>
        )}
        {sell > 0 && (
          <div 
            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${sellPercent}%` }}
          >
            {sell}
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-600">Buy: {buy}</span>
        <span className="text-yellow-600">Hold: {hold}</span>
        <span className="text-red-600">Sell: {sell}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children }: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={iconColor} size={24} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function RiskMeter({ value, label }: { value: number | null; label: string }) {
  if (value === null) return null;
  
  const getColor = (v: number) => {
    if (v <= 3) return 'bg-green-500';
    if (v <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium dark:text-gray-200">{value}/10</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} rounded-full transition-all`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { limits, isPremium } = useSubscription();
  const refreshInterval = limits.refreshInterval;

  const { stock: liveStock, isLoading, refresh, lastRefresh } = useLiveStock(symbol, refreshInterval);
  const staticStock = getStockBySymbol(symbol);
  const stock = liveStock || staticStock;
  
  const [yahooData, setYahooData] = useState<YahooFinanceData | null>(null);
  const [yahooLoading, setYahooLoading] = useState(true);
  
  useEffect(() => {
    async function fetchYahooData() {
      try {
        setYahooLoading(true);
        const res = await fetch(`/api/stocks/${symbol}/yahoo`);
        const data = await res.json();
        if (data.success && data.data) {
          setYahooData(data.data);
        }
      } catch (error) {
        console.error('Error fetching Yahoo Finance data:', error);
      } finally {
        setYahooLoading(false);
      }
    }
    
    if (symbol) {
      fetchYahooData();
    }
  }, [symbol]);

  if (!stock && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stock Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The stock with symbol &quot;{symbol}&quot; could not be found.
          </p>
          <Link href="/stocks" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
            <ArrowLeft size={18} className="mr-2" />
            Back to all stocks
          </Link>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/stocks" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to all stocks
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
            <span className="text-gray-500 dark:text-gray-400">{stock.name}</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stock.price)}
            </span>
            <span className={`text-lg font-semibold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <PremiumGate
          title="In-Depth Stock Analysis"
          description="Upgrade to Premium to unlock detailed technical analysis, financial metrics, charts, and more for all 145+ NGX stocks."
          features={[
            "Real-time price charts",
            "Technical indicators (RSI, MACD)",
            "Financial statements",
            "Analyst recommendations",
            "Historical performance",
            "Unlimited portfolio tracking"
          ]}
        />
      </div>
    );
  }

  const extendedStock = stock as Stock;
  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);
  const isLive = 'isLive' in stock ? Boolean(stock.isLive) : false;
  const lastUpdated = 'lastUpdated' in stock ? (stock.lastUpdated as number | null) : null;
  const recommendation = getRecommendationLabel(extendedStock.recommendAll);
  const rsiStatus = getRSIStatus(extendedStock.rsi);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/stocks" className="hover:text-green-600">Stocks</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-medium">{stock.symbol}</span>
      </nav>

      {/* Main Stock Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
              {stock.sector && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                  {stock.sector}
                </span>
              )}
              <button 
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`p-2 rounded-full transition-colors ${inWatchlist ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Star size={20} fill={inWatchlist ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">{stock.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <LiveIndicator isLive={isLive} lastUpdated={lastUpdated} />
              <span className={`px-2 py-1 rounded text-xs font-medium ${recommendation.bg} ${recommendation.color}`}>
                {recommendation.label}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(stock.price)}</p>
            <div className={`flex items-center justify-end gap-2 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="text-xl font-semibold">
                {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Market Cap: {extendedStock.marketCap ? formatLargeNumber(extendedStock.marketCap) : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t dark:border-slate-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Open</p>
            <p className="text-lg font-semibold dark:text-white">{formatCurrency(stock.open)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">High</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(stock.high)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Low</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(stock.low)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Prev Close</p>
            <p className="text-lg font-semibold dark:text-white">{formatCurrency(extendedStock.prevClose || stock.open)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Volume</p>
            <p className="text-lg font-semibold dark:text-white">{formatVolume(stock.volume)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">52W Range</p>
            <p className="text-sm font-semibold dark:text-white">
              {extendedStock.low52Week ? formatCurrency(extendedStock.low52Week) : 'N/A'} - {extendedStock.high52Week ? formatCurrency(extendedStock.high52Week) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Chart - Lazy loaded for performance */}
      <div className="mb-6">
        <Suspense fallback={<ChartSkeleton />}>
          <TradingViewWidget symbol={stock.symbol} height={500} />
        </Suspense>
      </div>

      {/* Technical Analysis Summary */}
      <div className="mb-6">
        <TechnicalAnalysisSummary
          recommendation={extendedStock.recommendAll}
          rsi={extendedStock.rsi}
          macd={extendedStock.macd}
          macdSignal={extendedStock.macdSignal}
          sma20={extendedStock.sma20}
          sma50={extendedStock.sma50}
          sma200={extendedStock.sma200}
          ema20={extendedStock.ema20}
          ema50={extendedStock.ema50}
          ema200={extendedStock.ema200}
          currentPrice={liveStock?.price || stock.price}
        />
      </div>

      {/* TradingView Technical Analysis Widget */}
      <div className="mb-6">
        <Suspense fallback={<WidgetSkeleton title="Technical Analysis" height={450} />}>
          <TradingViewTechnicalAnalysis symbol={stock.symbol} height={450} />
        </Suspense>
      </div>

      {/* Company Overview Section - TradingView Primary */}
      <SectionCard title="Company Overview" icon={Building2} iconColor="text-blue-600">
        {yahooData?.companyProfile?.description ? (
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {yahooData.companyProfile.description}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-4 italic">
            {stock.name} is a company listed on the Nigerian Stock Exchange (NSENG) in the {extendedStock.industry || extendedStock.sector || stock.sector || 'General'} sector.
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Industry</p>
              <p className="font-medium dark:text-white">{extendedStock.industry || yahooData?.companyProfile?.industry || stock.sector || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Sector</p>
              <p className="font-medium dark:text-white">{extendedStock.sector || yahooData?.companyProfile?.sector || stock.sector || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Employees</p>
              <p className="font-medium dark:text-white">{extendedStock.employees?.toLocaleString() || yahooData?.companyProfile?.fullTimeEmployees?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Country</p>
              <p className="font-medium dark:text-white">{extendedStock.country || yahooData?.companyProfile?.country || 'Nigeria'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Exchange</p>
              <p className="font-medium dark:text-white">{extendedStock.exchange || 'NSENG'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Currency</p>
              <p className="font-medium dark:text-white">{extendedStock.currency || 'NGN'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium dark:text-white capitalize">{extendedStock.type || 'Stock'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Beta (1Y)</p>
              <p className="font-medium dark:text-white">{extendedStock.beta?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Analyst Ratings Section */}
      <SectionCard title="Analyst Ratings & Price Targets" icon={Target} iconColor="text-purple-600">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">TradingView Signals</h3>
            <div className="text-center mb-4">
              <div className={`inline-block px-6 py-3 rounded-xl text-xl font-bold ${recommendation.bg} ${recommendation.color}`}>
                {recommendation.label}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Overall Rating: {extendedStock.recommendAll?.toFixed(2) || 'N/A'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Moving Averages</span>
                <span className={`text-sm font-medium ${(extendedStock.recommendMA || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {extendedStock.recommendMA?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Oscillators</span>
                <span className={`text-sm font-medium ${(extendedStock.recommendOther || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {extendedStock.recommendOther?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
            
            {(extendedStock.buySignals || extendedStock.sellSignals || extendedStock.neutralSignals) && (
              <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{extendedStock.buySignals || 0}</p>
                    <p className="text-xs text-gray-500">Buy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{extendedStock.neutralSignals || 0}</p>
                    <p className="text-xs text-gray-500">Neutral</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{extendedStock.sellSignals || 0}</p>
                    <p className="text-xs text-gray-500">Sell</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Analyst Consensus</h3>
            {yahooData?.analystRatings ? (
              <div className="space-y-4">
                <AnalystRatingBar 
                  buy={yahooData.analystRatings.totalBuy}
                  hold={yahooData.analystRatings.totalHold}
                  sell={yahooData.analystRatings.totalSell}
                />
                
                {yahooData.analystRatings.numberOfAnalystOpinions > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-green-600">Target High</p>
                      <p className="text-lg font-semibold text-green-700">
                        {yahooData.analystRatings.targetHighPrice ? formatCurrency(yahooData.analystRatings.targetHighPrice) : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-xs text-red-600">Target Low</p>
                      <p className="text-lg font-semibold text-red-700">
                        {yahooData.analystRatings.targetLowPrice ? formatCurrency(yahooData.analystRatings.targetLowPrice) : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg col-span-2">
                      <p className="text-xs text-blue-600">Mean Target Price</p>
                      <p className="text-xl font-bold text-blue-700">
                        {yahooData.analystRatings.targetMeanPrice ? formatCurrency(yahooData.analystRatings.targetMeanPrice) : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {yahooData.analystRatings.numberOfAnalystOpinions} analyst(s)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Analyst data not available for this stock.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Technical Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Technical Indicators */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Technical Indicators</h2>
          </div>
          
          <div className="space-y-4">
            <TechnicalGauge 
              label="RSI (14)" 
              value={extendedStock.rsi} 
              min={0} 
              max={100} 
              zones={{ oversold: 30, overbought: 70 }}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-gray-500">RSI Status</p>
                <p className={`font-semibold ${rsiStatus.color}`}>{rsiStatus.label}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-gray-500">Stochastic %K</p>
                <p className="font-semibold dark:text-white">{extendedStock.stochK?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">MACD</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-xs text-gray-500">MACD</p>
                  <p className={`font-medium ${(extendedStock.macd || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {extendedStock.macd?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-xs text-gray-500">Signal</p>
                  <p className="font-medium dark:text-white">{extendedStock.macdSignal?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-xs text-gray-500">Histogram</p>
                  <p className={`font-medium ${(extendedStock.macdHist || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {extendedStock.macdHist?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Moving Averages</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">SMA 20</span>
                  <span className="font-medium dark:text-white">{extendedStock.sma20 ? formatCurrency(extendedStock.sma20) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">SMA 50</span>
                  <span className="font-medium dark:text-white">{extendedStock.sma50 ? formatCurrency(extendedStock.sma50) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">SMA 200</span>
                  <span className="font-medium dark:text-white">{extendedStock.sma200 ? formatCurrency(extendedStock.sma200) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">EMA 20</span>
                  <span className="font-medium dark:text-white">{extendedStock.ema20 ? formatCurrency(extendedStock.ema20) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">EMA 50</span>
                  <span className="font-medium dark:text-white">{extendedStock.ema50 ? formatCurrency(extendedStock.ema50) : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Other Indicators</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ADX</span>
                  <span className="font-medium dark:text-white">{extendedStock.adx?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ATR</span>
                  <span className="font-medium dark:text-white">{extendedStock.atr?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bollinger Bands & Volatility */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility & Risk</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Bollinger Bands</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 uppercase">Upper</p>
                  <p className="text-lg font-semibold text-red-700">{extendedStock.bbUpper?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase">Middle</p>
                  <p className="text-lg font-semibold dark:text-white">{extendedStock.bbMiddle?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 uppercase">Lower</p>
                  <p className="text-lg font-semibold text-green-700">{extendedStock.bbLower?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Volatility Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Volatility</span>
                  <span className="font-medium dark:text-white">{extendedStock.volatilityWeek?.toFixed(2) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Volatility</span>
                  <span className="font-medium dark:text-white">{extendedStock.volatilityMonth?.toFixed(2) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Beta (1 Year)</span>
                  <span className="font-medium dark:text-white">{extendedStock.beta1Year?.toFixed(2) || yahooData?.keyStats?.beta?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {yahooData?.riskMetrics && (yahooData.riskMetrics.overallRisk || yahooData.riskMetrics.auditRisk) && (
              <div className="pt-4 border-t dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Governance Risk</h3>
                <div className="space-y-3">
                  <RiskMeter value={yahooData.riskMetrics.overallRisk} label="Overall Risk" />
                  <RiskMeter value={yahooData.riskMetrics.auditRisk} label="Audit Risk" />
                  <RiskMeter value={yahooData.riskMetrics.boardRisk} label="Board Risk" />
                  <RiskMeter value={yahooData.riskMetrics.compensationRisk} label="Compensation Risk" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <SectionCard title="Performance" icon={LineChart} iconColor="text-blue-600">
        <div className="space-y-4">
          <PerformanceBar label="1 Week" value={extendedStock.perfWeek} />
          <PerformanceBar label="1 Month" value={extendedStock.perfMonth} />
          <PerformanceBar label="3 Months" value={extendedStock.perf3Month} />
          <PerformanceBar label="6 Months" value={extendedStock.perf6Month} />
          <PerformanceBar label="YTD" value={extendedStock.perfYTD} />
          <PerformanceBar label="1 Year" value={extendedStock.perfYear} />
          <PerformanceBar label="5 Years" value={extendedStock.perf5Year} />
          <PerformanceBar label="All Time" value={extendedStock.perfAllTime} />
        </div>
      </SectionCard>

      {/* Financial Data */}
      <SectionCard title="Income Statement (TTM)" icon={FileText} iconColor="text-emerald-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={extendedStock.revenue ? formatLargeNumber(extendedStock.revenue) : 'N/A'} icon={DollarSign} />
          <StatCard label="Gross Profit" value={extendedStock.grossProfit ? formatLargeNumber(extendedStock.grossProfit) : 'N/A'} />
          <StatCard label="Operating Income" value={extendedStock.operatingIncome ? formatLargeNumber(extendedStock.operatingIncome) : 'N/A'} />
          <StatCard label="Net Income" value={extendedStock.netIncome ? formatLargeNumber(extendedStock.netIncome) : 'N/A'} />
          <StatCard label="EBITDA" value={extendedStock.ebitda ? formatLargeNumber(extendedStock.ebitda) : 'N/A'} />
          <StatCard label="EPS (Basic)" value={extendedStock.eps ? formatCurrency(extendedStock.eps) : 'N/A'} />
          <StatCard label="EPS (Diluted)" value={extendedStock.epsDiluted ? formatCurrency(extendedStock.epsDiluted) : 'N/A'} />
          <StatCard label="Revenue/Share" value={extendedStock.revenuePerShare ? formatCurrency(extendedStock.revenuePerShare) : 'N/A'} />
        </div>
        
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3">Margins</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Gross Margin" 
            value={extendedStock.grossMargin ? `${(extendedStock.grossMargin * 100).toFixed(2)}%` : 'N/A'}
            trend={extendedStock.grossMargin && extendedStock.grossMargin > 0.2 ? 'up' : 'neutral'}
          />
          <StatCard 
            label="Operating Margin" 
            value={extendedStock.operatingMargin ? `${(extendedStock.operatingMargin * 100).toFixed(2)}%` : 'N/A'}
            trend={extendedStock.operatingMargin && extendedStock.operatingMargin > 0.1 ? 'up' : 'neutral'}
          />
          <StatCard 
            label="Net Margin" 
            value={extendedStock.netMargin ? `${(extendedStock.netMargin * 100).toFixed(2)}%` : 'N/A'}
            trend={extendedStock.netMargin && extendedStock.netMargin > 0 ? 'up' : 'down'}
          />
          <StatCard 
            label="Return on Capital" 
            value={extendedStock.returnOnCapital ? `${(extendedStock.returnOnCapital * 100).toFixed(2)}%` : 'N/A'}
            trend={extendedStock.returnOnCapital && extendedStock.returnOnCapital > 0.1 ? 'up' : 'neutral'}
          />
        </div>
      </SectionCard>

      {/* Balance Sheet & Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Balance Sheet" icon={Building2} iconColor="text-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Assets" value={extendedStock.totalAssets ? formatLargeNumber(extendedStock.totalAssets) : 'N/A'} />
            <StatCard label="Total Debt" value={extendedStock.totalDebt ? formatLargeNumber(extendedStock.totalDebt) : 'N/A'} />
            <StatCard label="Total Cash" value={extendedStock.totalCash ? formatLargeNumber(extendedStock.totalCash) : 'N/A'} />
            <StatCard label="Cash/Share" value={extendedStock.cashPerShare ? formatCurrency(extendedStock.cashPerShare) : 'N/A'} />
            <StatCard label="Book Value/Share" value={extendedStock.bookValue ? formatCurrency(extendedStock.bookValue) : 'N/A'} />
            <StatCard label="Tangible Book/Share" value={extendedStock.tangibleBookValue ? formatCurrency(extendedStock.tangibleBookValue) : 'N/A'} />
          </div>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-3">Liquidity Ratios</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label="Debt/Equity" 
              value={extendedStock.debtToEquity?.toFixed(2) || 'N/A'}
              trend={extendedStock.debtToEquity && extendedStock.debtToEquity < 1 ? 'up' : 'down'}
            />
            <StatCard 
              label="Current Ratio" 
              value={extendedStock.currentRatio?.toFixed(2) || 'N/A'}
              trend={extendedStock.currentRatio && extendedStock.currentRatio > 1.5 ? 'up' : 'neutral'}
            />
            <StatCard 
              label="Quick Ratio" 
              value={extendedStock.quickRatio?.toFixed(2) || 'N/A'}
              trend={extendedStock.quickRatio && extendedStock.quickRatio > 1 ? 'up' : 'neutral'}
            />
            <StatCard label="Float Shares" value={extendedStock.floatShares ? formatLargeNumber(extendedStock.floatShares) : 'N/A'} />
          </div>
        </SectionCard>

        <SectionCard title="Valuation" icon={Scale} iconColor="text-amber-600">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Market Cap" value={extendedStock.marketCap ? formatLargeNumber(extendedStock.marketCap) : 'N/A'} icon={DollarSign} />
            <StatCard label="Enterprise Value" value={extendedStock.enterpriseValue ? formatLargeNumber(extendedStock.enterpriseValue) : 'N/A'} />
            <StatCard label="P/E Ratio (TTM)" value={extendedStock.pe?.toFixed(2) || 'N/A'} />
            <StatCard label="PEG Ratio" value={extendedStock.pegRatio?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Book" value={extendedStock.priceToBook?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Sales" value={extendedStock.priceToSales?.toFixed(2) || 'N/A'} />
            <StatCard label="EV/EBITDA" value={extendedStock.evToEbitda?.toFixed(2) || 'N/A'} />
            <StatCard label="EV/Revenue" value={extendedStock.evToRevenue?.toFixed(2) || 'N/A'} />
          </div>
        </SectionCard>
      </div>

      {/* Cash Flow */}
      <SectionCard title="Cash Flow" icon={Wallet} iconColor="text-cyan-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Free Cash Flow" 
            value={extendedStock.freeCashFlow ? formatLargeNumber(extendedStock.freeCashFlow) : yahooData?.financialRatios?.freeCashflow ? formatYahooLargeNumber(yahooData.financialRatios.freeCashflow) : 'N/A'} 
            trend={extendedStock.freeCashFlow && extendedStock.freeCashFlow > 0 ? 'up' : 'down'}
          />
          <StatCard 
            label="Operating Cash Flow" 
            value={yahooData?.financialRatios?.operatingCashflow ? formatYahooLargeNumber(yahooData.financialRatios.operatingCashflow) : 'N/A'} 
          />
          <StatCard 
            label="Cash Per Share" 
            value={extendedStock.cashPerShare ? formatCurrency(extendedStock.cashPerShare) : 'N/A'} 
          />
          <StatCard 
            label="Total Cash Position" 
            value={extendedStock.totalCash ? formatLargeNumber(extendedStock.totalCash) : 'N/A'} 
          />
        </div>
      </SectionCard>

      {/* Profitability & Returns */}
      <SectionCard title="Profitability & Returns" icon={TrendingUp} iconColor="text-green-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Return on Equity" 
            value={extendedStock.roe ? `${extendedStock.roe.toFixed(2)}%` : 'N/A'}
            trend={extendedStock.roe && extendedStock.roe > 15 ? 'up' : 'neutral'}
          />
          <StatCard 
            label="Return on Assets" 
            value={extendedStock.roa ? `${extendedStock.roa.toFixed(2)}%` : 'N/A'}
            trend={extendedStock.roa && extendedStock.roa > 5 ? 'up' : 'neutral'}
          />
          <StatCard 
            label="Return on Capital" 
            value={extendedStock.returnOnCapital ? `${(extendedStock.returnOnCapital * 100).toFixed(2)}%` : 'N/A'}
            trend={extendedStock.returnOnCapital && extendedStock.returnOnCapital > 0.1 ? 'up' : 'neutral'}
          />
          <StatCard 
            label="Dividend Yield" 
            value={extendedStock.dividendYield ? `${extendedStock.dividendYield.toFixed(2)}%` : 'N/A'}
            trend={extendedStock.dividendYield && extendedStock.dividendYield > 3 ? 'up' : 'neutral'}
          />
        </div>
      </SectionCard>

      {/* Earnings Section */}
      {yahooData?.earnings && (yahooData.earnings.earningsHistory.length > 0 || yahooData.earnings.earningsTrend.length > 0) && (
        <SectionCard title="Earnings" icon={FileText} iconColor="text-indigo-600">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {yahooData.earnings.earningsHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Earnings History</h3>
                <div className="space-y-3">
                  {yahooData.earnings.earningsHistory.map((q, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium dark:text-white">{q.quarter}</p>
                        <p className="text-xs text-gray-500">Estimate: {q.epsEstimate?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${(q.epsActual || 0) >= (q.epsEstimate || 0) ? 'text-green-600' : 'text-red-600'}`}>
                          {q.epsActual?.toFixed(2) || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Actual EPS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {yahooData.earnings.earningsTrend.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Earnings Estimates</h3>
                <div className="space-y-3">
                  {yahooData.earnings.earningsTrend.map((t, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium dark:text-white">{t.period}</span>
                        <span className="text-sm text-gray-500">{t.numberOfAnalysts} analysts</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="text-gray-500">Low</p>
                          <p className="font-medium text-red-600">{t.lowEstimate?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current</p>
                          <p className="font-medium dark:text-white">{t.currentEstimate?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">High</p>
                          <p className="font-medium text-green-600">{t.highEstimate?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Institutional Holdings Section */}
      {yahooData?.institutionalHoldings && yahooData.institutionalHoldings.topHolders.length > 0 && (
        <SectionCard title="Institutional Holdings" icon={Briefcase} iconColor="text-teal-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              label="Institutions Held" 
              value={formatYahooPercent(yahooData.institutionalHoldings.institutionPercentHeld)} 
            />
            <StatCard 
              label="Insiders Held" 
              value={formatYahooPercent(yahooData.institutionalHoldings.insidersPercentHeld)} 
            />
            <StatCard 
              label="# of Institutions" 
              value={yahooData.institutionalHoldings.institutionsCount || 0} 
            />
            <StatCard 
              label="Float Held" 
              value={formatYahooPercent(yahooData.institutionalHoldings.institutionsFloatPercentHeld)} 
            />
          </div>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Institutional Holders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left py-2 text-gray-500 font-medium">Holder</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Shares</th>
                  <th className="text-right py-2 text-gray-500 font-medium">% Held</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {yahooData.institutionalHoldings.topHolders.slice(0, 5).map((holder, i) => (
                  <tr key={i} className="border-b dark:border-slate-700/50">
                    <td className="py-2 dark:text-white">{holder.holder}</td>
                    <td className="text-right py-2 dark:text-gray-300">{holder.shares.toLocaleString()}</td>
                    <td className="text-right py-2 dark:text-gray-300">{(holder.percentHeld * 100).toFixed(2)}%</td>
                    <td className="text-right py-2 dark:text-gray-300">{formatYahooLargeNumber(holder.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Comprehensive Financial Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Valuation Ratios */}
        <SectionCard title="Valuation Metrics" icon={Scale} iconColor="text-orange-600">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="P/E Ratio (TTM)" value={extendedStock.pe?.toFixed(2) || yahooData?.financialRatios?.trailingPE?.toFixed(2) || 'N/A'} icon={Percent} />
            <StatCard label="Forward P/E" value={yahooData?.financialRatios?.forwardPE?.toFixed(2) || 'N/A'} />
            <StatCard label="PEG Ratio" value={yahooData?.financialRatios?.pegRatio?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Book" value={extendedStock.priceToBook?.toFixed(2) || yahooData?.financialRatios?.priceToBook?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Sales" value={extendedStock.priceToSales?.toFixed(2) || yahooData?.financialRatios?.priceToSales?.toFixed(2) || 'N/A'} />
            <StatCard label="EV/Revenue" value={yahooData?.financialRatios?.enterpriseToRevenue?.toFixed(2) || 'N/A'} />
            <StatCard label="EV/EBITDA" value={yahooData?.financialRatios?.enterpriseToEbitda?.toFixed(2) || 'N/A'} />
            <StatCard label="Book Value" value={yahooData?.financialRatios?.bookValue ? formatCurrency(yahooData.financialRatios.bookValue) : 'N/A'} />
          </div>
        </SectionCard>

        {/* Profitability */}
        <SectionCard title="Profitability & Margins" icon={Wallet} iconColor="text-green-600">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="EPS (TTM)" value={extendedStock.eps ? formatCurrency(extendedStock.eps) : 'N/A'} icon={DollarSign} />
            <StatCard label="EPS Diluted" value={extendedStock.epsDiluted ? formatCurrency(extendedStock.epsDiluted) : 'N/A'} />
            <StatCard 
              label="Profit Margin" 
              value={formatYahooPercent(yahooData?.financialRatios?.profitMargins)} 
              trend={yahooData?.financialRatios?.profitMargins && yahooData.financialRatios.profitMargins > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
              label="Gross Margin" 
              value={formatYahooPercent(yahooData?.financialRatios?.grossMargins)} 
            />
            <StatCard 
              label="Operating Margin" 
              value={formatYahooPercent(yahooData?.financialRatios?.operatingMargins)} 
            />
            <StatCard 
              label="ROE" 
              value={extendedStock.roe ? `${extendedStock.roe.toFixed(2)}%` : formatYahooPercent(yahooData?.financialRatios?.returnOnEquity)} 
              trend={extendedStock.roe && extendedStock.roe > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
              label="ROA" 
              value={extendedStock.roa ? `${extendedStock.roa.toFixed(2)}%` : formatYahooPercent(yahooData?.financialRatios?.returnOnAssets)} 
              trend={extendedStock.roa && extendedStock.roa > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
              label="Revenue Growth" 
              value={formatYahooPercent(yahooData?.financialRatios?.revenueGrowth)} 
              trend={yahooData?.financialRatios?.revenueGrowth && yahooData.financialRatios.revenueGrowth > 0 ? 'up' : 'down'}
            />
          </div>
        </SectionCard>
      </div>

      {/* Dividends Section */}
      <SectionCard title="Dividends & Shareholder Returns" icon={DollarSign} iconColor="text-green-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Dividend" value={extendedStock.dividend ? formatCurrency(extendedStock.dividend) : 'N/A'} />
          <StatCard label="Dividend Yield" value={extendedStock.dividendYield ? `${extendedStock.dividendYield.toFixed(2)}%` : 'N/A'} />
          <StatCard label="Payout Ratio" value={formatYahooPercent(yahooData?.financialRatios?.payoutRatio)} />
          <StatCard label="Ex-Dividend Date" value={yahooData?.keyStats?.exDividendDate || 'N/A'} />
        </div>
      </SectionCard>

      {/* Financials */}
      <SectionCard title="Financial Statements" icon={BarChart2} iconColor="text-indigo-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={extendedStock.revenue ? formatLargeNumber(extendedStock.revenue) : 'N/A'} />
          <StatCard label="Gross Profit" value={extendedStock.grossProfit ? formatLargeNumber(extendedStock.grossProfit) : 'N/A'} />
          <StatCard label="Net Income" value={extendedStock.netIncome ? formatLargeNumber(extendedStock.netIncome) : 'N/A'} />
          <StatCard label="EBITDA" value={extendedStock.ebitda ? formatLargeNumber(extendedStock.ebitda) : 'N/A'} />
          <StatCard label="Free Cash Flow" value={yahooData?.financialRatios?.freeCashflow ? formatYahooLargeNumber(yahooData.financialRatios.freeCashflow) : 'N/A'} />
          <StatCard label="Operating Cash Flow" value={yahooData?.financialRatios?.operatingCashflow ? formatYahooLargeNumber(yahooData.financialRatios.operatingCashflow) : 'N/A'} />
          <StatCard label="Revenue/Share" value={yahooData?.financialRatios?.revenuePerShare ? formatCurrency(yahooData.financialRatios.revenuePerShare) : 'N/A'} />
          <StatCard label="Cash/Share" value={yahooData?.financialRatios?.totalCashPerShare ? formatCurrency(yahooData.financialRatios.totalCashPerShare) : 'N/A'} />
        </div>
      </SectionCard>

      {/* TradingView Financials Widget */}
      <div className="mb-6">
        <Suspense fallback={<WidgetSkeleton title="Financial Data" height={600} />}>
          <TradingViewFinancials symbol={stock.symbol} height={600} />
        </Suspense>
      </div>

      {/* Financial Documents from African Financials */}
      <div className="mb-6">
        <Suspense fallback={<WidgetSkeleton title="Financial Documents" height={400} />}>
          <FinancialDocuments symbol={stock.symbol} companyName={stock.name} />
        </Suspense>
      </div>

      {/* Balance Sheet */}
      <SectionCard title="Balance Sheet & Liquidity" icon={Building2} iconColor="text-teal-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Assets" value={extendedStock.totalAssets ? formatLargeNumber(extendedStock.totalAssets) : 'N/A'} />
          <StatCard label="Total Debt" value={extendedStock.totalDebt ? formatLargeNumber(extendedStock.totalDebt) : 'N/A'} />
          <StatCard label="Total Cash" value={extendedStock.totalCash ? formatLargeNumber(extendedStock.totalCash) : 'N/A'} />
          <StatCard label="Enterprise Value" value={yahooData?.keyStats?.enterpriseValue ? formatYahooLargeNumber(yahooData.keyStats.enterpriseValue) : 'N/A'} />
          <StatCard label="Debt/Equity" value={extendedStock.debtToEquity?.toFixed(2) || yahooData?.financialRatios?.debtToEquity?.toFixed(2) || 'N/A'} />
          <StatCard label="Current Ratio" value={extendedStock.currentRatio?.toFixed(2) || yahooData?.financialRatios?.currentRatio?.toFixed(2) || 'N/A'} />
          <StatCard label="Quick Ratio" value={extendedStock.quickRatio?.toFixed(2) || yahooData?.financialRatios?.quickRatio?.toFixed(2) || 'N/A'} />
          <StatCard label="Float Shares" value={extendedStock.floatShares ? formatLargeNumber(extendedStock.floatShares) : yahooData?.keyStats?.floatShares ? formatYahooLargeNumber(yahooData.keyStats.floatShares) : 'N/A'} />
        </div>
      </SectionCard>

      {/* Volume Analysis */}
      <SectionCard title="Volume Analysis" icon={BarChart3} iconColor="text-cyan-600">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Today's Volume" value={formatVolume(stock.volume)} />
          <StatCard label="Avg Vol (10d)" value={formatVolume(extendedStock.avgVolume10d || yahooData?.keyStats?.averageVolume10days || 0)} />
          <StatCard label="Avg Vol (30d)" value={formatVolume(extendedStock.avgVolume30d || 0)} />
          <StatCard label="Avg Vol (90d)" value={formatVolume(extendedStock.avgVolume90d || yahooData?.keyStats?.averageVolume || 0)} />
          <StatCard 
            label="Relative Volume" 
            value={extendedStock.relativeVolume?.toFixed(2) || 'N/A'} 
            subValue={extendedStock.relativeVolume && extendedStock.relativeVolume > 1 ? 'Above average' : 'Below average'}
            trend={extendedStock.relativeVolume && extendedStock.relativeVolume > 1 ? 'up' : 'down'}
          />
        </div>
      </SectionCard>

      {/* Key Statistics */}
      <SectionCard title="Key Statistics" icon={Info} iconColor="text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Market Cap" value={extendedStock.marketCap ? formatLargeNumber(extendedStock.marketCap) : yahooData?.keyStats?.marketCap ? formatYahooLargeNumber(yahooData.keyStats.marketCap) : 'N/A'} />
          <StatCard label="Shares Outstanding" value={extendedStock.sharesOutstanding ? formatLargeNumber(extendedStock.sharesOutstanding) : yahooData?.keyStats?.sharesOutstanding ? formatYahooLargeNumber(yahooData.keyStats.sharesOutstanding) : 'N/A'} icon={Users} />
          <StatCard label="50-Day Average" value={yahooData?.keyStats?.fiftyDayAverage ? formatCurrency(yahooData.keyStats.fiftyDayAverage) : 'N/A'} />
          <StatCard label="200-Day Average" value={yahooData?.keyStats?.twoHundredDayAverage ? formatCurrency(yahooData.keyStats.twoHundredDayAverage) : 'N/A'} />
          <StatCard label="52-Week High" value={extendedStock.high52Week ? formatCurrency(extendedStock.high52Week) : yahooData?.keyStats?.fiftyTwoWeekHigh ? formatCurrency(yahooData.keyStats.fiftyTwoWeekHigh) : 'N/A'} />
          <StatCard label="52-Week Low" value={extendedStock.low52Week ? formatCurrency(extendedStock.low52Week) : yahooData?.keyStats?.fiftyTwoWeekLow ? formatCurrency(yahooData.keyStats.fiftyTwoWeekLow) : 'N/A'} />
          {yahooData?.keyStats?.lastSplitDate && (
            <StatCard label="Last Split" value={yahooData.keyStats.lastSplitDate} subValue={yahooData.keyStats.lastSplitFactor || ''} />
          )}
        </div>
      </SectionCard>

      {/* Data Refresh Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Clock size={18} />
              <span className="text-sm font-medium">Last updated: {formatLastUpdate(lastRefresh)}</span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-500">Auto-refresh: every 5 minutes</span>
            {yahooLoading && (
              <span className="text-xs text-blue-500">Loading additional data...</span>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
