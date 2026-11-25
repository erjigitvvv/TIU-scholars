'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  BookOpen,
  Award,
  ArrowRight,
  Clock,
  Building2,
} from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    loadError: 'Ma’lumotlarni yuklashda xatolik.',
    title: 'Ilmiy Bo‘lim Boshqaruv Paneli',
    subtitle: 'Moderatsiya navbati, olimlar faolligi va fakultetlar kesimida tezkor tahlil.',
    modQueue: 'Moderatsiya navbati',
    pub: 'Nashr',
    grant: 'Grant',
    sup: 'Shogird',
    pendingApps: 'Kutilayotgan arizalar',
    activeScholars: 'Faol olimlar',
    scholarsUnit: 'nafar',
    approvedPubs: 'Tasdiqlangan nashrlar',
    unitTa: 'ta',
    reportsExport: 'Hisobot & Eksport',
    downloadCsv: 'Excel / CSV yuklash',
    facultyScope: 'Fakultet va olimlar kesimida',
    facultyBreakdown: 'Fakultetlar kesimidagi ko‘rsatkichlar',
    faculty: 'Fakultet',
    departments: 'Kafedralar',
    publications: 'Nashrlar',
    avgScore: 'O‘rtacha TIU Ball',
  },
  ru: {
    loadError: 'Ошибка загрузки данных.',
    title: 'Панель управления научного отдела',
    subtitle: 'Очередь модерации, активность учёных и аналитика по факультетам.',
    modQueue: 'Очередь модерации',
    pub: 'Публ.',
    grant: 'Грант',
    sup: 'Рук.',
    pendingApps: 'Ожидающие заявки',
    activeScholars: 'Активные учёные',
    scholarsUnit: 'чел.',
    approvedPubs: 'Одобренные публикации',
    unitTa: 'шт.',
    reportsExport: 'Отчёты и экспорт',
    downloadCsv: 'Скачать Excel / CSV',
    facultyScope: 'По факультетам и учёным',
    facultyBreakdown: 'Показатели по факультетам',
    faculty: 'Факультет',
    departments: 'Кафедры',
    publications: 'Публикации',
    avgScore: 'Средний балл TIU',
  },
  en: {
    loadError: 'Failed to load data.',
    title: 'Scientific Dept. Control Panel',
    subtitle: 'Moderation queue, scholar activity, and faculty-level analytics.',
    modQueue: 'Moderation Queue',
    pub: 'Pubs',
    grant: 'Grants',
    sup: 'Sup.',
    pendingApps: 'Pending Applications',
    activeScholars: 'Active scholars',
    scholarsUnit: '',
    approvedPubs: 'Approved Publications',
    unitTa: '',
    reportsExport: 'Reports & Export',
    downloadCsv: 'Download Excel / CSV',
    facultyScope: 'By faculties & scholars',
    facultyBreakdown: 'Faculty Breakdown',
    faculty: 'Faculty',
    departments: 'Departments',
    publications: 'Publications',
    avgScore: 'Avg TIU Score',
  },
};

export default function AdminOverviewPage() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.counts) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">{t.loadError}</div>;
  }

  const { counts, facultyStats } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/moderation"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t.modQueue}</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-900">
            {counts.totalPendingQueue}
          </div>
          <div className="text-xs text-slate-500">
            {t.pub}: {counts.pendingPublications} · {t.grant}: {counts.pendingGrants} · {t.sup}:{' '}
            {counts.pendingSupervisions}
            {counts.pendingAcademicProjects ? ` · Loyiha: ${counts.pendingAcademicProjects}` : ''}
          </div>
        </Link>

        <Link
          href="/admin/scholars"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t.pendingApps}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-blue-700">
            {counts.pendingScholars}
          </div>
          <div className="text-xs text-slate-500">
            {t.activeScholars}: {counts.activeScholars} {t.scholarsUnit}
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t.approvedPubs}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-emerald-700">
            {counts.approvedPublications}
          </div>
          <div className="text-xs text-slate-500">
            Scopus / WoS: {counts.scopusWosCount} {t.unitTa}
          </div>
        </div>

        <Link
          href="/admin/reports"
          className="p-5 rounded-2xl bg-[#0F294A] text-white shadow-xs hover:bg-blue-900 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase">{t.reportsExport}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold pt-1 flex items-center gap-2">
            {t.downloadCsv} <ArrowRight className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-200">{t.facultyScope}</div>
        </Link>
      </div>

      {/* Faculty Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">{t.facultyBreakdown}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-6">{t.faculty}</th>
                <th className="py-3 px-4">{t.departments}</th>
                <th className="py-3 px-4">{t.activeScholars}</th>
                <th className="py-3 px-4">{t.publications}</th>
                <th className="py-3 px-6 text-right">{t.avgScore}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {facultyStats.map((f) => {
                const name = locale === 'ru' ? f.nameRu || f.nameUz : locale === 'en' ? f.nameEn || f.nameUz : f.nameUz;
                return (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{name}</td>
                    <td className="py-3.5 px-4 font-mono">{f.departmentsCount}</td>
                    <td className="py-3.5 px-4 font-mono">{f.scholarsCount}</td>
                    <td className="py-3.5 px-4 font-mono">{f.publicationsCount}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700 text-right">
                      {f.avgScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
