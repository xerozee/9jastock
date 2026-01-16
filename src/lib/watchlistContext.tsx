'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => Promise<void>;
  isLoading: boolean;
  syncWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = '9jastock_watchlist';

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.user);
        return !!data.user;
      }
      setIsAuthenticated(false);
      return false;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Fetch watchlist from database
  const fetchDatabaseWatchlist = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        return data.map((item: { symbol: string }) => item.symbol);
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // Sync watchlist - merge localStorage with database and save
  const syncWatchlist = useCallback(async () => {
    const authed = await checkAuth();

    if (authed) {
      setIsLoading(true);
      try {
        // Get both sources
        const dbWatchlist = await fetchDatabaseWatchlist();
        const localStored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        const localWatchlist: string[] = localStored ? JSON.parse(localStored) : [];

        // Merge: add any local items not in database
        const toAdd = localWatchlist.filter(symbol => !dbWatchlist.includes(symbol));

        for (const symbol of toAdd) {
          await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol }),
          });
        }

        // Get final list from database
        const finalWatchlist = await fetchDatabaseWatchlist();
        setWatchlist(finalWatchlist);

        // Clear localStorage since we're synced
        localStorage.removeItem(WATCHLIST_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to sync watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Not authenticated - use localStorage
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {
          setWatchlist([]);
        }
      }
    }
  }, [checkAuth, fetchDatabaseWatchlist]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await syncWatchlist();
      setIsLoaded(true);
    };
    init();
  }, [syncWatchlist]);

  // Save to localStorage when watchlist changes (only for non-auth users)
  useEffect(() => {
    if (isLoaded && !isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded, isAuthenticated]);

  const addToWatchlist = async (symbol: string) => {
    if (watchlist.includes(symbol)) return;

    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });

        if (response.ok) {
          setWatchlist(prev => [...prev, symbol]);
        }
      } catch (error) {
        console.error('Failed to add to watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setWatchlist(prev => [...prev, symbol]);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/portfolio', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });

        if (response.ok) {
          setWatchlist(prev => prev.filter(s => s !== symbol));
        }
      } catch (error) {
        console.error('Failed to remove from watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setWatchlist(prev => prev.filter(s => s !== symbol));
    }
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol);

  const toggleWatchlist = async (symbol: string) => {
    if (isInWatchlist(symbol)) {
      await removeFromWatchlist(symbol);
    } else {
      await addToWatchlist(symbol);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        isLoading,
        syncWatchlist,
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
