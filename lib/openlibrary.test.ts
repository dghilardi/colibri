import { searchBooks, getBookDetails } from './openlibrary';

global.fetch = jest.fn();

describe('OpenLibrary', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('searchBooks returns formatted results', async () => {
    const mockResponse = {
      docs: [
        {
          title: 'Test Book',
          author_name: ['Author One'],
          isbn: ['1234567890'],
          cover_i: 12345,
          key: '/works/OL123W'
        }
      ]
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const results = await searchBooks('Test');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Book');
    expect(results[0].isbn).toBe('1234567890');
    expect(results[0].coverUrl).toContain('12345-M.jpg');
  });

  it('getBookDetails returns formatted details', async () => {
    const isbn = '1234567890';
    const mockResponse = {
      [`ISBN:${isbn}`]: {
        title: 'Test Book',
        authors: [{ name: 'Author One' }],
        cover: { medium: 'http://example.com/cover.jpg' }
      }
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await getBookDetails(isbn);
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Test Book');
    expect(result?.author).toBe('Author One');
    expect(result?.cover).toBe('http://example.com/cover.jpg');
  });
});
