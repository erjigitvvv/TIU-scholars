import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const user = await getCurrentUser();

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    redirect('/login');
  }

  return (
    <AdminShell user={{ email: user.email, role: user.role }} locale={locale}>
      {children}
    </AdminShell>
  );
}
