import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const session = await createSession(pin);

    if (!session) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
