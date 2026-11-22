'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, ShieldCheck, Unlink, RefreshCw } from 'lucide-react';
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
        className={`neu-card p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                status?.isConnected
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
              }`}
            >
              <Send className="w-5 h-5 -rotate-45 ml-0.5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Telegram Xabarnoma & Bot
                </h4>
                {status?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Faol Ulangan
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Ulanmagan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {status?.isConnected
                  ? `Profilingiz (@${status.telegramUsername || 'Telegram'}) bilan muvaffaqiyatli bog‘langan. Muhim xabarlar cho‘ntagingizga boradi.`
                  : 'Yangi grantlar, e’lonlar va shogirdlaringiz harakatlaridan birinchi bo‘lib xabardor bo‘ling.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
            {status?.isConnected ? (
              <button
                type="button"
                disabled={disconnecting}
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {disconnecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlink className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>Ulanishni uzish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>Telegram Botni Ulash</span>
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
