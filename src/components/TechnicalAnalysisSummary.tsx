'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart2 } from 'lucide-react';

interface TechnicalAnalysisSummaryProps {
  recommendation?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  currentPrice?: number;
}

function TechnicalAnalysisSummary({
  recommendation,
  rsi,
  macd,
  macdSignal,
  sma20,
  sma50,
  sma200,
  ema20,
  ema50,
  ema200,
  currentPrice
}: TechnicalAnalysisSummaryProps) {
  const calculateOscillatorSignals = () => {
    let buy = 0, sell = 0, neutral = 0;

    if (rsi !== undefined) {
      if (rsi < 30) buy++;
      else if (rsi > 70) sell++;
      else neutral++;
    }

    if (macd !== undefined && macdSignal !== undefined) {
      if (macd > macdSignal) buy++;
      else if (macd < macdSignal) sell++;
      else neutral++;
    }

    return { buy, sell, neutral, total: buy + sell + neutral };
  };

  const calculateMASignals = () => {
    let buy = 0, sell = 0, neutral = 0;
    
    if (currentPrice !== undefined) {
      const mas = [
        { value: sma20, label: 'SMA20' },
        { value: sma50, label: 'SMA50' },
        { value: sma200, label: 'SMA200' },
        { value: ema20, label: 'EMA20' },
        { value: ema50, label: 'EMA50' },
        { value: ema200, label: 'EMA200' },
      ];

      mas.forEach(ma => {
        if (ma.value !== undefined) {
          if (currentPrice > ma.value) buy++;
          else if (currentPrice < ma.value) sell++;
          else neutral++;
        }
      });
    }

    return { buy, sell, neutral, total: buy + sell + neutral };
  };

  const getSummarySignal = () => {
    if (recommendation !== undefined) {
      if (recommendation >= 0.5) return { label: 'STRONG BUY', color: 'text-green-600', bg: 'bg-green-500', icon: TrendingUp };
      if (recommendation >= 0.1) return { label: 'BUY', color: 'text-green-500', bg: 'bg-green-400', icon: TrendingUp };
      if (recommendation <= -0.5) return { label: 'STRONG SELL', color: 'text-red-600', bg: 'bg-red-500', icon: TrendingDown };
      if (recommendation <= -0.1) return { label: 'SELL', color: 'text-red-500', bg: 'bg-red-400', icon: TrendingDown };
    }
    return { label: 'NEUTRAL', color: 'text-gray-500', bg: 'bg-gray-400', icon: Minus };
  };

  const oscillators = calculateOscillatorSignals();
  const movingAverages = calculateMASignals();
  const summary = getSummarySignal();
  const SummaryIcon = summary.icon;

  const getGaugeRotation = () => {
    if (recommendation === undefined) return 0;
    const clampedValue = Math.max(-1, Math.min(1, recommendation));
    return clampedValue * 90;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-purple-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Technical Analysis Summary</h2>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-48 h-24 overflow-hidden mb-2">
          <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-20"></div>
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 dark:bg-white origin-bottom rounded-full transition-transform duration-500"
            style={{ transform: `translateX(-50%) rotate(${getGaugeRotation()}deg)` }}
          ></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-slate-800 dark:bg-white"></div>
        </div>
        <div className={`flex items-center gap-2 ${summary.color}`}>
          <SummaryIcon size={24} />
          <span className="text-2xl font-bold">{summary.label}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Based on {oscillators.total + movingAverages.total} technical indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-blue-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Oscillators</h3>
          </div>
          <SignalBar buy={oscillators.buy} sell={oscillators.sell} neutral={oscillators.neutral} />
          <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
            <span className="text-red-500">{oscillators.sell} Sell</span>
            <span>{oscillators.neutral} Neutral</span>
            <span className="text-green-500">{oscillators.buy} Buy</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={18} className="text-orange-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Moving Averages</h3>
          </div>
          <SignalBar buy={movingAverages.buy} sell={movingAverages.sell} neutral={movingAverages.neutral} />
          <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
            <span className="text-red-500">{movingAverages.sell} Sell</span>
            <span>{movingAverages.neutral} Neutral</span>
            <span className="text-green-500">{movingAverages.buy} Buy</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
          <p className="text-red-600 font-semibold">{oscillators.sell + movingAverages.sell}</p>
          <p className="text-red-500 text-xs">Sell</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
          <p className="text-gray-600 dark:text-gray-300 font-semibold">{oscillators.neutral + movingAverages.neutral}</p>
          <p className="text-gray-500 text-xs">Neutral</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
          <p className="text-green-600 font-semibold">{oscillators.buy + movingAverages.buy}</p>
          <p className="text-green-500 text-xs">Buy</p>
        </div>
      </div>
    </div>
  );
}

function SignalBar({ buy, sell, neutral }: { buy: number; sell: number; neutral: number }) {
  const total = buy + sell + neutral;
  if (total === 0) return <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full"></div>;

  const buyPercent = (buy / total) * 100;
  const sellPercent = (sell / total) * 100;
  const neutralPercent = (neutral / total) * 100;

  return (
    <div className="flex h-3 rounded-full overflow-hidden">
      {sell > 0 && (
        <div className="bg-red-500" style={{ width: `${sellPercent}%` }}></div>
      )}
      {neutral > 0 && (
        <div className="bg-gray-400" style={{ width: `${neutralPercent}%` }}></div>
      )}
      {buy > 0 && (
        <div className="bg-green-500" style={{ width: `${buyPercent}%` }}></div>
      )}
    </div>
  );
}

export default memo(TechnicalAnalysisSummary);
