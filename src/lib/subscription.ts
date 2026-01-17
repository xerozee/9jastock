import { IUser } from './mongodb';

export type SubscriptionTier = 'guest' | 'free' | 'premium';

export function getUserTier(user: IUser | null): SubscriptionTier {
  if (!user) return 'guest';
  
  const status = user.subscriptionStatus;
  if (status === 'active' || status === 'trialing') {
    return 'premium';
  }
  
  return 'free';
}

export function isPremium(user: IUser | null): boolean {
  return getUserTier(user) === 'premium';
}

export function canAccessFeature(user: IUser | null, feature: PremiumFeature): boolean {
  const tier = getUserTier(user);
  return FEATURE_ACCESS[feature].includes(tier);
}

export type PremiumFeature = 
  | 'realtime_data'
  | 'ai_recommendations'
  | 'unlimited_portfolio'
  | 'priority_news'
  | 'advanced_analytics'
  | 'email_alerts'
  | 'fast_refresh'
  | 'extended_news_history';

export const FEATURE_ACCESS: Record<PremiumFeature, SubscriptionTier[]> = {
  realtime_data: ['premium'],
  ai_recommendations: ['premium'],
  unlimited_portfolio: ['premium'],
  priority_news: ['premium'],
  advanced_analytics: ['premium'],
  email_alerts: ['premium'],
  fast_refresh: ['premium'],
  extended_news_history: ['free', 'premium'],
};

export const TIER_LIMITS = {
  guest: {
    refreshInterval: 15 * 60 * 1000,
    maxPortfolioItems: 0,
    maxWatchlistItems: 3,
    newsArticles: 5,
    socialPosts: 1,
    newsDays: 7,
  },
  free: {
    refreshInterval: 5 * 60 * 1000,
    maxPortfolioItems: 10,
    maxWatchlistItems: 5,
    newsArticles: 5,
    socialPosts: 1,
    newsDays: 14,
  },
  premium: {
    refreshInterval: 1 * 60 * 1000,
    maxPortfolioItems: Infinity,
    maxWatchlistItems: Infinity,
    newsArticles: 100,
    socialPosts: Infinity,
    newsDays: 30,
  },
};

export const PREMIUM_FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Data',
    description: '1-minute refresh for live market tracking',
  },
  {
    icon: '🤖',
    title: 'AI Recommendations',
    description: 'Personalized stock picks based on your profile',
  },
  {
    icon: '📊',
    title: 'Unlimited Portfolio',
    description: 'Track unlimited stocks in your portfolio',
  },
  {
    icon: '📰',
    title: 'Priority News',
    description: '30 days of news history with 100+ articles',
  },
  {
    icon: '📈',
    title: 'Advanced Analytics',
    description: 'Deep insights and technical indicators',
  },
  {
    icon: '🔔',
    title: 'Email Alerts',
    description: 'Get notified of price changes and news',
  },
];
