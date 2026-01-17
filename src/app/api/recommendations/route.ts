import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAIStockRecommendations, StockData, UserProfile } from '@/lib/openai';
import { getUserTier, canAccessFeature } from '@/lib/subscription';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
  dividendYield?: number;
  peRatio?: number;
  marketCap?: number;
  volume?: number;
  rsi?: number;
  high52Week?: number;
  low52Week?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!canAccessFeature(user, 'ai_recommendations')) {
      return NextResponse.json({ 
        error: 'AI recommendations are a Premium feature',
        premiumRequired: true,
        recommendations: [],
        hasProfile: true,
      }, { status: 403 });
    }

    let stocks: Stock[] = [];
    let stocksFetchError = false;
    
    try {
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';
      const stocksResponse = await fetch(`${baseUrl}/api/stocks`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (stocksResponse.ok) {
        const stocksData = await stocksResponse.json();
        stocks = stocksData.stocks || [];
      } else {
        console.error('Failed to fetch stocks for recommendations:', stocksResponse.status);
        stocksFetchError = true;
      }
    } catch (error) {
      console.error('Error fetching stocks for recommendations:', error);
      stocksFetchError = true;
    }

    if (stocksFetchError || stocks.length === 0) {
      return NextResponse.json({
        recommendations: [],
        hasProfile: true,
        message: 'Unable to load stock data. Please try again later.',
        error: true,
      });
    }

    const hasProfile = user.investmentGoal || user.riskTolerance || user.interestedSectors?.length;
    
    if (!hasProfile) {
      return NextResponse.json({
        recommendations: [],
        hasProfile: false,
        message: 'Complete your investment profile to get personalized recommendations',
      });
    }

    const userProfile: UserProfile = {
      investmentGoal: user.investmentGoal,
      experienceLevel: user.experienceLevel,
      riskTolerance: user.riskTolerance,
      investmentHorizon: user.investmentHorizon,
      interestedSectors: user.interestedSectors,
    };

    try {
      const aiRecommendations = await getAIStockRecommendations(
        stocks as StockData[],
        userProfile
      );

      return NextResponse.json({
        recommendations: aiRecommendations,
        hasProfile: true,
        aiPowered: true,
      });
    } catch (aiError) {
      console.error('AI recommendations failed, falling back to rule-based:', aiError);
      
      const fallbackRecs = getFallbackRecommendations(stocks, userProfile);
      return NextResponse.json({
        recommendations: fallbackRecs,
        hasProfile: true,
        aiPowered: false,
      });
    }
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

function getFallbackRecommendations(stocks: Stock[], profile: UserProfile) {
  const { riskTolerance, investmentGoal } = profile;
  let filtered = stocks.filter(s => s.marketCap && s.volume);

  if (riskTolerance === 'conservative') {
    filtered = filtered.filter(s => (s.marketCap || 0) > 100000000000);
  } else if (riskTolerance === 'aggressive') {
    filtered = filtered.filter(s => s.changePercent > 0);
  }

  if (investmentGoal === 'passive-income') {
    filtered = filtered.filter(s => (s.dividendYield || 0) > 2);
  }

  return filtered
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5)
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      changePercent: s.changePercent,
      sector: s.sector,
      reason: 'Top traded stock matching your investment profile',
      confidenceScore: 70,
      riskLevel: 'medium' as const,
    }));
}
