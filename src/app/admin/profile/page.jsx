'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/useLocale';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  Send,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Award,
  UserCheck,
  Headphones,
  Save,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Smartphone,
} from 'lucide-react';

const MOD_PROFILE_DICT = {
  uz: {
    loading: 'Moderator profil sozlamalari yuklanmoqda...',
    roleBadge: 'Rasmiy TIU Moderatori',
    defaultName: 'TIU Moderatori',
    defaultPosition: 'Ilmiy bo‘lim koordinatori',
    contactAdminBtn: 'Adminga murojaat',
    tabProfile: '1. Shaxsiy va Xizmat Ma’lumotlari',
    tabSecurity: '2. Email & Parolni O‘zgartirish',
    tabContactAdmin: '3. Bosh Administratorga Bog‘lanish',
    detailsTitle: 'Xizmat va Aloqa Rekvizitlari',
    detailsSubtitle: 'Moderator sifatida platformada ko‘rinadigan rasmiy ma’lumotlaringiz va telefon raqamingiz.',
    saving: 'Saqlanmoqda...',
    saveChanges: 'O‘zgarishlarni saqlash',
  },
  ru: {
    loading: 'Загрузка настроек профиля модератора...',
    roleBadge: 'Официальный модератор TIU',
    defaultName: 'Модератор TIU',
    defaultPosition: 'Координатор научного отдела',
    contactAdminBtn: 'Обратиться к админу',
    tabProfile: '1. Личные и служебные данные',
    tabSecurity: '2. Изменение Email и пароля',
    tabContactAdmin: '3. Связь с главным администратором',
    detailsTitle: 'Служебные и контактные реквизиты',
    detailsSubtitle: 'Официальные данные и номер телефона модератора, отображаемые на платформе.',
    saving: 'Сохранение...',
    saveChanges: 'Сохранить изменения',
  },
  en: {
    loading: 'Loading moderator profile settings...',
    roleBadge: 'Official TIU Moderator',
    defaultName: 'TIU Moderator',
    defaultPosition: 'Research Office Coordinator',
    contactAdminBtn: 'Contact Admin',
    tabProfile: '1. Personal & Service Details',
    tabSecurity: '2. Change Email & Password',
    tabContactAdmin: '3. Contact Head Administrator',
    detailsTitle: 'Service & Contact Information',
    detailsSubtitle: 'Your official moderator details and contact phone displayed across the platform.',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
  },
};

