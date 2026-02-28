import { Book, createBook, isValidBook } from '@/types/book';

describe('Book type', () => {
  it('should have required fields: id, title, author, thumbnailUrl, addedAt', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now(),
    };

    expect(book.id).toBeDefined();
    expect(book.title).toBeDefined();
    expect(book.author).toBeDefined();
    expect(book.thumbnailUrl).toBeDefined();
    expect(book.addedAt).toBeDefined();
  });

  it('should allow optional isbn field', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      isbn: '9780123456789',
      addedAt: Date.now(),
    };

    expect(book.isbn).toBe('9780123456789');
  });

  it('should work without isbn field', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now(),
    };

    expect(book.isbn).toBeUndefined();
  });
});

describe('createBook', () => {
  it('should create a book with string id', () => {
    const book = createBook({
      id: '12345',
      title: 'A kék sziget',
      author: 'Rejtő Jenő',
      thumbnailUrl: 'https://moly.hu/system/covers/big/covers_12345.jpg',
    });

    expect(book.id).toBe('12345');
    expect(book.title).toBe('A kék sziget');
    expect(book.author).toBe('Rejtő Jenő');
    expect(book.thumbnailUrl).toContain('covers_12345');
    expect(book.addedAt).toBeDefined();
    expect(typeof book.addedAt).toBe('number');
  });

  it('should convert numeric id to string', () => {
    const book = createBook({
      id: 12345,
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
    });

    expect(book.id).toBe('12345');
    expect(typeof book.id).toBe('string');
  });

  it('should include isbn when provided', () => {
    const book = createBook({
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      isbn: '9789630778459',
    });

    expect(book.isbn).toBe('9789630778459');
  });

  it('should set addedAt to current timestamp', () => {
    const before = Date.now();
    const book = createBook({
      id: '123',
      title: 'Test',
      author: 'Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
    });
    const after = Date.now();

    expect(book.addedAt).toBeGreaterThanOrEqual(before);
    expect(book.addedAt).toBeLessThanOrEqual(after);
  });
});

describe('isValidBook', () => {
  it('should return true for valid book object', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now(),
    };

    expect(isValidBook(book)).toBe(true);
  });

  it('should return true for valid book with optional isbn', () => {
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      isbn: '9780123456789',
      addedAt: Date.now(),
    };

    expect(isValidBook(book)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidBook(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidBook(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isValidBook('string')).toBe(false);
    expect(isValidBook(123)).toBe(false);
    expect(isValidBook(true)).toBe(false);
  });

  it('should return false for object missing id', () => {
    const invalidBook = {
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now(),
    };

    expect(isValidBook(invalidBook)).toBe(false);
  });

  it('should return false for object with wrong type for id', () => {
    const invalidBook = {
      id: 123, // should be string
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
      addedAt: Date.now(),
    };

    expect(isValidBook(invalidBook)).toBe(false);
  });

  it('should return false for object missing addedAt', () => {
    const invalidBook = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      thumbnailUrl: 'https://example.com/cover.jpg',
    };

    expect(isValidBook(invalidBook)).toBe(false);
  });
});
