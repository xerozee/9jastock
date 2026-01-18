import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market News | 9jaStock',
  description: 'Stay informed with the latest Nigerian stock market news, analysis, and corporate updates.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
