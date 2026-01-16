# 9jaStock Mobile App Setup Guide

This guide explains how to build and deploy the 9jaStock mobile app for iOS and Android using Capacitor.

## Prerequisites

### For iOS Development
- macOS computer
- Xcode 14+ (from Mac App Store)
- Apple Developer Account ($99/year for App Store distribution)
- CocoaPods: `sudo gem install cocoapods`

### For Android Development
- Android Studio (any OS)
- Java Development Kit (JDK) 17+
- Android SDK (installed via Android Studio)
- Google Play Developer Account ($25 one-time for Play Store distribution)

## Project Structure

```
9jastock/
├── ios/                    # iOS native project
├── android/                # Android native project
├── resources/              # App icons and splash screens
├── capacitor.config.ts     # Capacitor configuration
└── src/lib/mobile.ts       # Mobile utilities
```

## Configuration

### 1. Update Server URL

Edit `capacitor.config.ts` and set your production URL:

```typescript
const PRODUCTION_URL = 'https://your-actual-9jastock-domain.com';
```

### 2. App Icons

Create your app icon as a 1024x1024 PNG file and save it to `resources/icon.png`.

**iOS Icons** (place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`):
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

**Android Icons** (place in `android/app/src/main/res/`):
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

**Tip**: Use an online tool like [App Icon Generator](https://appicon.co/) to generate all sizes from a single 1024x1024 image.

### 3. Splash Screen

Create a splash screen image (2732x2732 PNG) at `resources/splash.png`.

**iOS**: Configure in Xcode under `App > Assets.xcassets > Splash`
**Android**: Edit `android/app/src/main/res/drawable/splash.xml`

## Development Commands

```bash
# Build web app and sync to native projects
npm run mobile:build

# Open iOS project in Xcode
npm run mobile:ios

# Open Android project in Android Studio
npm run mobile:android

# Sync web changes to native projects
npm run mobile:sync

# Run on iOS simulator
npm run mobile:run:ios

# Run on Android emulator
npm run mobile:run:android
```

## Building for iOS

1. Open the iOS project:
   ```bash
   npm run mobile:ios
   ```

2. In Xcode:
   - Select your development team under "Signing & Capabilities"
   - Select a target device or simulator
   - Click the Play button to build and run

3. For App Store submission:
   - Product → Archive
   - Distribute App → App Store Connect

### iOS Info.plist Permissions

Add these to `ios/App/App/Info.plist` if using native features:

```xml
<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<!-- Camera (if needed) -->
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan documents</string>
```

## Building for Android

1. Open the Android project:
   ```bash
   npm run mobile:android
   ```

2. In Android Studio:
   - Wait for Gradle sync to complete
   - Select a device/emulator
   - Click the Run button

3. For Play Store submission:
   - Build → Generate Signed Bundle/APK
   - Choose Android App Bundle (AAB) for Play Store

### Android Permissions

Edit `android/app/src/main/AndroidManifest.xml` if needed:

```xml
<!-- Internet (already included) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Push Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Using Mobile Features in Your App

### Share Stock Information

```tsx
import { useMobile } from '@/hooks/useMobile';

function StockCard({ symbol, name, price, change }) {
  const { shareStock, isNative } = useMobile();

  return (
    <div>
      <h2>{name}</h2>
      <p>₦{price}</p>
      <button onClick={() => shareStock(symbol, name, price, change)}>
        Share
      </button>
    </div>
  );
}
```

### Share Portfolio

```tsx
import { useMobile } from '@/hooks/useMobile';

function PortfolioPage({ shareId }) {
  const { sharePortfolio } = useMobile();

  return (
    <button onClick={() => sharePortfolio(shareId)}>
      Share My Portfolio
    </button>
  );
}
```

### Open External Links

```tsx
import { useMobile } from '@/hooks/useMobile';

function NewsArticle({ url }) {
  const { openLink } = useMobile();

  return (
    <button onClick={() => openLink(url)}>
      Read Full Article
    </button>
  );
}
```

### Detect Platform

```tsx
import { useMobile } from '@/hooks/useMobile';

function App() {
  const { isNative, platform } = useMobile();

  return (
    <div>
      {isNative ? (
        <p>Running on {platform}</p>
      ) : (
        <p>Running on web</p>
      )}
    </div>
  );
}
```

## Push Notifications Setup

### iOS (APNs)
1. Enable Push Notifications in Xcode capabilities
2. Create APNs key in Apple Developer Portal
3. Configure your backend with the APNs key

### Android (FCM)
1. Create a Firebase project at console.firebase.google.com
2. Add your Android app to Firebase
3. Download `google-services.json` to `android/app/`
4. Configure your backend with FCM server key

### Backend Implementation

Create `/api/push-token/route.ts` to store device tokens:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, platform } = await request.json();

  // Store token in your database linked to the user
  // Use this token to send push notifications

  return NextResponse.json({ success: true });
}
```

## Troubleshooting

### "Unable to load URL" on startup
- Ensure your production URL is accessible
- Check that HTTPS is properly configured
- Verify the URL in `capacitor.config.ts`

### iOS build fails
- Run `cd ios && pod install` to install dependencies
- Clean build folder: Xcode → Product → Clean Build Folder

### Android build fails
- Sync Gradle: File → Sync Project with Gradle Files
- Invalidate caches: File → Invalidate Caches and Restart

### Push notifications not working
- Verify permissions are granted
- Check that tokens are being sent to your server
- Test with Firebase Console (Android) or APNs tools (iOS)

## App Store Submission Checklist

### iOS (App Store)
- [ ] App icons (all sizes)
- [ ] Screenshots (6.5", 5.5" iPhones, iPad)
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire

### Android (Play Store)
- [ ] App icons (all sizes)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone and tablet)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target SDK declaration

## Version Updates

When updating your app:

1. Update version in `package.json`
2. Update iOS version in Xcode (General → Identity)
3. Update Android version in `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```
4. Run `npm run mobile:build` to sync changes
5. Build and submit new versions to stores
