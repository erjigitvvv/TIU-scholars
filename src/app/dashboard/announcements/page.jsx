'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  Eye,
  Plus,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Archive,
  X,
  User,
  Sparkles,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';

const DICT = {
  uz: {
    title: 'Ilmiy bo‘lim e’lonlari',
    subtitle: 'Grant tanlovlari, konferensiyalar, ilmiy seminarlar va KPI topshirish muddatlari haqidagi rasmiy xabarlar.',
    empty: 'Ushbu bo‘limda hozircha e’lonlar yo‘q.',
    pinned: 'Muhim',
    internal: 'Ichki e’lon',
    deadline: 'Dedlayn',
    publishedAt: 'Chop etildi',
    views: 'ko‘rildi',
    newAnnouncement: '+ Yangi E’lon Joylash',
    editAnnouncement: 'Tahrirlash',
    archive: 'Arxivlash',
    delete: 'O‘chirish',
    askQuestion: 'Savol / Izoh qoldirish',
    reply: 'Javob yozish',
    inquiriesTitle: 'Olimlarning savol va izohlari',
    noInquiries: 'Hozircha savollar kelib tushmagan.',
    answered: 'Javob berildi',
    pending: 'Kutilmoqda',
    categories: {
      ALL: 'Barchasi',
      GRANT: 'Grantlar',
      CONFERENCE: 'Konferensiyalar',
      DEADLINE: 'Muddatlar / KPI',
      NEWS: 'Ilmiy yangiliklar',
    },
  },
  ru: {
    title: 'Объявления научного отдела',
    subtitle: 'Официальные сообщения о грантах, конференциях и сроках KPI.',
    empty: 'В этом разделе пока нет объявлений.',
    pinned: 'Важно',
    internal: 'Внутреннее',
    deadline: 'Дедлайн',
    publishedAt: 'Опубликовано',
    views: 'просмотров',
    newAnnouncement: '+ Новое объявление',
    editAnnouncement: 'Редактировать',
    archive: 'В архив',
    delete: 'Удалить',
    askQuestion: 'Задать вопрос / комментарий',
    reply: 'Ответить',
    inquiriesTitle: 'Вопросы и комментарии ученых',
    noInquiries: 'Пока вопросов нет.',
    answered: 'Отвечено',
    pending: 'Ожидает ответа',
    categories: {
      ALL: 'Все',
      GRANT: 'Гранты',
      CONFERENCE: 'Конференции',
      DEADLINE: 'Сроки / KPI',
      NEWS: 'Научные новости',
    },
  },
  en: {
    title: 'Scientific Dept. Announcements',
    subtitle: 'Official updates on grants, conferences, and KPI submission deadlines.',
    empty: 'No announcements in this category yet.',
    pinned: 'Pinned',
    internal: 'Internal',
    deadline: 'Deadline',
    publishedAt: 'Published',
    views: 'views',
    newAnnouncement: '+ Post Announcement',
    editAnnouncement: 'Edit',
    archive: 'Archive',
    delete: 'Delete',
    askQuestion: 'Ask Question / Comment',
    reply: 'Reply',
    inquiriesTitle: 'Scholar Questions & Comments',
    noInquiries: 'No questions yet.',
    answered: 'Answered',
    pending: 'Pending',
    categories: {
      ALL: 'All',
      GRANT: 'Grants',
      CONFERENCE: 'Conferences',
      DEADLINE: 'Deadlines / KPI',
      NEWS: 'Scientific News',
    },
  },
};

const CATEGORY_BADGE = {
  GRANT: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  CONFERENCE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  DEADLINE: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  NEWS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
};

