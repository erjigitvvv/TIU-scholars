import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (user.accountStatus === 'PENDING') {
    redirect('/pending-approval');
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';

  return (
    <DashboardShell user={user} locale={locale}>
      {children}
    </DashboardShell>
  );
}
