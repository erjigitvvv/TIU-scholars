'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Users,
  Search,
  MessageSquare,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Radio,
  Clock,
  RefreshCw,
  X,
  Link2,
} from 'lucide-react';

const COMMON_EMOJIS = [
  '📢', '📌', '🚀', '💡', '⏰', '🏆', '📄', '⚠️', '✅', '🔔', '🏛', '📊', '🎓', '🤝', '🔬', '✨', '📝', '💬'
];

export default function AdminTelegramManagementPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BROADCAST'); // 'BROADCAST' | 'DIRECT' | 'INQUIRIES'

  // Form states
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [selectedScholarId, setSelectedScholarId] = useState('');
  const [scholarSearch, setScholarSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Answer modal for inquiries
  const [replyInquiry, setReplyInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/telegram');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch telegram data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setAlertMsg({ type: 'error', text: 'Xabar matnini kiriting' });
      return;
    }
    if (activeTab === 'DIRECT' && !selectedScholarId) {
      setAlertMsg({ type: 'error', text: 'Xabar yuboriladigan olimni tanlang' });
      return;
    }

    try {
      setSending(true);
      setAlertMsg({ type: '', text: '' });

      const payload = {
        mode: activeTab,
        scholarId: activeTab === 'DIRECT' ? selectedScholarId : null,
        title,
        messageText,
        buttonText,
        buttonUrl,
      };

      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setAlertMsg({ type: 'success', text: data.message });
        setMessageText('');
        setTitle('');
        setButtonText('');
        setButtonUrl('');
        loadData();
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Xatolik yuz berdi' });
      }
    } catch {
      setAlertMsg({ type: 'error', text: 'Server bilan aloqada xatolik' });
    } finally {
      setSending(false);
    }
  };

  const handleReplyInquiry = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyInquiry) return;

    try {
      setReplying(true);
      const res = await fetch(
        `/api/announcements/${replyInquiry.announcementId}/inquiries/${replyInquiry.id}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answerText: replyText }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReplyInquiry(null);
        setReplyText('');
        setAlertMsg({
          type: 'success',
          text: 'Javob olimning Telegram botiga muvaffaqiyatli yetkazildi! ✅',
        });
        loadData();
      } else {
        alert(data.error || 'Javob yuborishda xatolik');
      }
    } catch {
      alert('Server xatosi');
    } finally {
      setReplying(false);
    }
  };

  const filteredScholars = (stats?.allScholars || []).filter((s) => {
    if (!scholarSearch.trim()) return true;
    const q = scholarSearch.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.department?.nameUz?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    );
  });

  const selectedScholar = (stats?.allScholars || []).find((s) => s.id === selectedScholarId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-xs">
      {/* Alert toast */}
      {alertMsg.text && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-fadeIn ${
            alertMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMsg({ type: '', text: '' })}
            className="p-1 rounded-lg hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <Bot className="w-3.5 h-3.5" />
              <span>Telegram Bot Management & Messaging Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Moderator Telegram Bot Boshqaruv Markazi
            </h1>
            <p className="text-blue-100 text-xs max-w-2xl leading-relaxed">
              TIU olimlariga rasmiy xabarnomalar, eslatmalar, individual tahrir talablari va inline havolali xabarlarni @{stats?.botUsername || 'tiuscholarbot'} orqali to‘g‘ridan-to‘g‘ri yetkazish.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://t.me/${stats?.botUsername || 'tiuscholarbot'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition backdrop-blur-md"
            >
              <span>@{stats?.botUsername || 'tiuscholarbot'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
            </a>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Botga Ulangan Olimlar</div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {stats?.totalConnected || 0}{' '}
            <span className="text-xs text-slate-400 font-normal">
              / {stats?.totalScholars || 0} nafar (
              {stats?.totalScholars
                ? Math.round(((stats.totalConnected || 0) / stats.totalScholars) * 100)
                : 0}
              %)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Telegram Bot Holati</div>
          <div className="text-2xl font-black text-blue-600 font-mono flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span>Faol (Online)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Kelgan Savol va Izohlar</div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats?.inquiries?.length || 0} ta
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('BROADCAST')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'BROADCAST'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Ommaviy Xabarnoma (Broadcast)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DIRECT')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'DIRECT'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Muayyan Olimga Shaxsiy Xabar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INQUIRIES')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'INQUIRIES'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <span>Kelgan Savollar & Izohlar ({stats?.inquiries?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1 & TAB 2: BROADCAST & DIRECT MESSAGING WORKSPACE */}
      {(activeTab === 'BROADCAST' || activeTab === 'DIRECT') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>
                  {activeTab === 'BROADCAST'
                    ? 'Barcha Olimlarga Eslatma / E’lon Yuborish'
                    : 'Olimga Aniq Shaxsiy Xabar Jo‘natish'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">Telegram Bot & Web Notification</span>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              {/* If Direct Message: Scholar picker */}
              {activeTab === 'DIRECT' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Olimni tanlang: *
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ism yoki kafedra bo‘yicha izlash..."
                      value={scholarSearch}
                      onChange={(e) => setScholarSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <select
                    value={selectedScholarId}
                    onChange={(e) => setSelectedScholarId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                  >
                    <option value="">Olimni tanlang...</option>
                    {filteredScholars.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.academicDegree}) • {s.department?.nameUz} •{' '}
                        {s.isTelegramConnected ? 'Bot ulangan 🤖' : 'Telegram ulanmagan'}
                      </option>
                    ))}
                  </select>

                  {selectedScholar && (
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Email: {selectedScholar.user?.email}</span>
                      <span
                        className={`font-bold ${
                          selectedScholar.isTelegramConnected ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {selectedScholar.isTelegramConnected
                          ? '✅ Telegramga boradi'
                          : '⚠️ Faqat platforma bildirishnomasiga tushadi'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Sarlavha (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Maqolangizga tahrir kiritish zarur yoki Yangi seminar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Emoji quick-insert bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Xabar matni *
                  </label>
                  <span className="text-[10px] text-slate-400">Emojilarni bir bosishda qo‘shing:</span>
                </div>

                <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2">
                  {COMMON_EMOJIS.map((em, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddEmoji(em)}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-sm transition cursor-pointer"
                      title={em}
                    >
                      {em}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  required
                  placeholder="Xabarning to‘liq matni, ko‘rsatmalar yoki eslatma tafsilotlari..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              {/* Inline Link / Button */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Xabarga Tugma / Havola biriktirish (Ixtiyoriy)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tugma matni (masalan: 🌐 Loyihani ochish)"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="URL havola (masalan: /dashboard/grants yoki https://...)"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {activeTab === 'BROADCAST'
                      ? 'Barcha Olimlarga Tarqatish'
                      : 'Olimning Telegramiga Yuborish'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Telegram Message Preview: 5 cols */}
          <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>Jonli Telegram Ko‘rinishi (Live Preview)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Telegram Chat UI</span>
            </div>

            {/* Telegram Simulated Bubble */}
            <div className="bg-[#54759E]/10 p-4 rounded-3xl space-y-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    TIU
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-slate-900 dark:text-white">
                      TIU Scholars Bot
                    </div>
                    <div className="text-[9px] text-blue-500">bot</div>
                  </div>
                </div>

                <div className="text-slate-800 dark:text-slate-200 text-xs space-y-1.5 leading-relaxed">
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    🏛 {activeTab === 'DIRECT' ? 'TIU Ilmiy Bo‘limi (Moderator)' : 'TIU Ilmiy Bo‘limi'}
                  </div>
                  {title && <div className="font-bold text-slate-900 dark:text-white">📌 {title}</div>}
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {messageText || 'Xabar matni bu yerda ko‘rinadi...'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono text-right pt-1">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>

                {/* Inline Button Preview */}
                {buttonText && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-center text-[11px] border border-blue-200/60 shadow-2xs">
                      {buttonText} ↗
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p>💡 <strong>Qulayliklar:</strong></p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                <li>Xabar yuborilishi bilan olim telefoniga push-bildirishnoma boradi.</li>
                <li>Tugmaga havola biriktirilsa, olim uni bosishi bilan platformaning tegishli sahifasi ochiladi.</li>
                <li>Xabar bir vaqtning o‘zida olimning veb-kabineti bildirishnomalar paneliga ham saqlanadi.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INCOMING INQUIRIES & REPLIES FEED */}
      {activeTab === 'INQUIRIES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Olimlardan Kelgan Barcha Savollar va So‘rovlar</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Olimlar Telegram bot yoki platforma orqali bergan savollarga shu yerdan bevosita javob bering.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
              title="Yangilash"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {!stats?.inquiries || stats.inquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Hozircha savollar kelib tushmagan.</div>
          ) : (
            <div className="space-y-3">
              {stats.inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {inq.authorName || inq.scholar?.fullName || 'Olim'}
                      </span>
                      {inq.scholar?.department?.nameUz && (
                        <span className="text-[11px] text-slate-400">
                          • {inq.scholar.department.nameUz}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          inq.status === 'ANSWERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inq.status === 'ANSWERED' ? 'Javob berilgan ✅' : 'Kutilmoqda ⏳'}
                      </span>
                    </div>

                    {inq.announcement?.title && (
                      <div className="text-[11px] text-blue-600 font-semibold">
                        E’lon: «{inq.announcement.title}»
                      </div>
                    )}

                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      "{inq.questionText}"
                    </p>

                    {inq.answerText && (
                      <div className="pl-3 border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-r-xl space-y-0.5 mt-2">
                        <div className="font-bold text-[10px] text-emerald-800 dark:text-emerald-300">
                          Moderator javobi:
                        </div>
                        <p className="text-slate-800 dark:text-slate-200">{inq.answerText}</p>
                      </div>
                    )}
                  </div>

                  {!inq.answerText && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyInquiry(inq);
                        setReplyText('');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition self-start shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Javob Yozish</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANSWER MODAL */}
      {replyInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Olimning Savoliga Javob Berish</span>
              </h3>
              <button
                type="button"
                onClick={() => setReplyInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {replyInquiry.authorName || replyInquiry.scholar?.fullName} savoli:
              </div>
              <p className="text-slate-600 dark:text-slate-300">"{replyInquiry.questionText}"</p>
            </div>

            <form onSubmit={handleReplyInquiry} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Moderator javob matni:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Batafsil javobingizni kiriting..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Ushbu javob to‘g‘ridan-to‘g‘ri olimning shaxsiy Telegram botiga yetkaziladi!
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplyInquiry(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Javobni Telegram orqali yuborish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
