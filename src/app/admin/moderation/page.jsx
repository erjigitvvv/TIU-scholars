'use client';

import { useLocale } from '@/lib/useLocale';
import { useState, useEffect, useCallback, startTransition } from 'react';
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
} from 'lucide-react';

const REJECT_TEMPLATES = [
  'DOI yoki havola tasdiqlanmadi',
  'PDF nusxa ilova qilinmagan',
  'Jurnal kvartili / turi noto‘g‘ri ko‘rsatilgan',
  'Ma’lumotlar to‘liq emas',
];

const DICT = {
  uz: {
    title: 'Moderatsiya navbati',
    subtitle: 'Nashrlar, grantlar va ilmiy rahbarliklarni tekshirish, kvartilni aniqlashtirish va tasdiqlash.',
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    rejected: 'Rad etilgan',
    publications: 'Nashrlar',
    grants: 'Grantlar',
    supervisions: 'Shogirdlar',
    loading: 'Yuklanmoqda...',
    emptyTitle: 'Ro?yxat bo?sh!',
    emptyDesc: 'Tanlangan holat bo?yicha elementlar topilmadi.',
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
      'Kvartil va jurnal indeksi noto?g?ri ko?rsatilgan',
      'Mualliflik ulushi yoki affilatsiya TIU ga mos emas',
    ],
  },
  ru: {
    title: '??????? ?????????',
    subtitle: '???????? ??????????, ??????? ? ???????? ???????????, ????????? ???????? ? ?????????????.',
    pending: '?????????',
    approved: '??????????',
    rejected: '???????????',
    publications: '??????????',
    grants: '??????',
    supervisions: '???????',
    loading: '????????...',
    emptyTitle: '?????? ????!',
    emptyDesc: '???????? ?? ?????????? ??????? ?? ???????.',
    openPdf: '??????? PDF',
    link: '??????',
    authors: '??????:',
    submittedBy: '????????:',
    type: '???:',
    quartile: '????????:',
    citations: '???????????:',
    grantProject: '????????? ??????',
    role: '????:',
    present: '?? ????????? ?????',
    scholar: '??????:',
    supervisionSuffix: '???????????',
    student: '??????:',
    supervisor: '??????? ????????????:',
    rejectReasonLabel: '??????? ??????????:',
    approve: '????????',
    reject: '?????????',
    rejectModalTitle: '??????? ??????????',
    rejectModalDesc: '??????? ?????? ??????? ??? ???????? ??????? ?????? ??? ??????????? ??????.',
    reasonPlaceholder: '??????? ???????...',
    cancel: '??????',
    confirmReject: '??????????? ??????????',
    rejectTemplates: [
      'DOI ??? ????????????????? ?????? ?? ????????????',
      'PDF-???? ??????? ???????? ??? ?? ?????????????',
      '???????? ? ?????? ??????? ??????? ???????',
      '?????????? ?? ????????????? TIU',
    ],
  },
  en: {
    title: 'Moderation Queue',
    subtitle: 'Review publications, grants, and supervisions, verify quartiles, and approve submissions.',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    publications: 'Publications',
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
  },
};

export default function AdminModerationPage() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;

  const [tab, setTab] = useState('publications'); // publications | grants | supervisions
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ publications: 0, grants: 0, supervisions: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
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
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get('type');
    if (urlType && ['publications', 'grants', 'supervisions'].includes(urlType)) {
      setTab(urlType);
    }
  }, []);

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
            <option value="grants">{t.grants}</option>
            <option value="supervisions">{t.supervisions}</option>
          </select>
        </div>
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
                          {' ? '}{t.submittedBy} {item.submittedBy?.email}
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
                              {typeof item.proposalData === 'string'
                                ? item.proposalData.startsWith('{')
                                  ? JSON.parse(item.proposalData).urgency || JSON.parse(item.proposalData).comment || item.proposalData
                                  : item.proposalData
                                : JSON.stringify(item.proposalData)}
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

                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg inline-block">
                        {t.rejectReasonLabel} {item.rejectionReason}
                      </div>
                    )}
                  </div>

                  {statusFilter === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(item, 'APPROVED')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t.approve}
                      </button>
                      <button
                        onClick={() => setRejectModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        {t.reject}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
