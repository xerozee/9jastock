'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  isNative,
  getPlatform,
  shareStock,
  sharePortfolio,
  shareContent,
  openExternalLink,
  configureStatusBar,
  initMobileApp,
  keyboardUtils,
} from '@/lib/mobile';

/**
 * Hook for mobile-specific functionality
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Check if running in native context
    setIsMobile(isNative());
    setPlatform(getPlatform());

    // Initialize mobile app features
    if (isNative()) {
      initMobileApp();

      // Set up keyboard listeners
      keyboardUtils.addShowListener(() => setIsKeyboardOpen(true));
      keyboardUtils.addHideListener(() => setIsKeyboardOpen(false));
    }
  }, []);

  const handleShareStock = useCallback(
    async (symbol: string, name: string, price: number, change: number) => {
      await shareStock(symbol, name, price, change);
    },
    []
  );

  const handleSharePortfolio = useCallback(async (shareId: string) => {
    await sharePortfolio(shareId);
  }, []);

  const handleShare = useCallback(
    async (options: { title: string; text: string; url?: string }) => {
      await shareContent(options);
    },
    []
  );

  const handleOpenLink = useCallback(async (url: string) => {
    await openExternalLink(url);
  }, []);

  const handleSetTheme = useCallback(async (isDark: boolean) => {
    await configureStatusBar(isDark);
  }, []);

  const hideKeyboard = useCallback(async () => {
    await keyboardUtils.hide();
  }, []);

  return {
    isNative: isMobile,
    platform,
    isKeyboardOpen,
    shareStock: handleShareStock,
    sharePortfolio: handleSharePortfolio,
    share: handleShare,
    openLink: handleOpenLink,
    setTheme: handleSetTheme,
    hideKeyboard,
  };
}

/**
 * Hook to detect if app is running on mobile device (native or web)
 */
export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        ) || isNative();
      setIsMobileDevice(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobileDevice;
}
