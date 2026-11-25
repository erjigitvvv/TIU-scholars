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
  User,
  Pencil,
  X,
  Save,
} from 'lucide-react';

const MOD_PROFILE_DICT = {
  uz: {
    loading: 'Moderator profil sozlamalari yuklanmoqda...',
    roleBadge: 'Rasmiy TIU Moderatori',
    defaultName: 'TIU Moderatori',
    defaultPosition: 'Ilmiy bo‘lim koordinatori',
    contactAdminBtn: 'Adminga murojaat',
    editBtn: 'Tahrirlash',
    cancelBtn: 'Bekor qilish',
    saveBtn: 'Saqlash',
    savingBtn: 'Saqlanmoqda...',
    profileTitle: 'Moderator Profil & Xavfsizlik Sozlamalari',
    profileSub: 'Shaxsiy maʼlumotlar, kirish emaili va parolni faqat qalam (tahrirlash) tugmasi orqali o‘zgartirishingiz mumkin.',
    
    // F.I.SH
    fullNameTitle: 'F.I.SH (To‘liq ism)',
    fullNameDesc: 'Tizimda, rasmiy xulosalarda va audit jurnallarida aks etuvchi ismingiz.',
    fullNameLabel: 'To‘liq ism sharif:',
    fullNamePlaceholder: 'Familiya Ism Sharifingizni kiriting',
    fullNameEmptyErr: 'To‘liq ismingizni kiritishingiz shart!',
    fullNameSuccess: 'F.I.SH muvaffaqiyatli yangilandi! ✅',
    
    // Email
    emailTitle: 'Kirish Emaili',
    emailDesc: 'Tizimga kirish va rasmiy bildirishnomalarni qabul qilish manzili.',
    currentEmailLabel: 'Amaldagi email:',
    newEmailLabel: 'Yangi email manzili:',
    newEmailPlaceholder: 'yangi_email@tiu.uz',
    confirmPassLabel: 'O‘zgarishni tasdiqlash uchun amaldagi parolingiz:',
    confirmPassPlaceholder: 'Amaldagi parolni kiriting',
    emailFieldsErr: 'Yangi email va amaldagi parolni kiriting',
    emailErrFallback: 'Emailni yangilashda xatolik',
    
    // Password
    passwordTitle: 'Xavfsizlik Paroli',
    passwordDesc: 'Moderator hisobingiz xavfsizligini taʼminlovchi maxfiy parol.',
    maskedPass: '••••••••••••••••',
    passSecurityBadge: 'Oxirgi marta xavfsiz shifrlangan',
    currentPassLabel: 'Amaldagi parol:',
    currentPassPlaceholder: 'Hozirgi parolingiz',
    newPassLabel: 'Yangi parol (kamida 8 ta belgi):',
    newPassPlaceholder: 'Yangi mustahkam parol',
    strengthLabel: 'Mustahkamlik:',
    confirmNewPassLabel: 'Yangi parolni takrorlang:',
    confirmNewPassPlaceholder: 'Yangi parolni qayta kiriting',
    strengthNone: 'Kiritilmagan',
    strengthWeak: 'Zaif',
    strengthMedium: 'O‘rtacha',
    strengthGood: 'Yaxshi',
    strengthStrong: 'Mustahkam',
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
    editBtn: 'Редактировать',
    cancelBtn: 'Отмена',
    saveBtn: 'Сохранить',
    savingBtn: 'Сохранение...',
    profileTitle: 'Профиль модератора и настройки безопасности',
    profileSub: 'Ф.И.О., email и пароль защищены от случайных правок и изменяются строго по клику на значок карандаша.',

    // F.I.SH
    fullNameTitle: 'Ф.И.О. (Полное имя)',
    fullNameDesc: 'Ваше имя, отображаемое в системе, официальных протоколах и аудит-журналах.',
    fullNameLabel: 'Полное имя:',
    fullNamePlaceholder: 'Введите ваше полное имя',
    fullNameEmptyErr: 'Введите ваше полное имя!',
    fullNameSuccess: 'Ф.И.О. успешно обновлено! ✅',

    // Email
    emailTitle: 'Email для входа',
    emailDesc: 'Адрес для авторизации в системе и получения официальных уведомлений.',
    currentEmailLabel: 'Текущий email:',
    newEmailLabel: 'Новый email-адрес:',
    newEmailPlaceholder: 'new_email@tiu.uz',
    confirmPassLabel: 'Текущий пароль для подтверждения:',
    confirmPassPlaceholder: 'Введите текущий пароль',
    emailFieldsErr: 'Введите новый email и текущий пароль',
    emailErrFallback: 'Ошибка при обновлении email',

    // Password
    passwordTitle: 'Пароль безопасности',
    passwordDesc: 'Секретный ключ защиты аккаунта модератора с двухфакторным контролем.',
    maskedPass: '••••••••••••••••',
    passSecurityBadge: 'Безопасно зашифрован',
    currentPassLabel: 'Текущий пароль:',
    currentPassPlaceholder: 'Ваш текущий пароль',
    newPassLabel: 'Новый пароль (минимум 8 символов):',
    newPassPlaceholder: 'Новый надёжный пароль',
    strengthLabel: 'Надёжность:',
    confirmNewPassLabel: 'Повторите новый пароль:',
    confirmNewPassPlaceholder: 'Введите новый пароль ещё раз',
    strengthNone: 'Не введён',
    strengthWeak: 'Слабый',
    strengthMedium: 'Средний',
    strengthGood: 'Хороший',
    strengthStrong: 'Надёжный',
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
    editBtn: 'Edit',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    savingBtn: 'Saving...',
    profileTitle: 'Moderator Profile & Security Settings',
    profileSub: 'Full name, sign-in email, and password are kept safe and can only be modified by clicking the pencil icon.',

    // F.I.SH
    fullNameTitle: 'Full Name',
    fullNameDesc: 'Your official name displayed across the system, audit records, and approvals.',
    fullNameLabel: 'Full name:',
    fullNamePlaceholder: 'Enter your full name',
    fullNameEmptyErr: 'Full name cannot be empty!',
    fullNameSuccess: 'Full name updated successfully! ✅',

    // Email
    emailTitle: 'Sign-in Email',
    emailDesc: 'Address used to sign in to the portal and receive system alerts.',
    currentEmailLabel: 'Current email:',
    newEmailLabel: 'New email address:',
    newEmailPlaceholder: 'new_email@tiu.uz',
    confirmPassLabel: 'Current password to confirm change:',
    confirmPassPlaceholder: 'Enter current password',
    emailFieldsErr: 'Please enter the new email and current password',
    emailErrFallback: 'Failed to update email',

    // Password
    passwordTitle: 'Account Password',
    passwordDesc: 'Encrypted secret key protecting your administrative account.',
    maskedPass: '••••••••••••••••',
    passSecurityBadge: 'Safely encrypted and protected',
    currentPassLabel: 'Current password:',
    currentPassPlaceholder: 'Your current password',
    newPassLabel: 'New password (at least 8 characters):',
    newPassPlaceholder: 'New strong password',
    strengthLabel: 'Strength:',
    confirmNewPassLabel: 'Repeat new password:',
    confirmNewPassPlaceholder: 'Re-enter new password',
    strengthNone: 'Not entered',
    strengthWeak: 'Weak',
    strengthMedium: 'Fair',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
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
  const [statusMsg, setStatusMsg] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Moderator identity & admin contacts
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [positionUz, setPositionUz] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [adminContacts, setAdminContacts] = useState(null);

  // Edit toggles controlled ONLY by pencil buttons
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Form states for Name Change
  const [editFullName, setEditFullName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Form states for Email Change
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Form states for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok && data.success) {
        setUserEmail(data.user?.email || '');
        setAdminContacts(data.adminContacts);

        if (data.profile) {
          const loadedName = data.profile.fullName || '';
          setFullName(loadedName);
          setEditFullName(loadedName);
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

  // Save Full Name (F.I.SH)
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      setStatusMsg({ type: 'error', text: tx.fullNameEmptyErr });
      return;
    }

    setUpdatingName(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          fullName: editFullName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFullName(editFullName.trim());
        setIsEditingName(false);
        setStatusMsg({ type: 'success', text: tx.fullNameSuccess });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'F.I.SH saqlashda xatolik yuz berdi' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: tx.networkErr });
    } finally {
      setUpdatingName(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Save Email
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
        setIsEditingEmail(false);
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

  // Save Password
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
        setIsEditingPassword(false);
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner with Moderator Identity & Contact Admin Trigger */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/70 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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
        </motion.div>
      )}

      {/* SECTION HEADER */}
      <div className="px-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          {tx.profileTitle}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {tx.profileSub}
        </p>
      </div>

      {/* THREE INTERACTIVE ROWS (F.I.SH, MAIL, PAROL) WITH PENCIL ICONS */}
      <div className="space-y-4">
        {/* ============================================================ */}
        {/* 1. F.I.SH (FULL NAME) ROW */}
        {/* ============================================================ */}
        <div className="neu-card rounded-2xl p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {tx.fullNameTitle}
                </div>
                {!isEditingName ? (
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {fullName || tx.defaultName}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tx.fullNameDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Pencil Button to trigger edit mode */}
            {!isEditingName && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditFullName(fullName || '');
                  setIsEditingName(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/60 dark:text-slate-200 dark:hover:text-blue-300 font-bold text-xs transition border border-slate-200/80 dark:border-slate-700 shrink-0 cursor-pointer"
                title={tx.editBtn}
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{tx.editBtn}</span>
              </motion.button>
            )}
          </div>

          {/* Expandable Edit Mode for F.I.SH */}
          <AnimatePresence>
            {isEditingName && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveName}
                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tx.fullNameLabel}
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder={tx.fullNamePlaceholder}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                    autoFocus
                    required
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {tx.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={updatingName || !editFullName.trim()}
                      className="glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{updatingName ? tx.savingBtn : tx.saveBtn}</span>
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* 2. EMAIL (KIRISH EMAILI) ROW */}
        {/* ============================================================ */}
        <div className="neu-card rounded-2xl p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                <AtSign className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {tx.emailTitle}
                </div>
                {!isEditingEmail ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white truncate">
                      {userEmail}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Rasmiy
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tx.emailDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Pencil Button to trigger email change */}
            {!isEditingEmail && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setNewEmail('');
                  setEmailCurrentPassword('');
                  setIsEditingEmail(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-950/60 dark:text-slate-200 dark:hover:text-emerald-300 font-bold text-xs transition border border-slate-200/80 dark:border-slate-700 shrink-0 cursor-pointer"
                title={tx.editBtn}
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{tx.editBtn}</span>
              </motion.button>
            )}
          </div>

          {/* Expandable Edit Mode for Email */}
          <AnimatePresence>
            {isEditingEmail && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangeEmail}
                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tx.newEmailLabel}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={tx.newEmailPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                      autoFocus
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {tx.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={updatingEmail || !newEmail || !emailCurrentPassword}
                    className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{updatingEmail ? tx.savingBtn : tx.saveBtn}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* 3. PAROL (PASSWORD) ROW */}
        {/* ============================================================ */}
        <div className="neu-card rounded-2xl p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {tx.passwordTitle}
                </div>
                {!isEditingPassword ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base sm:text-lg font-mono font-black text-slate-800 dark:text-slate-200 tracking-wider">
                      {tx.maskedPass}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      {tx.passSecurityBadge}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tx.passwordDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Pencil Button to trigger password change */}
            {!isEditingPassword && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setIsEditingPassword(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 dark:bg-slate-800 dark:hover:bg-purple-950/60 dark:text-slate-200 dark:hover:text-purple-300 font-bold text-xs transition border border-slate-200/80 dark:border-slate-700 shrink-0 cursor-pointer"
                title={tx.editBtn}
              >
                <Pencil className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{tx.editBtn}</span>
              </motion.button>
            )}
          </div>

          {/* Expandable Edit Mode for Password */}
          <AnimatePresence>
            {isEditingPassword && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangePassword}
                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tx.currentPassLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium pr-10 focus:outline-none focus:border-purple-500"
                        placeholder={tx.currentPassPlaceholder}
                        autoFocus
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

                  {/* New Password */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tx.newPassLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium pr-10 focus:outline-none focus:border-purple-500"
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
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>{tx.strengthLabel}</span>
                          <span>{strength.label}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tx.confirmNewPassLabel}
                    </label>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                      placeholder={tx.confirmNewPassPlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {tx.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPassword || !currentPassword || !newPassword}
                    className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{updatingPassword ? tx.savingBtn : tx.saveBtn}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HEAD ADMIN CONTACT MODAL (Telegram & Phone Only) */}
      <AnimatePresence>
        {adminModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="neu-card rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {tx.modalBadge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {tx.modalTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tx.modalSubtitle}
                </p>
              </div>

              {/* Direct Telegram & Phone Info Cards */}
              <div className="space-y-3">
                {/* 1. Telegram Card */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Send className="w-5 h-5 -rotate-12" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tx.tgLabel}
                      </div>
                      <div className="text-sm font-black font-mono text-blue-700 dark:text-blue-300">
                        {adminContacts?.telegram || '@tiu_admin'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={adminContacts?.telegramLink || 'https://t.me/tiu_admin'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{tx.tgWriteBtn}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 2. Phone Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tx.phoneLabel}
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        {adminContacts?.phone || '+998 95 131 55 55'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${adminContacts?.phone || '+998951315555'}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Qo‘ng‘iroq</span>
                  </a>
                </div>
              </div>

              {/* Close Button at bottom */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
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
