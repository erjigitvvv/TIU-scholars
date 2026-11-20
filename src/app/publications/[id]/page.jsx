import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  Building2,
  Quote,
  Award,
  Users,
  Sparkles,
  Hash,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SCORING_CONFIG, TYPE_WEIGHTS } from '@/lib/scoring';
import { parseRawInterests, INTEREST_TRANSLATIONS } from '@/lib/interests';
import ScholarAvatar from '@/components/ui/ScholarAvatar';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';
import PublicationCitationBox from '@/components/publications/PublicationCitationBox';
import PublicationReaderSection from '@/components/publications/PublicationReaderSection';
import PublicationEngagement from '@/components/publications/PublicationEngagement';
import PublicationPdfButton from '@/components/publications/PublicationPdfButton';

const LABELS = {
  uz: {
    back: 'Nashrlar ro‘yxatiga qaytish',
    approvedDate: 'Tasdiqlangan sana:',
    year: 'Nashr yili',
    citations: 'Iqtiboslar soni',
    tiuPoints: 'TIU Ball qiymati',
    source: 'Asl manba (DOI / URL)',
    sourceAvailable: 'Tashqi manba mavjud',
    sourceUnavailable: 'Havola kiritilmagan',
    open: 'Ochish',
    abstractTitle: 'Ilmiy annotatsiya va tavsif',
    keywordsTitle: 'Kalit so‘zlar va yo‘nalishlar',
    citeTitle: 'Manba sifatida iqtibos keltirish',
    copy: 'Nusxalash',
    copied: 'Nusxalandi',
    authorsTitle: 'Mualliflar',
    firstAuthor: '1-muallif',
    coAuthor: 'Hammuallif',
    relatedTitle: 'Mualliflarning boshqa nashrlari',
    pointsFormula: (base, bonus, citPts) =>
      `Asosiy: +${base}${bonus > 0 ? ` • Kvartil: +${bonus}` : ''}${citPts > 0 ? ` • Iqtibos: +${citPts}` : ''}`,
    abstractBody: ({ title, journal, year, typeLabel, quartile, authorsCount, dept }) =>
      `Ushbu «${title}» nomli ilmiy tadqiqot ${year}-yilda «${journal}» nashrida (${typeLabel}${quartile && quartile !== 'NONE' ? `, ${quartile}` : ''}) chop etilgan. Tadqiqot ${authorsCount} nafar muallif hamkorligida${dept ? ` (${dept})` : ''} tayyorlangan bo‘lib, zamonaviy ilmiy-amaliy muammolarni tahlil qilish va tizimli yechimlar taklif etishga qaratilgan.`,
  },
  ru: {
    back: 'Вернуться к публикациям',
    approvedDate: 'Дата утверждения:',
    year: 'Год публикации',
    citations: 'Цитирования',
    tiuPoints: 'Балл TIU',
    source: 'Первоисточник (DOI / URL)',
    sourceAvailable: 'Внешняя ссылка доступна',
    sourceUnavailable: 'Ссылка не указана',
    open: 'Открыть',
    abstractTitle: 'Научная аннотация и описание',
    keywordsTitle: 'Ключевые слова и направления',
    citeTitle: 'Цитирование публикации',
    copy: 'Копировать',
    copied: 'Скопировано',
    authorsTitle: 'Авторы',
    firstAuthor: '1-й автор',
    coAuthor: 'Соавтор',
    relatedTitle: 'Другие публикации авторов',
    pointsFormula: (base, bonus, citPts) =>
      `База: +${base}${bonus > 0 ? ` • Квартиль: +${bonus}` : ''}${citPts > 0 ? ` • Цит.: +${citPts}` : ''}`,
    abstractBody: ({ title, journal, year, typeLabel, quartile, authorsCount, dept }) =>
      `Научная работа «${title}» опубликована в ${year} году в издании «${journal}» (${typeLabel}${quartile && quartile !== 'NONE' ? `, ${quartile}` : ''}). Исследование подготовлено коллективом из ${authorsCount} авторов${dept ? ` (${dept})` : ''} и посвящено актуальным научно-практическим вопросам.`,
  },
  en: {
    back: 'Back to Publications',
    approvedDate: 'Approved date:',
    year: 'Publication Year',
    citations: 'Citations',
    tiuPoints: 'TIU Score Value',
    source: 'Original Source (DOI / URL)',
    sourceAvailable: 'External source available',
    sourceUnavailable: 'No external link',
    open: 'Open',
    abstractTitle: 'Abstract & Overview',
    keywordsTitle: 'Keywords & Research Areas',
    citeTitle: 'Cite this Publication',
    copy: 'Copy',
    copied: 'Copied',
    authorsTitle: 'Authors',
    firstAuthor: 'Lead Author',
    coAuthor: 'Co-Author',
    relatedTitle: 'Related Publications',
    pointsFormula: (base, bonus, citPts) =>
      `Base: +${base}${bonus > 0 ? ` • Quartile: +${bonus}` : ''}${citPts > 0 ? ` • Cit.: +${citPts}` : ''}`,
    abstractBody: ({ title, journal, year, typeLabel, quartile, authorsCount, dept }) =>
      `This research paper titled "${title}" was published in ${year} in "${journal}" (${typeLabel}${quartile && quartile !== 'NONE' ? `, ${quartile}` : ''}). Authored by ${authorsCount} researcher(s)${dept ? ` at ${dept}` : ''}, the study addresses key methodological and applied challenges in the field.`,
  },
};

