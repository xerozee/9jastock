'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  DollarSign,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

interface BotConfig {
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  privateKey: string;
  funderAddress: string;
  tokenId: string;
  buyThreshold: number;
  sellThreshold: number;
  tradeSize: number;
  checkInterval: number;
}

interface TradeHistoryEntry {
  id: string;
  timestamp: string;
  action: 'buy' | 'sell' | 'info' | 'error';
  message: string;
  price?: number;
  size?: number;
  success: boolean;
}

interface BotState {
  running: boolean;
  config: BotConfig | null;
  position: number;
  lastPrice: number | null;
  history: TradeHistoryEntry[];
  lastCheck: string | null;
  error: string | null;
}

const STORAGE_KEY = 'polymarket-bot-config';

const defaultConfig: BotConfig = {
  apiKey: '',
  apiSecret: '',
  apiPassphrase: '',
  privateKey: '',
  funderAddress: '',
  tokenId: '',
  buyThreshold: 0.05,
  sellThreshold: 0.08,
  tradeSize: 10,
  checkInterval: 60,
};

export default function PolymarketBotPage() {
  const [config, setConfig] = useState<BotConfig>(defaultConfig);
  const [botState, setBotState] = useState<BotState | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
      } catch {
        console.error('Failed to parse saved config');
      }
    }
    fetchBotState();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (botState?.running) {
      const interval = (config.checkInterval || 60) * 1000;
      intervalRef.current = setInterval(() => {
        runCheck();
      }, interval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [botState?.running, config.checkInterval]);

  const fetchBotState = async () => {
    try {
      const res = await fetch('/api/polymarket/bot');
      const data = await res.json();
      setBotState(data);
      if (data.lastPrice) setCurrentPrice(data.lastPrice);
    } catch (err) {
      console.error('Failed to fetch bot state:', err);
    }
  };

  const fetchPrice = async () => {
    if (!config.tokenId || !config.apiKey) {
      setError('Token ID and API credentials required to fetch price');
      return;
    }
    setPriceLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/polymarket/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCurrentPrice(data.price);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setPriceLoading(false);
    }
  };

  const startBot = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/polymarket/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', ...config }),
      });
      const data = await res.json();
      if (data.error || !data.success) {
        setError(data.error || data.message);
      } else {
        setBotState(data.state);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot');
    } finally {
      setLoading(false);
    }
  };

  const stopBot = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/polymarket/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBotState(data.state);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop bot');
    } finally {
      setLoading(false);
    }
  };

  const runCheck = useCallback(async () => {
    try {
      const res = await fetch('/api/polymarket/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });
      const data = await res.json();
      if (data.state) {
        setBotState(data.state);
        if (data.price) setCurrentPrice(data.price);
      }
    } catch (err) {
      console.error('Check failed:', err);
    }
  }, []);

  const clearHistory = async () => {
    try {
      const res = await fetch('/api/polymarket/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearHistory' }),
      });
      const data = await res.json();
      if (data.state) setBotState(data.state);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const setPosition = async (position: number) => {
    try {
      const res = await fetch('/api/polymarket/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPosition', position }),
      });
      const data = await res.json();
      if (data.state) setBotState(data.state);
    } catch (err) {
      console.error('Failed to set position:', err);
    }
  };

  const handleConfigChange = (field: keyof BotConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-amber-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Polymarket Trading Bot</h1>
          <p className="text-slate-400">Automated trading based on price thresholds</p>
        </div>

        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium">Security Warning</p>
              <p className="text-amber-300/80 text-sm">
                Your API credentials and private key are stored in browser localStorage for convenience. 
                This is NOT secure for production use. Never use this with significant funds.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Bot Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${botState?.running ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-2xl font-bold text-white">
                {botState?.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            {botState?.lastCheck && (
              <p className="text-slate-500 text-sm mt-2">
                Last check: {formatTime(botState.lastCheck)}
              </p>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">Current Price</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {currentPrice !== null ? `$${currentPrice.toFixed(4)}` : '--'}
              </span>
              <button
                onClick={fetchPrice}
                disabled={priceLoading}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${priceLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {currentPrice !== null && (
              <p className="text-slate-500 text-sm mt-2">
                Buy: ≤${config.buyThreshold} | Sell: ≥${config.sellThreshold}
              </p>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Current Position</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {botState?.position ?? 0} shares
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setPosition(0)}
                className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Reset to 0
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">Show sensitive fields</span>
                <button
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">API Key</label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter API key"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">API Secret</label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.apiSecret}
                  onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter API secret"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">API Passphrase</label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.apiPassphrase}
                  onChange={(e) => handleConfigChange('apiPassphrase', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter API passphrase"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Private Key</label>
                <input
                  type="password"
                  value={config.privateKey}
                  onChange={(e) => handleConfigChange('privateKey', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter private key (0x...)"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Funder Address (Optional)</label>
                <input
                  type="text"
                  value={config.funderAddress}
                  onChange={(e) => handleConfigChange('funderAddress', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Market Token ID</label>
                <input
                  type="text"
                  value={config.tokenId}
                  onChange={(e) => handleConfigChange('tokenId', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Paste token ID from Polymarket"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Buy Threshold ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.buyThreshold}
                    onChange={(e) => handleConfigChange('buyThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sell Threshold ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.sellThreshold}
                    onChange={(e) => handleConfigChange('sellThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Trade Size (USDC)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={config.tradeSize}
                    onChange={(e) => handleConfigChange('tradeSize', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Check Interval (sec)</label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={config.checkInterval}
                    onChange={(e) => handleConfigChange('checkInterval', parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {botState?.running ? (
                  <button
                    onClick={stopBot}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                    Stop Bot
                  </button>
                ) : (
                  <button
                    onClick={startBot}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    Start Bot
                  </button>
                )}
                <button
                  onClick={runCheck}
                  disabled={loading || !botState?.running}
                  className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Trade History</h2>
              </div>
              <button
                onClick={clearHistory}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {botState?.history && botState.history.length > 0 ? (
                botState.history.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      entry.action === 'buy' ? 'bg-green-900/20 border border-green-500/20' :
                      entry.action === 'sell' ? 'bg-amber-900/20 border border-amber-500/20' :
                      entry.action === 'error' ? 'bg-red-900/20 border border-red-500/20' :
                      'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    {getActionIcon(entry.action)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white break-words">{entry.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{formatTime(entry.timestamp)}</span>
                        {entry.price !== undefined && <span>${entry.price.toFixed(4)}</span>}
                        {entry.size !== undefined && <span>{entry.size} shares</span>}
                      </div>
                    </div>
                    {entry.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No trade history yet</p>
                  <p className="text-sm">Start the bot to begin trading</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Bot checks price every {config.checkInterval} seconds when running.</p>
          <p>Buys when price ≤ ${config.buyThreshold} | Sells when price ≥ ${config.sellThreshold}</p>
        </div>
      </div>
    </div>
  );
}
