'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PREMIUM_FEATURES, VALUE_PROPOSITIONS } from '@/lib/subscription';
import { STRIPE_PRICE_IDS, SUBSCRIPTION_PLANS, formatNaira } from '@/lib/stripeConfig';
import { Check, Crown, Zap, Shield, Star, TrendingUp, Brain, Bell, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Clock, Rocket, LineChart, Newspaper, Mail, Smartphone, BarChart3, Globe, GraduationCap } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('year');
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

  const availableNowFeatures = [
    { icon: TrendingUp, title: 'Real-Time NGX Data', description: '145+ Nigerian stocks with live prices' },
    { icon: Brain, title: 'AI Recommendations', description: 'Buy/Sell/Hold signals for every stock' },
    { icon: Bell, title: 'Price Alerts', description: 'Push notifications for price targets' },
    { icon: LineChart, title: 'Technical Analysis', description: 'RSI, MACD, Moving Averages' },
    { icon: Newspaper, title: 'News Aggregation', description: 'Curated Nigerian financial news' },
    { icon: Mail, title: 'AI Newsletter', description: 'Daily market insights to your inbox' },
    { icon: Smartphone, title: 'Mobile PWA', description: 'Works on any device, even offline' },
  ];

  const comingSoonFeatures = [
    { icon: BarChart3, title: 'Advanced Charting', description: 'Interactive tools & custom timeframes' },
    { icon: Globe, title: 'Global Markets', description: 'US stocks, crypto, African markets' },
    { icon: Zap, title: 'In-Depth Insights', description: 'Company financials & corporate data' },
    { icon: GraduationCap, title: 'Investment Academy', description: 'Learn investing the Nigerian way' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full text-amber-400 text-sm mb-6 border border-amber-500/20">
            <Crown className="w-4 h-4" />
            <span className="font-medium">Premium-Only Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Nigeria&apos;s First
            </span>
            <br />
            AI-Powered Stock Tracker
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            No other platform in Nigeria offers real-time NGX data, AI stock recommendations, 
            and social sentiment analysis. You&apos;re investing in the only tool built specifically 
            for Nigerian investors.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {VALUE_PROPOSITIONS.slice(0, 3).map((prop, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full text-sm text-slate-300 border border-slate-700/50">
                <Check className="w-4 h-4 text-emerald-400" />
                {prop}
              </div>
            ))}
          </div>
        </div>

        {user?.subscriptionStatus === 'active' && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 mb-12 text-center max-w-2xl mx-auto">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <div className="text-amber-400 font-bold text-2xl mb-2">
              You&apos;re a Premium Member!
            </div>
            <p className="text-slate-300 mb-6">
              You have full access to all features. Manage your subscription, update payment methods, or view your billing history.
            </p>
            <button
              onClick={() => handleSubscribe('')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : !user?.subscriptionStatus || user.subscriptionStatus !== 'active' ? (
          <>
            <div className="flex justify-center mb-10">
              <div className="bg-slate-800 rounded-2xl p-1.5 flex border border-slate-700">
                <button
                  onClick={() => setSelectedInterval('month')}
                  className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedInterval === 'month'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval('year')}
                  className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedInterval === 'year'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                    SAVE 17%
                  </span>
                </button>
              </div>
            </div>

            <div className="max-w-xl mx-auto mb-16">
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border-2 border-amber-500/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-amber-500/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-6 py-2 rounded-full font-bold shadow-lg">
                  PREMIUM ACCESS
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-5xl md:text-6xl font-black mb-2">
                    {formatNaira(selectedPlan.price)}
                  </div>
                  <div className="text-slate-400">
                    per {selectedInterval}
                    {selectedInterval === 'year' && (
                      <span className="ml-2 text-emerald-400">
                        (₦{Math.round(selectedPlan.price / 12).toLocaleString()}/month)
                      </span>
                    )}
                  </div>
                  {selectedInterval === 'year' && yearlySavings > 0 && (
                    <div className="mt-2 text-emerald-400 font-medium">
                      Save {formatNaira(yearlySavings)} annually!
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {selectedPlan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={() => handleSubscribe(selectedPriceId)}
                  disabled={subscribing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {subscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Premium Access
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure payment
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Instant access
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                Everything You Get With Premium
              </h2>
              <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10">
                Full access to all current features plus everything we build next
              </p>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Available Now</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {availableNowFeatures.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                            <p className="text-xs text-slate-400">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#FCD116]/20 flex items-center justify-center">
                    <Rocket size={16} className="text-[#FCD116]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                  <span className="text-xs text-slate-500">Included with your subscription</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comingSoonFeatures.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-[#FCD116]/20 hover:border-[#FCD116]/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FCD116]/20 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-[#FCD116]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                            <p className="text-xs text-slate-400">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 md:p-12 border border-slate-700/50">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Why 9jaStock is Worth Every Naira</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  We&apos;re not just another stock app. We&apos;re the only comprehensive NGX platform built by Nigerians, for Nigerians.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">No Competitors</h3>
                  <p className="text-sm text-slate-400">
                    No other platform in Nigeria combines real-time data, AI recommendations, and social sentiment in one place.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Nigerian Market AI</h3>
                  <p className="text-sm text-slate-400">
                    Our AI understands the unique dynamics of the Nigerian market — inflation, forex, sectors, and local sentiment.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Never Miss a Move</h3>
                  <p className="text-sm text-slate-400">
                    Real-time alerts, push notifications, and instant updates keep you ahead of the market.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 text-slate-500 text-sm">
              <p>Secure payments processed via Stripe. Cancel your subscription anytime.</p>
              <p className="mt-2">
                Questions? <Link href="/contact" className="text-amber-400 hover:underline">Contact us</Link>
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
