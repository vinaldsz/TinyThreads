import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getDb } from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ user: null }, { status: 200 });

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: session.user.email });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    // Remove sensitive fields
    const { passwordHash, ...safe } = user;
    void passwordHash;
    // convert _id to string for client
    if (safe._id) safe._id = safe._id.toString();

    return NextResponse.json({ user: safe }, { status: 200 });
  } catch (err) {
    console.error('/api/me error', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );

    const body = await req.json();
    const { displayName, bio, avatarUrl, location } = body || {};

    const update = {};
    if (typeof displayName === 'string')
      update.displayName = displayName.trim();
    if (typeof bio === 'string') update.bio = bio;
    if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl.trim();
    if (typeof location === 'string') update.location = location.trim();
    update.updatedAt = new Date();

    const db = await getDb();
    const users = db.collection('users');
    const res = await users.findOneAndUpdate(
      { email: session.user.email },
      { $set: update },
      { returnDocument: 'after' },
    );

    if (!res.value)
      return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const { passwordHash, ...safe } = res.value;
    void passwordHash;
    if (safe._id) safe._id = safe._id.toString();

    return NextResponse.json({ user: safe }, { status: 200 });
  } catch (err) {
    console.error('/api/me PATCH error', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
