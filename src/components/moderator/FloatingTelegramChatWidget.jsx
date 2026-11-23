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
  Menu,
  Paperclip,
  Smile,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Reply,
  CheckCheck,
  Bot,
  ExternalLink,
  Users,
  Briefcase,
  Scale,
  Sparkles,
  HelpCircle,
  Folder,
} from 'lucide-react';

const EMOJI_LIST = ['👍', '👏', '🎓', '📚', '📄', '📌', '⚠️', '🔔', '💡', '✅', '🔍', '💬', '🤝', '🚀', '✨', '📝', '🏛️', '⚖️'];

const CATEGORY_OPTIONS = [
  { id: 'NEWS', label: 'Ilmiy yangilik', icon: '📢', color: 'text-blue-600 bg-blue-50' },
  { id: 'GRANT', label: 'Grant tanlovi', icon: '🏆', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'CONFERENCE', label: 'Konferensiya', icon: '🎓', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'DEADLINE', label: 'Dedlayn / KPI', icon: '⏳', color: 'text-amber-600 bg-amber-50' },
  { id: 'WARNING', label: 'Ogohlantirish', icon: '⚠️', color: 'text-rose-600 bg-rose-50' },
  { id: 'SEMINAR', label: 'Ilmiy seminar', icon: '💡', color: 'text-purple-600 bg-purple-50' },
];

