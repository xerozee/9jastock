export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  pe?: number;
  eps?: number;
  dividend?: number;
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
