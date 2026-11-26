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
  MessageSquare,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useLocale } from '@/lib/useLocale';
import TelegramAnnouncementCommentsModal from '@/components/announcements/TelegramAnnouncementCommentsModal';

const DICT = {
  uz: {
    title: 'Ilmiy e’lonlar va xabarnomalar',
    subtitle: 'Olimlar va ommaviy portal uchun grant, konferensiya va KPI muddatlari e’lonlarini boshqarish.',
    newBtn: 'Yangi e’lon',
    empty: 'Hozircha e’lonlar yaratilmagan.',
    pinned: 'Qadalgan',
    internal: 'Faqat olimlar',
    public: 'Ommaviy',
    deadline: 'Muddat',
    views: 'o‘qildi',
    inquiries: 'Izohlar',
    editTitle: 'E’lonni tahrirlash',
    createTitle: 'Yangi ilmiy e’lon yaratish',
    fieldTitle: 'Sarlavha *',
    fieldCategory: 'Kategoriya',
    fieldVisibility: 'Ko‘rinishi',
    fieldDeadline: 'Dedlayn (ixtiyoriy)',
    fieldContent: 'E’lon matni *',
    pinCheck: 'Yuqoriga qadab qo‘yish (Pin)',
    notifyCheck: 'Barcha faol olimlarga bildirishnoma va Telegram bot xabari yuborish',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    categories: { ACHIEVEMENT: 'Ilmiy yutuq', GRANT: 'Grant', CONFERENCE: 'Konferensiya', DEADLINE: 'Muddat / KPI', NEWS: 'Ilmiy yangilik' },
    filters: {
      ALL: 'Barchasi',
      ACTIVE: 'Faol e‘lonlar',
      ARCHIVED: 'Arxiv & Muddati tugagan',
    },
  },
  ru: {
    title: 'Научные объявления и уведомления',
    subtitle: 'Управление объявлениями о грантах, конференциях и сроках KPI.',
    newBtn: 'Новое объявление',
    empty: 'Объявления пока не созданы.',
    pinned: 'Закреплено',
    internal: 'Только учёным',
    public: 'Публичное',
    deadline: 'Дедлайн',
    views: 'просмотров',
    inquiries: 'Комментарии',
    editTitle: 'Редактировать объявление',
    createTitle: 'Создать научное объявление',
    fieldTitle: 'Заголовок *',
    fieldCategory: 'Категория',
    fieldVisibility: 'Видимость',
    fieldDeadline: 'Дедлайн (опционально)',
    fieldContent: 'Текст объявления *',
    pinCheck: 'Закрепить вверху (Pin)',
    notifyCheck: 'Отправить уведомление и Telegram-сообщение всем учёным',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    categories: { GRANT: 'Грант', CONFERENCE: 'Конференция', DEADLINE: 'Сроки / KPI', NEWS: 'Научная новость' },
    filters: {
      ALL: 'Все',
      ACTIVE: 'Активные',
      ARCHIVED: 'Архив и просроченные',
    },
  },
  en: {
    title: 'Scientific Announcements',
    subtitle: 'Manage grant calls, conferences, and KPI deadline announcements.',
    newBtn: 'New Announcement',
    empty: 'No announcements created yet.',
    pinned: 'Pinned',
    internal: 'Scholars only',
    public: 'Public',
    deadline: 'Deadline',
    views: 'views',
    inquiries: 'Comments',
    editTitle: 'Edit Announcement',
    createTitle: 'Create Announcement',
    fieldTitle: 'Title *',
    fieldCategory: 'Category',
    fieldVisibility: 'Visibility',
    fieldDeadline: 'Deadline (optional)',
    fieldContent: 'Content *',
    pinCheck: 'Pin to top',
    notifyCheck: 'Send notification and Telegram broadcast to active scholars',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    categories: { GRANT: 'Grant', CONFERENCE: 'Conference', DEADLINE: 'Deadline / KPI', NEWS: 'Scientific News' },
    filters: {
      ALL: 'All',
      ACTIVE: 'Active',
      ARCHIVED: 'Archived & Expired',
    },
  },
};

