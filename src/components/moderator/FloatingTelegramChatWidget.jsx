'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  X,
  Minus,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Bell,
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const QUICK_TEMPLATES = [
  { label: '⚠️ Ogohlantirish', text: '⚠️ Hurmatli hamkasb! Ilmiy loyiha hisoboti va talab qilingan hujjatlarni belgilangan muddatgacha topshirishingizni so‘raymiz.' },
  { label: '🔔 Eslatma', text: '🔔 Eslatma: Yaqin kunlarda muhim ilmiy dedlayn mavjud. Iltimos, maqola va maʼlumotlaringizni yangilang.' },
  { label: '📄 Hujjat kutilyapti', text: '📄 Hurmatli olim! Siz topshirgan arizaga qo‘shimcha tasdiqlovchi .docx/.pdf hujjat yuklashingiz zarur.' },
  { label: '✅ Qabul qilindi', text: '✅ Siz yuborgan ilmiy ish va materiallar ko‘rib chiqildi va ijobiy tasdiqlandi!' },
];

export default function FloatingTelegramChatWidget({ user }) {
  // Only show for moderators and admins
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scholars, setScholars] = useState([]);
  const [loadingScholars, setLoadingScholars] = useState(false);
  const [selectedScholars, setSelectedScholars] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [unansweredCount, setUnansweredCount] = useState(0);

  // Load scholars list & unanswered count on open or mount
  useEffect(() => {
    let isMounted = true;
    async function fetchScholarsData() {
      try {
        setLoadingScholars(true);
        const res = await fetch('/api/admin/telegram');
        const data = await res.json();
        if (isMounted && data.success) {
          setScholars(data.allScholars || []);
          const pending = (data.inquiries || []).filter((inq) => inq.status === 'PENDING').length;
          setUnansweredCount(pending);
        }
      } catch (err) {
        console.error('Failed to fetch scholars for widget:', err);
      } finally {
        if (isMounted) setLoadingScholars(false);
      }
    }
    fetchScholarsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredScholars = scholars.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = s.fullName?.toLowerCase().includes(q);
    const deptMatch = s.department?.nameUz?.toLowerCase().includes(q);
    const degreeMatch = s.academicDegree?.toLowerCase().includes(q);
    const emailMatch = s.user?.email?.toLowerCase().includes(q);
    return nameMatch || deptMatch || degreeMatch || emailMatch;
  });

  const toggleScholarSelection = (scholar) => {
    setSelectedScholars((prev) => {
      const exists = prev.find((item) => item.id === scholar.id);
      if (exists) {
        return prev.filter((item) => item.id !== scholar.id);
      } else {
        return [...prev, scholar];
      }
    });
  };

  const removeScholar = (scholarId) => {
    setSelectedScholars((prev) => prev.filter((s) => s.id !== scholarId));
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;
    if (selectedScholars.length === 0) {
      setResultMsg({ type: 'error', text: 'Kamida bitta olimni tanlang (Lupa orqali qidiring)!' });
      return;
    }

    setSending(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'DIRECT',
          scholarIds: selectedScholars.map((s) => s.id),
          title: messageTitle.trim() || 'TIU Ilmiy Bo‘limi Bildirishnomasi',
          messageText: messageText.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResultMsg({
          type: 'success',
          text: data.message || 'Xabar muvaffaqiyatli yuborildi!',
        });
        setMessageText('');
        setMessageTitle('');
        setTimeout(() => {
          setResultMsg(null);
        }, 5000);
      } else {
        setResultMsg({
          type: 'error',
          text: data.error || 'Xabar yuborishda xatolik yuz berdi.',
        });
      }
    } catch {
      setResultMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 0, y: 0 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-3 w-[400px] max-w-[94vw] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col"
            style={{ maxHeight: '620px' }}
            // Prevent dragging from container when interacting inside form
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Telegram Header */}
            <div className="bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white px-4 py-3.5 flex items-center justify-between cursor-move">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shadow-xs">
                  <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    TIU Telegram Chat
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-blue-100">Moderator Tezkor Xabarlari</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title="Yashirish"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-3.5 overflow-y-auto space-y-3 max-h-[520px] bg-slate-50/50">
              {/* Selected Scholars Chips */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Qabul qiluvchilar ({selectedScholars.length}):
                  </span>
                  {selectedScholars.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedScholars([])}
                      className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                    >
                      Tozalash
                    </button>
                  )}
                </div>

                {selectedScholars.length === 0 ? (
                  <div className="text-xs text-slate-400 py-1 italic flex items-center justify-between">
                    <span>Olim tanlanmagan. Chapdagi lupadan qidiring ➔</span>
                    <button
                      type="button"
                      onClick={() => setShowSearch(true)}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Olim qo‘shish
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedScholars.map((sc) => (
                      <span
                        key={sc.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="truncate max-w-[130px] font-bold">{sc.fullName}</span>
                        {sc.isTelegramConnected ? (
                          <span className="text-[10px] text-emerald-600">TG</span>
                        ) : (
                          <span className="text-[10px] text-amber-600">Web</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeScholar(sc.id)}
                          className="hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Scholars Popup / Drawer */}
              {showSearch && (
                <div className="bg-white rounded-xl border border-blue-300 shadow-md p-3 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Olimlarni qidirish (Ism/Kafedra)</span>
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Ism, familiya yoki kafedrani yozing..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {loadingScholars ? (
                      <div className="text-xs text-slate-400 py-3 text-center">Yuklanmoqda...</div>
                    ) : filteredScholars.length === 0 ? (
                      <div className="text-xs text-slate-400 py-3 text-center">Olim topilmadi</div>
                    ) : (
                      filteredScholars.map((sc) => {
                        const isSelected = selectedScholars.some((item) => item.id === sc.id);
                        return (
                          <div
                            key={sc.id}
                            onClick={() => toggleScholarSelection(sc)}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-100/70 border border-blue-300'
                                : 'hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-800 truncate">{sc.fullName}</div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {sc.academicDegree || 'Olim'} · {sc.department?.nameUz || 'Kafedra'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {sc.isTelegramConnected ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                  TG Faol
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  Sayt
                                </span>
                              )}
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Quick Template Chips */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Tezkor shablonlar:
                </span>
                <div className="flex flex-wrap gap-1">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMessageText(tmpl.text);
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-[11px] text-slate-700 font-medium transition-all cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Status Message */}
              {resultMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    resultMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {resultMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{resultMsg.text}</span>
                </div>
              )}

              {/* Message Box with Lupa button on the left of input */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Lupa button to open scholars search directly from input */}
                  <button
                    type="button"
                    onClick={() => setShowSearch((prev) => !prev)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                      showSearch
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200'
                    }`}
                    title="Olimlarni qidirish va qo‘shish (Lupa)"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Mavzu (ixtiyoriy: Masalan, Eslatma)..."
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <textarea
                  rows={4}
                  placeholder="Xabar matnini yozing... Tanlangan olimlarning Telegram botiga va shaxsiy kabinetiga yetkaziladi."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 resize-none bg-slate-50/50"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {selectedScholars.length > 0
                      ? `${selectedScholars.length} ta olimga yuboriladi`
                      : 'Olim tanlang'}
                  </span>

                  <button
                    type="button"
                    disabled={sending || !messageText.trim() || selectedScholars.length === 0}
                    onClick={handleSendMessage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-blue-600 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Yuborilmoqda...' : 'Telegramga yuborish'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] text-white shadow-xl hover:shadow-2xl border-2 border-white flex items-center justify-center cursor-move transition-transform"
        title="TIU Telegram Messenger (Surish uchun sichqoncha bilan tuting)"
      >
        <Send className="w-6 h-6 translate-x-0.5 -translate-y-0.5" />

        {/* Unread / Pending Inquiries Badge */}
        {unansweredCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-white shadow-xs animate-bounce">
            {unansweredCount}
          </span>
        )}

        {/* Pulse aura */}
        <span className="absolute inset-0 rounded-full bg-[#2AABEE]/40 animate-ping pointer-events-none -z-10" />
      </motion.button>
    </motion.div>
  );
}
