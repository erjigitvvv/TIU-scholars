import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/i18n';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, Users, BookOpen, Award, FileText, ArrowRight } from 'lucide-react';

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const dict = getDictionary(locale);
  const currentUser = await getCurrentUser();

  // Fetch live stats from DB
  const [activeScholarsCount, approvedPubsCount, totalCitationsSum, grantCount, topScholars] = await Promise.all([
    prisma.scholarProfile.count({
      where: { user: { accountStatus: 'ACTIVE' } }
    }),
    prisma.publication.count({
      where: { status: 'APPROVED' }
    }),
    prisma.scholarProfile.aggregate({
      _sum: { totalCitations: true }
    }),
    prisma.grantProject.count({
      where: { status: 'APPROVED' }
    }),
    prisma.scholarProfile.findMany({
      where: { user: { accountStatus: 'ACTIVE' } },
      include: { department: true },
      orderBy: { tiuScore: 'desc' },
      take: 3,
    }),
  ]);

  const totalCitations = totalCitationsSum._sum.totalCitations || 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar dict={dict} currentLocale={locale} user={currentUser} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-white border-b border-slate-200 py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1d4ed8_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-6 shadow-sm">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Tashkent International University Research Excellence
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading max-w-4xl mx-auto leading-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              {dict.home.heroSubtitle}
            </p>

            {/* Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto">
              <form action="/scholars" method="GET" className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="q"
                  placeholder={dict.home.searchPlaceholder}
                  className="w-full px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all text-sm shrink-0"
                >
                  {dict.home.searchButton}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12% this year</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{activeScholarsCount}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{dict.home.stats.activeScholars}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Scopus / WoS</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{approvedPubsCount}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{dict.home.stats.approvedPublications}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Impact</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalCitations.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{dict.home.stats.totalCitations}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Funded</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{grantCount}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{dict.home.stats.grantProjects}</p>
            </div>
          </div>
        </section>

        {/* Top Scholars Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
                {dict.home.topScholarsTitle}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Top performing researchers ranked by TIU Scientific Potential Score.
              </p>
            </div>
            <a
              href="/scholars"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors group"
            >
              {dict.home.viewAllScholars}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topScholars.map((scholar, idx) => (
              <div key={scholar.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-blue-50 text-blue-800 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-200 tabular-nums">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xl uppercase">
                      {scholar.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{scholar.fullName}</h3>
                      <p className="text-xs font-medium text-blue-700">{scholar.academicDegree} • {scholar.academicTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{scholar.department?.nameEn}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                    {scholar.bioEn || scholar.bioUz}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-xs text-slate-400 font-medium">{dict.home.tiuScore}</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{scholar.tiuScore.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-xs text-slate-400 font-medium">{dict.home.hIndex}</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{scholar.hIndex}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-xs text-slate-400 font-medium">{dict.home.citations}</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{scholar.totalCitations}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
