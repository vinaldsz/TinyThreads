import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req) {
  // prefer explicit DB from env (MONGODB_DB) or fall back to connection string default
  const db = await getDb();
  const collection = db.collection('Listings');
  const { searchParams } = new URL(req.url);

  const query = {};

  // availability filter
  const availability = searchParams.get('availability');
  if (availability === 'sold') {
    query.status = 'sold';
  } else {
    // Default: show only available items
    query.status = 'available';
  }

  // case-insensitive categorical filters (use anchored regex)
  if (searchParams.get('category')) {
    const v = searchParams.get('category');
    query.category = { $regex: `^${escapeRegex(v)}$`, $options: 'i' };
  }
  if (searchParams.get('size')) {
    const v = searchParams.get('size');
    query.size = { $regex: `^${escapeRegex(v)}$`, $options: 'i' };
  }
  if (searchParams.get('condition')) {
    const v = searchParams.get('condition');
    query.condition = { $regex: `^${escapeRegex(v)}$`, $options: 'i' };
  }
  if (searchParams.get('ageRange')) {
    const v = searchParams.get('ageRange');
    query.ageRange = { $regex: `^${escapeRegex(v)}$`, $options: 'i' };
  }

  // price range
  const min = searchParams.get('priceMin') || searchParams.get('price_min');
  const max = searchParams.get('priceMax') || searchParams.get('price_max');
  if (min || max)
    query.price = {
      ...(min && { $gte: Number(min) }),
      ...(max && { $lte: Number(max) }),
    };

  // searchTerm -> partial, case-insensitive search across title & description
  const searchTerm =
    searchParams.get('searchTerm') ||
    searchParams.get('q') ||
    searchParams.get('query');
  if (searchTerm) {
    const esc = escapeRegex(searchTerm.trim());
    const regex = { $regex: esc, $options: 'i' };
    query.$or = [{ title: regex }, { description: regex }];
  }

  // sorting
  const sortBy = searchParams.get('sortBy') || 'newest';
  const sort = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
  }[sortBy] || { createdAt: -1 };

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limitValue = Math.max(1, Number(searchParams.get('limit')) || 12);
  const skip = (page - 1) * limitValue;

  // total matching documents for pagination metadata
  const total = await collection.countDocuments(query);

  const items = await collection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitValue)
    .toArray();

  const serialized = items.map(({ _id, ...rest }) => ({
    _id: _id?.toString(),
    ...rest,
  }));

  const hasMore = page * limitValue < total;

  return NextResponse.json({
    items: serialized,
    total: Number(total),
    page: Number(page),
    limit: Number(limitValue),
    hasMore,
  });
}
