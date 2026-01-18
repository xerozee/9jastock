import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | 9jaStock',
  description: 'Track your NGX stock holdings, monitor performance, and analyze your investment returns.',
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
