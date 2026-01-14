'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Star, Menu, X, User, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/stocks', label: 'Stocks', icon: TrendingUp },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
  ];

  return (
    <header className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-800 font-bold text-xl">9J</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">9jaStock</h1>
              <p className="text-xs text-green-200">NGX Market Tracker</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-green-700 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-green-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <a
                  href="/api/auth/logout"
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-sm transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/login"
                className="flex items-center space-x-2 px-4 py-2 bg-white text-green-800 hover:bg-green-100 rounded-lg font-medium transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </a>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-green-700">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-green-700">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="w-full h-10 bg-green-700 rounded-lg animate-pulse" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="px-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || 'User'}
                        className="w-10 h-10 rounded-full border-2 border-green-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-green-200">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href="/api/auth/logout"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </a>
                </div>
              ) : (
                <div className="px-4">
                  <a
                    href="/api/auth/login"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white text-green-800 hover:bg-green-100 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </a>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
