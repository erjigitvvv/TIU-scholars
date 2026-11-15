'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  ExternalLink,
  FileText,
  Filter,
} from 'lucide-react';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';
import CustomSelect from '@/components/ui/CustomSelect';

const TYPE_LABELS = {
  uz: {
    SCOPUS: 'Scopus',
    WOS: 'WoS',
    OAK: 'OAK',
    LOCAL_JOURNAL: 'Mahalliy jurnal',
    INTERNATIONAL_JOURNAL: 'Xalqaro jurnal',
    CONFERENCE: 'Konferensiya',
    MONOGRAPH: 'Monografiya',
    TEXTBOOK: 'Darslik',
    PATENT: 'Patent',
  },
  ru: {
    SCOPUS: 'Scopus',
    WOS: 'WoS',
    OAK: 'ВАК (OAK)',
    LOCAL_JOURNAL: 'Местный журнал',
    INTERNATIONAL_JOURNAL: 'Междунар. журнал',
    CONFERENCE: 'Конференция',
    MONOGRAPH: 'Монография',
    TEXTBOOK: 'Учебник',
    PATENT: 'Патент',
  },
  en: {
    SCOPUS: 'Scopus',
    WOS: 'WoS',
    OAK: 'OAK',
    LOCAL_JOURNAL: 'Local Journal',
    INTERNATIONAL_JOURNAL: 'Intl. Journal',
    CONFERENCE: 'Conference',
    MONOGRAPH: 'Monograph',
    TEXTBOOK: 'Textbook',
    PATENT: 'Patent',
  },
};

const BADGE_STYLES = {
  SCOPUS:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  WOS: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  OAK: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  LOCAL_JOURNAL:
    'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
  INTERNATIONAL_JOURNAL:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  CONFERENCE:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
  MONOGRAPH:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  TEXTBOOK:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
  PATENT:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
};

const FILTER_TABS = [
  { key: 'ALL', labelUz: 'Barchasi', labelRu: 'Все', labelEn: 'All' },
  { key: 'SCOPUS_WOS', labelUz: 'Scopus & WoS', labelRu: 'Scopus & WoS', labelEn: 'Scopus & WoS' },
  { key: 'OAK', labelUz: 'OAK', labelRu: 'ВАК (OAK)', labelEn: 'OAK' },
  { key: 'LOCAL_OTHER', labelUz: 'Mahalliy / Boshqa', labelRu: 'Местные / Другие', labelEn: 'Local / Other' },
  { key: 'BOOKS', labelUz: 'Monografiya & Darslik', labelRu: 'Монографии', labelEn: 'Monographs' },
  { key: 'PATENT', labelUz: 'Patentlar', labelRu: 'Патенты', labelEn: 'Patents' },
];

const COL_HEADERS = {
  uz: {
    date: 'Sana',
    titleAndSource: 'Nashr nomi va jurnal',
    authors: 'Mualliflar',
    typeAndQuartile: 'Tur va kvartil',
    citations: 'Iqtibos',
    actions: 'Havola',
    empty: 'Tanlangan mezon bo‘yicha tasdiqlangan nashrlar topilmadi.',
  },
  ru: {
    date: 'Дата',
    titleAndSource: 'Название публикации и журнал',
    authors: 'Авторы',
    typeAndQuartile: 'Тип и квартиль',
    citations: 'Цитир.',
    actions: 'Ссылка',
    empty: 'Подтвержденные публикации по выбранному фильтру не найдены.',
  },
  en: {
    date: 'Date',
    titleAndSource: 'Publication Title & Journal',
    authors: 'Authors',
    typeAndQuartile: 'Type & Quartile',
    citations: 'Citations',
    actions: 'Link',
    empty: 'No approved publications found for the selected filter.',
  },
};

function cleanTitle(rawTitle = '') {
  return rawTitle
    .replace(
      /^(OAK Journal|OAK|Web of Science|Scopus\s*Q[1-4]|Scopus|Patent|Monograph|Textbook|Local Journal|International Journal|Conference)\s*:\s*/i,
      ''
    )
    .trim();
}

// Faqat F.I.Sh. (unvonsiz: Prof., Dr., Dots. olib tashlanadi)
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

function getCombinedBadgeText(pub, locale = 'uz') {
  const dict = TYPE_LABELS[locale] || TYPE_LABELS.uz;
  const baseLabel = dict[pub.type] || pub.type;
  if (
    (pub.type === 'SCOPUS' || pub.type === 'WOS' || pub.type === 'INTERNATIONAL_JOURNAL') &&
    pub.quartile &&
    pub.quartile !== 'NONE'
  ) {
    return `${baseLabel} ${pub.quartile}`;
  }
  return baseLabel;
}

