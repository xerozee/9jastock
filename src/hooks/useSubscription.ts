'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { TIER_LIMITS, SubscriptionTier } from '@/lib/subscription';

interface UseSubscriptionReturn {
  tier: SubscriptionTier;
  isPremium: boolean;
  limits: typeof TIER_LIMITS['guest'];
  isLoading: boolean;
  statusResolved: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('guest');
  const [statusResolved, setStatusResolved] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setStatusResolved(false);
      return;
    }
    
    if (!isAuthenticated || !user) {
      setTier('guest');
      setStatusResolved(true);
      return;
    }

    const status = (user as any).subscriptionStatus;
    if (status === 'active' || status === 'trialing') {
      setTier('premium');
    } else {
      setTier('guest');
    }
    setStatusResolved(true);
  }, [user, authLoading, isAuthenticated]);

  return {
    tier,
    isPremium: tier === 'premium',
    limits: TIER_LIMITS[tier],
    isLoading: authLoading,
    statusResolved,
  };
}
