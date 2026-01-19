'use client';

import { useEffect, useCallback, useState } from 'react';

interface PeriodicSyncStatus {
  isSupported: boolean;
  isRegistered: boolean;
  lastSync: Date | null;
}

const PERIODIC_SYNC_TAG = 'periodic-stock-update';
const MIN_INTERVAL = 60 * 60 * 1000; // 1 hour minimum (browser enforced)

export function usePeriodicSync() {
  const [status, setStatus] = useState<PeriodicSyncStatus>({
    isSupported: false,
    isRegistered: false,
    lastSync: null,
  });

  const checkSupport = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPeriodicSync = hasServiceWorker && 
      'periodicSync' in (await navigator.serviceWorker.ready);
    
    return hasPeriodicSync;
  }, []);

  const registerPeriodicSync = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('periodicSync' in registration) {
        const periodicSync = (registration as any).periodicSync;
        
        const permissionStatus = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName,
        });
        
        if (permissionStatus.state === 'granted') {
          await periodicSync.register(PERIODIC_SYNC_TAG, {
            minInterval: MIN_INTERVAL,
          });
          
          setStatus(prev => ({ ...prev, isRegistered: true }));
          console.log('[PeriodicSync] Registered successfully');
          return true;
        } else {
          console.log('[PeriodicSync] Permission not granted:', permissionStatus.state);
        }
      }
    } catch (error) {
      console.error('[PeriodicSync] Registration failed:', error);
    }
    return false;
  }, []);

  const unregisterPeriodicSync = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('periodicSync' in registration) {
        const periodicSync = (registration as any).periodicSync;
        await periodicSync.unregister(PERIODIC_SYNC_TAG);
        setStatus(prev => ({ ...prev, isRegistered: false }));
        console.log('[PeriodicSync] Unregistered');
        return true;
      }
    } catch (error) {
      console.error('[PeriodicSync] Unregistration failed:', error);
    }
    return false;
  }, []);

  const requestBackgroundSync = useCallback(async (tag?: string) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await (registration as any).sync.register(tag || 'sync-stock-data');
        console.log('[BackgroundSync] Requested:', tag);
        return true;
      }
    } catch (error) {
      console.error('[BackgroundSync] Request failed:', error);
    }
    return false;
  }, []);

  useEffect(() => {
    const init = async () => {
      const supported = await checkSupport();
      setStatus(prev => ({ ...prev, isSupported: supported }));
      
      if (supported) {
        await registerPeriodicSync();
      }
    };
    
    init();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STOCK_DATA_UPDATED') {
        setStatus(prev => ({ ...prev, lastSync: new Date(event.data.timestamp) }));
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [checkSupport, registerPeriodicSync]);

  return {
    ...status,
    registerPeriodicSync,
    unregisterPeriodicSync,
    requestBackgroundSync,
  };
}

export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        setIsSupported(true);
      }
    };
    checkSupport();
  }, []);

  const requestSync = useCallback(async (tag: 'sync-stock-data' | 'sync-portfolio' | 'sync-news') => {
    if (!isSupported) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
        return true;
      }
    } catch (error) {
      console.error('[BackgroundSync] Failed:', error);
    }
    return false;
  }, [isSupported]);

  return { isSupported, requestSync };
}
