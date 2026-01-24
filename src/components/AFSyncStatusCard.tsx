'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database, Activity, PlayCircle } from 'lucide-react';

interface SyncStatus {
  status: string;
  totalStocks: number;
  processedStocks: number;
  successfulStocks: number;
  failedStocks: number;
  notFoundStocks: number;
  currentSymbol: string;
  currentBatch: number;
  totalBatches: number;
  percentComplete: number;
  startedAt?: string;
  completedAt?: string;
  lastUpdated: string;
  lastRunDuration?: number;
  nextScheduledRun?: string;
  recentErrors: Array<{ symbol: string; error: string; timestamp: string }>;
}

export default function AFSyncStatusCard() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/af-sync/status');
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/af-sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 15, startIndex: 0 }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'running':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Database className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">African Financials Sync</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Automated data aggregation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {status?.status !== 'running' && (
            <button
              onClick={triggerSync}
              disabled={triggering}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              {triggering ? 'Starting...' : 'Run Sync'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {status && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon()}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status.status.toUpperCase()}
            </span>
            {status.currentSymbol && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Processing: {status.currentSymbol}
              </span>
            )}
          </div>

          {status.status === 'running' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {status.processedStocks} / {status.totalStocks} ({status.percentComplete}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${status.percentComplete}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Batch {status.currentBatch} of {status.totalBatches}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.successfulStocks}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Found</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.notFoundStocks}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Not Found</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.failedStocks}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.totalStocks}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {status.lastRunDuration && (
              <p>Last run duration: <span className="text-slate-900 dark:text-white">{formatDuration(status.lastRunDuration)}</span></p>
            )}
            {status.completedAt && (
              <p>Completed: <span className="text-slate-900 dark:text-white">{formatTime(status.completedAt)}</span></p>
            )}
            {status.nextScheduledRun && (
              <p>Next scheduled: <span className="text-slate-900 dark:text-white">{formatTime(status.nextScheduledRun)}</span></p>
            )}
          </div>

          {status.recentErrors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Recent Errors</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {status.recentErrors.map((err, idx) => (
                  <p key={idx} className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{err.symbol}:</span> {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