export default function HomeLatestPublications({
  publications = [],
  locale = 'uz',
  labels = {},
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const cols = COL_HEADERS[locale] || COL_HEADERS.uz;

  // Tasdiqlangan sana (approvedAt) bo'yicha saralangan ro'yxat
  const filteredPubs = useMemo(() => {
    let list = publications;
    if (activeFilter === 'SCOPUS_WOS') {
      list = publications.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS');
    } else if (activeFilter === 'OAK') {
      list = publications.filter((p) => p.type === 'OAK');
    } else if (activeFilter === 'LOCAL_OTHER') {
      list = publications.filter(
        (p) =>
          p.type === 'LOCAL_JOURNAL' ||
          p.type === 'INTERNATIONAL_JOURNAL' ||
          p.type === 'CONFERENCE'
      );
    } else if (activeFilter === 'BOOKS') {
      list = publications.filter((p) => p.type === 'MONOGRAPH' || p.type === 'TEXTBOOK');
    } else if (activeFilter === 'PATENT') {
      list = publications.filter((p) => p.type === 'PATENT');
    }

    return [...list].sort((a, b) => {
      const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
      const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [publications, activeFilter]);

  const getTabLabel = (tab) => {
    if (locale === 'ru') return tab.labelRu;
    if (locale === 'en') return tab.labelEn;
    return tab.labelUz;
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
      <div className="w-full space-y-6">
        {/* Yuqori sarlavha va Dropdown filtr */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
                {labels.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Nashr turini tanlash CustomSelect */}
            <div className="w-56">
              <CustomSelect
                value={activeFilter}
                onChange={(val) => setActiveFilter(val)}
                options={FILTER_TABS.map((tab) => ({
                  value: tab.key,
                  label: getTabLabel(tab),
                }))}
                icon={Filter}
              />
            </div>

            <Link
              href="/publications"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-btn text-xs sm:text-sm font-semibold text-blue-700 dark:text-sky-400 hover:text-[#0F294A] dark:hover:text-white"
            >
              <span>{labels.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Full-Layout Jadval (6 ta ustun: Sana, Nashr nomi va jurnal, Mualliflar, Tur va kvartil, Iqtibos, Havola) */}
        <div className="w-full neu-card rounded-3xl overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 pl-6 pr-3 w-28 font-semibold">{cols.date}</th>
                  <th className="py-4 px-4 min-w-[360px] font-semibold">{cols.titleAndSource}</th>
                  <th className="py-4 px-4 min-w-[230px] font-semibold">{cols.authors}</th>
                  <th className="py-4 px-4 w-44 font-semibold">{cols.typeAndQuartile}</th>
                  <th className="py-4 px-4 w-24 font-semibold text-center">{cols.citations}</th>
                  <th className="py-4 pl-4 pr-6 w-20 font-semibold text-right">{cols.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredPubs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-14 text-center text-slate-500 dark:text-slate-400 text-sm"
                    >
                      {cols.empty}
                    </td>
                  </tr>
                ) : (
                  filteredPubs.map((pub) => {
                    const allAuthors = pub.authors || [];
                    const visibleAuthors = allAuthors.slice(0, 2);
                    const extraAuthorsCount = Math.max(0, allAuthors.length - 2);
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
                        {/* 1. Sana (kun.oy.yil formatida, # o'rnida) */}
                        <td className="py-3.5 pl-6 pr-3 align-middle font-mono text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                          {formatDotDate(pub.approvedAt, pub.year)}
                        </td>

                        {/* 2. Nashr nomi va jurnal (Sarlavha havola bo'lib nashr tafsilot sahifasiga o'tadi) */}
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

                        {/* 3. Mualliflar (faqat F.I.Sh., maksimum 2 ta, keyin "+N") */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            {visibleAuthors.map((a, aIdx) => (
                              <span key={a.id} className="inline-flex items-baseline">
                                <Link
                                  href={`/scholars/${a.scholarId}`}
                                  className="font-semibold text-[#0F294A] dark:text-sky-300 hover:text-blue-600 dark:hover:text-sky-400 hover:underline transition-colors"
                                >
                                  {getPureFullName(a.fullName)}
                                </Link>
                                {aIdx < visibleAuthors.length - 1 && (
                                  <span className="text-slate-400">,</span>
                                )}
                              </span>
                            ))}
                            {extraAuthorsCount > 0 && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                title={allAuthors
                                  .slice(2)
                                  .map((x) => getPureFullName(x.fullName))
                                  .join(', ')}
                              >
                                +{extraAuthorsCount}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Tur va kvartil (Ikki qismli badge: [ Scopus | Q1 ], [ WoS | Q2 ] yoki bir qismli [ OAK ]) */}
                        <td className="py-3.5 px-4 align-middle">
                          <PublicationTypeBadge
                            type={pub.type}
                            quartile={pub.quartile}
                            locale={locale}
                          />
                        </td>

                        {/* 5. Iqtibos (— o'rniga 0 ko'rsatiladi) */}
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

                        {/* 6. Havola (faqat tashqi havola, yo'q bo'lsa disabled holda o'z joyida turadi) */}
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
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
