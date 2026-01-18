import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '@/types/book';
import { saveBooks, loadBooks, STORAGE_KEY } from '@/services/storage';

describe('Storage Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveBooks', () => {
    it('should save books array to AsyncStorage', async () => {
      const books: Book[] = [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 },
        { id: '2', title: 'Book 2', author: 'Author 2', thumbnailUrl: '', addedAt: 2000 },
      ];

      await saveBooks(books);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual(books);
    });

    it('should handle empty array', async () => {
      await saveBooks([]);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it('should overwrite existing data', async () => {
      const oldBooks: Book[] = [
        { id: '1', title: 'Old Book', author: 'Author', thumbnailUrl: '', addedAt: 1000 },
      ];
      const newBooks: Book[] = [
        { id: '2', title: 'New Book', author: 'Author', thumbnailUrl: '', addedAt: 2000 },
      ];

      await saveBooks(oldBooks);
      await saveBooks(newBooks);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual(newBooks);
    });
  });

  describe('loadBooks', () => {
    it('should load books from AsyncStorage', async () => {
      const books: Book[] = [
        { id: '1', title: 'Book 1', author: 'Author 1', thumbnailUrl: '', addedAt: 1000 },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));

      const result = await loadBooks();

      expect(result).toEqual(books);
    });

    it('should return empty array when no data stored', async () => {
      const result = await loadBooks();
      expect(result).toEqual([]);
    });

    it('should return empty array for corrupted data', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, 'not valid json{{{');

      const result = await loadBooks();
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array data', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ notAnArray: true }));

      const result = await loadBooks();
      expect(result).toEqual([]);
    });

    it('should filter out invalid book entries', async () => {
      const mixedData = [
        { id: '1', title: 'Valid Book', author: 'Author', thumbnailUrl: '', addedAt: 1000 },
        { invalid: 'data' },
        null,
        { id: '2', title: 'Another Valid', author: 'Author 2', thumbnailUrl: '', addedAt: 2000 },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mixedData));

      const result = await loadBooks();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });
});
