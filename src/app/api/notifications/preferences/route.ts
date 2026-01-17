import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, PushSubscription } from '@/lib/mongodb';

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
    
    const subscription = await PushSubscription.findOne({ userId }).lean();

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscribed: false,
        preferences: null,
      });
    }

    return NextResponse.json({
      success: true,
      subscribed: true,
      preferences: subscription.preferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { preferences } = await request.json();
    
    await connectToDatabase();
    
    const result = await PushSubscription.updateMany(
      { userId },
      { 
        preferences,
        updatedAt: new Date(),
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No subscription found. Please enable notifications first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
