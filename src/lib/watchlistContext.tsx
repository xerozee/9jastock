'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useSession } from 'next-auth/react';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => { success: boolean; limitReached?: boolean; max?: number };
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => { success: boolean; limitReached?: boolean; max?: number };
  maxItems: number;
  isAtLimit: boolean;
  isSyncing: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = '9jastock_watchlist';

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { limits, isPremium } = useSubscription();
  const { data: session, status: authStatus } = useSession();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedFromDb = useRef(false);

  const maxItems = limits.maxWatchlistItems === Infinity ? 999 : limits.maxWatchlistItems;

  const isAuthenticated = authStatus === 'authenticated' && !!session?.user;

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
    if (!isLoaded || !isAuthenticated || !isPremium || hasFetchedFromDb.current) return;
    hasFetchedFromDb.current = true;

    const fetchFromDb = async () => {
      try {
        const res = await fetch('/api/watchlist');
        if (!res.ok) return;
        const data = await res.json();
        const dbSymbols: string[] = data.symbols || [];

        if (dbSymbols.length > 0) {
          setWatchlist(prev => {
            const merged = [...new Set([...dbSymbols, ...prev])];
            return merged;
          });
        }
      } catch (err) {
        console.error('Failed to fetch watchlist from DB:', err);
      }
    };

    fetchFromDb();
  }, [isLoaded, isAuthenticated, isPremium]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const syncToDb = useCallback((symbols: string[]) => {
    if (!isAuthenticated || !isPremium) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await fetch('/api/watchlist', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols }),
        });
      } catch (err) {
        console.error('Failed to sync watchlist to DB:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1000);
  }, [isAuthenticated, isPremium]);

  useEffect(() => {
    if (isLoaded && hasFetchedFromDb.current) {
      syncToDb(watchlist);
    }
  }, [watchlist, isLoaded, syncToDb]);

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
        isSyncing,
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
