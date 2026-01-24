import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Reports & Analysis | 9jaStock',
  description: 'Access comprehensive financial reports, annual statements, dividend history, and in-depth analysis for Nigerian Stock Exchange companies.',
};

export default function FinancialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
