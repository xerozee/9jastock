import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '9jaStock - Nigeria\'s #1 AI-Powered Stock Market Platform',
  description: 'Real-time NGX data, AI-powered Buy/Sell recommendations, X/Twitter sentiment analysis, and portfolio tracking. The only platform built for Nigerian investors.',
  openGraph: {
    title: '9jaStock - Invest Smarter. Grow Faster.',
    description: 'Nigeria\'s #1 AI-powered stock market platform. Real-time data, AI recommendations, and social sentiment analysis.',
    type: 'website',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
