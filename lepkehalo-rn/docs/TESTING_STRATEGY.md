# Lepkeháló - Testing Strategy

## Overview

This document defines the test-driven development (TDD) approach for the React Native migration. Tests serve as the specification - we write tests first, then implement until all tests pass.

---

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Jest + React Native Testing Library | Component logic, services, stores |
| **E2E Tests** | Detox | Full user flows on real simulators/emulators |
| **Mocking** | MSW (Mock Service Worker) | API mocking |
| **CI/CD** | GitHub Actions | Automated test runs on both platforms |

---

## Test Categories

### 1. Unit Tests
- Pure functions (utilities, transformations)
- React components (rendering, interactions)
- Zustand store (state management)
- API service (with mocked responses)
- Storage service (with mocked AsyncStorage)

### 2. Integration Tests
- Screen-level tests with mocked navigation
- Store + component integration
- API + store integration

### 3. E2E Tests
- Full user flows on iOS Simulator and Android Emulator
- Camera/barcode scanning (mocked at native level)
- Navigation between screens
- Data persistence across app restarts

---

## Unit Test Specifications

### Book Model & Types

```typescript
// __tests__/types/book.test.ts

describe('Book type', () => {
  it('should have required fields: id, title, author, thumbnailUrl', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now()
    };

    expect(book.id).toBeDefined();
    expect(book.title).toBeDefined();
    expect(book.author).toBeDefined();
    expect(book.thumbnailUrl).toBeDefined();
  });

  it('should allow optional isbn field', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      isbn: '9780123456789',
      addedAt: Date.now()
    };

    expect(book.isbn).toBe('9780123456789');
  });
});
```

---

### Moly.hu API Service

```typescript
// __tests__/services/molyApi.test.ts

describe('MolyApi Service', () => {
  describe('searchBookByISBN', () => {
    it('should return book data for valid ISBN', async () => {
      // Mock API response
      server.use(
        rest.get('https://moly.hu/api/book_by_isbn.json', (req, res, ctx) => {
          return res(ctx.json({
            id: 12345,
            title: 'A kék sziget',
            author: 'Rejtő Jenő',
            cover: 'https://moly.hu/system/covers/big/covers_12345.jpg'
          }));
        })
      );

      const result = await searchBookByISBN('9789630778459');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.title).toBe('A kék sziget');
      expect(result?.author).toBe('Rejtő Jenő');
      expect(result?.thumbnailUrl).toContain('covers_12345');
    });

    it('should return null for ISBN not found (404)', async () => {
      server.use(
        rest.get('https://moly.hu/api/book_by_isbn.json', (req, res, ctx) => {
          return res(ctx.status(404));
        })
      );

      const result = await searchBookByISBN('0000000000000');

      expect(result).toBeNull();
    });

    it('should throw error for network failure', async () => {
      server.use(
        rest.get('https://moly.hu/api/book_by_isbn.json', (req, res) => {
          return res.networkError('Connection refused');
        })
      );

      await expect(searchBookByISBN('9789630778459')).rejects.toThrow();
    });

    it('should include API key in request', async () => {
      let capturedUrl: URL | null = null;

      server.use(
        rest.get('https://moly.hu/api/book_by_isbn.json', (req, res, ctx) => {
          capturedUrl = new URL(req.url);
          return res(ctx.json({ id: 1, title: 'T', author: 'A', cover: '' }));
        })
      );

      await searchBookByISBN('9789630778459');

      expect(capturedUrl?.searchParams.get('key')).toBeTruthy();
      expect(capturedUrl?.searchParams.get('q')).toBe('9789630778459');
    });
  });

  describe('getMolyBookUrl', () => {
    it('should return correct moly.hu URL for book ID', () => {
      const url = getMolyBookUrl('12345');
      expect(url).toBe('https://moly.hu/konyvek/12345');
    });
  });
});
```

---

### Storage Service

