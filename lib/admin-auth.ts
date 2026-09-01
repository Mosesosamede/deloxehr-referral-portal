import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'a-very-long-and-random-default-secret-key-for-admin-panel'
);

const COOKIE_NAME = 'admin_session';

export async function createSession(pin: string) {
  if (pin !== process.env.ADMIN_PIN) {
    return null;
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  });

  return session;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const session = await getSession();
  return !!session && session.admin === true;
}
