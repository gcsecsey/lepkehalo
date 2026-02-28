import { create } from 'zustand';
import { Book } from '@/types/book';
import { saveBooks, loadBooks } from '@/services/storage';

interface RemoveResult {
  book: Book;
  index: number;
}

interface BookStore {
  books: Book[];
  isLoading: boolean;

  // Actions
  addBook: (book: Book) => void;
  removeBook: (id: string) => RemoveResult | null;
  restoreBook: (book: Book, index: number) => void;
  moveToTop: (id: string) => void;
  loadBooks: () => Promise<void>;

  // Selectors
  getBookById: (id: string) => Book | undefined;
  hasBook: (id: string) => boolean;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  isLoading: false,

  addBook: (book: Book) => {
    const { books } = get();
    const existingIndex = books.findIndex((b) => b.id === book.id);

    let newBooks: Book[];

    if (existingIndex !== -1) {
      // Book exists, move to top
      newBooks = [book, ...books.filter((b) => b.id !== book.id)];
    } else {
      // New book, add to beginning
      newBooks = [book, ...books];
    }

    set({ books: newBooks });

    // Persist to storage (fire and forget)
    saveBooks(newBooks).catch((error) => {
      console.error('Failed to persist books after add:', error);
    });
  },

  removeBook: (id: string) => {
    const { books } = get();
    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
      return null;
    }

    const removedBook = books[index];
    const newBooks = books.filter((b) => b.id !== id);

    set({ books: newBooks });

    // Persist to storage (fire and forget)
    saveBooks(newBooks).catch((error) => {
      console.error('Failed to persist books after remove:', error);
    });

    return { book: removedBook, index };
  },

  restoreBook: (book: Book, index: number) => {
    const { books } = get();
    const newBooks = [...books];

    // Clamp index to valid range
    const insertIndex = Math.min(index, newBooks.length);
    newBooks.splice(insertIndex, 0, book);

    set({ books: newBooks });

    // Persist to storage (fire and forget)
    saveBooks(newBooks).catch((error) => {
      console.error('Failed to persist books after restore:', error);
    });
  },

  moveToTop: (id: string) => {
    const { books } = get();
    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
      return;
    }

    const book = books[index];
    const newBooks = [book, ...books.filter((b) => b.id !== id)];

    set({ books: newBooks });

    // Persist to storage (fire and forget)
    saveBooks(newBooks).catch((error) => {
      console.error('Failed to persist books after moveToTop:', error);
    });
  },

  loadBooks: async () => {
    set({ isLoading: true });

    try {
      const books = await loadBooks();
      set({ books, isLoading: false });
    } catch (error) {
      console.error('Failed to load books:', error);
      set({ isLoading: false });
    }
  },

  getBookById: (id: string) => {
    return get().books.find((b) => b.id === id);
  },

  hasBook: (id: string) => {
    return get().books.some((b) => b.id === id);
  },
}));
