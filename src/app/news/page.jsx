'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Newspaper,
  Award,
  Calendar,
  Pin,
  Search,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  X,
  MessageSquare,
} from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    badge: 'TIU Ilmiy Hayoti',
    title: 'Ilmiy Yangiliklar, Yutuqlar va E’lonlar',
    subtitle:
      'Universitet olimlarining xalqaro yutuqlari, grant tanlovlari, ilmiy konferensiyalar va muhim muddatlar bilan tanishing.',
    searchPh: 'Yangilik yoki yutuq izlash...',
    all: 'Barchasi',
    catAchievement: 'Ilmiy yutuq',
    catNews: 'Ilmiy yangilik',
    catConference: 'Konferensiya',
    catGrant: 'Grant tanlovi',
    catDeadline: 'Muhim muddat',
    pinned: 'Muhim',
    deadlineLabel: 'Muddat:',
    readMore: 'Batafsil o‘qish',
    loading: 'Yuklanmoqda...',
    empty: 'Tanlangan bo‘limda hozircha yangiliklar yo‘q.',
    close: 'Yopish',
    qaTitle: 'Savol-javoblar',
    askLoginPrompt: 'Ushbu e’lon bo‘yicha savol berish yoki ariza yuborish uchun kabinetga kiring.',
    loginBtn: 'Kabinetga kirish',
  },
  ru: {
    badge: 'Научная жизнь TIU',
    title: 'Научные новости, достижения и объявления',
    subtitle:
      'Международные достижения учёных университета, конкурсы грантов, научные конференции и важные сроки.',
    searchPh: 'Поиск новостей или достижений...',
    all: 'Все',
    catAchievement: 'Научное достижение',
    catNews: 'Научная новость',
    catConference: 'Конференция',
    catGrant: 'Грантовый конкурс',
    catDeadline: 'Важный срок',
    pinned: 'Важно',
    deadlineLabel: 'Срок:',
    readMore: 'Подробнее',
    loading: 'Загрузка...',
    empty: 'В выбранном разделе пока нет новостей.',
    close: 'Закрыть',
    qaTitle: 'Вопросы и ответы',
    askLoginPrompt: 'Войдите в кабинет, чтобы задать вопрос или подать заявку по этому объявлению.',
    loginBtn: 'Войти в кабинет',
  },
  en: {
    badge: 'TIU Research Life',
    title: 'Scientific News, Achievements & Announcements',
    subtitle:
      'Explore international achievements of TIU scholars, open grant calls, scientific conferences, and key academic deadlines.',
    searchPh: 'Search news or achievements...',
    all: 'All',
    catAchievement: 'Achievement',
    catNews: 'Scientific News',
    catConference: 'Conference',
    catGrant: 'Grant Call',
    catDeadline: 'Deadline',
    pinned: 'Pinned',
    deadlineLabel: 'Deadline:',
    readMore: 'Read more',
    loading: 'Loading...',
    empty: 'No news items found in this category.',
    close: 'Close',
    qaTitle: 'Q&A',
    askLoginPrompt: 'Sign in to your scholar cabinet to ask questions or submit an inquiry on this announcement.',
    loginBtn: 'Sign In to Cabinet',
  },
};

const CAT_STYLES = {
  ACHIEVEMENT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  NEWS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-sky-300 dark:border-blue-800',
  CONFERENCE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  GRANT: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  DEADLINE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

function NewsContent() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'ALL';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setCategory(searchParams.get('category') || 'ALL');
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/announcements?category=ALL')
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data.announcements) ? data.announcements : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'ACHIEVEMENT':
        return t.catAchievement;
      case 'CONFERENCE':
        return t.catConference;
      case 'GRANT':
        return t.catGrant;
      case 'DEADLINE':
        return t.catDeadline;
      default:
        return t.catNews;
    }
  };

  const filtered = items.filter((item) => {
    const matchesCat = category === 'ALL' || item.category === category;
    const q = search.trim().toLowerCase();
    const matchesQ =
      !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const categories = [
    { id: 'ALL', label: t.all },
    { id: 'ACHIEVEMENT', label: t.catAchievement },
    { id: 'NEWS', label: t.catNews },
    { id: 'CONFERENCE', label: t.catConference },
    { id: 'GRANT', label: t.catGrant },
    { id: 'DEADLINE', label: t.catDeadline },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-sky-800 text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{t.subtitle}</p>
      </div>

      {/* Filters & Search */}
      <div className="neu-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === c.id
                  ? 'bg-[#0F294A] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPh}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm">{t.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="neu-card p-16 rounded-3xl text-center space-y-2 text-slate-500">
          <Newspaper className="w-10 h-10 mx-auto text-slate-400" />
          <p className="text-sm font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="neu-card-sm rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      CAT_STYLES[item.category] || CAT_STYLES.NEWS
                    }`}
                  >
                    {item.category === 'ACHIEVEMENT' ? (
                      <Award className="w-3 h-3" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                    {getCategoryLabel(item.category)}
                  </span>

                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Pin className="w-3 h-3" /> {t.pinned}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {item.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <span>{t.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    CAT_STYLES[selectedItem.category] || CAT_STYLES.NEWS
                  }`}
                >
                  {getCategoryLabel(selectedItem.category)}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedItem.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </span>
                  {selectedItem.deadline && (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {t.deadlineLabel} {new Date(selectedItem.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {selectedItem.content}
            </div>

            {selectedItem.inquiries?.filter((q) => q.answerText).length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.qaTitle}</span>
                </div>
                {selectedItem.inquiries
                  .filter((q) => q.answerText)
                  .map((q) => (
                    <div key={q.id} className="text-xs space-y-1 border-t border-slate-200/70 pt-2">
                      <div className="font-semibold text-slate-800 dark:text-white">{q.questionText}</div>
                      <div className="text-slate-600 dark:text-slate-300">{q.answerText}</div>
                    </div>
                  ))}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-blue-900 dark:text-blue-200">{t.askLoginPrompt}</p>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#0F294A] text-white text-xs font-bold shrink-0 text-center"
              >
                {t.loginBtn}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicNewsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500">Yuklanmoqda...</div>}>
      <NewsContent />
    </Suspense>
  );
}
