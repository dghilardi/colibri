import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import WishlistRequest from "@/models/WishlistRequest";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  const wishlistRequest = await WishlistRequest.findById(id);
  if (!wishlistRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Permission check
  const isOwner = wishlistRequest.requestedBy.toString() === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await wishlistRequest.deleteOne();

  return NextResponse.json({ success: true });
}
