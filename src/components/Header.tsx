'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Star, Menu, X, Briefcase, Newspaper, Moon, Sun, LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import Logo from './Logo';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/stocks', label: 'Stocks', icon: TrendingUp },
    { href: '/blog', label: 'News', icon: Newspaper },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
  ];

  return (
    <header className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group hover:scale-105 transition-transform">
            <Logo size="md" variant="full" />
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

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/10">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User size={18} />
                  )}
                  <span className="text-sm font-medium">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-all"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
              >
                <LogIn size={16} />
                <span className="text-sm">Login</span>
              </button>
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
                  <div className="w-full h-10 rounded-xl bg-white/10 animate-pulse" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="px-4 space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/10">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User size={18} />
                    )}
                    <span className="text-sm font-medium">
                      {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-all"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    login();
                  }}
                  className="mx-4 w-[calc(100%-2rem)] flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                >
                  <LogIn size={16} />
                  <span className="text-sm">Login</span>
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
