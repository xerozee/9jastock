import { Stock, StockHistoryPoint, MarketSummary } from '@/types/stock';

// Nigerian Stock Exchange (NGX) mock data
// In production, this would connect to real APIs like NGX, Bloomberg, or Reuters

export const nigerianStocks: Stock[] = [
  {
    symbol: 'DANGCEM',
    name: 'Dangote Cement Plc',
    sector: 'Industrial Goods',
    price: 290.50,
    change: 5.50,
    changePercent: 1.93,
    volume: 2450000,
    marketCap: 4950000000000,
    high52Week: 320.00,
    low52Week: 245.00,
    open: 285.00,
    high: 292.00,
    low: 284.50,
    previousClose: 285.00,
    pe: 12.5,
    eps: 23.24,
    dividend: 20.00,
  },
  {
    symbol: 'GTCO',
    name: 'Guaranty Trust Holding Co Plc',
    sector: 'Financial Services',
    price: 45.80,
    change: 1.20,
    changePercent: 2.69,
    volume: 15200000,
    marketCap: 1347000000000,
    high52Week: 52.00,
    low52Week: 32.50,
    open: 44.50,
    high: 46.00,
    low: 44.30,
    previousClose: 44.60,
    pe: 4.2,
    eps: 10.90,
    dividend: 3.00,
  },
  {
    symbol: 'ZENITHBANK',
    name: 'Zenith Bank Plc',
    sector: 'Financial Services',
    price: 38.95,
    change: -0.55,
    changePercent: -1.39,
    volume: 12800000,
    marketCap: 1222000000000,
    high52Week: 45.00,
    low52Week: 28.00,
    open: 39.50,
    high: 39.80,
    low: 38.50,
    previousClose: 39.50,
    pe: 3.8,
    eps: 10.25,
    dividend: 3.20,
  },
  {
    symbol: 'AIRTELAFRI',
    name: 'Airtel Africa Plc',
    sector: 'ICT',
    price: 2150.00,
    change: 45.00,
    changePercent: 2.14,
    volume: 850000,
    marketCap: 8075000000000,
    high52Week: 2400.00,
    low52Week: 1650.00,
    open: 2105.00,
    high: 2165.00,
    low: 2100.00,
    previousClose: 2105.00,
    pe: 18.5,
    eps: 116.22,
    dividend: 45.00,
  },
  {
    symbol: 'MTNN',
    name: 'MTN Nigeria Communications Plc',
    sector: 'ICT',
    price: 295.00,
    change: -3.50,
    changePercent: -1.17,
    volume: 3200000,
    marketCap: 6010000000000,
    high52Week: 350.00,
    low52Week: 220.00,
    open: 298.00,
    high: 300.00,
    low: 293.50,
    previousClose: 298.50,
    pe: 15.2,
    eps: 19.41,
    dividend: 14.33,
  },
  {
    symbol: 'BUACEMENT',
    name: 'BUA Cement Plc',
    sector: 'Industrial Goods',
    price: 98.50,
    change: 2.30,
    changePercent: 2.39,
    volume: 1850000,
    marketCap: 3320000000000,
    high52Week: 115.00,
    low52Week: 75.00,
    open: 96.00,
    high: 99.00,
    low: 95.80,
    previousClose: 96.20,
    pe: 22.1,
    eps: 4.46,
    dividend: 2.50,
  },
  {
    symbol: 'NESTLE',
    name: 'Nestle Nigeria Plc',
    sector: 'Consumer Goods',
    price: 1450.00,
    change: -15.00,
    changePercent: -1.02,
    volume: 125000,
    marketCap: 1149000000000,
    high52Week: 1650.00,
    low52Week: 1200.00,
    open: 1465.00,
    high: 1470.00,
    low: 1445.00,
    previousClose: 1465.00,
    pe: 28.4,
    eps: 51.06,
    dividend: 66.50,
  },
  {
    symbol: 'SEPLAT',
    name: 'Seplat Energy Plc',
    sector: 'Oil & Gas',
    price: 3250.00,
    change: 85.00,
    changePercent: 2.69,
    volume: 420000,
    marketCap: 1912000000000,
    high52Week: 3800.00,
    low52Week: 2400.00,
    open: 3165.00,
    high: 3280.00,
    low: 3150.00,
    previousClose: 3165.00,
    pe: 8.5,
    eps: 382.35,
    dividend: 65.00,
  },
  {
    symbol: 'ACCESSCORP',
    name: 'Access Holdings Plc',
    sector: 'Financial Services',
    price: 22.45,
    change: 0.65,
    changePercent: 2.98,
    volume: 28500000,
    marketCap: 798000000000,
    high52Week: 28.00,
    low52Week: 15.50,
    open: 21.80,
    high: 22.70,
    low: 21.70,
    previousClose: 21.80,
    pe: 2.8,
    eps: 8.02,
    dividend: 1.10,
  },
  {
    symbol: 'UBA',
    name: 'United Bank for Africa Plc',
    sector: 'Financial Services',
    price: 28.50,
    change: 0.85,
    changePercent: 3.07,
    volume: 18200000,
    marketCap: 975000000000,
    high52Week: 35.00,
    low52Week: 19.50,
    open: 27.65,
    high: 28.80,
    low: 27.50,
    previousClose: 27.65,
    pe: 3.1,
    eps: 9.19,
    dividend: 1.50,
  },
  {
    symbol: 'FBNH',
    name: 'FBN Holdings Plc',
    sector: 'Financial Services',
    price: 25.90,
    change: -0.40,
    changePercent: -1.52,
    volume: 22400000,
    marketCap: 928000000000,
    high52Week: 32.00,
    low52Week: 18.00,
    open: 26.30,
    high: 26.50,
    low: 25.70,
    previousClose: 26.30,
    pe: 3.5,
    eps: 7.40,
    dividend: 0.65,
  },
  {
    symbol: 'STANBIC',
    name: 'Stanbic IBTC Holdings Plc',
    sector: 'Financial Services',
    price: 68.50,
    change: 1.50,
    changePercent: 2.24,
    volume: 1250000,
    marketCap: 760000000000,
    high52Week: 78.00,
    low52Week: 52.00,
    open: 67.00,
    high: 69.00,
    low: 66.80,
    previousClose: 67.00,
    pe: 5.8,
    eps: 11.81,
    dividend: 4.00,
  },
  {
    symbol: 'WAPCO',
    name: 'Lafarge Africa Plc',
    sector: 'Industrial Goods',
    price: 32.80,
    change: 0.30,
    changePercent: 0.92,
    volume: 2150000,
    marketCap: 528000000000,
    high52Week: 40.00,
    low52Week: 25.00,
    open: 32.50,
    high: 33.00,
    low: 32.40,
    previousClose: 32.50,
    pe: 15.2,
    eps: 2.16,
    dividend: 1.00,
  },
  {
    symbol: 'FLOURMILL',
    name: 'Flour Mills of Nigeria Plc',
    sector: 'Consumer Goods',
    price: 45.20,
    change: 1.20,
    changePercent: 2.73,
    volume: 1820000,
    marketCap: 185000000000,
    high52Week: 55.00,
    low52Week: 35.00,
    open: 44.00,
    high: 45.50,
    low: 43.80,
    previousClose: 44.00,
    pe: 8.5,
    eps: 5.32,
    dividend: 2.00,
  },
  {
    symbol: 'OANDO',
    name: 'Oando Plc',
    sector: 'Oil & Gas',
    price: 18.75,
    change: 0.55,
    changePercent: 3.02,
    volume: 8500000,
    marketCap: 233000000000,
    high52Week: 24.00,
    low52Week: 12.00,
    open: 18.20,
    high: 19.00,
    low: 18.10,
    previousClose: 18.20,
    pe: 6.2,
    eps: 3.02,
    dividend: 0.50,
  },
  {
    symbol: 'PRESCO',
    name: 'Presco Plc',
    sector: 'Agriculture',
    price: 285.00,
    change: -5.00,
    changePercent: -1.72,
    volume: 125000,
    marketCap: 285000000000,
    high52Week: 350.00,
    low52Week: 220.00,
    open: 290.00,
    high: 292.00,
    low: 283.00,
    previousClose: 290.00,
    pe: 12.8,
    eps: 22.27,
    dividend: 10.00,
  },
  {
    symbol: 'GUINNESS',
    name: 'Guinness Nigeria Plc',
    sector: 'Consumer Goods',
    price: 68.00,
    change: 2.00,
    changePercent: 3.03,
    volume: 580000,
    marketCap: 149000000000,
    high52Week: 82.00,
    low52Week: 50.00,
    open: 66.00,
    high: 68.50,
    low: 65.80,
    previousClose: 66.00,
    pe: 18.5,
    eps: 3.68,
    dividend: 1.50,
  },
  {
    symbol: 'CADBURY',
    name: 'Cadbury Nigeria Plc',
    sector: 'Consumer Goods',
    price: 18.50,
    change: 0.40,
    changePercent: 2.21,
    volume: 950000,
    marketCap: 34700000000,
    high52Week: 25.00,
    low52Week: 14.00,
    open: 18.10,
    high: 18.70,
    low: 18.00,
    previousClose: 18.10,
    pe: 25.2,
    eps: 0.73,
    dividend: 0.30,
  },
  {
    symbol: 'UNILEVER',
    name: 'Unilever Nigeria Plc',
    sector: 'Consumer Goods',
    price: 22.80,
    change: -0.30,
    changePercent: -1.30,
    volume: 720000,
    marketCap: 131000000000,
    high52Week: 30.00,
    low52Week: 18.00,
    open: 23.10,
    high: 23.30,
    low: 22.60,
    previousClose: 23.10,
    pe: 45.6,
    eps: 0.50,
    dividend: 0.20,
  },
  {
    symbol: 'TOTAL',
    name: 'TotalEnergies Marketing Nigeria Plc',
    sector: 'Oil & Gas',
    price: 385.00,
    change: 10.00,
    changePercent: 2.67,
    volume: 85000,
    marketCap: 130700000000,
    high52Week: 450.00,
    low52Week: 300.00,
    open: 375.00,
    high: 388.00,
    low: 374.00,
    previousClose: 375.00,
    pe: 14.2,
    eps: 27.11,
    dividend: 18.00,
  },
];

