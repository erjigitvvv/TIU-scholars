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
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    title: 'Olimlar va ro‘yxatdan o‘tish arizalari',
    subtitle:
      'Yangi arizalarni to‘liq maʼlumotlari bilan tekshirish, tasdiqlash va akademik maʼlumotlarni boshqarish.',
    searchPlaceholder: 'Ism, email yoki kafedra...',
    tabPending: 'Kutilayotgan arizalar',
    tabAll: 'Barcha olimlar',
    loading: 'Yuklanmoqda...',
    empty: 'Tanlangan bo‘limda olimlar topilmadi.',
    colScholar: 'Olim & Email',
    colDepartment: 'Kafedra',
    colStatus: 'Holati',
    colDegree: 'Daraja / Unvon',
    colActions: 'Amallar',
    details: 'Batafsil',
    approve: 'Tasdiqlash',
    reject: 'Rad etish',
    suspend: 'Bloklash',
    activate: 'Faollashtirish',
    loginLabel: 'Login:',
    publicEmailLabel: 'Ommaviy email:',
    protectedTitle: 'Tizim tomonidan himoyalangan (Moderator o‘zgartira olmaydi)',
    tiuScore: 'TIU Ball',
    hIndex: 'H-Index',
    citations: 'Iqtiboslar',
    statusLabel: 'Holat',
    bioLabel: 'Bio:',
    editableTitle: 'Moderator tahrirlashi mumkin bo‘lgan akademik maʼlumotlar',
    departmentLabel: 'Kafedra',
    degreeLabel: 'Ilmiy daraja',
    titleLabel: 'Ilmiy unvon',
    positionLabel: 'Maʼmuriy lavozim (Oʻzbekcha)',
    positionPlaceholder: 'Masalan: Kafedra mudiri',
    roleLabel: 'Tizim Roli (Faqat Super Admin uchun)',
    approveApp: 'Arizani tasdiqlash',
    close: 'Yopish',
    save: 'Saqlash',
    rejectModalTitle: 'Arizani rad etish',
    rejectModalDesc: 'Olim qayta tuzatib yuborishi uchun rad etish sababini kiriting:',
    rejectPlaceholder: 'Masalan: Kafedra yoki ORCID maʼlumotlari tasdiqlanmadi...',
    cancel: 'Bekor qilish',
    confirmReject: 'Rad etishni tasdiqlash',
  },
  ru: {
    title: 'Учёные и заявки на регистрацию',
    subtitle:
      'Проверка новых заявок с полными данными, подтверждение и управление академической информацией.',
    searchPlaceholder: 'Имя, email или кафедра...',
    tabPending: 'Ожидающие заявки',
    tabAll: 'Все учёные',
    loading: 'Загрузка...',
    empty: 'В выбранном разделе учёные не найдены.',
    colScholar: 'Учёный и Email',
    colDepartment: 'Кафедра',
    colStatus: 'Статус',
    colDegree: 'Степень / Звание',
    colActions: 'Действия',
    details: 'Подробнее',
    approve: 'Одобрить',
    reject: 'Отклонить',
    suspend: 'Заблокировать',
    activate: 'Активировать',
    loginLabel: 'Логин:',
    publicEmailLabel: 'Публичный email:',
    protectedTitle: 'Защищено системой (Модератор не может изменить)',
    tiuScore: 'Балл TIU',
    hIndex: 'H-Index',
    citations: 'Цитирования',
    statusLabel: 'Статус',
    bioLabel: 'Био:',
    editableTitle: 'Академические данные, доступные модератору для редактирования',
    departmentLabel: 'Кафедра',
    degreeLabel: 'Учёная степень',
    titleLabel: 'Учёное звание',
    positionLabel: 'Административная должность (Узб.)',
    positionPlaceholder: 'Например: Заведующий кафедрой',
    roleLabel: 'Системная роль (Только для Super Admin)',
    approveApp: 'Одобрить заявку',
    close: 'Закрыть',
    save: 'Сохранить',
    rejectModalTitle: 'Отклонить заявку',
    rejectModalDesc: 'Укажите причину отклонения, чтобы учёный мог исправить данные и отправить снова:',
    rejectPlaceholder: 'Например: Кафедра или ORCID не подтверждены...',
    cancel: 'Отмена',
    confirmReject: 'Подтвердить отклонение',
  },
  en: {
    title: 'Scholars & Registration Applications',
    subtitle:
      'Review new applications with full details, approve accounts, and manage academic profiles.',
    searchPlaceholder: 'Name, email or department...',
    tabPending: 'Pending Applications',
    tabAll: 'All Scholars',
    loading: 'Loading...',
    empty: 'No scholars found in the selected section.',
    colScholar: 'Scholar & Email',
    colDepartment: 'Department',
    colStatus: 'Status',
    colDegree: 'Degree / Title',
    colActions: 'Actions',
    details: 'Details',
    approve: 'Approve',
    reject: 'Reject',
    suspend: 'Suspend',
    activate: 'Activate',
    loginLabel: 'Login:',
    publicEmailLabel: 'Public email:',
    protectedTitle: 'System-protected (Moderator cannot edit)',
    tiuScore: 'TIU Score',
    hIndex: 'H-Index',
    citations: 'Citations',
    statusLabel: 'Status',
    bioLabel: 'Bio:',
    editableTitle: 'Academic details editable by Moderator',
    departmentLabel: 'Department',
    degreeLabel: 'Academic Degree',
    titleLabel: 'Academic Title',
    positionLabel: 'Administrative Position (Uzbek)',
    positionPlaceholder: 'e.g., Head of Department',
    roleLabel: 'System Role (Super Admin only)',
    approveApp: 'Approve Application',
    close: 'Close',
    save: 'Save',
    rejectModalTitle: 'Reject Application',
    rejectModalDesc: 'Enter a rejection reason so the scholar can correct and resubmit:',
    rejectPlaceholder: 'e.g., Department or ORCID details could not be verified...',
    cancel: 'Cancel',
    confirmReject: 'Confirm Rejection',
  },
};

