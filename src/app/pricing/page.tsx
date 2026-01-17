'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PREMIUM_FEATURES } from '@/lib/subscription';
import { STRIPE_PRICE_IDS, SUBSCRIPTION_PLANS, formatNaira } from '@/lib/stripeConfig';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/user')
      .then(r => r.ok ? r.json() : null)
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/signup?redirect=/pricing');
      return;
    }

    if (user.subscriptionStatus === 'active') {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
      return;
    }

    setSubscribing(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSubscribing(false);
    }
  };

  const selectedPriceId = selectedInterval === 'month' 
    ? STRIPE_PRICE_IDS.MONTHLY 
    : STRIPE_PRICE_IDS.YEARLY;
  
  const selectedPlan = selectedInterval === 'month' 
    ? SUBSCRIPTION_PLANS.monthly 
    : SUBSCRIPTION_PLANS.yearly;

  const yearlySavings = (SUBSCRIPTION_PLANS.monthly.price * 12) - SUBSCRIPTION_PLANS.yearly.price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-gray-400 text-lg">
            Unlock the full power of 9jaStock with real-time data and AI insights
          </p>
        </div>

        {user?.subscriptionStatus === 'active' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8 text-center">
            <div className="text-emerald-400 font-semibold text-lg mb-2">
              You're a Premium Member!
            </div>
            <p className="text-gray-400 mb-4">
              Manage your subscription, update payment methods, or cancel anytime.
            </p>
            <button
              onClick={() => handleSubscribe('')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 rounded-full p-1 flex">
                <button
                  onClick={() => setSelectedInterval('month')}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    selectedInterval === 'month'
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval('year')}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    selectedInterval === 'year'
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  {yearlySavings > 0 && (
                    <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Save ₦{yearlySavings.toLocaleString()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">₦0<span className="text-lg text-gray-400">/forever</span></div>
                <p className="text-gray-400 mb-6">Basic access for casual investors</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-emerald-500">✓</span> 5-minute data refresh
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-emerald-500">✓</span> Up to 10 portfolio items
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-emerald-500">✓</span> 14 days news history
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-emerald-500">✓</span> Basic watchlist
                  </li>
                  <li className="flex items-center gap-2 text-gray-500">
                    <span>✗</span> AI recommendations
                  </li>
                  <li className="flex items-center gap-2 text-gray-500">
                    <span>✗</span> Advanced analytics
                  </li>
                </ul>
                {!user ? (
                  <Link
                    href="/signin"
                    className="block text-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    Sign Up Free
                  </Link>
                ) : (
                  <div className="text-center text-gray-500 py-3">Current Plan</div>
                )}
              </div>

              <div className="bg-gradient-to-br from-emerald-900/50 to-blue-900/50 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm px-4 py-1 rounded-full">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium</h3>
                <div className="text-3xl font-bold mb-4">
                  {formatNaira(selectedPlan.price)}
                  <span className="text-lg text-gray-400">/{selectedInterval}</span>
                </div>
                {selectedInterval === 'year' && (
                  <p className="text-emerald-400 text-sm mb-4">
                    Save {formatNaira(yearlySavings)} compared to monthly!
                  </p>
                )}
                <p className="text-gray-400 mb-6">Full access for serious investors</p>
                <ul className="space-y-3 mb-6">
                  {PREMIUM_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="text-emerald-500">✓</span> {feature.title}
                    </li>
                  ))}
                </ul>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
                <button
                  onClick={() => handleSubscribe(selectedPriceId)}
                  disabled={subscribing || user?.subscriptionStatus === 'active'}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing ? 'Processing...' : user?.subscriptionStatus === 'active' ? 'Current Plan' : 'Get Premium'}
                </button>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>Cancel anytime. Secure payment via Stripe.</p>
              <p className="mt-2">
                Questions? <Link href="/contact" className="text-emerald-400 hover:underline">Contact us</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
