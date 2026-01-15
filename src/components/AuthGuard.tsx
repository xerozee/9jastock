'use client';

import { useAuth } from '@/hooks/useAuth';
import { Lock, LogIn, ArrowRight } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  pageName?: string;
}

export default function AuthGuard({ children, fallback, pageName = 'this page' }: AuthGuardProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-green-600 dark:text-green-400" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in Required
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              Please sign in to access {pageName}. It only takes a few seconds!
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Why sign in?
            </h3>
            <ul className="text-left space-y-3 text-sm text-gray-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Access real-time stock data for 145+ Nigerian stocks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Track your personal portfolio and watchlist
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Get market news and analysis from top sources
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Receive daily newsletter with market insights
              </li>
            </ul>
          </div>

          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <LogIn size={20} />
            Sign In to Continue
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-xs text-gray-500 dark:text-slate-500 mt-4">
            Sign in with Google, Apple, or email — it's free!
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
