'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import TelegramConnectModal from './TelegramConnectModal';

const SNOOZE_DURATION_MS = 5 * 60 * 1000; // Aynan 5 daqiqa
const STORAGE_KEY = 'tiu_telegram_reminder_snooze_until';

export default function TelegramReminderToast() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef(null);

  // Statusni olish
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);

        // Agar ulanmagan bo'lsa, 5 daqiqalik snooze vaqtini tekshirish
        if (!data.isConnected) {
          evaluateVisibility();
        } else {
          setVisible(false);
        }
      }
    } catch (err) {
      console.warn('Telegram reminder status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateVisibility = () => {
    try {
      const snoozeUntil = localStorage.getItem(STORAGE_KEY);
      if (snoozeUntil) {
        const targetTime = parseInt(snoozeUntil, 10);
        if (Date.now() < targetTime) {
          setVisible(false);
          return;
        }
      }
      // 5 daqiqa o'tgan bo'lsa yoki hali snooze qilinmagan bo'lsa -> ko'rsatamiz!
      setVisible(true);
    } catch {
      setVisible(true);
    }
  };

  useEffect(() => {
    checkStatus();

    // Har 15 soniyada 5 daqiqa to'lganini tekshirib turish
    intervalRef.current = setInterval(() => {
      if (status && !status.isConnected) {
        evaluateVisibility();
      }
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status?.isConnected]);

  // 5 daqiqaga kechiktirish (Snooze)
  const handleSnooze = (e) => {
    if (e) e.stopPropagation();
    try {
      const nextTime = Date.now() + SNOOZE_DURATION_MS;
      localStorage.setItem(STORAGE_KEY, String(nextTime));
    } catch {}
    setVisible(false);
  };

  // Bot ulanganda butunlay yopish
  const handleSuccess = () => {
    setStatus((prev) => ({ ...prev, isConnected: true }));
    setVisible(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setModalOpen(false);
  };

  if (loading || !status || status.isConnected) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm w-full mx-4 sm:mx-0"
          >
            <div className="relative p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-200/80 dark:border-sky-800/80 shadow-xl shadow-sky-950/10 flex items-start gap-3.5">
              {/* Telegram Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 mt-0.5">
                <Send className="w-4 h-4 -rotate-45 ml-0.5" />
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Telegram bot ulanmagan
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Muhim ilmiy e’lonlar va bildirishnomalarni o‘z vaqtida olish uchun botni ulang.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <span>Ulash</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleSnooze}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="5 daqiqadan so‘ng eslatish"
                  >
                    <Clock className="w-3 h-3" />
                    <span>5 daqiqaga kechiktirish</span>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleSnooze}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Yopish (5 daqiqaga kechiktirish)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram 1-Minute OTP Modal */}
      <TelegramConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
