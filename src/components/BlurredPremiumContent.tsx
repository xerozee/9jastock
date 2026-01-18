'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface BlurredPremiumContentProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function BlurredPremiumContent({ 
  children, 
  title,
  description = "Subscribe to unlock premium features and get real-time market insights"
}: BlurredPremiumContentProps) {
  const { isPremium } = useSubscription();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50">
      <div className="blur-md opacity-50 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="text-center p-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl shadow-lg shadow-amber-500/20 mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Unlock {title}
          </h3>
          
          <p className="text-slate-300 text-sm mb-5">
            {description}
          </p>
          
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Crown className="w-4 h-4" />
            Subscribe Now
          </Link>
        </div>
      </div>
    </div>
  );
}
