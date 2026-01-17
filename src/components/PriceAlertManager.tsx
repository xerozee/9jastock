'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader2, AlertTriangle, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  createdAt: string;
}

interface PriceAlertManagerProps {
  watchlistSymbols?: string[];
}

export default function PriceAlertManager({ watchlistSymbols = [] }: PriceAlertManagerProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/price-alerts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createAlert() {
    if (!newAlert.symbol || !newAlert.targetPrice) {
      setError('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symbol: newAlert.symbol,
          targetPrice: parseFloat(newAlert.targetPrice),
          condition: newAlert.condition,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlerts([data.alert, ...alerts]);
        setNewAlert({ symbol: '', targetPrice: '', condition: 'above' });
        setShowForm(false);
        setSuccess('Price alert created!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to create alert');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create alert');
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteAlert(id: string) {
    try {
      const res = await fetch(`/api/price-alerts?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  }

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Price Alerts</h3>
            <p className="text-sm text-gray-500">Get notified when stocks hit your targets</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Alert
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

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create New Alert</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stock Symbol</label>
              {watchlistSymbols.length > 0 ? (
                <select
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select stock</option>
                  {watchlistSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., GTCO"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Price (₦)</label>
              <input
                type="number"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                placeholder="e.g., 50.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Condition</label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="above">Goes above</option>
                <option value="below">Falls below</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={createAlert}
              disabled={isCreating}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Alert
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No price alerts set</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Create an alert to get notified when a stock hits your target price</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeAlerts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Alerts ({activeAlerts.length})</h4>
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{alert.symbol}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {alert.condition === 'above' ? 'rises above' : 'falls below'} ₦{alert.targetPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {triggeredAlerts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Triggered Alerts ({triggeredAlerts.length})</h4>
              <div className="space-y-2">
                {triggeredAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{alert.symbol}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                          Triggered at ₦{alert.triggeredPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
