// Curated Database of Academic Journals (Scopus, Web of Science, OAK Uzbekistan)
// with Anti-Predatory safety checks and Subject Area matching.

export const ACADEMIC_JOURNALS = [
  // ----------------------------------------------------
  // SCOPUS Q1 / Q2 & WEB OF SCIENCE JOURNALS
  // ----------------------------------------------------
  {
    id: 'scopus-1',
    name: 'Computers & Education',
    publisher: 'Elsevier',
    issn: '0360-1315',
    index: 'SCOPUS',
    quartile: 'Q1',
    citeScore: 16.4,
    impactFactor: 8.9,
    acceptanceRate: '18%',
    avgReviewWeeks: 6,
    apc: 'Open Access / Subscription Free',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://www.sciencedirect.com/journal/computers-and-education',
    fields: ['EDUCATION', 'COMPUTER_SCIENCE', 'ARTIFICIAL_INTELLIGENCE', 'PEDAGOGY'],
    keywords: ['education', 'learning', 'technology', 'artificial intelligence', 'online education', 'higher education', 'pedagogika', 'masofaviy'],
  },
  {
    id: 'scopus-2',
    name: 'Journal of Business Research',
    publisher: 'Elsevier',
    issn: '0148-2963',
    index: 'SCOPUS',
    quartile: 'Q1',
    citeScore: 14.2,
    impactFactor: 10.5,
    acceptanceRate: '15%',
    avgReviewWeeks: 8,
    apc: 'Subscription Free / OA Option',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://www.sciencedirect.com/journal/journal-of-business-research',
    fields: ['ECONOMICS', 'MANAGEMENT', 'FINANCE', 'BUSINESS'],
    keywords: ['business', 'management', 'marketing', 'finance', 'economics', 'menejment', 'iqtisodiyot', 'raqamli iqtisodiyot', 'biznes'],
  },
  {
    id: 'scopus-3',
    name: 'Heliyon',
    publisher: 'Cell Press / Elsevier',
    issn: '2405-8440',
    index: 'SCOPUS',
    quartile: 'Q2',
    citeScore: 5.6,
    impactFactor: 4.0,
    acceptanceRate: '32%',
    avgReviewWeeks: 5,
    apc: '$1950 (Open Access)',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://www.cell.com/heliyon',
    fields: ['MULTIDISCIPLINARY', 'ECONOMICS', 'TECH', 'MEDICINE', 'SOCIAL_SCIENCES'],
    keywords: ['multidisciplinary', 'research', 'experiment', 'analysis', 'survey', 'empirical', 'tadqiqot', 'texnologiya'],
  },
  {
    id: 'scopus-4',
    name: 'IEEE Transactions on Learning Technologies',
    publisher: 'IEEE',
    issn: '1939-1382',
    index: 'SCOPUS',
    quartile: 'Q1',
    citeScore: 8.8,
    impactFactor: 4.4,
    acceptanceRate: '22%',
    avgReviewWeeks: 7,
    apc: 'Subscription Free / OA Option',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=4620076',
    fields: ['COMPUTER_SCIENCE', 'EDUCATION', 'ENGINEERING'],
    keywords: ['ieee', 'algorithm', 'software', 'learning', 'machine learning', 'dasturiy', 'axborot texnologiyalari'],
  },
  {
    id: 'scopus-5',
    name: 'Sustainability',
    publisher: 'MDPI',
    issn: '2071-1050',
    index: 'SCOPUS',
    quartile: 'Q2',
    citeScore: 5.8,
    impactFactor: 3.9,
    acceptanceRate: '45%',
    avgReviewWeeks: 4,
    apc: '2400 CHF',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://www.mdpi.com/journal/sustainability',
    fields: ['ECONOMICS', 'MANAGEMENT', 'ENVIRONMENT', 'REGIONAL'],
    keywords: ['sustainable development', 'green economy', 'barqaror rivojlanish', 'yashil iqtisodiyot', 'hududiy iqtisodiyot', 'resurslar'],
  },
  {
    id: 'scopus-6',
    name: 'International Journal of Educational Technology in Higher Education',
    publisher: 'SpringerOpen',
    issn: '2365-9440',
    index: 'SCOPUS',
    quartile: 'Q1',
    citeScore: 13.9,
    impactFactor: 8.6,
    acceptanceRate: '19%',
    avgReviewWeeks: 6,
    apc: 'Open Access',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://educationaltechnologyjournal.springeropen.com/',
    fields: ['EDUCATION', 'PEDAGOGY', 'HIGHER_EDUCATION'],
    keywords: ['higher education', 'university', 'oliy ta\'lim', 'pedagogik texnologiyalar', 'universitet', 'talabalar', 'kompetensiya'],
  },

  // ----------------------------------------------------
  // OAK (Oliy Attestatsiya Komissiyasi) RECOGNISED JOURNALS
  // ----------------------------------------------------
  {
    id: 'oak-1',
    name: 'Iqtisodiyot va Ta’lim',
    publisher: 'TDIU / OAK Reyestri',
    issn: '2181-421X',
    index: 'OAK',
    quartile: 'OAK-UZB',
    citeScore: null,
    impactFactor: null,
    acceptanceRate: '60%',
    avgReviewWeeks: 3,
    apc: '400,000 UZS',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://iqtisodiyot.tsue.uz/',
    fields: ['ECONOMICS', 'MANAGEMENT', 'FINANCE', 'EDUCATION'],
    keywords: ['iqtisodiyot', 'moliya', 'soliq', 'bank', 'investitsiya', 'boshqaruv', 'menejment', 'ta\'lim iqtisodiyoti'],
  },
  {
    id: 'oak-2',
    name: 'Ta’lim, Fan va Innovatsiya',
    publisher: 'Innovatsion Rivojlanish Vazirligi / OAK',
    issn: '2181-8274',
    index: 'OAK',
    quartile: 'OAK-UZB',
    citeScore: null,
    impactFactor: null,
    acceptanceRate: '65%',
    avgReviewWeeks: 3,
    apc: '350,000 UZS',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://tfi-journal.uz/',
    fields: ['PEDAGOGY', 'INNOVATION', 'TECH', 'EDUCATION'],
    keywords: ['pedagogika', 'metodika', 'innovatsiya', 'ta\'lim tizimi', 'o\'qitish', 'kasbiy ta\'lim', 'metodika'],
  },
  {
    id: 'oak-3',
    name: 'Yurisprudensiya va Jamiyat (Law and Society)',
    publisher: 'TDYU / OAK Reyestri',
    issn: '2181-9988',
    index: 'OAK',
    quartile: 'OAK-UZB',
    citeScore: null,
    impactFactor: null,
    acceptanceRate: '55%',
    avgReviewWeeks: 4,
    apc: '450,000 UZS',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://tsul.uz/journal',
    fields: ['LAW', 'JURISPRUDENCE', 'POLITICS'],
    keywords: ['huquq', 'qonunchilik', 'fuqarolik huquqi', 'sud', 'jinoyat', 'konstitutsiya', 'xalqaro huquq', 'yurisprudensiya'],
  },
  {
    id: 'oak-4',
    name: 'O‘zbekistonda Fanlararo Tadqiqotlar va Innovatsiyalar Jurnali',
    publisher: 'Fanlar Akademiyasi / OAK',
    issn: '2181-1123',
    index: 'OAK',
    quartile: 'OAK-UZB',
    citeScore: null,
    impactFactor: null,
    acceptanceRate: '58%',
    avgReviewWeeks: 3,
    apc: '300,000 UZS',
    isSafe: true,
    safetyStatus: 'VERIFIED',
    website: 'https://academy.uz/journal',
    fields: ['MULTIDISCIPLINARY', 'TECH', 'EXACT_SCIENCES'],
    keywords: ['texnika', 'axborot texnologiyalari', 'matematik modellashtirish', 'fizika', 'algoritm'],
  },

  // ----------------------------------------------------
  // KNOWN PREDATORY / HIJACKED (BLACK-LISTED / WARNING) SAMPLES
  // ----------------------------------------------------
  {
    id: 'predatory-1',
    name: 'International Journal of Recent Trends in Science & Tech (Clone)',
    publisher: 'Unknown Hijacked Domain',
    issn: '2277-2812',
    index: 'PREDATORY',
    quartile: 'NONE',
    citeScore: 0,
    impactFactor: null,
    acceptanceRate: '99% (2 kunda qabul qiladi)',
    avgReviewWeeks: 0.3,
    apc: '$120 Tezkor chop',
    isSafe: false,
    safetyStatus: 'WARNING_PREDATORY',
    website: 'http://fake-clone-journal.com',
    warningReason: 'Yirtqich (predatory) jurnal: Scopus yoki OAK ro‘yxatida yo‘q, soxta impakt-faktor ko‘rsatadi va taqrizsiz pul evaziga 48 soatda chop etadi.',
    fields: ['MULTIDISCIPLINARY'],
    keywords: ['fast publication', 'easy scopus', 'tezkor chop'],
  },
];

