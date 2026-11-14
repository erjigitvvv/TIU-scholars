'use client';

import { useState } from 'react';

// Har bir olimga ism bo'yicha avtomatik beriladigan boy va kontrastli monogramma ranglari
const MONOGRAM_PALETTES = [
  {
    bg: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #9A3412 0%, #F97316 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #9F1239 0%, #F43F5E 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #155E75 0%, #06B6D4 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #115E59 0%, #14B8A6 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #86198F 0%, #D946EF 100%)',
    text: '#FFFFFF',
  },
  {
    bg: 'linear-gradient(135deg, #0F294A 0%, #2563EB 100%)',
    text: '#FFFFFF',
  },
];

function stripTitles(rawName = '') {
  return String(rawName)
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

function getInitials(rawName = '') {
  const clean = stripTitles(rawName);
  if (!clean) return 'TI';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function getPaletteForName(rawName = '', fallbackIndex = 0) {
  const clean = stripTitles(rawName);
  if (!clean) {
    return MONOGRAM_PALETTES[fallbackIndex % MONOGRAM_PALETTES.length];
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return MONOGRAM_PALETTES[hash % MONOGRAM_PALETTES.length];
}

function getFontSizeClass(className = '') {
  if (className.includes('w-24') || className.includes('w-28') || className.includes('w-32')) {
    return 'text-2xl sm:text-3xl';
  }
  if (className.includes('w-20')) {
    return 'text-xl';
  }
  if (className.includes('w-16') || className.includes('w-14')) {
    return 'text-lg';
  }
  if (className.includes('w-12') || className.includes('w-11') || className.includes('w-10')) {
    return 'text-sm';
  }
  return 'text-xs';
}

export default function ScholarAvatar({
  photoUrl,
  fullName = '',
  index = 0,
  className = 'w-9 h-9',
}) {
  const [imgError, setImgError] = useState(false);
  const hasCustomRing = className.includes('ring-');
  const ringClass = hasCustomRing ? '' : 'ring-2 ring-white shadow-sm';
  const cleanName = stripTitles(fullName) || fullName;

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={cleanName}
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover shrink-0 ${ringClass}`}
      />
    );
  }

  const initials = getInitials(fullName);
  const palette = getPaletteForName(fullName, index);
  const fontSizeClass = getFontSizeClass(className);

  return (
    <div
      title={cleanName}
      aria-label={cleanName}
      className={`${className} rounded-full overflow-hidden ${ringClass} shrink-0 flex items-center justify-center select-none font-heading font-extrabold tracking-tight`}
      style={{
        background: palette.bg,
        color: palette.text,
      }}
    >
      <span className={`${fontSizeClass} leading-none drop-shadow-2xs`}>{initials}</span>
    </div>
  );
}
