'use client';

import React, { ReactNode } from 'react';
import { usePremiumTheme } from '@/contexts/PremiumThemeContext';
import { Crown, Sparkles } from 'lucide-react';

interface PremiumWrapperProps {
  children: ReactNode;
  showBadge?: boolean;
  className?: string;
}

export function PremiumWrapper({ children, showBadge = false, className = '' }: PremiumWrapperProps) {
  const { isPremium, effects } = usePremiumTheme();

  if (!isPremium) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
                       bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-900"
            style={{ boxShadow: effects.glowShadow }}
          >
            <Crown size={10} />
            PRO
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
}

export function PremiumCard({ children, className = '', variant = 'default' }: PremiumCardProps) {
  const { isPremium, effects, theme } = usePremiumTheme();

  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  if (!isPremium) {
    return (
      <div className={`${baseClasses} bg-slate-800/50 border border-slate-700 ${className}`}>
        {children}
      </div>
    );
  }

  const variantClasses = {
    default: 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-amber-500/20',
    elevated: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30',
    glass: 'backdrop-blur-xl bg-slate-900/80 border border-amber-400/20',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className} premium-card-glow`}
      style={{ boxShadow: effects.glowShadow }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function PremiumBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { isPremium, effects } = usePremiumTheme();

  if (!isPremium) return null;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = { sm: 8, md: 10, lg: 14 };

  return (
    <div 
      className={`inline-flex items-center gap-1 font-bold rounded-full
                  bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-900
                  ${sizeClasses[size]}`}
      style={{ boxShadow: effects.glowShadow }}
    >
      <Crown size={iconSizes[size]} />
      <span>PRO</span>
    </div>
  );
}

export function PremiumGlow({ children, intensity = 'medium' }: { children: ReactNode; intensity?: 'low' | 'medium' | 'high' }) {
  const { isPremium } = usePremiumTheme();

  if (!isPremium) {
    return <>{children}</>;
  }

  const intensityStyles = {
    low: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    medium: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    high: 'shadow-[0_0_50px_rgba(245,158,11,0.35)]',
  };

  return (
    <div className={`${intensityStyles[intensity]} rounded-inherit`}>
      {children}
    </div>
  );
}

export function PremiumText({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isPremium } = usePremiumTheme();

  if (!isPremium) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span 
      className={`bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 
                  bg-clip-text text-transparent font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function PremiumIndicator() {
  const { isPremium, effects } = usePremiumTheme();

  if (!isPremium) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full
                 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30
                 backdrop-blur-sm"
      style={{ boxShadow: effects.glowShadow }}
    >
      <div className="relative">
        <Sparkles size={16} className="text-amber-400 animate-pulse" />
        <div className="absolute inset-0 blur-sm">
          <Sparkles size={16} className="text-amber-400" />
        </div>
      </div>
      <span className="text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
        Premium Active
      </span>
    </div>
  );
}

export function PremiumButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  disabled = false 
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const { isPremium, effects } = usePremiumTheme();

  const baseClasses = 'px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2';
  
  if (!isPremium) {
    const standardClasses = variant === 'primary'
      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
      : 'bg-slate-700 hover:bg-slate-600 text-white';
    
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseClasses} ${standardClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
    );
  }

  const premiumClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-slate-900 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400'
    : 'bg-slate-800 border border-amber-500/30 text-amber-100 hover:bg-slate-700 hover:border-amber-500/50';

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${premiumClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ boxShadow: variant === 'primary' ? effects.glowShadow : undefined }}
    >
      {children}
    </button>
  );
}

export function PremiumDivider() {
  const { isPremium } = usePremiumTheme();

  if (!isPremium) {
    return <div className="h-px bg-slate-700" />;
  }

  return (
    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
  );
}

export function PremiumHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isPremium } = usePremiumTheme();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {isPremium && (
        <div className="relative">
          <Crown size={20} className="text-amber-400" />
          <div className="absolute inset-0 blur-md">
            <Crown size={20} className="text-amber-400 opacity-50" />
          </div>
        </div>
      )}
      <h2 className={isPremium 
        ? 'text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent'
        : 'text-2xl font-bold text-white'
      }>
        {children}
      </h2>
    </div>
  );
}
