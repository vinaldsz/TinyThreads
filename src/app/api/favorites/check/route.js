// src/app/api/favorites/check/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    // Get the logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 },
      );
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorites');

    // Check if item is favorited by user
    const favorite = await favoritesCollection.findOne({
      userId: ObjectId.isValid(session.user.id)
        ? new ObjectId(session.user.id)
        : session.user.id,
      itemId: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId,
    });

    return NextResponse.json({
      isFavorited: !!favorite,
      favoriteId: favorite?._id?.toString() || null,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 },
    );
  }
}
