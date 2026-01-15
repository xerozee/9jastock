'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Bell, 
  Shield, 
  Zap,
  Mail,
  Check,
  ArrowRight,
  Newspaper,
  Wallet,
  LineChart
} from 'lucide-react';

interface LandingPageProps {
  stockCount: number;
  gainersCount: number;
  losersCount: number;
  marketCap: string;
}

export default function LandingPage({ stockCount, gainersCount, losersCount, marketCap }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubscribeSuccess(true);
        setSubscribeMessage(data.message);
        setEmail('');
      } else {
        setSubscribeMessage(data.error || 'Something went wrong');
      }
    } catch {
      setSubscribeMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Nigerian Stock Market Data
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Gateway to the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-emerald-100 to-teal-200">
                Nigerian Stock Market
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Track {stockCount}+ NGX stocks in real-time. Build your portfolio, discover opportunities,
              and stay ahead with market insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/api/login"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-green-700 font-semibold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white">{stockCount}+</div>
                <div className="text-green-200 text-sm">Live Stocks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white">{marketCap}</div>
                <div className="text-green-200 text-sm">Market Cap</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="text-green-400" size={24} />
                  <span className="text-3xl md:text-4xl font-bold text-green-400">{gainersCount}</span>
                </div>
                <div className="text-green-200 text-sm">Gainers Today</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="text-red-400" size={24} />
                  <span className="text-3xl md:text-4xl font-bold text-red-400">{losersCount}</span>
                </div>
                <div className="text-green-200 text-sm">Losers Today</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
      </section>

      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Trade Smart
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools and real-time data to help you make informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-Time Market Data</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Access live prices, volume, and market metrics for all {stockCount}+ NGX stocks updated every 5 minutes.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Portfolio Tracking</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Build and monitor your personal portfolio. Track performance, gains, and losses in real-time.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <Newspaper className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Market News & Insights</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Stay informed with the latest market news from top Nigerian financial sources and annual reports.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <LineChart className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Technical Indicators</h3>
              <p className="text-gray-600 dark:text-slate-400">
                RSI, MACD, Bollinger Bands, and 70+ technical indicators to power your analysis.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <PieChart className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sector Analysis</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Compare performance across Banking, Oil & Gas, Consumer Goods, Insurance, and more sectors.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Built for speed with instant search, quick filters, and smooth navigation throughout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 text-sm mb-4">
                  <Shield size={16} />
                  Secure & Free
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Sign Up in Seconds
                </h2>
                <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
                  Create your free account to unlock all features. Track your portfolio, save watchlists, and get personalized market insights.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                    <span className="text-gray-700 dark:text-slate-300">Access to all {stockCount}+ NGX stocks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                    <span className="text-gray-700 dark:text-slate-300">Build unlimited watchlists & portfolios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                    <span className="text-gray-700 dark:text-slate-300">Real-time market news & analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                    <span className="text-gray-700 dark:text-slate-300">Technical indicators & fundamentals</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/api/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Link>
                  <Link
                    href="/api/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </Link>
                </div>
                <div className="mt-4">
                  <Link
                    href="/api/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-semibold rounded-xl transition-all w-full sm:w-auto"
                  >
                    <Mail size={20} />
                    Sign up with Email
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm opacity-80">Sample Portfolio</span>
                      <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">Preview</span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">GTCO</span>
                          <span className="text-green-300">+2.45%</span>
                        </div>
                        <div className="text-2xl font-bold">₦45.80</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">DANGCEM</span>
                          <span className="text-green-300">+1.82%</span>
                        </div>
                        <div className="text-2xl font-bold">₦432.50</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">ZENITHBANK</span>
                          <span className="text-red-300">-0.55%</span>
                        </div>
                        <div className="text-2xl font-bold">₦38.95</div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="text-sm opacity-80 mb-1">Total Portfolio Value</div>
                      <div className="text-3xl font-bold">₦2,450,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 text-sm mb-4">
              <Bell size={16} />
              Weekly Newsletter
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Ahead of the Market
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Get weekly market insights, top performers, and investment opportunities delivered to your inbox.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {subscribeMessage && (
              <div className={`mt-4 text-center ${subscribeSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {subscribeMessage}
              </div>
            )}
            <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 dark:from-slate-800 dark:via-emerald-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Investing Smarter?
          </h2>
          <p className="text-xl text-green-100/80 mb-10">
            Join thousands of Nigerian investors tracking the market with 9jaStock.
          </p>
          <Link
            href="/api/login"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-green-700 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            Create Free Account
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
