/**
 * Ochiq Ilmiy Grant Tanlovlari Katalogi (Open Grant Calls Catalogue)
 */

export const OPEN_GRANT_CALLS = [
  {
    id: 'call-inno-applied-2026',
    title: 'Amaliy Tadqiqotlar Ilmiy Loyihalari Tanlovi (2026–2028)',
    funder: 'O‘zbekiston Respublikasi Oliy ta’lim, fan va innovatsiyalar vazirligi',
    program: 'Davlat Ilmiy Dasturlari (Amaliy)',
    category: 'NATIONAL',
    maxBudget: 1500000000, // 1.5 milliard so'm
    currency: 'UZS',
    deadline: '2026-05-15T23:59:59',
    durationMonths: 24,
    eligibility: 'Ilmiy darajaga ega olimlar (PhD, DSc) va tadqiqot jamoalari',
    description:
      'Iqtisodiyot tarmoqlari va ijtimoiy soha muammolarining ilmiy yechimiga, yangi texnologiyalar va innovatsiyalarni yaratishga qaratilgan amaliy ilmiy loyihalar.',
    priorityAreas: ['Axborot texnologiyalari va Sunʼiy intellekt', 'Raqamli iqtisodiyot', 'Tibbiyot va biotexnologiyalar', 'Muqobil energetika'],
    requiredDocs: [
      'Loyiha pasporti va ilmiy asosnomasi',
      'Universitet Ilmiy Kengashi xulosasi',
      'Moliyaviy smeta va asosnoma (buxgalteriya tasdig‘i bilan)',
      'Buyurtmachi tashkilot kafolat xati (tijoratlashtirish uchun)',
      'Jamoa aʼzolari ilmiy CV-maʼlumotnomasi',
    ],
  },
  {
    id: 'call-young-scholars-2026',
    title: '«Bo‘lajak Olim» Yosh Tadqiqotchilar Startap va Innovatsion Tanlovi',
    funder: 'Innovatsion rivojlanish agentligi',
    program: 'Yosh Olimlar Dasturi',
    category: 'YOUTH',
    maxBudget: 350000000, // 350 million so'm
    currency: 'UZS',
    deadline: '2026-06-30T23:59:59',
    durationMonths: 12,
    eligibility: '40 yoshgacha bo‘lgan doktorantlar, mustaqil izlanuvchilar va yosh olimlar',
    description:
      'Yosh olimlarning startap g‘oyalari, yangi mahsulot prototiplari va amaliy innovatsion ishlanmalarini moliyalashtirish.',
    priorityAreas: ['EdTech va ta’lim texnologiyalari', 'Agro-innovatsiyalar', 'Yashil iqtisodiyot', 'Sunʼiy intellekt'],
    requiredDocs: [
      'Ariza va biznes-model (Lean Canvas)',
      'Texnik-iqtisodiy asosnoma (Smeta)',
      'Tashkilot yo‘llanma xati',
      'Prototip yoki dastlabki natijalar videosi/taqdimoti',
    ],
  },
  {
    id: 'call-erasmus-cbhe-2026',
    title: 'Erasmus+ Capacity Building in Higher Education (CBHE Strand 2)',
    funder: 'Yevropa Ittifoqi (European Commission)',
    program: 'Erasmus+ International Cooperation',
    category: 'INTERNATIONAL',
    maxBudget: 400000, // 400,000 EUR
    currency: 'EUR',
    deadline: '2026-06-10T17:00:00',
    durationMonths: 36,
    eligibility: 'Oliy ta’lim muassasalari konsortsiumi (kamida 2 ta YI va 2 ta O‘zbekiston OTMlari)',
    description:
      'Oliy ta’lim o‘quv dasturlarini xalqaro standartlarga moslashtirish, universitet-sanoat hamkorligi va akademik salohiyatni yuksaltirish.',
    priorityAreas: ['Digital Education & Modern Pedagogy', 'Green Skills', 'Governance & Quality Assurance'],
    requiredDocs: [
      'Detailed Project Proposal (Part B)',
      'Mandate Letters from each partner university',
      'Work Package Matrix & Deliverables Plan',
      'Budget & Lump Sum Financial Breakdown',
    ],
  },
  {
    id: 'call-horizon-green-2026',
    title: 'Horizon Europe — AI & Green Energy Transition Collaborative Grant',
    funder: 'Yevropa Ittifoqi Horizon Europe',
    program: 'Cluster 4: Digital, Industry & Space',
    category: 'INTERNATIONAL',
    maxBudget: 1200000, // 1,200,000 EUR
    currency: 'EUR',
    deadline: '2026-09-15T17:00:00',
    durationMonths: 36,
    eligibility: 'Xalqaro ilmiy konsortsium a’zosi sifatida qatnashuvchi universitetlar',
    description:
      'Iqlim o‘zgarishiga qarshi kurash, energiya samaradorligini oshirishda sun’iy intellekt modellarini qo‘llash.',
    priorityAreas: ['Artificial Intelligence', 'Smart Grids', 'Climate Resilience'],
    requiredDocs: [
      'Full Technical Annex',
      'Consortium Agreement (CA)',
      'Data Management Plan (DMP)',
      'Ethics Self-Assessment',
    ],
  },
];
