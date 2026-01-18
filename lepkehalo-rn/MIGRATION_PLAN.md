# Lepkeháló - React Native Migration Plan

## Executive Summary

This document outlines the migration strategy for Lepkeháló from a native Android app to a cross-platform React Native application supporting both iOS and Android. The goal is to maximize code sharing while leveraging native components for performance-critical features (barcode scanner, list views).

---

## Development Approach: Test-Driven Development (TDD)

We are following a **test-first approach** for this migration:

1. **Write tests first** - Tests serve as the specification
2. **Implement until green** - Build features to make tests pass
3. **Refactor** - Clean up while keeping tests green

### Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Jest + React Native Testing Library | Components, services, stores |
| **E2E Tests** | Detox | Full user flows on simulators/emulators |
| **API Mocking** | MSW (Mock Service Worker) | Consistent API responses |
| **CI/CD** | GitHub Actions | Automated tests on both platforms |

### Benefits for This Migration

- **No physical device required** - Tests run on simulators/emulators in CI
- **Feature parity verification** - Tests define expected behavior from original app
- **Regression prevention** - Catch issues before they reach production
- **Documentation** - Tests describe how features should work

See **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)** for detailed test specifications.

---

## Current App Analysis

### Features
1. **Barcode Scanner** - Real-time camera-based ISBN/EAN scanning
2. **Moly.hu API Integration** - Book lookup by ISBN
3. **Book List Management** - Persistent history with swipe-to-delete
4. **Chrome Custom Tabs** - Open books on moly.hu

### Tech Stack (Current)
- Kotlin/Java mixed codebase
- Google Play Services Vision (ML Kit) for barcode detection
- Volley for HTTP requests
- SharedPreferences + GSON for persistence
- RecyclerView with swipe gestures

---

## Migration Architecture

### Recommended Approach: React Native with Native Modules

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Navigation    │  │   State Mgmt    │  │   API Layer │ │
│  │ (React Nav 6+)  │  │    (Zustand)    │  │   (Axios)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Native Bridge Layer                       │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │   Barcode Scanner       │  │   Native List View        │ │
│  │   (Vision Camera +      │  │   (Optional - FlashList   │ │
│  │    MLKit/AVFoundation)  │  │    often sufficient)      │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              Platform Native Code                            │
│  ┌─────────────────────┐      ┌─────────────────────────┐  │
│  │      Android        │      │         iOS             │  │
│  │  - ML Kit Barcode   │      │  - AVFoundation Camera  │  │
│  │  - RecyclerView     │      │  - Vision Framework     │  │
│  │  - Chrome Custom    │      │  - UITableView          │  │
│  │    Tabs             │      │  - Safari View          │  │
│  └─────────────────────┘      └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

### Core Framework
| Technology | Choice | Rationale |
|------------|--------|-----------|
| RN Version | 0.73+ (New Architecture) | Fabric renderer, TurboModules for better native perf |
| Language | TypeScript | Type safety, better tooling |
| Build Tool | Expo (bare workflow) or React Native CLI | Expo recommended for easier setup |

### Key Libraries

#### 1. Barcode Scanner (Native)
**Primary: `react-native-vision-camera` + `react-native-worklets-core`**
- Uses native camera APIs (Camera2/AVFoundation)
- Frame processor for real-time barcode detection
- Plugin: `vision-camera-code-scanner` or custom MLKit integration

```typescript
// Example usage
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const codeScanner = useCodeScanner({
  codeTypes: ['ean-13', 'ean-8', 'upc-a', 'upc-e'],
  onCodeScanned: (codes) => {
    // Handle scanned ISBN
  }
});
```

**Alternative: `react-native-camera-kit`**
- Simpler API, built-in barcode scanning
- Less customizable but faster to implement

#### 2. List View
**Primary: `@shopify/flash-list`**
- Drop-in replacement for FlatList
- Recycling architecture similar to RecyclerView
- 5-10x performance improvement over FlatList

```typescript
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={books}
  renderItem={({ item }) => <BookListItem book={item} />}
  estimatedItemSize={80}
/>
```

**For True Native Lists (if needed):**
- Custom Native Module wrapping RecyclerView/UITableView
- Higher complexity, only if FlashList proves insufficient

