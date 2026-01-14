"use client";

import { useState, useEffect, useCallback } from "react";

interface PortfolioItem {
  id: string;
  userId: string;
  symbol: string;
  addedAt: string;
}

interface PortfolioState {
  items: PortfolioItem[];
  symbols: Set<string>;
  isLoading: boolean;
  error: string | null;
}

export function usePortfolio() {
  const [state, setState] = useState<PortfolioState>({
    items: [],
    symbols: new Set(),
    isLoading: true,
    error: null,
  });

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch("/api/portfolio", {
        credentials: "include",
      });
      
      if (response.status === 401) {
        setState({
          items: [],
          symbols: new Set(),
          isLoading: false,
          error: null,
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }
      
      const data = await response.json();
      const symbols = new Set<string>(data.items.map((item: PortfolioItem) => item.symbol));
      
      setState({
        items: data.items,
        symbols,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const addToPortfolio = async (symbol: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ symbol }),
      });
      
      if (response.ok) {
        await fetchPortfolio();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const removeFromPortfolio = async (symbol: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ symbol }),
      });
      
      if (response.ok) {
        await fetchPortfolio();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isInPortfolio = (symbol: string): boolean => {
    return state.symbols.has(symbol.toUpperCase());
  };

  return {
    items: state.items,
    symbols: state.symbols,
    isLoading: state.isLoading,
    error: state.error,
    addToPortfolio,
    removeFromPortfolio,
    isInPortfolio,
    refresh: fetchPortfolio,
  };
}
