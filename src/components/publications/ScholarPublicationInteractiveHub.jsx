'use client';

import { useState } from 'react';
import {
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  X,
  Printer,
  Download,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Award,
  Layers,
} from 'lucide-react';

export default function ScholarPublicationInteractiveHub({
  publicationId,
  initialStage = 'IDEA',
  initialReviewLogs = [],
  qualityCheck = null,
  isAuthor = true,
  publicationTitle = '',
  journalName = '',
}) {
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [reviewLogs, setReviewLogs] = useState(initialReviewLogs || []);

  // Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actModalOpen, setActModalOpen] = useState(false);
  const [actData, setActData] = useState(null);
  const [actLoading, setActLoading] = useState(false);

  // New Review Round Form
  const [roundTitle, setRoundTitle] = useState('1-bosqich: Mustaqil taqriz natijasi');
  const [decision, setDecision] = useState('MINOR_REVISION');
  const [revisedUrl, setRevisedUrl] = useState('');
  const [comments, setComments] = useState([
    { reviewer: 'Reviewer #1', note: '', response: '' },
    { reviewer: 'Reviewer #2', note: '', response: '' },
  ]);
  const [savingReview, setSavingReview] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleAddCommentRow = () => {
    setComments([
      ...comments,
      { reviewer: `Reviewer #${comments.length + 1}`, note: '', response: '' },
    ]);
  };

  const handleUpdateComment = (index, field, value) => {
    const updated = [...comments];
    updated[index][field] = value;
    setComments(updated);
  };

  const handleSaveReviewRound = async (e) => {
    e.preventDefault();
    try {
      setSavingReview(true);
      setSaveSuccessMsg('');

      const res = await fetch(`/api/dashboard/publications/${publicationId}/review-hub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundTitle,
          decision,
          reviewerComments: comments,
          revisedDocUrl: revisedUrl,
          newStage: decision === 'ACCEPTED' ? 'PUBLISHED' : 'REVISION',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Taqriz izohlari va javob xati saqlandi hamda jamoaga Telegram orqali yetkazildi! 🎉');
        setTimeout(() => {
          setReviewModalOpen(false);
          setSaveSuccessMsg('');
          window.location.reload();
        }, 1500);
      } else {
        alert(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      alert('Server xatosi');
    } finally {
      setSavingReview(false);
    }
  };

  const handleOpenExpertiseAct = async () => {
    setActModalOpen(true);
    if (!actData) {
      try {
        setActLoading(true);
        const res = await fetch(`/api/dashboard/publications/${publicationId}/expertise-act`);
        const data = await res.json();
        if (data.success) {
          setActData(data.data);
        }
      } catch (err) {
        console.error('Act fetch error:', err);
      } finally {
        setActLoading(false);
      }
    }
  };

  const handlePrintAct = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleOpenExpertiseAct}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-xs hover:bg-emerald-50 active:scale-95 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>🏛 Ekspertiza Dalolatnomasi (Ruxsat xati)</span>
        </button>

        <button
          onClick={() => setReviewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>+ Jurnaldan Kelgan Taqriz Izohi & Rebuttal Qo‘shish</span>
        </button>
      </div>

      {/* Review & Rebuttal Timeline History */}
      {reviewLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Taqriz Izohlari va Muallif Javob Xati Tarixi ({reviewLogs.length})</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Peer Review & Revision Hub</span>
          </div>

          <div className="space-y-4">
            {reviewLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{log.roundTitle}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        log.decision === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.decision === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.decision}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>

                {log.comments?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    {log.comments.map((c, cIdx) => (
                      <div key={cIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                        <div className="font-bold text-indigo-600 text-[11px] flex items-center gap-1.5">
                          <span>{c.reviewer || `Reviewer #${cIdx + 1}`} Izohi:</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          &ldquo;{c.note || 'Izoh matni yo‘q'}&rdquo;
                        </p>
                        {c.response && (
                          <div className="pt-1">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                              Muallif javobi (Rebuttal response):
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                              {c.response}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REBUTTAL / REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Jurnaldan Kelgan Taqriz Izohlarini Kiritish</span>
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveReviewRound} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Taqriz Bosqichi Nomi
                    </label>
                    <input
                      type="text"
                      required
                      value={roundTitle}
                      onChange={(e) => setRoundTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Jurnal Tahririyati Qarori
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="MINOR_REVISION">Minor Revision (Kichik tuzatishlar)</option>
                      <option value="MAJOR_REVISION">Major Revision (Katta qayta ishlash)</option>
                      <option value="ACCEPTED">Accepted (Nashrga qabul qilindi)</option>
                      <option value="REJECTED">Rejected (Rad etildi)</option>
                    </select>
                  </div>
                </div>

                {/* Point by Point Rebuttal */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Taqrizchilar Izohlari va Muallif Javobi (Punktma-punkt)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCommentRow}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Taqrizchi qo‘shish</span>
                    </button>
                  </div>

                  {comments.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs">{c.reviewer}</span>
                        {comments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setComments(comments.filter((_, i) => i !== idx))}
                            className="text-[10px] text-red-500 hover:underline"
                          >
                            O‘chirish
                          </button>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                          Taqrizchining eʼtirozi / tavsiyasi:
                        </span>
                        <textarea
                          rows={2}
                          required
                          placeholder="Masalan: Metodologiyada namuna hajmi nima uchun 150 kishi ekani asoslanmagan..."
                          value={c.note}
                          onChange={(e) => handleUpdateComment(idx, 'note', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                          Mualliflar jamoasining javobi (Response / Action taken):
                        </span>
                        <textarea
                          rows={2}
                          placeholder="Masalan: Rahmat, 2-bo‘limga G*Power testi va Cochran formulasi asosida namuna hajmi qo‘shildi..."
                          value={c.response}
                          onChange={(e) => handleUpdateComment(idx, 'response', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={savingReview}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{savingReview ? 'Saqlanmoqda...' : 'Saqlash va Hammualliflarga Yuborish'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EKSPERTIZA DALOLATNOMASI MODAL (Official Clearance Certificate) */}
      {actModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto border-4 border-slate-100 print:border-none print:shadow-none print:p-0">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Rasmiy Hujjat Namunasi
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintAct}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chop etish / PDF</span>
                </button>
                <button
                  onClick={() => setActModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {actLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Hujjat tayyorlanmoqda...</div>
            ) : actData ? (
              <div className="space-y-6 text-slate-800">
                {/* Header */}
                <div className="text-center space-y-1">
                  <h2 className="font-extrabold text-base tracking-wide uppercase">
                    {actData.universityName}
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    {actData.commissionName}
                  </p>
                  <div className="text-xs font-mono font-bold text-emerald-800 pt-2">
                    EKSPERTIZA DALOLATNOMASI № {actData.actNo}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sana: {new Date(actData.actDate).toLocaleDateString()} • Toshkent shahri
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-xs space-y-3 leading-relaxed">
                  <p>
                    Toshkent Xalqaro Universiteti Ekspertiza komissiyasi quyidagi ilmiy maqolani ochiq matbuotda, xalqaro va milliy jurnallarda chop etishga tayyorlik darajasini ko‘rib chiqdi:
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div>
                      <strong>Mavzu:</strong> «{actData.publicationTitle}»
                    </div>
                    <div>
                      <strong>Turi & Jurnal:</strong> {actData.publicationType} • {actData.journalOrPublisher} ({actData.year})
                    </div>
                    <div>
                      <strong>Mualliflar:</strong>{' '}
                      {actData.authors?.map((a) => a.fullName).join(', ')}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <strong className="block text-slate-900 font-bold">Komissiya Xulosasi:</strong>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      {actData.conclusionPoints?.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Stamp & Signatures */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold">Ekspertiza Komissiyasi Raisi:</div>
                      <div className="text-slate-500 text-[11px]">Dotsent, Ilmiy bo‘lim boshlig‘i</div>
                      <div className="text-emerald-700 font-mono font-bold text-[10px] mt-1">
                        [Elektron raqamli imzo tasdiqlangan]
                      </div>
                    </div>

                    <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center font-mono text-[9px] text-slate-500 mx-auto">
                        QR-KOD
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                        {actData.actNo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
