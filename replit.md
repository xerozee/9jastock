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
- **User Authentication**: Custom email/password authentication with bcrypt hashing, session-based login, "Remember Me" functionality, and Google OAuth integration.
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
- **Authentication**: Custom session-based authentication and OAuth using Replit Auth.
- **Data Management**: In-memory caching for news data with automatic background scraping. Stock data has a 5-minute cache TTL.

## External Dependencies
- **TradingView**: Source of live stock data via its scanner API and WebSocket client (`@mathieuc/tradingview`).
- **MongoDB Atlas**: Cloud-hosted NoSQL database for all persistent data.
- **Resend**: Email API for dispatching automated newsletters.
- **OpenAI (GPT-4o-mini)**: Used for AI-powered newsletter composition.
- **Replit Auth**: Integration for Google OAuth.
- **Nairametrics, BusinessDay, Punch**: News sources for web scraping.

## Recent Updates (January 2026)
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
- **Progressive Web App (PWA)**: Mobile-first app installation support
  - manifest.json with app metadata and PNG icons (72-512px)
  - Service worker for offline support and caching
  - iOS/Android "Add to Home Screen" compatible
  - Offline fallback page when no connection
  - Icon generation script at scripts/generate-icons.js