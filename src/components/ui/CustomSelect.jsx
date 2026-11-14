'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Info } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  disabledHint = '',
  icon: Icon = null,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className={`relative group/select ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        title={disabled && disabledHint ? disabledHint : displayLabel}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-all outline-none ${
          disabled
            ? 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : open
            ? 'bg-white dark:bg-slate-800 border-blue-500 dark:border-sky-500 ring-2 ring-blue-500/15 text-slate-900 dark:text-white shadow-xs cursor-pointer'
            : 'bg-slate-50/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 cursor-pointer'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          )}
          <span className="truncate font-medium">{displayLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-blue-600 dark:text-sky-400' : ''
          }`}
        />
      </button>

      {/* O'chirilgan (disabled) holatda sababini ko'rsatuvchi izoh va tooltip */}
      {disabled && disabledHint && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600/90 dark:text-amber-400/90 font-medium px-1">
          <Info className="w-3 h-3 shrink-0" />
          <span className="truncate">{disabledHint}</span>
        </div>
      )}

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xl py-1.5 max-h-64 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-slate-800 text-[#0F294A] dark:text-sky-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0F294A] dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
