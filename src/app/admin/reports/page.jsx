'use client';

import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function AdminReportsPage() {
  const [scholars, setScholars] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultyId, setFacultyId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (facultyId) params.set('facultyId', facultyId);
    fetch(`/api/admin/reports?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        setScholars(json.scholars || []);
        if (json.faculties) setFaculties(json.faculties);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [facultyId]);

  const buildCsvUrl = (type) => {
    const params = new URLSearchParams({ format: 'csv', type });
    if (facultyId) params.set('facultyId', facultyId);
    return `/api/admin/reports?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hisobotlar va Eksport</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Olimlar reytingi va tasdiqlangan nashrlarni Excel (CSV) formatida yuklab olish.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">Barcha fakultetlar</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nameUz}
              </option>
            ))}
          </select>

          <a
            href={buildCsvUrl('scholars')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Olimlar (CSV)
          </a>

          <a
            href={buildCsvUrl('publications')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Nashrlar (CSV)
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">F.I.Sh.</th>
                  <th className="py-3 px-4">Kafedra</th>
                  <th className="py-3 px-3 text-center">Scopus/WoS</th>
                  <th className="py-3 px-3 text-center">OAK</th>
                  <th className="py-3 px-3 text-center">Jami nashr</th>
                  <th className="py-3 px-3 text-center">Iqtibos</th>
                  <th className="py-3 px-3 text-center">H-Index</th>
                  <th className="py-3 px-4 text-right">TIU Ball</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {scholars.map((s) => (
                  <tr key={s.rank + s.email} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500">{s.rank}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{s.department}</td>
                    <td className="py-3 px-3 text-center font-mono">{s.scopusWos}</td>
                    <td className="py-3 px-3 text-center font-mono">{s.oak}</td>
                    <td className="py-3 px-3 text-center font-mono">{s.totalPubs}</td>
                    <td className="py-3 px-3 text-center font-mono">{s.totalCitations}</td>
                    <td className="py-3 px-3 text-center font-mono">{s.hIndex}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      {s.tiuScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
