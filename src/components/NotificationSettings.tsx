'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, AlertTriangle, Check, TrendingUp, Newspaper, BarChart3, Eye } from 'lucide-react';

interface NotificationPreferences {
  priceAlerts: boolean;
  dailySummary: boolean;
  breakingNews: boolean;
  watchlistUpdates: boolean;
}

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceAlerts: true,
    dailySummary: true,
    breakingNews: true,
    watchlistUpdates: true,
  });

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  async function checkNotificationSupport() {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      await checkSubscriptionStatus();
    }
    setIsLoading(false);
  }

  async function checkSubscriptionStatus() {
    try {
      const res = await fetch('/api/notifications/preferences', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.subscribed);
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  }

  async function enableNotifications() {
    setIsLoading(true);
    setError(null);
    
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        setError('Notification permission denied. Please enable notifications in your browser settings.');
        setIsLoading(false);
        return;
      }

      const vapidRes = await fetch('/api/notifications/subscribe');
      const vapidData = await vapidRes.json();
      
      if (!vapidData.vapidPublicKey) {
        setError('Push notification service not configured');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.vapidPublicKey) as BufferSource,
      });

      const subscribeRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          preferences,
        }),
      });

      if (subscribeRes.ok) {
        setIsSubscribed(true);
        setSuccess('Notifications enabled successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await subscribeRes.json();
        throw new Error(data.error || 'Failed to save subscription');
      }
    } catch (error: any) {
      console.error('Enable notifications error:', error);
      setError(error.message || 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function disableNotifications() {
    setIsLoading(true);
    setError(null);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        credentials: 'include',
      });

      setIsSubscribed(false);
      setSuccess('Notifications disabled');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Disable notifications error:', error);
      setError(error.message || 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePreferences(key: keyof NotificationPreferences, value: boolean) {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    if (!isSubscribed) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: newPreferences }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <BellOff className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
            <p className="text-sm text-gray-500">Not supported in this browser</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Notifications enabled' : 'Get alerts for price movements and news'}
            </p>
          </div>
        </div>
        
        <button
          onClick={isSubscribed ? disableNotifications : enableNotifications}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
            isSubscribed
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            <>
              <BellOff className="w-4 h-4" />
              Disable
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              Enable Notifications
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Types</h4>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Price Alerts</span>
                <p className="text-xs text-gray-500">Get notified when stocks hit your target prices</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.priceAlerts}
              onChange={(e) => updatePreferences('priceAlerts', e.target.checked)}
              disabled={!isSubscribed}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 disabled:opacity-50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Daily Summary</span>
                <p className="text-xs text-gray-500">Daily market overview and portfolio performance</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.dailySummary}
              onChange={(e) => updatePreferences('dailySummary', e.target.checked)}
              disabled={!isSubscribed}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 disabled:opacity-50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-purple-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Breaking News</span>
                <p className="text-xs text-gray-500">Important news from trusted Nigerian finance sources</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.breakingNews}
              onChange={(e) => updatePreferences('breakingNews', e.target.checked)}
              disabled={!isSubscribed}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 disabled:opacity-50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-orange-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Watchlist Updates</span>
                <p className="text-xs text-gray-500">Significant movements in your watchlist stocks</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.watchlistUpdates}
              onChange={(e) => updatePreferences('watchlistUpdates', e.target.checked)}
              disabled={!isSubscribed}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 disabled:opacity-50"
            />
          </label>
        </div>
        
        {isSaving && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving preferences...
          </p>
        )}
      </div>
    </div>
  );
}
