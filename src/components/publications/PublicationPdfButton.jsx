'use client';

import { FileDown, FileText } from 'lucide-react';

export default function PublicationPdfButton({ pdfUrl, locale = 'uz' }) {
  const isRealPdf = Boolean(pdfUrl && /\.pdf(\?|#|$)/i.test(pdfUrl));

  const label = isRealPdf
    ? locale === 'ru'
      ? 'Открыть PDF'
      : locale === 'en'
      ? 'Open PDF'
      : 'PDF ni ochish'
    : locale === 'ru'
    ? 'Скачать PDF'
    : locale === 'en'
    ? 'Save as PDF'
    : 'PDF yuklab olish';

  if (isRealPdf) {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-primary text-xs font-semibold shrink-0"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-[#0F294A] dark:text-sky-300 cursor-pointer shrink-0"
    >
      <FileDown className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
