import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User, AFCompanyData2, Holding, PortfolioItem } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAIStockRecommendations, StockData, UserProfile, PortfolioData, PortfolioHolding } from '@/lib/openai';
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const watchlistParam = searchParams.get('watchlist');
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

    // Fetch user's portfolio holdings
    const userHoldings = await Holding.find({ userId: user._id }).lean();
    
    // Parse watchlist from query params (sent from client localStorage)
    const watchlist: string[] = watchlistParam ? watchlistParam.split(',').filter(Boolean) : [];
    
    // Build portfolio data with current prices
    const stockPriceMap = new Map(stocks.map(s => [s.symbol.replace('NGX:', '').toUpperCase(), s.price]));
    
    const portfolioHoldings = userHoldings.map((h: any) => {
      const symbol = h.symbol.toUpperCase();
      const currentPrice = stockPriceMap.get(symbol) || 0;
      const totalCost = h.shares * h.purchasePrice;
      const currentValue = h.shares * currentPrice;
      const gainLossPercent = totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0;
      
      return {
        symbol: h.symbol,
        shares: h.shares,
        purchasePrice: h.purchasePrice,
        currentPrice,
        gainLossPercent,
      };
    });
    
    const totalValue = portfolioHoldings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || 0)), 0);
    const totalCost = portfolioHoldings.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);
    
    const portfolioData: PortfolioData = {
      holdings: portfolioHoldings,
      watchlist,
      totalValue,
      totalCost,
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
        userProfile,
        portfolioData
      );

      return NextResponse.json({
        recommendations: aiRecommendations,
        hasProfile: true,
        aiPowered: true,
        portfolioAware: portfolioData.holdings.length > 0 || portfolioData.watchlist.length > 0,
      });
    } catch (aiError) {
      console.error('AI recommendations failed, falling back to rule-based:', aiError);
      
      const fallbackRecs = getFallbackRecommendations(stocks, userProfile, portfolioData);
      return NextResponse.json({
        recommendations: fallbackRecs,
        hasProfile: true,
        aiPowered: false,
        portfolioAware: portfolioData.holdings.length > 0 || portfolioData.watchlist.length > 0,
      });
    }
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

function getFallbackRecommendations(stocks: Stock[], profile: UserProfile, portfolioData?: PortfolioData) {
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

  // Prioritize watchlist stocks
  const watchlistSymbols = new Set(portfolioData?.watchlist.map(s => s.toUpperCase()) || []);
  const holdingSymbols = new Set(portfolioData?.holdings.map(h => h.symbol.toUpperCase()) || []);
  
  // Sort to prioritize watchlist stocks, then by volume
  filtered.sort((a, b) => {
    const aSymbol = a.symbol.replace('NGX:', '').toUpperCase();
    const bSymbol = b.symbol.replace('NGX:', '').toUpperCase();
    const aInWatchlist = watchlistSymbols.has(aSymbol) ? 1 : 0;
    const bInWatchlist = watchlistSymbols.has(bSymbol) ? 1 : 0;
    if (aInWatchlist !== bInWatchlist) return bInWatchlist - aInWatchlist;
    return (b.volume || 0) - (a.volume || 0);
  });

  return filtered
    .slice(0, 5)
    .map(s => {
      const symbol = s.symbol.replace('NGX:', '');
      const isInWatchlist = watchlistSymbols.has(symbol.toUpperCase());
      const isOwned = holdingSymbols.has(symbol.toUpperCase());
      
      let reason = 'Top traded stock matching your investment profile';
      if (isInWatchlist) reason = 'This stock is on your watchlist and matches your profile';
      if (isOwned) reason = 'You already own this stock - consider your position';
      
      return {
        symbol,
        name: s.name,
        price: s.price,
        changePercent: s.changePercent,
        sector: s.sector,
        reason,
        analysis: `Based on your ${riskTolerance || 'moderate'} risk tolerance and ${investmentGoal || 'general'} investment goals, this stock shows strong trading volume and market stability on the NGX.`,
        confidenceScore: 70,
        riskLevel: 'medium' as const,
        action: isOwned ? 'hold' as const : 'buy' as const,
        timeframe: 'medium-term',
      };
    });
}
