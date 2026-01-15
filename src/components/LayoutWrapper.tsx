'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Header from './Header';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  
  const showHeader = isAuthenticated || isAuthPage;
  const showFooter = isAuthenticated;

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      {showHeader && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      {showFooter && (
        <footer className="bg-slate-900 text-white py-8 mt-12 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">9J</span>
                  </div>
                  <span className="text-lg font-bold">9jaStock</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Your trusted platform for tracking Nigerian Stock Exchange (NGX) stocks and market performance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="/" className="hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="/stocks" className="hover:text-white transition-colors">All Stocks</a></li>
                  <li><a href="/watchlist" className="hover:text-white transition-colors">Watchlist</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Disclaimer</h4>
                <p className="text-slate-400 text-sm">
                  Data provided is for informational purposes only. Always do your own research before making investment decisions.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
              <p>&copy; {new Date().getFullYear()} 9jaStock. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
