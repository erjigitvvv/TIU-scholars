export const INTEREST_TRANSLATIONS = {
  'Makroiqtisodiy tahlil': {
    uz: 'Makroiqtisodiy tahlil',
    ru: 'Макроэкономический анализ',
    en: 'Macroeconomic Analysis',
  },
  'Korporativ moliya': {
    uz: 'Korporativ moliya',
    ru: 'Корпоративные финансы',
    en: 'Corporate Finance',
  },
  'Yashil iqtisodiyot': {
    uz: 'Yashil iqtisodiyot',
    ru: 'Зеленая экономика',
    en: 'Green Economy',
  },
  'FinTech va bank ishi': {
    uz: 'FinTech va bank ishi',
    ru: 'FinTech и банковское дело',
    en: 'FinTech & Banking',
  },
  'Qiyosiy tilshunoslik': {
    uz: 'Qiyosiy tilshunoslik',
    ru: 'Сравнительное языкознание',
    en: 'Comparative Linguistics',
  },
  'Akademik ingliz tili': {
    uz: 'Akademik ingliz tili',
    ru: 'Академический английский язык',
    en: 'Academic English (ESP)',
  },
  Tarjimashunoslik: {
    uz: 'Tarjimashunoslik',
    ru: 'Переводоведение',
    en: 'Translation Studies',
  },
  'Korpus lingvistikasi': {
    uz: 'Korpus lingvistikasi',
    ru: 'Корпусная лингвистика',
    en: 'Corpus Linguistics',
  },
  'Sun’iy intellekt': {
    uz: 'Sun’iy intellekt',
    ru: 'Искусственный интеллект',
    en: 'Artificial Intelligence',
  },
  Kiberxavfsizlik: {
    uz: 'Kiberxavfsizlik',
    ru: 'Кибербезопасность',
    en: 'Cybersecurity',
  },
  'Ma’lumotlar tahlili': {
    uz: 'Ma’lumotlar tahlili',
    ru: 'Анализ данных',
    en: 'Data Analytics',
  },
  'Bulutli hisoblash': {
    uz: 'Bulutli hisoblash',
    ru: 'Облачные вычисления',
    en: 'Cloud Computing',
  },
  'Oliy ta’lim menejmenti': {
    uz: 'Oliy ta’lim menejmenti',
    ru: 'Менеджмент высшего образования',
    en: 'Higher Education Management',
  },
  'Raqamli pedagogika': {
    uz: 'Raqamli pedagogika',
    ru: 'Цифровая педагогика',
    en: 'Digital Pedagogy',
  },
  'Ta’lim sifati': {
    uz: 'Ta’lim sifati',
    ru: 'Качество образования',
    en: 'Education Quality Assurance',
  },
  'Kognitiv psixologiya': {
    uz: 'Kognitiv psixologiya',
    ru: 'Когнитивная психология',
    en: 'Cognitive Psychology',
  },
  'Xalqaro xususiy huquq': {
    uz: 'Xalqaro xususiy huquq',
    ru: 'Международное частное право',
    en: 'Private International Law',
  },
  'Konstitutsiyaviy huquq': {
    uz: 'Konstitutsiyaviy huquq',
    ru: 'Конституционное право',
    en: 'Constitutional Law',
  },
  'Raqamli huquq va arbitraj': {
    uz: 'Raqamli huquq va arbitraj',
    ru: 'Цифровое право и арбитраж',
    en: 'Digital Law & Arbitration',
  },
  'Fuqarolik huquqi': {
    uz: 'Fuqarolik huquqi',
    ru: 'Гражданское право',
    en: 'Civil Law',
  },
};

export function getFallbackInterests(dept) {
  const name = `${dept?.nameUz || ''} ${dept?.nameEn || ''}`.toLowerCase();
  if (name.includes('iqtisod') || name.includes('econ') || name.includes('moliya')) {
    return ['Makroiqtisodiy tahlil', 'Korporativ moliya', 'Yashil iqtisodiyot'];
  }
  if (name.includes('til') || name.includes('lang')) {
    return ['Qiyosiy tilshunoslik', 'Akademik ingliz tili', 'Tarjimashunoslik'];
  }
  if (name.includes('aniq') || name.includes('raqamli') || name.includes('digital') || name.includes('exact')) {
    return ['Sun’iy intellekt', 'Kiberxavfsizlik', 'Ma’lumotlar tahlili'];
  }
  if (name.includes('ijtimoiy') || name.includes('social') || name.includes('pedagog')) {
    return ['Oliy ta’lim menejmenti', 'Raqamli pedagogika', 'Ta’lim sifati'];
  }
  if (name.includes('yuris') || name.includes('huquq') || name.includes('juris')) {
    return ['Xalqaro xususiy huquq', 'Raqamli huquq va arbitraj', 'Konstitutsiyaviy huquq'];
  }
  return ['Makroiqtisodiy tahlil', 'Sun’iy intellekt'];
}

export function parseRawInterests(raw, dept) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
      return parsed.filter(Boolean);
    }
  } catch {
    if (typeof raw === 'string' && raw.trim()) {
      const split = raw.split(',').map((s) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
  }
  return getFallbackInterests(dept);
}

export function normalizeStr(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/['’`ʻʼ]/g, "'")
    .trim();
}

export function getSearchableInterestStrings(tags = []) {
  return tags.flatMap((tag) => {
    const tr = INTEREST_TRANSLATIONS[tag];
    return tr ? [tag, tr.uz, tr.ru, tr.en] : [tag];
  });
}
