'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Unlink, RefreshCw } from 'lucide-react';
import TelegramConnectModal from './TelegramConnectModal';

export default function TelegramStatusCard({ className = '' }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      if (res.ok) setStatus(data);
    } catch (e) {
      console.error('Fetch telegram status error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm('Haqiqatan ham Telegram bot ulanishini uzmoqchimisiz? E’lonlar va bildirishnomalar Telegramga kelmay qoladi.')) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch('/api/telegram/disconnect', { method: 'POST' });
      if (res.ok) fetchStatus();
    } catch (e) {
      console.error('Disconnect error:', e);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <div
        className={`neu-card p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Icon & Text */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                status?.isConnected
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xs'
              }`}
            >
              <Send className="w-3.5 h-3.5 -rotate-45 ml-0.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  Telegram Bot Xabarnoma
                </h4>
                {status?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Ulangan
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Ulanmagan
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {status?.isConnected
                  ? `@${status.telegramUsername || 'Telegram'} ulangan • Xabarlar Telegramga yuborilmoqda`
                  : 'E’lonlar va ilmiy xabarlarni cho‘ntagingizda qabul qiling'}
              </p>
            </div>
          </div>

          {/* Right: Compact Action */}
          <div className="shrink-0 flex items-center justify-end">
            {status?.isConnected ? (
              <button
                type="button"
                disabled={disconnecting}
                onClick={handleDisconnect}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-200 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Ulanishni bekor qilish"
              >
                {disconnecting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Unlink className="w-3 h-3 text-rose-500" />
                )}
                <span>Uzish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3 h-3 -rotate-45" />
                <span>Botni ulash</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <TelegramConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchStatus()}
      />
    </>
  );
}
