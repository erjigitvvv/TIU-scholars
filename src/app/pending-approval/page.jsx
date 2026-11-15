import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';

export default async function PendingApprovalPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.accountStatus === 'ACTIVE') {
    redirect(user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR' ? '/admin/scholars' : '/dashboard');
  }

  const isRejected = user.accountStatus === 'REJECTED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12">
      <div className="max-w-md w-full space-y-6 neu-card p-8 rounded-3xl text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-md mb-2">
          {isRejected ? (
            <div className="w-full h-full bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-full h-full bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
          {isRejected ? dict.auth.rejectedTitle : dict.auth.pendingTitle}
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          {isRejected
            ? `Reason: ${user.rejectionReason || 'Please update your details and resubmit.'}`
            : dict.auth.pendingDesc}
        </p>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {dict.auth.logout}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
