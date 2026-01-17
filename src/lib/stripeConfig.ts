export const STRIPE_PRICE_IDS = {
  MONTHLY: 'price_1SqhNRFdhW4BFiSVP2PuIVqc',
  YEARLY: 'price_1SqhPaFdhW4BFiSVOo17YrNw',
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '5-minute data refresh',
      'Up to 10 portfolio stocks',
      'Basic watchlist',
      'Market overview',
      'Technical indicators',
    ],
  },
  monthly: {
    name: 'Premium Monthly',
    price: 2999,
    priceId: STRIPE_PRICE_IDS.MONTHLY,
    interval: 'month',
    features: [
      '1-minute real-time data',
      'Unlimited portfolio stocks',
      'AI stock recommendations',
      'Push notifications & price alerts',
      'Priority support',
      'Full market sentiment analysis',
      'Advanced technical analysis',
    ],
  },
  yearly: {
    name: 'Premium Yearly',
    price: 24999,
    priceId: STRIPE_PRICE_IDS.YEARLY,
    interval: 'year',
    savings: '17%',
    features: [
      '1-minute real-time data',
      'Unlimited portfolio stocks',
      'AI stock recommendations',
      'Push notifications & price alerts',
      'Priority support',
      'Full market sentiment analysis',
      'Advanced technical analysis',
    ],
  },
} as const;

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function isPremiumUser(subscriptionStatus?: string): boolean {
  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
}
