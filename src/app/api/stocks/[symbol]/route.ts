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

  try {
    const now = Date.now();
    const lastScan = getLastScanTime();
    const timeSinceLastScan = now - lastScan;
    const cachedQuotes = getAllCachedQuotes();

    if (hasSession() && (cachedQuotes.size === 0 || timeSinceLastScan > CACHE_TTL)) {
      await fetchNigerianStocksFromScanner();
    }

    const cached = getCachedQuote(upperSymbol);
    
    if (!staticStock && !cached) {
      return NextResponse.json(
        { success: false, error: 'Stock not found' },
        { status: 404 }
      );
    }

    if (!hasSession() && staticStock) {
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

    if (cached && cached.price > 0) {
      const isFresh = (now - cached.timestamp) < CACHE_TTL;
      const baseStock = staticStock || {
        symbol: upperSymbol,
        name: cached.name || upperSymbol,
        sector: cached.sector || 'Unknown',
        industry: cached.industry || '',
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        open: 0,
        high: 0,
        low: 0,
        previousClose: 0,
        high52Week: 0,
        low52Week: 0,
      };
      return NextResponse.json({
        success: true,
        data: {
          ...baseStock,
          name: cached.name || baseStock.name,
          description: cached.description || '',
          sector: cached.sector || baseStock.sector,
          industry: cached.industry || baseStock.industry || '',
          
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          volume: cached.volume || baseStock.volume,
          open: cached.open || baseStock.open,
          high: cached.high || baseStock.high,
          low: cached.low || baseStock.low,
          previousClose: cached.previousClose || baseStock.previousClose,
          
          marketCap: cached.marketCap || baseStock.marketCap,
          high52Week: cached.high52Week || baseStock.high52Week,
          low52Week: cached.low52Week || baseStock.low52Week,
          
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
