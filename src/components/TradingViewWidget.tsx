'use client';

import { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart3 } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol: string;
  height?: number;
}

function TradingViewWidget({ symbol, height = 500 }: TradingViewWidgetProps) {
  const { isDark } = useTheme();
  const cleanSymbol = symbol.replace('NGX:', '').replace('NSENG:', '');
  const theme = isDark ? 'dark' : 'light';

  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=NSENG:${cleanSymbol}&interval=D&hidesidetoolbar=0&symboledit=0&saveimage=1&toolbarbg=f1f3f6&studies=RSI@tv-basicstudies,MACD@tv-basicstudies&theme=${theme}&style=1&timezone=Africa/Lagos&withdateranges=1&showpopupbutton=1&locale=en`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          {cleanSymbol} Live Candlestick Chart
        </h3>
        <a 
          href={`https://www.tradingview.com/symbols/NSENG-${cleanSymbol}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          TradingView
        </a>
      </div>
      <div className="rounded-lg overflow-hidden">
        <iframe
          src={widgetUrl}
          style={{ width: '100%', height: `${height}px`, border: 'none' }}
          allowFullScreen
          loading="lazy"
          title={`TradingView Chart for ${cleanSymbol}`}
        />
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
