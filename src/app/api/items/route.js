import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  const client = await clientPromise;
  const db = client.db('TinyThreads'); 
  const collection = db.collection('Listings');
  const { searchParams } = new URL(req.url);

  const query = {};
  if (searchParams.get('category')) query.category = searchParams.get('category');
  if (searchParams.get('size')) query.size = searchParams.get('size');
  if (searchParams.get('condition')) query.condition = searchParams.get('condition');
  if (searchParams.get('ageRange')) query.ageRange = searchParams.get('ageRange');

  const min = searchParams.get('priceMin');
  const max = searchParams.get('priceMax');
  if (min || max) query.price = { ...(min && { $gte: Number(min) }), ...(max && { $lte: Number(max) }) };

  const sortBy = searchParams.get('sortBy') || 'newest';
  const sort = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
  }[sortBy] || { createdAt: -1 };

  const limit = Number(searchParams.get('limit') || 48);

  const items = await collection.find(query).sort(sort).limit(limit).toArray();
  const serialized = items.map(({ _id, ...rest }) => ({
   _id: _id?.toString(),
   ...rest,
  }));

  return NextResponse.json({ items: serialized, total: serialized.length });
}