'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Search,
  Building2,
  UserCheck,
  X,
} from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    badge: 'Strategik Samaradorlik va Rejalashtirish',
    title: 'Yillik KPI Maqsadlari',
    subtitle: 'Kafedralar va alohida olimlar uchun yillik ilmiy rejalarni belgilash hamda ijrosini jonli kuzatish.',
    yearSuffix: '-yil',
    sumTotal: 'Jami Rejalar',
    sumCompleted: '100% Bajarilgan',
    sumAtRisk: 'E’tibor Talab (<60%)',
    sumAvg: 'O‘rtacha Ijro (%)',
    presetsTitle: 'Tezkor Akademik Me’yor Andozalari (1-klik):',
    presetDsc: 'DSc / Professor',
    presetPhd: 'PhD / Dotsent',
    presetSenior: 'Katta o‘qituvchi',
    presetDept: 'Kafedra yillik me’yori',
    addTitle: 'Yangi KPI maqsad qo‘shish / yangilash',
    editTitle: 'KPI maqsadni tahrirlash (Upsert)',
    cancelEdit: 'Bekor qilish',
    scopeLabel: 'Daraja',
    scopeDept: 'Kafedra bo‘yicha',
    scopeScholar: 'Alohida olim bo‘yicha',
    deptLabel: 'Kafedra',
    scholarLabel: 'Olim',
    selectPlaceholder: 'Tanlang...',
    pubsLabel: 'Nashrlar (soni)',
    scopusLabel: 'Scopus / WoS',
    tiuScoreLabel: 'TIU Ball',
    addBtn: 'Saqlash',
    updateBtn: 'Yangilash',
    filterAll: 'Barchasi',
    filterDept: 'Kafedralar',
    filterScholar: 'Olimlar',
    searchPh: 'Kafedra yoki olim bo‘yicha qidirish...',
    loading: 'Yuklanmoqda...',
    empty: 'yil uchun KPI maqsadlari kiritilmagan.',
    colOwner: 'Kafedra / Olim',
    colPubs: 'Nashrlar (Fakt / Reja)',
    colScopus: 'Scopus / WoS',
    colScore: 'TIU Ball',
    colProgress: 'Ijro (%)',
    colStatus: 'Holat',
    colAction: 'Amal',
    editTitleBtn: 'Tahrirlash',
    deleteTitle: 'O‘chirish',
    errorMsg: 'Saqlashda xatolik yuz berdi',
    savedCreate: 'Yangi KPI maqsad muvaffaqiyatli biriktirildi.',
    savedUpdate: 'Mavjud KPI maqsad ko‘rsatkichlari yangilandi.',
    rag: {
      COMPLETED: 'Bajarildi',
      ON_TRACK: 'Rejada',
      AT_RISK: 'Xavf ostida',
      CRITICAL: 'Kritik',
    },
    deptTag: 'Kafedra',
    scholarTag: 'Olim',
  },
  ru: {
    badge: 'Стратегическое планирование эффективности',
    title: 'Годовые цели KPI',
    subtitle: 'Постановка годовых научных планов для кафедр и учёных с мониторингом фактического выполнения.',
    yearSuffix: ' г.',
    sumTotal: 'Всего целей',
    sumCompleted: 'Выполнено 100%',
    sumAtRisk: 'Требует внимания (<60%)',
    sumAvg: 'Среднее выполнение',
    presetsTitle: 'Быстрые академические нормативы (в 1 клик):',
    presetDsc: 'DSc / Профессор',
    presetPhd: 'PhD / Доцент',
    presetSenior: 'Старший преподаватель',
    presetDept: 'Годовая норма кафедры',
    addTitle: 'Добавить или обновить цель KPI',
    editTitle: 'Редактирование цели KPI',
    cancelEdit: 'Отмена',
    scopeLabel: 'Уровень',
    scopeDept: 'По кафедре',
    scopeScholar: 'Для учёного',
    deptLabel: 'Кафедра',
    scholarLabel: 'Учёный',
    selectPlaceholder: 'Выберите...',
    pubsLabel: 'Публикации',
    scopusLabel: 'Scopus / WoS',
    tiuScoreLabel: 'Балл TIU',
    addBtn: 'Сохранить',
    updateBtn: 'Обновить',
    filterAll: 'Все',
    filterDept: 'Кафедры',
    filterScholar: 'Учёные',
    searchPh: 'Поиск по кафедре или учёному...',
    loading: 'Загрузка...',
    empty: ' год цели KPI не заданы.',
    colOwner: 'Кафедра / Учёный',
    colPubs: 'Публикации (Факт / План)',
    colScopus: 'Scopus / WoS',
    colScore: 'Балл TIU',
    colProgress: 'Выполнение',
    colStatus: 'Статус',
    colAction: 'Действие',
    editTitleBtn: 'Редактировать',
    deleteTitle: 'Удалить',
    errorMsg: 'Ошибка при сохранении',
    savedCreate: 'Новая цель KPI успешно добавлена.',
    savedUpdate: 'Существующая цель KPI обновлена.',
    rag: {
      COMPLETED: 'Выполнено',
      ON_TRACK: 'В норме',
      AT_RISK: 'В зоне риска',
      CRITICAL: 'Критично',
    },
    deptTag: 'Кафедра',
    scholarTag: 'Учёный',
  },
  en: {
    badge: 'Strategic Performance Planning',
    title: 'Annual KPI Targets',
    subtitle: 'Assign annual research targets for departments and scholars and monitor real-time completion.',
    yearSuffix: '',
    sumTotal: 'Total Targets',
    sumCompleted: '100% Achieved',
    sumAtRisk: 'At Risk (<60%)',
    sumAvg: 'Avg Completion',
    presetsTitle: 'Quick Academic Benchmark Presets:',
    presetDsc: 'DSc / Professor',
    presetPhd: 'PhD / Assoc. Prof',
    presetSenior: 'Senior Lecturer',
    presetDept: 'Department Norm',
    addTitle: 'Add or Update KPI Target',
    editTitle: 'Editing KPI Target',
    cancelEdit: 'Cancel',
    scopeLabel: 'Scope',
    scopeDept: 'By Department',
    scopeScholar: 'By Scholar',
    deptLabel: 'Department',
    scholarLabel: 'Scholar',
    selectPlaceholder: 'Select...',
    pubsLabel: 'Publications',
    scopusLabel: 'Scopus / WoS',
    tiuScoreLabel: 'TIU Score',
    addBtn: 'Save Target',
    updateBtn: 'Update',
    filterAll: 'All',
    filterDept: 'Departments',
    filterScholar: 'Scholars',
    searchPh: 'Search department or scholar...',
    loading: 'Loading...',
    empty: ' has no KPI targets configured yet.',
    colOwner: 'Department / Scholar',
    colPubs: 'Pubs (Actual / Target)',
    colScopus: 'Scopus / WoS',
    colScore: 'TIU Score',
    colProgress: 'Completion',
    colStatus: 'Status',
    colAction: 'Actions',
    editTitleBtn: 'Edit',
    deleteTitle: 'Delete',
    errorMsg: 'Failed to save target',
    savedCreate: 'KPI target successfully created.',
    savedUpdate: 'Existing KPI target updated.',
    rag: {
      COMPLETED: 'Completed',
      ON_TRACK: 'On Track',
      AT_RISK: 'At Risk',
      CRITICAL: 'Critical',
    },
    deptTag: 'Department',
    scholarTag: 'Scholar',
  },
};

