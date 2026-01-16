'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Star, Menu, X, Briefcase, Newspaper, Moon, Sun, LogIn, LogOut, User, Zap } from 'lucide-react';
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
    <header className="nav-scifi sticky top-0 z-50">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <Logo size="md" variant="full" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[var(--accent)]' : ''} />
                  <span className="text-sm font-medium tracking-wide">{link.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                      <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-[0_0_15px_var(--glow-primary)] transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={18} className="text-[var(--accent-warning)]" />
              ) : (
                <Moon size={18} className="text-[var(--accent-secondary)]" />
              )}
            </button>

            {isLoading ? (
              <div className="w-10 h-10 rounded-lg skeleton-scifi" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                {/* User Profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-[0_0_15px_var(--glow-primary)] transition-all duration-300"
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || 'User'}
                      className="w-6 h-6 rounded-full ring-2 ring-[var(--accent)] ring-opacity-50"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                      <User size={14} className="text-[var(--accent-foreground)]" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--accent-danger)] border-opacity-30 bg-[rgba(255,51,102,0.1)] hover:bg-[rgba(255,51,102,0.2)] hover:shadow-[0_0_15px_rgba(255,51,102,0.3)] text-[var(--accent-danger)] transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-[0_0_15px_var(--glow-primary)] text-white transition-all duration-300"
                >
                  <LogIn size={16} />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="btn-scifi-solid flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  <Zap size={16} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={18} className="text-[var(--accent-warning)]" />
              ) : (
                <Moon size={18} className="text-[var(--accent-secondary)]" />
              )}
            </button>
            <button
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={22} className="text-[var(--accent-danger)]" />
              ) : (
                <Menu size={22} className="text-[var(--accent)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[var(--border)]">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[rgba(0,255,200,0.1)] border border-[var(--accent)] border-opacity-30 text-[var(--accent)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{link.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="w-full h-12 rounded-lg skeleton-scifi" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-2 px-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-all"
                  >
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || 'User'}
                        className="w-8 h-8 rounded-full ring-2 ring-[var(--accent)] ring-opacity-50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                        <User size={16} className="text-[var(--accent-foreground)]" />
                      </div>
                    )}
                    <div>
                      <span className="block text-sm font-medium text-white">
                        {user.firstName || 'User'}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        View Profile
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--accent-danger)] border-opacity-30 bg-[rgba(255,51,102,0.1)] text-[var(--accent-danger)] transition-all"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] text-white transition-all"
                  >
                    <LogIn size={18} />
                    <span className="font-medium">Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full btn-scifi-solid flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold"
                  >
                    <Zap size={18} />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-secondary)] to-transparent opacity-30" />
    </header>
  );
}
