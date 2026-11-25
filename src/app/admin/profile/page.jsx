'use client';

import { useState, useEffect, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/lib/useLocale';
import {
  ShieldCheck,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Headphones,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  X,
} from 'lucide-react';

const MOD_PROFILE_DICT = {
  uz: {
    loading: 'Moderator profil sozlamalari yuklanmoqda...',
    roleBadge: 'Rasmiy TIU Moderatori',
    defaultName: 'TIU Moderatori',
    defaultPosition: 'Ilmiy bo‘lim koordinatori',
    contactAdminBtn: 'Adminga murojaat',
    emailCardTitle: 'Kirish Emailini O‘zgartirish',
    emailCardSub: 'Tizimga kirish uchun foydalaniladigan rasmiy email manzilingizni yangilang.',
    currentEmailLabel: 'Amaldagi kirish emaili:',
    newEmailLabel: 'Yangi email manzili:',
    newEmailPlaceholder: 'yangi_email@tiu.uz',
    confirmPassLabel: 'O‘zgarishni tasdiqlash uchun amaldagi parolingiz:',
    confirmPassPlaceholder: 'Amaldagi parolni kiriting',
    updateEmailBtn: 'Emailni yangilash',
    updatingBtn: 'Yangilanmoqda...',
    passCardTitle: 'Parolni Yangilash',
    passCardSub: 'Moderator hisobingiz xavfsizligi uchun mustahkam paroldan foydalaning.',
    currentPassLabel: 'Amaldagi parol:',
    currentPassPlaceholder: 'Hozirgi parolingiz',
    newPassLabel: 'Yangi parol (kamida 8 ta belgi):',
    newPassPlaceholder: 'Yangi mustahkam parol',
    strengthLabel: 'Mustahkamlik:',
    confirmNewPassLabel: 'Yangi parolni takrorlang:',
    confirmNewPassPlaceholder: 'Yangi parolni qayta kiriting',
    updatePassBtn: 'Parolni yangilash',
    strengthNone: 'Kiritilmagan',
    strengthWeak: 'Zaif',
    strengthMedium: 'O‘rtacha',
    strengthGood: 'Yaxshi',
    strengthStrong: 'Mustahkam',
    emailFieldsErr: 'Yangi email va amaldagi parolni kiriting',
    emailErrFallback: 'Emailni yangilashda xatolik',
    passMismatchErr: 'Yangi parol va tasdiqlovchi parol mos kelmadi!',
    passLengthErr: 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi lozim!',
    passErrFallback: 'Parolni yangilashda xatolik',
    networkErr: 'Tarmoq xatosi',
    modalBadge: 'Bosh Administrator Aloqasi',
    modalTitle: 'Adminga Murojaat Qilish',
    modalSubtitle: 'Tezkor yordam, tizim masalalari yoki ruxsatlar bo‘yicha Bosh Administrator bilan bevosita bog‘laning.',
    tgLabel: 'Admin Telegram Akkaunti:',
    tgWriteBtn: 'Telegramda yozish',
    phoneLabel: 'Telefon Raqamlari:',
    closeBtn: 'Yopish',
  },
  ru: {
    loading: 'Загрузка настроек профиля модератора...',
    roleBadge: 'Официальный модератор TIU',
    defaultName: 'Модератор TIU',
    defaultPosition: 'Координатор научного отдела',
    contactAdminBtn: 'Обратиться к админу',
    emailCardTitle: 'Изменить Email для входа',
    emailCardSub: 'Обновите официальный email-адрес, используемый для входа в систему.',
    currentEmailLabel: 'Текущий email входа:',
    newEmailLabel: 'Новый email-адрес:',
    newEmailPlaceholder: 'new_email@tiu.uz',
    confirmPassLabel: 'Текущий пароль для подтверждения:',
    confirmPassPlaceholder: 'Введите текущий пароль',
    updateEmailBtn: 'Обновить email',
    updatingBtn: 'Обновление...',
    passCardTitle: 'Обновить пароль',
    passCardSub: 'Используйте надёжный пароль для защиты аккаунта модератора.',
    currentPassLabel: 'Текущий пароль:',
    currentPassPlaceholder: 'Ваш текущий пароль',
    newPassLabel: 'Новый пароль (минимум 8 символов):',
    newPassPlaceholder: 'Новый надёжный пароль',
    strengthLabel: 'Надёжность:',
    confirmNewPassLabel: 'Повторите новый пароль:',
    confirmNewPassPlaceholder: 'Введите новый пароль ещё раз',
    updatePassBtn: 'Обновить пароль',
    strengthNone: 'Не введён',
    strengthWeak: 'Слабый',
    strengthMedium: 'Средний',
    strengthGood: 'Хороший',
    strengthStrong: 'Надёжный',
    emailFieldsErr: 'Введите новый email и текущий пароль',
    emailErrFallback: 'Ошибка при обновлении email',
    passMismatchErr: 'Новый пароль и подтверждение не совпадают!',
    passLengthErr: 'Новый пароль должен содержать минимум 8 символов!',
    passErrFallback: 'Ошибка при обновлении пароля',
    networkErr: 'Ошибка сети',
    modalBadge: 'Контакты главного администратора',
    modalTitle: 'Связаться с администратором',
    modalSubtitle: 'Свяжитесь напрямую с главным администратором через Telegram или по телефону.',
    tgLabel: 'Telegram-аккаунт админа:',
    tgWriteBtn: 'Написать в Telegram',
    phoneLabel: 'Контактные телефоны:',
    closeBtn: 'Закрыть',
  },
  en: {
    loading: 'Loading moderator profile settings...',
    roleBadge: 'Official TIU Moderator',
    defaultName: 'TIU Moderator',
    defaultPosition: 'Research Office Coordinator',
    contactAdminBtn: 'Contact Admin',
    emailCardTitle: 'Change Sign-In Email',
    emailCardSub: 'Update the official email address used to sign in to the portal.',
    currentEmailLabel: 'Current sign-in email:',
    newEmailLabel: 'New email address:',
    newEmailPlaceholder: 'new_email@tiu.uz',
    confirmPassLabel: 'Current password to confirm change:',
    confirmPassPlaceholder: 'Enter current password',
    updateEmailBtn: 'Update Email',
    updatingBtn: 'Updating...',
    passCardTitle: 'Update Password',
    passCardSub: 'Use a strong password to protect your moderator account.',
    currentPassLabel: 'Current password:',
    currentPassPlaceholder: 'Your current password',
    newPassLabel: 'New password (at least 8 characters):',
    newPassPlaceholder: 'New strong password',
    strengthLabel: 'Strength:',
    confirmNewPassLabel: 'Repeat new password:',
    confirmNewPassPlaceholder: 'Re-enter new password',
    updatePassBtn: 'Update Password',
    strengthNone: 'Not entered',
    strengthWeak: 'Weak',
    strengthMedium: 'Fair',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    emailFieldsErr: 'Please enter the new email and current password',
    emailErrFallback: 'Failed to update email',
    passMismatchErr: 'New password and confirmation do not match!',
    passLengthErr: 'New password must be at least 8 characters long!',
    passErrFallback: 'Failed to update password',
    networkErr: 'Network error',
    modalBadge: 'Head Administrator Contacts',
    modalTitle: 'Contact Administrator',
    modalSubtitle: 'Reach out directly to the Head Administrator via Telegram or phone for support and system access.',
    tgLabel: 'Admin Telegram Account:',
    tgWriteBtn: 'Message on Telegram',
    phoneLabel: 'Phone Numbers:',
    closeBtn: 'Close',
  },
};

export default function ModeratorProfilePage() {
  const locale = useLocale('uz');
  const tx = MOD_PROFILE_DICT[locale] || MOD_PROFILE_DICT.uz;

  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Moderator identity & admin contacts
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [positionUz, setPositionUz] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [adminContacts, setAdminContacts] = useState(null);

  // Form states for Email Change
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');

  // Form states for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok && data.success) {
        setUserEmail(data.user?.email || '');
        setAdminContacts(data.adminContacts);

        if (data.profile) {
          setFullName(data.profile.fullName || '');
          setPositionUz(data.profile.positionUz || '');
          setPhotoUrl(data.profile.photoUrl || '');
        }
      }
    } catch (err) {
      console.error('Failed to load moderator profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      loadData();
    });
  }, []);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !emailCurrentPassword) {
      setStatusMsg({ type: 'error', text: tx.emailFieldsErr });
      return;
    }

    setUpdatingEmail(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_EMAIL',
          newEmail,
          currentPassword: emailCurrentPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setUserEmail(data.newEmail);
        setNewEmail('');
        setEmailCurrentPassword('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || tx.emailErrFallback });
      }
    } catch {
      setStatusMsg({ type: 'error', text: tx.networkErr });
    } finally {
      setUpdatingEmail(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: tx.passMismatchErr });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMsg({ type: 'error', text: tx.passLengthErr });
      return;
    }

    setUpdatingPassword(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || tx.passErrFallback });
      }
    } catch {
      setStatusMsg({ type: 'error', text: tx.networkErr });
    } finally {
      setUpdatingPassword(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: tx.strengthNone, color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: tx.strengthWeak, color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 2) return { label: tx.strengthMedium, color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 3) return { label: tx.strengthGood, color: 'bg-blue-500', width: 'w-3/4' };
    return { label: tx.strengthStrong, color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(newPassword);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>{tx.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner with Moderator Identity & Contact Admin Modal Trigger */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/70 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              )}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{tx.roleBadge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {fullName || tx.defaultName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                {userEmail} • {positionUz || tx.defaultPosition}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAdminModalOpen(true)}
              className="glass-btn-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>{tx.contactAdminBtn}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Global Status Feedback Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-sm transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* SECURITY CARDS (EMAIL & PASSWORD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. EMAILNI O'ZGARTIRISH BLOKI */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-200/70 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AtSign className="w-5 h-5 text-blue-600" />
              {tx.emailCardTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tx.emailCardSub}
            </p>
          </div>

          <form onSubmit={handleChangeEmail} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">
                {tx.currentEmailLabel}
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold">
                {userEmail}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tx.newEmailLabel}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={tx.newEmailPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tx.confirmPassLabel}
              </label>
              <input
                type="password"
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                placeholder={tx.confirmPassPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updatingEmail || !newEmail || !emailCurrentPassword}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{updatingEmail ? tx.updatingBtn : tx.updateEmailBtn}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. PAROLNI O'ZGARTIRISH BLOKI */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-200/70 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-600" />
              {tx.passCardTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tx.passCardSub}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tx.currentPassLabel}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium pr-10"
                  placeholder={tx.currentPassPlaceholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tx.newPassLabel}
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium pr-10"
                  placeholder={tx.newPassPlaceholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>{tx.strengthLabel}</span>
                    <span>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tx.confirmNewPassLabel}
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                placeholder={tx.confirmNewPassPlaceholder}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updatingPassword || !currentPassword || !newPassword}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{updatingPassword ? tx.updatingBtn : tx.updatePassBtn}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* HEAD ADMIN CONTACT MODAL (Telegram & Phone Only) */}
      <AnimatePresence>
        {adminModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdminModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="neu-card w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-5 relative shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/60 border border-blue-200/70 dark:border-sky-800 px-2.5 py-0.5 rounded-full">
                    <Headphones className="w-3 h-3" />
                    <span>{tx.modalBadge}</span>
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                    {tx.modalTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tx.modalSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  aria-label={tx.closeBtn}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Admin Telegram Account */}
                <div className="neu-card-sm flex items-center gap-3 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#2AABEE]/15 text-[#2AABEE] flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {tx.tgLabel}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">
                      {adminContacts?.telegram || '@tiu_superadmin'}
                    </span>
                  </div>
                  <a
                    href={adminContacts?.telegramLink || 'https://t.me/tiu_superadmin'}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-btn-primary px-3 py-2 rounded-xl font-bold text-[11px] flex items-center gap-1.5 shrink-0"
                  >
                    <span>{tx.tgWriteBtn}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Admin Phone Numbers */}
                <div className="neu-card-sm flex items-start gap-3 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {tx.phoneLabel}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      <a
                        href={`tel:${adminContacts?.phone || '+998712000000'}`}
                        className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                      >
                        {adminContacts?.phone || '+998 71 200 00 00'}
                      </a>
                      {adminContacts?.secondaryPhone && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <a
                            href={`tel:${adminContacts.secondaryPhone}`}
                            className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                          >
                            {adminContacts.secondaryPhone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="glass-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {tx.closeBtn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
