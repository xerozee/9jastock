# 9jaStock - Nigerian Stock Exchange (NGX) Tracker

## Overview
A Next.js 16 application for tracking Nigerian Stock Exchange (NGX) stocks in real-time. The app displays market cap, stock prices, volume, and other financial metrics with live data from TradingView.

## Current State
- **LIVE DATA ACTIVE**: Fetches real-time data from TradingView's scanner API
- Successfully scrapes 145 Nigerian stocks from TradingView
- Market overview shows computed totals from live stock data
- Auto-refreshes every 5 minutes

## Recent Changes (January 2026)
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
- Removed duplicate stock entries (JAPAULGOLD, LIVESTOCK)

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
2. API checks if cache is empty or stale (>5 min)
3. If stale, fetches all NGX stocks from TradingView Scanner API in one call
4. Merges live data with static stock info (for sectors, PE, EPS, etc.)
5. Returns combined data with live prices and computed market metrics
6. Cache refreshes automatically every 5 minutes

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
