import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: partnerId } = await params;
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    // Get partner info
    const partnerDoc = await db.collection('partners').doc(partnerId).get();
    if (!partnerDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const partner = { id: partnerDoc.id, ...partnerDoc.data() };

    // Get stats
    const statsDoc = await db.collection('partner_stats').doc(partnerId).get();
    const stats = statsDoc.exists ? statsDoc.data() : {
      totalClicks: 0,
      totalPurchases: 0,
      totalCommission: 0,
      balance: 0
    };

    // Get recent commissions
    const commissionsSnapshot = await db.collection('partner_commissions')
      .where('partnerId', '==', partnerId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    const commissions = commissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get recent clicks
    const clicksSnapshot = await db.collection('referral_clicks')
      .where('partnerId', '==', partnerId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    const clicks = clicksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      partner,
      stats,
      commissions,
      clicks
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}
