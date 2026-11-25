'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/useLocale';
import {
  GraduationCap,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  UserCheck,
  ChevronRight,
  FileText,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const DEGREE_LABELS = {
  PHD: 'PhD (Falsafa doktori)',
  DSC: 'DSc (Fan doktori)',
  MASTER: 'Magistr',
  INDEPENDENT_RESEARCHER: 'Mustaqil izlanuvchi',
};

const STAGE_CONFIG = {
  A_DRAFT: { label: 'Qoralama', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  A_SUBMITTED_DEPARTMENT: { label: 'Kafedra ko‘rib chiqmoqda', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  A_DEPARTMENT_APPROVED: { label: 'Buyruq kutilmoqda', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  B_ACTIVE_RESEARCH: { label: 'Faol tadqiqot & Reja', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  C_PUBLICATIONS_READY: { label: 'Nashrlar talabi bajarilgan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  D_PRE_DEFENSE: { label: 'Himoya oldi (Checklist)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  E_COMPLETED: { label: 'Himoya qilingan (Tasdiqlangan)', color: 'bg-green-100 text-green-900 border-green-300' },
  ON_HOLD: { label: 'To‘xtatib turilgan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  TERMINATED: { label: 'To‘xtatilgan', color: 'bg-red-50 text-red-700 border-red-200' },
};

const SUP_DICT = {
  uz: {
    badge: 'Akademik Salohiyat & Ilmiy Maktab',
    title: 'Ilmiy Rahbarligim',
    subtitle: 'Izlanuvchilar (PhD, DSc, Magistr) tadqiqotlari, muddatlari va himoya bosqichlarini yagona tizimda boshqaring.',
    addStudentBtn: 'Yangi Izlanuvchi Qo‘shish',
    kpiTotalTitle: 'Jami Izlanuvchilar',
    kpiTotalSub: 'barchasi ro‘yxati',
    kpiActiveTitle: 'Faol Jarayonda',
    kpiActiveSub: 'tadqiqot va reja',
    kpiOverdueTitle: 'Muddati Yaqin/O‘tgan',
    kpiOverdueWarn: 'tezkor e’tibor talab',
    kpiOverdueOk: 'muddatlar joyida',
    kpiInactiveTitle: 'Harakatsizlar',
    kpiInactiveWarn: '45+ kun uchrashuvsiz',
    kpiInactiveOk: 'aloqa faol',
    kpiDoneTitle: 'Himoya Qilgan',
    kpiDoneSub: 'OAK tasdiqlangan',
    searchPlaceholder: 'Izlanuvchi F.I.SH yoki mavzu...',
    stageLabel: 'Bosqich:',
    stageAll: 'Barcha bosqichlar',
    stageSubmitted: 'Ko‘rib chiqilmoqda (Kafedra)',
    stageActive: 'Faol tadqiqot & Reja',
    stagePubs: 'Nashr talabi bajarilgan',
    stagePreDefense: 'Himoya oldi (Checklist)',
    stageCompleted: 'Muvaffaqiyatli himoya qilingan',
    stageDraft: 'Qoralama arizalar',
    stageHold: 'Muzlatilganlar',
    loading: 'Yuklanmoqda...',
    emptyTitle: 'Izlanuvchilar topilmadi',
    emptyDesc: 'Hozircha ilmiy rahbarligingizdagi shogirdlar kiritilmagan yoki qidiruv bo‘yicha natija yo‘q.',
    addStudentShort: 'Yangi shogird qo‘shish',
    codePrefix: 'Shifr',
    nearestDeadline: 'Eng yaqin muddat',
    noMeetingWarning: '45+ kundan buyon ilmiy uchrashuv qayd etilmagan',
    pubsUnit: 'ta nashr',
    reportsUnit: 'ta hisobot',
    viewProcess: 'Jarayonni ko‘rish',
    degrees: {
      PHD: 'PhD (Falsafa doktori)',
      DSC: 'DSc (Fan doktori)',
      MASTER: 'Magistr',
      INDEPENDENT_RESEARCHER: 'Mustaqil izlanuvchi',
    },
    stages: {
      A_DRAFT: 'Qoralama',
      A_SUBMITTED_DEPARTMENT: 'Kafedra ko‘rib chiqmoqda',
      A_DEPARTMENT_APPROVED: 'Buyruq kutilmoqda',
      B_ACTIVE_RESEARCH: 'Faol tadqiqot & Reja',
      C_PUBLICATIONS_READY: 'Nashrlar talabi bajarilgan',
      D_PRE_DEFENSE: 'Himoya oldi (Checklist)',
      E_COMPLETED: 'Himoya qilingan (Tasdiqlangan)',
      ON_HOLD: 'To‘xtatib turilgan',
      TERMINATED: 'To‘xtatilgan',
    },
  },
  ru: {
    badge: 'Академический потенциал и научная школа',
    title: 'Моё научное руководство',
    subtitle: 'Управляйте исследованиями докторантов (PhD, DSc, магистрантов), сроками и этапами защиты в единой системе.',
    addStudentBtn: 'Добавить соискателя',
    kpiTotalTitle: 'Всего соискателей',
    kpiTotalSub: 'общий список',
    kpiActiveTitle: 'В процессе',
    kpiActiveSub: 'исследование и план',
    kpiOverdueTitle: 'Сроки истекают/просрочены',
    kpiOverdueWarn: 'требует внимания',
    kpiOverdueOk: 'сроки в норме',
    kpiInactiveTitle: 'Неактивные',
    kpiInactiveWarn: '45+ дней без встреч',
    kpiInactiveOk: 'связь активна',
    kpiDoneTitle: 'Защитились',
    kpiDoneSub: 'утверждено ВАК',
    searchPlaceholder: 'ФИО соискателя или тема...',
    stageLabel: 'Этап:',
    stageAll: 'Все этапы',
    stageSubmitted: 'На рассмотрении (Кафедра)',
    stageActive: 'Активное исследование и план',
    stagePubs: 'Требования по публикациям выполнены',
    stagePreDefense: 'Предзащита (Чек-лист)',
    stageCompleted: 'Успешно защищено',
    stageDraft: 'Черновики заявок',
    stageHold: 'Приостановленные',
    loading: 'Загрузка...',
    emptyTitle: 'Соискатели не найдены',
    emptyDesc: 'Подопечные под вашим руководством пока не добавлены или ничего не найдено по поиску.',
    addStudentShort: 'Добавить ученика',
    codePrefix: 'Шифр',
    nearestDeadline: 'Ближайший срок',
    noMeetingWarning: 'Более 45 дней не зафиксирована научная встреча',
    pubsUnit: 'публ.',
    reportsUnit: 'отчётов',
    viewProcess: 'Открыть процесс',
    degrees: {
      PHD: 'PhD (Доктор философии)',
      DSC: 'DSc (Доктор наук)',
      MASTER: 'Магистр',
      INDEPENDENT_RESEARCHER: 'Самостоятельный соискатель',
    },
    stages: {
      A_DRAFT: 'Черновик',
      A_SUBMITTED_DEPARTMENT: 'На рассмотрении кафедры',
      A_DEPARTMENT_APPROVED: 'Ожидается приказ',
      B_ACTIVE_RESEARCH: 'Активное исследование',
      C_PUBLICATIONS_READY: 'Публикации готовы',
      D_PRE_DEFENSE: 'Предзащита (Чек-лист)',
      E_COMPLETED: 'Защищено (Утверждено)',
      ON_HOLD: 'Приостановлено',
      TERMINATED: 'Прекращено',
    },
  },
  en: {
    badge: 'Academic Capacity & Research School',
    title: 'My Academic Supervision',
    subtitle: 'Manage PhD, DSc, and Master researchers, milestones, and defense stages in a unified cockpit.',
    addStudentBtn: 'Add Researcher',
    kpiTotalTitle: 'Total Researchers',
    kpiTotalSub: 'complete roster',
    kpiActiveTitle: 'Active Research',
    kpiActiveSub: 'research & roadmap',
    kpiOverdueTitle: 'Due Soon / Overdue',
    kpiOverdueWarn: 'urgent attention needed',
    kpiOverdueOk: 'on schedule',
    kpiInactiveTitle: 'Inactive',
    kpiInactiveWarn: '45+ days without meeting',
    kpiInactiveOk: 'active contact',
    kpiDoneTitle: 'Defended',
    kpiDoneSub: 'OAK approved',
    searchPlaceholder: 'Researcher name or topic...',
    stageLabel: 'Stage:',
    stageAll: 'All stages',
    stageSubmitted: 'Under Review (Department)',
    stageActive: 'Active Research & Plan',
    stagePubs: 'Publications Requirement Met',
    stagePreDefense: 'Pre-Defense (Checklist)',
    stageCompleted: 'Successfully Defended',
    stageDraft: 'Draft Applications',
    stageHold: 'On Hold',
    loading: 'Loading...',
    emptyTitle: 'No researchers found',
    emptyDesc: 'No mentees have been added under your supervision yet, or no results match your search.',
    addStudentShort: 'Add Researcher',
    codePrefix: 'Code',
    nearestDeadline: 'Next deadline',
    noMeetingWarning: 'No supervision meeting logged in 45+ days',
    pubsUnit: 'pubs',
    reportsUnit: 'reports',
    viewProcess: 'View progress',
    degrees: {
      PHD: 'PhD (Doctor of Philosophy)',
      DSC: 'DSc (Doctor of Science)',
      MASTER: 'Master',
      INDEPENDENT_RESEARCHER: 'Independent Researcher',
    },
    stages: {
      A_DRAFT: 'Draft',
      A_SUBMITTED_DEPARTMENT: 'Department Review',
      A_DEPARTMENT_APPROVED: 'Order Pending',
      B_ACTIVE_RESEARCH: 'Active Research & Plan',
      C_PUBLICATIONS_READY: 'Publications Ready',
      D_PRE_DEFENSE: 'Pre-Defense (Checklist)',
      E_COMPLETED: 'Defended (Approved)',
      ON_HOLD: 'On Hold',
      TERMINATED: 'Terminated',
    },
  },
};

export default function SupervisionsPage() {
  const locale = useLocale('uz');
  const tx = SUP_DICT[locale] || SUP_DICT.uz;
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    degreeType: 'PHD',
    specialtyCode: '',
    specialtyName: '',
    dissertationTitle: '',
    expectedDefenseDate: '',
    immediateSubmit: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/supervisions');
      const data = await res.json();
      if (data.supervisions) {
        setSupervisions(data.supervisions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.dissertationTitle) return;

    try {
      setCreating(true);
      const res = await fetch('/api/dashboard/supervisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          studentName: '',
          studentEmail: '',
          studentPhone: '',
          degreeType: 'PHD',
          specialtyCode: '',
          specialtyName: '',
          dissertationTitle: '',
          expectedDefenseDate: '',
          immediateSubmit: true,
        });
        loadData();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const [specialFilter, setSpecialFilter] = useState('ALL'); // ALL, OVERDUE, INACTIVE

  const filtered = supervisions.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.dissertationTitle.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialtyCode && s.specialtyCode.toLowerCase().includes(search.toLowerCase()));

    const matchStage = stageFilter === 'ALL' || s.stage === stageFilter;

    let matchSpecial = true;
    if (specialFilter === 'OVERDUE') matchSpecial = s.isOverdue;
    if (specialFilter === 'INACTIVE') matchSpecial = s.needsMeetingNotice;

    return matchSearch && matchStage && matchSpecial;
  });

  const totalCount = supervisions.length;
  const activeCount = supervisions.filter((s) =>
    ['A_SUBMITTED_DEPARTMENT', 'A_DEPARTMENT_APPROVED', 'B_ACTIVE_RESEARCH', 'C_PUBLICATIONS_READY', 'D_PRE_DEFENSE'].includes(s.stage)
  ).length;
  const completedCount = supervisions.filter((s) => s.stage === 'E_COMPLETED').length;
  const overdueCount = supervisions.filter((s) => s.isOverdue).length;
  const inactiveCount = supervisions.filter((s) => s.needsMeetingNotice).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="neu-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 font-bold text-xs mb-2 border border-blue-200/70 dark:border-sky-800">
            <GraduationCap className="w-4 h-4" />
            <span>{tx.badge}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{tx.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {tx.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="glass-btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{tx.addStudentBtn}</span>
        </button>
      </div>

      {/* 5 Interactive Stat & Alert Cards (Supervisor Monitoring Cockpit) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('ALL'); }}
          className={`neu-card-sm p-4 rounded-2xl text-left transition-all cursor-pointer ${
            specialFilter === 'ALL' && stageFilter === 'ALL'
              ? 'ring-2 ring-blue-500/40 bg-blue-50/60 dark:bg-sky-950/40 border border-blue-300/70'
              : 'border border-transparent hover:border-blue-300/50'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{tx.kpiTotalTitle}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{tx.kpiTotalSub}</div>
        </button>

        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('B_ACTIVE_RESEARCH'); }}
          className={`neu-card-sm p-4 rounded-2xl text-left transition-all cursor-pointer ${
            stageFilter === 'B_ACTIVE_RESEARCH'
              ? 'ring-2 ring-indigo-500/40 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-300/70'
              : 'border border-transparent hover:border-indigo-300/50'
          }`}
        >
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{tx.kpiActiveTitle}</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{tx.kpiActiveSub}</div>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter(specialFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`neu-card-sm p-4 rounded-2xl text-left transition-all cursor-pointer ${
            specialFilter === 'OVERDUE'
              ? 'ring-2 ring-rose-500/40 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-400/70'
              : overdueCount > 0
              ? 'border border-rose-300/60 dark:border-rose-800/60 hover:border-rose-400'
              : 'border border-transparent hover:border-rose-300/50'
          }`}
        >
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center justify-between">
            <span>{tx.kpiOverdueTitle}</span>
            {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{overdueCount}</div>
          <div className="text-[11px] text-rose-500/90 mt-1">
            {overdueCount > 0 ? tx.kpiOverdueWarn : tx.kpiOverdueOk}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter(specialFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
          className={`neu-card-sm p-4 rounded-2xl text-left transition-all cursor-pointer ${
            specialFilter === 'INACTIVE'
              ? 'ring-2 ring-amber-500/40 bg-amber-100/70 dark:bg-amber-950/50 border border-amber-400/70'
              : inactiveCount > 0
              ? 'border border-amber-300/60 dark:border-amber-800/60 hover:border-amber-400'
              : 'border border-transparent hover:border-amber-300/50'
          }`}
        >
          <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>{tx.kpiInactiveTitle}</span>
            {inactiveCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-amber-600/90 mt-1">
            {inactiveCount > 0 ? tx.kpiInactiveWarn : tx.kpiInactiveOk}
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('E_COMPLETED'); }}
          className={`neu-card-sm p-4 rounded-2xl text-left transition-all col-span-2 lg:col-span-1 cursor-pointer ${
            stageFilter === 'E_COMPLETED'
              ? 'ring-2 ring-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300/70'
              : 'border border-transparent hover:border-emerald-300/50'
          }`}
        >
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{tx.kpiDoneTitle}</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{tx.kpiDoneSub}</div>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="neu-card-sm flex flex-col md:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={tx.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{tx.stageLabel}</span>
          <div className="relative w-full md:w-64">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3.5 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="ALL">{tx.stageAll} ({supervisions.length})</option>
              <option value="A_SUBMITTED_DEPARTMENT">{tx.stageSubmitted}</option>
              <option value="B_ACTIVE_RESEARCH">{tx.stageActive}</option>
              <option value="C_PUBLICATIONS_READY">{tx.stagePubs}</option>
              <option value="D_PRE_DEFENSE">{tx.stagePreDefense}</option>
              <option value="E_COMPLETED">{tx.stageCompleted}</option>
              <option value="A_DRAFT">{tx.stageDraft}</option>
              <option value="ON_HOLD">{tx.stageHold}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="neu-card rounded-3xl text-center py-12 text-slate-400">
          {tx.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="neu-card rounded-3xl text-center py-16 p-6">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">{tx.emptyTitle}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {tx.emptyDesc}
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="glass-btn-primary mt-4 px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{tx.addStudentShort}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sup) => {
            const stageStyle = STAGE_CONFIG[sup.stage] || STAGE_CONFIG.A_DRAFT;
            return (
              <Link
                key={sup.id}
                href={`/dashboard/supervisions/${sup.id}`}
                className="neu-card-sm rounded-3xl p-5 hover:border-indigo-400/70 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Bar: Degree Badge & Stage Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md">
                      {tx.degrees[sup.degreeType] || DEGREE_LABELS[sup.degreeType] || sup.degreeType}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${stageStyle.color}`}>
                      {tx.stages[sup.stage] || stageStyle.label}
                    </span>
                  </div>

                  {/* Student Name & Thesis Topic */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
                    {sup.studentName}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {sup.dissertationTitle}
                  </p>

                  {/* Specialty Code */}
                  {sup.specialtyCode && (
                    <div className="text-xs text-slate-400 mt-2 font-mono">
                      {tx.codePrefix}: {sup.specialtyCode} {sup.specialtyName ? `— ${sup.specialtyName}` : ''}
                    </div>
                  )}

                  {/* Nearest Milestone / Alerts */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {sup.nearestMilestone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.nearestDeadline}:</span>
                        </span>
                        <span
                          className={`font-medium ${
                            sup.isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sup.isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          {new Date(sup.nearestMilestone.dueDate).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'uz-UZ')} ({sup.nearestMilestone.title})
                        </span>
                      </div>
                    )}

                    {sup.needsMeetingNotice && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{tx.noMeetingWarning}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Action link to full card */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {sup.publicationsCount || 0} {tx.pubsUnit}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {sup.reportsCount || 0} {tx.reportsUnit}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <span>{tx.viewProcess}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: New Mentee Application */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Yangi Izlanuvchi Qo‘shish (A Qism)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kafedra va ilmiy bo‘lim tasdig‘i uchun ariza shakli</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izlanuvchi F.I.SH *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Abdullayev Temur Olimovich"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daraja turi</label>
                  <select
                    value={formData.degreeType}
                    onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="PHD">PhD (Falsafa doktori)</option>
                    <option value="DSC">DSc (Fan doktori)</option>
                    <option value="MASTER">Magistr</option>
                    <option value="INDEPENDENT_RESEARCHER">Mustaqil izlanuvchi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ixtisoslik shifri</label>
                  <input
                    type="text"
                    placeholder="Masalan: 05.01.05"
                    value={formData.specialtyCode}
                    onChange={(e) => setFormData({ ...formData, specialtyCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dissertatsiya mavzusi *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Dissertatsiya yoki ilmiy ishning to‘liq tasdiqlangan mavzusi..."
                  value={formData.dissertationTitle}
                  onChange={(e) => setFormData({ ...formData, dissertationTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shogird Email</label>
                  <input
                    type="email"
                    placeholder="student@tiu.uz"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shogird Telefon</label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={formData.studentPhone}
                    onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejalashtirilgan himoya sanasi</label>
                <input
                  type="date"
                  value={formData.expectedDefenseDate}
                  onChange={(e) => setFormData({ ...formData, expectedDefenseDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Yuborilmoqda...' : 'Kafedraga Ariza Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