const TYPE_LABELS = {
  SCOPUS: 'Scopus',
  WOS: 'Web of Science',
  OAK: 'OAK',
  LOCAL_JOURNAL: 'Mahalliy jurnal',
  INTERNATIONAL_JOURNAL: 'Xalqaro jurnal',
  CONFERENCE: 'Konferensiya',
  MONOGRAPH: 'Monografiya',
  TEXTBOOK: 'Darslik',
  PATENT: 'Patent',
};

function cleanTitle(rawTitle = '') {
  return rawTitle
    .replace(
      /^(OAK Journal|OAK|Web of Science|Scopus\s*Q[1-4]|Scopus|Patent|Monograph|Textbook|Local Journal|International Journal|Conference)\s*:\s*/i,
      ''
    )
    .trim();
}

function getPureFullName(rawName = '') {
  return rawName
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

function formatDotDate(dateVal, fallbackYear) {
  if (!dateVal) return fallbackYear ? `01.01.${fallbackYear}` : '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return fallbackYear ? `01.01.${fallbackYear}` : '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default async function PublicationDetailPage({ params }) {
  const [resolvedParams, cookieStore, scoringConfig] = await Promise.all([
    params,
    cookies(),
    prisma.scoringConfig.findFirst(),
  ]);

  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'uz';
  const L = LABELS[locale] || LABELS.uz;

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  const pub = await prisma.publication.findUnique({
    where: { id: resolvedParams.id },
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
  });

  if (!pub || pub.status !== 'APPROVED') {
    notFound();
  }

  const authorIds = pub.authors.map((a) => a.scholarId);
  const relatedPubs =
    authorIds.length > 0
      ? await prisma.publication.findMany({
          where: {
            id: { not: pub.id },
            status: 'APPROVED',
            authors: { some: { scholarId: { in: authorIds } } },
          },
          orderBy: { year: 'desc' },
          take: 3,
        })
      : [];

  const config = scoringConfig || DEFAULT_SCORING_CONFIG;
  const baseWeight =
    pub.type === 'SCOPUS'
      ? config.scopusWeight
      : pub.type === 'WOS'
      ? config.wosWeight
      : pub.type === 'OAK'
      ? config.oakWeight
      : pub.type === 'MONOGRAPH'
      ? config.monographWeight
      : pub.type === 'PATENT'
      ? config.patentWeight
      : pub.type === 'CONFERENCE'
      ? config.conferenceWeight
      : TYPE_WEIGHTS[pub.type] || 3;
  const qBonus = pub.quartile === 'Q1' || pub.quartile === 'Q2' ? config.q1Q2Bonus : 0;
  const citPoints = parseFloat(((pub.citationsCount || 0) * config.citationWeight).toFixed(1));
  const totalPubScore = parseFloat((baseWeight + qBonus + citPoints).toFixed(1));

  const cleanedTitle = cleanTitle(pub.title);
  const typeLabel = TYPE_LABELS[pub.type] || pub.type;
  const isScopusOrWos = pub.type === 'SCOPUS' || pub.type === 'WOS';
  const citationsValue = isScopusOrWos ? pub.citationsCount ?? 0 : pub.citationsCount ?? 0;
  const externalHref = pub.doi ? `https://doi.org/${pub.doi}` : pub.url || null;
  const primaryDept = pub.authors?.[0]?.scholar?.department;

  // Collect up to 6 unique keywords from authors' research interests
  const keywordSet = new Set();
  for (const a of pub.authors) {
    for (const tag of parseRawInterests(a.scholar?.researchInterests)) {
      keywordSet.add(INTEREST_TRANSLATIONS[tag]?.[locale] || tag);
      if (keywordSet.size >= 6) break;
    }
    if (keywordSet.size >= 6) break;
  }
  const keywords = Array.from(keywordSet);

  const authorNames = pub.authors.map((a) => getPureFullName(a.scholar?.fullName || ''));
  const authorsText = authorNames.join(', ') || 'TIU Scholar';
  const bibtexAuthors = authorNames.join(' and ') || 'TIU Scholar';

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-10 space-y-8">
      <div className="no-print flex items-center justify-between gap-4">
        <Link
          href="/publications"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-btn text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0F294A] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          {L.back}
        </Link>
        <PublicationPdfButton pdfUrl={pub.url || ''} locale={locale} />
      </div>

      <div className="neu-card rounded-3xl p-6 sm:p-10 space-y-8">
        {/* Top Meta & Title */}
        <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <PublicationTypeBadge type={pub.type} quartile={pub.quartile} />
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {L.approvedDate} {formatDotDate(pub.updatedAt || pub.createdAt, pub.year)}
            </span>
            {primaryDept && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {getLocalizedName(primaryDept.faculty)} • {getLocalizedName(primaryDept)}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] dark:text-white leading-snug break-words">
            {cleanedTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              {pub.journalOrPublisher}
            </span>
            {pub.doi && (
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                DOI: {pub.doi}
              </span>
            )}
            {pub.isbnOrPatentNo && (
              <span className="inline-flex items-center gap-1 font-mono text-xs bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg text-amber-800 dark:text-amber-300">
                <Hash className="w-3 h-3" /> {pub.isbnOrPatentNo}
              </span>
            )}
          </div>
        </div>

        {/* 4 Metric Cards (including TIU Score Value) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl neu-card-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{L.year}</div>
            <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {pub.year}
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-card-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-indigo-500" />
              {L.citations}
            </div>
            <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {citationsValue}
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-card-navy text-white space-y-1">
            <div className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              {L.tiuPoints}
            </div>
            <div className="font-mono text-2xl font-extrabold tabular-nums">+{totalPubScore}</div>
            <div className="text-[11px] text-blue-200/90 leading-tight">
              {L.pointsFormula(baseWeight, qBonus, citPoints)}
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-card-sm flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{L.source}</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {externalHref ? L.sourceAvailable : L.sourceUnavailable}
              </div>
            </div>
            {externalHref && (
              <a
                href={externalHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-btn-primary text-xs font-semibold shrink-0"
              >
                {L.open} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Abstract, Long-Text Expandable & Inline PDF Viewer + Keywords */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <PublicationReaderSection
              abstractTitle={L.abstractTitle}
              abstractText={L.abstractBody({
                title: cleanedTitle,
                journal: pub.journalOrPublisher,
                year: pub.year,
                typeLabel,
                quartile: pub.quartile,
                authorsCount: pub.authors.length || 1,
                dept: primaryDept ? getLocalizedName(primaryDept) : '',
              })}
              pdfUrl={pub.url || ''}
              locale={locale}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            {pub.coverImageUrl && (
              <div className="p-5 rounded-2xl neu-card-sm space-y-2">
                <h2 className="text-sm font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Graphical Abstract / Muqova</span>
                </h2>
                <div className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <img
                    src={pub.coverImageUrl}
                    alt={cleanedTitle}
                    className="w-full h-auto max-h-64 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl neu-card-sm space-y-3">
              <h2 className="text-sm font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                {L.keywordsTitle}
              </h2>
              <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                  keywords.map((kw, i) => (
                    <Link
                      key={i}
                      href={`/publications?q=${encodeURIComponent(kw)}`}
                      className="px-3 py-1 rounded-xl glass-btn text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-300"
                    >
                      {kw}
                    </Link>
                  ))
                ) : (
                  <span className="px-3 py-1 rounded-xl glass-btn text-xs font-medium text-slate-600 dark:text-slate-300">
                    {typeLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cite this Publication (APA / IEEE / BibTeX) */}
        <PublicationCitationBox
          title={cleanedTitle}
          authorsText={authorsText}
          bibtexAuthors={bibtexAuthors}
          journal={pub.journalOrPublisher}
          year={pub.year}
          doi={pub.doi}
          type={pub.type}
          labelTitle={L.citeTitle}
          copyLabel={L.copy}
          copiedLabel={L.copied}
        />

        {/* Compact Authors Pills */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            {L.authorsTitle} ({pub.authors.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {pub.authors.map((a, idx) => {
              const scholar = a.scholar;
              if (!scholar) return null;
              const pureName = getPureFullName(scholar.fullName);
              const parts = pureName.split(/\s+/);
              const firstName = parts[0] || '';
              const lastName = parts.slice(1).join(' ');
              const degreeRing =
                scholar.academicDegree === 'DSC'
                  ? 'ring-2 ring-amber-400/90'
                  : scholar.academicDegree === 'PHD'
                  ? 'ring-2 ring-blue-500/80'
                  : 'ring-1 ring-white/90 dark:ring-slate-700';
              const isLead = a.authorOrder === 1 || idx === 0;
              return (
                <Link
                  key={a.id}
                  href={`/scholars/${scholar.id}`}
                  title={scholar.department ? getLocalizedName(scholar.department) : pureName}
                  className="group pl-1.5 pr-3.5 py-1.5 rounded-full neu-card-sm hover:-translate-y-0.5 transition-all inline-flex items-center gap-2.5"
                >
                  <ScholarAvatar
                    photoUrl={scholar.photoUrl}
                    fullName={pureName}
                    index={idx}
                    className={`w-9 h-9 text-xs shrink-0 ${degreeRing}`}
                  />
                  <span className="text-xs sm:text-sm tracking-tight group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
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
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isLead
                        ? 'bg-blue-100 text-blue-700 dark:bg-sky-900/60 dark:text-sky-300'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isLead ? L.firstAuthor : L.coAuthor}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Views Counter (Eye) & Comments */}
        <PublicationEngagement publicationId={pub.id} locale={locale} />

        {/* Related Publications */}
        {relatedPubs.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-[#0F294A] dark:text-white">{L.relatedTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPubs.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/publications/${rp.id}`}
                  className="group p-4 rounded-2xl neu-card-sm hover:-translate-y-0.5 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <PublicationTypeBadge type={rp.type} quartile={rp.quartile} />
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {rp.year}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors line-clamp-2">
                    {cleanTitle(rp.title)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {rp.journalOrPublisher}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
