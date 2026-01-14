'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Star, Menu, X, User, LogIn, LogOut, Briefcase, Newspaper, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/stocks', label: 'Stocks', icon: TrendingUp },
    { href: '/blog', label: 'News', icon: Newspaper },
    { href: '/portfolio', label: 'My Portfolio', icon: Briefcase, requiresAuth: true },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
  ];

  return (
    <header className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-white dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-green-800 dark:text-white font-bold text-xl">9J</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">9jaStock</h1>
              <p className="text-xs text-green-200 dark:text-slate-400">NGX Market Tracker</p>
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 dark:bg-emerald-500/30 text-white shadow-inner'
                      : 'text-green-100 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-green-700 dark:bg-slate-700 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-green-200 dark:border-emerald-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-emerald-600 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <a
                  href="/api/auth/logout"
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-sm transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/login"
                className="flex items-center space-x-2 px-4 py-2 bg-white text-green-800 dark:bg-emerald-500 dark:text-white hover:bg-green-100 dark:hover:bg-emerald-400 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-green-100 dark:text-slate-300 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-white/10">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="w-full h-10 bg-green-700 dark:bg-slate-700 rounded-xl animate-pulse" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="px-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || 'User'}
                        className="w-10 h-10 rounded-full border-2 border-green-200 dark:border-emerald-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-emerald-600 flex items-center justify-center">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-green-200 dark:text-slate-400">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href="/api/auth/logout"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
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
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white text-green-800 dark:bg-emerald-500 dark:text-white hover:bg-green-100 dark:hover:bg-emerald-400 rounded-xl font-medium transition-all"
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
