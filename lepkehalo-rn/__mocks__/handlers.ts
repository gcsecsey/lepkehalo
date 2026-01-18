import { http, HttpResponse } from 'msw';

// Mock book data for testing
export const mockBooks: Record<string, { id: number; title: string; author: string; cover: string }> = {
  '9789630778459': {
    id: 12345,
    title: 'A kék sziget',
    author: 'Rejtő Jenő',
    cover: 'https://moly.hu/system/covers/big/covers_12345.jpg',
  },
  '9789634790914': {
    id: 67890,
    title: 'Egri csillagok',
    author: 'Gárdonyi Géza',
    cover: 'https://moly.hu/system/covers/big/covers_67890.jpg',
  },
};

export const handlers = [
  // Moly.hu API - book lookup by ISBN
  http.get('https://moly.hu/api/book_by_isbn.json', ({ request }) => {
    const url = new URL(request.url);
    const isbn = url.searchParams.get('q');
    const apiKey = url.searchParams.get('key');

    // Check for API key (in real tests, this would be mocked)
    if (!apiKey) {
      return HttpResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    // Check if ISBN exists in mock data
    if (isbn && mockBooks[isbn]) {
      return HttpResponse.json(mockBooks[isbn]);
    }

    // ISBN not found
    return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
  }),
];
