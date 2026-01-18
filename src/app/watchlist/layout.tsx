import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist | 9jaStock',
  description: 'Track your favorite Nigerian stocks with real-time price updates and market data.',
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
