import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, User, Referral, ReferralStats } from '@/lib/mongodb';

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
    const { referralCode } = await request.json();
    
    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = referralCode.trim().toUpperCase();
    
    if (!/^[A-Z0-9]{6,12}$/.test(normalizedCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (currentUser.referredBy) {
      return NextResponse.json({
        success: true,
        message: 'Referral already applied',
        alreadyReferred: true,
      });
    }

    const referrer = await User.findOne({ 
      referralCode: normalizedCode 
    });
    
    if (!referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    if (referrer._id.toString() === userId) {
      return NextResponse.json(
        { success: false, error: 'You cannot refer yourself' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(userId, {
      referredBy: referrer._id,
    });

    const existingReferral = await Referral.findOne({ referredUserId: userId });
    if (!existingReferral) {
      try {
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: currentUser._id,
          referralCode: normalizedCode,
          status: 'pending',
          referredUserSubscriptionStatus: currentUser.subscriptionStatus || 'free',
        });

        await ReferralStats.findOneAndUpdate(
          { userId: referrer._id },
          { 
            $inc: { totalReferrals: 1, pendingReferrals: 1 },
            $set: { lastReferralAt: new Date(), updatedAt: new Date() },
            $setOnInsert: {
              convertedReferrals: 0,
              totalRewardsEarned: 0,
              freeMonthsEarned: 0,
              currentStreak: 0,
              longestStreak: 0,
              tier: 'bronze',
            },
          },
          { upsert: true }
        );
      } catch (error: any) {
        if (error.code === 11000) {
          console.log('Referral already exists for this user, skipping creation');
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Referral applied successfully',
      referrerName: referrer.firstName || 'A friend',
    });
  } catch (error: any) {
    console.error('Apply referral error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
