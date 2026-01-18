# 9JASTOCK: Strategic Product Roadmap

> The all-in-one investment companion built specifically for Nigerian investors, combining global portfolio tracking with deep NGX expertise and AI-powered insights.

**Last Updated:** January 2026
**Status:** Launched (Pre-Revenue)
**Target:** Nigerian retail investors, diaspora investors, financial literacy seekers

---

## Vision Statement

To become the definitive investment platform for every Nigerian investor - whether at home or abroad - by providing world-class market data, intelligent insights, and educational resources tailored to the Nigerian financial ecosystem.

---

## Current App Capabilities (v1.0)

### Core Features
- Real-time NGX stock data (145+ stocks via TradingView)
- Portfolio tracking with performance analytics
- Watchlist management
- AI-powered stock recommendations (OpenAI)
- Social sentiment analysis (Twitter/X, Reddit, TradingView)
- News aggregation from multiple sources
- Technical indicators (RSI, MACD, Bollinger Bands, etc.)
- Fundamental metrics (P/E, EPS, ROE, etc.)
- Price alerts system
- Push notifications
- Dark mode support
- PWA (Progressive Web App)

### Subscription Model
- **Free Tier:** Limited watchlist (3), 30-min refresh, basic features
- **Premium Tier:** Unlimited portfolio, 1-min refresh, AI recommendations, price alerts

### Tech Stack
- Next.js 16 + React 19 (TypeScript)
- MongoDB + PostgreSQL
- TradingView API + Yahoo Finance
- Stripe payments
- NextAuth authentication
- OpenAI integration

---

## Future Roadmap

### Phase 1: Critical Features (High Impact, Medium Effort)

#### 1.1 Dividend Tracker & Income Dashboard
**Priority:** 🔴 Critical
**Impact:** Very High | **Effort:** Medium | **Revenue Potential:** High

**Features:**
- [ ] Dividend calendar showing upcoming ex-dividend dates
- [ ] Historical dividend payment tracking per stock
- [ ] Dividend yield rankings across NGX
- [ ] Dividend reinvestment calculator (DRIP simulation)
- [ ] Personal dividend income tracker (monthly/quarterly/annual)
- [ ] Dividend growth rate analysis
- [ ] "Income Portfolio" builder for passive income seekers
- [ ] Alerts for dividend announcements and payment dates

**Rationale:** Dividend investing is extremely popular in Nigeria. Banks like Zenith, GTCO, and Stanbic IBTC have loyal followings purely for dividends.

---

#### 1.2 Corporate Actions Hub
**Priority:** 🔴 Critical
**Impact:** Very High | **Effort:** Medium | **Revenue Potential:** High

**Features:**
- [ ] Rights issues tracker with subscription deadlines
- [ ] Bonus share announcements
- [ ] Stock split notifications
- [ ] AGM/EGM calendar with agenda items
- [ ] Capital raise announcements
- [ ] Share buyback programs
- [ ] Merger & acquisition alerts
- [ ] Scheme of arrangement tracking
- [ ] Historical corporate actions database

**Rationale:** Missing a rights issue deadline can be costly. This is currently tracked manually by most investors.

---

#### 1.3 Nigerian Economic Dashboard
**Priority:** 🔴 Critical
**Impact:** High | **Effort:** Medium | **Revenue Potential:** Medium

**Features:**
- [ ] CBN policy rate tracker with historical chart
- [ ] Inflation rate (CPI) monthly updates
- [ ] GDP growth rates
- [ ] FX rates (Official, parallel market, I&E window)
- [ ] Money supply (M2) data
- [ ] Foreign reserves tracking
- [ ] Treasury bill rates (91, 182, 364-day)
- [ ] Bond yields (FGN bonds)
- [ ] CBN circulars and policy announcements
- [ ] Budget/fiscal policy updates

**Rationale:** Nigerian markets are heavily influenced by CBN policies. No app currently aggregates this data for retail investors.

---

### Phase 2: High Priority Features

