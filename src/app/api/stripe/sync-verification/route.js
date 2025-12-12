import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

let stripe;

async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripe) {
    const { default: Stripe } = await import('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If already verified, return immediately
    if (user.isVerified) {
      return NextResponse.json({
        message: 'Already verified',
        isVerified: true,
        verifiedAt: user.verifiedAt,
      });
    }

    // Check verification status with Stripe
    if (!user.verificationSessionId) {
      return NextResponse.json(
        { error: 'No verification session found' },
        { status: 400 },
      );
    }

    const stripeClient = await getStripe();
    const verificationSession =
      await stripeClient.identity.verificationSessions.retrieve(
        user.verificationSessionId,
      );

    // If status is verified, mark user as verified in DB
    if (verificationSession.status === 'verified') {
      await usersCollection.updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: {
            isVerified: true,
            verifiedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return NextResponse.json({
        message: 'User verified successfully',
        isVerified: true,
        verifiedAt: new Date(),
      });
    }

    // Not yet verified
    return NextResponse.json({
      message: 'Verification status: ' + verificationSession.status,
      isVerified: false,
      stripeStatus: verificationSession.status,
    });
  } catch (error) {
    console.error('Sync verification error:', error);
    return NextResponse.json(
      { error: 'Failed to sync verification', detail: error.message },
      { status: 500 },
    );
  }
}
