'use client';

import { memo, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Activity } from 'lucide-react';

interface TradingViewTechnicalAnalysisProps {
  symbol: string;
  height?: number;
}

function TradingViewTechnicalAnalysis({ symbol, height = 450 }: TradingViewTechnicalAnalysisProps) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanSymbol = symbol.replace('NGX:', '').replace('NSENG:', '');
  const theme = isDark ? 'dark' : 'light';

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      isTransparent: true,
      height: height,
      symbol: `NSENG:${cleanSymbol}`,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: theme
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => {
      container.innerHTML = '';
    };
  }, [cleanSymbol, height, theme]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <Activity className="text-purple-600 dark:text-purple-400" size={24} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          Technical Analysis
        </h3>
        <a 
          href={`https://www.tradingview.com/symbols/NSENG-${cleanSymbol}/technicals/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          TradingView
        </a>
      </div>
      <div 
        ref={containerRef}
        key={`${cleanSymbol}-${theme}`}
        style={{ height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}

export default memo(TradingViewTechnicalAnalysis);
