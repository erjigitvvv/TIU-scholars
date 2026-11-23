'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Save,
  Camera,
  Trash2,
  Plus,
  Link2,
  Award,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Users,
  Building2,
  Lock,
  Mail,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import ScholarAvatar from '@/components/ui/ScholarAvatar';
import AcademicSyncSection from '@/components/dashboard/AcademicSyncSection';
import TelegramStatusCard from '@/components/dashboard/TelegramStatusCard';

const COPY = {
  uz: {
    title: 'Profil sozlamalari',
    subtitle: "Shaxsiy ma'lumotlar, biografiya, ilmiy havolalar va xavfsizlikni boshqaring.",
    tabPersonal: "Shaxsiy va akademik",
    tabBio: 'Biografiya va faoliyat',
    tabLinks: 'Integratsiya va havolalar',
    tabSecurity: 'Xavfsizlik va parol',
    syncBtn: 'ORCID dan sinxronlash',
    syncing: 'Sinxronlanmoqda...',
    loading: 'Profil yuklanmoqda...',
    notFound: 'Profil topilmadi.',
    savedMsg: 'Profil muvaffaqiyatli yangilandi!',
    photoUploadedMsg: 'Profil rasmi muvaffaqiyatli yuklandi!',
    syncedMsg: 'ORCID dan nashrlar muvaffaqiyatli sinxronlandi!',
    orcidRequired: 'Avval ORCID ID kiriting.',
    uploadPhoto: 'Rasm yuklash',
    uploadingPhoto: 'Yuklanmoqda...',
    removePhoto: "O'chirish",
    photoHint: 'JPG, PNG yoki WEBP (max 5MB)',
    fullName: "To'liq ism-familiya (F.I.Sh.)",
    degree: 'Ilmiy daraja',
    academicTitle: 'Ilmiy unvon',
    publicEmail: 'Ommaviy email',
    faculty: 'Fakultet',
    department: 'Kafedra',
    position: 'Lavozimi',
    positionPh: "Masalan: Kafedra mudiri / Professor-o'qituvchi",
    scientificActivity: 'Ilmiy faoliyat haqida',
    scientificActivityPh: "Ilmiy rahbarlik, loyihalar, tajriba va asosiy yutuqlar...",
    bioTabLabel: 'Biografiya matni',
    langUz: "O'zbekcha",
    langRu: 'Ruscha',
    langEn: 'Inglizcha',
    bioPhUz: "O'zbek tilidagi akademik biografiyangiz...",
    bioPhRu: 'Академическая биография на русском...',
    bioPhEn: 'Academic biography in English...',
    interests: "Ilmiy yo'nalishlar (vergul bilan ajrating)",
    linksTitle: 'Ilmiy va ijtimoiy tarmoq havolalari',
    orcidId: 'ORCID ID',
    scopusId: 'Scopus Author ID',
    scholarUrl: 'Google Scholar',
    linkedin: 'LinkedIn',
    telegram: 'Telegram (@username yoki havola)',
    researchGate: 'ResearchGate',
    wos: 'Web of Science / Publons',
    website: 'Shaxsiy veb-sayt / Portfolio',
    customLinks: "Qo'shimcha havolalar",
    addCustomLink: "Boshqa havola qo'shish",
    linkLabelPh: 'Platforma nomi (masalan: GitHub)',
    linkUrlPh: 'https://...',
    saveBtn: "O'zgarishlarni saqlash",
    saving: 'Saqlanmoqda...',
    rankLabel: 'Reyting',
    scoreLabel: 'TIU Ball',
    grantsLabel: 'Grantlar',
    supervisionsLabel: 'Shogirdlar',
    coAuthorsLabel: 'Hammualliflar',
    pwTitle: "Parolni o'zgartirish",
    pwCurrent: 'Joriy parol',
    pwNew: 'Yangi parol',
    pwConfirm: 'Yangi parolni tasdiqlang',
    pwBtn: 'Parolni yangilash',
    pwSuccess: 'Parol muvaffaqiyatli yangilandi!',
    emailTitle: "Kirish emailini o'zgartirish",
    emailNew: 'Yangi login email',
    emailCurrentPw: 'Tasdiqlash uchun joriy parol',
    emailBtn: 'Emailni yangilash',
    emailSuccess: 'Kirish emaili muvaffaqiyatli yangilandi!',
    twoFaTitle: 'Ikki bosqichli himoya (2FA)',
    twoFaDesc: 'Hisobingiz parol bilan himoyalangan. Tez orada Telegram / Email orqali 2FA tasdiqlash qo‘shiladi.',
  },
  ru: {
    title: 'Настройки профиля',
    subtitle: 'Управляйте личными данными, биографией, научными ссылками и безопасностью.',
    tabPersonal: 'Личные и академические',
    tabBio: 'Биография и деятельность',
    tabLinks: 'Интеграции и ссылки',
    tabSecurity: 'Безопасность и пароль',
    syncBtn: 'Синхронизация с ORCID',
    syncing: 'Синхронизация...',
    loading: 'Загрузка профиля...',
    notFound: 'Профиль не найден.',
    savedMsg: 'Профиль успешно обновлён!',
    photoUploadedMsg: 'Фото профиля успешно обновлено!',
    syncedMsg: 'Публикации из ORCID успешно синхронизированы!',
    orcidRequired: 'Сначала введите ORCID ID.',
    uploadPhoto: 'Загрузить фото',
    uploadingPhoto: 'Загрузка...',
    removePhoto: 'Удалить',
    photoHint: 'JPG, PNG или WEBP (до 5MB)',
    fullName: 'Полное имя (ФИО)',
    degree: 'Степень',
    academicTitle: 'Звание',
    publicEmail: 'Публичный email',
    faculty: 'Факультет',
    department: 'Кафедра',
    position: 'Должность',
    positionPh: 'Например: Заведующий кафедрой / Преподаватель',
    scientificActivity: 'О научной деятельности',
    scientificActivityPh: 'Научное руководство, проекты, опыт и достижения...',
    bioTabLabel: 'Текст биографии',
    langUz: 'Узбекский',
    langRu: 'Русский',
    langEn: 'Английский',
    bioPhUz: 'Биография на узбекском...',
    bioPhRu: 'Академическая биография на русском...',
    bioPhEn: 'Academic biography in English...',
    interests: 'Научные интересы (через запятую)',
    linksTitle: 'Научные и социальные ссылки',
    orcidId: 'ORCID ID',
    scopusId: 'Scopus Author ID',
    scholarUrl: 'Google Scholar',
    linkedin: 'LinkedIn',
    telegram: 'Telegram (@username или ссылка)',
    researchGate: 'ResearchGate',
    wos: 'Web of Science / Publons',
    website: 'Личный сайт / Портфолио',
    customLinks: 'Дополнительные ссылки',
    addCustomLink: 'Добавить ссылку',
    linkLabelPh: 'Название (например: GitHub)',
    linkUrlPh: 'https://...',
    saveBtn: 'Сохранить изменения',
    saving: 'Сохранение...',
    rankLabel: 'Рейтинг',
    scoreLabel: 'Балл TIU',
    grantsLabel: 'Гранты',
    supervisionsLabel: 'Соискатели',
    coAuthorsLabel: 'Соавторы',
    pwTitle: 'Изменить пароль',
    pwCurrent: 'Текущий пароль',
    pwNew: 'Новый пароль',
    pwConfirm: 'Повторите новый пароль',
    pwBtn: 'Обновить пароль',
    pwSuccess: 'Пароль успешно изменён!',
    emailTitle: 'Изменить email для входа',
    emailNew: 'Новый email для входа',
    emailCurrentPw: 'Текущий пароль для подтверждения',
    emailBtn: 'Обновить email',
    emailSuccess: 'Email для входа успешно обновлён!',
    twoFaTitle: 'Двухфакторная защита (2FA)',
    twoFaDesc: 'Ваш аккаунт защищён паролем. Скоро будет добавлено подтверждение 2FA.',
  },
  en: {
    title: 'Profile Settings',
    subtitle: 'Manage personal details, biography, academic integrations, and security.',
    tabPersonal: 'Personal & Academic',
    tabBio: 'Biography & Activity',
    tabLinks: 'Integrations & Links',
    tabSecurity: 'Security & Password',
    syncBtn: 'Sync from ORCID',
    syncing: 'Syncing...',
    loading: 'Loading profile...',
    notFound: 'Profile not found.',
    savedMsg: 'Profile successfully updated!',
    photoUploadedMsg: 'Profile photo updated successfully!',
    syncedMsg: 'Successfully synced public works from ORCID!',
    orcidRequired: 'Please enter your ORCID ID first.',
    uploadPhoto: 'Upload Photo',
    uploadingPhoto: 'Uploading...',
    removePhoto: 'Remove',
    photoHint: 'JPG, PNG, or WEBP (max 5MB)',
    fullName: 'Full Name (F.I.Sh.)',
    degree: 'Degree',
    academicTitle: 'Title',
    publicEmail: 'Public Email',
    faculty: 'Faculty',
    department: 'Department',
    position: 'Position / Role',
    positionPh: 'e.g. Head of Department / Lecturer',
    scientificActivity: 'Scientific Activity Overview',
    scientificActivityPh: 'Research leadership, projects, experience, and achievements...',
    bioTabLabel: 'Biography Text',
    langUz: 'Uzbek',
    langRu: 'Russian',
    langEn: 'English',
    bioPhUz: 'Academic biography in Uzbek...',
    bioPhRu: 'Academic biography in Russian...',
    bioPhEn: 'Academic biography in English...',
    interests: 'Research Interests (comma separated)',
    linksTitle: 'Academic & Social Links',
    orcidId: 'ORCID ID',
    scopusId: 'Scopus Author ID',
    scholarUrl: 'Google Scholar',
    linkedin: 'LinkedIn',
    telegram: 'Telegram (@username or URL)',
    researchGate: 'ResearchGate',
    wos: 'Web of Science / Publons',
    website: 'Personal Website / Portfolio',
    customLinks: 'Additional Links',
    addCustomLink: 'Add Other Link',
    linkLabelPh: 'Platform name (e.g. GitHub)',
    linkUrlPh: 'https://...',
    saveBtn: 'Save Changes',
    saving: 'Saving...',
    rankLabel: 'Rank',
    scoreLabel: 'TIU Score',
    grantsLabel: 'Grants',
    supervisionsLabel: 'Supervisions',
    coAuthorsLabel: 'Co-authors',
    pwTitle: 'Change Password',
    pwCurrent: 'Current Password',
    pwNew: 'New Password',
    pwConfirm: 'Confirm New Password',
    pwBtn: 'Update Password',
    pwSuccess: 'Password updated successfully!',
    emailTitle: 'Change Login Email',
    emailNew: 'New Login Email',
    emailCurrentPw: 'Current Password to Confirm',
    emailBtn: 'Update Email',
    emailSuccess: 'Login email updated successfully!',
    twoFaTitle: 'Two-Factor Authentication (2FA)',
    twoFaDesc: 'Your account is protected with a password. 2FA verification will be available soon.',
  },
};

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : 'uz';
}

