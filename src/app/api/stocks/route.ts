import { NextResponse } from 'next/server';
import { nigerianStocks } from '@/lib/stockData';
import { 
  fetchNigerianStocksFromScanner, 
  hasSession, 
  getCachedQuote,
  getLastScanTime,
  getAllCachedQuotes
} from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    const lastScan = getLastScanTime();
    const timeSinceLastScan = now - lastScan;
    const cachedQuotes = getAllCachedQuotes();

    if (hasSession() && (cachedQuotes.size === 0 || timeSinceLastScan > CACHE_TTL)) {
      await fetchNigerianStocksFromScanner();
    }

    const stocks = nigerianStocks.map(stock => {
      const cached = getCachedQuote(stock.symbol);
      if (cached && cached.price > 0) {
        const isFresh = (now - cached.timestamp) < CACHE_TTL;
        return {
          ...stock,
          name: cached.name || stock.name,
          description: cached.description || '',
          sector: cached.sector || stock.sector,
          industry: cached.industry || '',
          
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          volume: cached.volume || stock.volume,
          open: cached.open || stock.open,
          high: cached.high || stock.high,
          low: cached.low || stock.low,
          previousClose: cached.previousClose || stock.previousClose,
          
          marketCap: cached.marketCap || stock.marketCap,
          high52Week: cached.high52Week || stock.high52Week,
          low52Week: cached.low52Week || stock.low52Week,
          
          perfWeek: cached.perfWeek,
          perfMonth: cached.perfMonth,
          perf3Month: cached.perf3Month,
          perf6Month: cached.perf6Month,
          perfYTD: cached.perfYTD,
          perfYear: cached.perfYear,
          perf5Year: cached.perf5Year,
          perfAllTime: cached.perfAllTime,
          
          avgVolume10d: cached.avgVolume10d,
          avgVolume30d: cached.avgVolume30d,
          avgVolume90d: cached.avgVolume90d,
          relativeVolume: cached.relativeVolume,
          
          volatilityWeek: cached.volatilityWeek,
          volatilityMonth: cached.volatilityMonth,
          
          pe: cached.pe,
          eps: cached.eps,
          epsDiluted: cached.epsDiluted,
          dividend: cached.dividend,
          dividendYield: cached.dividendYield,
          priceToBook: cached.priceToBook,
          priceToSales: cached.priceToSales,
          priceToRevenue: cached.priceToRevenue,
          
          roe: cached.roe,
          roa: cached.roa,
          
          revenue: cached.revenue,
          grossProfit: cached.grossProfit,
          netIncome: cached.netIncome,
          ebitda: cached.ebitda,
          
          totalAssets: cached.totalAssets,
          totalDebt: cached.totalDebt,
          totalCash: cached.totalCash,
          debtToEquity: cached.debtToEquity,
          currentRatio: cached.currentRatio,
          quickRatio: cached.quickRatio,
          
          sharesOutstanding: cached.sharesOutstanding,
          floatShares: cached.floatShares,
          
          rsi: cached.rsi,
          rsi7: cached.rsi7,
          
          macd: cached.macd,
          macdSignal: cached.macdSignal,
          macdHist: cached.macdHist,
          
          sma20: cached.sma20,
          sma50: cached.sma50,
          sma200: cached.sma200,
          ema20: cached.ema20,
          ema50: cached.ema50,
          ema200: cached.ema200,
          
          stochK: cached.stochK,
          stochD: cached.stochD,
          
          atr: cached.atr,
          adx: cached.adx,
          cci: cached.cci,
          williamsR: cached.williamsR,
          
          bbUpper: cached.bbUpper,
          bbMiddle: cached.bbMiddle,
          bbLower: cached.bbLower,
          
          recommendAll: cached.recommendAll,
          recommendMA: cached.recommendMA,
          recommendOther: cached.recommendOther,
          
          buySignals: cached.buySignals,
          sellSignals: cached.sellSignals,
          neutralSignals: cached.neutralSignals,
          
          gap: cached.gap,
          gapPercent: cached.gapPercent,
          
          beta1Year: cached.beta1Year,
          
          preMarketPrice: cached.preMarketPrice,
          preMarketChange: cached.preMarketChange,
          postMarketPrice: cached.postMarketPrice,
          postMarketChange: cached.postMarketChange,
          
          earningsDate: cached.earningsDate,
          
          isLive: isFresh,
          lastUpdated: cached.timestamp,
        };
      }
      return {
        ...stock,
        isLive: false,
        lastUpdated: now,
      };
    });

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
