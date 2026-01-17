import webpush from 'web-push';
import { connectToDatabase, PushSubscription, PriceAlert } from './mongodb';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = 'mailto:support@9jastock.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'price_alert' | 'daily_summary' | 'breaking_news' | 'watchlist' | 'general';
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

function getPreferenceKey(type: NotificationPayload['type']): string | null {
  switch (type) {
    case 'price_alert': return 'preferences.priceAlerts';
    case 'daily_summary': return 'preferences.dailySummary';
    case 'breaking_news': return 'preferences.breakingNews';
    case 'watchlist': return 'preferences.watchlistUpdates';
    default: return null;
  }
}

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  await connectToDatabase();
  
  const preferenceKey = getPreferenceKey(payload.type);
  const query: Record<string, any> = { userId };
  
  if (preferenceKey) {
    query[preferenceKey] = true;
  }
  
  const subscriptions = await PushSubscription.find(query).lean();
  
  if (!subscriptions.length) {
    return { success: false, sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      sent++;
    } catch (error: any) {
      console.error(`Push notification failed for ${sub.endpoint}:`, error.message);
      
      if (error.statusCode === 404 || error.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: sub._id });
        console.log('Removed invalid subscription');
      }
      failed++;
    }
  }

  return { success: sent > 0, sent, failed };
}

export async function sendPriceAlertNotification(
  userId: string,
  symbol: string,
  currentPrice: number,
  targetPrice: number,
  condition: 'above' | 'below'
): Promise<void> {
  const direction = condition === 'above' ? 'risen above' : 'fallen below';
  
  await sendPushNotification(userId, {
    title: `Price Alert: ${symbol}`,
    body: `${symbol} has ${direction} ₦${targetPrice.toLocaleString()}! Current price: ₦${currentPrice.toLocaleString()}`,
    url: `/stocks/${symbol}`,
    type: 'price_alert',
    tag: `price-alert-${symbol}`,
    actions: [
      { action: 'view', title: 'View Stock' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
}

export async function sendDailySummaryNotification(
  userId: string,
  topGainer: { symbol: string; change: number },
  topLoser: { symbol: string; change: number },
  portfolioChange: number
): Promise<void> {
  const portfolioDirection = portfolioChange >= 0 ? 'up' : 'down';
  const portfolioEmoji = portfolioChange >= 0 ? '📈' : '📉';
  
  await sendPushNotification(userId, {
    title: `${portfolioEmoji} Daily Market Summary`,
    body: `Your portfolio is ${portfolioDirection} ${Math.abs(portfolioChange).toFixed(2)}%. Top gainer: ${topGainer.symbol} (+${topGainer.change.toFixed(2)}%). Top loser: ${topLoser.symbol} (${topLoser.change.toFixed(2)}%)`,
    url: '/portfolio',
    type: 'daily_summary',
    tag: 'daily-summary',
  });
}

export async function sendBreakingNewsNotification(
  userIds: string[],
  headline: string,
  source: string,
  stockMentions: string[] = []
): Promise<void> {
  for (const userId of userIds) {
    await sendPushNotification(userId, {
      title: `Breaking: ${source}`,
      body: headline,
      url: stockMentions.length ? `/stocks/${stockMentions[0]}` : '/',
      type: 'breaking_news',
      tag: 'breaking-news',
    });
  }
}

export async function checkPriceAlerts(
  stockPrices: Array<{ symbol: string; price: number }>
): Promise<number> {
  await connectToDatabase();
  
  let alertsTriggered = 0;
  
  for (const stock of stockPrices) {
    const alerts = await PriceAlert.find({
      symbol: stock.symbol,
      isActive: true,
      triggered: false,
    }).lean();
    
    for (const alert of alerts) {
      const shouldTrigger = 
        (alert.condition === 'above' && stock.price >= alert.targetPrice) ||
        (alert.condition === 'below' && stock.price <= alert.targetPrice);
      
      if (shouldTrigger) {
        await PriceAlert.updateOne(
          { _id: alert._id },
          { 
            triggered: true, 
            triggeredAt: new Date(), 
            triggeredPrice: stock.price 
          }
        );
        
        await sendPriceAlertNotification(
          alert.userId.toString(),
          stock.symbol,
          stock.price,
          alert.targetPrice,
          alert.condition
        );
        
        alertsTriggered++;
      }
    }
  }
  
  return alertsTriggered;
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY || '';
}
