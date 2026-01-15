'use client';

import { TrendingUp, BarChart3, Bell, Briefcase, LineChart, Shield, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Stock Data',
      description: 'Get live prices, volume, and market cap for 145+ Nigerian stocks updated every 5 minutes.',
      color: 'bg-green-500',
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'Access RSI, MACD, Bollinger Bands, and 10+ technical indicators for informed decisions.',
      color: 'bg-blue-500',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Build and track your investment portfolio with real-time performance analytics.',
      color: 'bg-purple-500',
    },
    {
      icon: Bell,
      title: 'Market News',
      description: 'Stay updated with the latest NGX news from BusinessDay, Nairametrics, and more.',
      color: 'bg-orange-500',
    },
    {
      icon: LineChart,
      title: 'Performance Metrics',
      description: 'Track week, month, YTD, and yearly returns for every stock in your watchlist.',
      color: 'bg-pink-500',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and authentication.',
      color: 'bg-indigo-500',
    },
  ];

  const stats = [
    { value: '145+', label: 'Listed Stocks' },
    { value: '5min', label: 'Data Refresh' },
    { value: '10+', label: 'Indicators' },
    { value: '24/7', label: 'Access' },
  ];

  const benefits = [
    'Track all NGX listed stocks in one place',
    'Personalized portfolio with performance tracking',
    'Technical and fundamental analysis tools',
    'Daily market newsletters delivered to your inbox',
    'Mobile-friendly interface for trading on-the-go',
    'Free to use with premium features',
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-700 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-green-100 text-sm mb-6 border border-white/10">
              <Zap size={16} className="text-yellow-400" />
              <span>Live Nigerian Stock Exchange Data</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Track NGX Stocks
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-teal-300">
                Like a Pro
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-green-100/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              The most comprehensive platform for tracking Nigerian Stock Exchange stocks. 
              Real-time data, technical analysis, and portfolio management — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onLogin}
                className="group flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-bold rounded-2xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-green-200/80 text-sm">
                <Globe size={16} />
                <span>No credit card required</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-green-200/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-slate-900 to-transparent" />
      </section>

      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Trade Smarter
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools and real-time insights to help you make informed investment decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 ${feature.color} rounded-xl mb-4 shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose 9jaStock?
              </h2>
              <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
                Join thousands of investors who trust 9jaStock for their Nigerian stock market analysis and tracking needs.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={onLogin}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Tracking Now
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">DANGCEM</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Dangote Cement</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">₦290.50</div>
                      <div className="text-sm text-green-600 dark:text-green-400">+2.45%</div>
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl flex items-end p-2">
                    <div className="flex items-end gap-1 w-full">
                      {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                    <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Portfolio Value</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">₦2.5M</div>
                    <div className="text-sm text-green-600 dark:text-green-400">+12.3% MTD</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                    <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Today's P&L</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">+₦45,200</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">5 stocks up</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-700 dark:from-slate-800 dark:via-emerald-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join the smartest investors in Nigeria. Sign up for free and get instant access to real-time stock data, portfolio tracking, and market insights.
          </p>
          <button
            onClick={onLogin}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-bold rounded-2xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
          >
            Create Free Account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-green-200/60 text-sm mt-4">
            Sign in with Google, Apple, or email — takes less than 30 seconds
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">9J</span>
              </div>
              <span className="font-semibold text-white">9jaStock</span>
            </div>
            <p className="text-sm">
              © 2026 9jaStock. Real-time NGX stock tracking for smart investors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
