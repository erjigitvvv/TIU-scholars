'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  Eye,
  Trash2,
  Edit3,
  Archive,
  CheckCircle2,
  X,
} from 'lucide-react';

const CATEGORY_LABELS = {
  GRANT: { label: 'Grant', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CONFERENCE: { label: 'Konferensiya', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DEADLINE: { label: 'Muddat / KPI', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  NEWS: { label: 'Ilmiy yangilik', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const EMPTY_FORM = {
  id: null,
  title: '',
  content: '',
  category: 'NEWS',
  visibility: 'PUBLIC',
  status: 'PUBLISHED',
  isPinned: false,
  deadline: '',
  notifyScholars: true,
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      setItems(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      visibility: item.visibility,
      status: item.status,
      isPinned: Boolean(item.isPinned),
      deadline: item.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : '',
      notifyScholars: false,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const method = form.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError('Moderator sessiyasi faol emas (boshqa oynada olim hisobiga kirilgan bo‘lishi mumkin). Iltimos, moderator sifatida qayta kiring.');
        } else {
          setError(data.error || 'Saqlashda xatolik');
        }
        return;
      }
      setModalOpen(false);
      await loadData();
    } catch {
      setError('Tarmoq xatoligi');
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (item) => {
    await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, isPinned: !item.isPinned }),
    });
    loadData();
  };

  const toggleArchive = async (item) => {
    const nextStatus = item.status === 'ARCHIVED' ? 'PUBLISHED' : 'ARCHIVED';
    await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Ushbu e’lonni o‘chirishni tasdiqlaysizmi?')) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ilmiy e’lonlar va xabarnomalar</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Olimlar va ommaviy portal uchun grant, konferensiya va KPI muddatlari e’lonlarini boshqarish.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yangi e’lon
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-600">Hozircha e’lonlar yaratilmagan.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.NEWS;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  item.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">
                          <Pin className="w-3 h-3" /> Qadalgan
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${cat.cls}`}>
                        {cat.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Eye className="w-3 h-3" />
                        {item.visibility === 'INTERNAL' ? 'Faqat olimlar' : 'Ommaviy'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'ARCHIVED'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.deadline && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 font-semibold">
                          <Calendar className="w-3 h-3" />
                          Muddat: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-3">
                      {item.content}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.author?.email} · {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePin(item)}
                      title="Qadash / Yechish"
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        item.isPinned
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      title="Tahrirlash"
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArchive(item)}
                      title={item.status === 'ARCHIVED' ? 'Faollashtirish' : 'Arxivlash'}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      {item.status === 'ARCHIVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="O‘chirish"
                      className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {form.id ? 'E’lonni tahrirlash' : 'Yangi ilmiy e’lon yaratish'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masalan: 2026-yilgi xalqaro ilmiy grant tanlovi"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategoriya</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="NEWS">Ilmiy yangilik</option>
                    <option value="GRANT">Grant</option>
                    <option value="CONFERENCE">Konferensiya</option>
                    <option value="DEADLINE">Muddat / KPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ko‘rinishi</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="PUBLIC">Ommaviy (hamma)</option>
                    <option value="INTERNAL">Ichki (faqat olimlar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dedlayn (ixtiyoriy)</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E’lon matni *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Batafsil ma’lumot, shartlar va havolalar..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Yuqoriga qadab qo‘yish (Pin)
                </label>
                {!form.id && (
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.notifyScholars}
                      onChange={(e) => setForm({ ...form, notifyScholars: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    Barcha faol olimlarga bildirishnoma yuborish
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-bold disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
