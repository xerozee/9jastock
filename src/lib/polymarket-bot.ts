import { ClobClient, Side } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

export interface BotConfig {
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  privateKey: string;
  funderAddress?: string;
  tokenId: string;
  buyThreshold: number;
  sellThreshold: number;
  tradeSize: number;
  checkInterval: number;
}

export interface TradeHistoryEntry {
  id: string;
  timestamp: Date;
  action: 'buy' | 'sell' | 'info' | 'error';
  message: string;
  price?: number;
  size?: number;
  success: boolean;
}

export interface BotState {
  running: boolean;
  config: BotConfig | null;
  position: number;
  lastPrice: number | null;
  history: TradeHistoryEntry[];
  lastCheck: Date | null;
  error: string | null;
}

const botState: BotState = {
  running: false,
  config: null,
  position: 0,
  lastPrice: null,
  history: [],
  lastCheck: null,
  error: null,
};

const MAX_HISTORY = 100;

function addHistoryEntry(entry: Omit<TradeHistoryEntry, 'id' | 'timestamp'>) {
  const newEntry: TradeHistoryEntry = {
    ...entry,
    id: Math.random().toString(36).substring(7),
    timestamp: new Date(),
  };
  botState.history.unshift(newEntry);
  if (botState.history.length > MAX_HISTORY) {
    botState.history = botState.history.slice(0, MAX_HISTORY);
  }
  return newEntry;
}

function createClobClient(config: BotConfig): ClobClient {
  const host = 'https://clob.polymarket.com';
  const chainId = 137;
  
  const wallet = new Wallet(config.privateKey);
  
  const creds = {
    key: config.apiKey,
    secret: config.apiSecret,
    passphrase: config.apiPassphrase,
  };
  
  // Cast wallet to any to handle ethers v6 compatibility
  return new ClobClient(host, chainId, wallet as any, creds, undefined, config.funderAddress);
}

