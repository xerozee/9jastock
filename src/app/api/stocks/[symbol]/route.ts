import { NextRequest, NextResponse } from 'next/server';
import { getStockBySymbol } from '@/lib/stockData';
import { getCachedQuote, hasSession, fetchNigerianStocksFromScanner, getLastScanTime, getAllCachedQuotes } from '@/lib/tradingviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_TTL = 5 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const staticStock = getStockBySymbol(upperSymbol);

  if (!staticStock) {
    return NextResponse.json(
      { success: false, error: 'Stock not found' },
      { status: 404 }
    );
  }

  if (!hasSession()) {
    return NextResponse.json({
      success: true,
      data: {
        ...staticStock,
        isLive: false,
        lastUpdated: Date.now(),
      },
      timestamp: Date.now(),
      note: 'TradingView session not configured.',
    });
  }

  try {
    const now = Date.now();
    const lastScan = getLastScanTime();
    const timeSinceLastScan = now - lastScan;
    const cachedQuotes = getAllCachedQuotes();

    if (cachedQuotes.size === 0 || timeSinceLastScan > CACHE_TTL) {
      await fetchNigerianStocksFromScanner();
    }

    const cached = getCachedQuote(upperSymbol);

    if (cached && cached.price > 0) {
      const isFresh = (now - cached.timestamp) < CACHE_TTL;
      return NextResponse.json({
        success: true,
        data: {
          ...staticStock,
          name: cached.name || staticStock.name,
          description: cached.description || '',
          sector: cached.sector || staticStock.sector,
          industry: cached.industry || '',
          
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          volume: cached.volume || staticStock.volume,
          open: cached.open || staticStock.open,
          high: cached.high || staticStock.high,
          low: cached.low || staticStock.low,
          previousClose: cached.previousClose || staticStock.previousClose,
          
          marketCap: cached.marketCap || staticStock.marketCap,
          high52Week: cached.high52Week || staticStock.high52Week,
          low52Week: cached.low52Week || staticStock.low52Week,
          
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
          
          isLive: isFresh,
          lastUpdated: cached.timestamp,
        },
        timestamp: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...staticStock,
        isLive: false,
        lastUpdated: Date.now(),
      },
      timestamp: Date.now(),
      note: 'Live data unavailable for this symbol',
    });
  } catch (error) {
    console.error('Error fetching live stock:', error);

    return NextResponse.json({
      success: false,
      data: { ...staticStock, isLive: false, lastUpdated: Date.now() },
      timestamp: Date.now(),
      error: 'Failed to fetch live data',
    });
  }
}
