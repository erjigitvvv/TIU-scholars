'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'MODERATOR') {
        router.push('/admin/scholars');
      } else if (data.user.accountStatus !== 'ACTIVE') {
        router.push('/pending-approval');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex w-12 h-12 rounded-2xl bg-blue-900 text-white font-bold items-center justify-center text-xl mb-4 shadow-md">
            TIU
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Sign In to TIU Scholars
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Scientific Potential & Scholars Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="name@tiu.uz"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1 py-1"
          >
            <Shield className="w-3.5 h-3.5" />
            {showDemo ? 'Hide QA Demo Credentials' : 'Show QA Demo Credentials'}
          </button>

          {showDemo && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="font-semibold text-slate-700">Click to fill demo account:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@tiu.uz', 'Admin123!')}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="block font-bold text-slate-900">Super Admin</span>
                  <span className="text-[10px] text-slate-500">admin@tiu.uz</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('moderator@tiu.uz', 'Admin123!')}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="block font-bold text-slate-900">Moderator</span>
                  <span className="text-[10px] text-slate-500">moderator@tiu.uz</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('a.turgunov@tiu.uz', 'Scholar123!')}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="block font-bold text-slate-900">Active Scholar</span>
                  <span className="text-[10px] text-slate-500">a.turgunov@tiu.uz</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('a.kadirov@tiu.uz', 'Scholar123!')}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="block font-bold text-slate-900">Pending Scholar</span>
                  <span className="text-[10px] text-slate-500">a.kadirov@tiu.uz</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-700 hover:underline">
              Register as Scholar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
