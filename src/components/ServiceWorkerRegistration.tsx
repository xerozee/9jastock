'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function ServiceWorkerRegistration() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload the page to get the new version
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED') {
        console.log(`[App] Service Worker updated to version ${event.data.version}`);
        // Auto-reload when update is applied
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      }
    });

    // Register service worker
    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check for updates
        });

        setRegistration(reg);
        console.log('[App] Service Worker registered:', reg.scope);

        // Check for updates immediately
        reg.update();

        // Check for updates every 5 minutes
        const updateInterval = setInterval(() => {
          reg.update();
        }, 5 * 60 * 1000);

        // Handle update found
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          console.log('[App] New Service Worker found, installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available
                console.log('[App] New version available');
                setShowUpdateBanner(true);
              } else {
                // First install
                console.log('[App] App cached for offline use');
              }
            }
          });
        });

        // Check if there's already a waiting worker
        if (reg.waiting) {
          setShowUpdateBanner(true);
        }

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  if (!showUpdateBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
          <RefreshCw size={20} className="animate-spin-slow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Update Available</p>
          <p className="text-xs text-green-100">A new version of 9jaStock is ready</p>
        </div>
        <button
          onClick={handleUpdate}
          className="flex-shrink-0 px-4 py-2 bg-white text-green-600 font-semibold rounded-lg text-sm hover:bg-green-50 transition-colors"
        >
          Update
        </button>
        <button
          onClick={() => setShowUpdateBanner(false)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
