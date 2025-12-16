import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import WishlistRequest from "@/models/WishlistRequest";
import { getBookDetails } from "@/lib/openlibrary";
import "@/models/User";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isbn, libraryTarget } = await request.json();

    if (!isbn || !libraryTarget) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allowedLibraries = session.user.allowedLibraries || [];
    if (!allowedLibraries.includes(libraryTarget)) {
        return NextResponse.json({ error: "You don't have access to this library" }, { status: 403 });
    }

    await dbConnect();

    // Check if the book already exists in the catalog for this library
    // (Optimization: prevent wishlisting existing books)
    // But specs don't explicitly say to forbid it, just to remove it on promotion.
    // However, it makes sense. But I'll stick to specs for now.

    const meta = await getBookDetails(isbn);

    try {
        const wishlistRequest = await WishlistRequest.create({
            isbn,
            libraryTarget,
            requestedBy: session.user.id,
            meta: meta || {}
        });
        return NextResponse.json(wishlistRequest);
    } catch (error) {
        console.error("Wishlist creation error:", error);
        return NextResponse.json({ error: "Failed to create wishlist request" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const allowedLibraries = session.user.allowedLibraries || [];

    // Admins might want to see requests for libraries they manage.
    // Assuming allowedLibraries covers both user access and admin management scope as per AGENTS.md

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
        libraryTarget: { $in: allowedLibraries }
    };

    const requests = await WishlistRequest.find(query)
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 });

    return NextResponse.json(requests);
}
