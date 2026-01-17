import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User, Holding, PortfolioItem } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import crypto from 'crypto';

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const holdings = await Holding.find({ userId }).lean();
    const portfolioItems = await PortfolioItem.find({ userId }).lean();
    const referralCount = await User.countDocuments({ referredBy: userId });

    const { password, ...userWithoutPassword } = user as any;

    return NextResponse.json({
      user: userWithoutPassword,
      holdings,
      portfolioItems,
      referralCount,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const allowedFields = [
      'firstName',
      'lastName',
      'bio',
      'investmentGoal',
      'experienceLevel',
      'riskTolerance',
      'investmentHorizon',
      'interestedSectors',
      'onboardingCompleted',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    updateData.updatedAt = new Date();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.referralCode) {
      updateData.referralCode = generateReferralCode();
    }

    if (!user.shareId) {
      updateData.shareId = crypto.randomBytes(8).toString('hex');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    const { password, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
