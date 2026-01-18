'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Bell, Briefcase, 
  ArrowRight, CheckCircle, ChevronDown, ChevronUp,
  Brain, Crown, Menu, X, Star, Twitter
} from 'lucide-react';
import Logo3D from './Logo3D';
import Link from 'next/link';

export default function MarketingLandingPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stockCards = [
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 290.50, change: 2.45 },
    { symbol: 'GTCO', name: 'GTBank Holdings', price: 45.80, change: 1.23 },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.90, change: -0.82 },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Data',
      description: 'Live prices for 145+ NGX stocks with 1-minute refresh',
    },
    {
      icon: Brain,
      title: 'AI Recommendations',
      description: 'Get clear Buy, Sell, or Hold guidance for every stock',
    },
    {
      icon: Twitter,
      title: 'Market Sentiment',
      description: 'See what traders are saying with AI sentiment analysis',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Track your holdings and see gains/losses in real-time',
    },
    {
      icon: Bell,
      title: 'Price Alerts',
      description: 'Get notified instantly when stocks hit your targets',
    },
    {
      icon: Crown,
      title: 'Premium Support',
      description: 'Direct access to founders for feedback and requests',
    },
  ];

  const testimonials = [
    {
      name: 'Chidi O.',
      role: 'Investor, Lagos',
      text: 'The AI told me exactly which dividend stocks matched my goals. Now I actually understand what I\'m investing in.',
      rating: 5,
    },
    {
      name: 'Amaka N.',
      role: 'Trader, Port Harcourt',
      text: 'The price alerts saved me last week when GTCO hit my target while I was in a meeting. Game changer!',
      rating: 5,
    },
    {
      name: 'Emeka K.',
      role: 'Investment Club Lead',
      text: 'The X sentiment analysis helps us see what the market is feeling before we make decisions.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'Is 9jaStock a brokerage?',
      a: 'Not yet! Currently, 9jaStock is a research and tracking platform. You\'ll still execute trades through your existing broker. Broker integration is coming soon.',
    },
    {
      q: 'How does the AI recommendation work?',
      a: 'Our AI combines technical indicators, fundamental analysis, and market sentiment to give you guidance. Think of it as a smart research assistant that explains its reasoning.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Absolutely. Cancel with one click from your profile. No hidden fees, no questions asked. You\'ll keep access until the end of your billing period.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! Start with a 7-day free trial. Experience everything 9jaStock offers, then decide if it\'s right for you.',
    },
  ];

  const monthlyPrice = 2999;
  const yearlyPrice = 24999;
  const yearlySavings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Logo3D size="lg" variant="full" animated={!scrolled} />
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </a>
              <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-[#008751] to-emerald-500 hover:from-[#006741] hover:to-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25">
                Start Free Trial
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-t border-slate-800">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#pricing" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </a>
              <Link href="/login" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/signup" className="block w-full text-center px-5 py-3 bg-gradient-to-r from-[#008751] to-emerald-500 text-white font-semibold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] bg-[#008751]/15 pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] bg-[#FCD116]/10 pointer-events-none" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 backdrop-blur-sm rounded-full text-[#00a863] text-sm mb-6 border border-[#008751]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a863] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00a863]"></span>
                </span>
                <span className="font-medium">Nigeria&apos;s #1 Stock Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Invest in Nigeria
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] via-[#00a863] to-[#FCD116]">
                  with Confidence
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
                Real-time NGX data, AI-powered recommendations, and everything you need to make smarter investment decisions.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center mb-10">
                <Link
                  href="/signup"
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl shadow-2xl shadow-[#008751]/30 hover:shadow-[#008751]/50 hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  Sign In
                </Link>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#00a863]" />
                  <span>7-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#00a863]" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#008751]/20 to-[#FCD116]/10 rounded-3xl blur-3xl" />
                
                <div className="relative space-y-4">
                  {stockCards.map((stock, i) => (
                    <div
                      key={stock.symbol}
                      className={`
                        relative p-5 rounded-2xl backdrop-blur-xl border transition-all duration-500
                        ${activeCard === i 
                          ? 'bg-slate-800/80 border-[#008751]/50 scale-105 shadow-xl shadow-[#008751]/10' 
                          : 'bg-slate-900/60 border-slate-700/50 scale-100'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm
                            ${stock.change >= 0 ? 'bg-gradient-to-br from-[#008751] to-[#00a863]' : 'bg-gradient-to-br from-red-500 to-rose-600'}
                          `}>
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{stock.symbol}</div>
                            <div className="text-sm text-slate-400">{stock.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white text-lg">₦{stock.price.toFixed(2)}</div>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${stock.change >= 0 ? 'text-[#00a863]' : 'text-red-400'}`}>
                            {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#008751]/10 border border-[#FCD116]/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">AI Recommendation</div>
                        <div className="flex items-center gap-2">
                          <Brain className="text-[#FCD116]" size={20} />
                          <span className="text-lg font-bold text-white">DANGCEM: Strong Buy</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-[#008751]/20 rounded-full text-[#00a863] text-sm font-medium">
                        +18% potential
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed for Nigerian investors
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-[#008751]/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#008751] to-[#00a863] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Trusted by Nigerian Investors
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-[#008751]/30 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-[#FCD116] fill-[#FCD116]" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 text-sm leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Start with a 7-day free trial. Cancel anytime.
            </p>
            
            <div className="inline-flex items-center p-1 bg-slate-800 rounded-xl">
              <button
                onClick={() => setActivePlan('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePlan === 'monthly' 
                    ? 'bg-[#008751] text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActivePlan('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activePlan === 'yearly' 
                    ? 'bg-[#008751] text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-[#FCD116] text-slate-900 text-xs font-bold rounded-full">
                  Save {yearlySavings}%
                </span>
              </button>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-2 bg-gradient-to-r from-[#008751] to-[#00a863] text-white text-sm font-semibold rounded-bl-2xl">
              Most Popular
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-white">
                  ₦{activePlan === 'monthly' ? monthlyPrice.toLocaleString() : yearlyPrice.toLocaleString()}
                </span>
                <span className="text-slate-400">/{activePlan === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {activePlan === 'yearly' && (
                <p className="text-[#00a863] text-sm mt-2">
                  That&apos;s just ₦{Math.round(yearlyPrice / 12).toLocaleString()}/month
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                '145+ NGX stocks in real-time',
                'AI Buy/Sell/Hold recommendations',
                'Portfolio tracking & sharing',
                'Price alerts & push notifications',
                'X/Twitter sentiment analysis',
                'Priority customer support',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-[#00a863] flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="block w-full text-center py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-[#008751]/30"
            >
              Start 7-Day Free Trial
            </Link>
            
            <p className="text-center text-slate-500 text-sm mt-4">
              No credit card required to start
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Questions? We&apos;ve Got Answers
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-white pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="text-[#00a863] flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400 flex-shrink-0" size={20} />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center border-b border-slate-800">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Invest with Confidence?
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[#008751]/30"
            >
              Start Your Free Trial
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo3D size="md" variant="full" />
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:hello@9jastocks.app" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="pb-8 text-center text-sm text-slate-500">
            © 2026 9jaStock. All rights reserved. Made with 💚 for Nigerian investors.
          </div>
        </div>
      </footer>
    </div>
  );
}
