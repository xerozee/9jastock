'use client';

import { RefreshCw } from 'lucide-react';
import { formatLastUpdate } from '@/lib/useLiveStocks';

interface LiveIndicatorProps {
  isLive: boolean;
  lastUpdated: number | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function LiveIndicator({
  isLive,
  lastUpdated,
  onRefresh,
  isLoading,
}: LiveIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center">
        <span
          className={`w-2 h-2 rounded-full mr-2 ${
            isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
          }`}
        />
        <span className={isLive ? 'text-green-600' : 'text-yellow-600'}>
          {isLive ? 'Live' : 'Delayed'}
        </span>
      </div>

      {lastUpdated && (
        <span className="text-gray-500">
          · Updated {formatLastUpdate(lastUpdated)}
        </span>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw
            size={14}
            className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
