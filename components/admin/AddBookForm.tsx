"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Scan } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AddBookForm() {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<any>(null);
  const [library, setLibrary] = useState("");
  const queryClient = useQueryClient();

  const fetchBookInfo = async () => {
      if (!isbn) return;
      setLoading(true);
      try {
          // Using OpenLibrary API
          const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
          const data = await response.json();
          const key = `ISBN:${isbn}`;
          if (data[key]) {
              const info = data[key];
              setBookData({
                  isbn: isbn,
                  title: info.title,
                  author: info.authors ? info.authors.map((a: any) => a.name).join(", ") : "Unknown",
                  coverUrl: info.cover ? info.cover.large || info.cover.medium : "",
                  description: "",
              });
          } else {
              alert("Book not found on OpenLibrary");
          }
      } catch (e) {
          console.error(e);
          alert("Error fetching book info");
      } finally {
          setLoading(false);
      }
  };

  const addBookMutation = useMutation({
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
          setIsbn("");
          setLibrary("");
          queryClient.invalidateQueries({ queryKey: ['books'] });
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
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Input
                    placeholder="Scan or enter ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="bg-white text-secondary pl-10"
                />
                <Scan className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <Button onClick={fetchBookInfo} disabled={loading} className="rounded-2xl">
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
        </div>

        {bookData && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-4 rounded-xl">
                 <div className="flex gap-4">
                     {bookData.coverUrl && (
                         <img src={bookData.coverUrl} alt="Cover" className="h-32 w-20 object-cover rounded-md" />
                     )}
                     <div className="flex-1 space-y-2">
                         <Input
                            value={bookData.title}
                            onChange={(e) => setBookData({...bookData, title: e.target.value})}
                            placeholder="Title"
                            className="bg-white text-secondary"
                         />
                         <Input
                            value={bookData.author}
                            onChange={(e) => setBookData({...bookData, author: e.target.value})}
                            placeholder="Author"
                            className="bg-white text-secondary"
                         />
                     </div>
                 </div>

                 <div>
                     <label className="text-sm mb-1 block">Library Target</label>
                     <Input
                        value={library}
                        onChange={(e) => setLibrary(e.target.value)}
                        placeholder="e.g. R&D, Marketing"
                        className="bg-white text-secondary"
                     />
                 </div>

                 <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-2xl" disabled={addBookMutation.isPending}>
                     {addBookMutation.isPending ? "Adding..." : "Add Book to Catalog"}
                 </Button>
            </form>
        )}
    </div>
  );
}
