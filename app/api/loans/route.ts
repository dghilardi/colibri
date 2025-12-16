import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Loan from "@/models/Loan";
import Book from "@/models/Book";
import User from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await request.json();

  await dbConnect();

  const book = await Book.findById(bookId);
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
  if (book.status !== 'AVAILABLE') return NextResponse.json({ error: "Book not available" }, { status: 400 });

  const allowedLibraries = session.user.allowedLibraries || [];
  if (!allowedLibraries.includes(book.library)) {
      return NextResponse.json({ error: "Forbidden library" }, { status: 403 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const loan = await Loan.create({
      bookId: book._id,
      userId: user._id,
      status: 'ACTIVE',
      startDate: new Date()
  });

  book.status = 'BORROWED';
  book.currentLoan = loan._id;
  await book.save();

  return NextResponse.json(loan);
}