export default function ModeratorProfilePage() {
  const locale = useLocale('uz');
  const tx = MOD_PROFILE_DICT[locale] || MOD_PROFILE_DICT.uz;
  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'SECURITY' | 'CONTACT_ADMIN'
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [adminContacts, setAdminContacts] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);

  // Form states for profile
  const [fullName, setFullName] = useState('');
  const [positionUz, setPositionUz] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [academicDegree, setAcademicDegree] = useState('PHD');
  const [academicTitle, setAcademicTitle] = useState('DOCENT');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bioUz, setBioUz] = useState('');

  // Form states for Email Change
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');

  // Form states for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Form states for Admin Inquiry
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('TEXNIK_MUAMMO');
  const [inquiryPriority, setInquiryPriority] = useState('NORMAL');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setUserEmail(data.user?.email || '');
        setFaculties(data.faculties || []);
        setAdminContacts(data.adminContacts);
        setRecentInquiries(data.recentInquiries || []);

        if (data.profile) {
          setFullName(data.profile.fullName || '');
          setPositionUz(data.profile.positionUz || 'Ilmiy bo‘lim koordinatori va moderatori');
          setDepartmentId(data.profile.departmentId || '');
          setAcademicDegree(data.profile.academicDegree || 'PHD');
          setAcademicTitle(data.profile.academicTitle || 'DOCENT');
          setPhone(data.profile.phone || '');
          setTelegramUsername(data.profile.telegramUsername || '');
          setPhotoUrl(data.profile.photoUrl || '');
          setBioUz(data.profile.bioUz || '');
        }
      }
    } catch (err) {
      console.error('Failed to load moderator profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Save Profile Details (F.I.SH, Telefon, Lavozim, Kafedra, etc.)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          fullName,
          positionUz,
          departmentId,
          academicDegree,
          academicTitle,
          phone,
          telegramUsername,
          photoUrl,
          bioUz,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'Profil sozlamalari muvaffaqiyatli saqlandi!' });
        setProfile(data.profile);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Xatolik yuz berdi' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // 2. Change Email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !emailCurrentPassword) {
      setStatusMsg({ type: 'error', text: 'Yangi email va amaldagi parolni kiriting' });
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
        setStatusMsg({ type: 'error', text: data.error || 'Emailni yangilashda xatolik' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setUpdatingEmail(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Yangi parol va tasdiqlovchi parol mos kelmadi!' });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMsg({ type: 'error', text: 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi lozim!' });
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
        setStatusMsg({ type: 'error', text: data.error || 'Parolni yangilashda xatolik' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setUpdatingPassword(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // 4. Send Admin Inquiry
  const handleSendAdminInquiry = async (e) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;

    setSendingInquiry(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: inquirySubject.trim(),
          category: inquiryCategory,
          priority: inquiryPriority,
          messageText: inquiryMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setInquirySubject('');
        setInquiryMessage('');
        loadData();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Yuborishda xatolik' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSendingInquiry(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Kiritilmagan', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Zaif', color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 2) return { label: 'O‘rtacha', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Yaxshi', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Mustahkam', color: 'bg-emerald-500', width: 'w-full' };
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
      {/* Top Banner with Moderator Identity */}
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
            <button
              type="button"
              onClick={() => setActiveTab('CONTACT_ADMIN')}
              className="glass-btn-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>{tx.contactAdminBtn}</span>
            </button>
          </div>
        </div>

        {/* 3 Focused Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'PROFILE'
                ? 'glass-btn-primary shadow-sm'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${activeTab === 'PROFILE' ? 'text-white' : 'text-blue-600'}`} />
            <span>{tx.tabProfile}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'SECURITY'
                ? 'glass-btn-primary shadow-sm'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <KeyRound className={`w-3.5 h-3.5 ${activeTab === 'SECURITY' ? 'text-white' : 'text-purple-500'}`} />
            <span>{tx.tabSecurity}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONTACT_ADMIN')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'CONTACT_ADMIN'
                ? 'glass-btn-primary shadow-sm'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Headphones className={`w-3.5 h-3.5 ${activeTab === 'CONTACT_ADMIN' ? 'text-white' : 'text-blue-500'}`} />
            <span>{tx.tabContactAdmin}</span>
          </button>
        </div>
      </div>

      {/* Global Status Feedback Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-sm transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
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

      {/* ======================================================== */}
      {/* TAB 1: MODERATOR PROFILE & SERVICE DETAILS (Telefon, F.I.SH, Lavozim) */}
      {/* ======================================================== */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  {tx.detailsTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tx.detailsSubtitle}
                </p>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? tx.saving : tx.saveChanges}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">F.I.SH (To‘liq ism):</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Masalan: Dr. Alisher Navoiy"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Rasmiy Xizmat Lavozimi:</label>
                <input
                  type="text"
                  value={positionUz}
                  onChange={(e) => setPositionUz(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Masalan: Ilmiy bo‘lim koordinatori va moderatori"
                />
              </div>

              {/* TELEFON RAQAMINI O'ZGARTIRISH */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Telefon Raqami (Aloqa uchun):</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="+998 90 123 45 67"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Universitet ilmiy bo‘limi va olimlar bilan bog‘lanish uchun asosiy telefon raqamingiz.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Telegram Username (@belgisiz):</label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="tiu_moderator"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Biriktirilgan Kafedra / Fakultet:</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium bg-white"
                >
                  <option value="">Kafedrani tanlang</option>
                  {faculties.map((f) => (
                    <optgroup key={f.id} label={f.nameUz}>
                      {(f.departments || []).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameUz}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Ilmiy Darajasi:</label>
                <select
                  value={academicDegree}
                  onChange={(e) => setAcademicDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium bg-white"
                >
                  <option value="NONE">Darajasiz / Mutaxassis</option>
                  <option value="MASTER">Magistr</option>
                  <option value="PHD">Falsafa doktori (PhD)</option>
                  <option value="DSC">Fan doktori (DSc)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Ilmiy Unvoni:</label>
                <select
                  value={academicTitle}
                  onChange={(e) => setAcademicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium bg-white"
                >
                  <option value="NONE">Unvonsiz</option>
                  <option value="ASSISTANT">Assistent / O‘qituvchi</option>
                  <option value="DOCENT">Dotsent</option>
                  <option value="PROFESSOR">Professor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Fotosurat URL manzili (Avatar):</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="https://... yoki /avatars/..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Moderatorlik yo‘nalishi va qabul/konsultatsiya soatlari:
                </label>
                <textarea
                  rows={3}
                  value={bioUz}
                  onChange={(e) => setBioUz(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Masalan: Maqolalarni qabul qilish va ekspertiza vaqtlari: Dushanba-Juma 14:00 - 17:00..."
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACCOUNT SECURITY (EMAIL VA PAROLNI O'ZGARTIRISH) */}
      {/* ======================================================== */}
      {activeTab === 'SECURITY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. EMAILNI O'ZGARTIRISH BLOKI */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AtSign className="w-5 h-5 text-blue-600" />
                Kirish Emailini O‘zgartirish
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tizimga kirish uchun foydalaniladigan rasmiy email manzilingizni yangilang.
              </p>
            </div>

            <form onSubmit={handleChangeEmail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Amaldagi kirish emaili:</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold">
                  {userEmail}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi email manzili:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="yangi_email@tiu.uz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  O‘zgarishni tasdiqlash uchun amaldagi parolingiz:
                </label>
                <input
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder="Amaldagi parolni kiriting"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingEmail || !newEmail || !emailCurrentPassword}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{updatingEmail ? 'Yangilanmoqda...' : 'Emailni yangilash'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. PAROLNI O'ZGARTIRISH BLOKI */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                Parolni Yangilash
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Moderator hisobingiz xavfsizligi uchun mustahkam paroldan foydalaning.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amaldagi parol:</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium pr-10"
                    placeholder="Hozirgi parolingiz"
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
                <label className="block font-bold text-slate-700 mb-1">Yangi parol (kamida 8 ta belgi):</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium pr-10"
                    placeholder="Yangi mustahkam parol"
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
                      <span>Mustahkamlik:</span>
                      <span>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi parolni takrorlang:</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Yangi parolni qayta kiriting"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword || !currentPassword || !newPassword}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{updatingPassword ? 'Yangilanmoqda...' : 'Parolni yangilash 🔐'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CONTACT SUPER ADMIN & SEND ESCALATION INQUIRY */}
      {/* ======================================================== */}
      {activeTab === 'CONTACT_ADMIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Admin Contact Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Rasmiy Aloqa
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Bosh Administrator Infolari
                </h3>
                <p className="text-xs text-slate-500">
                  Favqulodda yoki bevosita murojaat qilish uchun rasmiy kontaktlar.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">TIU Bosh Administratsiyasi</span>
                    <span className="text-slate-500 text-[11px]">{adminContacts?.office}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Telefon raqamlari:</span>
                    <a href={`tel:${adminContacts?.phone}`} className="font-bold text-slate-800 hover:text-blue-600">
                      {adminContacts?.phone}
                    </a>
                    <span className="text-slate-400 mx-1">|</span>
                    <a href={`tel:${adminContacts?.secondaryPhone}`} className="font-bold text-slate-800 hover:text-blue-600">
                      {adminContacts?.secondaryPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Send className="w-4 h-4 text-[#2AABEE] shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Telegram Akkaunt:</span>
                      <span className="font-bold text-slate-800">{adminContacts?.telegram}</span>
                    </div>
                    <a
                      href={adminContacts?.telegramLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#2AABEE]/10 text-[#2AABEE] font-bold text-[11px] hover:bg-[#2AABEE]/20 flex items-center gap-1"
                    >
                      <span>Yozish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Rasmiy Email:</span>
                    <a href={`mailto:${adminContacts?.email}`} className="font-bold text-slate-800 hover:text-blue-600">
                      {adminContacts?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Qabul va Ish Vaqti:</span>
                    <span className="font-medium text-slate-700">{adminContacts?.workingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Previously sent inquiries */}
            {recentInquiries.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Yuborilgan Murojaatlaringiz Tarixi ({recentInquiries.length})
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {recentInquiries.map((inq) => (
                    <div key={inq.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">
                          {inq.subject}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {inq.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{inq.messageText}</p>
                      <div className="text-[9px] text-slate-400 font-mono text-right">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Inquiry / Escalation Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSendAdminInquiry} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Bosh Administratorga Murojaat / Xabar Yuborish
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Texnik muammo, yangi ilmiy yo‘nalish taklifi yoki tizim ruxsatlari bo‘yicha Adminga xabar yo‘llang.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Murojaat turi (Kategoriya):</label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold bg-white"
                  >
                    <option value="TEXNIK_MUAMMO">🛠 Texnik muammo yoki tizim xatosi</option>
                    <option value="RUXSAT_SOROVI">🔐 Qo‘shimcha tizim ruxsatlari / Vakolat so‘rovi</option>
                    <option value="ILMIY_YONALISH">📚 Yangi ilmiy yo‘nalish, grant yoki kafedra qo‘shish</option>
                    <option value="SHOSHILINCH">🚨 Shoshilinch / Favqulodda xabarnoma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muhimlik darajasi:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'NORMAL', label: 'Oddiy' },
                      { id: 'URGENT', label: 'Muhim (Tezkor)' },
                      { id: 'CRITICAL', label: 'Favqulodda 🚨' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setInquiryPriority(p.id)}
                        className={`py-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                          inquiryPriority === p.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Murojaat mavzusi:</label>
                  <input
                    type="text"
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    placeholder="Masalan: Yurisprudensiya kafedrasi yangi grant loyihasi bo‘yicha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batafsil xabar yoki muammo matni:</label>
                  <textarea
                    rows={6}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Muammoni yoki taklifingizni batafsil tushuntiring. Ushbu xabar bevosita Bosh Administrator bildirishnomalari va Telegramiga yetkaziladi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingInquiry || !inquirySubject.trim() || !inquiryMessage.trim()}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingInquiry ? 'Yuborilmoqda...' : 'Adminga xabarni yuborish 🚀'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
