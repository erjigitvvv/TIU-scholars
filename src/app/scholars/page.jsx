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
  Briefcase,
  FileText,
  Download,
  Upload,
  Plus,
  CheckCircle,
  Sparkles,
  AlertCircle,
  FileCheck,
  DollarSign,
  Calendar,
  BookOpen,
  ExternalLink,
  FileUp,
  Clock,
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

  // Grantlar va Modal holatlari
  const initSection = searchParams.get('tab') === 'grants' ? 'GRANTS' : 'SCHOLARS';
  const [activeSection, setActiveSection] = useState(initSection);
  const [grants, setGrants] = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [grantSearch, setGrantSearch] = useState('');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantModalPage, setGrantModalPage] = useState(1); // 1: Description, 2: Sample/Guidelines
  const [grantTitle, setGrantTitle] = useState('');
  const [grantComment, setGrantComment] = useState('');
  const [grantFundingSource, setGrantFundingSource] = useState('O‘zbekiston Respublikasi Innovatsion rivojlanish agentligi');
  const [grantBudget, setGrantBudget] = useState('');
  const [grantProgram, setGrantProgram] = useState('Amaliy tadqiqotlar loyihalari');
  const [grantFileUrl, setGrantFileUrl] = useState('');
  const [grantFileName, setGrantFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingGrant, setSubmittingGrant] = useState(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');
  const [grantErrorMsg, setGrantErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Til o'zgarishini kuzatish
  useEffect(() => {
    const updateLocale = () => setLocale(getCookieLocale());
    updateLocale();
    const interval = setInterval(updateLocale, 400);
    return () => clearInterval(interval);
  }, []);

  // Joriy foydalanuvchini va grantlarni yuklash
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      })
      .catch(() => {});

    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      setLoadingGrants(true);
      const res = await fetch('/api/grants');
      const data = await res.json();
      if (data.success && data.grants) {
        setGrants(data.grants);
      }
    } catch (err) {
      console.error('Fetch grants error:', err);
    } finally {
      setLoadingGrants(false);
    }
  };

  const uploadGrantFile = async (file) => {
    if (!file) return;
    const name = (file.name || '').toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc') && !name.endsWith('.pdf')) {
      setGrantErrorMsg('Faqat .docx, .doc yoki .pdf formatidagi fayllar qabul qilinadi');
      return;
    }
    try {
      setUploadingFile(true);
      setGrantErrorMsg('');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/dashboard/grants/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setGrantFileUrl(data.url);
        setGrantFileName(data.originalName || file.name);
      } else {
        setGrantErrorMsg(data.error || 'Faylni yuklashda xatolik yuz berdi');
      }
    } catch {
      setGrantErrorMsg('Faylni serverga yuklashda xatolik yuz berdi');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      await uploadGrantFile(files[0]);
    }
  };

  const handleSubmitGrant = async (e) => {
    e.preventDefault();
    if (!grantTitle.trim()) {
      setGrantErrorMsg('Loyiha mavzusi yoki sarlavhasini kiritish shart');
      return;
    }
    if (!currentUser) {
      setGrantErrorMsg('Grant arizasini yuborish uchun avval tizimga ilmiy xodim sifatida kiring');
      return;
    }
    if (!currentUser.profile) {
      setGrantErrorMsg('Faqat ilmiy xodim yoki olim profiliga ega foydalanuvchilar grant arizasi topshira oladi');
      return;
    }

    try {
      setSubmittingGrant(true);
      setGrantErrorMsg('');
      const res = await fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: grantTitle,
          comment: grantComment,
          description: grantComment,
          fundingSource: grantFundingSource || 'O‘zbekiston Respublikasi Innovatsion rivojlanish agentligi',
          grantProgram: grantProgram || 'Amaliy tadqiqotlar loyihalari',
          budgetRequested: parseFloat(grantBudget) || 0,
          applicationFileUrl: grantFileUrl || null,
          applicationFileName: grantFileName || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGrantSuccessMsg(data.message || 'Arizangiz muvaffaqiyatli qabul qilindi va moderator paneliga tasdiq uchun yuborildi! 🎉');
        setTimeout(() => {
          setIsGrantModalOpen(false);
          setGrantSuccessMsg('');
          setGrantTitle('');
          setGrantComment('');
          setGrantBudget('');
          setGrantFileUrl('');
          setGrantFileName('');
          fetchGrants();
        }, 2500);
      } else {
        setGrantErrorMsg(data.error || 'Arizani yuborishda xatolik yuz berdi');
      }
    } catch {
      setGrantErrorMsg('Server bilan aloqada xatolik');
    } finally {
      setSubmittingGrant(false);
    }
  };

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

  const filteredGrants = useMemo(() => {
    if (!grantSearch.trim()) return grants;
    const lower = grantSearch.toLowerCase();
    return grants.filter(
      (g) =>
        g.title?.toLowerCase().includes(lower) ||
        g.scholar?.fullName?.toLowerCase().includes(lower) ||
        g.fundingSource?.toLowerCase().includes(lower) ||
        g.grantCode?.toLowerCase().includes(lower)
    );
  }, [grants, grantSearch]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 space-y-8">
      {/* Sahifa sarlavhasi va Tab almashtirgich (Olimlar / Ketayotgan grantlar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
            {activeSection === 'SCHOLARS' ? t.title : 'Ketayotgan Ilmiy Grantlar'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
            {activeSection === 'SCHOLARS'
              ? t.subtitle
              : 'Universitet olimlari ishtirokidagi davlat, fundamental, amaliy va xalqaro tadqiqot grantlari.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveSection('SCHOLARS')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'SCHOLARS'
                  ? 'bg-white dark:bg-slate-900 text-[#0F294A] dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Barcha Olimlar ({scholars.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('GRANTS')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'GRANTS'
                  ? 'bg-white dark:bg-slate-900 text-[#0F294A] dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span>Ketayotgan Grantlar ({grants.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setGrantModalPage(1);
              setGrantErrorMsg('');
              setIsGrantModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Grant Qo‘shish</span>
          </button>
        </div>
      </div>

      {activeSection === 'SCHOLARS' && (
        <>

      {/* Qidiruv va Filtrlar Paneli */}
      <div className="neu-card p-4 sm:p-6 rounded-3xl space-y-5">
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
        <div className="neu-card py-16 px-6 rounded-3xl text-center space-y-4">
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-btn text-[#0F294A] dark:text-white text-xs font-semibold hover:text-blue-600 cursor-pointer"
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
                  className="group h-full neu-card p-6 rounded-3xl hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950 focus-visible:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between gap-5"
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
        <div className="neu-card rounded-3xl overflow-hidden">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-btn text-xs font-bold text-[#0F294A] dark:text-white hover:text-blue-600 dark:hover:text-sky-300 cursor-pointer"
            >
              <span>
                {t.loadMore || 'Yana yuklash'} (+{Math.min(PAGE_SIZE, remainingCount)})
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      </>
      )}

      {/* ========================================================================= */}
      {/* 2. KETAYOTGAN VA TASDIQLANGAN GRANTLAR SECTION */}
      {/* ========================================================================= */}
      {activeSection === 'GRANTS' && (
        <div className="space-y-6">
          {/* Grant Banner & Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F294A] via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 transform skew-x-12 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TIU Research Grants & Innovation Engine</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ketayotgan va Tasdiqlangan Ilmiy Grantlar
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Toshkent Xalqaro Universiteti olimlari yetakchiligida amalga oshirilayotgan davlat amaliy dasturlari, fundamental tadqiqotlar hamda xalqaro fondlar grantlari monitoringi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
                <a
                  href="/api/dashboard/grants/template"
                  download="TIU_Grant_Ariza_Shabloni_va_Korsatmalari.doc"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>📄 .docx Shablon</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setGrantModalPage(1);
                    setGrantErrorMsg('');
                    setIsGrantModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Yangi Grant Qo‘shish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Qidiruv input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Grant mavzusi, ilmiy rahbar yoki moliyalashtiruvchi fond nomi bo‘yicha qidirish..."
              value={grantSearch}
              onChange={(e) => setGrantSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm outline-none text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all shadow-xs"
            />
            {grantSearch && (
              <button
                type="button"
                onClick={() => setGrantSearch('')}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grantlar ro'yxati */}
          {loadingGrants ? (
            <div className="space-y-4 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : filteredGrants.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-base text-slate-700 dark:text-slate-300">
                Grant loyihalari topilmadi
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hozircha tanlangan qidiruv bo‘yicha grant loyihasi mavjud emas. Yangi ilmiy grant arizasini topshirishingiz mumkin.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGrantModalPage(1);
                  setGrantErrorMsg('');
                  setIsGrantModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Grant Arizasi Yuborish</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredGrants.map((g) => {
                let proposalObj = {};
                try {
                  proposalObj = g.proposalData ? JSON.parse(g.proposalData) : {};
                } catch {}

                const isApproved =
                  g.status === 'APPROVED' || g.status === 'WON' || g.status === 'APPROVED_BY_MODERATOR';
                const isPending = g.status === 'PENDING' || g.status === 'SUBMITTED_INTERNAL';

                return (
                  <div
                    key={g.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60">
                          {g.grantCode || `TIU-GRT-${g.startYear}`}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isApproved
                            ? 'Faol / Tasdiqlangan 🏆'
                            : isPending
                            ? 'Moderatsiya jarayonida ⏳'
                            : g.status}
                        </span>
                      </div>

                      {/* Mavzu */}
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {g.title}
                      </h3>

                      {/* Ilmiy rahbar ma'lumotlari */}
                      {g.scholar && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <ScholarAvatar
                            name={g.scholar.fullName}
                            avatarUrl={g.scholar.photoUrl}
                            size={40}
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/scholars/${g.scholar.id}`}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 transition truncate block"
                            >
                              {g.scholar.fullName}
                            </Link>
                            <div className="text-[11px] text-slate-400 truncate">
                              {g.scholar.academicDegree || 'Olim'} • {g.scholar.department?.nameUz || 'Kafedra'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metrikalar */}
                      <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                        <div className="flex items-center justify-between">
                          <span>Fond / Dastur:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[210px]">
                            {g.fundingSource}
                          </strong>
                        </div>
                        {g.budgetRequested && (
                          <div className="flex items-center justify-between">
                            <span>Ajratilgan / So‘ralgan:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {g.budgetRequested.toLocaleString()} so‘m
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Muddati:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                            {g.startYear} – {g.endYear || g.startYear + 2}
                          </span>
                        </div>
                      </div>

                      {/* Izoh / Annotatsiya */}
                      {(proposalObj.comment || proposalObj.urgency) && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                          "{proposalObj.comment || proposalObj.urgency}"
                        </p>
                      )}
                    </div>

                    {/* Biriktirilgan fayl havolasi */}
                    {g.applicationFileUrl && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={g.applicationFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200/60 hover:bg-blue-100 transition w-full justify-center"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[240px]">
                            {g.applicationFileName || 'Loyiha Hujjati (.docx / .pdf)'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. YANGI GRANT QO'SHISH: 2 TA PAGELI MODAL & DROP ARIZA BLOKI */}
      {/* ========================================================================= */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8 space-y-5 text-xs animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Ilmiy Grant Loyihasi Arizasi & Yo‘riqnoma
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    TIU tadqiqot portali orqali rasmiy ariza topshirish va ko‘rsatmalar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Xabar bildirishnomalari */}
            {grantSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{grantSuccessMsg}</span>
              </div>
            )}
            {grantErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{grantErrorMsg}</span>
              </div>
            )}

            {/* 2 TA PAGELI MODAL TUGMALARI (TAVSIF & NAMUNA FAYLI) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setGrantModalPage(1)}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  grantModalPage === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Panel: Tavsif & Tushuncha</span>
              </button>

              <button
                type="button"
                onClick={() => setGrantModalPage(2)}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  grantModalPage === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2-Panel: Namuna & Ko‘rsatma</span>
              </button>
            </div>

            {/* 1-PANEL: TO'LIQ TUSHUNCHA VA YO'RIQNOMA */}
            {grantModalPage === 1 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Grant Loyihasi Shartlari & Baholash Mezonlari</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 text-[11px]">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      🎯 Tanlov Maqsadi:
                    </strong>
                    <p className="text-slate-500">
                      Universitetning ilmiy salohiyatini oshirish, davlat va xalqaro jamg‘armalar hisobidan ilmiy natijalarni moliyalashtirish.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      👥 Kimlar topshira oladi:
                    </strong>
                    <p className="text-slate-500">
                      Barcha TIU professor-o‘qituvchilari, doktorantlar, katta ilmiy xodimlar va mustaqil izlanuvchilar (yakka yoki jamoa sifatida).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      ⚖️ Baholash Mezonlari:
                    </strong>
                    <p className="text-slate-500">
                      Ilmiy yangilik, sohadagi dolzarblik, amaliy samaradorlik, rejalashtirilgan Scopus/OAK nashrlar va byudjet asoslanganligi.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      🛡️ Moderatsiya va Tasdiq:
                    </strong>
                    <p className="text-slate-500">
                      Yuborilgan har bir ariza Universitet Ilmiy Bo‘limi moderatori paneliga tushadi va ko‘rib chiqilib rasmiy tasdiqlanadi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2-PANEL: NAMUNA & KO'RSATMA FAYLI */}
            {grantModalPage === 2 && (
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Rasmiy Ariza Ko‘rsatmalari va Shablon</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      8 ta rasmiy bo‘limga ega tayyor ko‘rsatmali .docx hujjat
                    </p>
                  </div>

                  <a
                    href="/api/dashboard/grants/template"
                    download="TIU_Grant_Ariza_Shabloni_va_Korsatmalari.doc"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>.docx Shablonni Yuklab Olish</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Shablon tarkibidagi 8 ta asosiy bo‘lim:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                    <div>1. Loyiha dolzarbligi va muammo</div>
                    <div>2. Maqsad va vazifalar</div>
                    <div>3. Ilmiy yangilik va kutilayotgan natijalar</div>
                    <div>4. Metodologiya va tadqiqot dizayni</div>
                    <div>5. Kalendar ish rejasi (Gantt jadvali)</div>
                    <div>6. Xarajatlar smetasi va asosnomasi</div>
                    <div>7. Ilmiy ijrochi jamoa ma’lumotlari</div>
                    <div>8. Kutilayotgan amaliy samara va xavflar</div>
                  </div>
                </div>
              </div>
            )}

            {/* PASTKI ARIZA TOPHIRISH BLOKI: SARLAVHA, IZOH, DROP FILE VA YUBORISH */}
            <form onSubmit={handleSubmitGrant} className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Grant Loyihasi Mavzusi / Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Raqamli iqtisodiyotda sun’iy intellekt texnologiyalarini qo‘llash..."
                  value={grantTitle}
                  onChange={(e) => setGrantTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Moliyalashtiruvchi Fond / Dastur
                  </label>
                  <input
                    type="text"
                    value={grantFundingSource}
                    onChange={(e) => setGrantFundingSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    So‘ralayotgan Byudjet (so‘mda)
                  </label>
                  <input
                    type="number"
                    placeholder="Masalan: 850000000"
                    value={grantBudget}
                    onChange={(e) => setGrantBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Loyiha Izohi va Qisqacha Annotatsiyasi *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Loyiha maqsadi, muammo yechimi va kutilayotgan ilmiy natijalar haqida qisqacha izoh..."
                  value={grantComment}
                  onChange={(e) => setGrantComment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* DRAG & DROP ARIZA FAYLI MAYDONI */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Ariza Hujjatini Biriktirish (.docx yoki .pdf faylni tashlang):
                </label>

                {grantFileUrl ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 truncate block">
                          {grantFileName || 'Ariza hujjati'}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          Fayl serverga yuklandi va arizaga biriktirildi ✅
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={grantFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                      >
                        Ko‘rish
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setGrantFileUrl('');
                          setGrantFileName('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-[11px] hover:bg-rose-200 cursor-pointer"
                      >
                        O‘chirish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="grantPublicFileInput"
                      accept=".docx,.doc,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadGrantFile(f);
                      }}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                    <label
                      htmlFor="grantPublicFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                    >
                      <FileUp className="w-7 h-7 text-blue-500" />
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {uploadingFile
                          ? 'Fayl serverga yuklanmoqda...'
                          : 'Ariza faylini bu yerga tashlang (Drop) yoki faylni tanlang'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Qabul qilinadi: Microsoft Word (.docx, .doc) yoki PDF • Maksimal hajm: 25 MB
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Moderator ko‘rib chiqqach, tasdiqlanib e’lon qilinadi
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGrantModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Bekor qilish
                  </button>

                  {currentUser?.profile ? (
                    <button
                      type="submit"
                      disabled={submittingGrant || uploadingFile}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{submittingGrant ? 'Yuborilmoqda...' : 'Arizani Moderatorga Yuborish 🚀'}</span>
                    </button>
                  ) : (
                    <Link
                      href="/login?redirect=/scholars?tab=grants"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Kirish va Yuborish 🔑</span>
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
