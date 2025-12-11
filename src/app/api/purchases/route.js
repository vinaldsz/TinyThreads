import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyerId = new ObjectId(session.user.id);
    const db = await getDb();

    // Get all transactions for this buyer
    const transactions = await db
      .collection('transactions')
      .find({ buyerId })
      .sort({ timestamp: -1 })
      .toArray();

    // Get the item details for each transaction
    const itemIds = transactions.map((t) => t.itemId);
    const items = await db
      .collection('Listings')
      .find({ _id: { $in: itemIds } })
      .toArray();

    // Create a map for quick lookup
    const itemsMap = {};
    items.forEach((item) => {
      itemsMap[item._id.toString()] = item;
    });

    // Combine transaction data with item details
    const purchases = transactions.map((transaction) => {
      const item = itemsMap[transaction.itemId.toString()];
      return {
        transactionId: transaction._id.toString(),
        purchaseDate: transaction.timestamp,
        price: transaction.price,
        status: transaction.status,
        item: item
          ? {
              id: item._id.toString(),
              title: item.title,
              imageUrls: item.imageUrls || [item.imageUrl],
              condition: item.condition,
              size: item.size,
              category: item.category,
              location: item.location,
              sellerName: item.sellerName,
              sellerEmail: item.sellerEmail,
            }
          : null,
      };
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 },
    );
  }
}