#### 2.1 Multi-Currency Investment Tracker
**Priority:** 🟠 High
**Impact:** Very High | **Effort:** High | **Revenue Potential:** Very High

**Features:**
- [ ] Add holdings from US markets (NYSE, NASDAQ)
- [ ] Add UK markets (LSE)
- [ ] Track crypto holdings (BTC, ETH, etc.)
- [ ] Unified portfolio view in Naira
- [ ] Real-time FX conversion (using parallel market rates)
- [ ] Performance comparison: NGX vs S&P 500 vs local returns
- [ ] International stock data via free APIs (Alpha Vantage, Finnhub)
- [ ] Track Dollar-cost-averaging across currencies

**Rationale:** Many Nigerians use Bamboo, Trove, Rise, or Chaka for foreign stocks but have no unified view. This makes 9jastock the "one app to rule them all."

---

#### 2.2 Goal-Based Investment Planning
**Priority:** 🟠 High
**Impact:** High | **Effort:** Medium | **Revenue Potential:** High

**Features:**
- [ ] Create investment goals (retirement, house, car, wedding, school fees, Hajj/Omra)
- [ ] Target amount and timeline setting
- [ ] Recommended portfolio allocation per goal
- [ ] Progress tracking with visual charts
- [ ] "You're on track" / "You need to invest more" notifications
- [ ] Milestone celebrations
- [ ] Risk-appropriate stock suggestions per goal
- [ ] Inflation-adjusted goal calculations

**Rationale:** PiggyVest and Cowrywise excel here. Combining goal-based planning with stock investing is unique.

---

#### 2.3 Advanced Stock Screener
**Priority:** 🟠 High
**Impact:** High | **Effort:** Medium | **Revenue Potential:** Medium

**Features:**
- [ ] Multi-criteria stock screener:
  - P/E ratio range
  - Dividend yield minimum
  - Market cap range
  - Sector filter
  - Technical indicators (RSI oversold, MACD crossover)
  - Volume surge detection
  - 52-week high/low proximity
- [ ] Save custom screener presets
- [ ] Screener alerts (notify when stocks meet criteria)
- [ ] Pre-built screens: "Value Stocks," "Growth Stocks," "Dividend Champions," "Small Caps"

**Rationale:** Currently, no Nigerian retail platform offers this. It's standard on US platforms like Finviz.

---

### Phase 3: Medium Priority Features

#### 3.1 Investment Education Academy
**Priority:** 🟡 Medium
**Impact:** Medium | **Effort:** High | **Revenue Potential:** Medium

**Features:**
- [ ] Interactive courses: "Stock Investing 101," "Reading Financial Statements," "Technical Analysis Basics"
- [ ] Video tutorials (YouTube integration or hosted)
- [ ] Glossary of investment terms (Nigerian context)
- [ ] Weekly "Market Monday" educational newsletter
- [ ] Quizzes with achievements/badges
- [ ] Paper trading simulator (practice without real money)
- [ ] "What would have happened if..." historical simulator
- [ ] Beginner-friendly stock explanations on each stock page
- [ ] Progress tracking and certificates

**Rationale:** Apps like Cowrywise and PiggyVest have built massive followings partly through education. This creates stickiness.

---

#### 3.2 Tax Calculator & Reporting
**Priority:** 🟡 Medium
**Impact:** Medium | **Effort:** Low | **Revenue Potential:** Low

**Features:**
- [ ] Capital gains tax calculator (10% on NGX gains)
- [ ] Withholding tax on dividends tracker (10%)
- [ ] Downloadable annual tax report
- [ ] Cost basis tracking (FIFO, LIFO, average cost)
- [ ] Tax-loss harvesting suggestions
- [ ] Integration with tax filing requirements

**Rationale:** Nobody does this. FIRS compliance is confusing for retail investors.

---

#### 3.3 Community & Social Trading
**Priority:** 🟡 Medium
**Impact:** High | **Effort:** High | **Revenue Potential:** Medium

