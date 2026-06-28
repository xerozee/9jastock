# 9JASTOCK: Mobile App Store Deployment Guide

## Overview

This guide walks you through deploying 9jastock to Google Play Store and Apple App Store using Capacitor.

**Approach:** Wrap the Next.js web app in a native shell using Capacitor
**Result:** Native apps for iOS and Android that load your web app
**Benefits:** One codebase, native app store presence, push notifications, offline support

---

## Prerequisites

### Accounts Needed
- [x] Google Play Developer Account ($25 one-time) - You have this
- [x] Apple Developer Account ($99/year) - You have this
- [ ] Your web app deployed and accessible via HTTPS URL

### Tools Needed (Install on your local machine, not Replit)
- Node.js 18+
- Android Studio (for Android builds)
- Xcode (for iOS builds - Mac only)
- Capacitor CLI

---

## Phase 1: Prepare Your Next.js App for Capacitor

### Step 1.1: Configure Next.js for Static/Hybrid Export

Capacitor needs either:
- A static export of your app, OR
- A URL pointing to your deployed web app

**Option A: Point to Live URL (Recommended for your case)**
Since 9jastock has API routes and dynamic features, you'll point the native app to your live website.

**Option B: Static Export (For simpler apps)**
Not recommended for 9jastock due to API routes.

### Step 1.2: Update next.config.js

Add configuration for mobile compatibility:

```javascript
// next.config.js
const nextConfig = {
  // ... existing config

  // For static export (if using Option B)
  // output: 'export',

  // Ensure assets work in mobile
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL || '',

  // Mobile viewport settings handled in _document or layout
};

module.exports = nextConfig;
```

### Step 1.3: Ensure Mobile-Friendly Meta Tags

In your root layout.tsx or _app.tsx:

```tsx
// src/app/layout.tsx
export const metadata = {
  title: '9jastock',
  description: 'Nigerian Stock Investment Companion',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevents zoom on input focus
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '9jastock',
  },
  formatDetection: {
    telephone: false, // Prevents phone number detection
  },
};
```

### Step 1.4: Verify PWA Manifest

Ensure your manifest.json is complete:

```json
// public/manifest.json
{
  "name": "9jastock",
  "short_name": "9jastock",
  "description": "Nigerian Stock Investment Companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## Phase 2: Set Up Capacitor

### Step 2.1: Install Capacitor (On Local Machine)

```bash
# Clone your repo locally (not on Replit)
git clone https://github.com/xerozee/9jastock.git
cd 9jastock

# Install dependencies
npm install

# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init "9jastock" "com.9jastock.app" --web-dir=out
```

### Step 2.2: Create Capacitor Config

Create `capacitor.config.ts` in your project root:

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nijastock.app', // Use reverse domain notation
  appName: '9jastock',
  webDir: 'out', // For static export

  // OR point to your live URL (recommended for your app)
  server: {
    url: 'https://your-9jastock-url.repl.co', // Your live Replit URL
    cleartext: false, // Set to true only for HTTP (not recommended)
  },

  // iOS specific settings
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: '9jastock',
  },

  // Android specific settings
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set to true for debugging
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

### Step 2.3: Install Platform Plugins

```bash
# Install core plugins
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
npm install @capacitor/push-notifications @capacitor/browser @capacitor/share

# Add platforms
npx cap add android
npx cap add ios
```

---

## Phase 3: Android (Google Play Store)

### Step 3.1: Setup Android Studio

1. Download and install Android Studio: https://developer.android.com/studio
2. During setup, install:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (AVD)

### Step 3.2: Open Android Project

```bash
# Sync your web app to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 3.3: Configure Android App

In Android Studio, edit these files:

**android/app/src/main/res/values/strings.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">9jastock</string>
    <string name="title_activity_main">9jastock</string>
    <string name="package_name">com.nijastock.app</string>
    <string name="custom_url_scheme">com.nijastock.app</string>
</resources>
```

**android/app/src/main/AndroidManifest.xml** - Add permissions:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- For push notifications -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <!-- Main Activity -->
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="9jastock.com" />
            </intent-filter>

        </activity>
    </application>
</manifest>
```

### Step 3.4: Add App Icons

Create icons at these sizes and place in `android/app/src/main/res/`:

| Folder | Size | File |
|--------|------|------|
| mipmap-mdpi | 48x48 | ic_launcher.png |
| mipmap-hdpi | 72x72 | ic_launcher.png |
| mipmap-xhdpi | 96x96 | ic_launcher.png |
| mipmap-xxhdpi | 144x144 | ic_launcher.png |
| mipmap-xxxhdpi | 192x192 | ic_launcher.png |

**Tip:** Use Android Studio's Image Asset Studio:
1. Right-click `res` folder → New → Image Asset
2. Select your high-res icon (512x512 recommended)
3. Android Studio generates all sizes automatically

