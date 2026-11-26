'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Shield,
  Award,
  BookOpen,
  Users,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Home,
  Building2,
  Globe,
  ChevronDown,
  Check,
  GraduationCap,
  FileText,
  Trophy,
  Sun,
  Moon,
  Newspaper,
} from 'lucide-react';
import LanguageFlagSwitcher from '@/components/shared/LanguageFlagSwitcher';

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
];

const SUBMENU_LABELS = {
  uz: {
    allScholars: 'Barcha olimlar',
    dscScholars: 'Fan doktorlari (DSc)',
    phdScholars: 'Falsafa doktorlari (PhD)',
    professors: 'Professorlar',
    allPubs: 'Barcha nashrlar',
    scopusWos: 'Scopus & Web of Science',
    oakJournals: 'OAK Jurnallar',
    monographs: 'Monografiya & Darsliklar',
    patents: 'Patentlar & Guvohnomalar',
    allFaculties: 'Barcha fakultetlar & kafedralar',
    biznesFaculty: "Biznes va innovatsion ta'lim fakulteti",
    yurFaculty: 'Yurisprudensiya fakulteti',
    topScholars: 'Top Olimlar reytingi',
    topDepts: 'Top Kafedralar reytingi',
    newsLabel: 'Yangiliklar',
    allNews: 'Barcha yangiliklar & e‘lonlar',
    achievements: 'Ilmiy yutuqlar',
    conferencesGrants: 'Konferensiya & Grantlar',
  },
  ru: {
    allScholars: 'Все ученые',
    dscScholars: 'Доктора наук (DSc)',
    phdScholars: 'Доктора философии (PhD)',
    professors: 'Профессора',
    allPubs: 'Все публикации',
    scopusWos: 'Scopus & Web of Science',
    oakJournals: 'Журналы ВАК (OAK)',
    monographs: 'Монографии и учебники',
    patents: 'Патенты и свидетельства',
    allFaculties: 'Все факультеты и кафедры',
    biznesFaculty: 'Факультет бизнеса и инновационного образования',
    yurFaculty: 'Факультет юриспруденции',
    topScholars: 'Рейтинг лучших ученых',
    topDepts: 'Рейтинг лучших кафедр',
    newsLabel: 'Новости',
    allNews: 'Все новости и объявления',
    achievements: 'Научные достижения',
    conferencesGrants: 'Конференции и гранты',
  },
  en: {
    allScholars: 'All Scholars',
    dscScholars: 'Doctors of Science (DSc)',
    phdScholars: 'PhD Researchers',
    professors: 'Full Professors',
    allPubs: 'All Publications',
    scopusWos: 'Scopus & Web of Science',
    oakJournals: 'OAK Peer-Reviewed',
    monographs: 'Monographs & Textbooks',
    patents: 'Patents & Certificates',
    allFaculties: 'All Faculties & Departments',
    biznesFaculty: 'Faculty of Business & Innovative Education',
    yurFaculty: 'Faculty of Jurisprudence',
    topScholars: 'Top Scholars Leaderboard',
    topDepts: 'Top Departments Leaderboard',
    newsLabel: 'News',
    allNews: 'All News & Announcements',
    achievements: 'Scientific Achievements',
    conferencesGrants: 'Conferences & Grants',
  },
};

