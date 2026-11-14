const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed (SQLite mode with 30+ publications)...');

  // Clean up database safely in correct order
  await prisma.auditLog.deleteMany();
  await prisma.publicationAuthor.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.grantProject.deleteMany();
  await prisma.supervision.deleteMany();
  await prisma.kpiTarget.deleteMany();
  await prisma.scoringConfig.deleteMany();
  await prisma.scholarProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data.');

  // 1. Scoring Config
  await prisma.scoringConfig.create({
    data: {
      scopusWeight: 10,
      q1Q2Bonus: 5,
      wosWeight: 10,
      oakWeight: 5,
      monographWeight: 7,
      patentWeight: 6,
      conferenceWeight: 2,
      citationWeight: 0.2,
    },
  });

  // 2. Faculties & Departments (2 ta asosiy fakultet va ularning kafedralari)
  const facultiesData = [
    {
      code: 'BITF',
      nameUz: "Biznes va innovatsion ta'lim fakulteti",
      nameRu: 'Факультет бизнеса и инновационного образования',
      nameEn: 'Faculty of Business and Innovative Education',
      departments: [
        {
          nameUz: 'Iqtisodiyot va moliya kafedrasi',
          nameRu: 'Кафедра экономики и финансов',
          nameEn: 'Department of Economics and Finance',
        },
        {
          nameUz: 'Xorijiy tillar kafedrasi',
          nameRu: 'Кафедра иностранных языков',
          nameEn: 'Department of Foreign Languages',
        },
        {
          nameUz: 'Aniq fanlar va raqamli texnologiyalar kafedrasi',
          nameRu: 'Кафедра точных наук и цифровых технологий',
          nameEn: 'Department of Exact Sciences and Digital Technologies',
        },
        {
          nameUz: "Ijtimoiy fanlar va ta’lim kafedrasi",
          nameRu: 'Кафедра социальных наук и образования',
          nameEn: 'Department of Social Sciences and Education',
        },
      ],
    },
    {
      code: 'YURF',
      nameUz: 'Yurisprudensiya fakulteti',
      nameRu: 'Факультет юриспруденции',
      nameEn: 'Faculty of Jurisprudence',
      departments: [
        {
          nameUz: 'Yurisprudensiya kafedrasi',
          nameRu: 'Кафедра юриспруденции',
          nameEn: 'Department of Jurisprudence',
        },
      ],
    },
  ];

  const createdDepartments = [];

  for (const f of facultiesData) {
    const faculty = await prisma.faculty.create({
      data: {
        code: f.code,
        nameUz: f.nameUz,
        nameRu: f.nameRu,
        nameEn: f.nameEn,
      },
    });

    for (const d of f.departments) {
      const dept = await prisma.department.create({
        data: {
          facultyId: faculty.id,
          nameUz: d.nameUz,
          nameRu: d.nameRu,
          nameEn: d.nameEn,
        },
      });
      createdDepartments.push(dept);
    }
  }

  console.log(`🏫 Created ${facultiesData.length} faculties and ${createdDepartments.length} departments.`);

  // 3. Users & Scholars
  const passwordHash = await bcrypt.hash('Scholar123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  // Super Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tiu.uz',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE',
    },
  });

  // Moderator
  const modUser = await prisma.user.create({
    data: {
      email: 'moderator@tiu.uz',
      passwordHash: adminPasswordHash,
      role: 'MODERATOR',
      accountStatus: 'ACTIVE',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'SYSTEM_SEED',
      entityType: 'System',
      entityId: 'initial',
      details: JSON.stringify({ message: 'Seeded initial database successfully' }),
    },
  });

  const DEPT_INTERESTS = {
    0: ['Makroiqtisodiy tahlil', 'Korporativ moliya', 'Yashil iqtisodiyot', 'FinTech va bank ishi'],
    1: ['Qiyosiy tilshunoslik', 'Akademik ingliz tili', 'Tarjimashunoslik', 'Korpus lingvistikasi'],
    2: ['Sun’iy intellekt', 'Kiberxavfsizlik', 'Ma’lumotlar tahlili', 'Bulutli hisoblash'],
    3: ['Oliy ta’lim menejmenti', 'Raqamli pedagogika', 'Ta’lim sifati', 'Kognitiv psixologiya'],
    4: ['Xalqaro xususiy huquq', 'Konstitutsiyaviy huquq', 'Raqamli huquq va arbitraj', 'Fuqarolik huquqi'],
  };

  const scholarNames = [
    { fullName: 'Prof. Alisher Turgunov', email: 'a.turgunov@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 0, h: 18, citations: 1240, score: 95.5 },
    { fullName: 'Dr. Nilufar Karimova', email: 'n.karimova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 0, h: 12, citations: 620, score: 78.0 },
    { fullName: 'Dr. Jamshid Rakhimov', email: 'j.rakhimov@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 1, h: 14, citations: 810, score: 82.5 },
    { fullName: 'Prof. Dilbar Umarova', email: 'd.umarova@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 2, h: 16, citations: 950, score: 88.0 },
    { fullName: 'Dr. Bekzod Kasimov', email: 'b.kasimov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 1, h: 8, citations: 310, score: 54.0 },
    { fullName: 'Dr. Malika Azizova', email: 'm.azizova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 3, h: 11, citations: 490, score: 69.5 },
    { fullName: 'Prof. Rustam Fayziyev', email: 'r.fayziyev@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 2, h: 21, citations: 1650, score: 104.0 },
    { fullName: 'Dr. Zulfiya Saidova', email: 'z.saidova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 4, h: 9, citations: 380, score: 61.0 },
    { fullName: 'Dr. Sanjarbek Normatov', email: 's.normatov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 4, h: 6, citations: 210, score: 48.0 },
    { fullName: 'Dr. Gulchehra Sharipova', email: 'g.sharipova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 4, h: 10, citations: 440, score: 65.0 },
    { fullName: 'Azizbek Kadirov', email: 'a.kadirov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 0, h: 3, citations: 45, score: 20.0, pending: true },
    { fullName: 'Madina Tursunova', email: 'm.tursunova@tiu.uz', degree: 'NONE', title: 'ASSISTANT', deptIndex: 2, h: 1, citations: 12, score: 10.0, pending: true },
  ];

  const createdScholars = [];
  const scholarsByDept = { 0: [], 1: [], 2: [], 3: [], 4: [] };

  for (const s of scholarNames) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        role: 'SCHOLAR',
        accountStatus: s.pending ? 'PENDING' : 'ACTIVE',
        rejectionReason: s.pending ? 'Awaiting verification of documents by moderator.' : null,
      },
    });

    const scholar = await prisma.scholarProfile.create({
      data: {
        userId: user.id,
        departmentId: createdDepartments[s.deptIndex].id,
        fullName: s.fullName,
        academicDegree: s.degree,
        academicTitle: s.title,
        bioUz: `${s.fullName} — Toshkent xalqaro universitetining ${createdDepartments[s.deptIndex].nameUz} yetakchi tadqiqotchisi va olimi.`,
        bioRu: `${s.fullName} — ведущий исследователь и ученый Ташкентского международного университета.`,
        bioEn: `${s.fullName} is a leading researcher and scholar at Tashkent International University.`,
        researchInterests: JSON.stringify(DEPT_INTERESTS[s.deptIndex] || DEPT_INTERESTS[0]),
        publicEmail: s.email,
        orcidId: `0000-0002-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        scopusId: `${Math.floor(550000000 + Math.random() * 99999999)}`,
        googleScholarUrl: `https://scholar.google.com/citations?user=sample_${Math.floor(100 + Math.random() * 900)}`,
        hIndex: s.h,
        totalCitations: s.citations,
        tiuScore: s.score,
      },
    });

    if (!s.pending) {
      createdScholars.push(scholar);
      scholarsByDept[s.deptIndex].push(scholar);
    }
  }

  console.log(`👨‍🎓 Created ${scholarNames.length} scholars (${createdScholars.length} active, 2 pending).`);

  // 4. Publications (Har bir kafedra yo'nalishiga 100% mos, toza sarlavhali va aniq tasdiqlangan sanaga ega nashrlar)
  const samplePublications = [
    // Eng so'nggi tasdiqlangan nashrlar (yuqorida ko'rinadi)
    { title: 'Cross-Border Commercial Arbitration and Lex Mercatoria in Central Asian Jurisdiction', type: 'SCOPUS', journal: 'Journal of International Dispute Settlement', quartile: 'Q1', year: 2025, doi: '10.1093/jnlids/idaf012', deptIndex: 4, citations: 19, approvedAt: '2025-03-18T10:30:00Z', extraAuthors: 3 },
    { title: 'Econometric Modeling of Green Banking and Sustainable Finance in Emerging Markets', type: 'SCOPUS', journal: 'Journal of Business Research', quartile: 'Q1', year: 2025, doi: '10.1016/j.jbusres.2025.112233', deptIndex: 0, citations: 34, approvedAt: '2025-03-15T14:20:00Z', extraAuthors: 2 },
    { title: 'Transformer-Based Multilingual Neural Architectures for Low-Resource Turkic Languages', type: 'WOS', journal: 'IEEE Transactions on Neural Networks and Learning Systems', quartile: 'Q1', year: 2025, doi: '10.1109/TNNLS.2025.3123456', deptIndex: 2, citations: 42, approvedAt: '2025-03-12T09:15:00Z', extraAuthors: 3 },
    { title: 'Raqamli iqtisodiyot sharoitida fuqarolik-huquqiy shartnomalar va smart-kontraktlarni tartibga solish', type: 'OAK', journal: 'Huquq va Burch ilmiy-amaliy jurnali', quartile: 'NONE', year: 2025, doi: null, deptIndex: 4, citations: 0, approvedAt: '2025-03-09T16:40:00Z', extraAuthors: 1 },
    { title: 'Mintaqaviy investitsiya muhitini yaxshilashda fiskal siyosat va soliq imtiyozlarining roli', type: 'LOCAL_JOURNAL', journal: 'Iqtisodiy Taraqqiyot va Tahlil', quartile: 'NONE', year: 2025, doi: null, deptIndex: 0, citations: 0, approvedAt: '2025-03-05T11:10:00Z', extraAuthors: 2 },
    { title: 'Zero-Trust Cybersecurity Architecture for Distributed Cloud and FinTech Infrastructures', type: 'SCOPUS', journal: 'Computers & Security', quartile: 'Q1', year: 2025, doi: '10.1016/j.cose.2025.103344', deptIndex: 2, citations: 27, approvedAt: '2025-02-28T15:00:00Z', extraAuthors: 1 },
    { title: 'Comparative Legal Frameworks for Central Bank Digital Currencies (CBDC) and FinTech Regulation', type: 'WOS', journal: 'International Journal of Law and Management', quartile: 'Q2', year: 2025, doi: '10.1108/IJLMA-03-2025-0089', deptIndex: 4, citations: 15, approvedAt: '2025-02-24T13:25:00Z', extraAuthors: 2 },
    { title: 'Intellektual transport oqimlarini Edge-AI yordamida avtomatlashtirilgan boshqarish tizimi', type: 'PATENT', journal: 'O‘zbekiston Respublikasi Adliya vazirligi Intellektual mulk departamenti', quartile: 'NONE', year: 2025, doi: null, deptIndex: 2, citations: 0, approvedAt: '2025-02-19T10:00:00Z', extraAuthors: 3 },
    { title: 'Cognitive Pragmatics and Corpus-Based Analysis of Specialized Academic Discourse', type: 'SCOPUS', journal: 'System: An International Journal of Educational Technology and Applied Linguistics', quartile: 'Q1', year: 2025, doi: '10.1016/j.system.2025.103210', deptIndex: 1, citations: 23, approvedAt: '2025-02-14T12:00:00Z', extraAuthors: 1 },
    { title: 'Oliy ta’lim muassasalarida kredit-modul tizimi samaradorligini baholashning zamonaviy indikatorlari', type: 'MONOGRAPH', journal: 'TIU Academic Press', quartile: 'NONE', year: 2024, doi: null, deptIndex: 3, citations: 0, approvedAt: '2025-02-10T09:45:00Z', extraAuthors: 0 },
    // Qo'shimcha 21 ta tasdiqlangan ilmiy nashrlar (jami 31 ta)
    { title: 'Machine Learning Approaches for Early Detection of Macroeconomic and Inflationary Shocks', type: 'SCOPUS', journal: 'Economic Modelling', quartile: 'Q1', year: 2024, doi: '10.1016/j.econmod.2024.107001', deptIndex: 0, citations: 38, approvedAt: '2025-01-28T11:30:00Z', extraAuthors: 1 },
    { title: 'AI-Driven Pedagogical Frameworks for Higher Education Quality Assurance and Student Engagement', type: 'WOS', journal: 'Higher Education Quarterly', quartile: 'Q2', year: 2024, doi: '10.1111/hequ.12500', deptIndex: 3, citations: 21, approvedAt: '2025-01-22T14:15:00Z', extraAuthors: 2 },
    { title: 'Xalqaro xususiy huquqda transchegaraviy bankrotlik va kollizion normalarni unifikatsiyalash', type: 'OAK', journal: 'Davlat va Huquq jurnali', quartile: 'NONE', year: 2024, doi: null, deptIndex: 4, citations: 0, approvedAt: '2025-01-17T16:00:00Z', extraAuthors: 1 },
    { title: 'Noaniq to‘plamlar nazariyasi asosida investitsiya portfelini optimallashtirish algoritmlari', type: 'SCOPUS', journal: 'Expert Systems with Applications', quartile: 'Q1', year: 2024, doi: '10.1016/j.eswa.2024.124567', deptIndex: 2, citations: 31, approvedAt: '2025-01-11T10:20:00Z', extraAuthors: 2 },
    { title: 'Nofilologik yo‘nalish talabalariga kasbiy xorijiy tilni (ESP) o‘qitishda multimediali korpus texnologiyalari', type: 'OAK', journal: 'O‘zbekistonda Xorijiy Tillar ilmiy-metodik elektron jurnali', quartile: 'NONE', year: 2024, doi: null, deptIndex: 1, citations: 0, approvedAt: '2024-12-26T15:10:00Z', extraAuthors: 1 },
    { title: 'Protection of Personal Data and Constitutional Privacy Guarantees in the Age of Generative AI', type: 'SCOPUS', journal: 'Computer Law & Security Review', quartile: 'Q1', year: 2024, doi: '10.1016/j.clsr.2024.105980', deptIndex: 4, citations: 29, approvedAt: '2024-12-19T09:30:00Z', extraAuthors: 2 },
    { title: 'Korporativ moliya va investitsion loyihalarni baholashning zamonaviy usullari', type: 'TEXTBOOK', journal: 'Toshkent xalqaro universiteti nashriyoti', quartile: 'NONE', year: 2024, doi: null, deptIndex: 0, citations: 0, approvedAt: '2024-12-12T11:45:00Z', extraAuthors: 1 },
    { title: 'Smart City IoT Sensor Networks: Intrusion Detection and Lightweight Cryptographic Protocols', type: 'WOS', journal: 'Computer Communications', quartile: 'Q2', year: 2024, doi: '10.1016/j.comcom.2024.04.012', deptIndex: 2, citations: 18, approvedAt: '2024-12-04T14:00:00Z', extraAuthors: 1 },
    { title: 'Tijorat banklarida kredit risklarini boshqarish va Bazel III standartlarini joriy etish amaliyoti', type: 'OAK', journal: 'Iqtisodiyot va Innovatsion Texnologiyalar', quartile: 'NONE', year: 2024, doi: null, deptIndex: 0, citations: 0, approvedAt: '2024-11-25T10:15:00Z', extraAuthors: 1 },
    { title: 'Bilingual Lexicography and Terminological Standardization in Legal and Economic Translation', type: 'INTERNATIONAL_JOURNAL', journal: 'International Journal of Lexicography', quartile: 'Q2', year: 2024, doi: '10.1093/ijl/ecae015', deptIndex: 1, citations: 0, approvedAt: '2024-11-18T13:50:00Z', extraAuthors: 1 },
    { title: 'IoT qurilmalari uchun kriptografik kalitlarni xavfsiz almashish dasturiy majmuasi', type: 'PATENT', journal: 'O‘zbekiston Respublikasi Adliya vazirligi Intellektual mulk departamenti', quartile: 'NONE', year: 2024, doi: null, deptIndex: 2, citations: 0, approvedAt: '2024-11-09T16:20:00Z', extraAuthors: 1 },
    { title: 'Green Energy Transition and Carbon Pricing Mechanisms in Central Asian Economies', type: 'SCOPUS', journal: 'Journal of Cleaner Production', quartile: 'Q1', year: 2024, doi: '10.1016/j.jclepro.2024.141200', deptIndex: 0, citations: 45, approvedAt: '2024-10-30T11:00:00Z', extraAuthors: 2 },
    { title: 'Raqamli ta’lim muhitida talabalarning tanqidiy fikrlash va tadqiqotchilik kompetensiyalarini rivojlantirish', type: 'LOCAL_JOURNAL', journal: 'Zamonaviy Ta’lim ilmiy-amaliy jurnali', quartile: 'NONE', year: 2024, doi: null, deptIndex: 3, citations: 0, approvedAt: '2024-10-21T09:40:00Z', extraAuthors: 1 },
    { title: 'International Investment Treaties and State Sovereignty in Investor-State Dispute Settlement', type: 'WOS', journal: 'Journal of World Trade', quartile: 'Q2', year: 2024, doi: '10.54648/TRAD2024015', deptIndex: 4, citations: 14, approvedAt: '2024-10-12T15:30:00Z', extraAuthors: 1 },
    { title: 'Deep Learning Models for Automated Medical Image Segmentation in Clinical Diagnostics', type: 'SCOPUS', journal: 'Computers in Biology and Medicine', quartile: 'Q1', year: 2024, doi: '10.1016/j.compbiomed.2024.109011', deptIndex: 2, citations: 36, approvedAt: '2024-09-28T12:10:00Z', extraAuthors: 1 },
    { title: 'Sentiment Analysis of Financial News and Stock Market Volatility Using Large Language Models', type: 'WOS', journal: 'Financial Innovation', quartile: 'Q1', year: 2024, doi: '10.1186/s40854-024-00712-x', deptIndex: 0, citations: 28, approvedAt: '2024-09-15T10:05:00Z', extraAuthors: 2 },
    { title: 'Xalqaro tijorat arbitrajida elektron dalillarning maqbulligi va huquqiy baholanishi', type: 'MONOGRAPH', journal: 'Adolat milliy huquqiy axborot markazi', quartile: 'NONE', year: 2023, doi: null, deptIndex: 4, citations: 0, approvedAt: '2024-08-22T14:40:00Z', extraAuthors: 0 },
    { title: 'Natural Language Understanding for Agglutinative Turkic Morphology in Dialogue Systems', type: 'CONFERENCE', journal: 'Proceedings of the Annual Meeting of the Association for Computational Linguistics (ACL)', quartile: 'NONE', year: 2024, doi: '10.18653/v1/2024.acl-long.450', deptIndex: 1, citations: 0, approvedAt: '2024-08-10T11:20:00Z', extraAuthors: 2 },
    { title: 'Higher Education Governance, Autonomous Financing, and Graduate Employability Metrics', type: 'SCOPUS', journal: 'Journal of Higher Education Policy and Management', quartile: 'Q2', year: 2024, doi: '10.1080/1360080X.2024.2311200', deptIndex: 3, citations: 17, approvedAt: '2024-07-19T16:15:00Z', extraAuthors: 1 },
    { title: 'Zamonaviy dasturiy injiniring va mikroservis arxitekturalarini loyihalash asoslari', type: 'TEXTBOOK', journal: 'TIU Academic Publishing', quartile: 'NONE', year: 2024, doi: null, deptIndex: 2, citations: 0, approvedAt: '2024-06-25T10:30:00Z', extraAuthors: 1 },
    { title: 'Federated Learning and Secure Multi-Party Computation for Privacy-Preserving Analytics', type: 'CONFERENCE', journal: 'IEEE Symposium on Security and Privacy Workshops', quartile: 'NONE', year: 2024, doi: '10.1109/SPW60000.2024.00089', deptIndex: 2, citations: 0, approvedAt: '2024-06-05T09:00:00Z', extraAuthors: 2 },
  ];

  let pubCount = 0;
  for (let i = 0; i < samplePublications.length; i++) {
    const p = samplePublications[i];
    const deptScholars = scholarsByDept[p.deptIndex] || createdScholars;
    const primaryAuthor = deptScholars[i % deptScholars.length] || createdScholars[0];
    const approvedDate = new Date(p.approvedAt);
    const isScopusOrWos = p.type === 'SCOPUS' || p.type === 'WOS';

    const pub = await prisma.publication.create({
      data: {
        title: p.title,
        type: p.type,
        journalOrPublisher: p.journal,
        year: p.year,
        doi: p.doi,
        url: p.doi ? `https://doi.org/${p.doi}` : null,
        isbnOrPatentNo: p.type === 'PATENT' ? `UZ-IAP-2025-0${100 + i}` : p.type === 'MONOGRAPH' ? `978-9943-12-${300 + i}-6` : null,
        quartile: p.quartile,
        citationsCount: isScopusOrWos ? p.citations : 0,
        status: 'APPROVED',
        submittedById: primaryAuthor.userId,
        createdAt: approvedDate,
        updatedAt: approvedDate,
      },
    });

    // 1-muallif (o'z kafedrasidan)
    const usedScholarIds = new Set([primaryAuthor.id]);
    await prisma.publicationAuthor.create({
      data: {
        publicationId: pub.id,
        scholarId: primaryAuthor.id,
        authorOrder: 1,
      },
    });

    // Hammualliflar (avval o'z kafedrasidan, keyin turdosh kafedralardan)
    const extraCount = p.extraAuthors || 0;
    const candidatePool = [
      ...deptScholars.filter((s) => s.id !== primaryAuthor.id),
      ...createdScholars.filter((s) => s.id !== primaryAuthor.id),
    ];

    let order = 2;
    for (const candidate of candidatePool) {
      if (order > extraCount + 1) break;
      if (usedScholarIds.has(candidate.id)) continue;
      usedScholarIds.add(candidate.id);
      await prisma.publicationAuthor.create({
        data: {
          publicationId: pub.id,
          scholarId: candidate.id,
          authorOrder: order++,
        },
      });
    }

    pubCount++;
  }

  console.log(`📚 Created ${pubCount} publications with multi-author links.`);

  // 5. Grant Projects
  const grants = [
    { title: 'AI-Powered National Language Processing Hub for Uzbek Language', role: 'Principal Investigator', fundingSource: 'Ministry of Higher Education, Science and Innovations', startYear: 2024, endYear: 2026 },
    { title: 'Smart Agriculture IoT Monitoring Systems in Fergana Valley', role: 'Co-Investigator', fundingSource: 'Innovative Development Agency', startYear: 2023, endYear: 2025 },
    { title: 'FinTech Innovation and Digital Currency Regulatory Frameworks', role: 'Principal Investigator', fundingSource: 'Central Bank of Uzbekistan', startYear: 2024, endYear: 2026 },
    { title: 'Green Energy Transition and Economic Impact Assessment', role: 'Lead Researcher', fundingSource: 'UNDP Uzbekistan', startYear: 2023, endYear: 2024 },
    { title: 'Digitalization of Legal Services and Court Arbitration Systems', role: 'Principal Investigator', fundingSource: 'Supreme Court Grant Fund', startYear: 2025, endYear: 2027 },
    { title: 'Advanced Cryptographic Protocols for Secure GovTech Services', role: 'Lead Researcher', fundingSource: 'Ministry of Digital Technologies', startYear: 2024, endYear: 2026 },
  ];

  for (let i = 0; i < grants.length; i++) {
    const g = grants[i];
    const scholar = createdScholars[i % createdScholars.length];
    await prisma.grantProject.create({
      data: {
        scholarId: scholar.id,
        title: g.title,
        role: g.role,
        fundingSource: g.fundingSource,
        startYear: g.startYear,
        endYear: g.endYear,
        status: 'APPROVED',
      },
    });
  }

  console.log(`💼 Created ${grants.length} grant projects.`);

  // 6. Supervisions
  const supervisionsData = [
    { studentName: 'Sardorbek Rakhimov', degreeType: 'PHD', title: 'Deep Learning Models for Automated Sentiment Analysis in Turkic Languages', year: 2024 },
    { studentName: 'Kamola Akhmedova', degreeType: 'PHD', title: 'Monetary Policy Transmission Mechanisms in Open Emerging Economies', year: 2025 },
    { studentName: 'Timur Iskandarov', degreeType: 'DSC', title: 'Architectural Security Paradigms for Zero-Trust Enterprise Networks', year: 2024 },
    { studentName: 'Nodira Aliyeva', degreeType: 'PHD', title: 'Comparative Analysis of Cybercrime Legislation in Central Asia', year: 2025 },
    { studentName: 'Bobur Mirzayev', degreeType: 'PHD', title: 'Optimization of Renewable Energy Integration in Smart Grids', year: 2024 },
    { studentName: 'Shakhnoza Karimova', degreeType: 'DSC', title: 'Cognitive Stylistics and Discourse Analysis in Modern Media', year: 2025 },
  ];

  for (let i = 0; i < supervisionsData.length; i++) {
    const sup = supervisionsData[i];
    const scholar = createdScholars[i % createdScholars.length];
    await prisma.supervision.create({
      data: {
        scholarId: scholar.id,
        studentName: sup.studentName,
        degreeType: sup.degreeType,
        dissertationTitle: sup.title,
        year: sup.year,
        status: 'APPROVED',
      },
    });
  }

  console.log(`🎓 Created ${supervisionsData.length} supervisions.`);

  // 7. KPI Targets
  for (const dept of createdDepartments) {
    await prisma.kpiTarget.create({
      data: {
        year: 2026,
        departmentId: dept.id,
        targetPublications: 25,
        targetScopus: 10,
        targetScore: 250.0,
      },
    });
  }

  console.log('🎯 Created 2026 department KPI targets.');
  console.log('✅ Database seeding completed successfully with 30+ publications!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
