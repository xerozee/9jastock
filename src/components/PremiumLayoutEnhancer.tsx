'use client';

import { useEffect } from 'react';
import { usePremiumTheme } from '@/contexts/PremiumThemeContext';
import { PremiumIndicator } from './PremiumWrapper';

export function PremiumLayoutEnhancer() {
  const { isPremium } = usePremiumTheme();

  useEffect(() => {
    if (isPremium) {
      document.body.classList.add('premium-mode');
    } else {
      document.body.classList.remove('premium-mode');
    }
    
    return () => {
      document.body.classList.remove('premium-mode');
    };
  }, [isPremium]);

  if (!isPremium) return null;

  return (
    <>
      <PremiumIndicator />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>
    </>
  );
}
