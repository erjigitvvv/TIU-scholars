'use client';

import { useState, useEffect, startTransition } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Users,
  ExternalLink,
  Mail,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  Copy,
  Building2,
} from 'lucide-react';
import { INTEREST_TRANSLATIONS } from '@/lib/interests';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const LABELS = {
  uz: {
    backToScholars: 'Olimlar katalogiga qaytish',
    notFound: 'Olim profili topilmadi yoki faol emas.',
    shareProfile: 'Profilni ulashish',
    copied: 'Nusxalandi',
    copyBibtex: 'BibTeX',
    tiuScore: 'TIU Ball',
    hIndex: 'H-Index',
    citations: 'Jami iqtiboslar',
    publications: 'Nashrlar',
    scopusSub: 'Scopus / WoS',
    breakdownTitle: 'Ball tarkibi (Score Breakdown)',
    breakdownSub: 'Barcha ilmiy faoliyat yo‘nalishlari bo‘yicha shaffof taqsimot',
    totalScore: 'Jami:',
    analyticsTitle: 'Nashrlar dinamikasi va tarkibi',
    educationTitle: 'Taʼlim va ilmiy daraja himoyasi',
    bioTitle: 'Ilmiy faoliyat haqida',
    interestsTitle: 'Ilmiy yo‘nalishlar',
    tabs: {
      publications: 'Nashrlar',
      grants: 'Grantlar',
      supervisions: 'Shogirdlar',
      coauthors: 'Hammualliflar',
    },
    approvedPubs: 'Tasdiqlangan nashrlar ro‘yxati',
    allYears: 'Barcha yillar',
    allQuartiles: 'Barcha kvartillar',
    allTypes: 'Barcha turlar',
    noPubs: 'Tanlangan filtr bo‘yicha nashrlar topilmadi.',
    grantsTitle: 'Ilmiy grantlar va loyihalar',
    noGrants: 'Grant loyihalari kiritilmagan.',
    present: 'Hozirgacha',
    role: 'Roli',
    supervisionsTitle: 'PhD / DSc ilmiy rahbarlik',
    noSupervisions: 'Ilmiy rahbarlik ma’lumotlari yo‘q.',
    student: 'Shogird',
    dissertation: 'Dissertatsiya',
    coauthorsTitle: 'Hammualliflar tarmog‘i',
    noCoauthors: 'Hammualliflar topilmadi.',
    sharedPubs: 'ta hammualliflik',
    citationsCount: 'Iqtiboslar',
    breakdown: {
      scopusWos: 'Scopus / WoS',
      oak: 'OAK Jurnallar',
      otherPubs: 'Boshqa nashrlar',
      citations: 'Iqtiboslar',
      grants: 'Grantlar',
      supervisions: 'Rahbarlik',
    },
  },
  ru: {
    backToScholars: 'Вернуться в каталог ученых',
    notFound: 'Профиль ученого не найден или неактивен.',
    shareProfile: 'Поделиться профилем',
    copied: 'Скопировано',
    copyBibtex: 'BibTeX',
    tiuScore: 'Балл TIU',
    hIndex: 'H-индекс',
    citations: 'Всего цитирований',
    publications: 'Публикации',
    scopusSub: 'Scopus / WoS',
    breakdownTitle: 'Структура балла (Score Breakdown)',
    breakdownSub: 'Прозрачное распределение по всем направлениям деятельности',
    totalScore: 'Итого:',
    analyticsTitle: 'Динамика и структура публикаций',
    educationTitle: 'Образование и защита степени',
    bioTitle: 'О научной деятельности',
    interestsTitle: 'Научные интересы',
    tabs: {
      publications: 'Публикации',
      grants: 'Гранты',
      supervisions: 'Ученики',
      coauthors: 'Соавторы',
    },
    approvedPubs: 'Список утвержденных публикаций',
    allYears: 'Все годы',
    allQuartiles: 'Все квартили',
    allTypes: 'Все типы',
    noPubs: 'Публикации по выбранному фильтру не найдены.',
    grantsTitle: 'Научные гранты и проекты',
    noGrants: 'Грантовые проекты не указаны.',
    present: 'По наст. время',
    role: 'Роль',
    supervisionsTitle: 'Научное руководство PhD / DSc',
    noSupervisions: 'Нет данных о научном руководстве.',
    student: 'Соискатель',
    dissertation: 'Диссертация',
    coauthorsTitle: 'Сеть соавторов',
    noCoauthors: 'Соавторы не найдены.',
    sharedPubs: 'совм. публ.',
    citationsCount: 'Цитирования',
    breakdown: {
      scopusWos: 'Scopus / WoS',
      oak: 'Журналы ВАК',
      otherPubs: 'Другие публ.',
      citations: 'Цитирования',
      grants: 'Гранты',
      supervisions: 'Руководство',
    },
  },
  en: {
    backToScholars: 'Back to Scholars Directory',
    notFound: 'Scholar profile not found or inactive.',
    shareProfile: 'Share Profile',
    copied: 'Copied',
    copyBibtex: 'BibTeX',
    tiuScore: 'TIU Score',
    hIndex: 'H-Index',
    citations: 'Total Citations',
    publications: 'Publications',
    scopusSub: 'Scopus / WoS',
    breakdownTitle: 'Score Breakdown',
    breakdownSub: 'Transparent point distribution across all academic activities',
    totalScore: 'Total:',
    analyticsTitle: 'Publication Dynamics & Mix',
    educationTitle: 'Education & Degree Defense',
    bioTitle: 'Academic Biography',
    interestsTitle: 'Research Interests',
    tabs: {
      publications: 'Publications',
      grants: 'Grants',
      supervisions: 'Supervisions',
      coauthors: 'Co-Authors',
    },
    approvedPubs: 'Approved Publications',
    allYears: 'All Years',
    allQuartiles: 'All Quartiles',
    allTypes: 'All Types',
    noPubs: 'No publications match the selected filters.',
    grantsTitle: 'Research Grants & Projects',
    noGrants: 'No grant projects listed.',
    present: 'Present',
    role: 'Role',
    supervisionsTitle: 'PhD / DSc Supervisions',
    noSupervisions: 'No supervision records.',
    student: 'Candidate',
    dissertation: 'Dissertation',
    coauthorsTitle: 'Co-Authors Network',
    noCoauthors: 'No co-authors found.',
    sharedPubs: 'shared pubs',
    citationsCount: 'Citations',
    breakdown: {
      scopusWos: 'Scopus / WoS',
      oak: 'OAK Journals',
      otherPubs: 'Other Pubs',
      citations: 'Citations',
      grants: 'Grants',
      supervisions: 'Supervisions',
    },
  },
};

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  const val = match ? decodeURIComponent(match[1]) : 'uz';
  return LABELS[val] ? val : 'uz';
}

