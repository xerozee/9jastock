import type { CapacitorConfig } from '@capacitor/cli';

// Set your production URL here when deploying
const PRODUCTION_URL = process.env.CAPACITOR_SERVER_URL || 'https://your-9jastock-domain.com';

const config: CapacitorConfig = {
  appId: 'com.nijastock.app',
  appName: '9jaStock',
  webDir: 'out',
  server: {
    // The mobile app will load from your hosted website
    // Update PRODUCTION_URL to your actual deployed domain
    url: PRODUCTION_URL,
    cleartext: true,
    // Allow navigation to external URLs
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#10b981',
    },
    StatusBar: {
      backgroundColor: '#1a1a2e',
      style: 'DARK',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: '9jastock',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
