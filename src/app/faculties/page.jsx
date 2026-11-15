import Link from 'next/link';
import { cookies } from 'next/headers';
import { Building2, Users, ArrowRight, Layers, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import FacultyFilterSelect from '@/components/faculties/FacultyFilterSelect';

export default async function FacultiesPage({ searchParams }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const resolvedParams = await searchParams;
  const activeCode = resolvedParams?.code || '';

  const allFaculties = await prisma.faculty.findMany({
    include: {
      departments: {
        include: {
          scholars: {
            where: { user: { accountStatus: 'ACTIVE' } },
            select: { id: true, tiuScore: true },
          },
        },
        orderBy: { nameUz: 'asc' },
      },
    },
    orderBy: { nameUz: 'asc' },
  });

  const faculties = activeCode
    ? allFaculties.filter((f) => f.code === activeCode)
    : allFaculties;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  const title =
    locale === 'uz'
      ? 'Fakultetlar va Kafedralar'
      : locale === 'ru'
      ? 'Факультеты и Кафедры'
      : 'Faculties & Departments';

  const subtitle =
    locale === 'uz'
      ? "Toshkent xalqaro universitetining ilmiy bo'linmalari va kafedralari bo'yicha olimlar katalogi"
      : locale === 'ru'
      ? 'Каталог ученых по факультетам и кафедрам Ташкентского международного университета'
      : 'Explore scholars and scientific output across Tashkent International University faculties and departments';

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 2xl:px-24 py-12 space-y-10">
      {/* Sahifa sarlavhasi va Fakultet tanlash */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-sky-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            TIU Academic Structure
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
            {activeCode && faculties[0] ? getLocalizedName(faculties[0]) : title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">{subtitle}</p>
        </div>

        {/* Fakultet tanlash Dropdown */}
        <FacultyFilterSelect
          activeCode={activeCode}
          placeholder={
            locale === 'uz'
              ? 'Barcha fakultetlar'
              : locale === 'ru'
              ? 'Все факультеты'
              : 'All Faculties'
          }
          options={[
            {
              value: '',
              label:
                locale === 'uz'
                  ? 'Barcha fakultetlar'
                  : locale === 'ru'
                  ? 'Все факультеты'
                  : 'All Faculties',
            },
            ...allFaculties.map((f) => ({
              value: f.code,
              label: getLocalizedName(f),
            })),
          ]}
        />
      </div>

      {/* Fakultetlar va ularning Kafedralar Card UI ro'yxati */}
      <div className="space-y-10">
        {faculties.map((faculty) => {
          const totalScholars = faculty.departments.reduce(
            (sum, d) => sum + d.scholars.length,
            0
          );
          return (
            <section
              key={faculty.id}
              className="neu-card rounded-3xl p-7 sm:p-8 space-y-6"
            >
              {/* Fakultet Header qismi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0F294A] dark:text-sky-300 text-xs font-mono font-bold tracking-wider uppercase">
                      {faculty.code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {faculty.departments.length}{' '}
                      {locale === 'uz' ? 'kafedra' : locale === 'ru' ? 'кафедр' : 'departments'} •{' '}
                      {totalScholars}{' '}
                      {locale === 'uz' ? 'olimlar' : locale === 'ru' ? 'ученых' : 'scholars'}
                    </span>
                  </div>
                  <Link
                    href={`/faculties?code=${faculty.code}`}
                    className="block text-xl sm:text-2xl font-extrabold text-[#0F294A] dark:text-white hover:text-blue-700 dark:hover:text-sky-300 transition-colors"
                  >
                    {getLocalizedName(faculty)}
                  </Link>
                </div>

                <Link
                  href={`/scholars?facultyId=${faculty.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-btn hover:bg-[#0F294A] hover:text-white dark:hover:bg-sky-500 text-blue-800 dark:text-sky-300 text-xs sm:text-sm font-semibold self-start sm:self-auto"
                >
                  <span>
                    {locale === 'uz'
                      ? `Fakultet olimlarini ko‘rish (${totalScholars})`
                      : locale === 'ru'
                      ? `Ученые факультета (${totalScholars})`
                      : `View Faculty Scholars (${totalScholars})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Kafedralar Card UI Grid */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  {locale === 'uz'
                    ? 'Fakultet tarkibidagi kafedralar'
                    : locale === 'ru'
                    ? 'Кафедры факультета'
                    : 'Faculty Departments'}
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${
                    faculty.departments.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                  } gap-4`}
                >
                  {faculty.departments.map((dept, dIdx) => (
                    <Link
                      key={dept.id}
                      href={`/scholars?facultyId=${faculty.id}&departmentId=${dept.id}`}
                      className="group/dept neu-card-sm rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-[#0F294A] dark:text-sky-400 flex items-center justify-center text-xs font-mono font-bold">
                            0{dIdx + 1}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover/dept:text-blue-600 dark:group-hover/dept:text-sky-400 group-hover/dept:translate-x-0.5 transition-all" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 group-hover/dept:text-blue-700 dark:group-hover/dept:text-sky-300 leading-snug transition-colors">
                          {getLocalizedName(dept)}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {dept.scholars.length}{' '}
                          {locale === 'uz' ? 'olimlar' : locale === 'ru' ? 'ученых' : 'scholars'}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-sky-400 opacity-0 group-hover/dept:opacity-100 transition-opacity">
                          {locale === 'uz' ? 'Ko‘rish' : locale === 'ru' ? 'Открыть' : 'View'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
