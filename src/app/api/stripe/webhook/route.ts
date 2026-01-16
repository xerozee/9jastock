import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/mongodb';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';

function mapStripeStatus(stripeStatus: string): 'free' | 'active' | 'canceled' | 'past_due' | 'trialing' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'free';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    const stripe = await getStripeClient();
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        
        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const status = mapStripeStatus(subscription.status);
          await User.findByIdAndUpdate(userId, {
            subscriptionId: subscriptionId,
            subscriptionStatus: status,
            subscriptionPriceId: subscription.items.data[0]?.price.id,
            subscriptionCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
            updatedAt: new Date(),
          });
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          const status = mapStripeStatus(subscription.status);
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: status,
            subscriptionId: subscription.id,
            subscriptionPriceId: subscription.items?.data?.[0]?.price?.id,
            subscriptionCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
            updatedAt: new Date(),
          });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: 'free',
            subscriptionId: null,
            subscriptionPriceId: null,
            subscriptionCurrentPeriodEnd: null,
            updatedAt: new Date(),
          });
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: 'past_due',
            updatedAt: new Date(),
          });
        }
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
