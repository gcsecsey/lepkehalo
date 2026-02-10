import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server';
import { searchBookByISBN, getMolyBookUrl } from '@/services/molyApi';

describe('MolyApi Service', () => {
  describe('searchBookByISBN', () => {
    it('should return book data for valid ISBN', async () => {
      // Using default mock handler from __mocks__/handlers.ts
      const result = await searchBookByISBN('9789630778459');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.title).toBe('A kék sziget');
      expect(result?.author).toBe('Rejtő Jenő');
      expect(result?.thumbnailUrl).toContain('covers_12345');
      expect(result?.isbn).toBe('9789630778459');
      expect(result?.addedAt).toBeDefined();
    });

    it('should return null for ISBN not found (404)', async () => {
      const result = await searchBookByISBN('0000000000000');

      expect(result).toBeNull();
    });

    it('should throw error for network failure', async () => {
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', () => {
          return HttpResponse.error();
        })
      );

      await expect(searchBookByISBN('9789630778459')).rejects.toThrow();
    });

    it('should throw error for server error (500)', async () => {
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(searchBookByISBN('9789630778459')).rejects.toThrow();
    });

    it('should include API key in request', async () => {
      let capturedUrl: URL | null = null;

      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json({
            id: 1,
            title: 'Test',
            author: 'Author',
            cover: 'https://example.com/cover.jpg',
          });
        })
      );

      await searchBookByISBN('9789630778459');

      expect(capturedUrl?.searchParams.get('key')).toBeTruthy();
      expect(capturedUrl?.searchParams.get('q')).toBe('9789630778459');
    });

    it('should handle different ISBN formats', async () => {
      // ISBN-13
      const result13 = await searchBookByISBN('9789630778459');
      expect(result13).not.toBeNull();

      // ISBN with different book
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', ({ request }) => {
          const url = new URL(request.url);
          const isbn = url.searchParams.get('q');
          if (isbn === '9789634790914') {
            return HttpResponse.json({
              id: 67890,
              title: 'Egri csillagok',
              author: 'Gárdonyi Géza',
              cover: 'https://moly.hu/system/covers/big/covers_67890.jpg',
            });
          }
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        })
      );

      const result2 = await searchBookByISBN('9789634790914');
      expect(result2?.title).toBe('Egri csillagok');
    });

    it('should convert numeric book ID to string', async () => {
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', () => {
          return HttpResponse.json({
            id: 12345, // numeric ID from API
            title: 'Test Book',
            author: 'Test Author',
            cover: 'https://example.com/cover.jpg',
          });
        })
      );

      const result = await searchBookByISBN('9789630778459');

      expect(result?.id).toBe('12345');
      expect(typeof result?.id).toBe('string');
    });

    it('should handle empty cover URL', async () => {
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', () => {
          return HttpResponse.json({
            id: 12345,
            title: 'Test Book',
            author: 'Test Author',
            cover: '',
          });
        })
      );

      const result = await searchBookByISBN('9789630778459');

      expect(result?.thumbnailUrl).toBe('');
    });

    it('should handle null cover URL', async () => {
      server.use(
        http.get('https://moly.hu/api/book_by_isbn.json', () => {
          return HttpResponse.json({
            id: 12345,
            title: 'Test Book',
            author: 'Test Author',
            cover: null,
          });
        })
      );

      const result = await searchBookByISBN('9789630778459');

      expect(result?.thumbnailUrl).toBe('');
    });
  });

  describe('getMolyBookUrl', () => {
    it('should return correct moly.hu URL for book ID', () => {
      const url = getMolyBookUrl('12345');
      expect(url).toBe('https://moly.hu/konyvek/12345');
    });

    it('should handle string IDs', () => {
      const url = getMolyBookUrl('rejtő-jenő-a-kék-sziget');
      expect(url).toBe('https://moly.hu/konyvek/rejtő-jenő-a-kék-sziget');
    });
  });
});