export default function ProfilePage() {
  const [locale, setLocale] = useState('uz');
  const [activeTab, setActiveTab] = useState('personal'); // personal | bio | links | security
  const [bioLang, setBioLang] = useState('uz'); // uz | ru | en
  const [profile, setProfile] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [ratingSummary, setRatingSummary] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    position: '',
    scientificActivity: '',
    linkedin: '',
    telegram: '',
    researchGate: '',
    wos: '',
    website: '',
    custom: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPw, setChangingPw] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [changingEmail, setChangingEmail] = useState(false);

  const t = COPY[locale] || COPY.uz;

  const showToast = (text, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/dashboard/profile');
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setSelectedFacultyId(data.profile.department?.facultyId || '');
      }
      if (data.accountEmail) {
        setEmailForm((prev) => ({ ...prev, newEmail: data.accountEmail }));
      }
      if (Array.isArray(data.faculties)) setFaculties(data.faculties);
      if (data.ratingSummary) setRatingSummary(data.ratingSummary);
      if (data.socialLinks) {
        setSocialLinks({
          position: data.socialLinks.position || '',
          scientificActivity: data.socialLinks.scientificActivity || '',
          linkedin: data.socialLinks.linkedin || '',
          telegram: data.socialLinks.telegram || '',
          researchGate: data.socialLinks.researchGate || '',
          wos: data.socialLinks.wos || '',
          website: data.socialLinks.website || '',
          custom: Array.isArray(data.socialLinks.custom) ? data.socialLinks.custom : [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    startTransition(() => {
      setLocale(getCookieLocale());
    });
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/profile');
        const data = await res.json();
        if (data.profile) {
          startTransition(() => {
            setProfile(data.profile);
            setSelectedFacultyId(data.profile.department?.facultyId || '');
            if (data.accountEmail) {
              setEmailForm((prev) => ({ ...prev, newEmail: data.accountEmail }));
            }
            if (Array.isArray(data.faculties)) setFaculties(data.faculties);
            if (data.ratingSummary) setRatingSummary(data.ratingSummary);
            if (data.socialLinks) {
              setSocialLinks({
                position: data.socialLinks.position || '',
                scientificActivity: data.socialLinks.scientificActivity || '',
                linkedin: data.socialLinks.linkedin || '',
                telegram: data.socialLinks.telegram || '',
                researchGate: data.socialLinks.researchGate || '',
                wos: data.socialLinks.wos || '',
                website: data.socialLinks.website || '',
                custom: Array.isArray(data.socialLinks.custom) ? data.socialLinks.custom : [],
              });
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    }
    loadData();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/dashboard/profile/photo', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setProfile((prev) => ({ ...prev, photoUrl: data.photoUrl }));
      showToast(t.photoUploadedMsg, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, photoUrl: '' }));
  };

  const addCustomLink = () => {
    setSocialLinks((prev) => ({
      ...prev,
      custom: [...(prev.custom || []), { label: '', url: '' }],
    }));
  };

  const updateCustomLink = (index, field, value) => {
    setSocialLinks((prev) => {
      const next = [...(prev.custom || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, custom: next };
    });
  };

  const removeCustomLink = (index) => {
    setSocialLinks((prev) => ({
      ...prev,
      custom: (prev.custom || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, socialLinks }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      showToast(t.savedMsg, 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncOrcid = async () => {
    if (!profile?.orcidId) {
      showToast(t.orcidRequired, 'error');
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, socialLinks, syncOrcid: true }),
      });
      if (!res.ok) throw new Error('Failed to sync from ORCID');
      showToast(t.syncedMsg, 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      const res = await fetch('/api/dashboard/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast(t.pwSuccess, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setChangingEmail(true);
    try {
      const res = await fetch('/api/dashboard/profile/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email');
      setEmailForm({ newEmail: data.email || emailForm.newEmail, currentPassword: '' });
      showToast(t.emailSuccess, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingEmail(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">{t.loading}</div>;
  if (!profile) return <div className="p-8 text-center text-slate-500 text-sm">{t.notFound}</div>;

  const tabs = [
    { id: 'personal', label: t.tabPersonal, icon: User },
    { id: 'bio', label: t.tabBio, icon: FileText },
    { id: 'links', label: t.tabLinks, icon: Link2 },
    { id: 'security', label: t.tabSecurity, icon: Lock },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Compact Header + Live Rating Strip */}
      <div className="neu-card p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <ScholarAvatar
            fullName={profile.fullName}
            photoUrl={profile.photoUrl}
            academicDegree={profile.academicDegree}
            size="md"
            showDegreeBadge
          />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{t.subtitle}</p>
          </div>
        </div>

        {ratingSummary && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F294A] text-white text-xs font-bold shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
              {t.rankLabel}: #{ratingSummary.rank}/{ratingSummary.totalScholars}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              {ratingSummary.tiuScore.toFixed(1)} ball
            </span>
            <Link
              href="/dashboard/grants"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/85 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold hover:bg-white transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              {ratingSummary.grantsCount}
            </Link>
            <Link
              href="/dashboard/supervisions"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/85 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold hover:bg-white transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              {ratingSummary.supervisionsCount}
            </Link>
            <Link
              href="/dashboard/publications"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/85 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold hover:bg-white transition-all"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {ratingSummary.coAuthorsCount}
            </Link>
          </div>
        )}
      </div>

      {/* Horizontal 4-Tab Bar */}
      <div className="neu-card-sm p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-gradient-to-r from-[#0F294A] to-[#1B4275] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated 2s Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200'
                : 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: Personal & Academic */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSubmit} className="neu-card p-6 rounded-3xl space-y-5">
          {/* Photo Row */}
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
            <div className="relative shrink-0">
              <ScholarAvatar
                fullName={profile.fullName}
                photoUrl={profile.photoUrl}
                academicDegree={profile.academicDegree}
                size="lg"
                showDegreeBadge
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
                title={t.uploadPhoto}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {uploadingPhoto ? t.uploadingPhoto : t.uploadPhoto}
              </button>
              {profile.photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.removePhoto}
                </button>
              )}
              <span className="text-[11px] text-slate-400">{t.photoHint}</span>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.publicEmail}
              </label>
              <input
                type="email"
                value={profile.publicEmail || ''}
                onChange={(e) => setProfile({ ...profile, publicEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.degree}
              </label>
              <select
                value={profile.academicDegree || 'NONE'}
                onChange={(e) => setProfile({ ...profile, academicDegree: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
              >
                <option value="NONE">None</option>
                <option value="PHD">PhD</option>
                <option value="DSC">DSc</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.academicTitle}
              </label>
              <select
                value={profile.academicTitle || 'NONE'}
                onChange={(e) => setProfile({ ...profile, academicTitle: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
              >
                <option value="NONE">None</option>
                <option value="ASSISTANT">Assistant</option>
                <option value="DOCENT">Docent</option>
                <option value="PROFESSOR">Professor</option>
              </select>
            </div>
          </div>

          {/* Faculty, Department, Position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {t.faculty}
              </label>
              <select
                value={selectedFacultyId}
                onChange={(e) => {
                  const fId = e.target.value;
                  setSelectedFacultyId(fId);
                  const fac = faculties.find((f) => f.id === fId);
                  if (fac && fac.departments?.length > 0) {
                    setProfile({ ...profile, departmentId: fac.departments[0].id });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {locale === 'ru' ? f.nameRu || f.nameUz : locale === 'en' ? f.nameEn || f.nameUz : f.nameUz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.department}
              </label>
              <select
                value={profile.departmentId || ''}
                onChange={(e) => setProfile({ ...profile, departmentId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none"
              >
                {(faculties.find((f) => f.id === selectedFacultyId)?.departments || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === 'ru' ? d.nameRu || d.nameUz : locale === 'en' ? d.nameEn || d.nameUz : d.nameUz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.position}
              </label>
              <input
                type="text"
                placeholder={t.positionPh}
                value={socialLinks.position}
                onChange={(e) => setSocialLinks({ ...socialLinks, position: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t.saving : t.saveBtn}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Biography & Scientific Activity */}
      {activeTab === 'bio' && (
        <form onSubmit={handleSubmit} className="neu-card p-6 rounded-3xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.scientificActivity}
            </label>
            <textarea
              rows={3}
              placeholder={t.scientificActivityPh}
              value={socialLinks.scientificActivity}
              onChange={(e) => setSocialLinks({ ...socialLinks, scientificActivity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.interests}
            </label>
            <input
              type="text"
              placeholder="AI, Machine Learning, FinTech"
              value={profile.researchInterests || ''}
              onChange={(e) => setProfile({ ...profile, researchInterests: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Inner Language Sub-tabs for Bio */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t.bioTabLabel}
              </span>
              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 gap-1">
                {[
                  { id: 'uz', label: t.langUz },
                  { id: 'ru', label: t.langRu },
                  { id: 'en', label: t.langEn },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setBioLang(lang.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      bioLang === lang.id
                        ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {bioLang === 'uz' && (
              <textarea
                rows={4}
                placeholder={t.bioPhUz}
                value={profile.bioUz || ''}
                onChange={(e) => setProfile({ ...profile, bioUz: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {bioLang === 'ru' && (
              <textarea
                rows={4}
                placeholder={t.bioPhRu}
                value={profile.bioRu || ''}
                onChange={(e) => setProfile({ ...profile, bioRu: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {bioLang === 'en' && (
              <textarea
                rows={4}
                placeholder={t.bioPhEn}
                value={profile.bioEn || ''}
                onChange={(e) => setProfile({ ...profile, bioEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t.saving : t.saveBtn}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Integrations & Links */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <TelegramStatusCard />
          <AcademicSyncSection onSyncSuccess={fetchProfile} />

          <form onSubmit={handleSubmit} className="neu-card p-6 rounded-3xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t.linksTitle}
              </h3>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.orcidId}
              </label>
              <input
                type="text"
                placeholder="0000-0002-1825-0097"
                value={profile.orcidId || ''}
                onChange={(e) => setProfile({ ...profile, orcidId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.scopusId}
              </label>
              <input
                type="text"
                placeholder="57198432100"
                value={profile.scopusId || ''}
                onChange={(e) => setProfile({ ...profile, scopusId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.scholarUrl}
              </label>
              <input
                type="url"
                placeholder="https://scholar.google.com/..."
                value={profile.googleScholarUrl || ''}
                onChange={(e) => setProfile({ ...profile, googleScholarUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.linkedin}
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.telegram}
              </label>
              <input
                type="text"
                placeholder="https://t.me/username"
                value={socialLinks.telegram}
                onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.researchGate}
              </label>
              <input
                type="url"
                placeholder="https://researchgate.net/profile/..."
                value={socialLinks.researchGate}
                onChange={(e) => setSocialLinks({ ...socialLinks, researchGate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.wos}
              </label>
              <input
                type="url"
                placeholder="https://webofscience.com/..."
                value={socialLinks.wos}
                onChange={(e) => setSocialLinks({ ...socialLinks, wos: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.website}
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.customLinks}
              </span>
              <button
                type="button"
                onClick={addCustomLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/85 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {t.addCustomLink}
              </button>
            </div>

            {socialLinks.custom?.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <input
                  type="text"
                  placeholder={t.linkLabelPh}
                  value={item.label}
                  onChange={(e) => updateCustomLink(idx, 'label', e.target.value)}
                  className="sm:col-span-4 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder={t.linkUrlPh}
                  value={item.url}
                  onChange={(e) => updateCustomLink(idx, 'url', e.target.value)}
                  className="sm:col-span-7 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeCustomLink(idx)}
                  className="sm:col-span-1 inline-flex items-center justify-center p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t.saving : t.saveBtn}
            </button>
          </div>
        </form>
        </div>
      )}

      {/* TAB 4: Security & Password */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <form onSubmit={handleChangeEmail} className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t.emailTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.emailNew}
                </label>
                <input
                  type="email"
                  required
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  placeholder="name@tiu.uz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.emailCurrentPw}
                </label>
                <input
                  type="password"
                  required
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changingEmail}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {changingEmail ? '...' : t.emailBtn}
              </button>
            </div>
          </form>

          <form onSubmit={handleChangePassword} className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t.pwTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.pwCurrent}
                </label>
                <input
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.pwNew}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Masalan: Scholar2026!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.pwConfirm}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changingPw}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {changingPw ? '...' : t.pwBtn}
              </button>
            </div>
          </form>

          <div className="neu-card-sm p-5 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t.twoFaTitle}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.twoFaDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
