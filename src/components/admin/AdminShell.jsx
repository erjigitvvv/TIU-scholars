'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Target,
  FileSpreadsheet,
  Settings,
  LogOut,
  Globe,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Megaphone,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';
import LanguageFlagSwitcher from '@/components/shared/LanguageFlagSwitcher';
import FloatingTelegramChatWidget from '@/components/moderator/FloatingTelegramChatWidget';

const LABELS = {
  uz: {
    portalTag: 'Ilmiy Bo‘lim Kabineti',
    overview: 'Boshqaruv paneli',
    moderation: 'Moderatsiya navbati',
    scholars: 'Olimlar va arizalar',
    announcements: 'E’lonlar',
    kpi: 'KPI maqsadlari',
    reports: 'Hisobotlar & Eksport',
    settings: 'Ball sozlamalari',
    publicPortal: 'Asosiy portal',
    signOut: 'Chiqish',
    toggleNav: 'Menyuni yashirish / ochish',
  },
  ru: {
    portalTag: 'Кабинет научного отдела',
    overview: 'Панель управления',
    moderation: 'Очередь модерации',
    scholars: 'Учёные и заявки',
    announcements: 'Объявления',
    kpi: 'Цели KPI',
    reports: 'Отчёты и экспорт',
    settings: 'Настройки баллов',
    publicPortal: 'Главный портал',
    signOut: 'Выйти',
    toggleNav: 'Скрыть / показать меню',
  },
  en: {
    portalTag: 'Scientific Dept. Cabinet',
    overview: 'Overview',
    moderation: 'Moderation Queue',
    scholars: 'Scholars & Requests',
    announcements: 'Announcements',
    kpi: 'KPI Targets',
    reports: 'Reports & Export',
    settings: 'Scoring Settings',
    publicPortal: 'Public Portal',
    signOut: 'Sign Out',
    toggleNav: 'Toggle sidebar',
  },
};

export default function AdminShell({ user, locale = 'uz', children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [modOpen, setModOpen] = useState(pathname?.startsWith('/admin/moderation'));
  const t = LABELS[locale] || LABELS.uz;

  const handleLogout = async (e) => {
    e?.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: { Accept: 'application/json' } });
    } catch {}
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/admin', label: t.overview, icon: LayoutDashboard, exact: true },
    {
      href: '/admin/moderation',
      label: t.moderation,
      icon: CheckSquare,
      children: [
        { href: '/admin/moderation?type=publications', label: locale === 'ru' ? 'Публикации' : locale === 'en' ? 'Publications' : 'Nashrlar' },
        { href: '/admin/moderation?type=academic-projects', label: locale === 'ru' ? 'Научные проекты' : locale === 'en' ? 'Academic Projects' : 'Ilmiy Loyihalar' },
        { href: '/admin/moderation?type=grants', label: locale === 'ru' ? 'Гранты' : locale === 'en' ? 'Grants' : 'Grantlar' },
        { href: '/admin/moderation?type=supervisions', label: locale === 'ru' ? 'Руководство' : locale === 'en' ? 'Supervisions' : 'Ilmiy rahbarlik' },
      ],
    },
    {
      href: '/admin/supervisions',
      label: locale === 'ru' ? 'Научное руководство' : locale === 'en' ? 'Academic Supervision' : 'Ilmiy rahbarlik nazorati',
      icon: GraduationCap,
    },
    { href: '/admin/scholars', label: t.scholars, icon: Users },
    { href: '/admin/announcements', label: t.announcements, icon: Megaphone },
    { href: '/admin/kpi', label: t.kpi, icon: Target },
    { href: '/admin/reports', label: t.reports, icon: FileSpreadsheet },
    {
      href: '/admin/profile',
      label: locale === 'ru' ? 'Настройки профиля' : locale === 'en' ? 'Profile Settings' : 'Profil sozlamalari',
      icon: UserCog,
    },
    ...(user?.role === 'SUPER_ADMIN'
      ? [{ href: '/admin/settings', label: t.settings, icon: Settings }]
      : []),
  ];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  const activeItem = navItems.find(isActive) || navItems[0];

  const renderSidebarInner = (isMobile = false) => (
    <div className="flex flex-col h-full w-72">
      {/* Brand */}
      <div className="p-5 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/tiu-logo.png"
            alt="TIU"
            className="h-8 w-auto object-contain dark:hidden"
          />
          <img
            src="/tiu-logo-white.png"
            alt="TIU"
            className="h-8 w-auto object-contain hidden dark:block"
          />
          <div className="border-l border-slate-200 dark:border-slate-700 pl-2.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white block leading-none">
              TIU Scholars
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              {t.portalTag}
            </span>
          </div>
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Mini Card with link to /admin/profile */}
      <Link
        href="/admin/profile"
        onClick={() => isMobile && setMobileOpen(false)}
        className="p-3.5 mx-3 mt-4 neu-card-sm rounded-2xl flex items-center gap-3 hover:border-blue-300 transition-all cursor-pointer group"
        title="Moderator profil sozlamalari"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F294A] to-[#1B4275] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-5 h-5 text-blue-200" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
            {user?.email}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate mt-0.5">
            {user?.role?.toLowerCase().replace('_', ' ')} • Sozlamalar ⚙️
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          if (item.children) {
            return (
              <div key={item.href} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setModOpen((v) => !v)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#0F294A] to-[#1B4275] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-300' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${modOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {modOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="pl-7 pr-2 space-y-1 overflow-hidden"
                    >
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => isMobile && setMobileOpen(false)}
                          className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 hover:text-blue-900 dark:hover:text-white transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#0F294A] to-[#1B4275] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-300' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
        <Link
          href="/"
          className="w-full inline-flex items-center justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{t.publicPortal}</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50/90 dark:hover:bg-red-950/40 transition-all whitespace-nowrap cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Animated Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 288 : 0,
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block shrink-0 bg-[#E8EDF5]/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-white/75 dark:border-slate-800 sticky top-0 h-screen overflow-hidden"
      >
        {renderSidebarInner(false)}
      </motion.aside>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-72 max-w-[85vw] bg-[#E8EDF5] dark:bg-slate-950 h-full shadow-2xl z-10 flex flex-col"
            >
              {renderSidebarInner(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#E8EDF5]/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-white/75 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={t.toggleNav}
              className="hidden lg:inline-flex items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {activeItem.label}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <NotificationBell locale={locale} />
            <LanguageFlagSwitcher locale={locale} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
        <FloatingTelegramChatWidget user={user} />
      </div>
    </div>
  );
}