```typescript
// __tests__/services/storage.test.ts

describe('Storage Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('saveBooks', () => {
    it('should save books array to AsyncStorage', async () => {
      const books: Book[] = [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 },
        { id: '2', title: 'Book 2', author: 'Author 2', thumbnailUrl: '', addedAt: 2000 }
      ];

      await saveBooks(books);

      const stored = await AsyncStorage.getItem('books');
      expect(JSON.parse(stored!)).toEqual(books);
    });

    it('should handle empty array', async () => {
      await saveBooks([]);

      const stored = await AsyncStorage.getItem('books');
      expect(JSON.parse(stored!)).toEqual([]);
    });
  });

  describe('loadBooks', () => {
    it('should load books from AsyncStorage', async () => {
      const books: Book[] = [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 }
      ];
      await AsyncStorage.setItem('books', JSON.stringify(books));

      const result = await loadBooks();

      expect(result).toEqual(books);
    });

    it('should return empty array when no data stored', async () => {
      const result = await loadBooks();
      expect(result).toEqual([]);
    });

    it('should return empty array for corrupted data', async () => {
      await AsyncStorage.setItem('books', 'not valid json{{{');

      const result = await loadBooks();
      expect(result).toEqual([]);
    });
  });
});
```

---

### Book Store (Zustand)

```typescript
// __tests__/stores/bookStore.test.ts

describe('Book Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBookStore.setState({ books: [] });
  });

  describe('addBook', () => {
    it('should add a new book to the beginning of the list', () => {
      const { addBook, books } = useBookStore.getState();

      const book: Book = {
        id: '123',
        title: 'Test Book',
        author: 'Test Author',
        thumbnailUrl: 'https://example.com/cover.jpg',
        addedAt: Date.now()
      };

      addBook(book);

      expect(useBookStore.getState().books).toHaveLength(1);
      expect(useBookStore.getState().books[0]).toEqual(book);
    });

    it('should move existing book to top instead of duplicating', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.setState({ books: [book2, book1] });

      // Add book1 again (already exists)
      useBookStore.getState().addBook({ ...book1, addedAt: 3000 });

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(2);
      expect(books[0].id).toBe('1'); // book1 moved to top
      expect(books[1].id).toBe('2');
    });

    it('should persist to storage after adding', async () => {
      const book: Book = { id: '1', title: 'Book', author: 'A', thumbnailUrl: '', addedAt: 1000 };

      useBookStore.getState().addBook(book);

      // Wait for async storage operation
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem('books');
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });

  describe('removeBook', () => {
    it('should remove book by ID', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.setState({ books: [book1, book2] });

      useBookStore.getState().removeBook('1');

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(1);
      expect(books[0].id).toBe('2');
    });

    it('should return removed book and index for undo', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.setState({ books: [book1, book2] });

      const result = useBookStore.getState().removeBook('2');

      expect(result?.book).toEqual(book2);
      expect(result?.index).toBe(1);
    });

    it('should return null when book not found', () => {
      useBookStore.setState({ books: [] });

      const result = useBookStore.getState().removeBook('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('restoreBook', () => {
    it('should restore book at original index', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };
      const book3: Book = { id: '3', title: 'Book 3', author: 'A3', thumbnailUrl: '', addedAt: 3000 };

      useBookStore.setState({ books: [book1, book3] }); // book2 was removed

      useBookStore.getState().restoreBook(book2, 1);

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(3);
      expect(books[1]).toEqual(book2);
    });
  });

  describe('loadBooks', () => {
    it('should load books from storage on initialization', async () => {
      const storedBooks: Book[] = [
        { id: '1', title: 'Stored Book', author: 'A', thumbnailUrl: '', addedAt: 1000 }
      ];
      await AsyncStorage.setItem('books', JSON.stringify(storedBooks));

      await useBookStore.getState().loadBooks();

      expect(useBookStore.getState().books).toEqual(storedBooks);
    });
  });
});
```

---

### BookListItem Component

