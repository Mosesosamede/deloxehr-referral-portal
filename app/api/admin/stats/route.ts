import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const partnersSnapshot = await db.collection('partners').get();
    const totalUsers = partnersSnapshot.size;

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
      totalUsers,
      totalClicks,
      totalConversions,
      totalCommission,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
  }
}
