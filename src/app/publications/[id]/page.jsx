import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  Building2,
  Quote,
  Hash,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ScholarAvatar from '@/components/ui/ScholarAvatar';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';

const TYPE_LABELS = {
  SCOPUS: 'Scopus',
  WOS: 'WoS',
  OAK: 'OAK',
  LOCAL_JOURNAL: 'Mahalliy jurnal',
  INTERNATIONAL_JOURNAL: 'Xalqaro jurnal',
  CONFERENCE: 'Konferensiya',
  MONOGRAPH: 'Monografiya',
  TEXTBOOK: 'Darslik',
  PATENT: 'Patent',
};

const BADGE_STYLES = {
  SCOPUS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WOS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OAK: 'bg-blue-50 text-blue-700 border-blue-200',
  LOCAL_JOURNAL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  INTERNATIONAL_JOURNAL: 'bg-sky-50 text-sky-700 border-sky-200',
  CONFERENCE: 'bg-teal-50 text-teal-700 border-teal-200',
  MONOGRAPH: 'bg-purple-50 text-purple-700 border-purple-200',
  TEXTBOOK: 'bg-violet-50 text-violet-700 border-violet-200',
  PATENT: 'bg-amber-50 text-amber-800 border-amber-200',
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
  const resolvedParams = await params;
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

  const baseTypeLabel = TYPE_LABELS[pub.type] || pub.type;
  const combinedBadge =
    (pub.type === 'SCOPUS' || pub.type === 'WOS' || pub.type === 'INTERNATIONAL_JOURNAL') &&
    pub.quartile &&
    pub.quartile !== 'NONE'
      ? `${baseTypeLabel} ${pub.quartile}`
      : baseTypeLabel;

  const isScopusOrWos = pub.type === 'SCOPUS' || pub.type === 'WOS';
  const citationsValue = isScopusOrWos ? pub.citationsCount ?? 0 : 0;
  const externalHref = pub.doi ? `https://doi.org/${pub.doi}` : pub.url || null;
  const primaryDept = pub.authors?.[0]?.scholar?.department;

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 2xl:px-24 py-12 space-y-8">
      <div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0F294A] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Nashrlar ro‘yxatiga qaytish
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-7 sm:p-10 shadow-xs space-y-8">
        {/* Yuqori Meta qism */}
        <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <PublicationTypeBadge type={pub.type} quartile={pub.quartile} />
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tasdiqlangan sana: {formatDotDate(pub.createdAt, pub.year)}
            </span>
            {primaryDept?.faculty && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {primaryDept.faculty.nameUz} • {primaryDept.nameUz}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] dark:text-white leading-snug">
            {cleanTitle(pub.title)}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <FileText className="w-4 h-4 text-blue-600" />
              {pub.journalOrPublisher}
            </span>
            {pub.doi && (
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                DOI: {pub.doi}
              </span>
            )}
            {pub.isbnOrPatentNo && (
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                {pub.isbnOrPatentNo}
              </span>
            )}
          </div>
        </div>

        {/* Ko'rsatkichlar va Tashqi Manba */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nashr yili</div>
            <div className="font-mono text-2xl font-extrabold text-[#0F294A] dark:text-white mt-1">
              {pub.year}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-blue-600" />
              Iqtiboslar soni
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#0F294A] dark:text-white mt-1">
              {citationsValue}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Asl manba (DOI / URL)
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {externalHref ? 'Tashqi manba mavjud' : 'Tashqi havola kiritilmagan'}
              </div>
            </div>
            {externalHref ? (
              <a
                href={externalHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F294A] text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                <span>Ochish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <span>Mavjud emas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mualliflar ro'yxati */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Mualliflar ({pub.authors.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pub.authors.map((a, idx) => (
              <Link
                key={a.id}
                href={`/scholars/${a.scholar.id}`}
                className="group p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-blue-400 transition-all flex items-center gap-3.5"
              >
                <ScholarAvatar
                  photoUrl={a.scholar.photoUrl}
                  fullName={getPureFullName(a.scholar.fullName)}
                  index={idx}
                  className="w-12 h-12"
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 truncate">
                    {getPureFullName(a.scholar.fullName)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {a.scholar.department?.nameUz || 'TIU tadqiqotchisi'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
