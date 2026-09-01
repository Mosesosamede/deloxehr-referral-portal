'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin-portal/dashboard');
      } else {
        setError(data.error || 'Invalid PIN');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-slate-500">Enter your secure PIN to continue</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 pt-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-slate-700 mb-2">
                  Security PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl tracking-widest"
                  maxLength={10}
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm text-center font-medium"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Unlock Portal
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Authorized personnel only. All access attempts are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
