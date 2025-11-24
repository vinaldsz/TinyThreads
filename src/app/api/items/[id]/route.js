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
    return NextResponse.json({ _id: oid?.toString(), ...rest });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch item' },
      { status: 500 },
    );
  }
}

export async function DELETE(_, ctx) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('Listings');

    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const item = await collection.findOne({ _id });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Extract image URLs (array or single)
    const urls = Array.isArray(item.imageUrls)
      ? item.imageUrls
      : item.imageUrl
        ? [item.imageUrl]
        : [];

    // Delete associated S3 objects (best‑effort)
    const { S3_BUCKET_NAME, S3_PUBLIC_BASE } = process.env;
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = (await import('@/lib/awss3')).default;

    for (const url of urls) {
      try {
        let key;
        if (S3_PUBLIC_BASE && url.startsWith(S3_PUBLIC_BASE)) {
          key = url.slice(S3_PUBLIC_BASE.length + 1);
        } else {
          const u = new URL(url);
          key = u.pathname.replace(/^\//, '');
        }
        if (!key) continue;

        const cmd = new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
        });

        await s3.send(cmd);
      } catch (err) {
        console.error('Failed to delete S3 object:', err);
      }
    }

    // Delete MongoDB document
    await collection.deleteOne({ _id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete item' },
      { status: 500 },
    );
  }
}
