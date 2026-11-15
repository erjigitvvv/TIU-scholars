'use client';

import { useEffect, useState } from 'react';
import { Eye, MessageSquare, Send, User } from 'lucide-react';

function formatCommentDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} • ${hh}:${mm}`;
}

export default function PublicationEngagement({ publicationId, locale = 'uz' }) {
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const t = {
    uz: {
      viewsLabel: 'Ko‘rishlar soni',
      commentsTitle: 'Izohlar va muhokama',
      namePlaceholder: 'Ismingiz va familiyangiz...',
      commentPlaceholder: 'Nashr yuzasidan fikr yoki izoh qoldiring...',
      submit: 'Yuborish',
      sending: 'Yuborilmoqda...',
      emptyComments: 'Hozircha izohlar yo‘q. Birinchi bo‘lib fikr qoldiring!',
      requiredError: 'Iltimos, ismingiz va izoh matnini kiriting.',
    },
    ru: {
      viewsLabel: 'Просмотры',
      commentsTitle: 'Комментарии и обсуждение',
      namePlaceholder: 'Ваше имя и фамилия...',
      commentPlaceholder: 'Оставьте отзыв или комментарий к публикации...',
      submit: 'Отправить',
      sending: 'Отправка...',
      emptyComments: 'Комментариев пока нет. Будьте первым!',
      requiredError: 'Пожалуйста, введите имя и текст комментария.',
    },
    en: {
      viewsLabel: 'Views',
      commentsTitle: 'Comments & Discussion',
      namePlaceholder: 'Your full name...',
      commentPlaceholder: 'Share your thoughts or feedback on this publication...',
      submit: 'Post Comment',
      sending: 'Posting...',
      emptyComments: 'No comments yet. Be the first to share your thoughts!',
      requiredError: 'Please enter your name and comment.',
    },
  }[locale] || {
    viewsLabel: 'Ko‘rishlar soni',
    commentsTitle: 'Izohlar va muhokama',
    namePlaceholder: 'Ismingiz va familiyangiz...',
    commentPlaceholder: 'Nashr yuzasidan fikr yoki izoh qoldiring...',
    submit: 'Yuborish',
    sending: 'Yuborilmoqda...',
    emptyComments: 'Hozircha izohlar yo‘q. Birinchi bo‘lib fikr qoldiring!',
    requiredError: 'Iltimos, ismingiz va izoh matnini kiriting.',
  };

  useEffect(() => {
    let active = true;
    async function trackAndLoad() {
      try {
        const res = await fetch(`/api/publications/${publicationId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' }),
        });
        const data = await res.json();
        if (active && res.ok) {
          setViews(data.views || 0);
          setComments(Array.isArray(data.comments) ? data.comments : []);
        }
      } catch {
        // ignore network errors
      }
    }
    trackAndLoad();
    return () => {
      active = false;
    };
  }, [publicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!authorName.trim() || !text.trim()) {
      setError(t.requiredError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/publications/${publicationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          authorName: authorName.trim(),
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.requiredError);
        return;
      }
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setText('');
    } catch {
      setError(t.requiredError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Views + Comment Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0F294A] dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          {t.commentsTitle} ({comments.length})
        </h2>

        <div
          title={t.viewsLabel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-btn text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums"
        >
          <Eye className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span className="font-mono font-extrabold text-[#0F294A] dark:text-white">{views}</span>
        </div>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="no-print p-5 rounded-2xl neu-card-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative flex items-center">
            <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.commentPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl glass-btn-primary text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? t.sending : t.submit}</span>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="p-4 rounded-2xl neu-card-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
          {t.emptyComments}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl neu-card-sm space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#0F294A] dark:text-white">
                  {c.authorName}
                </span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {formatCommentDate(c.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
