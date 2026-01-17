'use client';

import Link from 'next/link';
import { Crown, Lock, Sparkles, TrendingUp, BarChart3, Target } from 'lucide-react';

interface PremiumGateProps {
  title?: string;
  description?: string;
  features?: string[];
  compact?: boolean;
}

export default function PremiumGate({ 
  title = "Premium Feature", 
  description = "Upgrade to Premium to unlock this feature",
  features = [],
  compact = false
}: PremiumGateProps) {
  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg shadow-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl shadow-xl mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
        
        {features.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-lg mx-auto text-left">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-300">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Crown className="w-5 h-5" />
          Upgrade to Premium
        </Link>
        
        <p className="text-xs text-gray-500 mt-4">
          Starting at ₦2,999/month • Cancel anytime
        </p>
      </div>
    </div>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 text-xs font-semibold rounded-full">
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
}
