# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
A Next.js 16 application for tracking Nigerian Stock Exchange (NGX) stocks in real-time. The app displays market cap, stock prices, volume, and other financial metrics with live data from TradingView. **Custom email/password authentication** with secure session-based login.

## Current State
- **LIVE DATA ACTIVE**: Fetches real-time data from TradingView's scanner API
- Fetches ALL Nigerian stocks available on TradingView (145+ stocks)
- Dynamic stock list - automatically includes new listings from TradingView
- Market overview shows computed totals from live stock data
- Auto-refreshes every 5 minutes (background refresh without loading states)
- **User Authentication**: Custom email/password authentication with bcrypt password hashing
- **Portfolio Tracking**: MongoDB-backed portfolio for authenticated users
- **Watchlist**: Browser localStorage-based watchlist
- **News & Blog**: Market news page with real scraped news from multiple sources
- **Automated News Scraping**: Hourly scraping from TradingView, Nairametrics, BusinessDay, Punch
- **AI Newsletter System**: GPT-4o-mini powered newsletter composition from scraped news
- **Email Dispatch**: Resend integration for automated newsletter delivery to subscribers
- **Database**: MongoDB Atlas (migrated from PostgreSQL)

## Recent Changes (January 2026)
- **MongoDB Migration**: Migrated from PostgreSQL/Drizzle to MongoDB Atlas/Mongoose
  - All data models converted to MongoDB schemas
  - Connection pooling with global caching for serverless
  - TTL indexes for automatic session expiration
- **Background Data Refresh**: Data refreshes silently without loading indicators
  - Initial load shows loading skeleton
  - Auto-refresh and manual refresh happen in background
  - New `isRefreshing` state for subtle refresh indicators
- **Landing Page**: Premium landing page with strong brand identity
  - Custom SVG logo with chart lines, gradient colors, and live indicator
  - Dark hero section with animated glow effects and gradient overlays
  - Interactive stock ticker preview showing real NGX stocks
  - Floating notification badges with bounce animations
  - Scrolling ticker bar with live stock prices
  - Feature cards with hover effects and gradient icons
  - Stats grid with emoji icons (145+ stocks, 5min refresh, 10+ indicators, 24/7)
  - Benefits section with card-style checkmarks
  - Full-width gradient CTA section
  - Professional footer with logo
- **Tiered Access Control**: Different access levels for guests vs authenticated users
  - **Guest users (not signed in)**:
    - Dashboard: Full access with 6-hour data refresh
    - News: Limited to 5 articles, no filtering, 6-hour refresh
    - Stocks, Portfolio, Watchlist: Requires sign-in
  - **Authenticated users**:
    - Dashboard: Full access with 5-minute data refresh
    - News: Full access with source filtering, 10-minute refresh
    - All features: Portfolio tracking, watchlist, detailed stock views
  - Prominent banners on Dashboard and News prompting guests to sign in for full access
- **Live News System**: Real-time news data with 10-minute auto-refresh
  - News API with in-memory caching for fast responses (2-min cache)
  - Background news scraping triggered automatically every 10 minutes
  - Live status indicator showing connection status and last update time
  - Stats display showing articles from last 24 hours and total count
  - Sources: TradingView, BusinessDay, Punch
- **Custom Email/Password Authentication**: Secure authentication system
  - Custom signup page at /signup with email, password, and name fields
  - Custom login page at /login with email and password
  - **Google Sign-In**: Alternative OAuth login via Replit Auth integration
  - Passwords hashed with bcrypt (cost factor 12)
  - Session-based authentication with 7-day expiry
  - Session expiration enforced on each request
  - Login/Logout/Signup buttons in header
  - Modern split-screen design on login/signup pages
- **Database-backed Portfolio & Holdings Tracker**: Portfolio tracking for authenticated users
  - Holdings collection for tracking individual stock purchases with shares, price, and date
  - POST /api/holdings to add stock positions with purchase details
  - GET /api/holdings to list user's holdings with all transaction history
  - DELETE /api/holdings?id={id} to remove individual transactions
  - Grouped view showing total shares, avg cost basis, current value, and gain/loss per stock
  - Expandable transaction history for each stock position
  - Portfolio summary with total value, total gain/loss, cost basis, and position count
  - **Portfolio Sharing**: Share your portfolio with anyone via unique URL
    - Share button generates a unique shareable link
    - Public portfolio page shows holdings and performance
    - Copy-to-clipboard functionality for easy sharing
- **Modern Theme & Dark Mode**: Complete UI redesign with dark mode support
  - ThemeContext with localStorage persistence for user preference
  - Dark mode toggle button in header (moon/sun icon)
  - Gradient hero sections with grid pattern overlay on all pages
  - Modern cards with rounded-2xl corners and colored icon badges
  - Consistent design language across all pages:
    - Stocks page: Green/emerald gradient header
    - Portfolio page: Purple/indigo gradient header
    - Watchlist page: Amber/orange gradient header
    - News page: Clean card-based layout with source badges
  - Hover effects and smooth transitions throughout
  - Shadow effects and backdrop blur for modals
- **News/Blog Feature**: Comprehensive market news page
  - Main blog page with news from NGX Official, BusinessDay, Nairametrics, ThisDay, Punch
  - Filterable news by source with tab navigation
  - Top 10 performing stocks sidebar with live data
- **Technical Indicators**: RSI, MACD, Bollinger Bands, SMA/EMA, Stochastic K/D, ATR, ADX, CCI, Williams %R
- **Fundamental Data**: P/E ratio, EPS, dividend yield, P/B ratio, P/S ratio, ROE, ROA
- **Financial Metrics**: Revenue, Net Income, EBITDA, Total Assets, Total Debt, Debt-to-Equity, Current Ratio, Quick Ratio
- **Performance**: Week, Month, 3M, 6M, YTD, 1Y, 5Y, All-time returns
- **Volume Analysis**: 10d/30d/90d averages, relative volume
- **Recommendations**: TradingView buy/sell/neutral signals
- 5-minute cache TTL with automatic refresh

