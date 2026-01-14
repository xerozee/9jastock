'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WatchlistProvider } from '@/lib/watchlistContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        {children}
      </WatchlistProvider>
    </ThemeProvider>
  );
}
