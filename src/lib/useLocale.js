'use client';

import { useState, useEffect } from 'react';

export function useLocale(defaultLocale = 'uz') {
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (match && ['uz', 'ru', 'en'].includes(match[1])) {
      setLocale(match[1]);
    }
  }, []);

  return locale;
}
