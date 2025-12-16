"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { IBook } from "@/models/Book";
import { Button } from "@/components/ui/button";

export function BookList() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: books, isLoading, error } = useQuery<IBook[]>({
    queryKey: ['books', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const borrowMutation = useMutation({
    mutationFn: async (bookId: string) => {
        const res = await fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to borrow");
        }
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['books'] });
        alert("Book borrowed!");
    },
    onError: (e) => {
        alert(e.message);
    }
  });

  return (
    <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search books..."
                className="pl-9 bg-white text-secondary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {isLoading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error loading books</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books?.map((book: any) => (
                <div key={book._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                     <div className="h-24 w-16 bg-gray-200 rounded-lg flex-shrink-0">
                         {/* Cover placeholder */}
                         {book.coverUrl ? (
                             <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover rounded-lg" />
                         ) : (
                             <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs text-center p-1">No Cover</div>
                         )}
                     </div>
                     <div className="flex-1 flex flex-col justify-between">
                         <div>
                            <h3 className="font-bold text-secondary line-clamp-1">{book.title}</h3>
                            <p className="text-xs text-gray-500">{book.author}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {book.library}
                            </span>
                         </div>
                         <div className="flex justify-between items-center mt-2">
                             <span className={`text-xs font-bold ${book.status === 'AVAILABLE' ? 'text-primary' : 'text-red-500'}`}>
                                 {book.status}
                             </span>
                             {book.status === 'AVAILABLE' && (
                                 <Button
                                    size="sm"
                                    className="h-7 text-xs rounded-xl"
                                    onClick={() => borrowMutation.mutate(book._id)}
                                    disabled={borrowMutation.isPending}
                                 >
                                    Borrow
                                 </Button>
                             )}
                             {/* Show return button if borrowed by me? or admin? */}
                             {/* For now just simple borrow. */}
                         </div>
                     </div>
                </div>
            ))}

            {!isLoading && books?.length === 0 && (
                <p className="text-center text-gray-500 col-span-full">No books found.</p>
            )}
        </div>
    </div>
  );
}
