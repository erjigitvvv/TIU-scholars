import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Settings, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              TIU
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Admin Portal</span>
              <span className="block text-[10px] text-slate-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <Link
              href="/admin/scholars"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600/20 border border-blue-500/30 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-400" />
              {dict.admin.scholars}
            </Link>

            {user.role === 'SUPER_ADMIN' && (
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                {dict.admin.settings}
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Portal
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {dict.auth.logout}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 font-heading">
            {dict.admin.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
              {user.email}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
