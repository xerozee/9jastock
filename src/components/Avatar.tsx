'use client';

import { useMemo } from 'react';

const colors = [
  { bg: 'bg-[#008751]', text: 'text-white' },
  { bg: 'bg-emerald-600', text: 'text-white' },
  { bg: 'bg-teal-600', text: 'text-white' },
  { bg: 'bg-[#00a863]', text: 'text-white' },
  { bg: 'bg-green-600', text: 'text-white' },
  { bg: 'bg-cyan-600', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-[#006741]', text: 'text-white' },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ 
  firstName, 
  lastName, 
  email, 
  profileImageUrl,
  size = 'md',
  className = ''
}: AvatarProps) {
  const initials = useMemo(() => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    if (email) {
      const name = email.split('@')[0];
      return name.slice(0, 2).toUpperCase();
    }
    return 'U';
  }, [firstName, lastName, email]);

  const color = useMemo(() => {
    const identifier = email || firstName || 'default';
    const index = hashCode(identifier) % colors.length;
    return colors[index];
  }, [email, firstName]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  if (profileImageUrl) {
    return (
      <img 
        src={profileImageUrl} 
        alt={`${firstName || 'User'}'s avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${color.bg} ${color.text} rounded-full flex items-center justify-center font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}
