export interface Stock {
  symbol: string;
  name: string;
  description?: string;
  sector: string;
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
  
  perfWeek?: number;
  perfMonth?: number;
  perf3Month?: number;
  perf6Month?: number;
  perfYTD?: number;
  perfYear?: number;
  perf5Year?: number;
  perfAllTime?: number;
  
  avgVolume10d?: number;
  avgVolume30d?: number;
  avgVolume90d?: number;
  relativeVolume?: number;
  
  volatilityWeek?: number;
  volatilityMonth?: number;
  
  pe?: number;
  eps?: number;
  epsDiluted?: number;
  dividend?: number;
  dividendYield?: number;
  priceToBook?: number;
  priceToSales?: number;
  priceToRevenue?: number;
  
  roe?: number;
  roa?: number;
  
  revenue?: number;
  grossProfit?: number;
  netIncome?: number;
  ebitda?: number;
  
  totalAssets?: number;
  totalDebt?: number;
  totalCash?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  
  sharesOutstanding?: number;
  floatShares?: number;
  
  rsi?: number;
  rsi7?: number;
  
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  
  stochK?: number;
  stochD?: number;
  
  atr?: number;
  adx?: number;
  cci?: number;
  williamsR?: number;
  
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  
  recommendAll?: number;
  recommendMA?: number;
  recommendOther?: number;
  
  buySignals?: number;
  sellSignals?: number;
  neutralSignals?: number;
  
  gap?: number;
  gapPercent?: number;
  
  beta1Year?: number;
  
  preMarketPrice?: number;
  preMarketChange?: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  
  earningsDate?: string | null;
  
  isLive?: boolean;
  lastUpdated?: number;
}

export interface StockHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketSummary {
  totalMarketCap: number;
  totalVolume: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  indices: MarketIndex[];
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
