'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    title: 'Yillik KPI Maqsadlari',
    subtitle: 'Kafedralar va olimlar uchun yillik ilmiy samaradorlik rejalarini belgilash.',
    yearSuffix: '-yil',
    addTitle: 'Yangi KPI maqsad qo‘shish',
    scopeLabel: 'Daraja',
    scopeDept: 'Kafedra bo‘yicha',
    scopeScholar: 'Alohida olim bo‘yicha',
    deptLabel: 'Kafedra',
    scholarLabel: 'Olim',
    selectPlaceholder: 'Tanlang...',
    pubsScopusLabel: 'Nashrlar / Scopus',
    totalPubsTitle: 'Jami nashrlar',
    scopusTitle: 'Scopus / WoS',
    tiuScoreLabel: 'TIU Ball',
    addBtn: 'Qo‘shish',
    loading: 'Yuklanmoqda...',
    empty: 'yil uchun KPI maqsadlari kiritilmagan.',
    colOwner: 'Kafedra / Olim',
    colPubs: 'Maqsad (Nashrlar)',
    colScopus: 'Maqsad (Scopus/WoS)',
    colScore: 'Maqsad (TIU Ball)',
    colAction: 'Amal',
    currentScore: 'Joriy ball',
    deleteTitle: "O'chirish",
    errorMsg: 'Saqlashda xatolik yuz berdi',
  },
  ru: {
    title: 'Годовые цели KPI',
    subtitle: 'Назначение годовых планов научной эффективности для кафедр и учёных.',
    yearSuffix: ' г.',
    addTitle: 'Добавить цель KPI',
    scopeLabel: 'Уровень',
    scopeDept: 'По кафедре',
    scopeScholar: 'Для учёного',
    deptLabel: 'Кафедра',
    scholarLabel: 'Учёный',
    selectPlaceholder: 'Выберите...',
    pubsScopusLabel: 'Публ. / Scopus',
    totalPubsTitle: 'Всего публикаций',
    scopusTitle: 'Scopus / WoS',
    tiuScoreLabel: 'Балл TIU',
    addBtn: 'Добавить',
    loading: 'Загрузка...',
    empty: ' год цели KPI не заданы.',
    colOwner: 'Кафедра / Учёный',
    colPubs: 'Цель (Публикации)',
    colScopus: 'Цель (Scopus/WoS)',
    colScore: 'Цель (Балл TIU)',
    colAction: 'Действие',
    currentScore: 'Текущий балл',
    deleteTitle: 'Удалить',
    errorMsg: 'Ошибка при сохранении',
  },
  en: {
    title: 'Annual KPI Targets',
    subtitle: 'Set annual research performance targets for departments and individual scholars.',
    yearSuffix: '',
    addTitle: 'Add New KPI Target',
    scopeLabel: 'Scope',
    scopeDept: 'By Department',
    scopeScholar: 'By Individual Scholar',
    deptLabel: 'Department',
    scholarLabel: 'Scholar',
    selectPlaceholder: 'Select...',
    pubsScopusLabel: 'Pubs / Scopus',
    totalPubsTitle: 'Total publications',
    scopusTitle: 'Scopus / WoS',
    tiuScoreLabel: 'TIU Score',
    addBtn: 'Add',
    loading: 'Loading...',
    empty: ' has no KPI targets configured yet.',
    colOwner: 'Department / Scholar',
    colPubs: 'Target (Pubs)',
    colScopus: 'Target (Scopus/WoS)',
    colScore: 'Target (TIU Score)',
    colAction: 'Action',
    currentScore: 'Current score',
    deleteTitle: 'Delete',
    errorMsg: 'Failed to save target',
  },
};

export default function AdminKpiPage() {
  const locale = useLocale('uz');
  const dict = DICT[locale] || DICT.uz;
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [targets, setTargets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [scope, setScope] = useState('department');
  const [departmentId, setDepartmentId] = useState('');
  const [scholarId, setScholarId] = useState('');
  const [targetPublications, setTargetPublications] = useState(5);
  const [targetScopus, setTargetScopus] = useState(2);
  const [targetScore, setTargetScore] = useState(40);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (y) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpi?year=${y}`);
      const json = await res.json();
      setTargets(json.targets || []);
      setDepartments(json.departments || []);
      setScholars(json.scholars || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  const getLocalizedName = (item) => {
    if (!item) return '—';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          departmentId: scope === 'department' ? departmentId : null,
          scholarId: scope === 'scholar' ? scholarId : null,
          targetPublications,
          targetScopus,
          targetScore,
        }),
      });
      if (res.ok) {
        setDepartmentId('');
        setScholarId('');
        fetchData(year);
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || dict.errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/kpi?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchData(year);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{dict.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{dict.subtitle}</p>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>
              {y}{dict.yearSuffix}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Add KPI Target Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Target className="w-4 h-4 text-amber-500" />
          {dict.addTitle}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{dict.scopeLabel}</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            >
              <option value="department">{dict.scopeDept}</option>
              <option value="scholar">{dict.scopeScholar}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {scope === 'department' ? dict.deptLabel : dict.scholarLabel}
            </label>
            {scope === 'department' ? (
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="">{dict.selectPlaceholder}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {getLocalizedName(d)} ({d.faculty?.code})
                  </option>
                ))}
              </select>
            ) : (
              <select
                required
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="">{dict.selectPlaceholder}</option>
                {scholars.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {dict.pubsScopusLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={targetPublications}
                onChange={(e) => setTargetPublications(e.target.value)}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                title={dict.totalPubsTitle}
              />
              <input
                type="number"
                min="0"
                value={targetScopus}
                onChange={(e) => setTargetScopus(e.target.value)}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                title={dict.scopusTitle}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">{dict.tiuScoreLabel}</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {dict.addBtn}
            </button>
          </div>
        </div>
      </form>

      {/* Targets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">{dict.loading}</div>
        ) : targets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {year}{dict.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                  <th className="py-3 px-6">{dict.colOwner}</th>
                  <th className="py-3 px-4">{dict.colPubs}</th>
                  <th className="py-3 px-4">{dict.colScopus}</th>
                  <th className="py-3 px-4">{dict.colScore}</th>
                  <th className="py-3 px-6 text-right">{dict.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {targets.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {row.scholar ? (
                        <>
                          {row.scholar.fullName}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            ({dict.currentScore}: {row.scholar.tiuScore})
                          </span>
                        </>
                      ) : (
                        <span>{getLocalizedName(row.department)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{row.targetPublications}</td>
                    <td className="py-3.5 px-4 font-mono">{row.targetScopus ?? row.targetScopusWos ?? 0}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{row.targetScore}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        title={dict.deleteTitle}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
