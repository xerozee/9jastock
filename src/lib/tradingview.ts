// TradingView symbol mapping for Nigerian stocks
// Symbol format: NSENG:SYMBOL for Nigerian Stock Exchange

export const NGX_SYMBOLS: Record<string, string> = {
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

/**
 * Get TradingView symbol for a Nigerian stock
 */
export function getTradingViewSymbol(symbol: string): string {
  return NGX_SYMBOLS[symbol.toUpperCase()] || `NSENG:${symbol.toUpperCase()}`;
}

/**
 * Get TradingView chart widget URL
 */
export function getTradingViewChartUrl(symbol: string, options?: {
  interval?: string;
  theme?: 'light' | 'dark';
  style?: number;
  height?: number;
}): string {
  const tvSymbol = getTradingViewSymbol(symbol);
  const {
    interval = 'D',
    theme = 'light',
    style = 1,
  } = options || {};

  return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=${theme}&style=${style}&timezone=Africa/Lagos&withdateranges=1&showpopupbutton=1&locale=en`;
}

/**
 * Get TradingView ticker widget URL
 */
export function getTradingViewTickerUrl(symbols: string[]): string {
  const tvSymbols = symbols.map(s => getTradingViewSymbol(s)).join(',');
  return `https://s.tradingview.com/embed-widget/tickers/?symbols=${encodeURIComponent(tvSymbols)}&colorTheme=light&isTransparent=false&showSymbolLogo=true&locale=en`;
}

/**
 * Get TradingView mini chart URL
 */
export function getTradingViewMiniChartUrl(symbol: string, options?: {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
}): string {
  const tvSymbol = getTradingViewSymbol(symbol);
  const { theme = 'light' } = options || {};

  return `https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=${tvSymbol}&dateRange=12M&colorTheme=${theme}&isTransparent=false&autosize=true&locale=en`;
}

/**
 * Get direct link to TradingView page
 */
export function getTradingViewPageUrl(symbol: string): string {
  return `https://www.tradingview.com/symbols/NSENG-${symbol.toUpperCase()}/`;
}