function getPureFullName(rawName = '') {
  return rawName
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

function buildBibtex(pub, authorName) {
  const key = `${(authorName || 'scholar').split(' ').pop()?.toLowerCase() || 'ref'}${pub.year || ''}`;
  const entryType = pub.type === 'CONFERENCE' ? 'inproceedings' : pub.type === 'MONOGRAPH' ? 'book' : 'article';
  return `@${entryType}{${key},\n  title={${pub.title}},\n  author={${authorName}},\n  journal={${pub.journalOrPublisher || ''}},\n  year={${pub.year || ''}}${pub.doi ? `,\n  doi={${pub.doi}}` : ''}\n}`;
}

export default function ScholarProfilePage() {
  const params = useParams();
  const { id } = params;
  const [locale, setLocale] = useState('uz');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('publications');
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedBibId, setCopiedBibId] = useState(null);

  const [pubYear, setPubYear] = useState('ALL');
  const [pubType, setPubType] = useState('ALL');
  const [pubQuartile, setPubQuartile] = useState('ALL');

  useEffect(() => {
    const syncLocale = () => setLocale(getCookieLocale());
    syncLocale();
    const timer = setInterval(syncLocale, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/scholars/${id}`, { signal: controller.signal });
        const json = await res.json();
        if (json.scholar) {
          startTransition(() => {
            setData(json);
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          startTransition(() => setLoading(false));
        }
      }
    }
    fetchProfile();
    return () => controller.abort();
  }, [id]);

  const L = LABELS[locale] || LABELS.uz;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz || item.nameEn;
    if (locale === 'en') return item.nameEn || item.nameUz || item.nameRu;
    return item.nameUz || item.nameEn || item.nameRu;
  };

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleCopyBibtex = async (pub, authorName) => {
    try {
      await navigator.clipboard.writeText(buildBibtex(pub, authorName));
      setCopiedBibId(pub.id);
      setTimeout(() => setCopiedBibId(null), 1800);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-4 h-[520px] rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
              ))}
            </div>
            <div className="h-40 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.scholar) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <p className="text-slate-500 dark:text-slate-400 text-lg">{L.notFound}</p>
        <Link
          href="/scholars"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F294A] text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {L.backToScholars}
        </Link>
      </div>
    );
  }

  const s = data.scholar;
  const pureName = getPureFullName(s.fullName);
  const degreeLabel =
    s.academicDegree === 'DSC' ? 'DSc' : s.academicDegree === 'PHD' ? 'PhD' : '';

  const years = Array.from(new Set(s.publications.map((p) => p.year).filter(Boolean))).sort(
    (a, b) => b - a
  );

  const filteredPubs = s.publications.filter((p) => {
    if (pubYear !== 'ALL' && String(p.year) !== pubYear) return false;
    if (pubType !== 'ALL' && p.type !== pubType) return false;
    if (pubQuartile !== 'ALL' && p.quartile !== pubQuartile) return false;
    return true;
  });

  const bd = s.scoreBreakdown || {
    scopusWos: { count: 0, points: 0 },
    oak: { count: 0, points: 0 },
    otherPubs: { count: 0, points: 0 },
    citations: { count: 0, points: 0 },
    grants: { count: 0, points: 0 },
    supervisions: { count: 0, points: 0 },
  };

  const breakdownRows = [
    {
      key: 'scopusWos',
      label: `${L.breakdown.scopusWos} (${bd.scopusWos.count})`,
      points: bd.scopusWos.points,
      barColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
    },
    {
      key: 'oak',
      label: `${L.breakdown.oak} (${bd.oak.count})`,
      points: bd.oak.points,
      barColor: 'bg-blue-500',
      dotColor: 'bg-blue-500',
    },
    {
      key: 'otherPubs',
      label: `${L.breakdown.otherPubs} (${bd.otherPubs.count})`,
      points: bd.otherPubs.points,
      barColor: 'bg-cyan-500',
      dotColor: 'bg-cyan-500',
    },
    {
      key: 'citations',
      label: `${L.breakdown.citations} (${bd.citations.count})`,
      points: bd.citations.points,
      barColor: 'bg-indigo-500',
      dotColor: 'bg-indigo-500',
    },
    {
      key: 'grants',
      label: `${L.breakdown.grants} (${bd.grants.count})`,
      points: bd.grants.points,
      barColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
    },
    {
      key: 'supervisions',
      label: `${L.breakdown.supervisions} (${bd.supervisions.count})`,
      points: bd.supervisions.points,
      barColor: 'bg-purple-500',
      dotColor: 'bg-purple-500',
    },
  ];

  const totalBreakdownPoints = Math.max(
    1,
    breakdownRows.reduce((sum, r) => sum + r.points, 0)
  );

  const yearlyStats = s.yearlyStats || [];
  const maxYearCount = Math.max(1, ...yearlyStats.map((y) => y.count));
  const quartileStats = s.quartileStats || { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const typeStatsEntries = Object.entries(s.typeStats || {}).sort((a, b) => b[1] - a[1]);

  let interests = [];
  try {
    const parsed = JSON.parse(s.researchInterests || '[]');
    if (Array.isArray(parsed)) interests = parsed.filter(Boolean);
  } catch {
    interests = [];
  }

  const bioText =
    locale === 'ru'
      ? s.bioRu || s.bioUz || s.bioEn
      : locale === 'en'
      ? s.bioEn || s.bioUz || s.bioRu
      : s.bioUz || s.bioEn || s.bioRu;

  const positionText =
    locale === 'ru'
      ? s.positionRu || s.positionUz || s.positionEn
      : locale === 'en'
      ? s.positionEn || s.positionUz || s.positionRu
      : s.positionUz || s.positionEn || s.positionRu;

  const educationText =
    locale === 'ru'
      ? s.educationRu || s.educationUz || s.educationEn
      : locale === 'en'
      ? s.educationEn || s.educationUz || s.educationRu
      : s.educationUz || s.educationEn || s.educationRu;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/scholars"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {L.backToScholars}
        </Link>

        <button
          onClick={handleShareProfile}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          {copiedProfile ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">{L.copied}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{L.shareProfile}</span>
            </>
          )}
        </button>
      </div>

      {/* 2-Column Portfolio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT STICKY SIDEBAR */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-gradient-to-br from-white via-[#F7FAFF] to-[#EEF5FE] dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/90 p-6 sm:p-7 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative inline-flex">
              <ScholarAvatar
                photoUrl={s.photoUrl}
                fullName={pureName}
                index={0}
                className={`w-24 h-24 ring-4 shadow-md ${
                  s.academicDegree === 'DSC'
                    ? 'ring-amber-400 dark:ring-amber-400'
                    : s.academicDegree === 'PHD'
                    ? 'ring-blue-500 dark:ring-sky-400'
                    : 'ring-white dark:ring-slate-700'
                }`}
              />
              {degreeLabel && (
                <span
                  className={`absolute -bottom-1 -right-1 font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                    s.academicDegree === 'DSC'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white'
                  }`}
                >
                  {degreeLabel}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-[#0F294A] dark:text-white leading-tight">
                {pureName}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {s.academicTitle && s.academicTitle !== 'NONE' && (
                  <span className="px-3 py-1 bg-[#0F294A] dark:bg-sky-900/60 text-white dark:text-sky-200 text-xs font-bold rounded-full capitalize">
                    {s.academicTitle.toLowerCase().replace('_', ' ')}
                  </span>
                )}
                {positionText && (
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-sky-800/60 text-xs font-semibold rounded-full">
                    {positionText}
                  </span>
                )}
                {s.universityRank && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${
                      s.universityRank <= 3
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> #{s.universityRank} / {s.totalActiveScholars}
                  </span>
                )}
              </div>

              {/* Clickable Department & Faculty links */}
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed space-y-0.5 pt-1">
                {s.department && (
                  <div>
                    <Link
                      href={`/scholars?dept=${s.department.id}`}
                      className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {getLocalizedName(s.department)}
                    </Link>
                  </div>
                )}
                {s.department?.faculty && (
                  <div>
                    <Link
                      href={`/scholars?faculty=${s.department.faculty.id}`}
                      className="text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors text-xs"
                    >
                      {getLocalizedName(s.department.faculty)}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* External Profiles & Social Links */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {s.publicEmail && (
              <a
                href={`mailto:${s.publicEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-sky-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.publicEmail}
              </a>
            )}
            {s.orcidId && (
              <a
                href={`https://orcid.org/${s.orcidId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> ORCID
              </a>
            )}
            {s.scopusId && (
              <a
                href={`https://www.scopus.com/authid/detail.uri?authorId=${s.scopusId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-500" /> Scopus
              </a>
            )}
            {s.googleScholarUrl && (
              <a
                href={s.googleScholarUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Scholar
              </a>
            )}
            {s.linkedinUrl && (
              <a
                href={s.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" /> LinkedIn
              </a>
            )}
            {s.researchGateUrl && (
              <a
                href={s.researchGateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" /> ResearchGate
              </a>
            )}
            {s.telegramUrl && (
              <a
                href={s.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> Telegram
              </a>
            )}
          </div>

          {/* Education & Degree Defense */}
          {educationText && (
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                {L.educationTitle}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                {educationText}
              </p>
            </div>
          )}

          {/* Bio directly visible */}
          {bioText && (
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {L.bioTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {bioText}
              </p>
            </div>
          )}

          {/* Clickable Research Interests */}
          {interests.length > 0 && (
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                {L.interestsTitle}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((tag, idx) => {
                  const localizedTag = INTEREST_TRANSLATIONS[tag]?.[locale] || tag;
                  return (
                    <Link
                      key={idx}
                      href={`/scholars?q=${encodeURIComponent(localizedTag)}`}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-300 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      {localizedTag}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="lg:col-span-8 space-y-6">
          {/* 4 Clean Non-Redundant KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0F294A] dark:bg-sky-950/80 p-5 rounded-2xl border border-[#0F294A] dark:border-sky-800 shadow-xs text-white">
              <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
                {L.tiuScore}
              </div>
              <div className="font-mono text-3xl font-extrabold tabular-nums">{s.tiuScore}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/85 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {L.hIndex}
              </div>
              <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {s.hIndex}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/85 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {L.citations}
              </div>
              <div className="font-mono text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 tabular-nums">
                {s.totalCitations}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/85 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {L.publications}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {s.publications.length}
                </span>
                {s.scopusWosCount > 0 && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    ({s.scopusWosCount} {L.scopusSub})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Unified Stacked Score Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F294A] dark:text-white">
                    {L.breakdownTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{L.breakdownSub}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-extrabold text-[#0F294A] dark:text-sky-300 bg-blue-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-full tabular-nums">
                {L.totalScore} {s.tiuScore}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {breakdownRows.map((row) => {
                if (row.points <= 0) return null;
                const widthPct = (row.points / totalBreakdownPoints) * 100;
                return (
                  <div
                    key={row.key}
                    title={`${row.label}: +${row.points}`}
                    className={`h-full ${row.barColor} transition-all`}
                    style={{ width: `${widthPct}%` }}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {breakdownRows.map((row) => (
                <div
                  key={row.key}
                  className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${row.dotColor}`} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                      {row.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0">
                    +{row.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Publication Dynamics + Quartiles + Publication Mix */}
          {yearlyStats.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <h2 className="text-sm font-bold text-[#0F294A] dark:text-white">
                    {L.analyticsTitle}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['Q1', 'Q2', 'Q3', 'Q4']).map((q) => (
                    <span
                      key={q}
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        quartileStats[q] > 0
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200/70 dark:border-slate-700'
                      }`}
                    >
                      {q}: {quartileStats[q]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-3 h-28 pt-2 px-1">
                {yearlyStats.map((y) => {
                  const barHeight = Math.max(14, Math.round((y.count / maxYearCount) * 100));
                  return (
                    <div
                      key={y.year}
                      className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group"
                    >
                      <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                        {y.count}
                      </span>
                      <div className="w-full max-w-[36px] flex-1 flex items-end">
                        <div
                          title={`${y.year}: ${y.count} pubs, ${y.citations} citations`}
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#0F294A] to-blue-500 dark:from-sky-600 dark:to-sky-400 group-hover:opacity-90 transition-all"
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {y.year}
                      </span>
                    </div>
                  );
                })}
              </div>

              {typeStatsEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {typeStatsEntries.map(([typeKey, count]) => (
                    <span
                      key={typeKey}
                      className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
                    >
                      {typeKey.replace(/_/g, ' ')}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4 Interactive Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {[
                {
                  id: 'publications',
                  label: `${L.tabs.publications} (${s.publications.length})`,
                  icon: BookOpen,
                },
                {
                  id: 'grants',
                  label: `${L.tabs.grants} (${s.grantProjects.length})`,
                  icon: Briefcase,
                },
                {
                  id: 'supervisions',
                  label: `${L.tabs.supervisions} (${s.supervisions.length})`,
                  icon: GraduationCap,
                },
                {
                  id: 'coauthors',
                  label: `${L.tabs.coauthors} (${s.coAuthors.length})`,
                  icon: Users,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 dark:border-sky-400 text-blue-600 dark:text-sky-400 bg-blue-50/50 dark:bg-sky-950/30'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 sm:p-7">
              {activeTab === 'publications' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {L.approvedPubs}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={pubYear}
                        onChange={(e) => setPubYear(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="ALL">{L.allYears}</option>
                        {years.map((y) => (
                          <option key={y} value={String(y)}>
                            {y}
                          </option>
                        ))}
                      </select>

                      <select
                        value={pubQuartile}
                        onChange={(e) => setPubQuartile(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="ALL">{L.allQuartiles}</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>

                      <select
                        value={pubType}
                        onChange={(e) => setPubType(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="ALL">{L.allTypes}</option>
                        <option value="SCOPUS">Scopus</option>
                        <option value="WOS">Web of Science</option>
                        <option value="OAK">OAK</option>
                        <option value="MONOGRAPH">Monograph</option>
                        <option value="PATENT">Patent</option>
                      </select>
                    </div>
                  </div>

                  {filteredPubs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                      {L.noPubs}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredPubs.map((pub) => (
                        <div
                          key={pub.id}
                          className="p-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">
                              {pub.type}
                            </span>
                            {pub.quartile && pub.quartile !== 'NONE' && (
                              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded">
                                {pub.quartile}
                              </span>
                            )}
                            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                              {pub.year}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              {pub.citationsCount > 0 && (
                                <span className="font-mono text-xs font-semibold text-blue-700 dark:text-sky-400 tabular-nums">
                                  {L.citationsCount}: {pub.citationsCount}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopyBibtex(pub, pureName)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                {copiedBibId === pub.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600">{L.copied}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>{L.copyBibtex}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                            {pub.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {pub.journalOrPublisher}
                            {pub.doi && (
                              <>
                                {' • '}
                                <a
                                  href={`https://doi.org/${pub.doi}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 dark:text-sky-400 hover:underline"
                                >
                                  DOI: {pub.doi}
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'grants' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {L.grantsTitle}
                  </h3>
                  {s.grantProjects.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                      {L.noGrants}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {s.grantProjects.map((g) => (
                        <div
                          key={g.id}
                          className="p-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                        >
                          <div className="text-xs font-semibold text-blue-600 dark:text-sky-400">
                            {g.fundingSource} ({g.startYear} – {g.endYear || L.present})
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {g.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {L.role}: {g.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'supervisions' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {L.supervisionsTitle}
                  </h3>
                  {s.supervisions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                      {L.noSupervisions}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {s.supervisions.map((sup) => (
                        <div
                          key={sup.id}
                          className="p-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">
                              {sup.degreeType}
                            </span>
                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                              {sup.year}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {L.student}: {sup.studentName}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {L.dissertation}: {sup.dissertationTitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'coauthors' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {L.coauthorsTitle}
                  </h3>
                  {s.coAuthors.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                      {L.noCoauthors}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {s.coAuthors.map((co, idx) => (
                        <Link
                          key={co.id}
                          href={`/scholars/${co.id}`}
                          className="p-4 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-sky-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-sky-500/60 rounded-2xl transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ScholarAvatar
                              photoUrl={co.photoUrl}
                              fullName={getPureFullName(co.fullName)}
                              index={idx + 1}
                              className="w-11 h-11 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {getPureFullName(co.fullName)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {getLocalizedName(co.department)}
                              </div>
                            </div>
                          </div>
                          {co.sharedCount > 0 && (
                            <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-sky-400 shrink-0">
                              {co.sharedCount} {L.sharedPubs}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
