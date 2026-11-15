'use client';

import { useState, useEffect, startTransition } from 'react';
import { Plus, Briefcase, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react';

const COPY = {
  uz: {
    title: 'Grantlar va ilmiy loyihalar',
    subtitle: "Ilmiy-tadqiqot grantlari, tijoratlashtirish loyihalari va moliyalashtirish manbalarini boshqaring.",
    addBtn: "Grant qo'shish",
    loading: 'Yuklanmoqda...',
    empty: "Hozircha grant loyihalari qo'shilmagan.",
    colTitle: 'Loyiha nomi',
    colRole: 'Roli',
    colSource: 'Moliyalashtirish manbasi',
    colDuration: 'Davri',
    colStatus: 'Holati',
    colActions: 'Amallar',
    approved: 'Tasdiqlangan',
    pending: 'Kutilmoqda',
    rejected: 'Rad etilgan',
    modalTitle: "Yangi grant loyihasini qo'shish",
    fieldTitle: 'Loyiha nomi *',
    fieldRole: 'Loyihadagi roli',
    fieldSource: 'Moliyalashtirish manbasi',
    fieldStart: 'Boshlanish yili',
    fieldEnd: 'Tugash yili',
    cancel: 'Bekor qilish',
    submit: 'Moderatsiyaga yuborish',
    confirmDelete: "Ushbu grant loyihasini o'chirmoqchimisiz?",
  },
  ru: {
    title: 'Гранты и научные проекты',
    subtitle: 'Управляйте исследовательскими грантами, проектами коммерциализации и финансированием.',
    addBtn: 'Добавить грант',
    loading: 'Загрузка...',
    empty: 'Грантовые проекты ещё не добавлены.',
    colTitle: 'Название проекта',
    colRole: 'Роль',
    colSource: 'Источник финансирования',
    colDuration: 'Период',
    colStatus: 'Статус',
    colActions: 'Действия',
    approved: 'Одобрено',
    pending: 'На проверке',
    rejected: 'Отклонено',
    modalTitle: 'Добавить грантовый проект',
    fieldTitle: 'Название проекта *',
    fieldRole: 'Роль в проекте',
    fieldSource: 'Источник финансирования',
    fieldStart: 'Год начала',
    fieldEnd: 'Год окончания',
    cancel: 'Отмена',
    submit: 'Отправить на модерацию',
    confirmDelete: 'Удалить этот грантовый проект?',
  },
  en: {
    title: 'Grants & Research Projects',
    subtitle: 'Manage research grants, commercialization projects, and funding.',
    addBtn: 'Add Grant',
    loading: 'Loading grants...',
    empty: 'No grant projects added yet.',
    colTitle: 'Project Title',
    colRole: 'Role',
    colSource: 'Funding Source',
    colDuration: 'Duration',
    colStatus: 'Status',
    colActions: 'Actions',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    modalTitle: 'Add Research Grant / Project',
    fieldTitle: 'Project Title *',
    fieldRole: 'Role in Project',
    fieldSource: 'Funding Source',
    fieldStart: 'Start Year',
    fieldEnd: 'End Year',
    cancel: 'Cancel',
    submit: 'Submit for Moderation',
    confirmDelete: 'Delete this grant project?',
  },
};

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : 'uz';
}

export default function GrantsPage() {
  const [locale, setLocale] = useState('uz');
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    role: 'Principal Investigator',
    fundingSource: 'Ministry of Higher Education',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 2,
  });

  const t = COPY[locale] || COPY.uz;

  const fetchGrants = async () => {
    try {
      const res = await fetch('/api/dashboard/grants');
      const data = await res.json();
      if (data.grants) setGrants(data.grants);
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
        const res = await fetch('/api/dashboard/grants');
        const data = await res.json();
        if (data.grants) {
          startTransition(() => {
            setGrants(data.grants);
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
      title: '',
      role: 'Principal Investigator',
      fundingSource: 'Ministry of Higher Education',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 2,
    });
    setModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingId(g.id);
    setForm({
      title: g.title || '',
      role: g.role || 'Principal Investigator',
      fundingSource: g.fundingSource || '',
      startYear: g.startYear || new Date().getFullYear(),
      endYear: g.endYear || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/dashboard/grants/${editingId}` : '/api/dashboard/grants';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save grant');
      setModalOpen(false);
      setEditingId(null);
      setForm({
        title: '',
        role: 'Principal Investigator',
        fundingSource: 'Ministry of Higher Education',
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 2,
      });
      fetchGrants();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/dashboard/grants/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      fetchGrants();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="neu-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
        ) : grants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md">
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">{t.colTitle}</th>
                  <th className="p-4">{t.colRole}</th>
                  <th className="p-4">{t.colSource}</th>
                  <th className="p-4">{t.colDuration}</th>
                  <th className="p-4">{t.colStatus}</th>
                  <th className="p-4 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70 text-sm">
                {grants.map((g) => (
                  <tr key={g.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{g.title}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{g.role}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{g.fundingSource}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {g.startYear} – {g.endYear || '...'}
                    </td>
                    <td className="p-4">
                      {g.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5" /> {t.approved}
                        </span>
                      )}
                      {g.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> {t.pending}
                        </span>
                      )}
                      {g.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                          <XCircle className="w-3.5 h-3.5" /> {t.rejected}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      {g.status !== 'APPROVED' && (
                        <>
                          <button
                            onClick={() => openEditModal(g)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
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
                  {t.fieldTitle}
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldRole}
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  >
                    <option value="Principal Investigator">Principal Investigator</option>
                    <option value="Co-Investigator">Co-Investigator</option>
                    <option value="Researcher">Researcher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldSource}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fundingSource}
                    onChange={(e) => setForm({ ...form, fundingSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldStart}
                  </label>
                  <input
                    type="number"
                    required
                    value={form.startYear}
                    onChange={(e) => setForm({ ...form, startYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.fieldEnd}
                  </label>
                  <input
                    type="number"
                    value={form.endYear}
                    onChange={(e) => setForm({ ...form, endYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  />
                </div>
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
