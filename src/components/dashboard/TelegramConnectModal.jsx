'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function TelegramConnectModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [codeData, setCodeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedUser, setConnectedUser] = useState(null);
  const [error, setError] = useState(null);

  const pollIntervalRef = useRef(null);

  // Kod yaratish
  const fetchNewCode = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch('/api/telegram/generate-code', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kod yaratishda xatolik yuz berdi');

      setCodeData(data);
      setTimeLeft(data.expiresInSeconds || 60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal ochilganda kod yaratish
  useEffect(() => {
    if (open) {
      setConnected(false);
      setConnectedUser(null);
      fetchNewCode();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [open]);

  // 1 daqiqalik teskari taymer
  useEffect(() => {
    if (!open || connected || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, connected, timeLeft]);

  // Polling: Telegram orqali kod kiritilganini avtomatik aniqlash (har 2 soniyada)
  useEffect(() => {
    if (!open || connected || timeLeft <= 0) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/telegram/status');
        const data = await res.json();
        if (data.isConnected) {
          setConnected(true);
          setConnectedUser(data.telegramUsername || 'Siz');
          clearInterval(pollIntervalRef.current);
          if (onSuccess) onSuccess();
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [open, connected, timeLeft, onSuccess]);

  const handleCopy = () => {
    if (!codeData?.code) return;
    navigator.clipboard.writeText(codeData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="neu-card bg-white dark:bg-slate-900 max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Send className="w-4 h-4 -rotate-45 ml-0.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Telegram Botni Ulash
              </h3>
              <p className="text-[11px] text-slate-400">1 daqiqalik tasdiqlash kodi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content State: Connected / Countdown / Expired */}
        {connected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Telegram Muvaffaqiyatli Ulandi!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Profiliz (@{connectedUser}) bilan bog‘landi. Endi barcha muhim e’lonlar va shogirdlaringiz harakatlari Telegramga boradi.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
            >
              Tushundim
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Instruction Banner */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-xs text-sky-900 dark:text-sky-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" /> Qanday ulanadi?
              </span>
              <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
                1. Quyidagi 1 daqiqalik koddan nusxa oling.<br />
                2. <b>«Telegram Botga o‘tish»</b> tugmasini bosing.<br />
                3. Botda <b>/start</b> bosib, ushbu kodni yuboring.
              </p>
            </div>

            {/* Verification Code Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tasdiqlash kodi (OTP)
              </span>

              {loading ? (
                <div className="py-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Yangi kod yaratilmoqda...</span>
                </div>
              ) : timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-black text-indigo-600 dark:text-sky-400 tracking-wider">
                    {codeData?.code || 'TIU-XXXX'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition shadow-xs"
                    title="Nusxa olish"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <span className="text-xs font-bold text-rose-600 block">
                    Kodning 1 daqiqalik muddati tugadi
                  </span>
                  <button
                    onClick={fetchNewCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yangi kod olish</span>
                  </button>
                </div>
              )}

              {/* Countdown Timer */}
              {timeLeft > 0 && !loading && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft} daqiqa qoldi
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={codeData?.botLink || 'https://t.me/TIUScholarsBot'}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition ${
                  timeLeft > 0
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-500/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Telegram Botga o‘tish (@{codeData?.botUsername || 'TIUScholarsBot'})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10px] text-center text-slate-400">
                Botga kodni yuborganingiz zahoti ushbu oyna avtomatik tarzda muvaffaqiyatli deb tasdiqlanadi.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
