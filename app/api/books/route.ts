import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import WishlistRequest from "@/models/WishlistRequest";
import "@/models/Loan"; // Register Loan model
import "@/models/User"; // Register User model

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const library = searchParams.get('library');
  const adminMode = searchParams.get('admin') === 'true';

  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  // Library filtering logic
  const allowedLibraries = session.user.allowedLibraries || [];
  const isAdmin = session.user.role === 'ADMIN';

  if (adminMode && isAdmin) {
       // Admin sees everything if they requested admin mode
       if (library) {
           query.library = library;
       }
       // If no library specified, no filter (all libraries)
  } else {
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
  }

  if (search) {
      // Basic search on title, author, isbn
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } },
      ];
  }

  const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .populate({
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

        // Remove from wishlist if exists for this library
        try {
            await WishlistRequest.deleteMany({
                isbn: body.isbn,
                libraryTarget: body.library
            });
        } catch (cleanupError) {
            console.error("Failed to cleanup wishlist:", cleanupError);
        }

        return NextResponse.json(book);
    } catch (_error) {
        return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
    }
}
