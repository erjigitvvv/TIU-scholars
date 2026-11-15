'use client';

import { useState, useEffect, useMemo, startTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Building2,
  Layers,
  GraduationCap,
  Award,
  ArrowUpDown,
  X,
  RotateCcw,
  ArrowRight,
  Eye,
  LayoutGrid,
  List,
  SlidersHorizontal,
  UserX,
  ChevronDown,
} from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import { INTEREST_TRANSLATIONS } from '@/lib/interests';
import CustomSelect from '@/components/ui/CustomSelect';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const PAGE_SIZE = 12;

const DEGREE_RING_STYLES = {
  DSC: 'ring-[3px] ring-amber-400 dark:ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-[0_0_14px_rgba(245,158,11,0.28)]',
  PHD: 'ring-[3px] ring-blue-500 dark:ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-[0_0_14px_rgba(59,130,246,0.24)]',
  NONE: 'ring-2 ring-slate-300 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
};

const AVATAR_CORNER_DEGREE_STYLES = {
  DSC: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-white dark:border-slate-900',
  PHD: 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-white dark:border-slate-900',
};

// Kattaroq, rangli daraja badge: DSc oltin, PhD ko'k
const DEGREE_BADGE_STYLES = {
  DSC: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400/60 shadow-2xs',
  PHD: 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-blue-500/60 shadow-2xs',
};

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

function parseResearchTags(raw, locale = 'uz') {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    return arr.filter(Boolean).map((tag) => INTEREST_TRANSLATIONS[tag]?.[locale] || tag);
  } catch {
    return [];
  }
}

