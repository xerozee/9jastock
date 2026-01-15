'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Stock } from '@/types/stock';

interface LiveStockData extends Stock {
  isLive: boolean;
  lastUpdated?: number;
}

interface UseLiveStocksReturn {
  stocks: LiveStockData[];
  isLoading: boolean;
  error: string | null;
  liveCount: number;
  refresh: () => void;
  lastRefresh: number | null;
  isRefreshing: boolean;
}

interface UseLiveStockReturn {
  stock: LiveStockData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastRefresh: number | null;
  isRefreshing: boolean;
}

/**
 * Hook to fetch all live stock data
 * Background refresh happens without showing loading state
 */
export function useLiveStocks(
  refreshInterval: number = 30000
): UseLiveStocksReturn {
  const [stocks, setStocks] = useState<LiveStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const isInitialLoad = useRef(true);

  const fetchStocks = useCallback(async (showLoading: boolean = false) => {
    try {
      if (showLoading || isInitialLoad.current) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
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
      isInitialLoad.current = false;
    } catch (err) {
      setError('Network error fetching stocks');
      console.error('Error fetching stocks:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks(true);

    if (refreshInterval > 0) {
      const interval = setInterval(() => fetchStocks(false), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStocks, refreshInterval]);

  return {
    stocks,
    isLoading,
    error,
    liveCount,
    refresh: () => fetchStocks(false),
    lastRefresh,
    isRefreshing,
  };
}

/**
 * Hook to fetch a single stock's live data
 * Background refresh happens without showing loading state
 */
export function useLiveStock(
  symbol: string,
  refreshInterval: number = 30000
): UseLiveStockReturn {
  const [stock, setStock] = useState<LiveStockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const isInitialLoad = useRef(true);

  const fetchStock = useCallback(async (showLoading: boolean = false) => {
    if (!symbol) return;

    try {
      if (showLoading || isInitialLoad.current) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
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
      isInitialLoad.current = false;
    } catch (err) {
      setError('Network error fetching stock');
      console.error('Error fetching stock:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [symbol]);

  useEffect(() => {
    isInitialLoad.current = true;
    fetchStock(true);

    if (refreshInterval > 0) {
      const interval = setInterval(() => fetchStock(false), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStock, refreshInterval]);

  return {
    stock,
    isLoading,
    error,
    refresh: () => fetchStock(false),
    lastRefresh,
    isRefreshing,
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
