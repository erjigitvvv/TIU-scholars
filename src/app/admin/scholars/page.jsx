'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  UserCheck,
  Search,
  Eye,
  Lock,
  Mail,
  Calendar,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';

export default function AdminScholarsPage() {
  const [scholars, setScholars] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [currentRole, setCurrentRole] = useState('MODERATOR');
  const [tab, setTab] = useState('PENDING'); // PENDING or ALL
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalUserId, setRejectModalUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchScholars = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ includeFaculties: '1' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/scholars?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data.scholars)) {
        setScholars(data.scholars);
        if (data.faculties) setFaculties(data.faculties);
        if (data.currentRole) setCurrentRole(data.currentRole);
      } else if (Array.isArray(data)) {
        setScholars(data);
      }
    } catch (err) {
      console.error('Failed to fetch scholars', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchScholars(tab === 'PENDING' ? 'PENDING' : null);
    });
  }, [tab, fetchScholars]);

  const openDetailModal = (s) => {
    setSelectedScholar(s);
    setEditForm({
      departmentId: s.departmentId || '',
      academicDegree: s.academicDegree || 'NONE',
      academicTitle: s.academicTitle || 'NONE',
      positionUz: s.positionUz || '',
      orcidId: s.orcidId || '',
      scopusId: s.scopusId || '',
      role: s.user?.role || 'SCHOLAR',
    });
  };

  const handleStatusChange = async (userId, accountStatus, reason = null) => {
    try {
      const res = await fetch('/api/admin/scholars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accountStatus, rejectionReason: reason }),
      });
      if (res.ok) {
        setRejectModalUserId(null);
        setRejectionReason('');
        setSelectedScholar(null);
        fetchScholars(tab === 'PENDING' ? 'PENDING' : null);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveAcademicDetails = async (e) => {
    e.preventDefault();
    if (!selectedScholar?.user?.id) return;
    setSavingEdit(true);
    try {
      const payload = {
        userId: selectedScholar.user.id,
        departmentId: editForm.departmentId,
        academicDegree: editForm.academicDegree,
        academicTitle: editForm.academicTitle,
        positionUz: editForm.positionUz,
        orcidId: editForm.orcidId,
        scopusId: editForm.scopusId,
        ...(currentRole === 'SUPER_ADMIN' ? { role: editForm.role } : {}),
      };
      const res = await fetch('/api/admin/scholars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSelectedScholar(null);
        fetchScholars(tab === 'PENDING' ? 'PENDING' : null);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredScholars = scholars.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.user?.email || '').toLowerCase().includes(q) ||
      (s.publicEmail || '').toLowerCase().includes(q) ||
      (s.department?.nameUz || '').toLowerCase().includes(q) ||
      (s.department?.nameEn || '').toLowerCase().includes(q)
    );
  });

  const allDepartments = faculties.flatMap((f) =>
    (f.departments || []).map((d) => ({ ...d, facultyName: f.nameUz }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Olimlar va ro‘yxatdan o‘tish arizalari
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Yangi arizalarni to‘liq maʼlumotlari bilan tekshirish, tasdiqlash va akademik maʼlumotlarni boshqarish.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, email yoki kafedra..."
              className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTab('PENDING')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'PENDING'
                  ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Kutilayotgan arizalar
            </button>
            <button
              onClick={() => setTab('ALL')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Barcha olimlar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        ) : filteredScholars.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Tanlangan bo‘limda olimlar topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Olim & Email</th>
                  <th className="py-3 px-6">Kafedra</th>
                  <th className="py-3 px-6">Holati</th>
                  <th className="py-3 px-6">Daraja / Unvon</th>
                  <th className="py-3 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredScholars.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{s.fullName}</div>
                      <div className="text-xs text-slate-500">{s.user?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      {s.department?.nameUz || s.department?.nameEn}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.user?.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.user?.accountStatus === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {s.user?.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.academicDegree}
                      </span>{' '}
                      / {s.academicTitle}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openDetailModal(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Batafsil
                      </button>

                      {s.user?.accountStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(s.user.id, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => setRejectModalUserId(s.user.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rad etish
                          </button>
                        </>
                      )}

                      {s.user?.accountStatus === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(s.user.id, 'SUSPENDED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Bloklash
                        </button>
                      )}

                      {(s.user?.accountStatus === 'SUSPENDED' ||
                        s.user?.accountStatus === 'REJECTED') && (
                        <button
                          onClick={() => handleStatusChange(s.user.id, 'ACTIVE')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Faollashtirish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scholar Full Details & Governance Edit Modal */}
      {selectedScholar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedScholar.fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Login: <b>{selectedScholar.user?.email}</b>
                  </span>
                  {selectedScholar.publicEmail && (
                    <span>Ommaviy email: {selectedScholar.publicEmail}</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedScholar.user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedScholar(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Locked / Read-Only Info (Moderator CANNOT edit directly) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Tizim tomonidan himoyalangan (Moderator o‘zgartira olmaydi)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">TIU Ball</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.tiuScore}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">H-Index</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.hIndex}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Iqtiboslar</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.totalCitations}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Holat</span>
                  <span className="font-bold text-blue-700 dark:text-sky-400">
                    {selectedScholar.user?.accountStatus}
                  </span>
                </div>
              </div>
              {selectedScholar.bioUz && (
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <b>Bio:</b> {selectedScholar.bioUz}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedScholar.googleScholarUrl && (
                  <a
                    href={selectedScholar.googleScholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    Google Scholar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedScholar.linkedinUrl && (
                  <a
                    href={selectedScholar.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:underline"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Editable Academic Fields (Moderator CAN edit) */}
            <form onSubmit={handleSaveAcademicDetails} className="space-y-4">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                Moderator tahrirlashi mumkin bo‘lgan akademik maʼlumotlar
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Kafedra
                  </label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {allDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameUz} ({d.facultyName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ilmiy daraja
                  </label>
                  <select
                    value={editForm.academicDegree}
                    onChange={(e) => setEditForm({ ...editForm, academicDegree: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="NONE">NONE</option>
                    <option value="PHD">PHD</option>
                    <option value="DSC">DSC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ilmiy unvon
                  </label>
                  <select
                    value={editForm.academicTitle}
                    onChange={(e) => setEditForm({ ...editForm, academicTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="NONE">NONE</option>
                    <option value="ASSISTANT">ASSISTANT</option>
                    <option value="DOCENT">DOCENT</option>
                    <option value="PROFESSOR">PROFESSOR</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Maʼmuriy lavozim (Oʻzbekcha)
                  </label>
                  <input
                    type="text"
                    value={editForm.positionUz}
                    onChange={(e) => setEditForm({ ...editForm, positionUz: e.target.value })}
                    placeholder="Masalan: Kafedra mudiri"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    ORCID ID
                  </label>
                  <input
                    type="text"
                    value={editForm.orcidId}
                    onChange={(e) => setEditForm({ ...editForm, orcidId: e.target.value })}
                    placeholder="0000-0000-0000-0000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Scopus Author ID
                  </label>
                  <input
                    type="text"
                    value={editForm.scopusId}
                    onChange={(e) => setEditForm({ ...editForm, scopusId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                {currentRole === 'SUPER_ADMIN' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-purple-700 dark:text-purple-300 mb-1">
                      Tizim Roli (Faqat Super Admin uchun)
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700 rounded-xl"
                    >
                      <option value="SCHOLAR">SCHOLAR</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  {selectedScholar.user?.accountStatus === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedScholar.user.id, 'ACTIVE')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Arizani tasdiqlash
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalUserId(selectedScholar.user.id);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold"
                      >
                        Rad etish
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedScholar(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Yopish
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-xs font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" /> Saqlash
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalUserId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Arizani rad etish</h3>
            <p className="text-xs text-slate-500">
              Olim qayta tuzatib yuborishi uchun rad etish sababini kiriting:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masalan: Kafedra yoki ORCID maʼlumotlari tasdiqlanmadi..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalUserId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() =>
                  handleStatusChange(rejectModalUserId, 'REJECTED', rejectionReason.trim())
                }
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg"
              >
                Rad etishni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