const ACADEMIC_PRESETS = [
  { key: 'presetDsc', scope: 'scholar', pubs: 6, scopus: 3, score: 60 },
  { key: 'presetPhd', scope: 'scholar', pubs: 4, scopus: 2, score: 40 },
  { key: 'presetSenior', scope: 'scholar', pubs: 2, scopus: 1, score: 20 },
  { key: 'presetDept', scope: 'department', pubs: 15, scopus: 5, score: 150 },
];

const RAG_STYLES = {
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  ON_TRACK: 'bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-sky-800',
  AT_RISK: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  CRITICAL: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export default function AdminKpiPage() {
  const locale = useLocale('uz');
  const dict = DICT[locale] || DICT.uz;
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [targets, setTargets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [summary, setSummary] = useState({
    totalTargets: 0,
    completedCount: 0,
    atRiskCount: 0,
    avgCompletion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Upsert form state
  const [editingId, setEditingId] = useState(null);
  const [scope, setScope] = useState('department');
  const [departmentId, setDepartmentId] = useState('');
  const [scholarId, setScholarId] = useState('');
  const [targetPublications, setTargetPublications] = useState(5);
  const [targetScopus, setTargetScopus] = useState(2);
  const [targetScore, setTargetScore] = useState(40);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [scopeFilter, setScopeFilter] = useState('ALL'); // ALL | DEPARTMENT | SCHOLAR
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (y) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpi?year=${y}`);
      const json = await res.json();
      setTargets(json.targets || []);
      setDepartments(json.departments || []);
      setScholars(json.scholars || []);
      if (json.summary) setSummary(json.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchData(year);
    });
  }, [year, fetchData]);

  const getLocalizedName = (item) => {
    if (!item) return '—';
    if (locale === 'ru') return item.nameRu || item.nameUz;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz;
  };

  const resetForm = () => {
    setEditingId(null);
    setDepartmentId('');
    setScholarId('');
    setTargetPublications(5);
    setTargetScopus(2);
    setTargetScore(40);
  };

  const handleApplyPreset = (preset) => {
    setEditingId(null);
    setScope(preset.scope);
    setTargetPublications(preset.pubs);
    setTargetScopus(preset.scopus);
    setTargetScore(preset.score);
  };

  const handleEditRow = (row) => {
    setEditingId(row.id);
    if (row.scholarId) {
      setScope('scholar');
      setScholarId(row.scholarId);
      setDepartmentId('');
    } else {
      setScope('department');
      setDepartmentId(row.departmentId || '');
      setScholarId('');
    }
    setTargetPublications(row.targetPublications ?? 0);
    setTargetScopus(row.targetScopus ?? row.targetScopusWos ?? 0);
    setTargetScore(row.targetScore ?? 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
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
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice({
          type: 'success',
          text: json.updated ? dict.savedUpdate : dict.savedCreate,
        });
        resetForm();
        fetchData(year);
      } else {
        setNotice({ type: 'error', text: json.error || dict.errorMsg });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/kpi?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (editingId === id) resetForm();
      fetchData(year);
    }
  };

  const filteredTargets = targets.filter((row) => {
    if (scopeFilter === 'DEPARTMENT' && !row.departmentId) return false;
    if (scopeFilter === 'SCHOLAR' && !row.scholarId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const ownerName = row.scholar
      ? row.scholar.fullName
      : getLocalizedName(row.department);
    return String(ownerName || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider border border-blue-200/70 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{dict.badge}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {dict.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {dict.subtitle}
          </p>
        </div>

        <select
          value={year}
          onChange={(e) => {
            resetForm();
            setYear(Number(e.target.value));
          }}
          className="px-4 py-2.5 bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white shrink-0 cursor-pointer"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>
              {y}{dict.yearSuffix}
            </option>
          ))}
        </select>
      </div>

      {/* 4 Live KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card-sm p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {dict.sumTotal}
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary.totalTargets}
          </div>
        </div>

        <div className="neu-card-sm p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {dict.sumCompleted}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.completedCount}
          </div>
        </div>

        <div className="neu-card-sm p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {dict.sumAtRisk}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {summary.atRiskCount}
          </div>
        </div>

        <div className="neu-card-navy p-5 rounded-2xl text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              {dict.sumAvg}
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
            {summary.avgCompletion}%
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upsert KPI Target Form + Quick Presets */}
      <form
        onSubmit={handleSave}
        className="neu-card-sm p-6 rounded-3xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
            <Target className="w-4 h-4 text-amber-500" />
            <span>{editingId ? dict.editTitle : dict.addTitle}</span>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="glass-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{dict.cancelEdit}</span>
            </button>
          )}
        </div>

        {/* Academic Benchmark Presets */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
            {dict.presetsTitle}
          </span>
          {ACADEMIC_PRESETS.map((preset) => (
            <motion.button
              key={preset.key}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleApplyPreset(preset)}
              className="glass-btn px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {dict[preset.key]} ({preset.pubs}/{preset.scopus}/{preset.score})
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {dict.scopeLabel}
            </label>
            <select
              value={scope}
              onChange={(e) => {
                setEditingId(null);
                setScope(e.target.value);
              }}
              className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white"
            >
              <option value="department">{dict.scopeDept}</option>
              <option value="scholar">{dict.scopeScholar}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {scope === 'department' ? dict.deptLabel : dict.scholarLabel}
            </label>
            {scope === 'department' ? (
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white"
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
                className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white"
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
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {dict.pubsLabel}
            </label>
            <input
              type="number"
              min="0"
              value={targetPublications}
              onChange={(e) => setTargetPublications(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {dict.scopusLabel}
            </label>
            <input
              type="number"
              min="0"
              value={targetScopus}
              onChange={(e) => setTargetScopus(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                {dict.tiuScoreLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? dict.updateBtn : dict.addBtn}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="neu-card-sm p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: dict.filterAll },
            { id: 'DEPARTMENT', label: dict.filterDept },
            { id: 'SCHOLAR', label: dict.filterScholar },
          ].map((tab) => {
            const active = scopeFilter === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setScopeFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'glass-btn-primary shadow-sm'
                    : 'glass-btn text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.searchPh}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Targets Monitoring Table */}
      <div className="neu-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            {dict.loading}
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            {year}{dict.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase text-slate-500">
                  <th className="py-3.5 px-5">{dict.colOwner}</th>
                  <th className="py-3.5 px-4 text-center">{dict.colPubs}</th>
                  <th className="py-3.5 px-4 text-center">{dict.colScopus}</th>
                  <th className="py-3.5 px-4 text-center">{dict.colScore}</th>
                  <th className="py-3.5 px-4 min-w-[140px]">{dict.colProgress}</th>
                  <th className="py-3.5 px-4 text-center">{dict.colStatus}</th>
                  <th className="py-3.5 px-5 text-right">{dict.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-sm">
                {filteredTargets.map((row) => {
                  const pct = row.completionPercent ?? 0;
                  const rag = row.ragStatus || 'CRITICAL';
                  const barColor =
                    pct >= 100
                      ? 'bg-emerald-500'
                      : pct >= 60
                      ? 'bg-blue-600'
                      : pct >= 25
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        {row.scholar ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-sky-300">
                              {row.scholar.photoUrl ? (
                                <img
                                  src={row.scholar.photoUrl}
                                  alt={row.scholar.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{row.scholar.fullName?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                {row.scholar.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                  <UserCheck className="w-3 h-3" />
                                  {dict.scholarTag}
                                </span>
                                {row.scholar.department && (
                                  <span>• {getLocalizedName(row.scholar.department)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-sky-950/60 border border-blue-200/70 dark:border-sky-800 flex items-center justify-center text-blue-600 dark:text-sky-300 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                {getLocalizedName(row.department)}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {dict.deptTag} {row.department?.faculty?.code ? `• ${row.department.faculty.code}` : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {row.actualPublications ?? 0}
                        </span>
                        <span className="text-slate-400"> / {row.targetPublications}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {row.actualScopus ?? 0}
                        </span>
                        <span className="text-slate-400"> / {row.targetScopus ?? 0}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="font-bold text-blue-700 dark:text-sky-400">
                          {row.actualScore ?? 0}
                        </span>
                        <span className="text-slate-400"> / {row.targetScore}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                            <span className="text-slate-700 dark:text-slate-200">{pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            RAG_STYLES[rag] || RAG_STYLES.CRITICAL
                          }`}
                        >
                          {dict.rag[rag] || rag}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditRow(row)}
                            className="p-2 rounded-xl text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/60 transition cursor-pointer"
                            title={dict.editTitleBtn}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                            title={dict.deleteTitle}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
