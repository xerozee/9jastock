'use client';

import { Calendar, TrendingUp } from 'lucide-react';
import DividendsCalendar from '@/components/DividendsCalendar';
import AuthGuard from '@/components/AuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumGate from '@/components/PremiumGate';

export default function DividendsPage() {
  const { isPremium } = useSubscription();

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="text-emerald-500" size={28} />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Dividend Calendar
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Track upcoming dividend payments, qualification dates, and yields across all NGX stocks
            </p>
          </div>
        </div>

        {!isPremium ? (
          <PremiumGate
            title="Dividend Calendar"
            description="Upgrade to Premium to access the full dividend calendar with all upcoming payments, qualification dates, and e-dividend registration links."
            features={[
              "All upcoming dividend dates",
              "Qualification & payment tracking",
              "Dividend yield comparisons",
              "E-dividend registration links",
              "Historical dividend data",
              "Sort and filter tools"
            ]}
          />
        ) : (
          <DividendsCalendar />
        )}
      </div>
    </AuthGuard>
  );
}
