"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Scan, BookOpen } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { searchBooks, getBookDetails, SearchResult } from "@/lib/openlibrary";

export function AddBookForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookData, setBookData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [library, setLibrary] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [mode, setMode] = useState<'isbn' | 'title'>('isbn');

  const queryClient = useQueryClient();

  const handleSearch = async (queryOverride?: string) => {
      const targetQuery = queryOverride || query;
      if (!targetQuery) return;

      setLoading(true);
      setBookData(null);
      setSearchResults([]);

      try {
          if (mode === 'isbn') {
              const details = await getBookDetails(targetQuery);
              if (details) {
                  setBookData({
                      isbn: targetQuery,
                      title: details.title,
                      author: details.author,
                      coverUrl: details.cover, // Map 'cover' from lib to 'coverUrl' for UI
                      description: ""
                  });
              } else {
                  alert("Book not found via ISBN");
              }
          } else {
              // Title search
              const results = await searchBooks(targetQuery);
              if (results.length > 0) {
                  setSearchResults(results);
              } else {
                  alert("No books found with that title");
              }
          }
      } catch (e) {
          console.error(e);
          alert("Error searching for book");
      } finally {
          setLoading(false);
      }
  };

  const selectBook = async (book: SearchResult) => {
      setLoading(true);
      try {
          const details = await getBookDetails(book.isbn);
          setBookData({
              isbn: book.isbn,
              title: details?.title || book.title,
              author: details?.author || book.author,
              coverUrl: details?.cover || book.coverUrl,
              description: ""
          });
          setSearchResults([]);
      } catch (e) {
          console.error("Error fetching details", e);
          // Fallback to search result data
          setBookData({
              isbn: book.isbn,
              title: book.title,
              author: book.author,
              coverUrl: book.coverUrl,
              description: ""
          });
          setSearchResults([]);
      } finally {
          setLoading(false);
      }
  }

  const addBookMutation = useMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mutationFn: async (data: any) => {
          const res = await fetch('/api/books', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error("Failed to add book");
          return res.json();
      },
      onSuccess: () => {
          alert("Book added successfully!");
          setBookData(null);
          setQuery("");
          setLibrary("");
          queryClient.invalidateQueries({ queryKey: ['books'] });
          queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      }
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!bookData || !library) {
          alert("Please fill all fields");
          return;
      }
      addBookMutation.mutate({
          ...bookData,
          library
      });
  };

  return (
    <div className="space-y-4">
        <div className="flex gap-2 mb-4">
            <Button
                variant={mode === 'isbn' ? "default" : "outline"}
                onClick={() => { setMode('isbn'); setQuery(''); setSearchResults([]); setBookData(null); }}
                className="flex-1"
            >
                <Scan className="w-4 h-4 mr-2" />
                Scan / ISBN
            </Button>
            <Button
                variant={mode === 'title' ? "default" : "outline"}
                onClick={() => { setMode('title'); setQuery(''); setSearchResults([]); setBookData(null); }}
                className="flex-1"
            >
                <Search className="w-4 h-4 mr-2" />
                Search Title
            </Button>
        </div>

        <div className="flex gap-2">
            <div className="relative flex-1">
                <Input
                    placeholder={mode === 'isbn' ? "Scan or enter ISBN" : "Enter book title"}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-white text-secondary pl-10"
                />
                {mode === 'isbn' ? (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1 h-8 w-8 text-gray-500 hover:text-primary"
                        onClick={() => setShowScanner(true)}
                    >
                        <Scan className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <BookOpen className="h-4 w-4" />
                    </div>
                )}
            </div>
            <Button onClick={() => handleSearch()} disabled={loading} className="rounded-2xl">
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
        </div>

        {showScanner && (
            <BarcodeScanner
                onScan={(code) => {
                    setQuery(code);
                    setShowScanner(false);
                    handleSearch(code); // Trigger search automatically
                }}
                onClose={() => setShowScanner(false)}
            />
        )}

        {/* Search Results List */}
        {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto bg-white/5 rounded-xl p-2 border border-gray-700 custom-scrollbar">
                {searchResults.map((book) => (
                    <div
                        key={book.key}
                        className="flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer transition-colors"
                        onClick={() => selectBook(book)}
                    >
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt="" className="w-10 h-14 object-cover rounded shadow" />
                        ) : (
                            <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-gray-500" />
                            </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                            <p className="font-medium text-white truncate">{book.title}</p>
                            <p className="text-xs text-gray-400 truncate">{book.author}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{book.isbn}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {bookData && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-4 rounded-xl border border-gray-600 animate-in fade-in zoom-in-95">
                 <div className="flex gap-4">
                     {bookData.coverUrl && (
                         <img src={bookData.coverUrl} alt="Cover" className="h-32 w-20 object-cover rounded-md shadow-lg" />
                     )}
                     <div className="flex-1 space-y-2">
                         <div className="space-y-1">
                            <label className="text-xs text-gray-400">Title</label>
                            <Input
                                value={bookData.title}
                                onChange={(e) => setBookData({...bookData, title: e.target.value})}
                                placeholder="Title"
                                className="bg-white text-secondary"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs text-gray-400">Author</label>
                            <Input
                                value={bookData.author}
                                onChange={(e) => setBookData({...bookData, author: e.target.value})}
                                placeholder="Author"
                                className="bg-white text-secondary"
                            />
                         </div>
                     </div>
                 </div>

                 <div>
                     <label className="text-sm mb-1 block text-gray-300">Library Target</label>
                     <Input
                        value={library}
                        onChange={(e) => setLibrary(e.target.value)}
                        placeholder="e.g. R&D, Marketing"
                        className="bg-white text-secondary"
                     />
                     <p className="text-xs text-gray-500 mt-1">Assign this book to a specific library group.</p>
                 </div>

                 <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-2xl font-bold" disabled={addBookMutation.isPending}>
                     {addBookMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                     {addBookMutation.isPending ? "Adding..." : "Add Book to Catalog"}
                 </Button>
            </form>
        )}
    </div>
  );
}
