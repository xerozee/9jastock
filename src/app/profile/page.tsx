'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Settings, Share2, Copy, Check, TrendingUp, TrendingDown, 
  Briefcase, Target, Shield, Clock, Building2, Lightbulb, 
  ChevronRight, Users, Gift, Sparkles, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import Avatar from '@/components/Avatar';
import ProfileXPosts from '@/components/ProfileXPosts';
import NotificationSettings from '@/components/NotificationSettings';
import PriceAlertManager from '@/components/PriceAlertManager';
import PortfolioShareImage from '@/components/PortfolioShareImage';
import ReferralShareImage from '@/components/ReferralShareImage';

interface ProfileData {
  user: {
    _id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    shareId?: string;
    referralCode?: string;
    bio?: string;
    investmentGoal?: string;
    experienceLevel?: string;
    riskTolerance?: string;
    investmentHorizon?: string;
    interestedSectors?: string[];
    onboardingCompleted?: boolean;
    createdAt: string;
  };
  holdings: Array<{
    _id: string;
    symbol: string;
    shares: number;
    purchasePrice: number;
    purchaseDate: string;
  }>;
  portfolioItems: Array<{
    _id: string;
    symbol: string;
  }>;
  referralCount: number;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
}

interface Recommendation {
  stocks: StockData[];
  reason: string;
}

const goalLabels: Record<string, string> = {
  'wealth-building': 'Build Long-term Wealth',
  'retirement': 'Retirement Planning',
  'passive-income': 'Generate Passive Income',
  'short-term-gains': 'Short-term Gains',
  'learning': 'Learn Investing',
};

const experienceLabels: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'expert': 'Expert',
};

const riskLabels: Record<string, { label: string; color: string }> = {
  'conservative': { label: 'Conservative', color: 'text-green-500' },
  'moderate': { label: 'Moderate', color: 'text-yellow-500' },
  'aggressive': { label: 'Aggressive', color: 'text-red-500' },
};

