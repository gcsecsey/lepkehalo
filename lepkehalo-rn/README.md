# Lepkeháló React Native

Cross-platform React Native app for scanning book barcodes and looking them up on [Moly.hu](https://moly.hu).

## Prerequisites

- Node.js 18+
- npm or yarn
- For iOS: Xcode 15+ and CocoaPods
- For Android: Android Studio with SDK 30+

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Run Specific Test Suites

```bash
# Book type tests
npm test -- __tests__/types/book.test.ts

# Storage service tests
npm test -- __tests__/services/storage.test.ts

# Zustand store tests
npm test -- __tests__/stores/bookStore.test.ts

# MSW API mocking tests
npm test -- __tests__/msw.test.ts
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
lepkehalo-rn/
├── src/
│   ├── app/                 # App entry, providers
│   ├── screens/             # Screen components
│   ├── components/          # Reusable components
│   ├── services/            # API and storage services
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript interfaces
│   ├── hooks/               # Custom React hooks
│   └── constants/           # App constants
├── __tests__/               # Unit tests
├── __mocks__/               # Jest mock modules
├── e2e/                     # Detox E2E tests
├── .github/workflows/       # CI/CD pipelines
└── docs/                    # Documentation
```

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Testing**: Jest, React Native Testing Library, MSW, Detox
- **CI/CD**: GitHub Actions

## Documentation

- [Migration Plan](./docs/MIGRATION_PLAN.md)
- [Testing Strategy](./docs/TESTING_STRATEGY.md)
