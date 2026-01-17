# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
9jaStock is a Next.js application designed to track Nigerian Stock Exchange (NGX) stocks in real-time. It provides live market data, stock prices, volume, and various financial metrics sourced primarily from TradingView. The platform features custom email/password and Google OAuth authentication, enabling users to track portfolios, manage watchlists, and access market news. The project aims to be a comprehensive, intuitive, and AI-powered platform for Nigerian stock market participants, enhancing user experience with modern web technologies and advanced analytical tools. Key ambitions include providing personalized recommendations, real-time market buzz, and a PWA-enabled experience for mobile users, with a freemium model for monetization.

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
    - **Tiered Access Control:** Differentiates features and data refresh rates for guest, free, and premium users. Implemented with `useSubscription` hook and `PremiumGate` component.
      - **Tier Limits (src/lib/subscription.ts):**
        - Guest: 15min refresh, 0 portfolio, 3 watchlist, 20 visible stocks
        - Free: 5min refresh, 2 portfolio, 3 watchlist, 30 visible stocks
        - Premium: 1min refresh, unlimited everything
      - **Stock Detail Pages:** Free users see basic info (price, chart, company overview), premium-only sections gated (Technical Indicators, Financials, Valuation)
      - **Stocks List Page:** Limited preview for free users with upgrade banner
    - **Push Notifications:** Web Push API with VAPID authentication for price alerts, daily summaries, and breaking news.
    - **Stripe Subscription System:** Integration for managing free and premium tiers, including Stripe Checkout and webhook handling.

## External Dependencies
- **TradingView:** Primary source for live stock data via scanner API and WebSocket client (`@mathieuc/tradingview`).
- **MongoDB Atlas:** Cloud-hosted NoSQL database.
- **Resend:** Email API for automated newsletters.
- **OpenAI (GPT-4o-mini):** Used for AI-powered newsletter composition, sentiment analysis, and stock recommendations.
- **NextAuth.js:** Authentication framework for Google OAuth, Apple Sign-In, and credentials.
- **Nairametrics, BusinessDay, Punch:** News sources for web scraping.
- **Stripe:** Payment processing for subscriptions (Checkout, Customer Portal, Webhooks).
- **X (formerly Twitter) API v2:** For real-time social media aggregation.
- **web-push:** npm package for handling push notifications.