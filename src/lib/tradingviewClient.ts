import TradingView from '@mathieuc/tradingview';

export const NGX_TV_SYMBOLS: Record<string, string> = {
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
  'MTNN': 'NSENG:MTNN',
  'AIRTELAFRI': 'NSENG:AIRTELAFRI',
  'DANGCEM': 'NSENG:DANGCEM',
  'BUACEMENT': 'NSENG:BUACEMENT',
  'WAPCO': 'NSENG:WAPCO',
  'BUAFOODS': 'NSENG:BUAFOODS',
  'CUTIX': 'NSENG:CUTIX',
  'BETAGLAS': 'NSENG:BETAGLAS',
  'BERGER': 'NSENG:BERGER',
  'SEPLAT': 'NSENG:SEPLAT',
  'OANDO': 'NSENG:OANDO',
  'TOTAL': 'NSENG:TOTAL',
  'CONOIL': 'NSENG:CONOIL',
  'ARDOVA': 'NSENG:ARDOVA',
  'MRS': 'NSENG:MRS',
  'ETERNA': 'NSENG:ETERNA',
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
  'AIICO': 'NSENG:AIICO',
  'MANSARD': 'NSENG:MANSARD',
  'NEM': 'NSENG:NEM',
  'LASACO': 'NSENG:LASACO',
  'LINKASSURE': 'NSENG:LINKASSURE',
  'CORNERST': 'NSENG:CORNERST',
  'CHIPLC': 'NSENG:CHIPLC',
  'PRESTIGE': 'NSENG:PRESTIGE',
  'PRESCO': 'NSENG:PRESCO',
  'OKOMUOIL': 'NSENG:OKOMUOIL',
  'LIVESTOCK': 'NSENG:LIVESTOCK',
  'ELLAHLAKES': 'NSENG:ELLAHLAKES',
  'MAYBAKER': 'NSENG:MAYBAKER',
  'NEIMETH': 'NSENG:NEIMETH',
  'FIDSON': 'NSENG:FIDSON',
  'GLAXOSMITH': 'NSENG:GLAXOSMITH',
  'PHARMDEKO': 'NSENG:PHARMDEKO',
  'TRANSCORP': 'NSENG:TRANSCORP',
  'UACN': 'NSENG:UACN',
  'JOHNHOLT': 'NSENG:JOHNHOLT',
  'JBERGER': 'NSENG:JBERGER',
  'UPDC': 'NSENG:UPDC',
  'NAHCO': 'NSENG:NAHCO',
  'ABCTRANS': 'NSENG:ABCTRANS',
  'REDSTAREX': 'NSENG:REDSTAREX',
  'CAVERTON': 'NSENG:CAVERTON',
  'SCOA': 'NSENG:SCOA',
  'GEREGU': 'NSENG:GEREGU',
  'TRANSCPOWER': 'NSENG:TRANSCPOWER',
  'ARADEL': 'NSENG:ARADEL',
  'ETRANZACT': 'NSENG:ETRANZACT',
  'CHAMS': 'NSENG:CHAMS',
  'COURTVILLE': 'NSENG:COURTVILLE',
  'MULTIVERSE': 'NSENG:MULTIVERSE',
  'JAPAULGOLD': 'NSENG:JAPAULGOLD',
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

const quoteCache = new Map<string, LiveQuote>();

function getSessionId(): string | null {
  return process.env.TRADINGVIEW_SESSION || null;
}

export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const tvSymbol = NGX_TV_SYMBOLS[symbol.toUpperCase()] || `NSENG:${symbol.toUpperCase()}`;
  const sessionId = getSessionId();

  try {
    const client = new TradingView.Client({
      token: sessionId || undefined,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        try { client.end(); } catch {}
        resolve(quoteCache.get(symbol.toUpperCase()) || null);
      }, 10000);

      const chart = new client.Session.Chart();
      chart.setMarket(tvSymbol, { timeframe: 'D' });

      chart.onError((...err: unknown[]) => {
        clearTimeout(timeout);
        console.error(`Error fetching ${symbol}:`, err);
        try { client.end(); } catch {}
        resolve(quoteCache.get(symbol.toUpperCase()) || null);
      });

      chart.onSymbolLoaded(() => {
        clearTimeout(timeout);
        
        const info = chart.infos || {};
        const periods = chart.periods || [];
        const latestPeriod = periods[0] || {};

        const quote: LiveQuote = {
          symbol: symbol.toUpperCase(),
          price: Number(latestPeriod.close) || 0,
          change: Number(info.change) || 0,
          changePercent: Number(info.change_percent) || 0,
          volume: Number(latestPeriod.volume) || Number(info.volume) || 0,
          open: Number(latestPeriod.open) || 0,
          high: Number(latestPeriod.max) || Number(latestPeriod.high) || 0,
          low: Number(latestPeriod.min) || Number(latestPeriod.low) || 0,
          previousClose: Number(info.prev_close_price) || 0,
          marketCap: Number(info.market_cap_basic) || 0,
          high52Week: Number(info.price_52_week_high) || 0,
          low52Week: Number(info.price_52_week_low) || 0,
          timestamp: Date.now(),
          isLive: true,
        };

        quoteCache.set(symbol.toUpperCase(), quote);
        chart.delete();
        try { client.end(); } catch {}
        resolve(quote);
      });
    });
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return quoteCache.get(symbol.toUpperCase()) || null;
  }
}