export default function ScholarAnnouncementsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [locale, setLocale] = useState('uz');
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inquiryModalItem, setInquiryModalItem] = useState(null); // Announcement asking question for
  const [replyModalInquiry, setReplyModalInquiry] = useState(null); // Inquiry being replied to

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('NEWS');
  const [formVisibility, setFormVisibility] = useState('PUBLIC');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState('PUBLISHED');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Question & Reply states
  const [questionInput, setQuestionInput] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState('');

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      })
      .catch(console.error);

    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (match && DICT[match[1]]) setLocale(match[1]);
  }, []);

  const isModerator =
    currentUser?.role === 'MODERATOR' || currentUser?.role === 'SUPER_ADMIN';

  const loadAnnouncements = () => {
    setLoading(true);
    fetch(`/api/announcements?category=${category}&all=${isModerator ? 'true' : 'false'}`)
      .then((r) => r.json())
      .then((d) => setItems(d.announcements || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnnouncements();
  }, [category, isModerator]);

  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('NEWS');
    setFormVisibility('PUBLIC');
    setFormIsPinned(false);
    setFormDeadline('');
    setFormStatus('PUBLISHED');
    setEditingItem(null);
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormCategory(item.category || 'NEWS');
    setFormVisibility(item.visibility || 'PUBLIC');
    setFormIsPinned(Boolean(item.isPinned));
    setFormDeadline(item.deadline ? item.deadline.split('T')[0] : '');
    setFormStatus(item.status || 'PUBLISHED');
    setCreateModalOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Sarlavha va eʼlon matnini to‘ldiring');
      return;
    }

    try {
      setSavingAnnouncement(true);
      const payload = {
        title: formTitle,
        content: formContent,
        category: formCategory,
        visibility: formVisibility,
        isPinned: formIsPinned,
        deadline: formDeadline || null,
        status: formStatus,
      };

      const url = editingItem
        ? `/api/announcements/${editingItem.id}`
        : '/api/announcements';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setNotificationMsg(
          editingItem
            ? 'E’lon muvaffaqiyatli tahrirlandi! ✅'
            : `E’lon chop etildi va barcha olimlarga Telegram bot hamda tizim orqali yuborildi! 🚀`
        );
        setTimeout(() => setNotificationMsg(''), 5000);
        loadAnnouncements();
      } else {
        alert(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      alert('Server xatosi');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleArchive = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ARCHIVED' ? 'PUBLISHED' : 'ARCHIVED';
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadAnnouncements();
      }
    } catch {
      alert('Arxivlashda xatolik');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatan ham ushbu e’lonni butunlay o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAnnouncements();
      } else {
        alert(data.error || 'O‘chirishda xatolik');
      }
    } catch {
      alert('Server xatosi');
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionInput.trim() || !inquiryModalItem) return;

    try {
      setSubmittingQuestion(true);
      const res = await fetch(`/api/announcements/${inquiryModalItem.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText: questionInput }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiryModalItem(null);
        setQuestionInput('');
        setNotificationMsg('Savolingiz moderatorga yuborildi! Javob chiqqach Telegram botingizga bildirishnoma boradi. 💬');
        setTimeout(() => setNotificationMsg(''), 5000);
        loadAnnouncements();
      } else {
        alert(data.error || 'Xatolik');
      }
    } catch {
      alert('Yuborishda xatolik');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !replyModalInquiry) return;

    try {
      setSubmittingReply(true);
      const { announcementId, inquiry } = replyModalInquiry;
      const res = await fetch(
        `/api/announcements/${announcementId}/inquiries/${inquiry.id}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answerText: replyInput }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReplyModalInquiry(null);
        setReplyInput('');
        setNotificationMsg(
          data.telegramSent
            ? 'Javob saqlandi va olimning Telegramiga bot orqali yetkazildi! 📲'
            : 'Javob saqlandi va olim kabinetiga bildirishnoma yuborildi! 🔔'
        );
        setTimeout(() => setNotificationMsg(''), 5000);
        loadAnnouncements();
      } else {
        alert(data.error || 'Javob yuborishda xatolik');
      }
    } catch {
      alert('Server xatosi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const t = DICT[locale] || DICT.uz;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Alert */}
      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg('')}
            className="p-1 rounded-lg hover:bg-emerald-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.title}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {isModerator && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newAnnouncement}</span>
            </button>
          )}

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(t.categories).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  category === key
                    ? 'bg-[#0F294A] text-white border-[#0F294A]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-2">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-500">{t.empty}</div>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const hasInquiries = item.inquiries && item.inquiries.length > 0;
            const pendingInquiriesCount = item.inquiries
              ? item.inquiries.filter((q) => q.status === 'PENDING').length
              : 0;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-sm space-y-4 transition-all ${
                  item.isPinned
                    ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold">
                        <Pin className="w-3 h-3" /> {t.pinned}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                        CATEGORY_BADGE[item.category] || CATEGORY_BADGE.NEWS
                      }`}
                    >
                      {t.categories[item.category] || item.category}
                    </span>
                    {item.visibility === 'INTERNAL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                        <Eye className="w-3 h-3" /> {t.internal}
                      </span>
                    )}
                    {item.status === 'ARCHIVED' && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 text-[11px] font-bold">
                        Arxivda
                      </span>
                    )}
                    {item.deadline && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3 h-3" />
                        {t.deadline}: {new Date(item.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.viewsCount || 0} {t.views}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryModalItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t.askQuestion}</span>
                    </button>

                    {pendingInquiriesCount > 0 && isModerator && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {pendingInquiriesCount} ta yangi savol
                      </span>
                    )}
                  </div>

                  {isModerator && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t.editAnnouncement}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(item.id, item.status)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-amber-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Archive className="w-3 h-3" />
                        <span>{item.status === 'ARCHIVED' ? 'Tiklash' : t.archive}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-rose-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t.delete}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* INQUIRIES & REPLIES SECTION */}
                {hasInquiries && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>{t.inquiriesTitle} ({item.inquiries.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Telegram bot orqali bog‘langan
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {item.inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{inq.authorName || 'Olim'}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                inq.status === 'ANSWERED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {inq.status === 'ANSWERED' ? t.answered : t.pending}
                            </span>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {inq.questionText}
                          </p>

                          {inq.answerText ? (
                            <div className="pl-3 border-l-2 border-emerald-500 space-y-1 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-r-lg">
                              <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                Moderator javobi:
                              </div>
                              <p className="text-slate-800 dark:text-slate-200">{inq.answerText}</p>
                              {inq.answeredAt && (
                                <div className="text-[9px] text-slate-400 font-mono">
                                  {new Date(inq.answeredAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : isModerator ? (
                            <button
                              type="button"
                              onClick={() =>
                                setReplyModalInquiry({
                                  announcementId: item.id,
                                  inquiry: inq,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                            >
                              <Send className="w-3 h-3" />
                              <span>Javob yozish (Telegramga yuboriladi)</span>
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ANNOUNCEMENT MODAL (MODERATOR) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <span>
                  {editingItem ? 'E’lonni Tahrirlash' : 'Yangi Rasmiy E’lon Joylash'}
                </span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  E’lon Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 2026-yilgi Amaliy grantlar tanlovi e’lon qilindi"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="NEWS">Ilmiy yangiliklar</option>
                    <option value="GRANT">Grantlar va Tanlovlar</option>
                    <option value="CONFERENCE">Konferensiyalar</option>
                    <option value="DEADLINE">Muddatlar / KPI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Ko‘rinishi (Visibility)
                  </label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PUBLIC">Ommaviy (Barcha uchun)</option>
                    <option value="INTERNAL">Ichki (Faqat TIU xodimlari)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Topshirish muddati (Dedlayn - ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="isPinned" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    📌 Yuqoriga qadab qo‘yish (Muhim)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  E’lon Matni va Tafsilotlari *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="E’lonning to‘liq matni, shartlari, havolalari..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-[11px] text-blue-800 dark:text-blue-300">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                <span>
                  E’lon chop etilgach, avtomatik ravishda barcha olimlarning Telegram botiga inline savol berish tugmasi bilan va platforma bildirishnomalar paneliga yetkaziladi.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingAnnouncement}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingAnnouncement ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{editingItem ? 'Yangilash' : 'Chop etish & Xabar yuborish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHOLAR QUESTION / COMMENT MODAL */}
      {inquiryModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>E’lon bo‘yicha savol yoki izoh yuborish</span>
              </h3>
              <button
                onClick={() => setInquiryModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-white">
                {inquiryModalItem.title}
              </div>
              <div className="text-[11px] text-slate-400">
                Savolingiz moderatorga yuboriladi va javob chiqishi bilan Telegram botingizga xabar boradi.
              </div>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Savolingiz yoki izohingiz:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Masalan: Ushbu tanlovda qatnashish uchun maqola qaysi bazada indekslangan bo‘lishi lozim?.."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalItem(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Yuborish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODERATOR ANSWER MODAL (DELIVERS DIRECT TO TELEGRAM) */}
      {replyModalInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Olimning savoliga javob berish</span>
              </h3>
              <button
                onClick={() => setReplyModalInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200">
                {replyModalInquiry.inquiry.authorName} bergan savol:
              </div>
              <p className="text-slate-800 dark:text-slate-300">
                "{replyModalInquiry.inquiry.questionText}"
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Moderator javob matni:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Batafsil tushuntirish yoki rasmiy javob..."
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Ushbu javob bevosita olimning Telegram botiga (`@tiuscholarbot`) xabar shaklida jo‘natiladi!
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModalInquiry(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Javobni Telegram orqali yuborish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
