'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  UserCheck,
  ChevronRight,
  FileText,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const DEGREE_LABELS = {
  PHD: 'PhD (Falsafa doktori)',
  DSC: 'DSc (Fan doktori)',
  MASTER: 'Magistr',
  INDEPENDENT_RESEARCHER: 'Mustaqil izlanuvchi',
};

const STAGE_CONFIG = {
  A_DRAFT: { label: 'Qoralama', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  A_SUBMITTED_DEPARTMENT: { label: 'Kafedra ko‘rib chiqmoqda', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  A_DEPARTMENT_APPROVED: { label: 'Buyruq kutilmoqda', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  B_ACTIVE_RESEARCH: { label: 'Faol tadqiqot & Reja', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  C_PUBLICATIONS_READY: { label: 'Nashrlar talabi bajarilgan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  D_PRE_DEFENSE: { label: 'Himoya oldi (Checklist)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  E_COMPLETED: { label: 'Himoya qilingan (Tasdiqlangan)', color: 'bg-green-100 text-green-900 border-green-300' },
  ON_HOLD: { label: 'To‘xtatib turilgan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  TERMINATED: { label: 'To‘xtatilgan', color: 'bg-red-50 text-red-700 border-red-200' },
};

export default function SupervisionsPage() {
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    degreeType: 'PHD',
    specialtyCode: '',
    specialtyName: '',
    dissertationTitle: '',
    expectedDefenseDate: '',
    immediateSubmit: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/supervisions');
      const data = await res.json();
      if (data.supervisions) {
        setSupervisions(data.supervisions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.dissertationTitle) return;

    try {
      setCreating(true);
      const res = await fetch('/api/dashboard/supervisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          studentName: '',
          studentEmail: '',
          studentPhone: '',
          degreeType: 'PHD',
          specialtyCode: '',
          specialtyName: '',
          dissertationTitle: '',
          expectedDefenseDate: '',
          immediateSubmit: true,
        });
        loadData();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const [specialFilter, setSpecialFilter] = useState('ALL'); // ALL, OVERDUE, INACTIVE

  const filtered = supervisions.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.dissertationTitle.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialtyCode && s.specialtyCode.toLowerCase().includes(search.toLowerCase()));

    const matchStage = stageFilter === 'ALL' || s.stage === stageFilter;

    let matchSpecial = true;
    if (specialFilter === 'OVERDUE') matchSpecial = s.isOverdue;
    if (specialFilter === 'INACTIVE') matchSpecial = s.needsMeetingNotice;

    return matchSearch && matchStage && matchSpecial;
  });

  const totalCount = supervisions.length;
  const activeCount = supervisions.filter((s) =>
    ['A_SUBMITTED_DEPARTMENT', 'A_DEPARTMENT_APPROVED', 'B_ACTIVE_RESEARCH', 'C_PUBLICATIONS_READY', 'D_PRE_DEFENSE'].includes(s.stage)
  ).length;
  const completedCount = supervisions.filter((s) => s.stage === 'E_COMPLETED').length;
  const overdueCount = supervisions.filter((s) => s.isOverdue).length;
  const inactiveCount = supervisions.filter((s) => s.needsMeetingNotice).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <GraduationCap className="w-5 h-5" />
            <span>Akademik Salohiyat & Ilmiy Maktab</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ilmiy Rahbarligim</h1>
          <p className="text-slate-500 text-sm mt-1">
            Izlanuvchilar (PhD, DSc, Magistr) tadqiqotlari, muddatlari va himoya bosqichlarini yagona tizimda boshqaring.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Izlanuvchi Qo‘shish</span>
        </button>
      </div>

      {/* 5 Interactive Stat & Alert Cards (Supervisor Monitoring Cockpit) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('ALL'); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            specialFilter === 'ALL' && stageFilter === 'ALL'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Izlanuvchilar</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">barchasi ro‘yxati</div>
        </button>

        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('B_ACTIVE_RESEARCH'); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stageFilter === 'B_ACTIVE_RESEARCH'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Faol Jarayonda</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">tadqiqot va reja</div>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter(specialFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            specialFilter === 'OVERDUE'
              ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-500/30 shadow-xs'
              : overdueCount > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300 shadow-2xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center justify-between">
            <span>Muddati Yaqin/O‘tgan</span>
            {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{overdueCount}</div>
          <div className="text-[11px] text-rose-500/90 mt-1">
            {overdueCount > 0 ? 'tezkor e’tibor talab' : 'muddatlar joyida'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter(specialFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            specialFilter === 'INACTIVE'
              ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-500/30 shadow-xs'
              : inactiveCount > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300 shadow-2xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>Harakatsizlar</span>
            {inactiveCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-amber-600/90 mt-1">
            {inactiveCount > 0 ? '45+ kun uchrashuvsiz' : 'aloqa faol'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSpecialFilter('ALL'); setStageFilter('E_COMPLETED'); }}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 lg:col-span-1 ${
            stageFilter === 'E_COMPLETED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Himoya Qilgan</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">OAK tasdiqlangan</div>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Izlanuvchi F.I.SH yoki mavzu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Bosqich:</span>
          <div className="relative w-full md:w-64">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3.5 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="ALL">Barcha bosqichlar ({supervisions.length})</option>
              <option value="A_SUBMITTED_DEPARTMENT">Ko‘rib chiqilmoqda (Kafedra)</option>
              <option value="B_ACTIVE_RESEARCH">Faol tadqiqot & Reja</option>
              <option value="C_PUBLICATIONS_READY">Nashr talabi bajarilgan</option>
              <option value="D_PRE_DEFENSE">Himoya oldi (Checklist)</option>
              <option value="E_COMPLETED">Muvaffaqiyatli himoya qilingan</option>
              <option value="A_DRAFT">Qoralama arizalar</option>
              <option value="ON_HOLD">Muzlatilganlar</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Izlanuvchilar topilmadi</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Hozircha ilmiy rahbarligingizdagi shogirdlar kiritilmagan yoki qidiruv bo‘yicha natija yo‘q.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
          >
            Yangi shogird qo‘shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sup) => {
            const stageStyle = STAGE_CONFIG[sup.stage] || STAGE_CONFIG.A_DRAFT;
            return (
              <Link
                key={sup.id}
                href={`/dashboard/supervisions/${sup.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Bar: Degree Badge & Stage Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md">
                      {DEGREE_LABELS[sup.degreeType] || sup.degreeType}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${stageStyle.color}`}>
                      {stageStyle.label}
                    </span>
                  </div>

                  {/* Student Name & Thesis Topic */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {sup.studentName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {sup.dissertationTitle}
                  </p>

                  {/* Specialty Code */}
                  {sup.specialtyCode && (
                    <div className="text-xs text-slate-400 mt-2 font-mono">
                      Shifr: {sup.specialtyCode} {sup.specialtyName ? `— ${sup.specialtyName}` : ''}
                    </div>
                  )}

                  {/* Nearest Milestone / Alerts */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {sup.nearestMilestone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Eng yaqin muddat:</span>
                        </span>
                        <span
                          className={`font-medium ${
                            sup.isOverdue ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-700'
                          }`}
                        >
                          {sup.isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          {new Date(sup.nearestMilestone.dueDate).toLocaleDateString('uz-UZ')} ({sup.nearestMilestone.title})
                        </span>
                      </div>
                    )}

                    {sup.needsMeetingNotice && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>45+ kundan buyon ilmiy uchrashuv qayd etilmagan</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Action link to full card */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {sup.publicationsCount || 0} ta nashr
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {sup.reportsCount || 0} ta hisobot
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Jarayonni ko‘rish</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: New Mentee Application */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Yangi Izlanuvchi Qo‘shish (A Qism)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kafedra va ilmiy bo‘lim tasdig‘i uchun ariza shakli</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izlanuvchi F.I.SH *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Abdullayev Temur Olimovich"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daraja turi</label>
                  <select
                    value={formData.degreeType}
                    onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="PHD">PhD (Falsafa doktori)</option>
                    <option value="DSC">DSc (Fan doktori)</option>
                    <option value="MASTER">Magistr</option>
                    <option value="INDEPENDENT_RESEARCHER">Mustaqil izlanuvchi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ixtisoslik shifri</label>
                  <input
                    type="text"
                    placeholder="Masalan: 05.01.05"
                    value={formData.specialtyCode}
                    onChange={(e) => setFormData({ ...formData, specialtyCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dissertatsiya mavzusi *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Dissertatsiya yoki ilmiy ishning to‘liq tasdiqlangan mavzusi..."
                  value={formData.dissertationTitle}
                  onChange={(e) => setFormData({ ...formData, dissertationTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shogird Email</label>
                  <input
                    type="email"
                    placeholder="student@tiu.uz"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shogird Telefon</label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={formData.studentPhone}
                    onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejalashtirilgan himoya sanasi</label>
                <input
                  type="date"
                  value={formData.expectedDefenseDate}
                  onChange={(e) => setFormData({ ...formData, expectedDefenseDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Yuborilmoqda...' : 'Kafedraga Ariza Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
