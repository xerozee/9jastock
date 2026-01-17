# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
9jaStock is a Next.js application designed to track Nigerian Stock Exchange (NGX) stocks in real-time. It provides live market data, stock prices, volume, and various financial metrics sourced from TradingView. The platform features custom email/password and Google OAuth authentication, allowing users to track their portfolios, manage watchlists, and access market news. The project aims to provide a comprehensive and intuitive platform for Nigerian stock market participants, leveraging modern web technologies and AI-powered features for an enhanced user experience.

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
- Authentication via email/password and Google OAuth
- MongoDB preferred over PostgreSQL

## System Architecture
The application is built with Next.js 16, featuring a modern 3D UI redesign with a sci-fi aesthetic, glassmorphism, and interactive elements. It includes a premium landing page with animated effects for unauthenticated users.

**Key Features:**
- **Live Data**: Fetches and displays real-time stock data for over 145 NGX stocks from TradingView's scanner API, with background auto-refresh every 5 minutes.
- **User Authentication**: NextAuth.js-based authentication with Google OAuth, Apple Sign-In, and email/password credentials. JWT session strategy with MongoDB user storage.
- **User Profile & Onboarding**: Comprehensive profile management and a 5-step onboarding questionnaire for new users to define investment goals and preferences.
- **Portfolio Tracking**: MongoDB-backed portfolio system allowing authenticated users to track individual stock purchases, view grouped holdings, and analyze performance. Includes a portfolio sharing feature.
- **Watchlist**: Browser localStorage-based watchlist for quick access to preferred stocks.
- **News & Blog**: Market news page with real-time scraped articles from multiple Nigerian financial sources (TradingView, Nairametrics, BusinessDay, Punch), updated every 10 minutes.
- **AI Newsletter System**: GPT-4o-mini-powered system for composing newsletters from scraped news, with automated delivery via Resend.
- **Tiered Access Control**: Differentiates features and data refresh rates for guest users versus authenticated users.
- **Theming**: Supports dark mode with theme persistence via localStorage.
- **Technical & Fundamental Data**: Displays various technical indicators (RSI, MACD, Bollinger Bands, etc.) and fundamental data (P/E ratio, EPS, dividend yield, etc.).

**Technical Implementations:**
- **Frontend**: Next.js 16, React, custom UI components with modern design principles (glassmorphism, 3D effects, animations).
- **Backend**: Next.js API Routes for data fetching, authentication, and CRUD operations.
- **Database**: MongoDB Atlas for user data, portfolio, holdings, news articles, and newsletter subscriptions. Mongoose is used for ODM.
- **Authentication**: NextAuth.js with Google OAuth, Apple Sign-In, and email/password credentials. JWT sessions with 7-day expiry.
- **Data Management**: In-memory caching for news data with automatic background scraping. Stock data has a 5-minute cache TTL.

## External Dependencies
- **TradingView**: Source of live stock data via its scanner API and WebSocket client (`@mathieuc/tradingview`).
- **MongoDB Atlas**: Cloud-hosted NoSQL database for all persistent data.
- **Resend**: Email API for dispatching automated newsletters.
- **OpenAI (GPT-4o-mini)**: Used for AI-powered newsletter composition.
- **NextAuth.js**: Authentication framework for Google OAuth, Apple Sign-In, and credentials.
- **Nairametrics, BusinessDay, Punch**: News sources for web scraping.

## Recent Updates (January 2026)
- **TradingView-First Stock Profile Page**: TradingView as primary data source
  - TradingView scanner fetches 79 data fields per stock including company metadata
  - Company Overview shows TradingView data first: sector, industry, country, exchange, currency, type
  - Income Statement (TTM): Revenue, Gross Profit, Operating Income, Net Income, EBITDA, EPS, margins
  - Balance Sheet: Total Assets, Total Debt, Cash, Debt/Equity, Current Ratio, Quick Ratio
  - Valuation: Market Cap, Enterprise Value, P/E, P/B, P/S, EV/EBITDA, EV/Revenue, PEG Ratio
  - Cash Flow section with operating, investing, financing breakdowns
  - Profitability: ROE, ROA, Return on Capital, Gross/Operating/Net Margins
  - Yahoo Finance serves as secondary/fallback source for analyst ratings, earnings, institutional holdings
  - API endpoint at /api/stocks/[symbol]/yahoo with 10-minute caching
  - All financial sections labeled "Data sourced from TradingView" where applicable
- **Live TradingView Candlestick Chart**: Interactive chart integration
  - Replaced static chart with TradingView embedded widget
  - Uses NSENG: symbol format for Nigerian stocks
  - Dark mode support with theme switching
  - RSI and MACD indicators built-in
