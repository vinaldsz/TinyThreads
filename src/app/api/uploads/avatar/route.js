import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/awss3.js';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );

    const body = await req.json();
    const { filename, contentType } = body || {};
    if (!filename || !contentType)
      return NextResponse.json(
        { message: 'filename and contentType required' },
        { status: 400 },
      );
    if (!contentType.startsWith('image/'))
      return NextResponse.json(
        { message: 'Only image uploads allowed' },
        { status: 400 },
      );

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // derive extension from filename
    const ext = filename.includes('.')
      ? filename.split('.').pop().toLowerCase()
      : contentType.split('/').pop();
    const key = `avatar/${user._id.toString()}-${Date.now()}.${ext}`;

    const {
      signedUrl,
      publicUrl,
      key: returnedKey,
    } = await getPresignedUploadUrl(key, contentType, { expiresIn: 60 });

    return NextResponse.json(
      { url: signedUrl, key: returnedKey, publicUrl },
      { status: 200 },
    );
  } catch (err) {
    console.error('/api/uploads/avatar error', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
