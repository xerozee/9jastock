import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, NewsletterSubscriber } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    
    const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json(
        { success: true, message: 'You are already subscribed!' }
      );
    }

    await NewsletterSubscriber.create({
      email: normalizedEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
