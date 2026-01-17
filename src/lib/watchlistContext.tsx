'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => { success: boolean; limitReached?: boolean; max?: number };
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => { success: boolean; limitReached?: boolean; max?: number };
  maxItems: number;
  isAtLimit: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = '9jastock_watchlist';

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { limits, isPremium } = useSubscription();
  
  const maxItems = limits.maxWatchlistItems === Infinity ? 999 : limits.maxWatchlistItems;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {
          setWatchlist([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addToWatchlist = useCallback((symbol: string): { success: boolean; limitReached?: boolean; max?: number } => {
    if (watchlist.includes(symbol)) {
      return { success: true };
    }
    
    if (!isPremium && watchlist.length >= maxItems) {
      return { success: false, limitReached: true, max: maxItems };
    }
    
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
    return { success: true };
  }, [watchlist, isPremium, maxItems]);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const isInWatchlist = useCallback((symbol: string) => watchlist.includes(symbol), [watchlist]);

  const toggleWatchlist = useCallback((symbol: string): { success: boolean; limitReached?: boolean; max?: number } => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol);
      return { success: true };
    } else {
      return addToWatchlist(symbol);
    }
  }, [isInWatchlist, removeFromWatchlist, addToWatchlist]);

  const isAtLimit = !isPremium && watchlist.length >= maxItems;

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        maxItems,
        isAtLimit,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
