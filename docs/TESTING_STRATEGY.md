# Lepkeháló - Testing Strategy

## Overview

This document describes the testing approach for the Lepkeháló React Native app. The project follows test-driven development (TDD): tests serve as the specification, written first before implementation.

---

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Jest 29 + React Native Testing Library | Component logic, services, stores |
| **E2E Tests** | Detox 20 | Full user flows on real simulators/emulators |
| **API Mocking** | MSW v2 (Mock Service Worker) | API mocking with `http` handlers |
| **CI/CD** | GitHub Actions | Automated test runs on both platforms |

---

## Test Categories

### 1. Unit Tests
- Pure functions (type validators, transformations)
- React components (rendering, interactions)
- Zustand store (state management logic)
- API service (with MSW-mocked responses)
- Storage service (with mocked AsyncStorage)

### 2. Integration Tests
- Screen-level tests with mocked navigation
- Store + component integration
- API + store integration

### 3. E2E Tests
- Full user flows on iOS Simulator and Android Emulator
- Navigation between screens
- Data persistence across app restarts
- Camera/barcode scanning (mocked at native level)

---

## Running Tests

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

### Specific Test Suites

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

---

## Unit Test Specifications

### Book Model & Types

```typescript
// __tests__/types/book.test.ts

describe('Book type', () => {
  it('should have required fields: id, title, author, thumbnailUrl');
  it('should allow optional isbn field');
  it('should validate book objects with isBook()');
  it('should reject invalid objects');
});
```

---

### Moly.hu API Service

```typescript
// __tests__/services/molyApi.test.ts

describe('MolyApi Service', () => {
  describe('searchBookByISBN', () => {
    it('should return book data for valid ISBN');
    it('should return null for ISBN not found (404)');
    it('should throw MolyApiError for network failure');
    it('should include API key in request');
    it('should timeout after 10 seconds');
  });
});
```

API mocking uses MSW v2 `http` handlers:

```typescript
import { http, HttpResponse } from 'msw';

const handlers = [
  http.get('https://moly.hu/api/book_by_isbn.json', ({ request }) => {
    const url = new URL(request.url);
    const isbn = url.searchParams.get('q');

    const mockBooks: Record<string, object> = {
      '9789630778459': {
        id: 12345,
        title: 'A kék sziget',
        author: 'Rejtő Jenő',
        cover: 'https://moly.hu/system/covers/big/covers_12345.jpg',
      },
    };

    if (isbn && mockBooks[isbn]) {
      return HttpResponse.json(mockBooks[isbn]);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
```

---

### Storage Service

```typescript
// __tests__/services/storage.test.ts

describe('Storage Service', () => {
  describe('saveBooks', () => {
    it('should save books array to AsyncStorage');
    it('should handle empty array');
  });

  describe('loadBooks', () => {
    it('should load books from AsyncStorage');
    it('should return empty array when no data stored');
    it('should return empty array for corrupted data');
  });
});
```

---

### Book Store (Zustand)

```typescript
// __tests__/stores/bookStore.test.ts

describe('Book Store', () => {
  describe('addBook', () => {
    it('should add a new book to the beginning of the list');
    it('should move existing book to top instead of duplicating');
    it('should persist to storage after adding');
  });

  describe('removeBook', () => {
    it('should remove book by ID');
    it('should return removed book and index for undo');
    it('should return null when book not found');
  });

  describe('restoreBook', () => {
    it('should restore book at original index');
  });

  describe('loadBooks', () => {
    it('should load books from storage on initialization');
  });
});
```

---

### Component Tests

```typescript
// __tests__/components/BookListItem.test.tsx

describe('BookListItem', () => {
  it('should render book title');
  it('should render book author');
  it('should render book cover image');
  it('should call onPress when tapped');
  it('should show placeholder when no cover image');
});
```

```typescript
// __tests__/screens/HomeScreen.test.tsx

describe('HomeScreen', () => {
  it('should show empty state when no books');
  it('should show book list when books exist');
  it('should have a scan button');
  it('should navigate to scanner when scan button pressed');
  it('should show undo snackbar after swipe delete');
  it('should restore book when undo pressed');
});
```

```typescript
// __tests__/screens/ScannerScreen.test.tsx

describe('ScannerScreen', () => {
  it('should request camera permission on mount');
  it('should show permission denied message when camera not granted');
  it('should have flash toggle button');
  it('should toggle flash state when flash button pressed');
  it('should call onBarcodeScanned when barcode detected');
});
```

---

## E2E Test Specifications (Detox)

### App Launch

```typescript
// e2e/appLaunch.test.ts

describe('App Launch', () => {
  it('should show home screen on launch');
  it('should show empty state on first launch');
  it('should show scan button');
});
```

### Barcode Scanning Flow

```typescript
// e2e/scanningFlow.test.ts

describe('Barcode Scanning Flow', () => {
  it('should navigate to scanner screen');
  it('should show camera permission dialog on first scan');
  it('should show flash toggle on scanner screen');
  it('should return to home with scanned book');
  it('should show error when ISBN not found');
  it('should show error when network unavailable');
});
```

### Book List Management

```typescript
// e2e/bookListManagement.test.ts

describe('Book List Management', () => {
  it('should display all books in list');
  it('should open book on moly.hu when tapped');
  it('should delete book on swipe left');
  it('should show undo snackbar after delete');
  it('should restore book when undo pressed');
  it('should persist list after app restart');
  it('should show empty state after deleting all books');
});
```

### Duplicate Book Handling

```typescript
// e2e/duplicateHandling.test.ts

describe('Duplicate Book Handling', () => {
  it('should move existing book to top instead of duplicating');
});
```

---

## Mock Strategies

### API Mocking with MSW v2

MSW v2 intercepts network requests at the service worker level. Mock handlers are defined in `__mocks__/` and shared across unit tests.

```typescript
// __mocks__/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Camera/Barcode Scanner Mocking

The `expo-camera` module is mocked in unit tests:

```typescript
// __mocks__/expo-camera.ts
// Provides mock CameraView component and permission functions
// Allows tests to simulate barcode scan events
```

For E2E tests, barcode scanning is triggered via mock native modules that simulate scan events.

---

## CI/CD Configuration

### GitHub Actions Workflow

The CI pipeline (`.github/workflows/test.yml`) runs on every push and pull request:

**Unit tests:**
- Runs on `ubuntu-latest`
- Node.js 18 with npm cache
- Executes `npm test` (78 tests)

**E2E tests (iOS):**
- Runs on `macos-15` (required for Xcode 16.1+ / RN 0.81)
- Generates native project with `npx expo prebuild`
- Builds with Detox: `npm run build:e2e:ios`
- Runs E2E tests: `npm run test:e2e:ios`
- Uploads screenshots as artifacts on failure

**E2E tests (Android):**
- Runs on `ubuntu-latest`
- Java 17 + Android SDK
- Uses `android-emulator-runner` action
- Builds with Detox: `npm run build:e2e:android`
- Runs E2E tests: `npm run test:e2e:android`

---

## Package.json Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build:e2e:ios": "detox build --configuration ios.sim.debug",
    "build:e2e:android": "detox build --configuration android.emu.debug",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug"
  }
}
```

---

## Test Coverage Requirements

| Category | Minimum Coverage |
|----------|------------------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |
