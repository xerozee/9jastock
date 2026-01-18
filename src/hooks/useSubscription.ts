'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { TIER_LIMITS, SubscriptionTier } from '@/lib/subscription';

interface UseSubscriptionReturn {
  tier: SubscriptionTier;
  isPremium: boolean;
  limits: typeof TIER_LIMITS['free'];
  isLoading: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('guest');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      setTier('guest');
      return;
    }

    const status = (user as any).subscriptionStatus;
    if (status === 'active' || status === 'trialing') {
      setTier('premium');
    } else {
      setTier('free');
    }
  }, [user, authLoading, isAuthenticated]);

  return {
    tier,
    isPremium: tier === 'premium',
    limits: TIER_LIMITS[tier],
    isLoading: authLoading,
  };
}
