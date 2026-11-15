'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  Layers,
  Building2,
  GraduationCap,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const ease = [0.22, 1, 0.36, 1];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export default function HomeMetricsBento({
  stats,
  labels,
  locale = 'uz',
  topScholars = [],
  yearlyBars = [],
  facultyShares = [],
}) {
  const maxBar = Math.max(...yearlyBars.map((b) => b.count), 1);
  const totalPubs = Math.max(stats.approvedPublications, 1);
  const scopusWosPct = Math.round((stats.scopusWosCount / totalPubs) * 100);
  const oakPct = Math.round((stats.oakCount / totalPubs) * 100);
  const otherPct = Math.max(0, 100 - scopusWosPct - oakPct);

  const totalBars = 20;
  const filledBars = Math.min(
    totalBars,
    Math.max(4, Math.round(((stats.grantProjects + stats.supervisions) / 20) * totalBars))
  );

  const maxFacultyScore = Math.max(...facultyShares.map((f) => f.score), 1);

  const t = {
    uz: {
      sectionBadge: 'Real-Time Analitika',
      sectionTitle: 'TIU Ilmiy Salohiyat Ko‘rsatkichlari',
      qualityTitle: 'Ilmiy Sifat',
      scopusWos: 'Scopus & WoS',
      oak: 'OAK',
      avgHIndex: "O'rtacha H-Indeks",
      grantsAndSup: 'Grantlar & Shogirdlar',
      grantsLabel: 'Grantlar',
      supLabel: 'PhD / DSc',
      facultyShareTitle: 'Fakultetlar Ilmiy Ulushi',
      scholarsSub: 'TIU ilmiy hamjamiyati',
      pubsSub: 'Oxirgi 5 yillik nashrlar dinamikasi',
    },
    ru: {
      sectionBadge: 'Аналитика в реальном времени',
      sectionTitle: 'Показатели научного потенциала TIU',
      qualityTitle: 'Качество публикаций',
      scopusWos: 'Scopus & WoS',
      oak: 'ВАК',
      avgHIndex: 'Средний H-индекс',
      grantsAndSup: 'Гранты и докторанты',
      grantsLabel: 'Гранты',
      supLabel: 'PhD / DSc',
      facultyShareTitle: 'Вклад факультетов',
      scholarsSub: 'Научное сообщество TIU',
      pubsSub: 'Динамика публикаций за 5 лет',
    },
    en: {
      sectionBadge: 'Real-Time Analytics',
      sectionTitle: 'TIU Scientific Potential Metrics',
      qualityTitle: 'Research Quality',
      scopusWos: 'Scopus & WoS',
      oak: 'OAK',
      avgHIndex: 'Avg H-Index',
      grantsAndSup: 'Grants & Supervisions',
      grantsLabel: 'Grants',
      supLabel: 'PhD / DSc',
      facultyShareTitle: 'Faculty Research Share',
      scholarsSub: 'TIU research community',
      pubsSub: '5-year publication growth',
    },
  }[locale] || {
    sectionBadge: 'Real-Time Analitika',
    sectionTitle: 'TIU Ilmiy Salohiyat Ko‘rsatkichlari',
    qualityTitle: 'Ilmiy Sifat',
    scopusWos: 'Scopus & WoS',
    oak: 'OAK',
    avgHIndex: "O'rtacha H-Indeks",
    grantsAndSup: 'Grantlar & Shogirdlar',
    grantsLabel: 'Grantlar',
    supLabel: 'PhD / DSc',
    facultyShareTitle: 'Fakultetlar Ilmiy Ulushi',
    scholarsSub: 'TIU ilmiy hamjamiyati',
    pubsSub: 'Oxirgi 5 yillik nashrlar dinamikasi',
  };

  const cardClass =
    'group neu-card rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer h-full hover:-translate-y-0.5';

  return (
    <section className="w-full min-h-[88vh] flex flex-col justify-center bg-transparent py-16 md:py-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold tracking-wide uppercase">
              {t.sectionBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] tracking-tight">
              {t.sectionTitle}
            </h2>
          </div>
        </motion.div>

        {/* Asymmetric Full-Layout 12-Col Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55, ease }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
        >
          {/* Featured Tall Left Card (5 cols, 2 rows): Approved Publications -> /publications */}
          <Link href="/publications" className="lg:col-span-5 lg:row-span-2 block">
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800">
                      {labels.approvedPublications}
                    </h3>
                    <p className="text-xs text-slate-500">{t.pubsSub}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-extrabold text-[#0F294A] tracking-tight">
                  <AnimatedCounter value={stats.approvedPublications} />
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Scopus • WoS • OAK
                </span>
              </div>

              {/* Tall 5-Year Bar Chart */}
              <div className="flex items-end justify-between gap-3 h-44 pt-6 border-b border-slate-100 pb-2">
                {yearlyBars.map((bar, idx) => {
                  const heightPct = Math.max(22, Math.round((bar.count / maxBar) * 100));
                  const isLast = idx === yearlyBars.length - 1;
                  return (
                    <div
                      key={bar.year}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar"
                    >
                      <span className="text-xs font-bold text-slate-500 group-hover/bar:text-emerald-700 tabular-nums transition-colors">
                        {bar.count}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${heightPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: idx * 0.08, ease }}
                        className={`w-full rounded-t-2xl transition-all duration-200 ${
                          isLast
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md'
                            : 'bg-emerald-100 group-hover/bar:bg-emerald-300'
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-400 tabular-nums">
                        {bar.year}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Link>

          {/* Top-Middle (4 cols): Active Scholars + Avatar Stack -> /scholars */}
          <Link href="/scholars" className="lg:col-span-4 block">
            <motion.div
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900">
                    {labels.activeScholars}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-4xl font-extrabold text-[#0F294A] tracking-tight">
                  <AnimatedCounter value={stats.activeScholars} />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold tabular-nums">
                    DSc: {stats.dscCount}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold tabular-nums">
                    PhD: {stats.phdCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex -space-x-2.5">
                  {topScholars.slice(0, 4).map((s, idx) => (
                    <ScholarAvatar
                      key={s.id}
                      photoUrl={s.photoUrl}
                      fullName={s.fullName}
                      index={idx}
                      className="w-9 h-9"
                    />
                  ))}
                  {stats.activeScholars > 4 && (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                      +{stats.activeScholars - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">{t.scholarsSub}</span>
              </div>
            </motion.div>
          </Link>

          {/* Top-Right (3 cols): Research Quality -> /publications?type=SCOPUS */}
          <Link href="/publications?type=SCOPUS" className="lg:col-span-3 block">
            <motion.div
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800">
                    {t.qualityTitle}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#0F294A] tracking-tight tabular-nums">
                  <AnimatedCounter value={scopusWosPct} />%
                </span>
                <span className="text-xs font-bold text-emerald-700">{t.scopusWos}</span>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div style={{ width: `${scopusWosPct}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${oakPct}%` }} className="bg-blue-600 h-full" />
                  <div style={{ width: `${otherPct}%` }} className="bg-slate-300 h-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 tabular-nums">
                  <span>{t.scopusWos}: {stats.scopusWosCount}</span>
                  <span>{t.oak}: {stats.oakCount}</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Bottom-Middle (4 cols): Citations & Avg H-Index -> /rankings */}
          <Link href="/rankings" className="lg:col-span-4 block">
            <motion.div
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-800">
                    {labels.totalCitations}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="grid grid-cols-12 items-end gap-3">
                <div className="col-span-6 space-y-2">
                  <span className="text-4xl font-extrabold text-[#0F294A] tracking-tight block">
                    <AnimatedCounter value={stats.totalCitations} />
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold tabular-nums">
                    {t.avgHIndex}: {stats.avgHIndex}
                  </span>
                </div>

                <div className="col-span-6 h-20">
                  <svg viewBox="0 0 200 75" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 5 60 C 35 55, 50 42, 75 45 C 100 48, 115 24, 145 28 C 165 30, 180 14, 195 10 L 195 72 L 5 72 Z"
                      fill="url(#citGrad)"
                    />
                    <motion.path
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease }}
                      d="M 5 60 C 35 55, 50 42, 75 45 C 100 48, 115 24, 145 28 C 165 30, 180 14, 195 10"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="195" cy="10" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Bottom-Right (3 cols): Grants & Supervisions -> /scholars?academicDegree=DSC */}
          <Link href="/scholars?academicDegree=DSC" className="lg:col-span-3 block">
            <motion.div
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800">
                    {t.grantsAndSup}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-3xl font-extrabold text-[#0F294A] tracking-tight block">
                    <AnimatedCounter value={stats.grantProjects} />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                    {t.grantsLabel}
                  </span>
                </div>
                <div className="border-l border-slate-100 pl-3">
                  <span className="text-3xl font-extrabold text-[#0F294A] tracking-tight block">
                    <AnimatedCounter value={stats.supervisions} />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    {t.supLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-20 gap-1 h-5">
                {Array.from({ length: totalBars }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      i < filledBars ? 'bg-gradient-to-b from-blue-500 to-blue-700' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </Link>

          {/* Bottom Full-Width Row (12 cols): Faculty Research Share -> /faculties */}
          <Link href="/faculties" className="md:col-span-2 lg:col-span-12 block">
            <motion.div
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.22, ease }}
              className={cardClass}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F294A] dark:text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900">
                    {t.facultyShareTitle}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {facultyShares.slice(0, 3).map((fac) => {
                  const pct = Math.max(12, Math.round((fac.score / maxFacultyScore) * 100));
                  return (
                    <div key={fac.id} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[75%]">
                          {fac.name}
                        </span>
                        <span className="font-bold text-[#0F294A] tabular-nums">
                          {Math.round(fac.score)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.75, ease }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0F294A] to-blue-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
