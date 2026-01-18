export const STRIPE_PRICE_IDS = {
  MONTHLY: 'price_1SqhNRFdhW4BFiSVP2PuIVqc',
  YEARLY: 'price_1SqhPaFdhW4BFiSVOo17YrNw',
} as const;

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Premium Monthly',
    price: 2999,
    priceId: STRIPE_PRICE_IDS.MONTHLY,
    interval: 'month',
    features: [
      '1-minute real-time data for 145+ stocks',
      'Unlimited portfolio tracking with live P&L',
      'AI Buy/Sell/Hold recommendations',
      'Push notifications & price alerts',
      'X/Twitter market buzz with AI sentiment',
      'Full 30-day news archive',
      'Advanced technical analysis tools',
      'AI morning newsletter',
    ],
  },
  yearly: {
    name: 'Premium Yearly',
    price: 24999,
    priceId: STRIPE_PRICE_IDS.YEARLY,
    interval: 'year',
    savings: '17%',
    monthlyEquivalent: 2083,
    features: [
      '1-minute real-time data for 145+ stocks',
      'Unlimited portfolio tracking with live P&L',
      'AI Buy/Sell/Hold recommendations',
      'Push notifications & price alerts',
      'X/Twitter market buzz with AI sentiment',
      'Full 30-day news archive',
      'Advanced technical analysis tools',
      'AI morning newsletter',
    ],
  },
} as const;

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function isPremiumUser(subscriptionStatus?: string): boolean {
  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
}
