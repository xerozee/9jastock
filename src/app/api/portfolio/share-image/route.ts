import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, User, Holding } from '@/lib/mongodb';

interface HoldingWithData {
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

async function fetchStockPrice(symbol: string): Promise<number> {
  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    
    const response = await fetch(`${baseUrl}/api/stocks/${symbol}`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data.price || result.data.close || 0;
      }
      return result.price || result.close || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const holdings = await Holding.find({ userId });
    
    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userName: user.firstName || 'Investor',
          totalValue: 0,
          totalInvested: 0,
          totalGain: 0,
          totalGainPercent: 0,
          holdingsCount: 0,
          topPerformers: [],
          generatedAt: new Date().toISOString(),
        }
      });
    }

    const holdingsWithData: HoldingWithData[] = await Promise.all(
      holdings.map(async (holding: any) => {
        const currentPrice = await fetchStockPrice(holding.symbol);
        const value = holding.shares * currentPrice;
        const invested = holding.shares * holding.purchasePrice;
        const gain = value - invested;
        const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;
        
        return {
          symbol: holding.symbol,
          shares: holding.shares,
          purchasePrice: holding.purchasePrice,
          currentPrice,
          value,
          gain,
          gainPercent,
        };
      })
    );

    const totalValue = holdingsWithData.reduce((sum, h) => sum + h.value, 0);
    const totalInvested = holdingsWithData.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    const topPerformers = [...holdingsWithData]
      .sort((a, b) => b.gainPercent - a.gainPercent)
      .slice(0, 3)
      .map(h => ({
        symbol: h.symbol,
        gainPercent: h.gainPercent,
      }));

    return NextResponse.json({
      success: true,
      data: {
        userName: user.firstName || 'Investor',
        totalValue,
        totalInvested,
        totalGain,
        totalGainPercent,
        holdingsCount: holdings.length,
        topPerformers,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Portfolio share image error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