- **Market Buzz Social Feed with AI Crawler**: Real-time social media aggregation
  - Custom crawler scrapes TradingView community, Twitter/X (via Nitter), Reddit, and Nigerian news
  - **NEW: Official X/Twitter API integration** - Uses Bearer Token for authenticated API access
  - Searches X for Nigerian stock symbols, company names, and stock-related accounts
  - Fetches real-time tweets with metrics (likes, replies, retweets, quotes)
  - OpenAI GPT-4o-mini sentiment analysis for each post (bullish/bearish/neutral/mixed)
  - MongoDB storage with SocialPost schema for persistence
  - Filter by platform (All, Reddit, TradingView, X, News)
  - Stock mention detection with automatic symbol extraction
  - Sentiment badges on each post showing AI analysis
  - Rate-limited crawler endpoint with authentication required
  - **NEW: Watchlist-specific X posts** - GET /api/social/watchlist?symbols=GTCO,DANGCEM
  - API endpoints: GET /api/social (feed), POST /api/social/crawl (trigger crawl)
  - Nigerian finance Twitter accounts monitored: @NGXGroup, @SECNigeria, @Nairametrics, @CardinalStone, etc.
  - X Crawler service in src/lib/xTwitterCrawler.ts with official Twitter API v2
  - **NEW: 72-hour search window** - Crawler searches last 72 hours of X posts using start_time parameter
  - **NEW: Company account filtering** - Excludes posts from official company accounts (e.g., @dangotegroup, @mtnnigeria)
  - **NEW: Finance keyword requirement** - Only includes posts that contain stock/finance-related keywords
  - FINANCE_KEYWORDS list: stock, share, invest, dividend, earnings, profit, market, trading, NGX, etc.
  - COMPANY_OFFICIAL_ACCOUNTS map links stock symbols to their known X/Twitter handles
  - **NEW: All-user symbol coverage** - Crawls symbols from ALL users' portfolios and watchlists
  - getAllUserSymbols() aggregates unique symbols from PortfolioItem and Holding collections
  - **NEW: Full 129+ stock coverage** - Uses ALL stocks from stockData.ts (not hardcoded subset)
  - STOCK_NAME_MAP dynamically generated from nigerianStocks for company name matching
  - Combines user-tracked symbols with ALL NGX stock symbols for comprehensive coverage
  - **NEW: Auto-refresh** - MarketBuzzX and ProfileXPosts auto-refresh every 2 minutes
  - "Last updated" timestamp shown in Market Buzz header

- **Stock Recommendations Engine**: AI-powered stock suggestions based on user profile
  - Recommendations API at /api/recommendations
  - Matches stocks based on user's investment goals, risk tolerance, and interested sectors
  - Suggests dividend stocks for passive income seekers, blue-chip for beginners, growth stocks for aggressive investors
- **Auto-generated Profile Pictures**: Avatar component with initials and consistent colors
  - Generates colorful avatar based on user's name or email
  - Hash-based color assignment for consistency
- **Cleaned Up Dashboard**: Simplified authenticated user experience
  - Removed banner/hero section, hidden refresh button and stock count
  - Clean "Market Overview" header with live status badge
  - Background auto-refresh (5 minutes for authenticated users)
- **Profile Page Improvements**: 
  - Portfolio summary reflects actual holdings from database
  - Replaced news section with personalized stock recommendations
  - Added Avatar component for auto-generated profile pictures
  - **NEW: "News from X" section** - Shows last 6 X posts related to user's watchlist and portfolio stocks
  - Uses ProfileXPosts component with symbol normalization and stable fetch dependencies
- **Market Overview Page Updates**:
  - **NEW: "Market Buzz" section** - Shows last 6 X posts related to user's stocks
  - Fetches user's holdings, portfolioItems, and watchlist symbols
  - Falls back to general Nigerian stock market tweets if no user stocks
  - MarketBuzzX component with authenticated API calls and robust symbol extraction
- **Progressive Web App (PWA)**: Mobile-first app installation support
  - manifest.json with app metadata and PNG icons (72-512px)
  - Service worker for offline support and caching
  - iOS/Android "Add to Home Screen" compatible
  - Offline fallback page when no connection
  - Icon generation script at scripts/generate-icons.js
- **Market Hours & Countdown**: Live trading session indicator
  - Shows NGX trading hours (10:00 AM - 2:30 PM WAT)
  - "Market Open" status with countdown to market close
  - "Market Closed" status with countdown to market open
  - Weekend detection with next trading day countdown
  - Real-time updates every second
- **Enhanced 3D UI/UX**: Mobile-first responsive design with animations
  - 3D animated logo with CSS transforms and hover effects
  - Mobile-first animations (slide, fade, scale, shimmer)
  - Touch-friendly card interactions
  - Safe area padding for notched devices
  - Reduced motion support for accessibility
  - Glassmorphism enhanced effects
- **AI-Powered Stock Analysis**: OpenAI integration for intelligent recommendations
  - Personalized stock recommendations using GPT-4o-mini
  - Individual stock analysis at /api/stocks/[symbol]/analysis
  - Considers user's investment goals, risk tolerance, experience level
  - Falls back to rule-based recommendations if AI unavailable
  - Uses Replit AI Integrations (no separate API key needed)
- **Stripe Subscription System**: Premium tier monetization
  - Free tier: 5-minute data refresh, 10 portfolio stocks
  - Premium tier: ₦2,999/month or ₦24,999/year (17% savings)
  - 1-minute real-time data, unlimited portfolio, AI recommendations
  - Stripe Checkout for payments, Customer Portal for management
  - Webhook handler with signature verification for security
  - User model tracks: stripeCustomerId, subscriptionStatus, subscriptionId, subscriptionPriceId, subscriptionCurrentPeriodEnd
  - Required secret: STRIPE_WEBHOOK_SECRET for webhook verification
- **Push Notification System**: Web Push API with VAPID authentication
  - NotificationSettings component on profile page with Enable/Disable toggle
  - 4 notification preference toggles: Price Alerts, Daily Summary, Breaking News, Watchlist Updates
  - PriceAlertManager component for user-defined price targets (max 10 active alerts)
  - Alerts trigger when stock price goes above or below target
  - MongoDB schemas: PushSubscription (user subscriptions), PriceAlert (price targets)
  - API endpoints: /api/notifications/subscribe, /api/notifications/preferences, /api/price-alerts
  - Service worker at /sw.js handles push events and notification clicks
  - Uses web-push npm package with VAPID keys (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  - Preference-aware filtering: notifications respect user's toggle settings
  - Auto-cleanup of invalid/expired push subscriptions (404/410 responses)