### Step 3.5: Add Splash Screen

Create splash screen image and place in:
`android/app/src/main/res/drawable/splash.png`

### Step 3.6: Build Signed APK/AAB

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select "Android App Bundle" (AAB) for Play Store
3. Create a new keystore or use existing:
   - Keystore path: Choose a secure location
   - Password: Create strong password
   - Alias: 9jastock
   - Validity: 25 years
4. Select "release" build variant
5. Click "Create"

**IMPORTANT:** Save your keystore file and passwords securely! You need the same keystore for all future updates.

### Step 3.7: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create new app:
   - App name: 9jastock
   - Default language: English
   - App or game: App
   - Free or paid: Free (with in-app purchases)
3. Complete store listing:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (phone, tablet, if applicable)
   - Feature graphic (1024x500)
   - App icon (512x512)
4. Set up app content:
   - Privacy policy URL
   - App access (if login required)
   - Ads declaration
   - Content rating questionnaire
   - Target audience
   - Data safety form
5. Upload AAB file to Production or Internal Testing track
6. Review and roll out

---

## Phase 4: iOS (Apple App Store)

### Step 4.1: Requirements (Mac Required)

- Mac computer with macOS
- Xcode 14+ installed from Mac App Store
- Apple Developer account enrolled

### Step 4.2: Open iOS Project

```bash
# Sync your web app to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Step 4.3: Configure iOS App in Xcode

1. Select the project in Xcode navigator
2. Select your app target
3. Go to "Signing & Capabilities" tab:
   - Team: Select your Apple Developer team
   - Bundle Identifier: com.nijastock.app
   - Enable "Automatically manage signing"

4. Go to "General" tab:
   - Display Name: 9jastock
   - Version: 1.0.0
   - Build: 1

### Step 4.4: Add App Icons

1. In Xcode, open Assets.xcassets
2. Select AppIcon
3. Drag your icons to each slot, or use a single 1024x1024 icon

Required sizes:
| Size | Usage |
|------|-------|
| 20x20 @2x, @3x | Notifications |
| 29x29 @2x, @3x | Settings |
| 40x40 @2x, @3x | Spotlight |
| 60x60 @2x, @3x | App icon |
| 1024x1024 | App Store |

### Step 4.5: Configure Info.plist

Add these entries to `ios/App/App/Info.plist`:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>

<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>

<key>UIViewControllerBasedStatusBarAppearance</key>
<true/>

<!-- Camera permission (if needed) -->
<key>NSCameraUsageDescription</key>
<string>9jastock needs camera access to scan documents</string>

<!-- Push notifications -->
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

### Step 4.6: Add Launch Screen

1. Open LaunchScreen.storyboard in Xcode
2. Design your launch screen with logo and background color
3. Or use Launch Screen configuration in project settings

### Step 4.7: Build and Archive

1. Select "Any iOS Device" as build target
2. Product → Archive
3. Once archived, click "Distribute App"
4. Select "App Store Connect"
5. Follow prompts to upload

### Step 4.8: Submit to App Store Connect

1. Go to https://appstoreconnect.apple.com
2. My Apps → Create new app:
   - Platform: iOS
   - Name: 9jastock
   - Primary language: English
   - Bundle ID: com.nijastock.app
   - SKU: 9jastock-ios
3. Complete app information:
   - Privacy policy URL
   - Category: Finance
   - Subcategory: Investing
4. Add screenshots:
   - 6.7" (iPhone 14 Pro Max): 1290 x 2796
   - 6.5" (iPhone 11 Pro Max): 1242 x 2688
   - 5.5" (iPhone 8 Plus): 1242 x 2208
   - iPad Pro 12.9": 2048 x 2732 (if supporting iPad)
5. Add app previews (optional but recommended)
6. Submit for review

---

## Phase 5: App Store Assets Needed

### Required Graphics

| Asset | Size | Format | Where |
|-------|------|--------|-------|
| App Icon | 1024x1024 | PNG (no alpha) | Both stores |
| Feature Graphic | 1024x500 | PNG/JPG | Google Play |
| Phone Screenshots | Various | PNG/JPG | Both stores |
| Tablet Screenshots | Various | PNG/JPG | If supporting |

### Required Text

**App Name:** 9jastock (30 chars max)

**Short Description (80 chars):**
```
Track Nigerian stocks, get AI analysis & build your portfolio. Invest smarter.
```

**Full Description (4000 chars):**
```
9jastock is the smartest way to invest in Nigeria's future.

🇳🇬 BUILT FOR NIGERIAN INVESTORS
Track all 145+ stocks on the Nigerian Stock Exchange with real-time data, professional analysis tools, and AI-powered insights.