```typescript
// __tests__/components/BookListItem.test.tsx

describe('BookListItem', () => {
  const mockBook: Book = {
    id: '123',
    title: 'A kék sziget',
    author: 'Rejtő Jenő',
    thumbnailUrl: 'https://moly.hu/system/covers/big/covers_123.jpg',
    addedAt: Date.now()
  };

  it('should render book title', () => {
    const { getByText } = render(<BookListItem book={mockBook} onPress={jest.fn()} />);

    expect(getByText('A kék sziget')).toBeTruthy();
  });

  it('should render book author', () => {
    const { getByText } = render(<BookListItem book={mockBook} onPress={jest.fn()} />);

    expect(getByText('Rejtő Jenő')).toBeTruthy();
  });

  it('should render book cover image', () => {
    const { getByTestId } = render(<BookListItem book={mockBook} onPress={jest.fn()} />);

    const image = getByTestId('book-cover');
    expect(image.props.source.uri).toBe(mockBook.thumbnailUrl);
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<BookListItem book={mockBook} onPress={onPress} />);

    fireEvent.press(getByTestId('book-list-item'));

    expect(onPress).toHaveBeenCalledWith(mockBook);
  });

  it('should show placeholder when no cover image', () => {
    const bookWithoutCover = { ...mockBook, thumbnailUrl: '' };
    const { getByTestId } = render(<BookListItem book={bookWithoutCover} onPress={jest.fn()} />);

    expect(getByTestId('book-cover-placeholder')).toBeTruthy();
  });
});
```

---

### HomeScreen Component

```typescript
// __tests__/screens/HomeScreen.test.tsx

describe('HomeScreen', () => {
  beforeEach(() => {
    useBookStore.setState({ books: [] });
  });

  it('should show empty state when no books', () => {
    const { getByText } = render(<HomeScreen />);

    // Hungarian text: "No scanned books"
    expect(getByText(/nincsenek beolvasott könyvek/i)).toBeTruthy();
  });

  it('should show book list when books exist', () => {
    useBookStore.setState({
      books: [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 }
      ]
    });

    const { getByText, queryByText } = render(<HomeScreen />);

    expect(getByText('Book 1')).toBeTruthy();
    expect(queryByText(/nincsenek beolvasott könyvek/i)).toBeNull();
  });

  it('should have a scan button in header', () => {
    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('scan-button')).toBeTruthy();
  });

  it('should navigate to scanner when scan button pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(navigation, 'navigate').mockImplementation(mockNavigate);

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('scan-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Scanner');
  });

  it('should show undo snackbar after swipe delete', async () => {
    useBookStore.setState({
      books: [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 }
      ]
    });

    const { getByTestId, getByText } = render(<HomeScreen />);

    // Simulate swipe delete
    const listItem = getByTestId('book-list-item-1');
    fireEvent(listItem, 'swipeLeft');

    // Should show undo option
    await waitFor(() => {
      expect(getByText(/visszavonás/i)).toBeTruthy(); // "Undo" in Hungarian
    });
  });

  it('should restore book when undo pressed', async () => {
    const book = { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 };
    useBookStore.setState({ books: [book] });

    const { getByTestId, getByText } = render(<HomeScreen />);

    // Delete
    fireEvent(getByTestId('book-list-item-1'), 'swipeLeft');

    // Press undo
    await waitFor(() => {
      fireEvent.press(getByText(/visszavonás/i));
    });

    // Book should be back
    expect(useBookStore.getState().books).toHaveLength(1);
  });
});
```

---

### ScannerScreen Component

