import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb'; // 
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, stripePaymentId } = await request.json();
    const buyerId = new ObjectId(session.user.id);

    console.log('=== TRANSACTION DEBUG ===');
    console.log('ItemId received:', itemId);
    console.log('BuyerId:', buyerId);

    const db = await getDb();

    //tes t if item exists and its status
    const existingItem = await db.collection('Listings').findOne({ 
      _id: new ObjectId(itemId) 
    });
    console.log('Existing item found:', !!existingItem);
    console.log('Existing item status:', existingItem?.status);

    // start a session for transaction
    const mongoSession = db.client.startSession();
    let transactionResult = null;
    
    try {
      await mongoSession.withTransaction(async () => {
        // 1. try to update item status to 'sold' if it's still 'available'
        const item = await db.collection('Listings').findOneAndUpdate(
          { 
            _id: new ObjectId(itemId), 
            status: 'available' 
          },
          { 
            $set: { 
              status: 'sold',
              soldAt: new Date(),
              soldTo: buyerId
            }
          },
          { session: mongoSession, returnDocument: 'after' }
        );

        console.log('Item update result:', !!item.value);

        if (!item.value) {
          throw new Error('Item is no longer available');
        }

        // 2. create transaction record
        const transaction = {
          itemId: new ObjectId(itemId),
          buyerId: buyerId,
          sellerId: item.value.sellerId,
          price: item.value.price,
          timestamp: new Date(),
          status: 'completed',
          stripePaymentId: stripePaymentId,
          paymentMethod: 'card',
          buyerEmail: session.user.email,
          buyerName: session.user.name
        };

        const result = await db.collection('transactions').insertOne(
          transaction,
          { session: mongoSession }
        );

        console.log('Transaction created:', !!result.insertedId);
        transactionResult = { transactionId: result.insertedId, item: item.value };
      });

      return NextResponse.json({ 
        success: true,
        message: 'Purchase completed successfully',
        data: transactionResult
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

    return NextResponse.json({ 
      error: 'Purchase failed',
      details: error.message 
    }, { status: 500 });
  }
}