📊 REAL-TIME MARKET DATA
• Live prices for all NGX stocks
• Market indices (ASI, NGX 30, Banking, Oil & Gas)
• Top gainers, losers, and most active stocks
• 52-week highs and lows

🤖 AI-POWERED ANALYSIS
• Get instant AI analysis on any stock
• Personalized recommendations based on your profile
• Technical indicators explained in plain English
• Buy/sell signals backed by data

💼 PORTFOLIO TRACKING
• Track all your holdings in one place
• See real-time gains and losses
• Multiple purchase tracking per stock
• Cost basis and average price calculations
• Share your portfolio with friends

🔔 NEVER MISS A MOVE
• Set price alerts for any stock
• Get notified when targets are hit
• Breaking market news
• Social sentiment from Twitter and Reddit

📈 PROFESSIONAL TOOLS
• Technical indicators (RSI, MACD, Bollinger Bands)
• Interactive TradingView charts
• Fundamental analysis (P/E, EPS, ROE)
• Sector-by-sector breakdown

🎓 LEARN AS YOU INVEST
Whether you're a beginner or experienced investor, 9jastock helps you make smarter decisions with clear explanations and educational content.

COMING SOON:
• Global market access (US, UK stocks)
• Dividend tracking
• Corporate actions alerts
• Goal-based investing
• Investment academy

Start your 7-day free trial today. Join thousands of Nigerians investing smarter with 9jastock.

Note: 9jastock is not a stockbroker. We provide information and tools for educational purposes. Always do your own research before making investment decisions.
```

**Keywords (100 chars, comma-separated):**
```
stocks,Nigerian stocks,NGX,investing,portfolio,stock tracker,finance,trading,market,naija
```

**Privacy Policy URL:** https://your-domain.com/privacy

**Support URL:** https://your-domain.com/support

---

## Phase 6: Alternative Quick Method (PWA Builder)

If you want a faster path for Android specifically:

### Option: PWABuilder (Android Only - Faster)

1. Go to https://www.pwabuilder.com
2. Enter your website URL
3. Click "Build My PWA"
4. Download Android package
5. Upload to Google Play

This creates a TWA (Trusted Web Activity) wrapper - simpler but fewer native features.

---

## Replit Limitations

**Important:** Replit cannot build native mobile apps directly because:
- No Android Studio
- No Xcode (requires Mac)
- No iOS simulator
- No Android emulator

**Replit's Role:**
- Host your web app (the content inside the native wrapper)
- Store your source code
- Run your Next.js server

**You Need Locally:**
- Mac for iOS builds (required)
- Any computer for Android builds
- Or use cloud build services (see below)

---

## Cloud Build Services (No Local Setup)

If you don't want to install Android Studio/Xcode locally:

### Expo EAS Build (Recommended)
```bash
# Convert to Expo project or use standalone EAS
npm install -g eas-cli
eas build -p android
eas build -p ios
```

### Ionic Appflow
- https://ionic.io/appflow
- Cloud builds for Capacitor apps
- Costs money but no local setup needed

### Codemagic
- https://codemagic.io
- CI/CD for mobile apps
- Free tier available

---

## Checklist Before Submission

### Both Platforms
- [ ] App icon at all required sizes
- [ ] Screenshots for all required device sizes
- [ ] Privacy policy URL live and accessible
- [ ] Terms of service URL
- [ ] App description written
- [ ] Keywords/tags defined
- [ ] Contact email set
- [ ] Support URL set

### Google Play Specific
- [ ] Feature graphic (1024x500)
- [ ] Data safety form completed
- [ ] Content rating questionnaire
- [ ] Target audience declaration
- [ ] Signed AAB file ready

### Apple App Store Specific
- [ ] App previews (optional but recommended)
- [ ] Age rating questionnaire
- [ ] Export compliance (encryption)
- [ ] Sign in with Apple (if using Apple auth)
- [ ] Provisioning profiles set up

---

## Timeline Estimate

| Task | Time |
|------|------|
| Prepare web app | 1-2 hours |
| Set up Capacitor | 1-2 hours |
| Configure Android | 2-3 hours |
| Build & test Android | 1-2 hours |
| Google Play submission | 1-2 hours |
| Configure iOS | 2-3 hours |
| Build & test iOS | 1-2 hours |
| App Store submission | 1-2 hours |
| **Total** | **10-18 hours** |

### Review Times
- Google Play: 1-3 days (sometimes hours)
- Apple App Store: 1-7 days (sometimes longer)

---

## Support & Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Google Play Console Help: https://support.google.com/googleplay/android-developer
- App Store Connect Help: https://developer.apple.com/help/app-store-connect
- PWABuilder: https://www.pwabuilder.com

---

*Good luck with your app store launch! 🚀*