```typescript
// __tests__/screens/ScannerScreen.test.tsx

// Note: Camera functionality is mocked for unit tests
// Real camera testing happens in E2E tests

describe('ScannerScreen', () => {
  it('should request camera permission on mount', async () => {
    const requestPermission = jest.fn().mockResolvedValue({ granted: true });
    Camera.requestCameraPermission = requestPermission;

    render(<ScannerScreen />);

    await waitFor(() => {
      expect(requestPermission).toHaveBeenCalled();
    });
  });

  it('should show permission denied message when camera not granted', async () => {
    Camera.requestCameraPermission = jest.fn().mockResolvedValue({ granted: false });

    const { getByText } = render(<ScannerScreen />);

    await waitFor(() => {
      expect(getByText(/camera permission/i)).toBeTruthy();
    });
  });

  it('should have flash toggle button', async () => {
    Camera.requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });

    const { getByTestId } = render(<ScannerScreen />);

    await waitFor(() => {
      expect(getByTestId('flash-toggle')).toBeTruthy();
    });
  });

  it('should toggle flash state when flash button pressed', async () => {
    Camera.requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });

    const { getByTestId } = render(<ScannerScreen />);

    await waitFor(() => {
      const flashButton = getByTestId('flash-toggle');

      // Initially off
      expect(flashButton.props.accessibilityState.checked).toBe(false);

      fireEvent.press(flashButton);

      expect(flashButton.props.accessibilityState.checked).toBe(true);
    });
  });

  it('should call onBarcodeScanned when barcode detected', async () => {
    const mockOnScanned = jest.fn();
    Camera.requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });

    render(<ScannerScreen onBarcodeScanned={mockOnScanned} />);

    // Simulate barcode detection (mocked)
    await act(async () => {
      mockCodeScanner.simulateScan({ type: 'ean-13', value: '9789630778459' });
    });

    expect(mockOnScanned).toHaveBeenCalledWith('9789630778459');
  });
});
```

---

## E2E Test Specifications (Detox)

### Test Setup

```typescript
// e2e/setup.ts

beforeAll(async () => {
  await device.launchApp({ newInstance: true });
});

beforeEach(async () => {
  await device.reloadReactNative();
  // Clear storage between tests
  await device.clearKeychain();
});
```

### E2E Test: App Launch

```typescript
// e2e/appLaunch.test.ts

describe('App Launch', () => {
  it('should show home screen on launch', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show empty state on first launch', async () => {
    await expect(element(by.id('empty-state'))).toBeVisible();
    await expect(element(by.text('Nincsenek beolvasott könyvek'))).toBeVisible();
  });

  it('should show scan button', async () => {
    await expect(element(by.id('scan-button'))).toBeVisible();
  });
});
```

### E2E Test: Barcode Scanning Flow

```typescript
// e2e/scanningFlow.test.ts

describe('Barcode Scanning Flow', () => {
  it('should navigate to scanner screen', async () => {
    await element(by.id('scan-button')).tap();

    await expect(element(by.id('scanner-screen'))).toBeVisible();
  });

  it('should show camera permission dialog on first scan', async () => {
    await element(by.id('scan-button')).tap();

    // Platform-specific permission handling
    if (device.getPlatform() === 'ios') {
      await expect(systemDialog(by.label('Allow'))).toBeVisible();
    }
  });

  it('should show flash toggle on scanner screen', async () => {
    await element(by.id('scan-button')).tap();

    await expect(element(by.id('flash-toggle'))).toBeVisible();
  });

  // Note: Actual barcode scanning is mocked in E2E tests
  // using a mock native module that simulates barcode detection
  it('should return to home with scanned book', async () => {
    await element(by.id('scan-button')).tap();

    // Trigger mock barcode scan
    await device.mockBarcodeScanner.scan('9789630778459');

    // Should return to home screen
    await expect(element(by.id('home-screen'))).toBeVisible();

    // Book should appear in list (mocked API response)
    await expect(element(by.text('A kék sziget'))).toBeVisible();
    await expect(element(by.text('Rejtő Jenő'))).toBeVisible();
  });

  it('should show error when ISBN not found', async () => {
    await element(by.id('scan-button')).tap();

    // Scan ISBN that will return 404
    await device.mockBarcodeScanner.scan('0000000000000');

    await expect(element(by.text('Az ISBN nem található a Moly-on'))).toBeVisible();
  });

  it('should show error when network unavailable', async () => {
    // Disable network
    await device.setNetworkCondition('offline');

    await element(by.id('scan-button')).tap();
    await device.mockBarcodeScanner.scan('9789630778459');

    await expect(element(by.text('A moly.hu nem elérhető'))).toBeVisible();

    // Re-enable network
    await device.setNetworkCondition('wifi');
  });
});
```

### E2E Test: Book List Management