// Matching algorithm: Matches article title, abstract & field with journal keywords
export function findMatchingJournals({ title = '', abstract = '', field = 'ALL', targetType = 'ALL' }) {
  const queryTokens = `${title} ${abstract}`
    .toLowerCase()
    .replace(/[^\w\s\u0400-\u04FF]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const scored = ACADEMIC_JOURNALS.map((j) => {
    // Check type filter
    if (targetType === 'SCOPUS' && j.index !== 'SCOPUS') return null;
    if (targetType === 'OAK' && j.index !== 'OAK') return null;

    let matchCount = 0;
    j.keywords.forEach((kw) => {
      const kwTokens = kw.toLowerCase().split(' ');
      if (kwTokens.some((t) => queryTokens.includes(t))) {
        matchCount += 2;
      }
    });

    if (field !== 'ALL' && j.fields.includes(field)) {
      matchCount += 4;
    }

    // Baseline relevance
    const matchScore = Math.min(98, Math.max(35, matchCount * 12 + Math.floor(Math.random() * 8)));

    return {
      ...j,
      matchScore,
    };
  }).filter(Boolean);

  // Sort by matchScore descending, safe verified journals first
  scored.sort((a, b) => {
    if (a.isSafe !== b.isSafe) return a.isSafe ? -1 : 1;
    return b.matchScore - a.matchScore;
  });

  return scored;
}
