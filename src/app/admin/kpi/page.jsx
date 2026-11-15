'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';

export default function AdminKpiPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [targets, setTargets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scope, setScope] = useState('department'); // department | scholar
  const [departmentId, setDepartmentId] = useState('');
  const [scholarId, setScholarId] = useState('');
  const [targetPublications, setTargetPublications] = useState(5);
  const [targetScopusWos, setTargetScopusWos] = useState(2);
  const [targetScore, setTargetScore] = useState(40);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (y) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpi?year=${y}`);
      const json = await res.json();
      setTargets(json.targets || []);
      setDepartments(json.departments || []);
      setScholars(json.scholars || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          departmentId: scope === 'department' ? departmentId : null,
          scholarId: scope === 'scholar' ? scholarId : null,
          targetPublications,
          targetScopusWos,
          targetScore,
        }),
      });
      if (res.ok) {
        setDepartmentId('');
        setScholarId('');
        fetchData(year);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/kpi?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchData(year);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Yillik KPI Maqsadlari</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kafedralar va olimlar uchun yillik ilmiy samaradorlik rejalarini belgilash.
          </p>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>
              {y}-yil
            </option>
          ))}
        </select>
      </div>

      {/* Add KPI Target Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Target className="w-4 h-4 text-amber-500" />
          Yangi KPI maqsad qo‘shish
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Daraja</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            >
              <option value="department">Kafedra bo‘yicha</option>
              <option value="scholar">Alohida olim bo‘yicha</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {scope === 'department' ? 'Kafedra' : 'Olim'}
            </label>
            {scope === 'department' ? (
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="">Tanlang...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameUz} ({d.faculty?.code})
                  </option>
                ))}
              </select>
            ) : (
              <select
                required
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="">Tanlang...</option>
                {scholars.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Nashrlar / Scopus
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={targetPublications}
                onChange={(e) => setTargetPublications(e.target.value)}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                title="Jami nashrlar"
              />
              <input
                type="number"
                min="0"
                value={targetScopusWos}
                onChange={(e) => setTargetScopusWos(e.target.value)}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                title="Scopus / WoS"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">TIU Ball</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Qo‘shish
            </button>
          </div>
        </div>
      </form>

      {/* Targets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        ) : targets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {year}-yil uchun KPI maqsadlari kiritilmagan.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-6">Kafedra / Olim</th>
                <th className="py-3 px-4">Maqsad (Nashrlar)</th>
                <th className="py-3 px-4">Maqsad (Scopus/WoS)</th>
                <th className="py-3 px-4">Maqsad (TIU Ball)</th>
                <th className="py-3 px-6 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {targets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {t.scholar ? (
                      <>
                        {t.scholar.fullName}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          (Joriy ball: {t.scholar.tiuScore})
                        </span>
                      </>
                    ) : (
                      <span>{t.department?.nameUz || '—'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{t.targetPublications}</td>
                  <td className="py-3.5 px-4 font-mono">{t.targetScopusWos}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{t.targetScore}</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
