'use client';

import { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCheck,
  Plus,
  CornerDownRight,
  AtSign,
} from 'lucide-react';

export default function TelegramAnnouncementCommentsModal({
  announcement,
  isOpen,
  onClose,
  isModerator = false,
  currentUser = null,
  onUpdated = () => {},
}) {
  if (!isOpen || !announcement) return null;

  const [inquiries, setInquiries] = useState(announcement.inquiries || []);
  const [selectedProfiles, setSelectedProfiles] = useState([]); // Array of scholars selected to reply to
  const [replyText, setReplyText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Toggle selection of a scholar profile from a question
  const toggleSelectProfile = (inq) => {
    if (!isModerator) return;
    const scholar = inq.scholar || {
      id: inq.scholarId || `raw-${inq.id}`,
      fullName: inq.authorName || 'Olim',
      telegramChatId: inq.telegramChatId,
    };

    setSelectedProfiles((prev) => {
      const exists = prev.find((p) => p.id === scholar.id || p.inquiryId === inq.id);
      if (exists) {
        return prev.filter((p) => p.id !== scholar.id && p.inquiryId !== inq.id);
      } else {
        return [
          ...prev,
          {
            id: scholar.id,
            fullName: inq.authorName || scholar.fullName,
            inquiryId: inq.id,
            telegramChatId: inq.telegramChatId || scholar.telegramChatId,
            scholarId: inq.scholarId,
          },
        ];
      }
    });
  };

  const removeSelectedProfile = (inquiryId) => {
    setSelectedProfiles((prev) => prev.filter((p) => p.inquiryId !== inquiryId));
  };

  // Moderator replies to selected scholar(s)
  const handleSendModeratorReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;
    if (selectedProfiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Iltimos, avval javob bermoqchi bo‘lgan savol yoki profil ustiga bosing!' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const validScholarIds = selectedProfiles
        .map((p) => p.scholarId)
        .filter(Boolean);
      const targetInquiryIds = selectedProfiles.map((p) => p.inquiryId);

      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'DIRECT',
          scholarIds: validScholarIds.length > 0 ? validScholarIds : null,
          scholarId: validScholarIds.length === 1 ? validScholarIds[0] : null,
          inquiryIds: targetInquiryIds,
          title: `💬 «${announcement.title}» bo‘yicha moderator javobi`,
          messageText: `💬 E'lon: ${announcement.title}\n\nJavob:\n${replyText.trim()}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local inquiry status
        setInquiries((prev) =>
          prev.map((inq) =>
            targetInquiryIds.includes(inq.id)
              ? {
                  ...inq,
                  status: 'ANSWERED',
                  answerText: replyText.trim(),
                  answeredAt: new Date().toISOString(),
                }
              : inq
          )
        );

        setStatusMsg({
          type: 'success',
          text: data.message || 'Javob saqlandi va Telegram orqali olim(lar)ga yetkazildi! ✅',
        });
        setReplyText('');
        setSelectedProfiles([]);
        onUpdated();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Yuborishda xatolik yuz berdi' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSubmitting(false);
    }
  };

  // Scholar submits a new inquiry/question
  const handleScholarSubmitQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/announcements/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcement.id,
          action: 'INQUIRY',
          questionText: questionText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) => [data.inquiry, ...prev]);
        setStatusMsg({
          type: 'success',
          text: 'Savolingiz moderatorga yuborildi. Javob tez orada botingizga boradi! 💬',
        });
        setQuestionText('');
        onUpdated();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Xatolik' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = inquiries.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Telegram Header */}
        <div className="bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-tight truncate flex items-center gap-2">
                <span>{announcement.title}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Telegram Chat Muhokamasi · {inquiries.length} ta savol
                {pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                    {pendingCount} kutilmoqda
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Chat History Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#EFE7DE]/40 dark:bg-slate-900/40">
          {statusMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {inquiries.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Hozircha savollar kelmagan</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Olimlar bot yoki platforma orqali ushbu e‘lon bo‘yicha savol bersa, shu yerda real vaqtda ko‘rinadi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => {
                const isSelected = selectedProfiles.some((p) => p.inquiryId === inq.id);
                return (
                  <div key={inq.id} className="space-y-1.5">
                    {/* Scholar Question Bubble (Left) */}
                    <div
                      onClick={() => toggleSelectProfile(inq)}
                      className={`group max-w-[85%] rounded-2xl p-3.5 shadow-xs transition-all ${
                        isModerator ? 'cursor-pointer hover:shadow-md' : ''
                      } ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200'
                          : 'bg-white border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                            {inq.authorName?.[0] || 'O'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                              <span>{inq.authorName || 'Olim'}</span>
                              {isModerator && (
                                <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 font-normal">
                                  (Javob berish uchun bosing)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {inq.scholar?.academicDegree || 'Tadqiqotchi'} · {inq.scholar?.department?.nameUz || ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {inq.status === 'ANSWERED' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCheck className="w-3 h-3" /> Javob berilgan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              <Clock className="w-3 h-3" /> Kutilmoqda
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line pl-1">
                        {inq.questionText}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                        <span>{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {inq.telegramChatId ? (
                          <span className="text-blue-500 font-semibold">Telegram Bot orqali</span>
                        ) : (
                          <span>Veb-portal orqali</span>
                        )}
                      </div>
                    </div>

                    {/* Moderator Answer Bubble (Right, if answered) */}
                    {inq.answerText && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl p-3.5 bg-[#EFFDDE] border border-[#C6EAB0] shadow-xs space-y-1">
                          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-emerald-800">
                            <span className="flex items-center gap-1">
                              <CornerDownRight className="w-3 h-3" /> TIU Ilmiy Bo‘limi (Moderator javobi)
                            </span>
                            <span className="font-mono text-emerald-600 font-normal">
                              {inq.answeredAt ? new Date(inq.answeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line">
                            {inq.answerText}
                          </p>
                          <div className="flex justify-end pt-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
          {isModerator ? (
            /* Moderator Reply Form */
            <div className="space-y-2">
              {/* Selected Profiles Tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5 text-blue-500" />
                    Javob oluvchilar ({selectedProfiles.length}):
                  </span>
                  {selectedProfiles.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Savol yoki profil ustiga bosib tanlang (bir nechtasini tanlash mumkin)
                    </span>
                  ) : (
                    selectedProfiles.map((p) => (
                      <span
                        key={p.inquiryId}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold"
                      >
                        @{p.fullName}
                        <button
                          type="button"
                          onClick={() => removeSelectedProfile(p.inquiryId)}
                          className="hover:text-rose-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                {selectedProfiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProfiles([])}
                    className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {/* Input & Send */}
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder={
                    selectedProfiles.length > 0
                      ? `${selectedProfiles.map((p) => p.fullName).join(', ')} ga Telegram bot orqali javob yozing...`
                      : 'Avval yuqoridagi savol ustiga bosing...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={selectedProfiles.length === 0}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none disabled:bg-slate-50"
                />
                <button
                  type="button"
                  disabled={submitting || !replyText.trim() || selectedProfiles.length === 0}
                  onClick={handleSendModeratorReply}
                  className="px-4 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-blue-600 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Yuborilmoqda...' : 'Javob'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Scholar Question Form */
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">
                Ushbu e‘lon bo‘yicha savolingizni yozing:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Savol yoki izohingizni kiriting..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={submitting || !questionText.trim()}
                  onClick={handleScholarSubmitQuestion}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? '...' : 'Yuborish'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
