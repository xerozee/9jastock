# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
A Next.js 16 application for tracking Nigerian Stock Exchange (NGX) stocks in real-time. The app displays market cap, stock prices, volume, and other financial metrics with live data from TradingView.

## Current State
- **LIVE DATA ACTIVE**: Fetches real-time data from TradingView's scanner API
- Successfully scrapes 145 Nigerian stocks from TradingView
- Market overview shows computed totals from live stock data
- Auto-refreshes every 5 minutes
- **User Authentication**: Replit OIDC authentication with session management

## Recent Changes (January 2026)
- Added user authentication via Replit OpenID Connect
  - Login/logout via Replit accounts (supports Google, GitHub, Apple, email)
  - Session management with PostgreSQL
  - User profile display in header
- Implemented TradingView Scanner API for bulk data fetching
- Expanded to 76 comprehensive data fields for in-depth stock analysis
- **Technical Indicators**: RSI (14-day, 7-day), MACD (line, signal, histogram), SMA/EMA (20, 50, 200), Bollinger Bands, Stochastic K/D, ATR, ADX, CCI, Williams %R
- **Fundamental Data**: P/E ratio, EPS, dividend yield, P/B ratio, P/S ratio, ROE, ROA
- **Financial Metrics**: Revenue, Net Income, EBITDA, Total Assets, Total Debt, Debt-to-Equity, Current Ratio, Quick Ratio
- **Performance**: Week, Month, 3M, 6M, YTD, 1Y, 5Y, All-time returns
- **Volume Analysis**: 10d/30d/90d averages, relative volume
- **Recommendations**: TradingView buy/sell/neutral signals
- **Volatility**: Weekly and monthly volatility metrics
- 5-minute cache TTL with automatic refresh

## Project Architecture

### Key Files
- `src/lib/tradingviewClient.ts` - TradingView WebSocket client using @mathieuc/tradingview
- `src/lib/stockData.ts` - Static stock data for 129 NGX stocks
- `src/lib/auth.ts` - Replit OIDC authentication logic
- `src/lib/db.ts` - Drizzle ORM database connection
- `src/lib/schema.ts` - Database schema (users, sessions)
- `src/app/api/stocks/route.ts` - API endpoint returning stocks (cached + live)
- `src/app/api/stocks/[symbol]/route.ts` - Individual stock API
- `src/app/api/auth/*/route.ts` - Authentication API routes
- `src/app/page.tsx` - Dashboard with market overview
- `src/app/stocks/page.tsx` - All stocks listing with filters
- `src/hooks/useAuth.ts` - React hook for authentication state

### Data Flow
1. Frontend calls `/api/stocks`
2. API checks if cache is empty or stale (>5 min)
3. If stale, fetches all NGX stocks from TradingView Scanner API in one call
4. Merges live data with static stock info (for sectors, PE, EPS, etc.)
5. Returns combined data with live prices and computed market metrics
6. Cache refreshes automatically every 5 minutes

### Authentication Flow
1. User clicks "Sign In" → redirects to `/api/auth/login`
2. Login route generates state token, redirects to Replit OIDC
3. User authenticates via Replit (Google/GitHub/Apple/email)
4. Callback route validates state, creates session in PostgreSQL
5. Session cookie set, user redirected to home
6. Logout clears session and redirects to Replit logout

## Configuration
- **Port**: 5000 (required for Replit)
- **Database**: PostgreSQL via Neon (DATABASE_URL)
- **Environment Variables**:
  - `TRADINGVIEW_SESSION`: TradingView session ID for live data
  - `DATABASE_URL`: PostgreSQL connection string
  - `REPL_ID`: Replit project ID (auto-set)

## Deployment
- Configured for autoscale deployment
- Production command: `npm run build && npm start`
- Database migration: `npm run db:push`

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
