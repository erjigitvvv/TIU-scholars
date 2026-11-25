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
  KeyRound,
  Edit3,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  Send,
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

function formatInterestsForInput(raw) {
  if (!raw) return '';
  if (Array.isArray(raw)) return raw.filter(Boolean).join(', ');
  const str = String(raw).trim();
  if (!str) return '';
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(', ');
      }
    } catch {
      return str;
    }
  }
  return str;
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
  const [currentEmail, setCurrentEmail] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1: input email, 2: input 6-digit OTP
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailTimer, setEmailTimer] = useState(60);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [verifyingEmailCode, setVerifyingEmailCode] = useState(false);
  const [emailSuccess3s, setEmailSuccess3s] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(3);

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForgotMode, setPwForgotMode] = useState(false); // false: normal, true: forgot OTP
  const [pwOtpCode, setPwOtpCode] = useState('');
  const [pwOtpTimer, setPwOtpTimer] = useState(60);
  const [sendingPwOtp, setSendingPwOtp] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [pwSuccess3s, setPwSuccess3s] = useState(false);
  const [pwCountdown, setPwCountdown] = useState(3);
  const [pwError, setPwError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Maydonlarni qalam icon orqali tahrirlash holati (Pencil-click inline edit)
  const [editingFields, setEditingFields] = useState({});
  const toggleEditField = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const closeEditField = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
  };
  const handleSaveField = async (field) => {
    closeEditField(field);
    handleSubmit();
  };

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
        setCurrentEmail(data.accountEmail);
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
              setCurrentEmail(data.accountEmail);
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
    if (e && e.preventDefault) e.preventDefault();
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

  // 1 daqiqalik email taymeri
  useEffect(() => {
    let timer;
    if (emailModalOpen && emailStep === 2 && emailTimer > 0) {
      timer = setInterval(() => {
        setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailModalOpen, emailStep, emailTimer]);

  // 1 daqiqalik parol OTP taymeri
  useEffect(() => {
    let timer;
    if (pwModalOpen && pwForgotMode && pwOtpTimer > 0) {
      timer = setInterval(() => {
        setPwOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pwModalOpen, pwForgotMode, pwOtpTimer]);

  const handleSendEmailCode = async (e) => {
    if (e) e.preventDefault();
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setEmailError('To‘g‘ri yangi email manzilini kiriting');
      return;
    }
    setEmailError('');
    setSendingEmailCode(true);
    try {
      const res = await fetch('/api/dashboard/profile/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailForm.newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kod yuborishda xatolik');
      setEmailStep(2);
      setEmailTimer(60);
      setEmailOtpCode(data.devCode || '');
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setSendingEmailCode(false);
    }
  };

  const handleVerifyEmailCode = async (e) => {
    if (e) e.preventDefault();
    if (!emailOtpCode || emailOtpCode.trim().length < 6) {
      setEmailError('Pochtaga yuborilgan 6 xonali tasdiqlash kodini to‘liq kiriting');
      return;
    }
    setEmailError('');
    setVerifyingEmailCode(true);
    try {
      const res = await fetch('/api/dashboard/profile/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          code: emailOtpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kodni tasdiqlashda xatolik');

      setCurrentEmail(emailForm.newEmail);
      setEmailSuccess3s(true);
      setEmailCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setEmailCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setEmailSuccess3s(false);
          setEmailModalOpen(false);
          setEmailStep(1);
          setEmailOtpCode('');
          showToast('Emailingiz muvaffaqiyatli yangilandi!', 'success');
        }
      }, 1000);
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setVerifyingEmailCode(false);
    }
  };

  const handleStartForgotPw = async () => {
    setPwError('');
    setPwForgotMode(true);
    setSendingPwOtp(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kod yuborishda xatolik');
      setPwOtpTimer(60);
      setPwOtpCode(data.devCode || '');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSendingPwOtp(false);
    }
  };

  const handleResetPwWithCode = async (e) => {
    if (e) e.preventDefault();
    if (!pwOtpCode || pwOtpCode.trim().length < 6) {
      setPwError('Pochtangizga borgan 6 xonali kodni kiriting');
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwError('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Yangi parollar bir-biriga mos kelmadi');
      return;
    }

    setPwError('');
    setResettingPw(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail,
          code: pwOtpCode.trim(),
          newPassword: pwForm.newPassword,
          confirmPassword: pwForm.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parolni tiklashda xatolik');

      setPwSuccess3s(true);
      setPwCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setPwCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setPwSuccess3s(false);
          setPwModalOpen(false);
          setPwForgotMode(false);
          setPwOtpCode('');
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          showToast('Parolingiz muvaffaqiyatli yangilandi!', 'success');
        }
      }, 1000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setResettingPw(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setChangingPw(true);
    try {
      const res = await fetch('/api/dashboard/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parolni o‘zgartirishda xatolik yuz berdi');
      
      // 3 soniyalik muvaffaqiyat ekrani
      setPwSuccess3s(true);
      setPwCountdown(3);
      let count = 3;
      const timer = setInterval(() => {
        count -= 1;
        setPwCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setPwSuccess3s(false);
          setPwModalOpen(false);
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          showToast(t.pwSuccess, 'success');
        }
      }, 1000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setChangingPw(false);
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

          {/* Basic Info with Pencil-click Inline Edit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* 1. To'liq ism-familiya (F.I.Sh.) */}
            <div className="lg:col-span-4">
              {!editingFields.fullName ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.fullName}
                    </span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                      {profile.fullName || <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('fullName')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="F.I.Sh.ni o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.fullName}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('fullName')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('fullName')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={profile.fullName || ''}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Ommaviy email */}
            <div className="lg:col-span-4">
              {!editingFields.publicEmail ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.publicEmail}
                    </span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                      {profile.publicEmail || <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('publicEmail')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Emailni o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.publicEmail}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('publicEmail')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('publicEmail')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="email"
                    autoFocus
                    value={profile.publicEmail || ''}
                    onChange={(e) => setProfile({ ...profile, publicEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 3. Ilmiy daraja */}
            <div className="lg:col-span-2">
              {!editingFields.academicDegree ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.degree}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {profile.academicDegree || 'NONE'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('academicDegree')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Darajani o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.degree}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('academicDegree')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('academicDegree')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <select
                    autoFocus
                    value={profile.academicDegree || 'NONE'}
                    onChange={(e) => setProfile({ ...profile, academicDegree: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NONE">None</option>
                    <option value="PHD">PhD</option>
                    <option value="DSC">DSc</option>
                  </select>
                </div>
              )}
            </div>

            {/* 4. Ilmiy unvon */}
            <div className="lg:col-span-2">
              {!editingFields.academicTitle ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.academicTitle}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {profile.academicTitle || 'NONE'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('academicTitle')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Unvonni o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.academicTitle}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('academicTitle')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('academicTitle')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <select
                    autoFocus
                    value={profile.academicTitle || 'NONE'}
                    onChange={(e) => setProfile({ ...profile, academicTitle: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NONE">None</option>
                    <option value="ASSISTANT">Assistant</option>
                    <option value="DOCENT">Docent</option>
                    <option value="PROFESSOR">Professor</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Faculty, Department, Position with Pencil-click Inline Edit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Faculty */}
            <div>
              {!editingFields.faculty ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {t.faculty}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {faculties.find((f) => f.id === selectedFacultyId)?.nameUz || <span className="text-slate-400 font-normal italic">Tanlanmagan</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('faculty')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Fakultetni o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {t.faculty}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('faculty')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('faculty')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <select
                    autoFocus
                    value={selectedFacultyId}
                    onChange={(e) => {
                      const fId = e.target.value;
                      setSelectedFacultyId(fId);
                      const fac = faculties.find((f) => f.id === fId);
                      if (fac && fac.departments?.length > 0) {
                        setProfile({ ...profile, departmentId: fac.departments[0].id });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {locale === 'ru' ? f.nameRu || f.nameUz : locale === 'en' ? f.nameEn || f.nameUz : f.nameUz}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Department */}
            <div>
              {!editingFields.department ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.department}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {(faculties.find((f) => f.id === selectedFacultyId)?.departments || []).find((d) => d.id === profile.departmentId)?.nameUz || <span className="text-slate-400 font-normal italic">Tanlanmagan</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('department')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Kafedrani o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.department}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('department')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('department')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <select
                    autoFocus
                    value={profile.departmentId || ''}
                    onChange={(e) => setProfile({ ...profile, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(faculties.find((f) => f.id === selectedFacultyId)?.departments || []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {locale === 'ru' ? d.nameRu || d.nameUz : locale === 'en' ? d.nameEn || d.nameUz : d.nameUz}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Position */}
            <div>
              {!editingFields.position ? (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {t.position}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {socialLinks.position || <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField('position')}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Lavozimni o'zgartirish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {t.position}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField('position')}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField('position')}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder={t.positionPh}
                    value={socialLinks.position}
                    onChange={(e) => setSocialLinks({ ...socialLinks, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
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
          {/* Scientific Activity */}
          <div>
            {!editingFields.scientificActivity ? (
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {t.scientificActivity}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {socialLinks.scientificActivity || <span className="text-slate-400 italic">Kiritilmagan</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEditField('scientificActivity')}
                  className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                  title="Ilmiy faoliyatni o'zgartirish"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    {t.scientificActivity}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSaveField('scientificActivity')}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                      title="Saqlash"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => closeEditField('scientificActivity')}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Bekor qilish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  autoFocus
                  placeholder={t.scientificActivityPh}
                  value={socialLinks.scientificActivity}
                  onChange={(e) => setSocialLinks({ ...socialLinks, scientificActivity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Research Interests */}
          <div>
            {!editingFields.researchInterests ? (
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {t.interests}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formatInterestsForInput(profile.researchInterests) ? (
                      formatInterestsForInput(profile.researchInterests)
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-200/60">
                            {tag}
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Kiritilmagan</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEditField('researchInterests')}
                  className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                  title="Yo'nalishlarni o'zgartirish"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    {t.interests}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSaveField('researchInterests')}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                      title="Saqlash"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => closeEditField('researchInterests')}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Bekor qilish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="AI, Machine Learning, FinTech"
                  value={formatInterestsForInput(profile.researchInterests)}
                  onChange={(e) => setProfile({ ...profile, researchInterests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
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

            {/* Editable Bio Box */}
            <div>
              {!editingFields[`bio_${bioLang}`] ? (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Biografiya ({bioLang.toUpperCase()})
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {(bioLang === 'uz' ? profile.bioUz : bioLang === 'ru' ? profile.bioRu : profile.bioEn) || (
                        <span className="text-slate-400 italic">Biografiya matni kiritilmagan</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditField(`bio_${bioLang}`)}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                    title="Biografiyani tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Biografiya ({bioLang.toUpperCase()})
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveField(`bio_${bioLang}`)}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                        title="Saqlash"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEditField(`bio_${bioLang}`)}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Bekor qilish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {bioLang === 'uz' && (
                    <textarea
                      rows={4}
                      autoFocus
                      placeholder={t.bioPhUz}
                      value={profile.bioUz || ''}
                      onChange={(e) => setProfile({ ...profile, bioUz: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {bioLang === 'ru' && (
                    <textarea
                      rows={4}
                      autoFocus
                      placeholder={t.bioPhRu}
                      value={profile.bioRu || ''}
                      onChange={(e) => setProfile({ ...profile, bioRu: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {bioLang === 'en' && (
                    <textarea
                      rows={4}
                      autoFocus
                      placeholder={t.bioPhEn}
                      value={profile.bioEn || ''}
                      onChange={(e) => setProfile({ ...profile, bioEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}
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
            {[
              {
                key: 'orcidId',
                label: t.orcidId,
                type: 'text',
                placeholder: '0000-0002-1825-0097',
                mono: true,
                value: profile.orcidId || '',
                onChange: (val) => setProfile({ ...profile, orcidId: val }),
              },
              {
                key: 'scopusId',
                label: t.scopusId,
                type: 'text',
                placeholder: '57198432100',
                mono: true,
                value: profile.scopusId || '',
                onChange: (val) => setProfile({ ...profile, scopusId: val }),
              },
              {
                key: 'googleScholarUrl',
                label: t.scholarUrl,
                type: 'url',
                placeholder: 'https://scholar.google.com/...',
                mono: false,
                value: profile.googleScholarUrl || '',
                onChange: (val) => setProfile({ ...profile, googleScholarUrl: val }),
              },
              {
                key: 'linkedin',
                label: t.linkedin,
                type: 'url',
                placeholder: 'https://linkedin.com/in/...',
                mono: false,
                value: socialLinks.linkedin || '',
                onChange: (val) => setSocialLinks({ ...socialLinks, linkedin: val }),
              },
              {
                key: 'telegram',
                label: t.telegram,
                type: 'text',
                placeholder: 'https://t.me/username',
                mono: false,
                value: socialLinks.telegram || '',
                onChange: (val) => setSocialLinks({ ...socialLinks, telegram: val }),
              },
              {
                key: 'researchGate',
                label: t.researchGate,
                type: 'url',
                placeholder: 'https://researchgate.net/profile/...',
                mono: false,
                value: socialLinks.researchGate || '',
                onChange: (val) => setSocialLinks({ ...socialLinks, researchGate: val }),
              },
              {
                key: 'wos',
                label: t.wos,
                type: 'url',
                placeholder: 'https://webofscience.com/...',
                mono: false,
                value: socialLinks.wos || '',
                onChange: (val) => setSocialLinks({ ...socialLinks, wos: val }),
              },
              {
                key: 'website',
                label: t.website,
                type: 'url',
                placeholder: 'https://...',
                mono: false,
                value: socialLinks.website || '',
                onChange: (val) => setSocialLinks({ ...socialLinks, website: val }),
              },
            ].map((field) => (
              <div key={field.key}>
                {!editingFields[field.key] ? (
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition h-full">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                        {field.label}
                      </span>
                      <span
                        className={`block text-xs font-bold text-slate-900 dark:text-white truncate ${
                          field.mono ? 'font-mono' : ''
                        }`}
                      >
                        {field.value || <span className="text-slate-400 font-normal italic">Kiritilmagan</span>}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleEditField(field.key)}
                      className="p-2 rounded-xl text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                      title={`${field.label}ni o'zgartirish`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider truncate">
                        {field.label}
                      </label>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSaveField(field.key)}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                          title="Saqlash"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => closeEditField(field.key)}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                          title="Bekor qilish"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type={field.type}
                      autoFocus
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 ${
                        field.mono ? 'font-mono' : ''
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
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
          {/* Email Security Row */}
          <div className="neu-card p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Joriy Kirish Emaili
                  </h4>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {currentEmail || 'Yuklanmoqda...'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEmailError('');
                  setEmailForm({ newEmail: '', currentPassword: '' });
                  setEmailModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Emailni o‘zgartirish</span>
              </button>
            </div>
          </div>

          {/* Password Security Row */}
          <div className="neu-card p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hisob Paroli
                  </h4>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-widest font-mono">
                    ••••••••••••
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPwError('');
                  setPwForgotMode(false);
                  setPwOtpCode('');
                  setPwSuccess3s(false);
                  setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPwModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all cursor-pointer shrink-0"
              >
                <KeyRound className="w-4 h-4" />
                <span>Parolni o‘zgartirish</span>
              </button>
            </div>
          </div>

          {/* 2FA Info Card */}
          <div className="neu-card-sm p-5 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t.twoFaTitle}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.twoFaDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Email Change Modal with 1-Minute 6-Digit OTP */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            {emailSuccess3s ? (
              /* 3-Second Animated Confirmation Screen */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Email muvaffaqiyatli yangilandi!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    Yangi email: <b>{currentEmail}</b>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Oyna {emailCountdown} soniyadan so‘ng avtomatik yopiladi...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {emailStep === 1 ? 'Kirish emailini yangilash' : 'Pochtani tasdiqlash'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailModalOpen(false);
                      setEmailStep(1);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {emailError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                    {emailError}
                  </div>
                )}

                {emailStep === 1 ? (
                  /* Step 1: Input New Email */
                  <form onSubmit={handleSendEmailCode} className="space-y-3.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Yangi email manzilini kiriting. Pochtangizga aynan <b>1 daqiqa</b> amal qiluvchi <b>6 xonali tasdiqlash kodi</b> yuboriladi.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Yangi email manzili
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="masalan: dr.alisher.olimov@tiu.uz"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setEmailModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={sendingEmailCode || !emailForm.newEmail}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 -rotate-45" />
                        <span>{sendingEmailCode ? 'Kod yuborilmoqda...' : '1 daqiqalik kodni olish'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Input 6-Digit OTP Code with 1-Minute Live Timer */
                  <form onSubmit={handleVerifyEmailCode} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                      Tasdiqlash kodi <b>{emailForm.newEmail}</b> pochtasiga yuborildi. Pochtadagi 6 xonali kodni kiriting.
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          6 xonali tasdiqlash kodi
                        </label>
                        {emailTimer > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3 animate-pulse" />
                            00:{emailTimer < 10 ? `0${emailTimer}` : emailTimer} qoldi
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500">
                            Kod muddati tugadi
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setEmailStep(1)}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        ← Emailni o‘zgartirish
                      </button>

                      {emailTimer === 0 && (
                        <button
                          type="button"
                          onClick={handleSendEmailCode}
                          disabled={sendingEmailCode}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Qayta kod olish
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailModalOpen(false);
                          setEmailStep(1);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={verifyingEmailCode || emailOtpCode.length < 6 || emailTimer === 0}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50"
                      >
                        {verifyingEmailCode ? 'Tekshirilmoqda...' : 'Tasdiqlash va Saqlash'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Password Change & Forgot Password OTP Modal */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            {pwSuccess3s ? (
              /* 3-Second Animated Confirmation Screen */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Parol muvaffaqiyatli yangilandi!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Hisobingiz yangi parol bilan xavfsiz himoyalandi.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Oyna {pwCountdown} soniyadan so‘ng avtomatik yopiladi...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {pwForgotMode ? 'Parolni tiklash (Email OTP)' : 'Parolni o‘zgartirish'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPwModalOpen(false);
                      setPwForgotMode(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {pwError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                    {pwError}
                  </div>
                )}

                {pwForgotMode ? (
                  /* Forgot Password Flow with 1-Minute 6-Digit OTP */
                  <form onSubmit={handleResetPwWithCode} className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                      1 daqiqalik tasdiqlash kodi <b>{currentEmail}</b> pochtasiga yuborildi.
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Pochtadagi 6 xonali kod
                        </label>
                        {pwOtpTimer > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3 animate-pulse" />
                            00:{pwOtpTimer < 10 ? `0${pwOtpTimer}` : pwOtpTimer} qoldi
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500">
                            Kod muddati tugadi
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={pwOtpCode}
                        onChange={(e) => setPwOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Yangi parol (kamida 6 ta belgi)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Yangi kuchli parol"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Yangi parolni qayta kiritish
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Yangi parolni tasdiqlang"
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setPwForgotMode(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        ← Joriy parol orqali o‘zgartirish
                      </button>

                      {pwOtpTimer === 0 && (
                        <button
                          type="button"
                          onClick={handleStartForgotPw}
                          disabled={sendingPwOtp}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Qayta kod olish
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setPwModalOpen(false);
                          setPwForgotMode(false);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={resettingPw || pwOtpCode.length < 6 || pwOtpTimer === 0}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-50"
                      >
                        {resettingPw ? 'Yangilanmoqda...' : 'Parolni yangilash'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Normal Password Change Flow */
                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Joriy (eski) parol
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Eski parolingizni kiriting"
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Yangi parol (kamida 6 ta belgi)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Yangi kuchli parol"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Yangi parolni qayta kiritish
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Yangi parolni tasdiqlang"
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={sendingPwOtp}
                        onClick={handleStartForgotPw}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold underline underline-offset-2 transition cursor-pointer"
                      >
                        {sendingPwOtp ? 'Pochtaga 1 daqiqalik kod yuborilmoqda...' : 'Parolni unutdingizmi? Pochtaga 1 daqiqalik kod yuborish'}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setPwModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={changingPw}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-50"
                      >
                        {changingPw ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
