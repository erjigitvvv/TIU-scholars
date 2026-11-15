'use client';

import { useState } from 'react';
import { Copy, Check, Quote } from 'lucide-react';

export default function PublicationCitationBox({
  title,
  authorsText,
  bibtexAuthors,
  journal,
  year,
  doi,
  type,
  labelTitle,
  copyLabel,
  copiedLabel,
}) {
  const [format, setFormat] = useState('APA');
  const [copied, setCopied] = useState(false);

  const apaText = `${authorsText} (${year}). ${title}. ${journal}.${doi ? ` https://doi.org/${doi}` : ''}`;
  const ieeeText = `${authorsText}, "${title}," ${journal}, ${year}.${doi ? ` doi: ${doi}.` : ''}`;
  const key = `${(bibtexAuthors.split(',')[0] || 'tiu').trim().split(' ').pop()?.toLowerCase() || 'tiu'}${year}`;
  const entryType =
    type === 'CONFERENCE' ? 'inproceedings' : type === 'MONOGRAPH' ? 'book' : 'article';
  const bibtexText = `@${entryType}{${key},\n  title={${title}},\n  author={${bibtexAuthors}},\n  journal={${journal}},\n  year={${year}}${doi ? `,\n  doi={${doi}}` : ''}\n}`;

  const activeText = format === 'APA' ? apaText : format === 'IEEE' ? ieeeText : bibtexText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="rounded-2xl neu-card-sm p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{labelTitle}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {['APA', 'IEEE', 'BibTeX'].map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                format === fmt
                  ? 'glass-btn-primary'
                  : 'glass-btn text-slate-700 dark:text-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg glass-btn text-xs font-semibold text-slate-700 dark:text-slate-200 ml-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">{copiedLabel}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{copyLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <pre className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-3.5 whitespace-pre-wrap break-words font-mono leading-relaxed">
        {activeText}
      </pre>
    </div>
  );
}
