import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase, User } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(null, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();
    
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      shareId: user.shareId,
      subscriptionStatus: user.subscriptionStatus || 'free',
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      onboardingCompleted: user.onboardingCompleted,
      investmentGoal: user.investmentGoal,
      experienceLevel: user.experienceLevel,
      riskTolerance: user.riskTolerance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
