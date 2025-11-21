import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    console.log('=== API DEBUG ===');
    console.log('authOptions:', authOptions);
    
    const session = await getServerSession(authOptions);
    console.log('Session result:', session);
    console.log('Session user:', session?.user);
    console.log('==================');

    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: 'No session found' 
      }, { status: 401 });
    }

    const { itemId, price } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      metadata: {
        itemId: itemId,
        buyerId: session.user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Payment setup failed',
      details: error.message 
    }, { status: 500 });
  }
}