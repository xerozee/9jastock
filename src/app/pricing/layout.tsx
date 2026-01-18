import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Access | 9jaStock',
  description: 'Get premium access to Nigeria\'s only AI-powered stock tracker with real-time data, recommendations, and more.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
