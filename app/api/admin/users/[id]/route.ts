import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    let partnerDoc = await db.collection('partners').doc(id).get();
    let partnerData: any = null;
    let partnerDocId = id;

    if (partnerDoc.exists) {
      partnerData = partnerDoc.data();
      partnerDocId = partnerDoc.id;
    } else {
      const qSnap = await db.collection('partners').where('partnerId', '==', id).get();
      if (!qSnap.empty) {
        partnerDoc = qSnap.docs[0];
        partnerData = partnerDoc.data();
        partnerDocId = partnerDoc.id;
      }
    }

    if (!partnerData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pId = partnerData.partnerId || partnerDocId;

    const statsDoc = await db.collection('partner_stats').doc(pId).get();
    const stats = statsDoc.exists ? statsDoc.data() : {
      totalClicks: 0,
      totalPurchases: 0,
      totalCommission: 0,
      balance: 0
    };

    const commSnap = await db.collection('partner_commissions').where('partnerId', '==', pId).get();
    const commissions = commSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      };
    });
    commissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const clickSnap = await db.collection('referral_clicks').where('partnerId', '==', pId).get();
    const clicks = clickSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      };
    });
    clicks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      partner: {
        id: partnerDocId,
        ...partnerData,
        createdAt: partnerData.createdAt?.toDate ? partnerData.createdAt.toDate().toISOString() : (partnerData.createdAt || new Date().toISOString())
      },
      stats,
      commissions: commissions.slice(0, 20),
      clicks: clicks.slice(0, 20)
    });
  } catch (error: any) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
