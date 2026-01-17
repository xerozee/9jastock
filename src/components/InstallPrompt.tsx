'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';

type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [device, setDevice] = useState<DeviceType>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    if (isStandalone()) {
      setShow(false);
      return;
    }
    
    if (dismissedTime && daysSinceDismissed < 7) {
      setShow(false);
      return;
    }

    const detectedDevice = detectDevice();
    setDevice(detectedDevice);
    
    setTimeout(() => {
      setShow(true);
    }, 3000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShow(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5" />
            <span className="font-semibold">Install 9jaStock</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {device === 'ios' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add 9jaStock to your iPhone home screen for quick access:
              </p>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Tap the <Share className="w-4 h-4 inline text-blue-500" /> Share button at the bottom of Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="w-4 h-4 inline" /></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Tap <strong>"Add"</strong> in the top right corner</span>
                </li>
              </ol>
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">9ja</span>
                </div>
                <span>The app icon will appear on your home screen</span>
              </div>
            </div>
          )}

          {device === 'android' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Install 9jaStock on your Android device:
              </p>
              
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </button>
              ) : (
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Tap the <strong>menu icon</strong> (three dots) in Chrome</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span>Confirm by tapping <strong>"Install"</strong></span>
                  </li>
                </ol>
              )}
              
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">9ja</span>
                </div>
                <span>Get faster access with offline support</span>
              </div>
            </div>
          )}

          {device === 'desktop' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Install 9jaStock as a desktop app:
              </p>
              
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </button>
              ) : (
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Click the install icon in your browser's address bar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Click <strong>"Install"</strong> to confirm</span>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