export default function AdminScholarsPage() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;

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

  const getDeptName = (d) =>
    locale === 'ru'
      ? d?.nameRu || d?.nameUz || d?.nameEn
      : locale === 'en'
      ? d?.nameEn || d?.nameUz
      : d?.nameUz || d?.nameEn;

  const allDepartments = faculties.flatMap((f) =>
    (f.departments || []).map((d) => ({
      ...d,
      facultyName:
        locale === 'ru'
          ? f.nameRu || f.nameUz
          : locale === 'en'
          ? f.nameEn || f.nameUz
          : f.nameUz,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
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
              {t.tabPending}
            </button>
            <button
              onClick={() => setTab('ALL')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.tabAll}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">{t.loading}</div>
        ) : filteredScholars.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">{t.colScholar}</th>
                  <th className="py-3 px-6">{t.colDepartment}</th>
                  <th className="py-3 px-6">{t.colStatus}</th>
                  <th className="py-3 px-6">{t.colDegree}</th>
                  <th className="py-3 px-6 text-right">{t.colActions}</th>
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
                      {getDeptName(s.department)}
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
                        {t.details}
                      </button>

                      {s.user?.accountStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(s.user.id, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.approve}
                          </button>
                          <button
                            onClick={() => setRejectModalUserId(s.user.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {t.reject}
                          </button>
                        </>
                      )}

                      {s.user?.accountStatus === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(s.user.id, 'SUSPENDED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {t.suspend}
                        </button>
                      )}

                      {(s.user?.accountStatus === 'SUSPENDED' ||
                        s.user?.accountStatus === 'REJECTED') && (
                        <button
                          onClick={() => handleStatusChange(s.user.id, 'ACTIVE')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {t.activate}
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
                    <Mail className="w-3.5 h-3.5" /> {t.loginLabel}{' '}
                    <b>{selectedScholar.user?.email}</b>
                  </span>
                  {selectedScholar.publicEmail && (
                    <span>
                      {t.publicEmailLabel} {selectedScholar.publicEmail}
                    </span>
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

            {/* Locked / Read-Only Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                {t.protectedTitle}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">{t.tiuScore}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.tiuScore}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t.hIndex}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.hIndex}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t.citations}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedScholar.totalCitations}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t.statusLabel}</span>
                  <span className="font-bold text-blue-700 dark:text-sky-400">
                    {selectedScholar.user?.accountStatus}
                  </span>
                </div>
              </div>
              {selectedScholar.bioUz && (
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <b>{t.bioLabel}</b> {selectedScholar.bioUz}
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

            {/* Editable Academic Fields */}
            <form onSubmit={handleSaveAcademicDetails} className="space-y-4">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                {t.editableTitle}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.departmentLabel}
                  </label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {allDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {getDeptName(d)} ({d.facultyName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.degreeLabel}
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
                    {t.titleLabel}
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
                    {t.positionLabel}
                  </label>
                  <input
                    type="text"
                    value={editForm.positionUz}
                    onChange={(e) => setEditForm({ ...editForm, positionUz: e.target.value })}
                    placeholder={t.positionPlaceholder}
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
                      {t.roleLabel}
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
                        {t.approveApp}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalUserId(selectedScholar.user.id);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold"
                      >
                        {t.reject}
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
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-xs font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" /> {t.save}
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
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {t.rejectModalTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.rejectModalDesc}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t.rejectPlaceholder}
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
                {t.cancel}
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() =>
                  handleStatusChange(rejectModalUserId, 'REJECTED', rejectionReason.trim())
                }
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg"
              >
                {t.confirmReject}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
