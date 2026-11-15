'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const COPY = {
  uz: {
    title: "Olim sifatida ro'yxatdan o'tish",
    subtitle: 'Tashkent International University ilmiy salohiyat portali',
    fullName: "To'liq ism-familiya (F.I.Sh.)",
    fullNamePh: "Masalan: Alisher Turg'unov",
    email: 'Email manzil',
    emailPh: 'ism.familiya@tiu.uz',
    phone: 'Telefon raqam',
    phonePh: '+998 90 123 45 67',
    password: 'Parol yarating',
    passwordPh: 'Masalan: Scholar2026!',
    confirmPassword: 'Parolni qayta kiriting',
    confirmPasswordPh: 'Parolni qayta kiriting',
    submit: "Ro'yxatdan o'tish",
    submitting: 'Yuborilmoqda...',
    already: 'Hisobingiz bormi?',
    signIn: 'Kirish',
    passMismatch: 'Parollar mos kelmadi. Iltimos, qayta tekshiring.',
    passShort: "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
    successTitle: "Arizangiz adminga yuborildi!",
    successDesc:
      "Ma'lumotlaringiz moderator va administratorga tekshirish uchun yuborildi. Hisobingiz tasdiqlangandan so'ng sizga email orqali xabar keladi — shundan keyin kabinetingizga kirib qolgan ma'lumotlarni to'ldirishingiz mumkin.",
    sentToEmail: 'Xabarnoma yuboriladigan email:',
    goLogin: 'Kirish sahifasiga o‘tish',
    goHome: 'Bosh sahifaga qaytish',
  },
  ru: {
    title: 'Регистрация учёного',
    subtitle: 'Научный портал Tashkent International University',
    fullName: 'Полное имя (ФИО)',
    fullNamePh: 'Например: Алишер Тургунов',
    email: 'Email адрес',
    emailPh: 'name@tiu.uz',
    phone: 'Номер телефона',
    phonePh: '+998 90 123 45 67',
    password: 'Создайте пароль',
    passwordPh: 'Например: Scholar2026!',
    confirmPassword: 'Повторите пароль',
    confirmPasswordPh: 'Повторите пароль',
    submit: 'Зарегистрироваться',
    submitting: 'Отправка...',
    already: 'Уже есть аккаунт?',
    signIn: 'Войти',
    passMismatch: 'Пароли не совпадают. Проверьте ввод.',
    passShort: 'Пароль должен содержать минимум 6 символов.',
    successTitle: 'Заявка отправлена администратору!',
    successDesc:
      'Ваша заявка отправлена администратору на проверку. После подтверждения аккаунта вам придёт уведомление на email, и вы сможете войти в кабинет и заполнить остальные данные.',
    sentToEmail: 'Email для уведомления:',
    goLogin: 'Перейти ко входу',
    goHome: 'На главную',
  },
  en: {
    title: 'Scholar Registration',
    subtitle: 'Join Tashkent International University Scientific Portal',
    fullName: 'Full Name (F.I.Sh.)',
    fullNamePh: 'e.g. Alisher Turgunov',
    email: 'Email Address',
    emailPh: 'name@tiu.uz',
    phone: 'Phone Number',
    phonePh: '+998 90 123 45 67',
    password: 'Create Password',
    passwordPh: 'e.g. Scholar2026!',
    confirmPassword: 'Confirm Password',
    confirmPasswordPh: 'Re-enter password',
    submit: 'Register Scholar',
    submitting: 'Submitting...',
    already: 'Already have an account?',
    signIn: 'Sign In',
    passMismatch: 'Passwords do not match. Please check again.',
    passShort: 'Password must be at least 6 characters long.',
    successTitle: 'Application Sent to Admin!',
    successDesc:
      'Your registration has been submitted to the administrator for review. Once approved, you will receive an email notification and can sign in to complete your profile in the cabinet.',
    sentToEmail: 'Notification email:',
    goLogin: 'Go to Sign In',
    goHome: 'Back to Home',
  },
};

function getCookieLocale() {
  if (typeof document === 'undefined') return 'uz';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : 'uz';
}

export default function RegisterPage() {
  const [locale, setLocale] = useState('uz');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = COPY[locale] || COPY.uz;

  useEffect(() => {
    startTransition(() => {
      setLocale(getCookieLocale());
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError(t.passShort);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.passMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12">
      <div className="max-w-md w-full space-y-6 neu-card p-8 rounded-3xl">
        {/* Backgroundless TIU Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <img
              src="/tiu-logo.png"
              alt="Tashkent International University"
              className="h-14 w-auto object-contain dark:hidden"
            />
            <img
              src="/tiu-logo-white.png"
              alt="Tashkent International University"
              className="h-14 w-auto object-contain hidden dark:block"
            />
          </Link>
          {!submitted && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                {t.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
            </>
          )}
        </div>

        {submitted ? (
          <div className="neu-card-sm p-6 rounded-2xl text-center space-y-4 border border-emerald-200/80 dark:border-emerald-900/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.successTitle}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.successDesc}</p>
            <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-300 font-medium">
              {t.sentToEmail} <span className="font-bold">{formData.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
              >
                {t.goLogin}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="flex-1 py-2.5 px-4 bg-white/90 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center text-xs sm:text-sm whitespace-nowrap"
              >
                {t.goHome}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.fullName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.fullNamePh}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.emailPh}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.phone}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.phonePh}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.passwordPh}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.confirmPasswordPh}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
              >
                {loading ? t.submitting : t.submit}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
              {t.already}{' '}
              <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {t.signIn}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
