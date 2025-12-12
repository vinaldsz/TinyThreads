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

function getBaseUrl(req) {
  const envBase =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`);

  const headerOrigin = req?.headers?.get?.('origin');
  const base = envBase || headerOrigin || 'http://localhost:3000';
  return base.replace(/\/$/, '');
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    });
    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Already verified
    if (user.isVerified) {
      return NextResponse.json({
        message: 'Already verified',
        isVerified: true,
      });
    }

    const stripeClient = await getStripe();
    const baseUrl = getBaseUrl(req);

    // Create Identity verification session with hosted return URL
    const verificationSession =
      await stripeClient.identity.verificationSessions.create({
        type: 'document',
        metadata: {
          userId: session.user.id,
          userName: user.name,
          email: user.email,
        },
        return_url: `${baseUrl}/verification-complete`,
      });

    // Save session ID temporarily in user record
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          verificationSessionId: verificationSession.id,
          updatedAt: new Date(),
        },
      },
    );

    // Return the hosted URL to the client
    return NextResponse.json({
      verificationUrl: verificationSession.url,
      isVerified: user.isVerified || false,
    });
  } catch (error) {
    console.error('Verification session error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create verification session',
        detail: error.message,
        stripeMessage: error?.raw?.message,
        stripeCode: error?.raw?.code,
        stripeType: error?.raw?.type,
        stripeRequestId: error?.raw?.requestId,
      },
      { status: 500 },
    );
  }
}
