import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const library = searchParams.get('library');

  await dbConnect();

  let query: any = {};

  // Library filtering logic
  // User can only see allowed libraries.
  const allowedLibraries = session.user.allowedLibraries || [];

  if (library) {
     if (allowedLibraries.includes(library)) {
         query.library = library;
     } else {
         return NextResponse.json({ error: "Forbidden library" }, { status: 403 });
     }
  } else {
     // If no library specified, return all allowed.
     query.library = { $in: allowedLibraries };
  }

  if (search) {
      // Basic search on title, author, isbn
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } },
      ];
  }

  const books = await Book.find(query).populate({
      path: 'currentLoan',
      populate: { path: 'userId', select: 'name email' }
  });

  return NextResponse.json(books);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    try {
        const book = await Book.create(body);
        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
    }
}
