'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  X,
  Minus,
  Maximize2,
  Minimize2,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Bell,
  FileText,
  UserCheck,
  CheckCheck,
  Sparkles,
  CornerDownRight,
  Reply,
  Megaphone,
  Bot,
  ExternalLink,
  Paperclip,
  Check,
  Info,
  Phone,
  MoreVertical,
} from 'lucide-react';

export default function FloatingTelegramChatWidget({ user }) {
  // Only show for moderators and admins
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Toggle wider view
  const [loading, setLoading] = useState(true);
  const [botChat, setBotChat] = useState(null);
  const [scholarChats, setScholarChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState('tiu-scholar-bot'); // default to TIU-scholar bot
  const [searchQuery, setSearchQuery] = useState('');

  // Replying state
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [inputText, setInputText] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('NEWS');
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch full chat simulation data
  const loadChatData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/telegram/chats');
      const data = await res.json();
      if (data.success) {
        setBotChat(data.botChat);
        setScholarChats(data.scholarChats || []);
      }
    } catch (err) {
      console.error('Failed to load telegram simulation chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, []);

  // Scroll to bottom when active chat or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, botChat, scholarChats]);

  // Determine active chat object
  const activeChat =
    activeChatId === 'tiu-scholar-bot'
      ? botChat
      : scholarChats.find((s) => s.id === activeChatId);

  // Total pending inquiries across all scholars
  const totalPendingInquiries = scholarChats.reduce(
    (sum, sc) => sum + (sc.unreadCount || 0),
    0
  );

  // Filter scholars list by search
  const filteredScholarChats = scholarChats.filter((sc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sc.name?.toLowerCase().includes(q) ||
      sc.department?.toLowerCase().includes(q) ||
      sc.academicDegree?.toLowerCase().includes(q) ||
      sc.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  // Handle selecting a message to reply to
  const handleSelectReply = (msg) => {
    setReplyingToMessage(msg);
  };

  // Send message or reply
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    setToastMsg(null);

    try {
      // 1. If currently in TIU-scholar Bot: Broadcast Announcement / Channel Post
      if (activeChatId === 'tiu-scholar-bot') {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `📢 E‘lon: ${inputText.slice(0, 45)}${inputText.length > 45 ? '...' : ''}`,
            content: inputText.trim(),
            category: announcementCategory,
            visibility: 'PUBLIC',
            status: 'PUBLISHED',
          }),
        });

        const data = await res.json();
        if (data.success) {
          const newMsg = {
            id: `bot-ann-${Date.now()}`,
            type: 'ANNOUNCEMENT',
            sender: 'TIU-scholar',
            title: `📢 E‘lon`,
            text: inputText.trim(),
            createdAt: new Date().toISOString(),
            isOutgoing: true,
          };

          setBotChat((prev) => ({
            ...prev,
            messages: [...(prev.messages || []), newMsg],
            lastMessage: { text: `📢 ${newMsg.text}`, time: new Date() },
          }));

          setInputText('');
          setToastMsg({
            type: 'success',
            text: `E‘lon TIU-scholar kanaliga va ${data.telegramBroadcastCount || 'barcha'} ta olim botiga tarqatildi! ✅`,
          });
          setTimeout(() => setToastMsg(null), 4000);
        } else {
          setToastMsg({ type: 'error', text: data.error || 'Xatolik' });
        }
      } else {
        // 2. Scholar Chat: Send direct message / reply to scholar
        const scholar = activeChat;
        if (!scholar) return;

        const payload = {
          mode: 'DIRECT',
          scholarId: scholar.scholarId || scholar.id,
          title: replyingToMessage
            ? `↩ Javob: ${replyingToMessage.title || 'So‘rovingiz bo‘yicha'}`
            : '💬 TIU Ilmiy Bo‘limi Xabarnomasi',
          messageText: inputText.trim(),
        };

        if (replyingToMessage?.inquiryId) {
          payload.inquiryId = replyingToMessage.inquiryId;
        }

        const res = await fetch('/api/admin/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const newMsg = {
            id: `ans-client-${Date.now()}`,
            type: 'INQUIRY_ANSWER',
            sender: 'TIU Ilmiy Bo‘limi',
            title: replyingToMessage ? `↩ Javob: ${replyingToMessage.sender}` : 'Moderator javobi',
            text: inputText.trim(),
            createdAt: new Date().toISOString(),
            isOutgoing: true,
            replyToId: replyingToMessage?.id,
            replyToText: replyingToMessage?.text?.slice(0, 60),
          };

          // Update this scholar's messages in state
          setScholarChats((prev) =>
            prev.map((sc) => {
              if (sc.id === scholar.id) {
                const updatedMessages = sc.messages.map((m) =>
                  replyingToMessage && m.id === replyingToMessage.id
                    ? { ...m, status: 'ANSWERED' }
                    : m
                );
                return {
                  ...sc,
                  unreadCount: Math.max(0, (sc.unreadCount || 0) - (replyingToMessage ? 1 : 0)),
                  messages: [...updatedMessages, newMsg],
                  lastMessage: { text: newMsg.text, time: new Date(), isOutgoing: true },
                };
              }
              return sc;
            })
          );

          setInputText('');
          setReplyingToMessage(null);
          setToastMsg({
            type: 'success',
            text: data.message || 'Javob olimning Telegram botiga yetkazildi! ✅',
          });
          setTimeout(() => setToastMsg(null), 4000);
        } else {
          setToastMsg({ type: 'error', text: data.error || 'Xatolik' });
        }
      }
    } catch {
      setToastMsg({ type: 'error', text: 'Tarmoq xatosi yuz berdi' });
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
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`mb-3 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'w-[880px] h-[680px] max-w-[96vw] max-h-[92vh]'
                : 'w-[740px] h-[580px] max-w-[94vw] max-h-[85vh]'
            }`}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Top Telegram Header Bar */}
            <div className="bg-[#2AABEE] text-white px-4 py-2.5 flex items-center justify-between cursor-move shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Send className="w-3.5 h-3.5 translate-x-0.2 -translate-y-0.2" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-wide flex items-center gap-1.5">
                    TIU Telegram Messenger
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                  title={isExpanded ? 'Kichraytirish' : 'Kengaytirish'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                  title="Yashirish"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                  title="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT COLUMN: Telegram Chats & Scholars List */}
              <div className="w-[280px] sm:w-[310px] border-r border-slate-200 bg-[#F4F5F7] flex flex-col shrink-0">
                {/* Search Header */}
                <div className="p-2.5 bg-white border-b border-slate-200/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Olimlar yoki xabarlarni qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-blue-400 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Chats Scroll List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {/* 1. PINNED SPECIAL CHAT: TIU-scholar (Rasmiy Bot) */}
                  {botChat && (
                    <div
                      onClick={() => {
                        setActiveChatId('tiu-scholar-bot');
                        setReplyingToMessage(null);
                      }}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                        activeChatId === 'tiu-scholar-bot'
                          ? 'bg-[#E3EFFD] border-l-4 border-blue-600'
                          : 'hover:bg-slate-100 bg-white/70'
                      }`}
                    >
                      <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-xs shrink-0">
                        🤖
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                            TIU-scholar
                            <span className="px-1 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-black">
                              BOT
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Doimiy</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {botChat.lastMessage?.text || 'Rasmiy xabarnomalar & e‘lonlar kanali'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Section Divider: Olimlar Ro'yxati */}
                  <div className="px-3 py-1.5 bg-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Olimlar Chati ({filteredScholarChats.length})</span>
                    {totalPendingInquiries > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px]">
                        {totalPendingInquiries} yangi so‘rov
                      </span>
                    )}
                  </div>

                  {/* 2. SCHOLARS ACCOUNTS LIST */}
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2.5 animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-slate-300 shrink-0" />
                          <div className="flex-1 space-y-1.5 py-1">
                            <div className="h-3 bg-slate-300 rounded w-3/4" />
                            <div className="h-2 bg-slate-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredScholarChats.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Olim topilmadi
                    </div>
                  ) : (
                    filteredScholarChats.map((sc) => {
                      const isActive = activeChatId === sc.id;
                      return (
                        <div
                          key={sc.id}
                          onClick={() => {
                            setActiveChatId(sc.id);
                            setReplyingToMessage(null);
                          }}
                          className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                            isActive
                              ? 'bg-[#E3EFFD] border-l-4 border-blue-600'
                              : 'hover:bg-slate-100 bg-white/50'
                          }`}
                        >
                          {/* Avatar with status */}
                          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs uppercase">
                            {sc.avatar ? (
                              <img
                                src={sc.avatar}
                                alt={sc.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              sc.name?.[0] || 'O'
                            )}
                            {sc.isTelegramConnected && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2AABEE] border-2 border-white"
                                title="Telegram bot bog‘langan"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {sc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {sc.lastMessage?.time
                                  ? new Date(sc.lastMessage.time).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              <p className="text-[11px] text-slate-500 truncate flex-1">
                                {sc.lastMessage?.text || 'Muloqot boshlanmagan'}
                              </p>
                              {sc.unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 animate-bounce">
                                  {sc.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Active Chat Conversation View */}
              <div className="flex-1 flex flex-col bg-[#EFE7DE] relative overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                      {activeChat?.isBot ? '🤖' : activeChat?.name?.[0] || 'O'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <span>{activeChat?.name || 'Telegram Chati'}</span>
                        {activeChat?.isBot && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-black">
                            RASMIY BOT
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {activeChat?.isBot ? (
                          'Barcha olimlarga umumiy e‘lon va xabarnomalar yuborish'
                        ) : (
                          <>
                            {activeChat?.academicDegree} · {activeChat?.department}
                            {activeChat?.isTelegramConnected ? (
                              <span className="text-emerald-600 font-semibold ml-1.5">
                                ● Telegram faol
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold ml-1.5">
                                ● Faqat veb-sayt
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {activeChat?.isBot
                        ? '@tiuscholarbot'
                        : activeChat?.telegramUsername
                        ? `@${activeChat.telegramUsername}`
                        : 'ID: ' + (activeChat?.telegramChatId || 'Ulanmagan')}
                    </span>
                  </div>
                </div>

                {/* Toast status alert */}
                {toastMsg && (
                  <div
                    className={`mx-4 mt-2 p-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 ${
                      toastMsg.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {toastMsg.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{toastMsg.text}</span>
                  </div>
                )}

                {/* Messages Thread Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!activeChat || !activeChat.messages || activeChat.messages.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-white/70 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-700">Xabarlar tarixi bo‘sh</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        {activeChat?.isBot
                          ? 'Pastdagi maydondan yangi e‘lon yoki xabarnoma yozib barcha olimlarga jo‘nating.'
                          : 'Ushbu olim hozircha ilmiy loyiha yoki e‘lon bo‘yicha so‘rov yubormagan. Pastdan xabar yozishingiz mumkin.'}
                      </p>
                    </div>
                  ) : (
                    activeChat.messages.map((msg) => {
                      const isOutgoing = msg.isOutgoing;
                      const isSelectedForReply = replyingToMessage?.id === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            onClick={() => !isOutgoing && handleSelectReply(msg)}
                            className={`max-w-[85%] rounded-2xl p-3 shadow-xs transition-all relative group ${
                              !isOutgoing ? 'cursor-pointer hover:shadow-md' : ''
                            } ${
                              isSelectedForReply
                                ? 'ring-2 ring-blue-500 bg-blue-50/90'
                                : isOutgoing
                                ? 'bg-[#EFFDDE] text-slate-900 border border-[#C6EAB0]'
                                : 'bg-white text-slate-900 border border-slate-200/80'
                            }`}
                          >
                            {/* Message Header / Tag */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-[11px] text-blue-700 truncate flex items-center gap-1">
                                {msg.sender}
                                {!isOutgoing && (
                                  <span className="text-[10px] text-slate-400 font-normal group-hover:text-blue-500 transition-colors">
                                    (Reply qilish uchun bosing ↩)
                                  </span>
                                )}
                              </span>

                              {msg.status && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    msg.status === 'ANSWERED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {msg.status === 'ANSWERED' ? 'Javob berilgan' : 'Kutilmoqda'}
                                </span>
                              )}
                            </div>

                            {/* Optional Title (e.g. Project Request title or Announcement title) */}
                            {msg.title && (
                              <div className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                                {msg.title}
                              </div>
                            )}

                            {/* Reply preview if this is an answer */}
                            {msg.replyToText && (
                              <div className="mb-2 p-1.5 rounded-lg bg-black/5 border-l-2 border-emerald-500 text-[10px] text-slate-600 truncate">
                                ↩ {msg.replyToText}
                              </div>
                            )}

                            {/* Message Text */}
                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                              {msg.text}
                            </p>

                            {/* Attached submission file link if project request */}
                            {msg.fileUrl && (
                              <div className="mt-2 pt-1 border-t border-slate-100">
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Biriktirilgan .docx/.pdf ariza fayli</span>
                                </a>
                              </div>
                            )}

                            {/* Timestamp & Telegram Checkmarks */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOutgoing && (
                                <CheckCheck className="w-3 h-3 text-[#2AABEE]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input & Reply Area */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
                  {/* Telegram Style Reply Banner */}
                  {replyingToMessage && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border-l-4 border-[#2AABEE] text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Reply className="w-4 h-4 text-[#2AABEE] shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-[11px] text-[#2AABEE] block truncate">
                            Javob berilmoqda: {replyingToMessage.sender}
                          </span>
                          <span className="text-[10px] text-slate-600 truncate block">
                            "{replyingToMessage.text}"
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* If in TIU-scholar bot: Category selector for announcement */}
                  {activeChatId === 'tiu-scholar-bot' && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Kategoriya:
                      </span>
                      {['NEWS', 'GRANT', 'CONFERENCE', 'DEADLINE'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAnnouncementCategory(cat)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                            announcementCategory === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Text Input Row */}
                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      placeholder={
                        activeChatId === 'tiu-scholar-bot'
                          ? 'Barcha olimlarga rasmiy e‘lon / xabar yozing (Telegram bot orqali tarqaladi)...'
                          : replyingToMessage
                          ? `${replyingToMessage.sender} ga Telegram bot orqali javob yozing...`
                          : `${activeChat?.name || 'Olim'} ga Telegram xabari yozing...`
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2AABEE] resize-none bg-slate-50/50"
                    />

                    <button
                      type="button"
                      disabled={sending || !inputText.trim()}
                      onClick={handleSendMessage}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-blue-600 text-white flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-transform active:scale-95"
                      title="Telegram orqali yuborish"
                    >
                      <Send className="w-4 h-4 translate-x-0.2 -translate-y-0.2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Telegram Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] text-white shadow-xl hover:shadow-2xl border-2 border-white flex items-center justify-center cursor-move transition-transform"
        title="TIU Telegram Messenger (Kursor bilan ushlab istalgan joyga sudrang)"
      >
        <Send className="w-6 h-6 translate-x-0.5 -translate-y-0.5" />

        {/* Total pending inquiries / requests badge */}
        {totalPendingInquiries > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-white shadow-xs animate-bounce">
            {totalPendingInquiries}
          </span>
        )}

        {/* Pulse aura */}
        <span className="absolute inset-0 rounded-full bg-[#2AABEE]/40 animate-ping pointer-events-none -z-10" />
      </motion.button>
    </motion.div>
  );
}