## Project Architecture

### Key Files
- `src/components/LandingPage.tsx` - Beautiful landing page for unauthenticated users
- `src/components/AuthGuard.tsx` - Route protection component with sign-in prompts
- `src/lib/mongodb.ts` - MongoDB connection and Mongoose models
- `src/lib/auth.ts` - Replit Auth OIDC configuration and session management
- `src/hooks/useAuth.ts` - React hook for authentication state
- `src/lib/useLiveStocks.ts` - Hook for live stock data with background refresh
- `src/app/api/auth/login/route.ts` - OAuth login redirect
- `src/app/api/auth/callback/route.ts` - OAuth callback handler
- `src/app/api/auth/logout/route.ts` - Logout and session cleanup
- `src/app/api/auth/user/route.ts` - Get current user info
- `src/app/api/auth/signin/route.ts` - Email/password sign in
- `src/app/api/auth/signup/route.ts` - Email/password sign up
- `src/app/api/portfolio/route.ts` - Portfolio CRUD API
- `src/app/api/holdings/route.ts` - Holdings CRUD API
- `src/contexts/ThemeContext.tsx` - Dark mode context with localStorage persistence
- `src/components/Providers.tsx` - Client-side providers wrapper (Theme, Watchlist)
- `src/lib/tradingviewClient.ts` - TradingView WebSocket client using @mathieuc/tradingview
- `src/lib/stockData.ts` - Static stock data for 129 NGX stocks
- `src/lib/watchlistContext.tsx` - Browser localStorage-based watchlist management
- `src/lib/newsScraper.ts` - Web scraper for Nigerian stock news from multiple sources
- `src/lib/newsletterComposer.ts` - AI-powered newsletter composition using GPT-4o-mini
- `src/lib/resendClient.ts` - Resend email client for newsletter dispatch
- `src/app/api/stocks/route.ts` - API endpoint returning stocks (cached + live)
- `src/app/api/stocks/[symbol]/route.ts` - Individual stock API
- `src/app/api/news/route.ts` - API endpoint for scraped news articles
- `src/app/api/news/scrape/route.ts` - Trigger news scraping (call hourly via cron)
- `src/app/api/newsletter/compose/route.ts` - AI newsletter composition endpoint
- `src/app/api/newsletter/dispatch/route.ts` - Send newsletter to all subscribers
- `src/app/page.tsx` - Dashboard with market overview
- `src/app/stocks/page.tsx` - All stocks listing with live data and filters
- `src/app/portfolio/page.tsx` - Personal portfolio page (database-backed for auth users)
- `src/app/watchlist/page.tsx` - Watchlist page (localStorage-based)
- `src/app/blog/page.tsx` - Market news page with real scraped news
- `src/app/blog/[symbol]/page.tsx` - Individual stock news with annual reports

### MongoDB Collections
- `users` - User accounts (email, password hash, profile info, shareId)
- `sessions` - Login sessions with TTL index for auto-expiry
- `portfolioitems` - User portfolio items (userId, symbol)
- `holdings` - Stock holdings with purchase details (userId, symbol, shares, price, date)
- `newsarticles` - Scraped news articles
- `newslettersubscribers` - Email newsletter subscribers
- `sentnewsletters` - Newsletter history

### Data Flow
1. Frontend calls `/api/stocks`
2. API checks if cache is empty or stale (>5 min)
3. If stale, fetches all NGX stocks from TradingView Scanner API in one call
4. Merges live data with static stock info (for sectors, PE, EPS, etc.)
5. Returns combined data with live prices and computed market metrics
6. Cache refreshes automatically every 5 minutes

### Authentication Flow
1. User clicks "Login" or "Sign Up" button in header
2. Navigates to `/login` or `/signup` page
3. User enters email/password credentials
4. API validates credentials, hashes password with bcrypt
5. User saved to `users` collection, session created in `sessions` collection
6. Session cookie set for 7 days with httpOnly flag
7. Session expiration checked on each request (TTL index auto-deletes expired)
8. `useAuth` hook checks `/api/auth/user` for current session

### Portfolio Flow (MongoDB-backed)
1. Authenticated user clicks "+" on a stock
2. POST to /api/portfolio adds stock to `portfolioitems` collection
3. My Portfolio page fetches from /api/portfolio
4. Performance stats calculated from live stock data

### News & Newsletter Flow
1. Scraper runs hourly via POST to `/api/news/scrape` (requires CRON_SECRET)
2. Fetches articles from TradingView, Nairametrics, BusinessDay, Punch
3. Articles stored in `newsarticles` collection (deduplicated by URL)
4. Blog page fetches news from `/api/news` endpoint
5. Daily newsletter: POST to `/api/newsletter/compose` uses GPT-4o-mini
6. Dispatch: POST to `/api/newsletter/dispatch` sends to all active subscribers via Resend

## Configuration
- **Port**: 5000 (required for Replit)
- **Database**: MongoDB Atlas (MONGODB_URI)
- **Environment Variables**:
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `TRADINGVIEW_SESSION`: TradingView session ID for live data
  - `CRON_SECRET`: Secret for securing the scrape endpoint
  - `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key (managed by Replit AI Integrations)
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL (managed by Replit AI Integrations)
  - Resend integration configured via Replit connectors

## Deployment
- Configured for autoscale deployment
- Production command: `npm run build && npm start`
- No database migration needed - MongoDB is schemaless

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
- Authentication via email/password and Google OAuth
- MongoDB preferred over PostgreSQL
