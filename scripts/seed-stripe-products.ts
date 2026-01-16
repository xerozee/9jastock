import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Stripe credentials not available. Run this from Replit environment.');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return connectionSettings.settings.secret;
}

async function seedProducts() {
  console.log('Getting Stripe credentials...');
  const secretKey = await getCredentials();
  const stripe = new Stripe(secretKey);

  console.log('Creating 9jaStock Premium product...');
  
  const existingProducts = await stripe.products.search({
    query: "name:'9jaStock Premium'"
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    
    const prices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true,
    });
    
    console.log('Existing prices:');
    prices.data.forEach(price => {
      console.log(`  - ${price.id}: ₦${(price.unit_amount || 0) / 100}/${price.recurring?.interval}`);
    });
    
    return;
  }
  
  const product = await stripe.products.create({
    name: '9jaStock Premium',
    description: 'Premium access to 9jaStock Nigerian Stock Exchange tracker with real-time data, AI recommendations, and advanced analytics.',
    metadata: {
      tier: 'premium',
    },
  });
  
  console.log('Created product:', product.id);
  
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 299900,
    currency: 'ngn',
    recurring: { interval: 'month' },
    metadata: { plan: 'monthly' },
  });
  
  console.log('Created monthly price:', monthlyPrice.id, '- ₦2,999/month');
  
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2499900,
    currency: 'ngn',
    recurring: { interval: 'year' },
    metadata: { plan: 'yearly' },
  });
  
  console.log('Created yearly price:', yearlyPrice.id, '- ₦24,999/year');
  
  console.log('\nDone! Add these price IDs to your pricing page.');
}

seedProducts().catch(console.error);
