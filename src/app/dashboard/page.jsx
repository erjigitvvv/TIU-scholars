import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  UserCog,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPublicationPoints } from '@/lib/scoring';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const COPY = {
  uz: {
    welcome: 'Xush kelibsiz',
    noProfileTitle: 'Olim profili topilmadi',
    noProfileDesc: "Profilingiz hali yaratilmagan. Administrator bilan bog'laning.",
    activeBadge: 'Faol hisob',
    pendingBadge: 'Tasdiqlash kutilmoqda',
    approvedPubs: 'Tasdiqlangan nashrlar',
    pendingReview: 'ta kutilmoqda',
    hIndex: 'H-Index',
    citations: 'ta iqtibos',
    tiuScore: 'TIU Ball',
    weightedIndex: 'Umumiy reyting balli',
    grants: 'Grantlar',
    approvedOf: 'tasdiqlangan / jami',
    supervisions: 'Ilmiy rahbarlik',
    candidates: 'PhD / DSc shogirdlar',
    annualKpi: 'Yillik KPI maqsadlari',
    pubsTarget: 'Tasdiqlangan nashrlar maqsadi',
    scopusTarget: 'Scopus / Web of Science maqsadi',
    scoreTarget: 'TIU Ball maqsadi',
    rejectionsTitle: "Moderatsiya rad etgan nashrlar (tuzatish talab etiladi)",
    reason: 'Sabab',
    noReason: "Sabab ko'rsatilmagan",
    editResubmit: 'Tahrirlash va qayta yuborish',
    recentPubs: "So'nggi nashrlarim",
    viewAll: 'Barchasini ko‘rish',
    noPubs: "Hozircha nashrlar qo'shilmagan.",
    addPub: "Nashr qo'shish",
    addGrant: "Grant qo'shish",
    editProfile: 'Profilni tahrirlash',
    statusApproved: 'Tasdiqlangan',
    statusPending: 'Kutilmoqda',
    statusRejected: 'Rad etilgan',
    adminPortalBtn: 'Ilmiy bo‘lim kabinetiga o‘tish',
    latestAnnouncements: 'So‘nggi ilmiy e’lonlar',
  },
  ru: {
    welcome: 'Добро пожаловать',
    noProfileTitle: 'Профиль учёного не найден',
    noProfileDesc: 'Ваш профиль ещё не создан. Обратитесь к администратору.',
    activeBadge: 'Активный аккаунт',
    pendingBadge: 'На рассмотрении',
    approvedPubs: 'Одобренные публикации',
    pendingReview: 'на проверке',
    hIndex: 'Индекс Хирша',
    citations: 'цитирований',
    tiuScore: 'Балл TIU',
    weightedIndex: 'Рейтинговый индекс',
    grants: 'Гранты',
    approvedOf: 'одобрено / всего',
    supervisions: 'Руководство',
    candidates: 'Соискатели PhD / DSc',
    annualKpi: 'Годовые KPI цели',
    pubsTarget: 'Цель по одобренным публикациям',
    scopusTarget: 'Цель Scopus / Web of Science',
    scoreTarget: 'Цель по баллу TIU',
    rejectionsTitle: 'Отклонённые публикации (требуют исправления)',
    reason: 'Причина',
    noReason: 'Причина не указана',
    editResubmit: 'Исправить и отправить',
    recentPubs: 'Мои последние публикации',
    viewAll: 'Смотреть все',
    noPubs: 'Публикации ещё не добавлены.',
    addPub: 'Добавить публикацию',
    addGrant: 'Добавить грант',
    editProfile: 'Настроить профиль',
    statusApproved: 'Одобрено',
    statusPending: 'На проверке',
    statusRejected: 'Отклонено',
    adminPortalBtn: 'Перейти в кабинет научного отдела',
    latestAnnouncements: 'Последние научные объявления',
  },
  en: {
    welcome: 'Welcome back',
    noProfileTitle: 'No Scholar Profile Found',
    noProfileDesc: 'Your scholar profile has not been set up yet. Please contact the administrator.',
    activeBadge: 'Account Active',
    pendingBadge: 'Pending Approval',
    approvedPubs: 'Approved Pubs',
    pendingReview: 'pending review',
    hIndex: 'H-Index',
    citations: 'total citations',
    tiuScore: 'TIU Score',
    weightedIndex: 'Weighted metric index',
    grants: 'Grants',
    approvedOf: 'approved / total',
    supervisions: 'Supervisions',
    candidates: 'PhD / DSc candidates',
    annualKpi: 'Annual KPI Targets',
    pubsTarget: 'Approved Publications Target',
    scopusTarget: 'Scopus / Web of Science Target',
    scoreTarget: 'TIU Score Target',
    rejectionsTitle: 'Moderation Rejections Requiring Attention',
    reason: 'Reason',
    noReason: 'No reason provided',
    editResubmit: 'Edit & Resubmit',
    recentPubs: 'Recent Publications',
    viewAll: 'View all',
    noPubs: 'No publications added yet.',
    addPub: 'Add Publication',
    addGrant: 'Add Grant',
    editProfile: 'Edit Profile',
    statusApproved: 'Approved',
    statusPending: 'Pending',
    statusRejected: 'Rejected',
    adminPortalBtn: 'Go to Scientific Dept. Cabinet',
    latestAnnouncements: 'Latest Scientific Announcements',
  },
};

