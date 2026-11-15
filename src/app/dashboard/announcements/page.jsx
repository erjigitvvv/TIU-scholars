'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Pin, Calendar, Eye } from 'lucide-react';

const DICT = {
  uz: {
    title: 'Ilmiy bo‘lim e’lonlari',
    subtitle: 'Grant tanlovlari, konferensiyalar va KPI topshirish muddatlari haqidagi rasmiy xabarlar.',
    empty: 'Ushbu bo‘limda hozircha e’lonlar yo‘q.',
    pinned: 'Muhim',
    internal: 'Ichki e’lon',
    deadline: 'Dedlayn',
    publishedAt: 'Chop etildi',
    categories: { ALL: 'Barchasi', GRANT: 'Grantlar', CONFERENCE: 'Konferensiyalar', DEADLINE: 'Muddatlar / KPI', NEWS: 'Ilmiy yangiliklar' },
  },
  ru: {
    title: 'Объявления научного отдела',
    subtitle: 'Официальные сообщения о грантах, конференциях и сроках KPI.',
    empty: 'В этом разделе пока нет объявлений.',
    pinned: 'Важно',
    internal: 'Внутреннее',
    deadline: 'Дедлайн',
    publishedAt: 'Опубликовано',
    categories: { ALL: 'Все', GRANT: 'Гранты', CONFERENCE: 'Конференции', DEADLINE: 'Сроки / KPI', NEWS: 'Научные новости' },
  },
  en: {
    title: 'Scientific Dept. Announcements',
    subtitle: 'Official updates on grants, conferences, and KPI submission deadlines.',
    empty: 'No announcements in this category yet.',
    pinned: 'Pinned',
    internal: 'Internal',
    deadline: 'Deadline',
    publishedAt: 'Published',
    categories: { ALL: 'All', GRANT: 'Grants', CONFERENCE: 'Conferences', DEADLINE: 'Deadlines / KPI', NEWS: 'Scientific News' },
  },
};

const CATEGORY_BADGE = {
  GRANT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONFERENCE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DEADLINE: 'bg-amber-50 text-amber-700 border-amber-200',
  NEWS: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ScholarAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [locale, setLocale] = useState('uz');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (match && DICT[match[1]]) setLocale(match[1]);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/announcements?category=${category}`)
      .then((r) => r.json())
      .then((d) => setItems(d.announcements || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const t = DICT[locale] || DICT.uz;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(t.categories).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                category === key
                  ? 'bg-[#0F294A] text-white border-[#0F294A]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-500">{t.empty}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs space-y-3 ${
                item.isPinned
                  ? 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-900/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">
                    <Pin className="w-3 h-3" /> {t.pinned}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                    CATEGORY_BADGE[item.category] || CATEGORY_BADGE.NEWS
                  }`}
                >
                  {t.categories[item.category] || item.category}
                </span>
                {item.visibility === 'INTERNAL' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                    <Eye className="w-3 h-3" /> {t.internal}
                  </span>
                )}
                {item.deadline && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 font-bold">
                    <Calendar className="w-3 h-3" />
                    {t.deadline}: {new Date(item.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>

              <div className="text-[11px] font-mono text-slate-400 pt-1">
                {t.publishedAt}: {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
