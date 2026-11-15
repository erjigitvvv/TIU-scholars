import { cookies } from 'next/headers';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageBackgroundShell from '@/components/layout/PageBackgroundShell';
import { getDictionary } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/auth';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-jetbrains-mono' });

export const metadata = {
  title: 'TIU Scholars — Scientific Potential & Scholars Portal',
  description: 'Tashkent International University — Professor-o‘qituvchilar va ilmiy salohiyat portali',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#EDF1F7] text-slate-900 antialiased">
        <PageBackgroundShell>
          <Navbar dict={dict} currentLocale={locale} user={user} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} currentLocale={locale} />
        </PageBackgroundShell>
      </body>
    </html>
  );
}
