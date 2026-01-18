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
- **Theming:** Dark mode support with persistence via localStorage.
- **PWA:** Progressive Web App support with `manifest.json`, service worker for offline capabilities, and device-specific installation prompts.
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
    - **Premium-Only Access Control:** All features require premium subscription. No free tier.
      - **Tier Limits (src/lib/subscription.ts):**
        - Guest: Limited preview only (5 stocks visible, no portfolio/watchlist)
        - Premium: Full access - 1min refresh, unlimited portfolio, unlimited watchlist, all features
      - **Premium Features:** All 145+ stocks, AI Buy/Sell/Hold recommendations, portfolio tracking with live P&L, X/Twitter market buzz with sentiment analysis, price alerts, push notifications, 30-day news archive, advanced technical analysis, AI morning newsletter
    - **Push Notifications:** Web Push API with VAPID authentication for price alerts, daily summaries, and breaking news.
    - **Stripe Subscription System:** Integration for managing free and premium tiers, including Stripe Checkout and webhook handling.
    - **Premium Visual Theme:** Gold/amber neon theme for premium users with glow effects, shimmer animations, and distinctive branding. Uses PremiumThemeContext and PremiumWrapper components (`src/contexts/PremiumThemeContext.tsx`, `src/components/PremiumWrapper.tsx`, `src/styles/premium.css`).
    - **Referral System:** Database-backed referral tracking with Referral, ReferralReward, and ReferralStats schemas in MongoDB. Tracks referrer/referred relationships, conversion status, and prepares for future reward implementation (bronze/silver/gold/platinum tiers). API endpoints at `/api/referral/stats` and `/api/referral/apply`.

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