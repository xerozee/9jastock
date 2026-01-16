import { NextResponse } from 'next/server';
import { getStripeClient, getStripePublishableKey } from '@/lib/stripe';

export async function GET() {
  try {
    const stripe = await getStripeClient();
    const publishableKey = await getStripePublishableKey();
    
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });
    
    const prices = await stripe.prices.list({
      active: true,
    });
    
    const productsWithPrices = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        prices: productPrices.map(price => ({
          id: price.id,
          unitAmount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
        })),
      };
    });
    
    return NextResponse.json({ 
      products: productsWithPrices,
      publishableKey,
    });
  } catch (error: any) {
    console.error('Products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