export default function FloatingTelegramChatWidget({ user }) {
  // Only show for moderators and admins
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true); // Toggle sidebar via 3-lines menu

  const [loading, setLoading] = useState(true);
  const [botChat, setBotChat] = useState(null);
  const [scholarChats, setScholarChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState('tiu-scholar-bot');
  const [searchQuery, setSearchQuery] = useState('');

  // 3 Jildlar (Folders): 'ALL', 'JURISPRUDENCE', 'BUSINESS', 'TG_BOT'
  const [activeFolder, setActiveFolder] = useState('ALL');

  // Input, Reply, Category, Emoji & Attachment States
  const [inputText, setInputText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [announcementCategory, setAnnouncementCategory] = useState('NEWS');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Poll creation state
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Ha, roziman', 'Qo‘shimcha muhokama zarur']);

  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Fetch chats data
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

  // Scroll to bottom on conversation change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, botChat, scholarChats]);

  // Determine active chat object
  const activeChat =
    activeChatId === 'tiu-scholar-bot'
      ? botChat
      : scholarChats.find((s) => s.id === activeChatId);

  // Counts for folders
  const totalScholarsCount = scholarChats.length;
  const jurisprudenceCount = scholarChats.filter((s) => s.folder === 'JURISPRUDENCE').length;
  const businessCount = scholarChats.filter((s) => s.folder === 'BUSINESS').length;

  const totalPendingInquiries = scholarChats.reduce(
    (sum, sc) => sum + (sc.unreadCount || 0),
    0
  );

  // Filter scholars list by folder and search
  const filteredScholarChats = scholarChats.filter((sc) => {
    // Folder filter
    if (activeFolder === 'JURISPRUDENCE' && sc.folder !== 'JURISPRUDENCE') return false;
    if (activeFolder === 'BUSINESS' && sc.folder !== 'BUSINESS') return false;
    if (activeFolder === 'TG_BOT') return false; // In TG_BOT folder, show only bot

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      sc.fullName?.toLowerCase().includes(q) ||
      sc.name?.toLowerCase().includes(q) ||
      sc.department?.toLowerCase().includes(q) ||
      sc.faculty?.toLowerCase().includes(q) ||
      sc.academicDegree?.toLowerCase().includes(q) ||
      sc.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  // Handle file upload
  const handleFileUpload = async (e, type = 'FILE') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setShowAttachMenu(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/telegram/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAttachedFile({
          url: data.fileUrl,
          name: data.fileName,
          size: data.fileSize,
          type,
        });
        setToastMsg({ type: 'success', text: `"${data.fileName}" biriktirildi! 📎` });
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        setToastMsg({ type: 'error', text: data.error || 'Fayl yuklashda xatolik' });
      }
    } catch {
      setToastMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  // Create Poll message
  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) return;
    const pollText = `📊 SO‘ROVNOMA: ${pollQuestion.trim()}\n\n` +
      pollOptions.map((opt, i) => `${i + 1}. 🔘 ${opt}`).join('\n');
    setInputText((prev) => (prev ? `${prev}\n\n${pollText}` : pollText));
    setShowPollModal(false);
    setPollQuestion('');
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    setSending(true);
    setToastMsg(null);
    setShowCategoryMenu(false);
    setShowEmojiPicker(false);

    let fullMessageText = inputText.trim();
    if (attachedFile) {
      fullMessageText += `\n\n📎 Biriktirilgan hujjat: ${window.location.origin}${attachedFile.url} (${attachedFile.name})`;
    }

    try {
      // 1. If currently in TIU-scholar Bot
      if (activeChatId === 'tiu-scholar-bot') {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `📢 E‘lon: ${inputText.slice(0, 45)}${inputText.length > 45 ? '...' : ''}`,
            content: fullMessageText,
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
            title: `📢 E‘lon (${announcementCategory})`,
            text: fullMessageText,
            fileUrl: attachedFile?.url,
            createdAt: new Date().toISOString(),
            isOutgoing: true,
          };

          setBotChat((prev) => ({
            ...prev,
            messages: [...(prev.messages || []), newMsg],
            lastMessage: { text: `📢 ${newMsg.text}`, time: new Date() },
          }));

          setInputText('');
          setAttachedFile(null);
          setToastMsg({
            type: 'success',
            text: `E‘lon TIU-scholar kanaliga va ${data.telegramBroadcastCount || 'barcha'} ta olim botiga tarqatildi! ✅`,
          });
          setTimeout(() => setToastMsg(null), 4000);
        } else {
          setToastMsg({ type: 'error', text: data.error || 'Xatolik' });
        }
      } else {
        // 2. Scholar Chat
        const scholar = activeChat;
        if (!scholar) return;

        const payload = {
          mode: 'DIRECT',
          scholarId: scholar.scholarId || scholar.id,
          title: replyingToMessage
            ? `↩ Javob: ${replyingToMessage.title || 'So‘rovingiz bo‘yicha'}`
            : '💬 TIU Ilmiy Bo‘limi Xabarnomasi',
          messageText: fullMessageText,
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
            text: fullMessageText,
            fileUrl: attachedFile?.url,
            createdAt: new Date().toISOString(),
            isOutgoing: true,
            replyToId: replyingToMessage?.id,
            replyToText: replyingToMessage?.text?.slice(0, 60),
          };

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
          setAttachedFile(null);
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

  const selectedCategoryObj =
    CATEGORY_OPTIONS.find((c) => c.id === announcementCategory) || CATEGORY_OPTIONS[0];

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
                ? 'w-[920px] h-[700px] max-w-[96vw] max-h-[92vh]'
                : 'w-[780px] h-[600px] max-w-[94vw] max-h-[86vh]'
            }`}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Top Telegram Header Bar with 3-Lines (Hamburger Menu) */}
            <div className="bg-[#2AABEE] text-white px-3.5 py-2.5 flex items-center justify-between cursor-move shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                {/* 3-Lines Menu Icon to Toggle Sidebar / Jildlar */}
                <button
                  type="button"
                  onClick={() => setSidebarVisible((prev) => !prev)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    sidebarVisible ? 'bg-white/20 text-white' : 'hover:bg-white/20 text-white/90'
                  }`}
                  title={sidebarVisible ? 'Jildlar va olimlar ro‘yxatini yashirish' : 'Jildlar va olimlar ro‘yxatini ochish'}
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center p-0.5">
                    <img src="/icons/chat-bubble.jpg" alt="TIU Chat" className="w-full h-full object-cover rounded-full" />
                  </div>
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

            {/* Main Layout (Sidebar + Chat Area) */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT COLUMN: 3 JILDLAR (FOLDERS) & OLIMLAR RO'YXATI */}
              {sidebarVisible && (
                <div className="w-[300px] sm:w-[320px] border-r border-slate-200 bg-[#F4F5F7] flex flex-col shrink-0 transition-all">
                  {/* Search Bar */}
                  <div className="p-2.5 bg-white border-b border-slate-200/80">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Olimlar F.I.SH yoki kafedra qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-blue-400 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 TA JILDLAR (TELEGRAM FOLDERS / TABS) */}
                  <div className="flex items-center px-1.5 py-1 bg-white border-b border-slate-200/80 overflow-x-auto no-scrollbar gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveFolder('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFolder === 'ALL'
                          ? 'bg-[#2AABEE] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Barchasi</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded-full ${activeFolder === 'ALL' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {totalScholarsCount + 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFolder('JURISPRUDENCE')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFolder === 'JURISPRUDENCE'
                          ? 'bg-[#2AABEE] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="1-jild: Yurisprudensiya fakulteti olimlari"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Yurisprudensiya</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded-full ${activeFolder === 'JURISPRUDENCE' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {jurisprudenceCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFolder('BUSINESS')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFolder === 'BUSINESS'
                          ? 'bg-[#2AABEE] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="2-jild: Biznes va innovatsion taʼlim fakulteti olimlari"
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>Biznes & Innovatsion</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded-full ${activeFolder === 'BUSINESS' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {businessCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFolder('TG_BOT');
                        setActiveChatId('tiu-scholar-bot');
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFolder === 'TG_BOT'
                          ? 'bg-[#2AABEE] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="3-jild: TIU-scholar Rasmiy Bot va e‘lonlar"
                    >
                      <Bot className="w-3 h-3" />
                      <span>TG-Bot</span>
                    </button>
                  </div>

                  {/* Chats & Scholars Scroll List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {/* Show Bot Chat if in ALL or TG_BOT folder */}
                    {(activeFolder === 'ALL' || activeFolder === 'TG_BOT') && botChat && (
                      <div
                        onClick={() => {
                          setActiveChatId('tiu-scholar-bot');
                          setReplyingToMessage(null);
                        }}
                        className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                          activeChatId === 'tiu-scholar-bot'
                            ? 'bg-[#E3EFFD] border-l-4 border-blue-600'
                            : 'hover:bg-slate-100 bg-white/80'
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
                                RASMIY BOT
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Doimiy</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {botChat.lastMessage?.text || 'Rasmiy xabarnomalar va e‘lonlar'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scholars list for non-TG_BOT folders */}
                    {activeFolder !== 'TG_BOT' && (
                      <>
                        <div className="px-3 py-1 bg-slate-200/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>
                            {activeFolder === 'JURISPRUDENCE'
                              ? 'Yurisprudensiya Olimlari'
                              : activeFolder === 'BUSINESS'
                              ? 'Biznes & Innovatsiya Olimlari'
                              : 'Barcha Ilmiy Olimlar'} ({filteredScholarChats.length})
                          </span>
                        </div>

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
                          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                            <div>Olim topilmadi</div>
                            <div className="text-[10px] text-slate-400">Qidiruv yoki jildni o‘zgartiring</div>
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
                                {/* Scholar Photo / Avatar */}
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs uppercase overflow-hidden">
                                  {sc.avatar ? (
                                    <img
                                      src={sc.avatar}
                                      alt={sc.fullName}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    sc.fullName?.[0] || 'O'
                                  )}
                                  {sc.isTelegramConnected && (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2AABEE] border-2 border-white"
                                      title="Telegram bot bog‘langan"
                                    />
                                  )}
                                </div>

                                {/* Scholar Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {sc.fullName}
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
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {sc.academicDegree} · {sc.department}
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
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION VIEW */}
              <div className="flex-1 flex flex-col bg-[#EFE7DE] relative overflow-hidden">
                {/* Chat Top Header */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs overflow-hidden">
                      {activeChat?.isBot ? (
                        '🤖'
                      ) : activeChat?.avatar ? (
                        <img src={activeChat.avatar} alt={activeChat.fullName} className="w-full h-full object-cover" />
                      ) : (
                        activeChat?.fullName?.[0] || 'O'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <span>{activeChat?.isBot ? 'TIU-scholar' : activeChat?.fullName || 'Telegram Chati'}</span>
                        {activeChat?.isBot && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-black">
                            RASMIY BOT
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {activeChat?.isBot ? (
                          'Barcha olimlarga rasmiy xabarnomalar yuborish'
                        ) : (
                          <>
                            {activeChat?.academicDegree} · {activeChat?.department}
                            {activeChat?.isTelegramConnected ? (
                              <span className="text-emerald-600 font-semibold ml-1.5">● Telegram faol</span>
                            ) : (
                              <span className="text-amber-600 font-semibold ml-1.5">● Faqat veb-sayt</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!activeChat || !activeChat.messages || activeChat.messages.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-white/70 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                        <Users className="w-6 h-6" />
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
                            onClick={() => !isOutgoing && setReplyingToMessage(msg)}
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
                            {/* Message Header */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-[11px] text-blue-700 truncate flex items-center gap-1">
                                {msg.sender}
                                {!isOutgoing && (
                                  <span className="text-[10px] text-slate-400 font-normal group-hover:text-blue-500 transition-colors">
                                    (Reply ↩)
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

                            {/* Title */}
                            {msg.title && (
                              <div className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                                {msg.title}
                              </div>
                            )}

                            {/* Reply preview */}
                            {msg.replyToText && (
                              <div className="mb-2 p-1.5 rounded-lg bg-black/5 border-l-2 border-emerald-500 text-[10px] text-slate-600 truncate">
                                ↩ {msg.replyToText}
                              </div>
                            )}

                            {/* Text */}
                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                              {msg.text}
                            </p>

                            {/* Attached file if exists */}
                            {msg.fileUrl && (
                              <div className="mt-2 pt-1.5 border-t border-slate-100">
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Biriktirilgan faylni ochish (.docx/.pdf)</span>
                                </a>
                              </div>
                            )}

                            {/* Time & Checks */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOutgoing && <CheckCheck className="w-3 h-3 text-[#2AABEE]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* BOTTOM CHAT INPUT AREA WITH PAPERCLIP, EMOJI & CATEGORY CHEVRON */}
                <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 space-y-2 relative">
                  {/* Reply Banner */}
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

                  {/* Attached file pill preview */}
                  {attachedFile && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-0.5 rounded hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Popovers: Category Selection Popup */}
                  {showCategoryMenu && (
                    <div className="absolute bottom-16 left-4 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-64 space-y-1 animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        E‘lon kategoriyasini tanlang:
                      </div>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setAnnouncementCategory(cat.id);
                            setShowCategoryMenu(false);
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                            announcementCategory === cat.id
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                          {announcementCategory === cat.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popovers: Paperclip Attachment Menu */}
                  {showAttachMenu && (
                    <div className="absolute bottom-16 left-3 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-56 space-y-1 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>Hujjat (.docx, .pdf)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        <span>Rasm / Tasvir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false);
                          setShowPollModal(true);
                        }}
                        className="w-full p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <BarChart2 className="w-4 h-4 text-amber-500" />
                        <span>So‘rovnoma (Poll)</span>
                      </button>
                    </div>
                  )}

                  {/* Popovers: Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 right-12 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 w-64 animate-in fade-in zoom-in-95">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                        Tezkor Emojilar:
                      </div>
                      <div className="grid grid-cols-6 gap-1 text-base">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setInputText((prev) => prev + emoji);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition text-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden native file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.zip"
                    onChange={(e) => handleFileUpload(e, 'DOCUMENT')}
                    className="hidden"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'IMAGE')}
                    className="hidden"
                  />

                  {/* Main Input Bar */}
                  <div className="flex items-center gap-2">
                    {/* 1. Paperclip (Qistirgich 📎) Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu((prev) => !prev);
                        setShowCategoryMenu(false);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                        showAttachMenu
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                      title="Fayl, rasm yoki so‘rovnoma biriktirish (Qistirgich)"
                    >
                      <Paperclip className="w-4 h-4 rotate-45" />
                    </button>

                    {/* 2. Category Selector with Upward Arrow (ChevronUp ^) */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryMenu((prev) => !prev);
                        setShowAttachMenu(false);
                        setShowEmojiPicker(false);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        showCategoryMenu
                          ? 'border-[#2AABEE] text-[#2AABEE] bg-blue-50/50'
                          : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title="Kategoriya tanlash uchun bosing (Tepaga strelka ^)"
                    >
                      <span>{selectedCategoryObj.icon}</span>
                      <span className="hidden sm:inline">{selectedCategoryObj.id}</span>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {/* 3. Text Input */}
                    <textarea
                      rows={1}
                      placeholder={
                        activeChatId === 'tiu-scholar-bot'
                          ? 'Rasmiy e‘lon / xabarni yozing (Telegram bot orqali tarqaladi)...'
                          : replyingToMessage
                          ? `${replyingToMessage.sender} ga Telegram bot orqali javob...`
                          : `${activeChat?.fullName || 'Olim'} ga Telegram xabari...`
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-xs py-2 px-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#2AABEE] resize-none bg-slate-50/50 max-h-24 font-normal"
                    />

                    {/* 4. Emoji (Smile 😊) Icon on the right */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker((prev) => !prev);
                        setShowAttachMenu(false);
                        setShowCategoryMenu(false);
                      }}
                      className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                        showEmojiPicker
                          ? 'bg-amber-100 text-amber-600'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                      title="Emoji qo‘yish"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {/* 5. Send (Jo'natish 🚀) Circular Button */}
                    <button
                      type="button"
                      disabled={sending || (!inputText.trim() && !attachedFile)}
                      onClick={handleSendMessage}
                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-blue-600 text-white flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-transform active:scale-95"
                      title="Telegram orqali yuborish"
                    >
                      <Send className="w-4 h-4 translate-x-0.2 -translate-y-0.2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Poll Creation Modal */}
            {showPollModal && (
              <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 w-full max-w-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-blue-500" />
                      Telegram So‘rovnomasi Yaratish
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPollModal(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      So‘rovnoma savoli:
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Yangi ilmiy reja qabul qilinsinmi?"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">Variantlar:</label>
                    {pollOptions.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[i] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className="w-full text-xs px-3 py-1 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPollModal(false)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-slate-600"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePoll}
                      disabled={!pollQuestion.trim()}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Matnga qo‘shish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAGGABLE TRIGGER BUTTON (1-RASMDAGI SHAFFAF KO'K CHAT BUBBLE DIZAYNI) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-15 h-15 rounded-full bg-white shadow-xl hover:shadow-2xl border-2 border-white flex items-center justify-center cursor-move transition-transform overflow-visible p-1"
        title="TIU Telegram Messenger (Kursor bilan ushlab istalgan joyga sudrang)"
      >
        {/* 1-rasmdagi ko'k shaffof chat bubble tasviri */}
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          <img
            src="/icons/chat-bubble.jpg"
            alt="Telegram Chat"
            className="w-full h-full object-cover rounded-full pointer-events-none"
          />
        </div>

        {/* Total pending inquiries badge */}
        {totalPendingInquiries > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-white shadow-xs animate-bounce">
            {totalPendingInquiries}
          </span>
        )}

        {/* Gentle Pulse Aura */}
        <span className="absolute inset-0 rounded-full bg-[#2AABEE]/30 animate-ping pointer-events-none -z-10" />
      </motion.button>
    </motion.div>
  );
}