const horizonLabels: Record<string, string> = {
  'less-than-1-year': 'Less than 1 year',
  '1-3-years': '1-3 years',
  '3-5-years': '3-5 years',
  '5-10-years': '5-10 years',
  '10-plus-years': '10+ years',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [stocksError, setStocksError] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsError, setRecommendationsError] = useState(false);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
      return;
    }

    if (authUser) {
      fetchProfile();
      fetchStocks();
      fetchRecommendations();
    }
  }, [authUser, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        if (data.user && !data.user.onboardingCompleted) {
          router.push('/onboarding');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks');
      if (response.ok) {
        const data = await response.json();
        setStocks(data.data || []);
        setStocksError(false);
      } else {
        console.error('Failed to fetch stocks:', response.status);
        setStocksError(true);
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      setStocksError(true);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      const data = await response.json();
      
      if (response.status === 403 && data.premiumRequired) {
        setPremiumRequired(true);
        setRecommendations([]);
        setHasProfile(true);
        setRecommendationsError(false);
        return;
      }
      
      if (response.ok) {
        setRecommendations(data.recommendations || []);
        setHasProfile(data.hasProfile !== false);
        setRecommendationsError(data.error === true);
        setPremiumRequired(false);
      } else {
        console.error('Failed to fetch recommendations:', response.status);
        setRecommendationsError(true);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendationsError(true);
    }
  };

  const copyShareLink = () => {
    if (profile?.user.shareId) {
      const link = `${window.location.origin}/portfolio/share/${profile.user.shareId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (profile?.user.referralCode) {
      const link = `${window.location.origin}/signup?ref=${profile.user.referralCode}`;
      navigator.clipboard.writeText(link);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

  const getHoldingsWithPrices = () => {
    if (!profile?.holdings || !stocks.length) return [];
    
    const groupedHoldings: Record<string, { 
      symbol: string; 
      totalShares: number; 
      totalCost: number; 
      currentPrice: number;
      currentValue: number;
      gainLoss: number;
      gainLossPercent: number;
    }> = {};

    profile.holdings.forEach(holding => {
      const stock = stocks.find(s => 
        s.symbol === holding.symbol || 
        s.symbol === `NGX:${holding.symbol}` ||
        s.symbol.replace('NGX:', '') === holding.symbol
      );
      const currentPrice = stock?.price || 0;
      
      if (!groupedHoldings[holding.symbol]) {
        groupedHoldings[holding.symbol] = {
          symbol: holding.symbol,
          totalShares: 0,
          totalCost: 0,
          currentPrice,
          currentValue: 0,
          gainLoss: 0,
          gainLossPercent: 0,
        };
      }
      
      groupedHoldings[holding.symbol].totalShares += holding.shares;
      groupedHoldings[holding.symbol].totalCost += holding.shares * holding.purchasePrice;
    });

    return Object.values(groupedHoldings).map(h => {
      h.currentValue = h.totalShares * h.currentPrice;
      h.gainLoss = h.currentValue - h.totalCost;
      h.gainLossPercent = h.totalCost > 0 ? ((h.currentValue - h.totalCost) / h.totalCost) * 100 : 0;
      return h;
    });
  };

  const holdingsWithPrices = getHoldingsWithPrices();
  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdingsWithPrices.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`text-white ${
        isPremium 
          ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500' 
          : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar 
                firstName={profile.user.firstName}
                lastName={profile.user.lastName}
                email={profile.user.email}
                profileImageUrl={profile.user.profileImageUrl}
                size="xl"
                className={`ring-4 ${isPremium ? 'ring-yellow-300/50' : 'ring-white/20'}`}
              />
              {isPremium && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-1.5 shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {profile.user.firstName} {profile.user.lastName}
                </h1>
                {isPremium && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-semibold rounded-full shadow-lg animate-pulse">
                    <Crown className="w-4 h-4" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-1">{profile.user.email}</p>
              {profile.user.bio && (
                <p className="text-white/80 mt-2 max-w-2xl">{profile.user.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.user.investmentGoal && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {goalLabels[profile.user.investmentGoal]}
                  </span>
                )}
                {profile.user.experienceLevel && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {experienceLabels[profile.user.experienceLevel]}
                  </span>
                )}
                {profile.user.riskTolerance && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {riskLabels[profile.user.riskTolerance]?.label} Risk
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/onboarding"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                  Portfolio Summary
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <PortfolioShareImage />
                  <button
                    onClick={copyShareLink}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₦{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₦{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gain/Loss</p>
                  <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}₦{totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Return</p>
                  <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {stocksError && profile?.holdings && profile.holdings.length > 0 ? (
                <div className="text-center py-6">
                  <p className="text-amber-600 dark:text-amber-400 mb-2">Unable to load current prices</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You have {profile.holdings.length} holding(s). Prices will update when connection is restored.
                  </p>
                  <Link
                    href="/portfolio"
                    className="inline-block mt-3 text-green-600 dark:text-green-400 hover:underline"
                  >
                    View holdings in portfolio
                  </Link>
                </div>
              ) : holdingsWithPrices.length > 0 ? (
                <div className="space-y-3">
                  {holdingsWithPrices.slice(0, 5).map((holding) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{holding.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.totalShares} shares @ ₦{holding.currentPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₦{holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm flex items-center justify-end gap-1 ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {holding.gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {holdingsWithPrices.length > 5 && (
                    <Link
                      href="/portfolio"
                      className="block text-center py-3 text-green-600 dark:text-green-400 hover:underline"
                    >
                      View all {holdingsWithPrices.length} holdings
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No holdings yet</p>
                  <Link
                    href="/portfolio"
                    className="inline-block mt-3 text-green-600 dark:text-green-400 hover:underline"
                  >
                    Add your first holding
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Stock Recommendations
                </h2>
                <Link
                  href="/stocks"
                  className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  Browse all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {premiumRequired ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Unlock AI Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    Get personalized stock picks powered by AI based on your investment goals and risk tolerance.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl transition-all font-medium"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Premium
                  </Link>
                </div>
              ) : recommendationsError ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-amber-600 dark:text-amber-400 mb-2">
                    Unable to load recommendations
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please try again later or browse all stocks.
                  </p>
                  <Link
                    href="/stocks"
                    className="inline-block mt-3 text-green-600 dark:text-green-400 hover:underline"
                  >
                    Browse all stocks
                  </Link>
                </div>
              ) : !hasProfile ? (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                    Complete your investment profile
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-md mx-auto">
                    Answer a few questions about your investment goals and preferences to get personalized stock recommendations.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Complete Profile
                  </Link>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {rec.reason}
                      </p>
                      <div className="space-y-2">
                        {rec.stocks.map((stock: StockData) => (
                          <Link
                            key={stock.symbol}
                            href={`/stocks/${stock.symbol.replace('NGX:', '')}`}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {stock.symbol.replace('NGX:', '')}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {stock.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                ₦{stock.price?.toFixed(2) || '0.00'}
                              </p>
                              <p className={`text-sm flex items-center justify-end gap-1 ${(stock.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {(stock.changePercent || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Loading recommendations...</p>
                </div>
              )}
            </div>

            <NotificationSettings />

            <PriceAlertManager 
              watchlistSymbols={[
                ...(profile?.holdings?.map(h => h.symbol) || []),
                ...(profile?.portfolioItems?.map(p => p.symbol) || [])
              ].filter((v, i, a) => a.indexOf(v) === i)}
            />

            <ProfileXPosts 
              symbols={[
                ...(profile?.holdings?.map(h => h.symbol) || []),
                ...(profile?.portfolioItems?.map(p => p.symbol) || [])
              ].filter((v, i, a) => a.indexOf(v) === i)}
              title="News from X"
              limit={6}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-amber-500" />
                Invite Friends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share 9jaStock with friends and grow together!
              </p>
              
              {profile.user.referralCode && (
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Referral Code</p>
                    <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                      {profile.user.referralCode}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={copyReferralLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all"
                    >
                      {referralCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {referralCopied ? 'Link Copied!' : 'Copy Invite Link'}
                    </button>
                    
                    <ReferralShareImage 
                      referralCode={profile.user.referralCode}
                      userName={profile.user.firstName || undefined}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    {profile.referralCount} friends joined
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Investment Profile
              </h3>
              <div className="space-y-4">
                {profile.user.investmentGoal && (
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {goalLabels[profile.user.investmentGoal]}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.user.riskTolerance && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Risk Tolerance</p>
                      <p className={`text-sm font-medium ${riskLabels[profile.user.riskTolerance]?.color}`}>
                        {riskLabels[profile.user.riskTolerance]?.label}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.user.investmentHorizon && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Time Horizon</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {horizonLabels[profile.user.investmentHorizon]}
                      </p>
                    </div>
                  </div>
                )}

                {profile.user.interestedSectors && profile.user.interestedSectors.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Interested Sectors</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.user.interestedSectors.map((sector) => (
                          <span
                            key={sector}
                            className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/portfolio"
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white">My Portfolio</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/watchlist"
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white">My Watchlist</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/stocks"
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white">Browse Stocks</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
