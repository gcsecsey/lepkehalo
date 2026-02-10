import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '@/types/book';
import { useBookStore } from '@/stores/bookStore';
import { STORAGE_KEY } from '@/services/storage';

describe('Book Store', () => {
  beforeEach(async () => {
    // Reset store state before each test
    useBookStore.setState({ books: [], isLoading: false });
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('addBook', () => {
    it('should add a new book to the beginning of the list', () => {
      const book: Book = {
        id: '123',
        title: 'Test Book',
        author: 'Test Author',
        thumbnailUrl: 'https://example.com/cover.jpg',
        addedAt: Date.now(),
      };

      useBookStore.getState().addBook(book);

      expect(useBookStore.getState().books).toHaveLength(1);
      expect(useBookStore.getState().books[0]).toEqual(book);
    });

    it('should add new books to the beginning (most recent first)', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.getState().addBook(book1);
      useBookStore.getState().addBook(book2);

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(2);
      expect(books[0].id).toBe('2'); // Most recent first
      expect(books[1].id).toBe('1');
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
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

    it('should persist to storage after removing', async () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.setState({ books: [book1, book2] });

      useBookStore.getState().removeBook('1');

      // Wait for async storage operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });

  describe('restoreBook', () => {
    it('should restore book at original index', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };
      const book3: Book = { id: '3', title: 'Book 3', author: 'A3', thumbnailUrl: '', addedAt: 3000 };

      useBookStore.setState({ books: [book1, book3] }); // book2 was removed from index 1

      useBookStore.getState().restoreBook(book2, 1);

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(3);
      expect(books[1]).toEqual(book2);
    });

    it('should append to end if index is out of bounds', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };

      useBookStore.setState({ books: [book1] });

      useBookStore.getState().restoreBook(book2, 10); // index > length

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(2);
      expect(books[1]).toEqual(book2);
    });
  });

  describe('moveToTop', () => {
    it('should move book to the top of the list', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };
      const book2: Book = { id: '2', title: 'Book 2', author: 'A2', thumbnailUrl: '', addedAt: 2000 };
      const book3: Book = { id: '3', title: 'Book 3', author: 'A3', thumbnailUrl: '', addedAt: 3000 };

      useBookStore.setState({ books: [book1, book2, book3] });

      useBookStore.getState().moveToTop('3');

      const { books } = useBookStore.getState();
      expect(books[0].id).toBe('3');
      expect(books[1].id).toBe('1');
      expect(books[2].id).toBe('2');
    });

    it('should do nothing if book not found', () => {
      const book1: Book = { id: '1', title: 'Book 1', author: 'A1', thumbnailUrl: '', addedAt: 1000 };

      useBookStore.setState({ books: [book1] });

      useBookStore.getState().moveToTop('nonexistent');

      const { books } = useBookStore.getState();
      expect(books).toHaveLength(1);
      expect(books[0].id).toBe('1');
    });
  });

  describe('loadBooks', () => {
    it('should load books from storage on initialization', async () => {
      const storedBooks: Book[] = [
        { id: '1', title: 'Stored Book', author: 'A', thumbnailUrl: '', addedAt: 1000 },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedBooks));

      await useBookStore.getState().loadBooks();

      expect(useBookStore.getState().books).toEqual(storedBooks);
    });

    it('should set isLoading to true while loading', async () => {
      const storedBooks: Book[] = [
        { id: '1', title: 'Stored Book', author: 'A', thumbnailUrl: '', addedAt: 1000 },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedBooks));

      const loadPromise = useBookStore.getState().loadBooks();

      // Initially loading
      expect(useBookStore.getState().isLoading).toBe(true);

      await loadPromise;

      // After load complete
      expect(useBookStore.getState().isLoading).toBe(false);
    });

    it('should handle empty storage', async () => {
      await useBookStore.getState().loadBooks();

      expect(useBookStore.getState().books).toEqual([]);
      expect(useBookStore.getState().isLoading).toBe(false);
    });
  });

  describe('getBookById', () => {
    it('should return book by ID', () => {
      const book: Book = { id: '123', title: 'Test Book', author: 'A', thumbnailUrl: '', addedAt: 1000 };
      useBookStore.setState({ books: [book] });

      const result = useBookStore.getState().getBookById('123');

      expect(result).toEqual(book);
    });

    it('should return undefined if book not found', () => {
      useBookStore.setState({ books: [] });

      const result = useBookStore.getState().getBookById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('hasBook', () => {
    it('should return true if book exists', () => {
      const book: Book = { id: '123', title: 'Test Book', author: 'A', thumbnailUrl: '', addedAt: 1000 };
      useBookStore.setState({ books: [book] });

      expect(useBookStore.getState().hasBook('123')).toBe(true);
    });

    it('should return false if book does not exist', () => {
      useBookStore.setState({ books: [] });

      expect(useBookStore.getState().hasBook('nonexistent')).toBe(false);
    });
  });
});
