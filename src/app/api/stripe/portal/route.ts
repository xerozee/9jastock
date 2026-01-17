import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, User } from '@/lib/mongodb';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }
    
    const stripe = await getStripeClient();
    
    const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
    const productionUrl = 'https://9jastocks.app';
    const devDomain = request.headers.get('host') || '';
    const baseUrl = isProduction ? productionUrl : `https://${devDomain}`;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/profile`,
    });
    
    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
