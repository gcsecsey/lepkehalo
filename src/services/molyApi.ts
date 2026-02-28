import axios, { AxiosError } from 'axios';
import { Book, createBook } from '@/types/book';
import {
  MOLY_API_BASE,
  MOLY_BOOK_URL_BASE,
  MOLY_API_KEY,
  API_TIMEOUT_MS,
} from '@/constants/config';

/**
 * Response shape from Moly.hu API for book lookup
 */
interface MolyBookResponse {
  id: number;
  title: string;
  author: string;
  cover: string | null;
}

/**
 * Custom error class for API errors
 */
export class MolyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'MolyApiError';
  }
}

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: MOLY_API_BASE,
  timeout: API_TIMEOUT_MS,
});

/**
 * Search for a book by ISBN on Moly.hu
 *
 * @param isbn - The ISBN (10 or 13 digit) to search for
 * @returns Book object if found, null if not found (404)
 * @throws MolyApiError for network errors or server errors
 */
export async function searchBookByISBN(isbn: string): Promise<Book | null> {
  try {
    const response = await apiClient.get<MolyBookResponse>('/book_by_isbn.json', {
      params: {
        q: isbn,
        key: MOLY_API_KEY,
      },
    });

    const data = response.data;

    return createBook({
      id: data.id,
      title: data.title,
      author: data.author,
      thumbnailUrl: data.cover || '',
      isbn,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // 404 means book not found - this is expected, return null
      if (axiosError.response?.status === 404) {
        return null;
      }

      // Network error (no response)
      if (!axiosError.response) {
        throw new MolyApiError(
          'Network error: Unable to reach Moly.hu',
          undefined,
          true
        );
      }

      // Server error
      throw new MolyApiError(
        `Server error: ${axiosError.response.status}`,
        axiosError.response.status
      );
    }

    // Unknown error
    throw error;
  }
}

/**
 * Get the Moly.hu URL for a book
 *
 * @param bookId - The Moly.hu book ID
 * @returns Full URL to the book page on Moly.hu
 */
export function getMolyBookUrl(bookId: string): string {
  return `${MOLY_BOOK_URL_BASE}/${bookId}`;
}
