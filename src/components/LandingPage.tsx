'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, Bell, Briefcase, LineChart, 
  Shield, Zap, Globe, ArrowRight, CheckCircle, ChevronRight, Sparkles, 
  Smartphone, Play, Twitter, Brain, Crown, Download, PieChart, 
  Newspaper, Target, Clock, MessageSquare, Star, CreditCard, Menu, X,
  AlertTriangle, Eye, Search, HelpCircle, ChevronDown, ChevronUp,
  Rocket, GraduationCap, Building2, Wallet, Users, Award, Heart, ArrowUp,
  Calendar, TrendingUp as Trend, DollarSign, BookOpen
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
    { icon: '😤', title: 'SCATTERED', desc: 'Your portfolio is in Excel, your news is on 5 different apps, your alerts are nowhere.' },
    { icon: '📉', title: 'NO INSIGHTS', desc: 'You buy stocks based on tips from Twitter with no real analysis to back them up.' },
    { icon: '🎓', title: 'NO GUIDANCE', desc: 'You want to learn but don\'t know where to start or who to trust.' },
    { icon: '💸', title: 'MISSED OPPORTUNITIES', desc: 'Rights issues, dividends, and corporate actions happen without you knowing.' },
    { icon: '🌍', title: 'LIMITED OPTIONS', desc: 'You know the real money is in global markets but have no easy way to access them.' },
    { icon: '📊', title: 'COMPLEX DATA', desc: 'P/E ratios, RSI, MACD - what does it all mean and how do you use it?' },
  ];

  const currentFeatures = [
    {
      icon: BarChart3,
      title: 'Real-Time NGX Data',
      desc: 'All 145 actively traded stocks on the Nigerian Stock Exchange. Live prices, volume, market cap - updated every minute.',
      bullets: ['Live market indices (ASI, NGX 30, Banking, Oil & Gas)', 'Top gainers, losers, and most active stocks', 'Sector-by-sector breakdown', '52-week highs and lows'],
      gradient: 'from-[#008751] to-[#00a863]',
    },
    {
      icon: Brain,
      title: 'AI-Powered Stock Analysis',
      desc: 'Stop guessing. Let AI analyze stocks for you. Our AI examines technical indicators, fundamentals, news sentiment, and market conditions.',
      bullets: ['Personalized recommendations based on YOUR profile', 'Clear Buy/Hold/Sell signals', 'Risk assessment for every stock', 'Daily AI insights delivered to you'],
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Briefcase,
      title: 'Portfolio Tracking',
      desc: 'Finally, ditch that Excel spreadsheet. Track all your holdings in one place.',
      bullets: ['See real-time gains and losses', 'Multiple purchase tracking per stock', 'Cost basis and average price calculations', 'Share your portfolio with friends'],
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Bell,
      title: 'Price Alerts & News',
      desc: 'Never miss a market move again. Set alerts for any price target.',
      bullets: ['Get notified when stocks hit your buy/sell zones', 'Curated news from top Nigerian financial sources', 'Social sentiment from Twitter, Reddit, and TradingView', 'Push notifications to your phone'],
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: LineChart,
      title: 'Professional Technical Analysis',
      desc: 'Tools that professional traders use, now accessible to you.',
      bullets: ['RSI, MACD, Bollinger Bands', 'Moving averages (SMA, EMA)', 'Volume analysis', 'Interactive TradingView charts'],
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  const comingSoonFeatures = [
    { icon: Globe, title: 'Global Market Access', desc: 'Track your US stocks (Tesla, Apple, Amazon), UK stocks, and crypto - all in one unified portfolio view in Naira.', badge: 'Q2 2026' },
    { icon: DollarSign, title: 'Dividend & Income Tracker', desc: 'Know exactly when dividends are coming and how much. Build an income-generating portfolio.', badge: 'Q1 2026' },
    { icon: Calendar, title: 'Corporate Actions Hub', desc: 'Never miss a rights issue, bonus, or AGM again. Get alerts for all corporate actions.', badge: 'Q2 2026' },
    { icon: Building2, title: 'Nigerian Economic Dashboard', desc: 'CBN rates, inflation tracking, FX rates, treasury yields - understand the big picture.', badge: 'Q2 2026' },
    { icon: Target, title: 'Goal-Based Investing', desc: 'Save for retirement, a house, your children\'s education. Get portfolio recommendations based on your timeline.', badge: 'Q3 2026' },
    { icon: GraduationCap, title: 'Investment Academy', desc: 'Learn to invest like a pro - for free. Stock Investing 101, financial statements, technical analysis basics.', badge: 'Q2 2026' },
    { icon: Zap, title: 'Direct Broker Integration', desc: 'One day, you\'ll buy stocks directly from 9jastock. Analysis → Decision → Trade → Track. All in one place.', badge: 'FUTURE' },
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
      quote: 'I finally understand my portfolio. The AI analysis helped me see why DANGCEM was a better pick than what my colleague was recommending.',
      name: 'Adaeze O.',
      title: 'Software Developer, Lagos',
      detail: 'Using 9jastock for 3 months',
    },
    {
      quote: 'The price alerts saved me. I set an alert for GTCO at ₦28 and bought in. It\'s now at ₦41. That single trade paid for years of subscription.',
      name: 'Emeka N.',
      title: 'Banker, Abuja',
      detail: 'Pro subscriber',
    },
    {
      quote: 'As someone in diaspora, I can finally track my NGX investments properly. Can\'t wait for them to add US stocks too!',
      name: 'Yusuf A.',
      title: 'Engineer, London',
      detail: 'Using 9jastock for 6 months',
    },
  ];

  const faqs = [
    {
      q: 'Is 9jastock a stockbroker? Can I buy stocks through you?',
      a: 'No, 9jastock is not a stockbroker. We are an investment intelligence platform that helps you analyze, track, and make better decisions. To buy stocks, you\'ll still need a licensed stockbroker. We\'re working on broker integrations for the future.',
    },
    {
      q: 'How accurate is the stock data?',
      a: 'Our data comes from TradingView and Yahoo Finance - the same sources used by professional traders worldwide. Premium users get 5-minute updates, Pro users get 1-minute real-time data.',
    },
    {
      q: 'What happens after my 7-day trial?',
      a: 'You\'ll be charged for your selected plan (monthly or annual). You can cancel anytime before the trial ends and you won\'t be charged.',
    },
    {
      q: 'Can I track stocks from other countries?',
      a: 'Not yet - but it\'s coming! We\'re building global market support (US, UK, crypto) which will launch in the coming months. Subscribe now and you\'ll get it when it\'s ready at no extra cost.',
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. We use bank-level encryption, never share your data with third parties, and comply with Nigerian Data Protection Regulation (NDPR).',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all Nigerian bank cards, bank transfers via Paystack, and international cards via Stripe.',
    },
    {
      q: 'Can I get a refund?',
      a: 'If you\'re not satisfied within the first 30 days of your paid subscription, contact us for a full refund. No questions asked.',
    },
    {
      q: 'Is this financial advice?',
      a: 'No. 9jastock provides information and tools for educational purposes. Always do your own research and consult a licensed financial advisor before making investment decisions.',
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
                  <Sparkles size={14} />
                  <span className="font-medium">Nigeria&apos;s #1 AI-Powered Stock Platform</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  The Smartest Way to Invest in
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#008751] via-[#00a863] to-[#FCD116]">
                      Nigeria&apos;s Future
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#008751]/30 via-[#00a863]/30 to-[#FCD116]/30 blur-2xl" />
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
                  Real-time NGX data. AI-powered analysis. Your complete investment companion - today and tomorrow.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center mb-6">
                  <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl shadow-2xl shadow-[#008751]/30 hover:shadow-[#008751]/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative flex items-center gap-2">
                      Start 7-Day Free Trial
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
                
                <p className="text-sm text-slate-500 mb-8">
                  ✓ No payment required to explore  ✓ Cancel anytime
                </p>
                
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
                            <div className="font-bold text-white">₦{stock.price.toFixed(2)}</div>
                            <div className={`text-sm font-medium flex items-center gap-1 justify-end ${
                              stock.change >= 0 ? 'text-[#00a863]' : 'text-red-400'
                            }`}>
                              {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="relative p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <Brain size={24} className="text-purple-400" />
                        <div>
                          <div className="text-xs text-purple-300">AI Recommendation</div>
                          <div className="text-white font-bold">DANGCEM: Strong Buy</div>
                        </div>
                        <div className="ml-auto px-3 py-1 bg-[#00a863]/20 text-[#00a863] text-xs font-bold rounded-full">
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
          <ChevronDown size={24} className="text-slate-500" />
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Investing in Nigeria is Hard.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#FCD116]">
                We&apos;re Here to Change That.
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((point, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-red-500/30 transition-all">
                <div className="text-3xl mb-3">{point.icon}</div>
                <h3 className="font-bold text-red-400 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-400">{point.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <blockquote className="text-lg italic text-slate-300">
              &ldquo;I was tired of checking 5 apps just to understand what&apos;s happening with my stocks.&rdquo;
            </blockquote>
            <p className="text-sm text-slate-500 mt-2">- Chidi, Lagos</p>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 rounded-full text-[#00a863] text-sm mb-4">
              <CheckCircle size={14} />
              <span className="font-medium">Available Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Everything You Need.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#00a863]">
                One Powerful App.
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              9jastock brings together market data, AI analysis, portfolio tracking, and financial education - finally.
            </p>
          </div>
          
          <div className="space-y-16">
            {currentFeatures.map((feature, i) => (
              <div key={i} className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 mb-4">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle size={14} className="text-[#00a863] flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative h-64 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <feature.icon size={64} className="text-slate-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent rounded-2xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs text-slate-400">Screenshot coming soon</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={visionRef} className="relative py-20 md:py-28 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD116]/10 rounded-full text-[#FCD116] text-sm mb-4">
              <Rocket size={14} />
              <span className="font-medium">Coming Soon</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              This is Just the Beginning.
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              We&apos;re building the future of investing for every Nigerian. The Nigerian Stock Exchange is where we start - but it&apos;s not where we stop.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {comingSoonFeatures.map((feature, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-[#FCD116]/30 transition-all group">
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    feature.badge === 'FUTURE' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-[#FCD116]/20 text-[#FCD116]'
                  }`}>
                    {feature.badge}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FCD116]/10 w-fit mb-4 group-hover:bg-[#FCD116]/20 transition-colors">
                  <feature.icon size={24} className="text-[#FCD116]" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-[#008751]/20 to-[#FCD116]/20 border border-[#008751]/30">
              <Crown size={32} className="text-[#FCD116] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Become a Founding Member</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Early subscribers get lifetime benefits and help shape what we build next.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-xl hover:scale-105 transition-transform">
                Start Your Free Trial
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Why Join 9jastock Today?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FCD116]/10 to-[#008751]/10 border border-[#FCD116]/30">
              <div className="flex items-center gap-3 mb-6">
                <Award size={32} className="text-[#FCD116]" />
                <h3 className="text-2xl font-bold text-white">Founding Member Benefits</h3>
              </div>
              <p className="text-slate-300 mb-6">The first 500 subscribers become Founding Members with:</p>
              <ul className="space-y-3 mb-6">
                {[
                  'Price locked forever - never pay more even as we add features',
                  'Early access to new features before public release',
                  'Direct input into our product roadmap',
                  'Founding Member badge on your profile',
                  'Exclusive Founding Members community group',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle size={16} className="text-[#FCD116] flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-red-400 text-sm font-bold">
                🔥 217 founding member spots remaining
              </div>
            </div>
            
            <div className="space-y-6">
              {[
                { icon: '📈', title: 'START SMALL, WIN BIG', desc: 'NGX may be small but it\'s where legends like Dangote started. Build your foundation here.' },
                { icon: '🧠', title: 'LEARN AS YOU GO', desc: 'Use 9jastock to learn investing fundamentals. Master the basics before going global.' },
                { icon: '🚀', title: 'GROW WITH US', desc: 'As we add global markets, your skills transfer. You\'ll be ready for US, UK, and global stocks.' },
              ].map((card, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-400">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <blockquote className="text-xl italic text-slate-300">
              &ldquo;The best time to start investing was 10 years ago. The second best time is today.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              More Than an App.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#FCD116]">
                A Movement for Financial Freedom.
              </span>
            </h2>
            <p className="text-xl text-slate-300 mt-6">
              &ldquo;Only 3% of Nigerians invest in the stock market. We&apos;re here to change that - one investor at a time.&rdquo;
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
              <h3 className="font-bold text-red-400 mb-4">THE PROBLEM WITH NIGERIA</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• ₦14 trillion sitting in savings accounts earning 1-3%</li>
                <li>• Inflation at 20%+ destroying purchasing power yearly</li>
                <li>• Most &ldquo;investments&rdquo; are Ponzi schemes and MMM reruns</li>
                <li>• Financial literacy not taught in schools</li>
                <li>• Generational wealth rarely built</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-[#008751]/10 border border-[#008751]/30">
              <h3 className="font-bold text-[#00a863] mb-4">THE 9JASTOCK MISSION</h3>
              <p className="text-sm text-slate-300 mb-3">We believe every Nigerian deserves:</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  'Access to the same tools professionals use',
                  'Clear, honest education about investing',
                  'A platform that grows with their wealth journey',
                  'Protection from scams through financial literacy',
                  'A path to generational wealth',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#00a863] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD116]/10 rounded-full text-[#FCD116] text-sm mb-4">
              <Crown size={14} />
              <span className="font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Start with a 7-day free trial. Cancel anytime.
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
                ⭐ Most Popular
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
                {['5-minute data refresh', '30 watchlist stocks', '30 portfolio stocks', '20 price alerts', '10 AI analysis/day', 'All technical indicators', '30 days news history', 'Email support (24hr)'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-[#00a863]" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="block w-full text-center py-3 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-xl hover:scale-105 transition-transform">
                Start Free Trial
              </Link>
            </div>

            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#FCD116]/10 to-slate-800/50 border border-[#FCD116]/30">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#FCD116]/20 rounded-full text-[#FCD116] text-xs font-bold">
                🚀 Full Access
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For serious investors who want it all</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-white">
                  ₦{activePlan === 'monthly' ? '7,999' : '79,999'}
                </span>
                <span className="text-slate-400">/{activePlan === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {['1-minute real-time data', 'Unlimited watchlist', 'Unlimited portfolio', '100 price alerts', 'Unlimited AI analysis', 'Stock screener', '90 days news history', 'Priority + WhatsApp support', 'Multi-portfolio (5)', 'Economic dashboard'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-[#FCD116]" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="block w-full text-center py-3 bg-gradient-to-r from-[#FCD116] to-amber-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">
                Start Free Trial
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-slate-500">
              ✓ 7-day free trial  ✓ No charge until trial ends  ✓ Cancel anytime  ✓ All future features included
            </p>
            <Link href="/contact" className="text-sm text-[#FCD116] hover:underline">
              Need team access? Contact us for Institutional pricing →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              What Nigerian Investors Are Saying
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-[#FCD116] fill-[#FCD116]" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.title}</div>
                  <div className="text-xs text-[#00a863]">{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#00a863]">₦2.3B+</div>
              <div className="text-sm text-slate-400">Portfolio Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#FCD116]">1,200+</div>
              <div className="text-sm text-slate-400">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-blue-400">145</div>
              <div className="text-sm text-slate-400">NGX Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-purple-400">4.8★</div>
              <div className="text-sm text-slate-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm mb-4">
              <HelpCircle size={14} />
              <span className="font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Frequently Asked Questions
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
            Start Your Investment
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#FCD116]">
              Journey Today.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians building wealth with smarter investment decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl shadow-2xl shadow-[#008751]/30 hover:shadow-[#008751]/50 hover:scale-105 transition-all duration-300"
            >
              Start Your 7-Day Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <p className="text-sm text-slate-500">
            No credit card required to explore.
          </p>
        </div>
      </section>

      <footer className="relative py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo3D size="md" variant="full" animated={false} />
              <p className="text-sm text-slate-400 mt-4">
                The smartest way to invest in Nigeria&apos;s future.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="https://twitter.com/9jastock" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
              </div>
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
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
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
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} 9jastock. All rights reserved.</p>
            <p className="text-xs text-slate-500">
              9jastock is not a licensed stockbroker. Investment involves risk. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 p-3 bg-[#008751] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
