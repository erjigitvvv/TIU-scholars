'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  History,
} from 'lucide-react';

const REJECT_TEMPLATES = [
  'DOI yoki havola tasdiqlanmadi',
  'PDF nusxa ilova qilinmagan',
  'Jurnal kvartili / turi noto‘g‘ri ko‘rsatilgan',
  'Ma’lumotlar to‘liq emas',
];

export default function AdminModerationPage() {
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
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Moderatsiya navbati</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Nashrlar, grantlar va ilmiy rahbarliklarni tekshirish, kvartilni aniqlashtirish va tasdiqlash.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter (Pending vs History) */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'PENDING', label: 'Kutilmoqda' },
              { id: 'APPROVED', label: 'Tasdiqlangan' },
              { id: 'REJECTED', label: 'Rad etilgan' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  statusFilter === s.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.id !== 'PENDING' && <History className="w-3 h-3" />}
                {s.label}
              </button>
            ))}
          </div>

          {/* Entity Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl">
            {[
              { id: 'publications', label: 'Nashrlar', count: counts.publications },
              { id: 'grants', label: 'Grantlar', count: counts.grants },
              { id: 'supervisions', label: 'Shogirdlar', count: counts.supervisions },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  tab === t.id
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
            <h3 className="text-base font-bold text-slate-800">Ro‘yxat bo‘sh!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tanlangan holat bo‘yicha {tab} topilmadi.
            </p>
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
                              {isLocalPdf ? 'PDF faylni ochish' : 'Havola'}
                            </a>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.journalOrPublisher}</p>
                        <div className="text-xs text-slate-500">
                          Mualliflar:{' '}
                          <span className="font-semibold text-slate-700">
                            {item.authors?.map((a) => a.scholar?.fullName).join(', ')}
                          </span>
                          {' • '}Yubordi: {item.submittedBy?.email}
                        </div>

                        {statusFilter === 'PENDING' && (
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                              Tur:
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
                              Kvartil:
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
                              Iqtibos:
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
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold">
                          Grant loyihasi
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">
                          {item.fundingSource} • Roli: {item.role} ({item.startYear}–
                          {item.endYear || 'Hozirgacha'})
                        </p>
                        <div className="text-xs text-slate-500">
                          Olim:{' '}
                          <span className="font-semibold text-slate-700">
                            {item.scholar?.fullName}
                          </span>
                        </div>
                      </>
                    )}

                    {tab === 'supervisions' && (
                      <>
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold">
                          {item.degreeType} Rahbarlik ({item.year})
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          Shogird: {item.studentName}
                        </h3>
                        <p className="text-sm text-slate-600">{item.dissertationTitle}</p>
                        <div className="text-xs text-slate-500">
                          Ilmiy rahbar:{' '}
                          <span className="font-semibold text-slate-700">
                            {item.scholar?.fullName}
                          </span>
                        </div>
                      </>
                    )}

                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg inline-block">
                        Rad etish sababi: {item.rejectionReason}
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
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => setRejectModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rad etish
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
              <h3 className="font-bold text-lg text-slate-900">Rad etish sababi</h3>
            </div>
            <p className="text-xs text-slate-500">
              Olim tuzatib qayta yuborishi uchun aniq sababni kiriting yoki tayyor shablonni tanlang.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_TEMPLATES.map((tpl) => (
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
              placeholder="Sababni kiriting..."
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
                Bekor qilish
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => handleAction(rejectModalItem, 'REJECTED', rejectionReason.trim())}
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
