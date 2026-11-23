'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Layers,
  Award,
  BookOpen,
  TrendingUp,
  Link2,
  Unlink,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function AcademicSyncSection({ onSyncSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Connect input states
  const [orcidInput, setOrcidInput] = useState('');
  const [scopusInput, setScopusInput] = useState('');
  const [scholarInput, setScholarInput] = useState('');

  const [connectingOrcid, setConnectingOrcid] = useState(false);
  const [connectingScopus, setConnectingScopus] = useState(false);
  const [connectingScholar, setConnectingScholar] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/academic-sync/status');
      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (json.orcid?.id) setOrcidInput(json.orcid.id);
        if (json.scopus?.id) setScopusInput(json.scopus.id);
        if (json.scholar?.url || json.scholar?.id) setScholarInput(json.scholar.url || json.scholar.id);
      }
    } catch (e) {
      console.error('Fetch academic sync status error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectOrcid = async (e) => {
    e.preventDefault();
    if (!orcidInput.trim()) return;
    setErrorMsg('');
    setConnectingOrcid(true);
    try {
      const res = await fetch('/api/dashboard/academic-sync/connect-orcid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcidId: orcidInput.trim() }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'ORCID bog‘lashda xatolik');

      setSyncResult({
        type: 'success',
        title: 'ORCID muvaffaqiyatli bog‘landi!',
        message: resData.data?.autoDetectedScopusId
          ? `ORCID profilingizdan Scopus Author ID (${resData.data.autoDetectedScopusId}) ham avtomatik aniqlandi va ulandi!`
          : 'ORCID dagi ochiq maqolalar muvaffaqiyatli tortildi.',
      });
      await fetchStatus();
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setConnectingOrcid(false);
    }
  };

  const handleConnectScopus = async (e) => {
    e.preventDefault();
    if (!scopusInput.trim()) return;
    setErrorMsg('');
    setConnectingScopus(true);
    try {
      const res = await fetch('/api/dashboard/academic-sync/connect-scopus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopusId: scopusInput.trim() }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Scopus bog‘lashda xatolik');

      setSyncResult({
        type: 'success',
        title: 'Scopus Author ID bog‘landi!',
        message: `Muallif: ${resData.data?.profile?.fullName || ''} (H-index: ${resData.data?.profile?.hIndex || 0}, Iqtiboslar: ${resData.data?.profile?.totalCitations || 0})`,
      });
      await fetchStatus();
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setConnectingScopus(false);
    }
  };

  const handleConnectScholar = async (e) => {
    e.preventDefault();
    if (!scholarInput.trim()) return;
    setErrorMsg('');
    setConnectingScholar(true);
    try {
      const res = await fetch('/api/dashboard/academic-sync/connect-scholar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarUrlOrId: scholarInput.trim() }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Google Scholar bog‘lashda xatolik');

      setSyncResult({
        type: 'success',
        title: 'Google Scholar bog‘landi!',
        message: `H-index: ${resData.data?.profile?.hIndex || 0}, i10-index: ${resData.data?.profile?.i10Index || 0}, Iqtiboslar: ${resData.data?.profile?.totalCitations || 0}`,
      });
      await fetchStatus();
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setConnectingScholar(false);
    }
  };

  const handleSyncAll = async () => {
    setErrorMsg('');
    setSyncResult(null);
    setSyncingAll(true);
    try {
      const res = await fetch('/api/dashboard/academic-sync/sync-all', {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sinxronizatsiyada xatolik yuz berdi');

      const d = json.data || {};
      setSyncResult({
        type: 'success',
        title: 'Hammasi muvaffaqiyatli sinxronlandi!',
        message: `${d.newCreated || 0} ta yangi maqola qo‘shildi, ${d.deduplicatedCount || 0} ta dublikat DOI bo‘yicha birlashtirildi, umumiy reyting balli yangilandi.`,
      });
      await fetchStatus();
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!confirm(`Haqiqatan ham ${platform.toUpperCase()} ulanishini bekor qilmoqchimisiz?`)) return;
    try {
      const res = await fetch('/api/dashboard/academic-sync/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        await fetchStatus();
        if (onSyncSuccess) onSyncSuccess();
      }
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Hech qachon';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="neu-card p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header & Sync All Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Ilmiy Akkauntlar va Avtomatik Sinxronizatsiya
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ORCID, Scopus va Google Scholar hisoblaringizni bir marta ulang — maqolalar va iqtiboslaringiz dublikatsiz avtomatik tortiladi.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={syncingAll || loading}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-md shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
          <span>{syncingAll ? 'Sinxronlanmoqda...' : 'Barcha platformalarni sinxronlash'}</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {syncResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{syncResult.title}</div>
            <div className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">{syncResult.message}</div>
          </div>
        </div>
      )}

      {/* Integration 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. ORCID Card */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#A6CE39]/20 text-[#A6CE39] font-black text-xs flex items-center justify-center border border-[#A6CE39]/30">
                  iD
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">ORCID iD</span>
              </div>
              {data?.orcid?.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Ulangan
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Ulanmagan</span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Xalqaro ochiq tadqiqotchi identifikatori va tasdiqlangan ilmiy ishlar bazasi.
            </p>
          </div>

          {data?.orcid?.isConnected ? (
            <div className="space-y-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{data.orcid.id}</span>
                <a
                  href={data.orcid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="ORCID profilini ochish"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tortilgan maqolalar: <b className="text-slate-800 dark:text-slate-200">{data.orcid.verifiedCount || 0} ta</b></span>
                <button
                  onClick={() => handleDisconnect('orcid')}
                  className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" /> Uzish
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnectOrcid} className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="0000-0002-1825-0097"
                value={orcidInput}
                onChange={(e) => setOrcidInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#A6CE39]/50"
              />
              <button
                type="submit"
                disabled={connectingOrcid || !orcidInput.trim()}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#A6CE39] hover:bg-[#95ba32] text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{connectingOrcid ? 'Bog‘lanmoqda...' : 'ORCID ni bog‘lash'}</span>
              </button>
            </form>
          )}
        </div>

        {/* 2. Scopus Card */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF8200]/20 text-[#FF8200] font-black text-xs flex items-center justify-center border border-[#FF8200]/30">
                  Sc
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Scopus Author ID</span>
              </div>
              {data?.scopus?.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Ulangan
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Ulanmagan</span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Elsevier Scopus iqtiboslari, H-index va xalqaro jurnallardagi indekslangan nashrlar.
            </p>
          </div>

          {data?.scopus?.isConnected ? (
            <div className="space-y-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{data.scopus.id}</span>
                <a
                  href={data.scopus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700 p-1"
                  title="Scopus profilini ochish"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>H-index: <b className="text-indigo-600 dark:text-indigo-400">{data.scopus.hIndex || 0}</b></span>
                <button
                  onClick={() => handleDisconnect('scopus')}
                  className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" /> Uzish
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnectScopus} className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="Masalan: 57204918231"
                value={scopusInput}
                onChange={(e) => setScopusInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
              />
              <button
                type="submit"
                disabled={connectingScopus || !scopusInput.trim()}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#FF8200] hover:bg-[#e07300] text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{connectingScopus ? 'Bog‘lanmoqda...' : 'Scopus ID ni bog‘lash'}</span>
              </button>
            </form>
          )}
        </div>

        {/* 3. Google Scholar Card */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-600 font-black text-xs flex items-center justify-center border border-blue-600/30">
                  GS
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Google Scholar</span>
              </div>
              {data?.scholar?.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Ulangan
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Ulanmagan</span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Google Scholar iqtiboslari, i10-index va global qidiruvdagi maqolalar ko‘rsatkichi.
            </p>
          </div>

          {data?.scholar?.isConnected ? (
            <div className="space-y-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="truncate max-w-[170px]">{data.scholar.id || 'Google Scholar'}</span>
                {data.scholar.url && (
                  <a
                    href={data.scholar.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Scholar profilini ochish"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>i10-index: <b className="text-blue-600 dark:text-blue-400">{data.scholar.i10Index || 0}</b></span>
                <button
                  onClick={() => handleDisconnect('scholar')}
                  className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" /> Uzish
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnectScholar} className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="user=AbCdEfGAAAAJ yoki havola"
                value={scholarInput}
                onChange={(e) => setScholarInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={connectingScholar || !scholarInput.trim()}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{connectingScholar ? 'Bog‘lanmoqda...' : 'Scholar ni bog‘lash'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Metrics & Timestamp */}
      <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            Jami nashrlar: <b className="text-slate-900 dark:text-white">{data?.metrics?.totalPublications || 0} ta</b>
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Jami iqtiboslar: <b className="text-slate-900 dark:text-white">{data?.metrics?.totalCitations || 0}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            TIU Reyting: <b className="text-slate-900 dark:text-white">{Math.round(data?.metrics?.tiuScore || 0)} ball</b>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Oxirgi avto-sinxronlash: <span className="font-semibold text-slate-600 dark:text-slate-300">{formatLastSync(data?.metrics?.lastAcademicSyncAt)}</span>
        </div>
      </div>
    </div>
  );
}
