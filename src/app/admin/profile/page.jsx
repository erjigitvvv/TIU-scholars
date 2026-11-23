'use client';

import { useState, useEffect } from 'react';
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
  MessageSquare,
  ExternalLink,
  Award,
  Layers,
  FileText,
  UserCheck,
  Headphones,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function ModeratorProfilePage() {
  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'PERMISSIONS' | 'CONTACT_ADMIN'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [adminContacts, setAdminContacts] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);

  // Form states for profile
  const [fullName, setFullName] = useState('');
  const [positionUz, setPositionUz] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [academicDegree, setAcademicDegree] = useState('PHD');
  const [academicTitle, setAcademicTitle] = useState('DOCENT');
  const [publicEmail, setPublicEmail] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bioUz, setBioUz] = useState('');

  // Form states for contacting admin
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
        setFaculties(data.faculties || []);
        setAdminContacts(data.adminContacts);
        setRecentInquiries(data.recentInquiries || []);

        if (data.profile) {
          setFullName(data.profile.fullName || '');
          setPositionUz(data.profile.positionUz || 'Ilmiy bo‘lim koordinatori va moderatori');
          setDepartmentId(data.profile.departmentId || '');
          setAcademicDegree(data.profile.academicDegree || 'PHD');
          setAcademicTitle(data.profile.academicTitle || 'DOCENT');
          setPublicEmail(data.profile.publicEmail || '');
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          positionUz,
          departmentId,
          academicDegree,
          academicTitle,
          publicEmail,
          telegramUsername,
          photoUrl,
          bioUz,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'Profil muvaffaqiyatli yangilandi!' });
        setProfile(data.profile);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Xatolik yuz berdi' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Tarmoq xatosi' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Moderator profili yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rasmiy TIU Moderatori</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {fullName || 'TIU Moderatori'}
              </h1>
              <p className="text-xs text-blue-200/80 font-medium max-w-xl">
                {positionUz || 'TIU Ilmiy bo‘lim bosh koordinatori'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('CONTACT_ADMIN')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Adminga murojaat</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'PROFILE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Moderator Profil Sozlamalari</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'PERMISSIONS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Moderatorlik Vakolatlari</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONTACT_ADMIN')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'CONTACT_ADMIN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Bilan Bog‘lanish & Murojaat</span>
          </button>
        </div>
      </div>

      {/* Alert toast */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 border shadow-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: MODERATOR PROFILE SETTINGS */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Xizmat va Shaxsiy Ma’lumotlar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Moderator sifatida platformada ko‘rinadigan rasmiy ma’lumotlaringizni boshqaring.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}</span>
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
                  placeholder="Masalan: Ilmiy bo‘lim bosh koordinatori va moderatori"
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
                <label className="block font-bold text-slate-700 mb-1.5">Xizmat Emaili:</label>
                <input
                  type="email"
                  value={publicEmail}
                  onChange={(e) => setPublicEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="moderator@tiu.uz"
                />
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
                  Moderatorlik yo‘nalishi va qisqacha ma’lumot:
                </label>
                <textarea
                  rows={3}
                  value={bioUz}
                  onChange={(e) => setBioUz(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Ilmiy bo‘limdagi nazorat sohangiz, qabul va konsultatsiya vaqtlari haqida ma'lumot..."
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: MODERATOR SPECIAL PRIVILEGES & PERMISSIONS (Olimda yo'q, faqat moderatorda) */}
      {activeTab === 'PERMISSIONS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Sizga Berilgan Rasmiy Moderatorlik Huquq va Vakolatlari
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ushbu vakolatlar faqat TIU Ilmiy Bo‘limi moderatorlariga berilgan bo‘lib, oddiy olim kabinetida mavjud emas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  1
                </div>
                <span>Maqola va Dissertatsiyalarni Baholash (Moderatsiya)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                Olimlar topshirgan nashrlar, ilmiy loyihalar va hisobotlarni qabul qilish, ekspertizadan o‘tkazish, tasdiqlash yoki tahrirga qaytarish huquqi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  2
                </div>
                <span>TIUgram Messenger va Telegram Xabarnomalar</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                Universitetning barcha ulangan olimlari botiga kategoriyali e’lonlar, fayllar, rasmiy so‘rovnomalar (Polls) yuborish va ularning savollariga bevosita javob berish.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  3
                </div>
                <span>KPI va Reyting Ballarini Hisoblash</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                Tasdiqlangan ilmiy ishlar uchun Scopus, Web of Science va OAK jurnallari mezonlariga asosan olimlarga ball taqsimlash.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  4
                </div>
                <span>Olimlar Dosyesi va Hujjatlarini Boshqarish</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                Fakultet va kafedralar bo‘yicha ilmiy xodimlar faolligini kuzatish, hisobotlarni eksport qilish va rektoratga taqdim etish.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT SUPER ADMIN & SEND INQUIRY */}
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

          {/* Interactive Inquiry / Message Form */}
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
