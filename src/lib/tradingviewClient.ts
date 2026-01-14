import TradingView from '@mathieuc/tradingview';

// Nigerian stock symbols for TradingView - All NGX listed stocks
export const NGX_TV_SYMBOLS: Record<string, string> = {
  // ============ FINANCIAL SERVICES (15) ============
  'GTCO': 'NSENG:GTCO',
  'ZENITHBANK': 'NSENG:ZENITHBANK',
  'ACCESSCORP': 'NSENG:ACCESSCORP',
  'UBA': 'NSENG:UBA',
  'FBNH': 'NSENG:FBNH',
  'STANBIC': 'NSENG:STANBIC',
  'FCMB': 'NSENG:FCMB',
  'FIDELITYBK': 'NSENG:FIDELITYBK',
  'STERLINGNG': 'NSENG:STERLINGNG',
  'WEMABANK': 'NSENG:WEMABANK',
  'JAIZBANK': 'NSENG:JAIZBANK',
  'ECOBANK': 'NSENG:ECOBANK',
  'UNIONBANK': 'NSENG:UNIONBANK',
  'UNITYBANK': 'NSENG:UNITYBANK',
  'NGXGROUP': 'NSENG:NGXGROUP',

  // ============ ICT / TELECOMMUNICATIONS (2) ============
  'MTNN': 'NSENG:MTNN',
  'AIRTELAFRI': 'NSENG:AIRTELAFRI',

  // ============ INDUSTRIAL GOODS (7) ============
  'DANGCEM': 'NSENG:DANGCEM',
  'BUACEMENT': 'NSENG:BUACEMENT',
  'WAPCO': 'NSENG:WAPCO',
  'BUAFOODS': 'NSENG:BUAFOODS',
  'CUTIX': 'NSENG:CUTIX',
  'BETAGLAS': 'NSENG:BETAGLAS',
  'BERGER': 'NSENG:BERGER',

  // ============ OIL & GAS (7) ============
  'SEPLAT': 'NSENG:SEPLAT',
  'OANDO': 'NSENG:OANDO',
  'TOTAL': 'NSENG:TOTAL',
  'CONOIL': 'NSENG:CONOIL',
  'ARDOVA': 'NSENG:ARDOVA',
  'MRS': 'NSENG:MRS',
  'ETERNA': 'NSENG:ETERNA',

  // ============ CONSUMER GOODS (14) ============
  'NESTLE': 'NSENG:NESTLE',
  'DANGSUGAR': 'NSENG:DANGSUGAR',
  'FLOURMILL': 'NSENG:FLOURMILL',
  'NASCON': 'NSENG:NASCON',
  'CADBURY': 'NSENG:CADBURY',
  'UNILEVER': 'NSENG:UNILEVER',
  'NB': 'NSENG:NB',
  'GUINNESS': 'NSENG:GUINNESS',
  'INTBREW': 'NSENG:INTBREW',
  'CHAMPION': 'NSENG:CHAMPION',
  'HONYFLOUR': 'NSENG:HONYFLOUR',
  'PZ': 'NSENG:PZ',
  'VITAFOAM': 'NSENG:VITAFOAM',

  // ============ INSURANCE (8) ============
  'AIICO': 'NSENG:AIICO',
  'MANSARD': 'NSENG:MANSARD',
  'NEM': 'NSENG:NEM',
  'LASACO': 'NSENG:LASACO',
  'LINKASSURE': 'NSENG:LINKASSURE',
  'CORNERST': 'NSENG:CORNERST',
  'CHIPLC': 'NSENG:CHIPLC',
  'PRESTIGE': 'NSENG:PRESTIGE',

  // ============ AGRICULTURE (4) ============
  'PRESCO': 'NSENG:PRESCO',
  'OKOMUOIL': 'NSENG:OKOMUOIL',
  'LIVESTOCK': 'NSENG:LIVESTOCK',
  'ELLAHLAKES': 'NSENG:ELLAHLAKES',

  // ============ HEALTHCARE (5) ============
  'MAYBAKER': 'NSENG:MAYBAKER',
  'NEIMETH': 'NSENG:NEIMETH',
  'FIDSON': 'NSENG:FIDSON',
  'GLAXOSMITH': 'NSENG:GLAXOSMITH',
  'PHARMDEKO': 'NSENG:PHARMDEKO',

  // ============ CONGLOMERATES (3) ============
  'TRANSCORP': 'NSENG:TRANSCORP',
  'UACN': 'NSENG:UACN',
  'JOHNHOLT': 'NSENG:JOHNHOLT',

  // ============ CONSTRUCTION / REAL ESTATE (2) ============
  'JBERGER': 'NSENG:JBERGER',
  'UPDC': 'NSENG:UPDC',

  // ============ SERVICES / LOGISTICS (5) ============
  'NAHCO': 'NSENG:NAHCO',
  'ABCTRANS': 'NSENG:ABCTRANS',
  'REDSTAREX': 'NSENG:REDSTAREX',
  'CAVERTON': 'NSENG:CAVERTON',
  'SCOA': 'NSENG:SCOA',

  // ============ UTILITIES / POWER (2) ============
  'GEREGU': 'NSENG:GEREGU',
  'TRANSCPOWER': 'NSENG:TRANSCPOWER',

  // ============ ADDITIONAL OIL & GAS (1) ============
  'ARADEL': 'NSENG:ARADEL',

  // ============ ADDITIONAL ICT / FINTECH (3) ============
  'ETRANZACT': 'NSENG:ETRANZACT',
  'CHAMS': 'NSENG:CHAMS',
  'COURTVILLE': 'NSENG:COURTVILLE',

  // ============ MINING (2) ============
  'MULTIVERSE': 'NSENG:MULTIVERSE',
  'JAPAULGOLD': 'NSENG:JAPAULGOLD',

  // ============ EDUCATION (1) ============
  'LEARNAFRICA': 'NSENG:LEARNAFRICA',

  // ============ ADDITIONAL HEALTHCARE (1) ============
  'MORISON': 'NSENG:MORISON',

  // ============ ADDITIONAL FINANCIAL SERVICES (1) ============
  'NPFMCRFBK': 'NSENG:NPFMCRFBK',

  // ============ ADDITIONAL INSURANCE ============
  'SOVRENINS': 'NSENG:SOVRENINS',
  'WAPIC': 'NSENG:WAPIC',
  'CUSTODIAN': 'NSENG:CUSTODIAN',
  'ROYALEX': 'NSENG:ROYALEX',
  'GUININS': 'NSENG:GUININS',
  'VERITASKAP': 'NSENG:VERITASKAP',
  'REGALINS': 'NSENG:REGALINS',
  'LAWUNION': 'NSENG:LAWUNION',
  'SUNUASSUR': 'NSENG:SUNUASSUR',
  'STDINSURE': 'NSENG:STDINSURE',
  'UNIVINSURE': 'NSENG:UNIVINSURE',

  // ============ ADDITIONAL FINANCIAL SERVICES ============
  'AFRIPRUD': 'NSENG:AFRIPRUD',
  'UCAP': 'NSENG:UCAP',
  'DEAPCAP': 'NSENG:DEAPCAP',
  'FSDH': 'NSENG:FSDH',
  'ABBEYBDS': 'NSENG:ABBEYBDS',

  // ============ HOSPITALITY / HOTELS ============
  'IKEJAHOTEL': 'NSENG:IKEJAHOTEL',
  'CAPHOTEL': 'NSENG:CAPHOTEL',
  'TOURIST': 'NSENG:TOURIST',

  // ============ CONSUMER SERVICES ============
  'TANTALIZER': 'NSENG:TANTALIZER',

  // ============ PUBLISHING / MEDIA ============
  'ACADEMY': 'NSENG:ACADEMY',
  'UPL': 'NSENG:UPL',

  // ============ ADDITIONAL INDUSTRIAL ============
  'RTBRISCOE': 'NSENG:RTBRISCOE',
  'MCNICHOLS': 'NSENG:MCNICHOLS',
  'OMATEK': 'NSENG:OMATEK',
  'AUSTINLAZ': 'NSENG:AUSTINLAZ',
  'CAP': 'NSENG:CAP',
  'BOCGAS': 'NSENG:BOCGAS',
  'GREIF': 'NSENG:GREIF',
  'PORTPAINT': 'NSENG:PORTPAINT',
  'MEYER': 'NSENG:MEYER',
  'ENAMELWA': 'NSENG:ENAMELWA',
  'CEMENT': 'NSENG:CEMENT',

  // ============ ADDITIONAL CONSUMER GOODS ============
  'NNFM': 'NSENG:NNFM',
  'MCNICHOL': 'NSENG:MCNICHOL',
  'GOLDBREWRY': 'NSENG:GOLDBREWRY',

  // ============ ADDITIONAL SERVICES ============
  'INTERLINKED': 'NSENG:INTERLINKED',
  'CWG': 'NSENG:CWG',
  'TRIPPLE': 'NSENG:TRIPPLE',
  'SKYAVN': 'NSENG:SKYAVN',
  'NSLTECH': 'NSENG:NSLTECH',
  'THOMWY': 'NSENG:THOMWY',

  // ============ ADDITIONAL AGRICULTURE ============
  'FTNCOCOA': 'NSENG:FTNCOCOA',

  // ============ ADDITIONAL REAL ESTATE ============
  'UPDCREIT': 'NSENG:UPDCREIT',

  // ============ ADDITIONAL HEALTHCARE ============
  'UNIONDIAG': 'NSENG:UNIONDIAG',
  'EKOCORP': 'NSENG:EKOCORP',

  // ============ TEXTILES ============
  'AFPRINT': 'NSENG:AFPRINT',
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
  marketCap: number;
  high52Week: number;
  low52Week: number;
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
          marketCap: Number(data.market_cap_basic) || 0,
          high52Week: Number(data.price_52_week_high) || 0,
          low52Week: Number(data.price_52_week_low) || 0,
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
            marketCap: Number(data.market_cap_basic) || 0,
            high52Week: Number(data.price_52_week_high) || 0,
            low52Week: Number(data.price_52_week_low) || 0,
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
