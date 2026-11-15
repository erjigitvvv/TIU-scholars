'use client';

import { Suspense, useState, useEffect, useMemo, startTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ExternalLink,
  FileText,
  UserCheck,
  Filter,
  Building2,
  Layers,
  X,
  Calendar,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';
import CustomSelect from '@/components/ui/CustomSelect';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : 'uz';
}

function cleanTitle(rawTitle = '') {
  return rawTitle
    .replace(
      /^(OAK Journal|OAK|Web of Science|Scopus\s*Q[1-4]|Scopus|Patent|Monograph|Textbook|Local Journal|International Journal|Conference)\s*:\s*/i,
      ''
    )
    .trim();
}

// Faqat F.I.Sh. (unvonsiz)
function getPureFullName(rawName = '') {
  return rawName
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

// kun.oy (DD.MM) qisqa formati
function formatShortDayMonth(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

function PublicationsDirectoryContent() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('uz');
  const [publications, setPublications] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    const updateLocale = () => setLocale(getCookieLocale());
    updateLocale();
    const interval = setInterval(updateLocale, 400);
    return () => clearInterval(interval);
  }, []);

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const tp = dict.publications;
  const ts = dict.scholars;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz || item.nameEn;
    if (locale === 'en') return item.nameEn || item.nameUz || item.nameRu;
    return item.nameUz || item.nameEn || item.nameRu;
  };

  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlFaculty = searchParams.get('facultyId');
    const urlDept = searchParams.get('departmentId');
    const urlYear = searchParams.get('year');
    setType(urlType || 'ALL');
    setFacultyId(urlFaculty || '');
    setDepartmentId(urlDept || '');
    setYear(urlYear || 'ALL');
  }, [searchParams]);

  // 300ms Debounce qidiruv uchun
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function fetchPubs() {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (type !== 'ALL') params.set('type', type);
        if (year !== 'ALL') params.set('year', year);
        if (sort !== 'newest') params.set('sort', sort);
        if (facultyId) params.set('facultyId', facultyId);
        if (departmentId) params.set('departmentId', departmentId);

        const res = await fetch(`/api/publications?${params.toString()}`);
        const data = await res.json();
        if (data.publications) {
          startTransition(() => {
            setPublications(data.publications);
            if (data.faculties) setFaculties(data.faculties);
            if (data.years) setYears(data.years);
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
    fetchPubs();
  }, [q, type, year, sort, facultyId, departmentId]);

  const selectedFacultyObj = faculties.find((f) => f.id === facultyId) || null;
  const availableDepartments = selectedFacultyObj ? selectedFacultyObj.departments || [] : [];

  const typeOptions = [
    { value: 'ALL', label: tp.filterType },
    { value: 'SCOPUS_WOS', label: 'Scopus & WoS' },
    { value: 'SCOPUS', label: 'Scopus' },
    { value: 'WOS', label: 'WoS (Web of Science)' },
    { value: 'OAK', label: locale === 'ru' ? 'Журналы ВАК (OAK)' : 'OAK' },
    { value: 'LOCAL_OTHER', label: locale === 'ru' ? 'Журналы и конференции' : locale === 'en' ? 'Journals & Conferences' : 'Jurnallar & Konferensiyalar' },
    { value: 'LOCAL_JOURNAL', label: locale === 'ru' ? 'Местный журнал' : locale === 'en' ? 'Local Journal' : 'Mahalliy jurnal' },
    { value: 'INTERNATIONAL_JOURNAL', label: locale === 'ru' ? 'Междунар. журнал' : locale === 'en' ? 'Intl. Journal' : 'Xalqaro jurnal' },
    { value: 'CONFERENCE', label: locale === 'ru' ? 'Конференция' : locale === 'en' ? 'Conference' : 'Konferensiya' },
    { value: 'BOOKS', label: locale === 'ru' ? 'Монографии и учебники' : locale === 'en' ? 'Monographs & Textbooks' : 'Monografiya & Darsliklar' },
    { value: 'MONOGRAPH', label: locale === 'ru' ? 'Монография' : locale === 'en' ? 'Monograph' : 'Monografiya' },
    { value: 'TEXTBOOK', label: locale === 'ru' ? 'Учебник' : locale === 'en' ? 'Textbook' : 'Darslik' },
    { value: 'PATENT', label: locale === 'ru' ? 'Патент' : locale === 'en' ? 'Patent' : 'Patent' },
  ];

  const categoryTabs = [
    { key: 'ALL', label: locale === 'ru' ? 'Все' : locale === 'en' ? 'All' : 'Barchasi' },
    { key: 'SCOPUS_WOS', label: 'Scopus & WoS' },
    { key: 'OAK', label: locale === 'ru' ? 'ВАК (OAK)' : 'OAK' },
    { key: 'LOCAL_OTHER', label: locale === 'ru' ? 'Журналы / Конф.' : locale === 'en' ? 'Journals / Conf.' : 'Jurnallar & Konf.' },
    { key: 'BOOKS', label: locale === 'ru' ? 'Монографии / Учебники' : locale === 'en' ? 'Books & Textbooks' : 'Monografiya & Darslik' },
    { key: 'PATENT', label: locale === 'ru' ? 'Патенты' : locale === 'en' ? 'Patents' : 'Patentlar' },
  ];

  const yearOptions = [
    { value: 'ALL', label: locale === 'ru' ? 'Все годы' : locale === 'en' ? 'All Years' : 'Barcha yillar' },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  const sortOptions = [
    { value: 'newest', label: locale === 'ru' ? 'Сначала новые' : locale === 'en' ? 'Newest First' : 'Eng yangilari' },
    { value: 'citations', label: locale === 'ru' ? 'По цитированиям' : locale === 'en' ? 'Most Cited' : 'Eng ko‘p iqtibos' },
    { value: 'year', label: locale === 'ru' ? 'По году издания' : locale === 'en' ? 'By Year' : 'Yil bo‘yicha' },
  ];

  const hasActiveFilters = q || type !== 'ALL' || year !== 'ALL' || sort !== 'newest' || facultyId || departmentId;

  const handleResetFilters = () => {
    setSearchInput('');
    setQ('');
    setType('ALL');
    setYear('ALL');
    setSort('newest');
    setFacultyId('');
    setDepartmentId('');
  };

  const facultyOptions = [
    { value: '', label: tp.filterFaculty || ts.filterFaculty },
    ...faculties.map((f) => ({
      value: f.id,
      label: getLocalizedName(f),
    })),
  ];

  const departmentOptions = [
    { value: '', label: tp.filterDepartment || ts.filterDepartment },
    ...availableDepartments.map((d) => ({
      value: d.id,
      label: getLocalizedName(d),
    })),
  ];

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 2xl:px-24 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0F294A] dark:text-white">
          {tp.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{tp.subtitle}</p>
      </div>

      {/* Yuqori Qidiruv va CustomSelect Filtrlar Paneli */}
      <div className="neu-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-4 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={tp.searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setQ('');
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-3">
          <CustomSelect
            value={type}
            onChange={(val) => setType(val)}
            options={typeOptions}
            placeholder={tp.filterType}
            icon={Filter}
          />
        </div>

        <div className="md:col-span-2">
          <CustomSelect
            value={facultyId}
            onChange={(val) => {
              setFacultyId(val);
              setDepartmentId('');
            }}
            options={facultyOptions}
            placeholder={tp.filterFaculty || ts.filterFaculty}
            icon={Building2}
          />
        </div>

        <div className="md:col-span-3">
          <CustomSelect
            value={departmentId}
            onChange={(val) => setDepartmentId(val)}
            options={departmentOptions}
            placeholder={tp.filterDepartment || ts.filterDepartment}
            disabled={!selectedFacultyObj}
            disabledHint={ts.selectFacultyFirst}
            icon={Layers}
          />
        </div>
      </div>

      {/* Full-Layout To'liq Nashrlar Jadvali */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Nashrlar yuklanmoqda...</div>
      ) : publications.length === 0 ? (
        <div className="neu-card p-16 rounded-3xl text-center text-slate-500">
          Tanlangan mezonlar bo‘yicha tasdiqlangan nashrlar topilmadi.
        </div>
      ) : (
        <div className="w-full neu-card rounded-3xl overflow-hidden">
          <div className="w-full max-h-[68vh] overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-[#EDF1F7]/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_1px_0_rgba(148,163,184,0.28)]">
                <tr className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 pl-5 pr-2 w-16 font-semibold text-center">
                    {locale === 'ru' ? 'Год' : locale === 'en' ? 'Year' : 'Yil'}
                  </th>
                  <th className="py-4 px-4 min-w-[320px] font-semibold">
                    {locale === 'ru'
                      ? 'Название публикации и журнал'
                      : locale === 'en'
                      ? 'Publication Title & Journal'
                      : 'Nashr nomi va jurnal'}
                  </th>
                  <th className="py-4 px-4 min-w-[240px] font-semibold">
                    {tp.authors} (TIU)
                  </th>
                  <th className="py-4 px-4 min-w-[200px] font-semibold">
                    {locale === 'ru'
                      ? 'Факультет / кафедра'
                      : locale === 'en'
                      ? 'Faculty / Department'
                      : 'Fakultet / kafedra'}
                  </th>
                  <th className="py-4 px-4 w-44 font-semibold">
                    {locale === 'ru'
                      ? 'Тип + квартиль'
                      : locale === 'en'
                      ? 'Type + Quartile'
                      : 'Tur + kvartil'}
                  </th>
                  <th className="py-4 px-4 w-24 font-semibold text-center">{tp.citations}</th>
                  <th className="py-4 pl-4 pr-6 w-20 font-semibold text-right">
                    {locale === 'ru' ? 'Ссылка' : locale === 'en' ? 'Link' : 'Havola'}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {publications.map((pub) => {
                  const firstDept = pub.authors?.[0]?.scholar?.department;
                  const deptName = getLocalizedName(firstDept);
                  const facName = getLocalizedName(firstDept?.faculty);
                  const isScopusOrWos = pub.type === 'SCOPUS' || pub.type === 'WOS';
                  const citationsVal = isScopusOrWos ? pub.citationsCount ?? 0 : 0;
                  const externalHref = pub.doi
                    ? `https://doi.org/${pub.doi}`
                    : pub.url || null;

                  return (
                    <tr
                      key={pub.id}
                      className="group h-[82px] hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {/* 1. Qisqa Yil + kun.oy */}
                      <td className="py-3.5 pl-5 pr-2 align-middle text-center whitespace-nowrap tabular-nums">
                        <div className="inline-flex flex-col items-center leading-tight">
                          <span className="font-mono text-sm font-extrabold text-[#0F294A] dark:text-white">
                            {pub.year}
                          </span>
                          {formatShortDayMonth(pub.createdAt) && (
                            <span className="font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {formatShortDayMonth(pub.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Nashr nomi (Sarlavha havola bo'lib nashr tafsilot sahifasiga o'tadi) */}
                      <td className="py-3.5 px-4 align-middle max-w-2xl">
                        <div className="min-h-[54px] flex flex-col justify-center space-y-1">
                          <Link
                            href={`/publications/${pub.id}`}
                            className="font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-sky-300 hover:underline transition-colors leading-snug line-clamp-2"
                            title={cleanTitle(pub.title)}
                          >
                            {cleanTitle(pub.title)}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {pub.journalOrPublisher}
                            </span>
                            {pub.doi && (
                              <span className="font-mono text-[11px] text-slate-400">
                                • DOI: {pub.doi}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Mualliflar (avatar + ikki ohangli Ism Familiya pillari) */}
                      <td className="py-3.5 px-4 align-middle">
                        {(() => {
                          const validAuthors = (pub.authors || []).filter((a) => a.scholar);
                          const visibleAuthors = validAuthors.slice(0, 2);
                          const hiddenAuthors = validAuthors.slice(2);
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              {visibleAuthors.map((auth, aIdx) => {
                                const pureName = getPureFullName(auth.scholar.fullName);
                                const parts = pureName.split(/\s+/);
                                const firstName = parts[0] || '';
                                const lastName = parts.slice(1).join(' ');
                                const degreeRing =
                                  auth.scholar.academicDegree === 'DSC'
                                    ? 'ring-2 ring-amber-400/90'
                                    : auth.scholar.academicDegree === 'PHD'
                                    ? 'ring-2 ring-blue-500/80'
                                    : 'ring-1 ring-white/90 dark:ring-slate-700';

                                return (
                                  <Link
                                    key={auth.scholar.id}
                                    href={`/scholars/${auth.scholar.id}`}
                                    className="group/author inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass-btn hover:bg-[#0F294A] dark:hover:bg-sky-500 hover:-translate-y-[1px] transition-all"
                                  >
                                    <ScholarAvatar
                                      photoUrl={auth.scholar.photoUrl}
                                      fullName={pureName}
                                      index={aIdx}
                                      className={`w-6 h-6 text-[10px] shrink-0 ${degreeRing}`}
                                    />
                                    <span className="text-xs tracking-tight truncate max-w-[145px]">
                                      <span className="font-medium text-slate-600 dark:text-slate-300 group-hover/author:text-blue-100 transition-colors">
                                        {firstName}
                                      </span>
                                      {lastName && (
                                        <>
                                          {' '}
                                          <span className="font-bold text-[#0F294A] dark:text-white group-hover/author:text-white transition-colors">
                                            {lastName}
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  </Link>
                                );
                              })}
                              {hiddenAuthors.length > 0 && (
                                <span
                                  title={hiddenAuthors
                                    .map((a) => getPureFullName(a.scholar.fullName))
                                    .join(', ')}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full glass-btn font-mono text-[11px] font-bold text-[#0F294A] dark:text-sky-300"
                                >
                                  +{hiddenAuthors.length}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* 4. Fakultet / kafedra (tanlangan tilda) */}
                      <td className="py-3.5 px-4 align-middle text-xs">
                        {deptName ? (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (firstDept?.facultyId) setFacultyId(firstDept.facultyId);
                                setDepartmentId(firstDept.id);
                              }}
                              className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-300 text-left leading-snug cursor-pointer"
                              title="Shu kafedra bo‘yicha filtrlash"
                            >
                              {deptName}
                            </button>
                            {facName && (
                              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                {facName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 5. Tur + kvartil (Ikki qismli badge: [ Scopus | Q1 ], [ WoS | Q2 ], [ OAK ]) */}
                      <td className="py-3.5 px-4 align-middle">
                        <PublicationTypeBadge
                          type={pub.type}
                          quartile={pub.quartile}
                          locale={locale}
                        />
                      </td>

                      {/* 6. Iqtibos (— o'rniga 0) */}
                      <td className="py-3.5 px-4 align-middle text-center font-mono text-sm font-bold tabular-nums">
                        <span
                          className={
                            citationsVal > 0
                              ? 'text-[#0F294A] dark:text-white'
                              : 'text-slate-400 dark:text-slate-500 font-medium'
                          }
                        >
                          {citationsVal}
                        </span>
                      </td>

                      {/* 7. Havola (faqat tashqi havola, yo'q bo'lsa disabled) */}
                      <td className="py-3.5 pl-4 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end">
                          {externalHref ? (
                            <a
                              href={externalHref}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-xl glass-btn hover:bg-[#0F294A] hover:text-white dark:hover:bg-sky-500 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
                              title={pub.doi ? `DOI: ${pub.doi}` : 'Manbani ochish'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              aria-disabled="true"
                              className="w-8 h-8 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center opacity-45 cursor-not-allowed"
                              title="Tashqi havola mavjud emas"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicationsDirectoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Yuklanmoqda...</div>}>
      <PublicationsDirectoryContent />
    </Suspense>
  );
}
