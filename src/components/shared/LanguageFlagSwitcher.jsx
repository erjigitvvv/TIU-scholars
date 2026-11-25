'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

function FlagIcon({ code, className = 'w-5 h-3.5 rounded-[3px] shrink-0 shadow-2xs overflow-hidden' }) {
  if (code === 'uz') {
    return (
      <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
        <rect width="36" height="8" y="0" fill="#1EB53A" opacity="0" />
        <rect width="36" height="7.5" y="0" fill="#0099B5" />
        <rect width="36" height="1" y="7.5" fill="#CE1126" />
        <rect width="36" height="7" y="8.5" fill="#FFFFFF" />
        <rect width="36" height="1" y="15.5" fill="#CE1126" />
        <rect width="36" height="7.5" y="16.5" fill="#1EB53A" />
        <circle cx="6.2" cy="3.8" r="2.2" fill="#FFFFFF" />
        <circle cx="7" cy="3.8" r="1.8" fill="#0099B5" />
        <circle cx="10.2" cy="2.6" r="0.55" fill="#FFFFFF" />
        <circle cx="12.2" cy="2.6" r="0.55" fill="#FFFFFF" />
        <circle cx="10.2" cy="4.8" r="0.55" fill="#FFFFFF" />
        <circle cx="12.2" cy="4.8" r="0.55" fill="#FFFFFF" />
        <circle cx="14.2" cy="4.8" r="0.55" fill="#FFFFFF" />
      </svg>
    );
  }
  if (code === 'ru') {
    return (
      <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
        <rect width="36" height="8" y="0" fill="#FFFFFF" />
        <rect width="36" height="8" y="8" fill="#0039A6" />
        <rect width="36" height="8" y="16" fill="#D52B1E" />
      </svg>
    );
  }
  // 'en' -> UK Union Jack
  return (
    <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
      <rect width="36" height="24" fill="#012169" />
      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#FFFFFF" strokeWidth="4.5" />
      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M18,0 L18,24 M0,12 L36,12" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M18,0 L18,24 M0,12 L36,12" stroke="#C8102E" strokeWidth="4" />
    </svg>
  );
}

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
];

function persistLocaleCookie(code) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
}

export default function LanguageFlagSwitcher({
  locale = 'uz',
  transparent = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const activeLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setOpen(false);
    if (code === locale) return;
    persistLocaleCookie(code);
    window.location.reload();
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Language: ${activeLang.label}`}
        className={`inline-flex items-center gap-2 ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5 sm:py-2'
        } rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
          transparent
            ? 'text-white bg-white/15 hover:bg-white/25 border-white/25 backdrop-blur-md shadow-xs'
            : 'glass-btn text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700'
        }`}
      >
        <FlagIcon code={activeLang.code} />
        <span className="hidden sm:inline">{activeLang.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${transparent ? 'text-white/80' : 'text-slate-400'}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700 shadow-2xl p-1.5 z-[120] overflow-hidden"
          >
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <motion.button
                  key={lang.code}
                  type="button"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-sky-950/60 text-[#0F294A] dark:text-sky-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FlagIcon code={lang.code} />
                    <span>{lang.label}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