export async function getPrice(config: BotConfig): Promise<number> {
  try {
    const client = createClobClient(config);
    const orderBook = await client.getOrderBook(config.tokenId);
    
    if (orderBook.bids && orderBook.bids.length > 0) {
      const bestBid = parseFloat(orderBook.bids[0].price);
      const bestAsk = orderBook.asks && orderBook.asks.length > 0 
        ? parseFloat(orderBook.asks[0].price) 
        : bestBid;
      return (bestBid + bestAsk) / 2;
    }
    
    if (orderBook.asks && orderBook.asks.length > 0) {
      return parseFloat(orderBook.asks[0].price);
    }
    
    throw new Error('No order book data available');
  } catch (error) {
    throw new Error(`Failed to get price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeTrade(
  config: BotConfig,
  side: 'buy' | 'sell',
  size: number
): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    const client = createClobClient(config);
    
    const orderBook = await client.getOrderBook(config.tokenId);
    let price: number;
    
    if (side === 'buy') {
      if (!orderBook.asks || orderBook.asks.length === 0) {
        throw new Error('No asks available for buying');
      }
      price = parseFloat(orderBook.asks[0].price);
    } else {
      if (!orderBook.bids || orderBook.bids.length === 0) {
        throw new Error('No bids available for selling');
      }
      price = parseFloat(orderBook.bids[0].price);
    }
    
    const order = await client.createOrder({
      tokenID: config.tokenId,
      price: price,
      size: size,
      side: side === 'buy' ? Side.BUY : Side.SELL,
    });
    
    const response = await client.postOrder(order);
    
    return {
      success: true,
      message: `${side.toUpperCase()} order placed at $${price.toFixed(4)} for ${size} shares`,
      orderId: response.orderID,
    };
  } catch (error) {
    return {
      success: false,
      message: `Trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function startBot(config: BotConfig): { success: boolean; message: string } {
  if (botState.running) {
    return { success: false, message: 'Bot is already running' };
  }
  
  if (!config.apiKey || !config.apiSecret || !config.apiPassphrase || !config.privateKey || !config.tokenId) {
    return { success: false, message: 'Missing required configuration fields' };
  }
  
  if (config.buyThreshold >= config.sellThreshold) {
    return { success: false, message: 'Buy threshold must be less than sell threshold' };
  }
  
  botState.config = config;
  botState.running = true;
  botState.error = null;
  
  addHistoryEntry({
    action: 'info',
    message: `Bot started. Buy at ≤$${config.buyThreshold}, Sell at ≥$${config.sellThreshold}`,
    success: true,
  });
  
  return { success: true, message: 'Bot started successfully' };
}

export function stopBot(): { success: boolean; message: string } {
  if (!botState.running) {
    return { success: false, message: 'Bot is not running' };
  }
  
  botState.running = false;
  
  addHistoryEntry({
    action: 'info',
    message: 'Bot stopped',
    success: true,
  });
  
  return { success: true, message: 'Bot stopped successfully' };
}

export async function checkAndTrade(): Promise<{ 
  executed: boolean; 
  action?: 'buy' | 'sell'; 
  price: number;
  message: string;
}> {
  if (!botState.running || !botState.config) {
    return { executed: false, price: 0, message: 'Bot is not running' };
  }
  
  try {
    const price = await getPrice(botState.config);
    botState.lastPrice = price;
    botState.lastCheck = new Date();
    botState.error = null;
    
    const config = botState.config;
    
    if (price <= config.buyThreshold && botState.position === 0) {
      addHistoryEntry({
        action: 'info',
        message: `Price $${price.toFixed(4)} ≤ buy threshold $${config.buyThreshold}. Attempting to buy...`,
        price,
        success: true,
      });
      
      const result = await executeTrade(config, 'buy', config.tradeSize);
      
      if (result.success) {
        botState.position = config.tradeSize;
        addHistoryEntry({
          action: 'buy',
          message: result.message,
          price,
          size: config.tradeSize,
          success: true,
        });
        return { executed: true, action: 'buy', price, message: result.message };
      } else {
        addHistoryEntry({
          action: 'error',
          message: result.message,
          price,
          success: false,
        });
        return { executed: false, price, message: result.message };
      }
    }
    
    if (price >= config.sellThreshold && botState.position > 0) {
      addHistoryEntry({
        action: 'info',
        message: `Price $${price.toFixed(4)} ≥ sell threshold $${config.sellThreshold}. Attempting to sell...`,
        price,
        success: true,
      });
      
      const result = await executeTrade(config, 'sell', botState.position);
      
      if (result.success) {
        const soldPosition = botState.position;
        botState.position = 0;
        addHistoryEntry({
          action: 'sell',
          message: result.message,
          price,
          size: soldPosition,
          success: true,
        });
        return { executed: true, action: 'sell', price, message: result.message };
      } else {
        addHistoryEntry({
          action: 'error',
          message: result.message,
          price,
          success: false,
        });
        return { executed: false, price, message: result.message };
      }
    }
    
    return { 
      executed: false, 
      price, 
      message: `Price $${price.toFixed(4)} - no action needed (position: ${botState.position})` 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    botState.error = errorMessage;
    addHistoryEntry({
      action: 'error',
      message: `Check failed: ${errorMessage}`,
      success: false,
    });
    return { executed: false, price: 0, message: errorMessage };
  }
}

export function getBotState(): BotState {
  return {
    ...botState,
    config: botState.config ? { ...botState.config, privateKey: '***', apiSecret: '***' } : null,
    history: [...botState.history],
  };
}

export function getHistory(): TradeHistoryEntry[] {
  return [...botState.history];
}

export function clearHistory(): void {
  botState.history = [];
  addHistoryEntry({
    action: 'info',
    message: 'History cleared',
    success: true,
  });
}

export function setPosition(position: number): void {
  botState.position = position;
  addHistoryEntry({
    action: 'info',
    message: `Position manually set to ${position}`,
    success: true,
  });
}
