import bcrypt from 'bcryptjs';
import { getDb } from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing name, email, or password' },
        { status: 400 },
      );
    }

    const emailNorm = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }
    const nameNorm = String(name).trim();
    if (!nameNorm) {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 },
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: emailNorm });
    if (existing) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      name: nameNorm,
      email: emailNorm,
      passwordHash,
      createdAt: new Date(),
    };

    await users.insertOne(user);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('/api/auth/signup error', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
