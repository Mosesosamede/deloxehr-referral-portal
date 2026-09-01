'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  MousePointer2,
  Target,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  CreditCard,
  MapPin
} from 'lucide-react';

interface UserDetail {
  partner: any;
  stats: any;
  commissions: any[];
  clicks: any[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let partnerSnap = await getDoc(doc(db, 'partners', id));
      let partnerData = null;
      let partnerDocId = id;

      if (partnerSnap.exists()) {
        partnerData = { id: partnerSnap.id, ...partnerSnap.data() };
      } else {
        const q = query(collection(db, 'partners'), where('partnerId', '==', id));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const docSnap = qSnap.docs[0];
          partnerData = { id: docSnap.id, ...docSnap.data() };
          partnerDocId = docSnap.id;
        }
      }

      if (!partnerData) {
        throw new Error('User not found in database');
      }

      const pId = (partnerData as any).partnerId || partnerDocId;

      const statsSnap = await getDoc(doc(db, 'partner_stats', pId));
      const stats = statsSnap.exists() ? statsSnap.data() : {
        totalClicks: 0,
        totalPurchases: 0,
        totalCommission: 0,
        balance: 0
      };

      const commQuery = query(collection(db, 'partner_commissions'), where('partnerId', '==', pId));
      const commSnap = await getDocs(commQuery);
      const commissions = commSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        };
      });
      commissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const clickQuery = query(collection(db, 'referral_clicks'), where('partnerId', '==', pId));
      const clickSnap = await getDocs(clickQuery);
      const clicks = clickSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        };
      });
      clicks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setData({
        partner: partnerData,
        stats,
        commissions: commissions.slice(0, 20),
        clicks: clicks.slice(0, 20)
      });
    } catch (err: any) {
      console.error('Error fetching user detail directly from Firestore:', err);
      setError(err.message || 'Failed to load user details from database');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchDetail();
    };
    load();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-red-500 font-medium mb-4">{error || 'User not found'}</p>
          <button 
            onClick={() => router.push('/admin-portal/dashboard')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { partner, stats, commissions, clicks } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/admin-portal/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Partners
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-100">
              {partner.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900">{partner.fullName}</h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {partner.status}
                </span>
              </div>
              <p className="text-slate-500 text-lg flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-500" />
                Referral Code: <span className="font-mono font-bold text-slate-900">{partner.referralCode}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Mail size={16} /> {partner.email}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Phone size={16} /> {partner.phone}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <MapPin size={16} /> {partner.country}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Calendar size={16} /> Joined {new Date(partner.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-auto bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
            <div className="text-4xl font-black text-slate-900">${stats.balance.toLocaleString()}</div>
            <button className="mt-4 w-full bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
              Process Payout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DetailStatCard 
          label="Total Clicks" 
          value={stats.totalClicks} 
          icon={<MousePointer2 />} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <DetailStatCard 
          label="Successful Conversions" 
          value={stats.totalPurchases} 
          icon={<Target />} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <DetailStatCard 
          label="Total Commission Earned" 
          value={`$${stats.totalCommission.toLocaleString()}`} 
          icon={<DollarSign />} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Commissions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={20} className="text-slate-400" />
              Recent Commissions
            </h3>
            <span className="text-xs text-slate-400 font-medium">Last 20 transactions</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {commissions.length > 0 ? (
              commissions.map((c) => (
                <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{c.email}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">+${c.commissionAmount.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{c.payoutStatus}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">No commissions recorded yet.</div>
            )}
          </div>
        </div>

        {/* Recent Clicks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MousePointer2 size={20} className="text-slate-400" />
              Recent Link Activity
            </h3>
            <span className="text-xs text-slate-400 font-medium">Last 20 clicks</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {clicks.length > 0 ? (
              clicks.map((click) => (
                <div key={click.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 capitalize">{click.browser} on {click.device}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Globe size={12} />
                      {click.country} • {click.ip}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-400 mb-1">
                      {new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                      {new Date(click.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">No link activity recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStatCard({ label, value, icon, color, bg }: { label: string, value: string | number, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </div>
    </div>
  );
}
