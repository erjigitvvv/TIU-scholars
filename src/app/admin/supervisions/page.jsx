'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Users,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Calendar,
  AlertCircle,
  PauseCircle,
  StopCircle,
  UserCheck,
  Building2,
  X,
  FileCheck,
  Eye,
} from 'lucide-react';

export default function AdminSupervisionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState('approvals'); // 'approvals', 'overdue', 'reports', 'workload'
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // All scholars for reassigning
  const [allScholars, setAllScholars] = useState([]);

  // Modals state
  const [orderModal, setOrderModal] = useState({ open: false, supervisionId: null, studentName: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, supervisionId: null, studentName: '' });
  const [extendModal, setExtendModal] = useState({ open: false, supervisionId: null, studentName: '' });
  const [reassignModal, setReassignModal] = useState({ open: false, supervisionId: null, studentName: '' });
  const [reportReviewModal, setReportReviewModal] = useState({ open: false, reportId: null, periodName: '' });
  const [holdModal, setHoldModal] = useState({ open: false, supervisionId: null, action: 'ON_HOLD' });

  // Forms
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    orderFileUrl: '',
    expectedDefenseDate: '',
  });

  const [rejectReason, setRejectReason] = useState('');
  const [extendForm, setExtendForm] = useState({ newExpectedDate: '', reason: '' });
  const [reassignForm, setReassignForm] = useState({ newScholarId: '', reason: '' });
  const [reportFeedback, setReportFeedback] = useState('');
  const [holdReason, setHoldReason] = useState('');

  // Fetch overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/supervisions/overview');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Yuklashda xatolik');
      setData(json);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Fetch scholars
  const fetchScholars = async () => {
    try {
      const res = await fetch('/api/admin/scholars');
      const json = await res.json();
      if (res.ok) {
        setAllScholars(Array.isArray(json) ? json : json.scholars || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchScholars();
  }, []);

  // Handle stage transition
  const handleTransition = async (supervisionId, targetStage, payload = {}) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${supervisionId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStage, payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Bosqich o‘zgartirishda xatolik');

      setMessage({ type: 'success', text: 'Amal muvaffaqiyatli bajarildi!' });
      setOrderModal({ open: false, supervisionId: null, studentName: '' });
      setRejectModal({ open: false, supervisionId: null, studentName: '' });
      setHoldModal({ open: false, supervisionId: null, action: 'ON_HOLD' });
      fetchOverview();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle quick action (extend deadline or change supervisor)
  const handleQuickAction = async (supervisionId, action, payload) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/supervisions/${supervisionId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Amalni bajarishda xatolik');

      setMessage({ type: 'success', text: 'Ma’lumotlar muvaffaqiyatli yangilandi!' });
      setExtendModal({ open: false, supervisionId: null, studentName: '' });
      setReassignModal({ open: false, supervisionId: null, studentName: '' });
      fetchOverview();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle report review
  const handleReportReview = async (reportId, status, feedback = '') => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/supervisions/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Hisobotni tekshirishda xatolik');

      setMessage({ type: 'success', text: 'Hisobot holati yangilandi.' });
      setReportReviewModal({ open: false, reportId: null, periodName: '' });
      fetchOverview();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Moderator boshqaruv paneli yuklanmoqda...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    pendingApprovalsCount: 0,
    overdueCount: 0,
    pendingReportsCount: 0,
    activeSupervisorsCount: 0,
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-600" /> Ilmiy rahbarlik boshqaruv paneli
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kafedra va moderator navbati: arizalar, muddatlar, hisobotlar va yuklama nazorati
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto transition"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending approvals */}
        <button
          onClick={() => setActiveBlock('approvals')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeBlock === 'approvals'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-blue-600'
              : 'neu-card bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className={`w-5 h-5 ${activeBlock === 'approvals' ? 'text-white' : 'text-blue-600'}`} />
            <span
              className={`text-2xl font-black ${
                activeBlock === 'approvals' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {summary.pendingApprovalsCount}
            </span>
          </div>
          <p className="text-xs font-bold leading-tight">Tasdiq kutayotgan arizalar</p>
          <p className={`text-[10px] mt-0.5 ${activeBlock === 'approvals' ? 'text-blue-100' : 'text-slate-400'}`}>
            Kafedra va buyruq kutilmoqda
          </p>
        </button>

        {/* Card 2: Overdue */}
        <button
          onClick={() => setActiveBlock('overdue')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeBlock === 'overdue'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 border-rose-600'
              : 'neu-card bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className={`w-5 h-5 ${activeBlock === 'overdue' ? 'text-white' : 'text-rose-600'}`} />
            <span
              className={`text-2xl font-black ${
                activeBlock === 'overdue' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {summary.overdueCount}
            </span>
          </div>
          <p className="text-xs font-bold leading-tight">Muddati o‘tgan izlanishlar</p>
          <p className={`text-[10px] mt-0.5 ${activeBlock === 'overdue' ? 'text-rose-100' : 'text-slate-400'}`}>
            Milestone yoki himoya kechikkan
          </p>
        </button>

        {/* Card 3: Pending reports */}
        <button
          onClick={() => setActiveBlock('reports')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeBlock === 'reports'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20 border-amber-600'
              : 'neu-card bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <FileSpreadsheet className={`w-5 h-5 ${activeBlock === 'reports' ? 'text-white' : 'text-amber-600'}`} />
            <span
              className={`text-2xl font-black ${
                activeBlock === 'reports' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {summary.pendingReportsCount}
            </span>
          </div>
          <p className="text-xs font-bold leading-tight">Hisobot kutayotganlar</p>
          <p className={`text-[10px] mt-0.5 ${activeBlock === 'reports' ? 'text-amber-100' : 'text-slate-400'}`}>
            Attestatsiya monitoringi
          </p>
        </button>

        {/* Card 4: Workload */}
        <button
          onClick={() => setActiveBlock('workload')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeBlock === 'workload'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-600'
              : 'neu-card bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Users className={`w-5 h-5 ${activeBlock === 'workload' ? 'text-white' : 'text-indigo-600'}`} />
            <span
              className={`text-2xl font-black ${
                activeBlock === 'workload' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {summary.activeSupervisorsCount}
            </span>
          </div>
          <p className="text-xs font-bold leading-tight">Rahbarlar yuklamasi</p>
          <p className={`text-[10px] mt-0.5 ${activeBlock === 'workload' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Shogirdlar soni taqsimoti
          </p>
        </button>
      </div>

      {/* 4 MAIN BLOCKS */}

      {/* BLOCK 1: TASDIQ KUTAYOTGAN ARIZALAR */}
      {activeBlock === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Ko‘rib chiqishni kutayotgan arizalar navbati
            </h2>
            <span className="text-xs text-slate-400">Jami: {(data?.pendingApprovals || []).length} ta ariza</span>
          </div>

          {(data?.pendingApprovals || []).length === 0 ? (
            <div className="p-12 text-center neu-card rounded-3xl text-slate-500 text-sm">
              Tasdiqlashni kutayotgan arizalar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingApprovals.map((sup) => {
                const currentWorkload = sup.scholar?.supervisions?.length || 0;
                const isDeptLevel = sup.stage === 'A_SUBMITTED_DEPARTMENT';
                return (
                  <div
                    key={sup.id}
                    className="p-5 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {sup.degreeType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isDeptLevel
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                          }`}
                        >
                          {isDeptLevel ? 'Kafedra tasdig‘i kutilmoqda' : 'Rektorat buyrug‘i kutilmoqda'}
                        </span>
                        {/* SUPERVISOR WORKLOAD BADGE */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            currentWorkload >= 5
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Rahbar yuklamasi: {currentWorkload} ta izlanuvchi
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{sup.studentName}</h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Mavzu:</span> {sup.dissertationTitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>
                          Rahbar: <strong className="text-slate-700 dark:text-slate-300">{sup.scholar?.fullName}</strong>
                        </span>
                        <span>Kafedra: {sup.scholar?.department?.nameUz || 'TIU'}</span>
                        {sup.specialtyCode && <span>Ixtisoslik: {sup.specialtyCode}</span>}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                      <Link
                        href={`/dashboard/supervisions/${sup.id}`}
                        className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                        title="Ko‘rish"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            supervisionId: sup.id,
                            studentName: sup.studentName,
                          })
                        }
                        className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold transition"
                      >
                        Sabab bilan qaytarish
                      </button>

                      {isDeptLevel ? (
                        <button
                          onClick={() => handleTransition(sup.id, 'A_DEPARTMENT_APPROVED')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Kafedra qarorini tasdiqlash
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setOrderModal({
                              open: true,
                              supervisionId: sup.id,
                              studentName: sup.studentName,
                            })
                          }
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" /> Buyruq kiritish & Boshlash (FAOL)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BLOCK 2: MUDDATI O'TGANLAR (ENG MUHIMI) */}
      {activeBlock === 'overdue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Kechikkan va muddati o‘tgan izlanishlar nazorati
            </h2>
            <span className="text-xs text-rose-500 font-bold">
              Diqqat: {(data?.overdueList || []).length} ta xavfli holat aniqlandi
            </span>
          </div>

          {(data?.overdueList || []).length === 0 ? (
            <div className="p-12 text-center neu-card rounded-3xl text-slate-500 text-sm">
              Kechikkan yoki muddati o‘tgan ilmiy rahbarliklar mavjud emas. Barcha jarayonlar o‘z vaqtida bormoqda!
            </div>
          ) : (
            <div className="space-y-3">
              {data.overdueList.map((sup) => (
                <div
                  key={sup.id}
                  className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Kechikish
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sup.stage}
                      </span>
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        {sup.overdueReason}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{sup.studentName}</h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Mavzu:</span> {sup.dissertationTitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>
                        Rahbar: <strong className="text-slate-700 dark:text-slate-300">{sup.scholar?.fullName}</strong>
                      </span>
                      <span>Kafedra: {sup.scholar?.department?.nameUz || 'TIU'}</span>
                      {sup.expectedDefenseDate && (
                        <span>Reja: {new Date(sup.expectedDefenseDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* QUICK ACTIONS FOR OVERDUE */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <button
                      onClick={() =>
                        setExtendModal({
                          open: true,
                          supervisionId: sup.id,
                          studentName: sup.studentName,
                        })
                      }
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Muddat uzaytirish
                    </button>

                    <button
                      onClick={() =>
                        setReassignModal({
                          open: true,
                          supervisionId: sup.id,
                          studentName: sup.studentName,
                        })
                      }
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Rahbar almashtirish
                    </button>

                    <button
                      onClick={() =>
                        setHoldModal({
                          open: true,
                          supervisionId: sup.id,
                          action: 'ON_HOLD',
                        })
                      }
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                    >
                      Muzlatish
                    </button>

                    <button
                      onClick={() =>
                        setHoldModal({
                          open: true,
                          supervisionId: sup.id,
                          action: 'TERMINATED',
                        })
                      }
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-xs font-semibold transition"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BLOCK 3: HISOBOT KUTAYOTGANLAR */}
      {activeBlock === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" /> Tekshirish kutilayotgan attestatsiya hisobotlari
            </h2>
            <span className="text-xs text-slate-400">Jami: {(data?.pendingReports || []).length} ta hisobot</span>
          </div>

          {(data?.pendingReports || []).length === 0 ? (
            <div className="p-12 text-center neu-card rounded-3xl text-slate-500 text-sm">
              Hozircha ko‘rib chiqishni kutayotgan hisobotlar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {report.periodName}
                      </span>
                      <span className="text-xs text-slate-400">
                        Topshirilgan: {new Date(report.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Izlanuvchi: {report.supervision?.studentName}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {report.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Rahbar: {report.supervision?.scholar?.fullName}</span>
                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Faylni ko‘rish <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <button
                      onClick={() =>
                        setReportReviewModal({
                          open: true,
                          reportId: report.id,
                          periodName: report.periodName,
                        })
                      }
                      className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold transition"
                    >
                      Izoh bilan qaytarish
                    </button>

                    <button
                      onClick={() => handleReportReview(report.id, 'ACCEPTED')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Qabul qilish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BLOCK 4: RAHBARLAR YUKLAMASI */}
      {activeBlock === 'workload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Olimlarning joriy ilmiy rahbarlik yuklamasi
            </h2>
            <span className="text-xs text-slate-400">Jami faol rahbarlar: {(data?.workloadList || []).length} nafar</span>
          </div>

          {(data?.workloadList || []).length === 0 ? (
            <div className="p-12 text-center neu-card rounded-3xl text-slate-500 text-sm">
              Hozircha faol izlanuvchisi bo‘lgan rahbarlar topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.workloadList.map((scholar) => {
                const isOverloaded = scholar.activeCount >= 5;
                return (
                  <div
                    key={scholar.scholarId}
                    className="p-5 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {scholar.fullName}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {scholar.academicDegree || 'Olim'} • {scholar.departmentName}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                          isOverloaded
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {scholar.activeCount} ta
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min((scholar.activeCount / 5) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Izlanuvchilar:
                      </span>
                      {scholar.supervisions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                            {s.studentName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                            {s.degreeType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ORDER & START ACTIVE (FAOL) */}
      <AnimatePresence>
        {orderModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" /> Rektorat buyrug‘ini kiritish & Boshlash
                </h3>
                <button
                  onClick={() => setOrderModal({ open: false, supervisionId: null, studentName: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Izlanuvchi: <strong>{orderModal.studentName}</strong>. Buyruq kiritilgach, avtomatik ravishda 3 yillik
                tadqiqot rejalari (Milestones) shakllanadi.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransition(orderModal.supervisionId, 'B_ACTIVE_RESEARCH', orderForm);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rektorat buyrug‘i raqami *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: № 142-U"
                    value={orderForm.orderNumber}
                    onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Buyruq sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.orderDate}
                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kutilayotgan himoya sanasi (ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={orderForm.expectedDefenseDate}
                    onChange={(e) => setOrderForm({ ...orderForm, expectedDefenseDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Buyruq PDF hujjati havolasi (Cloud URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://cloud.tiu.uz/orders/142.pdf"
                    value={orderForm.orderFileUrl}
                    onChange={(e) => setOrderForm({ ...orderForm, orderFileUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setOrderModal({ open: false, supervisionId: null, studentName: '' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Bajarilmoqda...' : 'Tasdiqlash va FAOL boshlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT APPLICATION */}
      <AnimatePresence>
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Arizani qaytarish
                </h3>
                <button
                  onClick={() => setRejectModal({ open: false, supervisionId: null, studentName: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Izlanuvchi <strong>{rejectModal.studentName}</strong> arizasi qaytariladi va qayta tahrirlash uchun
                rahbarga yuboriladi.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransition(rejectModal.supervisionId, 'A_DRAFT', { reason: rejectReason });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Qaytarish sababi va kamchiliklar *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mavzu takrorlangan, ixtisoslik noto‘g‘ri yoki hujjatlar to‘liq emas..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setRejectModal({ open: false, supervisionId: null, studentName: '' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Qaytarilmoqda...' : 'Qaytarish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EXTEND DEADLINE */}
      <AnimatePresence>
        {extendModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Himoya muddatini uzaytirish
                </h3>
                <button
                  onClick={() => setExtendModal({ open: false, supervisionId: null, studentName: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Izlanuvchi: <strong>{extendModal.studentName}</strong>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickAction(extendModal.supervisionId, 'extend_deadline', extendForm);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yangi belgilangan sana *
                  </label>
                  <input
                    type="date"
                    required
                    value={extendForm.newExpectedDate}
                    onChange={(e) => setExtendForm({ ...extendForm, newExpectedDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Muddat uzaytirilish asosi (sababi) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ilmiy kengash qarori, tajriba-sinov jarayonining cho‘zilishi..."
                    value={extendForm.reason}
                    onChange={(e) => setExtendForm({ ...extendForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setExtendModal({ open: false, supervisionId: null, studentName: '' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Saqlanmoqda...' : 'Muddatni uzaytirish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REASSIGN SUPERVISOR */}
      <AnimatePresence>
        {reassignModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" /> Ilmiy rahbarni almashtirish
                </h3>
                <button
                  onClick={() => setReassignModal({ open: false, supervisionId: null, studentName: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Izlanuvchi: <strong>{reassignModal.studentName}</strong>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickAction(reassignModal.supervisionId, 'change_supervisor', reassignForm);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yangi ilmiy rahbarni tanlang *
                  </label>
                  <select
                    required
                    value={reassignForm.newScholarId}
                    onChange={(e) => setReassignForm({ ...reassignForm, newScholarId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <option value="">— Olimni tanlang —</option>
                    {allScholars.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.fullName} ({sc.academicDegree || 'Olim'} — {sc.department?.nameUz || 'Kafedra'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Almashtirish sababi / Buyruq asosi *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ilmiy kengash qarori yoki sobiq rahbar arizasiga ko‘ra..."
                    value={reassignForm.reason}
                    onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setReassignModal({ open: false, supervisionId: null, studentName: '' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Bajarilmoqda...' : 'Rahbarni almashtirish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REPORT FEEDBACK */}
      <AnimatePresence>
        {reportReviewModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Hisobotni qayta ishlashga qaytarish
                </h3>
                <button
                  onClick={() => setReportReviewModal({ open: false, reportId: null, periodName: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Davr: <strong>{reportReviewModal.periodName}</strong>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReportReview(reportReviewModal.reportId, 'NEEDS_REVISION', reportFeedback);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kamchiliklar va ko‘rsatmalar *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Qaysi maqolalar biriktirilmagan yoki qaysi boblar kam ko‘rsatilgan..."
                    value={reportFeedback}
                    onChange={(e) => setReportFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setReportReviewModal({ open: false, reportId: null, periodName: '' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Yuborilmoqda...' : 'Qaytarish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: HOLD OR TERMINATE */}
      <AnimatePresence>
        {holdModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  {holdModal.action === 'ON_HOLD' ? (
                    <PauseCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <StopCircle className="w-5 h-5 text-rose-600" />
                  )}
                  {holdModal.action === 'ON_HOLD'
                    ? 'Jarayonni muzlatish (On Hold)'
                    : 'Jarayonni to‘xtatish / bekor qilish (Terminate)'}
                </h3>
                <button
                  onClick={() => setHoldModal({ open: false, supervisionId: null, action: 'ON_HOLD' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransition(holdModal.supervisionId, holdModal.action, { reason: holdReason });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sabab / Asoslovchi qaror *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Qaror raqami, sababi..."
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setHoldModal({ open: false, supervisionId: null, action: 'ON_HOLD' })}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow ${
                      holdModal.action === 'ON_HOLD' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {actionLoading ? 'Bajarilmoqda...' : 'Tasdiqlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
