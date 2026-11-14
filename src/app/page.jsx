import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BookOpen,
  Users,
  Award,
  Briefcase,
  ExternalLink,
  ArrowRight,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getDictionary } from '@/lib/i18n';
import HeroBanner from '@/components/home/HeroBanner';
import HomeMetricsBento from '@/components/home/HomeMetricsBento';
import HomeScholarsAndFaculties from '@/components/home/HomeScholarsAndFaculties';
import HomeLatestPublications from '@/components/home/HomeLatestPublications';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

const RANK_BADGE_STYLES = [
  'bg-amber-100 text-amber-800 border-amber-200', // 1st Gold
  'bg-slate-100 text-slate-700 border-slate-300', // 2nd Silver
  'bg-orange-100 text-orange-800 border-orange-200', // 3rd Bronze
];

const PUB_TYPE_STYLES = {
  SCOPUS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WOS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OAK: 'bg-blue-50 text-blue-700 border-blue-200',
  MONOGRAPH: 'bg-purple-50 text-purple-700 border-purple-200',
  PATENT: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const dict = getDictionary(locale);

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  // Parallel DB aggregation strictly enforcing ACTIVE scholars & APPROVED outputs
  const [
    activeScholarsCount,
    dscCount,
    phdCount,
    scholarAvgAgg,
    pubAgg,
    pubTypesRaw,
    grantsCount,
    supervisionsCount,
    topScholars,
    faculties,
    latestPubs,
  ] = await Promise.all([
    prisma.scholarProfile.count({
      where: { user: { accountStatus: 'ACTIVE' } },
    }),
    prisma.scholarProfile.count({
      where: { user: { accountStatus: 'ACTIVE' }, academicDegree: 'DSC' },
    }),
    prisma.scholarProfile.count({
      where: { user: { accountStatus: 'ACTIVE' }, academicDegree: 'PHD' },
    }),
    prisma.scholarProfile.aggregate({
      where: { user: { accountStatus: 'ACTIVE' } },
      _avg: { hIndex: true },
    }),
    prisma.publication.aggregate({
      where: { status: 'APPROVED' },
      _count: { id: true },
      _sum: { citationsCount: true },
    }),
    prisma.publication.groupBy({
      by: ['type'],
      where: { status: 'APPROVED' },
      _count: { id: true },
    }),
    prisma.grantProject.count({
      where: { status: 'APPROVED' },
    }),
    prisma.supervision.count({
      where: { status: 'APPROVED' },
    }),
    prisma.scholarProfile.findMany({
      where: { user: { accountStatus: 'ACTIVE' } },
      include: {
        department: { include: { faculty: true } },
        publications: {
          where: { publication: { status: 'APPROVED' } },
          select: {
            publication: {
              select: { year: true, quartile: true },
            },
          },
        },
      },
      orderBy: [{ tiuScore: 'desc' }, { hIndex: 'desc' }],
    }),
    prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            scholars: {
              where: { user: { accountStatus: 'ACTIVE' } },
              select: { id: true, tiuScore: true },
            },
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.publication.findMany({
      where: { status: 'APPROVED' },
      include: {
        authors: {
          include: {
            scholar: {
              include: {
                department: { include: { faculty: true } },
              },
            },
          },
          orderBy: { authorOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const approvedPubsCount = pubAgg._count.id || 0;
  const totalCitations = pubAgg._sum.citationsCount || 0;
  const avgHIndex = Number((scholarAvgAgg._avg.hIndex || 0).toFixed(1));

  const typeMap = Object.fromEntries(pubTypesRaw.map((t) => [t.type, t._count.id]));
  const scopusWosCount = (typeMap.SCOPUS || 0) + (typeMap.WOS || 0);
  const oakCount = typeMap.OAK || 0;

  const facultyShares = faculties
    .map((f) => ({
      id: f.id,
      name: getLocalizedName(f),
      score: f.departments.reduce(
        (sum, d) => sum + d.scholars.reduce((sSum, s) => sSum + (s.tiuScore || 0), 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const yearlyCountsRaw = await prisma.publication.groupBy({
    by: ['year'],
    where: { status: 'APPROVED' },
    _count: { id: true },
    orderBy: { year: 'asc' },
  });
  const yearlyBars = yearlyCountsRaw.slice(-5).map((r) => ({
    year: r.year,
    count: r._count.id,
  }));

  return (
    <div className="bg-white">
      {/* 1. Full-Screen Animated Campus Hero Banner */}
      <HeroBanner
        heroTitle={dict.home.heroTitle}
        heroSubtitle={dict.home.heroSubtitle}
        searchPlaceholder={dict.home.searchPlaceholder}
        searchButton={dict.home.searchButton}
        scholarsLabel={dict.nav.scholars}
        pubsLabel={dict.nav.publications}
      />

      {/* 2. Full-Layout 6-Card Animated Bento Analytics */}
      <HomeMetricsBento
        stats={{
          activeScholars: activeScholarsCount,
          dscCount,
          phdCount,
          avgHIndex,
          approvedPublications: approvedPubsCount,
          scopusWosCount,
          oakCount,
          totalCitations,
          grantProjects: grantsCount,
          supervisions: supervisionsCount,
        }}
        labels={dict.home.stats}
        locale={locale}
        topScholars={topScholars}
        facultyShares={facultyShares}
        yearlyBars={
          yearlyBars.length > 0
            ? yearlyBars
            : [
                { year: 2022, count: 4 },
                { year: 2023, count: 7 },
                { year: 2024, count: 10 },
                { year: 2025, count: 14 },
                { year: 2026, count: approvedPubsCount || 8 },
              ]
        }
      />

      {/* 3 & 4. Combined Full-Layout: Top Scholars Carousel & Faculties */}
      <HomeScholarsAndFaculties
        locale={locale}
        topScholars={(() => {
          const currentYear = new Date().getFullYear();
          const parseTags = (raw) => {
            if (!raw) return [];
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 2);
            } catch {}
            return String(raw)
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 2);
          };

          return [...topScholars]
            .map((s) => {
              const pubs = s.publications || [];
              const recentQ1Q2Count = pubs.filter(
                (pa) =>
                  pa.publication &&
                  pa.publication.year >= currentYear - 2 &&
                  (pa.publication.quartile === 'Q1' || pa.publication.quartile === 'Q2')
              ).length;

              return {
                id: s.id,
                fullName: s.fullName,
                photoUrl: s.photoUrl,
                academicTitle: s.academicTitle,
                academicDegree: s.academicDegree,
                hIndex: s.hIndex,
                totalCitations: s.totalCitations,
                tiuScore: s.tiuScore,
                publicationsCount: pubs.length,
                recentQ1Q2Count,
                departmentName: s.department ? getLocalizedName(s.department) : '',
                researchTags: parseTags(s.researchInterests),
              };
            })
            .sort((a, b) => {
              if (b.tiuScore !== a.tiuScore) return b.tiuScore - a.tiuScore;
              if (b.hIndex !== a.hIndex) return b.hIndex - a.hIndex;
              return b.recentQ1Q2Count - a.recentQ1Q2Count;
            });
        })()}
        faculties={faculties.map((f) => ({
          id: f.id,
          code: f.code,
          name: getLocalizedName(f),
          departmentCount: f.departments.length,
          scholarCount: f.departments.reduce((sum, d) => sum + d.scholars.length, 0),
          totalScore: Math.round(
            f.departments.reduce(
              (sum, d) => sum + d.scholars.reduce((sSum, s) => sSum + (s.tiuScore || 0), 0),
              0
            )
          ),
          departments: f.departments.map((d) => ({
            id: d.id,
            name: getLocalizedName(d),
            scholarCount: d.scholars.length,
          })),
        }))}
        labels={{
          topScholarsTitle: dict.home.topScholarsTitle,
          topScholarsSubtitle: `${dict.home.tiuScore} & ${dict.home.hIndex}`,
          viewAllScholars: dict.home.viewAllScholars,
          viewProfile: locale === 'ru' ? 'Открыть профиль' : locale === 'en' ? 'View Profile' : "Profilni ko'rish",
          facultiesTitle: dict.home.facultiesTitle,
          facultiesNav: dict.nav.faculties,
          departmentsWord: locale === 'ru' ? 'кафедр' : locale === 'en' ? 'depts' : 'kafedra',
          scholarsWord: dict.nav.scholars.toLowerCase(),
        }}
      />

      {/* 5. Latest Approved Publications (Full Layout) */}
      <HomeLatestPublications
        locale={locale}
        publications={latestPubs.map((pub) => ({
          id: pub.id,
          title: pub.title,
          type: pub.type,
          quartile: pub.quartile,
          year: pub.year,
          journalOrPublisher: pub.journalOrPublisher,
          doi: pub.doi,
          url: pub.url,
          citationsCount: pub.citationsCount,
          approvedAt: pub.createdAt ? pub.createdAt.toISOString() : null,
          facultyCode: pub.authors?.[0]?.scholar?.department?.faculty?.code || '',
          facultyName: pub.authors?.[0]?.scholar?.department?.faculty
            ? getLocalizedName(pub.authors[0].scholar.department.faculty)
            : '',
          departmentName: pub.authors?.[0]?.scholar?.department
            ? getLocalizedName(pub.authors[0].scholar.department)
            : '',
          authors: (pub.authors || []).map((a) => ({
            id: a.id,
            scholarId: a.scholar.id,
            fullName: a.scholar.fullName,
            academicDegree: a.scholar.academicDegree,
          })),
        }))}
        labels={{
          title: dict.home.latestPublicationsTitle,
          viewAll: dict.nav.publications,
          citations: dict.home.citations,
        }}
      />
    </div>
  );
}
