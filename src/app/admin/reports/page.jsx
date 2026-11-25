'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  Printer,
  Users,
  BookOpen,
  Briefcase,
  Building2,
  Search,
  Filter,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    badge: 'Analitika va Rasmiy Hisobotlar Markazi',
    title: 'Hisobotlar va Eksport Studiyasi',
    subtitle: 'Olimlar reytingi, tasdiqlangan nashrlar, grant loyihalari va kafedralar kesimida Excel, CSV va chop etish eksporti.',
    tabScholars: 'Olimlar reytingi',
    tabPublications: 'Nashrlar reestri',
    tabGrants: 'Grant loyihalari',
    tabDepartments: 'Kafedralar svodkasi',
    allFaculties: 'Barcha fakultetlar',
    allDepts: 'Barcha kafedralar',
    allYears: 'Barcha yillar',
    searchPh: 'Nomi, F.I.Sh., DOI yoki kod bo‘yicha qidirish...',
    exportCsv: 'CSV Yuklash',
    exportXls: 'Excel (.xls)',
    printPdf: 'Chop etish / PDF',
    loading: 'Hisobot ma’lumotlari yuklanmoqda...',
    empty: 'Tanlangan filtrlar bo‘yicha ma’lumot topilmadi.',
    sumRecords: 'Jami yozuvlar',
    sumPubs: 'Jami nashrlar',
    sumScopus: 'Scopus / WoS',
    sumAvgScore: 'O‘rtacha TIU Ball',
    sumCitations: 'Jami iqtiboslar',
    sumOak: 'OAK nashrlar',
    sumApprovedGrants: 'Tasdiqlangan / Yutilgan',
    sumPendingGrants: 'Ko‘rib chiqilmoqda',
    sumBudget: 'Jami so‘ralgan byudjet',
    sumScholars: 'Faol olimlar',
    sumPotential: 'O‘rtacha ilmiy salohiyat',
    cols: {
      rank: '#',
      fullName: 'F.I.Sh.',
      position: 'Lavozimi',
      dept: 'Kafedra',
      faculty: 'Fakultet',
      scopusWos: 'Scopus/WoS',
      oak: 'OAK',
      totalPubs: 'Nashrlar',
      citations: 'Iqtibos',
      hIndex: 'H-Index',
      grants: 'Grant',
      kpi: 'KPI %',
      score: 'TIU Ball',
      title: 'Sarlavha / Mavzu',
      type: 'Tur',
      quartile: 'Kvartil',
      year: 'Yil',
      journal: 'Jurnal / Nashriyot',
      authors: 'Mualliflar',
      code: 'Kod',
      funder: 'Fond / Tashkilot',
      pi: 'Rahbar (PI)',
      period: 'Muddat',
      budget: 'Byudjet (UZS)',
      status: 'Holati',
      activeScholars: 'Olimlar',
      dscPhd: 'DSc / PhD',
      potential: 'Ilmiy salohiyat',
      totalScore: 'Jami Ball',
      avgScore: 'O‘rtacha Ball',
    },
  },
  ru: {
    badge: 'Центр аналитики и официальных отчётов',
    title: 'Отчёты и экспорт данных',
    subtitle: 'Экспорт рейтинга учёных, реестра публикаций, грантовых проектов и сводки по кафедрам в Excel, CSV и PDF.',
    tabScholars: 'Рейтинг учёных',
    tabPublications: 'Реестр публикаций',
    tabGrants: 'Грантовые проекты',
    tabDepartments: 'Сводка кафедр',
    allFaculties: 'Все факультеты',
    allDepts: 'Все кафедры',
    allYears: 'Все годы',
    searchPh: 'Поиск по названию, ФИО, DOI или коду...',
    exportCsv: 'Скачать CSV',
    exportXls: 'Excel (.xls)',
    printPdf: 'Печать / PDF',
    loading: 'Загрузка данных отчёта...',
    empty: 'По выбранным фильтрам данные не найдены.',
    sumRecords: 'Всего записей',
    sumPubs: 'Всего публикаций',
    sumScopus: 'Scopus / WoS',
    sumAvgScore: 'Средний балл TIU',
    sumCitations: 'Всего цитирований',
    sumOak: 'Публикации ВАК',
    sumApprovedGrants: 'Одобрено / Выиграно',
    sumPendingGrants: 'На рассмотрении',
    sumBudget: 'Общий бюджет',
    sumScholars: 'Активные учёные',
    sumPotential: 'Средний науч. потенциал',
    cols: {
      rank: '#',
      fullName: 'ФИО',
      position: 'Должность',
      dept: 'Кафедра',
      faculty: 'Факультет',
      scopusWos: 'Scopus/WoS',
      oak: 'ВАК',
      totalPubs: 'Публ.',
      citations: 'Цитир.',
      hIndex: 'H-Index',
      grants: 'Гранты',
      kpi: 'KPI %',
      score: 'Балл TIU',
      title: 'Название',
      type: 'Тип',
      quartile: 'Квартиль',
      year: 'Год',
      journal: 'Журнал / Издание',
      authors: 'Авторы',
      code: 'Код',
      funder: 'Фонд / Программа',
      pi: 'Руководитель',
      period: 'Период',
      budget: 'Бюджет (UZS)',
      status: 'Статус',
      activeScholars: 'Учёные',
      dscPhd: 'DSc / PhD',
      potential: 'Остепенённость',
      totalScore: 'Всего баллов',
      avgScore: 'Средний балл',
    },
  },
  en: {
    badge: 'Analytics & Official Reporting Center',
    title: 'Reports & Export Studio',
    subtitle: 'Export scholar leaderboards, approved publications registry, research grants, and department summaries to Excel, CSV, and PDF.',
    tabScholars: 'Scholars Leaderboard',
    tabPublications: 'Publications Registry',
    tabGrants: 'Grants & Projects',
    tabDepartments: 'Department Summary',
    allFaculties: 'All Faculties',
    allDepts: 'All Departments',
    allYears: 'All Years',
    searchPh: 'Search by title, name, DOI, or code...',
    exportCsv: 'Download CSV',
    exportXls: 'Excel (.xls)',
    printPdf: 'Print / PDF',
    loading: 'Loading report analytics...',
    empty: 'No records match the selected filters.',
    sumRecords: 'Total Records',
    sumPubs: 'Total Publications',
    sumScopus: 'Scopus / WoS',
    sumAvgScore: 'Avg TIU Score',
    sumCitations: 'Total Citations',
    sumOak: 'OAK Papers',
    sumApprovedGrants: 'Approved / Won',
    sumPendingGrants: 'Under Review',
    sumBudget: 'Requested Budget',
    sumScholars: 'Active Scholars',
    sumPotential: 'Avg Degree Potential',
    cols: {
      rank: '#',
      fullName: 'Full Name',
      position: 'Position',
      dept: 'Department',
      faculty: 'Faculty',
      scopusWos: 'Scopus/WoS',
      oak: 'OAK',
      totalPubs: 'Pubs',
      citations: 'Citations',
      hIndex: 'H-Index',
      grants: 'Grants',
      kpi: 'KPI %',
      score: 'TIU Score',
      title: 'Title',
      type: 'Type',
      quartile: 'Quartile',
      year: 'Year',
      journal: 'Journal / Publisher',
      authors: 'Authors',
      code: 'Code',
      funder: 'Funder',
      pi: 'PI',
      period: 'Period',
      budget: 'Budget (UZS)',
      status: 'Status',
      activeScholars: 'Scholars',
      dscPhd: 'DSc / PhD',
      potential: 'Degree %',
      totalScore: 'Total Score',
      avgScore: 'Avg Score',
    },
  },
};

