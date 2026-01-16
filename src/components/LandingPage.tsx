'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Bell, Briefcase, LineChart, Shield, Zap, Globe, ArrowRight, CheckCircle, ChevronRight, Sparkles, Smartphone, Play } from 'lucide-react';
import Logo3D from './Logo3D';
import Link from 'next/link';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Data',
      description: 'Live prices for 145+ NGX stocks updated every 5 minutes.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'RSI, MACD, Bollinger Bands and 10+ indicators.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Track investments with real-time P&L analytics.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Bell,
      title: 'Market Alerts',
      description: 'Daily newsletters with AI-curated insights.',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const stockCards = [
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 290.50, change: 2.45, color: 'emerald' },
    { symbol: 'GTCO', name: 'GTBank Holdings', price: 45.80, change: 1.23, color: 'blue' },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.90, change: -0.82, color: 'red' },
  ];

  const stats = [
    { value: '145+', label: 'Stocks', icon: '📈' },
    { value: '5min', label: 'Refresh', icon: '⚡' },
    { value: '10+', label: 'Indicators', icon: '📊' },
    { value: '24/7', label: 'Access', icon: '🌍' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden" onMouseMove={handleMouseMove}>
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-[2000ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              left: `${mousePosition.x * 50}%`,
              top: `${mousePosition.y * 50}%`,
            }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-[1500ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)',
              right: `${(1 - mousePosition.x) * 30}%`,
              bottom: `${(1 - mousePosition.y) * 30}%`,
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16,185,129,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <nav className="relative z-50 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 md:py-6">
              <Logo3D size="lg" variant="full" animated={true} />
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  href="/login"
                  className="px-3 md:px-5 py-2 md:py-2.5 text-slate-300 hover:text-white font-medium transition-colors text-sm md:text-base"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25 text-sm md:text-base"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/10 backdrop-blur-sm rounded-full text-emerald-400 text-xs md:text-sm mb-6 md:mb-8 border border-emerald-500/20">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="font-medium">Live NGX Data</span>
                  <div className="relative">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
                  Track NGX
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400">
                      Like a Pro
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 via-green-300/30 to-teal-400/30 blur-2xl" />
                  </span>
                </h1>
                
                <p className="text-base md:text-lg lg:text-xl text-slate-300 max-w-xl mb-6 md:mb-8 leading-relaxed mx-auto lg:mx-0">
                  The most powerful platform for Nigerian investors. 
                  <span className="text-emerald-400 font-medium"> Real-time data</span>, 
                  <span className="text-emerald-400 font-medium"> technical analysis</span>, and 
                  <span className="text-emerald-400 font-medium"> smart portfolio tracking</span>.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 lg:justify-start justify-center mb-8 md:mb-10">
                  <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2 text-sm md:text-base">
                      Start Free Today
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 backdrop-blur-sm transition-all text-sm md:text-base"
                  >
                    <Play size={16} className="text-emerald-400" />
                    Watch Demo
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400 lg:justify-start justify-center">
                  {['No credit card', 'Free forever', 'Mobile ready'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md lg:max-w-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl blur-3xl transition-all duration-1000"
                    style={{
                      transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
                    }}
                  />
                  
                  <div className="relative perspective-1000">
                    <div 
                      className="transform-gpu transition-transform duration-300"
                      style={{
                        transform: `rotateY(${(mousePosition.x - 0.5) * 10}deg) rotateX(${(mousePosition.y - 0.5) * -10}deg)`,
                      }}
                    >
                      <div className="space-y-3 md:space-y-4">
                        {stockCards.map((stock, i) => (
                          <div
                            key={stock.symbol}
                            className={`
                              relative p-4 md:p-5 rounded-2xl md:rounded-3xl backdrop-blur-xl border transition-all duration-500
                              ${activeCard === i 
                                ? 'bg-slate-800/80 border-emerald-500/50 scale-105 shadow-xl shadow-emerald-500/10' 
                                : 'bg-slate-900/60 border-slate-700/50 scale-100'
                              }
                            `}
                            style={{
                              transform: `translateZ(${activeCard === i ? '30px' : '0'}) translateY(${activeCard === i ? '-5px' : '0'})`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className={`
                                  w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-white text-xs md:text-sm
                                  ${stock.change >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
                                  ${activeCard === i ? 'shadow-lg animate-pulse' : ''}
                                `}
                                style={{ animationDuration: '3s' }}
                                >
                                  {stock.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm md:text-base">{stock.symbol}</div>
                                  <div className="text-xs md:text-sm text-slate-400">{stock.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-white text-sm md:text-lg">₦{stock.price.toFixed(2)}</div>
                                <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                                </div>
                              </div>
                            </div>
                            
                            {activeCard === i && (
                              <div className="absolute -inset-px rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-teal-500/20 pointer-events-none" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 md:mt-6 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs md:text-sm text-slate-400 mb-1">Portfolio Value</div>
                            <div className="text-xl md:text-2xl font-black text-white">₦4,250,000</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs md:text-sm text-slate-400 mb-1">Today</div>
                            <div className="text-base md:text-lg font-bold text-emerald-400">+₦125,400</div>
                            <div className="text-xs text-emerald-400/80">+3.04%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 hidden sm:block">
                    <div 
                      className="bg-slate-800/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-700/50 shadow-xl animate-float"
                      style={{ animationDelay: '0s' }}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                          <TrendingUp size={14} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-slate-400">Top Gainer</div>
                          <div className="text-xs md:text-sm font-bold text-emerald-400">DANGCEM +2.45%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 hidden sm:block">
                    <div 
                      className="bg-slate-800/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-700/50 shadow-xl animate-float"
                      style={{ animationDelay: '1.5s' }}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Bell size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-slate-400">Alert</div>
                          <div className="text-xs md:text-sm font-bold text-purple-400">MTNN hit ₦200</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      <section className="relative py-3 md:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5" />
        <div className="flex animate-scroll">
          <div className="flex items-center gap-6 md:gap-12 px-4 md:px-6 whitespace-nowrap">
            {[...stockCards, ...stockCards, ...stockCards, ...stockCards].map((stock, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 py-2">
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center text-[8px] md:text-[10px] font-bold ${stock.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {stock.symbol.slice(0, 2)}
                </div>
                <span className="font-semibold text-white text-xs md:text-sm">{stock.symbol}</span>
                <span className="text-slate-400 text-xs md:text-sm">₦{stock.price.toFixed(2)}</span>
                <span className={`text-xs md:text-sm ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-16 md:mb-20">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center md:text-left">
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-xs md:text-sm mb-3 md:mb-4">
              <Zap size={12} />
              <span className="font-medium">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              Everything You Need
            </h2>
            <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
              Professional tools designed for Nigerian investors
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`relative inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 md:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-xs md:text-sm mb-4 md:mb-6">
                <Smartphone size={12} />
                <span className="font-medium">Mobile First</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
                Trade Anywhere,
                <br />
                <span className="text-emerald-400">Anytime</span>
              </h2>
              <p className="text-sm md:text-lg text-slate-300 mb-6 md:mb-8 leading-relaxed">
                9jaStock is designed mobile-first for Nigerian investors on the go. 
                Track your portfolio, analyze stocks, and stay updated with market news — all from your phone or tablet.
              </p>
              
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {[
                  'Optimized for all screen sizes',
                  'Fast, responsive interface',
                  'Works on slow connections',
                  'No app download required',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-sm md:text-base text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all text-sm md:text-base"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 rounded-[2rem] md:rounded-[3rem] blur-3xl" />
                
                <div className="relative w-[220px] md:w-[280px] h-[440px] md:h-[560px] bg-slate-900 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-slate-800 shadow-2xl overflow-hidden">
                  <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-slate-800 rounded-full" />
                  
                  <div className="h-full pt-6 md:pt-8 pb-4 md:pb-6 px-3 md:px-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="text-white font-bold text-xs md:text-sm">9jaStock</div>
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg md:rounded-xl p-2.5 md:p-3 mb-3 md:mb-4">
                      <div className="text-[8px] md:text-[10px] text-slate-400 mb-1">Portfolio Value</div>
                      <div className="text-base md:text-xl font-bold text-white">₦4.25M</div>
                      <div className="text-[10px] md:text-xs text-emerald-400">+3.04% today</div>
                    </div>
                    
                    <div className="space-y-2">
                      {stockCards.slice(0, 3).map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-2 md:p-2.5 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white ${stock.change >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
                              {stock.symbol.slice(0, 2)}
                            </div>
                            <div className="text-[10px] md:text-xs text-white font-medium">{stock.symbol}</div>
                          </div>
                          <div className={`text-[10px] md:text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-4 md:-right-8 top-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-2.5 md:p-3 border border-slate-700/50 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-[10px] md:text-xs text-white font-medium">+12.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian investors who track their portfolios with 9jaStock.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:scale-105 shadow-xl text-sm md:text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-sm md:text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-slate-800 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo3D size="md" variant="full" animated={false} />
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400">
              <span>© 2026 9jaStock</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">NGX Stock Tracker</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
