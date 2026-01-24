import { NextResponse } from 'next/server';
import { connectToDatabase, User, AFCompanyData2 } from '@/lib/mongodb';
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
      const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
      const baseUrl = isProduction 
        ? 'https://9jastocks.app' 
        : process.env.REPLIT_DEV_DOMAIN 
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

    const stockSymbols = stocks.slice(0, 30).map(s => s.symbol.replace('NGX:', '').toUpperCase());
    const afDataList = await AFCompanyData2.find({ 
      $or: [
        { symbol: { $in: stockSymbols } },
        { originalSymbol: { $in: stockSymbols } }
      ]
    }).lean();
    
    const afDataMap = new Map();
    afDataList.forEach((af: any) => {
      if (af.symbol) afDataMap.set(af.symbol.toUpperCase(), af);
      if (af.originalSymbol) afDataMap.set(af.originalSymbol.toUpperCase(), af);
    });

    const enrichedStocks = stocks.map(stock => {
      const symbol = stock.symbol.replace('NGX:', '').toUpperCase();
      const afData = afDataMap.get(symbol);
      
      if (afData && afData.found) {
        const latestDividend = afData.dividends?.[0];
        const docCount = afData.documents?.length || 0;
        
        return {
          ...stock,
          afDividendHistory: latestDividend ? {
            lastDividend: latestDividend.amount,
            dividendType: latestDividend.dividendType,
            paymentDate: latestDividend.paymentDate,
          } : undefined,
          afDocumentsCount: docCount,
          afDataAvailable: true,
        };
      }
      return stock;
    });

    try {
      const aiRecommendations = await getAIStockRecommendations(
        enrichedStocks as StockData[],
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
      symbol: s.symbol.replace('NGX:', ''),
      name: s.name,
      price: s.price,
      changePercent: s.changePercent,
      sector: s.sector,
      reason: 'Top traded stock matching your investment profile',
      analysis: `Based on your ${riskTolerance || 'moderate'} risk tolerance and ${investmentGoal || 'general'} investment goals, this stock shows strong trading volume and market stability on the NGX.`,
      confidenceScore: 70,
      riskLevel: 'medium' as const,
      action: 'hold' as const,
      timeframe: 'medium-term',
    }));
}