// Generate realistic historical data
export function generateHistoricalData(
  basePrice: number,
  days: number = 365
): StockHistoryPoint[] {
  const data: StockHistoryPoint[] = [];
  let currentPrice = basePrice * 0.85; // Start from 85% of current price
  const volatility = 0.025; // 2.5% daily volatility
  const trend = (basePrice - currentPrice) / days; // Slight upward trend

  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const randomChange = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + trend + randomChange, basePrice * 0.5);

    const dayHigh = currentPrice * (1 + Math.random() * 0.02);
    const dayLow = currentPrice * (1 - Math.random() * 0.02);
    const open = dayLow + Math.random() * (dayHigh - dayLow);
    const close = dayLow + Math.random() * (dayHigh - dayLow);

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(dayHigh.toFixed(2)),
      low: parseFloat(dayLow.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 500000,
    });
  }

  return data;
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return nigerianStocks.find(
    (stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function getStocksBySymbols(symbols: string[]): Stock[] {
  const symbolSet = new Set(symbols.map((s) => s.toLowerCase()));
  return nigerianStocks.filter((stock) =>
    symbolSet.has(stock.symbol.toLowerCase())
  );
}

export function searchStocks(query: string): Stock[] {
  const lowerQuery = query.toLowerCase();
  return nigerianStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  );
}

export function getStocksBySector(sector: string): Stock[] {
  return nigerianStocks.filter(
    (stock) => stock.sector.toLowerCase() === sector.toLowerCase()
  );
}

export function getAllSectors(): string[] {
  return [...new Set(nigerianStocks.map((stock) => stock.sector))];
}

export function getTopGainers(limit: number = 5): Stock[] {
  return [...nigerianStocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
}

export function getTopLosers(limit: number = 5): Stock[] {
  return [...nigerianStocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
}

export function getMostActive(limit: number = 5): Stock[] {
  return [...nigerianStocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

export function getMarketSummary(): MarketSummary {
  const advancers = nigerianStocks.filter((s) => s.change > 0).length;
  const decliners = nigerianStocks.filter((s) => s.change < 0).length;
  const unchanged = nigerianStocks.filter((s) => s.change === 0).length;

  const totalMarketCap = nigerianStocks.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = nigerianStocks.reduce((sum, s) => sum + s.volume, 0);

  return {
    totalMarketCap,
    totalVolume,
    advancers,
    decliners,
    unchanged,
    indices: [
      {
        name: 'NGX All-Share Index',
        value: 99876.54,
        change: 523.45,
        changePercent: 0.53,
      },
      {
        name: 'NGX 30 Index',
        value: 3456.78,
        change: 28.12,
        changePercent: 0.82,
      },
      {
        name: 'NGX Banking Index',
        value: 876.32,
        change: -5.43,
        changePercent: -0.62,
      },
      {
        name: 'NGX Consumer Goods',
        value: 1234.56,
        change: 12.34,
        changePercent: 1.01,
      },
      {
        name: 'NGX Oil & Gas Index',
        value: 567.89,
        change: 8.92,
        changePercent: 1.60,
      },
    ],
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1e12) {
    return `₦${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `₦${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `₦${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `₦${(value / 1e3).toFixed(2)}K`;
  }
  return `₦${value.toFixed(2)}`;
}

export function formatVolume(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toString();
}
