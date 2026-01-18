'use client';

import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | 9jaStock` : '9jaStock - Nigerian Stock Exchange Tracker';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
