import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { uploadImageToS3 } from '@/lib/awss3.js';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    // Parse multipart/form-data
    const form = await req.formData();
    const file = form.get('avatar');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 },
      );
    }

    // Upload to S3 into avatar/ folder using existing helper
    const { key, imageUrl } = await uploadImageToS3(file, {
      folder: 'avatar',
      filenamePrefix: 'avatar',
    });

    // Persist avatarUrl to user document
    const db = await getDb();
    const users = db.collection('users');
    const res = await users.findOneAndUpdate(
      { email: session.user.email },
      { $set: { avatarUrl: imageUrl, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!res.value) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safe } = res.value;
    void passwordHash;
    if (safe._id) safe._id = safe._id.toString();

    return NextResponse.json(
      { user: safe, publicUrl: imageUrl, key },
      { status: 200 },
    );
  } catch (err) {
    console.error('/api/uploads/avatar/upload error', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
