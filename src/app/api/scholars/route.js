import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INTEREST_TRANSLATIONS = {
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

function getFallbackInterests(dept) {
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

function parseRawInterests(raw, dept) {
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

function normalizeStr(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/['’`ʻʼ]/g, "'")
    .trim();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const facultyId = searchParams.get('faculty') || searchParams.get('facultyId') || '';
    const departmentId = searchParams.get('dept') || searchParams.get('departmentId') || '';
    const rawDegree = (
      searchParams.get('degree') ||
      searchParams.get('academicDegree') ||
      ''
    ).toUpperCase();
    const rawTitle = (
      searchParams.get('title') ||
      searchParams.get('academicTitle') ||
      ''
    ).toUpperCase();
    const sort = searchParams.get('sort') || searchParams.get('sortBy') || 'score';

    const where = {
      user: { accountStatus: 'ACTIVE' },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (facultyId) {
      where.department = { facultyId };
    }

    if (rawDegree && rawDegree !== 'ALL') {
      where.academicDegree = rawDegree;
    }

    if (rawTitle && rawTitle !== 'ALL') {
      where.academicTitle = rawTitle;
    }

    let orderBy = [{ tiuScore: 'desc' }, { hIndex: 'desc' }];
    if (sort === 'hIndex') {
      orderBy = [{ hIndex: 'desc' }, { tiuScore: 'desc' }];
    } else if (sort === 'name') {
      orderBy = [{ fullName: 'asc' }];
    }

    const [rawScholars, faculties] = await Promise.all([
      prisma.scholarProfile.findMany({
        where,
        include: {
          department: {
            include: { faculty: true },
          },
          publications: {
            where: { publication: { status: 'APPROVED' } },
            include: { publication: true },
          },
        },
        orderBy,
      }),
      prisma.faculty.findMany({
        include: {
          departments: {
            orderBy: { nameUz: 'asc' },
          },
        },
        orderBy: { nameUz: 'asc' },
      }),
    ]);

    // Har bir olimda researchInterests bo'lishini kafolatlash
    let scholars = rawScholars.map((s) => {
      const tags = parseRawInterests(s.researchInterests, s.department);
      return {
        ...s,
        researchInterests: JSON.stringify(tags),
      };
    });

    // Qidiruv (ism, 3 tildagi research interest teglari va 3 tildagi kafedra nomi bo'yicha)
    if (q) {
      const normQ = normalizeStr(q);
      scholars = scholars.filter((s) => {
        const tags = parseRawInterests(s.researchInterests, s.department);
        const allTagStrings = tags.flatMap((tag) => {
          const tr = INTEREST_TRANSLATIONS[tag];
          return tr ? [tag, tr.uz, tr.ru, tr.en] : [tag];
        });
        const haystack = [
          s.fullName,
          s.department?.nameUz,
          s.department?.nameRu,
          s.department?.nameEn,
          ...allTagStrings,
        ]
          .filter(Boolean)
          .map(normalizeStr)
          .join(' | ');
        return haystack.includes(normQ);
      });
    }

    if (sort === 'pubs' || sort === 'publications') {
      scholars.sort((a, b) => {
        const countA = a.publications.length;
        const countB = b.publications.length;
        if (countB !== countA) return countB - countA;
        return (b.tiuScore || 0) - (a.tiuScore || 0);
      });
    } else if (sort === 'name') {
      const stripPrefix = (n = '') =>
        n.replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '').trim();
      scholars.sort((a, b) => stripPrefix(a.fullName).localeCompare(stripPrefix(b.fullName)));
    }

    return Response.json({ scholars, faculties });
  } catch (error) {
    console.error('API GET /api/scholars error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
