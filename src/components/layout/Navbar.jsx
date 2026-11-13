'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Shield, Award, BookOpen, Users, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar({ dict, currentLocale, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLocaleChange = (newLocale) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
            TIU
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight font-heading">
              {dict.brand}
            </span>
            <span className="block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Scientific Potential Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/scholars" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            {dict.nav.scholars}
          </Link>
          <Link href="/publications" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-400" />
            {dict.nav.publications}
          </Link>
          <Link href="/rankings" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5">
            <Award className="w-4 h-4 text-slate-400" />
            {dict.nav.rankings}
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['uz', 'ru', 'en'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase transition-all ${
                  currentLocale === loc
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR') && (
                <Link
                  href="/admin/scholars"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all"
                >
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  {dict.auth.adminPanel}
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                {dict.auth.dashboard}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={dict.auth.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
            >
              <Shield className="w-4 h-4" />
              {dict.nav.login}
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['uz', 'ru', 'en'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                  currentLocale === loc ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/scholars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {dict.nav.scholars}
          </Link>
          <Link
            href="/publications"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {dict.nav.publications}
          </Link>
          <Link
            href="/rankings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {dict.nav.rankings}
          </Link>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                {(user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR') && (
                  <Link
                    href="/admin/scholars"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-900 bg-blue-50 rounded-lg"
                  >
                    <UserCheck className="w-4 h-4" />
                    {dict.auth.adminPanel}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dict.auth.dashboard}
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  {dict.auth.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-lg shadow-sm"
              >
                <Shield className="w-4 h-4" />
                {dict.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
