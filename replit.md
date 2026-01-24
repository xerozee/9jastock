# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
9jaStock is a Next.js application designed to track Nigerian Stock Exchange (NGX) stocks in real-time. It provides live market data, stock prices, volume, and various financial metrics sourced primarily from TradingView. The platform features custom email/password and Google OAuth authentication, enabling users to track portfolios, manage watchlists, and access market news. The project aims to be a comprehensive, intuitive, and AI-powered platform for Nigerian stock market participants, enhancing user experience with modern web technologies and advanced analytical tools.

**Business Model: Premium-Only Subscription**
The platform operates as a premium-only service (no free tier) given its unique value proposition and lack of competitors in the Nigerian market. This includes AI-powered Buy/Sell/Hold recommendations, portfolio tracking with real-time returns, price alerts, and comprehensive market analysis.

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
- Authentication via email/password and Google OAuth
- MongoDB preferred over PostgreSQL

## System Architecture
The application is built with Next.js 16, featuring a modern 3D UI redesign with a sci-fi aesthetic, glassmorphism, and interactive elements, including a premium landing page with animated effects.

**UI/UX Decisions:**
- **Design:** Modern 3D UI, sci-fi aesthetic, glassmorphism, interactive elements, mobile-first responsive design.
- **Homepage (Jan 2026 Simplification):** Streamlined landing page focused on value creation - "Invest in Nigeria with Confidence" tagline, 3 core features (real-time data, AI recommendations, portfolio tracking), minimal "What's Coming" teaser without dates, prominent pricing section.
- **Theming:** Dark mode as default with persistence via localStorage. Inline script prevents flash of wrong theme on initial load. Theme toggle available in UI.
- **PWA:** Progressive Web App support ready for mobile app store deployment:
  - Full icon set in `public/icons/` (72-512px + maskable variants)
  - Complete manifest.json with shortcuts, screenshots, categories
  - Service worker with offline caching and push notification support
  - Mobile UX CSS fixes (safe areas, input zoom prevention, touch handling)
  - Device-specific installation prompts
  - Ready for PWABuilder Android/iOS wrapping
- **Market Hours:** Live indicator for NGX trading hours with countdowns.
- **Launch Polish (Jan 2026):**
  - **Loading States:** Skeleton components (8 variants) for stocks, portfolio, news, watchlist with animated placeholders
  - **Empty States:** Contextual empty state components for all major features
  - **Error Handling:** ErrorBoundary with retry, ApiErrorFallback, graceful degradation
  - **Offline Support:** OfflineBanner with reconnection detection, useOnlineStatus hook
  - **Mobile UX:** Pull-to-refresh on data-heavy pages (usePullToRefresh hook)
  - **Performance:** Lazy-loaded TradingView chart with Suspense and ChartSkeleton fallback
  - **SEO:** Page metadata via layout.tsx files for all routes

