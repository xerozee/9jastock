import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Check if the app is running in a native mobile context
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get the current platform
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Share stock or portfolio information
 */
export const shareContent = async (options: {
  title: string;
  text: string;
  url?: string;
}) => {
  if (isNative()) {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: 'Share via',
    });
  } else {
    // Fallback for web
    if (navigator.share) {
      await navigator.share(options);
    } else {
      // Copy to clipboard as fallback
      await navigator.clipboard.writeText(
        `${options.title}\n${options.text}\n${options.url || ''}`
      );
    }
  }
};

/**
 * Share a stock
 */
export const shareStock = async (symbol: string, name: string, price: number, change: number) => {
  const changeText = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  await shareContent({
    title: `${symbol} - ${name}`,
    text: `Check out ${name} (${symbol}) on 9jaStock!\nCurrent Price: ₦${price.toLocaleString()}\nChange: ${changeText}`,
    url: `https://your-9jastock-domain.com/stocks/${symbol}`,
  });
};

/**
 * Share portfolio
 */
export const sharePortfolio = async (shareId: string) => {
  await shareContent({
    title: 'My 9jaStock Portfolio',
    text: 'Check out my investment portfolio on 9jaStock!',
    url: `https://your-9jastock-domain.com/portfolio/share/${shareId}`,
  });
};

/**
 * Open external link in browser
 */
export const openExternalLink = async (url: string) => {
  if (isNative()) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Initialize push notifications
 */
export const initPushNotifications = async () => {
  if (!isNative()) return;

  // Request permission
  const permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.log('Push notification permission not granted');
    return;
  }

  // Register for push notifications
  await PushNotifications.register();

  // Listen for registration success
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token:', token.value);
    // Send token to your server for push notifications
    sendPushTokenToServer(token.value);
  });

  // Listen for registration errors
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error.error);
  });

  // Listen for push notifications received
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  // Listen for push notification action (tap)
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action:', notification);
    // Handle navigation based on notification data
    handlePushNotificationAction(notification.notification.data);
  });
};

/**
 * Send push token to server for notifications
 */
const sendPushTokenToServer = async (token: string) => {
  try {
    await fetch('/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: getPlatform() }),
    });
  } catch (error) {
    console.error('Failed to send push token:', error);
  }
};

/**
 * Handle push notification tap action
 */
const handlePushNotificationAction = (data: Record<string, unknown>) => {
  if (data.type === 'stock_alert' && data.symbol) {
    window.location.href = `/stocks/${data.symbol}`;
  } else if (data.type === 'news' && data.articleId) {
    window.location.href = `/blog/${data.articleId}`;
  }
};

/**
 * Configure status bar for native apps
 */
export const configureStatusBar = async (isDark: boolean) => {
  if (!isNative()) return;

  await StatusBar.setStyle({
    style: isDark ? Style.Dark : Style.Light,
  });

  if (getPlatform() === 'android') {
    await StatusBar.setBackgroundColor({
      color: isDark ? '#1a1a2e' : '#ffffff',
    });
  }
};

/**
 * Hide splash screen
 */
export const hideSplashScreen = async () => {
  if (!isNative()) return;
  await SplashScreen.hide();
};

/**
 * Show splash screen
 */
export const showSplashScreen = async () => {
  if (!isNative()) return;
  await SplashScreen.show();
};

/**
 * Keyboard utilities
 */
export const keyboardUtils = {
  hide: async () => {
    if (isNative()) {
      await Keyboard.hide();
    }
  },
  addShowListener: (callback: () => void) => {
    if (isNative()) {
      Keyboard.addListener('keyboardWillShow', callback);
    }
  },
  addHideListener: (callback: () => void) => {
    if (isNative()) {
      Keyboard.addListener('keyboardWillHide', callback);
    }
  },
};

/**
 * Initialize all mobile features
 */
export const initMobileApp = async () => {
  if (!isNative()) return;

  try {
    // Initialize push notifications
    await initPushNotifications();

    // Configure status bar
    await configureStatusBar(true); // Default to dark mode

    // Hide splash screen after app is ready
    await hideSplashScreen();

    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};
