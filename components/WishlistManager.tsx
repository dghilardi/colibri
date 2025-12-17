"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Trash2, PlusCircle, BookPlus, Loader2 } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";

// Define the shape of a Wishlist Request based on API response
interface WishlistRequest {
  _id: string;
  isbn: string;
  libraryTarget: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  meta: {
    title?: string;
    author?: string;
    cover?: string;
  };
  createdAt: string;
}

export function WishlistManager() {
  const { data: session } = useSession();
  const allowedLibraries = session?.user?.allowedLibraries || [];
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [library, setLibrary] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // To toggle form visibility

  useEffect(() => {
    if (isAdding && allowedLibraries.length > 0 && !library) {
      setLibrary(allowedLibraries[0]);
    }
  }, [isAdding, allowedLibraries, library]);

  const { data: requests, isLoading } = useQuery<WishlistRequest[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await fetch('/api/wishlist');
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: { isbn: string, libraryTarget: string }) => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to add to wishlist");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setSearchQuery("");
      setSearchResults([]);
      setLibrary("");
      setIsAdding(false);
      alert("Added to wishlist!");
    },
    onError: (e) => alert(e.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const promoteMutation = useMutation({
      mutationFn: async (req: WishlistRequest) => {
          const bookBody = {
              isbn: req.isbn,
              library: req.libraryTarget,
              title: req.meta.title || "Unknown Title",
              author: req.meta.author || "Unknown Author",
              coverUrl: req.meta.cover || "",
              description: "Promoted from Wishlist",
              status: 'AVAILABLE'
          };

          const res = await fetch('/api/books', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookBody)
          });

          if (!res.ok) {
               const err = await res.json();
               throw new Error(err.error || "Failed to promote book");
          }
          return res.json();
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['wishlist'] });
          alert("Book promoted to catalog!");
      },
      onError: (e) => alert(e.message)
  });

  const handleSearch = async () => {
      if (!searchQuery) return;
      setIsSearching(true);
      try {
          const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5&fields=title,author_name,isbn,cover_i,first_publish_year`);
          const data = await res.json();
          const results = (data.docs || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => d.isbn && d.isbn.length > 0)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((d: any) => ({
              title: d.title,
              author: d.author_name ? d.author_name[0] : "Unknown",
              isbn: d.isbn[0],
              coverId: d.cover_i,
              year: d.first_publish_year
          }));
          setSearchResults(results);
      } catch (e) {
          console.error(e);
          alert("Search failed");
      } finally {
          setIsSearching(false);
      }
  };

  const handleAdd = (selectedIsbn: string) => {
      if (!library) {
          alert("Please enter a library target first");
          return;
      }
      addMutation.mutate({ isbn: selectedIsbn, libraryTarget: library });
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary">Community Wishlist</h2>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Request Book
          </Button>
      </div>

      {isAdding && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <Input
                              placeholder="Title or ISBN"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                          />
                           <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute left-1 top-1 h-8 w-8 text-gray-500 hover:text-primary"
                                onClick={() => setShowScanner(true)}
                            >
                                <Scan className="h-4 w-4" />
                            </Button>
                      </div>
                      <select
                          value={library}
                          onChange={(e) => setLibrary(e.target.value)}
                          className="flex h-10 w-1/3 rounded-2xl border border-neutral bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                          {allowedLibraries.map((lib) => (
                              <option key={lib} value={lib}>
                                  {lib}
                              </option>
                          ))}
                      </select>
                      <Button type="submit" disabled={isSearching || !searchQuery}>
                          {isSearching ? <Loader2 className="animate-spin h-4 w-4" /> : "Search"}
                      </Button>
                  </div>

                  {showScanner && (
                      <BarcodeScanner
                          onScan={(code) => {
                              setSearchQuery(code);
                              setShowScanner(false);
                              // Auto search?
                          }}
                          onClose={() => setShowScanner(false)}
                      />
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((book) => (
                          <div key={book.isbn} className="flex gap-2 p-2 border rounded-lg hover:bg-gray-50 items-center">
                              {book.coverId ? (
                                  <img src={`https://covers.openlibrary.org/b/id/${book.coverId}-S.jpg`} className="w-10 h-14 object-cover rounded" alt="cover" />
                              ) : <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-[8px]">No Cover</div>}
                              <div className="flex-1 text-sm">
                                  <p className="font-bold line-clamp-1">{book.title}</p>
                                  <p className="text-gray-500">{book.author} ({book.year})</p>
                              </div>
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => handleAdd(book.isbn)}
                                disabled={addMutation.isPending}
                              >
                                Add
                              </Button>
                          </div>
                      ))}
                      {searchResults.length === 0 && searchQuery && !isSearching && (
                          <p className="text-xs text-gray-400 text-center">No results or search not started.</p>
                      )}
                  </div>

                  <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Close</Button>
                  </div>
              </form>
          </div>
      )}

      <div className="grid gap-4">
          {isLoading && <p className="text-center text-gray-500">Loading requests...</p>}

          {requests?.map((req) => (
              <div key={req._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                  <div className="h-20 w-14 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {req.meta.cover ? (
                          <img src={req.meta.cover} alt={req.meta.title} className="h-full w-full object-cover" />
                      ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Cover</div>
                      )}
                  </div>

                  <div className="flex-1">
                      <h3 className="font-bold text-secondary">{req.meta.title || "Unknown Title"}</h3>
                      <p className="text-sm text-gray-500">{req.meta.author || "Unknown Author"}</p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-400">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{req.libraryTarget}</span>
                          <span>Requested by {req.requestedBy?.name || "Unknown"}</span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-2">
                      {/* Delete if Owner or Admin */}
                      {(isAdmin || session?.user?.id === req.requestedBy?._id) && (
                          <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => {
                                  if(confirm("Delete this request?")) deleteMutation.mutate(req._id);
                              }}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      )}

                      {/* Promote if Admin */}
                      {isAdmin && (
                          <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-white gap-1"
                              onClick={() => {
                                  if(confirm(`Promote "${req.meta.title}" to Catalog?`)) promoteMutation.mutate(req);
                              }}
                              disabled={promoteMutation.isPending}
                          >
                              <BookPlus className="h-4 w-4" />
                              Promote
                          </Button>
                      )}
                  </div>
              </div>
          ))}

          {!isLoading && requests?.length === 0 && (
              <p className="text-center text-gray-500 py-8">No wishlist requests yet.</p>
          )}
      </div>
    </div>
  );
}
