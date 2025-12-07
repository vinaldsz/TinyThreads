// src/app/api/favorites/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Get the logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorites');

    // Get user's favorites with item details
    const favorites = await favoritesCollection
      .aggregate([
        {
          $match: {
            userId: ObjectId.isValid(session.user.id) 
              ? new ObjectId(session.user.id) 
              : session.user.id
          }
        },
        {
          $lookup: {
            from: 'Listings',
            localField: 'itemId',
            foreignField: '_id',
            as: 'item'
          }
        },
        {
          $unwind: '$item'
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    const validFavorites = favorites.filter(fav => fav.item && fav.item._id);


    // Serialize the data
    const serializedFavorites = validFavorites.map(fav => ({
      _id: fav._id.toString(),
      userId: fav.userId.toString(),
      itemId: fav.itemId.toString(),
      createdAt: fav.createdAt,
      item: {
        _id: fav.item._id.toString(),
        id: fav.item._id.toString(),
        title: fav.item.title,
        price: fav.item.price,
        size: fav.item.size,
        condition: fav.item.condition,
        imageUrl: fav.item.imageUrls?.[0] || fav.item.imageUrl,
        imageUrls: fav.item.imageUrls || [],
        description: fav.item.description,
        category: fav.item.category,
        ageRange: fav.item.ageRange,
        location: fav.item.location,
        status: fav.item.status,
        sellerId: fav.item.sellerId?.toString(),
        sellerName: fav.item.sellerName,
        createdAt: fav.item.createdAt,
        buyerUsername: fav.item.buyerUsername || null,
        distanceMeters: fav.item.distanceMeters || null
      }
    }));

    return NextResponse.json({
      favorites: serializedFavorites,
      total: serializedFavorites.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Get the logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorites');
    const itemsCollection = db.collection('Listings');

    // Validate item exists
    const itemExists = await itemsCollection.findOne({
      _id: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId
    });

    if (!itemExists) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await favoritesCollection.findOne({
      userId: ObjectId.isValid(session.user.id) 
        ? new ObjectId(session.user.id) 
        : session.user.id,
      itemId: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Item already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const favorite = {
      userId: ObjectId.isValid(session.user.id) 
        ? new ObjectId(session.user.id) 
        : session.user.id,
      itemId: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId,
      createdAt: new Date()
    };

    const result = await favoritesCollection.insertOne(favorite);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      userId: favorite.userId.toString(),
      itemId: favorite.itemId.toString(),
      createdAt: favorite.createdAt,
      message: 'Item added to favorites'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Get the logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorites');

    // Remove from favorites
    const result = await favoritesCollection.deleteOne({
      userId: ObjectId.isValid(session.user.id) 
        ? new ObjectId(session.user.id) 
        : session.user.id,
      itemId: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Item removed from favorites'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}