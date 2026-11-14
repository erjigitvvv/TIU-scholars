'use client';

import { useState, useEffect, useMemo, startTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  FileText,
  UserCheck,
  Filter,
  Building2,
  Layers,
  X,
} from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';
import CustomSelect from '@/components/ui/CustomSelect';

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

// kun.oy.yil (DD.MM.YYYY) formati
function formatDotDate(dateStr, fallbackYear) {
  if (!dateStr) return fallbackYear ? `01.01.${fallbackYear}` : '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return fallbackYear ? `01.01.${fallbackYear}` : '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function PublicationsDirectoryPage() {
  const [locale, setLocale] = useState('uz');
  const [publications, setPublications] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('ALL');
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
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get('type');
    const urlFaculty = params.get('facultyId');
    const urlDept = params.get('departmentId');
    if (urlType) setType(urlType);
    if (urlFaculty) setFacultyId(urlFaculty);
    if (urlDept) setDepartmentId(urlDept);
  }, []);

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
        if (facultyId) params.set('facultyId', facultyId);
        if (departmentId) params.set('departmentId', departmentId);

        const res = await fetch(`/api/publications?${params.toString()}`);
        const data = await res.json();
        if (data.publications) {
          startTransition(() => {
            setPublications(data.publications);
            if (data.faculties) setFaculties(data.faculties);
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
  }, [q, type, facultyId, departmentId]);

  const selectedFacultyObj = faculties.find((f) => f.id === facultyId) || null;
  const availableDepartments = selectedFacultyObj ? selectedFacultyObj.departments || [] : [];

  const typeOptions = [
    { value: 'ALL', label: tp.filterType },
    { value: 'SCOPUS', label: 'Scopus' },
    { value: 'WOS', label: 'WoS (Web of Science)' },
    { value: 'OAK', label: locale === 'ru' ? 'Журналы ВАК (OAK)' : 'OAK' },
    { value: 'LOCAL_JOURNAL', label: locale === 'ru' ? 'Местный журнал' : locale === 'en' ? 'Local Journal' : 'Mahalliy jurnal' },
    { value: 'INTERNATIONAL_JOURNAL', label: locale === 'ru' ? 'Междунар. журнал' : locale === 'en' ? 'Intl. Journal' : 'Xalqaro jurnal' },
    { value: 'CONFERENCE', label: locale === 'ru' ? 'Конференция' : locale === 'en' ? 'Conference' : 'Konferensiya' },
    { value: 'MONOGRAPH', label: locale === 'ru' ? 'Монография' : locale === 'en' ? 'Monograph' : 'Monografiya' },
    { value: 'TEXTBOOK', label: locale === 'ru' ? 'Учебник' : locale === 'en' ? 'Textbook' : 'Darslik' },
    { value: 'PATENT', label: locale === 'ru' ? 'Патент' : locale === 'en' ? 'Patent' : 'Patent' },
  ];

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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
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
        <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          Tanlangan mezonlar bo‘yicha tasdiqlangan nashrlar topilmadi.
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 pl-6 pr-3 w-28 font-semibold">
                    {locale === 'ru' ? 'Дата' : locale === 'en' ? 'Date' : 'Sana'}
                  </th>
                  <th className="py-4 px-4 min-w-[340px] font-semibold">
                    {locale === 'ru'
                      ? 'Название публикации и журнал'
                      : locale === 'en'
                      ? 'Publication Title & Journal'
                      : 'Nashr nomi va jurnal'}
                  </th>
                  <th className="py-4 px-4 min-w-[230px] font-semibold">
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
                      {/* 1. Sana (kun.oy.yil formatida) */}
                      <td className="py-3.5 pl-6 pr-3 align-middle font-mono text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                        {formatDotDate(pub.createdAt, pub.year)}
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

                      {/* 3. Mualliflar (faqat F.I.Sh., TIU mualliflari ajratilgan) */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(pub.authors || []).map(
                            (auth) =>
                              auth.scholar && (
                                <Link
                                  key={auth.scholar.id}
                                  href={`/scholars/${auth.scholar.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-slate-800 hover:bg-[#0F294A] hover:text-white dark:hover:bg-sky-500 text-[#0F294A] dark:text-sky-300 border border-blue-200/70 dark:border-slate-700 text-xs font-semibold transition-colors"
                                >
                                  <UserCheck className="w-3 h-3 text-blue-600 dark:text-sky-400 shrink-0 group-hover:text-current" />
                                  <span>{getPureFullName(auth.scholar.fullName)}</span>
                                </Link>
                              )
                          )}
                        </div>
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
                              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#0F294A] hover:text-white dark:hover:bg-sky-500 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center transition-colors"
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
                            </a>
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
