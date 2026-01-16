'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WatchlistProvider } from '@/lib/watchlistContext';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        <ServiceWorkerRegistration />
        {children}
      </WatchlistProvider>
    </ThemeProvider>
  );
}
