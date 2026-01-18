'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumThemeContextType {
  isPremium: boolean;
  tier: 'guest' | 'free' | 'premium';
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    gradient: string;
    border: string;
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
  };
  effects: {
    glowShadow: string;
    borderGlow: string;
    hoverGlow: string;
  };
}

const defaultTheme = {
  primary: 'emerald',
  secondary: 'slate',
  accent: 'teal',
  glow: 'rgba(16, 185, 129, 0.3)',
  gradient: 'from-emerald-500 to-teal-600',
  border: 'border-slate-700',
  background: 'bg-slate-900',
  cardBg: 'bg-slate-800/50',
  textPrimary: 'text-white',
  textSecondary: 'text-slate-400',
};

const premiumTheme = {
  primary: 'amber',
  secondary: 'slate',
  accent: 'yellow',
  glow: 'rgba(245, 158, 11, 0.4)',
  gradient: 'from-amber-400 via-yellow-500 to-orange-500',
  border: 'border-amber-500/30',
  background: 'bg-slate-950',
  cardBg: 'bg-gradient-to-br from-slate-900/90 to-slate-800/90',
  textPrimary: 'text-white',
  textSecondary: 'text-amber-100/70',
};

const defaultEffects = {
  glowShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
  borderGlow: '0 0 10px rgba(16, 185, 129, 0.3)',
  hoverGlow: '0 0 30px rgba(16, 185, 129, 0.4)',
};

const premiumEffects = {
  glowShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.1)',
  borderGlow: '0 0 15px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.1)',
  hoverGlow: '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(245, 158, 11, 0.2)',
};

const PremiumThemeContext = createContext<PremiumThemeContextType>({
  isPremium: false,
  tier: 'guest',
  theme: defaultTheme,
  effects: defaultEffects,
});

export function PremiumThemeProvider({ children }: { children: ReactNode }) {
  const { isPremium: subscriptionIsPremium, tier: subscriptionTier, isLoading } = useSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPremium = mounted && !isLoading ? subscriptionIsPremium : false;
  const tier = mounted && !isLoading ? subscriptionTier : 'guest';

  const value: PremiumThemeContextType = {
    isPremium,
    tier,
    theme: isPremium ? premiumTheme : defaultTheme,
    effects: isPremium ? premiumEffects : defaultEffects,
  };

  return (
    <PremiumThemeContext.Provider value={value}>
      {children}
    </PremiumThemeContext.Provider>
  );
}

export function usePremiumTheme() {
  return useContext(PremiumThemeContext);
}

export { PremiumThemeContext };
