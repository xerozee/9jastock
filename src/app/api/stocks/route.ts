import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';
import { 
  fetchNigerianStocksFromScanner, 
  hasSession, 
  getLastScanTime,
  getAllCachedQuotes,
  LiveQuote
} from '@/lib/tradingviewClient';
import { Stock } from '@/types/stock';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_TTL = 5 * 60 * 1000;

function convertLiveQuoteToStock(quote: LiveQuote): Stock & { isLive: boolean; lastUpdated: number } {
  const now = Date.now();
  const isFresh = (now - quote.timestamp) < CACHE_TTL;
  
  return {
    symbol: quote.symbol,
    name: quote.name || quote.symbol,
    description: quote.description || '',
    sector: quote.sector || 'Other',
    industry: quote.industry || '',
    
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    previousClose: quote.previousClose,
    
    marketCap: quote.marketCap,
    high52Week: quote.high52Week,
    low52Week: quote.low52Week,
    
    perfWeek: quote.perfWeek,
    perfMonth: quote.perfMonth,
    perf3Month: quote.perf3Month,
    perf6Month: quote.perf6Month,
    perfYTD: quote.perfYTD,
    perfYear: quote.perfYear,
    perf5Year: quote.perf5Year,
    perfAllTime: quote.perfAllTime,
    
    avgVolume10d: quote.avgVolume10d,
    avgVolume30d: quote.avgVolume30d,
    avgVolume90d: quote.avgVolume90d,
    relativeVolume: quote.relativeVolume,
    
    volatilityWeek: quote.volatilityWeek,
    volatilityMonth: quote.volatilityMonth,
    
    pe: quote.pe,
    eps: quote.eps,
    epsDiluted: quote.epsDiluted,
    dividend: quote.dividend,
    dividendYield: quote.dividendYield,
    priceToBook: quote.priceToBook,
    priceToSales: quote.priceToSales,
    priceToRevenue: quote.priceToRevenue,
    
    roe: quote.roe,
    roa: quote.roa,
    
    revenue: quote.revenue,
    grossProfit: quote.grossProfit,
    netIncome: quote.netIncome,
    ebitda: quote.ebitda,
    
    totalAssets: quote.totalAssets,
    totalDebt: quote.totalDebt,
    totalCash: quote.totalCash,
    debtToEquity: quote.debtToEquity,
    currentRatio: quote.currentRatio,
    quickRatio: quote.quickRatio,
    
    sharesOutstanding: quote.sharesOutstanding,
    floatShares: quote.floatShares,
    
    rsi: quote.rsi,
    rsi7: quote.rsi7,
    
    macd: quote.macd,
    macdSignal: quote.macdSignal,
    macdHist: quote.macdHist,
    
    sma20: quote.sma20,
    sma50: quote.sma50,
    sma200: quote.sma200,
    ema20: quote.ema20,
    ema50: quote.ema50,
    ema200: quote.ema200,
    
    stochK: quote.stochK,
    stochD: quote.stochD,
    
    atr: quote.atr,
    adx: quote.adx,
    cci: quote.cci,
    williamsR: quote.williamsR,
    
    bbUpper: quote.bbUpper,
    bbMiddle: quote.bbMiddle,
    bbLower: quote.bbLower,
    
    recommendAll: quote.recommendAll,
    recommendMA: quote.recommendMA,
    recommendOther: quote.recommendOther,
    
    buySignals: quote.buySignals,
    sellSignals: quote.sellSignals,
    neutralSignals: quote.neutralSignals,
    
    gap: quote.gap,
    gapPercent: quote.gapPercent,
    
    beta1Year: quote.beta1Year,
    
    preMarketPrice: quote.preMarketPrice,
    preMarketChange: quote.preMarketChange,
    postMarketPrice: quote.postMarketPrice,
    postMarketChange: quote.postMarketChange,
    
    earningsDate: quote.earningsDate,
    
    isLive: isFresh,
    lastUpdated: quote.timestamp,
  };
}

export async function GET() {
  try {
    const now = Date.now();
    const lastScan = getLastScanTime();
    const timeSinceLastScan = now - lastScan;
    const cachedQuotes = getAllCachedQuotes();

    // Fetch fresh data if cache is empty or stale
    if (hasSession() && (cachedQuotes.size === 0 || timeSinceLastScan > CACHE_TTL)) {
      await fetchNigerianStocksFromScanner();
    }

    // Get all cached quotes from TradingView
    const allCachedQuotes = getAllCachedQuotes();
    const processedSymbols = new Set<string>();
    const stocks: (Stock & { isLive: boolean; lastUpdated: number })[] = [];

    // First, add all stocks from TradingView live data
    allCachedQuotes.forEach((quote, symbol) => {
      if (quote.price > 0) {
        stocks.push(convertLiveQuoteToStock(quote));
        processedSymbols.add(symbol.toUpperCase());
      }
    });

    // Then, add any stocks from static data that weren't in TradingView
    // (as fallback with isLive: false)
    for (const staticStock of nigerianStocks) {
      if (!processedSymbols.has(staticStock.symbol.toUpperCase())) {
        stocks.push({
          ...staticStock,
          isLive: false,
          lastUpdated: now,
        });
        processedSymbols.add(staticStock.symbol.toUpperCase());
      }
    }

    // Sort by market cap descending
    stocks.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    const liveCount = stocks.filter(s => s.isLive).length;

    return NextResponse.json({
      success: true,
      data: stocks,
      liveCount,
      totalCount: stocks.length,
      timestamp: now,
      lastScan: lastScan > 0 ? lastScan : null,
    });
  } catch (error) {
    console.error('Error in stocks API:', error);

    const stocks = nigerianStocks.map(stock => ({
      ...stock,
      isLive: false,
      lastUpdated: Date.now(),
    }));

    return NextResponse.json({
      success: true,
      data: stocks,
      liveCount: 0,
      totalCount: stocks.length,
      timestamp: Date.now(),
    });
  }
}
