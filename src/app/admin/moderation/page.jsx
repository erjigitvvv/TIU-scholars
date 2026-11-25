'use client';

import { useLocale } from '@/lib/useLocale';
import { useState, useEffect, useCallback, startTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  History,
  ChevronDown,
  Filter,
  Eye,
  Lock,
  BookOpen,
  Users,
  Award,
  X,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';

const DICT = {
  uz: {
    title: 'Moderatsiya navbati',
    subtitle: 'Nashrlar, grantlar, ilmiy loyihalar va ilmiy rahbarliklarni tekshirish, kvartilni aniqlashtirish va tasdiqlash.',
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    rejected: 'Rad etilgan',
    publications: 'Nashrlar',
    academicProjects: 'Ilmiy Loyihalar',
    grants: 'Grantlar',
    supervisions: 'Shogirdlar',
    loading: 'Yuklanmoqda...',
    emptyTitle: 'Ro‘yxat bo‘sh!',
    emptyDesc: 'Tanlangan holat bo‘yicha elementlar topilmadi.',
    openPdf: 'PDF faylni ochish',
    link: 'Havola',
    authors: 'Mualliflar:',
    submittedBy: 'Yubordi:',
    type: 'Tur:',
    quartile: 'Kvartil:',
    citations: 'Iqtibos:',
    grantProject: 'Grant loyihasi',
    role: 'Roli:',
    present: 'Hozirgacha',
    scholar: 'Olim:',
    supervisionSuffix: 'Rahbarlik',
    student: 'Shogird:',
    supervisor: 'Ilmiy rahbar:',
    rejectReasonLabel: 'Rad etish sababi:',
    approve: 'Tasdiqlash',
    reject: 'Rad etish',
    rejectModalTitle: 'Rad etish sababi',
    rejectModalDesc: 'Olim tuzatib qayta yuborishi uchun aniq sababni kiriting yoki tayyor shablonni tanlang.',
    reasonPlaceholder: 'Sababni kiriting...',
    cancel: 'Bekor qilish',
    confirmReject: 'Rad etishni tasdiqlash',
    rejectTemplates: [
      'DOI yoki bibliografik havola tasdiqlanmadi',
      'PDF fayl sifatsiz yoki mos emas',
      'Kvartil va jurnal indeksi noto‘g‘ri ko‘rsatilgan',
      'Mualliflik ulushi yoki affilatsiya TIU ga mos emas',
    ],
    inspect: 'Jarayonni ko‘rish',
    viewerModeTitle: 'Ko‘ruvchi Rejimi (Viewer Only)',
    viewerNotice: 'Siz olimning ilmiy ish jarayonini audit qilmoqdasiz. Matn va ilmiy tarkibni to‘g‘ridan-to‘g‘ri tahrirlash huquqi cheklangan. Faqat to‘liq audit qilish, tasdiqlash yoki rad etish vakolatingiz mavjud.',
    close: 'Yopish',
    sectionsTitle: 'IMRAD Bo‘limlari & Maqola Matni',
    collaboratorsTitle: 'Hammualliflar & Hissalar',
    abstractTitle: 'Annotatsiya & Kalit so‘zlar',
    noSections: 'Hozircha bo‘limlar kiritilmagan.',
    noCollaborators: 'Hammualliflar ro‘yxati mavjud emas.',
  },
  ru: {
    title: 'Очередь модерации',
    subtitle: 'Проверка публикаций, грантов, научных проектов и научного руководства, уточнение квартиля и утверждение.',
    pending: 'Ожидается',
    approved: 'Утверждено',
    rejected: 'Отклонено',
    publications: 'Публикации',
    academicProjects: 'Научные проекты',
    grants: 'Гранты',
    supervisions: 'Ученики',
    loading: 'Загрузка...',
    emptyTitle: 'Список пуст!',
    emptyDesc: 'Элементы по выбранному статусу не найдены.',
    openPdf: 'Открыть PDF',
    link: 'Ссылка',
    authors: 'Авторы:',
    submittedBy: 'Отправил:',
    type: 'Тип:',
    quartile: 'Квартиль:',
    citations: 'Цитирования:',
    grantProject: 'Грантовый проект',
    role: 'Роль:',
    present: 'По наст. время',
    scholar: 'Учёный:',
    supervisionSuffix: 'Руководство',
    student: 'Ученик:',
    supervisor: 'Научный руководитель:',
    rejectReasonLabel: 'Причина отклонения:',
    approve: 'Утвердить',
    reject: 'Отклонить',
    rejectModalTitle: 'Причина отклонения',
    rejectModalDesc: 'Укажите точную причину или выберите шаблон для исправления учёным.',
    reasonPlaceholder: 'Введите причину...',
    cancel: 'Отмена',
    confirmReject: 'Подтвердить отклонение',
    rejectTemplates: [
      'DOI или библиографическая ссылка не подтверждены',
      'PDF-файл низкого качества или не соответствует',
      'Квартиль и индекс журнала указаны неверно',
      'Аффилиация не соответствует TIU',
    ],
    inspect: 'Просмотр процесса',
    viewerModeTitle: 'Режим наблюдателя (Viewer Only)',
    viewerNotice: 'Вы проводите аудит научного процесса учёного. Прямое редактирование рукописи ограничено. Вы обладаете правами аудита, утверждения или отклонения.',
    close: 'Закрыть',
    sectionsTitle: 'Разделы IMRAD и рукопись статьи',
    collaboratorsTitle: 'Соавторы и доли участия',
    abstractTitle: 'Аннотация и ключевые слова',
    noSections: 'Разделы пока не заполнены.',
    noCollaborators: 'Соавторы не указаны.',
  },
  en: {
    title: 'Moderation Queue',
    subtitle: 'Review publications, grants, academic projects, and supervisions, verify quartiles, and approve submissions.',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    publications: 'Publications',
    academicProjects: 'Academic Projects',
    grants: 'Grants',
    supervisions: 'Supervisions',
    loading: 'Loading...',
    emptyTitle: 'Queue is empty!',
    emptyDesc: 'No items found for the selected status.',
    openPdf: 'Open PDF',
    link: 'Link',
    authors: 'Authors:',
    submittedBy: 'Submitted by:',
    type: 'Type:',
    quartile: 'Quartile:',
    citations: 'Citations:',
    grantProject: 'Grant Project',
    role: 'Role:',
    present: 'Present',
    scholar: 'Scholar:',
    supervisionSuffix: 'Supervision',
    student: 'Student:',
    supervisor: 'Supervisor:',
    rejectReasonLabel: 'Rejection reason:',
    approve: 'Approve',
    reject: 'Reject',
    rejectModalTitle: 'Rejection Reason',
    rejectModalDesc: 'Enter a clear reason or pick a template so the scholar can fix and resubmit.',
    reasonPlaceholder: 'Enter reason...',
    cancel: 'Cancel',
    confirmReject: 'Confirm Rejection',
    rejectTemplates: [
      'DOI or bibliographic link could not be verified',
      'PDF file is unreadable or mismatched',
      'Journal quartile or index is incorrect',
      'Affiliation does not match TIU',
    ],
    inspect: 'Inspect Process',
    viewerModeTitle: 'Viewer Only Mode',
    viewerNotice: 'You are auditing the scholar’s research workflow. Direct modification of manuscripts is restricted. You have authority to audit, approve, or reject submissions.',
    close: 'Close',
    sectionsTitle: 'IMRAD Sections & Manuscript',
    collaboratorsTitle: 'Co-Authors & Contributions',
    abstractTitle: 'Abstract & Keywords',
    noSections: 'No content sections provided yet.',
    noCollaborators: 'No collaborators listed.',
  },
};

function parseProposalSummary(proposalData) {
  if (!proposalData) return '';
  if (typeof proposalData !== 'string') {
    return proposalData.urgency || proposalData.comment || JSON.stringify(proposalData);
  }
  const trimmed = proposalData.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.urgency || parsed.objectives || parsed.comment || trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export default function AdminModerationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">Yuklanmoqda...</div>}>
      <AdminModerationInner />
    </Suspense>
  );
}

