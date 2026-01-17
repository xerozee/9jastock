import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, Referral, ReferralStats, User } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stats = await ReferralStats.findOne({ userId: user._id });
    
    if (!stats) {
      const referralCount = await Referral.countDocuments({ referrerId: user._id });
      const pendingCount = await Referral.countDocuments({ 
        referrerId: user._id, 
        status: 'pending' 
      });
      const convertedCount = await Referral.countDocuments({ 
        referrerId: user._id, 
        status: { $in: ['completed', 'rewarded'] }
      });
      
      stats = await ReferralStats.create({
        userId: user._id,
        totalReferrals: referralCount,
        pendingReferrals: pendingCount,
        convertedReferrals: convertedCount,
        totalRewardsEarned: 0,
        freeMonthsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        tier: 'bronze',
      });
    }

    const referrals = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'firstName lastName email createdAt subscriptionStatus')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalReferrals: stats.totalReferrals,
        pendingReferrals: stats.pendingReferrals,
        convertedReferrals: stats.convertedReferrals,
        totalRewardsEarned: stats.totalRewardsEarned,
        freeMonthsEarned: stats.freeMonthsEarned,
        currentStreak: stats.currentStreak,
        tier: stats.tier,
      },
      referrals: referrals.map((r: any) => ({
        id: r._id.toString(),
        status: r.status,
        rewardType: r.rewardType,
        rewardAmount: r.rewardAmount,
        rewardClaimed: r.rewardClaimed,
        createdAt: r.createdAt,
        conversionDate: r.conversionDate,
        referredUser: r.referredUserId ? {
          firstName: r.referredUserId.firstName,
          lastName: r.referredUserId.lastName,
          email: r.referredUserId.email ? 
            r.referredUserId.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
          subscriptionStatus: r.referredUserId.subscriptionStatus,
          createdAt: r.referredUserId.createdAt,
        } : null,
      })),
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
