import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing credentials' },
        { status: 400 },
      );
    }

    // Simple demo: accept a single test user
    if (email === 'test@example.com' && password === 'password') {
      return NextResponse.json({ token: 'demo-token-123' });
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    );
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
