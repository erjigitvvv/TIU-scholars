'use client';

import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function PublicationReaderSection({
  abstractTitle,
  abstractText,
  pdfUrl,
  locale = 'uz',
}) {
  const isPdf = Boolean(pdfUrl && /\.pdf(\?|#|$)/i.test(pdfUrl));
  const [showPdf, setShowPdf] = useState(isPdf);
  const [expandedText, setExpandedText] = useState(false);

  const isLongText = (abstractText || '').length > 320;

  const t = {
    uz: {
      readMore: 'To‘liq o‘qish',
      showLess: 'Qisqartirish',
      pdfTitle: 'PDF hujjat ko‘rinishi',
      openViewer: 'PDF ni sahifada ochish',
      hideViewer: 'PDF ni yashirish',
      download: 'Yuklab olish',
      newTab: 'Yangi oynada ochish',
    },
    ru: {
      readMore: 'Читать полностью',
      showLess: 'Свернуть',
      pdfTitle: 'Просмотр PDF-документа',
      openViewer: 'Открыть PDF на странице',
      hideViewer: 'Скрыть PDF',
      download: 'Скачать',
      newTab: 'Открыть в новой вкладке',
    },
    en: {
      readMore: 'Read Full Text',
      showLess: 'Show Less',
      pdfTitle: 'PDF Document Viewer',
      openViewer: 'Open PDF Inline',
      hideViewer: 'Hide PDF',
      download: 'Download',
      newTab: 'Open in New Tab',
    },
  }[locale] || {
    readMore: 'To‘liq o‘qish',
    showLess: 'Qisqartirish',
    pdfTitle: 'PDF hujjat ko‘rinishi',
    openViewer: 'PDF ni sahifada ochish',
    hideViewer: 'PDF ni yashirish',
    download: 'Yuklab olish',
    newTab: 'Yangi oynada ochish',
  };

  return (
    <div className="space-y-6">
      {/* Long-text safe Abstract Box */}
      <div className="p-5 rounded-2xl neu-card-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            {abstractTitle}
          </h2>
          {isPdf && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold">
              <FileText className="w-3 h-3" /> PDF
            </span>
          )}
        </div>

        <p
          className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words ${
            !expandedText && isLongText ? 'line-clamp-4' : ''
          }`}
        >
          {abstractText}
        </p>

        {isLongText && (
          <button
            type="button"
            onClick={() => setExpandedText((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-[#0F294A] dark:text-sky-300 cursor-pointer"
          >
            {expandedText ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{t.showLess}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>{t.readMore}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Inline PDF Viewer when publication URL points to a PDF */}
      {isPdf && (
        <div className="p-5 rounded-2xl neu-card-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-[#0F294A] dark:text-white">
                {t.pdfTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPdf((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-primary text-xs font-semibold cursor-pointer"
              >
                {showPdf ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>{t.hideViewer}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{t.openViewer}</span>
                  </>
                )}
              </button>

              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.download}</span>
              </a>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.newTab}</span>
              </a>
            </div>
          </div>

          {showPdf && (
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-white">
              <iframe
                src={pdfUrl}
                title={t.pdfTitle}
                className="w-full h-[75vh] min-h-[480px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
