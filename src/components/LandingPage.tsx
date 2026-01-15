'use client';

import { TrendingUp, BarChart3, Bell, Briefcase, LineChart, Shield, Zap, Globe, ArrowRight, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import Logo from './Logo';
import Link from 'next/link';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Stock Data',
      description: 'Get live prices, volume, and market cap for 145+ Nigerian stocks updated every 5 minutes.',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'Access RSI, MACD, Bollinger Bands, and 10+ technical indicators for informed decisions.',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Build and track your investment portfolio with real-time performance analytics.',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Bell,
      title: 'Market News',
      description: 'Stay updated with the latest NGX news from BusinessDay, Nairametrics, and more.',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: LineChart,
      title: 'Performance Metrics',
      description: 'Track week, month, YTD, and yearly returns for every stock in your watchlist.',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and authentication.',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  const stats = [
    { value: '145+', label: 'Listed Stocks', icon: '📈' },
    { value: '5min', label: 'Data Refresh', icon: '⚡' },
    { value: '10+', label: 'Indicators', icon: '📊' },
    { value: '24/7', label: 'Access', icon: '🌍' },
  ];

  const benefits = [
    'Track all NGX listed stocks in one place',
    'Personalized portfolio with performance tracking',
    'Technical and fundamental analysis tools',
    'Daily market newsletters delivered to your inbox',
    'Mobile-friendly interface for trading on-the-go',
    'Free to use with premium features',
  ];

  const stockTickers = [
    { symbol: 'DANGCEM', price: '₦290.50', change: '+2.45%', positive: true },
    { symbol: 'GTCO', price: '₦45.80', change: '+1.23%', positive: true },
    { symbol: 'ZENITH', price: '₦38.90', change: '-0.82%', positive: false },
    { symbol: 'MTNN', price: '₦198.00', change: '+0.51%', positive: true },
    { symbol: 'BUACEMENT', price: '₦102.30', change: '+3.12%', positive: true },
    { symbol: 'AIRTELAF', price: '₦2,150', change: '+1.05%', positive: true },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-950" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] bg-gradient-to-tl from-teal-500/15 via-emerald-500/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2v40h-2V0zm0 40h2v40h-2V40zM0 40h40v2H0v-2zm40 0h40v2H40v-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="absolute top-4 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Logo size="lg" variant="full" />
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 backdrop-blur-sm rounded-full text-emerald-400 text-sm mb-8 border border-emerald-500/20">
                <Sparkles size={16} className="animate-pulse" />
                <span className="font-medium">Live Nigerian Stock Exchange Data</span>
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Track NGX
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 animate-gradient">
                    Like a Pro
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-green-300/20 to-teal-400/20 blur-2xl" />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed">
                The most comprehensive platform for tracking Nigerian Stock Exchange stocks. 
                <span className="text-emerald-400 font-medium"> Real-time data</span>, 
                <span className="text-emerald-400 font-medium"> technical analysis</span>, and 
                <span className="text-emerald-400 font-medium"> portfolio management</span> — all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center mb-12">
                <Link
                  href="/signup"
                  className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Start Tracking Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-6 py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 backdrop-blur-sm transition-all"
                >
                  Already have an account?
                  <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-400 lg:justify-start justify-center flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>Sign in with Google</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl blur-3xl" />
              
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    9jastock.com
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-3 pb-2 border-b border-slate-700/50">
                    <span>Symbol</span>
                    <span>Price</span>
                    <span>Change</span>
                  </div>
                  
                  {stockTickers.map((stock, i) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all group cursor-pointer hover:scale-[1.02]"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${stock.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} group-hover:scale-110 transition-transform`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <span className="font-semibold text-white">{stock.symbol}</span>
                      </div>
                      <span className="font-mono text-slate-300">{stock.price}</span>
                      <span className={`font-mono font-medium ${stock.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.change}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
                      <div className="text-2xl font-bold text-white">₦4,250,000</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">Today's P&L</div>
                      <div className="text-lg font-bold text-emerald-400">+₦125,400</div>
                      <div className="text-xs text-emerald-400">+3.04%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-xl animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">DANGCEM</div>
                    <div className="text-sm font-bold text-emerald-400">+2.45%</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Bell size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">New Alert</div>
                    <div className="text-sm font-bold text-purple-400">MTNN +5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
      </section>

      <section className="relative py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5" />
        <div className="flex animate-scroll">
          <div className="flex items-center gap-12 px-6 whitespace-nowrap">
            {[...stockTickers, ...stockTickers, ...stockTickers].map((stock, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${stock.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {stock.symbol.slice(0, 2)}
                </div>
                <span className="font-semibold text-white">{stock.symbol}</span>
                <span className="text-slate-400">{stock.price}</span>
                <span className={stock.positive ? 'text-emerald-400' : 'text-red-400'}>
                  {stock.change}
                </span>
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
        `}</style>
      </section>

      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 text-sm mb-4">
              <Zap size={14} />
              <span className="font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Everything You Need to
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">Trade Smarter</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools and real-time insights to help you make informed investment decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 ${feature.bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 flex items-center text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 text-sm mb-6">
                <Globe size={14} />
                <span className="font-medium">Why 9jaStock</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Built for
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">Nigerian Investors</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
                Join thousands of investors who trust 9jaStock for their Nigerian stock market analysis and tracking needs.
              </p>
              
              <div className="space-y-3 mb-10">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="text-white" size={14} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
              >
                Start Tracking Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700/50">
                  <Logo size="lg" variant="icon" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">9jaStock Dashboard</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your portfolio at a glance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700/50">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">Total Value</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₦2.5M</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50">
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Today's P&L</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">+₦45.2K</div>
                  </div>
                </div>
                
                <div className="h-40 bg-gradient-to-t from-emerald-100/50 dark:from-emerald-900/20 to-transparent rounded-2xl p-4 flex items-end">
                  <div className="flex items-end gap-1 w-full h-full">
                    {[30, 45, 35, 55, 40, 65, 50, 70, 60, 80, 75, 90, 85, 95, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-400 hover:to-emerald-300 cursor-pointer"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8 border border-white/20">
            <Sparkles size={14} />
            <span>Join 5,000+ Nigerian investors</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Start
            <br />
            <span className="text-emerald-200">Tracking?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Sign up for free and get instant access to real-time stock data, portfolio tracking, and market insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-700 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300"
            >
              Create Free Account
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a
              href="/api/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>
          
          <p className="text-white/60 text-sm mt-6">
            Sign up with email or Google — takes less than 30 seconds
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Logo size="lg" variant="full" />
              <p className="text-sm text-slate-500 max-w-xs text-center md:text-left">
                Real-time NGX stock tracking for smart Nigerian investors.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © 2026 9jaStock. All rights reserved.
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
