import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Loan from "@/models/Loan";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();

  try {
      const book = await Book.findByIdAndDelete(id);
      if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }

      // Mark loans as returned to keep history but clean state
      await Loan.updateMany(
          { bookId: id, status: 'ACTIVE' },
          { status: 'RETURNED', endDate: new Date() }
      );

      return NextResponse.json({ message: "Book deleted" });
  } catch (error) {
      console.error("Delete book error:", error);
      return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // action: 'return'

    await dbConnect();

    if (action === 'return') {
        try {
            const book = await Book.findById(id);
            if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

            if (book.status === 'BORROWED') {
                if (book.currentLoan) {
                    await Loan.findByIdAndUpdate(book.currentLoan, {
                        status: 'RETURNED',
                        endDate: new Date()
                    });
                }

                // Also close any other active loans for this book just in case
                await Loan.updateMany(
                    { bookId: id, status: 'ACTIVE' },
                    { status: 'RETURNED', endDate: new Date() }
                );

                book.status = 'AVAILABLE';
                book.currentLoan = undefined;
                await book.save();
            }

            return NextResponse.json(book);
        } catch (error) {
             console.error("Return book error:", error);
             return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
