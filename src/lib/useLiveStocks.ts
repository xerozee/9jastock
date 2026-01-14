'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stock } from '@/types/stock';

interface LiveStockData extends Stock {
  isLive: boolean;
  lastUpdated: number | null;
}

interface UseLiveStocksReturn {
  stocks: LiveStockData[];
  isLoading: boolean;
  error: string | null;
  liveCount: number;
  refresh: () => void;
  lastRefresh: number | null;
}

interface UseLiveStockReturn {
  stock: LiveStockData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastRefresh: number | null;
}

/**
 * Hook to fetch all live stock data
 */
export function useLiveStocks(
  refreshInterval: number = 30000 // 30 seconds default
): UseLiveStocksReturn {
  const [stocks, setStocks] = useState<LiveStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stocks');
      const result = await response.json();

      if (result.success) {
        setStocks(result.data);
        setLiveCount(result.liveCount);
        setError(null);
      } else {
        setStocks(result.data || []);
        setError(result.error || 'Failed to fetch live data');
      }
      setLastRefresh(Date.now());
    } catch (err) {
      setError('Network error fetching stocks');
      console.error('Error fetching stocks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStocks, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStocks, refreshInterval]);

  return {
    stocks,
    isLoading,
    error,
    liveCount,
    refresh: fetchStocks,
    lastRefresh,
  };
}

/**
 * Hook to fetch a single stock's live data
 */
export function useLiveStock(
  symbol: string,
  refreshInterval: number = 30000
): UseLiveStockReturn {
  const [stock, setStock] = useState<LiveStockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const fetchStock = useCallback(async () => {
    if (!symbol) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/stocks/${symbol}`);
      const result = await response.json();

      if (result.success) {
        setStock(result.data);
        setError(null);
      } else {
        setStock(result.data || null);
        setError(result.error || 'Failed to fetch live data');
      }
      setLastRefresh(Date.now());
    } catch (err) {
      setError('Network error fetching stock');
      console.error('Error fetching stock:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStock();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStock, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStock, refreshInterval]);

  return {
    stock,
    isLoading,
    error,
    refresh: fetchStock,
    lastRefresh,
  };
}

/**
 * Format timestamp to readable time
 */
export function formatLastUpdate(timestamp: number | null): string {
  if (!timestamp) return 'Not available';

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return new Date(timestamp).toLocaleTimeString('en-NG');
  }
}
