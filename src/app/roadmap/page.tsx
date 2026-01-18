'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  TrendingUp,
  Brain,
  Briefcase,
  Twitter,
  Bell,
  Newspaper,
  Mail,
  LineChart,
  Smartphone,
  BarChart3,
  Calendar,
  PieChart,
  Globe,
  Bitcoin,
  Map,
  Building2,
  FileText,
  Users,
  Activity,
  GraduationCap,
  Gamepad2,
  Link as LinkIcon,
  MessageCircle,
  Rocket,
  Sparkles
} from 'lucide-react';

export default function RoadmapPage() {
  const currentFeatures = [
    { icon: TrendingUp, title: 'Real-Time NGX Stock Data', description: 'Live prices for 145+ Nigerian stocks with 1-minute refresh' },
    { icon: Brain, title: 'AI Buy/Sell/Hold Recommendations', description: 'Smart analysis with clear explanations for every stock' },
    { icon: Briefcase, title: 'Portfolio Tracking', description: 'Track your holdings with live P&L calculations' },
    { icon: Twitter, title: 'X/Twitter Market Buzz', description: 'Real-time sentiment analysis from Nigerian finance Twitter' },
    { icon: Bell, title: 'Price Alerts & Push Notifications', description: 'Never miss a price target or market opportunity' },
    { icon: Newspaper, title: 'News Aggregation', description: 'Curated news from top Nigerian financial sources' },
    { icon: Mail, title: 'AI Morning Newsletter', description: 'Daily AI-curated market insights delivered to your inbox' },
    { icon: LineChart, title: 'Technical Analysis', description: 'RSI, MACD, Moving Averages, and more indicators' },
    { icon: Smartphone, title: 'Mobile-Responsive PWA', description: 'Works seamlessly on any device, online or offline' },
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Enhanced Analytics',
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      icon: BarChart3,
      features: [
        { icon: LineChart, title: 'Advanced Charting Tools', description: 'Interactive charts with drawing tools and custom timeframes' },
        { icon: Calendar, title: 'Dividend Tracking & Calendar', description: 'Track dividend yields and upcoming payment dates' },
        { icon: Activity, title: 'Earnings Calendar', description: 'Never miss quarterly earnings announcements' },
        { icon: PieChart, title: 'Sector Heatmaps', description: 'Visual market overview by sector performance' },
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Global Markets',
      color: 'from-[#FCD116] to-amber-500',
      borderColor: 'border-[#FCD116]/30',
      bgColor: 'bg-[#FCD116]/10',
      icon: Globe,
      features: [
        { icon: Building2, title: 'US Stocks', description: 'Access NYSE, NASDAQ, and major American equities' },
        { icon: Bitcoin, title: 'Cryptocurrency & Futures', description: 'Track Bitcoin, Ethereum, and crypto markets' },
        { icon: Map, title: 'African Markets', description: 'Ghana, Kenya, South Africa, and Egypt stock exchanges' },
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Bloomberg-Terminal Features',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      icon: Building2,
      features: [
        { icon: FileText, title: 'Company Financials Deep Dive', description: 'Income statements, balance sheets, and cash flow analysis' },
        { icon: FileText, title: 'Corporate Actions & Filings', description: 'Track stock splits, rights issues, and regulatory filings' },
        { icon: Users, title: 'Insider Trading Data', description: 'Monitor director dealings and insider transactions' },
        { icon: Building2, title: 'Institutional Holdings', description: 'See what pension funds and institutions are buying' },
        { icon: Activity, title: 'Economic Indicators', description: 'GDP, inflation, interest rates, and macro data' },
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Advanced Tools',
      color: 'from-blue-500 to-indigo-500',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      icon: Rocket,
      features: [
        { icon: GraduationCap, title: 'Investment Academy', description: 'Learn investing with courses tailored for Nigerians' },
        { icon: Gamepad2, title: 'Paper Trading / Simulation', description: 'Practice trading with virtual money, zero risk' },
        { icon: LinkIcon, title: 'Broker Integration', description: 'Execute trades directly through partner brokers' },
        { icon: MessageCircle, title: 'Social Trading Features', description: 'Follow and copy successful investors' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 rounded-full text-[#00a863] text-sm mb-6 border border-[#008751]/20">
            <Sparkles size={14} className="animate-pulse" />
            <span className="font-medium">Product Roadmap</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            Building the Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] via-[#00a863] to-[#FCD116]">
              Nigerian Investing
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            See what&apos;s available today and what we&apos;re building next. 9jaStock is constantly evolving to give you the most powerful investment tools.
          </p>
        </div>

        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#008751]/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-[#008751]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Available Now</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i}
                  className="group p-5 rounded-2xl bg-slate-800/50 border border-[#008751]/20 hover:border-[#008751]/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#008751]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#008751]/30 transition-colors">
                      <Icon size={18} className="text-[#008751]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#FCD116]/20 flex items-center justify-center">
              <Rocket size={20} className="text-[#FCD116]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Coming in 2026</h2>
          </div>

          <div className="space-y-8">
            {roadmapPhases.map((phase, phaseIndex) => {
              const PhaseIcon = phase.icon;
              return (
                <div 
                  key={phaseIndex}
                  className={`relative rounded-3xl border ${phase.borderColor} overflow-hidden`}
                >
                  <div className={`absolute inset-0 ${phase.bgColor} opacity-50`} />
                  
                  <div className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg`}>
                        <PhaseIcon size={24} className="text-white" />
                      </div>
                      <div>
                        <div className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${phase.color}`}>
                          {phase.phase}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">{phase.title}</h3>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {phase.features.map((feature, featureIndex) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div 
                            key={featureIndex}
                            className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <FeatureIcon size={16} className="text-slate-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                                <p className="text-sm text-slate-500">{feature.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-[#008751]/10 to-[#FCD116]/10 border border-[#008751]/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Investing Smarter Today</h2>
            <p className="text-slate-400 mb-6">
              Get access to all current features and be the first to try new ones as we launch them.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#008751] to-[#00a863] text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-[#008751]/30"
            >
              Start Your Free Trial
              <Rocket size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
