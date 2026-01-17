'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
    }
  }, [countdown, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Welcome to Premium!
        </h1>
        <p className="text-gray-400 mb-8">
          Your subscription is now active. Enjoy full access to all 9jaStock features including real-time data and AI recommendations.
        </p>
        
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">What's Now Unlocked:</h3>
          <ul className="space-y-2 text-left text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> 1-minute data refresh
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> AI-powered stock recommendations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Unlimited portfolio tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> 30 days of news history
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Advanced analytics
            </li>
          </ul>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl transition-all"
        >
          Go to Dashboard Now
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
