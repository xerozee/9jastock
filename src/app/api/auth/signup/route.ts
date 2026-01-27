import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User, Session } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password, firstName, lastName, referralCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      referralCode: generateReferralCode(),
      shareId: crypto.randomBytes(8).toString('hex'),
      referredBy: referredBy,
      onboardingCompleted: false,
      subscriptionStatus: 'trialing',
      subscriptionCurrentPeriodEnd: trialEndDate,
    });

    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      sid: sessionId,
      userId: newUser._id,
      expiresAt,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
