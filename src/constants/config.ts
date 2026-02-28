/**
 * Application configuration constants
 */

// Moly.hu API configuration
export const MOLY_API_BASE = 'https://moly.hu/api';
export const MOLY_BOOK_URL_BASE = 'https://moly.hu/konyvek';

// API key should be stored in environment variable for production
// For development, we use a placeholder that should be replaced
export const MOLY_API_KEY = process.env.EXPO_PUBLIC_MOLY_API_KEY || 'dev-api-key';

// Request timeouts
export const API_TIMEOUT_MS = 10000; // 10 seconds
