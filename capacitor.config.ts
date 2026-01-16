import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nijastock.app',
  appName: '9jaStock',
  webDir: 'out',
  server: {
    // For development, use your local server
    // url: 'http://localhost:3000',
    // cleartext: true,

    // For production, the app will load from the bundled files
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#10b981',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: '9jaStock',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
