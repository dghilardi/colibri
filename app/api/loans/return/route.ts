import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Loan from "@/models/Loan";
import Book from "@/models/Book";
import { isAdmin } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await request.json();

  await dbConnect();

  const book = await Book.findById(bookId).populate('currentLoan');
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  if (book.status !== 'BORROWED' || !book.currentLoan) {
       return NextResponse.json({ error: "Book is not borrowed" }, { status: 400 });
  }

  const loan = await Loan.findById(book.currentLoan._id);
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

  const isUserAdmin = isAdmin(session.user.email);
  const currentUserId = session.user.id;
  const loanUserId = loan.userId.toString();

  if (!isUserAdmin && currentUserId !== loanUserId) {
      return NextResponse.json({ error: "You cannot return this book" }, { status: 403 });
  }

  loan.status = 'RETURNED';
  loan.endDate = new Date();
  await loan.save();

  book.status = 'AVAILABLE';
  book.currentLoan = undefined;
  await book.save();

  return NextResponse.json({ message: "Book returned" });
}