function renderTwoToneName(fullName) {
  if (!fullName) return '';
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length <= 1) return <span className="font-bold">{fullName}</span>;
  return (
    <>
      <span className="font-medium text-slate-600 dark:text-slate-300">{parts[0]}</span>{' '}
      <span className="font-bold text-slate-900 dark:text-white">{parts.slice(1).join(' ')}</span>
    </>
  );
}

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const t = COPY[locale] || COPY.uz;

  const user = await getCurrentUser();
  const [scholar, scoringConfig] = await Promise.all([
    user?.scholarProfile
      ? prisma.scholarProfile.findUnique({
          where: { id: user.scholarProfile.id },
          include: {
            department: {
              include: {
                faculty: true,
                kpiTargets: { orderBy: { year: 'desc' } },
              },
            },
            publications: {
              include: { publication: true },
              orderBy: { publication: { createdAt: 'desc' } },
            },
            grantProjects: true,
            supervisions: true,
            kpiTargets: { orderBy: { year: 'desc' } },
          },
        })
      : null,
    prisma.scoringConfig.findFirst(),
  ]);

  if (!scholar) {
    const isAdminRole = user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';
    return (
      <div className="neu-card p-10 rounded-3xl text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.noProfileTitle}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t.noProfileDesc}</p>
        {isAdminRole && (
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F294A] text-white text-xs font-bold">
            {t.adminPortalBtn} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  }

  const latestAnnouncements = await prisma.announcement.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 3,
  });

  const pubs = scholar.publications.map((p) => p.publication);
  const approvedPubs = pubs.filter((p) => p.status === 'APPROVED');
  const approvedCount = approvedPubs.length;
  const pendingCount = pubs.filter((p) => p.status === 'PENDING').length;
  const scopusWosCount = approvedPubs.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS').length;

  const approvedGrants = scholar.grantProjects.filter((g) => ['APPROVED', 'WON', 'COMPLETED'].includes(g.status)).length;
  const approvedSupervisions = scholar.supervisions.filter((s) => s.status === 'APPROVED').length;

  const currentYear = new Date().getFullYear();
  const deptTargets = scholar.department?.kpiTargets || [];
  const kpiTarget =
    scholar.kpiTargets.find((k) => k.year === currentYear) ||
    deptTargets.find((k) => k.year === currentYear) ||
    scholar.kpiTargets[0] ||
    deptTargets[0] || {
      year: currentYear,
      targetPublications: 5,
      targetScopus: 2,
      targetScore: 25,
    };

  const pubProgress = Math.min(100, Math.round((approvedCount / (kpiTarget.targetPublications || 1)) * 100));
  const scopusProgress = Math.min(100, Math.round((scopusWosCount / (kpiTarget.targetScopus || 1)) * 100));
  const scoreProgress = Math.min(100, Math.round((scholar.tiuScore / (kpiTarget.targetScore || 1)) * 100));

  const rejectedPubs = pubs.filter((p) => p.status === 'REJECTED').slice(0, 3);
  const recentPubs = [...pubs].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 6);
  const approvedYearsMap = new Map();
  for (const pub of approvedPubs) {
    if (pub.year) {
      approvedYearsMap.set(pub.year, (approvedYearsMap.get(pub.year) || 0) + 1);
    }
  }
  const approvedYearStats = Array.from(approvedYearsMap.entries()).sort((a, b) => b[0] - a[0]);

  const deptName =
    locale === 'ru'
      ? scholar.department?.nameRu || scholar.department?.nameUz
      : locale === 'en'
        ? scholar.department?.nameEn || scholar.department?.nameUz
        : scholar.department?.nameUz || scholar.department?.nameEn;

  const facultyName =
    locale === 'ru'
      ? scholar.department?.faculty?.nameRu || scholar.department?.faculty?.nameUz
      : locale === 'en'
        ? scholar.department?.faculty?.nameEn || scholar.department?.faculty?.nameUz
        : scholar.department?.faculty?.nameUz || scholar.department?.faculty?.nameEn;

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <ScholarAvatar
            fullName={scholar.fullName}
            photoUrl={scholar.photoUrl}
            academicDegree={scholar.academicDegree}
            size="lg"
            showDegreeBadge
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.welcome}
            </p>
            <h2 className="text-xl sm:text-2xl leading-tight truncate mt-0.5">
              {renderTwoToneName(scholar.fullName)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 truncate">
              {facultyName ? `${facultyName} • ` : ''}
              {deptName} • {scholar.academicDegree} ({scholar.academicTitle})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {user?.accountStatus === 'ACTIVE' ? t.activeBadge : t.pendingBadge}
          </span>
          <Link
            href="/dashboard/publications"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            {t.addPub}
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/85 hover:bg-white dark:bg-slate-900/75 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap"
          >
            <UserCog className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            {t.editProfile}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="neu-card-sm p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t.approvedPubs}</span>
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{approvedCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {pendingCount} {t.pendingReview}
          </div>
        </div>

        <div className="neu-card-sm p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t.hIndex}</span>
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{scholar.hIndex}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {scholar.totalCitations} {t.citations}
          </div>
        </div>

        <div className="neu-card-navy p-5 rounded-2xl text-white">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t.tiuScore}</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold">{scholar.tiuScore.toFixed(1)}</div>
          <div className="text-xs text-blue-200/90 mt-1">{t.weightedIndex}</div>
        </div>

        <div className="neu-card-sm p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t.grants}</span>
            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {approvedGrants}
            <span className="text-sm font-medium text-slate-400">/{scholar.grantProjects.length}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.approvedOf}</div>
        </div>

        <div className="neu-card-sm p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t.supervisions}</span>
            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {approvedSupervisions}
            <span className="text-sm font-medium text-slate-400">/{scholar.supervisions.length}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.candidates}</div>
        </div>
      </div>

      {/* Annual KPI Target Progress Bars */}
      <div className="neu-card p-6 rounded-3xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.annualKpi} ({kpiTarget.year || currentYear})
          </h3>
          <Link
            href="/dashboard/grants"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/85 hover:bg-white dark:bg-slate-900/75 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            {t.addGrant}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="neu-card-sm p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">
                {t.pubsTarget} ({approvedCount} / {kpiTarget.targetPublications})
              </span>
              <span className="text-blue-600 dark:text-blue-400">{pubProgress}%</span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pubProgress}%` }}
              />
            </div>
          </div>

          <div className="neu-card-sm p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">
                {t.scopusTarget} ({scopusWosCount} / {kpiTarget.targetScopus})
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">{scopusProgress}%</span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${scopusProgress}%` }}
              />
            </div>
          </div>

          <div className="neu-card-sm p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">
                {t.scoreTarget} ({scholar.tiuScore.toFixed(1)} / {kpiTarget.targetScore})
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">{scoreProgress}%</span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${scoreProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rejections Alert */}
      {rejectedPubs.length > 0 && (
        <div className="neu-card p-6 rounded-3xl border border-red-200/80 dark:border-red-900/50 space-y-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{t.rejectionsTitle}</span>
          </div>
          <div className="space-y-2.5">
            {rejectedPubs.map((pub) => (
              <div
                key={pub.id}
                className="neu-card-sm p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{pub.title}</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {t.reason}: {pub.rejectionReason || t.noReason}
                  </p>
                </div>
                <Link
                  href="/dashboard/publications"
                  className="glass-btn px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 shrink-0"
                >
                  {t.editResubmit}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Publications */}
      <div className="neu-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t.recentPubs}</h3>
            {approvedYearStats.map(([yr, cnt]) => (
              <span
                key={yr}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60"
              >
                {yr}: {cnt}
              </span>
            ))}
          </div>
          <Link
            href="/dashboard/publications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.viewAll} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPubs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{t.noPubs}</div>
        ) : (
          <div className="space-y-2.5">
            {recentPubs.map((pub) => (
              <div
                key={pub.id}
                className="neu-card-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {pub.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {pub.year}
                    </span>
                    {pub.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> {t.statusApproved}
                      </span>
                    )}
                    {pub.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" /> {t.statusPending}
                      </span>
                    )}
                    {pub.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> {t.statusRejected}
                      </span>
                    )}
                  </div>
                  {pub.status === 'APPROVED' ? (
                    <Link
                      href={`/publications/${pub.id}`}
                      className="font-semibold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {pub.title}
                    </Link>
                  ) : (
                    <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{pub.title}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {pub.journalOrPublisher}
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  +{getPublicationPoints(pub, scoringConfig)} ball
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Latest Announcements */}
      {latestAnnouncements.length > 0 && (
        <div className="neu-card p-6 sm:p-7 rounded-3xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.latestAnnouncements}</h3>
            </div>
            <Link href="/dashboard/announcements" className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1">
              {t.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestAnnouncements.map((ann) => (
              <Link
                key={ann.id}
                href="/dashboard/announcements"
                className="p-4 rounded-2xl bg-white/75 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 hover:border-blue-400 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <span className="font-bold text-blue-700 dark:text-sky-400">{ann.category}</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{ann.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{ann.content}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
