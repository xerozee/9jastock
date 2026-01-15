import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

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
}

const sectorMappings: Record<string, string[]> = {
  'banking': ['Financial Services', 'Banking', 'Banks', 'Financial'],
  'oil-gas': ['Oil & Gas', 'Oil', 'Gas', 'Energy', 'Petroleum'],
  'consumer-goods': ['Consumer Goods', 'Consumer', 'FMCG', 'Food & Beverage'],
  'industrial': ['Industrial Goods', 'Industrial', 'Manufacturing', 'Construction'],
  'insurance': ['Insurance', 'Financial Services'],
  'telecoms': ['Telecommunications', 'Telecom', 'ICT', 'Technology'],
  'healthcare': ['Healthcare', 'Pharmaceutical', 'Medical', 'Health'],
  'agriculture': ['Agriculture', 'Agribusiness', 'Farming'],
  'real-estate': ['Real Estate', 'Property', 'REIT'],
  'technology': ['Technology', 'ICT', 'Tech', 'Information Technology'],
};

function getRecommendations(stocks: Stock[], userProfile: any): { stocks: Stock[]; reason: string }[] {
  const recommendations: { stocks: Stock[]; reason: string }[] = [];
  const { investmentGoal, experienceLevel, riskTolerance, investmentHorizon, interestedSectors } = userProfile;

  if (interestedSectors && interestedSectors.length > 0) {
    const sectorStocks = stocks.filter(stock => {
      if (!stock.sector) return false;
      return interestedSectors.some((sector: string) => {
        const mappedSectors = sectorMappings[sector] || [sector];
        return mappedSectors.some(ms => 
          stock.sector?.toLowerCase().includes(ms.toLowerCase())
        );
      });
    });

    if (sectorStocks.length > 0) {
      recommendations.push({
        stocks: sectorStocks.slice(0, 5),
        reason: `Based on your interest in ${interestedSectors.slice(0, 3).join(', ')}`,
      });
    }
  }

  if (investmentGoal === 'passive-income' || investmentGoal === 'retirement') {
    const dividendStocks = stocks
      .filter(s => (s.dividendYield || 0) > 3)
      .sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0));
    
    if (dividendStocks.length > 0) {
      recommendations.push({
        stocks: dividendStocks.slice(0, 5),
        reason: 'High dividend yield stocks for passive income',
      });
    }
  }

  if (riskTolerance === 'conservative') {
    const stableStocks = stocks
      .filter(s => Math.abs(s.changePercent) < 2 && (s.marketCap || 0) > 100000000000)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    
    if (stableStocks.length > 0) {
      recommendations.push({
        stocks: stableStocks.slice(0, 5),
        reason: 'Stable large-cap stocks with lower volatility',
      });
    }
  } else if (riskTolerance === 'aggressive') {
    const growthStocks = stocks
      .filter(s => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent);
    
    if (growthStocks.length > 0) {
      recommendations.push({
        stocks: growthStocks.slice(0, 5),
        reason: 'High momentum stocks with strong recent performance',
      });
    }
  }

  if (investmentGoal === 'short-term-gains') {
    const activeStocks = stocks
      .filter(s => (s.volume || 0) > 1000000)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0));
    
    if (activeStocks.length > 0) {
      recommendations.push({
        stocks: activeStocks.slice(0, 5),
        reason: 'High volume stocks for short-term trading',
      });
    }
  }

  if (investmentGoal === 'wealth-building' || investmentHorizon === '5-10-years' || investmentHorizon === '10-plus-years') {
    const valueStocks = stocks
      .filter(s => (s.peRatio || 0) > 0 && (s.peRatio || 0) < 15 && (s.marketCap || 0) > 50000000000)
      .sort((a, b) => (a.peRatio || 999) - (b.peRatio || 999));
    
    if (valueStocks.length > 0) {
      recommendations.push({
        stocks: valueStocks.slice(0, 5),
        reason: 'Undervalued stocks with growth potential for long-term wealth building',
      });
    }
  }

  if (experienceLevel === 'beginner') {
    const blueChipStocks = stocks
      .filter(s => (s.marketCap || 0) > 500000000000)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    
    if (blueChipStocks.length > 0) {
      recommendations.push({
        stocks: blueChipStocks.slice(0, 5),
        reason: 'Blue-chip stocks recommended for beginners',
      });
    }
  }

  if (recommendations.length === 0) {
    const topStocks = stocks
      .filter(s => (s.marketCap || 0) > 100000000000)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0));
    
    recommendations.push({
      stocks: topStocks.slice(0, 5),
      reason: 'Top traded stocks on NGX',
    });
  }

  return recommendations.slice(0, 3);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    const recommendations = getRecommendations(stocks, user);
    
    const seenSymbols = new Set<string>();
    const deduplicatedRecommendations = recommendations.map(rec => ({
      ...rec,
      stocks: rec.stocks.filter(stock => {
        if (seenSymbols.has(stock.symbol)) return false;
        seenSymbols.add(stock.symbol);
        return true;
      }),
    })).filter(rec => rec.stocks.length > 0);

    return NextResponse.json({
      recommendations: deduplicatedRecommendations,
      hasProfile: true,
    });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
