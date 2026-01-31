import { IUser } from './mongodb';

export type SubscriptionTier = 'guest' | 'premium';

export function getUserTier(user: IUser | null): SubscriptionTier {
  if (!user) return 'guest';
  
  const status = user.subscriptionStatus;
  if (status === 'active' || status === 'trialing') {
    return 'premium';
  }
  
  return 'guest';
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
  | 'extended_news_history'
  | 'market_buzz'
  | 'price_alerts'
  | 'stock_details';

export const FEATURE_ACCESS: Record<PremiumFeature, SubscriptionTier[]> = {
  realtime_data: ['premium'],
  ai_recommendations: ['premium'],
  unlimited_portfolio: ['premium'],
  priority_news: ['premium'],
  advanced_analytics: ['premium'],
  email_alerts: ['premium'],
  fast_refresh: ['premium'],
  extended_news_history: ['premium'],
  market_buzz: ['premium'],
  price_alerts: ['premium'],
  stock_details: ['premium'],
};

export const TIER_LIMITS = {
  guest: {
    refreshInterval: 60 * 60 * 1000,
    maxPortfolioItems: 0,
    maxWatchlistItems: 0,
    maxVisibleStocks: 5,
    newsArticles: 3,
    socialPosts: 0,
    newsDays: 1,
  },
  premium: {
    refreshInterval: 1 * 60 * 1000,
    maxPortfolioItems: Infinity,
    maxWatchlistItems: Infinity,
    maxVisibleStocks: Infinity,
    newsArticles: Infinity,
    socialPosts: Infinity,
    newsDays: 30,
  },
};

export const PREMIUM_FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Data',
    description: '1-minute refresh for live market tracking across 145+ NGX stocks',
  },
  {
    icon: '🤖',
    title: 'AI Buy/Sell/Hold Recommendations',
    description: 'Personalized stock picks with Nigerian market intelligence',
  },
  {
    icon: '📊',
    title: 'Unlimited Portfolio Tracking',
    description: 'Track all your stocks with real-time profit/loss calculations',
  },
  {
    icon: '🔔',
    title: 'Price Alerts & Notifications',
    description: 'Get notified instantly when stocks hit your target prices',
  },
  {
    icon: '📰',
    title: 'Complete News Access',
    description: '30 days of market news from top Nigerian sources',
  },
  {
    icon: '📈',
    title: 'Advanced Technical Analysis',
    description: 'RSI, MACD, Bollinger Bands, and professional charting tools',
  },
  {
    icon: '✉️',
    title: 'AI Morning Newsletter',
    description: 'Daily AI-written market summary delivered to your inbox',
  },
];

export const VALUE_PROPOSITIONS = [
  'Only NGX tracker with AI recommendations',
  'Real-time data from 145+ Nigerian stocks',
  'No competitor in Nigeria offers this',
  'Built specifically for Nigerian investors',
];
