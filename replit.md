# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
A Next.js 16 application for tracking Nigerian Stock Exchange (NGX) stocks in real-time. The app displays market cap, stock prices, volume, and other financial metrics.

## Current State
- App is fully functional with static stock data
- TradingView integration configured for live data (runs in background, caches results)
- All duplicate stock entries fixed (JAPAULGOLD, LIVESTOCK)
- Market overview shows computed totals from stock data

## Recent Changes (January 2026)
- Fixed TradingView client to use proper `Session.Chart()` API pattern
- Optimized API to return static data immediately (non-blocking)
- TradingView live data fetches in background and caches results
- Removed duplicate stock entries causing React key warnings
- Limited live data fetching to top 20 stocks for performance

## Project Architecture

### Key Files
- `src/lib/tradingviewClient.ts` - TradingView WebSocket client using @mathieuc/tradingview
- `src/lib/stockData.ts` - Static stock data for 129 NGX stocks
- `src/app/api/stocks/route.ts` - API endpoint returning stocks (cached + live)
- `src/app/api/stocks/[symbol]/route.ts` - Individual stock API
- `src/app/page.tsx` - Dashboard with market overview
- `src/app/stocks/page.tsx` - All stocks listing with filters

### Data Flow
1. Frontend calls `/api/stocks`
2. API returns static data immediately with any cached live data
3. If TradingView session is configured and cache is stale (>5 min), triggers background refresh
4. Background refresh updates cache for top 20 stocks
5. Subsequent requests get cached live data, marked stale after 5 min TTL

## Configuration
- **Port**: 5000 (required for Replit)
- **Environment Variables**:
  - `TRADINGVIEW_SESSION`: TradingView session ID for live data

## Deployment
- Configured for autoscale deployment
- Production command: `npm run build && npm start`

## User Preferences
- Real-time data preferred over mock data
- Clean, responsive UI
