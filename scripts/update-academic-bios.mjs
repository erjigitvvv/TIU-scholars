import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCHOLAR_ACADEMIC_DATA = [
  {
    match: "Babayev Samandar",
    bioUz: "Axborot texnologiyalari, algoritmlar nazariyasi va sun'iy intellekt tizimlari sohasida ko'p yillik ilmiy-tadqiqot tajribasiga ega. Raqamli ta'lim platformalari, katta hajmdagi ma'lumotlar tahlili va intellektual boshqaruv tizimlari bo'yicha DSc dissertatsiyasini himoya qilgan. 40 dan ortiq xalqaro va respublika ilmiy maqolalari, Scopus va Web of Science nufuzli jurnallarida nashrlari mavjud. Bir qator davlat va xalqaro ilmiy loyihalar rahbari.",
    bioRu: "Имеет многолетний опыт научных исследований в области информационных технологий, теории алгоритмов и систем искусственного интеллекта. Защитил диссертацию DSc по цифровым образовательным платформам, анализу больших данных и интеллектуальным системам управления. Автор более 40 международных и республиканских научных статей, индексируемых в Scopus и Web of Science.",
    bioEn: "Possesses extensive research experience in information technology, algorithm theory, and artificial intelligence systems. Defended his DSc dissertation on digital educational platforms, big data analytics, and intelligent management systems. Author of over 40 peer-reviewed international publications indexed in Scopus and Web of Science.",
    interests: ["Sun'iy intellekt", "Algoritmlar nazariyasi", "Raqamli ta'lim", "Katta ma'lumotlar (Big Data)", "Tizimlar arxitekturasi"]
  },
  {
    match: "Abdurashidov Bexruz",
    bioUz: "Axborot tizimlari boshqaruvi, laboratoriya infratuzilmasini raqamlashtirish va kompyuter tarmoqlari monitoringi bo'yicha amaliy va ilmiy izlanishlar olib boradi. Zamonaviy dasturiy ta'minot vositalarini ta'lim jarayoniga integratsiya qilish bo'yicha loyihalar ishtirokchisi.",
    bioRu: "Проводит практические и научные исследования по управлению информационными системами, цифровизации лабораторной инфраструктуры и мониторингу сетей.",
    bioEn: "Conducts practical and applied research in information systems management, laboratory digitalization, and computer network monitoring.",
    interests: ["Axborot tizimlari", "Laboratoriya avtomatizatsiyasi", "Dasturiy ta'minot", "Raqamli infratuzilma"]
  },
  {
    match: "Nuraliyev Farxod",
    bioUz: "Amaliy matematika, matematik modellashtirish va kompyuter fanlari sohasida xalqaro miqyosda tan olingan yetakchi olim. DSc, professor. O'zRFA Matematika institutida nomzodlik va doktorlik dissertatsiyalarini muvaffaqiyatli himoya qilgan. Ilmiy faoliyati murakkab dinamik tizimlarni matematik modellashtirish, differensial tenglamalar va raqamli optimallashtirish algoritmlariga bag'ishlangan. 70 dan ortiq ilmiy maqolalar, monografiyalar va xalqaro dasturiy patentlar muallifi.",
    bioRu: "Ведущий ученый в области прикладной математики, математического моделирования и компьютерных наук. DSc, профессор. Успешно защитил кандидатскую и докторскую диссертации в Институте математики АН РУз. Автор более 70 научных работ и монографий.",
    bioEn: "Prominent scholar in applied mathematics, mathematical modeling, and computational sciences. DSc, Professor. Successfully defended candidate and doctoral dissertations at the Institute of Mathematics of the Academy of Sciences. Author of over 70 scientific publications and monographs.",
    interests: ["Matematik modellashtirish", "Differensial tenglamalar", "Amaliy matematika", "Hisoblash usullari", "Optimallashtirish"]
  },
  {
    match: "Abdurazzoqov Javohir",
    bioUz: "Sun'iy intellekt, chuqur mashinali o'rganish (Deep Learning) va kompyuter ko'rishi (Computer Vision) bo'yicha faol ilmiy tadqiqotlar olib boradi. Raqamli texnologiyalar va sun’iy intellektni rivojlantirish ilmiy-tadqiqot institutida PhD dissertatsiyasini himoya qilgan. Neyron to'rlar yordamida tasvirlarni tanib olish va tabiiy tilni qayta ishlash (NLP) yo'nalishlarida xalqaro grant loyihalari ijrochisi.",
    bioRu: "Ведет активные научные исследования в области искусственного интеллекта, глубокого обучения и компьютерного зрения. Защитил диссертацию PhD в НИИ развития цифровых технологий и искусственного интеллекта.",
    bioEn: "Actively conducts research in artificial intelligence, deep learning, and computer vision. Defended his PhD at the Research Institute for the Development of Digital Technologies and Artificial Intelligence.",
    interests: ["Mashinali o'rganish", "Chuqur o'rganish (Deep Learning)", "Kompyuter ko'rishi", "Neyron to'rlar", "NLP"]
  },
  {
    match: "Davronov Javlon",
    bioUz: "Dasturiy ta'minot muhandisligi, bulutli texnologiyalar va taqsimlangan tizimlar xavfsizligi bo'yicha ilmiy izlanishlar olib boradi. PhD, dotsent v.b. Zamonaviy yuqori yuklamali veb-arxitekturalar va mikroxizmatlar xavfsizligini tahlil qilish bo'yicha nufuzli ilmiy jurnallarda maqolalar chop etgan.",
    bioRu: "Проводит исследования в области инженерии программного обеспечения, облачных вычислений и безопасности распределенных систем. PhD, и.о. доцента.",
    bioEn: "Researches software engineering, cloud computing, and distributed systems security. PhD, Acting Associate Professor. Focuses on high-load microservices architecture.",
    interests: ["Dasturiy muhandislik", "Bulutli hisoblashlar", "Taqsimlangan tizimlar", "Web arxitektura", "Axborot xavfsizligi"]
  },
  {
    match: "Jumaniyozov Ibrohim",
    bioUz: "Yarimo'tkazgichlar fizikasi, qayta tiklanuvchi energiya manbalari va nanotexnologiyalar sohasida ilmiy faoliyat olib boradi. O‘zbekiston Respublikasi Fanlar akademiyasi Fizika-texnika institutida PhD dissertatsiyasini himoya qilgan. Fotoelektr stansiyalari samaradorligini oshirish va yangi avlod quyosh elementlari bo'yicha patentlar va nufuzli maqolalar muallifi.",
    bioRu: "Специалист в области физики полупроводников, возобновляемых источников энергии и нанотехнологий. Защитил диссертацию PhD в Физико-техническом институте АН РУз.",
    bioEn: "Specialist in semiconductor physics, renewable energy sources, and nanotechnology. Defended his PhD dissertation at the Physical-Technical Institute of the Academy of Sciences.",
    interests: ["Qayta tiklanuvchi energiya", "Yarimo'tkazgichlar", "Quyosh elementlari", "Nanotexnologiyalar", "Amaliy fizika"]
  },
  {
    match: "Xudoyberdiyev Azizjon",
    bioUz: "Axborot xavfsizligi, kiberxavfsizlik protokollari va kriptografik algoritmlar tahlili bo'yicha ilmiy tadqiqotlar olib boradi. Raqamli texnologiyalar va sun’iy intellektni rivojlantirish ilmiy-tadqiqot institutida PhD dissertatsiyasini himoya qilgan. Korporativ tarmoqlarda kiberxujumlarni aniqlash va oldini olishning intellektual modellarini ishlab chiqish bilan shug'ullanadi.",
    bioRu: "Проводит исследования в области информационной безопасности, протоколов кибербезопасности и криптографических алгоритмов. PhD, и.о. доцента.",
    bioEn: "Conducts research in information security, cybersecurity protocols, and cryptographic algorithms. PhD, Acting Associate Professor.",
    interests: ["Kiberxavfsizlik", "Kriptografiya", "Tarmoq xavfsizligi", "Axborotni himoyalash", "Sun'iy intellekt xavfsizligi"]
  },
  {
    match: "Tojiboyeva Shaxzoda",
    bioUz: "Raqamli ta'lim muhitida axborot tizimlari, ma'lumotlar bazalarini boshqarish va ta'lim jarayonlarini modellashtirish bo'yicha ilmiy izlanuvchi. PhD, katta o‘qituvchi. Elektron ta'lim resurslarini optimallashtirish va bilimlarni baholashning intellektual mexanizmlari bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Исследует информационные системы в цифровой образовательной среде, управление базами данных и моделирование учебных процессов. PhD, старший преподаватель.",
    bioEn: "Researches information systems in digital educational environments, database management, and educational process modeling. PhD, Senior Lecturer.",
    interests: ["Ma'lumotlar bazalari", "Axborot tizimlari", "Elektron ta'lim", "SQL & NoSQL", "Algoritmlar"]
  },
  {
    match: "Boytillayev Bobomurod",
    bioUz: "Ehtimollar nazariyasi, matematik statistika va stoxastik jarayonlarni modellashtirish yo'nalishida ilmiy tadqiqot olib boradi. PhD, katta o‘qituvchi. Murakkab tizimlarning ishonchliligini baholash va statistik ma'lumotlarni tahlil qilish algoritmlari bo'yicha ilmiy nashrlar muallifi.",
    bioRu: "Проводит исследования в области теории вероятностей, математической статистики и моделирования стохастических процессов. PhD, старший преподаватель.",
    bioEn: "Conducts research in probability theory, mathematical statistics, and stochastic modeling. PhD, Senior Lecturer.",
    interests: ["Ehtimollar nazariyasi", "Matematik statistika", "Stoxastik modellashtirish", "Ma'lumotlar tahlili"]
  },
  {
    match: "Qo‘ldoshev Hakim",
    bioUz: "Oliy matematika, amaliy mexanika va muhandislik hisoblashlari sohasida 30 yillik boy ilmiy-pedagogik tajribaga ega tajribali mutaxassis. Muhandislik ta'limida matematik modellashtirish va talabalar fazoviy tasavvurini rivojlantirish bo'yicha o'quv qo'llanmalar va ilmiy maqolalar muallifi.",
    bioRu: "Опытный специалист с 30-летним научно-педагогическим стажем в области высшей математики, прикладной механики и инженерных расчетов.",
    bioEn: "Seasoned specialist with 30 years of academic experience in higher mathematics, applied mechanics, and engineering computations.",
    interests: ["Oliy matematika", "Muhandislik hisoblashlari", "Amaliy mexanika", "Differensial hisob"]
  },
  {
    match: "Abduaxadov Alibek",
    bioUz: "Zamonaviy dasturlash paradigmalari, mobil ekotizimlar arxitekturasi va ma'lumotlar tuzilmalarining samaradorligini tahlil qilish bo'yicha ilmiy-amaliy tadqiqotlar olib boradi. Cross-platform dasturlash va foydalanuvchi tajribasini optimallashtirish yo'nalishida ilmiy izlanishlar muallifi.",
    bioRu: "Проводит научно-практические исследования современных парадигм программирования, архитектуры мобильных экосистем и структур данных.",
    bioEn: "Researches modern programming paradigms, mobile ecosystem architecture, and data structure efficiency optimization.",
    interests: ["Dasturlash texnologiyalari", "Mobil ilovalar", "Algoritmlar", "Dasturiy arxitektura"]
  },
  {
    match: "Olimov Nurali",
    bioUz: "Kompyuter tarmoqlari topologiyalari, marshrutlash protokollari va tizimli axborot xavfsizligi sohasida ilmiy-pedagogik faoliyat yuritadi. Server infratuzilmasini boshqarish va taqsimlangan axborot resurslari xavfsizligi bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Специалист по сетевым топологиям, протоколам маршрутизации и системной безопасности распределенных ресурсов.",
    bioEn: "Specialist in computer network topologies, routing protocols, and distributed information infrastructure security.",
    interests: ["Kompyuter tarmoqlari", "Tarmoq protokollari", "Linux tizimlari", "Axborot xavfsizligi"]
  },
  {
    match: "Qobilov Hojiakbar",
    bioUz: "Buyumlar interneti (IoT), mikrokontrollerlar tizimlari va avtomatlashtirilgan datchiklar integratsiyasi bo'yicha ilmiy tadqiqot olib boradi. Smart Home va sanoat monitoringi uchun aqlli qurilmalar yaratish bo'yicha amaliy loyihalar muallifi.",
    bioRu: "Ведет исследования в области Интернета вещей (IoT), микроконтроллерных систем и интеграции интеллектуальных датчиков.",
    bioEn: "Researches Internet of Things (IoT), microcontroller architectures, and smart sensor integration for automated monitoring.",
    interests: ["Buyumlar interneti (IoT)", "Mikrokontrollerlar", "O'rnatilgan tizimlar", "Robototexnika"]
  },
  {
    match: "Mirziyodova Gulnozaxon",
    bioUz: "Raqamli iqtisodiyotda ekonometrik modellashtirish, korporativ moliyaviy ma'lumotlar tahlili va intellektual biznes tahliliy tizimlar (BI) bo'yicha ilmiy izlanuvchi. Iqtisodiy jarayonlarni raqamlashtirish bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Исследователь в области эконометрического моделирования, финансовой аналитики и систем бизнес-аналитики (BI) в цифровой экономике.",
    bioEn: "Researcher in econometric modeling, financial analytics, and Business Intelligence (BI) systems in the digital economy.",
    interests: ["Raqamli iqtisodiyot", "Ekonometrika", "Biznes tahlili (BI)", "Ma'lumotlar tahlili"]
  },
  {
    match: "Polvonov Sarvarbek",
    bioUz: "Sanoat avtomatlashtirish tizimlari (SCADA), robototexnika vositalari va intellektual datchiklar boshqaruvi bo'yicha ilmiy-tadqiqot faoliyati olib boradi. Avtomatlashtirilgan ishlab chiqarish liniyalari samaradorligini oshirish bo'yicha izlanuvchi.",
    bioRu: "Специалист по системам промышленной автоматизации (SCADA), робототехнике и управлению датчиками.",
    bioEn: "Specializes in industrial automation systems (SCADA), robotics, and intelligent sensor process control.",
    interests: ["Sanoat avtomatizatsiyasi", "SCADA tizimlari", "Robototexnika", "Mexatronika"]
  },
  {
    match: "Shonazarov Soatmurot",
    bioUz: "Matematik analiz, differensial tenglamalar va xususiy hosilali tenglamalarning chekli elementlar usuli bilan yechimlari bo'yicha ilmiy izlanishlar olib boradi. Oliy ta'limda zamonaviy hisoblash usullarini qo'llash bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Проводит исследования по математическому анализу, дифференциальным уравнениям и численным методам.",
    bioEn: "Conducts research in mathematical analysis, differential equations, and computational methods.",
    interests: ["Matematik analiz", "Differensial tenglamalar", "Chekli elementlar usuli", "Amaliy matematika"]
  },
  {
    match: "Mamadjanov Shuxratjon",
    bioUz: "Telekommunikatsiya tarmoqlari, simsiz ma'lumot uzatish protokollari (5G/6G) va optik tolali aloqa tizimlari bo'yicha ilmiy tadqiqot olib boradi. Zamonaviy tarmoqlarda ma'lumotlar oqimini marshrutlashni optimallashtirish bo'yicha maqolalar muallifi.",
    bioRu: "Исследует телекоммуникационные сети, беспроводные протоколы связи и волоконно-оптические системы передачи данных.",
    bioEn: "Researches telecommunication networks, wireless data protocols, and fiber-optic communication optimization.",
    interests: ["Telekommunikatsiya", "Simsiz aloqa", "Optik tarmoqlar", "Tarmoq marshrutlash"]
  },
  {
    match: "Turg‘unova Nafisaxon",
    bioUz: "Web texnologiyalari, frontend dasturlash arxitekturasi va foydalanuvchi tajribasini (UX) modellashtirish sohasida ilmiy-amaliy faoliyat yuritadi. Zamonaviy interaktiv ta'lim platformalarini ishlab chiqish bo'yicha izlanuvchi.",
    bioRu: "Специализируется на веб-технологиях, архитектуре фронтенд-разработки и моделировании пользовательского опыта (UX).",
    bioEn: "Specializes in web technologies, frontend architecture, and user experience (UX) modeling for interactive platforms.",
    interests: ["Web dasturlash", "Frontend arxitekturasi", "UI/UX muhandisligi", "Interaktiv tizimlar"]
  },
  {
    match: "Kuchkarov Azamat",
    bioUz: "Raqamli tasvirlarga ishlov berish, kompyuter ko'rishi va sun'iy intellekt algoritmlarini video oqimlarida qo'llash bo'yicha ilmiy tadqiqotlar olib boradi. Avtomatlashtirilgan obyektlarni aniqlash tizimlari bo'yicha ilmiy nashrlar muallifi.",
    bioRu: "Занимается обработкой цифровых изображений, компьютерным зрением и алгоритмами ИИ в видеопотоках.",
    bioEn: "Conducts research in digital image processing, computer vision, and AI-driven video stream object detection.",
    interests: ["Kompyuter ko'rishi", "Raqamli tasvirlar", "Sun'iy intellekt", "Tasvirlarni filtrlash"]
  },
  {
    match: "O‘rishov Sardor",
    bioUz: "Sun'iy intellekt, chuqur neyron to'rlari va kompyuter ko'rishi bo'yicha Janubiy Koreyaning nufuzli Chonnam National universitetida magistrlik darajasini olgan. Avtonom harakatlanuvchi robotlar, mashinali ko'rish va tasvirlarni semantik segmentatsiyalash bo'yicha xalqaro loyihalar ishtirokchisi.",
    bioRu: "Получил степень магистра в Chonnam National University (Южная Корея). Участник международных проектов по автономным роботам и компьютерному зрению.",
    bioEn: "Earned his Master's degree at Chonnam National University (South Korea). Participant in international projects on autonomous robotics, computer vision, and semantic image segmentation.",
    interests: ["Sun'iy intellekt", "Kompyuter ko'rishi", "Avtonom robotlar", "Deep Learning", "Koreya ta'lim tajribasi"]
  },
  {
    match: "Abduraximov Dilshod",
    bioUz: "Mashinasozlikda kompyuter modellashtirish (CAD/CAM/CAE), avtomatlashtirilgan loyihalash va 3D modellashtirish tizimlari bo'yicha Turin politexnika universiteti magistratura bosqichida ilmiy izlanishlar olib boradi.",
    bioRu: "Проводит исследования в области компьютерного моделирования (CAD/CAM/CAE) и автоматизированного проектирования.",
    bioEn: "Conducts research in computer-aided design and engineering (CAD/CAM/CAE) and automated industrial modeling.",
    interests: ["CAD/CAM tizimlari", "3D modellashtirish", "Avtomatlashtirilgan loyihalash", "Sanoat texnologiyalari"]
  },
  {
    match: "Ilxomzoda Azizbek",
    bioUz: "Xalqaro moliya, FinTech texnologiyalari va raqamli iqtisodiyot bo'yicha nufuzli Sorbonna (Parij) va Venetsiya universitetlarida tahsil olgan. Raqamli to'lov tizimlari, blokcheyn texnologiyalari va xalqaro investitsiya tahlili bo'yicha ilmiy izlanuvchi.",
    bioRu: "Обучался в университетах Сорбонна и Венеции. Исследует FinTech технологии, цифровые платежные системы и блокчейн.",
    bioEn: "Educated at Sorbonne (Paris) and Ca' Foscari University of Venice. Researches FinTech innovations, digital payments, and blockchain economy.",
    interests: ["FinTech", "Blokcheyn", "Raqamli moliya", "Xalqaro biznes", "Iqtisodiy transformatsiya"]
  },
  {
    match: "Sadikov Shoxrux",
    bioUz: "Iqtisodiyotda matematik usullar, moliyaviy ekonometrika va makroiqtisodiy jarayonlarni modellashtirish bo'yicha yetakchi olim. DSc, dotsent. Ko'plab nufuzli xalqaro jurnallarda ilmiy maqolalar, monografiyalar va darsliklar muallifi. Moliyaviy xatarlarni baholashning stoxastik modellari bo'yicha ilmiy maktab asoschisi.",
    bioRu: "Ведущий ученый в области математических методов в экономике, финансовой эконометрики и макромоделирования. DSc, доцент.",
    bioEn: "Leading scholar in mathematical economics, financial econometrics, and macroeconomic modeling. DSc, Associate Professor.",
    interests: ["Moliyaviy ekonometrika", "Makroiqtisodiy modellashtirish", "Kvantitativ tahlil", "Xatarlarni boshqarish"]
  },
  {
    match: "Rixsiboyev Nozimbek",
    bioUz: "Ekonometrika, statistik tahlil va korporativ boshqaruv tizimlarini raqamlashtirish bo'yicha PhD ilmiy darajasiga ega. Ishlab chiqarish va xizmat ko'rsatish tarmoqlarida raqamli monitoring tizimlarini joriy etish bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Обладает ученой степенью PhD по эконометрике и статистическому анализу в цифровых системах управления.",
    bioEn: "Holds a PhD in econometrics and statistical analysis for digital corporate management systems.",
    interests: ["Ekonometrika", "Statistik tahlil", "Raqamli monitoring", "Biznes jarayonlari"]
  },
  {
    match: "Xashimova Dilyora",
    bioUz: "Axborot tizimlari va texnologiyalari, ta'lim jarayonlarini raqamlashtirish va pedagogik dasturiy vositalar yaratish bo'yicha ko'p yillik tajribaga ega dotsent. Elektron ta'lim muhitida talabalar bilimini monitoring qilish metodikalari muallifi.",
    bioRu: "Доцент с многолетним опытом в области информационных систем, цифровизации образования и педагогических программных средств.",
    bioEn: "Associate Professor with extensive expertise in information systems, educational digitalization, and e-learning platforms.",
    interests: ["Axborot tizimlari", "Pedagogik dasturiy vositalar", "E-learning", "Raqamli pedagogika"]
  },
  {
    match: "Axmedov Dilshod",
    bioUz: "Optimal boshqaruv nazariyasi, differensial tenglamalar va murakkab dinamik tizimlarni matematik modellashtirish sohasida tan olingan olim. DSc, dotsent. O'zbekiston Milliy universiteti va yetakchi ilmiy markazlarda fundamental tadqiqotlar olib borgan. 50 dan ortiq ilmiy maqolalar muallifi.",
    bioRu: "Признанный ученый в теории оптимального управления, дифференциальных уравнений и моделирования динамических систем. DSc, доцент.",
    bioEn: "Recognized scholar in optimal control theory, differential equations, and dynamic systems modeling. DSc, Associate Professor.",
    interests: ["Optimal boshqaruv", "Differensial tenglamalar", "Dinamik tizimlar", "Matematik fizika"]
  },
  {
    match: "Mirzayeva Malika",
    bioUz: "Telekommunikatsiya texnologiyalari, axborot xavfsizligi va optik ma'lumot uzatish tarmoqlari bo'yicha PhD, dotsent. Simsiz tarmoqlarda shovqinlarga bardoshli kodlash va signalni qayta ishlash bo'yicha ilmiy loyihalar rahbari.",
    bioRu: "PhD, доцент по телекоммуникационным технологиям, информационной безопасности и волоконно-оптическим сетям.",
    bioEn: "PhD, Associate Professor in telecommunications, cybersecurity, and optical data transmission networks.",
    interests: ["Telekommunikatsiya", "Optik tarmoqlar", "Axborot xavfsizligi", "Signallarni qayta ishlash"]
  },
  {
    match: "Arabov Ubaydullo",
    bioUz: "Amaliy matematika, sonli usullar va hisoblash matematikasi algoritmlarini optimallashtirish sohasida ilmiy-pedagogik faoliyat olib boradi. Oliy ta'lim muassasalarida matematika fanlarini o'qitishning innovatsion metodikalari muallifi.",
    bioRu: "Специалист по прикладной математике, численным методам и вычислительным алгоритмам.",
    bioEn: "Specialist in applied mathematics, numerical methods, and computational algorithm optimization.",
    interests: ["Amaliy matematika", "Sonli usullar", "Hisoblash matematikasi", "Algoritmik modellashtirish"]
  },
  {
    match: "Ergashev Elyor",
    bioUz: "Ma'lumotlar bazalari arxitekturasi, serverli dasturiy vositalar va taqsimlangan axborot tizimlari xavfsizligi bo'yicha ilmiy izlanuvchi. Yuqori yuklamali axborot platformalarini optimallashtirish bo'yicha tadqiqotlar olib boradi.",
    bioRu: "Исследователь в области архитектуры баз данных, серверных программных средств и безопасности распределенных систем.",
    bioEn: "Researcher in database architecture, backend server engineering, and distributed systems reliability.",
    interests: ["Ma'lumotlar bazalari", "Backend muhandisligi", "Tizimlar xavfsizligi", "Web texnologiyalari"]
  },
  {
    match: "Djurayev Ma’mur",
    bioUz: "Dasturiy injiniring, bulutli servislar arxitekturasi va korporativ axborot tizimlari bo'yicha Janubiy Koreyaning Yeungnam universitetida magistrlik darajasini olgan. Xalqaro dasturiy ta'minot standartlari va agil boshqaruv metodikalari bo'yicha mutaxassis.",
    bioRu: "Получил степень магистра в Yeungnam University (Южная Корея). Эксперт по инженерии программного обеспечения и облачным сервисам.",
    bioEn: "Earned his Master's degree at Yeungnam University (South Korea). Expert in software engineering, cloud services architecture, and agile methodologies.",
    interests: ["Dasturiy injiniring", "Bulutli servislar", "Koreya ta'lim tajribasi", "Agile metodologiya"]
  },
  {
    match: "Qurbonov Xurshid",
    bioUz: "Axborot xavfsizligi, tarmoq arxitekturasi va tizimli integratsiya bo'yicha Koreya politexnika universiteti bitiruvchisi. Kompyuter tarmoqlarida kiberhimoya vositalari va virtualizatsiya texnologiyalari bo'yicha ilmiy-amaliy faoliyat yuritadi.",
    bioRu: "Выпускник Корейского политехнического университета. Специалист по киберзащите сетей и технологиям виртуализации.",
    bioEn: "Graduate of Korea Polytechnic University. Specialist in network cyber defense, system integration, and virtualization technologies.",
    interests: ["Tarmoq xavfsizligi", "Kiberhimoya", "Virtualizatsiya", "Tizimli integratsiya"]
  },
  {
    match: "Hayotov Abdullo",
    bioUz: "Xususiy hosilali differensial tenglamalar, matematik fizika masalalari va chegaraviy masalalarning analitik yechimlari bo'yicha ilmiy tadqiqotlar olib boradi. Ilmiy jurnallarda ko'plab maqolalar chop etgan tajribali pedagog.",
    bioRu: "Исследует дифференциальные уравнения в частных производных, задачи математической физики и аналитические методы решений.",
    bioEn: "Researches partial differential equations, mathematical physics problems, and analytical boundary-value solutions.",
    interests: ["Differensial tenglamalar", "Matematik fizika", "Matematik analiz", "Chegaraviy masalalar"]
  },
  {
    match: "Hamdamov Muzaffar",
    bioUz: "Matematik mantiq, diskret matematika, graflar nazariyasi va kompyuter grafikasi algoritmlari bo'yicha ilmiy izlanishlar olib boradi. Algoritmlarni vizuallashtirish va geometrik modellashtirish bo'yicha ilmiy ishlar muallifi.",
    bioRu: "Ведет исследования по математической логике, дискретной математике, теории графов и алгоритмам компьютерной графики.",
    bioEn: "Conducts research in mathematical logic, discrete mathematics, graph theory, and computer graphics algorithms.",
    interests: ["Diskret matematika", "Graflar nazariyasi", "Kompyuter grafikasi", "Matematik mantiq"]
  },
  {
    match: "Abdullayev Jo‘shqin",
    bioUz: "Raqamli signallarni qayta ishlash, tibbiy tasvirlar tahlili va biotibbiyot muhandisligi axborot tizimlari bo'yicha ilmiy tadqiqot olib boradi. Shovqinli signallarni adaptiv filtrlash algoritmlari bo'yicha izlanuvchi.",
    bioRu: "Специалист по обработке цифровых сигналов, анализу медицинских изображений и биомедицинским информационным системам.",
    bioEn: "Specialist in digital signal processing, biomedical imaging analysis, and adaptive filtering algorithms.",
    interests: ["Signallarni qayta ishlash", "Biotibbiyot tizimlari", "Raqamli filtrlar", "Tasvirlar tahlili"]
  },
  {
    match: "Boltayev Habibjon",
    bioUz: "Stoxastik tahlil, tasodifiy jarayonlar va matematik statistikaning amaliy masalalari bo'yicha ilmiy tadqiqot olib boradi. Tavakkalchiliklarni baholash va ehtimolli bashoratlash modellari bo'yicha ilmiy nashrlar muallifi.",
    bioRu: "Исследует стохастический анализ, случайные процессы и прикладные задачи математической статистики.",
    bioEn: "Researches stochastic analysis, random processes, and applied mathematical statistics for probabilistic forecasting.",
    interests: ["Stoxastik tahlil", "Matematik statistika", "Ehtimollar nazariyasi", "Xatarlarni bashoratlash"]
  },
  {
    match: "Karimov Jaxongir",
    bioUz: "Frontend dasturlash arxitekturasi, zamonaviy JavaScript/TypeScript ekotizimlari va reaktiv foydalanuvchi interfeyslari muhandisligi bo'yicha ilmiy-amaliy faoliyat yuritadi. Veb-tizimlar xavfsizligi va yuqori tezlikdagi renderlash texnologiyalari bo'yicha tadqiqotchi.",
    bioRu: "Специализируется на фронтенд-архитектуре, экосистеме JavaScript/TypeScript и высокоскоростных интерфейсах.",
    bioEn: "Specializes in modern frontend architecture, JavaScript/TypeScript ecosystems, and high-performance reactive web interfaces.",
    interests: ["Frontend dasturlash", "TypeScript", "Web samaradorlik", "Foydalanuvchi interfeysi (UI)"]
  },
  {
    match: "Keunimjayev Muxamedali",
    bioUz: "Sun'iy intellekt asoslari, Python dasturlash tili va ma'lumotlar tahlili (Data Science) sohasida ilmiy-pedagogik izlanishlar olib boradi. Mashinali o'rganish modellarini amaliy jarayonlarga tatbiq qilish bo'yicha loyihalar ishtirokchisi.",
    bioRu: "Исследователь в области основ искусственного интеллекта, языка Python и науки о данных (Data Science).",
    bioEn: "Researcher in artificial intelligence fundamentals, Python engineering, and applied Data Science models.",
    interests: ["Data Science", "Python muhandisligi", "Mashinali o'rganish", "Ma'lumotlar tahlili"]
  },
  {
    match: "Umarov Ulug‘bek",
    bioUz: "Kompyuter tarmoqlari arxitekturasi, server tizimlari ma'muriyati va axborot infratuzilmasini himoyalash bo'yicha mutaxassis. Korporativ axborot tizimlarining uzluksiz ishlashini ta'minlash va virtualizatsiya texnologiyalari bo'yicha ilmiy maqolalar muallifi.",
    bioRu: "Специалист по архитектуре компьютерных сетей, администрированию серверов и защите информационной инфраструктуры.",
    bioEn: "Specialist in computer network architecture, server administration, and information infrastructure security.",
    interests: ["Tizim ma'muriyati", "Tarmoq arxitekturasi", "Virtualizatsiya", "Axborot xavfsizligi"]
  }
];

async function main() {
  console.log(`Starting update for ${SCHOLAR_ACADEMIC_DATA.length} scholars...`);
  let count = 0;
  for (const s of SCHOLAR_ACADEMIC_DATA) {
    const found = await prisma.scholarProfile.findFirst({
      where: { fullName: { contains: s.match } }
    });
    if (found) {
      await prisma.scholarProfile.update({
        where: { id: found.id },
        data: {
          bioUz: s.bioUz,
          bioRu: s.bioRu,
          bioEn: s.bioEn,
          researchInterests: JSON.stringify(s.interests)
        }
      });
      count++;
      console.log(`[${count}/${SCHOLAR_ACADEMIC_DATA.length}] Updated academic bio for: ${found.fullName}`);
    } else {
      console.warn(`NOT FOUND: ${s.match}`);
    }
  }
  console.log(`\nSuccessfully updated all ${count} scholars!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
