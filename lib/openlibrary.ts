export interface BookDetails {
  title: string;
  author: string;
  cover?: string;
}

export interface SearchResult {
  title: string;
  author: string;
  isbn: string;
  coverUrl: string | null;
  key: string;
}

export async function getBookDetails(isbn: string): Promise<BookDetails | null> {
  try {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
    if (!response.ok) {
        console.error("OpenLibrary API error:", response.statusText);
        return null;
    }
    const data = await response.json();
    const key = `ISBN:${isbn}`;
    const bookData = data[key];

    if (!bookData) {
      return null;
    }

    return {
      title: bookData.title,
      author: bookData.authors ? bookData.authors.map((a: { name: string }) => a.name).join(', ') : 'Unknown',
      cover: bookData.cover ? bookData.cover.medium || bookData.cover.large || bookData.cover.small : null
    };
  } catch (error) {
    console.error("Error fetching from OpenLibrary:", error);
    return null;
  }
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,isbn,cover_i`);
    if (!response.ok) {
        console.error("OpenLibrary API error:", response.statusText);
        return [];
    }
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.docs.map((doc: any) => ({
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(", ") : "Unknown",
        isbn: doc.isbn ? doc.isbn[0] : null, // Pick the first ISBN
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
        key: doc.key
    })).filter((book: SearchResult) => book.isbn); // Only return books with ISBN as we need it for ID
  } catch (error) {
    console.error("Error searching OpenLibrary:", error);
    return [];
  }
}
