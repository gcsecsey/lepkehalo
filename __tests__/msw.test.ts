import { http, HttpResponse } from 'msw';
import { server } from '../__mocks__/server';

describe('MSW Setup', () => {
  it('should mock API responses', async () => {
    const response = await fetch(
      'https://moly.hu/api/book_by_isbn.json?q=9789630778459&key=test-key'
    );
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.title).toBe('A kék sziget');
    expect(data.author).toBe('Rejtő Jenő');
  });

  it('should return 404 for unknown ISBN', async () => {
    const response = await fetch(
      'https://moly.hu/api/book_by_isbn.json?q=0000000000000&key=test-key'
    );

    expect(response.status).toBe(404);
  });

  it('should allow runtime handler overrides', async () => {
    // Override the default handler for this test
    server.use(
      http.get('https://moly.hu/api/book_by_isbn.json', () => {
        return HttpResponse.json({
          id: 99999,
          title: 'Test Override Book',
          author: 'Test Author',
          cover: 'https://example.com/cover.jpg',
        });
      })
    );

    const response = await fetch(
      'https://moly.hu/api/book_by_isbn.json?q=any&key=test-key'
    );
    const data = await response.json();

    expect(data.title).toBe('Test Override Book');
  });
});
