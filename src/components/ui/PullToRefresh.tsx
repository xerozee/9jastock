'use client';

import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullProgress: number;
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({ 
  pullProgress, 
  isRefreshing 
}: PullToRefreshIndicatorProps) {
  if (pullProgress === 0 && !isRefreshing) return null;

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10 transition-transform pointer-events-none"
      style={{ 
        transform: `translateX(-50%) translateY(${Math.min(pullProgress * 60, 60)}px)`,
        opacity: pullProgress > 0.2 ? 1 : pullProgress * 5
      }}
    >
      <div 
        className={`w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg ${
          isRefreshing ? 'animate-spin' : ''
        }`}
      >
        <RefreshCw 
          className="w-5 h-5 text-white"
          style={{ 
            transform: isRefreshing ? 'none' : `rotate(${pullProgress * 360}deg)` 
          }}
        />
      </div>
    </div>
  );
}

export { usePullToRefresh } from '@/hooks/usePullToRefresh';
