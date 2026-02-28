import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ScannerScreenWrapper } from '@/screens/ScannerScreenWrapper';
import { setMockPermissionGranted, mockScanBarcode } from '../../__mocks__/native-barcode-scanner';
import { server } from '../../__mocks__/server';
import { useBookStore } from '@/stores/bookStore';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Helper to scan a barcode in the rendered wrapper.
// First flushes microtasks so the native view's permission promise resolves
// and event callbacks are registered, then fires the barcode event.
const scanBarcode = async (isbn: string) => {
  await act(async () => {}); // flush permission promise
  await act(async () => {
    mockScanBarcode('ean13', isbn);
  });
};

describe('ScannerScreenWrapper', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    setMockPermissionGranted(true);
    mockGoBack.mockClear();
    // Reset store state
    useBookStore.setState({ books: [], isLoading: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render scanner screen initially', () => {
    const { getByTestId } = render(<ScannerScreenWrapper />);
    expect(getByTestId('scanner-screen')).toBeTruthy();
  });

  it('should show loading state when barcode is scanned', async () => {
    const { getByText } = render(<ScannerScreenWrapper />);

    await scanBarcode('9789630778459');

    await waitFor(() => {
      expect(getByText('Könyv keresése...')).toBeTruthy();
    });
  });

  it('should navigate back after successful book lookup', async () => {
    const { getByText } = render(<ScannerScreenWrapper />);

    await scanBarcode('9789630778459');

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  it('should add book to store after successful lookup', async () => {
    render(<ScannerScreenWrapper />);

    await scanBarcode('9789630778459');

    await waitFor(() => {
      const { books } = useBookStore.getState();
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('A kék sziget');
    });
  });

  it('should show error when book not found on Moly', async () => {
    const { getByText } = render(<ScannerScreenWrapper />);

    await scanBarcode('0000000000000');

    await waitFor(() => {
      expect(getByText('Az ISBN nem található a Moly-on')).toBeTruthy();
    });
  });

  it('should return to scanning after error timeout', async () => {
    const { getByText, getByTestId } = render(<ScannerScreenWrapper />);

    await scanBarcode('0000000000000');

    await waitFor(() => {
      expect(getByText('Az ISBN nem található a Moly-on')).toBeTruthy();
    });

    // Advance past the 2-second timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByTestId('scanner-screen')).toBeTruthy();
    });
  });

  it('should show error when API is unreachable', async () => {
    server.use(
      http.get('https://moly.hu/api/book_by_isbn.json', () => {
        return HttpResponse.error();
      })
    );

    const { getByText } = render(<ScannerScreenWrapper />);

    await scanBarcode('9789630778459');

    await waitFor(() => {
      expect(getByText('A moly.hu nem elérhető')).toBeTruthy();
    });
  });

  it('should move existing book to top and navigate back', async () => {
    // Pre-populate store with the book
    useBookStore.setState({
      books: [
        {
          id: '99999',
          title: 'Other Book',
          author: 'Author',
          thumbnailUrl: '',
          addedAt: 1000,
        },
        {
          id: '12345',
          title: 'A kék sziget',
          author: 'Rejtő Jenő',
          thumbnailUrl: '',
          isbn: '9789630778459',
          addedAt: 2000,
        },
      ],
    });

    render(<ScannerScreenWrapper />);

    // Scan the ISBN that already exists
    await scanBarcode('9789630778459');

    expect(mockGoBack).toHaveBeenCalledTimes(1);

    // Book should be moved to top
    const { books } = useBookStore.getState();
    expect(books[0].id).toBe('12345');
  });

  it('should ignore duplicate barcode callbacks', async () => {
    render(<ScannerScreenWrapper />);

    // Fire two scans rapidly
    await scanBarcode('9789630778459');
    await scanBarcode('9789630778459');

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  it('should allow scanning again after error recovery', async () => {
    const { getByText, getByTestId } = render(<ScannerScreenWrapper />);

    // First scan: unknown ISBN -> error
    await scanBarcode('0000000000000');

    await waitFor(() => {
      expect(getByText('Az ISBN nem található a Moly-on')).toBeTruthy();
    });

    // Wait for error timeout to reset
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByTestId('scanner-screen')).toBeTruthy();
    });

    // Second scan: valid ISBN -> should work
    await scanBarcode('9789630778459');

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
