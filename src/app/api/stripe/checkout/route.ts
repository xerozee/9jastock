import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase, User } from '@/lib/mongodb';
import { getStripeClient } from '@/lib/stripe';
import { STRIPE_PRICE_IDS } from '@/lib/stripeConfig';

const VALID_PRICE_IDS = [STRIPE_PRICE_IDS.MONTHLY, STRIPE_PRICE_IDS.YEARLY];

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
    
    const { priceId } = await request.json();
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    if (!VALID_PRICE_IDS.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }
    
    const stripe = await getStripeClient();
    
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }
    
    const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
    const productionUrl = 'https://9jastocks.app';
    const devDomain = process.env.REPLIT_DEV_DOMAIN || request.headers.get('host') || '';
    const baseUrl = isProduction ? productionUrl : `https://${devDomain}`;
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: user._id.toString() },
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
