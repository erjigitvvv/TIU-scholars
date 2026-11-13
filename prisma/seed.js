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

  // 2. Faculties & Departments
  const facultiesData = [
    {
      code: 'ITE',
      nameUz: 'Axborot texnologiyalari va muhandislik',
      nameRu: 'Информационные технологии и инженерия',
      nameEn: 'Information Technology & Engineering',
      departments: [
        { nameUz: 'Sun\'iy intellekt va dasturiy injiniring', nameRu: 'Искусственный интеллект и программная инженерия', nameEn: 'AI & Software Engineering' },
        { nameUz: 'Kiberxavfsizlik va tarmoqlar', nameRu: 'Кибербезопасность и сети', nameEn: 'Cybersecurity & Networks' },
      ],
    },
    {
      code: 'ECO',
      nameUz: 'Iqtisodiyot va biznes boshqaruvi',
      nameRu: 'Экономика и бизнес-управление',
      nameEn: 'Economics & Business Management',
      departments: [
        { nameUz: 'Xalqaro moliya va buxgalteriya', nameRu: 'Международные финансы и бухучет', nameEn: 'International Finance & Accounting' },
        { nameUz: 'Raqamli iqtisodiyot va menejment', nameRu: 'Цифровая экономика и менеджмент', nameEn: 'Digital Economy & Management' },
      ],
    },
    {
      code: 'HUM',
      nameUz: 'Gumanitar fanlar va xalqaro huquq',
      nameRu: 'Гуманитарные науки и международное право',
      nameEn: 'Humanities & International Law',
      departments: [
        { nameUz: 'Xalqaro huquq va qiyosiy jurisprudensiya', nameRu: 'Международное право и сравнительная юриспруденция', nameEn: 'International Law & Comparative Jurisprudence' },
        { nameUz: 'Lingvistika va tarjimashunoslik', nameRu: 'Лингвистика и переводоведение', nameEn: 'Linguistics & Translation Studies' },
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

  const scholarNames = [
    { fullName: 'Prof. Alisher Turgunov', email: 'a.turgunov@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 0, h: 18, citations: 1240, score: 95.5 },
    { fullName: 'Dr. Nilufar Karimova', email: 'n.karimova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 0, h: 12, citations: 620, score: 78.0 },
    { fullName: 'Dr. Jamshid Rakhimov', email: 'j.rakhimov@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 1, h: 14, citations: 810, score: 82.5 },
    { fullName: 'Prof. Dilbar Umarova', email: 'd.umarova@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 2, h: 16, citations: 950, score: 88.0 },
    { fullName: 'Dr. Bekzod Kasimov', email: 'b.kasimov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 1, h: 8, citations: 310, score: 54.0 },
    { fullName: 'Dr. Malika Azizova', email: 'm.azizova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 3, h: 11, citations: 490, score: 69.5 },
    { fullName: 'Prof. Rustam Fayziyev', email: 'r.fayziyev@tiu.uz', degree: 'DSC', title: 'PROFESSOR', deptIndex: 3, h: 21, citations: 1650, score: 104.0 },
    { fullName: 'Dr. Zulfiya Saidova', email: 'z.saidova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 4, h: 9, citations: 380, score: 61.0 },
    { fullName: 'Dr. Sanjarbek Normatov', email: 's.normatov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 4, h: 6, citations: 210, score: 48.0 },
    { fullName: 'Dr. Gulchehra Sharipova', email: 'g.sharipova@tiu.uz', degree: 'PHD', title: 'DOCENT', deptIndex: 5, h: 10, citations: 440, score: 65.0 },
    { fullName: 'Azizbek Kadirov', email: 'a.kadirov@tiu.uz', degree: 'PHD', title: 'ASSISTANT', deptIndex: 0, h: 3, citations: 45, score: 20.0, pending: true },
    { fullName: 'Madina Tursunova', email: 'm.tursunova@tiu.uz', degree: 'NONE', title: 'ASSISTANT', deptIndex: 2, h: 1, citations: 12, score: 10.0, pending: true },
  ];

  const createdScholars = [];

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
        bioUz: `${s.fullName} - Toshkent xalqaro universitetining yetakchi tadqiqotchisi va olimi.`,
        bioRu: `${s.fullName} - ведущий исследователь и ученый Ташкентского международного университета.`,
        bioEn: `${s.fullName} is a leading researcher and scholar at Tashkent International University.`,
        researchInterests: JSON.stringify(['Artificial Intelligence', 'Data Analytics', 'Digital Transformation', 'Higher Education']),
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
    }
  }

  console.log(`👨‍🎓 Created ${scholarNames.length} scholars (${createdScholars.length} active, 2 pending).`);

  // 4. Publications (30+ records covering all types and quartiles)
  const samplePublications = [
    { title: 'Advanced Neural Network Architectures for Multilingual Natural Language Processing', type: 'SCOPUS', journal: 'IEEE Transactions on Neural Networks', quartile: 'Q1', year: 2025, doi: '10.1109/TNNLS.2025.3123456' },
    { title: 'Econometric Analysis of Digital Transformation in Emerging Central Asian Markets', type: 'SCOPUS', journal: 'Journal of Business Research', quartile: 'Q1', year: 2025, doi: '10.1016/j.jbusres.2025.112233' },
    { title: 'Cybersecurity Resilience in Distributed Cloud Infrastructures', type: 'SCOPUS', journal: 'Computers & Security', quartile: 'Q2', year: 2024, doi: '10.1016/j.cose.2024.103344' },
    { title: 'Comparative Legal Frameworks for FinTech Regulations in CIS Region', type: 'WOS', journal: 'International Journal of Law and Management', quartile: 'Q2', year: 2024, doi: '10.1108/IJLMA-03-2024-0089' },
    { title: 'Optimizing Supply Chain Logistics using Hybrid Genetic Algorithms', type: 'SCOPUS', journal: 'Expert Systems with Applications', quartile: 'Q1', year: 2025, doi: '10.1016/j.eswa.2025.124567' },
    { title: 'Bilingual Lexicography and Translation Challenges in Modern Era', type: 'OAK', journal: 'O\'zbekiston Milliy Universiteti Xabarlari', quartile: 'NONE', year: 2024, doi: null },
    { title: 'AI-Driven Pedagogical Frameworks for Higher Education Quality Assurance', type: 'INTERNATIONAL_JOURNAL', journal: 'Higher Education Quarterly', quartile: 'Q3', year: 2024, doi: '10.1111/hequ.12500' },
    { title: 'Smart City IoT Sensor Networks: Security Vulnerabilities and Countermeasures', type: 'WOS', journal: 'Elsevier Computer Communications', quartile: 'Q2', year: 2025, doi: '10.1016/j.comcom.2025.04.012' },
    { title: 'Monograph: Theoretical Foundations of Sustainable Regional Development', type: 'MONOGRAPH', journal: 'Tashkent University Press', quartile: 'NONE', year: 2023, doi: null },
    { title: 'Patent: Intelligent Cryptographic Key Exchange Protocol for IoT Devices', type: 'PATENT', journal: 'Uzbekistan Intellectual Property Agency', quartile: 'NONE', year: 2024, doi: null },
    { title: 'Conference: Scalable Distributed Ledger Technology for Public Governance', type: 'CONFERENCE', journal: 'IEEE International Conference on Big Data', quartile: 'NONE', year: 2024, doi: '10.1109/BigData59044.2024.1045' },
    { title: 'OAK Journal: Financial Inclusion and Economic Growth in Uzbekistan', type: 'OAK', journal: 'Iqtisodiyot va Innovatsion Texnologiyalar', quartile: 'NONE', year: 2025, doi: null },
    { title: 'Machine Learning Approach for Early Detection of Macroeconomic Shocks', type: 'SCOPUS', journal: 'Economic Modelling', quartile: 'Q1', year: 2025, doi: '10.1016/j.econmod.2025.107001' },
    { title: 'Cross-Border Arbitration and International Trade Law Developments', type: 'WOS', journal: 'Journal of World Trade', quartile: 'Q2', year: 2024, doi: '10.54648/TRAD2024015' },
    { title: 'Textbook: Modern Software Engineering Principles and Practices', type: 'TEXTBOOK', journal: 'TIU Academic Publishing', quartile: 'NONE', year: 2024, doi: null },
    // Additional 16 publications to exceed 30+ total
    { title: 'Deep Learning for Medical Image Segmentation in Radiology', type: 'SCOPUS', journal: 'Computers in Biology and Medicine', quartile: 'Q1', year: 2025, doi: '10.1016/j.compbiomed.2025.109011' },
    { title: 'Green Banking Practices and Environmental Performance in Central Asia', type: 'SCOPUS', journal: 'Journal of Cleaner Production', quartile: 'Q1', year: 2024, doi: '10.1016/j.jclepro.2024.141200' },
    { title: 'Blockchain-Based Supply Chain Provenance for Agricultural Exports', type: 'WOS', journal: 'IEEE Access', quartile: 'Q2', year: 2025, doi: '10.1109/ACCESS.2025.3400112' },
    { title: 'Artificial Intelligence Ethics and Regulatory Challenges in Public Administration', type: 'INTERNATIONAL_JOURNAL', journal: 'Public Administration Review', quartile: 'Q1', year: 2024, doi: '10.1111/puar.13788' },
    { title: 'Quantum Cryptography Readiness in Post-Modern Financial Networks', type: 'SCOPUS', journal: 'Journal of Information Security and Applications', quartile: 'Q2', year: 2025, doi: '10.1016/j.jisa.2025.104112' },
    { title: 'OAK: Pedagogical Innovations in Teaching Foreign Languages to STEM Students', type: 'OAK', journal: 'Toshkent Davlat Pedagogika Universiteti Ilmiy Axborotnomasi', quartile: 'NONE', year: 2024, doi: null },
    { title: 'Conference: Natural Language Understanding for Low-Resource Turkic Languages', type: 'CONFERENCE', journal: 'ACL Conference Proceedings', quartile: 'NONE', year: 2024, doi: '10.18653/v1/2024.acl-long.450' },
    { title: 'Monograph: Digital Economy Transformation and Labor Market Dynamics', type: 'MONOGRAPH', journal: 'Fan va Texnologiya Nashriyoti', quartile: 'NONE', year: 2023, doi: null },
    { title: 'Patent: Automated Traffic Congestion Mitigation System Using Edge AI', type: 'PATENT', journal: 'Uzbekistan Intellectual Property Agency', quartile: 'NONE', year: 2025, doi: null },
    { title: 'Local Journal: Regional Economic Integration and Trade Barriers', type: 'LOCAL_JOURNAL', journal: 'Iqtisodiy Taraqqiyot va Tahlil', quartile: 'NONE', year: 2025, doi: null },
    { title: 'Textbook: Advanced Corporate Finance and Valuation Models', type: 'TEXTBOOK', journal: 'TIU Academic Press', quartile: 'NONE', year: 2024, doi: null },
    { title: 'Web of Science: Sentiment Analysis of Financial News and Stock Market Volatility', type: 'WOS', journal: 'Financial Innovation', quartile: 'Q1', year: 2025, doi: '10.1186/s40854-025-00712-x' },
    { title: 'Scopus Q2: IoT-Enabled Precision Agriculture Frameworks', type: 'SCOPUS', journal: 'Computers and Electronics in Agriculture', quartile: 'Q2', year: 2024, doi: '10.1016/j.compag.2024.108990' },
    { title: 'OAK: Constitutional Guarantees of Human Rights in Digital Era', type: 'OAK', journal: 'Huquq va Burch', quartile: 'NONE', year: 2025, doi: null },
    { title: 'Conference: Secure Multi-Party Computation for Healthcare Records', type: 'CONFERENCE', journal: 'IEEE Security and Privacy Workshops', quartile: 'NONE', year: 2024, doi: '10.1109/SPW60000.2024.00089' },
    { title: 'International Journal: Higher Education Governance and Student Success Metrics', type: 'INTERNATIONAL_JOURNAL', journal: 'Journal of Higher Education Policy and Management', quartile: 'Q2', year: 2024, doi: '10.1080/1360080X.2024.2311200' },
  ];

  let pubCount = 0;
  for (let i = 0; i < samplePublications.length; i++) {
    const p = samplePublications[i];
    const authorScholar = createdScholars[i % createdScholars.length];

    const pub = await prisma.publication.create({
      data: {
        title: p.title,
        type: p.type,
        journalOrPublisher: p.journal,
        year: p.year,
        doi: p.doi,
        url: p.doi ? `https://doi.org/${p.doi}` : 'https://tiu.uz/publications/sample',
        isbnOrPatentNo: p.type === 'PATENT' ? 'UZ-PAT-2024-0987' : p.type === 'MONOGRAPH' ? '978-9943-12-345-6' : null,
        quartile: p.quartile,
        citationsCount: Math.floor(Math.random() * 60),
        status: 'APPROVED',
        submittedById: authorScholar.userId,
      },
    });

    // Link author 1
    await prisma.publicationAuthor.create({
      data: {
        publicationId: pub.id,
        scholarId: authorScholar.id,
        authorOrder: 1,
      },
    });

    // Add co-author for multi-author links
    if (createdScholars.length > 1 && i % 2 === 0) {
      const coAuthor = createdScholars[(i + 3) % createdScholars.length];
      if (coAuthor.id !== authorScholar.id) {
        try {
          await prisma.publicationAuthor.create({
            data: {
              publicationId: pub.id,
              scholarId: coAuthor.id,
              authorOrder: 2,
            },
          });
        } catch (e) {
          // ignore duplicate
        }
      }
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
