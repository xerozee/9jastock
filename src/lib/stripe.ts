import Stripe from 'stripe';

async function getCredentials() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    throw new Error('Stripe credentials not configured. Please add STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to your secrets.');
  }

  return {
    publishableKey,
    secretKey,
  };
}

export async function getStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: '9jaStock Premium Monthly',
    price: 2999,
    interval: 'month' as const,
    features: [
      'Real-time stock data (1-min refresh)',
      'AI-powered stock recommendations',
      'Unlimited portfolio tracking',
      'Priority news access',
      'Advanced analytics',
      'Email alerts',
    ],
  },
  YEARLY: {
    name: '9jaStock Premium Yearly',
    price: 24999,
    interval: 'year' as const,
    features: [
      'All monthly features',
      '2 months free (save ₦11,000)',
      'Priority customer support',
    ],
  },
};