#### 3. Navigation
**`@react-navigation/native` v6+**
- Native stack navigator for native transitions
- Modal presentation for scanner

#### 4. Storage
**`@react-native-async-storage/async-storage`**
- Cross-platform key-value storage
- Direct replacement for SharedPreferences

#### 5. HTTP Client
**`axios` or `ky`**
- Promise-based, cleaner than fetch
- Interceptors for error handling

#### 6. External Links
**`react-native-inappbrowser-reborn`**
- Chrome Custom Tabs (Android)
- Safari View Controller (iOS)

---

## Project Structure

```
lepkehalo-rn/
├── src/
│   ├── app/                    # App entry, providers
│   │   ├── App.tsx
│   │   └── providers/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Book list
│   │   └── ScannerScreen.tsx   # Barcode scanner
│   ├── components/
│   │   ├── BookListItem.tsx
│   │   ├── EmptyState.tsx
│   │   └── SwipeableRow.tsx
│   ├── services/
│   │   ├── molyApi.ts          # Moly.hu API client
│   │   └── storage.ts          # AsyncStorage wrapper
│   ├── stores/
│   │   └── bookStore.ts        # Zustand store
│   ├── types/
│   │   └── book.ts             # TypeScript interfaces
│   ├── hooks/
│   │   ├── useBooks.ts
│   │   └── useScanner.ts
│   └── constants/
│       └── config.ts           # API keys, URLs
├── ios/
│   └── Lepkehalo/
├── android/
│   └── app/
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

---

## Implementation Phases (TDD)

> **TDD Workflow**: Each phase follows Write Tests → Implement → Refactor

### Phase 0: Test Infrastructure Setup

**Tasks:**
1. Initialize React Native project with TypeScript template
2. Configure Jest with React Native Testing Library
3. Set up MSW for API mocking
4. Configure Detox for E2E testing (iOS Simulator + Android Emulator)
5. Set up GitHub Actions CI pipeline for automated testing
6. Create mock modules for camera/barcode scanner

**Deliverables:**
- Project skeleton with all test tooling configured
- CI pipeline running tests on both platforms
- Mock infrastructure for native modules

---

### Phase 1: Storage & Data Layer (TDD)

**Tests First:**
- `__tests__/types/book.test.ts` - Book type validation
- `__tests__/services/storage.test.ts` - Storage service tests
- `__tests__/stores/bookStore.test.ts` - Zustand store tests

**Implementation:**
1. Create Book type definitions
2. Implement storage service (AsyncStorage)
3. Set up Zustand store for book list state
4. Implement add/remove/restore operations

**Deliverables:**
- All storage/store unit tests passing
- Persistent state management working

---

### Phase 2: API Service (TDD)

**Tests First:**
- `__tests__/services/molyApi.test.ts` - API client tests with MSW mocks

**Implementation:**
1. Create Moly.hu API client with Axios
2. Implement book lookup by ISBN
3. Handle 404 (not found) and network errors
4. Add loading state management

**Deliverables:**
- All API service tests passing
- Robust error handling

---

### Phase 3: Home Screen & Book List (TDD)

**Tests First:**
- `__tests__/components/BookListItem.test.tsx` - List item rendering
- `__tests__/screens/HomeScreen.test.tsx` - Screen logic
- `e2e/bookListManagement.test.ts` - E2E list operations

**Implementation:**
1. Create BookListItem component
2. Implement FlashList-based book list
3. Add swipe-to-delete with react-native-gesture-handler
4. Implement undo snackbar
5. Create empty state view

**Deliverables:**
- All component unit tests passing
- E2E tests for list management passing
- Visual parity with original app

---

### Phase 4: Barcode Scanner (TDD)

**Tests First:**
- `__tests__/screens/ScannerScreen.test.tsx` - Scanner logic (mocked camera)
- `e2e/scanningFlow.test.ts` - E2E scanning flow

**Implementation:**
1. Install and configure react-native-vision-camera
2. Create native mock module for E2E testing
3. Implement camera permission handling
4. Create scanner UI with overlay
5. Implement flash toggle
6. Handle barcode capture and navigation

**Deliverables:**
- Scanner unit tests passing (with mocks)
- E2E scanning flow tests passing
- Working scanner on both platforms

---

### Phase 5: Integration & Navigation (TDD)

**Tests First:**
- `e2e/appLaunch.test.ts` - App launch flow
- `e2e/duplicateHandling.test.ts` - Duplicate book handling
- `e2e/platformSpecific.test.ts` - Platform-specific behaviors

**Implementation:**
1. Set up React Navigation stack
2. Integrate scanner → API → list flow
3. Implement Chrome Custom Tabs / Safari View
4. Handle duplicate book detection (move to top)

**Deliverables:**
- All E2E tests passing
- Full user flow working end-to-end

---

### Phase 6: Polish & Platform Optimization

**Tasks:**
1. iOS-specific styling adjustments
2. Android Material Design 3 updates (optional)
3. App icon and splash screen for both platforms
4. Haptic feedback on actions
5. Accessibility improvements (VoiceOver/TalkBack)
6. Performance profiling and optimization

**Deliverables:**
- Production-ready app for both platforms
- Platform-appropriate UX patterns

---

### Phase 6: Release Preparation

**Tasks:**
1. Configure Android signing and build variants
2. Configure iOS certificates and provisioning profiles
3. Set up App Store Connect and Google Play Console
4. Write store listings (Hungarian + English)
5. Create screenshots for both platforms
6. Privacy policy update for iOS requirements
7. Test on physical devices (various screen sizes)

**Deliverables:**
- Signed release builds
- Store listings ready for submission

---

## Data Model

```typescript
// src/types/book.ts

