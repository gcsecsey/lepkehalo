import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { useBookStore } from '@/stores/bookStore';
import { Book } from '@/types/book';
import { __mockNavigate } from '../../__mocks__/@react-navigation/native';

// Mock GestureHandlerRootView
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
  };
});

const mockNavigate = __mockNavigate;

// Mock the loadBooks to prevent it from overwriting our test state
const originalLoadBooks = useBookStore.getState().loadBooks;
beforeAll(() => {
  useBookStore.setState({
    loadBooks: jest.fn().mockImplementation(async () => {
      // Don't actually load books in tests - use what's already in state
      useBookStore.setState({ isLoading: false });
    }),
  });
});

afterAll(() => {
  useBookStore.setState({ loadBooks: originalLoadBooks });
});

describe('HomeScreen', () => {
  beforeEach(async () => {
    useBookStore.setState({ books: [], isLoading: false });
    mockNavigate.mockClear();
  });

  it('should show empty state when no books', async () => {
    const { getByTestId, getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
    });
    expect(getByText(/nincsenek beolvasott könyvek/i)).toBeTruthy();
  });

  it('should show book list when books exist', async () => {
    useBookStore.setState({
      books: [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 },
      ],
      isLoading: false,
    });

    const { getByText, queryByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Book 1')).toBeTruthy();
    });
    expect(queryByTestId('empty-state')).toBeNull();
  });

  it('should have a scan button', async () => {
    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId('scan-button')).toBeTruthy();
    });
  });

  it('should navigate to scanner when scan button pressed', async () => {
    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId('scan-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('scan-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Scanner');
  });

  it('should display multiple books', async () => {
    useBookStore.setState({
      books: [
        { id: '1', title: 'First Book', author: 'Author 1', thumbnailUrl: '', addedAt: 2000 },
        { id: '2', title: 'Second Book', author: 'Author 2', thumbnailUrl: '', addedAt: 1000 },
      ],
      isLoading: false,
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('First Book')).toBeTruthy();
    });
    expect(getByText('Second Book')).toBeTruthy();
  });

  it('should show loading state', () => {
    // Override the mock loadBooks to keep isLoading true for this test
    useBookStore.setState({
      books: [],
      isLoading: true,
      loadBooks: jest.fn().mockImplementation(async () => {
        // Keep loading state for this test
      }),
    });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
