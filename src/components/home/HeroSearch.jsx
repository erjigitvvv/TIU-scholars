'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, BookOpen } from 'lucide-react';

export default function HeroSearch({ placeholder, buttonLabel, scholarsLabel, pubsLabel }) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState('scholars'); // 'scholars' | 'publications'
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    const base = target === 'publications' ? '/publications' : '/scholars';
    router.push(trimmed ? `${base}?q=${encodeURIComponent(trimmed)}` : base);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {/* Search Target Toggle */}
      <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setTarget('scholars')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            target === 'scholars'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {scholarsLabel}
        </button>
        <button
          type="button"
          onClick={() => setTarget('publications')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            target === 'publications'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {pubsLabel}
        </button>
      </div>

      {/* Search Input */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex items-center gap-2"
      >
        <div className="flex-1 flex items-center px-3 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shrink-0"
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
