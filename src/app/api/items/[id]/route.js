import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(_, ctx) {
  try {
    const { id } = await ctx.params; // params is a Promise in this Next.js version
    // use getDb so environment controls which DB we connect to
    const db = await getDb();
    const collection = db.collection('Listings');

    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const item = await collection.findOne({ _id });
    if (!item)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const { _id: oid, ...rest } = item;
    return NextResponse.json({ item: { _id: oid?.toString(), ...rest } });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch item' },
      { status: 500 },
    );
  }
}
