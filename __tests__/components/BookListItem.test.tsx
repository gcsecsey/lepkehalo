import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookListItem } from '@/components/BookListItem';
import { Book } from '@/types/book';

describe('BookListItem', () => {
  const mockBook: Book = {
    id: '123',
    title: 'A kék sziget',
    author: 'Rejtő Jenő',
    thumbnailUrl: 'https://moly.hu/system/covers/big/covers_123.jpg',
    addedAt: Date.now(),
  };

  it('should render book title', () => {
    const { getByText } = render(
      <BookListItem book={mockBook} onPress={jest.fn()} />
    );

    expect(getByText('A kék sziget')).toBeTruthy();
  });

  it('should render book author', () => {
    const { getByText } = render(
      <BookListItem book={mockBook} onPress={jest.fn()} />
    );

    expect(getByText('Rejtő Jenő')).toBeTruthy();
  });

  it('should render book cover image', () => {
    const { getByTestId } = render(
      <BookListItem book={mockBook} onPress={jest.fn()} />
    );

    const image = getByTestId('book-cover');
    expect(image.props.source.uri).toBe(mockBook.thumbnailUrl);
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BookListItem book={mockBook} onPress={onPress} />
    );

    fireEvent.press(getByTestId('book-list-item'));

    expect(onPress).toHaveBeenCalledWith(mockBook);
  });

  it('should show placeholder when no cover image', () => {
    const bookWithoutCover = { ...mockBook, thumbnailUrl: '' };
    const { getByTestId } = render(
      <BookListItem book={bookWithoutCover} onPress={jest.fn()} />
    );

    expect(getByTestId('book-cover-placeholder')).toBeTruthy();
  });

  it('should truncate long titles', () => {
    const bookWithLongTitle = {
      ...mockBook,
      title: 'This is an extremely long book title that should be truncated when displayed',
    };
    const { getByText } = render(
      <BookListItem book={bookWithLongTitle} onPress={jest.fn()} />
    );

    expect(getByText(bookWithLongTitle.title)).toBeTruthy();
  });
});