export interface Book {
  id: string;           // Moly.hu book ID
  title: string;        // Book title
  author: string;       // Author name(s)
  thumbnailUrl: string; // Cover image URL
  isbn?: string;        // ISBN (for reference)
  addedAt: number;      // Timestamp for sorting
}

export interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  restoreBook: (book: Book, index: number) => void;
  moveToTop: (id: string) => void;
  loadBooks: () => Promise<void>;
}
```

---

## API Integration

```typescript
// src/services/molyApi.ts

const MOLY_API_BASE = 'https://moly.hu/api';
const API_KEY = process.env.MOLY_API_KEY; // Move to env variable!

export interface MolyBookResponse {
  id: number;
  title: string;
  author: string;
  cover: string;
}

export async function searchBookByISBN(isbn: string): Promise<Book | null> {
  try {
    const response = await axios.get<MolyBookResponse>(
      `${MOLY_API_BASE}/book_by_isbn.json`,
      {
        params: { q: isbn, key: API_KEY }
      }
    );

    return {
      id: String(response.data.id),
      title: response.data.title,
      author: response.data.author,
      thumbnailUrl: response.data.cover,
      isbn,
      addedAt: Date.now()
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Book not found
    }
    throw error;
  }
}

export function getMolyBookUrl(bookId: string): string {
  return `https://moly.hu/konyvek/${bookId}`;
}
```

---

## Native Module Strategy

### Barcode Scanner: Vision Camera Approach

The `react-native-vision-camera` library already uses native camera APIs and supports frame processors for barcode detection. This is the recommended approach as it:
- Uses Camera2 API on Android
- Uses AVFoundation on iOS
- Supports ML Kit (Android) and Vision (iOS) for barcode detection
- Provides native performance without custom native code

### If Custom Native Modules Are Needed

For scenarios requiring deeper native integration:

**Android (Kotlin):**
```kotlin
// android/app/src/main/java/com/lepkehalo/BarcodeModule.kt
@ReactModule(name = "BarcodeScanner")
class BarcodeScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun startScanning(promise: Promise) {
        // Launch native barcode activity
    }
}
```

**iOS (Swift):**
```swift
// ios/Lepkehalo/BarcodeModule.swift
@objc(BarcodeScanner)
class BarcodeScanner: NSObject {
    @objc func startScanning(_ resolve: @escaping RCTPromiseResolveBlock,
                             reject: @escaping RCTPromiseRejectBlock) {
        // Present native scanner view controller
    }
}
```

---

## Migration of Existing Data

For users upgrading from the Android app:

```typescript
// src/services/migration.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