**Technical Implementations:**
- **Frontend:** Next.js 16, React, custom UI components with modern design principles.
- **Backend:** Next.js API Routes for data fetching, authentication, and CRUD operations.
- **Database:** MongoDB Atlas for user data, portfolio, holdings, news articles, and newsletter subscriptions, utilizing Mongoose for ODM.
- **Authentication:** NextAuth.js with Google OAuth, Apple Sign-In, and email/password credentials, using JWT sessions.
- **Data Management:** Real-time stock data fetching from TradingView with 5-minute auto-refresh. In-memory caching for news data with background scraping.
- **User Features:**
    - **Live Data:** Fetches and displays real-time stock data for over 145 NGX stocks.
    - **Authentication & Profile:** Comprehensive profile management, 5-step onboarding, and secure authentication.
    - **Portfolio Tracking:** MongoDB-backed system for tracking stock purchases, performance, and sharing.
    - **Watchlist:** Browser localStorage-based watchlist.
    - **News & Blog:** Scraped market news from multiple Nigerian sources, updated every 10 minutes.
    - **AI Newsletter System:** GPT-4o-mini-powered newsletter generation and automated delivery.
    - **Market Buzz Social Feed:** Real-time social media aggregation (TradingView, X/Twitter, Reddit) with AI sentiment analysis for Nigerian stocks. Includes official X/Twitter API integration.
    - **Stock Recommendations Engine:** AI-powered suggestions based on user profile and investment goals.
    - **Freemium Gating System:** Users can sign up without payment and browse the app with limited access.
      - **Free User Experience (Authenticated but not subscribed):**
        - **Visible (unblurred):** Market Hours, Market Overview (market cap, volume, advancers/decliners, indices, market breadth)
        - **Blurred with subscribe prompt:** Top Gainers, Top Losers, Most Active, X Market Buzz
        - **Profile access:** Referral section, investment profile, notifications work
        - **Component:** `BlurredPremiumContent.tsx` wraps premium sections with blur overlay and upgrade CTA. Uses `statusResolved` flag from `useSubscription` hook to prevent content flash during auth loading.
        - **Profile Page:** X Market Insights section is gated with BlurredPremiumContent
      - **Tier Limits (src/lib/subscription.ts):**
        - Guest: Limited preview only (5 stocks visible, no portfolio/watchlist, blurred premium sections)
        - Premium: Full access - 1min refresh, unlimited portfolio, unlimited watchlist, all features
      - **Premium Features:** All 145+ stocks, AI Buy/Sell/Hold recommendations, portfolio tracking with live P&L, X/Twitter market buzz with sentiment analysis, price alerts, push notifications, 30-day news archive, advanced technical analysis, AI morning newsletter
    - **Push Notifications:** Web Push API with VAPID authentication for price alerts, daily summaries, and breaking news.
    - **Stripe Subscription System:** Integration for managing free and premium tiers, including Stripe Checkout and webhook handling.
    - **Premium Visual Theme:** Gold/amber neon theme for premium users with glow effects, shimmer animations, and distinctive branding. Uses PremiumThemeContext and PremiumWrapper components (`src/contexts/PremiumThemeContext.tsx`, `src/components/PremiumWrapper.tsx`, `src/styles/premium.css`).
    - **Referral System:** Database-backed referral tracking with Referral, ReferralReward, and ReferralStats schemas in MongoDB. Tracks referrer/referred relationships, conversion status, and prepares for future reward implementation (bronze/silver/gold/platinum tiers). API endpoints at `/api/referral/stats` and `/api/referral/apply`.
    - **In-Depth Financial Analysis (Jan 2026):** Comprehensive stock analysis tools for institutional-grade investors:
      - **TradingView Technical Analysis Widget:** Embedded widget showing oscillators, moving averages, and Buy/Sell/Neutral summary (`src/components/TradingViewTechnicalAnalysis.tsx`)
      - **TradingView Financials Widget:** Embedded widget displaying revenue, earnings, balance sheet, and cash flow data (`src/components/TradingViewFinancials.tsx`)
      - **Technical Analysis Summary:** Custom gauge component showing aggregated technical signals with oscillator and MA breakdown (`src/components/TechnicalAnalysisSummary.tsx`)
      - **Company Profile Database:** MongoDB schema for curated company data including CEO, employees, headquarters, board of directors, subsidiaries, key products (`src/lib/mongodb.ts` - CompanyProfile schema)
      - **Dividend History Tracking:** MongoDB schema for historical dividend data with fiscal year tracking, declaration dates, payment dates, and yield calculations (`src/lib/mongodb.ts` - DividendHistory schema)
      - **API Endpoints:** `/api/company-profile` (GET/POST with admin auth), `/api/dividends` (GET/POST with admin auth) for managing company and dividend data
    - **African Financials Integration (Jan 2026):** Financial document system with scraping infrastructure:
      - **Scraper Service:** `src/lib/africanFinancialsScraper.ts` - Designed to fetch and parse documents, extracts key metrics (revenue, PAT, EPS) from summaries
      - **MongoDB Schema:** FinancialDocument and FinancialDocSync in `src/lib/mongodb.ts` for storing documents with sync progress tracking
      - **API Endpoints:** `/api/financial-documents` (GET with symbol, type, year filters), `/api/financial-documents/sync` (GET status, POST trigger), `/api/financial-documents/sync/runner` (incremental sync)
      - **UI Component:** `src/components/FinancialDocuments.tsx` - Displays documents with filtering, metrics badges, and links to full reports
      - **LIMITATION:** African Financials website uses Cloudflare protection that blocks automated scraping. Manual data entry or alternative data sources may be required. TradingView widgets provide real-time fundamental data as an alternative.

## External Dependencies
- **Stock Data API:** Live stock data via backend services (presented as 9jaStocks.app data).
- **MongoDB Atlas:** Cloud-hosted NoSQL database.
- **Resend:** Email API for automated newsletters.
- **OpenAI (GPT-4o-mini):** Used for AI-powered newsletter composition, sentiment analysis, and stock recommendations.
- **NextAuth.js:** Authentication framework for Google OAuth, Apple Sign-In, and credentials.
- **Nairametrics, BusinessDay, Punch:** News sources for web scraping.
- **Stripe:** Payment processing for subscriptions (Checkout, Customer Portal, Webhooks).
- **X (formerly Twitter) API v2:** For real-time social media aggregation.
- **web-push:** npm package for handling push notifications.
- **African Financials:** Source for Nigerian company financial documents (annual reports, interim reports, presentations).