export interface LiveQuote {
  symbol: string;
  name?: string;
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

interface ScannerResult {
  s: string;
  d: (string | number | null)[];
}

interface ScannerResponse {
  totalCount: number;
  data: ScannerResult[];
}

const quoteCache = new Map<string, LiveQuote>();
let lastScanTime = 0;

function getSessionId(): string | null {
  return process.env.TRADINGVIEW_SESSION || null;
}

export function hasSession(): boolean {
  return !!getSessionId();
}

export function getCachedQuote(symbol: string): LiveQuote | undefined {
  return quoteCache.get(symbol.toUpperCase());
}

export function getAllCachedQuotes(): Map<string, LiveQuote> {
  return quoteCache;
}

export function getLastScanTime(): number {
  return lastScanTime;
}

export async function fetchNigerianStocksFromScanner(): Promise<LiveQuote[]> {
  const sessionId = getSessionId();
  
  const columns = [
    'name',
    'close',
    'change',
    'change_abs',
    'volume',
    'open',
    'high',
    'low',
    'Perf.W',
    'Perf.1M',
    'Perf.3M',
    'Perf.6M',
    'Perf.YTD',
    'Perf.Y',
    'market_cap_basic',
    'price_52_week_high',
    'price_52_week_low',
    'Recommend.All',
    'average_volume_10d_calc',
    'sector'
  ];

  const payload = {
    filter: [
      { left: 'exchange', operation: 'equal', right: 'NSENG' }
    ],
    options: { lang: 'en' },
    markets: ['nigeria'],
    symbols: { query: { types: [] }, tickers: [] },
    columns,
    sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
    range: [0, 200]
  };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    if (sessionId) {
      headers['Cookie'] = `sessionid=${sessionId}`;
    }

    const response = await fetch('https://scanner.tradingview.com/nigeria/scan', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Scanner API error:', response.status, response.statusText);
      return [];
    }

    const data: ScannerResponse = await response.json();
    const results: LiveQuote[] = [];

    for (const item of data.data) {
      const fullSymbol = item.s;
      const symbol = fullSymbol.split(':')[1] || fullSymbol;
      const d = item.d;

      const price = Number(d[1]) || 0;
      const changePercent = Number(d[2]) || 0;
      const changeAbs = Number(d[3]) || 0;

      const quote: LiveQuote = {
        symbol: symbol.toUpperCase(),
        name: d[0] as string || symbol,
        price,
        change: changeAbs,
        changePercent,
        volume: Number(d[4]) || 0,
        open: Number(d[5]) || 0,
        high: Number(d[6]) || 0,
        low: Number(d[7]) || 0,
        previousClose: price - changeAbs,
        marketCap: Number(d[14]) || 0,
        high52Week: Number(d[15]) || 0,
        low52Week: Number(d[16]) || 0,
        timestamp: Date.now(),
        isLive: true,
      };

      if (quote.price > 0) {
        results.push(quote);
        quoteCache.set(quote.symbol, quote);
      }
    }

    lastScanTime = Date.now();
    console.log(`Fetched ${results.length} Nigerian stocks from TradingView scanner`);
    return results;
  } catch (error) {
    console.error('Failed to fetch from TradingView scanner:', error);
    return [];
  }
}

export async function fetchLiveQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
  const results = new Map<string, LiveQuote>();
  
  const allStocks = await fetchNigerianStocksFromScanner();
  
  for (const stock of allStocks) {
    if (symbols.includes(stock.symbol) || symbols.length === 0) {
      results.set(stock.symbol, stock);
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
