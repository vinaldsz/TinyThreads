import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      isVerified: user.isVerified || false,
      verificationSessionId: user.verificationSessionId || null,
      verifiedAt: user.verifiedAt || null,
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return Response.json(
      { error: 'Failed to get verification status' },
      { status: 500 },
    );
  }
}

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Mark as verified
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      isVerified: true,
      message: 'Account verified successfully!',
    });
  } catch (error) {
    console.error('Verification update error:', error);
    return Response.json(
      { error: 'Failed to update verification' },
      { status: 500 },
    );
  }
}
