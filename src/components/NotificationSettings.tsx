'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, AlertTriangle, Check, TrendingUp, TrendingDown, Newspaper, BarChart3, Eye, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';

interface NotificationPreferences {
  priceAlerts: boolean;
  dailySummary: boolean;
  breakingNews: boolean;
  watchlistUpdates: boolean;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
  currentPrice?: number;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
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
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userStocks, setUserStocks] = useState<StockData[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState<string | null>(null);
  const [alertForm, setAlertForm] = useState({ targetPrice: '', condition: 'above' as 'above' | 'below' });
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

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

  async function fetchUserStocksAndAlerts() {
    setIsLoadingStocks(true);
    setIsLoadingAlerts(true);
    
    try {
      const [holdingsRes, stocksRes, alertsRes] = await Promise.all([
        fetch('/api/holdings', { credentials: 'include' }),
        fetch('/api/stocks'),
        fetch('/api/price-alerts', { credentials: 'include' })
      ]);

      const holdingsData = holdingsRes.ok ? await holdingsRes.json() : { data: [] };
      const stocksData = stocksRes.ok ? await stocksRes.json() : [];
      const alertsData = alertsRes.ok ? await alertsRes.json() : { alerts: [] };

      const userSymbols = new Set<string>();
      (holdingsData.data || []).forEach((h: any) => userSymbols.add(h.symbol));

      const watchlist = localStorage.getItem('watchlist');
      if (watchlist) {
        try {
          JSON.parse(watchlist).forEach((s: string) => userSymbols.add(s));
        } catch {}
      }

      const stocksMap = new Map<string, StockData>();
      stocksData.forEach((s: any) => stocksMap.set(s.symbol, { symbol: s.symbol, name: s.name, price: s.price }));

      const userStocksList = Array.from(userSymbols)
        .map(symbol => stocksMap.get(symbol))
        .filter((s): s is StockData => !!s);

      setUserStocks(userStocksList);
      setPriceAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Failed to fetch user stocks:', error);
    } finally {
      setIsLoadingStocks(false);
      setIsLoadingAlerts(false);
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

  async function toggleSection(section: string) {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === 'priceAlerts' && userStocks.length === 0) {
        await fetchUserStocksAndAlerts();
      }
    }
  }

  async function createAlert(symbol: string, currentPrice: number) {
    if (!alertForm.targetPrice) return;

    setIsCreatingAlert(true);
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symbol,
          targetPrice: parseFloat(alertForm.targetPrice),
          condition: alertForm.condition,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPriceAlerts([data.alert, ...priceAlerts]);
        setShowAlertForm(null);
        setAlertForm({ targetPrice: '', condition: 'above' });
        setSuccess('Price alert created!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create alert');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError('Failed to create alert');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsCreatingAlert(false);
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      const res = await fetch(`/api/price-alerts?id=${alertId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setPriceAlerts(priceAlerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  }

  function getAlertsForStock(symbol: string) {
    return priceAlerts.filter(a => a.symbol === symbol && !a.triggered);
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
          {/* Price Alerts - Expandable */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => isSubscribed && preferences.priceAlerts && toggleSection('priceAlerts')}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Price Alerts</span>
                  <p className="text-xs text-gray-500">Get notified when stocks hit your target prices</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSubscribed && preferences.priceAlerts && (
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    {expandedSection === 'priceAlerts' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <input
                  type="checkbox"
                  checked={preferences.priceAlerts}
                  onChange={(e) => {
                    e.stopPropagation();
                    updatePreferences('priceAlerts', e.target.checked);
                    if (e.target.checked && isSubscribed) {
                      toggleSection('priceAlerts');
                    }
                  }}
                  disabled={!isSubscribed}
                  className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Expanded Stock List for Price Alerts */}
            {expandedSection === 'priceAlerts' && isSubscribed && preferences.priceAlerts && (
              <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-4">
                {isLoadingStocks ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : userStocks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Add stocks to your portfolio or watchlist to set price alerts
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Select a stock to set price alerts:</p>
                    {userStocks.map((stock) => {
                      const stockAlerts = getAlertsForStock(stock.symbol);
                      const isExpanded = showAlertForm === stock.symbol;

                      return (
                        <div key={stock.symbol} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => setShowAlertForm(isExpanded ? null : stock.symbol)}
                          >
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                              <span className="text-xs text-gray-500 ml-2">₦{stock.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {stockAlerts.length > 0 && (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                  {stockAlerts.length} alert{stockAlerts.length > 1 ? 's' : ''}
                                </span>
                              )}
                              <Plus className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                            </div>
                          </div>

                          {/* Stock Alert Form */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 dark:border-gray-600 p-3 space-y-3">
                              {/* Existing alerts for this stock */}
                              {stockAlerts.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">Active Alerts:</p>
                                  {stockAlerts.map(alert => (
                                    <div key={alert.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                                      <div className="flex items-center gap-2">
                                        {alert.condition === 'above' ? (
                                          <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {alert.condition === 'above' ? 'Above' : 'Below'} ₦{alert.targetPrice.toFixed(2)}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => deleteAlert(alert.id)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* New alert form */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-medium">Create New Alert:</p>
                                <div className="flex gap-2">
                                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <button
                                      onClick={() => setAlertForm({ ...alertForm, condition: 'above' })}
                                      className={`px-3 py-2 text-xs font-medium flex items-center gap-1 ${
                                        alertForm.condition === 'above'
                                          ? 'bg-green-500 text-white'
                                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                      }`}
                                    >
                                      <TrendingUp className="w-3 h-3" /> Above
                                    </button>
                                    <button
                                      onClick={() => setAlertForm({ ...alertForm, condition: 'below' })}
                                      className={`px-3 py-2 text-xs font-medium flex items-center gap-1 ${
                                        alertForm.condition === 'below'
                                          ? 'bg-red-500 text-white'
                                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                      }`}
                                    >
                                      <TrendingDown className="w-3 h-3" /> Below
                                    </button>
                                  </div>
                                  <input
                                    type="number"
                                    placeholder={`₦${stock.price.toFixed(2)}`}
                                    value={alertForm.targetPrice}
                                    onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                  />
                                  <button
                                    onClick={() => createAlert(stock.symbol, stock.price)}
                                    disabled={!alertForm.targetPrice || isCreatingAlert}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {isCreatingAlert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

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
