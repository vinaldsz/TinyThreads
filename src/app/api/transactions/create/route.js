import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();
    const buyerId = new ObjectId(session.user.id);

    const db = await getDb();
    const mongoSession = db.client.startSession();
    
    try {
      await mongoSession.withTransaction(async () => {
        // Update item to sold
        const item = await db.collection('Listings').findOneAndUpdate(
          { _id: new ObjectId(itemId), status: 'available' },
          { 
            $set: { 
              status: 'sold',
              soldAt: new Date(),
              soldTo: buyerId
            }
          },
          { session: mongoSession, returnDocument: 'after' }
        );

        if (!item.value) {
          throw new Error('Item is no longer available');
        }

        // Handle sellerId
        let sellerId;
        if (item.value.sellerId) {
          if (item.value.sellerId instanceof ObjectId) {
            sellerId = item.value.sellerId;
          }
          else if (ObjectId.isValid(item.value.sellerId)) {
            sellerId = new ObjectId(item.value.sellerId);
          }
          else {
            sellerId = item.value.sellerId;
          }
        } else {
          throw new Error('Item missing seller information');
        }

        // ✅ Create transaction with buyerUsername
        const transaction = {
          itemId: new ObjectId(itemId),
          buyerId: buyerId,
          buyerUsername: session.user.name || session.user.email || 'Unknown',  // ✅ 修复这一行
          sellerId: sellerId,
          price: item.value.price,
          timestamp: new Date(),
          status: 'completed',
        };

        await db.collection('transactions').insertOne(transaction, { session: mongoSession });
      });

      return NextResponse.json({ 
        success: true,
        message: 'Purchase confirmed! Contact seller for payment and pickup.'
      });

    } finally {
      await mongoSession.endSession();
    }

  } catch (error) {
    console.error('Transaction error:', error);
    
    if (error.message === 'Item is no longer available') {
      return NextResponse.json({ 
        error: 'Sorry, this item was just sold by another buyer' 
      }, { status: 409 });
    }
    
    if (error.message === 'Item missing seller information') {
      return NextResponse.json({ 
        error: 'Cannot complete purchase: seller information not found' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Purchase failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}