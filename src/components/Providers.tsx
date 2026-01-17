'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WatchlistProvider } from '@/lib/watchlistContext';
import { PremiumThemeProvider } from '@/contexts/PremiumThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PremiumThemeProvider>
          <WatchlistProvider>
            {children}
          </WatchlistProvider>
        </PremiumThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
