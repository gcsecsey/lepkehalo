/**
 * Book entity representing a book from Moly.hu
 */
export interface Book {
  /** Moly.hu book ID */
  id: string;
  /** Book title */
  title: string;
  /** Author name(s) */
  author: string;
  /** Cover image URL */
  thumbnailUrl: string;
  /** ISBN (optional, for reference) */
  isbn?: string;
  /** Timestamp when the book was added (for sorting) */
  addedAt: number;
}

/**
 * Create a new Book object
 */
export function createBook(params: {
  id: string | number;
  title: string;
  author: string;
  thumbnailUrl: string;
  isbn?: string;
}): Book {
  return {
    id: String(params.id),
    title: params.title,
    author: params.author,
    thumbnailUrl: params.thumbnailUrl,
    isbn: params.isbn,
    addedAt: Date.now(),
  };
}

/**
 * Type guard to check if an object is a valid Book
 */
export function isValidBook(obj: unknown): obj is Book {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const book = obj as Record<string, unknown>;

  return (
    typeof book.id === 'string' &&
    typeof book.title === 'string' &&
    typeof book.author === 'string' &&
    typeof book.thumbnailUrl === 'string' &&
    typeof book.addedAt === 'number'
  );
}
