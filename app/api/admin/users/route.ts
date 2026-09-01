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
    const partners = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch stats for all partners to join data
    const statsSnapshot = await db.collection('partner_stats').get();
    const statsMap: Record<string, any> = {};
    statsSnapshot.forEach(doc => {
      statsMap[doc.id] = doc.data();
    });

    const enrichedPartners = partners.map((partner: any) => ({
      ...partner,
      stats: statsMap[partner.partnerId] || {
        totalClicks: 0,
        totalPurchases: 0,
        totalCommission: 0,
        balance: 0
      }
    }));

    return NextResponse.json(enrichedPartners);
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
  }
}
