import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Stocks | 9jaStock',
  description: 'Browse all 145+ stocks listed on the Nigerian Stock Exchange with real-time prices, filtering, and sorting.',
};

export default function StocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
