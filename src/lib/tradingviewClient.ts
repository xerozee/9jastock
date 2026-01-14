import TradingView from '@mathieuc/tradingview';

// Nigerian stock symbols for TradingView
export const NGX_TV_SYMBOLS: Record<string, string> = {
  'DANGCEM': 'NSENG:DANGCEM',
  'GTCO': 'NSENG:GTCO',
  'ZENITHBANK': 'NSENG:ZENITHBANK',
  'AIRTELAFRI': 'NSENG:AIRTELAFRI',
  'MTNN': 'NSENG:MTNN',
  'BUACEMENT': 'NSENG:BUACEMENT',
  'NESTLE': 'NSENG:NESTLE',
  'SEPLAT': 'NSENG:SEPLAT',
  'ACCESSCORP': 'NSENG:ACCESSCORP',
  'UBA': 'NSENG:UBA',
  'FBNH': 'NSENG:FBNH',
  'STANBIC': 'NSENG:STANBIC',
  'WAPCO': 'NSENG:WAPCO',
  'FLOURMILL': 'NSENG:FLOURMILL',
  'OANDO': 'NSENG:OANDO',
  'PRESCO': 'NSENG:PRESCO',
  'GUINNESS': 'NSENG:GUINNESS',
  'CADBURY': 'NSENG:CADBURY',
  'UNILEVER': 'NSENG:UNILEVER',
  'TOTAL': 'NSENG:TOTAL',
};

export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: number;
  isLive: boolean;
}

// Cache for quotes
const quoteCache = new Map<string, LiveQuote>();

/**
 * Get TradingView session token from cookies
 * Users need to set TRADINGVIEW_SESSION in .env.local
 */
function getSessionId(): string | null {
  return process.env.TRADINGVIEW_SESSION || null;
}

/**
 * Fetch live quote for a single symbol
 */
export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const tvSymbol = NGX_TV_SYMBOLS[symbol.toUpperCase()] || `NSENG:${symbol.toUpperCase()}`;
  const sessionId = getSessionId();

  try {
    const client = new TradingView.Client({
      token: sessionId || undefined,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        resolve(quoteCache.get(symbol.toUpperCase()) || null);
      }, 10000);

      const market = client.getMarket(tvSymbol);

      market.onData((data) => {
        clearTimeout(timeout);

        const quote: LiveQuote = {
          symbol: symbol.toUpperCase(),
          price: Number(data.lp) || 0,
          change: Number(data.ch) || 0,
          changePercent: Number(data.chp) || 0,
          volume: Number(data.volume) || 0,
          open: Number(data.open_price) || 0,
          high: Number(data.high_price) || 0,
          low: Number(data.low_price) || 0,
          previousClose: Number(data.prev_close_price) || 0,
          timestamp: Date.now(),
          isLive: true,
        };

        quoteCache.set(symbol.toUpperCase(), quote);
        client.end();
        resolve(quote);
      });

      market.onError((err: Error) => {
        clearTimeout(timeout);
        console.error(`Error fetching ${symbol}:`, err.message);
        client.end();
        resolve(quoteCache.get(symbol.toUpperCase()) || null);
      });
    });
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return quoteCache.get(symbol.toUpperCase()) || null;
  }
}

/**
 * Fetch live quotes for multiple symbols
 */
export async function fetchLiveQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
  const results = new Map<string, LiveQuote>();
  const sessionId = getSessionId();

  try {
    const client = new TradingView.Client({
      token: sessionId || undefined,
    });

    const pendingSymbols = new Set(symbols.map(s => s.toUpperCase()));
    let resolvedCount = 0;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        // Return whatever we got plus cached data
        pendingSymbols.forEach(symbol => {
          if (!results.has(symbol)) {
            const cached = quoteCache.get(symbol);
            if (cached) results.set(symbol, cached);
          }
        });
        resolve(results);
      }, 15000);

      symbols.forEach(symbol => {
        const upperSymbol = symbol.toUpperCase();
        const tvSymbol = NGX_TV_SYMBOLS[upperSymbol] || `NSENG:${upperSymbol}`;

        const market = client.getMarket(tvSymbol);

        market.onData((data) => {
          const quote: LiveQuote = {
            symbol: upperSymbol,
            price: Number(data.lp) || 0,
            change: Number(data.ch) || 0,
            changePercent: Number(data.chp) || 0,
            volume: Number(data.volume) || 0,
            open: Number(data.open_price) || 0,
            high: Number(data.high_price) || 0,
            low: Number(data.low_price) || 0,
            previousClose: Number(data.prev_close_price) || 0,
            timestamp: Date.now(),
            isLive: true,
          };

          results.set(upperSymbol, quote);
          quoteCache.set(upperSymbol, quote);
          resolvedCount++;

          if (resolvedCount >= symbols.length) {
            clearTimeout(timeout);
            client.end();
            resolve(results);
          }
        });

        market.onError((err: Error) => {
          console.error(`Error fetching ${symbol}:`, err.message);
          pendingSymbols.delete(upperSymbol);
          resolvedCount++;

          if (resolvedCount >= symbols.length) {
            clearTimeout(timeout);
            client.end();
            resolve(results);
          }
        });
      });
    });
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    // Return cached data
    symbols.forEach(symbol => {
      const cached = quoteCache.get(symbol.toUpperCase());
      if (cached) results.set(symbol.toUpperCase(), cached);
    });
    return results;
  }
}

/**
 * Get cached quote
 */
export function getCachedQuote(symbol: string): LiveQuote | undefined {
  return quoteCache.get(symbol.toUpperCase());
}

/**
 * Check if TradingView session is configured
 */
export function hasSession(): boolean {
  return !!getSessionId();
}
