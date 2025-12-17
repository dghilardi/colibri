"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  library: string;
  status: 'AVAILABLE' | 'BORROWED';
  currentLoan?: {
      userId: {
          name: string;
          email: string;
      }
  };
}

export function BookManagementList() {
    const queryClient = useQueryClient();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const { data: books, isLoading, error } = useQuery<Book[]>({
        queryKey: ['admin-books'],
        queryFn: async () => {
            const res = await fetch('/api/books?admin=true');
            if (!res.ok) throw new Error("Failed to fetch books");
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-books'] });
            queryClient.invalidateQueries({ queryKey: ['books'] }); // Refresh main catalog too
        },
        onSettled: () => setActionLoading(null)
    });

    const returnMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'return' })
            });
            if (!res.ok) throw new Error("Failed to return book");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-books'] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
        },
        onSettled: () => setActionLoading(null)
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
        setActionLoading(id);
        deleteMutation.mutate(id);
    };

    const handleReturn = async (id: string) => {
        if (!confirm("Force return this book? This will mark the current loan as returned.")) return;
        setActionLoading(id);
        returnMutation.mutate(id);
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>;
    if (error) return <div className="text-red-500 p-4">Error loading books</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Inventory ({books?.length || 0})</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Title / Author</th>
                            <th className="px-6 py-3">Library</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books?.map((book) => (
                            <tr key={book._id} className="bg-white/5 border-b border-gray-700 hover:bg-white/10">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{book.title}</div>
                                    <div className="text-xs text-gray-500">{book.author}</div>
                                    <div className="text-xs text-gray-500 font-mono">{book.isbn}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{book.library}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {book.status === 'AVAILABLE' ? (
                                        <span className="text-green-400">Available</span>
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="text-yellow-500">Borrowed</span>
                                            {book.currentLoan?.userId && (
                                                <div className="text-xs text-gray-400">
                                                    by {book.currentLoan.userId.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {book.status === 'BORROWED' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10"
                                                onClick={() => handleReturn(book._id)}
                                                disabled={!!actionLoading}
                                                title="Force Return"
                                            >
                                                {actionLoading === book._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 border-red-500/50 hover:bg-red-500/10"
                                            onClick={() => handleDelete(book._id)}
                                            disabled={!!actionLoading}
                                            title="Delete Book"
                                        >
                                            {actionLoading === book._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {books?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No books found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