export async function fetchLiveQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
  const results = new Map<string, LiveQuote>();
  const sessionId = getSessionId();

  const batchSize = 10;
  const batches: string[][] = [];
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    try {
      const client = new TradingView.Client({
        token: sessionId || undefined,
      });

      const pendingCount = { value: 0 };
      const totalInBatch = batch.length;

      await new Promise<void>((batchResolve) => {
        const batchTimeout = setTimeout(() => {
          try { client.end(); } catch {}
          batchResolve();
        }, 15000);

        batch.forEach(symbol => {
          const upperSymbol = symbol.toUpperCase();
          const tvSymbol = NGX_TV_SYMBOLS[upperSymbol] || `NSENG:${upperSymbol}`;

          try {
            const chart = new client.Session.Chart();
            chart.setMarket(tvSymbol, { timeframe: 'D' });

            const symbolTimeout = setTimeout(() => {
              pendingCount.value++;
              try { chart.delete(); } catch {}
              const cached = quoteCache.get(upperSymbol);
              if (cached) results.set(upperSymbol, cached);
              if (pendingCount.value >= totalInBatch) {
                clearTimeout(batchTimeout);
                try { client.end(); } catch {}
                batchResolve();
              }
            }, 8000);

            chart.onError((...err: unknown[]) => {
              clearTimeout(symbolTimeout);
              console.error(`Error fetching ${symbol}:`, err);
              pendingCount.value++;
              try { chart.delete(); } catch {}
              const cached = quoteCache.get(upperSymbol);
              if (cached) results.set(upperSymbol, cached);
              if (pendingCount.value >= totalInBatch) {
                clearTimeout(batchTimeout);
                try { client.end(); } catch {}
                batchResolve();
              }
            });

            chart.onSymbolLoaded(() => {
              clearTimeout(symbolTimeout);
              
              const info = chart.infos || {};
              const periods = chart.periods || [];
              const latestPeriod = periods[0] || {};

              const quote: LiveQuote = {
                symbol: upperSymbol,
                price: Number(latestPeriod.close) || 0,
                change: Number(info.change) || 0,
                changePercent: Number(info.change_percent) || 0,
                volume: Number(latestPeriod.volume) || Number(info.volume) || 0,
                open: Number(latestPeriod.open) || 0,
                high: Number(latestPeriod.max) || Number(latestPeriod.high) || 0,
                low: Number(latestPeriod.min) || Number(latestPeriod.low) || 0,
                previousClose: Number(info.prev_close_price) || 0,
                marketCap: Number(info.market_cap_basic) || 0,
                high52Week: Number(info.price_52_week_high) || 0,
                low52Week: Number(info.price_52_week_low) || 0,
                timestamp: Date.now(),
                isLive: true,
              };

              if (quote.price > 0) {
                results.set(upperSymbol, quote);
                quoteCache.set(upperSymbol, quote);
              }

              try { chart.delete(); } catch {}
              pendingCount.value++;
              
              if (pendingCount.value >= totalInBatch) {
                clearTimeout(batchTimeout);
                try { client.end(); } catch {}
                batchResolve();
              }
            });
          } catch (err) {
            console.error(`Error setting up chart for ${symbol}:`, err);
            pendingCount.value++;
            const cached = quoteCache.get(upperSymbol);
            if (cached) results.set(upperSymbol, cached);
            if (pendingCount.value >= totalInBatch) {
              clearTimeout(batchTimeout);
              try { client.end(); } catch {}
              batchResolve();
            }
          }
        });
      });
    } catch (error) {
      console.error('Failed to fetch batch:', error);
      batch.forEach(symbol => {
        const cached = quoteCache.get(symbol.toUpperCase());
        if (cached) results.set(symbol.toUpperCase(), cached);
      });
    }
  }

  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    if (!results.has(upperSymbol)) {
      const cached = quoteCache.get(upperSymbol);
      if (cached) results.set(upperSymbol, cached);
    }
  });

  return results;
}

export function getCachedQuote(symbol: string): LiveQuote | undefined {
  return quoteCache.get(symbol.toUpperCase());
}

export function hasSession(): boolean {
  return !!getSessionId();
}