**Features:**
- [ ] Follow top-performing investors
- [ ] Public portfolios (opt-in)
- [ ] Copy trading (mirror another user's trades)
- [ ] Discussion forums per stock
- [ ] Investment clubs/groups
- [ ] Verified expert badges
- [ ] Weekly "Top Performers" leaderboard
- [ ] Stock-specific chat rooms
- [ ] Investment polls and surveys

**Rationale:** Builds community, increases engagement, and helps beginners learn from experts.

---

### Phase 4: Professional-Grade Features

#### 4.1 SEC/NGX Regulatory Filings Hub
**Priority:** 🟡 Medium
**Impact:** High | **Effort:** Medium | **Revenue Potential:** Medium

**Features:**
- [ ] Real-time SEC filings scraper
- [ ] NGX company announcements feed
- [ ] Insider trading disclosures (director dealings)
- [ ] Shareholding structure changes
- [ ] Material event notifications
- [ ] Audited financial statement releases
- [ ] Quarterly report alerts
- [ ] Regulatory sanctions and penalties

**Rationale:** Currently, only institutional investors track this. Democratizing this creates serious value.

---

#### 4.2 Earnings Calendar & Analysis
**Priority:** 🟡 Medium
**Impact:** Medium | **Effort:** Medium | **Revenue Potential:** Medium

**Features:**
- [ ] Upcoming earnings release calendar
- [ ] Historical earnings surprises (beat/miss)
- [ ] EPS estimates vs actual
- [ ] Revenue growth tracking
- [ ] Earnings call transcripts (if available)
- [ ] Post-earnings price movement analysis

**Rationale:** Earnings season moves markets. No Nigerian app tracks this systematically.

---

### Phase 5: Future/Ambitious Features

#### 5.1 Broker Integration & Trading
**Priority:** 🟢 Future
**Impact:** Very High | **Effort:** Very High | **Revenue Potential:** Very High

**Features:**
- [ ] Partner with licensed stockbrokers (Meristem, Stanbic, CSL, etc.)
- [ ] Link brokerage account to 9jastock
- [ ] One-click buy/sell from stock pages
- [ ] Order management (limit orders, market orders)
- [ ] Trade confirmation and history
- [ ] CSCS (Central Securities Clearing System) integration
- [ ] Automatic portfolio sync from broker

**Rationale:** This transforms 9jastock from an informational app to a transactional platform. Massive competitive moat.

---

#### 5.2 Robo-Advisory & Auto-Invest
**Priority:** 🟢 Future
**Impact:** High | **Effort:** High | **Revenue Potential:** High

**Features:**
- [ ] Risk profiling questionnaire (already have this!)
- [ ] Auto-generated portfolio allocation
- [ ] Monthly auto-investment recommendations
- [ ] Automatic rebalancing suggestions
- [ ] Tax-loss harvesting alerts
- [ ] "Set and forget" mode for passive investors
- [ ] Performance comparison vs benchmark (NGX ASI)

**Rationale:** Cowrywise has Circles, PiggyVest has Investify. 9jastock can do this for stocks specifically.

---

#### 5.3 WhatsApp/Telegram Bot Integration
**Priority:** 🟢 Future
**Impact:** Medium | **Effort:** Medium | **Revenue Potential:** Low

**Features:**
- [ ] Price alerts via WhatsApp/Telegram
- [ ] Quick stock lookup commands
- [ ] Portfolio summary on demand
- [ ] Daily market digest
- [ ] Breaking news alerts
- [ ] Voice note summaries (using AI)

**Rationale:** Nigerians live on WhatsApp. This reduces friction dramatically.

---

#### 5.4 Fixed Income & Bond Tracker
**Priority:** 🟢 Future
**Impact:** Medium | **Effort:** Medium | **Revenue Potential:** Medium

**Features:**
- [ ] FGN Bond listings and yields
- [ ] Treasury bill rates and auction results
- [ ] Corporate bond listings
- [ ] State government bonds
- [ ] Savings bond tracker
- [ ] Fixed deposit rate comparisons (across banks)
- [ ] Bond ladder calculator
- [ ] Fixed income portfolio tracking

**Rationale:** Many conservative Nigerian investors prefer bonds. This captures that segment.

---

#### 5.5 REIT Hub
**Priority:** 🟢 Future
**Impact:** Low | **Effort:** Low | **Revenue Potential:** Low

**Features:**
- [ ] Dedicated REIT section
- [ ] Property portfolio breakdowns
- [ ] Rental yield analysis
- [ ] NAV (Net Asset Value) tracking
- [ ] REIT vs direct property comparison
- [ ] REIT dividend history

**Rationale:** REITs are underutilized in Nigeria. Education + tracking can drive adoption.

---

### Engagement & Monetization Features

#### Gamification & Rewards
- [ ] Investment streaks (consecutive days of app usage)
- [ ] Achievement badges
- [ ] Points for completing education modules
- [ ] Referral leaderboards
- [ ] Monthly investment challenges

#### Premium Research Reports
- [ ] Weekly/monthly stock analysis reports
- [ ] Sector deep dives
- [ ] Company valuation models
- [ ] PDF downloadable reports
- [ ] Analyst price targets

#### Expert Webinars & Live Sessions
- [ ] Monthly market outlook webinars
- [ ] Guest expert sessions (fund managers, analysts)
- [ ] Q&A sessions
- [ ] Recording library

#### Family/Team Accounts
- [ ] Add family members to account
- [ ] Shared portfolio view
- [ ] Individual sub-portfolios
- [ ] Family goal setting

---

## Competitive Landscape

| Competitor | Their Strength | 9jastock Advantage |
|------------|----------------|-------------------|
| **Bamboo/Chaka/Rise** | Foreign stocks | Add foreign tracking + NGX = unified view |
| **Cowrywise/PiggyVest** | Savings & goals | Stock-specific goal planning |
| **Meristem/CSL Apps** | Trading | Better UX + analytics |
| **Bloomberg/Investing.com** | Global data | Nigeria-specific context |
| **Yahoo Finance** | Data depth | Local relevance + AI insights |

---

## Key Metrics to Track

### User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention (Day 1, Day 7, Day 30)
- Premium conversion rate
- Referral rate

### Engagement Metrics
- Stocks viewed per session
- Portfolio update frequency
- Alert creation rate
- News article reads
- Time in app

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate

---

## Quick Wins Checklist

These can be implemented rapidly for immediate impact:

- [ ] Add dividend yield column to stock tables
- [ ] Show 52-week high/low proximity indicator
- [ ] "Add to Calendar" for corporate events
- [ ] Share portfolio as image for social media
- [ ] Basic 2-stock comparison tool
- [ ] Display CBN policy rate on market page
- [ ] "New to investing?" beginner mode toggle
- [ ] Improve loading states and skeleton screens
- [ ] Add haptic feedback on mobile
- [ ] Optimize images and lazy loading

---

## Technical Debt & Improvements

- [ ] Implement comprehensive error boundaries
- [ ] Add end-to-end testing (Playwright/Cypress)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Optimize database queries
- [ ] Implement Redis caching layer
- [ ] Add rate limiting for API routes
- [ ] Improve SEO meta tags
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation

---

## Revenue Model

### Current
- Premium subscriptions (Monthly/Yearly via Stripe)

### Future Opportunities
1. **Affiliate partnerships** with stockbrokers
2. **Sponsored research** from listed companies
3. **Data licensing** to institutions
4. **White-label solutions** for banks/fintechs
5. **Premium API access** for developers
6. **Advertisement** (carefully curated financial products)

---

## Contact & Contribution

This roadmap is a living document. Features may be reprioritized based on:
- User feedback and requests
- Market conditions
- Technical feasibility
- Resource availability
- Partnership opportunities

---

*Built with ❤️ for Nigerian investors*
