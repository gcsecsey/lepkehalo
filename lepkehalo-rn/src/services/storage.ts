import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, isValidBook } from '@/types/book';

export const STORAGE_KEY = 'books';

/**
 * Save books array to persistent storage
 */
export async function saveBooks(books: Book[]): Promise<void> {
  try {
    const json = JSON.stringify(books);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save books:', error);
    throw error;
  }
}

/**
 * Load books array from persistent storage
 * Returns empty array if no data or data is corrupted
 */
export async function loadBooks(): Promise<Book[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);

    if (json === null) {
      return [];
    }

    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Filter out any invalid entries
    return parsed.filter(isValidBook);
  } catch (error) {
    console.error('Failed to load books:', error);
    return [];
  }
}
