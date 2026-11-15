'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  BookOpen,
  Award,
  ArrowRight,
  Clock,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.counts) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Ma’lumotlarni yuklashda xatolik.</div>;
  }

  const { counts, facultyStats, recentAudits } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ilmiy Bo‘lim Boshqaruv Paneli</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Moderatsiya navbati, olimlar faolligi va fakultetlar kesimida tezkor tahlil.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/moderation"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Moderatsiya navbati
            </span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-900">
            {counts.totalPendingQueue}
          </div>
          <div className="text-xs text-slate-500">
            Nashr: {counts.pendingPublications} · Grant: {counts.pendingGrants} · Shogird:{' '}
            {counts.pendingSupervisions}
          </div>
        </Link>

        <Link
          href="/admin/scholars"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Kutilayotgan arizalar
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-blue-700">
            {counts.pendingScholars}
          </div>
          <div className="text-xs text-slate-500">
            Faol olimlar: {counts.activeScholars} nafar
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Tasdiqlangan nashrlar
            </span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-emerald-700">
            {counts.approvedPublications}
          </div>
          <div className="text-xs text-slate-500">
            Scopus / WoS: {counts.scopusWosCount} ta
          </div>
        </div>

        <Link
          href="/admin/reports"
          className="p-5 rounded-2xl bg-[#0F294A] text-white shadow-xs hover:bg-blue-900 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase">
              Hisobot & Eksport
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold pt-1 flex items-center gap-2">
            Excel / CSV yuklash <ArrowRight className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-200">Fakultet va olimlar kesimida</div>
        </Link>
      </div>

      {/* Faculty Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Fakultetlar kesimidagi ko‘rsatkichlar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-6">Fakultet</th>
                <th className="py-3 px-4">Kafedralar</th>
                <th className="py-3 px-4">Faol olimlar</th>
                <th className="py-3 px-4">Nashrlar</th>
                <th className="py-3 px-6 text-right">O‘rtacha TIU Ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {facultyStats.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{f.nameUz}</td>
                  <td className="py-3.5 px-4 font-mono">{f.departmentsCount}</td>
                  <td className="py-3.5 px-4 font-mono">{f.scholarsCount}</td>
                  <td className="py-3.5 px-4 font-mono">{f.publicationsCount}</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-700 text-right">
                    {f.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">Oxirgi moderatsiya va tizim amallari</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentAudits.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 text-center">Hozircha amallar yo‘q.</div>
          ) : (
            recentAudits.map((log) => (
              <div
                key={log.id}
                className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-600">{log.actor?.email || 'System'}</span>
                </div>
                <span className="font-mono text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
