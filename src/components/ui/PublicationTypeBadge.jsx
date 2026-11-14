'use client';

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

// Ikki qismli badge uchun stillar: chap qism to'q (oq matn), o'ng qism och rangda
const SPLIT_STYLES = {
  SCOPUS: {
    wrapper: 'border-emerald-600/30 dark:border-emerald-500/40',
    left: 'bg-emerald-600 text-white',
    right: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  WOS: {
    wrapper: 'border-indigo-600/30 dark:border-indigo-500/40',
    left: 'bg-indigo-600 text-white',
    right: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
  },
  INTERNATIONAL_JOURNAL: {
    wrapper: 'border-sky-600/30 dark:border-sky-500/40',
    left: 'bg-sky-600 text-white',
    right: 'bg-sky-50 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
  },
};

// Bir qismli badge uchun stillar (OAK, Patent, Mahalliy jurnal, Monografiya, Darslik va kvartilsiz turlar)
const SINGLE_STYLES = {
  SCOPUS:
    'bg-emerald-600 text-white border-emerald-600',
  WOS: 'bg-indigo-600 text-white border-indigo-600',
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

export default function PublicationTypeBadge({ type, quartile, locale = 'uz' }) {
  const dict = TYPE_LABELS[locale] || TYPE_LABELS.uz;
  const baseLabel = dict[type] || type;
  const hasQuartile =
    (type === 'SCOPUS' || type === 'WOS' || type === 'INTERNATIONAL_JOURNAL') &&
    quartile &&
    quartile !== 'NONE';

  if (hasQuartile) {
    const style = SPLIT_STYLES[type] || SPLIT_STYLES.SCOPUS;
    return (
      <span
        className={`inline-flex items-stretch rounded-lg overflow-hidden border text-xs whitespace-nowrap shadow-2xs ${style.wrapper}`}
      >
        <span className={`px-2.5 py-1 font-semibold leading-none flex items-center ${style.left}`}>
          {baseLabel}
        </span>
        <span
          className={`px-2 py-1 font-mono font-extrabold leading-none flex items-center border-l border-current/15 ${style.right}`}
        >
          {quartile}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${
        SINGLE_STYLES[type] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {baseLabel}
    </span>
  );
}
