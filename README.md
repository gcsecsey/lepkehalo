# Lepkeháló React Native

Cross-platform React Native app for scanning book barcodes and looking them up on [Moly.hu](https://moly.hu).

## Features

- Barcode scanning (EAN-13, EAN-8, UPC-A, UPC-E)
- Book lookup via Moly.hu API
- Persistent book list with swipe-to-delete
- Undo deleted books
- Open books in Chrome Custom Tabs (Android) / Safari View Controller (iOS)
- Haptic feedback on actions
- Accessibility support (VoiceOver/TalkBack)

## Prerequisites

- Node.js 18+
- npm or yarn

**For running on physical device:**
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device

**For running on simulators/emulators:**
- iOS Simulator: Xcode 15+ (macOS only)
- Android Emulator: Android Studio with SDK 34+

## Quick Start (Physical Device)

The fastest way to test the app is using Expo Go on your phone:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start
```

This will display a QR code in the terminal. Scan it with:
- **iOS**: Camera app → tap the notification
- **Android**: Expo Go app → Scan QR code

The app will load on your device over your local network.

### Tunnel Mode (if QR code doesn't work)

If your phone can't connect (different network, firewall issues), use tunnel mode:

```bash
npx expo start --tunnel
```

This routes traffic through Expo's servers (requires free Expo account).

## Running on Simulators

### iOS Simulator (macOS only)

```bash
# Requires Xcode to be installed
npx expo start --ios
```

### Android Emulator

```bash
# Requires Android Studio and an AVD configured
npx expo start --android
```

## Testing

### Unit Tests

```bash
# Run all tests (78 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run with limited workers (if memory issues)
npm test -- --maxWorkers=2
```

### Run Specific Test Suites

```bash
# Book type validation
npm test -- __tests__/types/book.test.ts

# Storage service (AsyncStorage)
npm test -- __tests__/services/storage.test.ts

# Zustand store (state management)
npm test -- __tests__/stores/bookStore.test.ts

# Moly.hu API client
npm test -- __tests__/services/molyApi.test.ts

# Home screen
npm test -- __tests__/screens/HomeScreen.test.ts

# Scanner screen
npm test -- __tests__/screens/ScannerScreen.test.ts

# Component tests
npm test -- __tests__/components/
```

### E2E Tests (Detox)

E2E tests require native builds:

```bash
# Generate native projects (required once)
npx expo prebuild

# iOS
npm run build:e2e:ios
npm run test:e2e:ios

# Android
npm run build:e2e:android
npm run test:e2e:android
```

## Project Structure

```
├── src/
│   ├── core/               # App entry, navigation
│   │   ├── App.tsx         # Root component
│   │   └── navigation/     # React Navigation setup
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx  # Book list
│   │   ├── ScannerScreen.tsx
│   │   └── ScannerScreenWrapper.tsx
│   ├── components/         # Reusable components
│   │   ├── BookListItem.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SwipeableRow.tsx
│   │   └── Snackbar.tsx
│   ├── services/           # API and storage
│   │   ├── molyApi.ts      # Moly.hu API client
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   └── browser.ts      # In-app browser
│   ├── stores/             # Zustand state
│   │   └── bookStore.ts
│   ├── types/              # TypeScript interfaces
│   │   └── book.ts
│   └── constants/          # Theme, config
│       └── theme.ts
├── __tests__/              # Unit tests
├── __mocks__/              # Jest mock modules
├── e2e/                    # Detox E2E tests
├── .github/workflows/      # CI/CD pipelines
└── docs/                   # Documentation
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native 0.81 with Expo 54 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (Native Stack) |
| State | Zustand 5 |
| Storage | AsyncStorage |
| Lists | FlashList (Shopify) |
| Camera | expo-camera |
| Gestures | react-native-gesture-handler |
| HTTP | Axios |
| Testing | Jest, React Native Testing Library, MSW v2 |
| E2E | Detox |
| CI/CD | GitHub Actions |

## Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS (Simulator build)
eas build --platform ios --profile preview

# Build for production (App Store / Play Store)
eas build --platform all --profile production
```

### Local Builds

```bash
# Generate native projects
npx expo prebuild

# Android
cd android && ./gradlew assembleRelease

# iOS (requires Xcode)
cd ios && xcodebuild -workspace Lepkehalo.xcworkspace -scheme Lepkehalo -configuration Release
```

## Troubleshooting

### "Metro bundler failed to start"
```bash
# Clear Metro cache
npx expo start --clear
```

### "Unable to resolve module"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Tests failing with memory issues
```bash
# Run with limited workers
npm test -- --maxWorkers=2
```

### Expo Go can't connect
1. Ensure phone and computer are on the same WiFi network
2. Try tunnel mode: `npx expo start --tunnel`
3. Check firewall isn't blocking port 8081

## Documentation

- [Migration Plan](./docs/MIGRATION_PLAN.md) - Architecture and implementation details
- [Testing Strategy](./docs/TESTING_STRATEGY.md) - TDD approach and test specifications

## License

Private - All rights reserved
