'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, Bell, Briefcase, LineChart, 
  Shield, Zap, Globe, ArrowRight, CheckCircle, ChevronRight, Sparkles, 
  Smartphone, Play, Twitter, Brain, Crown, Download, PieChart, 
  Newspaper, Target, Clock, MessageSquare, Star, CreditCard
} from 'lucide-react';
import Logo3D from './Logo3D';
import Link from 'next/link';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [activeCard, setActiveCard] = useState(0);
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('monthly');

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
      description: 'Live prices for 145+ NGX stocks from TradingView, updated every 5 minutes.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'GPT-4 powered stock recommendations based on your investment profile.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Twitter,
      title: 'Market Buzz',
      description: 'Real-time X/Twitter feed with AI sentiment analysis for each stock.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Bell,
      title: 'Price Alerts',
      description: 'Push notifications when stocks hit your target prices.',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Track investments with real-time P&L and shareable portfolio links.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'Interactive TradingView charts with RSI, MACD, Bollinger Bands & more.',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: PieChart,
      title: 'Fundamental Data',
      description: 'P/E ratio, EPS, dividends, balance sheet, cash flow & profitability metrics.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Newspaper,
      title: 'AI Newsletter',
      description: 'Daily AI-curated market insights from Nigerian financial news sources.',
      gradient: 'from-teal-500 to-emerald-600',
    },
  ];

  const stockCards = [
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 290.50, change: 2.45, color: 'emerald' },
    { symbol: 'GTCO', name: 'GTBank Holdings', price: 45.80, change: 1.23, color: 'blue' },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.90, change: -0.82, color: 'red' },
  ];

  const stats = [
    { value: '145+', label: 'NGX Stocks', icon: '📈' },
    { value: '79', label: 'Data Fields', icon: '📊' },
    { value: 'AI', label: 'Powered', icon: '🤖' },
    { value: '24/7', label: 'Access', icon: '🌍' },
  ];

  const testimonials = [
    {
      name: 'Chidi O.',
      role: 'Retail Investor',
      text: 'The AI recommendations have helped me discover stocks I never would have found on my own.',
      rating: 5,
    },
    {
      name: 'Amaka N.',
      role: 'Day Trader',
      text: 'Price alerts and real-time data from TradingView make this my go-to NGX platform.',
      rating: 5,
    },
    {
      name: 'Emeka K.',
      role: 'Portfolio Manager',
      text: 'The social sentiment analysis from X gives me an edge in understanding market mood.',
      rating: 5,
    },
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
                  <span className="font-medium">AI-Powered • Real-Time Data • 145+ Stocks</span>
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
                  Nigeria&apos;s most powerful stock tracking platform with
                  <span className="text-emerald-400 font-medium"> TradingView charts</span>, 
                  <span className="text-purple-400 font-medium"> AI analysis</span>, 
                  <span className="text-blue-400 font-medium"> X/Twitter sentiment</span>, and
                  <span className="text-orange-400 font-medium"> price alerts</span>.
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
                    href="/stocks"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 backdrop-blur-sm transition-all text-sm md:text-base"
                  >
                    <Play size={16} className="text-emerald-400" />
                    Explore Stocks
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400 lg:justify-start justify-center">
                  {['No credit card', 'Free tier available', 'Install as app'].map((text, i) => (
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
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Twitter size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-slate-400">Market Sentiment</div>
                          <div className="text-xs md:text-sm font-bold text-emerald-400">Bullish 📈</div>
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
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Bell size={14} className="text-orange-400" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-slate-400">Price Alert</div>
                          <div className="text-xs md:text-sm font-bold text-orange-400">MTNN ₦200 🎯</div>
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
              Professional-grade tools built for Nigerian investors
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

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-xs md:text-sm mb-3 md:mb-4">
              <Brain size={12} />
              <span className="font-medium">AI-Powered Intelligence</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              Smart Stock Analysis
            </h2>
            <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
              Leverage artificial intelligence for personalized investment insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 md:mb-6">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Personalized Recommendations</h3>
              <p className="text-sm md:text-base text-slate-300 mb-4">
                Based on your investment goals, risk tolerance, and interested sectors, our AI suggests stocks tailored to you.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-400" /> Dividend stocks for passive income</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-400" /> Blue-chip for beginners</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-400" /> Growth stocks for aggressive investors</li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 md:mb-6">
                <MessageSquare size={24} className="text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Sentiment Analysis</h3>
              <p className="text-sm md:text-base text-slate-300 mb-4">
                Every X/Twitter post is analyzed by GPT-4 for bullish, bearish, or neutral sentiment signals.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-400" /> Real-time social sentiment</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-400" /> Nigerian finance accounts monitored</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-400" /> Stock mention detection</li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4 md:mb-6">
                <Newspaper size={24} className="text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">AI Newsletter</h3>
              <p className="text-sm md:text-base text-slate-300 mb-4">
                Daily AI-curated newsletters summarizing Nigerian financial news from top sources.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> Nairametrics, BusinessDay, Punch</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> TradingView market updates</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> Delivered to your inbox</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/10 rounded-full text-orange-400 text-xs md:text-sm mb-3 md:mb-4">
              <Bell size={12} />
              <span className="font-medium">Stay Informed</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              Never Miss a Move
            </h2>
            <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
              Push notifications and price alerts keep you ahead of the market
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Price Alerts</h4>
                  <p className="text-sm text-slate-400">Set target prices and get notified when stocks hit your levels.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Daily Summary</h4>
                  <p className="text-sm text-slate-400">Market recap and portfolio performance delivered daily.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-red-500/30 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Breaking News</h4>
                  <p className="text-sm text-slate-400">Instant alerts for major market events and announcements.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Star size={20} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Watchlist Updates</h4>
                  <p className="text-sm text-slate-400">Get notified about significant moves in your watchlist stocks.</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-64 md:w-80">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-slate-800 rounded-3xl border border-slate-700 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Bell size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Price Alert</div>
                      <div className="text-xs text-slate-400">Just now</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">DANGCEM</span>
                      <span className="text-emerald-400 font-bold">₦295.00</span>
                    </div>
                    <p className="text-sm text-slate-300">Hit your target of ₦295.00 ✅</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-4 bg-emerald-500 text-white text-sm font-bold rounded-xl">View</button>
                    <button className="flex-1 py-2 px-4 bg-slate-700 text-white text-sm font-bold rounded-xl">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-500/10 rounded-full text-amber-400 text-xs md:text-sm mb-3 md:mb-4">
              <Crown size={12} />
              <span className="font-medium">Premium Plans</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              Choose Your Plan
            </h2>
            <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto px-4 mb-6">
              Start free, upgrade when you&apos;re ready
            </p>
            
            <div className="inline-flex items-center p-1 bg-slate-800 rounded-xl">
              <button
                onClick={() => setActivePlan('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePlan === 'monthly' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActivePlan('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePlan === 'yearly' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-xs text-emerald-400 ml-1">Save 17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-slate-900/50 border border-slate-700">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl md:text-4xl font-black text-white">₦0</span>
                <span className="text-slate-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '5-minute data refresh',
                  'Up to 10 portfolio stocks',
                  'Basic watchlist',
                  'Market overview',
                  'Technical indicators',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl md:text-4xl font-black text-white">
                  ₦{activePlan === 'monthly' ? '2,999' : '24,999'}
                </span>
                <span className="text-slate-400">/{activePlan === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '1-minute real-time data',
                  'Unlimited portfolio stocks',
                  'AI stock recommendations',
                  'Push notifications & price alerts',
                  'Priority support',
                  'Full market sentiment analysis',
                  'Advanced technical analysis',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl transition-all"
              >
                Start Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-xs md:text-sm mb-4 md:mb-6">
                <Download size={12} />
                <span className="font-medium">Install as App</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
                Add to Your
                <br />
                <span className="text-emerald-400">Home Screen</span>
              </h2>
              <p className="text-sm md:text-lg text-slate-300 mb-6 md:mb-8 leading-relaxed">
                9jaStock works as a Progressive Web App. Install it on your phone for a native app experience — no app store needed.
              </p>
              
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {[
                  'Works offline for portfolio viewing',
                  'Push notifications for price alerts',
                  'Fast, app-like experience',
                  'No storage space needed',
                  'Always up-to-date',
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
                    
                    <div className="bg-slate-800/50 rounded-lg md:rounded-xl p-2.5 md:p-3 mb-3">
                      <div className="text-[10px] md:text-xs text-slate-400 mb-1">Portfolio Value</div>
                      <div className="text-lg md:text-xl font-bold text-white">₦4.25M</div>
                      <div className="text-xs text-emerald-400">+3.04% today</div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {stockCards.slice(0, 2).map((stock) => (
                        <div key={stock.symbol} className="bg-slate-800/30 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{stock.symbol}</span>
                            <span className={`text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg p-2.5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell size={10} className="text-orange-400" />
                        <span className="text-[10px] text-slate-400">Alert</span>
                      </div>
                      <div className="text-xs text-white font-medium">MTNN hit ₦200 🎯</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-xs md:text-sm mb-3 md:mb-4">
              <Star size={12} />
              <span className="font-medium">Loved by Investors</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              What Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm mb-6">
            <Sparkles size={14} className="animate-pulse" />
            <span className="font-medium">Join 1,000+ Nigerian Investors</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Start Trading
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Smarter Today
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Free forever. Premium features when you need them. No credit card required to get started.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              Create Free Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/stocks"
              className="flex items-center justify-center gap-2 px-6 py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 transition-all"
            >
              Explore Stocks
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo3D size="md" variant="full" animated={false} />
              <p className="text-sm text-slate-400 mt-4">
                Nigeria&apos;s most powerful stock tracking platform for retail and professional investors.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/stocks" className="hover:text-white transition-colors">All Stocks</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">Market News</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Real-time Data</li>
                <li>AI Analysis</li>
                <li>Price Alerts</li>
                <li>Portfolio Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} 9jaStock. All rights reserved. Data powered by TradingView.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
