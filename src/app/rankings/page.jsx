'use client';

import { Suspense, useState, useEffect, useMemo, startTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  Building2,
  Medal,
  Search,
  X,
  ArrowUpDown,
  Trophy,
  BookOpen,
  Quote,
} from 'lucide-react';
import ScholarAvatar from '@/components/ui/ScholarAvatar';
import CustomSelect from '@/components/ui/CustomSelect';

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : 'uz';
}

function getPureFullName(rawName = '') {
  return rawName
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

const PODIUM_BADGES = [
  'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 dark:from-amber-950/80 dark:to-yellow-900/60 dark:text-amber-300 dark:border-amber-700',
  'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200 dark:border-slate-600',
  'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 dark:from-orange-950/80 dark:to-amber-950/60 dark:text-orange-300 dark:border-orange-700',
];

const LABELS = {
  uz: {
    title: 'Ilmiy Reyting',
    subtitle: 'TIU olimlari va kafedralarining ilmiy salohiyat ko‘rsatkichlari bo‘yicha reyting jadvali',
    scholarsTab: 'Olimlar reytingi',
    departmentsTab: 'Kafedralar reytingi',
    searchPlaceholder: 'Olim yoki kafedra nomi bo‘yicha qidirish...',
    allFaculties: 'Barcha fakultetlar',
    sortScore: 'TIU Balli bo‘yicha',
    sortHIndex: 'H-Indeks bo‘yicha',
    sortCitations: 'Iqtiboslar bo‘yicha',
    sortPubs: 'Nashrlar soni bo‘yicha',
    sortTotalScore: 'Umumiy ball bo‘yicha',
    sortAvgScore: 'O‘rtacha ball bo‘yicha',
    loading: 'Reyting yuklanmoqda...',
    empty: 'Tanlangan mezonlar bo‘yicha ma’lumot topilmadi.',
    colRank: '#',
    colScholar: 'Olim',
    colDept: 'Kafedra',
    colHIndex: 'H-Indeks',
    colPubs: 'Nashrlar',
    colScopus: 'Scopus/WoS',
    colCitations: 'Iqtibos',
    colScore: 'TIU Balli',
    colFaculty: 'Fakultet',
    colActiveScholars: 'Olimlar',
    colAvgScore: 'O‘rtacha ball',
    colTotalScore: 'Umumiy ball',
  },
  ru: {
    title: 'Научный рейтинг',
    subtitle: 'Рейтинговая таблица ученых и кафедр TIU по показателям научного потенциала',
    scholarsTab: 'Рейтинг ученых',
    departmentsTab: 'Рейтинг кафедр',
    searchPlaceholder: 'Поиск по имени ученого или кафедры...',
    allFaculties: 'Все факультеты',
    sortScore: 'По баллу TIU',
    sortHIndex: 'По H-индексу',
    sortCitations: 'По цитированиям',
    sortPubs: 'По публикациям',
    sortTotalScore: 'По общему баллу',
    sortAvgScore: 'По среднему баллу',
    loading: 'Загрузка рейтинга...',
    empty: 'По выбранным критериям данные не найдены.',
    colRank: '#',
    colScholar: 'Ученый',
    colDept: 'Кафедра',
    colHIndex: 'H-индекс',
    colPubs: 'Публ.',
    colScopus: 'Scopus/WoS',
    colCitations: 'Цитир.',
    colScore: 'Балл TIU',
    colFaculty: 'Факультет',
    colActiveScholars: 'Ученые',
    colAvgScore: 'Средний балл',
    colTotalScore: 'Общий балл',
  },
  en: {
    title: 'Scientific Rankings',
    subtitle: 'Performance leaderboards for TIU scholars and academic departments',
    scholarsTab: 'Scholar Leaderboard',
    departmentsTab: 'Department Leaderboard',
    searchPlaceholder: 'Search by scholar or department name...',
    allFaculties: 'All Faculties',
    sortScore: 'By TIU Score',
    sortHIndex: 'By H-Index',
    sortCitations: 'By Citations',
    sortPubs: 'By Publications',
    sortTotalScore: 'By Total Score',
    sortAvgScore: 'By Avg Score',
    loading: 'Loading rankings...',
    empty: 'No ranking records found for selected filters.',
    colRank: '#',
    colScholar: 'Scholar',
    colDept: 'Department',
    colHIndex: 'H-Index',
    colPubs: 'Pubs',
    colScopus: 'Scopus/WoS',
    colCitations: 'Citations',
    colScore: 'TIU Score',
    colFaculty: 'Faculty',
    colActiveScholars: 'Scholars',
    colAvgScore: 'Avg Score',
    colTotalScore: 'Total Score',
  },
};

function RankingsContent() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('uz');
  const [data, setData] = useState({ scholars: [], departments: [], faculties: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('scholars');
  const [facultyId, setFacultyId] = useState('');
  const [search, setSearch] = useState('');
  const [scholarSort, setScholarSort] = useState('score');
  const [deptSort, setDeptSort] = useState('total');

  useEffect(() => {
    const updateLocale = () => setLocale(getCookieLocale());
    updateLocale();
    const interval = setInterval(updateLocale, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    setTab(urlTab === 'departments' ? 'departments' : 'scholars');
  }, [searchParams]);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const params = new URLSearchParams();
        if (facultyId) params.set('facultyId', facultyId);
        const res = await fetch(`/api/rankings?${params.toString()}`);
        const json = await res.json();
        if (json.scholars) {
          startTransition(() => {
            setData(json);
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    }
    fetchRankings();
  }, [facultyId]);

  const L = LABELS[locale] || LABELS.uz;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz || item.nameEn;
    if (locale === 'en') return item.nameEn || item.nameUz || item.nameRu;
    return item.nameUz || item.nameEn || item.nameRu;
  };

  const filteredScholars = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (data.scholars || []).filter((s) => {
      if (!q) return true;
      const nameMatch = (s.fullName || '').toLowerCase().includes(q);
      const deptMatch = getLocalizedName(s.department).toLowerCase().includes(q);
      return nameMatch || deptMatch;
    });

    return [...list].sort((a, b) => {
      if (scholarSort === 'hindex') return (b.hIndex || 0) - (a.hIndex || 0);
      if (scholarSort === 'citations') return (b.totalCitations || 0) - (a.totalCitations || 0);
      if (scholarSort === 'pubs') return (b.approvedPubsCount || 0) - (a.approvedPubsCount || 0);
      return (b.tiuScore || 0) - (a.tiuScore || 0);
    });
  }, [data.scholars, search, scholarSort, locale]);

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (data.departments || []).filter((d) => {
      if (!q) return true;
      const dName = getLocalizedName(d).toLowerCase();
      const fName = getLocalizedName(d.faculty).toLowerCase();
      return dName.includes(q) || fName.includes(q);
    });

    return [...list].sort((a, b) => {
      if (deptSort === 'avg') return (b.avgTiuScore || 0) - (a.avgTiuScore || 0);
      return (b.totalTiuScore || 0) - (a.totalTiuScore || 0);
    });
  }, [data.departments, search, deptSort, locale]);

  const facultyOptions = [
    { value: '', label: L.allFaculties },
    ...(data.faculties || []).map((f) => ({ value: f.id, label: getLocalizedName(f) })),
  ];

  const top3Scholars = filteredScholars.slice(0, 3);
  const top3Depts = filteredDepartments.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            TIU Leaderboard
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
            {L.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{L.subtitle}</p>
        </div>

        <div className="flex gap-2 p-1.5 rounded-2xl w-fit neu-card-sm">
          <button
            type="button"
            onClick={() => setTab('scholars')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all ${
              tab === 'scholars'
                ? 'glass-btn-primary'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{L.scholarsTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('departments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all ${
              tab === 'departments'
                ? 'glass-btn-primary'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{L.departmentsTab}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="neu-card p-4 sm:p-5 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        <div className="md:col-span-5 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={L.searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-4">
          <CustomSelect
            value={facultyId}
            onChange={(val) => setFacultyId(val)}
            options={facultyOptions}
            icon={Building2}
          />
        </div>

        <div className="md:col-span-3">
          {tab === 'scholars' ? (
            <CustomSelect
              value={scholarSort}
              onChange={(val) => setScholarSort(val)}
              options={[
                { value: 'score', label: L.sortScore },
                { value: 'hindex', label: L.sortHIndex },
                { value: 'citations', label: L.sortCitations },
                { value: 'pubs', label: L.sortPubs },
              ]}
              icon={ArrowUpDown}
            />
          ) : (
            <CustomSelect
              value={deptSort}
              onChange={(val) => setDeptSort(val)}
              options={[
                { value: 'total', label: L.sortTotalScore },
                { value: 'avg', label: L.sortAvgScore },
              ]}
              icon={ArrowUpDown}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">{L.loading}</div>
      ) : tab === 'scholars' ? (
        filteredScholars.length === 0 ? (
          <div className="neu-card p-14 rounded-3xl text-center text-slate-500">{L.empty}</div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Scholars Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {top3Scholars.map((s, idx) => {
                const pureName = getPureFullName(s.fullName);
                const degreeRing =
                  s.academicDegree === 'DSC'
                    ? 'ring-[3px] ring-amber-400'
                    : s.academicDegree === 'PHD'
                    ? 'ring-[3px] ring-blue-500'
                    : 'ring-2 ring-white/90';

                return (
                  <Link
                    key={s.id}
                    href={`/scholars/${s.id}`}
                    className="group neu-card p-5 rounded-3xl hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ScholarAvatar
                          photoUrl={s.photoUrl}
                          fullName={pureName}
                          index={idx}
                          className={`w-12 h-12 shrink-0 ${degreeRing}`}
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-[#0F294A] dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 truncate transition-colors">
                            {pureName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {getLocalizedName(s.department)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono text-xs font-extrabold shrink-0 ${PODIUM_BADGES[idx]}`}
                      >
                        <Medal className="w-3.5 h-3.5" /> #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          {L.colScore}
                        </div>
                        <div className="font-mono text-lg font-extrabold text-[#0F294A] dark:text-sky-400 tabular-nums">
                          {s.tiuScore}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          {L.colHIndex}
                        </div>
                        <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {s.hIndex}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          {L.colPubs}
                        </div>
                        <div className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {s.approvedPubsCount}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Full Scholars Table */}
            <div className="neu-card rounded-3xl overflow-hidden">
              <div className="w-full max-h-[64vh] overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-[#EDF1F7]/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_1px_0_rgba(148,163,184,0.28)]">
                    <tr className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-4 pl-6 pr-3 w-14">{L.colRank}</th>
                      <th className="py-4 px-4">{L.colScholar}</th>
                      <th className="py-4 px-4">{L.colDept}</th>
                      <th className="py-4 px-4 text-center">{L.colHIndex}</th>
                      <th className="py-4 px-4 text-center">{L.colPubs}</th>
                      <th className="py-4 px-4 text-center">{L.colScopus}</th>
                      <th className="py-4 px-4 text-center">{L.colCitations}</th>
                      <th className="py-4 pl-4 pr-6 text-right">{L.colScore}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-sm">
                    {filteredScholars.map((s, idx) => {
                      const pureName = getPureFullName(s.fullName);
                      const parts = pureName.split(/\s+/);
                      const firstName = parts[0] || '';
                      const lastName = parts.slice(1).join(' ');
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3.5 pl-6 pr-3 font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                            {idx < 3 ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${PODIUM_BADGES[idx]}`}
                              >
                                #{idx + 1}
                              </span>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/scholars/${s.id}`}
                              className="inline-flex items-center gap-2.5 group"
                            >
                              <ScholarAvatar
                                photoUrl={s.photoUrl}
                                fullName={pureName}
                                index={idx}
                                className="w-8 h-8 text-[11px] shrink-0"
                              />
                              <span className="group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                  {firstName}
                                </span>
                                {lastName && (
                                  <>
                                    {' '}
                                    <span className="font-bold text-[#0F294A] dark:text-white">
                                      {lastName}
                                    </span>
                                  </>
                                )}
                              </span>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {getLocalizedName(s.department)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                            {s.hIndex}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                            {s.approvedPubsCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {s.scopusWosCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                            {s.totalCitations}
                          </td>
                          <td className="py-3.5 pl-4 pr-6 text-right font-mono font-extrabold text-[#0F294A] dark:text-sky-400 tabular-nums text-base">
                            {s.tiuScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : filteredDepartments.length === 0 ? (
        <div className="neu-card p-14 rounded-3xl text-center text-slate-500">{L.empty}</div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Departments Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {top3Depts.map((d, idx) => (
              <Link
                key={d.id}
                href={`/scholars?departmentId=${d.id}`}
                className="group neu-card p-5 rounded-3xl hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-[#0F294A] dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 line-clamp-2 transition-colors">
                      {getLocalizedName(d)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {getLocalizedName(d.faculty)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono text-xs font-extrabold shrink-0 ${PODIUM_BADGES[idx]}`}
                  >
                    <Medal className="w-3.5 h-3.5" /> #{idx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">
                      {L.colTotalScore}
                    </div>
                    <div className="font-mono text-lg font-extrabold text-[#0F294A] dark:text-sky-400 tabular-nums">
                      {d.totalTiuScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">
                      {L.colActiveScholars}
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {d.scholarsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">
                      {L.colPubs}
                    </div>
                    <div className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {d.approvedPubsCount}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Full Departments Table */}
          <div className="neu-card rounded-3xl overflow-hidden">
            <div className="w-full max-h-[64vh] overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-[#EDF1F7]/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_1px_0_rgba(148,163,184,0.28)]">
                  <tr className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 pl-6 pr-3 w-14">{L.colRank}</th>
                    <th className="py-4 px-4">{L.colDept}</th>
                    <th className="py-4 px-4">{L.colFaculty}</th>
                    <th className="py-4 px-4 text-center">{L.colActiveScholars}</th>
                    <th className="py-4 px-4 text-center">{L.colPubs}</th>
                    <th className="py-4 px-4 text-center">{L.colScopus}</th>
                    <th className="py-4 px-4 text-center">{L.colAvgScore}</th>
                    <th className="py-4 pl-4 pr-6 text-right">{L.colTotalScore}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-sm">
                  {filteredDepartments.map((d, idx) => (
                    <tr
                      key={d.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 pl-6 pr-3 font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {idx < 3 ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${PODIUM_BADGES[idx]}`}
                          >
                            #{idx + 1}
                          </span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/scholars?departmentId=${d.id}`}
                          className="font-bold text-[#0F294A] dark:text-white hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                        >
                          {getLocalizedName(d)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {getLocalizedName(d.faculty)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {d.scholarsCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {d.approvedPubsCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {d.scopusCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                        {d.avgTiuScore}
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right font-mono font-extrabold text-indigo-700 dark:text-indigo-400 tabular-nums text-base">
                        {d.totalTiuScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Yuklanmoqda...</div>}>
      <RankingsContent />
    </Suspense>
  );
}
