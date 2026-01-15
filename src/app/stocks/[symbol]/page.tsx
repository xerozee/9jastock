'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Star, ExternalLink, RefreshCw, Clock, 
  Activity, BarChart3, PieChart, DollarSign, Percent, TrendingDown as TrendDown,
  ChevronRight, Building2, LineChart, Scale, Wallet, Users, BarChart2, Plus, Check
} from 'lucide-react';
import StockChart from '@/components/StockChart';
import LiveIndicator from '@/components/LiveIndicator';
import { useWatchlist } from '@/lib/watchlistContext';
import { useLiveStock, formatLastUpdate } from '@/lib/useLiveStocks';
import {
  getStockBySymbol,
  generateHistoricalData,
  formatCurrency,
  formatVolume,
  formatLargeNumber,
} from '@/lib/stockData';
import { Stock } from '@/types/stock';

const REFRESH_INTERVAL = 5 * 60 * 1000;

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

function StatCard({ label, value, subValue, icon: Icon, trend }: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={16} className="text-gray-400" />}
        <p className="text-sm text-gray-500">{label}</p>
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
      <span className="text-sm text-gray-600 w-16">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
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
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full relative">
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

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const { stock: liveStock, isLoading, refresh, lastRefresh } = useLiveStock(symbol, REFRESH_INTERVAL);
  const staticStock = getStockBySymbol(symbol);
  const stock = liveStock || staticStock;

  if (!stock && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stock Not Found</h1>
          <p className="text-gray-600 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const extendedStock = stock as Stock;
  const historicalData = generateHistoricalData(stock.price);
  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);
  const isLive = 'isLive' in stock ? Boolean(stock.isLive) : false;
  const lastUpdated = 'lastUpdated' in stock ? (stock.lastUpdated as number | null) : null;
  const recommendation = getRecommendationLabel(extendedStock.recommendAll);
  const rsiStatus = getRSIStatus(extendedStock.rsi);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/stocks" className="hover:text-green-600">Stocks</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{stock.symbol}</span>
      </nav>

      {/* Stock Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{stock.sector}</span>
              {extendedStock.industry && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">{extendedStock.industry}</span>
              )}
              <button
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`p-2 rounded-lg transition-colors ${
                  inWatchlist ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                }`}
              >
                <Star size={20} fill={inWatchlist ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-lg text-gray-600 mb-1">{stock.name}</p>
            {extendedStock.description && (
              <p className="text-sm text-gray-500 mb-2">{extendedStock.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <LiveIndicator isLive={isLive} lastUpdated={lastUpdated} onRefresh={refresh} isLoading={isLoading} />
              {recommendation && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${recommendation.bg} ${recommendation.color}`}>
                  {recommendation.label}
                </span>
              )}
            </div>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(stock.price)}</div>
            <div className={`inline-flex items-center text-xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={24} className="mr-1" /> : <TrendingDown size={24} className="mr-1" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Market Cap: <span className="font-medium text-gray-700">{formatLargeNumber(stock.marketCap)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">Open</p>
          <p className="text-lg font-semibold">{formatCurrency(stock.open)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">High</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(stock.high)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">Low</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(stock.low)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">Prev Close</p>
          <p className="text-lg font-semibold">{formatCurrency(stock.previousClose)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">Volume</p>
          <p className="text-lg font-semibold">{formatVolume(stock.volume)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-xs text-gray-500 uppercase">52W Range</p>
          <p className="text-sm font-semibold">{formatCurrency(stock.low52Week)} - {formatCurrency(stock.high52Week)}</p>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <StockChart data={historicalData} symbol={stock.symbol} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Technical Indicators */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Technical Indicators</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oscillators */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Oscillators</h3>
              
              <div className="space-y-4">
                <TechnicalGauge 
                  label="RSI (14)" 
                  value={extendedStock.rsi} 
                  min={0} 
                  max={100} 
                  zones={{ oversold: 30, overbought: 70 }}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RSI Status</span>
                  <span className={`font-medium ${rsiStatus.color}`}>{rsiStatus.label}</span>
                </div>
                
                <TechnicalGauge 
                  label="RSI (7)" 
                  value={extendedStock.rsi7} 
                  min={0} 
                  max={100}
                  zones={{ oversold: 30, overbought: 70 }}
                />
                
                <TechnicalGauge 
                  label="Stochastic K" 
                  value={extendedStock.stochK} 
                  min={0} 
                  max={100}
                  zones={{ oversold: 20, overbought: 80 }}
                />
                
                <TechnicalGauge 
                  label="CCI (20)" 
                  value={extendedStock.cci} 
                  min={-200} 
                  max={200}
                />
                
                <TechnicalGauge 
                  label="Williams %R" 
                  value={extendedStock.williamsR} 
                  min={-100} 
                  max={0}
                />
              </div>
            </div>

            {/* Moving Averages & MACD */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Moving Averages & Trend</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SMA (20)</span>
                  <span className={`font-medium ${stock.price > (extendedStock.sma20 || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {extendedStock.sma20?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SMA (50)</span>
                  <span className={`font-medium ${stock.price > (extendedStock.sma50 || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {extendedStock.sma50?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SMA (200)</span>
                  <span className={`font-medium ${stock.price > (extendedStock.sma200 || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {extendedStock.sma200?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">EMA (20)</span>
                  <span className="font-medium">{extendedStock.ema20?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">EMA (50)</span>
                  <span className="font-medium">{extendedStock.ema50?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">EMA (200)</span>
                  <span className="font-medium">{extendedStock.ema200?.toFixed(2) || 'N/A'}</span>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">MACD</span>
                    <span className={`font-medium ${(extendedStock.macd || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {extendedStock.macd?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">MACD Signal</span>
                    <span className="font-medium">{extendedStock.macdSignal?.toFixed(4) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">MACD Histogram</span>
                    <span className={`font-medium ${(extendedStock.macdHist || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {extendedStock.macdHist?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ADX</span>
                    <span className="font-medium">{extendedStock.adx?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ATR</span>
                    <span className="font-medium">{extendedStock.atr?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-700 mb-4">Bollinger Bands</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 uppercase">Upper Band</p>
                <p className="text-lg font-semibold text-red-700">{extendedStock.bbUpper?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Middle Band</p>
                <p className="text-lg font-semibold">{extendedStock.bbMiddle?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 uppercase">Lower Band</p>
                <p className="text-lg font-semibold text-green-700">{extendedStock.bbLower?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations & Signals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">TradingView Signals</h2>
            
            <div className="text-center mb-4">
              <div className={`inline-block px-6 py-3 rounded-xl text-xl font-bold ${recommendation.bg} ${recommendation.color}`}>
                {recommendation.label}
              </div>
              <p className="text-sm text-gray-500 mt-2">Overall Rating: {extendedStock.recommendAll?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Moving Averages</span>
                <span className={`text-sm font-medium ${(extendedStock.recommendMA || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {extendedStock.recommendMA?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Oscillators</span>
                <span className={`text-sm font-medium ${(extendedStock.recommendOther || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {extendedStock.recommendOther?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
            
            {(extendedStock.buySignals || extendedStock.sellSignals || extendedStock.neutralSignals) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{extendedStock.buySignals || 0}</p>
                    <p className="text-xs text-gray-500">Buy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{extendedStock.neutralSignals || 0}</p>
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

          {/* Volatility */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Volatility & Risk</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weekly Volatility</span>
                <span className="font-medium">{extendedStock.volatilityWeek?.toFixed(2) || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Volatility</span>
                <span className="font-medium">{extendedStock.volatilityMonth?.toFixed(2) || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Beta (1 Year)</span>
                <span className="font-medium">{extendedStock.beta1Year?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
        </div>
        
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
      </div>

      {/* Fundamentals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Valuation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Valuation</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="P/E Ratio" value={extendedStock.pe?.toFixed(2) || 'N/A'} icon={Percent} />
            <StatCard label="EPS" value={extendedStock.eps ? formatCurrency(extendedStock.eps) : 'N/A'} icon={DollarSign} />
            <StatCard label="EPS Diluted" value={extendedStock.epsDiluted ? formatCurrency(extendedStock.epsDiluted) : 'N/A'} />
            <StatCard label="Price/Book" value={extendedStock.priceToBook?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Sales" value={extendedStock.priceToSales?.toFixed(2) || 'N/A'} />
            <StatCard label="Price/Revenue" value={extendedStock.priceToRevenue?.toFixed(2) || 'N/A'} />
          </div>
        </div>

        {/* Dividends & Profitability */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Dividends & Profitability</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Dividend" value={extendedStock.dividend ? formatCurrency(extendedStock.dividend) : 'N/A'} />
            <StatCard label="Dividend Yield" value={extendedStock.dividendYield ? `${extendedStock.dividendYield.toFixed(2)}%` : 'N/A'} />
            <StatCard label="ROE" value={extendedStock.roe ? `${extendedStock.roe.toFixed(2)}%` : 'N/A'} trend={extendedStock.roe && extendedStock.roe > 0 ? 'up' : 'neutral'} />
            <StatCard label="ROA" value={extendedStock.roa ? `${extendedStock.roa.toFixed(2)}%` : 'N/A'} trend={extendedStock.roa && extendedStock.roa > 0 ? 'up' : 'neutral'} />
          </div>
        </div>
      </div>

      {/* Financials */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="text-indigo-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Financials</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={extendedStock.revenue ? formatLargeNumber(extendedStock.revenue) : 'N/A'} />
          <StatCard label="Gross Profit" value={extendedStock.grossProfit ? formatLargeNumber(extendedStock.grossProfit) : 'N/A'} />
          <StatCard label="Net Income" value={extendedStock.netIncome ? formatLargeNumber(extendedStock.netIncome) : 'N/A'} />
          <StatCard label="EBITDA" value={extendedStock.ebitda ? formatLargeNumber(extendedStock.ebitda) : 'N/A'} />
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="text-teal-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Balance Sheet</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Assets" value={extendedStock.totalAssets ? formatLargeNumber(extendedStock.totalAssets) : 'N/A'} />
          <StatCard label="Total Debt" value={extendedStock.totalDebt ? formatLargeNumber(extendedStock.totalDebt) : 'N/A'} />
          <StatCard label="Total Cash" value={extendedStock.totalCash ? formatLargeNumber(extendedStock.totalCash) : 'N/A'} />
          <StatCard label="Debt/Equity" value={extendedStock.debtToEquity?.toFixed(2) || 'N/A'} />
          <StatCard label="Current Ratio" value={extendedStock.currentRatio?.toFixed(2) || 'N/A'} />
          <StatCard label="Quick Ratio" value={extendedStock.quickRatio?.toFixed(2) || 'N/A'} />
          <StatCard label="Shares Out" value={extendedStock.sharesOutstanding ? formatLargeNumber(extendedStock.sharesOutstanding) : 'N/A'} icon={Users} />
          <StatCard label="Float Shares" value={extendedStock.floatShares ? formatLargeNumber(extendedStock.floatShares) : 'N/A'} />
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-cyan-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Volume Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Today's Volume" value={formatVolume(stock.volume)} />
          <StatCard label="Avg Vol (10d)" value={formatVolume(extendedStock.avgVolume10d || 0)} />
          <StatCard label="Avg Vol (30d)" value={formatVolume(extendedStock.avgVolume30d || 0)} />
          <StatCard label="Avg Vol (90d)" value={formatVolume(extendedStock.avgVolume90d || 0)} />
          <StatCard 
            label="Relative Volume" 
            value={extendedStock.relativeVolume?.toFixed(2) || 'N/A'} 
            subValue={extendedStock.relativeVolume && extendedStock.relativeVolume > 1 ? 'Above average' : 'Below average'}
            trend={extendedStock.relativeVolume && extendedStock.relativeVolume > 1 ? 'up' : 'down'}
          />
        </div>
      </div>

      {/* TradingView Advanced Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-purple-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">TradingView Advanced Chart</h2>
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=NSENG:${stock.symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=RSI@tv-basicstudies,MACD@tv-basicstudies&theme=light&style=1&timezone=Africa/Lagos&withdateranges=1&showpopupbutton=1&locale=en`}
            style={{ width: '100%', height: '550px' }}
            allowFullScreen
          />
        </div>
      </div>

      {/* Data Refresh Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock size={18} />
              <span className="text-sm font-medium">Last updated: {formatLastUpdate(lastRefresh)}</span>
            </div>
            <span className="text-xs text-blue-600">Auto-refresh: every 5 minutes</span>
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

      {/* External Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">External Resources</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://www.tradingview.com/symbols/NSENG-${stock.symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            View on TradingView
          </a>
          <a
            href={`https://www.tradingview.com/symbols/NSENG-${stock.symbol}/technicals/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Activity size={16} className="mr-2" />
            Technicals on TradingView
          </a>
          <a
            href={`https://ngxgroup.com/exchange/data/company-profile/?symbol=${stock.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            View on NGX
          </a>
          <a
            href={`https://www.google.com/finance/quote/${stock.symbol}:NGX`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            Google Finance
          </a>
        </div>
      </div>
    </div>
  );
}