export default function Navbar({ dict, currentLocale, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const langRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:8000/admin';
  const sub = dict?.nav?.submenu || SUBMENU_LABELS[currentLocale] || SUBMENU_LABELS.uz;

  const handleSubmenuEnter = (href) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(href);
    }, 160);
  };

  const handleSubmenuLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 180);
  };

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('tiu-theme');
    const isDark = saved === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('tiu-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: dict.nav.home, icon: Home, exact: true },
    {
      href: '/scholars',
      label: dict.nav.scholars,
      icon: Users,
      children: [
        { href: '/scholars', label: sub.allScholars, icon: Users },
        { href: '/scholars?degree=dsc', label: sub.dscScholars, icon: GraduationCap },
        { href: '/scholars?degree=phd', label: sub.phdScholars, icon: GraduationCap },
      ],
    },
    {
      href: '/publications',
      label: dict.nav.publications,
      icon: BookOpen,
    },
    {
      href: '/faculties',
      label: dict.nav.faculties,
      icon: Building2,
      children: [
        { href: '/faculties?code=BITF', label: sub.biznesFaculty, icon: GraduationCap },
        { href: '/faculties?code=YURF', label: sub.yurFaculty, icon: Shield },
      ],
    },
    {
      href: '/rankings',
      label: dict.nav.rankings,
      icon: Award,
      children: [
        { href: '/rankings', label: sub.topScholars, icon: Trophy },
        { href: '/rankings?tab=departments', label: sub.topDepts, icon: Building2 },
      ],
    },
    {
      href: '/news',
      label: sub.newsLabel,
      icon: Newspaper,
      children: [
        { href: '/news', label: sub.allNews, icon: Newspaper },
        { href: '/news?category=ACHIEVEMENT', label: sub.achievements, icon: Award },
        { href: '/news?category=CONFERENCE', label: sub.conferencesGrants, icon: BookOpen },
      ],
    },
  ];

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const handleLocaleChange = (newLocale) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setLangOpen(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];
  const AUTH_FALLBACK = {
    uz: { dashboard: 'Kabinet', adminPanel: 'Admin', logout: 'Chiqish' },
    ru: { dashboard: 'Кабинет', adminPanel: 'Админ', logout: 'Выйти' },
    en: { dashboard: 'Cabinet', adminPanel: 'Admin', logout: 'Sign Out' },
  };
  const authLabels = dict?.auth || AUTH_FALLBACK[currentLocale] || AUTH_FALLBACK.uz;

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <header
      className={`${
        isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      } z-[100] transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent text-white'
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Minimal Text Brand (No University Logo Image in Navbar) */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span
            className={`text-lg font-extrabold tracking-tight font-heading transition-colors ${
              isTransparent ? 'text-white drop-shadow-sm' : 'text-[#0F294A]'
            }`}
          >
            {dict.brand}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const hasChildren = Boolean(item.children?.length);
            const isHovered = openSubmenu === item.href;

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => hasChildren && handleSubmenuEnter(item.href)}
                onMouseLeave={() => hasChildren && handleSubmenuLeave()}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center"
                >
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (hasChildren && openSubmenu !== item.href) {
                        e.preventDefault();
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setOpenSubmenu(item.href);
                      } else {
                        setOpenSubmenu(null);
                      }
                    }}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isTransparent
                        ? active
                          ? 'text-white font-semibold'
                          : 'text-white/85 hover:text-white'
                        : active
                        ? 'text-[#0F294A] font-semibold'
                        : 'text-slate-600 hover:text-[#0F294A]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isTransparent
                          ? active
                            ? 'text-blue-200'
                            : 'text-white/75'
                          : active
                          ? 'text-[#0F294A]'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isHovered ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>
                </motion.div>

                {/* Submenus: transparent (no background), 160-180ms delay + click support */}
                <AnimatePresence>
                  {hasChildren && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full pt-2 w-60 z-[110]"
                    >
                      <div className="py-1.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <motion.div
                              key={child.href}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Link
                                href={child.href}
                                onClick={() => setOpenSubmenu(null)}
                                className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isTransparent
                                    ? 'text-white/95 hover:text-[#0F294A] drop-shadow-sm'
                                    : 'text-slate-700 dark:text-slate-200 hover:text-[#0F294A] dark:hover:text-sky-300'
                                } hover:font-semibold`}
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isTransparent
                                        ? 'text-white/90'
                                        : 'text-[#0F294A] dark:text-sky-400'
                                    }`}
                                  />
                                )}
                                <span>{child.label}</span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right side: Language Flag Switcher */}
        <div className="hidden lg:flex items-center gap-2.5">
          <LanguageFlagSwitcher locale={currentLocale} transparent={isTransparent} />
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageFlagSwitcher locale={currentLocale} transparent={isTransparent} compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className={`p-2 rounded-lg transition-colors ${
              isTransparent
                ? 'text-white hover:bg-white/15'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Accordion Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden border-t px-4 pt-3 pb-6 space-y-1.5 shadow-xl overflow-hidden backdrop-blur-lg ${
              isTransparent
                ? 'bg-slate-950/85 border-white/15 text-white'
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const hasChildren = Boolean(item.children?.length);
              const expanded = mobileExpanded === item.href;

              return (
                <div key={item.href}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                        active
                          ? isTransparent
                            ? 'text-blue-200 font-semibold'
                            : 'text-[#0F294A] font-semibold'
                          : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 opacity-80" />
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => setMobileExpanded(expanded ? null : item.href)}
                        className="p-2.5 rounded-lg opacity-80 hover:opacity-100"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {hasChildren && expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 space-y-1 overflow-hidden pb-1"
                      >
                        {item.children.map((child, cIdx) =>
                          child.isGroupHeader ? (
                            <div
                              key={`mgroup-${cIdx}`}
                              className="pt-2 pb-0.5 text-[10px] font-mono font-bold uppercase tracking-wider opacity-50"
                            >
                              {child.label}
                            </div>
                          ) : (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block py-1.5 text-xs font-medium ${
                                isTransparent
                                  ? 'text-white/80 hover:text-blue-200'
                                  : 'text-slate-600 hover:text-[#0F294A]'
                              }`}
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
