'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WatchlistProvider } from '@/lib/watchlistContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <WatchlistProvider>
          {children}
        </WatchlistProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