```typescript
// e2e/bookListManagement.test.ts

describe('Book List Management', () => {
  beforeEach(async () => {
    // Pre-populate with test books
    await device.mockStorage.setBooks([
      { id: '1', title: 'Book One', author: 'Author One', thumbnailUrl: 'https://example.com/1.jpg', addedAt: 1000 },
      { id: '2', title: 'Book Two', author: 'Author Two', thumbnailUrl: 'https://example.com/2.jpg', addedAt: 2000 },
      { id: '3', title: 'Book Three', author: 'Author Three', thumbnailUrl: 'https://example.com/3.jpg', addedAt: 3000 }
    ]);
    await device.reloadReactNative();
  });

  it('should display all books in list', async () => {
    await expect(element(by.text('Book One'))).toBeVisible();
    await expect(element(by.text('Book Two'))).toBeVisible();
    await expect(element(by.text('Book Three'))).toBeVisible();
  });

  it('should open book on moly.hu when tapped', async () => {
    await element(by.text('Book One')).tap();

    // Should open in-app browser with moly.hu URL
    await expect(element(by.id('in-app-browser'))).toBeVisible();
    // URL should contain book ID
    await expect(element(by.id('browser-url'))).toHaveText(
      expect.stringContaining('moly.hu/konyvek/1')
    );
  });

  it('should delete book on swipe left', async () => {
    await element(by.text('Book Two')).swipe('left');

    await expect(element(by.text('Book Two'))).not.toBeVisible();
  });

  it('should show undo snackbar after delete', async () => {
    await element(by.text('Book Two')).swipe('left');

    await expect(element(by.id('undo-snackbar'))).toBeVisible();
    await expect(element(by.text('Visszavonás'))).toBeVisible();
  });

  it('should restore book when undo pressed', async () => {
    await element(by.text('Book Two')).swipe('left');

    // Book should be gone
    await expect(element(by.text('Book Two'))).not.toBeVisible();

    // Press undo
    await element(by.text('Visszavonás')).tap();

    // Book should be back
    await expect(element(by.text('Book Two'))).toBeVisible();
  });

  it('should persist list after app restart', async () => {
    // Delete a book
    await element(by.text('Book Two')).swipe('left');

    // Restart app
    await device.launchApp({ newInstance: true });

    // Book Two should still be gone
    await expect(element(by.text('Book One'))).toBeVisible();
    await expect(element(by.text('Book Two'))).not.toBeVisible();
    await expect(element(by.text('Book Three'))).toBeVisible();
  });

  it('should show empty state after deleting all books', async () => {
    await element(by.text('Book One')).swipe('left');
    await element(by.text('Book Two')).swipe('left');
    await element(by.text('Book Three')).swipe('left');

    await expect(element(by.id('empty-state'))).toBeVisible();
  });
});
```

### E2E Test: Duplicate Book Handling

```typescript
// e2e/duplicateHandling.test.ts

describe('Duplicate Book Handling', () => {
  beforeEach(async () => {
    await device.mockStorage.setBooks([
      { id: '1', title: 'Existing Book', author: 'Author', thumbnailUrl: '', addedAt: 1000 }
    ]);
    await device.reloadReactNative();
  });

  it('should move existing book to top instead of duplicating', async () => {
    // Scan the same book again
    await element(by.id('scan-button')).tap();
    await device.mockBarcodeScanner.scanWithResponse('9789630778459', {
      id: 1, // Same ID as existing book
      title: 'Existing Book',
      author: 'Author',
      cover: ''
    });

    // Should only have one instance
    const bookElements = await element(by.text('Existing Book')).getAttributes();
    expect(bookElements.elements?.length ?? 1).toBe(1);

    // Should be at top of list (index 0)
    await expect(element(by.id('book-list-item-0'))).toHaveDescendant(
      element(by.text('Existing Book'))
    );
  });
});
```

### E2E Test: Platform-Specific Behaviors

