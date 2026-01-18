'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, Bell, Briefcase, LineChart, 
  Shield, Zap, Globe, ArrowRight, CheckCircle, ChevronRight, Sparkles, 
  Smartphone, Play, Twitter, Brain, Crown, Download, PieChart, 
  Newspaper, Target, Clock, MessageSquare, Star, CreditCard, Menu, X,
  AlertTriangle, Eye, Search, HelpCircle, ChevronDown, ChevronUp,
  Rocket, GraduationCap, Building2, Wallet, Users, Award, Heart, ArrowUp
} from 'lucide-react';
import Logo3D from './Logo3D';
import Link from 'next/link';

export default function MarketingLandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [activeCard, setActiveCard] = useState(0);
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const visionRef = useRef<HTMLElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const scrollToVision = () => {
    visionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const painPoints = [
    {
      icon: Eye,
      title: 'Outdated, Delayed Data',
      description: 'Most NGX websites show prices from hours ago. You\'re making decisions on yesterday\'s news.',
    },
    {
      icon: Search,
      title: 'Scattered Information',
      description: 'Stock prices on one site, news on another, financials on a third. Hours wasted just gathering data.',
    },
    {
      icon: AlertTriangle,
      title: 'No Price Alerts',
      description: 'You miss your target price because you can\'t watch your phone all day. Opportunities slip away.',
    },
    {
      icon: Brain,
      title: 'Analysis Paralysis',
      description: 'Too much information, no clear guidance. Which stocks match YOUR goals? Nobody tells you.',
    },
    {
      icon: Smartphone,
      title: 'Poor Mobile Experience',
      description: 'Desktop-only websites that are impossible to use on your phone. In 2025. Really.',
    },
    {
      icon: Shield,
      title: 'No Portfolio Tracking',
      description: 'Still using Excel to track your investments? You deserve real-time P&L at a glance.',
    },
  ];

  const currentFeatures = [
    {
      icon: TrendingUp,
      title: 'Real-Time Stock Prices',
      description: 'Live prices for 145+ NGX stocks with 1-minute auto-refresh. No more stale data.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Brain,
      title: 'AI Buy/Sell Recommendations',
      description: 'Our AI analyzes each stock and gives you clear Buy, Sell, or Hold guidance with explanations.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Twitter,
      title: 'X/Twitter Market Sentiment',
      description: 'See what Nigerian traders are saying in real-time. AI-powered sentiment analysis included.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      description: 'Track your holdings, see your gains/losses in real-time, and share your portfolio with friends.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Bell,
      title: 'Price Alerts & Notifications',
      description: 'Set price targets and get instant push notifications when your stocks hit them.',
      gradient: 'from-red-500 to-rose-600',
    },
  ];

  const comingSoonFeatures = [
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Trade US stocks, crypto, and forex — all from one Nigerian platform. Coming Q2 2026.',
      badge: 'Q2 2026',
      badgeColor: 'bg-blue-500',
    },
    {
      icon: Wallet,
      title: 'Dividend Tracker',
      description: 'Know exactly when dividends drop and how much you\'re earning passively.',
      badge: 'Q1 2026',
      badgeColor: 'bg-emerald-500',
    },
    {
      icon: GraduationCap,
      title: 'Investment Academy',
      description: 'Learn investing from scratch with courses designed for Nigerian beginners.',
      badge: 'Q2 2026',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: Building2,
      title: 'Broker Integration',
      description: 'Execute trades directly from 9jaStock. Connect your Nigerian brokerage account.',
      badge: 'Q3 2026',
      badgeColor: 'bg-orange-500',
    },
    {
      icon: Users,
      title: 'Investment Clubs',
      description: 'Pool money with friends, track group performance, and grow together.',
      badge: 'Q2 2026',
      badgeColor: 'bg-pink-500',
    },
    {
      icon: LineChart,
      title: 'Technical Analysis AI',
      description: 'AI that reads charts and explains patterns in plain English.',
      badge: 'Q1 2026',
      badgeColor: 'bg-teal-500',
    },
    {
      icon: PieChart,
      title: 'Portfolio Optimizer',
      description: 'AI suggests how to rebalance your portfolio for maximum returns.',
      badge: 'Q3 2026',
      badgeColor: 'bg-amber-500',
    },
  ];

  const foundingBenefits = [
    'Lock in launch pricing forever (even as we add features)',
    'Exclusive "Founding Member" badge on your profile',
    'Priority access to new features before public release',
    'Direct line to founders for feedback and requests',
    'Free upgrade when global markets launch',
  ];

  const stockCards = [
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 290.50, change: 2.45 },
    { symbol: 'GTCO', name: 'GTBank Holdings', price: 45.80, change: 1.23 },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.90, change: -0.82 },
  ];

  const stats = [
    { value: '145+', label: 'NGX Stocks' },
    { value: '1min', label: 'Refresh Rate' },
    { value: '24/7', label: 'AI Analysis' },
    { value: '#1', label: 'NGX Platform' },
  ];

  const testimonials = [
    {
      name: 'Chidi O.',
      role: 'First-time Investor, Lagos',
      text: 'I was intimidated by the stock market until I found 9jaStock. The AI told me exactly which dividend stocks matched my goals. Now I actually understand what I\'m investing in.',
      rating: 5,
    },
    {
      name: 'Amaka N.',
      role: 'Day Trader, Port Harcourt',
      text: 'I used to check three different websites for prices. Now I just open 9jaStock. The price alerts saved me last week when GTCO hit my target while I was in a meeting.',
      rating: 5,
    },
    {
      name: 'Emeka K.',
      role: 'Investment Club Lead, Abuja',
      text: 'Our investment club uses the portfolio sharing feature to track our group investments. The X sentiment analysis helps us see what the market is feeling before we make decisions.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'Is 9jaStock a brokerage? Can I buy stocks through the app?',
      a: 'Not yet! Currently, 9jaStock is a research and tracking platform. You\'ll still execute trades through your existing broker. Broker integration is coming in Q3 2026, which will let you trade directly from the app.',
    },
    {
      q: 'How accurate is the AI\'s Buy/Sell/Hold recommendation?',
      a: 'Our AI combines technical indicators, fundamental analysis, and market sentiment to give you guidance. It\'s not financial advice — think of it as a very smart research assistant that explains its reasoning so you can make informed decisions.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all Nigerian debit cards, Paystack, and bank transfers. Payment is processed securely through Stripe. You can also pay with international cards.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Absolutely. Cancel with one click from your profile page. No hidden fees, no questions asked. You\'ll keep access until the end of your billing period.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. We use bank-level encryption (SSL/TLS) and never store your banking credentials. Your portfolio data is encrypted at rest and in transit. We\'re NDPR compliant.',
    },
    {
      q: 'Does the app work offline?',
      a: 'Yes! 9jaStock is a Progressive Web App (PWA). Your portfolio and recent data are cached, so you can check your investments even without internet. Live prices require connection.',
    },
    {
      q: 'How is 9jaStock different from other stock apps?',
      a: 'We\'re the only NGX platform with AI-powered recommendations, real-time X/Twitter sentiment analysis, and push notifications. Others show you data — we tell you what it means.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! Start with a 7-day free trial. No credit card required upfront. Experience everything 9jaStock has to offer, then decide if it\'s right for you.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden" onMouseMove={handleMouseMove}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Logo3D size="lg" variant="full" animated={!scrolled} />
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={scrollToVision} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                What&apos;s Coming
              </button>
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </Link>
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
              <button onClick={() => { scrollToVision(); setMobileMenuOpen(false); }} className="block w-full text-left text-slate-300 hover:text-white py-2">
                What&apos;s Coming
              </button>
              <Link href="/pricing" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
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

      <section className="relative min-h-screen flex flex-col pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-[2000ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,135,81,0.2) 0%, transparent 70%)',
              left: `${mousePosition.x * 50}%`,
              top: `${mousePosition.y * 50}%`,
            }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-[1500ms] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(252,209,22,0.1) 0%, transparent 70%)',
              right: `${(1 - mousePosition.x) * 30}%`,
              bottom: `${(1 - mousePosition.y) * 30}%`,
            }}
          />
        </div>

        <div className="relative flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 backdrop-blur-sm rounded-full text-[#00a863] text-sm mb-8 border border-[#008751]/20">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="font-medium">Nigeria&apos;s #1 AI-Powered Stock Platform</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                  Invest Smarter.
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#008751] via-[#00a863] to-[#FCD116]">
                      Grow Faster.
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#008751]/30 via-[#00a863]/30 to-[#FCD116]/30 blur-2xl" />
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
                  The only Nigerian platform with <span className="text-[#00a863] font-medium">real-time NGX data</span>, 
                  <span className="text-[#FCD116] font-medium"> AI-powered recommendations</span>, and 
                  <span className="text-blue-400 font-medium"> social sentiment analysis</span>. 
                  Stop guessing. Start knowing.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center mb-10">
                  <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl shadow-2xl shadow-[#008751]/30 hover:shadow-[#008751]/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <button
                    onClick={scrollToVision}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-[#FCD116]/50 hover:bg-slate-800/50 backdrop-blur-sm transition-all"
                  >
                    <Rocket size={16} className="text-[#FCD116]" />
                    See What&apos;s Coming
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md lg:max-w-none">
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
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-slate-400" size={32} />
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-400 text-sm mb-4">
              <AlertTriangle size={14} />
              <span className="font-medium">The Problem</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Nigerian Investors Deserve Better
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              The current tools are broken. Here&apos;s what you&apos;re dealing with:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                    <Icon size={24} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                  <p className="text-sm text-slate-400">{point.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 rounded-full text-[#00a863] text-sm mb-4">
              <Zap size={14} />
              <span className="font-medium">The Solution</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              9jaStock Changes Everything
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Here&apos;s what you get today — live and ready to use:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-[#008751]/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={visionRef} className="relative py-20 md:py-28 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD116]/10 rounded-full text-[#FCD116] text-sm mb-4">
              <Rocket size={14} />
              <span className="font-medium">The Vision</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              This Is Just the Beginning
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              We&apos;re building the future of Nigerian investing. Here&apos;s what&apos;s coming:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comingSoonFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-[#FCD116]/30 transition-all duration-300"
                >
                  <div className={`absolute top-4 right-4 px-2 py-1 ${feature.badgeColor} rounded-full text-xs font-bold text-white`}>
                    {feature.badge}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-4 group-hover:bg-[#FCD116]/10 transition-colors">
                    <Icon size={24} className="text-[#FCD116]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#FCD116]/10 to-[#008751]/10 border border-[#FCD116]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD116]/10 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD116]/20 rounded-full text-[#FCD116] text-sm mb-6">
                <Award size={14} />
                <span className="font-bold">Founding Member Benefits</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Join Now & Lock In These Perks Forever
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Early supporters get exclusive benefits that never expire.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
                {foundingBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#008751]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={14} className="text-[#00a863]" />
                    </div>
                    <span className="text-sm text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FCD116] to-amber-500 text-slate-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-[#FCD116]/30"
              >
                Become a Founding Member
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full text-pink-400 text-sm mb-6">
            <Heart size={14} />
            <span className="font-medium">Our Mission</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Financial Literacy for Every Nigerian
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            We believe every Nigerian deserves access to the same tools, data, and insights that wealthy investors use. 
            9jaStock isn&apos;t just an app — it&apos;s a movement to democratize wealth creation in Nigeria.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <div className="text-3xl mb-3">🇳🇬</div>
              <h3 className="font-bold text-white mb-2">Built in Nigeria</h3>
              <p className="text-sm text-slate-400">By Nigerians who understand your market</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-white mb-2">Education First</h3>
              <p className="text-sm text-slate-400">We explain everything in plain language</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-bold text-white mb-2">Global Ambition</h3>
              <p className="text-sm text-slate-400">Starting with NGX, expanding worldwide</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD116]/10 rounded-full text-[#FCD116] text-sm mb-4">
              <Crown size={14} />
              <span className="font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Invest in Your Future
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Less than a plate of jollof rice per day for tools that could change your financial future.
            </p>
            
            <div className="inline-flex items-center p-1 bg-slate-800 rounded-xl mb-12">
              <button
                onClick={() => setActivePlan('monthly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePlan === 'monthly' ? 'bg-[#008751] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActivePlan('yearly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePlan === 'yearly' ? 'bg-[#008751] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-xs text-[#FCD116] ml-1">Save 30%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative p-8 rounded-3xl bg-slate-800/50 border border-slate-700">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#008751]/20 rounded-full text-[#00a863] text-xs font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-slate-400 text-sm mb-6">Everything you need to invest smarter</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-white">
                  ₦{activePlan === 'monthly' ? '2,999' : '24,999'}
                </span>
                <span className="text-slate-400">/{activePlan === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {['145+ NGX stocks with live data', 'AI Buy/Sell/Hold recommendations', 'Price alerts & notifications', 'Portfolio tracking', 'X/Twitter sentiment analysis', 'AI morning newsletter'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-[#00a863]" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="block w-full text-center py-3 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-xl hover:scale-105 transition-transform">
                Start 7-Day Free Trial
              </Link>
            </div>

            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#FCD116]/10 to-amber-500/10 border border-[#FCD116]/30">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#FCD116]/20 rounded-full text-[#FCD116] text-xs font-bold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For serious traders and investment clubs</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-white">
                  ₦{activePlan === 'monthly' ? '7,999' : '79,999'}
                </span>
                <span className="text-slate-400">/{activePlan === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {['Everything in Premium', 'Global markets (US, Crypto, Forex)', 'Advanced technical analysis AI', 'Investment club features', 'Priority support', 'API access'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-[#FCD116]" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button disabled className="block w-full text-center py-3 bg-slate-700 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                Coming Q2 2026
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-sm mb-4">
              <Star size={14} />
              <span className="font-medium">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Loved by Nigerian Investors
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-[#FCD116] fill-[#FCD116]" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#00a863]">5,000+</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#FCD116]">₦2B+</div>
              <div className="text-sm text-slate-400">Portfolios Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-blue-400">50K+</div>
              <div className="text-sm text-slate-400">Price Alerts Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-purple-400">4.9★</div>
              <div className="text-sm text-slate-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm mb-4">
              <HelpCircle size={14} />
              <span className="font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Got Questions?
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Ready to Invest
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#FCD116]">
              Like a Pro?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians already using the only AI-powered NGX platform. 
            Start your 7-day free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl shadow-2xl shadow-[#008751]/30 hover:shadow-[#008751]/50 hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/stocks"
              className="flex items-center justify-center gap-2 px-6 py-4 text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 transition-all"
            >
              Explore Stocks First
              <ChevronRight size={18} />
            </Link>
          </div>
          
          <p className="text-sm text-slate-500">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      <footer className="relative py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo3D size="md" variant="full" animated={false} />
              <p className="text-sm text-slate-400 mt-4">
                Nigeria&apos;s #1 AI-powered stock market platform. Built by Nigerians, for Nigerians.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/stocks" className="hover:text-white transition-colors">All Stocks</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Market News</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Real-time Data</li>
                <li>AI Recommendations</li>
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
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} 9jaStock. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>in Nigeria 🇳🇬</span>
            </div>
          </div>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-[#008751] text-white rounded-full shadow-lg hover:scale-110 transition-transform z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
