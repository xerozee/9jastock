'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Bell, Briefcase, Zap, ArrowRight, CheckCircle, Sparkles, Smartphone, Play, Activity, Shield, Target } from 'lucide-react';
import Logo from './Logo';
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
      icon: Activity,
      title: 'Real-Time Data',
      description: 'Live prices for 145+ NGX stocks updated every 5 minutes.',
      color: 'var(--accent)',
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'RSI, MACD, Bollinger Bands and 10+ indicators.',
      color: 'var(--accent-secondary)',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Track investments with real-time P&L analytics.',
      color: 'var(--accent-tertiary)',
    },
    {
      icon: Bell,
      title: 'Market Alerts',
      description: 'Daily newsletters with AI-curated insights.',
      color: 'var(--accent-warning)',
    },
  ];

  const stockCards = [
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 290.50, change: 2.45 },
    { symbol: 'GTCO', name: 'GTBank Holdings', price: 45.80, change: 1.23 },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.90, change: -0.82 },
  ];

  const stats = [
    { value: '145+', label: 'Stocks', icon: Target },
    { value: '5min', label: 'Refresh', icon: Zap },
    { value: '10+', label: 'Indicators', icon: BarChart3 },
    { value: '24/7', label: 'Access', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background)]" />

          {/* Neon Glow Effects */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-[2000ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,200,0.15) 0%, transparent 70%)',
              left: `${mousePosition.x * 50}%`,
              top: `${mousePosition.y * 50}%`,
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-[1500ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
              right: `${(1 - mousePosition.x) * 30}%`,
              bottom: `${(1 - mousePosition.y) * 30}%`,
            }}
          />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,255,200,0.2) 1px, transparent 0)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="nav-scifi relative z-50 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 md:py-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--accent)] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <Logo size="lg" variant="full" />
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  href="/login"
                  className="px-3 md:px-5 py-2 md:py-2.5 text-[var(--muted-foreground)] hover:text-[var(--accent)] font-medium transition-colors text-sm md:text-base"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-scifi-solid px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[rgba(0,255,200,0.1)] backdrop-blur-sm rounded-full text-[var(--accent)] text-xs md:text-sm mb-6 md:mb-8 border border-[rgba(0,255,200,0.2)]">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="font-medium tracking-wide">Live NGX Data</span>
                  <div className="relative">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full shadow-[0_0_10px_var(--accent)]" />
                    <div className="absolute inset-0 w-2 h-2 bg-[var(--accent)] rounded-full animate-ping" />
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
                  Track NGX
                  <br />
                  <span className="relative inline-block">
                    <span className="gradient-text">
                      Like a Pro
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/30 via-[var(--accent-secondary)]/30 to-[var(--accent)]/30 blur-2xl" />
                  </span>
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg lg:text-xl text-[var(--muted-foreground)] max-w-xl mb-6 md:mb-8 leading-relaxed mx-auto lg:mx-0">
                  The most powerful platform for Nigerian investors.
                  <span className="text-[var(--accent)] font-medium"> Real-time data</span>,
                  <span className="text-[var(--accent-secondary)] font-medium"> technical analysis</span>, and
                  <span className="text-[var(--accent)] font-medium"> smart portfolio tracking</span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 lg:justify-start justify-center mb-8 md:mb-10">
                  <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto btn-scifi-solid flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base"
                  >
                    <span className="flex items-center gap-2">
                      Start Free Today
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    href="/login"
                    className="btn-scifi w-full sm:w-auto flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-4 rounded-xl text-sm md:text-base"
                  >
                    <Play size={16} />
                    Watch Demo
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-[var(--muted-foreground)] lg:justify-start justify-center">
                  {['No credit card', 'Free forever', 'Mobile ready'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-[var(--accent)]" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D Stock Cards */}
              <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md lg:max-w-none">
                  <div
                    className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/20 to-transparent rounded-3xl blur-3xl transition-all duration-1000"
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
                              scifi-card relative p-4 md:p-5 transition-all duration-500
                              ${activeCard === i
                                ? 'scale-105 shadow-[0_0_30px_var(--glow-primary)]'
                                : 'scale-100'
                              }
                            `}
                            style={{
                              transform: `translateZ(${activeCard === i ? '30px' : '0'}) translateY(${activeCard === i ? '-5px' : '0'})`,
                            }}
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className={`
                                  w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-xs md:text-sm
                                  ${stock.change >= 0
                                    ? 'bg-[rgba(0,255,200,0.2)] text-[var(--stock-up)] border border-[rgba(0,255,200,0.3)]'
                                    : 'bg-[rgba(255,51,102,0.2)] text-[var(--stock-down)] border border-[rgba(255,51,102,0.3)]'
                                  }
                                  ${activeCard === i ? 'shadow-lg animate-pulse' : ''}
                                `}
                                style={{ animationDuration: '3s' }}
                                >
                                  {stock.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm md:text-base">{stock.symbol}</div>
                                  <div className="text-xs md:text-sm text-[var(--muted-foreground)]">{stock.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-white text-sm md:text-lg">₦{stock.price.toFixed(2)}</div>
                                <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                                  {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Portfolio Summary Card */}
                      <div className="mt-4 md:mt-6 scifi-card p-4 md:p-5 bg-gradient-to-br from-[rgba(0,255,200,0.1)] to-[rgba(0,212,255,0.05)]">
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <div className="text-xs md:text-sm text-[var(--muted-foreground)] mb-1 uppercase tracking-wide">Portfolio Value</div>
                            <div className="text-xl md:text-2xl font-black text-white">₦4,250,000</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs md:text-sm text-[var(--muted-foreground)] mb-1 uppercase tracking-wide">Today</div>
                            <div className="text-base md:text-lg font-bold text-[var(--stock-up)] neon-text-subtle">+₦125,400</div>
                            <div className="text-xs text-[var(--stock-up)]">+3.04%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Alert Cards */}
                  <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 hidden sm:block">
                    <div className="scifi-card p-3 md:p-4 animate-float">
                      <div className="flex items-center gap-2 md:gap-3 relative z-10">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[rgba(0,255,200,0.2)] rounded-lg md:rounded-xl flex items-center justify-center border border-[rgba(0,255,200,0.3)]">
                          <TrendingUp size={14} className="text-[var(--accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-[var(--muted-foreground)] uppercase tracking-wide">Top Gainer</div>
                          <div className="text-xs md:text-sm font-bold text-[var(--accent)]">DANGCEM +2.45%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 hidden sm:block">
                    <div className="scifi-card p-3 md:p-4 animate-float" style={{ animationDelay: '1.5s' }}>
                      <div className="flex items-center gap-2 md:gap-3 relative z-10">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[rgba(255,0,255,0.2)] rounded-lg md:rounded-xl flex items-center justify-center border border-[rgba(255,0,255,0.3)]">
                          <Bell size={14} className="text-[var(--accent-tertiary)]" />
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-[var(--muted-foreground)] uppercase tracking-wide">Alert</div>
                          <div className="text-xs md:text-sm font-bold text-[var(--accent-tertiary)]">MTNN hit ₦200</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
      </section>

      {/* Stock Ticker */}
      <section className="relative py-3 md:py-4 bg-[var(--card)] border-y border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,255,200,0.02)] via-transparent to-[rgba(0,255,200,0.02)]" />
        <div className="flex animate-scroll">
          <div className="flex items-center gap-6 md:gap-12 px-4 md:px-6 whitespace-nowrap">
            {[...stockCards, ...stockCards, ...stockCards, ...stockCards].map((stock, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 py-2">
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center text-[8px] md:text-[10px] font-bold ${stock.change >= 0 ? 'bg-[rgba(0,255,200,0.2)] text-[var(--stock-up)]' : 'bg-[rgba(255,51,102,0.2)] text-[var(--stock-down)]'}`}>
                  {stock.symbol.slice(0, 2)}
                </div>
                <span className="font-semibold text-white text-xs md:text-sm">{stock.symbol}</span>
                <span className="text-[var(--muted-foreground)] text-xs md:text-sm">₦{stock.price.toFixed(2)}</span>
                <span className={`text-xs md:text-sm ${stock.change >= 0 ? 'text-[var(--stock-up)]' : 'text-[var(--stock-down)]'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Features Section */}
      <section className="relative py-16 md:py-24 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-16 md:mb-20">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="scifi-card group p-4 md:p-6 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative z-10 text-center md:text-left">
                    <div className="inline-flex p-2 rounded-lg bg-[rgba(0,255,200,0.1)] border border-[rgba(0,255,200,0.2)] mb-2 md:mb-3">
                      <Icon size={20} className="text-[var(--accent)]" />
                    </div>
                    <div className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-[var(--muted-foreground)] uppercase tracking-wide">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features Header */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[rgba(0,255,200,0.1)] rounded-full text-[var(--accent)] text-xs md:text-sm mb-3 md:mb-4 border border-[rgba(0,255,200,0.2)]">
              <Zap size={12} />
              <span className="font-medium uppercase tracking-wide">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-sm md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto px-4">
              Professional tools designed for Nigerian investors
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="scifi-card group p-5 md:p-6 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div
                      className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300 border"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        borderColor: `${feature.color}40`,
                      }}
                    >
                      <Icon size={20} style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="relative py-16 md:py-24 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[rgba(0,255,200,0.1)] rounded-full text-[var(--accent)] text-xs md:text-sm mb-4 md:mb-6 border border-[rgba(0,255,200,0.2)]">
                <Smartphone size={12} />
                <span className="font-medium uppercase tracking-wide">Mobile First</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
                Trade Anywhere,
                <br />
                <span className="gradient-text">Anytime</span>
              </h2>
              <p className="text-sm md:text-lg text-[var(--muted-foreground)] mb-6 md:mb-8 leading-relaxed">
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
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[rgba(0,255,200,0.2)] flex items-center justify-center border border-[rgba(0,255,200,0.3)]">
                      <CheckCircle size={12} className="text-[var(--accent)]" />
                    </div>
                    <span className="text-sm md:text-base text-[var(--foreground)]">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="btn-scifi-solid inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl font-bold text-sm md:text-base"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Phone Mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--accent-tertiary)]/20 rounded-[2rem] md:rounded-[3rem] blur-3xl" />

                <div className="relative w-[220px] md:w-[280px] h-[440px] md:h-[560px] scifi-card rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                  <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-[var(--muted)] rounded-full" />

                  <div className="h-full pt-6 md:pt-8 pb-4 md:pb-6 px-3 md:px-4 overflow-hidden relative z-10">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="text-white font-bold text-xs md:text-sm">9jaStock</div>
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]" />
                    </div>

                    <div className="bg-[var(--muted)] rounded-lg md:rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 border border-[var(--border)]">
                      <div className="text-[8px] md:text-[10px] text-[var(--muted-foreground)] mb-1 uppercase tracking-wide">Portfolio Value</div>
                      <div className="text-base md:text-xl font-bold text-white">₦4.25M</div>
                      <div className="text-[10px] md:text-xs text-[var(--stock-up)]">+3.04% today</div>
                    </div>

                    <div className="space-y-2">
                      {stockCards.slice(0, 3).map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-2 md:p-2.5 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[8px] md:text-[10px] font-bold ${stock.change >= 0 ? 'bg-[rgba(0,255,200,0.2)] text-[var(--stock-up)]' : 'bg-[rgba(255,51,102,0.2)] text-[var(--stock-down)]'}`}>
                              {stock.symbol.slice(0, 2)}
                            </div>
                            <div className="text-[10px] md:text-xs text-white font-medium">{stock.symbol}</div>
                          </div>
                          <div className={`text-[10px] md:text-xs font-semibold ${stock.change >= 0 ? 'text-[var(--stock-up)]' : 'text-[var(--stock-down)]'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 md:-right-8 top-1/4 scifi-card p-2.5 md:p-3 animate-float">
                  <div className="flex items-center gap-2 relative z-10">
                    <TrendingUp size={14} className="text-[var(--accent)]" />
                    <span className="text-[10px] md:text-xs text-white font-medium">+12.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--accent-foreground)] mb-4 md:mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-[var(--accent-foreground)]/80 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian investors who track their portfolios with 9jaStock.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[var(--background)] text-[var(--accent)] font-bold rounded-xl hover:scale-105 transition-all shadow-xl text-sm md:text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-[var(--accent-foreground)]/50 text-[var(--accent-foreground)] font-semibold rounded-xl hover:bg-[var(--accent-foreground)]/10 transition-all text-sm md:text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--background)] border-t border-[var(--border)] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="md" variant="full" />
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-[var(--muted-foreground)]">
              <span>© 2026 9jaStock</span>
              <span className="hidden md:inline text-[var(--border)]">|</span>
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