```typescript
// e2e/platformSpecific.test.ts

describe('Platform-Specific Behaviors', () => {
  describe('iOS', () => {
    beforeAll(async () => {
      if (device.getPlatform() !== 'ios') {
        return; // Skip on Android
      }
    });

    it('should use Safari View Controller for moly.hu links', async () => {
      await device.mockStorage.setBooks([
        { id: '1', title: 'Test', author: 'A', thumbnailUrl: '', addedAt: 1000 }
      ]);
      await device.reloadReactNative();

      await element(by.text('Test')).tap();

      // iOS-specific Safari View Controller
      await expect(element(by.type('SFSafariViewController'))).toBeVisible();
    });
  });

  describe('Android', () => {
    beforeAll(async () => {
      if (device.getPlatform() !== 'android') {
        return; // Skip on iOS
      }
    });

    it('should use Chrome Custom Tabs for moly.hu links', async () => {
      await device.mockStorage.setBooks([
        { id: '1', title: 'Test', author: 'A', thumbnailUrl: '', addedAt: 1000 }
      ]);
      await device.reloadReactNative();

      await element(by.text('Test')).tap();

      // Android-specific Chrome Custom Tab check
      // This is typically verified via intent monitoring
      await expect(device.getLastIntent()).toMatchObject({
        action: 'android.intent.action.VIEW',
        data: expect.stringContaining('moly.hu')
      });
    });
  });
});
```

---

## Mock Strategies

### API Mocking with MSW

```typescript
// __mocks__/server.ts

import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  // Default: return a valid book
  rest.get('https://moly.hu/api/book_by_isbn.json', (req, res, ctx) => {
    const isbn = req.url.searchParams.get('q');

    // Mock responses based on ISBN
    const mockBooks: Record<string, any> = {
      '9789630778459': {
        id: 12345,
        title: 'A kék sziget',
        author: 'Rejtő Jenő',
        cover: 'https://moly.hu/system/covers/big/covers_12345.jpg'
      },
      '9789634790914': {
        id: 67890,
        title: 'Egri csillagok',
        author: 'Gárdonyi Géza',
        cover: 'https://moly.hu/system/covers/big/covers_67890.jpg'
      }
    };

    if (isbn && mockBooks[isbn]) {
      return res(ctx.json(mockBooks[isbn]));
    }

    return res(ctx.status(404));
  })
];

export const server = setupServer(...handlers);
```

### Camera/Barcode Scanner Mocking

```typescript
// __mocks__/react-native-vision-camera.ts

export const Camera = {
  requestCameraPermission: jest.fn().mockResolvedValue({ granted: true }),
  getCameraDevice: jest.fn().mockReturnValue({ id: 'back' })
};

export const useCodeScanner = jest.fn().mockReturnValue({
  // Mock code scanner that can be triggered in tests
});

// For E2E tests, create native mock module
// android/app/src/main/java/com/lepkehalo/MockBarcodeScannerModule.kt
// ios/Lepkehalo/MockBarcodeScannerModule.swift
```

---

## CI/CD Configuration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit -- --coverage

      - uses: codecov/codecov-action@v3

  e2e-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: cd ios && pod install

      - name: Build for Detox
        run: npm run build:e2e:ios

      - name: Run E2E Tests
        run: npm run test:e2e:ios

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-ios-screenshots
          path: e2e/artifacts/

  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - run: npm ci

      - name: Build for Detox
        run: npm run build:e2e:android

      - name: Start Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 29
          script: npm run test:e2e:android

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-android-screenshots
          path: e2e/artifacts/
```

---

## Package.json Test Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "jest --config jest.config.js",
    "test:unit:watch": "jest --config jest.config.js --watch",
    "test:unit:coverage": "jest --config jest.config.js --coverage",
    "build:e2e:ios": "detox build --configuration ios.sim.debug",
    "build:e2e:android": "detox build --configuration android.emu.debug",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e": "npm run test:e2e:ios && npm run test:e2e:android"
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

---

## Test Implementation Order

1. **Phase 1**: Set up test infrastructure (Jest, RNTL, MSW, Detox)
2. **Phase 2**: Implement storage service tests → storage service
3. **Phase 3**: Implement API service tests → API service
4. **Phase 4**: Implement book store tests → Zustand store
5. **Phase 5**: Implement component tests → React components
6. **Phase 6**: Implement E2E tests → Full integration
7. **Phase 7**: Set up CI/CD pipeline

Each phase: Write tests first, then implement until tests pass.
