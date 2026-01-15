# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
A Next.js 16 application for tracking Nigerian Stock Exchange (NGX) stocks in real-time. The app displays market cap, stock prices, volume, and other financial metrics with live data from TradingView. **No authentication required** - the app is fully public and accessible to everyone.

## Current State
- **LIVE DATA ACTIVE**: Fetches real-time data from TradingView's scanner API
- Fetches ALL Nigerian stocks available on TradingView (145+ stocks)
- Dynamic stock list - automatically includes new listings from TradingView
- Market overview shows computed totals from live stock data
- Auto-refreshes every 5 minutes
- **Portfolio Tracking**: Browser localStorage-based portfolio (no login required)
- **Watchlist**: Browser localStorage-based watchlist
- **News & Blog**: Market news page with real scraped news from multiple sources
- **Automated News Scraping**: Hourly scraping from TradingView, Nairametrics, BusinessDay, Punch
- **AI Newsletter System**: GPT-4o-mini powered newsletter composition from scraped news
- **Email Dispatch**: Resend integration for automated newsletter delivery to subscribers

## Recent Changes (January 2026)
- **Removed Authentication**: App is now fully public with no login required
  - Removed Replit OIDC authentication
  - Removed all protected routes
  - All pages accessible without login
- **localStorage-based Portfolio**: Portfolio tracking now works without authentication
  - Add/remove stocks from portfolio via + button
  - Portfolio data stored in browser localStorage
  - Performance stats (avg change, gainers/losers count)
- **Modern Theme & Dark Mode**: Complete UI redesign with dark mode support
  - ThemeContext with localStorage persistence for user preference
  - Dark mode toggle button in header (moon/sun icon)
  - Gradient hero section with grid pattern overlay
  - Modern cards with colored icon badges
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
- `src/contexts/ThemeContext.tsx` - Dark mode context with localStorage persistence
- `src/components/Providers.tsx` - Client-side providers wrapper (Theme, Watchlist)
- `src/lib/tradingviewClient.ts` - TradingView WebSocket client using @mathieuc/tradingview
- `src/lib/stockData.ts` - Static stock data for 129 NGX stocks
- `src/lib/watchlistContext.tsx` - Browser localStorage-based watchlist management
- `src/lib/db.ts` - Drizzle ORM database connection
- `src/lib/schema.ts` - Database schema (news_articles, sent_newsletters, newsletter_subscribers)
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
- `src/app/portfolio/page.tsx` - Personal portfolio page (localStorage-based)
- `src/app/watchlist/page.tsx` - Watchlist page (localStorage-based)
- `src/app/blog/page.tsx` - Market news page with real scraped news
- `src/app/blog/[symbol]/page.tsx` - Individual stock news with annual reports

### Data Flow
1. Frontend calls `/api/stocks`
2. API checks if cache is empty or stale (>5 min)
3. If stale, fetches all NGX stocks from TradingView Scanner API in one call
4. Merges live data with static stock info (for sectors, PE, EPS, etc.)
5. Returns combined data with live prices and computed market metrics
6. Cache refreshes automatically every 5 minutes

### Portfolio Flow (localStorage)
1. User clicks "+" on a stock
2. Stock symbol added to localStorage portfolio array
3. My Portfolio page reads localStorage and fetches live data for those stocks
4. Performance stats calculated from live stock data

### News & Newsletter Flow
1. Scraper runs hourly via POST to `/api/news/scrape` (requires CRON_SECRET)
2. Fetches articles from TradingView, Nairametrics, BusinessDay, Punch
3. Articles stored in `news_articles` table (deduplicated by URL)
4. Blog page fetches news from `/api/news` endpoint
5. Daily newsletter: POST to `/api/newsletter/compose` uses GPT-4o-mini
6. Dispatch: POST to `/api/newsletter/dispatch` sends to all active subscribers via Resend

## Configuration
- **Port**: 5000 (required for Replit)
- **Database**: PostgreSQL via Neon (DATABASE_URL)
- **Environment Variables**:
  - `TRADINGVIEW_SESSION`: TradingView session ID for live data
  - `DATABASE_URL`: PostgreSQL connection string
  - `CRON_SECRET`: Secret for securing the scrape endpoint
  - `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key (managed by Replit AI Integrations)
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL (managed by Replit AI Integrations)
  - Resend integration configured via Replit connectors

## Deployment
- Configured for autoscale deployment
- Production command: `npm run build && npm start`
- Database migration: `npm run db:push`

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
- No authentication - app is publicly accessible
