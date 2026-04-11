import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dividend Calendar - 9jaStock',
  description: 'Track upcoming NGX dividend payments, qualification dates, yields, and e-dividend registration links.',
};

export default function DividendsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
