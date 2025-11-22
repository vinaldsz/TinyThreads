import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb'; // 
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json(); // Remove stripePaymentId
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

        // Create simple transaction record
        const transaction = {
          itemId: new ObjectId(itemId),
          buyerId: buyerId,
          sellerId: item.value.sellerId,
          price: item.value.price,
          timestamp: new Date(),
          status: 'completed', // ✅ Directly set to completed
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
    if (error.message === 'Item is no longer available') {
      return NextResponse.json({ 
        error: 'Sorry, this item was just sold by another buyer' 
      }, { status: 409 });
    }
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}