import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | 9jaStock',
  description: 'Manage your 9jaStock profile, subscription, and preferences.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
