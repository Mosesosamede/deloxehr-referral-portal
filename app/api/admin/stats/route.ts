import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'a-very-long-and-random-default-secret-key-for-admin-panel'
);
const COOKIE_NAME = 'admin_session';

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET() {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const partnersSnapshot = await db.collection('partners').get();
    const statsSnapshot = await db.collection('partner_stats').get();

    let totalClicks = 0;
    let totalConversions = 0;
    let totalCommission = 0;

    statsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalClicks += data.totalClicks || 0;
      totalConversions += data.totalPurchases || 0;
      totalCommission += data.totalCommission || 0;
    });

    return NextResponse.json({
      totalUsers: partnersSnapshot.size,
      totalClicks,
      totalConversions,
      totalCommission,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
