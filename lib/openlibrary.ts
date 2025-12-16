export async function getBookDetails(isbn: string) {
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