export default function ScholarsDirectoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [locale, setLocale] = useState('uz');
  const [scholars, setScholars] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL parametrlaridan boshlang'ich qiymatlarni olish
  const initQ = searchParams.get('q') || '';
  const initFaculty = searchParams.get('faculty') || searchParams.get('facultyId') || '';
  const initDept = searchParams.get('dept') || searchParams.get('departmentId') || '';
  const initDegree = (
    searchParams.get('degree') ||
    searchParams.get('academicDegree') ||
    'all'
  ).toLowerCase();
  const initTitle = (
    searchParams.get('title') ||
    searchParams.get('academicTitle') ||
    'all'
  ).toLowerCase();
  const initSort = searchParams.get('sort') || searchParams.get('sortBy') || 'score';
  const initView = searchParams.get('view') === 'list' ? 'list' : 'grid';

  const [searchInput, setSearchInput] = useState(initQ);
  const [q, setQ] = useState(initQ);
  const [facultyId, setFacultyId] = useState(initFaculty);
  const [departmentId, setDepartmentId] = useState(initDept);
  const [degree, setDegree] = useState(initDegree);
  const [title, setTitle] = useState(initTitle);
  const [sort, setSort] = useState(initSort);
  const [viewMode, setViewMode] = useState(initView);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Til o'zgarishini kuzatish
  useEffect(() => {
    const updateLocale = () => setLocale(getCookieLocale());
    updateLocale();
    const interval = setInterval(updateLocale, 400);
    return () => clearInterval(interval);
  }, []);

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const t = dict.scholars;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz || item.nameEn;
    if (locale === 'en') return item.nameEn || item.nameUz || item.nameRu;
    return item.nameUz || item.nameEn || item.nameRu;
  };

  // URL searchParams tashqaridan (masalan, Navbar submenyusi yoki Orqaga tugmasi orqali) o'zgarganda state-ni yangilash
  useEffect(() => {
    const nextQ = searchParams.get('q') || '';
    const nextFac = searchParams.get('faculty') || searchParams.get('facultyId') || '';
    const nextDept = searchParams.get('dept') || searchParams.get('departmentId') || '';
    const nextDeg = (
      searchParams.get('degree') ||
      searchParams.get('academicDegree') ||
      'all'
    ).toLowerCase();
    const nextTit = (
      searchParams.get('title') ||
      searchParams.get('academicTitle') ||
      'all'
    ).toLowerCase();
    const nextSort = searchParams.get('sort') || searchParams.get('sortBy') || 'score';
    const nextView = searchParams.get('view') === 'list' ? 'list' : 'grid';

    setSearchInput(nextQ);
    setQ(nextQ);
    setFacultyId(nextFac);
    setDepartmentId(nextDept);
    setDegree(nextDeg);
    setTitle(nextTit);
    setSort(nextSort === 'tiuScore' ? 'score' : nextSort === 'publications' ? 'pubs' : nextSort);
    setViewMode(nextView);
  }, [searchParams]);

  // Qidiruv uchun 300ms Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filtrlar o'zgarganda visibleCount-ni 12 ga qaytarish
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, facultyId, departmentId, degree, title, sort]);

  // Agar URL da faqat departmentId berilgan bo'lsa, uning fakultetini avtomatik topib qo'yish
  useEffect(() => {
    if (departmentId && !facultyId && faculties.length > 0) {
      const parentFac = faculties.find((f) =>
        (f.departments || []).some((d) => d.id === departmentId)
      );
      if (parentFac) {
        setFacultyId(parentFac.id);
      }
    }
  }, [departmentId, facultyId, faculties]);

  // Hamma filtrlarni URL parametrlariga yozish (?degree=phd&sort=score) va API dan ma'lumot olish
  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set('q', q);
    if (facultyId) urlParams.set('faculty', facultyId);
    if (departmentId) urlParams.set('dept', departmentId);
    if (degree && degree !== 'all') urlParams.set('degree', degree);
    if (title && title !== 'all') urlParams.set('title', title);
    if (sort && sort !== 'score') urlParams.set('sort', sort);
    if (viewMode === 'list') urlParams.set('view', 'list');

    const queryStr = urlParams.toString();
    const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    router.replace(targetUrl, { scroll: false });

    const controller = new AbortController();

    async function fetchScholars() {
      setLoading(true);
      try {
        const apiParams = new URLSearchParams();
        if (q) apiParams.set('q', q);
        if (facultyId) apiParams.set('faculty', facultyId);
        if (departmentId) apiParams.set('dept', departmentId);
        if (degree && degree !== 'all') apiParams.set('degree', degree.toUpperCase());
        if (title && title !== 'all') apiParams.set('title', title.toUpperCase());
        apiParams.set('sort', sort);

        const res = await fetch(`/api/scholars?${apiParams.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.scholars) {
          startTransition(() => {
            setScholars(data.scholars);
            if (data.faculties) setFaculties(data.faculties);
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          startTransition(() => {
            setLoading(false);
          });
        }
      }
    }

    fetchScholars();
    return () => controller.abort();
  }, [q, facultyId, departmentId, degree, title, sort, viewMode, pathname, router]);

  const selectedFaculty = faculties.find((f) => f.id === facultyId) || null;
  const selectedDepartment =
    selectedFaculty?.departments?.find((d) => d.id === departmentId) ||
    faculties.flatMap((f) => f.departments || []).find((d) => d.id === departmentId) ||
    null;

  // CustomSelect uchun variantlar ro'yxati
  const facultyOptions = [
    { value: '', label: t.filterFaculty },
    ...faculties.map((f) => ({
      value: f.id,
      label: getLocalizedName(f),
    })),
  ];

  const departmentOptions = [
    { value: '', label: t.filterDepartment },
    ...(selectedFaculty?.departments || []).map((d) => ({
      value: d.id,
      label: getLocalizedName(d),
    })),
  ];

  const degreeOptions = [
    { value: 'all', label: t.filterDegree },
    { value: 'dsc', label: t.degreeDsc },
    { value: 'phd', label: t.degreePhd },
  ];

  const titleOptions = [
    { value: 'all', label: t.filterTitle },
    { value: 'professor', label: t.titleProfessor },
    { value: 'docent', label: t.titleDocent },
    { value: 'assistant', label: t.titleAssistant },
  ];

  const sortOptions = [
    { value: 'score', label: t.sortScore },
    { value: 'hIndex', label: t.sortHIndex },
    { value: 'pubs', label: t.sortPubs },
    { value: 'name', label: t.sortName },
  ];

  const getLocalizedTitle = (rawTitle) => {
    if (rawTitle === 'PROFESSOR') return t.titleProfessor;
    if (rawTitle === 'DOCENT') return t.titleDocent;
    if (rawTitle === 'SENIOR_LECTURER') return t.titleSeniorLecturer;
    if (rawTitle === 'ASSISTANT') return t.titleAssistant;
    return t.titleResearcher;
  };

  // Faol filtrlar chiplari
  const activeChips = [];
  if (q) {
    activeChips.push({
      key: 'q',
      label: `"${q}"`,
      onRemove: () => {
        setSearchInput('');
        setQ('');
      },
    });
  }
  if (degree && degree !== 'all') {
    activeChips.push({
      key: 'degree',
      label: degree === 'dsc' ? 'DSc' : 'PhD',
      onRemove: () => setDegree('all'),
    });
  }
  if (title && title !== 'all') {
    const titleChipLabel =
      title === 'professor'
        ? t.titleProfessor
        : title === 'docent'
        ? t.titleDocent
        : t.titleAssistant;
    activeChips.push({
      key: 'title',
      label: titleChipLabel,
      onRemove: () => setTitle('all'),
    });
  }
  if (selectedFaculty) {
    activeChips.push({
      key: 'faculty',
      label: getLocalizedName(selectedFaculty),
      onRemove: () => {
        setFacultyId('');
        setDepartmentId('');
      },
    });
  }
  if (selectedDepartment) {
    activeChips.push({
      key: 'dept',
      label: getLocalizedName(selectedDepartment),
      onRemove: () => setDepartmentId(''),
    });
  }

  const hasActiveFilters = activeChips.length > 0;
  const mobileFilterCount =
    (facultyId ? 1 : 0) +
    (departmentId ? 1 : 0) +
    (degree && degree !== 'all' ? 1 : 0) +
    (title && title !== 'all' ? 1 : 0) +
    (sort && sort !== 'score' ? 1 : 0);

  const handleClearAll = () => {
    setSearchInput('');
    setQ('');
    setFacultyId('');
    setDepartmentId('');
    setDegree('all');
    setTitle('all');
    setSort('score');
  };

  const visibleScholars = scholars.slice(0, visibleCount);
  const remainingCount = Math.max(0, scholars.length - visibleCount);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 space-y-8">
      {/* Sahifa sarlavhasi (Navbar menyusi bilan to'qnashmasligi uchun yetarli tepa masofa berilgan) */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
          {t.subtitle}
        </p>
      </div>

      {/* Qidiruv va Filtrlar Paneli */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Qidiruv (doim ko'rinib turadi, 300ms debounce bilan) */}
          <div className="md:col-span-5 flex items-center gap-2.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setQ('');
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Telefonda "Filtrlar" tugmasi (pastdan ochiladigan panel) */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#0F294A] dark:text-white shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0F294A] dark:text-sky-400" />
              <span>{t.filtersButton || 'Filtrlar'}</span>
              {mobileFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0F294A] dark:bg-sky-500 text-white text-[10px] font-bold">
                  {mobileFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Fakultet CustomSelect (Planshet va Desktopda ko'rinadi) */}
          <div className="hidden md:block md:col-span-3">
            <CustomSelect
              value={facultyId}
              onChange={(val) => {
                setFacultyId(val);
                setDepartmentId('');
              }}
              options={facultyOptions}
              placeholder={t.filterFaculty}
              icon={Building2}
            />
          </div>

          {/* Kafedra CustomSelect (Planshet va Desktopda ko'rinadi) */}
          <div className="hidden md:block md:col-span-4">
            <CustomSelect
              value={departmentId}
              onChange={(val) => setDepartmentId(val)}
              options={departmentOptions}
              placeholder={t.filterDepartment}
              disabled={!selectedFaculty}
              disabledHint={t.selectFacultyFirst}
              icon={Layers}
            />
          </div>
        </div>

        {/* Ikkinchi qator: Ilmiy daraja, Ilmiy unvon va Saralash (Planshet va Desktopda) */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <CustomSelect
                value={degree}
                onChange={(val) => setDegree(val)}
                options={degreeOptions}
                placeholder={t.filterDegree}
                icon={GraduationCap}
              />
            </div>

            <div className="w-full sm:w-56">
              <CustomSelect
                value={title}
                onChange={(val) => setTitle(val)}
                options={titleOptions}
                placeholder={t.filterTitle}
                icon={Award}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
              {t.sortBy}:
            </span>
            <div className="w-full sm:w-56">
              <CustomSelect
                value={sort}
                onChange={(val) => setSort(val)}
                options={sortOptions}
                placeholder={t.sortScore}
                icon={ArrowUpDown}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Telefonda pastdan ochiladigan Filtrlar Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[120] md:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-1" />
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-[#0F294A] dark:text-white">
                  {t.filtersButton || 'Filtrlar'}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <CustomSelect
                  value={facultyId}
                  onChange={(val) => {
                    setFacultyId(val);
                    setDepartmentId('');
                  }}
                  options={facultyOptions}
                  placeholder={t.filterFaculty}
                  icon={Building2}
                />

                <CustomSelect
                  value={departmentId}
                  onChange={(val) => setDepartmentId(val)}
                  options={departmentOptions}
                  placeholder={t.filterDepartment}
                  disabled={!selectedFaculty}
                  disabledHint={t.selectFacultyFirst}
                  icon={Layers}
                />

                <CustomSelect
                  value={degree}
                  onChange={(val) => setDegree(val)}
                  options={degreeOptions}
                  placeholder={t.filterDegree}
                  icon={GraduationCap}
                />

                <CustomSelect
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={titleOptions}
                  placeholder={t.filterTitle}
                  icon={Award}
                />

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t.sortBy}
                  </span>
                  <CustomSelect
                    value={sort}
                    onChange={(val) => setSort(val)}
                    options={sortOptions}
                    placeholder={t.sortScore}
                    icon={ArrowUpDown}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleClearAll();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.clearFilters}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F294A] text-white text-xs font-semibold hover:bg-blue-900"
                >
                  {t.applyFilters || "Natijalarni ko'rish"} ({scholars.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Natijalar soni + Faol filtrlar chiplari + Tozalash + Ko'rinish almashtirish (Grid / Ro'yxat) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-bold text-[#0F294A] dark:text-white">
            {(t.foundCount || '{count} ta olim topildi').replace('{count}', scholars.length)}
          </span>

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-800 text-[#0F294A] dark:text-sky-300 border border-blue-200/80 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950/50 dark:hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{chip.label}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.clearFilters}</span>
            </button>
          )}
        </div>

        {/* Ko'rinish almashtirish: Grid va Ro'yxat (Jadval) */}
        <div
          role="group"
          aria-label="View mode"
          className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700"
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-[#0F294A] dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t.gridView || 'Kartalar'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-[#0F294A] dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t.listView || "Ro'yxat"}</span>
          </button>
        </div>
      </div>

      {/* Yuklanish holati (Skeleton): kartalar o'rniga kulrang shakllar, sahifa sakramasin */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, sIdx) => (
              <div
                key={`skel-card-${sIdx}`}
                className="h-[348px] bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/85 dark:border-slate-800 flex flex-col justify-between animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="w-16 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-14 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-3.5 w-5/6 rounded-md bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <div className="h-6 w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <div className="h-6 w-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-11 w-full rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-12 rounded-md bg-slate-200 dark:bg-slate-800" />
                    <div className="h-7 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 6 }).map((_, sIdx) => (
              <div
                key={`skel-row-${sIdx}`}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1 max-w-xs">
                    <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="hidden md:block h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="hidden lg:block h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )
      ) : scholars.length === 0 ? (
        /* Bo'sh holat: "Hech kim topilmadi" yozuvi va "Filtrlarni tozalash" tugmasi */
        <div className="bg-white dark:bg-slate-900 py-16 px-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <UserX className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-[#0F294A] dark:text-white">
              {t.emptyTitle || 'Hech kim topilmadi'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.noResults}</p>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F294A] dark:text-white text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearFilters}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* 3 ustun (desktop), 2 ustun (planshet), 1 ustun (telefon) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleScholars.map((scholar, idx) => {
            const pubsList = scholar.publications || [];
            const approvedPubsCount = pubsList.length;
            const scopusWosCount = pubsList.filter(
              (pa) => pa.publication?.type === 'SCOPUS' || pa.publication?.type === 'WOS'
            ).length;
            const hasVerifiedId = Boolean(scholar.orcidId || scholar.scopusId);
            const pureName = getPureFullName(scholar.fullName);
            const degreeLabel =
              scholar.academicDegree === 'DSC'
                ? 'DSc'
                : scholar.academicDegree === 'PHD'
                ? 'PhD'
                : '';
            const ringStyle =
              DEGREE_RING_STYLES[scholar.academicDegree] || DEGREE_RING_STYLES.NONE;
            const localizedDeptName = getLocalizedName(scholar.department);
            const allTags = parseResearchTags(scholar.researchInterests, locale);
            const tags = allTags.slice(0, 2);
            const extraTagsCount = Math.max(0, allTags.length - 2);
            const localizedFacultyName = getLocalizedName(scholar.department?.faculty);
            const localizedPosition =
              locale === 'ru'
                ? scholar.positionRu || scholar.positionUz || scholar.positionEn
                : locale === 'en'
                ? scholar.positionEn || scholar.positionUz || scholar.positionRu
                : scholar.positionUz || scholar.positionEn || scholar.positionRu;

            return (
              <div key={scholar.id} className="h-full">
                <Link
                  href={`/scholars/${scholar.id}`}
                  className="group h-full bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-xs hover:-translate-y-[2px] hover:shadow-xl hover:border-blue-300 dark:hover:border-sky-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950 focus-visible:-translate-y-[2px] focus-visible:shadow-xl transition-all duration-200 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    {/* 1. Rasm yoki rangli monogramma + TIU Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="relative inline-flex shrink-0">
                        <ScholarAvatar
                          photoUrl={scholar.photoUrl}
                          fullName={pureName}
                          index={idx}
                          className={`w-16 h-16 ${ringStyle} group-hover:scale-[1.03] transition-transform duration-200`}
                        />
                        {degreeLabel && (
                          <span
                            className={`absolute -bottom-1 -right-1 z-10 font-mono text-[10px] font-extrabold leading-none px-1.5 py-0.5 rounded-full border-2 shadow-xs tracking-tight ${
                              AVATAR_CORNER_DEGREE_STYLES[scholar.academicDegree] ||
                              'bg-slate-700 text-white border-white'
                            }`}
                          >
                            {degreeLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {scholar.universityRank && scholar.universityRank <= 3 && (
                          <span
                            className={`font-mono text-[11px] font-extrabold px-2 py-1 rounded-lg border ${
                              scholar.universityRank === 1
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                : scholar.universityRank === 2
                                ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                                : 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700'
                            }`}
                          >
                            #{scholar.universityRank}
                          </span>
                        )}
                        <div className="text-right bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="font-mono text-sm font-extrabold text-[#0F294A] dark:text-sky-300 tabular-nums">
                            {Math.round(scholar.tiuScore || 0)}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {dict.home.tiuScore}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. F.I.Sh. (unvonsiz), Kattaroq rangli Daraja badge (DSc oltin / PhD ko'k) + Unvon va 1 qatorga kesilgan Kafedra */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-sky-400 group-focus-visible:text-blue-600 dark:group-focus-visible:text-sky-400 transition-colors truncate">
                        {pureName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                          {getLocalizedTitle(scholar.academicTitle)}
                        </span>
                        {localizedPosition && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-sky-800/60 text-[11px] font-semibold truncate max-w-[160px]">
                            {localizedPosition}
                          </span>
                        )}
                        {hasVerifiedId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-semibold">
                            {scholar.orcidId ? "ORCID" : "Scopus"}
                          </span>
                        )}
                      </div>

                      {(localizedDeptName || localizedFacultyName) && (
                        <p
                          title={[localizedFacultyName, localizedDeptName].filter(Boolean).join(" ? ")}
                          className="text-xs text-slate-500 dark:text-slate-400 truncate pt-0.5"
                        >
                          {[localizedFacultyName, localizedDeptName].filter(Boolean).join(" ? ")}
                        </p>
                      )}
                    </div>

                    {/* 3. 1–2 ta teg (Research interest) */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/80 text-[11px] font-medium truncate max-w-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {extraTagsCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/70 text-[11px] font-mono font-semibold">
                            +{extraTagsCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4. 3 ustunli Metrikalar (Balanced + Impact) va Yengil tugma */}
                  <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl text-center">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {dict.home.hIndex}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {scholar.hIndex}
                        </div>
                      </div>
                      <div className="border-l border-slate-200/80 dark:border-slate-700">
                        <div className="text-[11px] text-slate-400 font-medium">
                          {dict.home.publicationsCount}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {approvedPubsCount}
                        </div>
                      </div>
                      <div className="border-l border-slate-200/80 dark:border-slate-700">
                        <div className="text-[11px] text-slate-400 font-medium">
                          {locale === 'ru' ? '??????' : locale === 'en' ? 'Citations' : 'Iqtibos'}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {scholar.totalCitations ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="font-mono inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {scopusWosCount > 0
                          ? `Scopus/WoS: ${scopusWosCount}`
                          : scholar.latestPubYear
                          ? `${locale === 'ru' ? '????. ????.' : locale === 'en' ? 'Latest' : 'Oxirgi'}: ${scholar.latestPubYear}`
                          : locale === 'ru'
                          ? '???????'
                          : locale === 'en'
                          ? 'Active'
                          : 'Faol'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:border-sky-400 dark:group-hover:text-sky-300 group-hover:bg-blue-50/50 dark:group-hover:bg-sky-950/30 transition-all">
                        <span>{t.viewProfile}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Ro'yxat (Jadval) ko'rinishi — 50+ olim bo'lganda tez ko'rib chiqish uchun qulay */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 pl-6 pr-3 w-12">#</th>
                  <th className="py-3.5 px-4">{t.tableScholar || "Olim va yo'nalishlar"}</th>
                  <th className="py-3.5 px-4">{t.tableDegreeTitle || 'Daraja va unvon'}</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">
                    {t.tableDepartment || 'Kafedra'}
                  </th>
                  <th className="py-3.5 px-4 text-center">{dict.home.tiuScore}</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">
                    {dict.home.hIndex} / {dict.home.publicationsCount}
                  </th>
                  <th className="py-3.5 pl-4 pr-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {visibleScholars.map((scholar, idx) => {
                  const approvedPubsCount = (scholar.publications || []).length;
                  const pureName = getPureFullName(scholar.fullName);
                  const degreeLabel =
                    scholar.academicDegree === 'DSC'
                      ? 'DSc'
                      : scholar.academicDegree === 'PHD'
                      ? 'PhD'
                      : '';
                  const ringStyle =
                    DEGREE_RING_STYLES[scholar.academicDegree] || DEGREE_RING_STYLES.NONE;
                  const badgeStyle =
                    DEGREE_BADGE_STYLES[scholar.academicDegree] ||
                    'bg-slate-200 text-slate-800 border-slate-300';
                  const localizedDeptName = getLocalizedName(scholar.department);
                  const tags = parseResearchTags(scholar.researchInterests, locale).slice(0, 2);

                  return (
                    <tr
                      key={scholar.id}
                      tabIndex={0}
                      onClick={() => router.push(`/scholars/${scholar.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/scholars/${scholar.id}`);
                        }
                      }}
                      className="group hover:bg-blue-50/40 dark:hover:bg-slate-800/60 focus-visible:outline-none focus-visible:bg-blue-50/60 dark:focus-visible:bg-slate-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 transition-colors cursor-pointer"
                    >
                      <td className="py-4 pl-6 pr-3 font-mono text-xs text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <ScholarAvatar
                            photoUrl={scholar.photoUrl}
                            fullName={pureName}
                            index={idx}
                            className={`w-11 h-11 ${ringStyle}`}
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 group-focus-visible:text-blue-600 transition-colors truncate">
                              {pureName}
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {degreeLabel && (
                            <span
                              className={`font-mono px-2.5 py-0.5 text-xs font-extrabold rounded-lg border ${badgeStyle}`}
                            >
                              {degreeLabel}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {getLocalizedTitle(scholar.academicTitle)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell max-w-[240px]">
                        <p
                          title={localizedDeptName}
                          className="text-xs text-slate-600 dark:text-slate-400 truncate"
                        >
                          {localizedDeptName}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex font-mono text-sm font-extrabold text-[#0F294A] dark:text-sky-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700 tabular-nums">
                          {Math.round(scholar.tiuScore || 0)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center hidden sm:table-cell font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                        H:{scholar.hIndex} • {approvedPubsCount}
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right">
                        <Link
                          href={`/scholars/${scholar.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:border-sky-400 dark:group-hover:text-sky-300 transition-all whitespace-nowrap"
                        >
                          <span>{t.viewProfile}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination va "Yana yuklash" (12 ta kartadan keyin) */}
      {!loading && scholars.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/70 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {(t.showingCount || "{shown} / {total} ta olim ko'rsatilmoqda")
              .replace('{shown}', visibleScholars.length)
              .replace('{total}', scholars.length)}
          </span>

          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#0F294A] dark:text-white hover:border-blue-500 hover:text-blue-600 dark:hover:border-sky-400 dark:hover:text-sky-300 shadow-2xs transition-all cursor-pointer"
            >
              <span>
                {t.loadMore || 'Yana yuklash'} (+{Math.min(PAGE_SIZE, remainingCount)})
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