function AdminModerationInner() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;
  const searchParams = useSearchParams();

  const [tab, setTab] = useState('publications'); // publications | academic-projects | grants | supervisions
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ publications: 0, academicProjects: 0, grants: 0, supervisions: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectionItem, setInspectionItem] = useState(null);
  const [edits, setEdits] = useState({}); // { [id]: { pubType, quartile, citationsCount } }

  const fetchItems = useCallback(async (currentTab, currentStatus) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/moderation?type=${currentTab}&status=${currentStatus}`
      );
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (Array.isArray(data)) {
        setItems(data);
      }
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch moderation items', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType && ['publications', 'academic-projects', 'grants', 'supervisions'].includes(urlType)) {
      startTransition(() => {
        setTab(urlType);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    startTransition(() => {
      fetchItems(tab, statusFilter);
    });
  }, [tab, statusFilter, fetchItems]);

  const getEdit = (item) =>
    edits[item.id] || {
      pubType: item.type || 'SCOPUS',
      quartile: item.quartile || 'NONE',
      citationsCount: item.citationsCount ?? 0,
    };

  const setEditField = (item, field, value) => {
    const cur = getEdit(item);
    setEdits((prev) => ({
      ...prev,
      [item.id]: { ...cur, [field]: value },
    }));
  };

  const handleAction = async (item, status, reason = null) => {
    try {
      const payload = {
        id: item.id,
        type: tab,
        status,
        rejectionReason: reason,
      };
      if (tab === 'publications' && status === 'APPROVED') {
        const e = getEdit(item);
        payload.pubType = e.pubType;
        payload.quartile = e.quartile;
        payload.citationsCount = e.citationsCount;
      }

      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setRejectModalItem(null);
        setRejectionReason('');
        fetchItems(tab, statusFilter);
      }
    } catch (err) {
      console.error('Moderation action failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">{t.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="PENDING">{t.pending}</option>
            <option value="APPROVED">{t.approved}</option>
            <option value="REJECTED">{t.rejected}</option>
          </select>

          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="publications">{t.publications}</option>
            <option value="academic-projects">{t.academicProjects}</option>
            <option value="grants">{t.grants}</option>
            <option value="supervisions">{t.supervisions}</option>
          </select>
        </div>
      </div>

      {/* Interactive Tab Pills with Pending Badge Counts */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'publications', label: t.publications, count: counts.publications || 0 },
          { id: 'academic-projects', label: t.academicProjects, count: counts.academicProjects || 0 },
          { id: 'grants', label: t.grants, count: counts.grants || 0 },
          { id: 'supervisions', label: t.supervisions, count: counts.supervisions || 0 },
        ].map((pill) => {
          const isSel = tab === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setTab(pill.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSel
                  ? 'bg-[#0F294A] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-extrabold ${
                  isSel
                    ? 'bg-white/20 text-white'
                    : pill.count > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
            <h3 className="text-base font-bold text-slate-800">{t.emptyTitle}</h3>
            <p className="text-sm text-slate-500 mt-1">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const e = tab === 'publications' ? getEdit(item) : null;
              const isLocalPdf = item.url && item.url.startsWith('/uploads/');
              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    {tab === 'publications' && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold">
                            {item.type}
                          </span>
                          {item.quartile && item.quartile !== 'NONE' && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                              {item.quartile}
                            </span>
                          )}
                          <span className="font-mono text-xs text-slate-500 font-medium">
                            {item.year}
                          </span>
                          {item.doi && (
                            <a
                              href={`https://doi.org/${item.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-mono"
                            >
                              DOI: {item.doi} <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100"
                            >
                              <FileText className="w-3 h-3" />
                              {isLocalPdf ? t.openPdf : t.link}
                            </a>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.journalOrPublisher}</p>
                        <div className="text-xs text-slate-500">
                          {t.authors}{' '}
                          <span className="font-semibold text-slate-700">
                            {item.authors?.map((a) => a.scholar?.fullName).join(', ')}
                          </span>
                          {' • '}{t.submittedBy} {item.submittedBy?.email}
                        </div>

                        {statusFilter === 'PENDING' && (
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                              {t.type}
                              <select
                                value={e.pubType}
                                onChange={(ev) => setEditField(item, 'pubType', ev.target.value)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                              >
                                <option value="SCOPUS">SCOPUS</option>
                                <option value="WOS">WOS</option>
                                <option value="OAK">OAK</option>
                                <option value="INTERNATIONAL_JOURNAL">INTERNATIONAL_JOURNAL</option>
                                <option value="LOCAL_JOURNAL">LOCAL_JOURNAL</option>
                                <option value="CONFERENCE">CONFERENCE</option>
                                <option value="MONOGRAPH">MONOGRAPH</option>
                                <option value="TEXTBOOK">TEXTBOOK</option>
                                <option value="PATENT">PATENT</option>
                              </select>
                            </label>
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                              {t.quartile}
                              <select
                                value={e.quartile}
                                onChange={(ev) => setEditField(item, 'quartile', ev.target.value)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                              >
                                <option value="NONE">NONE</option>
                                <option value="Q1">Q1</option>
                                <option value="Q2">Q2</option>
                                <option value="Q3">Q3</option>
                                <option value="Q4">Q4</option>
                              </select>
                            </label>
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                              {t.citations}
                              <input
                                type="number"
                                min="0"
                                value={e.citationsCount}
                                onChange={(ev) =>
                                  setEditField(item, 'citationsCount', ev.target.value)
                                }
                                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                              />
                            </label>
                          </div>
                        )}
                      </>
                    )}

                    {tab === 'grants' && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold">
                            {t.grantProject}
                          </span>
                          {item.grantCode && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-mono font-bold">
                              {item.grantCode}
                            </span>
                          )}
                          {item.budgetRequested && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-mono font-bold">
                              {item.budgetRequested.toLocaleString()} so‘m
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">
                          {item.fundingSource} • {t.role} {item.role} ({item.startYear}–
                          {item.endYear || t.present})
                        </p>
                        <div className="text-xs text-slate-500">
                          {t.scholar}{' '}
                          <span className="font-semibold text-slate-700">
                            {item.scholar?.fullName}
                          </span>
                          {item.scholar?.department?.nameUz && (
                            <span> • {item.scholar.department.nameUz}</span>
                          )}
                        </div>

                        {item.proposalData && (
                          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-200">
                            <span className="font-bold text-slate-800">Ariza izohi / mazmuni:</span>
                            <p className="whitespace-pre-line text-slate-600 line-clamp-3">
                              {parseProposalSummary(item.proposalData)}
                            </p>
                          </div>
                        )}

                        {item.applicationFileUrl && (
                          <div className="pt-1">
                            <a
                              href={item.applicationFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition shadow-2xs"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>📄 Biriktirilgan Ariza Hujjati ({item.applicationFileName || 'Yuklab olish'})</span>
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {tab === 'supervisions' && (
                      <>
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold">
                          {item.degreeType} {t.supervisionSuffix} ({item.year})
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {t.student} {item.studentName}
                        </h3>
                        <p className="text-sm text-slate-600">{item.dissertationTitle}</p>
                        <div className="text-xs text-slate-500">
                          {t.supervisor}{' '}
                          <span className="font-semibold text-slate-700">
                            {item.scholar?.fullName}
                          </span>
                        </div>
                      </>
                    )}

                    {tab === 'academic-projects' && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-bold">
                            {item.type}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-mono font-bold">
                            {item.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                              item.status === 'APPROVED' || item.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <div className="text-xs text-slate-500">
                          Muallif:{' '}
                          <strong className="text-slate-700">
                            {item.creator?.scholarProfile?.fullName || item.creator?.email}
                          </strong>
                          {item.creator?.scholarProfile?.department?.nameUz && (
                            <span> • {item.creator.scholarProfile.department.nameUz}</span>
                          )}
                        </div>
                        {(item.targetJournal || item.targetConference || item.grantFunder) && (
                          <p className="text-xs text-slate-600">
                            Maqsadli joy:{' '}
                            <span className="font-semibold">
                              {item.targetJournal || item.targetConference || item.grantFunder}
                            </span>
                          </p>
                        )}
                        {item.abstract && (
                          <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            &ldquo;{item.abstract}&rdquo;
                          </p>
                        )}
                        {item.collaborators && item.collaborators.length > 0 && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>
                              Hammualliflar: <strong>{item.collaborators.length} nafar</strong>
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg inline-block">
                        {t.rejectReasonLabel} {item.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectionItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition border border-slate-200/80 cursor-pointer"
                      title={t.inspect}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.inspect}</span>
                    </button>

                    {statusFilter === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction(item, 'APPROVED')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {t.approve}
                        </button>
                        <button
                          onClick={() => setRejectModalItem(item)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          {t.reject}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Read-Only Research Process Inspection Modal */}
      {inspectionItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                    {tab === 'academic-projects' ? (inspectionItem.type || 'ILMIY LOYIHA') : tab === 'grants' ? 'GRANT LOYIHASI' : tab === 'publications' ? (inspectionItem.type || 'NASHR') : 'SHOGIRD / RAHBARLIK'}
                  </span>
                  {inspectionItem.code && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {inspectionItem.code}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    inspectionItem.status === 'APPROVED' || inspectionItem.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inspectionItem.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inspectionItem.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {inspectionItem.title || inspectionItem.dissertationTitle || `${inspectionItem.studentName} dissertatsiyasi`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectionItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Restriction Banner */}
            <div className="px-6 py-2.5 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2.5 text-[11px] text-amber-800 dark:text-amber-300 font-bold shrink-0">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t.viewerNotice}</span>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Creator / Scholar Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Muallif / Izlanuvchi:</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {inspectionItem.creator?.scholarProfile?.fullName || inspectionItem.scholar?.fullName || inspectionItem.studentName || 'TIU Izlanuvchisi'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {inspectionItem.creator?.email || inspectionItem.scholar?.department?.nameUz || inspectionItem.studentEmail || ''}
                  </div>
                </div>
                {inspectionItem.budgetRequested && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">So‘ralgan Byudjet:</div>
                    <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {inspectionItem.budgetRequested.toLocaleString()} so‘m
                    </div>
                  </div>
                )}
                {inspectionItem.budgetTotal && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loyiha Byudjeti:</div>
                    <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {inspectionItem.budgetTotal.toLocaleString()} so‘m
                    </div>
                  </div>
                )}
              </div>

              {/* Abstract / Annotatsiya */}
              {(inspectionItem.abstract || inspectionItem.keywords) && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{t.abstractTitle}</span>
                  </h4>
                  {inspectionItem.abstract && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                      {inspectionItem.abstract}
                    </div>
                  )}
                  {inspectionItem.keywords && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-bold text-slate-500 text-[11px]">Kalit so‘zlar:</span>
                      {inspectionItem.keywords.split(',').map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-100 dark:border-blue-900">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IMRAD Content Blocks for Academic Projects */}
              {tab === 'academic-projects' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>{t.sectionsTitle}</span>
                  </h4>
                  {(() => {
                    let blocks = {};
                    try {
                      if (inspectionItem.contentBlocks) {
                        blocks = typeof inspectionItem.contentBlocks === 'string'
                          ? JSON.parse(inspectionItem.contentBlocks)
                          : inspectionItem.contentBlocks;
                      }
                    } catch {}

                    const blockKeys = Object.keys(blocks).filter(k => blocks[k]);
                    if (blockKeys.length === 0) {
                      return (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 font-medium">
                          {t.noSections}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {blockKeys.map((key) => (
                          <div key={key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                            <div className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              {key}
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-serif">
                              {blocks[key]}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Collaborators List */}
              {tab === 'academic-projects' && inspectionItem.collaborators && inspectionItem.collaborators.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{t.collaboratorsTitle} ({inspectionItem.collaborators.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {inspectionItem.collaborators.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {c.scholarName || c.scholarEmail}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-blue-600">{c.role}</span>
                          <span className="font-mono font-bold text-emerald-600">{c.sharePercent}% hissa</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grant Proposal Content */}
              {tab === 'grants' && inspectionItem.proposalData && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Grant Taklifi Mazmuni & Loyiha Rejasi</span>
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {parseProposalSummary(inspectionItem.proposalData)}
                  </div>
                </div>
              )}

              {/* Attached Document or PDF */}
              {(inspectionItem.applicationFileUrl || inspectionItem.url || inspectionItem.orderFileUrl) && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Biriktirilgan Asl Fayl / Havola:
                  </div>
                  <a
                    href={inspectionItem.applicationFileUrl || inspectionItem.url || inspectionItem.orderFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold hover:bg-blue-100 transition shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Rasmiy Hujjatni Ko‘rish / Yuklab Olish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setInspectionItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                {t.close}
              </button>

              {statusFilter === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = inspectionItem;
                      setInspectionItem(null);
                      setRejectModalItem(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    {t.reject}
                  </button>
                  <button
                    onClick={() => {
                      const item = inspectionItem;
                      setInspectionItem(null);
                      handleAction(item, 'APPROVED');
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.approve}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900">{t.rejectModalTitle}</h3>
            </div>
            <p className="text-xs text-slate-500">{t.rejectModalDesc}</p>
            <div className="flex flex-wrap gap-1.5">
              {t.rejectTemplates.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setRejectionReason(tpl)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  {tpl}
                </button>
              ))}
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t.reasonPlaceholder}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalItem(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => handleAction(rejectModalItem, 'REJECTED', rejectionReason.trim())}
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
