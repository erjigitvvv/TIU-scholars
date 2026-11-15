'use client';

import { useState, useEffect, startTransition } from 'react';
import { Plus, GraduationCap, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react';

const COPY = {
  uz: {
    title: 'PhD / DSc ilmiy rahbarlik',
    subtitle: 'Doktorantlar, mustaqil izlanuvchilar va dissertatsiya ishlariga rahbarlikni boshqaring.',
    addBtn: "Shogird qo'shish",
    loading: 'Yuklanmoqda...',
    empty: "Hozircha ilmiy rahbarlik ma'lumotlari qo'shilmagan.",
    colStudent: 'Izlanuvchi F.I.Sh.',
    colDegree: 'Daraja',
    colDissertation: 'Dissertatsiya mavzusi',
    colYear: 'Yil',
    colStatus: 'Holati',
    colActions: 'Amallar',
    approved: 'Tasdiqlangan',
    pending: 'Kutilmoqda',
    rejected: 'Rad etilgan',
    modalTitle: "Yangi ilmiy rahbarlik qo'shish",
    fieldStudent: 'Izlanuvchi F.I.Sh. *',
    fieldDegree: 'Ilmiy daraja turi',
    fieldYear: 'Himoya / Boshlanish yili',
    fieldTopic: 'Dissertatsiya mavzusi *',
    cancel: 'Bekor qilish',
    submit: 'Moderatsiyaga yuborish',
    confirmDelete: "Ushbu yozuvni o'chirmoqchimisiz?",
  },
  ru: {
    title: 'Научное руководство PhD / DSc',
    subtitle: 'Управляйте докторантами и руководством диссертационными исследованиями.',
    addBtn: 'Добавить руководство',
    loading: 'Загрузка...',
    empty: 'Записи о научном руководстве ещё не добавлены.',
    colStudent: 'ФИО соискателя',
    colDegree: 'Степень',
    colDissertation: 'Тема диссертации',
    colYear: 'Год',
    colStatus: 'Статус',
    colActions: 'Действия',
    approved: 'Одобрено',
    pending: 'На проверке',
    rejected: 'Отклонено',
    modalTitle: 'Добавить научное руководство',
    fieldStudent: 'ФИО соискателя *',
    fieldDegree: 'Тип степени',
    fieldYear: 'Год защиты / начала',
    fieldTopic: 'Тема диссертации *',
    cancel: 'Отмена',
    submit: 'Отправить на модерацию',
    confirmDelete: 'Удалить эту запись?',
  },
  en: {
    title: 'PhD / DSc Supervisions',
    subtitle: 'Manage doctoral students and dissertation advisement.',
    addBtn: 'Add Supervision',
    loading: 'Loading supervisions...',
    empty: 'No supervisions added yet.',
    colStudent: 'Student Name',
    colDegree: 'Degree',
    colDissertation: 'Dissertation Title',
    colYear: 'Year',
    colStatus: 'Status',
    colActions: 'Actions',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    modalTitle: 'Add PhD / DSc Supervision',
    fieldStudent: 'Student Full Name *',
    fieldDegree: 'Degree Type',
    fieldYear: 'Year',
    fieldTopic: 'Dissertation Title *',
    cancel: 'Cancel',
    submit: 'Submit for Moderation',
    confirmDelete: 'Delete this supervision record?',
  },
};

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : 'uz';
}

export default function SupervisionsPage() {
  const [locale, setLocale] = useState('uz');
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studentName: '',
    degreeType: 'PHD',
    dissertationTitle: '',
    year: new Date().getFullYear(),
  });

  const t = COPY[locale] || COPY.uz;

  const fetchSupervisions = async () => {
    try {
      const res = await fetch('/api/dashboard/supervisions');
      const data = await res.json();
      if (data.supervisions) setSupervisions(data.supervisions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    startTransition(() => {
      setLocale(getCookieLocale());
    });
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/supervisions');
        const data = await res.json();
        if (data.supervisions) {
          startTransition(() => {
            setSupervisions(data.supervisions);
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    }
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      studentName: '',
      degreeType: 'PHD',
      dissertationTitle: '',
      year: new Date().getFullYear(),
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingId(s.id);
    setForm({
      studentName: s.studentName || '',
      degreeType: s.degreeType || 'PHD',
      dissertationTitle: s.dissertationTitle || '',
      year: s.year || new Date().getFullYear(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/dashboard/supervisions/${editingId}` : '/api/dashboard/supervisions';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save supervision');
      setModalOpen(false);
      setEditingId(null);
      setForm({
        studentName: '',
        degreeType: 'PHD',
        dissertationTitle: '',
        year: new Date().getFullYear(),
      });
      fetchSupervisions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      fetchSupervisions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="neu-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            {t.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" /> {t.addBtn}
        </button>
      </div>

      <div className="neu-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">{t.loading}</div>
        ) : supervisions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md">
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">{t.colStudent}</th>
                  <th className="p-4">{t.colDegree}</th>
                  <th className="p-4">{t.colDissertation}</th>
                  <th className="p-4">{t.colYear}</th>
                  <th className="p-4">{t.colStatus}</th>
                  <th className="p-4 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70 text-sm">
                {supervisions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{s.studentName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 rounded-md font-bold text-xs">
                        {s.degreeType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{s.dissertationTitle}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{s.year}</td>
                    <td className="p-4">
                      {s.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5" /> {t.approved}
                        </span>
                      )}
                      {s.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> {t.pending}
                        </span>
                      )}
                      {s.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                          <XCircle className="w-3.5 h-3.5" /> {t.rejected}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      {s.status !== 'APPROVED' && (
                        <>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-lg p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.modalTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.fieldStudent}
                </label>
                <input
                  type="text"
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldDegree}
                  </label>
                  <select
                    value={form.degreeType}
                    onChange={(e) => setForm({ ...form, degreeType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  >
                    <option value="PHD">PhD</option>
                    <option value="DSC">DSc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldYear}
                  </label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.fieldTopic}
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.dissertationTitle}
                  onChange={(e) => setForm({ ...form, dissertationTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="glass-btn px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {t.cancel}
                </button>
                <button type="submit" className="glass-btn-primary px-5 py-2 text-sm font-semibold">
                  {t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