const CATEGORY_CLS = {
  GRANT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONFERENCE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DEADLINE: 'bg-amber-50 text-amber-700 border-amber-200',
  NEWS: 'bg-blue-50 text-blue-700 border-blue-200',
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
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Status Archive Filter
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ARCHIVED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Telegram Inquiries Chat Modal
  const [chatModalItem, setChatModalItem] = useState(null);

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
        setError(res.status === 401 ? 'Moderator sessiyasi faol emas.' : (data.error || 'Error'));
        return;
      }
      setModalOpen(false);
      await loadData();
    } catch {
      setError('Network error');
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

  // Archive / Restore Algorithm
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
    if (!confirm('Ushbu e’lonni butunlay o‘chirishga ishonchingiz komilmi?')) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  // Archive Algorithm: filter items based on statusFilter and deadline
  const now = new Date();
  const filteredItems = items.filter((item) => {
    const isExpired = item.deadline && new Date(item.deadline) < now;
    const isArchived = item.status === 'ARCHIVED' || isExpired;
    const isActive = item.status === 'PUBLISHED' && !isExpired;

    if (statusFilter === 'ACTIVE' && !isActive) return false;
    if (statusFilter === 'ARCHIVED' && !isArchived) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & New Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t.newBtn}
        </button>
      </div>

      {/* Archive & Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Archive Engine Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(t.filters).map(([key, label]) => {
            const count =
              key === 'ALL'
                ? items.length
                : key === 'ACTIVE'
                ? items.filter((it) => it.status === 'PUBLISHED' && (!it.deadline || new Date(it.deadline) >= now)).length
                : items.filter((it) => it.status === 'ARCHIVED' || (it.deadline && new Date(it.deadline) < now)).length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === key
                    ? 'bg-[#0F294A] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              categoryFilter === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hammasi
          </button>
          {Object.entries(t.categories).map(([catKey, catVal]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setCategoryFilter(catKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                categoryFilter === catKey ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {catVal}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-600">{t.empty}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isExpired = item.deadline && new Date(item.deadline) < now;
            const inquiriesList = item.inquiries || [];
            const pendingInquiries = inquiriesList.filter((q) => q.status === 'PENDING').length;

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
                          <Pin className="w-3 h-3" /> {t.pinned}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${CATEGORY_CLS[item.category] || CATEGORY_CLS.NEWS}`}>
                        {t.categories[item.category] || item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Eye className="w-3 h-3" />
                        {item.visibility === 'INTERNAL' ? t.internal : t.public}
                      </span>

                      {/* Status Badges */}
                      {item.status === 'ARCHIVED' ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          Arxivda
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Muddati o‘tgan (Arxiv)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          Faol
                        </span>
                      )}

                      {item.deadline && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold ${
                          isExpired ? 'text-rose-600 line-through' : 'text-slate-600'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {t.deadline}: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-3">{item.content}</p>

                    {/* Footer Meta & Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span>{item.author?.email} · {new Date(item.createdAt).toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {item.viewsCount || 0} {t.views}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Comment / Telegram Chat Button */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {/* Telegram Style Comment Button */}
                    <button
                      type="button"
                      onClick={() => setChatModalItem(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        pendingInquiries > 0
                          ? 'bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white hover:shadow-md'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                      title="Telegram orqali kelgan savol va izohlarni ko‘rish & javob yozish"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t.inquiries} ({inquiriesList.length})</span>
                      {pendingInquiries > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                          {pendingInquiries} yangi
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => togglePin(item)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                        title="Qadash"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleArchive(item)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          item.status === 'ARCHIVED'
                            ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title={item.status === 'ARCHIVED' ? 'Arxivdan chiqarish' : 'Arxivga olish'}
                      >
                        {item.status === 'ARCHIVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Telegram Announcement Comments Modal */}
      {chatModalItem && (
        <TelegramAnnouncementCommentsModal
          announcement={chatModalItem}
          isOpen={Boolean(chatModalItem)}
          onClose={() => setChatModalItem(null)}
          isModerator={true}
          onUpdated={loadData}
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? t.editTitle : t.createTitle}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldTitle}</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldCategory}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {Object.entries(t.categories).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldVisibility}</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="PUBLIC">{t.public}</option>
                    <option value="INTERNAL">{t.internal}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldDeadline}</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldContent}</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {t.pinCheck}
                </label>
                {!form.id && (
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.notifyScholars}
                      onChange={(e) => setForm({ ...form, notifyScholars: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    {t.notifyCheck}
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-bold disabled:opacity-50 cursor-pointer"
                >
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
