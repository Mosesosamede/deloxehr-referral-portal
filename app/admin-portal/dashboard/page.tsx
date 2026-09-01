'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, 
  MousePointer2, 
  Target, 
  DollarSign, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Loader2,
  LogOut,
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
}

interface User {
  id: string;
  partnerId: string;
  fullName: string;
  email: string;
  referralCode: string;
  createdAt: string;
  stats: {
    totalClicks: number;
    totalPurchases: number;
    totalCommission: number;
    balance: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const partnersSnapshot = await getDocs(collection(db, 'partners'));
      const partnersList: any[] = [];
      partnersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAtVal = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString());
        partnersList.push({
          id: docSnap.id,
          ...data,
          createdAt: createdAtVal
        });
      });

      const statsSnapshot = await getDocs(collection(db, 'partner_stats'));
      const statsMap: Record<string, any> = {};
      let totalClicks = 0;
      let totalConversions = 0;
      let totalCommission = 0;

      statsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        statsMap[docSnap.id] = data;
        totalClicks += data.totalClicks || 0;
        totalConversions += data.totalPurchases || 0;
        totalCommission += data.totalCommission || 0;
      });

      const enrichedUsers = partnersList.map(partner => ({
        ...partner,
        stats: statsMap[partner.partnerId] || statsMap[partner.id] || {
          totalClicks: 0,
          totalPurchases: 0,
          totalCommission: 0,
          balance: 0
        }
      }));

      setStats({
        totalUsers: partnersList.length,
        totalClicks,
        totalConversions,
        totalCommission
      });
      setUsers(enrichedUsers);
    } catch (err: any) {
      console.error('Error fetching admin data directly from Firestore:', err);
      setError(err.message || 'Failed to load dashboard data from database');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-portal/login');
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Referral Overview</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your referral network</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            Refresh
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Connection Error</h3>
            <p className="text-sm text-red-700 opacity-90">{error}</p>
            <p className="text-xs mt-2 text-red-500">Check your Firebase environment variables in Settings.</p>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Partners" 
          value={stats?.totalUsers || 0} 
          icon={<Users className="text-blue-600" />} 
          color="bg-blue-50"
          trend="+12% from last month"
        />
        <StatCard 
          title="Total Clicks" 
          value={stats?.totalClicks || 0} 
          icon={<MousePointer2 className="text-purple-600" />} 
          color="bg-purple-50"
          trend="+5.4% from last month"
        />
        <StatCard 
          title="Conversions" 
          value={stats?.totalConversions || 0} 
          icon={<Target className="text-emerald-600" />} 
          color="bg-emerald-50"
          trend="+8.2% from last month"
        />
        <StatCard 
          title="Total Commission" 
          value={`$${(stats?.totalCommission || 0).toLocaleString()}`} 
          icon={<DollarSign className="text-amber-600" />} 
          color="bg-amber-50"
          trend="+15% from last month"
        />
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Referral Partners</h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-center">Conversions</th>
                <th className="px-6 py-4 text-center">Commission</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin-portal/users/${user.partnerId}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.fullName}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {user.stats.totalClicks}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {user.stats.totalPurchases}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-900">
                      ${user.stats.totalCommission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" size={20} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    {search ? 'No partners found matching your search.' : 'No referral partners registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: { title: string, value: string | number, icon: React.ReactNode, color: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp size={14} />
          {trend}
        </div>
      </div>
    </div>
  );
}
