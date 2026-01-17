import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, PriceAlert } from '@/lib/mongodb';

export async function GET() {
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
    
    const alerts = await PriceAlert.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      alerts: alerts.map((alert: any) => ({
        id: alert._id.toString(),
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        isActive: alert.isActive,
        triggered: alert.triggered,
        triggeredAt: alert.triggeredAt,
        triggeredPrice: alert.triggeredPrice,
        createdAt: alert.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { symbol, targetPrice, condition } = await request.json();
    
    if (!symbol || !targetPrice || !condition) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, targetPrice, condition' },
        { status: 400 }
      );
    }

    if (condition !== 'above' && condition !== 'below') {
      return NextResponse.json(
        { success: false, error: 'Condition must be "above" or "below"' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingAlerts = await PriceAlert.countDocuments({ 
      userId, 
      isActive: true, 
      triggered: false 
    });

    if (existingAlerts >= 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 active alerts allowed. Please delete some alerts first.' },
        { status: 400 }
      );
    }

    const alert = await PriceAlert.create({
      userId,
      symbol: symbol.toUpperCase().replace('NGX:', ''),
      targetPrice: Number(targetPrice),
      condition,
    });

    return NextResponse.json({
      success: true,
      alert: {
        id: alert._id.toString(),
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const result = await PriceAlert.deleteOne({ _id: alertId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted',
    });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