export default function AdminReportsPage() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;

  const [reportType, setReportType] = useState('scholars'); // scholars | publications | grants | departments
  const [rows, setRows] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({});
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: reportType });
      if (facultyId) params.set('facultyId', facultyId);
      if (departmentId) params.set('departmentId', departmentId);
      if (year) params.set('year', year);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const json = await res.json();
      setRows(json.rows || json.scholars || []);
      if (json.faculties) setFaculties(json.faculties);
      if (json.departments) setDepartments(json.departments);
      setSummary(json.summary || {});
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [reportType, facultyId, departmentId, year]);

  useEffect(() => {
    startTransition(() => {
      loadReports();
    });
  }, [loadReports]);

  const buildExportUrl = (format) => {
    const params = new URLSearchParams({ format, type: reportType });
    if (facultyId) params.set('facultyId', facultyId);
    if (departmentId) params.set('departmentId', departmentId);
    if (year) params.set('year', year);
    return `/api/admin/reports?${params.toString()}`;
  };

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  const filteredRows = rows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r).some((val) => String(val ?? '').toLowerCase().includes(q));
  });

  const currentYear = new Date().getFullYear();

  const summaryCards =
    reportType === 'scholars'
      ? [
          { label: t.sumRecords, value: summary.totalRecords ?? 0, icon: Users, accent: 'text-blue-600' },
          { label: t.sumPubs, value: summary.totalPubs ?? 0, icon: BookOpen, accent: 'text-indigo-600' },
          { label: t.sumScopus, value: summary.scopusWos ?? 0, icon: Sparkles, accent: 'text-emerald-600' },
          { label: t.sumAvgScore, value: summary.avgScore ?? 0, icon: Award, navy: true },
        ]
      : reportType === 'publications'
      ? [
          { label: t.sumRecords, value: summary.totalRecords ?? 0, icon: BookOpen, accent: 'text-blue-600' },
          { label: t.sumScopus, value: summary.scopusWos ?? 0, icon: Sparkles, accent: 'text-emerald-600' },
          { label: t.sumOak, value: summary.oak ?? 0, icon: Award, accent: 'text-purple-600' },
          { label: t.sumCitations, value: summary.totalCitations ?? 0, icon: TrendingUp, navy: true },
        ]
      : reportType === 'grants'
      ? [
          { label: t.sumRecords, value: summary.totalRecords ?? 0, icon: Briefcase, accent: 'text-blue-600' },
          { label: t.sumApprovedGrants, value: summary.approvedGrants ?? 0, icon: Award, accent: 'text-emerald-600' },
          { label: t.sumPendingGrants, value: summary.pendingGrants ?? 0, icon: Filter, accent: 'text-amber-600' },
          {
            label: t.sumBudget,
            value: `${Math.round((summary.totalBudget || 0) / 1000000).toLocaleString()}M`,
            icon: FileSpreadsheet,
            navy: true,
          },
        ]
      : [
          { label: t.sumRecords, value: summary.totalRecords ?? 0, icon: Building2, accent: 'text-blue-600' },
          { label: t.sumScholars, value: summary.totalScholars ?? 0, icon: Users, accent: 'text-indigo-600' },
          { label: t.sumPubs, value: summary.totalPubs ?? 0, icon: BookOpen, accent: 'text-emerald-600' },
          { label: t.sumPotential, value: `${summary.avgPotential ?? 0}%`, icon: TrendingUp, navy: true },
        ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Unified Neumorphic Header Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider border border-blue-200/70 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <a
            href={buildExportUrl('csv')}
            className="glass-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </a>

          <a
            href={buildExportUrl('xls')}
            className="glass-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.exportXls}</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="glass-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printPdf}</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs + Filters */}
      <div className="neu-card-sm p-4 sm:p-5 rounded-3xl space-y-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'scholars', label: t.tabScholars, icon: Users },
            { id: 'publications', label: t.tabPublications, icon: BookOpen },
            { id: 'grants', label: t.tabGrants, icon: Briefcase },
            { id: 'departments', label: t.tabDepartments, icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            const active = reportType === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setReportType(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'glass-btn-primary shadow-md'
                    : 'glass-btn text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPh}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={facultyId}
            onChange={(e) => {
              setFacultyId(e.target.value);
              setDepartmentId('');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">{t.allFaculties}</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {getLocalizedName(f)}
              </option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">{t.allDepts}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {getLocalizedName(d)}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">{t.allYears}</option>
            {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Live Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`${
                card.navy ? 'neu-card-navy text-white' : 'neu-card-sm'
              } p-5 rounded-2xl space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    card.navy ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.navy ? 'text-amber-400' : card.accent}`} />
              </div>
              <div
                className={`font-mono text-2xl sm:text-3xl font-extrabold ${
                  card.navy ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}
              >
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Data Table */}
      <div className="neu-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-slate-500 dark:text-slate-400 text-sm">{t.loading}</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-14 text-center text-slate-500 dark:text-slate-400 text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === 'scholars' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3.5 px-4">{t.cols.rank}</th>
                    <th className="py-3.5 px-4">{t.cols.fullName}</th>
                    <th className="py-3.5 px-4">{t.cols.position}</th>
                    <th className="py-3.5 px-4">{t.cols.dept}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.scopusWos}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.oak}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.totalPubs}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.citations}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.hIndex}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.grants}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.kpi}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.score}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-sm">
                  {filteredRows.map((s) => {
                    const posText =
                      locale === 'ru'
                        ? s.positionRu || s.position
                        : locale === 'en'
                        ? s.positionEn || s.position
                        : s.position;
                    return (
                      <tr key={s.id || s.rank + s.email} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{s.rank}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-sky-300">
                              {s.photoUrl ? (
                                <img
                                  src={s.photoUrl}
                                  alt={s.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{s.fullName?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{s.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {posText || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">{s.department}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.scopusWos}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.oak}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.totalPubs}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.totalCitations}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.hIndex}</td>
                        <td className="py-3 px-3 text-center font-mono">{s.grants}</td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.kpiPercent}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-700 dark:text-sky-400">
                          {s.tiuScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {reportType === 'publications' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3.5 px-4">{t.cols.rank}</th>
                    <th className="py-3.5 px-4">{t.cols.title}</th>
                    <th className="py-3.5 px-3">{t.cols.type}</th>
                    <th className="py-3.5 px-3">{t.cols.quartile}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.year}</th>
                    <th className="py-3.5 px-4">{t.cols.journal}</th>
                    <th className="py-3.5 px-4">{t.cols.authors}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.citations}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredRows.map((p) => (
                    <tr key={p.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{p.rank}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs">{p.title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold text-[11px]">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{p.quartile}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.year}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.journalOrPublisher}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{p.authors}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 dark:text-sky-400">
                        {p.citationsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'grants' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3.5 px-4">{t.cols.code}</th>
                    <th className="py-3.5 px-4">{t.cols.title}</th>
                    <th className="py-3.5 px-4">{t.cols.funder}</th>
                    <th className="py-3.5 px-4">{t.cols.pi}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.period}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.budget}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredRows.map((g) => (
                    <tr key={g.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-sky-400">{g.grantCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs">{g.title}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{g.fundingSource}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{g.scholarName}</td>
                      <td className="py-3 px-3 text-center font-mono">
                        {g.startYear}–{g.endYear}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {Number(g.budgetRequested || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'departments' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3.5 px-4">{t.cols.rank}</th>
                    <th className="py-3.5 px-4">{t.cols.dept}</th>
                    <th className="py-3.5 px-4">{t.cols.faculty}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.activeScholars}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.dscPhd}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.potential}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.totalPubs}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.scopusWos}</th>
                    <th className="py-3.5 px-3 text-center">{t.cols.grants}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.totalScore}</th>
                    <th className="py-3.5 px-4 text-right">{t.cols.avgScore}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredRows.map((d) => (
                    <tr key={d.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{d.rank}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {locale === 'ru' ? d.departmentRu || d.department : locale === 'en' ? d.departmentEn || d.department : d.department}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{d.faculty}</td>
                      <td className="py-3 px-3 text-center font-mono">{d.activeScholars}</td>
                      <td className="py-3 px-3 text-center font-mono">
                        {d.dscCount} / {d.phdCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {d.potentialPercent}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{d.totalPubs}</td>
                      <td className="py-3 px-3 text-center font-mono">{d.scopusWos}</td>
                      <td className="py-3 px-3 text-center font-mono">{d.grants}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 dark:text-sky-400">
                        {d.totalScore}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-200">
                        {d.avgScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
