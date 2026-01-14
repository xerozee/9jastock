export interface LiveQuote {
  symbol: string;
  name?: string;
  description?: string;
  sector?: string;
  industry?: string;
  
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
  
  perfWeek: number;
  perfMonth: number;
  perf3Month: number;
  perf6Month: number;
  perfYTD: number;
  perfYear: number;
  perf5Year: number;
  perfAllTime: number;
  
  avgVolume10d: number;
  avgVolume30d: number;
  avgVolume90d: number;
  relativeVolume: number;
  
  volatilityWeek: number;
  volatilityMonth: number;
  
  pe: number;
  eps: number;
  epsDiluted: number;
  dividend: number;
  dividendYield: number;
  priceToBook: number;
  priceToSales: number;
  priceToRevenue: number;
  
  roe: number;
  roa: number;
  
  revenue: number;
  grossProfit: number;
  netIncome: number;
  ebitda: number;
  
  totalAssets: number;
  totalDebt: number;
  totalCash: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  
  sharesOutstanding: number;
  floatShares: number;
  
  rsi: number;
  rsi7: number;
  
  macd: number;
  macdSignal: number;
  macdHist: number;
  
  sma20: number;
  sma50: number;
  sma200: number;
  ema20: number;
  ema50: number;
  ema200: number;
  
  stochK: number;
  stochD: number;
  
  atr: number;
  adx: number;
  cci: number;
  williamsR: number;
  
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  
  recommendAll: number;
  recommendMA: number;
  recommendOther: number;
  
  buySignals: number;
  sellSignals: number;
  neutralSignals: number;
  
  gap: number;
  gapPercent: number;
  
  beta1Year: number;
  
  preMarketPrice: number;
  preMarketChange: number;
  postMarketPrice: number;
  postMarketChange: number;
  
  earningsDate: string | null;
  
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

const SCANNER_COLUMNS = [
  'name',
  'description',
  'close',
  'change',
  'change_abs',
  'volume',
  'open',
  'high',
  'low',
  'market_cap_basic',
  'price_52_week_high',
  'price_52_week_low',
  'Perf.W',
  'Perf.1M',
  'Perf.3M',
  'Perf.6M',
  'Perf.YTD',
  'Perf.Y',
  'Perf.5Y',
  'Perf.All',
  'average_volume_10d_calc',
  'average_volume_30d_calc',
  'average_volume_90d_calc',
  'relative_volume_10d_calc',
  'Volatility.W',
  'Volatility.M',
  'price_earnings_ttm',
  'earnings_per_share_basic_ttm',
  'earnings_per_share_diluted_ttm',
  'dividends_per_share_fq',
  'dividend_yield_recent',
  'price_book_ratio',
  'price_sales_ratio',
  'price_revenue_ttm',
  'return_on_equity',
  'return_on_assets',
  'total_revenue_ttm',
  'gross_profit_ttm',
  'net_income_ttm',
  'ebitda_ttm',
  'total_assets_fq',
  'total_debt_fq',
  'cash_n_short_term_invest_fq',
  'debt_to_equity_fq',
  'current_ratio_fq',
  'quick_ratio_fq',
  'total_shares_outstanding_fundamental',
  'float_shares_outstanding',
  'RSI',
  'RSI7',
  'MACD.macd',
  'MACD.signal',
  'MACD.hist',
  'SMA20',
  'SMA50',
  'SMA200',
  'EMA20',
  'EMA50',
  'EMA200',
  'Stoch.K',
  'Stoch.D',
  'ATR',
  'ADX',
  'CCI20',
  'W.R',
  'BB.upper',
  'BB.basis',
  'BB.lower',
  'Recommend.All',
  'Recommend.MA',
  'Recommend.Other',
  'gap',
  'Volatility.D',
  'beta_1_year',
  'sector',
  'industry'
];

export async function fetchNigerianStocksFromScanner(): Promise<LiveQuote[]> {
  const sessionId = getSessionId();
  
  const payload = {
    filter: [
      { left: 'exchange', operation: 'equal', right: 'NSENG' }
    ],
    options: { lang: 'en' },
    markets: ['nigeria'],
    symbols: { query: { types: [] }, tickers: [] },
    columns: SCANNER_COLUMNS,
    sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
    range: [0, 300]
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

      const price = Number(d[2]) || 0;
      const changePercent = Number(d[3]) || 0;
      const changeAbs = Number(d[4]) || 0;

      const quote: LiveQuote = {
        symbol: symbol.toUpperCase(),
        name: (d[0] as string) || symbol,
        description: (d[1] as string) || '',
        
        price,
        change: changeAbs,
        changePercent,
        volume: Number(d[5]) || 0,
        open: Number(d[6]) || 0,
        high: Number(d[7]) || 0,
        low: Number(d[8]) || 0,
        previousClose: price - changeAbs,
        
        marketCap: Number(d[9]) || 0,
        high52Week: Number(d[10]) || 0,
        low52Week: Number(d[11]) || 0,
        
        perfWeek: Number(d[12]) || 0,
        perfMonth: Number(d[13]) || 0,
        perf3Month: Number(d[14]) || 0,
        perf6Month: Number(d[15]) || 0,
        perfYTD: Number(d[16]) || 0,
        perfYear: Number(d[17]) || 0,
        perf5Year: Number(d[18]) || 0,
        perfAllTime: Number(d[19]) || 0,
        
        avgVolume10d: Number(d[20]) || 0,
        avgVolume30d: Number(d[21]) || 0,
        avgVolume90d: Number(d[22]) || 0,
        relativeVolume: Number(d[23]) || 0,
        
        volatilityWeek: Number(d[24]) || 0,
        volatilityMonth: Number(d[25]) || 0,
        
        pe: Number(d[26]) || 0,
        eps: Number(d[27]) || 0,
        epsDiluted: Number(d[28]) || 0,
        dividend: Number(d[29]) || 0,
        dividendYield: Number(d[30]) || 0,
        priceToBook: Number(d[31]) || 0,
        priceToSales: Number(d[32]) || 0,
        priceToRevenue: Number(d[33]) || 0,
        
        roe: Number(d[34]) || 0,
        roa: Number(d[35]) || 0,
        
        revenue: Number(d[36]) || 0,
        grossProfit: Number(d[37]) || 0,
        netIncome: Number(d[38]) || 0,
        ebitda: Number(d[39]) || 0,
        
        totalAssets: Number(d[40]) || 0,
        totalDebt: Number(d[41]) || 0,
        totalCash: Number(d[42]) || 0,
        debtToEquity: Number(d[43]) || 0,
        currentRatio: Number(d[44]) || 0,
        quickRatio: Number(d[45]) || 0,
        
        sharesOutstanding: Number(d[46]) || 0,
        floatShares: Number(d[47]) || 0,
        
        rsi: Number(d[48]) || 0,
        rsi7: Number(d[49]) || 0,
        
        macd: Number(d[50]) || 0,
        macdSignal: Number(d[51]) || 0,
        macdHist: Number(d[52]) || 0,
        
        sma20: Number(d[53]) || 0,
        sma50: Number(d[54]) || 0,
        sma200: Number(d[55]) || 0,
        ema20: Number(d[56]) || 0,
        ema50: Number(d[57]) || 0,
        ema200: Number(d[58]) || 0,
        
        stochK: Number(d[59]) || 0,
        stochD: Number(d[60]) || 0,
        
        atr: Number(d[61]) || 0,
        adx: Number(d[62]) || 0,
        cci: Number(d[63]) || 0,
        williamsR: Number(d[64]) || 0,
        
        bbUpper: Number(d[65]) || 0,
        bbMiddle: Number(d[66]) || 0,
        bbLower: Number(d[67]) || 0,
        
        recommendAll: Number(d[68]) || 0,
        recommendMA: Number(d[69]) || 0,
        recommendOther: Number(d[70]) || 0,
        
        buySignals: 0,
        sellSignals: 0,
        neutralSignals: 0,
        
        gap: Number(d[71]) || 0,
        gapPercent: 0,
        
        beta1Year: Number(d[73]) || 0,
        
        preMarketPrice: 0,
        preMarketChange: 0,
        postMarketPrice: 0,
        postMarketChange: 0,
        
        earningsDate: null,
        
        sector: (d[74] as string) || '',
        industry: (d[75] as string) || '',
        
        timestamp: Date.now(),
        isLive: true,
      };

      const recAll = quote.recommendAll;
      if (recAll > 0.1) {
        quote.buySignals = Math.round((recAll + 1) * 5);
        quote.sellSignals = Math.round((1 - recAll) * 5);
      } else if (recAll < -0.1) {
        quote.sellSignals = Math.round((Math.abs(recAll) + 1) * 5);
        quote.buySignals = Math.round((1 - Math.abs(recAll)) * 5);
      } else {
        quote.neutralSignals = 10;
      }

      if (quote.price > 0) {
        results.push(quote);
        quoteCache.set(quote.symbol, quote);
      }
    }

    lastScanTime = Date.now();
    console.log(`Fetched ${results.length} Nigerian stocks with ${SCANNER_COLUMNS.length} data fields from TradingView`);
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