export async function migrateFromLegacyStorage(): Promise<Book[]> {
  if (Platform.OS !== 'android') return [];

  try {
    // Read from old SharedPreferences location
    const legacyData = await NativeModules.LegacyStorage?.readBooks();
    if (legacyData) {
      const books = JSON.parse(legacyData);
      // Save to new AsyncStorage
      await AsyncStorage.setItem('books', JSON.stringify(books));
      // Clear legacy storage
      await NativeModules.LegacyStorage?.clearBooks();
      return books;
    }
  } catch (error) {
    console.warn('Legacy migration failed:', error);
  }
  return [];
}
```

---

## Localization Strategy

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  hu: {
    translation: {
      appName: 'Lepkeháló',
      scan: 'Beolvasás',
      flashToggle: 'Vaku be/ki',
      noBooks: 'Nincsenek beolvasott könyvek',
      bookNotFound: 'Az ISBN nem található a Moly-on',
      networkError: 'A moly.hu nem elérhető',
      undo: 'Visszavonás',
      deleted: 'Törölve'
    }
  },
  en: {
    translation: {
      appName: 'Lepkeháló',
      scan: 'Scan',
      flashToggle: 'Toggle Flash',
      noBooks: 'No scanned books',
      bookNotFound: 'ISBN not found on Moly',
      networkError: 'Moly.hu is unavailable',
      undo: 'Undo',
      deleted: 'Deleted'
    }
  }
};
```

---

## Testing Strategy

### Unit Tests (Jest)
- Store logic
- API service
- Utility functions

### Component Tests (React Native Testing Library)
- BookListItem rendering
- Empty state
- Swipe interactions

### E2E Tests (Detox)
- Full scan flow
- List management
- Navigation

---

## Security Improvements

1. **Move API key to environment variable**
   - Use `react-native-config` for env management
   - Never commit API keys to repository

2. **Certificate pinning** (optional)
   - Pin moly.hu certificate for API calls

3. **ProGuard/R8 rules** for Android release builds

---

## Dependencies Summary

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.x",
    "@react-navigation/native": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "react-native-vision-camera": "^3.x",
    "react-native-worklets-core": "^1.x",
    "@shopify/flash-list": "^1.x",
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x",
    "@react-native-async-storage/async-storage": "^1.x",
    "react-native-inappbrowser-reborn": "^3.x",
    "axios": "^1.x",
    "zustand": "^4.x",
    "i18next": "^23.x",
    "react-i18next": "^14.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "typescript": "^5.x",
    "jest": "^29.x",
    "@testing-library/react-native": "^12.x",
    "detox": "^20.x"
  }
}
```

---

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vision Camera compatibility issues | High | Have fallback to react-native-camera-kit |
| FlashList performance insufficient | Medium | Can implement native list module if needed |
| iOS App Store rejection | Medium | Ensure privacy policy, permissions explained |
| Moly.hu API changes | Low | Abstract API layer for easy updates |
| Large bundle size | Low | Enable Hermes, optimize images |

---

## Success Metrics

1. **Feature Parity**: All Android features work on both platforms
2. **Performance**: List scrolling at 60fps, scanner < 100ms detection
3. **Bundle Size**: < 20MB installed size per platform
4. **Crash Rate**: < 0.1% sessions with crashes
5. **Store Rating**: Maintain 4+ star rating

---

## Appendix: File-by-File Migration Map

| Original File | New Location | Notes |
|--------------|--------------|-------|
| `MainActivity.kt` | `src/screens/HomeScreen.tsx` | Main list screen |
| `BarcodeCaptureActivity.java` | `src/screens/ScannerScreen.tsx` | Uses vision-camera |
| `Book.kt` | `src/types/book.ts` | TypeScript interface |
| `BookListAdapter.java` | `src/components/BookListItem.tsx` | FlashList renderItem |
| `HttpRequests.java` | `src/services/molyApi.ts` | Axios client |
| `CameraSource.java` | N/A | Handled by vision-camera |
| `RecyclerItemTouchHelper.java` | `react-native-gesture-handler` | Swipeable component |
| `strings.xml` | `src/i18n/hu.json` | i18next resources |
| `colors.xml` | `src/constants/theme.ts` | Theme constants |

---

## Next Steps

1. **Decision**: Confirm technology choices (Expo vs bare RN CLI)
2. **Setup**: Initialize new React Native project
3. **Iterate**: Follow implementation phases sequentially
4. **Review**: Code review at each phase completion
5. **Test**: Device testing throughout development
6. **Release**: Staged rollout (Android first, then iOS)
