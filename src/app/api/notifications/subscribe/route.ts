import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, PushSubscription } from '@/lib/mongodb';
import { getVapidPublicKey } from '@/lib/pushNotifications';

export async function GET() {
  const vapidKey = getVapidPublicKey();
  
  if (!vapidKey) {
    return NextResponse.json(
      { success: false, error: 'Push notifications not configured' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    vapidPublicKey: vapidKey,
  });
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
    const body = await request.json();
    
    const { subscription, preferences } = body;
    
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingSubscription = await PushSubscription.findOne({ 
      endpoint: subscription.endpoint 
    });

    if (existingSubscription) {
      await PushSubscription.updateOne(
        { endpoint: subscription.endpoint },
        { 
          userId,
          keys: subscription.keys,
          preferences: preferences || existingSubscription.preferences,
          updatedAt: new Date(),
        }
      );
    } else {
      await PushSubscription.create({
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        preferences: preferences || {
          priceAlerts: true,
          dailySummary: true,
          breakingNews: true,
          watchlistUpdates: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });
  } catch (error: any) {
    console.error('Push subscription error:', error);
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
    
    await connectToDatabase();
    
    const result = await PushSubscription.deleteMany({ userId });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
